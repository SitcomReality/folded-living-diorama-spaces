import * as THREE from 'three';
import { CONSTANTS } from '../config/constants.js';

export class FoldingAnimator {
    constructor(cube) {
        this.cube = cube;
        this.animating = false;
        this.foldedPositions = this.calculateFoldedPositions();
        this.unfoldedPositions = this.calculateUnfoldedPositions();
        this.setupPivots();
    }
    
    setupPivots() {
        // Create pivot groups for each surface so they rotate around edges
        const halfSize = this.cube.size / 2;
        
        Object.keys(this.cube.surfaces).forEach(name => {
            const surface = this.cube.surfaces[name];
            const pivot = new THREE.Group();
            
            // Set pivot position based on surface
            switch(name) {
                case CONSTANTS.SURFACES.EARTH:
                    // Earth doesn't need a pivot, it stays fixed
                    break;
                case CONSTANTS.SURFACES.BACKDROP:
                    // Pivot at bottom edge (where it touches earth)
                    pivot.position.set(0, -halfSize, halfSize);
                    break;
                case CONSTANTS.SURFACES.SKY:
                    // Pivot at back edge (where it touches backdrop when folded)
                    pivot.position.set(0, halfSize, halfSize);
                    break;
                case CONSTANTS.SURFACES.WING_LEFT:
                    // Pivot at bottom edge
                    pivot.position.set(-halfSize, -halfSize, 0);
                    break;
                case CONSTANTS.SURFACES.WING_RIGHT:
                    // Pivot at bottom edge
                    pivot.position.set(halfSize, -halfSize, 0);
                    break;
                case CONSTANTS.SURFACES.PORTAL:
                    // Pivot at bottom edge
                    pivot.position.set(0, -halfSize, -halfSize);
                    break;
            }
            
            if (name !== CONSTANTS.SURFACES.EARTH) {
                // Remove surface from group, add to pivot, add pivot to group
                this.cube.group.remove(surface);
                
                // Adjust surface position relative to pivot
                const worldPos = new THREE.Vector3();
                surface.getWorldPosition(worldPos);
                pivot.add(surface);
                surface.position.copy(worldPos).sub(pivot.position);
                
                this.cube.group.add(pivot);
                surface.userData.pivot = pivot;
            }
        });
    }
    
    calculateFoldedPositions() {
        // Store initial positions and rotations (cube configuration)
        const positions = {};
        const halfSize = this.cube.size / 2;
        
        positions[CONSTANTS.SURFACES.PORTAL] = {
            position: new THREE.Vector3(0, 0, -halfSize),
            rotation: new THREE.Euler(0, 0, 0),
            pivotRotation: new THREE.Euler(0, 0, 0)
        };
        positions[CONSTANTS.SURFACES.BACKDROP] = {
            position: new THREE.Vector3(0, 0, halfSize),
            rotation: new THREE.Euler(0, Math.PI, 0),
            pivotRotation: new THREE.Euler(0, 0, 0)
        };
        positions[CONSTANTS.SURFACES.SKY] = {
            position: new THREE.Vector3(0, halfSize, 0),
            rotation: new THREE.Euler(-Math.PI/2, 0, 0),
            pivotRotation: new THREE.Euler(0, 0, 0)
        };
        positions[CONSTANTS.SURFACES.EARTH] = {
            position: new THREE.Vector3(0, -halfSize, 0),
            rotation: new THREE.Euler(Math.PI/2, 0, 0),
            pivotRotation: new THREE.Euler(0, 0, 0)
        };
        positions[CONSTANTS.SURFACES.WING_LEFT] = {
            position: new THREE.Vector3(-halfSize, 0, 0),
            rotation: new THREE.Euler(0, -Math.PI/2, 0),
            pivotRotation: new THREE.Euler(0, 0, 0)
        };
        positions[CONSTANTS.SURFACES.WING_RIGHT] = {
            position: new THREE.Vector3(halfSize, 0, 0),
            rotation: new THREE.Euler(0, Math.PI/2, 0),
            pivotRotation: new THREE.Euler(0, 0, 0)
        };
        
        return positions;
    }
    
