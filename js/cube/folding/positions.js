import * as THREE from 'three';
import { CONSTANTS } from '../../config/constants.js';

export function calculateFoldedPositions(cube, thickness = CONSTANTS.CUBE_THICKNESS) {
    const positions = {};
    const halfSize = cube.size / 2;
    const halfT = thickness / 2;
    
    // Folded positions: keep internal faces at ±halfSize
    positions[CONSTANTS.SURFACES.FRONT]   = { position: new THREE.Vector3(0, 0, -halfSize - halfT), rotation: new THREE.Euler(0, 0, 0), pivotRotation: new THREE.Euler(0, 0, 0) };
    positions[CONSTANTS.SURFACES.BACK]    = { position: new THREE.Vector3(0, 0, halfSize + halfT), rotation: new THREE.Euler(0, Math.PI, 0), pivotRotation: new THREE.Euler(0, 0, 0) };
    positions[CONSTANTS.SURFACES.CEILING] = { position: new THREE.Vector3(0, halfSize + halfT, 0), rotation: new THREE.Euler(-Math.PI/2, 0, 0), pivotRotation: new THREE.Euler(0, 0, 0) };
    positions[CONSTANTS.SURFACES.FLOOR]   = { position: new THREE.Vector3(0, -halfSize - halfT, 0), rotation: new THREE.Euler(Math.PI/2, 0, 0), pivotRotation: new THREE.Euler(0, 0, 0) };
    positions[CONSTANTS.SURFACES.LEFT]    = { position: new THREE.Vector3(-halfSize - halfT, 0, 0), rotation: new THREE.Euler(0, -Math.PI/2, 0), pivotRotation: new THREE.Euler(0, 0, 0) };
    positions[CONSTANTS.SURFACES.RIGHT]   = { position: new THREE.Vector3(halfSize + halfT, 0, 0), rotation: new THREE.Euler(0, Math.PI/2, 0), pivotRotation: new THREE.Euler(0, 0, 0) };
    return positions;
}

export function calculateUnfoldedPositions(cube, thickness = CONSTANTS.CUBE_THICKNESS) {
    const positions = {};
    const size = cube.size;
    const halfSize = size / 2;
    const halfT = thickness / 2;
    
    // Unfolded positions: surfaces rotated flat around their pivots
    positions[CONSTANTS.SURFACES.FLOOR]   = { position: new THREE.Vector3(0, -halfSize - halfT, 0), rotation: new THREE.Euler(Math.PI/2, 0, 0), pivotRotation: new THREE.Euler(0, 0, 0) };
    positions[CONSTANTS.SURFACES.BACK]    = { position: new THREE.Vector3(0, 0, halfSize + halfT), rotation: new THREE.Euler(0, Math.PI, 0), pivotRotation: new THREE.Euler(Math.PI/2, 0, 0) };
    positions[CONSTANTS.SURFACES.CEILING] = { position: new THREE.Vector3(0, halfSize + halfT, 0), rotation: new THREE.Euler(-Math.PI/2, 0, 0), pivotRotation: new THREE.Euler(0, 0, 0) };
    positions[CONSTANTS.SURFACES.LEFT]    = { position: new THREE.Vector3(-halfSize - halfT, 0, 0), rotation: new THREE.Euler(0, -Math.PI/2, 0), pivotRotation: new THREE.Euler(0, 0, Math.PI/2) };
    positions[CONSTANTS.SURFACES.RIGHT]   = { position: new THREE.Vector3(halfSize + halfT, 0, 0), rotation: new THREE.Euler(0, Math.PI/2, 0), pivotRotation: new THREE.Euler(0, 0, -Math.PI/2) };
    positions[CONSTANTS.SURFACES.FRONT]   = { position: new THREE.Vector3(0, 0, -halfSize - halfT), rotation: new THREE.Euler(0, 0, 0), pivotRotation: new THREE.Euler(-Math.PI/2, 0, 0) };
    return positions;
}