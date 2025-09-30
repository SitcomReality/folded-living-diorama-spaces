import { SceneManager } from './core/scene.js';
import { CameraController } from './core/camera.js';
import { RendererManager } from './core/renderer.js';
import { InputManager } from './core/input.js';
import { DioramaCube } from './cube/cube.js';
import { FoldingAnimator } from './cube/folding.js';
import { SurfaceManager } from './cube/surfaces.js';
import { PlacementSystem } from './building/placement.js';
import { SelectionSystem } from './building/selection.js';
import { BudgetManager } from './building/budget.js';
import { DatabaseManager } from './social/database.js';
import { EconomyManager } from './social/economy.js';
import { HUDManager } from './ui/hud.js';
import { ToolbarManager } from './ui/toolbar.js';
import { InspectorManager } from './ui/inspector.js';
import { GalleryManager } from './gallery/gallery.js';
import { TransitionManager } from './gallery/transitions.js';
import { AnimationLoop } from './utils/animation.js';

class FoldedLivingApp {
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
        this.placementSystem = new PlacementSystem(
            this.scene.getScene(),
            this.cube
        );
        
        this.selectionSystem = new SelectionSystem(
            this.scene.getScene(),
            this.cube
        );
        
        this.budgetManager = new BudgetManager();
    }
    
    setupSocial() {
        this.databaseManager = new DatabaseManager();
        this.economyManager = new EconomyManager();
    }
    
    setupUI() {
        this.hudManager = new HUDManager(this.economyManager, this.budgetManager);
        
        this.toolbarManager = new ToolbarManager(
            document.getElementById('toolbar'),
            (toolId, assetId) => this.onToolSelected(toolId, assetId)
        );
        
        this.inspectorManager = new InspectorManager();
        
        this.galleryManager = new GalleryManager(
            this.databaseManager,
            this.economyManager
        );
        
        this.transitionManager = new TransitionManager(this.camera);
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
                
                if (selected) {
                    this.inspectorManager.inspect(selected);
                }
            } else if (activeTool === 'place') {
                const placed = this.placementSystem.placeObject();
                if (placed) {
                    console.log('Object placed');
                }
            } else if (activeTool === 'delete') {
                this.selectionSystem.deleteSelected();
            }
        });
        
        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.placementSystem.cancelPlacement();
                this.selectionSystem.deselect();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                this.selectionSystem.deleteSelected();
            } else if (e.key === 'g') {
                this.scene.toggleGrid();
            }
        });
    }
    
    async initialize() {
        const loadingOverlay = document.getElementById('loading');
        
        try {
            // Initialize database
            await this.databaseManager.initialize();
            
            // Check for daily reward
            const reward = this.economyManager.claimDailyReward();
            if (reward > 0) {
                this.hudManager.showNotification(`Daily reward claimed: ${reward} ✨`);
            }
            
            // Start with cube folded, then unfold it
            await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause to see folded state
            
            // Unfold the cube
            await this.foldingAnimator.unfold();
            
            // Start render loop
            this.animationLoop.add((deltaTime) => this.update(deltaTime));
            this.animationLoop.start();
            
            // Hide loading
            loadingOverlay.classList.add('hidden');
            
            console.log('🎮 Folded Living initialized');
        } catch (error) {
            console.error('Failed to initialize:', error);
            loadingOverlay.innerHTML = '<p>Error loading application</p>';
        }
    }
    
    update(deltaTime) {
        // Update preview placement
        if (this.toolbarManager.getActiveTool() === 'place') {
            this.placementSystem.updatePreview(
                this.camera.getCamera(),
                this.input.getMousePosition()
            );
        }
        
        // Render
        this.renderer.render(
            this.scene.getScene(),
            this.camera.getCamera()
        );
    }
    
    onToolSelected(toolId, assetId) {
        console.log('Tool selected:', toolId, assetId);
        
        if (toolId === 'place') {
            // Start placement mode with selected asset
            if (assetId) {
                this.placementSystem.startPlacement(assetId);
            } else {
                // When place tool is clicked without an asset, don't default to a bed.
                // Instead, just wait for an asset to be selected.
                // The toolbar will show the picker.
                this.placementSystem.cancelPlacement(); // Clear any existing preview
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

// Initialize app when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.app = new FoldedLivingApp();
});