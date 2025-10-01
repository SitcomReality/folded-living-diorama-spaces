import { SceneManager } from '../core/scene.js';
import { CameraController } from '../core/camera.js';
import { RendererManager } from '../core/renderer.js';
import { InputManager } from '../core/input.js';
import { AnimationLoop } from '../utils/animation.js';

export function setupCore(app) {
    const container = document.getElementById('canvas-container');
    app.renderer = new RendererManager(container);
    app.scene = new SceneManager();
    app.camera = new CameraController(app.renderer.getRenderer());
    app.input = new InputManager();
    app.animationLoop = new AnimationLoop();
}

