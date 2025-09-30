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
        environment: { preset: 'warm', ambientIntensity: 0.6, backgroundColor: '#0a0a0a', groundColor: '#d8d2c7' }
    };
    Object.keys(cube.surfaces).forEach(surfaceName => {
        settings.surfaces[surfaceName] = {
            visible: true,
            color: defaults[surfaceName] || '#ffffff',
            texture: 'solid',
            orientation: (surfaceName === 'portal') ? 'down' : 'up'
        };
    });
    return settings;
}