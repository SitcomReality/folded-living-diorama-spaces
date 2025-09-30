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
        this.orbitSpeed = 0.005;
        
        this.setupControls(renderer);
    }
    
    setupControls(renderer) {
        const canvas = renderer.domElement;
        
        let lastX = 0;
        let lastY = 0;
        
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                this.isOrbiting = true;
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (this.isOrbiting) {
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;
                
                this.orbit(deltaX, deltaY);
                
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            this.isOrbiting = false;
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
    }
    
    zoom(delta) {
        const offset = new THREE.Vector3();
        offset.copy(this.camera.position).sub(this.target);
        
        const distance = offset.length();
        const newDistance = Math.max(5, Math.min(50, distance + delta));
        
        offset.normalize().multiplyScalar(newDistance);
        this.camera.position.copy(this.target).add(offset);
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

