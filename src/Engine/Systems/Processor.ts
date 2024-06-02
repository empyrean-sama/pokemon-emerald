import Actor from "../Actor";

/**
 * All processor's implement the Process method, they are expected to compute the world, 
 * todo: what is the frequency with which a processor runs?
 */
export default abstract class Processor {
    /**
     * The main method of every Processor
     */
    public abstract process(): void; 
    
    protected _actorsInConsideration = new Set<Actor>();
    /**
     * Processor's cannot process all actors in the scene, the architecture calls for too many of them, this is a way of telling the processor to worry about this given actor 
     */
    public register(actor: Actor): void {
        if(this._actorsInConsideration.has(actor)){
            console.warn(`trying to register the actor ${actor.id.toString()} twice, ignoring the second attempt at registration`);
        }
        else{
            this._actorsInConsideration.add(actor);
        }
    }
    /**
     * Todo: the death of an actor or component is not planned as of now, revisit this method when doing that
     */
    public unRegister(actor: Actor){}
}