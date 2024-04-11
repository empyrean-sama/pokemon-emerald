import Type from "./Constructs/ComponentType";
import GlobalComponentStore from "./Systems/GlobalComponentStore";

import CComponent from "./components/CComponent";
import CTransformComponent from "./components/CTransformComponent";

/**
 * An actor is a symbol to which multiple components are linked, 
 * it is actually the components and not the actors which actually do stuff
 */
export default class Actor {
    public readonly id = Symbol(); //? why do I need a symbol that is non serializable, maybe get me a uuid for debugging..
    constructor() {
        this.addComponent(CTransformComponent);
    }

    /**
     * This method can be used to add a component to the actor in question, simply specify which component by passing in the constructor function
     * @param componentType: the constructor function of the component to be constructed
     */
    public addComponent<T extends CComponent>(componentType: Type<T>, ...args: any[]): T {
        //Create the component in question
        const component = new componentType(this,...args);
        
        //Registering it on the global store means it will be available for all the processes inside the engine
        const globalComponentStore = GlobalComponentStore.getGlobalComponentStore();
        globalComponentStore.registerComponent(this,component);

        //Return a handle to the created component
        return component;
    }

    /**
     * Gets the component on the actor if it exists, else null
     * @param componentType: try to get this type of component on the actor
     */
    public getComponent<T extends CComponent>(componentType: Type<T>): CComponent | null {
        return GlobalComponentStore.getGlobalComponentStore().getComponent(this,componentType);
    }
}