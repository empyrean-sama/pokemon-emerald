import ISceneObject from "./ISceneObject"

export default interface IPackedSceneLayer {
    /** The draw order of this layer, only topdown is supported for now */
    draworder: string,
    /** Is the layer visible */
    visible: boolean,
    /** Name of the layer */
    name: string,
    /** Type of the layer, use this property to cast into a better interface like IPackedSceneTileLayer or IPackedSceneObjectGroup */
    type: EnumPackedSceneLayerType,
    /** Position of the layer in X coordinates (Top Left X if draworder is topdown) */
    x: number,
    /** Position of the layer in Y coordinates (Bottom Right Y if draworder is topdown) */
    y: number
}

export interface IPackedSceneTileLayer extends IPackedSceneLayer {
    /** Tile data present in the layer, represented as an array of gid's, lookup gid's in tilesets */
    data: Array<number>,
    /** Width of the tile layer in TILES (NOT PIXELS) */
    width: number,
    /** Height of the tile layer in TILES (NOT PIXELS) */
    height: number,
}

export interface IPackedSceneObjectGroup extends IPackedSceneLayer {
    /** A collection of objects that are to be instantiated as actors */
    objects: Array<ISceneObject>
}

export enum EnumPackedSceneLayerType {
    ObjectGroup = 'objectgroup',
    TileLayer = 'tilelayer'
}