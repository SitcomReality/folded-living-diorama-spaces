export const CONSTANTS = {
    // Cube dimensions
    CUBE_SIZE: 10,
    CUBE_THICKNESS: 0.3,
    
    // Asset budgets
    MAX_POLY_COUNT: 50000,
    MAX_DYNAMIC_LIGHTS: 4,
    
    // Animation timings
    FOLD_DURATION: 1.0,
    UNFOLD_DURATION: 2.5, // Slower, more spectacular reveal
    TRANSITION_DURATION: 0.8,
    
    // Camera settings
    CAMERA_FOV: 50,
    CAMERA_NEAR: 0.1,
    CAMERA_FAR: 1000,
    CAMERA_DISTANCE: 20,
    
    // Economy
    VISIT_REWARD: 5,
    REACTION_REWARD: 2,
    DAILY_REWARD: 50,
    
    // Surface names (simplified and intuitive)
    SURFACES: {
        FRONT: 'front',       // Front wall (always faces viewer)
        BACK: 'back',         // Back wall
        CEILING: 'ceiling',   // Ceiling
        FLOOR: 'floor',       // Ground
        LEFT: 'left',         // Left wall
        RIGHT: 'right'        // Right wall
    }
};