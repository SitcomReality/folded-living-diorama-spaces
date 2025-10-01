export function attachSettingsEvents(content, ctx) {
    // Section toggle
    content.querySelectorAll('.settings-section-header').forEach(header => {
        header.addEventListener('click', () => header.parentElement.classList.toggle('collapsed'));
    });

    // Surface controls
    content.querySelectorAll('.surface-card').forEach(card => {
        const surfaceName = card.dataset.surface;

        const visibleToggle = card.querySelector('[data-control="visible"]');
        visibleToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            ctx.toggleVisibility(ctx.cube, ctx.settings, surfaceName);
            visibleToggle.classList.toggle('visible');
            visibleToggle.textContent = visibleToggle.classList.contains('visible') ? '👁' : '';
            ctx.onSettingsChanged();
        });

        const colorInput = card.querySelector('[data-control="color"]');
        const colorPreview = card.querySelector('[data-control="color-preview"]');
        colorPreview.addEventListener('click', () => colorInput.click());
        colorInput.addEventListener('input', (e) => {
            colorPreview.style.backgroundColor = e.target.value;
            ctx.updateColor(ctx.cube, ctx.settings, surfaceName, e.target.value);
        });
        colorInput.addEventListener('change', () => ctx.onSettingsChanged());

        const orientationSelect = card.querySelector('[data-control="orientation"]');
        if (orientationSelect) {
            orientationSelect.addEventListener('change', (e) => {
                ctx.updateOrientation(ctx.cube, ctx.settings, surfaceName, e.target.value);
                ctx.onSettingsChanged();
            });
        }
    });

    // Skybox selector
    content.querySelectorAll('.skybox-option').forEach(option => {
        option.addEventListener('click', async () => {
            content.querySelectorAll('.skybox-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            const skyboxId = option.dataset.skybox === 'null' ? null : option.dataset.skybox;
            ctx.settings.environment.skybox = skyboxId;

            // Auto-apply lighting preset
            const { getSkyboxPreset } = await import('./state.js');
            const newPreset = getSkyboxPreset(skyboxId);
            ctx.settings.environment.preset = newPreset;
            ctx.applyPreset(ctx.scene, newPreset);

            await ctx.loadSkybox(ctx.scene, skyboxId);
            ctx.onSettingsChanged();
        });
    });

    // Environment presets
    content.querySelectorAll('.environment-preset').forEach(preset => {
        preset.addEventListener('click', async () => {
            content.querySelectorAll('.environment-preset').forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
            const presetId = preset.dataset.preset;
            ctx.settings.environment.preset = presetId;

            // update sun position from preset
            const { PRESETS } = await import('./environmentPresets.js');
            const presetData = PRESETS[presetId];
            if (presetData) {
                if (presetData.sunAzimuth !== undefined) ctx.settings.environment.sunAzimuth = presetData.sunAzimuth;
                if (presetData.sunInclination !== undefined) ctx.settings.environment.sunInclination = presetData.sunInclination;
            }

            ctx.applyPreset(ctx.scene, presetId); // This applies colors etc

            // And now apply the new sun position
            ctx.updateSunPosition(ctx.scene, ctx.settings.environment.sunAzimuth, ctx.settings.environment.sunInclination);

            ctx.onSettingsChanged();
        });
    });

    // Sun sliders
    const sunAzimuthSlider = content.querySelector('[data-control="sun-azimuth"]');
    if (sunAzimuthSlider) {
        const sunAzimuthValue = sunAzimuthSlider.parentElement.querySelector('.slider-value');
        sunAzimuthSlider.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            sunAzimuthValue.textContent = `${Math.round(v)}°`;
            ctx.settings.environment.sunAzimuth = v;
            ctx.updateSunPosition(ctx.scene, ctx.settings.environment.sunAzimuth, ctx.settings.environment.sunInclination);
        });
        sunAzimuthSlider.addEventListener('change', () => ctx.onSettingsChanged());
    }

    const sunInclinationSlider = content.querySelector('[data-control="sun-inclination"]');
    if (sunInclinationSlider) {
        const sunInclinationValue = sunInclinationSlider.parentElement.querySelector('.slider-value');
        sunInclinationSlider.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            sunInclinationValue.textContent = `${Math.round(v)}°`;
            ctx.settings.environment.sunInclination = v;
            ctx.updateSunPosition(ctx.scene, ctx.settings.environment.sunAzimuth, ctx.settings.environment.sunInclination);
        });
        sunInclinationSlider.addEventListener('change', () => ctx.onSettingsChanged());
    }

    // Ambient slider
    const ambientSlider = content.querySelector('[data-control="ambient"]');
    const ambientValue = ambientSlider.parentElement.querySelector('.slider-value');
    ambientSlider.addEventListener('input', (e) => {
        const v = parseFloat(e.target.value);
        ambientValue.textContent = `${Math.round(v*100)}%`;
        ctx.settings.environment.ambientIntensity = v;
        ctx.updateAmbientLight(ctx.scene, v);
        ctx.onSettingsChanged();
    });

    // Background color (only shown when no skybox)
    const bgColorInput = content.querySelector('[data-control="bg-color"]');
    const bgColorPreview = content.querySelector('[data-control="bg-color-preview"]');
    if (bgColorInput && bgColorPreview) {
        bgColorPreview.addEventListener('click', () => bgColorInput.click());
        bgColorInput.addEventListener('input', (e) => {
            const color = e.target.value;
            bgColorPreview.style.backgroundColor = color;
            ctx.settings.environment.backgroundColor = color;
            ctx.updateBackgroundColor(ctx.scene, color);
        });
        bgColorInput.addEventListener('change', () => ctx.onSettingsChanged());
    }

    const groundColorInput = content.querySelector('[data-control="ground-color"]');
    const groundColorPreview = content.querySelector('[data-control="ground-color-preview"]');
    groundColorPreview.addEventListener('click', () => groundColorInput.click());
    groundColorInput.addEventListener('input', (e) => {
        const color = e.target.value;
        groundColorPreview.style.backgroundColor = color;
        ctx.settings.environment.groundColor = color;
        ctx.updateGroundColor(ctx.scene, color);
    });
    groundColorInput.addEventListener('change', () => ctx.onSettingsChanged());

    // Ground visibility toggle
    const groundVisibleToggle = content.querySelector('[data-control="ground-visible"]');
    groundVisibleToggle.addEventListener('change', (e) => {
        ctx.settings.environment.groundVisible = e.target.checked;
        ctx.setGroundVisible(ctx.scene, e.target.checked);
        ctx.onSettingsChanged();
    });
}