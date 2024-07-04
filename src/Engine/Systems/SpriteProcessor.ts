import CSpriteComponent from "../components/CSpriteComponent";

import Processor from "./Processor";
import CTransformComponent from "../components/CTransformComponent";
import GlobalState from "./GlobalState";
import CCameraComponent from "../components/CCameraComponent";

import defaultSpriteShader from "bundle-text:./Shaders/defaultSpriteShader.wgsl";
import { mat4, vec3, vec4 } from "gl-matrix";
import Actor from "../Actor";
import GlobalComponentStore from "./GlobalComponentStore";
import CComponent from "../components/CComponent";

let spriteProcessor: SpriteProcessor | null = null;

interface BufferMapEntry {
    vertexBuffers: Array<GPUBuffer>;
    indexBuffers: Array<GPUBuffer>;
    vertexBufferCounts: Array<number>;
    indexBufferCounts: Array<number>;
}

/**
 * Singleton class to force only one world stage to exist at any given time
 */
export default class SpriteProcessor extends Processor {
    
    //A Handle to the main camera component,
    //todo: revisit this when thinking about the death of an actor
    private _mainCameraComponent: CCameraComponent | null = null;
    
    /**
     *? Not recommended to call this API, it is generally called internally from the CCameraComponent to set itself.
     * @param cameraComponent the camera component which I want to view the world from
     */
    public setMainCamera(cameraComponent: CCameraComponent){
        this._mainCameraComponent = cameraComponent;
    }

    /**
     * Utility method to access the main camera component from which the world is being viewed
     * @warns if there is no mainCameraComponent set
     * @returns CCameraComponent from which the world is being viewed
     */
    public getMainCamera(): CCameraComponent | null {
        return this._mainCameraComponent;
    }
    
    /**
     * A specific processor is a singleton
     */
    private constructor(){
        super();
    }

    /**
     * Use this method to get a handle to the sprite processor
     * @returns The sprite processor on this engine
     */
    public static getProcessor(): SpriteProcessor {
        if(!spriteProcessor){
            spriteProcessor = new SpriteProcessor();
        }
        return spriteProcessor; 
    }

    private _isInitialized = false;
    private _canvasContext: GPUCanvasContext | undefined;
    private _device: GPUDevice | undefined;
    private _pipeline: GPURenderPipeline | undefined;
    
    private _projectionViewBindGroup: GPUBindGroup | undefined;
    private _projectionViewBuffer: GPUBuffer | undefined;

    private readonly MAX_NUMBER_OF_VERTICES: number = 10000; //todo: this number is arbitrary, test and come to a good number
    private readonly MAX_NUMBER_OF_INDICES: number = (this.MAX_NUMBER_OF_VERTICES * 6)/4; //6 indices are required to draw four vertices
    private readonly SIZE_PER_VERTEX: number = Float32Array.BYTES_PER_ELEMENT * 6; //4 floats per position and 2 per texture coordinates
    private readonly SIZE_PER_INDEX: number = Uint16Array.BYTES_PER_ELEMENT; //every index is essentially just a uint16
    private _gpuBuffers = new Map<string, BufferMapEntry>();
    
