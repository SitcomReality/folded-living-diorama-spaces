import { getAssetById } from '../config/assets.js';

export class InspectorManager {
    constructor() {
        this.panel = document.getElementById('inspector');
        this.content = document.getElementById('inspector-details');
        this.closeBtn = document.getElementById('close-inspector');
        
        this.closeBtn.addEventListener('click', () => {
            this.hide();
        });
        
        this.currentObject = null;
    }
    
    show() {
        this.panel.classList.remove('hidden');
    }
    
    hide() {
        this.panel.classList.add('hidden');
        this.currentObject = null;
    }
    
    inspect(object) {
        this.currentObject = object;
        this.updateContent();
        this.show();
    }
    
    updateContent() {
        if (!this.currentObject) {
            this.content.innerHTML = '<p>No object selected</p>';
            return;
        }
        
        const assetId = this.currentObject.userData.assetId || 'unknown';
        const asset = getAssetById(assetId);
        const pos = this.currentObject.position;
        
        this.content.innerHTML = `
            <div class="property-row">
                <div class="property-label">Asset</div>
                <div class="property-value">${asset ? asset.name : assetId}</div>
            </div>
            ${asset ? `
                <div class="property-row">
                    <div class="property-label">Poly Cost</div>
                    <div class="property-value">${asset.polys} polys</div>
                </div>
                ${asset.lightCost ? `
                    <div class="property-row">
                        <div class="property-label">Light Cost</div>
                        <div class="property-value">${asset.lightCost} lights</div>
                    </div>
                ` : ''}
                <div class="property-row">
                    <div class="property-label">Sparkle Cost</div>
                    <div class="property-value">${asset.cost} ✨</div>
                </div>
            ` : ''}
            <div class="property-row">
                <div class="property-label">Position</div>
                <div class="property-value">
                    X: ${pos.x.toFixed(2)}<br>
                    Y: ${pos.y.toFixed(2)}<br>
                    Z: ${pos.z.toFixed(2)}
                </div>
            </div>
        `;
    }
}

