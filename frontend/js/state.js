// frontend/js/state.js

/**
 * --- Architectural Improvement: Event-Driven State Management (Store Pattern) ---
 * This encapsulates the state privately. Components cannot modify the data directly.
 * Instead, they call update methods, and the Store automatically notifies any
 * subscribed UI components to re-render. This eliminates UI desynchronization bugs.
 */

class AppStore {
    // Private state using ES6 private fields
    #state = {
        drones: [],
        pilots: [],
        missions: [],
        currentView: 'drones'
    };

    // Subscribed listeners (functions to call when state changes)
    #listeners = new Set();

    /**
     * Subscribe to state changes.
     * @param {Function} listenerCallback - Function to run on state update
     * @returns {Function} Unsubscribe function
     */
    subscribe(listenerCallback) {
        this.#listeners.add(listenerCallback);
        return () => this.#listeners.delete(listenerCallback);
    }

    /**
     * Notify all listeners that state has changed.
     */
    #notify() {
        // Pass a read-only copy of the state to prevent accidental mutations
        const readOnlyState = Object.freeze({ ...this.#state });
        this.#listeners.forEach(listener => listener(readOnlyState));
    }

    // ==========================================
    // GETTERS (Derived State)
    // ==========================================

    get state() {
        return Object.freeze({ ...this.#state });
    }

    get metrics() {
        return {
            // Note: Updated to match backend DTO field names ('missionStatus')
            activeMissionsCount: this.#state.missions.filter(m => m.missionStatus === 'SCHEDULED' || m.missionStatus === 'IN_PROGRESS').length,
            availableDronesCount: this.#state.drones.filter(d => d.status === 'IDLE').length,
            maintenanceRequiredCount: this.#state.drones.filter(d => d.status === 'MAINTENANCE').length,
            availablePilotsCount: this.#state.pilots.filter(p => p.status === 'AVAILABLE').length
        };
    }

    // ==========================================
    // SETTERS (Actions)
    // ==========================================

    setView(viewName) {
        if (this.#state.currentView !== viewName) {
            this.#state.currentView = viewName;
            this.#notify();
        }
    }

    setDrones(dronesArray) {
        this.#state.drones = dronesArray;
        this.#notify();
    }

    setPilots(pilotsArray) {
        this.#state.pilots = pilotsArray;
        this.#notify();
    }

    setMissions(missionsArray) {
        this.#state.missions = missionsArray;
        this.#notify();
    }

    // Granular updates (e.g., updating a single drone without refreshing the whole list)
    updateDroneInStore(updatedDrone) {
        const index = this.#state.drones.findIndex(d => d.id === updatedDrone.id);
        if (index !== -1) {
            this.#state.drones[index] = updatedDrone;
            this.#notify();
        }
    }
}

// Export a single, global instance of the store (Singleton pattern)
window.store = new AppStore();