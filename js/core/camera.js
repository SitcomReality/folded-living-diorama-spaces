import * as THREE from 'three';
import { CONSTANTS } from '../config/constants.js';

export class CameraController {
    constructor(renderer) {
        this.camera = new THREE.PerspectiveCamera(
            CONSTANTS.CAMERA_FOV,
            window.innerWidth / window.innerHeight,
            CONSTANTS.CAMERA_NEAR,
            CONSTANTS.CAMERA_FAR
        );
        
        this.camera.position.set(
            CONSTANTS.CAMERA_DISTANCE,
            CONSTANTS.CAMERA_DISTANCE * 0.6,
            CONSTANTS.CAMERA_DISTANCE
        );
        this.camera.lookAt(0, 0, 0);
        
        this.target = new THREE.Vector3(0, 0, 0);
        this.isOrbiting = false;
        this.isPanning = false;
        this.orbitSpeed = 0.005;
        
        this.setupControls(renderer);
    }
    
    setupControls(renderer) {
        const canvas = renderer.domElement;
        
        let lastX = 0;
        let lastY = 0;
        
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        canvas.addEventListener('mousedown', (e) => {
            lastX = e.clientX;
            lastY = e.clientY;

            if (e.button === 2) { // Right click for Orbit (Rotate)
                this.isOrbiting = true;
                this.isPanning = false;
            } else if (e.button === 1) { // Middle click for Pan
                this.isPanning = true;
                this.isOrbiting = false;
            } else {
                this.isOrbiting = false; 
                this.isPanning = false;
            }
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (this.isOrbiting) {
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;
                
                this.orbit(deltaX, deltaY);
                
                lastX = e.clientX;
                lastY = e.clientY;
            } else if (this.isPanning) {
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;

                this.pan(deltaX, deltaY);
                
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });
        
        canvas.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this.isOrbiting = false;
            } else if (e.button === 1) {
                this.isPanning = false;
            }
        });
        
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.zoom(e.deltaY * 0.01);
        });
    }
    
    orbit(deltaX, deltaY) {
        const spherical = new THREE.Spherical();
        const offset = new THREE.Vector3();
        
        offset.copy(this.camera.position).sub(this.target);
        spherical.setFromVector3(offset);
        
        spherical.theta -= deltaX * this.orbitSpeed;
        spherical.phi -= deltaY * this.orbitSpeed;
        
        // Clamp vertical rotation
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        
        offset.setFromSpherical(spherical);
        this.camera.position.copy(this.target).add(offset);
        this.camera.lookAt(this.target);
        const minY = -CONSTANTS.CUBE_SIZE / 2 + 0.05;
        if (this.camera.position.y < minY) this.camera.position.y = minY;
    }
    
    pan(deltaX, deltaY) {
        // Pan sensitivity scaled by distance to target
        const panSpeed = 0.002 * this.camera.position.distanceTo(this.target);

        // 1. Calculate direction vectors
        const right = new THREE.Vector3();
        const offset = new THREE.Vector3().subVectors(this.camera.position, this.target);
        
        // Calculate screen right vector using cross product with camera.up (usually world up (0,1,0))
        right.crossVectors(offset, this.camera.up).normalize();
        
        // World up vector for vertical panning
        const up = new THREE.Vector3(0, 1, 0); 
        
        // 2. Calculate translation vectors
        // Horizontal movement (deltaX): along 'right' vector. Negative deltaX means moving scene right (camera left/negative right).
        const panRight = right.multiplyScalar(-deltaX * panSpeed);
        
        // Vertical movement (deltaY): along 'up' vector. Positive deltaY means moving scene down (camera up/positive up).
        const panUp = up.multiplyScalar(deltaY * panSpeed);

        const panVector = new THREE.Vector3().addVectors(panRight, panUp);

        // 3. Apply translation
        this.camera.position.add(panVector);
        this.target.add(panVector);
    }
    
    zoom(delta) {
        const offset = new THREE.Vector3();
        offset.copy(this.camera.position).sub(this.target);
        
        const distance = offset.length();
        const newDistance = Math.max(5, Math.min(50, distance + delta));
        
        offset.normalize().multiplyScalar(newDistance);
        this.camera.position.copy(this.target).add(offset);
        const minY = -CONSTANTS.CUBE_SIZE / 2 + 0.05;
        if (this.camera.position.y < minY) this.camera.position.y = minY;
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
    
    getCamera() {
        return this.camera;
    }
    
    setTarget(target) {
        this.target.copy(target);
        this.camera.lookAt(this.target);
    }
}