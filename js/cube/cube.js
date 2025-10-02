import * as THREE from 'three';
import { CONSTANTS } from '../config/constants.js';

export class DioramaCube {
    constructor() {
        this.group = new THREE.Group();
        this.size = CONSTANTS.CUBE_SIZE;
        this.isFolded = true;
        this.surfaces = {};
        this.placedObjects = [];
        
        this.createCube();
    }
    
    createWhimsicalTexture() {
        // Create a canvas-based texture with a cute dotted pattern
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Soft gradient background
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, '#f5e6d3');
        gradient.addColorStop(0.5, '#f0d8c4');
        gradient.addColorStop(1, '#e8d4c0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Add whimsical dots pattern
        ctx.fillStyle = 'rgba(232, 155, 111, 0.3)';
        const dotSize = 8;
        const spacing = 32;
        for (let x = spacing / 2; x < 512; x += spacing) {
            for (let y = spacing / 2; y < 512; y += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Add smaller accent dots
        ctx.fillStyle = 'rgba(138, 182, 138, 0.2)';
        for (let x = spacing; x < 512; x += spacing) {
            for (let y = spacing; y < 512; y += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, dotSize * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        
        return texture;
    }
    
    createCube() {
        const halfSize = this.size / 2;
        const thickness = CONSTANTS.CUBE_THICKNESS;
        const halfThickness = thickness / 2;
        
        // Create whimsical exterior texture
        const exteriorTexture = this.createWhimsicalTexture();
        
        // Warm, cozy colors for surfaces
        const surfaceConfigs = [
            { name: CONSTANTS.SURFACES.FRONT, color: 0xf5e6d3, position: [0, 0, -halfSize - halfThickness], rotation: [0, 0, 0] },
            { name: CONSTANTS.SURFACES.BACK, color: 0xe8d4c0, position: [0, 0, halfSize + halfThickness], rotation: [0, Math.PI, 0] },
            { name: CONSTANTS.SURFACES.CEILING, color: 0xd4e8f5, position: [0, halfSize + halfThickness, 0], rotation: [0, 0, 0] },
            { name: CONSTANTS.SURFACES.FLOOR, color: 0xa8c9a3, position: [0, -halfSize - halfThickness, 0], rotation: [Math.PI, 0, 0] },
            { name: CONSTANTS.SURFACES.LEFT, color: 0xf0d8c4, position: [-halfSize - halfThickness, 0, 0], rotation: [0, 0, 0] },
            { name: CONSTANTS.SURFACES.RIGHT, color: 0xf0d8c4, position: [halfSize + halfThickness, 0, 0], rotation: [0, 0, 0] }
        ];
        
        surfaceConfigs.forEach(config => {
            // Determine box dimensions based on surface orientation
            let boxGeometry;
            if (config.name === CONSTANTS.SURFACES.FRONT || config.name === CONSTANTS.SURFACES.BACK) {
                boxGeometry = new THREE.BoxGeometry(this.size, this.size, thickness);
            } else if (config.name === CONSTANTS.SURFACES.LEFT || config.name === CONSTANTS.SURFACES.RIGHT) {
                boxGeometry = new THREE.BoxGeometry(thickness, this.size, this.size);
            } else { // FLOOR or CEILING
                boxGeometry = new THREE.BoxGeometry(this.size, thickness, this.size);
            }
            
            const material = new THREE.MeshStandardMaterial({ 
                color: config.color,
                roughness: 0.9,
                metalness: 0.05
            });
            
            const mesh = new THREE.Mesh(boxGeometry, material);
            mesh.position.set(...config.position);
            mesh.rotation.set(...config.rotation);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            mesh.userData.surfaceName = config.name;
            mesh.userData.interiorMaterial = material;
            
            // Create exterior material with texture (will be used when folded)
            const exteriorMaterial = new THREE.MeshStandardMaterial({
                map: exteriorTexture,
                roughness: 0.8,
                metalness: 0.1
            });
            mesh.userData.exteriorMaterial = exteriorMaterial;
            
            this.surfaces[config.name] = mesh;
            this.group.add(mesh);
        });
        
        // Add edge outlines
        this.addEdges();
        
        // Start with exterior texture
        this.setExteriorTexture();
    }
    
    setExteriorTexture() {
        Object.values(this.surfaces).forEach(surface => {
            if (surface.userData.exteriorMaterial) {
                surface.material = surface.userData.exteriorMaterial;
            }
        });
    }
    
    setInteriorTexture() {
        Object.values(this.surfaces).forEach(surface => {
            if (surface.userData.interiorMaterial) {
                surface.material = surface.userData.interiorMaterial;
            }
        });
    }
    
    addEdges() {
        const edgeGeometry = new THREE.EdgesGeometry(
            new THREE.BoxGeometry(this.size, this.size, this.size)
        );
        const edgeMaterial = new THREE.LineBasicMaterial({ 
            color: 0x8a7a66, 
            opacity: 0.3, 
            transparent: true 
        });
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        this.group.add(edges);
    }
    
    unfold(duration = CONSTANTS.UNFOLD_DURATION) {
        if (!this.isFolded) return Promise.resolve();
        
        return new Promise((resolve) => {
            // Animation logic will be added in folding.js
            this.isFolded = false;
            setTimeout(resolve, duration * 1000);
        });
    }
    
    fold(duration = CONSTANTS.FOLD_DURATION) {
        if (this.isFolded) return Promise.resolve();
        
        return new Promise((resolve) => {
            // Animation logic will be added in folding.js
            this.isFolded = true;
            setTimeout(resolve, duration * 1000);
        });
    }
    
    updateThickness(thickness) {
        const halfSize = this.size / 2;
        const base = CONSTANTS.CUBE_THICKNESS;
        const ratio = thickness / base;

        const setScaleAxis = (mesh, axis) => {
            const oldScale = mesh.scale.clone();
            mesh.scale.set(
                axis === 'x' ? ratio : 1,
                axis === 'y' ? ratio : 1,
                axis === 'z' ? ratio : 1
            );
            return oldScale;
        };

        const halfT = thickness / 2;

        const applyInverseScale = (surfaceName, axis) => {
            this.placedObjects.forEach(item => {
                if (item.surface === surfaceName) {
                    const object = item.object;
                    // Re-apply original scale, then divide by the new surface scale on the correct axis
                    if (object.userData.originalScale) {
                        object.scale.copy(object.userData.originalScale);
                        if (axis === 'x') object.scale.x /= ratio;
                        if (axis === 'y') object.scale.y /= ratio;
                        if (axis === 'z') object.scale.z /= ratio;
                    }
                }
            });
        };

        // FRONT
        const front = this.surfaces[CONSTANTS.SURFACES.FRONT];
        if (front) {
            setScaleAxis(front, 'z');
            if (front.userData.pivot) {
                front.position.set(0, halfSize + halfT, -halfT);
            } else {
                front.position.set(0, 0, -halfSize - halfT);
            }
            applyInverseScale(CONSTANTS.SURFACES.FRONT, 'z');
        }
        // BACK
        const back = this.surfaces[CONSTANTS.SURFACES.BACK];
        if (back) {
            setScaleAxis(back, 'z');
            if (back.userData.pivot) {
                back.position.set(0, halfSize + halfT, halfT);
            } else {
                back.position.set(0, 0, halfSize + halfT);
            }
            applyInverseScale(CONSTANTS.SURFACES.BACK, 'z');
        }
        // CEILING (parented to back in pivots)
        const ceiling = this.surfaces[CONSTANTS.SURFACES.CEILING];
        if (ceiling) {
            setScaleAxis(ceiling, 'y');
            ceiling.position.set(0, halfSize + halfT, halfSize + halfT);
            applyInverseScale(CONSTANTS.SURFACES.CEILING, 'y');
        }
        // FLOOR
        const floor = this.surfaces[CONSTANTS.SURFACES.FLOOR];
        if (floor) {
            setScaleAxis(floor, 'y');
            floor.position.set(0, -halfSize - halfT, 0);
            applyInverseScale(CONSTANTS.SURFACES.FLOOR, 'y');
        }
        // LEFT
        const left = this.surfaces[CONSTANTS.SURFACES.LEFT];
        if (left) {
            setScaleAxis(left, 'x');
            if (left.userData.pivot) {
                left.position.set(-halfT, halfSize + halfT, 0);
            } else {
                left.position.set(-halfSize - halfT, 0, 0);
            }
            applyInverseScale(CONSTANTS.SURFACES.LEFT, 'x');
        }
        // RIGHT
        const right = this.surfaces[CONSTANTS.SURFACES.RIGHT];
        if (right) {
            setScaleAxis(right, 'x');
            if (right.userData.pivot) {
                right.position.set(halfT, halfSize + halfT, 0);
            } else {
                right.position.set(halfSize + halfT, 0, 0);
            }
            applyInverseScale(CONSTANTS.SURFACES.RIGHT, 'x');
        }
    }
    
    addObject(object, surfaceName, localPosition) {
        const surface = this.surfaces[surfaceName];
        if (!surface) {
            console.error(`Surface ${surfaceName} not found`);
            return;
        }
        
        object.position.copy(localPosition);
        if (!object.userData.originalScale) {
            object.userData.originalScale = object.scale.clone();
        }
        surface.add(object);
        
        this.placedObjects.push({
            object,
            surface: surfaceName,
            localPosition: localPosition.clone()
        });
    }
    
    removeObject(object) {
        const index = this.placedObjects.findIndex(item => item.object === object);
        if (index !== -1) {
            const item = this.placedObjects[index];
            this.surfaces[item.surface].remove(object);
            this.placedObjects.splice(index, 1);
        }
    }
    
    getGroup() {
        return this.group;
    }
    
    serialize() {
        return {
            objects: this.placedObjects.map(item => ({
                assetId: item.object.userData.assetId,
                surface: item.surface,
                position: {
                    x: item.localPosition.x,
                    y: item.localPosition.y,
                    z: item.localPosition.z
                },
                rotation: {
                    x: item.object.rotation.x,
                    y: item.object.rotation.y,
                    z: item.object.rotation.z
                },
                scale: {
                    x: item.object.scale.x,
                    y: item.object.scale.y,
                    z: item.object.scale.z
                }
            }))
        };
    }
}