// frontend/js/api.js

/**
 * --- Architectural Improvement: Environment Agnostic URL ---
 * By using a relative path '/api' instead of 'http://localhost:8080/api', 
 * we allow an Nginx reverse proxy (in your Docker setup) to route requests properly.
 * This entirely eliminates CORS issues and allows the app to run on any domain/IP.
 */
const API_BASE_URL = '/api';

/**
 * --- Architectural Improvement: Standardized Error Handling ---
 * Custom Error class to normalize API failures. This prepares the frontend
 * to gracefully handle standard RFC 7807 Problem Details from Spring Boot.
 */
class ApiError extends Error {
    constructor(message, status, details = null) {
        super(message);
        this.status = status;
        this.details = details;
        this.name = 'ApiError';
    }
}

/**
 * Core API Client
 * Strictly handles HTTP communication. 
 * ZERO DOM manipulation, HTML rendering, or UI state logic belongs here.
 */
const api = {
    async request(endpoint, options = {}) {
        try {
            // Ensure endpoint starts with a slash
            const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            
            const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' 
                },
                ...options
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: `Server Error: ${response.status} ${response.statusText}` };
                }
                
                // Throwing a structured error allows the UI layer to show precise toast messages
                throw new ApiError(
                    errorData.detail || errorData.message || 'An unexpected error occurred', 
                    response.status,
                    errorData
                );
            }

            // Handle 204 No Content (typically used for DELETE requests)
            if (response.status === 204) return true;
            
            return await response.json();
            
        } catch (error) {
            // Log the technical error for developers, but throw it to the UI layer
            // so app.js can trigger the showToast() function.
            console.error(`[API Fetch Error] ${options.method || 'GET'} ${endpoint}:`, error);
            throw error; 
        }
    },

    // ==========================================
    // PHASE 1 & 2: DRONE MANAGEMENT
    // ==========================================
    async getDrones() { 
        return this.request('/drones'); 
    },
    
    async createDrone(droneData) {
        return this.request('/drones', { 
            method: 'POST', 
            body: JSON.stringify(droneData) 
        });
    },

    async updateDrone(id, droneData) {
        return this.request(`/drones/${id}`, { 
            method: 'PUT', 
            body: JSON.stringify(droneData) 
        });
    },

    async deleteDrone(id) {
        return this.request(`/drones/${id}`, { method: 'DELETE' });
    },

    // ==========================================
    // PHASE 3: PILOT ROSTER
    // ==========================================
    async getPilots() { 
        return this.request('/pilots'); 
    },

    async createPilot(pilotData) {
        return this.request('/pilots', { 
            method: 'POST', 
            body: JSON.stringify(pilotData) 
        });
    },

    async deletePilot(id) {
        return this.request(`/pilots/${id}`, { method: 'DELETE' });
    },

    // ==========================================
    // PHASE 4: MISSION CONTROL
    // ==========================================
    async getMissions() { 
        return this.request('/flight-missions'); 
    },

    async createMission(missionData) {
        return this.request('/flight-missions', { 
            method: 'POST', 
            body: JSON.stringify(missionData) 
        });
    },

    async updateMissionStatus(id, status) {
        return this.request(`/flight-missions/${id}/status`, {
            method: 'PATCH',
            // Note: If your backend expects a specific DTO, ensure this matches.
            body: JSON.stringify({ status }) 
        });
    },

    /**
     * Data aggregation belongs in the API/Service layer.
     * Fetches only IDLE drones and AVAILABLE pilots for the mission modal.
     */
    async getAvailableAssets() {
        const [drones, pilots] = await Promise.all([
            this.getDrones(),
            this.getPilots()
        ]);
        return {
            drones: drones.filter(d => d.status === 'IDLE'),
            pilots: pilots.filter(p => p.status === 'AVAILABLE' || !p.status)
        };
    }
};