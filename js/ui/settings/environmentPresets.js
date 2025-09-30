import * as THREE from 'three';
export const PRESETS = {
    warm: { ambient: 0.6, keyColor: 0xfff0d4, keyIntensity: 0.7, fillColor: 0xd4e6ff, fillIntensity: 0.25, rimColor: 0xffe8cc, rimIntensity: 0.3 },
    bright: { ambient: 0.8, keyColor: 0xffffff, keyIntensity: 1.0, fillColor: 0xe6f2ff, fillIntensity: 0.4, rimColor: 0xfff8e6, rimIntensity: 0.2 },
    cool: { ambient: 0.4, keyColor: 0xb8d4ff, keyIntensity: 0.5, fillColor: 0x8ab0d4, fillIntensity: 0.3, rimColor: 0xc8d4ff, rimIntensity: 0.4 },
    dramatic: { ambient: 0.3, keyColor: 0xffffff, keyIntensity: 1.2, fillColor: 0x4a4a4a, fillIntensity: 0.1, rimColor: 0xffa366, rimIntensity: 0.6 }
};
export function applyPreset(sceneManager, presetId) {
    const preset = PRESETS[presetId];
    if (!preset) return;
    const scene = sceneManager.getScene();
    scene.traverse((child) => {
        if (child.isAmbientLight) {
            child.intensity = preset.ambient;
        } else if (child.isDirectionalLight) {
            // Heuristic: assume first high-intensity is key, mid is fill, low is rim
            if (child.intensity > 0.5) {
                child.color.set(preset.keyColor); child.intensity = preset.keyIntensity;
            } else if (child.intensity > 0.2) {
                child.color.set(preset.fillColor); child.intensity = preset.fillIntensity;
            } else {
                child.color.set(preset.rimColor); child.intensity = preset.rimIntensity;
            }
        }
    });
}
export function updateAmbientLight(sceneManager, intensity) {
    const scene = sceneManager.getScene();
    scene.traverse((child) => { if (child.isAmbientLight) child.intensity = intensity; });
}
export function updateBackgroundColor(sceneManager, color) {
    const scene = sceneManager.getScene();
    scene.background = new THREE.Color(color);
}