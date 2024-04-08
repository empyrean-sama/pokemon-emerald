import Actor from "../Actor";
import CComponent,{ComponentRegistry} from "../components/CComponent";
import ComponentType from "../Constructs/ComponentType";

let globalComponentStore: GlobalComponentStore | null = null; 

export default class GlobalComponentStore {

    //This is the heart of this class, a map holding all components of every actor in the level
    private componentStore = new Map<Actor,CComponent[]>();  //todo: think about using a weak map here in the future
    
    private constructor() {};
    public static getGlobalComponentStore() {
        if(!globalComponentStore) {
            globalComponentStore = new GlobalComponentStore();
        }
        return globalComponentStore;
    }
    
    public registerComponent(actor: Actor,component: CComponent): void {
        const componentType: string = component.getComponentType();
        const componentsOnActor = this.componentStore.get(actor);

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
            this.componentStore.set(actor,[component]);
        }
    }

    /**
     * Use this to get a component on this actor from the global store
     * @param actor 
     * @param componentType 
     */
    public getComponent<T extends CComponent>(actor: Actor, componentType: ComponentType<T>){
        
        const componentsList: CComponent[] | undefined = this.componentStore.get(actor);
        if(componentsList) {
            const strComponentType = componentType.getComponentType();
            return componentsList.find((component) => component.getComponentType() === strComponentType) || null;
        }
        throw new Error('encountered an actor not in the store, all actors are expected to have entries in the store thanks to all of them having the transform component');
    }

    /**
     * This method definitely returns all actors in the scene as all actors at least have the transform component registered here
     * @returns all actors in the store
     */
    public getAllActorsInStore(): Actor[] {
        return Array.from(this.componentStore.keys());
    }
}

