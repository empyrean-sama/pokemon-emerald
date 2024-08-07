import './String'; //? Executing this script modifies the string prototype to add in new functions used in the engine
import Actor from "./engine/Actor";
import { addSpriteComponent } from "./engine/components/CSpriteComponent";
import GameLayer from "./engine/frame-layers/game-layer/GameLayer";
import LayerStack from "./engine/frame-layers/LayerStack";
import GlobalState, { EConfigurationMode } from "./engine/GlobalState";
import { RenderingState, initialize as initializeRendering } from "./engine/rendering/Rendering";
import imageMap from "./engine/resource-map/ImageMap";
import { resizeCanvasTo4XSize } from "./setupViewSizeControlPanel";

/**
 * Entry point for the entire engine
 */
(async function main() {

    // Resize the canvas if automatically if in debug mode
    if(GlobalState.getConfigurationMode() === EConfigurationMode.debug) {
        resizeCanvasTo4XSize();
    }

    // Initialize the rendering system
    await initializeRendering();

    // Create the LayerStack
    LayerStack.addLayer(new GameLayer());

    //Create an actor for testing purposes
    const actor = new Actor();
    addSpriteComponent(actor, imageMap.get('bunny')!);

    // Request animation frame for the game loop
    window.requestAnimationFrame(_loop);
})();

function _loop(delta: number) {
    LayerStack.iterateOnUpdate(delta);

    window.requestAnimationFrame(_loop);
}