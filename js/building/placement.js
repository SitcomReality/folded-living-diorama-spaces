import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getAssetById } from '../config/assets.js';

export class PlacementSystem {
    constructor(scene, cube) {
        this.scene = scene;
        this.cube = cube;
        this.previewObject = null;
        this.isPlacing = false;
        this.raycaster = new THREE.Raycaster();
        this.gltfLoader = new GLTFLoader();
        this.modelCache = new Map();
    }
    
    async startPlacement(assetId) {
        this.isPlacing = true;
        this.currentAssetId = assetId;
        await this.createPreview(assetId);
    }
    
    async createPreview(assetId) {
        const asset = getAssetById(assetId);
        
        if (!asset) {
            console.error(`Asset ${assetId} not found`);
            return;
        }
        
        // Remove existing preview
        if (this.previewObject) {
            this.scene.remove(this.previewObject);
            this.previewObject = null;
        }
        
        // Create preview based on asset type
        if (asset.modelPath) {
            // Load GLTF model
            try {
                const model = await this.loadModel(asset.modelPath);
                this.previewObject = model;
                
                // Make it semi-transparent for preview
                this.previewObject.traverse((child) => {
                    if (child.isMesh) {
                        child.material = child.material.clone();
                        child.material.transparent = true;
                        child.material.opacity = 0.6;
                        child.material.emissive = new THREE.Color(0x4a9eff);
                        child.material.emissiveIntensity = 0.3;
                    }
                });
                
                this.scene.add(this.previewObject);
            } catch (error) {
                console.error('Failed to load model:', error);
                this.createFallbackPreview();
            }
        } else {
            this.createFallbackPreview();
        }
    }
    
    createFallbackPreview() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x4a9eff,
            transparent: true,
            opacity: 0.5
        });
        
        this.previewObject = new THREE.Mesh(geometry, material);
        this.scene.add(this.previewObject);
    }
    
    async loadModel(path) {
        // Check cache first
        if (this.modelCache.has(path)) {
            return this.modelCache.get(path).clone();
        }
        
        // Load model
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                path,
                (gltf) => {
                    const model = gltf.scene;
                    this.modelCache.set(path, model);
                    resolve(model.clone());
                },
                undefined,
                reject
            );
        });
    }
    
    updatePreview(camera, mousePos) {
        if (!this.isPlacing || !this.previewObject) return;
        
        this.raycaster.setFromCamera(mousePos, camera);
        
        const surfaces = Object.values(this.cube.surfaces);
        const intersects = this.raycaster.intersectObjects(surfaces, true); // Intersect children too
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            this.previewObject.position.copy(hit.point);
            
            // Align to surface normal
            const normalMatrix = new THREE.Matrix4();
            normalMatrix.lookAt(hit.point, hit.point.clone().add(hit.face.normal), new THREE.Vector3(0, 1, 0));
            this.previewObject.quaternion.setFromRotationMatrix(normalMatrix);

            this.previewObject.visible = true;
        } else {
            this.previewObject.visible = false;
        }
    }
    
    async placeObject() {
        if (!this.isPlacing || !this.previewObject || !this.previewObject.visible) {
            return null;
        }
        
        const asset = getAssetById(this.currentAssetId);
        if (!asset) {
            console.error('Asset not found for placement:', this.currentAssetId);
            return null;
        }
        let object;
        
        // Create actual object
        if (asset.modelPath) {
            try {
                object = await this.loadModel(asset.modelPath);
                
                // Enable shadows on all meshes
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
            } catch (error) {
                console.error('Failed to load model for placement:', error);
                return null;
            }
        } else {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: 0x4a9eff });
            object = new THREE.Mesh(geometry, material);
            object.castShadow = true;
        }
        
        object.position.copy(this.previewObject.position);
        object.rotation.copy(this.previewObject.rotation);
        object.userData.assetId = this.currentAssetId;
        
        // Find which surface this is on
        const surfaceName = this.findSurfaceForPosition(object.position);
        if (surfaceName) {
            const localPos = this.worldToLocal(object.position, surfaceName);
            const localRot = this.worldToLocalRotation(object.rotation, surfaceName);
            
            // Set position and rotation in local space
            object.position.copy(localPos);
            object.rotation.copy(localRot);
            
            this.cube.addObject(object, surfaceName, localPos);
        }
        
        return object;
    }
    
    findSurfaceForPosition(worldPos) {
        // Determine which surface is closest
        let closestSurface = null;
        let minDistance = Infinity;
        
        Object.entries(this.cube.surfaces).forEach(([name, surface]) => {
            const surfaceWorldPos = new THREE.Vector3();
            surface.getWorldPosition(surfaceWorldPos);
            const distance = worldPos.distanceTo(surfaceWorldPos);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestSurface = name;
            }
        });
        
        return closestSurface;
    }
    
    worldToLocal(worldPos, surfaceName) {
        const surface = this.cube.surfaces[surfaceName];
        const localPos = surface.worldToLocal(worldPos.clone());
        return localPos;
    }
    
    worldToLocalRotation(worldRot, surfaceName) {
        const surface = this.cube.surfaces[surfaceName];
        // Create a dummy object to help with rotation conversion
        const dummy = new THREE.Object3D();
        dummy.rotation.copy(worldRot);
        surface.worldToLocal(dummy.position.set(0, 0, 0));
        
        // For now, keep the world rotation as-is
        // This will be refined based on surface orientation
        return worldRot.clone();
    }
    
    cancelPlacement() {
        this.isPlacing = false;
        if (this.previewObject) {
            this.scene.remove(this.previewObject);
            this.previewObject = null;
        }
    }
}