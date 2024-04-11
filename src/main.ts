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
import CCameraComponent, { addCameraComponent } from "./Engine/components/CCameraComponent";
import Input from "./Engine/Systems/Input";

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
    await app.init({ background: 'magenta', width: GlobalState.viewDimensions.width, height: GlobalState.viewDimensions.height });
    
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
        if(Input.getInput().isKeyPressed(Input.keyW)){
            transformComponent.position.add(new Vec2(0,.3));
        }
        else if(Input.getInput().isKeyPressed(Input.keyS)){
            transformComponent.position.add(new Vec2(0,-.3));
        }
        else if(Input.getInput().isKeyPressed(Input.keyA)){
            transformComponent.position.add(new Vec2(-.3,0));
        }
        else if(Input.getInput().isKeyPressed(Input.keyD)){
            transformComponent.position.add(new Vec2(.3,0));
        }
    })
    const cameraComponent = addCameraComponent(bunnyActor,true) as CCameraComponent;
    cameraComponent.setAsMainCamera();

    const bunnyProp1 = new Actor();
    addSpriteComponent(bunnyProp1,strBunnyPath);
    const bp1TC = bunnyProp1.getComponent(CTransformComponent) as CTransformComponent;
    bp1TC.position = new Vec2(10,0);

    const bunnyProp2 = new Actor();
    addSpriteComponent(bunnyProp2,strBunnyPath);
    const bp2TC = bunnyProp2.getComponent(CTransformComponent) as CTransformComponent;
    bp2TC.position = new Vec2(0,10);

    const bunnyProp3 = new Actor();
    addSpriteComponent(bunnyProp3,strBunnyPath);
    const bp3TC = bunnyProp3.getComponent(CTransformComponent) as CTransformComponent;
    bp3TC.position = new Vec2(-10,0);
})();