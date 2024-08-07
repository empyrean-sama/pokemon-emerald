import Actor from "../Actor";
import CComponent,{ComponentRegistry} from "./CComponent";
import ComponentType from "../Constructs/ComponentType";
import ScriptProcessor from "../Systems/ScriptProcessor";

/**
 * This component will allow actors to exhibit custom behavior in the world
 *? Either onStart or onTick will be called every frame.
 *? onStart will only be called on the first frame of this component existing, all subsequent frames will have onTick call
 */
export default class CScriptComponent extends CComponent {
    
    /**
     * Component specific override
     * @returns a predefined string to identify this component's type as CScriptComponent
     */
    public override getComponentType(): string {
        return ComponentRegistry.CScriptComponent;
    }

    /**
     * Component class specific override
     * @returns a predefined string to identify this component's type as CScriptComponent
     */
    public static override getComponentType(): string {
        return ComponentRegistry.CScriptComponent;
    }

    /**
     * Constructor does nothing special
     */
    constructor(actor: Actor) {
        super(actor);
    }
    
    /**
     * This method is only called once at the very beginning
     * Override this method for custom behavior
     * todo: what if onStart wanted to load something asynchronously, should I have a flag that says onStart finished.. think more about this 
     */
    public onStart() {}

    /**
     * This method is called every frame.
     * Override this method for custom behavior
     * @param delta this is the amount of time passed since the last frame
     */
    public onTick(delta: number): void {}
}

/**
 * Utility function with better intellisense support when adding a script component on an actor
 * @param actor the actor on which a script component needs to be added
 * @param scriptComponentConstructor a constructor object which will construct the required specialization of the CScriptComponent
 */
export function addScriptComponent(actor: Actor, scriptComponentConstructor: ComponentType<CScriptComponent>): CScriptComponent {
    return actor.addComponent(scriptComponentConstructor);
}