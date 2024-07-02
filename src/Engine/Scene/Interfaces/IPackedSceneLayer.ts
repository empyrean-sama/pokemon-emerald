export default interface IPackedSceneLayer {
    /** The draw order of this layer, only topdown is supported for now */
    draworder: string,
    /** Is the layer visible */
    visible: boolean,
}