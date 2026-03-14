// frontend/js/app.js

// --- DOM Elements ---
const contentArea = document.getElementById('content-area');
const pageTitle = document.getElementById('page-title');
const navItems = document.querySelectorAll('.nav-item');
const openModalBtn = document.getElementById('open-modal-btn');

// Drone Modal Elements
const droneModal = document.getElementById('drone-modal');
const droneModelInput = document.getElementById('drone-model-input');
const saveDroneBtn = document.getElementById('save-drone-btn');

// Pilot Modal Elements
const pilotModal = document.getElementById('pilot-modal');
const pilotNameInput = document.getElementById('pilot-name-input');
const pilotLicenseInput = document.getElementById('pilot-license-input');
const savePilotBtn = document.getElementById('save-pilot-btn');

// Mission Modal Elements
const missionModal = document.getElementById('mission-modal');
const missionDestInput = document.getElementById('mission-dest');
const droneSelect = document.getElementById('drone-select');
const pilotSelect = document.getElementById('pilot-select');
const saveMissionBtn = document.getElementById('save-mission-btn');

// --- Render Functions ---

/**
 * PHASE 1 & 2: Render Drone Cards
 */
function renderDroneCards(drones) {
    if (drones.length === 0) return `<div class="empty-state">No drones in fleet. Click "+ Add Drone" to begin.</div>`;

    return `<div class="card-grid">` + drones.map(drone => {
        let statusClass = drone.status === 'IDLE' ? 'success' : (drone.status === 'IN_FLIGHT' ? 'warning' : 'danger');
        return `
            <div class="drone-card">
                <div class="card-header">
                    <div>
                        <span class="secondary">ID: ${drone.id}</span>
                        <h3>${drone.model}</h3>
                    </div>
                    <div class="card-actions">
                        <button onclick="handleDeleteDrone(${drone.id})" class="action-btn delete">🗑</button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="battery-indicator">
                        <span class="battery-text" style="color: ${drone.batteryPercentage < 20 ? 'var(--accent-danger)' : 'inherit'}">
                            ${drone.batteryPercentage}% Battery
                        </span>
                    </div>
                    <select onchange="handleStatusChange(${drone.id}, this.value)" class="status-select ${drone.status.toLowerCase()}">
                        <option value="IDLE" ${drone.status === 'IDLE' ? 'selected' : ''}>IDLE</option>
                        <option value="IN_FLIGHT" ${drone.status === 'IN_FLIGHT' ? 'selected' : ''}>IN FLIGHT</option>
                        <option value="MAINTENANCE" ${drone.status === 'MAINTENANCE' ? 'selected' : ''}>MAINTENANCE</option>
                    </select>
                </div>
            </div>`;
    }).join('') + `</div>`;
}

/**
 * PHASE 4: Render Mission Cards
 */
function renderMissionCards(missions) {
    if (missions.length === 0) return `<div class="empty-state">No active missions. Dispatch one from the top bar.</div>`;

    return `<div class="card-grid">` + missions.map(m => `
        <div class="drone-card">
            <div class="card-header">
                <div>
                    <span class="secondary">MISSION #${m.id}</span>
                    <h3>To: ${m.destination}</h3>
                </div>
                <span class="badge ${m.status === 'COMPLETED' ? 'success' : 'warning'}">${m.status}</span>
            </div>
            <div class="mission-meta">
                <div class="meta-item"><span>Drone:</span> <strong>${m.assignedDrone?.model || 'Unknown'}</strong></div>
                <div class="meta-item"><span>Pilot:</span> <strong>${m.assignedPilot?.name || 'Unknown'}</strong></div>
            </div>
        </div>
    `).join('') + `</div>`;
}

// --- View Controllers ---

