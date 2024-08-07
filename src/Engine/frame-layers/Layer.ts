import ILayerEvent from "../../interface/ILayerEvent";

export interface ILayer {
    getLayerName(): string
}

export interface ILayerStatic {
    new(): ILayer
}

export default abstract class LayerImplementation {
    /** abstract method to be implemented in derived class */
    public abstract getLayerName(): string;
    
    /** will be called when attached to the LayerStack */
    public onAttach(): void {};

    /** will be called when detached from the LayerStack */
    public onDetach(): void {};

    /** 
     * will be called when the LayerStack has decided that an even needs to be processed 
     * returning null means the event is completely processed and no longer needs to be handled
     * retuning something that can be coerced to true means the LayerStack will be sending the returned value off to another layer for handling if required
     * ? can be called multiple times in succession to resolve all pending events
     * @param event to be handled
    */
    public onEvent(event: ILayerEvent): ILayerEvent | null { return event; };

    /** 
     * Will be called once per frame when the LayerStack wants the layer to be updated 
     * @param delta: time elapsed between the last update and this update call
    */
    public onUpdate(delta: number): void {};
}