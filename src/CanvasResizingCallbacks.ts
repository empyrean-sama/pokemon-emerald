// * Adding an entry here is not enough, what this entry does is driven by scss.
export enum CanvasDisplaySizeClasses {
    original = 'size-original',
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
export function originalSizeBtnClicked(appCanvas: HTMLCanvasElement){
    removeAllCanvasDisplaySizeClasses(appCanvas);
    appCanvas.classList.add(CanvasDisplaySizeClasses.original);
}

/**
 * Utility function which adds a css class to a HTMLCanvas element which makes the canvas its "original size times 2" (the coordinates passed into pixi.js x 2 I believe)
 * @param appCanvas the canvas element which is to be resized 
 */
export function twoTimesSizeBtnClicked(appCanvas: HTMLCanvasElement){
    removeAllCanvasDisplaySizeClasses(appCanvas);
    appCanvas.classList.add(CanvasDisplaySizeClasses.sizeTwoTimes);
}

/**
 * Utility function which adds a css class to a HTMLCanvas element which makes the canvas its "original size times 4" (the coordinates passed into pixi.js x 4 I believe)
 * @param appCanvas the canvas element which is to be resized 
 */
export function fourTimesSizeBtnClicked(appCanvas: HTMLCanvasElement){
    removeAllCanvasDisplaySizeClasses(appCanvas);
    appCanvas.classList.add(CanvasDisplaySizeClasses.sizeFourTimes);
}

/**
 * Utility function which adds a css class to a HTMLCanvas element that resizes the canvas to fill the screen 
 * @param appCanvas the canvas element which is to be resized
 */
export function fillSizeBtnClicked(appCanvas: HTMLCanvasElement){
    removeAllCanvasDisplaySizeClasses(appCanvas);
    appCanvas.classList.add(CanvasDisplaySizeClasses.sizeFill);
}