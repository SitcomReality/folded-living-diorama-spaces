import * as THREE from 'three';
import { CONSTANTS } from '../config/constants.js';

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // comforting blue sky
        this.currentSkybox = null;

        this.setupLighting();
        this.setupHelpers();
        this.setupGroundPlane();
    }

    setupLighting() {
        // Warm ambient light
        const ambient = new THREE.AmbientLight(0xfff5e6, 0.6);
        ambient.userData.type = 'ambient';
        this.scene.add(ambient);

        // Warm key light
        const keyLight = new THREE.DirectionalLight(0xfff0d4, 0.7);
        keyLight.position.set(5, 10, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.userData.type = 'key';
        this.scene.add(keyLight);

        // Soft fill light
        const fillLight = new THREE.DirectionalLight(0xd4e6ff, 0.25);
        fillLight.position.set(-5, 5, -5);
        fillLight.userData.type = 'fill';
        this.scene.add(fillLight);

        // Subtle rim light for depth
        const rimLight = new THREE.DirectionalLight(0xffe8cc, 0.3);
        rimLight.position.set(0, 3, -10);
        rimLight.userData.type = 'rim';
        this.scene.add(rimLight);
    }

    setupHelpers() {
        // Grid helper (hidden by default)
        this.gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
        this.gridHelper.visible = false;
        this.scene.add(this.gridHelper);
    }

    setupGroundPlane() {
        const half = CONSTANTS.CUBE_SIZE / 2;
        const groundOffset = CONSTANTS.CUBE_THICKNESS + 0.05;
        const geo = new THREE.PlaneGeometry(200, 200);
        const mat = new THREE.MeshStandardMaterial({ color: 0x6fbf73, roughness: 1, metalness: 0 }); // grassy green
        this.groundPlane = new THREE.Mesh(geo, mat);
        this.groundPlane.rotation.x = -Math.PI / 2;
        this.groundPlane.position.y = -half - groundOffset;
        this.groundPlane.receiveShadow = true;
        this.scene.add(this.groundPlane);
    }

    setGroundColor(color) { 
        if (this.groundPlane) this.groundPlane.material.color.set(color); 
    }

    setGroundVisible(visible) {
        if (this.groundPlane) this.groundPlane.visible = visible;
    }

    setGroundOffset(thickness) {
        const half = CONSTANTS.CUBE_SIZE / 2;
        const padding = 0.05;
        if (this.groundPlane) this.groundPlane.position.y = -half - (thickness + padding);
    }

    updateSunPosition(azimuth, inclination) { // angles in degrees
        let keyLight = null;
        this.scene.traverse(obj => {
            if (obj.isLight && obj.userData.type === 'key') {
                keyLight = obj;
            }
        });

        if (!keyLight) return;

        const radius = 20; // A fixed distance for the light source position

        // inclination is 0-90 degrees (0 to PI/2). 0 is horizon, 90 is overhead.
        // azimuth is 0-360 degrees (0 to 2*PI).

        const phi = THREE.MathUtils.degToRad(90 - inclination); // polar angle from y-axis
        const theta = THREE.MathUtils.degToRad(azimuth); // azimuthal angle around y-axis

        keyLight.position.setFromSphericalCoords(radius, phi, theta);
    }

    async loadSkybox(skyboxId) {
        if (!skyboxId) {
            // Remove skybox, use flat color
            this.currentSkybox = null;
            this.scene.background = new THREE.Color(0x87ceeb);
            return;
        }

        const loader = new THREE.CubeTextureLoader();
        const basePath = `/assets/img/sky/${skyboxId}_cubemap_2k/`;

        try {
            const texture = await loader.loadAsync([
                basePath + 'px.png',
                basePath + 'nx.png',
                basePath + 'py.png',
                basePath + 'ny.png',
                basePath + 'pz.png',
                basePath + 'nz.png'
            ]);

            this.scene.background = texture;
            this.currentSkybox = skyboxId;
        } catch (error) {
            console.error('Failed to load skybox:', error);
            // Fallback to color
            this.scene.background = new THREE.Color(0x87ceeb);
            this.currentSkybox = null;
        }
    }

    setBackgroundColor(color) {
        // Only set if not using skybox
        if (!this.currentSkybox) {
            this.scene.background = new THREE.Color(color);
        }
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