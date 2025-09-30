export class NamingModal {
    constructor(saveManager) {
        this.saveManager = saveManager;
        this.selectedWords = [];
        this.availableWords = [];
        this.isUpdate = false;

        this.createModal();
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'naming-modal hidden';
        this.modal.innerHTML = `
            <div class="naming-modal-overlay"></div>
            <div class="naming-modal-content">
                <div class="naming-modal-header">
                    <h2>Name Your Cube</h2>
                    <button class="icon-btn close-naming-btn">✕</button>
                </div>
                <div class="naming-modal-body">
                    <div class="name-preview">
                        <span class="name-preview-text">Select words to build your name</span>
                    </div>
                    <div class="selected-words"></div>
                    <div class="word-selection">
                        <div class="word-grid"></div>
                        <button class="reroll-btn">🎲 Reroll Words</button>
                    </div>
                </div>
                <div class="naming-modal-footer">
                    <button class="cancel-btn">Cancel</button>
                    <button class="save-btn" disabled>Save Cube</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.setupEvents();
    }

    setupEvents() {
        const overlay = this.modal.querySelector('.naming-modal-overlay');
        const closeBtn = this.modal.querySelector('.close-naming-btn');
        const cancelBtn = this.modal.querySelector('.cancel-btn');
        const saveBtn = this.modal.querySelector('.save-btn');
        const rerollBtn = this.modal.querySelector('.reroll-btn');

        overlay.addEventListener('click', () => this.hide());
        closeBtn.addEventListener('click', () => this.hide());
        cancelBtn.addEventListener('click', () => this.hide());
        saveBtn.addEventListener('click', () => this.save());
        rerollBtn.addEventListener('click', () => this.rerollWords());
    }

    show(isUpdate = false) {
        this.isUpdate = isUpdate;
        this.selectedWords = [];
        this.modal.classList.remove('hidden');
        this.rerollWords();
        this.updateUI();
    }

    hide() {
        this.modal.classList.add('hidden');
    }

    rerollWords() {
        this.availableWords = this.saveManager.getRandomWords(12);
        this.renderWordGrid();
    }

    renderWordGrid() {
        const grid = this.modal.querySelector('.word-grid');
        grid.innerHTML = '';

        this.availableWords.forEach(word => {
            const btn = document.createElement('button');
            btn.className = 'word-btn';
            btn.textContent = word;
            btn.disabled = this.selectedWords.includes(word) || this.selectedWords.length >= 4;

            btn.addEventListener('click', () => {
                if (this.selectedWords.length < 4 && !this.selectedWords.includes(word)) {
                    this.selectedWords.push(word);
                    this.updateUI();
                }
            });

            grid.appendChild(btn);
        });
    }

    updateUI() {
        const preview = this.modal.querySelector('.name-preview-text');
        const selectedContainer = this.modal.querySelector('.selected-words');
        const saveBtn = this.modal.querySelector('.save-btn');

        if (this.selectedWords.length > 0) {
            preview.textContent = this.selectedWords.join(' ');
        } else {
            preview.textContent = 'Select words to build your name';
        }

        selectedContainer.innerHTML = '';
        this.selectedWords.forEach((word, index) => {
            const chip = document.createElement('div');
            chip.className = 'word-chip';
            chip.innerHTML = `
                <span>${word}</span>
                <button class="remove-word-btn">✕</button>
            `;

            chip.querySelector('.remove-word-btn').addEventListener('click', () => {
                this.selectedWords.splice(index, 1);
                this.updateUI();
            });

            selectedContainer.appendChild(chip);
        });

        saveBtn.disabled = this.selectedWords.length < 2;
        this.renderWordGrid();
    }

    async save() {
        const name = this.selectedWords.join(' ');

        if (this.isUpdate) {
            // Show options: update or save as new
            this.showUpdateOptions(name);
        } else {
            await this.saveManager.manualSave(name);
            this.hide();
        }
    }

    showUpdateOptions(name) {
        const body = this.modal.querySelector('.naming-modal-body');
        body.innerHTML = `
            <div class="update-options">
                <h3>Save Options</h3>
                <p>Current cube: <strong>${this.saveManager.getCubeName()}</strong></p>
                <p>New name: <strong>${name}</strong></p>
                <div class="update-buttons">
                    <button class="update-existing-btn">Update Existing Cube</button>
                    <button class="save-as-new-btn">Save as New Cube</button>
                </div>
            </div>
        `;

        const updateBtn = body.querySelector('.update-existing-btn');
        const saveAsNewBtn = body.querySelector('.save-as-new-btn');

        updateBtn.addEventListener('click', async () => {
            await this.saveManager.manualSave(name);
            this.hide();
        });

        saveAsNewBtn.addEventListener('click', async () => {
            await this.saveManager.saveAsNew(name);
            this.hide();
        });
    }
}