    calculateUnfoldedPositions() {
        const positions = {};
        const size = this.cube.size;
        const halfSize = size / 2;
        
        // Earth stays fixed as floor
        positions[CONSTANTS.SURFACES.EARTH] = {
            position: new THREE.Vector3(0, -halfSize, 0),
            rotation: new THREE.Euler(Math.PI/2, 0, 0),
            pivotRotation: new THREE.Euler(0, 0, 0)
        };
        
        // Backdrop rotates back to vertical from its bottom edge
        positions[CONSTANTS.SURFACES.BACKDROP] = {
            position: new THREE.Vector3(0, 0, halfSize),
            rotation: new THREE.Euler(0, Math.PI, 0),
            pivotRotation: new THREE.Euler(Math.PI/2, 0, 0) // Rotate 90° around X to stand up
        };
        
        // Sky rotates forward from back edge to horizontal
        positions[CONSTANTS.SURFACES.SKY] = {
            position: new THREE.Vector3(0, halfSize, 0),
            rotation: new THREE.Euler(-Math.PI/2, 0, 0),
            pivotRotation: new THREE.Euler(-Math.PI/2, 0, 0) // Rotate to lay flat
        };
        
        // Wings rotate outward from bottom edge
        positions[CONSTANTS.SURFACES.WING_LEFT] = {
            position: new THREE.Vector3(-halfSize, 0, 0),
            rotation: new THREE.Euler(0, -Math.PI/2, 0),
            pivotRotation: new THREE.Euler(0, 0, -Math.PI/2) // Rotate around Z to stand up
        };
        
        positions[CONSTANTS.SURFACES.WING_RIGHT] = {
            position: new THREE.Vector3(halfSize, 0, 0),
            rotation: new THREE.Euler(0, Math.PI/2, 0),
            pivotRotation: new THREE.Euler(0, 0, Math.PI/2) // Rotate around Z to stand up
        };
        
        // Portal folds down or minimizes
        positions[CONSTANTS.SURFACES.PORTAL] = {
            position: new THREE.Vector3(0, -halfSize, -halfSize),
            rotation: new THREE.Euler(Math.PI/2, 0, 0),
            pivotRotation: new THREE.Euler(Math.PI/2, 0, 0), // Fold flat
            scale: 0.3
        };
        
        return positions;
    }
    
    async unfold(duration = CONSTANTS.UNFOLD_DURATION) {
        if (this.animating || !this.cube.isFolded) return;
        
        this.animating = true;
        const startTime = Date.now();
        
        const startPositions = {};
        Object.keys(this.cube.surfaces).forEach(name => {
            const surface = this.cube.surfaces[name];
            const pivot = surface.userData.pivot;
            
            startPositions[name] = {
                position: surface.position.clone(),
                rotation: surface.rotation.clone(),
                pivotRotation: pivot ? pivot.rotation.clone() : new THREE.Euler(0, 0, 0),
                scale: surface.scale.x
            };
        });
        
        return new Promise((resolve) => {
            const animate = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);
                const eased = this.easeOutCubic(progress);
                
                Object.keys(this.cube.surfaces).forEach(name => {
                    const surface = this.cube.surfaces[name];
                    const pivot = surface.userData.pivot;
                    const start = startPositions[name];
                    const end = this.unfoldedPositions[name];
                    
                    if (pivot) {
                        // Animate pivot rotation
                        pivot.rotation.x = this.lerpAngle(start.pivotRotation.x, end.pivotRotation.x, eased);
                        pivot.rotation.y = this.lerpAngle(start.pivotRotation.y, end.pivotRotation.y, eased);
                        pivot.rotation.z = this.lerpAngle(start.pivotRotation.z, end.pivotRotation.z, eased);
                    }
                    
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
        
        const startPositions = {};
        Object.keys(this.cube.surfaces).forEach(name => {
            const surface = this.cube.surfaces[name];
            const pivot = surface.userData.pivot;
            
            startPositions[name] = {
                position: surface.position.clone(),
                rotation: surface.rotation.clone(),
                pivotRotation: pivot ? pivot.rotation.clone() : new THREE.Euler(0, 0, 0),
                scale: surface.scale.x
            };
        });
        
        return new Promise((resolve) => {
            const animate = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);
                const eased = this.easeInCubic(progress);
                
                Object.keys(this.cube.surfaces).forEach(name => {
                    const surface = this.cube.surfaces[name];
                    const pivot = surface.userData.pivot;
                    const start = startPositions[name];
                    const end = this.foldedPositions[name];
                    
                    if (pivot) {
                        // Animate pivot rotation back to folded
                        pivot.rotation.x = this.lerpAngle(start.pivotRotation.x, end.pivotRotation.x, eased);
                        pivot.rotation.y = this.lerpAngle(start.pivotRotation.y, end.pivotRotation.y, eased);
                        pivot.rotation.z = this.lerpAngle(start.pivotRotation.z, end.pivotRotation.z, eased);
                    }
                    
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