import { getAssetById, assetLibrary } from '../config/assets.js';

export class OutlinerManager {
    constructor() {
        this.el = document.getElementById('outliner-embedded') || document.getElementById('outliner');
        this.listEl = this.el ? this.el.querySelector('.outliner-list') : document.getElementById('outliner-list');
        this.closeBtn = document.getElementById('close-outliner');
        if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.hide());
        this.objects = new Map();
        if (this.listEl) this.listEl.addEventListener('click', (e) => this.onItemClick(e));
    }
    
    show() { /* embedded version stays inline; no-op */ }
    hide() { /* embedded version stays inline; no-op */ }

    populate(objects) {
        this.clear();
        objects.forEach(obj => this.addObject(obj));
    }
    
    addObject(object) {
        if (!object.uuid || this.objects.has(object.uuid)) return;
        
        this.objects.set(object.uuid, object);
        this.render();
        if (this.objects.size > 0) this.show();
    }
    
    removeObject(object) {
        if (!object.uuid || !this.objects.has(object.uuid)) return;
        
        this.objects.delete(object.uuid);
        this.render();
        if (this.objects.size === 0) this.hide();
    }

    clear() {
        this.objects.clear();
        this.render();
        this.hide();
    }
    
    render() {
        if (!this.listEl) return;
        this.listEl.innerHTML = '';
        if (this.objects.size === 0) {
            this.listEl.innerHTML = '<li class="outliner-item" style="opacity: 0.5; pointer-events: none;">No objects placed yet.</li>';
            return;
        }

        this.objects.forEach(object => {
            const asset = getAssetById(object.userData.assetId);
            const groupId = asset ? `${asset.category}_${asset.baseName}` : null;
            const group = groupId ? assetLibrary.getAssetGroup(groupId) : null;
            const name = group ? group.displayName : (asset?.displayName || 'Unknown Object');
            const variant = asset?.variant ? ` — ${asset.variant}` : '';
            
            const li = document.createElement('li');
            li.className = 'outliner-item';
            li.dataset.uuid = object.uuid;
            li.textContent = `${name}${variant}`;
            
            this.listEl.appendChild(li);
        });
    }

    highlight(uuid) {
        this.listEl.querySelectorAll('.outliner-item').forEach(item => {
            item.classList.toggle('active', item.dataset.uuid === uuid);
        });
    }

    onItemClick(event) {
        const item = event.target.closest('.outliner-item');
        if (!item || !item.dataset.uuid) return;
        
        const uuid = item.dataset.uuid;
        const object = this.objects.get(uuid);
        
        if (object) {
            this.highlight(uuid);
            window.dispatchEvent(new CustomEvent('objectSelectedFromOutliner', { detail: object }));
        }
    }
}