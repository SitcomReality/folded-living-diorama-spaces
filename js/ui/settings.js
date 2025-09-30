import * as THREE from 'three';
import { CONSTANTS } from '../config/constants.js';

export class SettingsManager {
    constructor(cube, scene) {
        this.cube = cube;
        this.scene = scene;
        this.panel = document.getElementById('settings-panel');
        this.content = this.panel.querySelector('.settings-content');
        this.openBtn = document.getElementById('settings-btn');
        this.closeBtn = document.getElementById('close-settings');

        this.settings = {
            surfaces: {},
            environment: {
                preset: 'warm',
                ambientIntensity: 0.6,
                backgroundColor: '#0a0a0a'
            }
        };

        // Initialize surface settings
        Object.keys(CONSTANTS.SURFACES).forEach(key => {
            const surfaceName = CONSTANTS.SURFACES[key];
            this.settings.surfaces[surfaceName] = {
                visible: true,
                color: this.getDefaultSurfaceColor(surfaceName),
                texture: 'solid',
                orientation: (surfaceName === 'portal') ? 'down' : 'up'
            };
        });

        this.setupListeners();
        this.renderSettings();
    }

    getDefaultSurfaceColor(surfaceName) {
        const defaults = {
            portal: '#f5e6d3',
            backdrop: '#e8d4c0',
            sky: '#d4e8f5',
            earth: '#a8c9a3',
            wing_left: '#f0d8c4',
            wing_right: '#f0d8c4'
        };
        return defaults[surfaceName] || '#ffffff';
    }

    setupListeners() {
        this.openBtn.addEventListener('click', () => this.open());
        this.closeBtn.addEventListener('click', () => this.close());
    }

    open() {
        this.panel.classList.add('open');
    }

    close() {
        this.panel.classList.remove('open');
    }

    renderSettings() {
        this.content.innerHTML = `
            ${this.renderSurfacesSection()}
            ${this.renderEnvironmentSection()}
        `;

        this.attachEventListeners();
    }

    renderSurfacesSection() {
        const surfaces = Object.keys(CONSTANTS.SURFACES).map(key => CONSTANTS.SURFACES[key]);

        return `
            <div class="settings-section" data-section="surfaces">
                <div class="settings-section-header">
                    <div class="settings-section-title">🎨 Surfaces</div>
                    <div class="settings-section-toggle">▼</div>
                </div>
                <div class="settings-section-content">
                    ${surfaces.map(surfaceName => this.renderSurfaceControl(surfaceName)).join('')}
                </div>
            </div>
        `;
    }

