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
        this.particles = null;
        this.glowLights = [];
        this.hasUnfoldedOnce = false;
    }
    
    createUnfoldParticles() {
        // Create gentle glowing particles for the reveal
        const particleCount = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const color1 = new THREE.Color(0xe89b6f); // Accent color
        const color2 = new THREE.Color(0xf5e6d3); // Light warm
        const color3 = new THREE.Color(0x8ab68a); // Soft green
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            // Start particles near cube center
            positions[i3] = (Math.random() - 0.5) * this.cube.size * 0.5;
            positions[i3 + 1] = (Math.random() - 0.5) * this.cube.size * 0.5;
            positions[i3 + 2] = (Math.random() - 0.5) * this.cube.size * 0.5;
            
            // Random color from palette
            const colorChoice = Math.random();
            const chosenColor = colorChoice < 0.33 ? color1 : (colorChoice < 0.66 ? color2 : color3);
            colors[i3] = chosenColor.r;
            colors[i3 + 1] = chosenColor.g;
            colors[i3 + 2] = chosenColor.b;
            
            sizes[i] = Math.random() * 0.15 + 0.1;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.cube.group.add(this.particles);
        
        // Add subtle glow lights
        const glowColors = [0xe89b6f, 0xf5e6d3, 0x8ab68a];
        for (let i = 0; i < 3; i++) {
            const light = new THREE.PointLight(glowColors[i], 0, 10);
            light.position.set(
                (Math.random() - 0.5) * this.cube.size,
                (Math.random() - 0.5) * this.cube.size,
                (Math.random() - 0.5) * this.cube.size
            );
            this.glowLights.push(light);
            this.cube.group.add(light);
        }
    }
    
    removeUnfoldParticles() {
        if (this.particles) {
            this.cube.group.remove(this.particles);
            this.particles.geometry.dispose();
            this.particles.material.dispose();
            this.particles = null;
        }
        
        this.glowLights.forEach(light => {
            this.cube.group.remove(light);
        });
        this.glowLights = [];
    }
    
    updateParticles(progress) {
        if (!this.particles) return;
        
        const positions = this.particles.geometry.attributes.position.array;
        const particleCount = positions.length / 3;
        
        // Gentle upward and outward drift
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = progress * 2;
            const drift = Math.sin(progress * Math.PI) * 0.5;
            
            positions[i3] += Math.cos(angle) * 0.02;
            positions[i3 + 1] += 0.03 + drift * 0.01;
            positions[i3 + 2] += Math.sin(angle) * 0.02;
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
        
        // Fade particles
        const fadeStart = 0.6;
        if (progress > fadeStart) {
            const fadeProgress = (progress - fadeStart) / (1 - fadeStart);
            this.particles.material.opacity = 0.8 * (1 - fadeProgress);
        }
        
        // Animate glow lights
        this.glowLights.forEach((light, index) => {
            const intensity = Math.sin(progress * Math.PI) * 0.5;
            light.intensity = intensity;
            
            // Gentle orbit
            const orbitAngle = progress * Math.PI * 2 + (index * Math.PI * 2 / 3);
            light.position.x = Math.cos(orbitAngle) * this.cube.size * 0.4;
            light.position.z = Math.sin(orbitAngle) * this.cube.size * 0.4;
        });
    }
    
    async unfold(duration = CONSTANTS.UNFOLD_DURATION) {
        if (this.animating || !this.cube.isFolded) return;
        this.animating = true;
        const startTime = Date.now();
        const startPositions = {};
        
        // Switch to interior texture
        this.cube.setInteriorTexture();
        
        // Create particle effects
        this.createUnfoldParticles();
        
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
                
                // More dramatic easing with anticipation
                const eased = progress < 0.1 
                    ? progress * 5 // Quick start
                    : 0.5 + easeOutCubic((progress - 0.1) / 0.9) * 0.5; // Smooth unfold
                
                Object.keys(this.cube.surfaces).forEach(name => {
                    const surface = this.cube.surfaces[name];
                    const pivot = surface.userData.pivot;
                    const start = startPositions[name];
                    const end = this.unfoldedPositions[name];
                    const settings = window.app?.settingsManager?.getSettings?.();
                    const isConfigurable = [CONSTANTS.SURFACES.BACK, CONSTANTS.SURFACES.LEFT, CONSTANTS.SURFACES.RIGHT].includes(name);
                    const shouldMove = (name === CONSTANTS.SURFACES.FRONT) || (isConfigurable && settings?.surfaces?.[name]?.orientation === 'down');
                    if (pivot) {
                        if (shouldMove) {
                            pivot.rotation.x = lerpAngle(start.pivotRotation.x, end.pivotRotation.x, eased);
                            pivot.rotation.y = lerpAngle(start.pivotRotation.y, end.pivotRotation.y, eased);
                            pivot.rotation.z = lerpAngle(start.pivotRotation.z, end.pivotRotation.z, eased);
                        }
                    }
                    const targetScale = end.scale || 1.0;
                    const currentScale = start.scale + (targetScale - start.scale) * eased;
                    surface.scale.setScalar(currentScale);
                });
                
                // Update particle effects
                this.updateParticles(progress);
                
                if (progress < 1) requestAnimationFrame(animate);
                else { 
                    this.animating = false; 
                    this.cube.isFolded = false;
                    this.removeUnfoldParticles();
                    
                    // Dispatch event on first unfold
                    if (!this.hasUnfoldedOnce) {
                        this.hasUnfoldedOnce = true;
                        window.dispatchEvent(new CustomEvent('cubeUnfolded'));
                    }
                    
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
                const eased = easeInCubic(progress);
                Object.keys(this.cube.surfaces).forEach(name => {
                    const surface = this.cube.surfaces[name];
                    const pivot = surface.userData.pivot;
                    const start = startPositions[name];
                    const end = this.foldedPositions[name];
                    const settings = window.app?.settingsManager?.getSettings?.();
                    const isConfigurable = [CONSTANTS.SURFACES.BACK, CONSTANTS.SURFACES.LEFT, CONSTANTS.SURFACES.RIGHT].includes(name);
                    const shouldMove = (name === CONSTANTS.SURFACES.FRONT) || (isConfigurable && settings?.surfaces?.[name]?.orientation === 'down');
                    if (pivot) {
                        if (shouldMove) {
                            pivot.rotation.x = lerpAngle(start.pivotRotation.x, end.pivotRotation.x, eased);
                            pivot.rotation.y = lerpAngle(start.pivotRotation.y, end.pivotRotation.y, eased);
                            pivot.rotation.z = lerpAngle(start.pivotRotation.z, end.pivotRotation.z, eased);
                        }
                    }
                    const currentScale = start.scale + (1.0 - start.scale) * eased;
                    surface.scale.setScalar(currentScale);
                });
                if (progress < 1) requestAnimationFrame(animate);
                else { 
                    this.animating = false; 
                    this.cube.isFolded = true;
                    // Switch to exterior texture when folded
                    this.cube.setExteriorTexture();
                    resolve(); 
                }
            };
            animate();
        });
    }
}