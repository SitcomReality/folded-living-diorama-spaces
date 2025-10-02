import * as THREE from 'three';
import { CONSTANTS } from '../config/constants.js';
import { createDefaultSettings, getRandomSkybox, getSkyboxPreset } from './settings/state.js';
import { renderSettingsHTML } from './settings/render.js';
import { attachSettingsEvents } from './settings/events.js';
import { applyPreset, updateAmbientLight, updateBackgroundColor, updateGroundColor, loadSkybox, setGroundVisible, updateSunPosition } from './settings/environmentPresets.js';
import { toggleVisibility, updateColor, updateTexture, updateOrientation } from './settings/surfaceControls.js';

export class SettingsManager {
    constructor(cube, scene, saveManager) {
        this.cube = cube;
        this.scene = scene;
        this.saveManager = saveManager;
        this.panel = document.getElementById('settings-panel');
        this.content = this.panel.querySelector('.settings-content');
        this.openBtn = document.getElementById('settings-btn');
        this.closeBtn = document.getElementById('close-settings');

        this.settings = createDefaultSettings(cube);
        
        // Randomize skybox and set associated preset for new cubes
        this.randomizeSkybox();

        this.openBtn.addEventListener('click', () => this.open());
        this.closeBtn.addEventListener('click', () => this.close());

        this.renderSettings();
    }

    randomizeSkybox() {
        const skyboxId = getRandomSkybox();
        this.settings.environment.skybox = skyboxId;
        this.settings.environment.preset = getSkyboxPreset(skyboxId);
    }

    open() {
        this.panel.classList.add('open');
    }

    close() {
        this.panel.classList.remove('open');
    }

    renderSettings() {
        this.content.innerHTML = renderSettingsHTML(this.settings);
        attachSettingsEvents(this.content, {
            cube: this.cube,
            scene: this.scene,
            settings: this.settings,
            applyPreset,
            updateAmbientLight,
            updateBackgroundColor,
            updateGroundColor,
            loadSkybox,
            setGroundVisible,
            updateSunPosition,
            toggleVisibility,
            updateColor,
            updateTexture,
            updateOrientation,
            updateThickness: (cube, t) => cube.updateThickness(t),
            updateGroundOffset: (scene, t) => scene.setGroundOffset(t),
            onSettingsChanged: () => {
                this.renderSettings();
                if (this.saveManager) {
                    this.saveManager.autoSave();
                }
                window.dispatchEvent(new CustomEvent('settingsChanged'));
            }
        });
    }

    getSettings() { return this.settings; }

    createDefaultSettings() {
        return createDefaultSettings(this.cube);
    }

    async applySettings(settings) {
        this.settings = this.migrateSettings(settings);
        Object.keys(this.settings.surfaces).forEach(surfaceName => {
            const s = this.settings.surfaces[surfaceName];
            const surface = this.cube.surfaces[surfaceName];
            if (!surface) return;
            surface.visible = s.visible;
            updateColor(this.cube, this.settings, surfaceName, s.color);
            updateTexture(this.cube, this.settings, surfaceName, s.texture);
            if (surface.userData.pivot && s.orientation) {
                updateOrientation(this.cube, this.settings, surfaceName, s.orientation);
            }
        });

        // Load skybox first
        await loadSkybox(this.scene, this.settings.environment.skybox);

        // Apply environment settings
        applyPreset(this.scene, this.settings.environment.preset);
        updateAmbientLight(this.scene, this.settings.environment.ambientIntensity);
        updateBackgroundColor(this.scene, this.settings.environment.backgroundColor);
        updateSunPosition(this.scene, this.settings.environment.sunAzimuth, this.settings.environment.sunInclination);
        this.scene.setGroundColor(this.settings.environment.groundColor);

        // Apply ground visibility
        if (this.settings.environment.groundVisible !== undefined) {
            this.scene.setGroundVisible(this.settings.environment.groundVisible);
        }

        this.renderSettings();
    }

    migrateSettings(oldSettings) {
        if (!oldSettings || !oldSettings.surfaces) return createDefaultSettings(this.cube);

        const newSettings = createDefaultSettings(this.cube);

        // Copy environment settings
        if (oldSettings.environment) {
            newSettings.environment = { ...newSettings.environment, ...oldSettings.environment };
        }

        // Ensure groundVisible exists
        if (newSettings.environment.groundVisible === undefined) {
            newSettings.environment.groundVisible = true;
        }

        const nameMap = {
            portal: CONSTANTS.SURFACES.FRONT,
            backdrop: CONSTANTS.SURFACES.BACK,
            sky: CONSTANTS.SURFACES.CEILING,
            earth: CONSTANTS.SURFACES.FLOOR,
            'wing-left': CONSTANTS.SURFACES.LEFT,
            'wing-right': CONSTANTS.SURFACES.RIGHT,
        };

        // migrate surface settings
        Object.entries(oldSettings.surfaces).forEach(([key, value]) => {
            const newKey = nameMap[key] || key; // Map old name or keep if already new
            if (newSettings.surfaces[newKey]) {
                // merge, giving preference to loaded value
                Object.assign(newSettings.surfaces[newKey], value);
            }
        });

        return newSettings;
    }
}