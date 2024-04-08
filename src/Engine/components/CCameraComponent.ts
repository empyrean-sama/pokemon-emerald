import Actor from "../Actor";
import Vec2 from "../Constructs/Vec2";
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
    private _position: Vec2;
    constructor(owningActor: Actor,position?:Vec2){
        super(owningActor);
        this._position = position || new Vec2(0,0);
    }

    //Utility methods
    public setPosition(position: Vec2){
        this._position = position;
    }
    public moveBy(moveBy: Vec2){
        this._position.add(moveBy);
    }
}