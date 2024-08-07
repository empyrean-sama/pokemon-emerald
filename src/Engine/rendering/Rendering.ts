import GlobalState from '../GlobalState';
import StringConstants from '../StringConstants';
import { mat4 } from 'gl-matrix';

let device: GPUDevice | undefined;
let canvasContext: GPUCanvasContext | undefined;
export class RenderingState {

    /**
     * Can I start rendering? 
     * ? this function starts returning true after initialize is successfully awaited
     * @returns a boolean denoting whether rendering is possible
     */
    public static isRenderingPossible(): boolean {
        return (!!device) && (!!canvasContext);
    }

    /**
     * Gain Access to the device
     * ! Using device is not recommended, instead try to use RenderingCommands. This will allow code to be streamlined and make porting easier in the future, moreover things like logging are planned for the future in RenderingCommands.  
     * @returns GPUDevice
     */
    public static getDevice(): GPUDevice {
        RenderingCommands.throwErrorIfRenderingNotPossible();
        return device!;
    }

    /**
     * Gain access to the main view on which the game is run
     * @returns this is always a HTMLCanvasElement as we run the game on a browser
     */
    public static getView(): HTMLCanvasElement {
        const view = document.getElementById(StringConstants.viewCanvasID) as HTMLCanvasElement;
        if(!view){
            throw new Error(`error getting view, could not find a HTML Canvas element with the id: ${StringConstants.viewCanvasID}, if this is not the id of viewCanvas, please update the StringConstants file.`);
        }
        return view;
    }

    /**
     * Get the CanvasContext cached while initializing
     * @returns the canvasContext if rendering is possible
     * @throws an error if rendering is not possible; this can be due to multiple reasons including initializing not yet done
     */
    public static getViewContext(): GPUCanvasContext {
        RenderingCommands.throwErrorIfRenderingNotPossible();
        return canvasContext!;
    }

    /**
     * Get view dimensions of the canvas
     * ? Gameboy's have a view dimensions of 240 x 160
     * @returns an object with the view dimensions
     */
    public static getViewDimensions(): {width: number, height: number} {
        return {
            width: 240,
            height: 160
        };
    }

    /**
     * Get Dimensions of any given actor when the scale is 1.0 in both x and y 
     * @returns an object containing both the width and height
     */
    public static getActorDimensions(): {width: number, height: number} {
        return {
            width: 8,
            height: 8
        }
    }

    /** 
     * Map textureURL to GPUTexture
     * todo: reference counting will allow me to deallocate GPUTextures without a purge, should look into it.. 
    */
    private static _textureMap = new Map<string, GPUTexture | null>(); 
    
    /**
     * Submit a texture url, this will internally generate a GPUTexture if it does not already exist
     * @param textureURL is the url of image to be used as the texture data
     */
    public static async submitTextureURL(textureURL: string) {
        if(!this._textureMap.has(textureURL)) {
            this._textureMap.set(textureURL, null); //placeholder before the promise resolves
            try {
                const texture = await RenderingCommands.createTextureFromURL(textureURL);
                this._textureMap.set(textureURL, texture);
            }
            catch(error) {
                this._textureMap.delete(textureURL);
                console.error(`submit texture url failed, url: '${textureURL}'`);
            }
        }
    }

    /**
     * Get a previously submitted texture url's associated GPUTexture
     * ? a null return here does not mean that the URL was never submitted, it could also mean that the texture was not yet loaded, if you absolutely require a texture to finish loading before this method hits, try awaiting submitTextureURL
     * todo: see if I can add some functionality to await this method in the future
     * @param textureURL : textureURL
     * @returns 
     */
    public static getTextureFromURL(textureURL: string): GPUTexture | null {
        if(this._textureMap.has(textureURL)) {
            return (this._textureMap.get(textureURL) as GPUTexture | null);
        }
        else {
            console.warn(`${textureURL} was not submitted previously to the renderingState, trying to get a texture from this URL will always return null`);
            return null;
        }
    }

