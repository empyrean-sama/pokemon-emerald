import IPackedScene from "./Interfaces/IPackedScene";

/**
 * Destroy everything in the world, then repopulate it from a scene file using this method
 * @param sceneFile: this is a JSON file generated by TILED that describes how a multiplicity of actors are to be instantiated 
 */
export default function loadScene(sceneFile: IPackedScene): void {
    throw new Error('the ability to load a new scene is not yet implemented in the engine');
}