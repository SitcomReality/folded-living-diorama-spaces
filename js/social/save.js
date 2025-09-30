export class SaveManager {
    constructor(cube, databaseManager) {
        this.cube = cube;
        this.databaseManager = databaseManager;
        this.currentCubeId = null;
        this.currentCubeName = null;
        this.prefixes = [];
        this.suffixes = [];

        this.loadWordLists();
        this.loadFromLocalStorage();
    }

    async loadWordLists() {
        try {
            const [prefixResponse, suffixResponse] = await Promise.all([
                fetch('/assets/xml/prefixes.xml'),
                fetch('/assets/xml/suffixes.xml')
            ]);

            const prefixText = await prefixResponse.text();
            const suffixText = await suffixResponse.text();

            const parser = new DOMParser();
            const prefixDoc = parser.parseFromString(prefixText, 'text/xml');
            const suffixDoc = parser.parseFromString(suffixText, 'text/xml');

            this.prefixes = Array.from(prefixDoc.querySelectorAll('item')).map(item => item.textContent.trim());
            this.suffixes = Array.from(suffixDoc.querySelectorAll('item')).map(item => item.textContent.trim());
        } catch (error) {
            console.error('Failed to load word lists:', error);
            this.prefixes = ['Azure', 'Crimson', 'Golden', 'Silver', 'Mystic'];
            this.suffixes = ['Haven', 'Realm', 'Sanctuary', 'Domain', 'Refuge'];
        }
    }

    getRandomWords(count = 8) {
        const allWords = [...this.prefixes, ...this.suffixes];
        const selected = [];
        for (let i = 0; i < count; i++) {
            const word = allWords[Math.floor(Math.random() * allWords.length)];
            if (!selected.includes(word)) {
                selected.push(word);
            }
        }
        return selected;
    }

    autoSave() {
        const data = this.serializeCube();
        localStorage.setItem('foldedliving_autosave', JSON.stringify({
            data,
            cubeId: this.currentCubeId,
            cubeName: this.currentCubeName,
            timestamp: Date.now()
        }));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('foldedliving_autosave');
        if (saved) {
            try {
                const { data, cubeId, cubeName } = JSON.parse(saved);
                this.currentCubeId = cubeId;
                this.currentCubeName = cubeName;
                return data;
            } catch (error) {
                console.error('Failed to load autosave:', error);
            }
        }
        return null;
    }

    async manualSave(cubeName) {
        const data = this.serializeCube();

        if (this.currentCubeId && this.currentCubeName) {
            // Update existing cube
            await this.databaseManager.updateCube(this.currentCubeId, data);
        } else {
            // Create new cube
            const cube = await this.databaseManager.saveCube(data);
            this.currentCubeId = cube.id;
            this.currentCubeName = cubeName;
        }

        this.autoSave();

        window.dispatchEvent(new CustomEvent('cubeSaved', {
            detail: { name: cubeName, id: this.currentCubeId }
        }));
    }

    async saveAsNew(cubeName) {
        this.currentCubeId = null;
        this.currentCubeName = cubeName;
        await this.manualSave(cubeName);
    }

    newCube() {
        this.currentCubeId = null;
        this.currentCubeName = null;
        localStorage.removeItem('foldedliving_autosave');

        window.dispatchEvent(new CustomEvent('newCube'));
    }

    serializeCube() {
        const cubeData = this.cube.serialize();
        const settings = window.app?.settingsManager?.getSettings?.();
        return {
            ...cubeData,
            settings,
            name: this.currentCubeName
        };
    }

    getCubeName() {
        return this.currentCubeName;
    }

    getCubeId() {
        return this.currentCubeId;
    }

    hasUnsavedChanges() {
        return !this.currentCubeId;
    }
}