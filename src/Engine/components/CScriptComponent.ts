import Actor from "../Actor";
import CComponent,{ComponentRegistry} from "./CComponent";

/**
 * This component is responsible for an actors actions in the world
 * The onStart method is processed once when this script component is attached; no implicit guarantee on when its attached as of now
 * The onProcess method is called once every frame and delta is passed into it 
 */
export default class CScriptComponent extends CComponent {
    
    //getComponentType overrides for this class to function
    public override getComponentType(): string {
        return ComponentRegistry.CScriptComponent;
    }
    public static override getComponentType(): string {
        return ComponentRegistry.CScriptComponent;
    }

    //Create and initialize the state
    private _onStart: (me: Actor) => void;
    private _onProcess: (me: Actor, delta: number) => void;
    constructor(owningActor: Actor, onStart?: (me: Actor) => void, onProcess?:(me: Actor, delta: number) => void){
        super(owningActor);
        this._onStart = onStart || ((me: Actor) => {})
        this._onProcess = onProcess || ((me: Actor, delta: number) => {})
    }

    /**
     * Public api for the process to call onStart
     */
    public onStart(me: Actor){
        this._onStart(me);
    }

    /**
     * Public api for the process to call onProcess
     * @param delta 
     */
    public onProcess(me: Actor, delta: number){
        this._onProcess(me,delta);
    }
}

/**
 * Utility function with better intellisense support when adding a script component on an actor
 * @param actor the actor on which a script component needs to be added
 * @param onStart the onStart function to be called
 * @param onProcess the onProcess function to be called
 */
export function addScriptComponent(actor: Actor, onStart?: () => void, onProcess?: (me: Actor, delta: number) => void){
    actor.addComponent(CScriptComponent,onStart,onProcess);
}