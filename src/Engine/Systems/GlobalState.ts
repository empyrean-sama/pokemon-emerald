import IPackedScene from "../Scene/Interfaces/IPackedScene";
import SnekGame from '../../Scene/snek-game.json';

import Processor from "./Processor";
import ScriptProcessor from "./ScriptProcessor";
import SpriteProcessor from "./SpriteProcessor";

/**
 * This static class is responsible to hold all global state individual processes might want to refer to
 * It is best to update this before any processes are run
 */
export default class GlobalState {
    public static delta: number = 0;
    public static readonly view: HTMLCanvasElement = document.getElementById('webGPU-view') as HTMLCanvasElement; 
    public static readonly viewDimensions = {width: 240, height: 160};
    public static readonly spriteDimensions = {width: 8, height: 8};
    public static readonly startScene: IPackedScene = SnekGame;
    public static readonly processors: Processor[] = [ScriptProcessor.getProcessor(), SpriteProcessor.getProcessor()]; 
}

/**
 * Call Processor.initialize on all the processors defined in the GlobalState
 */
export async function initializeProcessors() {
    for(let i=0; i<GlobalState.processors.length; i++) {
        await GlobalState.processors[i].initialize();
    }
};

/**
 * Call Processor.process() on all the processors defined in the GlobalState 
 */
export function mainProcess() {
    GlobalState.processors.forEach((processor: Processor) => {
        processor.process();
    })
}