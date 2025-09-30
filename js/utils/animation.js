export class AnimationLoop {
    constructor() {
        this.callbacks = [];
        this.isRunning = false;
        this.lastTime = 0;
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    loop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.callbacks.forEach(callback => callback(deltaTime));
        
        requestAnimationFrame(() => this.loop());
    }
    
    add(callback) {
        this.callbacks.push(callback);
    }
    
    remove(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }
}

