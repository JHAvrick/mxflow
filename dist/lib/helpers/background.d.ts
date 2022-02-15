/**
 * Generates an SVG grid or dot-pattern background.
 *
 * @param type - The background type. Currently supported values are 'grid' or 'dots'
 * @param size - The size of the background
 * @returns
 */
declare const generateBackground: (type: 'grid' | 'dots', size?: number | undefined) => string;
export default generateBackground;
