/**
 * This interface maps to the object received from tiled JSON
 * ! The object is useless as is for the engine, it must be converted into an actor to be used.. 
 *  todo: maybe see if an actor can be serialized to this?
 */
export default interface ISceneObject {
    /**
     * Tileset tile number on the sprite component
     */
    gid: number,
    /**
     * height of the object in pixels
     */
    height: number,
    /**
     * width of the object in pixels
     */
    width: number,
    /**
     * Top Left X in TILED Space
     */
    x: number,
    /**
     * Bottom Right Y in TILED Space
     */
    y: number,
}

export interface ICustomProperty {
    name: string,
    type: string,
    value: any
}

export interface ICustomStrValue extends ICustomProperty {
    value: string
}