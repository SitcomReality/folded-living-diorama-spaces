export class GalleryManager {
    constructor(databaseManager, economyManager) {
        this.databaseManager = databaseManager;
        this.economyManager = economyManager;
        
        this.view = document.getElementById('gallery-view');
        this.grid = document.getElementById('gallery-grid');
        this.openBtn = document.getElementById('gallery-btn');
        this.closeBtn = document.getElementById('close-gallery');
        
        this.setupListeners();
        this.unsubscribe = null;
        this.currentUser = null;
        this._initUser();
    }
    
    async _initUser() {
        try {
            const user = await window.websim.getCurrentUser();
            this.currentUser = user?.username || null;
        } catch (e) {
            console.warn('Failed to get current user:', e);
        }
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
        if (this.unsubscribe) this.unsubscribe();
        this.unsubscribe = this.databaseManager.subscribeToCubes((cubes) => this.renderCubes(cubes));
    }
    
    hide() {
        this.view.classList.add('hidden');
        if (this.unsubscribe) { this.unsubscribe(); this.unsubscribe = null; }
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
        
        const displayName = cube.name || (cube.data && cube.data.name) || 'Untitled Cube';
        const polyCount = cube.poly_count || (cube.data && cube.data.polyCount) || 0;
        const lightCount = cube.light_count || (cube.data && cube.data.lightCount) || 0;
        const thumbnailUrl = cube.data?.thumbnailUrl;
        
        const previewHTML = thumbnailUrl 
            ? `<img src="${thumbnailUrl}" class="cube-thumbnail" alt="Preview of ${displayName}">`
            : '<div class="preview-placeholder">📦</div>';
        
        const isOwner = this.currentUser && cube.username === this.currentUser;
        const isModerator = this.currentUser === 'SitcomReality';
        const canModerate = isOwner || isModerator;
        const actionLabel = isOwner ? 'Delete' : 'Delete';
        
        card.innerHTML = `
            <div class="cube-preview">
                ${previewHTML}
            </div>
            <div class="cube-info">
                <div class="cube-title">${displayName}</div>
                <div class="cube-creator">
                    <img class="creator-avatar" src="https://images.websim.com/avatar/${cube.username}" alt="${cube.username}">
                    <span class="creator-name">${cube.username}</span>
                </div>
                <div class="cube-stats">
                    <span class="cube-stat">📊 ${polyCount} polys</span>
                    <span class="cube-stat">💡 ${lightCount} lights</span>
                </div>
                <div class="cube-reactions">
                    <button class="reaction-btn" data-reaction="heart">❤️</button>
                    <button class="reaction-btn" data-reaction="star">⭐</button>
                    <button class="reaction-btn" data-reaction="fire">🔥</button>
                    <button class="reaction-btn" data-reaction="sparkle">✨</button>
                    ${canModerate ? `<button class="reaction-btn delete-btn">🗑️ ${actionLabel}</button>` : ``}
                </div>
            </div>
        `;
        
        // Handle cube selection
        const preview = card.querySelector('.cube-preview');
        preview.addEventListener('click', () => {
            this.onCubeSelected(cube);
        });
        
        // Handle reactions
        const reactionBtns = card.querySelectorAll('.reaction-btn');
        reactionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onReaction(cube, btn.dataset.reaction);
                btn.classList.add('reacted');
                setTimeout(() => btn.classList.remove('reacted'), 300);
            });
        });
        
        if (canModerate) {
            const delBtn = card.querySelector('.delete-btn');
            delBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const confirmMsg = isOwner
                    ? 'Delete this cube? This cannot be undone.'
                    : 'Moderator action: Remove this cube from the gallery?';
                if (!confirm(confirmMsg)) return;
                try {
                    if (isOwner) {
                        await this.databaseManager.deleteCube(cube.id);
                    } else {
                        await this.databaseManager.hideCube(cube.id);
                    }
                } catch (err) {
                    console.error('Delete/Hide failed:', err);
                    alert('Failed to delete/hide cube.');
                }
            });
        }
        
        return card;
    }
    
    async onCubeSelected(cube) {
        console.log('Selected cube:', cube);
        
        // Warn about unsaved changes
        const hasUnsaved = window.app?.saveManager?.hasUnsavedChanges?.();
        if (hasUnsaved) {
            if (!confirm('Loading this cube will lose any unsaved changes to your current cube. Continue?')) {
                return;
            }
        }
        
        this.economyManager.visitCube(cube.id);
        this.hide();
        
        // Load the cube data
        await this.loadCube(cube);
    }
    
    async loadCube(cube) {
        if (!window.app) return;
        
        // Clear current cube
        window.app.resetCube();
        
        // Load cube data
        await window.app.loadCubeData(cube.data);
        
        // Set cube ID and name in save manager
        window.app.saveManager.currentCubeId = cube.id;
        window.app.saveManager.currentCubeName = cube.name || cube.data?.name || 'Untitled Cube';
        window.app.saveManager.autoSave();
        window.app.hudManager.updateCubeNameDisplay();
        
        // Ensure cube starts folded
        if (!window.app.cube.isFolded) {
            await window.app.foldingAnimator.fold(0.5);
        }
        
        // Show unfold hint banner
        window.dispatchEvent(new CustomEvent('cubeLoaded'));
    }
    
    onReaction(cube, reactionType) {
        const reward = this.economyManager.leaveReaction(cube.id);
        console.log(`Reacted with ${reactionType}, earned ${reward} ✨`);
    }
}