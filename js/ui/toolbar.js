import { ASSET_LIBRARY } from '../config/assets.js';

export class ToolbarManager {
    constructor(container, onToolSelected) {
        this.container = container;
        this.onToolSelected = onToolSelected;
        this.activeTool = null;
        this.assetPickerVisible = false;
        
        this.createToolbar();
        this.createAssetPicker();
    }
    
    createToolbar() {
        const tools = [
            { id: 'select', label: 'Select', icon: '👆' },
            { id: 'place', label: 'Place', icon: '➕' },
            { id: 'delete', label: 'Delete', icon: '🗑️' },
            { id: 'fold', label: 'Fold/Unfold', icon: '📦' }
        ];
        
        tools.forEach(tool => {
            const btn = document.createElement('button');
            btn.className = 'tool-btn';
            btn.dataset.tool = tool.id;
            btn.innerHTML = `${tool.icon} ${tool.label}`;
            
            btn.addEventListener('click', () => {
                this.selectTool(tool.id);
            });
            
            this.container.appendChild(btn);
        });
    }
    
    createAssetPicker() {
        this.assetPicker = document.createElement('div');
        this.assetPicker.className = 'asset-picker hidden';
        
        // Add header with close button
        const header = document.createElement('div');
        header.className = 'asset-picker-header';
        header.innerHTML = `
            <h3>Place Asset</h3>
            <button class="close-picker-btn">✕</button>
        `;
        this.assetPicker.appendChild(header);
        
        // Add close button handler
        header.querySelector('.close-picker-btn').addEventListener('click', () => {
            this.hideAssetPicker();
            this.selectTool('select');
        });
        
        const categories = Object.keys(ASSET_LIBRARY);
        
        categories.forEach(category => {
            const categorySection = document.createElement('div');
            categorySection.className = 'asset-category';
            
            const categoryTitle = document.createElement('div');
            categoryTitle.className = 'asset-category-title';
            categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categorySection.appendChild(categoryTitle);
            
            const assetsGrid = document.createElement('div');
            assetsGrid.className = 'assets-grid';
            
            ASSET_LIBRARY[category].forEach(asset => {
                const assetBtn = document.createElement('button');
                assetBtn.className = 'asset-btn';
                assetBtn.dataset.assetId = asset.id;
                assetBtn.innerHTML = `
                    <div class="asset-name">${asset.name}</div>
                    <div class="asset-cost">${asset.cost} ✨</div>
                `;
                
                assetBtn.addEventListener('click', () => {
                    this.selectAsset(asset.id);
                });
                
                assetsGrid.appendChild(assetBtn);
            });
            
            categorySection.appendChild(assetsGrid);
            this.assetPicker.appendChild(categorySection);
        });
        
        document.body.appendChild(this.assetPicker);
    }
    
    selectTool(toolId) {
        // Deselect previous tool
        const prevBtn = this.container.querySelector('.tool-btn.active');
        if (prevBtn) {
            prevBtn.classList.remove('active');
        }
        
        // Select new tool
        const newBtn = this.container.querySelector(`[data-tool="${toolId}"]`);
        if (newBtn) {
            newBtn.classList.add('active');
        }
        
        this.activeTool = toolId;
        
        // Show/hide asset picker
        if (toolId === 'place') {
            this.showAssetPicker();
            // If there's a selected asset, notify about it
            const selectedAsset = this.assetPicker.querySelector('.asset-btn.selected');
            if (selectedAsset && this.onToolSelected) {
                this.onToolSelected(toolId, selectedAsset.dataset.assetId);
            } else if (this.onToolSelected) {
                this.onToolSelected(toolId);
            }
        } else {
            this.hideAssetPicker();
            if (this.onToolSelected) {
                this.onToolSelected(toolId);
            }
        }
    }
    
    showAssetPicker() {
        this.assetPicker.classList.remove('hidden');
        this.assetPickerVisible = true;
    }
    
    hideAssetPicker() {
        this.assetPicker.classList.add('hidden');
        this.assetPickerVisible = false;
    }
    
    selectAsset(assetId) {
        // Highlight selected asset
        const prevSelected = this.assetPicker.querySelector('.asset-btn.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }
        
        const assetBtn = this.assetPicker.querySelector(`[data-asset-id="${assetId}"]`);
        if (assetBtn) {
            assetBtn.classList.add('selected');
        }
        
        // Notify with special event for asset selection
        if (this.onToolSelected) {
            this.onToolSelected('place', assetId);
        }
    }
    
    getActiveTool() {
        return this.activeTool;
    }
}