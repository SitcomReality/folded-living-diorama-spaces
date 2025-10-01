export function createUpdateLoop(app) {
    return (dt) => {
        updateCursorState(app);
        updatePlacementPreview(app);
        handleKeyboardPanning(app, dt);
        
        app.renderer.render(app.scene.getScene(), app.camera.getCamera());
    };
}

function updateCursorState(app) {
    const cls = document.body.classList;
    cls.remove('cursor-wait', 'cursor-crosshair', 'cursor-none', 'cursor-pointer');
    
    if (app.placementSystem.isLoadingAsset) {
        cls.add('cursor-wait');
    } else if (app.toolbarManager.getActiveTool() === 'place') {
        if (app.placementSystem.previewObject && app.placementSystem.previewObject.visible) {
            cls.add('cursor-none');
        } else {
            cls.add('cursor-crosshair');
        }
    } else if (app.toolbarManager.getActiveTool() === 'delete' || app.toolbarManager.getActiveTool() === 'move') {
        const hoveredObject = app.selectionSystem.highlightAt(
            app.camera.getCamera(),
            app.input.getMousePosition()
        );
        if (hoveredObject) {
            cls.add('cursor-pointer');
        }
    } else {
        app.selectionSystem.clearHighlight();
    }
}

function updatePlacementPreview(app) {
    if (app.toolbarManager.getActiveTool() === 'place') {
        const snapActive = app.toolbarManager.isSnapEnabled() || app.input.isKeyPressed('shift');
        
        if (!app.placementSystem.isRotating) {
            app.placementSystem.updatePreview(
                app.camera.getCamera(),
                app.input.getMousePosition(),
                snapActive
            );
        }
    }
}

function handleKeyboardPanning(app, dt) {
    const im = app.input;
    const speed = 600;
    
    // Horizontal pan: A/Left -> left, D/Right -> right (swapped from previous behavior)
    let h = 0;
    if (im.isKeyPressed('a') || im.isKeyPressed('arrowleft')) h -= 1;
    if (im.isKeyPressed('d') || im.isKeyPressed('arrowright')) h += 1;

    // Forward/back: W/Up -> forward (closer), S/Down -> backward (away)
    let vz = 0;
    if (im.isKeyPressed('w') || im.isKeyPressed('arrowup')) vz -= 1;
    if (im.isKeyPressed('s') || im.isKeyPressed('arrowdown')) vz += 1;

    if (h) {
        app.camera.pan(h * speed * (dt || 0.016), 0);
    }
    if (vz) {
        // scale to match wheel behavior (wheel used ~0.01 per delta)
        app.camera.zoom(vz * speed * (dt || 0.016) * 0.01);
    }
}