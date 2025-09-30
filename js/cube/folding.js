import * as THREE from 'three';
import { CONSTANTS } from '../config/constants.js';

export class FoldingAnimator {
    constructor(cube) {
        this.cube = cube;
        this.animating = false;
        this.foldedPositions = this.calculateFoldedPositions();
        this.unfoldedPositions = this.calculateUnfoldedPositions();
    }
    
    calculateFoldedPositions() {
        // Store initial positions and rotations (cube configuration)
        const positions = {};
        const halfSize = this.cube.size / 2;
        
        positions[CONSTANTS.SURFACES.PORTAL] = {
            position: new THREE.Vector3(0, 0, -halfSize),
            rotation: new THREE.Euler(0, 0, 0)
        };
        positions[CONSTANTS.SURFACES.BACKDROP] = {
            position: new THREE.Vector3(0, 0, halfSize),
            rotation: new THREE.Euler(0, Math.PI, 0)
        };
        positions[CONSTANTS.SURFACES.SKY] = {
            position: new THREE.Vector3(0, halfSize, 0),
            rotation: new THREE.Euler(-Math.PI/2, 0, 0)
        };
        positions[CONSTANTS.SURFACES.EARTH] = {
            position: new THREE.Vector3(0, -halfSize, 0),
            rotation: new THREE.Euler(Math.PI/2, 0, 0)
        };
        positions[CONSTANTS.SURFACES.WING_LEFT] = {
            position: new THREE.Vector3(-halfSize, 0, 0),
            rotation: new THREE.Euler(0, -Math.PI/2, 0)
        };
        positions[CONSTANTS.SURFACES.WING_RIGHT] = {
            position: new THREE.Vector3(halfSize, 0, 0),
            rotation: new THREE.Euler(0, Math.PI/2, 0)
        };
        
        return positions;
    }
    
    calculateUnfoldedPositions() {
        // Diorama configuration: open front, floor extends forward, walls spread out
        const positions = {};
        const size = this.cube.size;
        const halfSize = size / 2;
        
        // Portal (front) - hidden or moved far forward as the "viewing plane"
        positions[CONSTANTS.SURFACES.PORTAL] = {
            position: new THREE.Vector3(0, 0, -size * 1.5),
            rotation: new THREE.Euler(0, 0, 0),
            scale: 0.3 // Make it small to indicate it's the viewing portal
        };
        
        // Earth becomes the floor, extended forward
        positions[CONSTANTS.SURFACES.EARTH] = {
            position: new THREE.Vector3(0, -halfSize, 0),
            rotation: new THREE.Euler(0, 0, 0), // Flat horizontal
            scale: 1.0
        };
        
        // Backdrop stays as back wall
        positions[CONSTANTS.SURFACES.BACKDROP] = {
            position: new THREE.Vector3(0, 0, halfSize),
            rotation: new THREE.Euler(0, 0, 0), // Facing forward
            scale: 1.0
        };
        
        // Sky stays as ceiling
        positions[CONSTANTS.SURFACES.SKY] = {
            position: new THREE.Vector3(0, halfSize, 0),
            rotation: new THREE.Euler(0, 0, 0), // Flat horizontal above
            scale: 1.0
        };
        
        // Wings fold out to sides
        positions[CONSTANTS.SURFACES.WING_LEFT] = {
            position: new THREE.Vector3(-halfSize, 0, 0),
            rotation: new THREE.Euler(0, Math.PI/2, 0),
            scale: 1.0
        };
        positions[CONSTANTS.SURFACES.WING_RIGHT] = {
            position: new THREE.Vector3(halfSize, 0, 0),
            rotation: new THREE.Euler(0, -Math.PI/2, 0),
            scale: 1.0
        };
        
        return positions;
    }
    
    async unfold(duration = CONSTANTS.UNFOLD_DURATION) {
        if (this.animating || !this.cube.isFolded) return;
        
        this.animating = true;
        const startTime = Date.now();
        
        // Store starting positions
        const startPositions = {};
        Object.keys(this.cube.surfaces).forEach(name => {
            const surface = this.cube.surfaces[name];
            startPositions[name] = {
                position: surface.position.clone(),
                rotation: surface.rotation.clone(),
                scale: surface.scale.x
            };
        });
        
        return new Promise((resolve) => {
            const animate = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);
                const eased = this.easeOutCubic(progress);
                
                // Animate each surface to unfolded position
                Object.keys(this.cube.surfaces).forEach(name => {
                    const surface = this.cube.surfaces[name];
                    const start = startPositions[name];
                    const end = this.unfoldedPositions[name];
                    
                    // Interpolate position
                    surface.position.lerpVectors(
                        start.position,
                        end.position,
                        eased
                    );
                    
                    // Interpolate rotation
                    surface.rotation.x = this.lerpAngle(start.rotation.x, end.rotation.x, eased);
                    surface.rotation.y = this.lerpAngle(start.rotation.y, end.rotation.y, eased);
                    surface.rotation.z = this.lerpAngle(start.rotation.z, end.rotation.z, eased);
                    
                    // Interpolate scale if needed
                    const targetScale = end.scale || 1.0;
                    const currentScale = start.scale + (targetScale - start.scale) * eased;
                    surface.scale.setScalar(currentScale);
                });
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.animating = false;
                    this.cube.isFolded = false;
                    resolve();
                }
            };
            
            animate();
        });
    }
    
    async fold(duration = CONSTANTS.FOLD_DURATION) {
        if (this.animating || this.cube.isFolded) return;
        
        this.animating = true;
        const startTime = Date.now();
        
        // Store starting positions
        const startPositions = {};
        Object.keys(this.cube.surfaces).forEach(name => {
            const surface = this.cube.surfaces[name];
            startPositions[name] = {
                position: surface.position.clone(),
                rotation: surface.rotation.clone(),
                scale: surface.scale.x
            };
        });
        
        return new Promise((resolve) => {
            const animate = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);
                const eased = this.easeInCubic(progress);
                
                // Animate surfaces folding back
                Object.keys(this.cube.surfaces).forEach(name => {
                    const surface = this.cube.surfaces[name];
                    const start = startPositions[name];
                    const end = this.foldedPositions[name];
                    
                    // Interpolate position
                    surface.position.lerpVectors(
                        start.position,
                        end.position,
                        eased
                    );
                    
                    // Interpolate rotation
                    surface.rotation.x = this.lerpAngle(start.rotation.x, end.rotation.x, eased);
                    surface.rotation.y = this.lerpAngle(start.rotation.y, end.rotation.y, eased);
                    surface.rotation.z = this.lerpAngle(start.rotation.z, end.rotation.z, eased);
                    
                    // Reset scale
                    const currentScale = start.scale + (1.0 - start.scale) * eased;
                    surface.scale.setScalar(currentScale);
                });
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.animating = false;
                    this.cube.isFolded = true;
                    resolve();
                }
            };
            
            animate();
        });
    }
    
    lerpAngle(start, end, t) {
        // Handle angle wrapping for smooth interpolation
        let diff = end - start;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return start + diff * t;
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    easeInCubic(t) {
        return t * t * t;
    }
}