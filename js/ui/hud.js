export class HUDManager {
    constructor(economyManager, budgetManager, saveManager, namingModal) {
        this.economyManager = economyManager;
        this.budgetManager = budgetManager;
        this.saveManager = saveManager;
        this.namingModal = namingModal;
        this.sparkleDisplay = document.getElementById('sparkle-count');
        this.cubeNameDisplay = document.getElementById('cube-name');
        
        this.updateSparkleDisplay();
        this.updateBudgetDisplay();
        this.updateCubeNameDisplay();
        this.setupListeners();
        this.setupInfoBanner();
        this.setupThemeToggle();
    }
    
    setupListeners() {
        window.addEventListener('sparklesUpdated', () => {
            this.updateSparkleDisplay();
        });
        
        this.budgetManager.subscribe(() => {
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
            this.updateCubeNameDisplay();
            this.showNotification(`Cube saved: ${e.detail.name}`, 'success');
        });
        
        window.addEventListener('newCube', () => {
            this.updateCubeNameDisplay();
        });
    }
    
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', currentTheme);
        
        themeToggle.addEventListener('click', () => {
            const current = document.body.getAttribute('data-theme');
            const newTheme = current === 'light' ? 'dark' : 'light';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
    
    setupInfoBanner() {
        this.infoBanner = document.getElementById('info-banner');
        this.bannerMessages = [
            'Check out <a href="https://websim.com/@SitcomReality/webgem" target="_blank">WebGem</a> for Websim\'s highest quality overlooked projects!'
        ];
        
        // Show first message after 5 seconds
        setTimeout(() => this.showBannerMessage(), 5000);
        
        // Cycle through messages every 30 seconds
        setInterval(() => this.showBannerMessage(), 30000);
    }
    
    showBannerMessage() {
        const message = this.bannerMessages[Math.floor(Math.random() * this.bannerMessages.length)];
        this.infoBanner.innerHTML = message;
        this.infoBanner.classList.add('visible');
        
        setTimeout(() => {
            this.infoBanner.classList.remove('visible');
        }, 5000);
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
    
    updateCubeNameDisplay() {
        const name = this.saveManager.getCubeName() || 'Unsaved Cube';
        this.cubeNameDisplay.textContent = name;
    }
    
    updateBudgetDisplay() {
        const status = this.budgetManager.getBudgetStatus();
        
        const polyFill = document.querySelector('.budget-poly');
        const lightFill = document.querySelector('.budget-light');
        const polyCount = document.getElementById('poly-count');
        const lightCount = document.getElementById('light-count');
        
        if (polyFill && lightFill && polyCount && lightCount) {
            polyFill.style.width = `${Math.min(status.polys.percentage, 100)}%`;
            lightFill.style.width = `${Math.min(status.lights.percentage, 100)}%`;
            
            polyCount.textContent = `${status.polys.current}/${status.polys.max}`;
            lightCount.textContent = `${status.lights.current}/${status.lights.max}`;
            
            polyFill.classList.toggle('warning', status.polys.percentage > 80);
            lightFill.classList.toggle('warning', status.lights.percentage > 80);
        }
    }
    
    showNotification(message, type = 'info') {
        console.log(`[${type}] ${message}`);
    }
}