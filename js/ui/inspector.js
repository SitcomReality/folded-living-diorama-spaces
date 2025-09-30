import * as THREE from 'three';
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
        const rot = this.currentObject.rotation;
        
        // Convert radians to degrees for display
        const rotX = (rot.x * 180 / Math.PI).toFixed(1);
        const rotY = (rot.y * 180 / Math.PI).toFixed(1);
        const rotZ = (rot.z * 180 / Math.PI).toFixed(1);
        
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
                <div class="property-label">Local Position (relative to surface)</div>
                <div class="property-value">
                    X: ${pos.x.toFixed(2)}<br>
                    Y: ${pos.y.toFixed(2)}<br>
                    Z: ${pos.z.toFixed(2)}
                </div>
            </div>
            <div class="property-row">
                <div class="property-label">Local Rotation (Degrees)</div>
                <div class="property-value">
                    X: ${rotX}° | Y: ${rotY}° | Z: ${rotZ}°
                </div>
                <div class="inspector-rotation-controls">
                    <button class="rotation-btn" data-axis="y" data-angle="-45">↶ 45°</button>
                    <button class="rotation-btn" data-axis="y" data-angle="45">↷ 45°</button>
                </div>
            </div>
        `;
        
        // Add rotation button handlers
        this.content.querySelectorAll('.rotation-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const axis = btn.dataset.axis;
                const angle = parseFloat(btn.dataset.angle) * (Math.PI / 180);
                this.rotateObject(axis, angle);
            });
        });
    }
    
    rotateObject(axis, angle) {
        if (!this.currentObject) return;
        
        const axisVector = axis === 'x' ? new THREE.Vector3(1, 0, 0) :
                           axis === 'y' ? new THREE.Vector3(0, 1, 0) :
                           new THREE.Vector3(0, 0, 1);
        
        this.currentObject.rotateOnWorldAxis(axisVector, angle);
        this.updateContent();
        
        // Trigger auto-save
        window.dispatchEvent(new CustomEvent('objectModified'));
    }
}