import * as THREE from 'three';
import { CONSTANTS } from '../config/constants.js';

export class FoldingAnimator {
    constructor(cube) {
        this.cube = cube;
        this.animating = false;
    }
    
    async unfold(duration = CONSTANTS.UNFOLD_DURATION) {
        if (this.animating || !this.cube.isFolded) return;
        
        this.animating = true;
        const startTime = Date.now();
        
        return new Promise((resolve) => {
            const animate = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);
                const eased = this.easeOutCubic(progress);
                
                // Animate each surface to unfolded position
                // For now, just a simple rotation example
                Object.values(this.cube.surfaces).forEach((surface, i) => {
                    // Add subtle animation effects
                    surface.scale.setScalar(0.8 + eased * 0.2);
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
        
        return new Promise((resolve) => {
            const animate = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);
                const eased = this.easeInCubic(progress);
                
                // Animate surfaces folding back
                Object.values(this.cube.surfaces).forEach((surface, i) => {
                    surface.scale.setScalar(1 - eased * 0.2);
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
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    easeInCubic(t) {
        return t * t * t;
    }
}

