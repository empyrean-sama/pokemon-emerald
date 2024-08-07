import settings from './settings.json';
import IPackedScene from '../interface/IPackedScene';
import sceneMap from './resource-map/SceneMap';
import CComponent, { EComponentType, IComponentType } from './components/CComponent';

export enum EConfigurationMode { release, debug }

/**
 * Holds state interesting to more than one layer
 */
export default class GlobalState {

    /**
     * Get the scene to load first when the game begins
     * @returns IPackedScene
     * @throws if settings.startSceneResourceID is not found in scene resource map
     */
    public static getStartScene(): IPackedScene {
        const resource: IPackedScene | undefined = sceneMap.get(settings.startSceneResourceID);
        if(!resource){
            throw new Error(`Unable to getStartScene() with the startSceneResourceID: '${settings.startSceneResourceID}'`);
        }
        return resource;
    }

    /**
     * Get configuration mode setup in the settings.json file
     * @returns an enum specifying which configurationMode the engine is running in
     * @throws an Error if the configurationMode set in settings.json is not supported
     */
    public static getConfigurationMode(): EConfigurationMode {
        if(settings.configurationMode === "release") {
            return EConfigurationMode.release;
        }
        else if(settings.configurationMode === "debug") {
            return EConfigurationMode.debug;
        }
        else {
            throw new Error(`settings.configurationMode set to '${settings.configurationMode}', this mode is not supported`);
        }
    }

    /**
     * Rendering commands provide more details on what they are doing should this method return true
     * todo: currently no part of the engine can write to a file, look into if such a thing is feasible in the future
     */
    public static generateDetailedRendererLogs(): boolean {
        if(GlobalState.getConfigurationMode() === EConfigurationMode.debug && settings.detailedRendererLogsEnabled === true) {
            return true;
        }
        else return false;
    }

    /** Container to store all components registered */
    private static _componentMap = new Map<EComponentType, Array<CComponent>>();

    /**
     * Only Registered components are processed by the processor
     * @param component to be registered
     */
    public static registerComponent(component: CComponent) {
        const componentType = component.getComponentType();
        if(!this._componentMap.has(componentType)) {
            this._componentMap.set(componentType, new Array<CComponent>());
        }
        this._componentMap.get(componentType)!.push(component);
    }

    /**
     * Get all components of a specified type registered inside the global state
     */
    public static getComponentsOfType<T extends CComponent>(componentType: IComponentType<T>): Array<CComponent> {
        const componentTypeRegistry = componentType.getComponentType();
        return this._componentMap.get(componentTypeRegistry) || [];
    }
}