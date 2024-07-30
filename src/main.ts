import settings from './Engine/Settings.json';
import { strDebugMode } from './Engine/Constants';

import { resizeCanvasTo4XSize } from "./setupViewSizeControlPanel";

/**
 * Entry point for the entire engine
 */
(function(){
    if(settings.mode === strDebugMode) {
        resizeCanvasTo4XSize();
    }

    


})();