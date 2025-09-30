export const CONSTANTS = {
    // Cube dimensions
    CUBE_SIZE: 10,
    
    // Asset budgets
    MAX_POLY_COUNT: 50000,
    MAX_DYNAMIC_LIGHTS: 4,
    
    // Animation timings
    FOLD_DURATION: 1.0,
    UNFOLD_DURATION: 1.2,
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
    
    // Surface names (fold-agnostic nomenclature)
    SURFACES: {
        PORTAL: 'portal',      // Front wall (always faces viewer)
        BACKDROP: 'backdrop',  // Back wall
        SKY: 'sky',           // Ceiling
        EARTH: 'earth',       // Ground
        WING_LEFT: 'wing_left',   // Left wall
        WING_RIGHT: 'wing_right'  // Right wall
    }
};

