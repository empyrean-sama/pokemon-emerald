import ComponentType from "../Constructs/ComponentType";
import CScriptComponent from "../components/CScriptComponent";

import SnekHeadScript from "../../Scripts/SnekHeadScript";
import TestActorScript from "../../Scripts/testActorScript";
import CameraActorScript from "../../Scripts/CameraActorScript";

const scriptMap = new Map<string,ComponentType<CScriptComponent>>();
scriptMap.set('SnekHeadScript', SnekHeadScript);
scriptMap.set('testActorScript', TestActorScript);
scriptMap.set('CameraActorScript', CameraActorScript);

export default scriptMap;