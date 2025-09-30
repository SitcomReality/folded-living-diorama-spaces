import { ASSET_LIBRARY } from '../config/assets.js';

export class ToolbarManager {
    constructor(container, onToolSelected) {
        this.container = container;
        this.onToolSelected = onToolSelected;
        this.activeTool = null;
        
        this.createToolbar();
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
        
        if (this.onToolSelected) {
            this.onToolSelected(toolId);
        }
    }
    
    getActiveTool() {
        return this.activeTool;
    }
}

