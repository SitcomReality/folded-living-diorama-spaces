// Asset grouping and variant detection system
const ASSET_MANIFEST_URL = '/assets/asset-manifest.json';

// Poly cost estimates based on asset type
const POLY_ESTIMATES = {
  bed: 600,
  chair: 300,
  table: 250,
  cabinet: 350,
  couch: 850,
  armchair: 650,
  lamp: 150,
  book: 100,
  cactus: 120,
  pillow: 80,
  pictureframe: 100,
  rug: 200,
  shelf: 300,
  bush: 150,
  grass: 80,
  tree: 400,
  default: 200
};

// Category display names
const CATEGORY_NAMES = {
  furniturebits: 'Furniture',
  forest: 'Nature'
};

class AssetLibrary {
  constructor() {
    this.assets = new Map();
    this.groupedAssets = new Map();
    this.loaded = false;
    this.gltfLoader = new GLTFLoader();
    this.modelCache = new Map();
  }

  async load() {
    if (this.loaded) return;
    
    try {
      const response = await fetch(ASSET_MANIFEST_URL);
      const manifest = await response.json();
      
      for (const [category, files] of Object.entries(manifest)) {
        for (const file of files) {
          this.parseAndAddAsset(category, file);
        }
      }
      
      this.groupVariants();
      this.loaded = true;
      console.log(`✅ Loaded ${this.assets.size} assets in ${this.groupedAssets.size} groups`);
    } catch (error) {
      console.error('Failed to load asset manifest:', error);
      this.loadFallbackAssets();
    }
  }

  async preloadAll(onProgress) {
    if (!this.loaded) await this.load();

    const allAssets = Array.from(this.assets.values()).filter(a => a.modelPath);
    const totalAssets = allAssets.length;
    let loadedCount = 0;

    const promises = allAssets.map(asset => {
        return new Promise((resolve) => {
            this.gltfLoader.load(
                asset.modelPath,
                (gltf) => {
                    this.modelCache.set(asset.modelPath, gltf.scene);
                    loadedCount++;
                    if (onProgress) {
                        onProgress({ loaded: loadedCount, total: totalAssets, file: asset.filename });
                    }
                    resolve();
                },
                undefined,
                (error) => {
                    console.error(`Failed to preload ${asset.modelPath}`, error);
                    loadedCount++;
                    if (onProgress) {
                        onProgress({ loaded: loadedCount, total: totalAssets, file: asset.filename });
                    }
                    resolve(); // Resolve even on error to not block everything
                }
            );
        });
    });

    await Promise.all(promises);
    console.log('All assets preloaded.');
  }

  parseAndAddAsset(category, filename) {
    const baseName = filename.replace('.gltf', '');
    const id = `${category}_${baseName}`;
    
    // Parse name components
    const parsed = this.parseFilename(baseName);
    
    // Estimate poly cost
    const polyCost = this.estimatePolyCost(parsed.base);
    
    const asset = {
      id,
      filename,
      category,
      modelPath: `/assets/gltf/${category}/${filename}`,
      baseName: parsed.base,
      variant: parsed.variant,
      displayName: this.humanizeName(parsed.base),
      polys: polyCost,
      cost: Math.ceil(polyCost / 10),
      type: 'prop'
    };
    
    this.assets.set(id, asset);
  }

  parseFilename(name) {
    // Remove common suffixes like _Color1
    name = name.replace(/_Color1$/, '');
    
    // Detect variants: _wood, _pillows, _decorated, _A, _B, etc.
    const variantMatch = name.match(/^(.+?)_(wood|pillows|decorated|standing|oval|rectangle|stripes|[A-G]|small|medium|large|big|low|long|single|double)$/i);
    
    if (variantMatch) {
      return {
        base: variantMatch[1],
        variant: variantMatch[2]
      };
    }
    
    return {
      base: name,
      variant: null
    };
  }

  humanizeName(name) {
    // Convert snake_case to Title Case
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  estimatePolyCost(baseName) {
    const lower = baseName.toLowerCase();
    
    for (const [key, cost] of Object.entries(POLY_ESTIMATES)) {
      if (lower.includes(key)) return cost;
    }
    
    return POLY_ESTIMATES.default;
  }

  groupVariants() {
    // Group assets by base name and category
    const groups = new Map();
    
    for (const asset of this.assets.values()) {
      const groupKey = `${asset.category}_${asset.baseName}`;
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          id: groupKey,
          category: asset.category,
          baseName: asset.baseName,
          displayName: asset.displayName,
          variants: [],
          defaultVariant: null,
          polys: asset.polys,
          cost: asset.cost
        });
      }
      
      const group = groups.get(groupKey);
      group.variants.push(asset);
      
      // Set default variant (prefer non-variant, or first one)
      if (!asset.variant || !group.defaultVariant) {
        group.defaultVariant = asset.id;
      }
    }
    
    this.groupedAssets = groups;
  }

  loadFallbackAssets() {
    // Minimal fallback if manifest fails to load
    const fallbacks = [
      { category: 'basic', name: 'cube', polys: 24 },
      { category: 'basic', name: 'sphere', polys: 80 },
    ];
    
    for (const fb of fallbacks) {
      const id = `${fb.category}_${fb.name}`;
      this.assets.set(id, {
        id,
        category: fb.category,
        displayName: this.humanizeName(fb.name),
        polys: fb.polys,
        cost: 0,
        type: 'basic'
      });
    }
    
    this.loaded = true;
  }

  getAssetGroups() {
    return Array.from(this.groupedAssets.values());
  }

  getAssetGroupsByCategory(category) {
    return this.getAssetGroups().filter(g => g.category === category);
  }

  getCategories() {
    const categories = new Set();
    for (const group of this.groupedAssets.values()) {
      categories.add(group.category);
    }
    return Array.from(categories);
  }

  getCategoryDisplayName(category) {
    return CATEGORY_NAMES[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }

  getAssetById(id) {
    return this.assets.get(id);
  }

  getAssetGroup(groupId) {
    return this.groupedAssets.get(groupId);
  }

  async loadModel(path) {
    if (this.modelCache.has(path)) {
        const cachedModel = this.modelCache.get(path);
        // Ensure we always return a clone to avoid shared state issues
        return cachedModel.clone();
    }
    
    // Fallback for models not in cache (shouldn't happen with preloading)
    return new Promise((resolve, reject) => {
        this.gltfLoader.load(
            path,
            (gltf) => {
                const model = gltf.scene;
                this.modelCache.set(path, model);
                resolve(model.clone());
            },
            undefined,
            reject
        );
    });
  }
}

// Global instance
export const assetLibrary = new AssetLibrary();

// Legacy compatibility functions
export async function initializeAssets(onProgress) {
  await assetLibrary.load();
  await assetLibrary.preloadAll(onProgress);
}

export function getAssetById(id) {
  return assetLibrary.getAssetById(id);
}

export function getAllAssets() {
  return Array.from(assetLibrary.assets.values());
}

export function getAssetsByCategory(category) {
  return getAllAssets().filter(a => a.category === category);
}

export function getCategories() {
  return assetLibrary.getCategories();
}

// New functions for grouped assets
export function getAssetGroups() {
  return assetLibrary.getAssetGroups();
}

export function getAssetGroupsByCategory(category) {
  return assetLibrary.getAssetGroupsByCategory(category);
}