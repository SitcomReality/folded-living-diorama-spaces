import * as THREE from 'three';

export class RendererManager {
    constructor(container) {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: false
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        container.appendChild(this.renderer.domElement);
        
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    onWindowResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    render(scene, camera) {
        this.renderer.render(scene, camera);
    }
    
    getRenderer() {
        return this.renderer;
    }
}

