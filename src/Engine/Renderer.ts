import GlobalState from "./Systems/GlobalState";

export const canvas: HTMLCanvasElement = GlobalState.view;
export const canvasContext: GPUCanvasContext | null = canvas.getContext("webgpu");
export let adapter: GPUAdapter | null = null;
export let device: GPUDevice | null = null;

export async function InitializeRenderer() {
    //Check if webgpu is supported
    adapter = await navigator.gpu.requestAdapter({powerPreference: "high-performance"});
    if(!canvasContext || !adapter) {
        throw new Error('this device does not support webgpu');
    }
    
    //Get the device and configure the context to use it
    device = await adapter.requestDevice();
    if(!device) {
        throw new Error('unable to get device from adapter');
    }
    canvasContext.configure({
        device,
        format: navigator.gpu.getPreferredCanvasFormat()
    });
}