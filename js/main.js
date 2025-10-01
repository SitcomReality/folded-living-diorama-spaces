import { FoldedLivingApp } from './app.js';
import { initializeAssets } from './config/assets.js';

window.addEventListener('DOMContentLoaded', async () => {
    // Load asset manifest before initializing app
    await initializeAssets();
    window.app = new FoldedLivingApp();
});