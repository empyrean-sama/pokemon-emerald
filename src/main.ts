import { vec2 } from "gl-matrix";
import Actor from "./Engine/Actor";
import { addSpriteComponent, UVRect } from "./Engine/components/CSpriteComponent";
import imageMap from "./Engine/Resource/ImageMap";
import loadScene from "./Engine/Scene/Scene";
import GlobalState from "./Engine/Systems/GlobalState";
import ScriptProcessor from "./Engine/Systems/ScriptProcessor";
import SpriteProcessor from "./Engine/Systems/SpriteProcessor";
import setupViewSizeControlPanel from './setupViewSizeControlPanel';
import { addCameraComponent } from "./Engine/components/CCameraComponent";
import CScriptComponent, { addScriptComponent } from "./Engine/components/CScriptComponent";
import scriptMap from "./Engine/Resource/ScriptMap";
import ComponentType from "./Engine/Constructs/ComponentType";

/**
 * This IIFE (Immediately Invoked Function Expression) will be called that is going to initialize the game engine  
 */
(async function(){
    //Setup the panel which controls the view size of the html canvas element
    setupViewSizeControlPanel();

    //Initialize the processors
    const scriptProcessor = ScriptProcessor.getProcessor();
    const spriteProcessor = SpriteProcessor.getProcessor();
    await scriptProcessor.initialize();
    await spriteProcessor.initialize();
    
    loadScene(GlobalState.startScene);

    const cameraActor = new Actor();
    const cameraComp = addCameraComponent(cameraActor, true);
    cameraComp.setAsMainCamera();
    addScriptComponent(cameraActor, scriptMap.get('CameraActorScript') as ComponentType<CScriptComponent>);

    // const actor = new Actor();
    // addSpriteComponent(actor, imageMap.get('Ice_Cream_Shop_Design_layer_1') as string, new UVRect(
    //     vec2.set(vec2.create(), 0, 0),
    //     vec2.set(vec2.create(), 0.166, 0),
    //     vec2.set(vec2.create(), 0, 0.2),
    //     vec2.set(vec2.create(), 0.166, 0.2)
    // ));
    // const transformComponent = actor.getTransformComponent();
    // transformComponent.setWidth(32);
    // transformComponent.setHeight(32);

    // const actor2 = new Actor();
    // addSpriteComponent(actor2, imageMap.get('Ice_Cream_Shop_Design_layer_2') as string);
    // const transformComponent2 = actor2.getTransformComponent();
    // transformComponent2.scale(vec2.set(vec2.create(),7,8));
    // transformComponent2.setWidth(100);

    // const actor3 = new Actor();
    // addSpriteComponent(actor3, imageMap.get('Ice_Cream_Shop_Design_layer_3') as string);
    // const transformComponent3 = actor3.getTransformComponent();
    // transformComponent3.scale(vec2.set(vec2.create(),7,8));
    // transformComponent3.setWidth(100);

    //this is the main game loop
    requestAnimationFrame(drawFrame);
})();

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