import { CONSTANTS } from '../../config/constants.js';

export function createDefaultSettings(cube) {
    const defaults = {
        portal: '#f5e6d3',
        backdrop: '#e8d4c0',
        sky: '#d4e8f5',
        earth: '#a8c9a3',
        wing_left: '#f0d8c4',
        wing_right: '#f0d8c4'
    };
    const settings = {
        surfaces: {},
        environment: { preset: 'warm', ambientIntensity: 0.6, backgroundColor: '#87ceeb', groundColor: '#6fbf73' }
    };
    // Surfaces that can fold and are visually 'down' (horizontal) in the initial unfolded state
    const foldingSurfaces = [CONSTANTS.SURFACES.PORTAL, CONSTANTS.SURFACES.BACKDROP, CONSTANTS.SURFACES.WING_LEFT, CONSTANTS.SURFACES.WING_RIGHT];

    Object.keys(cube.surfaces).forEach(surfaceName => {
        settings.surfaces[surfaceName] = {
            visible: true,
            color: defaults[surfaceName] || '#ffffff',
            texture: 'solid',
            orientation: foldingSurfaces.includes(surfaceName) ? 'down' : 'up'
        };
    });
    return settings;
}