    private _textureBindGroups = new Map<string, GPUBindGroup>();
    private _textureAndSamplerLayout: GPUBindGroupLayout | undefined; //do not use this variable, instead go with the utility method provided getTextureAndSamplerLayout or something similar 
    /**
     * Utility function to load the ImageBitmap of any texture url
     * @param textureURL: this is the url of the texture to be loaded
     * @returns a promise of the image bitmap
     */
    private asyncLoadImageFromUrl(textureURL: string): Promise<ImageBitmap> {
        return new Promise((resolve,reject) => {
            const image = document.createElement('img') as HTMLImageElement;
            image.onload = () => resolve(createImageBitmap(image));
            image.onerror = () => reject('unable to load image');
            image.src = textureURL;
        });
    }
    /**
     * Every textureURL needs a bind group associated with it, this method will create that bind group in question
     * @param textureURL: the textureURL submitted for consideration 
     * todo: this texture bind group creation might not be completed by the next draw, should I ask draw to ignore until it finds a bind group?.. how will this play with the upcoming type of actors where I don't regenerate buffers every frame
     */
    public async submitTextureURL(textureURL: string){
        if(!this._device){
            throw new Error(`Cannot submit texture url, the sprite processor might not be initialized, deviceObject: ${this._device}`)
        }

        if(!this._textureBindGroups.has(textureURL)) {
            const imageBitmap: ImageBitmap = await this.asyncLoadImageFromUrl(textureURL);
            const texture = this.createTextureAndLoadData(imageBitmap);
            const sampler = this.createSampler();
            const bindGroupLayout = this.createSpriteProcessorTextureBindGroupLayout();

            const bindGroup = this._device.createBindGroup({
                layout: bindGroupLayout,
                entries: [
                    {
                        binding: 0, //update this if made change in defaultSpriteShader.wgsl
                        resource: texture.createView()
                    },
                    {
                        binding: 1, //update this if made change in defaultSpriteShader.wgsl
                        resource: sampler
                    }
                ]
            })
            this._textureBindGroups.set(textureURL, bindGroup);
        }
    }

    /**
     * The SpriteProcessor is primarily concerned about actors with a sprite component
     * @returns all actors that posses a sprite component
     */
    public override getActorsInConsideration(): Actor[] {
        const globalComponentStore = GlobalComponentStore.getGlobalComponentStore();
        return globalComponentStore.getComponents(CSpriteComponent.getComponentType()).map((component: CComponent) => component.getOwningActor());
    }
    
