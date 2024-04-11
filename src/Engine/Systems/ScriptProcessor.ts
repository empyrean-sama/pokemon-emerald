import Actor from "../Actor";
import CScriptComponent from "../components/CScriptComponent";
import GlobalComponentStore from "./GlobalComponentStore";
import GlobalState from "./GlobalState";
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

    /**
     * This member is used to keep track of all the onStart calls already made
     */
    private componentsWhoseOnStartWasCalled = new WeakSet<CScriptComponent>();

    public override Process(): void {
        const globalStore = GlobalComponentStore.getGlobalComponentStore();
        globalStore.getAllActorsInStore().forEach((actor: Actor) => {
            const scriptComponent = actor.getComponent(CScriptComponent) as CScriptComponent | null;
            if(scriptComponent)
            {
                if(!this.componentsWhoseOnStartWasCalled.has(scriptComponent)){
                    //must call on start on this component
                    scriptComponent.onStart(actor);
                    this.componentsWhoseOnStartWasCalled.add(scriptComponent); //onStart will only be called once
                }
                scriptComponent.onProcess(actor,GlobalState.delta);
            }
        });
    }
}