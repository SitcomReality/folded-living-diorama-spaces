import * as THREE from 'three';

export async function initializeApp(app) {
    const loadingOverlay = document.getElementById('loading');
    try {
        await app.databaseManager.initialize();

        const reward = app.economyManager.claimDailyReward();
        if (reward > 0) {
            app.hudManager.showNotification(`Daily reward claimed: ${reward} ✨`);
        }

        const savedData = app.saveManager.loadFromLocalStorage();
        if (savedData) {
            await loadCubeData(app, savedData);
        } else {
            // Apply initial random skybox settings for new cubes
            await app.settingsManager.applySettings(app.settingsManager.settings);
        }

        app.outlinerManager.populate(app.cube.placedObjects.map(item => item.object));
        app.camera.setDefaultPosition();

        await new Promise(r => setTimeout(r, 500));
        await app.foldingAnimator.unfold();

        loadingOverlay.classList.add('hidden');

        app.historyManager.push(getSnapshot(app));
        updateHistoryButtons(app);

    } catch (error) {
        console.error('Failed to initialize:', error);
        loadingOverlay.innerHTML = '<p>Error loading application</p>';
    }
}

export async function loadCubeData(app, data) {
    if (data.settings) {
        await app.settingsManager.applySettings(data.settings);
    }

    if (Array.isArray(data.objects)) {
        const { getAssetById } = await import('../config/assets.js');

        for (const item of data.objects) {
            let object;
            const asset = getAssetById(item.assetId);

            if (asset && asset.modelPath) {
                object = await app.placementSystem.loadModel(asset.modelPath);
                object.traverse(c => {
                    if (c.isMesh) {
                        c.castShadow = true;
                        c.receiveShadow = true;
                    }
                });
            } else {
                object = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 1, 1),
                    new THREE.MeshStandardMaterial({ color: 0x4a9eff })
                );
                object.castShadow = true;
            }

            object.userData.assetId = item.assetId;

            app.cube.addObject(
                object,
                item.surface,
                new THREE.Vector3(item.position.x, item.position.y, item.position.z)
            );

            if (item.rotation) {
                object.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z);
            }
            if (item.scale) {
                object.scale.set(item.scale.x, item.scale.y, item.scale.z);
            }
            if (item.assetId) {
                app.budgetManager.addAsset(item.assetId);
            }
        }
    }

    app.outlinerManager.populate(app.cube.placedObjects.map(item => item.object));
}

export function resetCube(app) {
    app.cube.placedObjects.slice().forEach(item => {
        app.cube.removeObject(item.object);
    });

    app.budgetManager.currentPolyCount = 0;
    app.budgetManager.currentLightCount = 0;
    app.budgetManager.notifyListeners();

    app.outlinerManager.clear();

    app.settingsManager.settings = app.settingsManager.createDefaultSettings();
    app.settingsManager.randomizeSkybox();
    app.settingsManager.applySettings(app.settingsManager.settings);

    app.historyManager.push(getSnapshot(app));
}

export function getSnapshot(app) {
    return app.saveManager.serializeCube();
}

export function applySnapshot(app, data) {
    app.cube.placedObjects.slice().forEach(item => {
        app.cube.removeObject(item.object);
    });

    app.budgetManager.currentPolyCount = 0;
    app.budgetManager.currentLightCount = 0;
    app.budgetManager.notifyListeners();

    if (data.settings) {
        app.settingsManager.applySettings(data.settings);
    }

    if (Array.isArray(data.objects)) {
        loadCubeData(app, data);
    }

    app.outlinerManager.populate(app.cube.placedObjects.map(item => item.object));
}

export function updateHistoryButtons(app) {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    undoBtn.disabled = !app.historyManager.canUndo();
    redoBtn.disabled = !app.historyManager.canRedo();
}