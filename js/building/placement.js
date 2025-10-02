import * as THREE from 'three';
import { assetLibrary, getAssetById } from '../config/assets.js';

export class PlacementSystem {
    constructor(scene, cube) {
        this.scene = scene;
        this.cube = cube;
        this.previewObject = null;
        this.isPlacing = false;
        this.isLoadingAsset = false;
        this.raycaster = new THREE.Raycaster();
        this.lastHitSurfaceName = null;
        this.previewYaw = 0;
        this.appliedYaw = 0;
        this.isRotating = false;
        this.baseQuat = null;
        this.anchorWorldPos = null;

        this.isMoving = false;
        this.moveOriginalState = null;
    }
    
    async startPlacement(assetId) {
        this.isLoadingAsset = true;
        this.isPlacing = true;
        this.currentAssetId = assetId;

        // Allow UI to update before potential blocking from loading
        await new Promise(resolve => setTimeout(resolve, 10));
        
        await this.createPreview(assetId);
        
        this.isLoadingAsset = false;
    }
    
    async startMove(objectToMove) {
        const objectData = this.cube.placedObjects.find(item => item.object === objectToMove);
        if (!objectData) return;

        this.isMoving = true;
        this.moveOriginalState = {
            object: objectToMove,
            surfaceName: objectData.surface,
            position: objectToMove.position.clone(),
            quaternion: objectToMove.quaternion.clone()
        };

        const assetId = objectToMove.userData.assetId;

        // Capture the object's world rotation to extract yaw
        const worldQuaternion = objectToMove.getWorldQuaternion(new THREE.Quaternion());
        // Objects were appearing flipped when picked up — rotate captured yaw by 180° so the preview faces correctly.
        const worldEuler = new THREE.Euler().setFromQuaternion(worldQuaternion, 'YXZ');
        this.previewYaw = worldEuler.y + Math.PI;

        this.cube.removeObject(objectToMove);
        window.app.outlinerManager.removeObject(objectToMove);
        window.app.selectionSystem.deselect();
        window.app.inspectorManager.hide();
        
        await this.startPlacement(assetId);
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
        // Models are preloaded, so this should be fast
        return assetLibrary.loadModel(path);
    }
    
    updatePreview(camera, mousePos, snapActive = false) {
        if (!this.isPlacing || !this.previewObject) return;
        
        // keep position fixed while rotating
        if (this.isRotating && this.anchorWorldPos && this.baseQuat) {
            const targetYaw = snapActive ? Math.round(this.previewYaw / (Math.PI/4)) * (Math.PI/4) : this.previewYaw;
            const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetYaw);
            this.previewObject.quaternion.copy(qYaw).multiply(this.baseQuat);
            this.previewObject.position.copy(this.anchorWorldPos);
            this.previewObject.visible = true;
            return;
        }
        
        this.raycaster.setFromCamera(mousePos, camera);
        
        const surfaces = Object.values(this.cube.surfaces);
        const intersects = this.raycaster.intersectObjects(surfaces, true);
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            
            // 1. Calculate Base Orientation (aligned with surface normal, but Y axis up)
            const normalMatrix = new THREE.Matrix4();
            normalMatrix.lookAt(hit.point, hit.point.clone().add(hit.face.normal), new THREE.Vector3(0, 1, 0));
            const qBase = new THREE.Quaternion().setFromRotationMatrix(normalMatrix);

            const surfaceName = (hit.object.userData && hit.object.userData.surfaceName) 
                || (hit.object.parent && hit.object.parent.userData && hit.object.parent.userData.surfaceName) 
                || null;

            if (surfaceName === 'left' || surfaceName === 'right') {
                const flipQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
                qBase.multiply(flipQuat);
            }

            this.baseQuat = qBase.clone();

            // 2. Calculate Yaw Rotation (World Y axis rotation based on user input)
            const targetYaw = snapActive ? Math.round(this.previewYaw / (Math.PI/4)) * (Math.PI/4) : this.previewYaw;
            this.appliedYaw = targetYaw;

