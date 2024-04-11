let input: Input | undefined = undefined; //used to enable singleton pattern in Input

/**
 * Singleton class that will allow user to work with input
 */
export default class Input {
    
    //KeyCodes specific to this engine
    public static readonly keyW: string = "KeyW";
    public static readonly keyS: string = "KeyS";
    public static readonly keyA: string = "KeyA";
    public static readonly keyD: string = "KeyD";

    //Store the state of all keys
    private keyPressedStateDictionary = new Map<string,boolean>(); 
    
    /**
     * Public API to get access to a handle of this singleton object
     * @returns a handle to the object of class Input, only one exists so this is a good way to get a handle 
     */
    public static getInput(): Input{
        if(!input){
            input = new Input();
        }
        return input;
    }

    //Private constructor to disallow construction of this class
    private constructor(){
        const self = this;
        document.addEventListener("keydown",function(e: KeyboardEvent){
            self.keyPressedStateDictionary.set(e.code,true);
        });
        document.addEventListener("keyup",function(e){
            self.keyPressedStateDictionary.set(e.code,false);
        })
    }

    /**
     * Public api to check if a certain key is pressed
     * @param keyCode these are special js world keyCodes and are defined as public static readonly variables inside this class object
     * @returns a boolean true if the key is pressed.
     */
    public isKeyPressed(keyCode: string): boolean{
        return this.keyPressedStateDictionary.get(keyCode) || false;
    }
}