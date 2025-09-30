export class HUDManager {
    constructor(economyManager) {
        this.economyManager = economyManager;
        this.sparkleDisplay = document.getElementById('sparkle-count');
        
        this.updateSparkleDisplay();
        this.setupListeners();
    }
    
    setupListeners() {
        window.addEventListener('sparklesUpdated', (e) => {
            this.updateSparkleDisplay();
        });
    }
    
    updateSparkleDisplay() {
        const sparkles = this.economyManager.getSparkles();
        this.sparkleDisplay.textContent = sparkles;
    }
    
    showNotification(message, type = 'info') {
        // TODO: Implement toast notification system
        console.log(`[${type}] ${message}`);
    }
}

