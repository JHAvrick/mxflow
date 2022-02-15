import { FlowClass } from '../types/flow.types.v2';

/**
 * Generates an SVG grid or dot-pattern background.
 * 
 * @param type - The background type. Currently supported values are 'grid' or 'dots'
 * @param size - The size of the background
 * @returns 
 */
const generateBackground = (type: 'grid' | 'dots', size?: number) => {
    let bg: string = '';
    if (type === 'grid'){
        let _size = size ? size : 32;
        let _macroSize = _size * 10;
        bg = /* SVG */ `
            <defs>
                <pattern id="smallGrid" width="${_size}" height="${_size}" patternUnits="userSpaceOnUse">
                    <path class="${FlowClass.GridInner}" d="M ${_size} 0 L 0 0 0 ${_size}" fill="none" stroke="#273558" stroke-width="0.5"/>
                </pattern>
                <pattern id="grid" width="${_macroSize}" height="${_macroSize}" patternUnits="userSpaceOnUse">
                    <rect width="${_macroSize}" height="${_macroSize}" fill="url(#smallGrid)" />
                    <path class="${FlowClass.GridOuter}" d="M ${_macroSize} 0 L 0 0 0 ${_macroSize}" fill="none" stroke="#273558" stroke-width="1"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
        `
    } else {
        let _size = size ? size : 15;
        bg = /* SVG */ `
            <pattern id="mxflow-dot-pattern" x="0" y="0" width="${_size}" height="${_size}" patternUnits="userSpaceOnUse">
                <circle cx="0.4" cy="0.4" r="0.4" fill="#81818a"></circle>
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#mxflow-dot-pattern)"></rect>
        `
    }

    let className = type === 'grid' ? FlowClass.Grid : FlowClass.Dots;
    return /* SVG */ `
        <svg class="${className}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" 
            style="position:absolute; top:0; left:0; pointer-events:none; opacity:.5; display:block;'">
            ${bg}
        </svg>
    `
}

export default generateBackground;