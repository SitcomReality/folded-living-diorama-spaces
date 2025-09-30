import { CONSTANTS } from '../../config/constants.js';

export function renderSettingsHTML(settings) {
    const surfaces = Object.keys(CONSTANTS.SURFACES).map(k => CONSTANTS.SURFACES[k]);
    const surfaceControls = surfaces.map(surfaceName => {
        const s = settings.surfaces[surfaceName];
        const displayName = surfaceName.replace('_', ' ');
        const hasPivot = ['backdrop','wing_left','wing_right','portal'].includes(surfaceName);
        return `
        <div class="surface-control" data-surface="${surfaceName}">
          <div class="surface-control-header"><div class="surface-name">${displayName}</div></div>
          <div class="surface-control-options">
            <div class="control-row">
              <div class="control-label">Visible</div>
              <div class="toggle-switch ${s.visible ? 'active' : ''}" data-control="visible"></div>
            </div>
            <div class="control-row">
              <div class="control-label">Color</div>
              <div class="color-picker-wrapper">
                <div class="color-preview" style="background-color:${s.color};" data-control="color-preview"></div>
                <input type="color" class="color-input" data-control="color" value="${s.color}">
              </div>
            </div>
            ${hasPivot ? `
            <div class="control-row">
              <div class="control-label">Orientation</div>
              <select class="select-input" data-control="orientation">
                <option value="up" ${s.orientation==='up'?'selected':''}>Up (vertical)</option>
                <option value="down" ${s.orientation==='down'?'selected':''}>Down (horizontal)</option>
              </select>
            </div>`:''}
            <div class="control-row">
              <div class="control-label">Texture</div>
              <select class="select-input" data-control="texture">
                <option value="solid" ${s.texture==='solid'?'selected':''}>Solid</option>
                <option value="grid" ${s.texture==='grid'?'selected':''}>Grid</option>
                <option value="dots" ${s.texture==='dots'?'selected':''}>Dots</option>
                <option value="wood" ${s.texture==='wood'?'selected':''}>Wood</option>
              </select>
            </div>
          </div>
        </div>`;
    }).join('');
    const presets = [
        { id: 'warm', name: 'Warm Cozy', icon: '🌅', description: 'Soft warm lighting' },
        { id: 'bright', name: 'Bright Day', icon: '☀️', description: 'Clear daylight' },
        { id: 'cool', name: 'Cool Evening', icon: '🌙', description: 'Cool blue tones' },
        { id: 'dramatic', name: 'Dramatic', icon: '🎭', description: 'High contrast' }
    ];
    const presetHTML = presets.map(p=>`
      <div class="environment-preset ${settings.environment.preset===p.id?'active':''}" data-preset="${p.id}">
        <div class="preset-icon">${p.icon}</div>
        <div class="preset-info">
          <div class="preset-name">${p.name}</div>
          <div class="preset-description">${p.description}</div>
        </div>
      </div>`).join('');
    return `
      <div class="settings-section" data-section="surfaces">
        <div class="settings-section-header"><div class="settings-section-title">🎨 Surfaces</div><div class="settings-section-toggle">▼</div></div>
        <div class="settings-section-content">${surfaceControls}</div>
      </div>
      <div class="settings-section" data-section="environment">
        <div class="settings-section-header"><div class="settings-section-title">🌍 Environment</div><div class="settings-section-toggle">▼</div></div>
        <div class="settings-section-content">
          <div style="display:flex;flex-direction:column;gap:8px;">${presetHTML}</div>
          <div class="control-row" style="margin-top:16px;">
            <div class="control-label">Ambient Light</div>
            <input type="range" class="slider-input" data-control="ambient" min="0" max="1" step="0.1" value="${settings.environment.ambientIntensity}">
            <div class="slider-value">${Math.round(settings.environment.ambientIntensity*100)}%</div>
          </div>
          <div class="control-row">
            <div class="control-label">Background</div>
            <div class="color-picker-wrapper">
              <div class="color-preview" style="background-color:${settings.environment.backgroundColor};" data-control="bg-color-preview"></div>
              <input type="color" class="color-input" data-control="bg-color" value="${settings.environment.backgroundColor}">
            </div>
          </div>
        </div>
      </div>`;
}
