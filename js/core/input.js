export class InputManager {
    constructor() {
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.mouseDown = false;
        this.mouseDownStart = { x: 0, y: 0 };
        this.mouseMovedSinceDown = false;
        
        this.setupListeners();
    }
    
    setupListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        window.addEventListener('mousemove', (e) => {
            this.mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
            if (this.mouseDown) {
                const dx = this.mousePos.x - this.mouseDownStart.x;
                const dy = this.mousePos.y - this.mouseDownStart.y;
                if (Math.hypot(dx, dy) > 0.01) this.mouseMovedSinceDown = true;
            }
        });
        
        window.addEventListener('mousedown', () => {
            this.mouseDown = true;
            this.mouseDownStart = { ...this.mousePos };
            this.mouseMovedSinceDown = false;
        });
        
        window.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });
    }
    
    isKeyPressed(key) {
        return this.keys[key.toLowerCase()] || false;
    }
    
    getMousePosition() {
        return this.mousePos;
    }
    
    isMouseDown() {
        return this.mouseDown;
    }
    
    didMouseMoveSinceMouseDown() {
        return this.mouseMovedSinceDown;
    }

    resetCursor() {
        document.body.className = '';
    }
    saveCursor() { this._savedCursor = { x: this.mousePos.x, y: this.mousePos.y }; }
    restoreCursor() { if (this._savedCursor) { this.mousePos = { ...this._savedCursor }; this._savedCursor = null; } }
}