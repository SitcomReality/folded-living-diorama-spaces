import { getSnapshot, updateHistoryButtons } from './lifecycle.js';

export function setupInput(app) {
    const canvas = app.renderer.getRenderer().domElement;
    const canvasContainer = document.getElementById('canvas-container');

    canvas.addEventListener('click', async (e) => {
        if (e.button !== 0) return;
        const activeTool = app.toolbarManager.getActiveTool();
        if (activeTool === 'select') {
            const selected = app.selectionSystem.selectAt(app.camera.getCamera(), app.input.getMousePosition());
            if (selected) app.inspectorManager.inspect(selected);
            app.outlinerManager.highlight(selected ? selected.uuid : null);
        } else if (activeTool === 'place') {
            const placed = await app.placementSystem.placeObject();
            if (placed) {
                app.saveManager.autoSave();
                app.historyManager.push(getSnapshot(app));
                app.outlinerManager.addObject(placed);
                if (app.placementSystem.isMoving) app.placementSystem.completeMove();
            }
        } else if (activeTool === 'move') {
            const obj = app.selectionSystem.getObjectAt(app.camera.getCamera(), app.input.getMousePosition());
            if (obj) {
                app.placementSystem.startMove(obj);
                app.toolbarManager.selectTool('place', false);
            }
        } else if (activeTool === 'delete') {
            const selected = app.selectionSystem.getObjectAt(app.camera.getCamera(), app.input.getMousePosition());
            if (selected) {
                const assetId = app.selectionSystem.deleteObject(selected);
                if (assetId) {
                    app.budgetManager.removeAsset(assetId);
                    app.inspectorManager.hide();
                    app.saveManager.autoSave();
                    app.outlinerManager.removeObject(selected);
                }
            }
        }
    });

    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0 && app.toolbarManager.getActiveTool() === 'place') {
            const snapActive = app.toolbarManager.isSnapEnabled() || app.input.isKeyPressed('shift');
            app.placementSystem.lockAnchor(app.camera.getCamera(), app.input.getMousePosition(), snapActive);
            canvas.requestPointerLock();
        }
    });

    canvas.addEventListener('mouseup', async (e) => {
        if (e.button === 0 && app.toolbarManager.getActiveTool() === 'place') {
            document.exitPointerLock();
            const placed = await app.placementSystem.placeObject();
            if (placed) {
                app.saveManager.autoSave();
                app.historyManager.push(getSnapshot(app));
                app.outlinerManager.addObject(placed);
                if (app.placementSystem.isMoving) app.placementSystem.completeMove();
            }
        }
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) canvasContainer.classList.add('pointer-locked');
        else {
            canvasContainer.classList.remove('pointer-locked');
            app.placementSystem.endRotation();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === canvas && app.toolbarManager.getActiveTool() === 'place') {
            const snapActive = app.toolbarManager.isSnapEnabled() || app.input.isKeyPressed('shift');
            const dx = e.movementX / window.innerWidth;
            app.placementSystem.rotateByDelta(dx, snapActive);
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.body.classList.remove('ui-hidden');
            if (app.placementSystem.isMoving) {
                app.placementSystem.cancelPlacement();
                app.toolbarManager.selectTool('move');
            } else {
                app.placementSystem.cancelPlacement();
                app.selectionSystem.deselect();
                app.inspectorManager.hide();
                app.outlinerManager.highlight(null);
            }
        } else if (e.code === 'Space') {
            e.preventDefault();
            app.toggleFold();
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            const selected = app.selectionSystem.getSelected();
            const assetId = app.selectionSystem.deleteSelected();
            if (assetId) {
                app.budgetManager.removeAsset(assetId);
                app.inspectorManager.hide();
                app.saveManager.autoSave();
                app.historyManager.push(getSnapshot(app));
                updateHistoryButtons(app);
                app.outlinerManager.removeObject(selected);
            }
        } else if (e.key === 'g') {
            app.scene.toggleGrid();
        }
        
        if (e.altKey && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            document.body.classList.toggle('ui-hidden');
            return;
        }
        
        if (e.ctrlKey && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            const snap = e.shiftKey ? app.historyManager.redo() : app.historyManager.undo();
            if (snap) applySnapshot(app, snap);
            updateHistoryButtons(app);
        } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            const snap = app.historyManager.redo();
            if (snap) applySnapshot(app, snap);
            updateHistoryButtons(app);
        }
    });

    window.addEventListener('objectModified', () => {
        app.saveManager.autoSave();
        app.historyManager.push(getSnapshot(app));
        updateHistoryButtons(app);
    });
    
    window.addEventListener('settingsChanged', () => {
        app.saveManager.autoSave();
        app.historyManager.push(getSnapshot(app));
        updateHistoryButtons(app);
    });
    
    window.addEventListener('objectSelectedFromOutliner', (e) => {
        const object = e.detail;
        if (object) {
            app.selectionSystem.select(object);
            app.inspectorManager.inspect(object);
        } else {
            app.selectionSystem.deselect();
            app.inspectorManager.hide();
        }
    });
}

