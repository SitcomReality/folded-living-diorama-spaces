import * as THREE from 'three';
import { CONSTANTS } from '../../config/constants.js';

export function calculateFoldedPositions(cube) {
    const positions = {};
    const halfSize = cube.size / 2;
    positions[CONSTANTS.SURFACES.PORTAL]   = { position: new THREE.Vector3(0, 0, -halfSize), rotation: new THREE.Euler(0, 0, 0),            pivotRotation: new THREE.Euler(0, 0, 0) };
    positions[CONSTANTS.SURFACES.BACKDROP] = { position: new THREE.Vector3(0, 0, halfSize),  rotation: new THREE.Euler(0, Math.PI, 0),     pivotRotation: new THREE.Euler(0, 0, 0) };
    positions[CONSTANTS.SURFACES.SKY]      = { position: new THREE.Vector3(0, halfSize, 0),  rotation: new THREE.Euler(-Math.PI/2, 0, 0),  pivotRotation: new THREE.Euler(0, 0, 0) };
    positions[CONSTANTS.SURFACES.EARTH]    = { position: new THREE.Vector3(0, -halfSize, 0), rotation: new THREE.Euler(Math.PI/2, 0, 0),   pivotRotation: new THREE.Euler(0, 0, 0) };
    positions[CONSTANTS.SURFACES.WING_LEFT]= { position: new THREE.Vector3(-halfSize, 0, 0), rotation: new THREE.Euler(0, -Math.PI/2, 0),  pivotRotation: new THREE.Euler(0, 0, 0) };
    positions[CONSTANTS.SURFACES.WING_RIGHT]={ position:new THREE.Vector3(halfSize, 0, 0),  rotation: new THREE.Euler(0, Math.PI/2, 0),   pivotRotation: new THREE.Euler(0, 0, 0) };
    return positions;
}

export function calculateUnfoldedPositions(cube) {
    const positions = {};
    const size = cube.size;
    const halfSize = size / 2;
    positions[CONSTANTS.SURFACES.EARTH]      = { position: new THREE.Vector3(0, -halfSize, 0), rotation: new THREE.Euler(Math.PI/2, 0, 0), pivotRotation: new THREE.Euler(0, 0, 0) };
    positions[CONSTANTS.SURFACES.BACKDROP]   = { position: new THREE.Vector3(0, 0, halfSize),  rotation: new THREE.Euler(0, Math.PI, 0),   pivotRotation: new THREE.Euler(Math.PI/2, 0, 0) };
    positions[CONSTANTS.SURFACES.SKY]        = { position: new THREE.Vector3(0, halfSize, 0),  rotation: new THREE.Euler(-Math.PI/2, 0, 0),pivotRotation: new THREE.Euler(0, 0, 0) };
    positions[CONSTANTS.SURFACES.WING_LEFT]  = { position: new THREE.Vector3(-halfSize, 0, 0), rotation: new THREE.Euler(0, -Math.PI/2, 0),pivotRotation: new THREE.Euler(0, 0, Math.PI/2) };
    positions[CONSTANTS.SURFACES.WING_RIGHT] = { position: new THREE.Vector3(halfSize, 0, 0),  rotation: new THREE.Euler(0, Math.PI/2, 0), pivotRotation: new THREE.Euler(0, 0, -Math.PI/2) };
    positions[CONSTANTS.SURFACES.PORTAL]     = { position: new THREE.Vector3(0, -halfSize, -halfSize), rotation: new THREE.Euler(Math.PI/2, 0, 0), pivotRotation: new THREE.Euler(-Math.PI/2, 0, 0) };
    return positions;
}