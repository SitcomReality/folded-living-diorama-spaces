const room = new WebsimSocket();

export class DatabaseManager {
    constructor() {
        this.initialized = false;
    }
    
    async initialize() {
        if (this.initialized) return;
        await room.initialize();
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
        return cubes.map(cube => {
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
            const parsed = cubes.map(cube => {
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
}