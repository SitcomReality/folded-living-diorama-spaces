import { SceneManager } from './core/scene.js';
import { CameraController } from './core/camera.js';
import { RendererManager } from './core/renderer.js';
import { InputManager } from './core/input.js';
import { DioramaCube } from './cube/cube.js';
import { FoldingAnimator } from './cube/folding/index.js';
import { SurfaceManager } from './cube/surfaces.js';
import { PlacementSystem } from './building/placement.js';
import { SelectionSystem } from './building/selection.js';
import { BudgetManager } from './building/budget.js';
import { DatabaseManager } from './social/database.js';
import { EconomyManager } from './social/economy.js';
import { SaveManager } from './social/save.js';
import { HUDManager } from './ui/hud.js';
import { ToolbarManager } from './ui/toolbar.js';
import { InspectorManager } from './ui/inspector.js';
import { SettingsManager } from './ui/settings.js';
import { GalleryManager } from './gallery/gallery.js';
import { TransitionManager } from './gallery/transitions.js';
import { NamingModal } from './ui/naming.js';
import { AnimationLoop } from './utils/animation.js';
import * as THREE from 'three';
import { HistoryManager } from './ui/history.js';
import { OutlinerManager } from './ui/outliner.js';

export class FoldedLivingApp {
    constructor() {
        this.setupCore();
        this.setupCube();
        this.setupBuilding();
        this.setupSocial();
        this.setupUI();
        this.setupInput();
        this.initialize();
    }

    setupCore() {
        const container = document.getElementById('canvas-container');
        this.renderer = new RendererManager(container);
        this.scene = new SceneManager();
        this.camera = new CameraController(this.renderer.getRenderer());
        this.input = new InputManager();
        this.animationLoop = new AnimationLoop();
    }

    setupCube() {
        this.cube = new DioramaCube();
        this.scene.add(this.cube.getGroup());
        this.foldingAnimator = new FoldingAnimator(this.cube);
        this.surfaceManager = new SurfaceManager(this.cube);
    }

    setupBuilding() {
        this.placementSystem = new PlacementSystem(this.scene.getScene(), this.cube);
        this.selectionSystem = new SelectionSystem(this.scene.getScene(), this.cube);
        this.budgetManager = new BudgetManager();
    }

    setupSocial() {
        this.databaseManager = new DatabaseManager();
        this.economyManager = new EconomyManager();
        this.saveManager = new SaveManager(this.cube, this.databaseManager);
    }

    setupUI() {
        this.namingModal = new NamingModal(this.saveManager);
        this.hudManager = new HUDManager(this.economyManager, this.budgetManager, this.saveManager, this.namingModal);
        this.toolbarManager = new ToolbarManager(
            document.getElementById('toolbar'),
            (toolId, assetId) => this.onToolSelected(toolId, assetId)
        );
        this.inspectorManager = new InspectorManager();
        this.settingsManager = new SettingsManager(this.cube, this.scene, this.saveManager);
        this.galleryManager = new GalleryManager(this.databaseManager, this.economyManager);
        this.transitionManager = new TransitionManager(this.camera);
        this.historyManager = new HistoryManager(50);
        this.outlinerManager = new OutlinerManager();
        
        window.addEventListener('newCube', () => this.resetCube());
        
        // Undo/Redo button handlers
        document.getElementById('undo-btn').addEventListener('click', () => {
            const snap = this.historyManager.undo();
            if (snap) this.applySnapshot(snap);
            this.updateHistoryButtons();
        });
        
        document.getElementById('redo-btn').addEventListener('click', () => {
            const snap = this.historyManager.redo();
            if (snap) this.applySnapshot(snap);
            this.updateHistoryButtons();
        });
        
        // Fold button handler (moved from toolbar)
        document.getElementById('fold-btn').addEventListener('click', () => {
            this.toggleFold();
        });
    }

