import Actor from "../Actor";

/**
 * This interface is supported by a component class object of type T and not by an instantiated component of said type T
 */
export interface IComponentType<T> extends Function 
{ 
    new (owningActor: Actor, ...args: any[]): T;
    getComponentType(): EComponentType;
}

/**
 * All the components available in the engine are to have entries here
 * This enum can be used as return values for getComponentType METHODS that are to be realistically implemented by all components in this engine
 */
export enum EComponentType {
    CTransformComponent = "CTransformComponent",
    CSpriteComponent = "CSpriteComponent",
    CCameraComponent = "CCameraComponent",
    CScriptComponent = "CScriptComponent",
}

/**
 * Base Class for all components in this engine, cannot however be instantiated though
 */
export default abstract class CComponent {
    private _owningActor: Actor;
    constructor(owningActor: Actor){
        this._owningActor = owningActor;
    }

    public abstract getComponentType(): EComponentType;
    public static getComponentType(): EComponentType {
        throw new Error('no object of CComponent must ever exist, also every component must override this method');
    }

    /**
     * This method is useful when one component needs to talk with another component
     * @returns the actor on which this component is registered
     */
    public getOwningActor(): Actor{
        return this._owningActor;
    }

    /** 
     * This method is called just before the component is allowed to be garbage collected 
     * ? Can specify cleanup code here 
    */
    public onDetach() {}
}