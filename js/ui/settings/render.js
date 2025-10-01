import { CONSTANTS } from '../../config/constants.js';

export function renderSettingsHTML(settings) {
    const surfaces = Object.keys(CONSTANTS.SURFACES).map(k => CONSTANTS.SURFACES[k]);
    
    // Compact surface grid
    const surfaceCards = surfaces.map(surfaceName => {
        const s = settings.surfaces[surfaceName];
        const displayName = surfaceName.charAt(0).toUpperCase() + surfaceName.slice(1);
        const hasPivot = ['back','left','right'].includes(surfaceName);
        
        return `
        <div class="surface-card" data-surface="${surfaceName}">
          <div class="surface-card-header">
            <div class="surface-name">${displayName}</div>
            <div class="surface-visibility-toggle ${s.visible ? 'visible' : ''}" data-control="visible">
              ${s.visible ? '👁' : ''}
            </div>
          </div>
          <div class="surface-color-picker" style="background-color:${s.color};" data-control="color-preview">
            <input type="color" class="surface-color-input" data-control="color" value="${s.color}">
          </div>
          ${hasPivot ? `
          <select class="select-input" data-control="orientation">
            <option value="up" ${s.orientation==='up'?'selected':''}>↑ Up</option>
            <option value="down" ${s.orientation==='down'?'selected':''}>↓ Down</option>
          </select>`:''}
        </div>`;
    }).join('');
    
    const presets = [
        { id: 'warm', name: 'Warm', icon: '🌅' },
        { id: 'bright', name: 'Bright', icon: '☀️' },
        { id: 'cool', name: 'Cool', icon: '🌙' },
        { id: 'dramatic', name: 'Drama', icon: '🎭' }
    ];
    
    const presetHTML = presets.map(p=>`
      <div class="environment-preset ${settings.environment.preset===p.id?'active':''}" data-preset="${p.id}">
        <div class="preset-icon">${p.icon}</div>
        <div class="preset-name">${p.name}</div>
      </div>`).join('');
    
    return `
      <div class="settings-section" data-section="surfaces">
        <div class="settings-section-header">
          <div class="settings-section-title">🎨 Surfaces</div>
          <div class="settings-section-toggle">▼</div>
        </div>
        <div class="settings-section-content">
          <div class="surfaces-grid">${surfaceCards}</div>
        </div>
      </div>
      <div class="settings-section" data-section="environment">
        <div class="settings-section-header">
          <div class="settings-section-title">🌍 Environment</div>
          <div class="settings-section-toggle">▼</div>
        </div>
        <div class="settings-section-content">
          <div class="environment-presets">${presetHTML}</div>
          <div class="control-row">
            <div class="control-label">Ambient</div>
            <input type="range" class="slider-input" data-control="ambient" min="0" max="1" step="0.1" value="${settings.environment.ambientIntensity}">
            <div class="slider-value">${Math.round(settings.environment.ambientIntensity*100)}%</div>
          </div>
          <div class="control-row">
            <div class="control-label">Sky</div>
            <div class="color-picker-wrapper">
              <div class="color-preview" style="background-color:${settings.environment.backgroundColor};" data-control="bg-color-preview"></div>
              <input type="color" class="color-input" data-control="bg-color" value="${settings.environment.backgroundColor}">
            </div>
          </div>
          <div class="control-row">
            <div class="control-label">Ground</div>
            <div class="color-picker-wrapper">
              <div class="color-preview" style="background-color:${settings.environment.groundColor};" data-control="ground-color-preview"></div>
              <input type="color" class="color-input" data-control="ground-color" value="${settings.environment.groundColor}">
            </div>
          </div>
        </div>
      </div>
      <div class="settings-section" data-section="outliner">
        <div class="settings-section-header">
          <div class="settings-section-title">🧾 Scene Outliner</div>
          <div class="settings-section-toggle">▼</div>
        </div>
        <div class="settings-section-content">
          <div id="outliner-embedded" class="settings-outliner">
            <ul id="outliner-list" class="outliner-list"></ul>
          </div>
        </div>
      </div>`;
}