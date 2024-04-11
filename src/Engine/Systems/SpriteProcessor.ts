import { Container, Sprite } from "pixi.js";
import Actor from "../Actor";
import CSpriteComponent from "../components/CSpriteComponent";
import GlobalComponentStore from "./GlobalComponentStore";

import Processor from "./Processor";
import CTransformComponent from "../components/CTransformComponent";
import Vec2 from "../Constructs/Vec2";
import GlobalState from "./GlobalState";
import CCameraComponent from "../components/CCameraComponent";

let spriteProcessor: SpriteProcessor | null = null;

/**
 * Singleton class to force only one world stage to exist at any given time
 */
export default class SpriteProcessor extends Processor {

    //The world stage on which all pixi sprites reside
    private _worldStage: Container | undefined = undefined; 
    
    //A Handle to the main camera component,
    //todo: revisit this when thinking about the death of an actor
    private _mainCameraComponent: CCameraComponent | null = null; 
    
    /**
     * A specific processor is a singleton
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
            const transformComponent = actor.getComponent(CTransformComponent) as CTransformComponent; //Every actor will definitely have a transform component
            const spriteComponent = actor.getComponent(CSpriteComponent) as CSpriteComponent | null;
            const cameraComponent = actor.getComponent(CCameraComponent) as CCameraComponent | null;
            
            //Move the camera to the actor location if a camera component exists and its _attach to actor flag is set to true
            if(cameraComponent && cameraComponent._attachToActor === true){
                cameraComponent.setPosition(transformComponent.position);
            }

            //If a sprite component exists, then draw it onto the screen
            if(spriteComponent) {
                //Get a handle to the underlying sprite object in Pixi world 
                const pixiSprite: Sprite = spriteComponent.getPixiSprite();
                
                //Update position in Pixi world
                let cameraAdjustedWorldCoordinates: Vec2 = new Vec2(transformComponent.position.x,transformComponent.position.y);
                if(this._mainCameraComponent){
                    //A camera exists, use it to view the world
                    cameraAdjustedWorldCoordinates = worldCoordinatesToCameraAdjustedWorldCoordinatesTransformer(transformComponent.position,this._mainCameraComponent.getPosition())
                }
                const viewCoordinates = worldToViewCoordinateTransformer(cameraAdjustedWorldCoordinates);
                pixiSprite.position = {x: viewCoordinates.x, y: viewCoordinates.y};

                //Update rotation in Pixi world
                pixiSprite.rotation = transformComponent.rotation;
            }
        });
    }

    /**
     *! Initializing can have unforeseen consequences, Its definitely a horrible idea to do it in a sprite  
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

    /**
     *? Not recommended to call this API, it is generally called internally from the CCamera component to set itself up as the main camera
     * @param cameraComponent 
     */
    public setAsMainCamera(cameraComponent: CCameraComponent){
        this._mainCameraComponent = cameraComponent;
    }
}

/**
 * This function is used to move an object in the world so that it is now being looked at the 
 * The function helps to move the world in such a way that the camera origin now lines up with the world origin
 * Inputs are not mutated in any way
 * @param worldCoordinates: world coordinates of the object in question
 * @param cameraCoordinates: camera coordinates of the main camera 
 */
function worldCoordinatesToCameraAdjustedWorldCoordinatesTransformer(worldCoordinates: Vec2, cameraCoordinates: Vec2): Vec2 { 
    return new Vec2(worldCoordinates.x - cameraCoordinates.x, worldCoordinates.y - cameraCoordinates.y);
}

/**
 * This function is used to transform world coordinates on the transform component into view coordinates required by the renderer
 * This function will not mutate the input object in any way
 * @param worldCoordinates: these are the world coordinates generally received from the transform component
 * @returns view coordinates which the renderer requires
 */
function worldToViewCoordinateTransformer(worldCoordinates: Vec2): Vec2 {
    const viewCoordinates: Vec2 = new Vec2(0,0);
    viewCoordinates.x = worldCoordinates.x + (GlobalState.viewDimensions.width / 2);
    viewCoordinates.y =  (worldCoordinates.y * -1) + (GlobalState.viewDimensions.height / 2);
    return viewCoordinates;
}