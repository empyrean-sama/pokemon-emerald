import { Container, Sprite } from "pixi.js";
import Actor from "../Actor";
import CSpriteComponent from "../components/CSpriteComponent";
import GlobalComponentStore from "./GlobalComponentStore";

import Processor from "./Processor";
import CTransformComponent from "../components/CTransformComponent";

let spriteProcessor: SpriteProcessor | null = null;

/**
 * Singleton class to force only one world stage to exist at any given time
 */
export default class SpriteProcessor extends Processor {

    private _worldStage: Container | undefined = undefined;

    /**
     * Developer must not be allowed to construct a sprite processor, its a singleton
     */
    private constructor(){
        super();
    }

    /**
     * Use this method to get a handle to the sprite processor
     * @returns The sprite processor on this engine
     */
    public static getProcessor(): SpriteProcessor {
        if(!spriteProcessor){
            spriteProcessor = new SpriteProcessor();
        }
        return spriteProcessor; 
    }

    public override Process(): void {
        if(!this._worldStage){
            throw new Error('Cannot process since the sprite processor is not initialized');
        }

        // Try start processing
        const globalStore = GlobalComponentStore.getGlobalComponentStore();
        globalStore.getAllActorsInStore().forEach((actor: Actor) => {
            const spriteComponent = actor.getComponent(CSpriteComponent) as CSpriteComponent;
            const transformComponent = actor.getComponent(CTransformComponent) as CTransformComponent;
            if(spriteComponent){
                const pixiSprite: Sprite = spriteComponent.getPixiSprite();
                pixiSprite.position = {x: transformComponent.position.x, y: transformComponent.position.y};
                pixiSprite.rotation = transformComponent.rotation;
            }
        });
    }

    /**
     *! initializing can have unforeseen consequences, Its definitely a horrible idea to do it in a sprite  
     */
    public initializeSpriteProcessor(worldStage: Container){
        this._worldStage = worldStage;
    }

    /**
     * Api to add in a new sprite into the world stage, this is something definitely done in the sprite component
     */
    public addIntoWorldStage(sprite: Sprite){
        if(!this._worldStage){
            throw new Error('Cannot addIntoWorldStage since the sprite processor is not initialized');
        }
        this._worldStage.addChild(sprite);
    }
}