    renderSurfaceControl(surfaceName) {
        const settings = this.settings.surfaces[surfaceName];
        const displayName = surfaceName.replace('_', ' ');
        const hasPivot = !!(this.cube.surfaces[surfaceName] && this.cube.surfaces[surfaceName].userData.pivot);

        return `
            <div class="surface-control" data-surface="${surfaceName}">
                <div class="surface-control-header">
                    <div class="surface-name">${displayName}</div>
                </div>
                <div class="surface-control-options">
                    <div class="control-row">
                        <div class="control-label">Visible</div>
                        <div class="toggle-switch ${settings.visible ? 'active' : ''}" data-control="visible"></div>
                    </div>
                    <div class="control-row">
                        <div class="control-label">Color</div>
                        <div class="color-picker-wrapper">
                            <div class="color-preview" style="background-color: ${settings.color};" data-control="color-preview"></div>
                            <input type="color" class="color-input" data-control="color" value="${settings.color}">
                        </div>
                    </div>
                    ${hasPivot ? `
                    <div class="control-row">
                        <div class="control-label">Orientation</div>
                        <select class="select-input" data-control="orientation">
                            <option value="up" ${settings.orientation === 'up' ? 'selected' : ''}>Up (vertical)</option>
                            <option value="down" ${settings.orientation === 'down' ? 'selected' : ''}>Down (horizontal)</option>
                        </select>
                    </div>` : ''}
                    <div class="control-row">
                        <div class="control-label">Texture</div>
                        <select class="select-input" data-control="texture">
                            <option value="solid" ${settings.texture === 'solid' ? 'selected' : ''}>Solid</option>
                            <option value="grid" ${settings.texture === 'grid' ? 'selected' : ''}>Grid</option>
                            <option value="dots" ${settings.texture === 'dots' ? 'selected' : ''}>Dots</option>
                            <option value="wood" ${settings.texture === 'wood' ? 'selected' : ''}>Wood</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    renderEnvironmentSection() {
        const presets = [
            { id: 'warm', name: 'Warm Cozy', icon: '🌅', description: 'Soft warm lighting' },
            { id: 'bright', name: 'Bright Day', icon: '☀️', description: 'Clear daylight' },
            { id: 'cool', name: 'Cool Evening', icon: '🌙', description: 'Cool blue tones' },
            { id: 'dramatic', name: 'Dramatic', icon: '🎭', description: 'High contrast' }
        ];

        return `
            <div class="settings-section" data-section="environment">
                <div class="settings-section-header">
                    <div class="settings-section-title">🌍 Environment</div>
                    <div class="settings-section-toggle">▼</div>
                </div>
                <div class="settings-section-content">
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${presets.map(preset => `
                            <div class="environment-preset ${this.settings.environment.preset === preset.id ? 'active' : ''}" 
                                 data-preset="${preset.id}">
                                <div class="preset-icon">${preset.icon}</div>
                                <div class="preset-info">
                                    <div class="preset-name">${preset.name}</div>
                                    <div class="preset-description">${preset.description}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="control-row" style="margin-top: 16px;">
                        <div class="control-label">Ambient Light</div>
                        <input type="range" class="slider-input" data-control="ambient" 
                               min="0" max="1" step="0.1" value="${this.settings.environment.ambientIntensity}">
                        <div class="slider-value">${Math.round(this.settings.environment.ambientIntensity * 100)}%</div>
                    </div>
                    <div class="control-row">
                        <div class="control-label">Background</div>
                        <div class="color-picker-wrapper">
                            <div class="color-preview" style="background-color: ${this.settings.environment.backgroundColor};" 
                                 data-control="bg-color-preview"></div>
                            <input type="color" class="color-input" data-control="bg-color" 
                                   value="${this.settings.environment.backgroundColor}">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Section toggle
        this.content.querySelectorAll('.settings-section-header').forEach(header => {
            header.addEventListener('click', () => {
                const section = header.parentElement;
                section.classList.toggle('collapsed');
            });
        });

        // Surface controls
        this.content.querySelectorAll('.surface-control').forEach(control => {
            const surfaceName = control.dataset.surface;

            // Visibility toggle
            const visibleToggle = control.querySelector('[data-control="visible"]');
            visibleToggle.addEventListener('click', () => {
                this.toggleSurfaceVisibility(surfaceName);
                visibleToggle.classList.toggle('active');
            });

            // Color picker
            const colorInput = control.querySelector('[data-control="color"]');
            const colorPreview = control.querySelector('[data-control="color-preview"]');
            colorPreview.addEventListener('click', () => colorInput.click());
            colorInput.addEventListener('input', (e) => {
                const color = e.target.value;
                colorPreview.style.backgroundColor = color;
                this.updateSurfaceColor(surfaceName, color);
            });

            // Orientation (if present)
            const orientationSelect = control.querySelector('[data-control="orientation"]');
            if (orientationSelect) {
                orientationSelect.addEventListener('change', (e) => {
                    this.updateSurfaceOrientation(surfaceName, e.target.value);
                });
            }

            // Texture selector
            const textureSelect = control.querySelector('[data-control="texture"]');
            textureSelect.addEventListener('change', (e) => {
                this.updateSurfaceTexture(surfaceName, e.target.value);
            });
        });

        // Environment presets
        this.content.querySelectorAll('.environment-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                this.content.querySelectorAll('.environment-preset').forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
                this.applyEnvironmentPreset(preset.dataset.preset);
            });
        });

        // Ambient light slider
        const ambientSlider = this.content.querySelector('[data-control="ambient"]');
        const ambientValue = ambientSlider.parentElement.querySelector('.slider-value');
        ambientSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            ambientValue.textContent = `${Math.round(value * 100)}%`;
            this.updateAmbientLight(value);
        });

        // Background color
        const bgColorInput = this.content.querySelector('[data-control="bg-color"]');
        const bgColorPreview = this.content.querySelector('[data-control="bg-color-preview"]');

        bgColorPreview.addEventListener('click', () => bgColorInput.click());

        bgColorInput.addEventListener('input', (e) => {
            const color = e.target.value;
            bgColorPreview.style.backgroundColor = color;
            this.updateBackgroundColor(color);
        });
    }

    toggleSurfaceVisibility(surfaceName) {
        const surface = this.cube.surfaces[surfaceName];
        if (!surface) return;

        this.settings.surfaces[surfaceName].visible = !this.settings.surfaces[surfaceName].visible;
        surface.visible = this.settings.surfaces[surfaceName].visible;
    }

    updateSurfaceColor(surfaceName, color) {
        const surface = this.cube.surfaces[surfaceName];
        if (!surface) return;

        this.settings.surfaces[surfaceName].color = color;
        surface.material.color.set(color);
    }

    updateSurfaceTexture(surfaceName, texture) {
        const surface = this.cube.surfaces[surfaceName];
        if (!surface) return;

        this.settings.surfaces[surfaceName].texture = texture;

        // Simple texture implementation - can be expanded
        switch (texture) {
            case 'solid':
                surface.material.roughness = 0.9;
                surface.material.metalness = 0.05;
                break;
            case 'grid':
                surface.material.roughness = 0.7;
                surface.material.metalness = 0.1;
                break;
            case 'dots':
                surface.material.roughness = 0.8;
                surface.material.metalness = 0.05;
                break;
            case 'wood':
                surface.material.roughness = 0.95;
                surface.material.metalness = 0;
                break;
        }

        surface.material.needsUpdate = true;
    }

    updateSurfaceOrientation(surfaceName, orientation) {
        const surface = this.cube.surfaces[surfaceName];
        if (!surface || !surface.userData.pivot) return;

        this.settings.surfaces[surfaceName].orientation = orientation;

        const euler = this.getPivotTargetRotation(surfaceName, orientation);
        if (!euler) return;

        const pivot = surface.userData.pivot;
        pivot.rotation.set(euler.x, euler.y, euler.z);
    }

    getPivotTargetRotation(surfaceName, orientation) {
        // Up = folded/vertical, Down = unfolded/horizontal
        // Matches folding.js pivotRotation targets
        switch (surfaceName) {
            case CONSTANTS.SURFACES.BACKDROP:
                return orientation === 'down'
                    ? new THREE.Euler(Math.PI / 2, 0, 0)
                    : new THREE.Euler(0, 0, 0);
            case CONSTANTS.SURFACES.WING_LEFT:
                return orientation === 'down'
                    ? new THREE.Euler(0, 0, Math.PI / 2)
                    : new THREE.Euler(0, 0, 0);
            case CONSTANTS.SURFACES.WING_RIGHT:
                return orientation === 'down'
                    ? new THREE.Euler(0, 0, -Math.PI / 2)
                    : new THREE.Euler(0, 0, 0);
            case CONSTANTS.SURFACES.PORTAL:
                return orientation === 'down'
                    ? new THREE.Euler(-Math.PI / 2, 0, 0)
                    : new THREE.Euler(0, 0, 0);
            default:
                return null; // earth/sky not pivot-controlled here
        }
    }

    applyEnvironmentPreset(presetId) {
        this.settings.environment.preset = presetId;

        const presets = {
            warm: {
                ambient: 0.6,
                keyColor: 0xfff0d4,
                keyIntensity: 0.7,
                fillColor: 0xd4e6ff,
                fillIntensity: 0.25,
                rimColor: 0xffe8cc,
                rimIntensity: 0.3
            },
            bright: {
                ambient: 0.8,
                keyColor: 0xffffff,
                keyIntensity: 1.0,
                fillColor: 0xe6f2ff,
                fillIntensity: 0.4,
                rimColor: 0xfff8e6,
                rimIntensity: 0.2
            },
            cool: {
                ambient: 0.4,
                keyColor: 0xb8d4ff,
                keyIntensity: 0.5,
                fillColor: 0x8ab0d4,
                fillIntensity: 0.3,
                rimColor: 0xc8d4ff,
                rimIntensity: 0.4
            },
            dramatic: {
                ambient: 0.3,
                keyColor: 0xffffff,
                keyIntensity: 1.2,
                fillColor: 0x4a4a4a,
                fillIntensity: 0.1,
                rimColor: 0xffa366,
                rimIntensity: 0.6
            }
        };

        const preset = presets[presetId];
        if (!preset) return;

        // Update lights in scene
        this.scene.getScene().traverse((child) => {
            if (child.isAmbientLight) {
                child.intensity = preset.ambient;
            } else if (child.isDirectionalLight) {
                if (child.intensity > 0.5) { // Key light
                    child.color.set(preset.keyColor);
                    child.intensity = preset.keyIntensity;
                } else if (child.intensity > 0.2) { // Fill light
                    child.color.set(preset.fillColor);
                    child.intensity = preset.fillIntensity;
                } else { // Rim light
                    child.color.set(preset.rimColor);
                    child.intensity = preset.rimIntensity;
                }
            }
        });

        // Update slider to match
        const ambientSlider = this.content.querySelector('[data-control="ambient"]');
        if (ambientSlider) {
            ambientSlider.value = preset.ambient;
            const ambientValue = ambientSlider.parentElement.querySelector('.slider-value');
            ambientValue.textContent = `${Math.round(preset.ambient * 100)}%`;
        }

        this.settings.environment.ambientIntensity = preset.ambient;
    }

    updateAmbientLight(intensity) {
        this.settings.environment.ambientIntensity = intensity;

        this.scene.getScene().traverse((child) => {
            if (child.isAmbientLight) {
                child.intensity = intensity;
            }
        });
    }

    updateBackgroundColor(color) {
        this.settings.environment.backgroundColor = color;
        this.scene.getScene().background = new THREE.Color(color);
    }

    getSettings() {
        return this.settings;
    }

    applySettings(settings) {
        this.settings = settings;

        // Apply surface settings
        Object.keys(settings.surfaces).forEach(surfaceName => {
            const surfaceSettings = settings.surfaces[surfaceName];
            const surface = this.cube.surfaces[surfaceName];

            if (surface) {
                surface.visible = surfaceSettings.visible;
                surface.material.color.set(surfaceSettings.color);
                this.updateSurfaceTexture(surfaceName, surfaceSettings.texture);
                if (surface.userData.pivot && surfaceSettings.orientation) {
                    this.updateSurfaceOrientation(surfaceName, surfaceSettings.orientation);
                }
            }
        });

        // Apply environment settings
        this.applyEnvironmentPreset(settings.environment.preset);
        this.updateAmbientLight(settings.environment.ambientIntensity);
        this.updateBackgroundColor(settings.environment.backgroundColor);

        this.renderSettings();
    }
}