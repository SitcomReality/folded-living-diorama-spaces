import { PlacementSystem } from '../building/placement.js';
import { SelectionSystem } from '../building/selection.js';
import { BudgetManager } from '../building/budget.js';
import { DatabaseManager } from '../social/database.js';
import { EconomyManager } from '../social/economy.js';
import { SaveManager } from '../social/save.js';
import { HUDManager } from '../ui/hud.js';
import { ToolbarManager } from '../ui/toolbar.js';
import { InspectorManager } from '../ui/inspector.js';
import { SettingsManager } from '../ui/settings.js';
import { GalleryManager } from '../gallery/gallery.js';
import { TransitionManager } from '../gallery/transitions.js';
import { HistoryManager } from '../ui/history.js';
import { OutlinerManager } from '../ui/outliner.js';
import { NamingModal } from '../ui/naming.js';

export function setupSystems(app) {
    app.placementSystem = new PlacementSystem(app.scene.getScene(), app.cube);
    app.selectionSystem = new SelectionSystem(app.scene.getScene(), app.cube);
    app.budgetManager = new BudgetManager();

    app.databaseManager = new DatabaseManager();
    app.economyManager = new EconomyManager();
    app.saveManager = new SaveManager(app.cube, app.databaseManager);

    app.namingModal = new NamingModal(app.saveManager);
    app.hudManager = new HUDManager(app.economyManager, app.budgetManager, app.saveManager, app.namingModal);
    app.toolbarManager = new ToolbarManager(document.getElementById('toolbar'), (toolId, assetId) => app.onToolSelected(toolId, assetId));
    app.inspectorManager = new InspectorManager();
    app.settingsManager = new SettingsManager(app.cube, app.scene, app.saveManager);
    app.galleryManager = new GalleryManager(app.databaseManager, app.economyManager);
    app.transitionManager = new TransitionManager(app.camera);
    app.historyManager = new HistoryManager(50);
    app.outlinerManager = new OutlinerManager();

    window.addEventListener('newCube', () => app.resetCube());
    document.getElementById('undo-btn').addEventListener('click', () => { const snap = app.historyManager.undo(); if (snap) app.applySnapshot(snap); app.updateHistoryButtons(); });
    document.getElementById('redo-btn').addEventListener('click', () => { const snap = app.historyManager.redo(); if (snap) app.applySnapshot(snap); app.updateHistoryButtons(); });
    document.getElementById('fold-btn').addEventListener('click', () => app.toggleFold());
    document.getElementById('hide-ui-btn').addEventListener('click', () => document.body.classList.toggle('ui-hidden'));
}