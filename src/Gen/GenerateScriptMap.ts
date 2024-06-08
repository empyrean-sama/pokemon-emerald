import path from "path";
import FS from "fs";

/**
 *! The engine architecture requires all scripts to be included when main.ts is built.
 * This script is designed to generate a Typescript file which will export a mapping to all script classes defined in the Scripts folder.
 *? The generated file is scriptLoader.ts and will be placed in src/Engine
 *? process.cwd() is expected to be the root of this project.  
 */
(async function(){
    const destinationPath = path.join(process.cwd(),"src/Engine/scriptMap.ts");
    const scriptsFolder = path.join(process.cwd(), 'src/Scripts');

    //Build a list of all script files recursively
    const scriptFilesDetected: string[] = [];
    const directoryPathStack = [scriptsFolder];
    while(directoryPathStack.length > 0) {
        const directoryPath: string = directoryPathStack.pop()!;
        FS.readdirSync(directoryPath).forEach((dirItem: string) => {
            const absoluteItemPath = path.join(directoryPath, dirItem);
            if(FS.statSync(absoluteItemPath).isDirectory()) {
                directoryPathStack.push(absoluteItemPath);
            }
            else {
                //! detected a file, can be any file.. beware of binary files as they definitely will behave funny
                //todo: add more sanity checks to determine that this definitely is a script file..
                scriptFilesDetected.push(absoluteItemPath);
            }
        })         
    }

    const scriptLoader = `
// *** THIS IS A GENERATED FILE, DON'T MODIFY THIS MANUALLY ***
import CScriptComponent from './components/CScriptComponent';
import Type from './Constructs/ComponentType'

${
    scriptFilesDetected.map((scriptFilePath) => {
        const fileName: string = path.basename(scriptFilePath);
        return `import ${fileName.split('.')[0]} from '../Scripts/${scriptFilePath.split("Scripts\\")[1].split('.')[0].replaceAll('\\','/')}';`
    }).join('\n')
}

const scriptMap = new Map<string,Type<CScriptComponent>>();

${
    scriptFilesDetected.map((scriptFilePath) => {
        const fileName: string = path.basename(scriptFilePath);
        return `scriptMap.set('${fileName.split('.')[0]}',${fileName.split('.')[0]});`;
    }).join('\n')
}

export default scriptMap;
`;

    FS.writeFileSync(destinationPath,scriptLoader)
})()
