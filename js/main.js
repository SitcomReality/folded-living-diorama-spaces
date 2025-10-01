import { FoldedLivingApp } from './app/index.js';
import { initializeAssets } from './config/assets.js';

window.addEventListener('DOMContentLoaded', async () => {
    const progressFill = document.getElementById('loading-progress-fill');
    const loadingDetails = document.getElementById('loading-details');

    const onProgress = (progress) => {
        const percentage = (progress.loaded / progress.total) * 100;
        progressFill.style.width = `${percentage}%`;
        loadingDetails.textContent = `Loading asset ${progress.loaded}/${progress.total}: ${progress.file}`;
    };
    
    // Load asset manifest and preload models before initializing app
    await initializeAssets(onProgress);

    loadingDetails.textContent = 'Finalizing...';
    window.app = new FoldedLivingApp();
});