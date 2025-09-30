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
    
    createCube() {
        const halfSize = this.size / 2;
        
        // Create individual surfaces with different colors for distinction
        const surfaceConfigs = [
            { name: CONSTANTS.SURFACES.PORTAL, color: 0x4a9eff, position: [0, 0, -halfSize], rotation: [0, 0, 0] },
            { name: CONSTANTS.SURFACES.BACKDROP, color: 0x9eff4a, position: [0, 0, halfSize], rotation: [0, Math.PI, 0] },
            { name: CONSTANTS.SURFACES.SKY, color: 0xff9e4a, position: [0, halfSize, 0], rotation: [-Math.PI/2, 0, 0] },
            { name: CONSTANTS.SURFACES.EARTH, color: 0x4aff9e, position: [0, -halfSize, 0], rotation: [Math.PI/2, 0, 0] },
            { name: CONSTANTS.SURFACES.WING_LEFT, color: 0xff4a9e, position: [-halfSize, 0, 0], rotation: [0, -Math.PI/2, 0] },
            { name: CONSTANTS.SURFACES.WING_RIGHT, color: 0x9e4aff, position: [halfSize, 0, 0], rotation: [0, Math.PI/2, 0] }
        ];
        
        surfaceConfigs.forEach(config => {
            const geometry = new THREE.PlaneGeometry(this.size, this.size);
            const material = new THREE.MeshStandardMaterial({ 
                color: config.color,
                side: THREE.DoubleSide,
                roughness: 0.8,
                metalness: 0.2
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...config.position);
            mesh.rotation.set(...config.rotation);
            mesh.receiveShadow = true;
            mesh.userData.surfaceName = config.name;
            
            this.surfaces[config.name] = mesh;
            this.group.add(mesh);
        });
        
        // Add edge outlines
        this.addEdges();
    }
    
    addEdges() {
        const edgeGeometry = new THREE.EdgesGeometry(
            new THREE.BoxGeometry(this.size, this.size, this.size)
        );
        const edgeMaterial = new THREE.LineBasicMaterial({ 
            color: 0xffffff, 
            opacity: 0.2, 
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
    
    addObject(object, surfaceName, localPosition) {
        const surface = this.surfaces[surfaceName];
        if (!surface) {
            console.error(`Surface ${surfaceName} not found`);
            return;
        }
        
        object.position.copy(localPosition);
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
                }
            }))
        };
    }
}

