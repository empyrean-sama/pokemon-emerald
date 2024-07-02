import Actor from "../Actor";
import CComponent,{ComponentRegistry} from "../components/CComponent";
import ComponentType from "../Constructs/ComponentType";

let globalComponentStore: GlobalComponentStore | null = null; 

/**
 * The global component store is a singleton class responsible for ownership over all actors and components in the world
 * This store is also responsible for providing an api to easily navigate between actors and different components
 */
export default class GlobalComponentStore {

    // map from an actor to all its components
    private _actorMap = new Map<Actor,CComponent[]>();
    
    // map from a component type string to all components of said type 
    private _componentTypeMap = new WeakMap<String,CComponent[]>();

    /**
     * The constructor is made private to force this class to be a singleton
     */
    private constructor() {};

    /**
     * The GlobalComponentStore is a singleton, this method is the only way to access an object of it
     * @returns the GlobalComponentStore singleton object
     */
    public static getGlobalComponentStore(): GlobalComponentStore {
        if(!globalComponentStore) {
            globalComponentStore = new GlobalComponentStore();
        }
        return globalComponentStore;
    }
    
    /**
     * This method registers a components in the GlobalComponentStore
     *? All components currently existing will be registered here.
     * @param actor: the actor on which this component belongs
     * @param component: the component to be registered
     * @throw Error if the actor already has a component of component.getComponentType() registered
     */
     public registerComponent(actor: Actor,component: CComponent): void {
        const componentType: string = component.getComponentType();
        const componentsOnActor = this._actorMap.get(actor);

        //Register the component
        if(componentsOnActor){
            //Actor already has some components associated to it
            if(componentsOnActor.find((c) => c.getComponentType() === componentType)) {
                //The actor already has a component of this type registered, error case.
                throw new Error(`component ${component.getComponentType()} already exists on actor ${String(actor.id)} trying to add it again`);
            }
            else{
                //Successfully add this new component into the list of components given to this actor
                componentsOnActor.push(component);
            }
        }
        else{
            //Actor has no components associated with it, create a new entry in the store and add this component in it.
            this._actorMap.set(actor,[component]);
        }

        //update the _componentType cache
        const componentTypeMap: CComponent[] | undefined = this._componentTypeMap.get(componentType);
        if(componentTypeMap) {
            componentTypeMap.push(component);
        }
        else {
            this._componentTypeMap.set(componentType, [component]);
        }
    }

    /**
     * Use this to get a component on this actor from the global store
     * @param actor : the actor on which to find a component
     * @param componentType : the type of component to find on the actor 
     * @returns a CComponent object if of type componentType available else null
     */
    public getComponent<T extends CComponent>(actor: Actor, componentType: ComponentType<T>): CComponent | null {
        const components: CComponent[] | undefined = this._actorMap.get(actor);
        if(!components) {
            throw new Error('encountered an actor not in the store, the store is expected to own all actors');
        }
        const strComponentType = componentType.getComponentType();
        return components.find((component) => component.getComponentType() === strComponentType) || null;
    }

    /**
     * This utility method returns all actors in the world
     * @returns all actors in the store
     */
    public getAllActorsInStore(): Actor[] {
        return Array.from(this._actorMap.keys());
    }

    /**
     * This method is designed to be called when an actor is getting deleted,
     * Deletes all components associated with the actor..
     *! processes implicitly believe that certain components exist on actors and may behave in an unexpected way when they don't find said components on the actor because of this method call
     *! It's too costly to implement the process method in Processor's to account for not finding a component
     * @params actor: the actor whose components have to be deleted
     * @returns a boolean indicating whether all components have been deleted successfully
     */
    public destroyActor(actor: Actor): boolean{
        return this._actorMap.delete(actor);
    }

    /**
     * Purge all actors and components from the store
     *? useful in cases like scene change
     */
    public purge(): void {
        this._actorMap.clear();
    }

    /**
     * Utility method to get all components of certain type
     * @param componentType: returns all components of type componentType
     * @returns an array containing all components which are of type componentType
     */
    public getComponents(componentType: string): CComponent[] {
        return this._componentTypeMap.get(componentType) || [];
    }
}

