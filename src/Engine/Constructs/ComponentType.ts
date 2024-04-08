import Actor from "../Actor";

export default interface ComponentType<T> extends Function 
{ 
    new (owningActor: Actor, ...args: any[]): T;
    getComponentType(): string;
}