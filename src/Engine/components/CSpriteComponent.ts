import { vec2 } from "gl-matrix";

import Actor from "../Actor";
import CComponent,{ EComponentType } from "./CComponent";
import { RenderingState } from "../rendering/Rendering";

export class UVRect {
    public topLeft: vec2;
    public topRight: vec2;
    public bottomRight: vec2;
    public bottomLeft: vec2;

    /**
     * Constructor function creates this structure, 
     * the default is using the whole texture as per webGPU, which means top left is 0,0
     * @param topLeft : top left uv coordinate
     * @param topRight : top right uv coordinate
     * @param bottomLeft : bottom left uv coordinate
     * @param bottomRight : bottom right uv coordinate
     */
    constructor(topLeft?: vec2, topRight?: vec2, bottomLeft?: vec2, bottomRight?: vec2) {
        this.topLeft = topLeft || vec2.set(vec2.create(), 0, 0);
        this.topRight = topRight || vec2.set(vec2.create(), 1, 0);
        this.bottomRight = bottomRight || vec2.set(vec2.create(), 1, 1);
        this.bottomLeft = bottomLeft || vec2.set(vec2.create(), 0, 1);
    }

    public getCopy(): UVRect {
        const newTopLeft        = vec2.set(vec2.create(), this.topLeft[0],      this.topLeft[1]);
        const newTopRight       = vec2.set(vec2.create(), this.topRight[0],     this.topRight[1]);
        const newBottomLeft     = vec2.set(vec2.create(), this.bottomLeft[0],   this.bottomLeft[1]);
        const newBottomRight    = vec2.set(vec2.create(), this.bottomRight[0],  this.bottomRight[1]);
        return new UVRect(newTopLeft, newTopRight, newBottomLeft, newBottomRight);
    }

    /**
     * Copy all the values from another UVRect to this
     * @param uvRect: another uvRect to copy values from
     */
    public copyFrom(uvRect: UVRect) {
        this.topLeft        = vec2.set(vec2.create(), uvRect.topLeft[0],      uvRect.topLeft[1]);
        this.topRight       = vec2.set(vec2.create(), uvRect.topRight[0],     uvRect.topRight[1]);
        this.bottomLeft     = vec2.set(vec2.create(), uvRect.bottomLeft[0],   uvRect.bottomLeft[1]);
        this.bottomRight    = vec2.set(vec2.create(), uvRect.bottomRight[0],  uvRect.bottomRight[1]);
    }
}

export default class CSpriteComponent extends CComponent{
    
    public override getComponentType(): EComponentType {
        return EComponentType.CSpriteComponent;
    }
    public static override getComponentType(): EComponentType {
        return EComponentType.CSpriteComponent;
    }

    private _textureURL: string;
    private _uvCoordinatesRect: UVRect;

    /**
     * Construct a CSpriteComponent
     * @param owningActor is the actor to which this component is attached
     * @param textureURL is the url of the texture this component is to display
     * @param uvCoordinates are coordinates inside the texture that make up this sprite to be displayed
     */
    constructor(owningActor: Actor, textureURL: string, uvCoordinates?: UVRect) {
        //register this component on the actor
        super(owningActor);

        //fill up the component memory
        this._textureURL = textureURL;
        this._uvCoordinatesRect = uvCoordinates || new UVRect();

        //Submit the textureURL for RenderingState to process
        RenderingState.submitTextureURL(textureURL);
    }

    /**
     * Utility function to get the textureURL held by this component
     * @returns the textureURL which is held by the spriteComponent
     */
    public getTextureURL(): string {
        return this._textureURL;
    }

    /**
     * Function to set the textureURL
     */
    public setTextureURL(textureURL: string) {
        this._textureURL = textureURL;
        RenderingState.submitTextureURL(textureURL);
    }

    /**
     * Get a copy of the UVCoordinates stored inside this component
     * @returns a copy of the UVCoordinates stored inside the CSpriteComponent
     */
    public getUVCoordinates(): UVRect {
        return this._uvCoordinatesRect.getCopy();
    }

    /**
     * Set the UVCoordinates stored in this component
     * @param uvRect: the structure from which data needs to be copied 
     */
    public setUVCoordinates(uvRect: UVRect): void {
        this._uvCoordinatesRect.copyFrom(uvRect);
    }
}

/**
 * A utility function which adds a sprite component on an actor
 * @param actor the actor on which this component needs to be added
 * @param textureURL the url of the texture used in this sprite
 * @param uvCoordinates the uvCoordinates of the sprite inside the texture, if passed in something falsey, the default is using the whole texture
 */
export function addSpriteComponent(actor: Actor, textureURL: string, uvCoordinates?: UVRect) {
    actor.addComponent(CSpriteComponent, textureURL, uvCoordinates || new UVRect());
}