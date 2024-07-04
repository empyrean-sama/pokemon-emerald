import CComponent,{ComponentRegistry} from "./CComponent";
import Actor from "../Actor";
import { mat4, vec2, vec3 } from "gl-matrix";
import GlobalState from "../Systems/GlobalState";

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
     */
    public setPosition(position: vec2){
        this._transform[12] = position[0];
        this._transform[13] = position[1];
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
     * Utility function to get the position
     * @return vec2 position of the actor
     */
    public getPosition(): vec2 {
        const position = mat4.getTranslation(vec3.create(),this._transform);
        return vec2.set(vec2.create(),position[0],position[1]);
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
     * @params scale: the scale to be set on this component
     */
    public setScale(scale: vec2): void {
        this._transform[0] = scale[0];
        this._transform[5] = scale[1];
    }
    /**
     * Utility method to get scale on the component
     * @returns the scale set on this component
     */
    public getScale(): vec2 {
        return vec2.set(vec2.create(), this._transform[0], this._transform[5]);
    }
    /**
     * Utility function to scale
     * @returns the component in question so that operations can be chained
     */
    public scale(scale: vec2): CTransformComponent {
        mat4.scale(this._transform, this._transform, vec3.set(vec3.create(), scale[0], scale[1], 1.0));
        return this;
    }

    /**
     * Utility function to set width on the transform component
     * ? Cannot be a property as there is no internal width property on the transform component
     * ? Width and Scale are fundamentally two different ways of viewing the same thing
     * @param width: Width to be set in pixels
     */
    public setWidth(width: number) {
        const spriteWidth = GlobalState.spriteDimensions.width;
        this.setScale(vec2.set(vec2.create(), width / spriteWidth, this.getScale()[1]));
    }
    /**
     * Utility function to get the width set on this transform component
     * ? Cannot be a property as there is no internal width property used on the transform component
     * ? Width and Scale are fundamentally two different ways of viewing the same thing
     * @returns the Width of this actor in pixels
     */
    public getWidth(): number {
        return this.getScale()[0] * GlobalState.spriteDimensions.width;
    }
    /**
     * Utility function to set height on the transform component
     * ? Cannot be a property as there is no internal height property on the transform component
     * ? Height and Scale are fundamentally two different ways of viewing the same thing
     * @param height: Height to be set in pixels
     */
    public setHeight(height: number): void {
        this.setScale(vec2.set(vec2.create(), this.getScale()[0], height / GlobalState.spriteDimensions.height));
    }
    /**
     * Utility function to set Height on the transform component
     * ? Cannot be a property as there is no internal height property on the transform component
     * ? Height and scale are fundamentally two different ways of viewing the same thing
     * @param height: Height to be set in pixels
     */
    public getHeight(): number {
        return this.getScale()[1] * GlobalState.spriteDimensions.height;
    }

    public override getComponentType(): string {
        return ComponentRegistry.CTransformComponent;
    }
    public static override getComponentType(): string {
        return ComponentRegistry.CTransformComponent;
    }
}