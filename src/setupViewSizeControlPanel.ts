/**
 * Function which resizes the canvas
 * @param width: the new width of webGPU-view canvas
 * @param height: the new height of webGPU-view canvas
 * @return nothing, only side effects
 */
function resizeCanvas(width: number, height: number): void {
    const canvas = document.getElementById('webGPU-view') as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
}

/**
 * Internal function to resize canvas by clicking the appropriate button on the webGPU-view canvas
 * @param buttonName: id of the button on the SizeControlPanel
 * @throws an Error if a button with the given id cannot be found on the element with id 'size-control-panel'
 */
function resizeCanvasByClickingButton(buttonName: string) {
    const sizeControlPanelId = 'size-control-panel';
    const sizeControlPanel = document.getElementById('size-control-panel') as HTMLDivElement | null;
    if(!sizeControlPanel){
        throw new Error(`Cannot find the sizeControlPanel with the id ${sizeControlPanelId}`);
    }

    const button = sizeControlPanel.querySelector(`#${buttonName}`) as HTMLButtonElement | null;
    if(!button) {
        throw new Error(`could not find a button with the id ${buttonName} while trying to resize the canvas.`);
    }
    button.click();
}

document.getElementById('set-canvas-size-original')?.addEventListener('click',() => resizeCanvas(240, 160));
document.getElementById('set-canvas-size-2x')?.addEventListener('click',() => resizeCanvas(480, 320));
document.getElementById('set-canvas-size-4x')?.addEventListener('click', () => resizeCanvas(960, 640));

/**
 * This function clicks the 'set-canvas-size-original' button on the page to resize the webGPU-view canvas
 */
export function resizeCanvasToOriginal() {
    resizeCanvasByClickingButton('set-canvas-size-original');
}

/**
 * This function clicks the 'set-canvas-size-2x' button on the page to resize the webGPU-view canvas
 */
export function resizeCanvasTo2XSize() {
    resizeCanvasByClickingButton('set-canvas-size-2x');
}

/**
 * This function clicks the 'set-canvas-size-4x' button on the page to resize the webGPU-view canvas
 */
export function resizeCanvasTo4XSize() {
    resizeCanvasByClickingButton('set-canvas-size-4x');
}