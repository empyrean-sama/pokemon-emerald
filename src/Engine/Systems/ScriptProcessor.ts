import Actor from "../Actor";
import CScriptComponent from "../components/CScriptComponent";
import Processor from "./Processor";

let scriptProcessor: ScriptProcessor | null = null;

export default class ScriptProcessor extends Processor {
    /**
     * All Processors are singletons
     */
    private constructor(){
        super();
    }

    /**
     * Use this method to get a handle to the sprite processor
     * @returns The sprite processor on this engine
     */
    public static getProcessor(): ScriptProcessor {
        if(!scriptProcessor){
            scriptProcessor = new ScriptProcessor();
        }
        return scriptProcessor; 
    }
    
    // This stack is a collection of objects on which onStart needs to be called, the stack is checked once every process call
    private _onStartFinishedList: WeakSet<CScriptComponent> = new WeakSet<CScriptComponent>();

    /**
     * Iterate through all CScriptComponents and try calling onTick function, if OnStart is not yet called once, then try calling onStart instead
     */
    public override process(): void {
        this._actorsInConsideration.forEach((actor: Actor) => {
            const scriptComponent: CScriptComponent = actor.getComponent(CScriptComponent) as CScriptComponent;
            
            if(this._onStartFinishedList.has(scriptComponent) === false){
                scriptComponent.onStart();
                this._onStartFinishedList.add(scriptComponent);
            }
            else{
                scriptComponent.onTick(1); //todo: pass in correct delta
            }
        });
    }
}