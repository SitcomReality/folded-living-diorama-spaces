import { CONSTANTS } from '../config/constants.js';
import { getAssetById } from '../config/assets.js';

export class BudgetManager {
    constructor() {
        this.currentPolyCount = 0;
        this.currentLightCount = 0;
        this.listeners = [];
    }
    
    addAsset(assetId) {
        const asset = getAssetById(assetId);
        if (!asset) return false;
        
        const newPolyCount = this.currentPolyCount + asset.polys;
        const newLightCount = this.currentLightCount + (asset.lightCost || 0);
        
        if (newPolyCount > CONSTANTS.MAX_POLY_COUNT) {
            console.warn('Poly budget exceeded');
            return false;
        }
        
        if (newLightCount > CONSTANTS.MAX_DYNAMIC_LIGHTS) {
            console.warn('Light budget exceeded');
            return false;
        }
        
        this.currentPolyCount = newPolyCount;
        this.currentLightCount = newLightCount;
        this.notifyListeners();
        
        return true;
    }
    
    removeAsset(assetId) {
        const asset = getAssetById(assetId);
        if (!asset) return;
        
        this.currentPolyCount = Math.max(0, this.currentPolyCount - asset.polys);
        this.currentLightCount = Math.max(0, this.currentLightCount - (asset.lightCost || 0));
        this.notifyListeners();
    }
    
    getBudgetStatus() {
        return {
            polys: {
                current: this.currentPolyCount,
                max: CONSTANTS.MAX_POLY_COUNT,
                percentage: (this.currentPolyCount / CONSTANTS.MAX_POLY_COUNT) * 100
            },
            lights: {
                current: this.currentLightCount,
                max: CONSTANTS.MAX_DYNAMIC_LIGHTS,
                percentage: (this.currentLightCount / CONSTANTS.MAX_DYNAMIC_LIGHTS) * 100
            }
        };
    }
    
    subscribe(callback) {
        this.listeners.push(callback);
    }
    
    notifyListeners() {
        const status = this.getBudgetStatus();
        this.listeners.forEach(callback => callback(status));
    }
}

