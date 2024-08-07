import CComponent, { IComponentType } from "./components/CComponent";
import CTransformComponent from "./components/CTransformComponent";
import GlobalState from "./GlobalState";

/**
 * An actor is a symbol to which multiple components are linked, 
 * it is actually the components and not the actors which actually do stuff
 */
export default class Actor {
    private _label: string;
    constructor(label?: string) {
        this._label = label || "no_label_actor";
        this.addComponent(CTransformComponent);
    }

    /**
     * Get a string identifying this actor
     * @returns a string containing the actors label set during construction
     */
    public getLabel(): string {
        return this._label;
    }

    /** A cache for components associated with the actor */
    private components = new Array<CComponent>();

    /**
     * Adds any type of component to this actor 
     * @param componentType: the constructor function of the component to be constructed
     * @throws if a component of componentType.getComponentType() already exists on the actor
     */
    public addComponent<T extends CComponent>(componentType: IComponentType<T>, ...args: any[]): T {
        if(this.components.find((component: CComponent) => component.getComponentType() === componentType.getComponentType())) {
            throw new Error(`A component of type '${componentType.getComponentType()}' already exists on the actor '${this._label}', trying to add it again caused this error to be thrown`);
        }
        
        //Create the component in question
        const component = new componentType(this, ...args);

        //Register it in global state and also include it as part of actor cache
        GlobalState.registerComponent(component);
        this.components.push(component);

        //Return a handle to the created component
        return component;
    }

    /**
     * Gets the component on the actor if it exists, else null
     * @param componentType: try to get this type of component on the actor
     */
    public getComponent<T extends CComponent>(componentType: IComponentType<T>): CComponent | null {
        return this.components.find((component: CComponent) => component.getComponentType() === componentType.getComponentType()) || null;
    }

    /**
     * The transform component is something that is regularly accessed and is available on all actors, this is an easy utility to access this component
     */
    public getTransformComponent(): CTransformComponent {
        return this.getComponent(CTransformComponent) as CTransformComponent;
    }
}