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
        environment: { 
            preset: 'warm', 
            ambientIntensity: 0.6, 
            backgroundColor: '#87ceeb', 
            groundColor: '#6fbf73',
            skybox: null, // null means use backgroundColor, otherwise 'sky_16', 'sky_17', 'sky_38'
            groundVisible: true,
            sunAzimuth: 45, // 0-360 degrees
            sunInclination: 55 // 0-90 degrees
        },
        thickness: CONSTANTS.CUBE_THICKNESS // minimum thickness
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

export function getRandomSkybox() {
    const skyboxes = ['sky_16', 'sky_17', 'sky_38'];
    return skyboxes[Math.floor(Math.random() * skyboxes.length)];
}

export function getSkyboxPreset(skyboxId) {
    const presets = {
        'sky_38': 'bright',
        'sky_17': 'dramatic',
        'sky_16': 'cool'
    };
    return presets[skyboxId] || 'warm';
}