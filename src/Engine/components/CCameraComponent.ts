import { mat4, vec2, vec3 } from "gl-matrix";
import Actor from "../Actor";
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

    //State inside this component
    private _viewMatrix: mat4; //this is the view matrix which the camera is expected to give the SpriteProcessor
    public _attachToActor;  //Setting this boolean to true means the sprite processor will move this camera to where the actor's current location before applying the camera transformation
    
    /**
     * Initialize the component and set up defaults if passed in
     * @param owningActor: the actor which owns this component
     * @param attachToActor: if true will ask spriteProcessor to override the transform to match the actor transform 
     * @param position: position of this camera component in this world, gl-matrix defaults if not provided
     * @param rotation: rotation of this camera component in this world, gl-matrix defaults if not provided
     * @param scale: zoom of the camera in this world, gl-matrix defaults if not provided
     */
    constructor(owningActor: Actor, attachToActor = false, position?: vec2, rotation?: number, scale?: vec2) {
        super(owningActor);
        this._viewMatrix = mat4.create(); //a new matrix to serve as the view matrix
        this._attachToActor = attachToActor;

        //set up the position, rotation and scale if passed in
        if(position)
        {
            const posVec = vec3.set(vec3.create(),position[0] || 0.0,position[1] || 0.0, 0.0);
            mat4.translate(this._viewMatrix,this._viewMatrix, posVec);
        }
        if(rotation)
        {
            mat4.rotate(this._viewMatrix, this._viewMatrix, rotation,vec3.set(vec3.create(),0,0,1));
        }
        if(scale)
        {
            const scaleVec = vec3.set(vec3.create(),scale[0] || 0.0, scale[1] || 0.0, 1.0);
            mat4.scale(this._viewMatrix, this._viewMatrix, scaleVec);
        }
    }

    /**
     * Utility method to get the view matrix from this component
     * @returns the view matrix from this component
     */
    public getViewMatrix(): mat4 {
        return this._viewMatrix;
    }

    /**
     * Utility function to set camera component position
     * ! NOT IMPLEMENTED
     */
    public setPosition(position: vec2): CCameraComponent{
        throw new Error('setPosition is not yet implemented in CCameraComponent');
    }
    /**
     * Utility function to translate the camera
     */
    public translate(translateBy: vec2): CCameraComponent {
        const posVec = vec3.set(vec3.create(),translateBy[0],translateBy[1],0.0);
        mat4.translate(this._viewMatrix,this._viewMatrix,posVec);
        return this;
    }

    /**
     * This function sets this camera up as the main camera from which the player views the world
     * There can only be one main camera at any given time
     * The last instance to call this method will always be the main camera going forward, no errors will be generated.
     */
    public setAsMainCamera(){
        SpriteProcessor.getProcessor().setMainCamera(this);
    }
}

/**
 * Utility function with better intellisense support when adding a camera component on an actor
 * @param actor the actor on which a camera component needs to be added
 * @param attachToActor should the camera move along with the actor?
 * @param position position of the camera, (0,0) default also redundant after one process tick if attachToActor = true
 */
export function addCameraComponent(actor: Actor, attachToActor: boolean = true, position?: vec2): CCameraComponent {
    return actor.addComponent(CCameraComponent,attachToActor, position || vec2.create());
}