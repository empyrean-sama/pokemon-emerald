import { initializeProcessors, mainProcess } from "./Engine/Systems/GlobalState";
import setupViewSizeControlPanel from './setupViewSizeControlPanel';

/**
 * This IIFE (Immediately Invoked Function Expression) will be called that is going to initialize the game engine  
 */
(async function(){
    //Setup the panel which controls the view size of the html canvas element
    setupViewSizeControlPanel();

    //Initialize the processors
    await initializeProcessors();
    
    //todo: Load a scene here in the future

    //this is the main game loop
    requestAnimationFrame(drawFrame);
})();

/**
 * Main draw loop of the engine
 */
function drawFrame(){
    //Finish processing
    mainProcess();

    //Queue another frame to be drawn
    requestAnimationFrame(drawFrame);
}