/**
 * Generates HTML for an SVG grid or dot-pattern background. Can be passes to `setBackground()` on mxflow instance.
 * Especially useful when creating multiple backgrounds for different scales.
 *
 * @param type - The background type. Currently supported values are 'grid' or 'dots'
 * @param size - The size of the background
 * @param radius - If `type=dots`, the radius of each individual dot
 * @returns
 */
declare const generateBackground: (type: 'grid' | 'dots', size?: number, radius?: number) => string;
export default generateBackground;
