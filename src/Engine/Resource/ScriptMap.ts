import ComponentType from "../Constructs/ComponentType";
import CScriptComponent from "../components/CScriptComponent";

import SnekHeadScript from "../../Scripts/SnekHeadScript";
import TestActorScript from "../../Scripts/testActorScript";

const scriptMap = new Map<string,ComponentType<CScriptComponent>>();
scriptMap.set('SnekHeadScript', SnekHeadScript);
scriptMap.set('testActorScript', TestActorScript);

export default scriptMap;