import { mat4, vec4 } from "gl-matrix";
import shaderSrc from 'bundle-text:../../resource-map/Shaders/defaultSpriteShader.wgsl';

import { RenderingCommands, RenderingState } from "../../rendering/Rendering";
import LayerImplementation from "../Layer";
import GlobalState from "../../GlobalState";
import CScriptComponent from "../../components/CScriptComponent";
import CComponent from "../../components/CComponent";
import CSpriteComponent from "../../components/CSpriteComponent";

interface ISpriteDrawable {
    vertexBuffers: Array<GPUBuffer>,
    vertexBufferCounts: Array<number>,
    indexBuffers: Array<GPUBuffer>,
    indexBufferCounts: Array<number>,
    textureSamplerBindGroup: GPUBindGroup
}

export default class GameLayer extends LayerImplementation {
    
    /**
     * An override to specify the name of this layer
     * @returns the name of this layer
     */
    public override getLayerName(): string {
        return "Game_Layer"
    }

    private _pipeline: GPURenderPipeline;
    private _projectionViewBuffer: GPUBuffer;
    private _projectionViewBindGroup: GPUBindGroup;

    private _spriteDrawableMap = new Map<string, ISpriteDrawable>();

    constructor() {
        super();
        if(!RenderingState.isRenderingPossible()) {
            throw new Error('Rendering system is not yet working while trying to construct the GameLayer');
        }

        //Create the bind group
        const projectionViewBindGroupLayout = RenderingCommands.createProjectionViewBindGroupLayout();
        const projectionViewBindGroup = RenderingCommands.createProjectionViewBindGroupFromMatrix(mat4.create()); //will anyway regenerate this matrix every frame
        this._projectionViewBuffer = projectionViewBindGroup.buffer;
        this._projectionViewBindGroup = projectionViewBindGroup.bindGroup;

        //Create the texture sampler group layout
        const textureSamplerGroupLayout = RenderingCommands.createTextureSamplerBindGroupLayout();

        //Create the GPURenderPipeline
        this._pipeline = RenderingCommands.createPipeline(shaderSrc, [projectionViewBindGroupLayout, textureSamplerGroupLayout]);
    }

    /**
     * Compute all scripts and redraw the scene
     * @param delta the time elapsed from the last frame to this frame
     */
    public override onUpdate(delta: number): void {
        this.computeScriptComponents(delta);
        this.drawSprites();
    }

    private computeScriptComponents(delta: number) {
        GlobalState.getComponentsOfType(CScriptComponent).forEach((component: CComponent) => {
            const scriptComponent: CScriptComponent = component as CScriptComponent;
            if(!scriptComponent.isOnStartCalled()){
                scriptComponent.onStart();
                scriptComponent.setOnStartCalled();
            }
            else {
                scriptComponent.onTick(delta);
            }
        });
    }

