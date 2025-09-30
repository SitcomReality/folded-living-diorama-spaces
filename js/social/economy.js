import { CONSTANTS } from '../config/constants.js';

export class EconomyManager {
    constructor() {
        this.sparkles = this.loadSparkles();
        this.visitedCubes = new Set();
        this.lastDailyReward = this.loadLastDailyReward();
    }
    
    loadSparkles() {
        const saved = localStorage.getItem('sparkles');
        return saved ? parseInt(saved) : 0;
    }
    
    saveSparkles() {
        localStorage.setItem('sparkles', this.sparkles.toString());
    }
    
    loadLastDailyReward() {
        const saved = localStorage.getItem('lastDailyReward');
        return saved ? new Date(saved) : null;
    }
    
    saveLastDailyReward() {
        localStorage.setItem('lastDailyReward', new Date().toISOString());
    }
    
    getSparkles() {
        return this.sparkles;
    }
    
    addSparkles(amount) {
        this.sparkles += amount;
        this.saveSparkles();
        this.notifyUpdate();
    }
    
    removeSparkles(amount) {
        if (this.sparkles >= amount) {
            this.sparkles -= amount;
            this.saveSparkles();
            this.notifyUpdate();
            return true;
        }
        return false;
    }
    
    visitCube(cubeId) {
        if (!this.visitedCubes.has(cubeId)) {
            this.visitedCubes.add(cubeId);
            this.addSparkles(CONSTANTS.VISIT_REWARD);
            return CONSTANTS.VISIT_REWARD;
        }
        return 0;
    }
    
    leaveReaction(cubeId) {
        this.addSparkles(CONSTANTS.REACTION_REWARD);
        return CONSTANTS.REACTION_REWARD;
    }
    
    claimDailyReward() {
        const now = new Date();
        
        if (!this.lastDailyReward || this.isNewDay(this.lastDailyReward, now)) {
            this.addSparkles(CONSTANTS.DAILY_REWARD);
            this.lastDailyReward = now;
            this.saveLastDailyReward();
            return CONSTANTS.DAILY_REWARD;
        }
        
        return 0;
    }
    
    isNewDay(date1, date2) {
        return date1.toDateString() !== date2.toDateString();
    }
    
    notifyUpdate() {
        const event = new CustomEvent('sparklesUpdated', { 
            detail: { sparkles: this.sparkles } 
        });
        window.dispatchEvent(event);
    }
}

