import * as THREE from 'three';

export class SelectionSystem {
    constructor(scene, cube) {
        this.scene = scene;
        this.cube = cube;
        this.selectedObject = null;
        this.raycaster = new THREE.Raycaster();
        this.highlightBox = null;
        
        this.createHighlightBox();
    }
    
    createHighlightBox() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: 0xe89b6f, linewidth: 2, transparent: true, opacity: 0.8 });
        this.highlightBox = new THREE.LineSegments(edges, material);
        this.highlightBox.visible = false;
        this.scene.add(this.highlightBox);
    }
    
    getObjectAt(camera, mousePos) {
        this.raycaster.setFromCamera(mousePos, camera);
        
        const objects = this.cube.placedObjects.map(item => item.object);
        const intersects = this.raycaster.intersectObjects(objects, true);
        
        if (intersects.length > 0) {
            let hitObject = intersects[0].object;
            // Find the root placed object by traversing up
            while (hitObject && !this.cube.placedObjects.find(item => item.object === hitObject)) {
                hitObject = hitObject.parent;
            }
            return hitObject;
        }
        return null;
    }

    highlightAt(camera, mousePos) {
        const hitObject = this.getObjectAt(camera, mousePos);
        if (hitObject) {
            // Don't re-highlight the already selected object
            if (hitObject !== this.selectedObject) {
                this.highlight(hitObject);
            }
            return hitObject;
        }
        
        // If not hovering over anything, clear highlight unless an object is selected
        if (!this.selectedObject) {
            this.clearHighlight();
        }
        return null;
    }
    
    selectAt(camera, mousePos) {
        const hitObject = this.getObjectAt(camera, mousePos);
        if (hitObject) {
            this.select(hitObject);
            return hitObject;
        }
        
        this.deselect();
        return null;
    }
    
    select(object) {
        this.selectedObject = object;
        this.highlight(object);
    }
    
    highlight(object) {
        if (!object) {
            this.clearHighlight();
            return;
        }
        const box = new THREE.Box3().setFromObject(object);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        
        this.highlightBox.scale.copy(size).multiplyScalar(1.05);
        this.highlightBox.position.copy(center);
        this.highlightBox.visible = true;
    }

    clearHighlight() {
        this.highlightBox.visible = false;
    }
    
    deselect() {
        this.selectedObject = null;
        this.clearHighlight();
    }
    
    getSelected() {
        return this.selectedObject;
    }

    deleteObject(object) {
        if (object) {
            const objectData = this.cube.placedObjects.find(item => item.object === object);
            if (objectData) {
                const assetId = object.userData.assetId;
                this.cube.removeObject(object);
                if (this.selectedObject === object) {
                    this.deselect();
                } else {
                    this.clearHighlight();
                }
                return assetId;
            }
        }
        return null;
    }
    
    deleteSelected() {
        if (this.selectedObject) {
            return this.deleteObject(this.selectedObject);
        }
        return null;
    }
}