    setupInput() {
        const canvas = this.renderer.getRenderer().domElement;
        const canvasContainer = document.getElementById('canvas-container');

        canvas.addEventListener('click', async (e) => {
            if (e.button !== 0) return;
            // removed: Do not place object if we just finished rotating
            // removed: if (this.input.didMouseMoveSinceMouseDown()) return;

            const activeTool = this.toolbarManager.getActiveTool();
            if (activeTool === 'select') {
                const selected = this.selectionSystem.selectAt(
                    this.camera.getCamera(),
                    this.input.getMousePosition()
                );
                if (selected) this.inspectorManager.inspect(selected);
                this.outlinerManager.highlight(selected ? selected.uuid : null);
            } else if (activeTool === 'place') {
                const placed = await this.placementSystem.placeObject();
                if (placed) {
                    console.log('Object placed');
                    this.saveManager.autoSave();
                    this.historyManager.push(this.getSnapshot());
                    this.outlinerManager.addObject(placed);
                }
            } else if (activeTool === 'delete') {
                // Select and delete in one action
                const selected = this.selectionSystem.selectAt(
                    this.camera.getCamera(),
                    this.input.getMousePosition()
                );
                if (selected) {
                    const assetId = this.selectionSystem.deleteSelected();
                    if (assetId) {
                        this.budgetManager.removeAsset(assetId);
                        this.inspectorManager.hide();
                        this.saveManager.autoSave();
                        this.outlinerManager.removeObject(selected);
                    }
                }
            }
        });
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0 && this.toolbarManager.getActiveTool() === 'place') {
                const snapActive = this.toolbarManager.isSnapEnabled() || this.input.isKeyPressed('shift');
                this.placementSystem.lockAnchor(this.camera.getCamera(), this.input.getMousePosition(), snapActive);
                canvas.requestPointerLock();
            }
        });
        canvas.addEventListener('mouseup', async (e) => {
            if (e.button === 0 && this.toolbarManager.getActiveTool() === 'place') {
                document.exitPointerLock();
                // Always place the object on mouse up when in placement mode
                const placed = await this.placementSystem.placeObject();
                if (placed) {
                    console.log('Object placed');
                    this.saveManager.autoSave();
                    this.historyManager.push(this.getSnapshot());
                    this.outlinerManager.addObject(placed);
                }
            }
        });

        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === canvas) {
                canvasContainer.classList.add('pointer-locked');
            } else {
                canvasContainer.classList.remove('pointer-locked');
                this.placementSystem.endRotation();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === canvas && this.toolbarManager.getActiveTool() === 'place') {
                const snapActive = this.toolbarManager.isSnapEnabled() || this.input.isKeyPressed('shift');
                const dx = e.movementX / window.innerWidth;
                this.placementSystem.rotateByDelta(dx, snapActive);
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.placementSystem.cancelPlacement();
                this.selectionSystem.deselect();
                this.inspectorManager.hide();
                this.outlinerManager.highlight(null);
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                const selected = this.selectionSystem.getSelected();
                const assetId = this.selectionSystem.deleteSelected();
                if (assetId) {
                    this.budgetManager.removeAsset(assetId);
                    this.inspectorManager.hide();
                    this.saveManager.autoSave();
                    this.historyManager.push(this.getSnapshot());
                    this.updateHistoryButtons();
                    this.outlinerManager.removeObject(selected);
                }
            } else if (e.key === 'g') {
                this.scene.toggleGrid();
            }
            // Undo / Redo
            if (e.ctrlKey && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                const snap = e.shiftKey ? this.historyManager.redo() : this.historyManager.undo();
                if (snap) this.applySnapshot(snap);
                this.updateHistoryButtons();
            } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                const snap = this.historyManager.redo();
                if (snap) this.applySnapshot(snap);
                this.updateHistoryButtons();
            }
        });
        
        // Listen for object modifications from inspector
        window.addEventListener('objectModified', () => {
            this.saveManager.autoSave();
            this.historyManager.push(this.getSnapshot());
            this.updateHistoryButtons();
        });
        window.addEventListener('settingsChanged', () => {
            this.saveManager.autoSave();
            this.historyManager.push(this.getSnapshot());
            this.updateHistoryButtons();
        });

        window.addEventListener('objectSelectedFromOutliner', (e) => {
            const object = e.detail;
            if (object) {
                this.selectionSystem.select(object);
                this.inspectorManager.inspect(object);
            } else {
                this.selectionSystem.deselect();
                this.inspectorManager.hide();
            }
        });
    }

    async initialize() {
        const loadingOverlay = document.getElementById('loading');
        try {
            await this.databaseManager.initialize();
            const reward = this.economyManager.claimDailyReward();
            if (reward > 0) {
                this.hudManager.showNotification(`Daily reward claimed: ${reward} ✨`);
            }
            
            const savedData = this.saveManager.loadFromLocalStorage();
            if (savedData) {
                await this.loadCubeData(savedData);
            }
            
            // Populate outliner with initial objects
            this.outlinerManager.populate(this.cube.placedObjects.map(item => item.object));
            
            // Ensure camera is in default front-facing position
            this.camera.setDefaultPosition();
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Unfold animation after camera is in position
            await this.foldingAnimator.unfold();
            
            this.animationLoop.add((dt) => this.update(dt));
            this.animationLoop.start();
            loadingOverlay.classList.add('hidden');
            this.historyManager.push(this.getSnapshot());
            this.updateHistoryButtons();
            console.log('🎮 Folded Living initialized');
        } catch (error) {
            console.error('Failed to initialize:', error);
            loadingOverlay.innerHTML = '<p>Error loading application</p>';
        }
    }
    
    async loadCubeData(data) {
        if (data.settings) this.settingsManager.applySettings(data.settings);
        if (Array.isArray(data.objects)) {
            const { getAssetById } = await import('./config/assets.js');
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
    }
    
    resetCube() {
        // Clear all objects and reset to default state
        this.cube.placedObjects.slice().forEach(item => {
            this.cube.removeObject(item.object);
        });
        this.budgetManager.currentPolyCount = 0;
        this.budgetManager.currentLightCount = 0;
        this.budgetManager.notifyListeners();
        this.outlinerManager.clear();
        this.settingsManager.applySettings(this.settingsManager.createDefaultSettings());
        this.historyManager.push(this.getSnapshot());
    }

    getSnapshot() {
        return this.saveManager.serializeCube();
    }
    
    applySnapshot(data) {
        // Clear objects and budgets
        this.cube.placedObjects.slice().forEach(item => this.cube.removeObject(item.object));
        this.budgetManager.currentPolyCount = 0;
        this.budgetManager.currentLightCount = 0;
        this.budgetManager.notifyListeners();
        // Apply settings then objects
        if (data.settings) this.settingsManager.applySettings(data.settings);
        if (Array.isArray(data.objects)) this.loadCubeData(data);
        this.outlinerManager.populate(this.cube.placedObjects.map(item => item.object));
    }

    update() {
        if (this.placementSystem.isLoadingAsset) {
            document.body.className = 'cursor-wait';
        } else if (this.toolbarManager.getActiveTool() === 'place') {
            if (this.placementSystem.previewObject && this.placementSystem.previewObject.visible) {
                document.body.className = 'cursor-none';
            } else {
                document.body.className = 'cursor-crosshair';
            }
        } else {
            document.body.className = '';
        }
        if (this.toolbarManager.getActiveTool() === 'place') {
            const snapActive = this.toolbarManager.isSnapEnabled() || this.input.isKeyPressed('shift');
            
            // Rotation is now handled by the new 'mousemove' listener when pointer is locked.
            // We only need to handle the preview update here when not rotating.
            if (!this.placementSystem.isRotating) {
                 this.placementSystem.updatePreview(
                    this.camera.getCamera(),
                    this.input.getMousePosition(),
                    snapActive
                );
            }
        }
        this.renderer.render(this.scene.getScene(), this.camera.getCamera());
    }

    onToolSelected(toolId, assetId) {
        console.log('Tool selected:', toolId, assetId);
        this.input.resetCursor();
        if (toolId === 'place') {
            if (assetId) {
                this.placementSystem.startPlacement(assetId);
            } else {
                this.placementSystem.cancelPlacement();
            }
        } else {
            this.placementSystem.cancelPlacement();
        }
        // Fold tool is now handled by the fold button, not the toolbar
    }

    async toggleFold() {
        if (this.cube.isFolded) {
            await this.foldingAnimator.unfold();
        } else {
            await this.foldingAnimator.fold();
        }
    }

    updateHistoryButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        undoBtn.disabled = !this.historyManager.canUndo();
        redoBtn.disabled = !this.historyManager.canRedo();
    }
}