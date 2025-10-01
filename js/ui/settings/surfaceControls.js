import * as THREE from 'three';
import { CONSTANTS } from '../../config/constants.js';

export function toggleVisibility(cube, settings, surfaceName) {
    const surface = cube.surfaces[surfaceName];
    if (!surface) return;
    const s = settings.surfaces[surfaceName];
    s.visible = !s.visible;
    surface.visible = s.visible;
}

export function updateColor(cube, settings, surfaceName, color) {
    const surface = cube.surfaces[surfaceName];
    if (!surface) return;
    settings.surfaces[surfaceName].color = color;
    surface.material.color.set(color);
}

export function updateTexture(cube, settings, surfaceName, texture) {
    const surface = cube.surfaces[surfaceName];
    if (!surface) return;
    settings.surfaces[surfaceName].texture = texture;
    switch (texture) {
        case 'solid': surface.material.roughness = 0.9; surface.material.metalness = 0.05; break;
        case 'grid': surface.material.roughness = 0.7; surface.material.metalness = 0.1; break;
        case 'dots': surface.material.roughness = 0.8; surface.material.metalness = 0.05; break;
        case 'wood': surface.material.roughness = 0.95; surface.material.metalness = 0; break;
    }
    surface.material.needsUpdate = true;
}

export function updateOrientation(cube, settings, surfaceName, orientation) {
    const surface = cube.surfaces[surfaceName];
    if (!surface || !surface.userData.pivot) return;
    settings.surfaces[surfaceName].orientation = orientation;
    const euler = getPivotTargetRotation(surfaceName, orientation);
    if (!euler) return;
    surface.userData.pivot.rotation.set(euler.x, euler.y, euler.z);
}

export function getPivotTargetRotation(surfaceName, orientation) {
    switch (surfaceName) {
        case CONSTANTS.SURFACES.BACK: return orientation==='down' ? new THREE.Euler(Math.PI/2,0,0) : new THREE.Euler(0,0,0);
        case CONSTANTS.SURFACES.LEFT: return orientation==='down' ? new THREE.Euler(0,0,Math.PI/2) : new THREE.Euler(0,0,0);
        case CONSTANTS.SURFACES.RIGHT: return orientation==='down' ? new THREE.Euler(0,0,-Math.PI/2) : new THREE.Euler(0,0,0);
        case CONSTANTS.SURFACES.FRONT: return orientation==='down' ? new THREE.Euler(-Math.PI/2,0,0) : new THREE.Euler(0,0,0);
        default: return null;
    }
}