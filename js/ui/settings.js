import * as THREE from 'three';
import { CONSTANTS } from '../config/constants.js';
import { createDefaultSettings } from './settings/state.js';
import { renderSettingsHTML } from './settings/render.js';
import { attachSettingsEvents } from './settings/events.js';
import { applyPreset, updateAmbientLight, updateBackgroundColor, updateGroundColor } from './settings/environmentPresets.js';
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

        this.openBtn.addEventListener('click', () => this.open());
        this.closeBtn.addEventListener('click', () => this.close());

        this.renderSettings();
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
            toggleVisibility,
            updateColor,
            updateTexture,
            updateOrientation,
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

    applySettings(settings) {
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
        applyPreset(this.scene, this.settings.environment.preset);
        updateAmbientLight(this.scene, this.settings.environment.ambientIntensity);
        updateBackgroundColor(this.scene, this.settings.environment.backgroundColor);
        this.scene.setGroundColor(this.settings.environment.groundColor);
        this.renderSettings();
    }

    migrateSettings(oldSettings) {
        if (!oldSettings || !oldSettings.surfaces) return createDefaultSettings(this.cube);

        const newSettings = createDefaultSettings(this.cube);

        // Copy environment settings
        if (oldSettings.environment) {
            newSettings.environment = { ...newSettings.environment, ...oldSettings.environment };
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