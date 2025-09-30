import * as THREE from 'three';
import { CONSTANTS } from '../config/constants.js';

export class TransitionManager {
    constructor(camera) {
        this.camera = camera;
        this.isTransitioning = false;
    }
    
    async transitionToGallery(duration = CONSTANTS.TRANSITION_DURATION) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        const startPos = this.camera.position.clone();
        const startTarget = this.camera.target.clone();
        
        const endPos = new THREE.Vector3(0, 0, 30);
        const endTarget = new THREE.Vector3(0, 0, 0);
        
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);
                const eased = this.easeInOutCubic(progress);
                
                this.camera.position.lerpVectors(startPos, endPos, eased);
                this.camera.target.lerpVectors(startTarget, endTarget, eased);
                this.camera.lookAt(this.camera.target);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.isTransitioning = false;
                    resolve();
                }
            };
            
            animate();
        });
    }
    
    async transitionToCube(targetPos, duration = CONSTANTS.TRANSITION_DURATION) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        const startPos = this.camera.position.clone();
        const startTarget = this.camera.target.clone();
        
        const endTarget = targetPos.clone();
        const endPos = targetPos.clone().add(new THREE.Vector3(15, 10, 15));
        
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);
                const eased = this.easeInOutCubic(progress);
                
                this.camera.position.lerpVectors(startPos, endPos, eased);
                this.camera.target.lerpVectors(startTarget, endTarget, eased);
                this.camera.lookAt(this.camera.target);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.isTransitioning = false;
                    resolve();
                }
            };
            
            animate();
        });
    }
    
    easeInOutCubic(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}

