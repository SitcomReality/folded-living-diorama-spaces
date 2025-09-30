export const ASSET_LIBRARY = {
    basic: [
        {
            id: 'cube_small',
            name: 'Small Cube',
            type: 'prop',
            polys: 24,
            cost: 0,
            category: 'basic'
        },
        {
            id: 'sphere_low',
            name: 'Low-Poly Sphere',
            type: 'prop',
            polys: 80,
            cost: 0,
            category: 'basic'
        },
        {
            id: 'cylinder',
            name: 'Cylinder',
            type: 'prop',
            polys: 48,
            cost: 0,
            category: 'basic'
        },
        {
            id: 'cone',
            name: 'Cone',
            type: 'prop',
            polys: 32,
            cost: 0,
            category: 'basic'
        }
    ],
    
    furniture: [
        {
            id: 'chair_simple',
            name: 'Simple Chair',
            type: 'prop',
            polys: 120,
            cost: 15,
            category: 'furniture'
        },
        {
            id: 'table_low',
            name: 'Low Table',
            type: 'prop',
            polys: 180,
            cost: 20,
            category: 'furniture'
        },
        {
            id: 'lamp_floor',
            name: 'Floor Lamp',
            type: 'prop',
            polys: 150,
            cost: 25,
            category: 'furniture'
        }
    ],
    
    nature: [
        {
            id: 'tree_simple',
            name: 'Simple Tree',
            type: 'prop',
            polys: 200,
            cost: 10,
            category: 'nature'
        },
        {
            id: 'grass_patch',
            name: 'Grass Patch',
            type: 'prop',
            polys: 50,
            cost: 5,
            category: 'nature'
        },
        {
            id: 'rock_small',
            name: 'Small Rock',
            type: 'prop',
            polys: 40,
            cost: 5,
            category: 'nature'
        },
        {
            id: 'flower_patch',
            name: 'Flower Patch',
            type: 'prop',
            polys: 120,
            cost: 15,
            category: 'nature'
        }
    ],
    
    lighting: [
        {
            id: 'point_light',
            name: 'Point Light',
            type: 'light',
            polys: 0,
            lightCost: 1,
            cost: 0,
            category: 'lighting'
        },
        {
            id: 'spot_light',
            name: 'Spot Light',
            type: 'light',
            polys: 0,
            lightCost: 1,
            cost: 10,
            category: 'lighting'
        }
    ]
};

export function getAssetById(id) {
    for (const category of Object.values(ASSET_LIBRARY)) {
        const asset = category.find(a => a.id === id);
        if (asset) return asset;
    }
    return null;
}

export function getAllAssets() {
    return Object.values(ASSET_LIBRARY).flat();
}

export function getAssetsByCategory(category) {
    return ASSET_LIBRARY[category] || [];
}

export function getCategories() {
    return Object.keys(ASSET_LIBRARY);
}