import IPackedTileset from "./IPackedTileset";
import IPackedSceneLayer from "./IPackedSceneLayer";

export default interface IPackedScene {
    /** Number of tiles NOT pixels */ 
    width: number, 
    /** Number of tiles, NOT pixels */
    height: number,
    /** The width of a single tile in pixels */
    tilewidth: number,
    /** The height of a single tile in pixels */
    tileheight: number,
    /** Get all the tilesets associated with this scene */
    tilesets: IPackedTileset[],
}