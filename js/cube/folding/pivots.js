import * as THREE from 'three';
import { CONSTANTS } from '../../config/constants.js';

export function setupPivots(cube) {
    const halfSize = cube.size / 2;
    const thickness = CONSTANTS.CUBE_THICKNESS;
    const halfThickness = thickness / 2;

    Object.keys(cube.surfaces).forEach(name => {
        const surface = cube.surfaces[name];
        const pivot = new THREE.Group();
        switch(name) {
            case CONSTANTS.SURFACES.FLOOR:
                break;
            case CONSTANTS.SURFACES.BACK:
                pivot.position.set(0, -halfSize, halfSize);
                cube.group.remove(surface);
                surface.position.set(0, halfSize, halfThickness);
                pivot.add(surface);
                cube.group.add(pivot);
                surface.userData.pivot = pivot;
                break;
            case CONSTANTS.SURFACES.CEILING:
                break;
            case CONSTANTS.SURFACES.LEFT:
                pivot.position.set(-halfSize, -halfSize, 0);
                cube.group.remove(surface);
                surface.position.set(-halfThickness, halfSize, 0);
                pivot.add(surface);
                cube.group.add(pivot);
                surface.userData.pivot = pivot;
                break;
            case CONSTANTS.SURFACES.RIGHT:
                pivot.position.set(halfSize, -halfSize, 0);
                cube.group.remove(surface);
                surface.position.set(halfThickness, halfSize, 0);
                pivot.add(surface);
                cube.group.add(pivot);
                surface.userData.pivot = pivot;
                break;
            case CONSTANTS.SURFACES.FRONT:
                pivot.position.set(0, -halfSize, -halfSize);
                cube.group.remove(surface);
                surface.position.set(0, halfSize, -halfThickness);
                pivot.add(surface);
                cube.group.add(pivot);
                surface.userData.pivot = pivot;
                break;
        }
    });
    const ceilingSurface = cube.surfaces[CONSTANTS.SURFACES.CEILING];
    const backSurface = cube.surfaces[CONSTANTS.SURFACES.BACK];
    if (ceilingSurface && backSurface && backSurface.parent) {
        const backPivot = backSurface.parent;
        backPivot.remove(backSurface);
        cube.group.remove(ceilingSurface);
        
        // Position ceiling relative to back surface to maintain connection
        ceilingSurface.position.set(0, halfSize + halfThickness, halfSize + halfThickness); 
        
        backSurface.add(ceilingSurface);
        backPivot.add(backSurface);

        ceilingSurface.userData.parentedToBackdrop = true;
    }
}