// frontend/js/state.js

/**
 * Centralized State Management (V2)
 * Acts as the 'Single Source of Truth' for the frontend.
 * This prevents unnecessary network calls when switching between views.
 */
const state = {
    // Core Data Collections
    drones: [],      // Phase 1 & 2: Complete inventory of hardware
    pilots: [],      // Phase 3: All registered flight personnel
    missions: [],    // Phase 4: Current and historical flight logs

    // Application Context
    currentView: 'drones', // Tracks which tab the user is viewing (drones, pilots, missions)
    
    // Selection State
    // Useful for Phase 4 when assigning drones to specific pilots
    selectedDroneId: null,
    selectedPilotId: null,

    // Live Metrics (Bucket List Features)
    // These can be updated by logic in app.js to show on a dashboard header
    metrics: {
        activeMissionsCount: 0,
        availableDronesCount: 0,
        maintenanceRequiredCount: 0
    },

    /**
     * Utility: Update Metrics
     * Recalculates counts based on the current lists in state.
     */
    refreshMetrics() {
        this.metrics.activeMissionsCount = this.missions.filter(m => m.status === 'IN_PROGRESS').length;
        this.metrics.availableDronesCount = this.drones.filter(d => d.status === 'IDLE').length;
        this.metrics.maintenanceRequiredCount = this.drones.filter(d => d.status === 'MAINTENANCE').length;
    }
};

// Freeze the initial state to prevent accidental structure changes
// but allow property updates
Object.preventExtensions(state);