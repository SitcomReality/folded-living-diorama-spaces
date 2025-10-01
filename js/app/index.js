import { setupCore } from './setupCore.js';
import { setupCube } from './setupCube.js';
import { setupSystems } from './setupSystems.js';
import { setupInput } from './setupInput.js';
import * as THREE from 'three';

export class FoldedLivingApp {
    constructor() {
        setupCore(this);
        setupCube(this);
        setupSystems(this);
        setupInput(this);
        this.initialize();
    }

    async initialize() {
        const loadingOverlay = document.getElementById('loading');
        try {
            await this.databaseManager.initialize();
            const reward = this.economyManager.claimDailyReward();
            if (reward > 0) this.hudManager.showNotification(`Daily reward claimed: ${reward} ✨`);
            const savedData = this.saveManager.loadFromLocalStorage();
            if (savedData) await this.loadCubeData(savedData);
            this.outlinerManager.populate(this.cube.placedObjects.map(item => item.object));
            this.camera.setDefaultPosition();
            await new Promise(r => setTimeout(r, 500));
            await this.foldingAnimator.unfold();
            this.animationLoop.add((dt) => this.update(dt));
            this.animationLoop.start();
            loadingOverlay.classList.add('hidden');
            this.historyManager.push(this.getSnapshot());
            this.updateHistoryButtons();
        } catch (error) {
            console.error('Failed to initialize:', error);
            loadingOverlay.innerHTML = '<p>Error loading application</p>';
        }
    }

    async loadCubeData(data) {
        if (data.settings) this.settingsManager.applySettings(data.settings);
        if (Array.isArray(data.objects)) {
            const { getAssetById } = await import('../config/assets.js');
            for (const item of data.objects) {
                let object;
                const asset = getAssetById(item.assetId);
                if (asset && asset.modelPath) {
                    object = await this.placementSystem.loadModel(asset.modelPath);
                    object.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
                } else {
                    object = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshStandardMaterial({ color: 0x4a9eff }));
                    object.castShadow = true;
                }
                object.userData.assetId = item.assetId;
                this.cube.addObject(object, item.surface, new THREE.Vector3(item.position.x, item.position.y, item.position.z));
                if (item.rotation) object.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z);
                if (item.scale) object.scale.set(item.scale.x, item.scale.y, item.scale.z);
                if (item.assetId) this.budgetManager.addAsset(item.assetId);
            }
        }
        this.outlinerManager.populate(this.cube.placedObjects.map(item => item.object));
    }

    resetCube() {
        this.cube.placedObjects.slice().forEach(item => { this.cube.removeObject(item.object); });
        this.budgetManager.currentPolyCount = 0;
        this.budgetManager.currentLightCount = 0;
        this.budgetManager.notifyListeners();
        this.outlinerManager.clear();
        this.settingsManager.applySettings(this.settingsManager.createDefaultSettings());
        this.historyManager.push(this.getSnapshot());
    }

    getSnapshot() { return this.saveManager.serializeCube(); }

    applySnapshot(data) {
        this.cube.placedObjects.slice().forEach(item => this.cube.removeObject(item.object));
        this.budgetManager.currentPolyCount = 0;
        this.budgetManager.currentLightCount = 0;
        this.budgetManager.notifyListeners();
        if (data.settings) this.settingsManager.applySettings(data.settings);
        if (Array.isArray(data.objects)) this.loadCubeData(data);
        this.outlinerManager.populate(this.cube.placedObjects.map(item => item.object));
    }

    update() {
        const cls = document.body.classList;
        cls.remove('cursor-wait', 'cursor-crosshair', 'cursor-none', 'cursor-pointer');
        if (this.placementSystem.isLoadingAsset) {
            cls.add('cursor-wait');
        } else if (this.toolbarManager.getActiveTool() === 'place') {
            if (this.placementSystem.previewObject && this.placementSystem.previewObject.visible) cls.add('cursor-none');
            else cls.add('cursor-crosshair');
        } else if (this.toolbarManager.getActiveTool() === 'delete' || this.toolbarManager.getActiveTool() === 'move') {
            const hoveredObject = this.selectionSystem.highlightAt(this.camera.getCamera(), this.input.getMousePosition());
            if (hoveredObject) cls.add('cursor-pointer');
        } else {
            this.selectionSystem.clearHighlight();
        }

        if (this.toolbarManager.getActiveTool() === 'place') {
            const snapActive = this.toolbarManager.isSnapEnabled() || this.input.isKeyPressed('shift');
            if (!this.placementSystem.isRotating) {
                this.placementSystem.updatePreview(this.camera.getCamera(), this.input.getMousePosition(), snapActive);
            }
        }
        this.renderer.render(this.scene.getScene(), this.camera.getCamera());
    }

    onToolSelected(toolId, assetId) {
        this.input.resetCursor();
        this.selectionSystem.clearHighlight();
        if (toolId === 'place') {
            if (assetId) this.placementSystem.startPlacement(assetId);
            else this.placementSystem.cancelPlacement();
        } else {
            this.placementSystem.cancelPlacement();
        }
    }

    async toggleFold() {
        if (this.cube.isFolded) await this.foldingAnimator.unfold();
        else await this.foldingAnimator.fold();
    }

    updateHistoryButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        undoBtn.disabled = !this.historyManager.canUndo();
        redoBtn.disabled = !this.historyManager.canRedo();
    }
}

