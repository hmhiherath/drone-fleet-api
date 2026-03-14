// frontend/js/app.js

// --- DOM Elements ---
const contentArea = document.getElementById('content-area');
const pageTitle = document.getElementById('page-title');
const navItems = document.querySelectorAll('.nav-item');

// --- Render Functions ---

/**
 * Generates the HTML string for the Drone Fleet grid
 */
function renderDroneCards(drones) {
    if (drones.length === 0) {
        return `<div style="text-align: center; color: var(--text-secondary); margin-top: 40px;">No drones currently in the fleet.</div>`;
    }

    const cardsHtml = drones.map(drone => {
        // Determine status colors based on backend data
        let statusClass = 'success'; // Default for IDLE
        if (drone.status === 'IN_FLIGHT') statusClass = 'warning';
        if (drone.status === 'MAINTENANCE') statusClass = 'danger';

        // Check for low battery
        const isLowBattery = drone.batteryPercentage < 20;
        const batteryColor = isLowBattery ? 'var(--accent-danger)' : 'inherit';

        return `
            <div class="drone-card" style="animation: fadeInUp 0.4s ease forwards;">
                <div class="card-header">
                    <div>
                        <span class="secondary">ID: ${drone.id}</span>
                        <h3>${drone.model}</h3>
                    </div>
                    <div class="status-dot ${statusClass}"></div>
                </div>
                <div class="card-body">
                    <div class="battery-indicator">
                        <span class="battery-text" style="color: ${batteryColor}">${drone.batteryPercentage}% Battery</span>
                    </div>
                    <span class="badge ${statusClass}">${drone.status || 'IDLE'}</span>
                </div>
            </div>
        `;
    }).join(''); // Join the array into a single HTML string

    return `<div class="card-grid">${cardsHtml}</div>`;
}

// --- View Controllers ---

/**
 * Fetches drones from the backend and updates the UI
 */
async function loadDronesView() {
    pageTitle.textContent = 'Drone Roster';
    contentArea.innerHTML = `<div style="color: var(--text-secondary);">Loading fleet data...</div>`;
    
    try {
        // Call the Spring Boot API
        const drones = await api.getDrones();
        state.drones = drones; // Update local state
        
        // Inject the generated HTML into the DOM
        contentArea.innerHTML = renderDroneCards(state.drones);
    } catch (error) {
        contentArea.innerHTML = `<div style="color: var(--accent-danger);">Failed to load fleet data.</div>`;
    }
}

// --- App Initialization ---

/**
 * Sets up navigation clicks and loads the initial view
 */
function initApp() {
    // Set up Sidebar Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            e.target.classList.add('active');
            
            // Basic Routing
            const view = e.target.getAttribute('href').replace('#', '');
            if (view === 'drones') {
                loadDronesView();
            } else {
                pageTitle.textContent = e.target.textContent;
                contentArea.innerHTML = `<div style="color: var(--text-secondary); margin-top: 40px; text-align: center;">${e.target.textContent} view is under construction.</div>`;
            }
        });
    });

    // Start the clock
    setInterval(() => {
        const now = new Date();
        document.getElementById('clock').textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }, 1000);

    // Load initial data
    loadDronesView();
}

// Boot the application when the DOM is ready
document.addEventListener('DOMContentLoaded', initApp);