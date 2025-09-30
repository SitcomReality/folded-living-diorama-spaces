import * as THREE from 'three';
import { CONSTANTS } from '../config/constants.js';

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        
        this.setupLighting();
        this.setupHelpers();
    }
    
    setupLighting() {
        // Warm ambient light
        const ambient = new THREE.AmbientLight(0xfff5e6, 0.6);
        this.scene.add(ambient);
        
        // Warm key light
        const keyLight = new THREE.DirectionalLight(0xfff0d4, 0.7);
        keyLight.position.set(5, 10, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        this.scene.add(keyLight);
        
        // Soft fill light
        const fillLight = new THREE.DirectionalLight(0xd4e6ff, 0.25);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
        
        // Subtle rim light for depth
        const rimLight = new THREE.DirectionalLight(0xffe8cc, 0.3);
        rimLight.position.set(0, 3, -10);
        this.scene.add(rimLight);
    }
    
    setupHelpers() {
        // Grid helper (hidden by default)
        this.gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
        this.gridHelper.visible = false;
        this.scene.add(this.gridHelper);
    }
    
    add(object) {
        this.scene.add(object);
    }
    
    remove(object) {
        this.scene.remove(object);
    }
    
    getScene() {
        return this.scene;
    }
    
    toggleGrid() {
        this.gridHelper.visible = !this.gridHelper.visible;
    }
}