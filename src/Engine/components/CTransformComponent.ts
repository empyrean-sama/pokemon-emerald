import CComponent,{ComponentRegistry} from "./CComponent";
import Actor from "../Actor";
import { mat4, vec2, vec3 } from "gl-matrix";

/**
 * This component is created in the actor's constructor by default.
 * Is responsible for holding the transform state of an actor (position, rotation on Z and scale)
 */
export default class CTransformComponent extends CComponent {
    //store the transformation matrix inside this component   
    private _transform: mat4;

    /**
     * The constructor initializes the component and sets up any efault values passed in
     * @param owningActor: this is the actor which owns said component
     * @param position: the position to be set, defaults to gl-matrix defaults
     * @param rotation: the rotation to be set, defaults to gl-matrix defaults
     * @param scale: the scale to be set, defaults to gl-matrix defaults
     */
    constructor(owningActor: Actor, position?: vec2, rotation?: number, scale?: vec2, zIndex?: number){
        super(owningActor);

        //Create a new transform matrix
        this._transform = mat4.create();

        //if user has set a default position,rotation or scale put it in the matrix
        if(scale){
            mat4.scale(this._transform, this._transform, vec3.set(vec3.create(), scale[0], scale[1], 1.0));
        }
        if(rotation){
            mat4.rotateZ(this._transform, this._transform, rotation);
        }
        if(position){
            mat4.translate(this._transform, this._transform, vec3.set(vec3.create(), position[0], position[1], zIndex?parseFloat(`0.${zIndex}`):0.0));
        }
    }

    /**
     * Utility function to get the model matrix
     * @returns 
     */
    public getModelMatrix(): mat4{
        return this._transform;
    }

    /**
     * Utility function to set position
     * @returns this component so that operations can be chained
     * ! NOT IMPLEMENTED
     */
    public setPosition(position: vec2){
        throw new Error('not implemented setPosition in CTransformComponent')
    }
    /**
     * Utility function to translate
     * @returns this component so that operations can be chained
     */
    public translate(translateBy: vec2): CTransformComponent {
        mat4.translate(this._transform, this._transform, vec3.set(vec3.create(), translateBy[0], translateBy[1], 0.0));
        return this;
    }

    /**
     * Utility function to set rotation in z-axis on this component 
     * @param rotation: the amount of rotation on the z axis in radians
     * ! NOT IMPLEMENTED
     */
    public setRotation(rotation: number){
        throw new Error('not implemented setRotation in CTransformComponent')
    }
    /**
     * Utility function to rotate in the z-axis
     * @param rotation: the amount of rotation on the z axis in radians
     */
    public rotate(rotation: number): CTransformComponent {
        mat4.rotateZ(this._transform, this._transform, rotation);
        return this;
    }

    /**
     * Utility method to set scale on the component
     *! NOT IMPLEMENTED
     * @returns 
     */
    public setScale(scale: vec2){
        throw new Error('setScale method not yet implemented on component CTransformComponent')
    }
    /**
     * Utility function to scale
     * @returns the component in question so that operations can be chained
     */
    public scale(scale: vec2): CTransformComponent {
        mat4.scale(this._transform, this._transform, vec3.set(vec3.create(), scale[0], scale[1], 1.0));
        return this;
    }

    public override getComponentType(): string {
        return ComponentRegistry.CTransformComponent;
    }
    public static override getComponentType(): string {
        return ComponentRegistry.CTransformComponent;
    }
}