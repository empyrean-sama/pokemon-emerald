import Actor from "../Engine/Actor";
import CScriptComponent from "../Engine/components/CScriptComponent";

export default class TestActorScript extends CScriptComponent {
    
    private _timeElapsed: number = 0;
    
    constructor(actor: Actor) {
        super(actor);
        console.log('test actor script created');
    }

    public override onStart(): void {
        console.log('initialization called for testActorScript');
    }

    public override onTick(delta: number): void {
        this._timeElapsed += delta;
        console.log(`time elapsed: ${this._timeElapsed}`);
    }
}