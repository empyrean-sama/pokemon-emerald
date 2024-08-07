String.prototype.getEnclosedStrings = function getEnclosedStrings(startString: string, endString: string): Array<string> {
    //Some symbols have to be escaped as they have meta meaning in a regular expression, this function should handle them
    function generateRegExp(str: String): RegExp {
        return new RegExp(str
            .replaceAll('(', '\\(')
            .replaceAll(')', '\\)') 
        ,"g");
    }

    //Generate regular expression to be used with the matchAll function
    const startRegExp = generateRegExp(startString);
    const endRegExp = generateRegExp(endString);
    
    //Use the matchAll function to find out all start locations of the give strings
    const startIndices = [...this.matchAll(new RegExp(startRegExp,"g"))].map((value) => value.index);
    const endIndices = [...this.matchAll(new RegExp(endRegExp,"g"))].map((value) => value.index);

    //Move from left to right, scoop up all answers between a start and end.. 
    let startPointer = 0;
    let endPointer = 0;
    let answers = new Array<string>();
    while(startPointer < startIndices.length && endPointer < endIndices.length) {
        const startIndex = startIndices[startPointer];
        const endIndex = endIndices[endPointer];

        if(startIndex >= endIndex) {
            endPointer++;
            continue;
        }

        answers.push(this.substring(startIndex + startString.length, endIndex));
        startPointer++;
    }

    return answers;
}