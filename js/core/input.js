export class InputManager {
    constructor() {
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.mouseDown = false;
        
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
        });
        
        window.addEventListener('mousedown', () => {
            this.mouseDown = true;
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
}

