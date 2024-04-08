import Actor from "../Actor";

/**
 * All the components available in the engine are to have entries here
 * This enum can be used as return values for getComponentType METHODS that are to be realistically implemented by all components in this engine
 */
export enum ComponentRegistry{
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

    public abstract getComponentType(): string;
    public static getComponentType(): string {
        throw new Error('no object of CComponent must ever exist, also every component must override this method');
    }

    /**
     * This method is useful when one component needs to talk with another component
     * @returns the actor on which this component is registered
     */
    public getOwningActor(): Actor{
        return this._owningActor;
    }
}