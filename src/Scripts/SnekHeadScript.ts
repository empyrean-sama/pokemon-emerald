import Actor from "../Engine/Actor";
import { vec2 } from "gl-matrix";
import CScriptComponent from "../Engine/components/CScriptComponent";
import CTransformComponent from "../Engine/components/CTransformComponent";
import Input from "../Engine/Systems/Input";
import { addSpriteComponent } from "../Engine/components/CSpriteComponent";
// import snekBodyTexture from '../img/snek-body.png'
import GlobalState from "../Engine/Systems/GlobalState";

//! this is BROKEN

export default class SnekHeadScript extends CScriptComponent {
    
    private _speed = 0.3;
    private _velocity: vec2 = vec2.set(vec2.create(), this._speed, 0);
    private _boardPosition: vec2 = vec2.set(vec2.create(), 0, 0);

    private _bodyParts: Actor[] = [this.getOwningActor()]; 

    public override onStart(): void {
        this.addBodyPart();
        this.addBodyPart();
        this.addBodyPart();
    }

    public override onTick(): void {
        //Handle input to set the velocity of the head; clockwise precedence of keys
        const input = Input.getInput();
        if(input.isKeyPressed(Input.keyW) && this._velocity[1] >= 0) {
            this._velocity = vec2.set(vec2.create(), 0, 1*this._speed);
        }
        else if(input.isKeyPressed(Input.keyD) && this._velocity[0] >= 0) {
            this._velocity = vec2.set(vec2.create(), 1*this._speed, 0);
        }
        else if(input.isKeyPressed(Input.keyS) && this._velocity[1] <= 0) {
            this._velocity = vec2.set(vec2.create(), 0, -1*this._speed);
        }
        else if(input.isKeyPressed(Input.keyA) && this._velocity[0] <= 0) {
            this._velocity = vec2.set(vec2.create(), -1*this._speed, 0);
        }
        this._boardPosition = vec2.add(this._boardPosition, this._velocity, this._boardPosition);
        
        //Update the position of the snek if necessary
        if(!vec2.equals(this.getOwningActor().getTransformComponent().getPosition(), this.boardCoordToWorldCoord(this._boardPosition))) {
            //snek head can move, update the entire snek
            for(let i=this._bodyParts.length-1; i>0; i--) {
                this._bodyParts[i].getTransformComponent().setPosition(this._bodyParts[i-1].getTransformComponent().getPosition());
            }
            this.getOwningActor().getTransformComponent().setPosition(this.boardCoordToWorldCoord(this._boardPosition));
        }

        //todo: Check if snek head is colliding with the walls
        let gameOver = false;
        const worldCoords = this.boardCoordToWorldCoord(this._boardPosition);
        if(worldCoords[0] > GlobalState.viewDimensions.width / 2 || worldCoords[1] > GlobalState.viewDimensions.height / 2 || 
           worldCoords[0] < -GlobalState.viewDimensions.width /2 || worldCoords[1] < -GlobalState.viewDimensions.height /2 ) {
            if(!gameOver)
            console.log('game over');
        }

        //todo: Check if snek head is colliding with the body
        
    }

    private addBodyPart() {
        const bodyPart = new Actor();
        const bodyPartTransform: CTransformComponent = bodyPart.getComponent(CTransformComponent) as CTransformComponent;
        addSpriteComponent(bodyPart, 'placeholder'); //! this is a broken script 
       
        const lastBodyPart: Actor = this._bodyParts[this._bodyParts.length -1];
        const lastBodyPartPosition = (lastBodyPart.getComponent(CTransformComponent) as CTransformComponent).getPosition(); 
        const lastPosition = vec2.set(vec2.create(), lastBodyPartPosition[0], lastBodyPartPosition[1]); 
       
        bodyPartTransform.translate(vec2.set(vec2.create(),lastPosition[0] - GlobalState.spriteDimensions.width, lastPosition[1]));
        this._bodyParts.push(bodyPart);
    }

    private boardCoordToWorldCoord(boardPosition: vec2): vec2 {
        const position = vec2.set(vec2.create(), Math.floor(boardPosition[0]), Math.floor(boardPosition[1]));
        return vec2.set(position, position[0] * GlobalState.spriteDimensions.width, position[1] * GlobalState.spriteDimensions.height);
    }
}