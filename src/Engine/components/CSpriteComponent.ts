import Actor from "../Actor";
import SpriteProcessor from "../Systems/SpriteProcessor";
import CComponent,{ComponentRegistry} from "./CComponent";
import { Assets,Sprite,Texture } from "pixi.js";

export default class CSpriteComponent extends CComponent{
    
    //getComponentType overrides for this class to function
    public override getComponentType(): string {
        return ComponentRegistry.CSpriteComponent;
    }
    public static override getComponentType(): string {
        return ComponentRegistry.CSpriteComponent;
    }

    //Create and initialize the state
    private _sprite: Sprite;
    constructor(owningActor: Actor, sprite: Sprite) {
        super(owningActor);
        this._sprite = sprite;
        
        //Add the Pixi sprite to be processed
        const spriteProcessor: SpriteProcessor = SpriteProcessor.getProcessor();
        spriteProcessor.addIntoWorldStage(sprite);
    }

    /**
     * ! DON'T use this method outside processor, the only reason to expose this method is because typescript has no equivalent to friend. Pixi.js's version of sprite should not be used in this engine and wrappers need to be constructed wherever required, failing this will mean type problems and an inability to change renderer's in the future
     */
    public getPixiSprite(): Sprite{
        return this._sprite;
    }
}

/**
 * An async utility function which adds a sprite component on an actor
 * @param actor the actor on which this component needs to be added
 * @param spriteResourcePath the resource path to the image used by this sprite
 */
export async function addSpriteComponent(actor: Actor, spriteResourcePath: string){
    const texture: Texture = await Assets.load(spriteResourcePath);
    const sprite: Sprite = new Sprite(texture);
    actor.addComponent(CSpriteComponent,sprite);
}