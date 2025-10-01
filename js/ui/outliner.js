import { getAssetById } from '../config/assets.js';

export class OutlinerManager {
    constructor() {
        this.el = document.getElementById('outliner');
        this.listEl = document.getElementById('outliner-list');
        this.closeBtn = document.getElementById('close-outliner');
        this.objects = new Map(); // Map uuid to object
        
        this.closeBtn.addEventListener('click', () => this.hide());
        this.listEl.addEventListener('click', (e) => this.onItemClick(e));
    }
    
    show() { this.el.classList.remove('hidden'); }
    hide() { this.el.classList.add('hidden'); }

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
        this.listEl.innerHTML = '';
        if (this.objects.size === 0) {
            this.listEl.innerHTML = '<li class="outliner-item" style="opacity: 0.5; pointer-events: none;">No objects placed yet.</li>';
            return;
        }

        this.objects.forEach(object => {
            const assetId = object.userData.assetId;
            const asset = getAssetById(assetId);
            const name = asset ? asset.name : 'Unknown Object';
            
            const li = document.createElement('li');
            li.className = 'outliner-item';
            li.dataset.uuid = object.uuid;
            li.textContent = name;
            
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