async function loadView(view) {
    state.currentView = view;
    navItems.forEach(nav => nav.classList.remove('active'));
    document.querySelector(`[href="#${view}"]`).classList.add('active');
    
    // Update button text and UI labels based on view
    if (view === 'drones') {
        pageTitle.textContent = 'Drone Roster';
        openModalBtn.textContent = '+ Add Drone';
        const data = await api.getDrones();
        state.drones = data;
        contentArea.innerHTML = renderDroneCards(data);
    } else if (view === 'pilots') {
        pageTitle.textContent = 'Pilot Roster';
        openModalBtn.textContent = '+ Add Pilot';
        const data = await api.getPilots();
        state.pilots = data;
        contentArea.innerHTML = renderPilotCards(data); // Defined in api.js
    } else if (view === 'missions') {
        pageTitle.textContent = 'Mission Control';
        openModalBtn.textContent = '🚀 New Mission';
        const data = await api.getMissions();
        state.missions = data;
        contentArea.innerHTML = renderMissionCards(data);
    }
}

// --- App Initialization ---

function initApp() {
    // Navigation Setup
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const view = e.target.getAttribute('href').replace('#', '');
            loadView(view);
        });
    });

    // Global Modal Opener Logic
    openModalBtn.addEventListener('click', async () => {
        if (state.currentView === 'drones') {
            droneModal.style.display = 'flex';
        } else if (state.currentView === 'pilots') {
            pilotModal.style.display = 'flex';
        } else if (state.currentView === 'missions') {
            // Populate dropdowns with available assets before showing
            const assets = await api.getAvailableAssets();
            droneSelect.innerHTML = assets.drones.map(d => `<option value="${d.id}">${d.model}</option>`).join('');
            pilotSelect.innerHTML = assets.pilots.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
            
            if (assets.drones.length === 0 || assets.pilots.length === 0) {
                showToast("Cannot dispatch: Need at least 1 IDLE drone and 1 AVAILABLE pilot.", "warning");
            } else {
                missionModal.style.display = 'flex';
            }
        }
    });

    // Universal Modal Cancel
    document.querySelectorAll('.btn-secondary').forEach(btn => {
        btn.addEventListener('click', () => {
            droneModal.style.display = 'none';
            pilotModal.style.display = 'none';
            missionModal.style.display = 'none';
        });
    });

    // Save Logic for Drones
    saveDroneBtn.addEventListener('click', async () => {
        const payload = { model: droneModelInput.value, status: 'IDLE', batteryPercentage: 100 };
        await api.createDrone(payload);
        droneModal.style.display = 'none';
        showToast("Drone added", "success");
        loadView('drones');
    });

    // Save Logic for Pilots
    savePilotBtn.addEventListener('click', async () => {
        const payload = { name: pilotNameInput.value, licenseNumber: pilotLicenseInput.value, status: 'AVAILABLE' };
        await api.createPilot(payload);
        pilotModal.style.display = 'none';
        showToast("Pilot registered", "success");
        loadView('pilots');
    });

    // Save Logic for Missions (PHASE 4)
    saveMissionBtn.addEventListener('click', async () => {
        const payload = {
            destination: missionDestInput.value,
            droneId: droneSelect.value,
            pilotId: pilotSelect.value,
            status: 'PLANNED'
        };
        await api.createMission(payload);
        missionModal.style.display = 'none';
        showToast("Mission Dispatched!", "success");
        loadView('missions');
    });

    // Start Clock
    setInterval(() => {
        document.getElementById('clock').textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }, 1000);

    loadView('drones');
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', initApp);

// --- Window Handlers ---
window.handleDeleteDrone = async (id) => {
    if (confirm("Delete this drone?")) {
        await api.deleteDrone(id);
        showToast("Drone removed", "warning");
        loadView('drones');
    }
};

window.handleStatusChange = async (id, newStatus) => {
    const drone = state.drones.find(d => d.id == id);
    await api.updateDrone(id, { ...drone, status: newStatus });
    showToast("Status Updated", "success");
    loadView('drones');
};

// Expose refresh for api.js
window.loadPilotsView = () => loadView('pilots');