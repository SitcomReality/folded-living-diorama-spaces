export class GalleryManager {
    constructor(databaseManager, economyManager) {
        this.databaseManager = databaseManager;
        this.economyManager = economyManager;
        
        this.view = document.getElementById('gallery-view');
        this.grid = document.getElementById('gallery-grid');
        this.openBtn = document.getElementById('gallery-btn');
        this.closeBtn = document.getElementById('close-gallery');
        
        this.setupListeners();
    }
    
    setupListeners() {
        this.openBtn.addEventListener('click', () => {
            this.show();
        });
        
        this.closeBtn.addEventListener('click', () => {
            this.hide();
        });
    }
    
    async show() {
        this.view.classList.remove('hidden');
        await this.loadCubes();
    }
    
    hide() {
        this.view.classList.add('hidden');
    }
    
    async loadCubes() {
        const cubes = await this.databaseManager.getAllCubes();
        this.renderCubes(cubes);
    }
    
    renderCubes(cubes) {
        this.grid.innerHTML = '';
        
        if (cubes.length === 0) {
            this.grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; opacity: 0.5;">No cubes yet. Create the first one!</p>';
            return;
        }
        
        cubes.forEach(cube => {
            const card = this.createCubeCard(cube);
            this.grid.appendChild(card);
        });
    }
    
    createCubeCard(cube) {
        const card = document.createElement('div');
        card.className = 'cube-card';
        
        card.innerHTML = `
            <div class="cube-preview">
                <!-- 3D preview will be rendered here -->
            </div>
            <div class="cube-info">
                <div class="cube-creator">
                    <img class="creator-avatar" src="https://images.websim.com/avatar/${cube.username}" alt="${cube.username}">
                    <span class="creator-name">${cube.username}</span>
                </div>
                <div class="cube-stats">
                    <span class="cube-stat">📊 ${cube.poly_count || 0} polys</span>
                    <span class="cube-stat">💡 ${cube.light_count || 0} lights</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.onCubeSelected(cube);
        });
        
        return card;
    }
    
    onCubeSelected(cube) {
        // TODO: Load and transition to selected cube
        console.log('Selected cube:', cube);
        this.economyManager.visitCube(cube.id);
        this.hide();
    }
}

