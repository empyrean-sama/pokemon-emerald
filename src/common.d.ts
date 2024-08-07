declare module '*.png';
declare module '*.wgsl';
declare module '*.json';
declare module '*.ttf';

interface String {
    /**
     * Get enclosed values between a startString and an endString
     * ex- this: '@location(0)' startString: '@location(' endString: ')', output will be ['0']
     * ex- this: '@location(0) @location(1)' startString: '@location(' endString: ')', output will be ['0','1']
     * ! same data can be passed out multiple times if startString occurs more than once before the end string like ex - 
     * ! this: 'start wooly start willy end tiger' startString: 'start' endString: 'end', output will be [' wooly start willy ', ' willy ']
     * @param startString 
     * @param endString 
     */
    getEnclosedStrings(startString: string, endString: string) : Array<string>;
}