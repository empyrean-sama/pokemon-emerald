
/**
 * Mathematical Vector2
 */
export default class Vec2{
    public x;
    public y;
    constructor(x?: number,y?: number){
        this.x = x || 0;
        this.y = y || 0;
    }

    public add(vector: Vec2){
        this.x += vector.x;
        this.y += vector.y;
    }
}