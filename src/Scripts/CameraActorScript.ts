import { vec2 } from "gl-matrix";
import Actor from "../Engine/Actor";
import CCameraComponent from "../Engine/components/CCameraComponent";
import CComponent from "../Engine/components/CComponent";
import CScriptComponent from "../Engine/components/CScriptComponent";
import Input from "../Engine/Systems/Input";

export default class CameraActorScript extends CScriptComponent {
    
    private _cameraComponent: CCameraComponent | undefined;
    private _cameraSpeed: vec2 = vec2.set(vec2.create(), 1, 1);

    //Cache the camera component
    public override onStart(): void {
        const cameraComponent: CComponent | null = this.getOwningActor().getComponent(CCameraComponent);
        if(!cameraComponent) {
            console.error('no camera component attached to actor with the script CameraActorScript');
        }
        this._cameraComponent = cameraComponent as CCameraComponent;
    }

    //Move the camera component with input
    public override onTick(delta: number): void {
        const input = Input.getInput();
        if(input.isKeyPressed(Input.keyW)) {
            this._cameraComponent?.translate(vec2.set(vec2.create(), 0, this._cameraSpeed[1]));
        }
        else if(input.isKeyPressed(Input.keyS)) {
            this._cameraComponent?.translate(vec2.set(vec2.create(), 0, -this._cameraSpeed[1]));
        }
        else if(input.isKeyPressed(Input.keyA)) {
            this._cameraComponent?.translate(vec2.set(vec2.create(), -this._cameraSpeed[0], 0));
        }
        else if(input.isKeyPressed(Input.keyD)) {
            this._cameraComponent?.translate(vec2.set(vec2.create(), this._cameraSpeed[0], 0));
        }
    }
}