import { setupCore } from './setupCore.js';
import { setupCube } from './setupCube.js';
import { setupSystems } from './setupSystems.js';
import { setupInput } from './setupInput.js';
import { initializeApp, resetCube, getSnapshot, applySnapshot, updateHistoryButtons, loadCubeData } from './lifecycle.js';
import { createUpdateLoop } from './updateLoop.js';
import * as THREE from 'three';

export class FoldedLivingApp {
    constructor() {
        setupCore(this);
        setupCube(this);
        setupSystems(this);
        setupInput(this);
        this.startApp();
    }

    async startApp() {
        await initializeApp(this);
        const updateFn = createUpdateLoop(this);
        this.animationLoop.add(updateFn);
        this.animationLoop.start();
    }

    // Lifecycle methods
    resetCube() {
        resetCube(this);
    }

    getSnapshot() {
        return getSnapshot(this);
    }

    applySnapshot(data) {
        applySnapshot(this, data);
    }

    updateHistoryButtons() {
        updateHistoryButtons(this);
    }

    async loadCubeData(data) {
        await loadCubeData(this, data);
    }

    // Tool and interaction methods
    onToolSelected(toolId, assetId) {
        this.input.resetCursor();
        this.selectionSystem.clearHighlight();

        if (toolId === 'place') {
            if (assetId) {
                this.placementSystem.startPlacement(assetId);
            } else {
                this.placementSystem.cancelPlacement();
            }
        } else {
            this.placementSystem.cancelPlacement();
        }
    }

    async toggleFold() {
        if (this.cube.isFolded) {
            await this.foldingAnimator.unfold();
        } else {
            await this.foldingAnimator.fold();
        }
    }
}