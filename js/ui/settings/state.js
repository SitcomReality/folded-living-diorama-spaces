import { CONSTANTS } from '../../config/constants.js';

export function createDefaultSettings(cube) {
    const defaults = {
        [CONSTANTS.SURFACES.FRONT]: '#f5e6d3',
        [CONSTANTS.SURFACES.BACK]: '#e8d4c0',
        [CONSTANTS.SURFACES.CEILING]: '#d4e8f5',
        [CONSTANTS.SURFACES.FLOOR]: '#a8c9a3',
        [CONSTANTS.SURFACES.LEFT]: '#f0d8c4',
        [CONSTANTS.SURFACES.RIGHT]: '#f0d8c4'
    };
    const settings = {
        surfaces: {},
        environment: { preset: 'warm', ambientIntensity: 0.6, backgroundColor: '#87ceeb', groundColor: '#6fbf73' }
    };
    // Surfaces that can fold and are visually 'down' (horizontal) in the initial unfolded state
    const foldingSurfaces = [CONSTANTS.SURFACES.FRONT, CONSTANTS.SURFACES.BACK, CONSTANTS.SURFACES.LEFT, CONSTANTS.SURFACES.RIGHT];

    Object.values(CONSTANTS.SURFACES).forEach(surfaceName => {
        settings.surfaces[surfaceName] = {
            visible: true,
            color: defaults[surfaceName] || '#ffffff',
            texture: 'solid',
            orientation: foldingSurfaces.includes(surfaceName) ? 'down' : 'up'
        };
    });
    return settings;
}