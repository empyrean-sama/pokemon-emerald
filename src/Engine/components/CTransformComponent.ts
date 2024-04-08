import CComponent,{ComponentRegistry} from "./CComponent";
import Vec2 from "../Constructs/Vec2";
import Actor from "../Actor";

/**
 * This component is created in the actor's constructor by default.
 * Is responsible for holding the transform state of an actor (position, rotation on Z and scale)
 */
export default class CTransformComponent extends CComponent {
    public position: Vec2;
    public rotation: number; //radians
    public scale: Vec2;

    constructor(owningActor: Actor, position?: Vec2, rotation?: number, scale?: Vec2){
        super(owningActor);

        //Initialize the component
        this.position = position || new Vec2();
        this.rotation = rotation || 0;
        this.scale = scale || new Vec2(1,1);
    }
    
    public override getComponentType(): string {
        return ComponentRegistry.CTransformComponent;
    }
    public static override getComponentType(): string {
        return ComponentRegistry.CTransformComponent;
    }
}