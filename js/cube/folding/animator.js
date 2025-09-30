import * as THREE from 'three';
import { CONSTANTS } from '../../config/constants.js';
import { setupPivots } from './pivots.js';
import { calculateFoldedPositions, calculateUnfoldedPositions } from './positions.js';
import { lerpAngle, easeOutCubic, easeInCubic } from './easing.js';

export class FoldingAnimator {
    constructor(cube) {
        this.cube = cube;
        this.animating = false;
        this.foldedPositions = calculateFoldedPositions(cube);
        this.unfoldedPositions = calculateUnfoldedPositions(cube);
        setupPivots(cube);
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
                const eased = easeOutCubic(progress);
                Object.keys(this.cube.surfaces).forEach(name => {
                    const surface = this.cube.surfaces[name];
                    const pivot = surface.userData.pivot;
                    const start = startPositions[name];
                    const end = this.unfoldedPositions[name];
                    if (pivot) {
                        pivot.rotation.x = lerpAngle(start.pivotRotation.x, end.pivotRotation.x, eased);
                        pivot.rotation.y = lerpAngle(start.pivotRotation.y, end.pivotRotation.y, eased);
                        pivot.rotation.z = lerpAngle(start.pivotRotation.z, end.pivotRotation.z, eased);
                    }
                    const targetScale = end.scale || 1.0;
                    const currentScale = start.scale + (targetScale - start.scale) * eased;
                    surface.scale.setScalar(currentScale);
                });
                if (progress < 1) requestAnimationFrame(animate);
                else { this.animating = false; this.cube.isFolded = false; resolve(); }
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
                const eased = easeInCubic(progress);
                Object.keys(this.cube.surfaces).forEach(name => {
                    const surface = this.cube.surfaces[name];
                    const pivot = surface.userData.pivot;
                    const start = startPositions[name];
                    const end = this.foldedPositions[name];
                    if (pivot) {
                        pivot.rotation.x = lerpAngle(start.pivotRotation.x, end.pivotRotation.x, eased);
                        pivot.rotation.y = lerpAngle(start.pivotRotation.y, end.pivotRotation.y, eased);
                        pivot.rotation.z = lerpAngle(start.pivotRotation.z, end.pivotRotation.z, eased);
                    }
                    const currentScale = start.scale + (1.0 - start.scale) * eased;
                    surface.scale.setScalar(currentScale);
                });
                if (progress < 1) requestAnimationFrame(animate);
                else { this.animating = false; this.cube.isFolded = true; resolve(); }
            };
            animate();
        });
    }
}