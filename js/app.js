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
        
        window.addEventListener('newCube', () => this.resetCube());
    }

    setupInput() {
        const canvas = this.renderer.getRenderer().domElement;
        canvas.addEventListener('click', (e) => {
            if (e.button !== 0) return;
            const activeTool = this.toolbarManager.getActiveTool();
            if (activeTool === 'select') {
                const selected = this.selectionSystem.selectAt(
                    this.camera.getCamera(),
                    this.input.getMousePosition()
                );
                if (selected) this.inspectorManager.inspect(selected);
            } else if (activeTool === 'place') {
                if (this.input.didMouseMoveSinceMouseDown()) return;
                const placed = this.placementSystem.placeObject();
                if (placed) {
                    console.log('Object placed');
                    this.saveManager.autoSave();
                }
            } else if (activeTool === 'delete') {
                this.selectionSystem.deleteSelected();
                this.saveManager.autoSave();
            }
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.placementSystem.cancelPlacement();
                this.selectionSystem.deselect();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                this.selectionSystem.deleteSelected();
                this.saveManager.autoSave();
            } else if (e.key === 'g') {
                this.scene.toggleGrid();
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
                this.loadCubeData(savedData);
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.foldingAnimator.unfold();
            this.animationLoop.add((dt) => this.update(dt));
            this.animationLoop.start();
            loadingOverlay.classList.add('hidden');
            console.log('🎮 Folded Living initialized');
        } catch (error) {
            console.error('Failed to initialize:', error);
            loadingOverlay.innerHTML = '<p>Error loading application</p>';
        }
    }
    
    loadCubeData(data) {
        // Load cube objects and settings from saved data
        if (data.objects) {
            // TODO: Restore placed objects
        }
    }
    
    resetCube() {
        // Clear all objects and reset to default state
        this.cube.placedObjects.forEach(item => {
            this.cube.removeObject(item.object);
        });
        this.settingsManager.applySettings(this.settingsManager.createDefaultSettings());
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
            this.placementSystem.updatePreview(
                this.camera.getCamera(),
                this.input.getMousePosition()
            );
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
        if (toolId === 'fold') {
            this.toggleFold();
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