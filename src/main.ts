import { Application } from "pixi.js"
import strBunnyPath from './img/bunny.png';
import SpriteProcessor from "./Engine/Systems/SpriteProcessor";
import Actor from "./Engine/Actor";
import {addSpriteComponent} from "./Engine/components/CSpriteComponent";
import {addScriptComponent} from "./Engine/components/CScriptComponent";
import ScriptProcessor from "./Engine/Systems/ScriptProcessor";
import GlobalState from "./Engine/Systems/GlobalState";
import CTransformComponent from "./Engine/components/CTransformComponent";
import Vec2 from "./Engine/Constructs/Vec2";
import { CanvasDisplaySizeClasses, fillSizeBtnClicked, fourTimesSizeBtnClicked, originalSizeBtnClicked, twoTimesSizeBtnClicked } from "./CanvasResizingCallbacks";

const width: number = 240; //this is passed into Pixi.js when creating the app
const height: number = 160; //this is passed into Pixi.js when creating the app

//Buttons when clicked that resize the main game canvas
const originalSizeBtn: HTMLButtonElement = document.getElementById('set-canvas-size-original') as HTMLButtonElement;
const twoTimesSizeBtn: HTMLButtonElement = document.getElementById('set-canvas-size-2x') as HTMLButtonElement;
const fourTimesSizeBtn: HTMLButtonElement = document.getElementById('set-canvas-size-4x') as HTMLButtonElement;
const fillSizeBtn: HTMLButtonElement = document.getElementById('set-canvas-size-fill') as HTMLButtonElement;

/**
 * This IIFE (Immediately Invoked Function Expression) will be called that is going to initialize the game engine  
 */
(async function(){

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

    //Initialize the processes
    SpriteProcessor.getProcessor().initializeSpriteProcessor(app.stage);

    //Create the processor loop
    app.ticker.add((ticker) => {
        //Update the global state
        GlobalState.delta = ticker.deltaTime;

        //Process the world
        ScriptProcessor.getProcessor().Process();
        SpriteProcessor.getProcessor().Process();
    });

    //Test by creating a bunny actor with a sprite and a script that moves it
    const bunnyActor = new Actor();
    addSpriteComponent(bunnyActor,strBunnyPath);
    addScriptComponent(bunnyActor,() => {
        console.log('on start called');
    }, (me: Actor, delta: number) => {
        const transformComponent = me.getComponent(CTransformComponent) as CTransformComponent;
        transformComponent.position.add(new Vec2(.5,.3));
    })
})();