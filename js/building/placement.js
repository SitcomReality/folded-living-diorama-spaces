import * as THREE from 'three';

export class PlacementSystem {
    constructor(scene, cube) {
        this.scene = scene;
        this.cube = cube;
        this.previewObject = null;
        this.isPlacing = false;
        this.raycaster = new THREE.Raycaster();
    }
    
    startPlacement(assetId) {
        this.isPlacing = true;
        this.currentAssetId = assetId;
        this.createPreview(assetId);
    }
    
    createPreview(assetId) {
        // Create a simple preview based on asset type
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x4a9eff,
            transparent: true,
            opacity: 0.5
        });
        
        this.previewObject = new THREE.Mesh(geometry, material);
        this.scene.add(this.previewObject);
    }
    
    updatePreview(camera, mousePos) {
        if (!this.isPlacing || !this.previewObject) return;
        
        this.raycaster.setFromCamera(mousePos, camera);
        
        const surfaces = Object.values(this.cube.surfaces);
        const intersects = this.raycaster.intersectObjects(surfaces);
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            this.previewObject.position.copy(hit.point);
            this.previewObject.visible = true;
        } else {
            this.previewObject.visible = false;
        }
    }
    
    placeObject() {
        if (!this.isPlacing || !this.previewObject || !this.previewObject.visible) {
            return null;
        }
        
        // Create actual object
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x4a9eff });
        const object = new THREE.Mesh(geometry, material);
        
        object.position.copy(this.previewObject.position);
        object.castShadow = true;
        object.userData.assetId = this.currentAssetId;
        
        // Find which surface this is on
        const surfaceName = this.findSurfaceForPosition(object.position);
        if (surfaceName) {
            const localPos = this.worldToLocal(object.position, surfaceName);
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
    
    cancelPlacement() {
        this.isPlacing = false;
        if (this.previewObject) {
            this.scene.remove(this.previewObject);
            this.previewObject = null;
        }
    }
}

