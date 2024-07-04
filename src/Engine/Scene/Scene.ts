import { vec2 } from "gl-matrix";
import { addSpriteComponent, UVRect } from "../components/CSpriteComponent";
import imageMap from "../Resource/ImageMap";
import sceneMap from "../Resource/SceneMap";
import SpriteProcessor from "../Systems/SpriteProcessor";
import IPackedScene from "./Interfaces/IPackedScene";
import IPackedSceneLayer, { EnumPackedSceneLayerType, IPackedSceneTileLayer } from "./Interfaces/IPackedSceneLayer";
import IPackedTileset from "./Interfaces/IPackedTileset";
import Actor from "../Actor";

/**
 * Destroy everything in the world, then repopulate it from a scene file using this method
 * @param sceneFile: this is a JSON file generated by TILED that describes how a multiplicity of actors are to be instantiated 
 */
export default function loadScene(sceneName: string): void {
    const packedScene: IPackedScene | undefined = sceneMap.get(sceneName);
    if(!packedScene) {
        throw new Error(`${sceneName} does not exist in sceneMap: ${sceneMap}`);
    }

    const spriteProcessor = SpriteProcessor.getProcessor();
    const gidUVRectMap = new Map<number, UVRect>();
    const gidTextureURLMap = new Map<number,string>();

    const packedSceneWidth = packedScene.width * packedScene.tilewidth;
    const packedSceneHeight = packedScene.height * packedScene.tileheight;

    //Process all tilesets and get them ready
    packedScene.tilesets.forEach((tileset: IPackedTileset) => {
        const imageURL = tileset.image.split('\/').at(-1)?.split('.').at(0) as string;
        const textureResourceURL: string | undefined = imageMap.get(imageURL);

        if(!textureResourceURL) {
            throw new Error(`${imageURL} not found in imageMap, check if the resource is registered`);
        }

        //Submit texture to the sprite processor 
        spriteProcessor.submitTextureURL(textureResourceURL);

        //Fill the gid map
        let xPointer = 0;
        let yPointer = 0;
        let columnCounter = 1;
        for(let i=0; i<tileset.tilecount; i++) {
            if(columnCounter > tileset.columns) {
                columnCounter = 1;
                yPointer += tileset.tileheight;
                xPointer = 0;
            }
            const gid = i + tileset.firstgid;
            gidUVRectMap.set(gid, new UVRect(
                vec2.set(vec2.create(), xPointer / tileset.imagewidth, yPointer / tileset.imageheight),
                vec2.set(vec2.create(), (xPointer + tileset.tilewidth) / tileset.imagewidth, yPointer / tileset.imageheight),
                vec2.set(vec2.create(), xPointer / tileset.imagewidth, (yPointer + tileset.tileheight) / tileset.imageheight),
                vec2.set(vec2.create(), (xPointer + tileset.tilewidth) / tileset.imagewidth, (yPointer + tileset.tileheight) / tileset.imageheight)
            ));
            gidTextureURLMap.set(gid, textureResourceURL);
            xPointer += tileset.tilewidth;
            columnCounter++;
        }
    })

    //Process each layer and instantiate actors
    const layerTopLeft = vec2.set(vec2.create(), -1 * (packedSceneWidth/2), packedSceneHeight/2);
    packedScene.layers.forEach((layer: IPackedSceneLayer) => {
        if(layer.type === EnumPackedSceneLayerType.TileLayer) {
            const tileLayer: IPackedSceneTileLayer = layer as IPackedSceneTileLayer;
            const columns = tileLayer.width;
            tileLayer.data.forEach((gid: number, index: number) => {

                if(gid === 0) {
                    //0 is an invalid gid to process as it denotes empty
                    return;
                }

                const rowNumber = Math.floor(index / columns);
                const columnNumber = index % columns;
                
                //Configure the transform component
                const actor = new Actor();
                const transformComponent = actor.getTransformComponent();
                transformComponent.setWidth(packedScene.tilewidth);
                transformComponent.setHeight(packedScene.tileheight);
                transformComponent.setPosition(vec2.set(vec2.create(),
                    layerTopLeft[0] + (columnNumber * packedScene.tilewidth),
                    layerTopLeft[1] - (rowNumber * packedScene.tileheight)
                ));

                //Configure the sprite component
                const gidTextureURL = gidTextureURLMap.get(gid);
                const gidUVRect = gidUVRectMap.get(gid);
                if(!gidTextureURL) {
                    throw new Error(`did not find textureURL for gid: ${gid}`);
                }
                if(!gidUVRect) {
                    throw new Error(`did not find UVRect for gid: ${gid}`);
                }
                addSpriteComponent(actor, gidTextureURL, gidUVRect);
            })
        }
        else if (layer.type === EnumPackedSceneLayerType.ObjectGroup) {

        }
        else {
            throw new Error(`encountered ${layer.type} layer while loading the scene, this is not supported in the engine`);
        }
    });
}