import ILayerEvent from "../interfaces/ILayerEvent";

/**
 * This is an interface to the actual implementation of the layer, use this access static methods on layer or instantiate new methods on said layer
 */
export default interface LayerStatic {
    new(name?: string): Layer,
}

/**
 * This interface is the public facing API for an object of the Layer class
 */
export interface Layer {
    getName: () => string
}

/**
 * This is the implementation of Layer class, 
 * Only friends must directly use this API, everybody else can use Layer
 */
export abstract class LayerImplementation {
    /**
     * @internal
     * Debug name for the layer, Defaults to a not very usable value
     *! Should not be used for anything other than debug or logging purposes, definitely no engine logic must depend on this
     */
    public _name: string;

    /**
     * Getter function
     * @returns name of the Layer
     */
    public getName(): string {
        return this._name;
    }

    constructor(name?: string) {
        this._name = name || "Layer_Undefined";
    }

    /**
     * Called when this Layer is attached to the LayerStack, the call occurs on the same Frame
     */
    public abstract onAttach(): void;

    /**
     * Called when this Layer is detached from LayerStack, the call occurs on the same frame 
     */
    public abstract onDetach(): void;
    
    /**
     * Called once per frame as long as this layer is attached to a layer stack
     * Will try to start calling this function from the same frame as when onAttach was called
     * ? All the drawing code is expected to live here as this function will definitely be called once per frame
     */
    public abstract onUpdate(): void;

    /**
     * Called to handle event occurrence, maybe called multiple times per frame
     * @returns ILayer event to propagate into the next layer. Can return null, this stops event propagation
     */
    public abstract onEvent(event: ILayerEvent): ILayerEvent | null;
}