export function attachSettingsEvents(content, ctx) {
    // Section toggle
    content.querySelectorAll('.settings-section-header').forEach(header => {
        header.addEventListener('click', () => header.parentElement.classList.toggle('collapsed'));
    });
    // Surface controls
    content.querySelectorAll('.surface-control').forEach(control => {
        const surfaceName = control.dataset.surface;
        const visibleToggle = control.querySelector('[data-control="visible"]');
        visibleToggle.addEventListener('click', () => {
            ctx.toggleVisibility(ctx.cube, ctx.settings, surfaceName);
            visibleToggle.classList.toggle('active');
        });
        const colorInput = control.querySelector('[data-control="color"]');
        const colorPreview = control.querySelector('[data-control="color-preview"]');
        colorPreview.addEventListener('click', () => colorInput.click());
        colorInput.addEventListener('input', (e) => {
            colorPreview.style.backgroundColor = e.target.value;
            ctx.updateColor(ctx.cube, ctx.settings, surfaceName, e.target.value);
        });
        const orientationSelect = control.querySelector('[data-control="orientation"]');
        if (orientationSelect) {
            orientationSelect.addEventListener('change', (e) => {
                ctx.updateOrientation(ctx.cube, ctx.settings, surfaceName, e.target.value);
            });
        }
        const textureSelect = control.querySelector('[data-control="texture"]');
        textureSelect.addEventListener('change', (e) => {
            ctx.updateTexture(ctx.cube, ctx.settings, surfaceName, e.target.value);
        });
    });
    // Environment presets
    content.querySelectorAll('.environment-preset').forEach(preset => {
        preset.addEventListener('click', () => {
            content.querySelectorAll('.environment-preset').forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
            ctx.settings.environment.preset = preset.dataset.preset;
            ctx.applyPreset(ctx.scene, ctx.settings.environment.preset);
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
    });
    // Background color
    const bgColorInput = content.querySelector('[data-control="bg-color"]');
    const bgColorPreview = content.querySelector('[data-control="bg-color-preview"]');
    bgColorPreview.addEventListener('click', () => bgColorInput.click());
    bgColorInput.addEventListener('input', (e) => {
        const color = e.target.value;
        bgColorPreview.style.backgroundColor = color;
        ctx.settings.environment.backgroundColor = color;
        ctx.updateBackgroundColor(ctx.scene, color);
    });
}