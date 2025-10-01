import { DioramaCube } from '../cube/cube.js';
import { FoldingAnimator } from '../cube/folding/index.js';
import { SurfaceManager } from '../cube/surfaces.js';

export function setupCube(app) {
    app.cube = new DioramaCube();
    app.scene.add(app.cube.getGroup());
    app.foldingAnimator = new FoldingAnimator(app.cube);
    app.surfaceManager = new SurfaceManager(app.cube);
}

