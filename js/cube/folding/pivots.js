import * as THREE from 'three';
import { CONSTANTS } from '../../config/constants.js';

export function setupPivots(cube) {
    const halfSize = cube.size / 2;
    Object.keys(cube.surfaces).forEach(name => {
        const surface = cube.surfaces[name];
        const pivot = new THREE.Group();
        switch(name) {
            case CONSTANTS.SURFACES.EARTH:
                break;
            case CONSTANTS.SURFACES.BACKDROP:
                pivot.position.set(0, -halfSize, halfSize);
                cube.group.remove(surface);
                surface.position.set(0, halfSize, 0);
                pivot.add(surface);
                cube.group.add(pivot);
                surface.userData.pivot = pivot;
                break;
            case CONSTANTS.SURFACES.SKY:
                break;
            case CONSTANTS.SURFACES.WING_LEFT:
                pivot.position.set(-halfSize, -halfSize, 0);
                cube.group.remove(surface);
                surface.position.set(0, halfSize, 0);
                pivot.add(surface);
                cube.group.add(pivot);
                surface.userData.pivot = pivot;
                break;
            case CONSTANTS.SURFACES.WING_RIGHT:
                pivot.position.set(halfSize, -halfSize, 0);
                cube.group.remove(surface);
                surface.position.set(0, halfSize, 0);
                pivot.add(surface);
                cube.group.add(pivot);
                surface.userData.pivot = pivot;
                break;
            case CONSTANTS.SURFACES.PORTAL:
                pivot.position.set(0, -halfSize, -halfSize);
                cube.group.remove(surface);
                surface.position.set(0, halfSize, 0);
                pivot.add(surface);
                cube.group.add(pivot);
                surface.userData.pivot = pivot;
                break;
        }
    });
    const skySurface = cube.surfaces[CONSTANTS.SURFACES.SKY];
    const backdropSurface = cube.surfaces[CONSTANTS.SURFACES.BACKDROP];
    if (skySurface && backdropSurface) {
        cube.group.remove(skySurface);
        skySurface.position.set(0, halfSize, halfSize);
        skySurface.rotation.set(-Math.PI/2, 0, 0);
        backdropSurface.add(skySurface);
        skySurface.userData.parentedToBackdrop = true;
    }
}