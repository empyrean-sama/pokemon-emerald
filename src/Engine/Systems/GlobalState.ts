/**
 * This static class is responsible to hold all global state individual processes might want to refer to
 * It is best to update this before any processes are run
 */
export default class GlobalState {
    public static delta: number = 0;
    public static readonly view: HTMLCanvasElement = document.getElementById('webGPU-view') as HTMLCanvasElement; 
    public static viewDimensions = {width: 240, height: 160};
    public static spriteDimensions = {width: 8, height: 8};
}