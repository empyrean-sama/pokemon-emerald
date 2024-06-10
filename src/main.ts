import strBunnyPath from './img/bunny.png';
import SpriteProcessor from "./Engine/Systems/SpriteProcessor";
import Actor from "./Engine/Actor";
import {addSpriteComponent} from "./Engine/components/CSpriteComponent";
import {addScriptComponent} from "./Engine/components/CScriptComponent";
import ScriptProcessor from "./Engine/Systems/ScriptProcessor";
import setupViewSizeControlPanel from './setupViewSizeControlPanel';
import CCameraComponent, { addCameraComponent } from "./Engine/components/CCameraComponent";
import Input from "./Engine/Systems/Input";

import TestActorScript from './Scripts/testActorScript';

import iceCreamParlor from './Scene/iceCreamParlor.json';

/**
 * This IIFE (Immediately Invoked Function Expression) will be called that is going to initialize the game engine  
 */
(async function(){
    //Setup the panel which controls the view size of the html canvas element
    setupViewSizeControlPanel();

    //Initialize the processes
    await SpriteProcessor.getProcessor().initialize();
    
    //Initialize the engine
    await initializeGame();

    //this is the main game loop
    requestAnimationFrame(drawFrame);
})();



/**
 * Initialize the game, this is currently used for debugging purpose.
 * todo: remove this method, initialize all required systems in main
 * ? good for debugging?
 */
async function initializeGame(){
    const bunnyActor: Actor = new Actor();
    addSpriteComponent(bunnyActor, strBunnyPath);
    addCameraComponent(bunnyActor).setAsMainCamera();
    addScriptComponent(bunnyActor, TestActorScript);

    // const scriptToLoad = `./Scripts/${iceCreamParlor.layers[3].objects[0].properties[0].value}` 
    // const {default: def} = await import(scriptToLoad);
    // const obj = new def();
    // // const iceCreamScene = JSON.parse(iceCreamParlor);
    // // console.log(iceCreamScene);
}

/**
 * Main draw loop of the engine
 */
function drawFrame(){
    //Finish processing
    ScriptProcessor.getProcessor().process();
    SpriteProcessor.getProcessor().process();

    //Queue another frame to be drawn
    requestAnimationFrame(drawFrame);
}