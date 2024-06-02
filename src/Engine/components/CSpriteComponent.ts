import Actor from "../Actor";
import SpriteProcessor from "../Systems/SpriteProcessor";
import CComponent,{ComponentRegistry} from "./CComponent";
import { vec2 } from "gl-matrix";

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
        this.topLeft = topLeft || vec2.set(vec2.create(),0,0);
        this.topRight = topRight || vec2.set(vec2.create(),1,0);
        this.bottomRight = bottomRight || vec2.set(vec2.create(),1,1);
        this.bottomLeft = bottomLeft || vec2.set(vec2.create(),0,1);
    }
}

export default class CSpriteComponent extends CComponent{
    
    //getComponentType overrides for this class to function
    public override getComponentType(): string {
        return ComponentRegistry.CSpriteComponent;
    }
    public static override getComponentType(): string {
        return ComponentRegistry.CSpriteComponent;
    }

    private _textureURL: string = '';
    private _uvCoordinatesRect: UVRect;

    constructor(owningActor: Actor, textureURL: string, uvCoordinates: UVRect) {
        //register this component on the actor
        super(owningActor);

        //fill up the component memory
        this._textureURL = textureURL;
        this._uvCoordinatesRect = uvCoordinates;

        //Sprite processor must actively monitor and draw this component to screen
        const spriteProcessor = SpriteProcessor.getProcessor();
        spriteProcessor.register(owningActor);
        spriteProcessor.submitTextureURL(this._textureURL);
    }

    /**
     * ! Not recommended to use this method outside processor, the only reason to expose this method is because typescript has no equivalent to friend.
     */
    public getTextureURL(): string {
        return this._textureURL;
    }

    /**
     * ! Not recommended to use this method outside processor, the only reason to expose this method is because typescript has no equivalent to friend.
     */
    public getUVCoordinates(): UVRect {
        return this._uvCoordinatesRect;
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