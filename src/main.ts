import strBunnyPath from './img/bunny.png';
import SpriteProcessor from "./Engine/Systems/SpriteProcessor";
import Actor from "./Engine/Actor";
import {addSpriteComponent} from "./Engine/components/CSpriteComponent";
import {addScriptComponent} from "./Engine/components/CScriptComponent";
import ScriptProcessor from "./Engine/Systems/ScriptProcessor";
import GlobalState from "./Engine/Systems/GlobalState";
import CTransformComponent from "./Engine/components/CTransformComponent";
import setupViewSizeControlPanel from './setupViewSizeControlPanel';
import CCameraComponent, { addCameraComponent } from "./Engine/components/CCameraComponent";
import Input from "./Engine/Systems/Input";

/**
 * This IIFE (Immediately Invoked Function Expression) will be called that is going to initialize the game engine  
 */
(async function(){

    //Setup the panel which controls the view size of the html canvas element
    setupViewSizeControlPanel();

    //Initialize the processes
    await SpriteProcessor.getProcessor().initialize();

    //Initialize the engine
    initializeGame();

    //there is no reason to destroy the while(true) loop in the browser, I mean there is no window to close right?
    // while(true) {
    //     
    // }

    requestAnimationFrame(drawFrame);

    // //Initialize the processes
    // SpriteProcessor.getProcessor().initializeSpriteProcessor(app.stage);

    // //Create the processor loop
    // app.ticker.add((ticker) => {
    //     //Update the global state
    //     GlobalState.delta = ticker.deltaTime;

    //     //Process the world
    //     ScriptProcessor.getProcessor().Process();
    //     SpriteProcessor.getProcessor().Process();
    // });

    //Test by creating a bunny actor with a sprite and a script that moves it
    // const bunnyActor = new Actor();
    // addSpriteComponent(bunnyActor,strBunnyPath);
    // addScriptComponent(bunnyActor,() => {
    //     console.log('on start called');
    // }, (me: Actor, delta: number) => {

    //     const transformComponent = me.getComponent(CTransformComponent) as CTransformComponent;
    //     if(Input.getInput().isKeyPressed(Input.keyW)){
    //         transformComponent.position.add(new Vec2(0,.3));
    //     }
    //     else if(Input.getInput().isKeyPressed(Input.keyS)){
    //         transformComponent.position.add(new Vec2(0,-.3));
    //     }
    //     else if(Input.getInput().isKeyPressed(Input.keyA)){
    //         transformComponent.position.add(new Vec2(-.3,0));
    //     }
    //     else if(Input.getInput().isKeyPressed(Input.keyD)){
    //         transformComponent.position.add(new Vec2(.3,0));
    //     }
    // })
    // const cameraComponent = addCameraComponent(bunnyActor,true) as CCameraComponent;
    // cameraComponent.setAsMainCamera();

    // const bunnyProp1 = new Actor();
    // addSpriteComponent(bunnyProp1,strBunnyPath);
    // const bp1TC = bunnyProp1.getComponent(CTransformComponent) as CTransformComponent;
    // bp1TC.position = new Vec2(10,0);

    // const bunnyProp2 = new Actor();
    // addSpriteComponent(bunnyProp2,strBunnyPath);
    // const bp2TC = bunnyProp2.getComponent(CTransformComponent) as CTransformComponent;
    // bp2TC.position = new Vec2(0,10);

    // const bunnyProp3 = new Actor();
    // addSpriteComponent(bunnyProp3,strBunnyPath);
    // const bp3TC = bunnyProp3.getComponent(CTransformComponent) as CTransformComponent;
    // bp3TC.position = new Vec2(-10,0);
})();



/**
 * Initialize the game, this is currently used for debugging purpose.
 * todo: remove this method, initialize all required systems in main
 * ? good for debugging?
 */
function initializeGame(){
    const bunnyActor: Actor = new Actor();
    addSpriteComponent(bunnyActor, strBunnyPath);
    addCameraComponent(bunnyActor);
}

/**
 * Main draw loop of the engine
 */
function drawFrame(){
    SpriteProcessor.getProcessor().process();
    // requestAnimationFrame(drawFrame);
}