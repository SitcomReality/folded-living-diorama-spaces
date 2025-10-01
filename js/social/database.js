const room = new WebsimSocket();

export class DatabaseManager {
    constructor() {
        this.initialized = false;
        this.hiddenIds = new Set();
        this._hiddenUnsub = null;
    }
    
    async initialize() {
        if (this.initialized) return;
        await room.initialize();
        // subscribe to moderation flags (hidden cubes)
        this._subscribeHidden();
        this.initialized = true;
    }
    
    async saveCube(cubeData) {
        await this.initialize();
        
        try {
            const cube = await room.collection('cube_v1').create({
                data: JSON.stringify(cubeData),
                name: cubeData.name || 'Untitled Cube',
                poly_count: cubeData.polyCount || 0,
                light_count: cubeData.lightCount || 0
            });
            
            return cube;
        } catch (error) {
            console.error('Error saving cube:', error);
            throw error;
        }
    }
    
    async loadCube(cubeId) {
        await this.initialize();
        
        try {
            const cubes = room.collection('cube_v1').filter({ id: cubeId }).getList();
            if (cubes.length > 0) {
                const cube = cubes[0];
                return {
                    ...cube,
                    data: JSON.parse(cube.data)
                };
            }
            return null;
        } catch (error) {
            console.error('Error loading cube:', error);
            throw error;
        }
    }
    
    async getAllCubes() {
        await this.initialize();
        
        const cubes = room.collection('cube_v1').getList();
        return cubes
            .filter(c => !this.hiddenIds.has(c.id))
            .map(cube => {
                try {
                    return {
                        ...cube,
                        data: JSON.parse(cube.data)
                    };
                } catch (e) {
                    console.warn("Failed to parse cube data for cube:", cube.id, e);
                    return { ...cube, data: {} };
                }
            });
    }
    
    subscribeToCubes(callback) {
        return room.collection('cube_v1').subscribe((cubes) => {
            const filtered = cubes.filter(c => !this.hiddenIds.has(c.id));
            const parsed = filtered.map(cube => {
                try {
                    return {
                        ...cube,
                        data: JSON.parse(cube.data)
                    };
                } catch (e) {
                    console.warn("Failed to parse cube data for cube:", cube.id, e);
                    return { ...cube, data: {} };
                }
            });
            callback(parsed);
        });
    }
    
    async updateCube(cubeId, cubeData) {
        await this.initialize();
        
        try {
            await room.collection('cube_v1').update(cubeId, {
                data: JSON.stringify(cubeData),
                name: cubeData.name || 'Untitled Cube',
                poly_count: cubeData.polyCount || 0,
                light_count: cubeData.lightCount || 0
            });
        } catch (error) {
            console.error('Error updating cube:', error);
            throw error;
        }
    }
    
    async deleteCube(cubeId) {
        await this.initialize();
        
        try {
            await room.collection('cube_v1').delete(cubeId);
        } catch (error) {
            console.error('Error deleting cube:', error);
            throw error;
        }
    }
    
    // Soft-hide for moderator: create a flag record
    async hideCube(cubeId) {
        await this.initialize();
        try {
            await room.collection('cube_hide_v1').create({ cube_id: cubeId });
        } catch (error) {
            console.error('Error flagging cube hidden:', error);
            throw error;
        }
    }
    
    _subscribeHidden() {
        try {
            // keep set in sync
            this._hiddenUnsub = room.collection('cube_hide_v1').subscribe((flags) => {
                const ids = new Set();
                flags.forEach(f => { if (f.cube_id) ids.add(f.cube_id); });
                this.hiddenIds = ids;
            });
        } catch (e) {
            console.warn('Moderation hide subscription failed:', e);
        }
    }
}