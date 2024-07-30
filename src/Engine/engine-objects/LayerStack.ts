import ILayerEvent from "../interfaces/ILayerEvent";
import { Layer, LayerImplementation } from "./Layer";

let _layerStack: LayerStackImplementation | undefined;

export interface LayerStackStatic {
    /**
     * Get the instance of LayerStack to work with
     */
    getLayerStack(): LayerStack,
}

export interface LayerStack {
    /**
     * Add a layer into the LayerStack
     * ? Layers in the layer stack get events and are updated every frame
     * ? Calls the onAttach event on the layer
     * @param index is optional, inserts a layer at the 'top' of other layers if the index is either omitted or a value greater than the number of indices currently in management by the LayerStack is provided
     * @throws throw an Error if trying to attach a layer which is already attached 
     */
    addLayer(layer: Layer, index?: number): void,

    /**
     * Add an overlay into the LayerStack
     * ? An overlay always resides on the top. The top most layer is always one below the bottom most overlay 
     */
    addOverlay(layer: Layer): void
}

/**
 * Singleton class, Used to manage layers in the world
 */
export class LayerStackImplementation {

    /**
     * Internal field to keep track of all the layers under management
     */
    private _layerStack: Array<LayerImplementation> = [];

    /**
     * Field required to differentiate between overlays and layers
     */
    private _lastLayerIndex: number = -1;
    
    /**
     * Constructor does nothing special, private to control building of objects
     */
    private constructor() {}

    /**
     * Public Static API
     */
    public static getLayerStack(): LayerStack {
        if(!_layerStack) {
            _layerStack = new LayerStackImplementation();
        }
        return _layerStack;
    }

    /**
     * Public API
     */
    public addLayer(layer: Layer, index?: number): void {
        //Calculate the index to insert Layer at
        this._lastLayerIndex++;
        index = index || this._lastLayerIndex;

        //Insert new Layer at calculated index
        this._layerStack = [...this._layerStack.slice(0, index), layer as LayerImplementation, ...this._layerStack.slice(index+1)];

        //Call the onAttach function
        const implementation = layer as LayerImplementation;
        implementation.onAttach();
    }

    /**
     * Public API
     */
    public addOverlay(layer: Layer): void {
        //Add overlay
        this._layerStack.push(layer as LayerImplementation);

        //Call the onAttach function
        const implementation = layer as LayerImplementation;
        implementation.onAttach();
    }

    /**
     * Call update on all the Layers inside the LayerStack in correct order
     * Updates layers first and then goes to overlays
     */
    public updateProcess(): void {
        this._layerStack.forEach((layer: LayerImplementation) => layer.onUpdate());
    }

    /**
     * Call onEvent starting from the top most overlay and go down the LayerStack as much as required
     */
    public eventProcess(event: ILayerEvent) {
        let processingEvent: ILayerEvent | null = event;
        let count = this._layerStack.length - 1;
        
        while(count >= 0) {
            const layer = this._layerStack[count--];
            processingEvent = layer.onEvent(processingEvent);
            if(!processingEvent) {
                break;
            }
        }
    }
}

// export the LayerStackImplementation class object as the relevant interface 
export default LayerStackImplementation as LayerStackStatic;