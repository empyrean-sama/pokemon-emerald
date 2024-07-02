import bunnyURL from '../../Image/bunny.png';
import exteriorURL from '../../Image/exterior.png';
import gameOverImageURL from '../../Image/game-over-image.png';
import maleHeroURL from '../../Image/male-hero.png';
import npcsURL from '../../Image/npcs.png';
import snekTilesetURL from '../../Image/snek-tileset.png';
import iceCreamShopLayer1TilesetURL from '../../Image/Tileset/Ice_Cream_Shop_Design_layer_1.png';
import iceCreamShopLayer2TilesetURL from '../../Image/Tileset/Ice_Cream_Shop_Design_layer_2.png';
import iceCreamShopLayer3TilesetURL from '../../Image/Tileset/Ice_Cream_Shop_Design_layer_3.png';

const imageMap = new Map<string,string>();
imageMap.set('bunny', bunnyURL);
imageMap.set('exterior', exteriorURL);
imageMap.set('game-over-image', gameOverImageURL);
imageMap.set('male-hero', maleHeroURL);
imageMap.set('npcs', npcsURL);
imageMap.set('snek-tileset', snekTilesetURL);
imageMap.set('Ice_Cream_Shop_Design_layer_1', iceCreamShopLayer1TilesetURL);
imageMap.set('Ice_Cream_Shop_Design_layer_2', iceCreamShopLayer2TilesetURL);
imageMap.set('Ice_Cream_Shop_Design_layer_3', iceCreamShopLayer3TilesetURL);

export default imageMap;