    /**
     * This function is used to initialize the sprite processor
     * ! This method is only made public so that the sprite processor can be initialized in main, must probably never call this elsewhere 
     */
    public override async initialize(){

        //Get context and adapter
        const canvasContext = GlobalState.view.getContext("webgpu");
        const adapter = await navigator.gpu.requestAdapter({powerPreference: "high-performance"});
        if(!canvasContext || !adapter){
            throw new Error('this device does not support webgpu');
        }

        //Configure the canvas context
        this._device = await adapter.requestDevice();
        canvasContext.configure({
            device: this._device,
            format: navigator.gpu.getPreferredCanvasFormat()
        });
        this._canvasContext = canvasContext;

        //Create the shader module
        const shaderModule = this._device.createShaderModule({code: defaultSpriteShader});
        const vertexState: GPUVertexState = {
            module: shaderModule,
            entryPoint: 'vertexMain',
            buffers: [
                {
                    arrayStride: 6 * Float32Array.BYTES_PER_ELEMENT, //4 per position and 2 per texture coordinates
                    attributes: [
                        {
                            format: 'float32x4',
                            offset: 0,
                            shaderLocation: 0
                        },
                        {
                            format: 'float32x2',
                            offset: 4 * Float32Array.BYTES_PER_ELEMENT,
                            shaderLocation: 1
                        }
                    ],
                    stepMode: 'vertex'
                },
            ]
        };
        const fragmentState: GPUFragmentState = {
            module: shaderModule,
            entryPoint: 'fragMain',
            targets: [
                {
                    format: navigator.gpu.getPreferredCanvasFormat(),
                    blend: {
                        color: {
                            srcFactor: "src-alpha",
                            dstFactor: "one-minus-src-alpha",
                            operation: "add"
                        },
                        alpha: {
                            srcFactor: "src-alpha",
                            dstFactor: "one-minus-src-alpha",
                            operation: "add"
                        }
                    }
                }
            ]
        };
        
        //Create the projectionView bind group
        this._projectionViewBuffer = this.createUniformBuffer(16 * Float32Array.BYTES_PER_ELEMENT);
        const projectionViewLayout = this._device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer:{
                        type: 'uniform'
                    }
                }
            ]
        });
        this._projectionViewBindGroup = this._device.createBindGroup({
            layout: projectionViewLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this._projectionViewBuffer
                    }
                }
            ]
        })

        //Create the pipeline
        const pipelineLayout = this._device.createPipelineLayout({
            bindGroupLayouts: [projectionViewLayout,this.getTextureAndSamplerLayout()]
        })
        this._pipeline = this._device.createRenderPipeline({
            vertex: vertexState,
            fragment: fragmentState,
            primitive: {topology: 'triangle-list'},
            layout: pipelineLayout
        });

        //Set the initialized flag to true
        this._isInitialized = true;
    }

    public override process(): void {
        if(this.isProcessorInitialized() === false) {
            console.warn('process method called when the sprite processor is not yet initialized, so ignoring this call');
            return;
        }

        //Clear Buffers
        this._gpuBuffers.forEach((bufferMapEntry: BufferMapEntry) => {
            bufferMapEntry.indexBufferCounts = [0];
            bufferMapEntry.vertexBufferCounts = [0];
        })

        //Regenerate buffers
        this.getActorsInConsideration().forEach((actor) => {
            //Get required components
            const spriteComponent = actor.getComponent(CSpriteComponent) as CSpriteComponent;
            const transformComponent = actor.getComponent(CTransformComponent) as CTransformComponent;

            //Get the texture to be drawn
            const textureURL = spriteComponent.getTextureURL();
           
            //If there is no entry for this url on the map, then create one            
            if(this._gpuBuffers.has(textureURL) === false)
            {
                this._gpuBuffers.set(textureURL,{
                    vertexBuffers: [this.createVertexBuffer(this.MAX_NUMBER_OF_VERTICES * this.SIZE_PER_VERTEX)],
                    indexBuffers: [this.createIndexBuffer(this.MAX_NUMBER_OF_INDICES * this.SIZE_PER_INDEX)],
                    vertexBufferCounts: [0],
                    indexBufferCounts: [0]
                });
            }

            //If the entry on this map has the current vertex buffer full, create a new buffer
            const entry: BufferMapEntry = this._gpuBuffers.get(textureURL)!;
            if(entry.vertexBufferCounts[entry.vertexBufferCounts.length -1] >= this.MAX_NUMBER_OF_VERTICES){
                if(!entry.vertexBuffers[entry.vertexBufferCounts.length -1]){
                    entry.vertexBuffers.push(this.createVertexBuffer(this.MAX_NUMBER_OF_VERTICES * this.SIZE_PER_VERTEX));
                }
                if(!entry.indexBuffers[entry.vertexBufferCounts.length -1]){
                    entry.indexBuffers.push(this.createIndexBuffer(this.MAX_NUMBER_OF_INDICES * this.SIZE_PER_INDEX));
                }
                entry.vertexBufferCounts.push(0);
                entry.indexBufferCounts.push(0);
            }

            //Populate the vertex buffer for the corresponding textureURL entry
            const vertexBuffer: GPUBuffer = entry.vertexBuffers[entry.vertexBuffers.length - 1];
            const vertexCount: number = entry.vertexBufferCounts[entry.vertexBufferCounts.length - 1];
            
            //this is every actor, the unique transform of a particular actor will only come from its transform component
            const modelMatrix = transformComponent.getModelMatrix();
            const actorTopLeft      = vec4.transformMat4(vec4.create(), vec4.set(vec4.create(),-GlobalState.spriteDimensions.width / 2, GlobalState.spriteDimensions.height / 2, 0.0, 1.0), modelMatrix);
            const actorTopRight     = vec4.transformMat4(vec4.create(), vec4.set(vec4.create(), GlobalState.spriteDimensions.width / 2, GlobalState.spriteDimensions.height / 2, 0.0, 1.0), modelMatrix);
            const actorBottomRight  = vec4.transformMat4(vec4.create(), vec4.set(vec4.create(), GlobalState.spriteDimensions.width / 2,-GlobalState.spriteDimensions.height / 2, 0.0, 1.0), modelMatrix);
            const actorBottomLeft   = vec4.transformMat4(vec4.create(), vec4.set(vec4.create(),-GlobalState.spriteDimensions.width / 2,-GlobalState.spriteDimensions.height / 2, 0.0, 1.0), modelMatrix);

            const uvRect = spriteComponent.getUVCoordinates();
            
            this._device?.queue.writeBuffer(vertexBuffer, this.SIZE_PER_VERTEX * vertexCount, new Float32Array([
                //x,y,z,w coordinates                                                               //uv coordinates
                actorTopLeft[0],    actorTopLeft[1],    actorTopLeft[2],    actorTopLeft[3],        uvRect.topLeft[0] ,     uvRect.topLeft[1], 
                actorTopRight[0],   actorTopRight[1],   actorTopRight[2],   actorTopRight[3],       uvRect.topRight[0],     uvRect.topRight[1],
                actorBottomRight[0],actorBottomRight[1],actorBottomRight[2],actorBottomRight[3],    uvRect.bottomRight[0],  uvRect.bottomRight[1],
                actorBottomLeft[0], actorBottomLeft[1], actorBottomLeft[2], actorBottomLeft[3],     uvRect.bottomLeft[0],   uvRect.bottomLeft[1],
            ]));
            entry.vertexBufferCounts[entry.vertexBufferCounts.length - 1] += 4; //4 new vertices are added into the vertex buffer

            //Populate the index buffer for the corresponding textureURL entry
            const indexBuffer: GPUBuffer = entry.indexBuffers[entry.indexBuffers.length - 1];
            const indexCount: number = entry.indexBufferCounts[entry.indexBufferCounts.length - 1];
            this._device!.queue.writeBuffer(indexBuffer, this.SIZE_PER_INDEX * indexCount, new Uint16Array([
                vertexCount, vertexCount+1, vertexCount+2,
                vertexCount+2, vertexCount+3, vertexCount
            ]));
            entry.indexBufferCounts[entry.indexBufferCounts.length - 1] += 6; //6 new vertices were added into the index buffer
        });

        //Regenerate the projection view bind group
        const projectionViewMatrixData: Float32Array = new Float32Array(mat4.multiply(mat4.create(),this.generateProjectionMatrix(),this.getMainCamera()?.getViewMatrix() || mat4.create()));
        this._device!.queue.writeBuffer(this._projectionViewBuffer!, 0, projectionViewMatrixData);
        
        const commandEncoder = this._device!.createCommandEncoder();
        const renderPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: this._canvasContext!.getCurrentTexture().createView(),
                    loadOp: 'clear',
                    storeOp: 'store',
                    clearValue: [.6,.6,.6,1]
                }
            ]
        });

        //Draw code
        renderPassEncoder.setPipeline(this._pipeline!);
        renderPassEncoder.setBindGroup(0,this._projectionViewBindGroup!);

        //Issue a atleast one draw call for every texture
        this._gpuBuffers.forEach((bufferMapEntry: BufferMapEntry, textureURL: string)=>{
            const textureBindGroup = this._textureBindGroups.get(textureURL) as GPUBindGroup;
            
            //It takes time to load a texture and create its bind group, don't try to draw if bind group does not yet exist 
            if(textureBindGroup){
                renderPassEncoder.setBindGroup(1, textureBindGroup);

                //Bind vertex and index buffers and start issuing draw calls
                bufferMapEntry.vertexBuffers.forEach((vertexBuffer: GPUBuffer,index) => {
                    renderPassEncoder.setVertexBuffer(0,vertexBuffer);
                    renderPassEncoder.setIndexBuffer(bufferMapEntry.indexBuffers[index],"uint16");
                    renderPassEncoder.drawIndexed(bufferMapEntry.indexBufferCounts[index]);
                });
            }
        });

        renderPassEncoder.end();
        this._device!.queue.submit([commandEncoder.finish()]);
    }

    /**
     * Utility method to check if the sprite processor is initialized successfully
     */
    public isProcessorInitialized(): boolean {
        return this._isInitialized;
    }

    /**
     * Utility method for accessing the textureAndSamplerLayout used inside this processor, use this to create gpuBindGroups whenever needed
     * @return the texture and sampler layout used in this processor
     */
    private getTextureAndSamplerLayout(): GPUBindGroupLayout {
        if(!this._device){
            throw new Error(`Cannot create a GPUBindGroupLayout without a device, The initialize method is probably not called in sprite processor. deviceObject: ${this._device}`);
        }
        if(!this._textureAndSamplerLayout){
            this._textureAndSamplerLayout = this._device.createBindGroupLayout({
                entries: [
                    {
                        binding: 0,
                        visibility: GPUShaderStage.FRAGMENT,
                        texture: {}
                    },
                    {
                        binding: 1,
                        visibility: GPUShaderStage.FRAGMENT,
                        sampler: {}
                    }
                ]
            });
        }
        return this._textureAndSamplerLayout;
    }

    /**
     * Utility method to help create a GPU buffer using the webGPU API
     * @param bufferSize: size of the GPUBuffer in bytes
     * @param bufferUsage: is this buffer a vertex buffer an index buffer or something else?
     * @param mappedAtCreation: mappedAtCreation flag set when creating a buffer
     */
    private createBuffer(bufferSize: number, bufferUsage: number, mappedAtCreation = false): GPUBuffer {
        if(!this._device){
            throw new Error(`Cannot create a GPUBuffer without a device, The initialize method is probably not called in sprite processor. deviceObject: ${this._device}`);
        }

        return this._device.createBuffer({
            size: bufferSize,
            usage: bufferUsage,
            mappedAtCreation
        });
    }

    /**
     * Utility method to help create a Vertex Buffer by specifying the size and data
     * @param bufferSize: Amount of bytes allocated for the buffer 
     * @param data: [[Optional]] this data will be written into the buffer after creation if specified  
     * @returns a GPUBuffer created using the device
     * @throws an Error if the device does not exist when this function is called
     */
    private createVertexBuffer(bufferSize: number, data?: Array<number>): GPUBuffer {
        let gpuBuffer: GPUBuffer | null = null;
        
        if(data) {
            const requiredAmountOfBytes = data.length * Float32Array.BYTES_PER_ELEMENT; 
            if(bufferSize < requiredAmountOfBytes){
                console.warn(`Allocated buffer size is less than the required amount to fill the vertex buffer
                Allocated Size: ${bufferSize}, Required Bytes: ${requiredAmountOfBytes}`);
            }
            gpuBuffer = this.createBuffer(bufferSize, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, true);
            new Float32Array(gpuBuffer.getMappedRange()).set(data);
            gpuBuffer.unmap();
        }
        else {
            gpuBuffer = this.createBuffer(bufferSize, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST, false);
        }

        return gpuBuffer;
    }

    /**
     * Utility method to help create a Index Buffer by specifying the size and data
     * @param bufferSize: Amount of bytes allocated for the buffer 
     * @param data: [[Optional]] this data will be written into the buffer after creation if specified  
     * @returns a GPUBuffer created using the device
     * @throws an Error if the device does not exist when this function is called
     */
    private createIndexBuffer(bufferSize: number, data?: Array<number>): GPUBuffer {
        let gpuBuffer: GPUBuffer | null = null;
        
        if(data) {
            const requiredAmountOfBytes = data.length * Uint16Array.BYTES_PER_ELEMENT; 
            if(bufferSize < requiredAmountOfBytes){
                console.warn(`Allocated buffer size is less than the required amount to fill the index buffer
                Allocated Size: ${bufferSize}, Required Bytes: ${requiredAmountOfBytes}`);
            }
            gpuBuffer = this.createBuffer(bufferSize, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST, true);
            new Uint32Array(gpuBuffer.getMappedRange()).set(data);
            gpuBuffer.unmap();
        }
        else {
            gpuBuffer = this.createBuffer(bufferSize, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST, false);
        }

        return gpuBuffer;
    }

    /**
     * Utility function to create a Uniform Buffer by specifying a buffer size and data
     * ! All Uniforms are as of now assumed to be Float32, this might need to change in the future
     * @param bufferSize: Amount of bytes allocated for the buffer 
     * @param data: [[Optional]] this data will be written into the buffer after creation if specified  
     * @returns a GPUBuffer created using the device
     * @throws an Error if the device does not exist when this function is called
     */
    private createUniformBuffer(bufferSize: number, data?: Array<number>){
        let gpuBuffer: GPUBuffer | null = null;
        
        if(data) {
            const requiredAmountOfBytes = data.length * Float32Array.BYTES_PER_ELEMENT; 
            if(bufferSize < requiredAmountOfBytes){
                console.warn(`Allocated buffer size is less than the required amount to fill the uniform buffer
                Allocated Size: ${bufferSize}, Required Bytes: ${requiredAmountOfBytes}`);
            }
            gpuBuffer = this.createBuffer(bufferSize, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, true);
            new Float32Array(gpuBuffer.getMappedRange()).set(data);
            gpuBuffer.unmap();
        }
        else {
            gpuBuffer = this.createBuffer(bufferSize, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, false);
        }

        return gpuBuffer;
    }

    /**
     * Utility function to create a texture
     * The usage of this texture is assumed to be GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST always if using this function
     * @param width: the width of the texture in pixels
     * @param height: the height of the texture in pixels
     * @returns an empty GPUTexture
     */
    private createTexture(width: number, height: number, textureUsage: number = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST): GPUTexture {
        if(!this._device){
            throw new Error(`Cannot create a texture without a device, The initialize method is probably not called in sprite processor. deviceObject: ${this._device}`);
        }

        return this._device.createTexture({
            size: {width,height},
            format: 'rgba8unorm',
            usage: textureUsage
        });
    }

    /**
     * Utility function to create a texture and queue loading some data into it
     * he usage of this texture is assumed to be whatever is  
     * @param imageBitmap: the image bitmap queued to be written into the GPUTexture
     * @param textureUsage: this is an optional argument, the defaults are GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
     */
    private createTextureAndLoadData(imageBitmap: ImageBitmap, textureUsage: number = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST): GPUTexture {
        const texture = this.createTexture(imageBitmap.width,imageBitmap.height, textureUsage);
        this._device?.queue.copyExternalImageToTexture({source: imageBitmap}, {texture}, [imageBitmap.width,imageBitmap.height]);
        return texture;
    }

    /**
     * Utility method to create a GPUSampler
     * @param samplerDescription: The defaults are fine for a game like pokemon, customize if required
     * @returns 
     */
    private createSampler(samplerDescription: GPUSamplerDescriptor = {minFilter: "linear", magFilter: "linear"}): GPUSampler {
        if(!this._device){
            throw new Error(`Cannot create a sampler without a device, The initialize method is probably not called in sprite processor. deviceObject: ${this._device}`);
        }
        return this._device.createSampler(samplerDescription);
    }

    /**
     * Utility method to create the bind group layout for the texture and sampler specified in the defaultSpriteShader.wgsl update this method if any changes are made in that shader
     * @returns GPUBindGroupLayout
     */
    private createSpriteProcessorTextureBindGroupLayout(): GPUBindGroupLayout {
        if(!this._device){
            throw new Error(`cannot create sprite processor texture bind group layout, sprite processor may not be initialized. deviceObject: ${this._device}`);
        }

        return this._device.createBindGroupLayout({
            entries: [
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                },
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                }
            ]
        });
    }

    private _projectionMatrix: mat4 | undefined;
    /**
     * Utility method that can be used to generate the projection matrix based on settings in the GlobalState
     * @returns a cached projection matrix
     */
    private generateProjectionMatrix(): mat4 {
        if(!this._projectionMatrix) {
            const right: number = GlobalState.viewDimensions.width / 2;
            const top: number = GlobalState.viewDimensions.height / 2;
            this._projectionMatrix = mat4.ortho(mat4.create(),-1*right,right,-1*top,top,-1.0,1.0);
        }
        return this._projectionMatrix;
    }
}