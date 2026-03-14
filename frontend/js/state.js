// frontend/js/state.js

/**
 * Centralized State Management
 * Holds the local copy of our database records so we don't 
 * have to fetch from the server every time we change a view.
 */
const state = {
    drones: [],
    pilots: [],
    missions: [],
    currentView: 'drones' // Tracks which page the user is looking at
};