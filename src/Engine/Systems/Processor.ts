import Actor from "../Actor";

/**
 * All processor's implement the Process method, they are expected to compute the world, 
 * todo: what is the frequency with which a processor runs?
 */
export default abstract class Processor {
    
    /**
     * This method is designed to initialize the processor
     *? The method will only be called once in the engine's entire lifetime
     *? All initialize method call's will be awaited before any process method call is ever done
     *? async is the reason to use this method instead of the constructor
     */
    public async initialize(): Promise<void> {}
    
    /**
     * The main method of every Processor
     */
    public abstract process(): void; 
    
    /**
     * The concrete process is expected to implement this method and get whatever actors it needs for processing
     * @returns an array containing all actors the process is interested in
     */
    public abstract getActorsInConsideration(): Actor[];
}