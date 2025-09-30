export class HUDManager {
    constructor(economyManager, budgetManager, saveManager, namingModal) {
        this.economyManager = economyManager;
        this.budgetManager = budgetManager;
        this.saveManager = saveManager;
        this.namingModal = namingModal;
        this.sparkleDisplay = document.getElementById('sparkle-count');
        this.budgetDisplay = this.createBudgetDisplay();
        
        this.updateSparkleDisplay();
        this.updateBudgetDisplay();
        this.setupListeners();
    }
    
    createBudgetDisplay() {
        const container = document.querySelector('.hud-top');
        const budgetDiv = document.createElement('div');
        budgetDiv.className = 'budget-display';
        budgetDiv.innerHTML = `
            <div class="budget-bar">
                <span class="budget-label">📊 Polys</span>
                <div class="budget-progress">
                    <div class="budget-fill budget-poly" style="width: 0%"></div>
                </div>
                <span class="budget-value" id="poly-count">0 / 0</span>
            </div>
            <div class="budget-bar">
                <span class="budget-label">💡 Lights</span>
                <div class="budget-progress">
                    <div class="budget-fill budget-light" style="width: 0%"></div>
                </div>
                <span class="budget-value" id="light-count">0 / 0</span>
            </div>
        `;
        container.appendChild(budgetDiv);
        return budgetDiv;
    }
    
    setupListeners() {
        window.addEventListener('sparklesUpdated', (e) => {
            this.updateSparkleDisplay();
        });
        
        this.budgetManager.subscribe((status) => {
            this.updateBudgetDisplay();
        });
        
        const saveBtn = document.getElementById('save-btn');
        const newCubeBtn = document.getElementById('new-cube-btn');
        
        saveBtn.addEventListener('click', () => {
            const hasName = !!this.saveManager.getCubeName();
            this.namingModal.show(hasName);
        });
        
        newCubeBtn.addEventListener('click', () => {
            this.showNewCubeConfirmation();
        });
        
        window.addEventListener('cubeSaved', (e) => {
            this.showNotification(`Cube saved: ${e.detail.name}`, 'success');
        });
    }
    
    showNewCubeConfirmation() {
        if (confirm('Are you sure you want to start a new cube? Any unsaved changes will be lost.')) {
            this.saveManager.newCube();
            this.showNotification('Starting new cube', 'info');
        }
    }
    
    updateSparkleDisplay() {
        const sparkles = this.economyManager.getSparkles();
        this.sparkleDisplay.textContent = sparkles;
    }
    
    updateBudgetDisplay() {
        const status = this.budgetManager.getBudgetStatus();
        
        const polyFill = this.budgetDisplay.querySelector('.budget-poly');
        const lightFill = this.budgetDisplay.querySelector('.budget-light');
        const polyCount = document.getElementById('poly-count');
        const lightCount = document.getElementById('light-count');
        
        polyFill.style.width = `${Math.min(status.polys.percentage, 100)}%`;
        lightFill.style.width = `${Math.min(status.lights.percentage, 100)}%`;
        
        polyCount.textContent = `${status.polys.current} / ${status.polys.max}`;
        lightCount.textContent = `${status.lights.current} / ${status.lights.max}`;
        
        // Add warning colors when near limit
        polyFill.classList.toggle('warning', status.polys.percentage > 80);
        lightFill.classList.toggle('warning', status.lights.percentage > 80);
    }
    
    showNotification(message, type = 'info') {
        // TODO: Implement toast notification system
        console.log(`[${type}] ${message}`);
    }
}