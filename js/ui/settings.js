import * as THREE from 'three';
import { CONSTANTS } from '../config/constants.js';
import { createDefaultSettings } from './settings/state.js';
import { renderSettingsHTML } from './settings/render.js';
import { attachSettingsEvents } from './settings/events.js';
import { applyPreset, updateAmbientLight, updateBackgroundColor, updateGroundColor } from './settings/environmentPresets.js';
import { toggleVisibility, updateColor, updateTexture, updateOrientation } from './settings/surfaceControls.js';

export class SettingsManager {
    constructor(cube, scene) {
        this.cube = cube;
        this.scene = scene;
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
            onSettingsChanged: () => this.renderSettings()
        });
    }

    getSettings() { return this.settings; }

    applySettings(settings) {
        this.settings = settings;
        Object.keys(settings.surfaces).forEach(surfaceName => {
            const s = settings.surfaces[surfaceName];
            const surface = this.cube.surfaces[surfaceName];
            if (!surface) return;
            surface.visible = s.visible;
            updateColor(this.cube, this.settings, surfaceName, s.color);
            updateTexture(this.cube, this.settings, surfaceName, s.texture);
            if (surface.userData.pivot && s.orientation) {
                updateOrientation(this.cube, this.settings, surfaceName, s.orientation);
            }
        });
        applyPreset(this.scene, settings.environment.preset);
        updateAmbientLight(this.scene, settings.environment.ambientIntensity);
        updateBackgroundColor(this.scene, settings.environment.backgroundColor);
        this.scene.setGroundColor(settings.environment.groundColor);
        this.renderSettings();
    }
}