// frontend/js/api.js

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Toast Notification System
 * Displays glassmorphic alerts for API errors or success messages.
 */
function showToast(message, type = 'danger') {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast`;
    // Add a border color based on the type (danger, success, etc.)
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

    // --- Drone Endpoints ---
    async getDrones() {
        return this.request('/drones');
    },
    
    // We will add POST, PUT, DELETE methods here later as needed!
};