            const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetYaw);

            // 3. Combine rotations: Apply yaw rotation *to* the base orientation.
            // Q_final = Q_yaw * Q_base
            this.previewObject.quaternion.copy(qYaw).multiply(qBase);
            
            this.lastHitSurfaceName = surfaceName;
            // position snapping
            const surface = this.cube.surfaces[this.lastHitSurfaceName];
            if (surface) {
                const cell = this.cube.size / 8;
                const local = surface.worldToLocal(hit.point.clone());
                if (snapActive) {
                    local.x = Math.round(local.x / cell) * cell;
                    local.y = Math.round(local.y / cell) * cell;
                }
                const snappedWorld = surface.localToWorld(local);
                this.previewObject.position.copy(snappedWorld);
                this.anchorWorldPos = snappedWorld.clone();
            } else {
                this.previewObject.position.copy(hit.point);
            }
            
            this.previewObject.visible = true;
        } else {
            this.previewObject.visible = false;
            this.lastHitSurfaceName = null;
        }
    }
    
    async placeObject() {
        if (!this.isPlacing || !this.previewObject || !this.previewObject.visible) {
            this.cancelPlacement();
            return null;
        }
        
        const surfaceName = this.lastHitSurfaceName;
        if (!surfaceName) return null;
        
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
                object.traverse((child) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
            } catch (error) { console.error('Failed to load model for placement:', error); return null; }
        } else {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: 0x4a9eff });
            object = new THREE.Mesh(geometry, material); object.castShadow = true;
        }
        
        // Copy exact ghost transform (world-aligned since preview is in scene root)
        object.position.copy(this.previewObject.position);
        object.quaternion.copy(this.previewObject.quaternion);
        object.scale.copy(this.previewObject.scale);
        object.userData.assetId = this.currentAssetId;
        
        // Add, then reparent to surface while preserving world transform
        this.scene.add(object);
        const surface = this.cube.surfaces[surfaceName];
        surface.attach(object);
        
        // Orientation fixes: ensure placed objects face inward on vertical walls and sit on the floor correctly
        const settings = window.app?.settingsManager?.getSettings?.();
        if (surfaceName === 'floor') {
            // Rotate 90° so the object's bottom aligns with the floor
            object.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        } else if (surfaceName === 'left' || surfaceName === 'right') {
            const orientation = settings?.surfaces?.[surfaceName]?.orientation;
            if (orientation === 'up') {
                // Flip to face inward when wall is vertical
                object.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI);
            }
        }
        
        // Track via cube with current local position
        this.cube.addObject(object, surfaceName, object.position.clone());
        
        return object;
    }
    
    completeMove() {
        if (!this.isMoving) return;
        console.log('Move complete');
        this.isMoving = false;
        this.moveOriginalState = null;
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
        this.isLoadingAsset = false;
        if (this.previewObject) {
            this.scene.remove(this.previewObject);
            this.previewObject = null;
        }

        if (this.isMoving && this.moveOriginalState) {
            console.log('Move cancelled, restoring object.');
            const { object, surfaceName, position, quaternion } = this.moveOriginalState;
            const surface = this.cube.surfaces[surfaceName];
            if (surface) {
                // Re-add to the scene, reparent, then set original local transform
                this.scene.add(object);
                surface.attach(object);
                object.position.copy(position);
                object.quaternion.copy(quaternion);
                this.cube.addObject(object, surfaceName, position);
                window.app.outlinerManager.addObject(object);
            }
        }
        
        this.isMoving = false;
        this.moveOriginalState = null;

        this.previewYaw = 0;
        this.isRotating = false;
        this.baseQuat = null;
        this.anchorWorldPos = null;
    }
    
    rotateByDelta(deltaX, snapActive = false) {
        if (!this.isPlacing || !this.previewObject || !this.previewObject.visible) return;
        this.isRotating = true;
        this.previewYaw += deltaX * Math.PI;
        const targetYaw = snapActive ? Math.round(this.previewYaw / (Math.PI/4)) * (Math.PI/4) : this.previewYaw;
        if (this.baseQuat) {
            const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetYaw);
            this.previewObject.quaternion.copy(qYaw).multiply(this.baseQuat);
        }
    }
    
    endRotation() { this.isRotating = false; }
    
    lockAnchor(camera, mousePos, snapActive = false) {
        if (!this.isPlacing || !this.previewObject) return;
        this.raycaster.setFromCamera(mousePos, camera);
        const intersects = this.raycaster.intersectObjects(Object.values(this.cube.surfaces), true);
        if (intersects.length === 0) return;
        const hit = intersects[0];
        const normalMatrix = new THREE.Matrix4().lookAt(hit.point, hit.point.clone().add(hit.face.normal), new THREE.Vector3(0,1,0));
        this.baseQuat = new THREE.Quaternion().setFromRotationMatrix(normalMatrix);
        // robustly resolve surface name up the hierarchy
        let obj = hit.object, surfaceName = null;
        while (obj && !surfaceName) { surfaceName = obj.userData?.surfaceName || null; obj = obj.parent; }
        this.lastHitSurfaceName = surfaceName;
        if (!this.lastHitSurfaceName) return; // no valid surface, abort anchoring
        const surface = this.cube.surfaces[this.lastHitSurfaceName];
        if (!surface) return;
        const cell = this.cube.size / 8;
        const local = surface.worldToLocal(hit.point.clone());
        if (snapActive) { local.x = Math.round(local.x / cell) * cell; local.y = Math.round(local.y / cell) * cell; }
        this.anchorWorldPos = surface.localToWorld(local);
        this.previewObject.position.copy(this.anchorWorldPos);
        this.isRotating = true;
    }
}