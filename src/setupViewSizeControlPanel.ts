import GlobalState from "./Engine/Systems/GlobalState";

// * Adding an entry here is not enough, what this entry does is driven by scss.
enum CanvasDisplaySizeClasses {
    original = 'size-original', //this is added inside the index.html when writing the markup, see that they are in sync
    sizeTwoTimes = 'size-two-times',
    sizeFourTimes = 'size-four-times',
    sizeFill = 'size-fill'
};

/**
 * Use this function to remove all css classes used to size a canvas if they exists
 * @param element this is expected to be the canvas element which is given to me by pixi.js, the only reason this is an input is because it is the users responsibility to not call this function before pixi.js is initialized
 */
function removeAllCanvasDisplaySizeClasses(element: HTMLCanvasElement){
    element.classList.remove(CanvasDisplaySizeClasses.original);
    element.classList.remove(CanvasDisplaySizeClasses.sizeTwoTimes);
    element.classList.remove(CanvasDisplaySizeClasses.sizeFourTimes);
    element.classList.remove(CanvasDisplaySizeClasses.sizeFill);
}

/**
 * Utility function which adds a css class to a HTMLCanvas element which makes the canvas its "original size" (the coordinates passed into pixi.js I believe)
 * @param appCanvas the canvas element which is to be resized 
 */
function originalSizeBtnClicked(appCanvas: HTMLCanvasElement){
    removeAllCanvasDisplaySizeClasses(appCanvas);
    appCanvas.classList.add(CanvasDisplaySizeClasses.original);
}

/**
 * Utility function which adds a css class to a HTMLCanvas element which makes the canvas its "original size times 2" (the coordinates passed into pixi.js x 2 I believe)
 * @param appCanvas the canvas element which is to be resized 
 */
function twoTimesSizeBtnClicked(appCanvas: HTMLCanvasElement){
    removeAllCanvasDisplaySizeClasses(appCanvas);
    appCanvas.classList.add(CanvasDisplaySizeClasses.sizeTwoTimes);
}

/**
 * Utility function which adds a css class to a HTMLCanvas element which makes the canvas its "original size times 4" (the coordinates passed into pixi.js x 4 I believe)
 * @param appCanvas the canvas element which is to be resized 
 */
function fourTimesSizeBtnClicked(appCanvas: HTMLCanvasElement){
    removeAllCanvasDisplaySizeClasses(appCanvas);
    appCanvas.classList.add(CanvasDisplaySizeClasses.sizeFourTimes);
}

/**
 * Utility function which adds a css class to a HTMLCanvas element that resizes the canvas to fill the screen 
 * @param appCanvas the canvas element which is to be resized
 */
function fillSizeBtnClicked(appCanvas: HTMLCanvasElement){
    removeAllCanvasDisplaySizeClasses(appCanvas);
    appCanvas.classList.add(CanvasDisplaySizeClasses.sizeFill);
}

/**
 * This method is used to initialize the canvas resizing panel
 */
export default function setupViewSizeControlPanel(){
    const originalSizeBtn: HTMLButtonElement = document.getElementById('set-canvas-size-original') as HTMLButtonElement;
    const twoTimesSizeBtn: HTMLButtonElement = document.getElementById('set-canvas-size-2x') as HTMLButtonElement;
    const fourTimesSizeBtn: HTMLButtonElement = document.getElementById('set-canvas-size-4x') as HTMLButtonElement;
    const fillSizeBtn: HTMLButtonElement = document.getElementById('set-canvas-size-fill') as HTMLButtonElement;

    originalSizeBtn.addEventListener('click',() => originalSizeBtnClicked(GlobalState.view));
    twoTimesSizeBtn.addEventListener('click',() => twoTimesSizeBtnClicked(GlobalState.view));
    fourTimesSizeBtn.addEventListener('click',() => fourTimesSizeBtnClicked(GlobalState.view));
    fillSizeBtn.addEventListener('click',() => fillSizeBtnClicked(GlobalState.view));
}
