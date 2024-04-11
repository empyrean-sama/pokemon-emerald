import Actor from "../Actor";
import Vec2 from "../Constructs/Vec2";
import SpriteProcessor from "../Systems/SpriteProcessor";
import CComponent,{ComponentRegistry} from "./CComponent";

/**
 * This component can perform transformation actions on every actor in the world except the one it is attached to
 * ? what does transform actions really mean.. I mean what does zooming even mean in 2D?
 * todo: Make this component factor into SpriteProcessor
 */
export default class CCameraComponent extends CComponent {
    
    //getComponentType overrides for this class to function
    public override getComponentType(): string {
        return ComponentRegistry.CCameraComponent;
    }
    public static override getComponentType(): string {
        return ComponentRegistry.CCameraComponent;
    }

    //Create and initialize the state
    private _position: Vec2; //The positional state of this camera, its private so as to not leave handles elsewhere in the code
    public _attachToActor;  //Setting this boolean to true means the sprite processor will move this camera to where the actor's current location before applying the camera transformation
    constructor(owningActor: Actor, attachToActor: boolean = true, position: Vec2 = new Vec2(0,0)){
        super(owningActor);
        this._position = position;
        this._attachToActor = attachToActor;
    }

    //Utility methods
    public setPosition(position: Vec2){
        this._position = position;
    }
    public getPosition(): Vec2{
        return new Vec2(this._position.x,this._position.y);
    }
    public moveBy(moveBy: Vec2){
        this._position.add(moveBy);
    }

    /**
     * This function sets this camera up as the main camera from which the player views the world
     * There can only be one main camera at any given time
     * The last instance to call this method will always be the main camera going forward, no errors will be generated.
     */
    public setAsMainCamera(){
        SpriteProcessor.getProcessor().setAsMainCamera(this);
    }
}

/**
 * Utility function with better intellisense support when adding a camera component on an actor
 * @param actor the actor on which a camera component needs to be added
 * @param attachToActor should the camera move along with the actor?
 * @param position position of the camera, redundant after one process tick if attachToActor = true
 */
export function addCameraComponent(actor: Actor, attachToActor: boolean = true, position: Vec2 = new Vec2(0,0)): CCameraComponent {
    return actor.addComponent(CCameraComponent,attachToActor, position);
}