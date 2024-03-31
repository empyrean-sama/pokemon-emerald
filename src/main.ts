import { Application, Assets, Sprite, Texture } from "pixi.js"
import strBunnyPath from './img/bunny.png';

const width: number = 240; //this is passed into Pixi.js when creating the app
const height: number = 160; //this is passed into Pixi.js when creating the app

const originalSizeBtn: HTMLButtonElement = document.getElementById('set-canvas-size-original') as HTMLButtonElement;
const twoTimesSizeBtn: HTMLButtonElement = document.getElementById('set-canvas-size-2x') as HTMLButtonElement;
const fourTimesSizeBtn: HTMLButtonElement = document.getElementById('set-canvas-size-4x') as HTMLButtonElement;
const fillSizeBtn: HTMLButtonElement = document.getElementById('set-canvas-size-fill') as HTMLButtonElement;

// * Adding an entry here is not enough, what this entry does is driven by scss.
enum CanvasDisplaySizeClasses {
    original = 'size-original',
    sizeTwoTimes = 'size-two-times',
    sizeFourTimes = 'size-four-times',
    sizeFill = 'size-fill'
};

/**
 * 
 * @param element this is expected to be the canvas element which is given to me by pixi.js, the only reason this is an input is because it is the users responsibility to not call this function before pixi.js is initialized
 */
function removeAllCanvasDisplaySizeClasses(element: HTMLCanvasElement){
    element.classList.remove(CanvasDisplaySizeClasses.original);
    element.classList.remove(CanvasDisplaySizeClasses.sizeTwoTimes);
    element.classList.remove(CanvasDisplaySizeClasses.sizeFourTimes);
    element.classList.remove(CanvasDisplaySizeClasses.sizeFill);
}

function originalSizeBtnClicked(appCanvas: HTMLCanvasElement){
    removeAllCanvasDisplaySizeClasses(appCanvas);
    appCanvas.classList.add(CanvasDisplaySizeClasses.original);
}
function twoTimesSizeBtnClicked(appCanvas: HTMLCanvasElement){
    removeAllCanvasDisplaySizeClasses(appCanvas);
    appCanvas.classList.add(CanvasDisplaySizeClasses.sizeTwoTimes);
}
function fourTimesSizeBtnClicked(appCanvas: HTMLCanvasElement){
    removeAllCanvasDisplaySizeClasses(appCanvas);
    appCanvas.classList.add(CanvasDisplaySizeClasses.sizeFourTimes);
}
function fillSizeBtnClicked(appCanvas: HTMLCanvasElement){
    removeAllCanvasDisplaySizeClasses(appCanvas);
    appCanvas.classList.add(CanvasDisplaySizeClasses.sizeFill);
}

/**
 * This function is called once when the game starts running, its responsible for setting up everything 
 */
async function main() {

    //Create the app and initialize it
    const app = new Application();
    await app.init({ background: 'magenta', width, height });

    //Pixi.js generates its output on a canvas, append it to the correct place. 
    const container = document.getElementById('container') as HTMLDivElement;
    const appCanvas = app.canvas;
    appCanvas.id = "pixi-canvas"; //primarily used by scss to resize
    appCanvas.classList.add(CanvasDisplaySizeClasses.original); //the starting size of the canvas is expected to be the original size
    container.insertBefore(appCanvas,document.getElementById('size-control-panel') as HTMLDivElement);

    //Setup the size control panel
    originalSizeBtn.addEventListener('click',() => originalSizeBtnClicked(appCanvas));
    twoTimesSizeBtn.addEventListener('click',() => twoTimesSizeBtnClicked(appCanvas));
    fourTimesSizeBtn.addEventListener('click',() => fourTimesSizeBtnClicked(appCanvas));
    fillSizeBtn.addEventListener('click',() => fillSizeBtnClicked(appCanvas));

    //Create a bunny texture and then create a sprite out of that texture
    const texBunny: Texture = await Assets.load(strBunnyPath);
    const bunny = new Sprite(texBunny);

    //Add the bunny sprite to be displayed to the user
    app.stage.addChild(bunny);
}

//Call the main function to start the game
main();