    private drawSprites() {
        const MAX_VERTEX_BUFFER_LENGTH = 25600; //todo: can optimize this number with further testing
        const MAX_INDEX_BUFFER_LENGTH = MAX_VERTEX_BUFFER_LENGTH * (6/4); //? 6 indices per every 4 vertices
        const SIZE_PER_VERTEX = Float32Array.BYTES_PER_ELEMENT * 6; //? 4 values per position and 2 for uv
        const SIZE_PER_INDEX = Uint32Array.BYTES_PER_ELEMENT; //? every index is a 32 bit unsigned int

        //clear all drawable entries so that they can be populated for this draw call
        this._spriteDrawableMap.forEach((drawable: ISpriteDrawable) => {
            drawable.vertexBufferCounts = drawable.vertexBufferCounts.map(() => 0);
            drawable.indexBufferCounts = drawable.indexBufferCounts.map(() => 0);
            drawable.vertexBuffers.forEach((buffer) => RenderingCommands.clearBuffer(buffer));
            drawable.indexBuffers.forEach((buffer) => RenderingCommands.clearBuffer(buffer));
        });

        //update the projection view BindGroup
        const cameraMatrix = RenderingState.getGameCameraMatrix();
        const viewDimensions = RenderingState.getViewDimensions();
        const rightEdge = viewDimensions.width / 2;
        const leftEdge = -1 * rightEdge;
        const topEdge = viewDimensions.height / 2;
        const bottomEdge = -1 * topEdge;
        const projectionMatrix = mat4.ortho(mat4.create(), leftEdge, rightEdge, bottomEdge, topEdge, -1.0, 1.0);
        const projectionViewMatrixData = new Float32Array(mat4.multiply(mat4.create(), projectionMatrix, cameraMatrix));
        RenderingCommands.writeBuffer(this._projectionViewBuffer, projectionViewMatrixData);

        //Update the drawable entries
        GlobalState.getComponentsOfType(CSpriteComponent).forEach((component: CComponent) => {
            const spriteComponent = component as CSpriteComponent;
            const transformComponent = component.getOwningActor().getTransformComponent();

            const textureURL = spriteComponent.getTextureURL();
            const texture: GPUTexture | null = RenderingState.getTextureFromURL(textureURL)
            if(texture) { //? this check is required as the textureSubmit needs to be awaited for the submittedURL to be reflected as a texture in the RenderingState
                
                //Compute the vertices to be added
                const actorDimensions = RenderingState.getActorDimensions();
                const topLeft = vec4.set(vec4.create(), -actorDimensions.width / 2, actorDimensions.height / 2, 0.0, 1.0);
                const topRight = vec4.set(vec4.create(), actorDimensions.width / 2, actorDimensions.height / 2, 0.0, 1.0);
                const bottomRight = vec4.set(vec4.create(), actorDimensions.width / 2, -actorDimensions.height / 2, 0.0, 1.0);
                const bottomLeft = vec4.set(vec4.create(), -actorDimensions.width / 2, -actorDimensions.height / 2, 0.0, 1.0)

                //Transform the vertices from object space to world space
                const modelMatrix = transformComponent.getModelMatrix(); 
                vec4.transformMat4(topLeft, topLeft, modelMatrix);
                vec4.transformMat4(topRight, topRight, modelMatrix);
                vec4.transformMat4(bottomRight, bottomRight, modelMatrix);
                vec4.transformMat4(bottomLeft, bottomLeft, modelMatrix);

                //Get UV Coordinates associated with the vertex
                const uvRect = spriteComponent.getUVCoordinates();

                //Generate 4 Vertices to draw the sprite on screen
                const vertices = new Float32Array([
                    //x,y,z,w coordinates                                           //uv coordinates
                    topLeft[0],     topLeft[1],     topLeft[2],     topLeft[3],     uvRect.topLeft[0] ,    uvRect.topLeft[1], 
                    topRight[0],    topRight[1],    topRight[2],    topRight[3],    uvRect.topRight[0],    uvRect.topRight[1],
                    bottomRight[0], bottomRight[1], bottomRight[2], bottomRight[3], uvRect.bottomRight[0], uvRect.bottomRight[1],
                    bottomLeft[0],  bottomLeft[1],  bottomLeft[2],  bottomLeft[3],  uvRect.bottomLeft[0],  uvRect.bottomLeft[1],
                ]);

                //get the drawable associated with this textureURL
                const drawable: ISpriteDrawable = this._spriteDrawableMap.get(textureURL) || {
                    vertexBuffers: [RenderingCommands.createVertexBuffer(MAX_VERTEX_BUFFER_LENGTH * Float32Array.BYTES_PER_ELEMENT)],
                    vertexBufferCounts: [0],
                    indexBuffers: [RenderingCommands.createIndexBuffer(MAX_INDEX_BUFFER_LENGTH * Uint32Array.BYTES_PER_ELEMENT)],
                    indexBufferCounts: [0],
                    textureSamplerBindGroup: RenderingCommands.createTextureSamplerBindGroup(texture, RenderingCommands.createSampler())
                }
                this._spriteDrawableMap.set(textureURL, drawable); //todo: change syntax..

                //Add a new buffer to the array if existing buffers are full
                if(drawable.vertexBufferCounts.at(-1)! + 4 >= MAX_VERTEX_BUFFER_LENGTH) {
                    drawable.vertexBuffers.push(RenderingCommands.createVertexBuffer(MAX_VERTEX_BUFFER_LENGTH * Float32Array.BYTES_PER_ELEMENT));
                    drawable.vertexBufferCounts.push(0);
                    drawable.indexBuffers.push(RenderingCommands.createIndexBuffer(MAX_INDEX_BUFFER_LENGTH * Uint32Array.BYTES_PER_ELEMENT));
                    drawable.indexBufferCounts.push(0);
                }

                //Add 4 vertices to the drawable
                const vertexBuffer: GPUBuffer = drawable.vertexBuffers.at(-1)!;
                const vertexCount: number = drawable.vertexBufferCounts.at(-1)!;
                RenderingCommands.writeBuffer(vertexBuffer, vertices, SIZE_PER_VERTEX * vertexCount);
                drawable.vertexBufferCounts[drawable.vertexBufferCounts.length - 1] = drawable.vertexBufferCounts.at(-1)! + 4;
                
                //Add 6 indices to the drawable
                const indexBuffer: GPUBuffer = drawable.indexBuffers.at(-1)!;
                const indices = new Uint32Array([
                    vertexCount, vertexCount+1, vertexCount+2,
                    vertexCount+2, vertexCount+3, vertexCount
                ]);
                RenderingCommands.writeBuffer(indexBuffer, indices);
                drawable.indexBufferCounts[drawable.indexBufferCounts.length - 1] = drawable.indexBufferCounts.at(-1)! + 6;
            }
        });

        //Draw all sprites
        this._spriteDrawableMap.forEach((drawable: ISpriteDrawable) => {
            const {renderPassEncoder, commandEncoder} = RenderingCommands.createRenderPassEncoder();
            renderPassEncoder.setPipeline(this._pipeline);
            renderPassEncoder.setBindGroup(0, this._projectionViewBindGroup);
            renderPassEncoder.setBindGroup(1, drawable.textureSamplerBindGroup);

            drawable.vertexBuffers.forEach((vertexBuffer: GPUBuffer, index: number) => {
                renderPassEncoder.setVertexBuffer(0, vertexBuffer);
                renderPassEncoder.setIndexBuffer(drawable.indexBuffers[index], "uint32");
                renderPassEncoder.drawIndexed(drawable.indexBufferCounts[index]);
            });

            renderPassEncoder.end();
            RenderingCommands.finishCommandEncoder(commandEncoder);
        })
    }
}