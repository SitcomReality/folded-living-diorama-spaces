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
        const material = new THREE.LineBasicMaterial({ color: 0x4a9eff, linewidth: 2 });
        this.highlightBox = new THREE.LineSegments(edges, material);
        this.highlightBox.visible = false;
        this.scene.add(this.highlightBox);
    }
    
    selectAt(camera, mousePos) {
        this.raycaster.setFromCamera(mousePos, camera);
        
        const objects = this.cube.placedObjects.map(item => item.object);
        const intersects = this.raycaster.intersectObjects(objects);
        
        if (intersects.length > 0) {
            this.select(intersects[0].object);
            return intersects[0].object;
        } else {
            this.deselect();
            return null;
        }
    }
    
    select(object) {
        this.selectedObject = object;
        
        // Update highlight box
        const box = new THREE.Box3().setFromObject(object);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        
        this.highlightBox.scale.copy(size);
        this.highlightBox.position.copy(center);
        this.highlightBox.visible = true;
    }
    
    deselect() {
        this.selectedObject = null;
        this.highlightBox.visible = false;
    }
    
    getSelected() {
        return this.selectedObject;
    }
    
    deleteSelected() {
        if (this.selectedObject) {
            this.cube.removeObject(this.selectedObject);
            this.deselect();
        }
    }
}