    /**
     * Clears all the GPUTextures held in memory
     *? useful when moving to a new scene, most of the old textures will no longer be used so no point in holding them
     *! will not delete keys that are yet to finish loading textures
     */
    public static purgeTextureResources() {
        const keysToDelete: string[] = [];
        this._textureMap.forEach((texture: GPUTexture | null, key) => {
            if(texture) {
                texture.destroy();
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach((keyToDelete: string) => this._textureMap.delete(keyToDelete));
    }

    /** Internal state to hold the camera matrix */
    private static _cameraMatrix: WeakRef<mat4> | undefined;

    /** 
     * Set a specific matrix as the camera matrix
     * ? no copy will be made, only holds a weak reference
     */
    public static setGameCameraMatrix(cameraMatrix: mat4) {
        this._cameraMatrix = new WeakRef(cameraMatrix);
    }

    /**
     * Gets the currently set camera matrix or an identity matrix if nothing was previously set
     * @return a camera mat4 or identity mat4 
     */
    public static getGameCameraMatrix(): mat4 {
        if(this._cameraMatrix) {
            const matrixReference = this._cameraMatrix.deref();
            if(matrixReference) {
                return matrixReference;
            }
            else {
                return mat4.create();
            }
        }
        else{
            return mat4.create();
        }
    }
}

/**
 * Commands to help render stuff on screen
 */
export class RenderingCommands {

    /**
     * Used to check if rendering is possible
     * ? The method is designed to be used internally to log errors before going forward and executing other specific RendererCommand
     * ? The most obvious use of this is in RenderingState.getDevice()
     */
    public static throwErrorIfRenderingNotPossible() {
        if(!RenderingState.isRenderingPossible()) {
            throw new Error('Rendering is not possible now. \n the possible causes for this is that the initialize method is not yet called or that initialization has failed. in most cases when initialization has failed something is logged into the console.');
        }
    }

    /**
     * Create a GPU buffer using the webGPU API
     * @param bufferSize: size of the GPUBuffer in bytes
     * @param bufferUsage: is this buffer a vertex buffer an index buffer or something else?
     * @param mappedAtCreation: mappedAtCreation flag set when creating a buffer
     */
    public static createBuffer(bufferSize: number, bufferUsage: number, mappedAtCreation = false): GPUBuffer {
        RenderingCommands.throwErrorIfRenderingNotPossible();
        return device!.createBuffer({
            size: bufferSize,
            usage: bufferUsage,
            mappedAtCreation
        });
    }

    /**
     * Command to clear a GPUBuffer
     * @param buffer: buffer to be cleared, sets everything to zero
     * @param commandEncoder: Uses the command encoders API if present else defaults to queuing an operation on device.queue
     */
    public static clearBuffer(buffer: GPUBuffer, commandEncoder?: GPUCommandEncoder) {
        const device = RenderingState.getDevice();
        if(commandEncoder) {
            commandEncoder.clearBuffer(buffer);
        }
        else {
            device.queue.writeBuffer(buffer, 0, new Uint8Array(buffer.size / Uint8Array.BYTES_PER_ELEMENT));
        }
    }

    /**
     * Queue data to be written into the GPUBuffer
     * @param buffer buffer into which data is to be written
     * @param bufferData the data to be written into the buffer
     * @param bufferOffset - Offset in bytes into `buffer` to begin writing at.
     */
    public static writeBuffer(buffer: GPUBuffer, bufferData: ArrayBufferLike, bufferOffset: GPUSize64 = 0) {
        const device = RenderingState.getDevice();
        device.queue.writeBuffer(buffer, bufferOffset, bufferData);
    }

    /**
     * Create a Vertex Buffer by specifying the size and data
     * @param bufferSize: Amount of bytes allocated for the buffer 
     * @param data: [[Optional]] this data will be written into the buffer after creation if specified  
     * @returns a GPUBuffer created using the device
     * @throws an Error if the device does not exist when this function is called
     */
    public static createVertexBuffer(bufferSize: number, data?: Array<number>): GPUBuffer {
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
     * Create a Index Buffer by specifying the size and data
     * @param bufferSize: Amount of bytes allocated for the buffer 
     * @param data: [[Optional]] this data will be written into the buffer after creation if specified  
     * @returns a GPUBuffer created using the device
     * @throws an Error if the device does not exist when this function is called
     */
    public static createIndexBuffer(bufferSize: number, data?: Array<number>): GPUBuffer {
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
     * Create a Uniform Buffer by specifying a buffer size and data
     * ! All Uniforms are as of now assumed to be Float32, this might need to change in the future
     * @param bufferLength: Number of float32's that can be stored inside the buffer
     * @param data: [[Optional]] this data will be written into the buffer after creation if specified  
     * @returns a GPUBuffer created using the device
     * @throws an Error if the device does not exist when this function is called
     */
    public static createUniformBuffer(bufferLength: number, data?: Array<number>){
        let gpuBuffer: GPUBuffer | null = null;
        
        if(data) {
            if(bufferLength < data.length) {
                throw new Error(`unable to create uniform buffer, the required buffer length, (data.length: ${data.length}) is more than the length allocated for this buffer which is ${bufferLength}`);
            }
            gpuBuffer = this.createBuffer(bufferLength * Float32Array.BYTES_PER_ELEMENT, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, true);
            new Float32Array(gpuBuffer.getMappedRange()).set(data);
            gpuBuffer.unmap();
        }
        else {
            gpuBuffer = this.createBuffer(bufferLength * Float32Array.BYTES_PER_ELEMENT, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, false);
        }

        return gpuBuffer;
    }

    /**
     * Create a texture
     * The usage of this texture is assumed to be GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST always if using this function
     * @param width: the width of the texture in pixels
     * @param height: the height of the texture in pixels
     * @returns an empty GPUTexture
     */
    public static createTexture(width: number, height: number, format: GPUTextureFormat = 'rgba8unorm', textureUsage: number = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST): GPUTexture {
        RenderingCommands.throwErrorIfRenderingNotPossible();
        return device!.createTexture({
            size: {width,height},
            format,
            usage: textureUsage
        });
    }

    /**
     * Create a texture and queue loading some data into it  
     * @param imageBitmap: the image bitmap queued to be written into the GPUTexture
     * @param format: the format in which this 
     * @param textureUsage: this is an optional argument, the defaults are GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
     */
    public static createTextureAndLoadData(imageBitmap: ImageBitmap, format: GPUTextureFormat = 'rgba8unorm', textureUsage: number = GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST): GPUTexture {
        RenderingCommands.throwErrorIfRenderingNotPossible();
        const texture = this.createTexture(imageBitmap.width,imageBitmap.height, format, textureUsage);
        device!.queue.copyExternalImageToTexture({source: imageBitmap}, {texture}, [imageBitmap.width,imageBitmap.height]);
        return texture;
    }

    /**
     * Create a GPUSampler
     * @param samplerDescription: The defaults are fine for a game like pokemon, customize if required
     * @returns a GPUSampler
     * @throws if a device does not exist
     */
    public static createSampler(samplerDescription: GPUSamplerDescriptor = {minFilter: "nearest", magFilter: "nearest"}): GPUSampler {
        const device = RenderingState.getDevice();
        return device.createSampler(samplerDescription);
    }

    /**
     * Create a texture from any given URL string
     * @param url: url of the texture to load into memory
     * @throws an Error if url is invalid, can also throw if device does not exist
     */
    public static async createTextureFromURL(url: string): Promise<GPUTexture> {
        let bitmap: ImageBitmap | undefined;
        try{
                bitmap = await new Promise((resolve,reject) => {
                const image = document.createElement('img') as HTMLImageElement;
                image.onload = () => resolve(createImageBitmap(image));
                image.onerror = () => reject('unable to load image');
                image.src = url;
            });
        }
        catch(err){
            console.error('Unable to load the given url into a bitmap');
            throw err;
        }
        return this.createTextureAndLoadData(bitmap!);
    }

    /**
     * The TextureSampler bind group layout is standardized to always contain a texture (texture_2d<f32>) at @binding(0) and a sampler at @binding(1)
     * ? Both the texture and sampler are also standardized to be only visible in fragment shader
     * @returns GPUBindGroupLayout of the texture sampler group
     */
    public static createTextureSamplerBindGroupLayout(): GPUBindGroupLayout {
        const device = RenderingState.getDevice();
        return device.createBindGroupLayout({
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

    /**
     * The ProjectionView bind group layout is standardized to always contain a mat4x4f uniform buffer as @binding(0)
     * ? The uniform buffer mat4x4f is 16 float32's wide
     * ? Can see the uniform buffer from vertex shader
     * @returns the projection view bind group layout
     */
    public static createProjectionViewBindGroupLayout(): GPUBindGroupLayout {
        const device = RenderingState.getDevice();
        return device.createBindGroupLayout({
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
    }

    /**
     * Creates a standardized bind group of type TextureSampler
     * ? Always contains a texture (texture_2d<f32>) at @binding(0) and a sampler at @binding(1)
     * @param texture : the texture resource to associate with the bind group
     * @param sampler : the sampler resource to associate with the bind group
     * @returns a GPUBindGroup which can be bound once the pipeline is set and a render pass encoder is created
     */
    public static createTextureSamplerBindGroup(texture: GPUTexture, sampler: GPUSampler): GPUBindGroup {
        const device = RenderingState.getDevice();
        return device.createBindGroup({
            layout: RenderingCommands.createTextureSamplerBindGroupLayout(),
            entries: [
                {
                    binding: 0,
                    resource: texture.createView()
                },
                {
                    binding: 1,
                    resource: sampler
                }
            ]
        });
    }

    /**
     * Creates a standardized bind group of type ProjectionView
     * ? Always contain a mat4x4f uniform buffer as @binding(0)
     * @param buffer : the uniform buffer resource to associate with the bind group
     * @returns a GPUBindGroup which can be bound once the pipeline is set and a render pass encoder is created
     */
    public static createProjectionViewBindGroup(buffer: GPUBuffer): GPUBindGroup {
        const device = RenderingState.getDevice();
        return device.createBindGroup({
            layout: RenderingCommands.createProjectionViewBindGroupLayout(),
            entries: [
                {
                    binding: 0,
                    resource: { buffer }
                }
            ]
        });
    }

    /**
     * Creates a standardized bind group of type ProjectionView
     * ? Always contain a mat4x4f uniform buffer as @binding(0)
     * @param matrix: creates a uniform buffer out of this resource which is visible in the vertex shader as @binding(0) of this bind group
     * @returns a GPUBindGroup which can be bound once the pipeline is set and a render pass encoder is created and a uniform buffer to write data from CPU which can be accessed from @binding(0)
     */
    public static createProjectionViewBindGroupFromMatrix(matrix: mat4): {buffer: GPUBuffer, bindGroup: GPUBindGroup} {
        const uniformBuffer = RenderingCommands.createUniformBuffer(16, new Array<number>(...matrix));
        const projectionViewBindGroup = RenderingCommands.createProjectionViewBindGroup(uniformBuffer);
        return {buffer: uniformBuffer, bindGroup: projectionViewBindGroup};
    }

    /**
     * Creates a blend state that works with basic transparency and in most situations
     * @returns a GPUBlendState
     */
    public static getDefaultBlendState(): GPUBlendState {
        return  {
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
        };
    }

    /**
     * Create a shader from the shaderSrc code, automatically detects the vertex shader inputs
     * ? currently uses the default blend state while creating the GPUFragmentState
     * todo: the blendState can be swappable
     * todo: this function cannot detect all types of vertex inputs as of now, fill in logic to handle exhaustively all kinds of inputs
     * @param shaderSrc : WGSL shader source code as string
     * @returns a vertexState and fragmentState
     */
    public static createShader(shaderSrc: string): {vertexState: GPUVertexState, fragmentState: GPUFragmentState} {
        const device = RenderingState.getDevice();
        const shaderModule = device.createShaderModule({code: shaderSrc});
         
        const vertexInputs: Array<string> = shaderSrc.split(`fn ${StringConstants.vertexShaderMainFuncName}`)[1].split('->')[0].split(',');

        const parsedVertices = vertexInputs.map((input: string) => {
            const shaderLocation = Number.parseInt(input.getEnclosedStrings('@location(', ')')[0]);
            const rawFormat = input.split(':')[1].trim().replaceAll(')','');
            let format: GPUVertexFormat | null = null;
            let rawStride: number = 0;
            switch(rawFormat) {
                case 'vec2f':
                    format = 'float32x2';
                    rawStride = 2 * Float32Array.BYTES_PER_ELEMENT;
                    break;
                case 'vec3f':
                    format = 'float32x3';
                    rawStride = 3 * Float32Array.BYTES_PER_ELEMENT;
                    break;
                case 'vec4f':
                    format = 'float32x4';
                    rawStride = 4 * Float32Array.BYTES_PER_ELEMENT;
                    break;
                default:
                    throw new Error(`rawFormat: '${rawFormat}' cannot be processed, please update the generate shader RendererCommand if this is a valid format`);
            }
            
            return {
                shaderLocation,
                format,
                rawStride
            }
        });

        // Sort
        parsedVertices.sort((a, b) => a.shaderLocation - b.shaderLocation);

        let offset = 0;
        const vertexAttributes = parsedVertices.map((vertex) => {
            const GPUVertexAttribute: GPUVertexAttribute = {
                shaderLocation: vertex.shaderLocation,
                format: vertex.format,
                offset,
            }
            offset += vertex.rawStride;
            return GPUVertexAttribute;
        });

        const vertexState: GPUVertexState = {
            module: shaderModule,
            entryPoint: StringConstants.vertexShaderMainFuncName,
            buffers: [
                {
                    arrayStride: offset,
                    attributes: vertexAttributes,
                    stepMode: 'vertex'
                },
            ]
        };

        const fragmentState: GPUFragmentState = {
            module: shaderModule,
            entryPoint: StringConstants.fragmentShaderMainFuncName,
            targets: [
                {
                    format: navigator.gpu.getPreferredCanvasFormat(),
                    blend: RenderingCommands.getDefaultBlendState()
                }
            ]
        };

        return {vertexState, fragmentState};
    }

    /**
     * Create a pipeline by specifying the shader code and the bind group layouts used inside said shader
     * todo: bindGroupLayouts can be in theory detected by reading the shader, see if I can automate that 
     * @param shaderSrc : shader source code
     * @param bindGroupLayouts : the bind group layouts in the order they appear inside the shader (sort by @group)
     * @param topology : should I draw triangles or something else, default is drawing triangles 
     * @returns a GPUPipeline
     */
    public static createPipeline(shaderSrc: string, bindGroupLayouts: Array<GPUBindGroupLayout>, topology: GPUPrimitiveTopology = 'triangle-list' ) {
        const device = RenderingState.getDevice();
        const pipelineLayout = device.createPipelineLayout({ bindGroupLayouts });
        const { vertexState, fragmentState } = RenderingCommands.createShader(shaderSrc);
        return device.createRenderPipeline({
            vertex: vertexState,
            fragment: fragmentState,
            primitive: { topology },
            layout: pipelineLayout
        });
    }

    /**
     * Creates the command encoder
     * ? looks like the command encoder exposes a good API to work with buffers like clearing them or copying them
     * todo: see if RenderingCommands can internally be using command encoder for working with buffers
     * @returns a GPUCommandEncoder which can submitted with another RenderingCommands
     */
    public static createCommandEncoder(): GPUCommandEncoder {
        const device = RenderingState.getDevice();
        return device.createCommandEncoder();
    }

    /**
     * This encoder requires a command encoder and is helpful to draw objects onto screen
     * @returns an object containing instances of both GPUCommandEncoder and GPURenderPassEncoder 
     */
    public static createRenderPassEncoder(): {commandEncoder: GPUCommandEncoder, renderPassEncoder: GPURenderPassEncoder} {
        const device = RenderingState.getDevice();
        const commandEncoder = RenderingCommands.createCommandEncoder();
        const renderPassEncoder = commandEncoder.beginRenderPass({
           colorAttachments: [
                {
                    view: RenderingState.getViewContext().getCurrentTexture().createView(),
                    loadOp: 'clear',
                    storeOp: 'store',
                    clearValue: [.6,.6,.6,1]
                }
            ],
        });

        return {commandEncoder, renderPassEncoder};
    }

    /**
     * Queue new commands on the device's queue
     * ? This is a necessary step for all the commands queued on the command encoder to actually be performed
     * ? The RenderPassEncoder also comes from a CommandEncoder and as such requires that said command encoder be submitted.  
     * @param commandEncoder : the command encoder containing new commands to be added into the device's queue
     */
    public static finishCommandEncoder(commandEncoder: GPUCommandEncoder) {
        const device = RenderingState.getDevice();
        device.queue.submit([commandEncoder.finish()]);
    }
}

/**
 * Initialize the Rendering System on this engine
 * ? The function call must be awaited before accessing most RenderingState or any RenderingCommand
 * todo: if initialization fails, the logs generated can be more exhaustive?
 * @returns a promise that should be awaited before Rendering stuff to the screen
 */
export async function initialize(): Promise<void> {
    if(device){
        console.warn(`device: ${device} is already initialized, ignoring an attempt to initialize it again`);
        return;
    }

    const viewCanvas = RenderingState.getView();
    canvasContext = viewCanvas.getContext("webgpu") || undefined;
    const adapter = await navigator.gpu.requestAdapter({powerPreference: "high-performance"});
    if(!canvasContext || !adapter) {
        throw new Error('this device does not support webgpu');
    }

    try {
        device = await adapter.requestDevice();
    }
    catch(error) {
        console.error('Unable to get device from adapter');
        throw error;
    }
    
    canvasContext.configure({
        device,
        format: navigator.gpu.getPreferredCanvasFormat()
    });
}