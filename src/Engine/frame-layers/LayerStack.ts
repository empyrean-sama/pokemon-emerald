import ILayerEvent from "../../interface/ILayerEvent";
import LayerImplementation, { ILayer } from "./Layer";

export default class LayerStack {

    /** Constructor set to private to stop objects from being created as they are really not required */
    private constructor() {}
    
    /** The layerStack this class wraps around */
    private static _layerStack: Array<LayerImplementation> = [];
    
    /** The number of layers, everything after this is an overlay */
    private static _layerCount: number = 0

    /** 
     * Add the Layer in for evaluation
     * ? Calls the onAttach() method right now
     * ? Tries to call onUpdate() in this frame
     * @param layer to add
     * @param index to add the layer in, layer will be added at the end before first overlay if index greater than number of layers
     * @throws an Error if layer is not an instanceOf LayerImplementation
     */
    public static addLayer(layer: ILayer, index?: number) {
        if(layer instanceof LayerImplementation) {
            index = Math.min(index || this._layerCount, this._layerCount);
            this._layerStack.splice(index, 0, layer);
            this._layerCount++;
            layer.onAttach();
        }
        else {
            throw new Error(`Encountered a ILayer object: ${layer} which is not an instance of LayerImplementation, failed to add it into the LayerStack at the index: ${index}`);
        }
    }

    /**
     * Add the Layer in for evaluation as an overlay
     * ? Overlays are always updated last and receive events first
     * ? Calls the onAttach() method right now
     * ? Tries to call onUpdate() in this frame
     * @param layer to add in as an overlay 
     */
    public static addOverlay(layer: ILayer){
        if(layer instanceof LayerImplementation) {
            this._layerStack.push(layer);
            layer.onAttach();
        }
        else {
            throw new Error(`Encountered an ILayer object: ${layer} which is not an instance of LayerImplementation, failed to add it in as an overlay`);
        }
    }

    /**
     * Iterate and handle onUpdate
     * ? Will start from the bottom most layer and end with the top most overlay always processing every layer in that specific order 
     */
    public static iterateOnUpdate(delta: number) {
        this._layerStack.forEach((layer: LayerImplementation) => layer.onUpdate(delta));
    }

    /** 
     * Iterate and handle an event
     * ? Will start from the top most overlay and go in the direction of the bottom most layer, will stop once the event is resolved
     */
    public static iterateOnEvent(event: ILayerEvent) {
        let internalEvent: ILayerEvent | null = event;
        for(let i = this._layerStack.length - 1; i >= 0; i--) {
            internalEvent = this._layerStack[i].onEvent(internalEvent);
            if(!internalEvent){
                break;
            }
        }
    }
}