export default interface IPackedTileset {
    /** Name of the tileset */
    name: string,
    /** The relative url to the image, this is NOT usable as is in the engine, extract the name from this url and use the resource mapper for a usable URL to the image */
    image: string,
    /** Width of the image in pixels */
    imagewidth: number,
    /** Height of the image in pixels */
    imageheight: number,
    /** Height of a single tile in pixels */
    tileheight: number,
    /** Width of a single tile in pixels */
    tilewidth: number,
    /** The tile numbers associated with this tileset start from this number (inclusive of this number) */
    firstgid: number,
    /** Number of columns in the tileset */
    columns: number
    /** Number of tiles in this tileset */
    tilecount: number,
    /** Margin NOT supported as of now */
    margin: number,
    /** Spacing NOT supported as of now */
    spacing: number
}