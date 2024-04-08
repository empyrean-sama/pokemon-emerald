/**
 * All processor's implement the Process method, they are expected to compute the world, 
 * The frequency with which they run is to be finalized
 */
export default abstract class Processor {
    public abstract Process(): void;
}