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
            id: 'point_light',
            name: 'Point Light',
            type: 'light',
            polys: 0,
            lightCost: 1,
            cost: 0,
            category: 'lighting'
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

