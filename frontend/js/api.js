// frontend/js/api.js

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Toast Notification System
 * Displays glassmorphic alerts for API errors or success messages.
 */
function showToast(message, type = 'danger') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast`;
    toast.style.borderLeft = `4px solid var(--accent-${type})`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Core API Object
 * Handles all CRUD operations for Drones, Pilots, and Missions.
 */
const api = {
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: { 'Content-Type': 'application/json' },
                ...options
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server Error: ${response.status}`);
            }

            return response.status === 204 ? true : await response.json();
            
        } catch (error) {
            console.error(`API Fetch Error [${endpoint}]:`, error);
            showToast(error.message || 'Connection lost. Is the backend running?', 'danger');
            throw error;
        }
    },

    // ==========================================
    // PHASE 1 & 2: DRONE MANAGEMENT
    // ==========================================
    async getDrones() { return this.request('/drones'); },
    
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
    async getPilots() { return this.request('/pilots'); },

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
    // PHASE 4: MISSION CONTROL (Relationships)
    // ==========================================
    async getMissions() { return this.request('/flight-missions'); },

    async createMission(missionData) {
        // missionData should contain { destination, droneId, pilotId }
        return this.request('/flight-missions', {
            method: 'POST',
            body: JSON.stringify(missionData)
        });
    },

    async updateMissionStatus(id, status) {
        return this.request(`/flight-missions/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    },

    // Utility for Mission Modal: Fetch only IDLE drones and AVAILABLE pilots
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

// ==========================================
// SHARED UI RENDERING (Phase 3 & 4)
// ==========================================

function renderPilotCards(pilots) {
    if (!pilots || pilots.length === 0) {
        return `<div class="empty-state">No pilots registered in the roster.</div>`;
    }

    return `<div class="card-grid">` + pilots.map(pilot => `
        <div class="drone-card">
            <div class="card-header">
                <div>
                    <span class="secondary">ID: ${pilot.id}</span>
                    <h3>${pilot.name}</h3>
                </div>
                <button onclick="handleDeletePilot(${pilot.id})" class="action-btn delete" title="Remove Pilot">🗑</button>
            </div>
            <div class="card-body">
                <p class="secondary" style="font-size: 13px; margin-bottom: 8px;">License: ${pilot.licenseNumber}</p>
                <span class="badge ${pilot.status === 'ON_MISSION' ? 'warning' : 'success'}">
                    ${pilot.status || 'AVAILABLE'}
                </span>
            </div>
        </div>
    `).join('') + `</div>`;
}

// Global handler for the Delete Pilot button
window.handleDeletePilot = async (id) => {
    if (!confirm("Are you sure you want to remove this pilot from the roster?")) return;
    try {
        await api.deletePilot(id);
        showToast("Pilot removed successfully", "success");
        // Trigger a view refresh (assuming loadPilotsView is defined in app.js)
        if (window.loadPilotsView) window.loadPilotsView();
    } catch (e) {
        console.error("Delete Pilot failed", e);
    }
};