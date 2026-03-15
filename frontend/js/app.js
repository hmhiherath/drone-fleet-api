// frontend/js/app.js

/**
 * --- Architectural Improvement: Module Encapsulation ---
 * Wrapping the app logic prevents variables from leaking into the global window object.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- State Management ---
    const state = {
        currentView: 'drones',
        drones: [],
        pilots: [],
        missions: []
    };

    // --- DOM Elements ---
    const contentArea = document.getElementById('content-area');
    const pageTitle = document.getElementById('page-title');
    const navItems = document.querySelectorAll('.nav-item');
    const openModalBtn = document.getElementById('open-modal-btn');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn'); // Added for mobile
    const sidebar = document.querySelector('.sidebar');

    // Modals (Overlays)
    const droneModal = document.getElementById('drone-modal');
    const pilotModal = document.getElementById('pilot-modal');
    const missionModal = document.getElementById('mission-modal');

    // Forms & Inputs
    const droneModelInput = document.getElementById('drone-model-input');
    const pilotNameInput = document.getElementById('pilot-name-input');
    const pilotLicenseInput = document.getElementById('pilot-license-input');
    const missionDestInput = document.getElementById('mission-dest');
    const droneSelect = document.getElementById('drone-select');
    const pilotSelect = document.getElementById('pilot-select');

    // --- UI Utility Functions ---

    /**
     * Toast Notification System (Moved from api.js)
     */
    function showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Auto-remove after animation completes
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function openModal(modalElement) {
        modalElement.classList.add('active'); // Uses CSS opacity/transform transitions
    }

    function closeModal(modalElement) {
        modalElement.classList.remove('active');
        // Reset inputs within the modal
        modalElement.querySelectorAll('input').forEach(input => input.value = '');
    }

    // --- Render Functions (Pure HTML String Generators) ---
    // Notice: NO inline onclick="" or onchange="". We use data-* attributes.

    function renderDroneCards(drones) {
        if (!drones || drones.length === 0) {
            return `<div class="empty-state"><i>🚁</i><br>No drones in fleet. Click "+ Add Drone" to begin.</div>`;
        }

        return `<div class="card-grid">` + drones.map(drone => {
            const batteryColor = drone.batteryPercentage < 20 ? 'var(--accent-danger)' : 'inherit';
            return `
                <div class="drone-card">
                    <div class="card-header">
                        <div>
                            <span class="secondary" style="font-size: 12px; font-weight: 600;">ID: ${drone.id}</span>
                            <h3>${drone.model}</h3>
                        </div>
                        <div class="card-actions">
                            <button data-action="delete-drone" data-id="${drone.id}" class="action-btn delete" title="Delete Drone">🗑</button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="battery-indicator" style="margin-bottom: 8px; font-weight: 500; font-size: 14px;">
                            <span style="color: ${batteryColor}">⚡ ${drone.batteryPercentage}% Battery</span>
                        </div>
                        <select data-action="update-drone-status" data-id="${drone.id}" class="status-select">
                            <option value="IDLE" ${drone.status === 'IDLE' ? 'selected' : ''}>🟢 IDLE</option>
                            <option value="IN_FLIGHT" ${drone.status === 'IN_FLIGHT' ? 'selected' : ''}>🟠 IN FLIGHT</option>
                            <option value="MAINTENANCE" ${drone.status === 'MAINTENANCE' ? 'selected' : ''}>🔴 MAINTENANCE</option>
                        </select>
                    </div>
                </div>`;
        }).join('') + `</div>`;
    }

    function renderPilotCards(pilots) {
        if (!pilots || pilots.length === 0) {
            return `<div class="empty-state"><i>🧑‍✈️</i><br>No pilots registered in the roster.</div>`;
        }

        return `<div class="card-grid">` + pilots.map(pilot => `
            <div class="drone-card">
                <div class="card-header">
                    <div>
                        <span class="secondary" style="font-size: 12px; font-weight: 600;">ID: ${pilot.id}</span>
                        <h3>${pilot.name}</h3>
                    </div>
                    <button data-action="delete-pilot" data-id="${pilot.id}" class="action-btn delete" title="Remove Pilot">🗑</button>
                </div>
                <div class="card-body">
                    <p class="secondary" style="font-size: 14px; margin-bottom: 12px;">License: ${pilot.licenseNumber}</p>
                    <span class="badge ${pilot.status === 'ON_MISSION' ? 'warning' : 'success'}">
                        ${pilot.status || 'AVAILABLE'}
                    </span>
                </div>
            </div>
        `).join('') + `</div>`;
    }

    function renderMissionCards(missions) {
        if (!missions || missions.length === 0) {
            return `<div class="empty-state"><i>🗺️</i><br>No active missions. Dispatch one from the top bar.</div>`;
        }

        return `<div class="card-grid">` + missions.map(m => {
            const badgeClass = m.missionStatus === 'COMPLETED' ? 'success' : (m.missionStatus === 'SCHEDULED' ? 'warning' : 'danger');
            return `
            <div class="drone-card">
                <div class="card-header">
                    <div>
                        <span class="secondary" style="font-size: 12px; font-weight: 600;">MISSION #${m.id}</span>
                        <h3 style="margin-top: 4px;">To: ${m.destinationCoordinates}</h3>
                    </div>
                    <span class="badge ${badgeClass}">${m.missionStatus}</span>
                </div>
                <div class="mission-meta">
                    <div class="meta-item"><span class="secondary">Drone:</span> <strong>${m.drone?.model || 'Unknown'}</strong></div>
                    <div class="meta-item"><span class="secondary">Pilot:</span> <strong>${m.pilot?.name || 'Unknown'}</strong></div>
                </div>
            </div>
        `}).join('') + `</div>`;
    }

    // --- View Controller ---

    async function loadView(view) {
        state.currentView = view;
        
        // Update Sidebar Active State
        navItems.forEach(nav => nav.classList.remove('active'));
        const activeNav = document.querySelector(`[href="#${view}"]`);
        if (activeNav) activeNav.classList.add('active');
        
        // Close mobile sidebar if open
        sidebar.classList.remove('open');
        
        contentArea.innerHTML = `<div class="empty-state">Loading...</div>`; // Simple loading state

        try {
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
                contentArea.innerHTML = renderPilotCards(data);
            } else if (view === 'missions') {
                pageTitle.textContent = 'Mission Control';
                openModalBtn.textContent = '🚀 New Mission';
                const data = await api.getMissions();
                state.missions = data;
                contentArea.innerHTML = renderMissionCards(data);
            }
        } catch (error) {
            contentArea.innerHTML = `<div class="empty-state" style="color: var(--accent-danger);">Failed to load data.</div>`;
            showToast(error.message, 'error');
        }
    }

    // --- Architectural Improvement: Event Delegation ---
    // Instead of attaching listeners to hundreds of dynamically generated buttons, 
    // we attach ONE listener to the parent container.
    contentArea.addEventListener('click', async (e) => {
        const target = e.target;
        
        // Handle Delete Drone
        const deleteDroneBtn = target.closest('[data-action="delete-drone"]');
        if (deleteDroneBtn) {
            const id = deleteDroneBtn.dataset.id;
            if (confirm("Permanently delete this drone?")) {
                try {
                    await api.deleteDrone(id);
                    showToast("Drone removed successfully", "success");
                    loadView('drones');
                } catch (err) {
                    showToast(err.message, "error");
                }
            }
        }

        // Handle Delete Pilot
        const deletePilotBtn = target.closest('[data-action="delete-pilot"]');
        if (deletePilotBtn) {
            const id = deletePilotBtn.dataset.id;
            if (confirm("Remove this pilot from the roster?")) {
                try {
                    await api.deletePilot(id);
                    showToast("Pilot removed successfully", "success");
                    loadView('pilots');
                } catch (err) {
                    showToast(err.message, "error");
                }
            }
        }
    });

    // Handle Status Changes (Delegated 'change' event)
    contentArea.addEventListener('change', async (e) => {
        if (e.target.dataset.action === 'update-drone-status') {
            const id = e.target.dataset.id;
            const newStatus = e.target.value;
            const droneToUpdate = state.drones.find(d => d.id == id);
            
            try {
                await api.updateDrone(id, { ...droneToUpdate, status: newStatus });
                showToast("Drone status updated", "success");
                loadView('drones'); // Refresh to update battery/colors
            } catch (err) {
                showToast(err.message, "error");
                e.target.value = droneToUpdate.status; // Revert UI on failure
            }
        }
    });

    // --- Modal Initialization & Form Submissions ---
    function initModals() {
        // Universal Cancel Buttons
        document.querySelectorAll('.btn-secondary[data-close]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.dataset.close;
                closeModal(document.getElementById(modalId));
            });
        });

        // Close on clicking overlay background
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal(overlay);
            });
        });

        // Open Modal Button Router
        openModalBtn.addEventListener('click', async () => {
            if (state.currentView === 'drones') openModal(droneModal);
            else if (state.currentView === 'pilots') openModal(pilotModal);
            else if (state.currentView === 'missions') {
                try {
                    const assets = await api.getAvailableAssets();
                    droneSelect.innerHTML = assets.drones.map(d => `<option value="${d.id}">${d.model}</option>`).join('');
                    pilotSelect.innerHTML = assets.pilots.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
                    
                    if (assets.drones.length === 0 || assets.pilots.length === 0) {
                        showToast("Cannot dispatch: Need at least 1 IDLE drone and 1 AVAILABLE pilot.", "warning");
                    } else {
                        openModal(missionModal);
                    }
                } catch (err) {
                    showToast("Failed to load available assets", "error");
                }
            }
        });

        // Save Drone
        document.getElementById('save-drone-btn').addEventListener('click', async () => {
            if (!droneModelInput.value.trim()) return showToast("Model name required", "warning");
            try {
                await api.createDrone({ model: droneModelInput.value, status: 'IDLE', batteryPercentage: 100 });
                closeModal(droneModal);
                showToast("Drone added to fleet", "success");
                loadView('drones');
            } catch (err) { showToast(err.message, "error"); }
        });

        // Save Pilot
        document.getElementById('save-pilot-btn').addEventListener('click', async () => {
            if (!pilotNameInput.value.trim() || !pilotLicenseInput.value.trim()) return showToast("All fields required", "warning");
            try {
                await api.createPilot({ name: pilotNameInput.value, licenseNumber: pilotLicenseInput.value, status: 'AVAILABLE' });
                closeModal(pilotModal);
                showToast("Pilot registered", "success");
                loadView('pilots');
            } catch (err) { showToast(err.message, "error"); }
        });

        // Save Mission
        document.getElementById('save-mission-btn').addEventListener('click', async () => {
            if (!missionDestInput.value.trim()) return showToast("Destination required", "warning");
            try {
                // Adjusting payload to match typical Spring Boot DTO patterns
                await api.createMission({
                    destinationCoordinates: missionDestInput.value,
                    droneId: droneSelect.value,
                    pilotId: pilotSelect.value
                });
                closeModal(missionModal);
                showToast("Mission Dispatched!", "success");
                loadView('missions');
            } catch (err) { showToast(err.message, "error"); }
        });
    }

    // --- App Bootstrapping ---
    function initApp() {
        // Sidebar Navigation
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.currentTarget.getAttribute('href').replace('#', '');
                loadView(view);
            });
        });

        // Mobile Menu Toggle
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        initModals();

        // Start Clock
        setInterval(() => {
            const clockEl = document.getElementById('clock');
            if (clockEl) clockEl.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }, 1000);

        // Initial Load
        loadView('drones');
    }

    initApp();
});