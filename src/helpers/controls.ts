import * as FlowTypes from 'types/flow.types.v2';

// Figma




/**
    Pan - (wheel and shift+wheel), wheelclick
    Zoom - ctrl + wheel
    Select - primary
    MultiSelect - shift + primary
    Lasso - primary (on graph), ctrl+primary (on entity)
    Context - secondary
 */
const FigmaScheme = <const> {
    panButton: 1,
    panModifier: false,
    panOnWheel: true,
    zoomOnWheelModifier: 'Ctrl',
    zoomOnWheel: true,
    zoomOnPinch: true,
    zoomOnDoubleClick: false,
    selectButton: 0,
    multiSelectModifier: 'Shift',
    lassoModifier: false,
    lassoButton: 0
}

/**
    Pan - wheelclick
    Zoom - wheel
    Select - primary
    MultiSelect - shift + primary
    Lasso - primary
    Context - secondary
 */
const BlenderScheme = <const> {
    panButton: 1,
    panModifier: false,
    panOnWheel: false,
    zoomOnWheelModifier: false,
    zoomOnWheel: true,
    zoomOnPinch: true,
    zoomOnDoubleClick: false,
    selectButton: 0,
    multiSelectModifier: 'Shift',
    lassoModifier: false,
    lassoButton: 0
}

const Schemes : { [key:string]: FlowTypes.ControlOptions } = {
    figma: FigmaScheme,
    blender: BlenderScheme
}

const getControlScheme = (name: string) : FlowTypes.ControlOptions => {
    if (Schemes[name]){
        return Schemes[name];
    }
    throw new Error(`getControlScheme(): No control scheme found with name "${name}".`);
}

export default getControlScheme;