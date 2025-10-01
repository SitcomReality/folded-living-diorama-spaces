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
            await ctx.loadSkybox(ctx.scene, skyboxId);
            ctx.onSettingsChanged();
        });
    });

    // Environment presets
    content.querySelectorAll('.environment-preset').forEach(preset => {
        preset.addEventListener('click', () => {
            content.querySelectorAll('.environment-preset').forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
            ctx.settings.environment.preset = preset.dataset.preset;
            ctx.applyPreset(ctx.scene, ctx.settings.environment.preset);
            ctx.onSettingsChanged();
        });
    });

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