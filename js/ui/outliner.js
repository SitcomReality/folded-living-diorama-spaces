import { getAssetById, assetLibrary } from '../config/assets.js';

export class OutlinerManager {
    constructor() {
        // Elements are now dynamically created, so we'll get them during render.
        this.el = null;
        this.listEl = null;
        this.objects = new Map();
    }
    
    _ensureElements() {
        if (!this.listEl || !document.body.contains(this.listEl)) {
            this.el = document.getElementById('outliner-embedded');
            this.listEl = this.el ? this.el.querySelector('.outliner-list') : null;
            if (this.listEl) {
                this.listEl.addEventListener('click', (e) => this.onItemClick(e));
            }
        }
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
    }
    
    removeObject(object) {
        if (!object.uuid || !this.objects.has(object.uuid)) return;
        
        this.objects.delete(object.uuid);
        this.render();
    }

    clear() {
        this.objects.clear();
        this.render();
    }
    
    render() {
        this._ensureElements();
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
        this._ensureElements();
        if (!this.listEl) return;
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