import IPackedScene from '../Scene/Interfaces/IPackedScene';

import SnekGame from '../../Scene/snek-game.json';
import SnekGameOver from '../../Scene/snek-gameover.json';
import IceCreamParlor from '../../Scene/iceCreamParlor.json';

const sceneMap = new Map<string,IPackedScene>();
sceneMap.set('SnekGame', SnekGame);
sceneMap.set('SnekGameOver', SnekGameOver);
sceneMap.set('IceCreamParlor', IceCreamParlor);

export default sceneMap;