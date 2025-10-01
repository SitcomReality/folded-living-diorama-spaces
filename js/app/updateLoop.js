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
    let dx = 0;
    let dy = 0;
    
    if (im.isKeyPressed('a') || im.isKeyPressed('arrowleft')) dx += 1;
    if (im.isKeyPressed('d') || im.isKeyPressed('arrowright')) dx -= 1;
    if (im.isKeyPressed('w') || im.isKeyPressed('arrowup')) dy += 1;
    if (im.isKeyPressed('s') || im.isKeyPressed('arrowdown')) dy -= 1;
    
    if (dx || dy) {
        app.camera.pan(dx * speed * (dt || 0.016), dy * speed * (dt || 0.016));
    }
}

