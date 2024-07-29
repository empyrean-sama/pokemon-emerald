import Actor from "../Actor";

export default interface IComponentType<T> extends Function 
{ 
    new (owningActor: Actor, ...args: any[]): T;
    getComponentType(): string;
}