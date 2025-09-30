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
            id: 'bed_single_a',
            name: 'Single Bed A',
            type: 'prop',
            polys: 500,
            cost: 30,
            category: 'furniture',
            modelPath: '/assets/gltf/furniturebits/bed_single_A.gltf'
        },
        {
            id: 'bed_single_b',
            name: 'Single Bed B',
            type: 'prop',
            polys: 500,
            cost: 30,
            category: 'furniture',
            modelPath: '/assets/gltf/furniturebits/bed_single_B.gltf'
        },
        {
            id: 'bed_double_a',
            name: 'Double Bed A',
            type: 'prop',
            polys: 800,
            cost: 50,
            category: 'furniture',
            modelPath: '/assets/gltf/furniturebits/bed_double_A.gltf'
        },
        {
            id: 'bed_double_b',
            name: 'Double Bed B',
            type: 'prop',
            polys: 800,
            cost: 50,
            category: 'furniture',
            modelPath: '/assets/gltf/furniturebits/bed_double_B.gltf'
        },
        {
            id: 'armchair',
            name: 'Armchair',
            type: 'prop',
            polys: 600,
            cost: 35,
            category: 'furniture',
            modelPath: '/assets/gltf/furniturebits/armchair.gltf'
        },
        {
            id: 'armchair_pillows',
            name: 'Armchair with Pillows',
            type: 'prop',
            polys: 700,
            cost: 40,
            category: 'furniture',
            modelPath: '/assets/gltf/furniturebits/armchair_pillows.gltf'
        },
        {
            id: 'cabinet_medium',
            name: 'Medium Cabinet',
            type: 'prop',
            polys: 400,
            cost: 25,
            category: 'furniture',
            modelPath: '/assets/gltf/furniturebits/cabinet_medium.gltf'
        },
        {
            id: 'book_single',
            name: 'Single Book',
            type: 'prop',
            polys: 50,
            cost: 5,
            category: 'furniture',
            modelPath: '/assets/gltf/furniturebits/book_single.gltf'
        },
        {
            id: 'book_set',
            name: 'Book Set',
            type: 'prop',
            polys: 200,
            cost: 15,
            category: 'furniture',
            modelPath: '/assets/gltf/furniturebits/book_set.gltf'
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