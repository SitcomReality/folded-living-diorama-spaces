import { CONSTANTS } from '../config/constants.js';

export class SurfaceManager {
    constructor(cube) {
        this.cube = cube;
        this.selectedSurface = null;
    }
    
    selectSurface(surfaceName) {
        if (this.selectedSurface) {
            this.deselectSurface();
        }
        
        const surface = this.cube.surfaces[surfaceName];
        if (surface) {
            this.selectedSurface = surfaceName;
            surface.material.emissive = new THREE.Color(0x333333);
            return surface;
        }
        return null;
    }
    
    deselectSurface() {
        if (this.selectedSurface) {
            const surface = this.cube.surfaces[this.selectedSurface];
            if (surface) {
                surface.material.emissive = new THREE.Color(0x000000);
            }
            this.selectedSurface = null;
        }
    }
    
    getSelectedSurface() {
        return this.selectedSurface;
    }
    
    getSurfaceAt(point) {
        // Raycast logic to determine which surface was clicked
        return null;
    }
}

