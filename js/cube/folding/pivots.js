import * as THREE from 'three';
import { CONSTANTS } from '../../config/constants.js';

export function setupPivots(cube) {
    const halfSize = cube.size / 2;
    Object.keys(cube.surfaces).forEach(name => {
        const surface = cube.surfaces[name];
        const pivot = new THREE.Group();
        switch(name) {
            case CONSTANTS.SURFACES.FLOOR:
                break;
            case CONSTANTS.SURFACES.BACK:
                pivot.position.set(0, -halfSize, halfSize);
                cube.group.remove(surface);
                surface.position.set(0, halfSize, 0);
                pivot.add(surface);
                cube.group.add(pivot);
                surface.userData.pivot = pivot;
                break;
            case CONSTANTS.SURFACES.CEILING:
                break;
            case CONSTANTS.SURFACES.LEFT:
                pivot.position.set(-halfSize, -halfSize, 0);
                cube.group.remove(surface);
                surface.position.set(0, halfSize, 0);
                pivot.add(surface);
                cube.group.add(pivot);
                surface.userData.pivot = pivot;
                break;
            case CONSTANTS.SURFACES.RIGHT:
                pivot.position.set(halfSize, -halfSize, 0);
                cube.group.remove(surface);
                surface.position.set(0, halfSize, 0);
                pivot.add(surface);
                cube.group.add(pivot);
                surface.userData.pivot = pivot;
                break;
            case CONSTANTS.SURFACES.FRONT:
                pivot.position.set(0, -halfSize, -halfSize);
                cube.group.remove(surface);
                surface.position.set(0, halfSize, 0);
                pivot.add(surface);
                cube.group.add(pivot);
                surface.userData.pivot = pivot;
                break;
        }
    });
    const ceilingSurface = cube.surfaces[CONSTANTS.SURFACES.CEILING];
    const backSurface = cube.surfaces[CONSTANTS.SURFACES.BACK];
    if (ceilingSurface && backSurface) {
        cube.group.remove(ceilingSurface);
        // Create a small pivot at the BACK surface's top edge, and attach the ceiling to that pivot.
        // This ensures the ceiling's back edge meets the top edge of the back wall (no T-shape).
        const topEdgePivot = new THREE.Group();
        topEdgePivot.position.set(0, halfSize, 0); // top edge of the back surface in backSurface local space
        // Add pivot onto the back surface so it moves/rotates with it
        backSurface.add(topEdgePivot);

        // Orient the ceiling to be perpendicular to the back and offset so its back edge sits on the pivot.
        ceilingSurface.rotation.set(-Math.PI / 2, 0, 0);
        // Place ceiling so that its back edge (half the plane size) meets the pivot:
        ceilingSurface.position.set(0, 0, -halfSize / 2);
        topEdgePivot.add(ceilingSurface);
        ceilingSurface.userData.parentedToBackdrop = true;
    }
}