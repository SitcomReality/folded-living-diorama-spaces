import { assetLibrary } from '../config/assets.js';

export class ToolbarManager {
    constructor(container, onToolSelected) {
        this.container = container;
        this.onToolSelected = onToolSelected;
        this.activeTool = null;
        this.assetPickerVisible = false;
        this.selectedVariant = new Map(); // Track selected variant per group
        
        this.createToolbar();
        this.createAssetPicker();
    }
    
    createToolbar() {
        const tools = [
            { id: 'select', label: 'Select', icon: '👆' },
            { id: 'place', label: 'Place', icon: '➕' },
            { id: 'move', label: 'Move', icon: '✋' },
            { id: 'delete', label: 'Delete', icon: '🗑️' }
        ];
        
        tools.forEach(tool => {
            const btn = document.createElement('button');
            btn.className = 'tool-btn';
            btn.dataset.tool = tool.id;
            btn.innerHTML = `<span class="tool-icon">${tool.icon}</span><span>${tool.label}</span>`;
            
            btn.addEventListener('click', () => {
                this.selectTool(tool.id);
            });
            
            this.container.appendChild(btn);
        });
        
        // Snap-to-grid toggle
        this.snapEnabled = false;
        const snapBtn = document.createElement('button');
        snapBtn.className = 'tool-btn';
        snapBtn.dataset.tool = 'snap';
        snapBtn.innerHTML = '<span class="tool-icon">🧲</span><span>Snap</span>';
        snapBtn.addEventListener('click', () => {
            this.snapEnabled = !this.snapEnabled;
            snapBtn.classList.toggle('active', this.snapEnabled);
        });
        this.container.appendChild(snapBtn);
    }
    
    createAssetPicker() {
        this.assetPicker = document.createElement('div');
        this.assetPicker.className = 'asset-picker hidden';
        
        const header = document.createElement('div');
        header.className = 'asset-picker-header';
        header.innerHTML = `
            <h3>Place Asset</h3>
            <button class="close-picker-btn">✕</button>
        `;
        this.assetPicker.appendChild(header);
        
        header.querySelector('.close-picker-btn').addEventListener('click', () => {
            this.hideAssetPicker();
            this.selectTool('select');
        });
        
        const categories = assetLibrary.getCategories();
        
        categories.forEach(category => {
            const categorySection = document.createElement('div');
            categorySection.className = 'asset-category';
            
            const categoryTitle = document.createElement('div');
            categoryTitle.className = 'asset-category-title';
            categoryTitle.textContent = assetLibrary.getCategoryDisplayName(category);
            categorySection.appendChild(categoryTitle);
            
            const assetsGrid = document.createElement('div');
            assetsGrid.className = 'assets-grid';
            
            const groups = assetLibrary.getAssetGroupsByCategory(category);
            
            groups.forEach(group => {
                const groupContainer = document.createElement('div');
                groupContainer.className = 'asset-group';
                
                const assetBtn = document.createElement('button');
                assetBtn.className = 'asset-btn';
                assetBtn.dataset.groupId = group.id;
                
                // Use default variant for initial display
                const defaultAsset = assetLibrary.getAssetById(group.defaultVariant);
                assetBtn.dataset.assetId = defaultAsset.id;
                
                assetBtn.innerHTML = `
                    <div class="asset-name">${group.displayName}</div>
                    <div class="asset-cost">${group.cost} ✨</div>
                `;
                
                assetBtn.addEventListener('click', () => {
                    this.selectAsset(defaultAsset.id);
                });
                
                groupContainer.appendChild(assetBtn);
                
                // Add variant selector if multiple variants exist
                if (group.variants.length > 1) {
                    const variantSelector = document.createElement('div');
                    variantSelector.className = 'variant-selector';
                    
                    group.variants.forEach((variant, index) => {
                        const variantBtn = document.createElement('button');
                        variantBtn.className = 'variant-btn';
                        variantBtn.dataset.variantId = variant.id;
                        variantBtn.textContent = variant.variant || '•';
                        variantBtn.title = variant.variant ? `${group.displayName} (${variant.variant})` : group.displayName;
                        
                        if (index === 0) variantBtn.classList.add('active');
                        
                        variantBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            // Update active variant
                            variantSelector.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
                            variantBtn.classList.add('active');
                            // Update main button
                            assetBtn.dataset.assetId = variant.id;
                            this.selectedVariant.set(group.id, variant.id);
                            // If this group is currently selected, update placement
                            if (assetBtn.classList.contains('selected')) {
                                this.selectAsset(variant.id);
                            }
                        });
                        
                        variantSelector.appendChild(variantBtn);
                    });
                    
                    groupContainer.appendChild(variantSelector);
                }
                
                assetsGrid.appendChild(groupContainer);
            });
            
            categorySection.appendChild(assetsGrid);
            this.assetPicker.appendChild(categorySection);
        });
        
        document.body.appendChild(this.assetPicker);
    }
    
    selectTool(toolId) {
        const prevBtn = this.container.querySelector('.tool-btn.active');
        if (prevBtn) {
            prevBtn.classList.remove('active');
        }
        
        const newBtn = this.container.querySelector(`[data-tool="${toolId}"]`);
        if (newBtn) {
            newBtn.classList.add('active');
        }
        
        this.activeTool = toolId;
        
        if (toolId === 'place') {
            this.showAssetPicker();
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
        const prevSelected = this.assetPicker.querySelector('.asset-btn.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }
        
        const assetBtn = this.assetPicker.querySelector(`[data-asset-id="${assetId}"]`);
        if (assetBtn) {
            assetBtn.classList.add('selected');
        }
        
        if (this.onToolSelected) {
            this.onToolSelected('place', assetId);
        }
    }
    
    getActiveTool() {
        return this.activeTool;
    }
    
    isSnapEnabled() { return !!this.snapEnabled; }
}