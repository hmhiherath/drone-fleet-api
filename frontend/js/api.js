// frontend/js/api.js

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Toast Notification System
 * Displays glassmorphic alerts for API errors or success messages.
 */
function showToast(message, type = 'danger') {
    const container = document.getElementById('toast-container');
    
    // Create the toast element
    const toast = document.createElement('div');
    toast.className = `toast`;
    toast.style.borderLeft = `4px solid var(--accent-${type})`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300); // Wait for fade out
    }, 4000);
}

/**
 * Core API Object
 * Contains methods to interact with the Spring Boot backend.
 */
const api = {
    // Generic request handler with built-in error catching
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                ...options
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server Error: ${response.status}`);
            }

            // HTTP 204 No Content (e.g., successful DELETE) doesn't return JSON
            if (response.status === 204) {
                return true; 
            }

            return await response.json();
            
        } catch (error) {
            console.error(`API Fetch Error [${endpoint}]:`, error);
            // Display the Apple-style toast notification on failure
            showToast(error.message || 'Failed to connect to the server. Is Spring Boot running?', 'danger');
            throw error;
        }
    },

    // ==========================================
    // DRONE ENDPOINTS
    // ==========================================
    
    async getDrones() {
        return this.request('/drones');
    },

    async getDroneById(id) {
        return this.request(`/drones/${id}`);
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
        return this.request(`/drones/${id}`, {
            method: 'DELETE'
        });
    },

    // ==========================================
    // PILOT ENDPOINTS
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

    async updatePilot(id, pilotData) {
        return this.request(`/pilots/${id}`, {
            method: 'PUT',
            body: JSON.stringify(pilotData)
        });
    },

    async deletePilot(id) {
        return this.request(`/pilots/${id}`, {
            method: 'DELETE'
        });
    },

    // ==========================================
    // FLIGHT MISSION ENDPOINTS
    // ==========================================
    // Note: Adjust the '/flight-missions' path if your Spring Boot
    // @RequestMapping is just set to '/missions' instead.

    async getMissions() {
        return this.request('/flight-missions');
    },

    async createMission(missionData) {
        return this.request('/flight-missions', {
            method: 'POST',
            body: JSON.stringify(missionData)
        });
    },

    async updateMission(id, missionData) {
        return this.request(`/flight-missions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(missionData)
        });
    },

    async deleteMission(id) {
        return this.request(`/flight-missions/${id}`, {
            method: 'DELETE'
        });
    }
};