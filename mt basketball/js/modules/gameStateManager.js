/**
 * Game State Manager module
 * Manages the central state of the game and handles data persistence
 */

// import { GameConstants } from '../data/gameData.js';

/**
 * Game State Manager class
 * Handles all game state operations
 */
// Game State Manager class
class GameStateManager {
    constructor() {
        this.state = this.initializeState();
        this.subscribers = [];
        this.isInitialized = false;
    }

    /**
     * Initialize the game state with default values
     * @returns {Object} Initial game state
     */
    initializeState() {
        // Default to June 15, 2024 (start of offseason)
        const defaultDate = new Date(2024, 5, 15); // Month is 0-indexed (5 = June)
        
        return {
            // Game time and season
            currentDate: defaultDate,
            currentSeason: 2024,
            seasonPhase: 'offseason', // regular, playoffs, offseason

            // User team
            userTeam: null,
            userCoach: null,

            // Teams and players
            allTeams: [],
            availablePlayers: [],
            allCoaches: [],
            availableCoaches: [],

            // Game schedule
            gameSchedule: [],
            nextGameIndex: 0,

            // Scouting system
            scoutingReports: [],
            scoutingBudget: GameConstants.SCOUTING_BUDGET,
            scoutingUsed: 0,
            teamAnalysisData: {},

            // Financial
            funds: GameConstants.INITIAL_FUNDS,
            scholarships: {
                total: GameConstants.MAX_SCHOLARSHIPS,
                used: 0
            },

            // Coach hiring restrictions
            coachHiringCount: 0,
            maxCoachHiresPerSeason: 2,
            lastCoachHireDate: null,

            // Counters for generating unique IDs
            playerIdCounter: 1000,
            teamIdCounter: 20,
            coachIdCounter: 1,

            // Game settings
            gameSpeed: 1,
            autoSimulate: false,
            difficulty: 'normal'
        };
    }

    /**
     * Initialize the game state manager
     */
    async initialize() {
        if (this.isInitialized) return;

        // Try to load saved game state
        const savedState = await this.loadGameState();
        if (savedState) {
            this.state = { ...this.state, ...savedState };
            console.log('Game state loaded from save');
        } else {
            console.log('Starting new game');
        }

        this.isInitialized = true;
    }

    /**
     * Get the current game state
     * @returns {Object} Current game state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Get a specific value from the game state
     * @param {string} key - Key to retrieve
     * @returns {*} Value from state
     */
    get(key) {
        return this.state[key];
    }

    /**
     * Set a specific value in the game state
     * @param {string} key - Key to set
     * @param {*} value - Value to set
     */
    set(key, value) {
        this.state[key] = value;
        this.notifySubscribers(key, value);
    }

    /**
     * Update multiple values in the game state
     * @param {Object} updates - Object with key-value pairs to update
     */
    update(updates) {
        for (const [key, value] of Object.entries(updates)) {
            this.state[key] = value;
            this.notifySubscribers(key, value);
        }
    }

    /**
     * Subscribe to state changes
     * @param {Function} callback - Callback function to call when state changes
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.subscribers.push(callback);

        // Return unsubscribe function
        return () => {
            const index = this.subscribers.indexOf(callback);
            if (index > -1) {
                this.subscribers.splice(index, 1);
            }
        };
    }

    /**
     * Notify all subscribers of a state change
     * @param {string} key - Key that changed
     * @param {*} value - New value
     */
    notifySubscribers(key, value) {
        this.subscribers.forEach(callback => {
            try {
                callback(key, value, this.state);
            } catch (error) {
                console.error('Error in state subscriber:', error);
            }
        });
    }

    /**
     * Save the current game state
     */
    saveGameState() {
        try {
            const saveData = this.createOptimizedSave();
            const serialized = JSON.stringify(saveData);
            const dataSize = new Blob([serialized]).size;
            
            console.log(`Saving game state (${dataSize} bytes)...`);
            
            if (typeof saveGameToAccount === 'function') {
                saveGameToAccount(saveData);
                console.log('Game state saved to account successfully');
            } else {
                localStorage.setItem('basketballManagerSave', serialized);
                console.log('Game state saved to localStorage successfully');
            }
        } catch (error) {
            console.error('Failed to save game state:', error);
            this.handleStorageError(error);
        }
    }

    /**
     * Create ultra-optimized save data - minimal size
     */
    createOptimizedSave() {
        const stateCopy = JSON.parse(JSON.stringify(this.state));
        
        // Ultra-optimize players - only essential data
        if (stateCopy.availablePlayers) {
            stateCopy.availablePlayers = stateCopy.availablePlayers.map(p => ({
                id: p.id,
                name: p.name,
                position: p.position,
                year: p.year,
                age: p.age,
                potential: p.potential,
                rating: p.rating,
                status: p.status,
                formerTeam: p.formerTeam
                // Removed: attributes, contract, background (too large)
            }));
        }

        // Ultra-optimize teams
        if (stateCopy.allTeams) {
            stateCopy.allTeams = stateCopy.allTeams.map(team => ({
                id: team.id,
                name: team.name,
                roster: team.roster || [],
                wins: team.wins || 0,
                losses: team.losses || 0
                // Removed: conference, methods, cache
            }));
        }

        // Clear large accumulated data
        stateCopy.scoutingReports = [];
        stateCopy.teamAnalysisData = {};
        stateCopy.gameLog = null;
        stateCopy._debugData = null;
        
        // Only keep recent schedule
        if (stateCopy.gameSchedule && stateCopy.gameSchedule.length > 20) {
            stateCopy.gameSchedule = stateCopy.gameSchedule.slice(0, 20);
        }
        
        // Clear negotiations to save space (will be lost on save)
        stateCopy.negotiations = [];

        return {
            state: stateCopy,
            savedAt: new Date().toISOString(),
            version: '3.0_ultra'
        };
    }

    /**
     * Clean up old/duplicate saves - no recursive save
     */
    cleanupStorage() {
        const keys = ['basketballManagerSave', 'basketballManagerSave_backup'];
        let removedAny = false;
        
        for (const key of keys) {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed.timestamp) {
                        const saveAge = Date.now() - new Date(parsed.timestamp).getTime();
                        if (saveAge > 30 * 24 * 60 * 60 * 1000) {
                            localStorage.removeItem(key);
                            removedAny = true;
                            console.log(`Removed old save: ${key}`);
                        }
                    }
                }
            } catch (e) {
                localStorage.removeItem(key);
                removedAny = true;
            }
        }
        
        return removedAny;
    }

    /**
     * Handle storage quota errors - clear ALL storage and reload page
     */
    handleStorageError(error) {
        if (error.name === 'QuotaExceededError') {
            console.error('存储空间已满，正在清空...');
            
            try {
                // Immediately clear ALL localStorage
                localStorage.clear();
                console.log('所有存储已清空');
            } catch (clearError) {
                console.error('清空存储失败:', clearError);
            }
            
            // Force page reload after a short delay
            setTimeout(() => {
                location.reload();
            }, 100);
        }
    }

    /**
     * Emergency clear all storage
     */
    emergencyClear() {
        const keys = Object.keys(localStorage);
        let cleared = 0;
        keys.forEach(key => {
            if (key.startsWith('basketball') || key.startsWith('player') || key.includes('Save') || key.includes('save')) {
                localStorage.removeItem(key);
                cleared++;
            }
        });
        console.log(`Emergency storage clear completed (${cleared} items removed)`);
    }

    /**
     * Load a saved game state
     * @returns {Object|null} Loaded state or null if no save exists
     */
    async loadGameState() {
        try {
            let saveData = null;
            
            if (typeof loadGameFromAccount === 'function') {
                saveData = loadGameFromAccount();
                if (saveData) {
                    console.log('Game state loaded from account');
                }
            }
            
            if (!saveData) {
                saveData = localStorage.getItem('basketballManagerSave');
                if (saveData) {
                    console.log('Game state loaded from localStorage');
                }
            }
            
            if (!saveData) return null;

            const parsed = JSON.parse(saveData);

            // Handle minimal saves - merge with defaults
            if (parsed.version === '1.0_minimal') {
                console.log('Loading minimal save, using defaults for missing data');
                const minimalState = parsed.state;
                const fullState = {
                    ...this.initializeState(),
                    ...minimalState,
                    // Ensure required arrays exist
                    allTeams: minimalState.allTeams || [],
                    allCoaches: minimalState.allCoaches || [],
                    availableCoaches: minimalState.availableCoaches || [],
                    gameSchedule: [],
                    nextGameIndex: 0,
                    scoutingReports: [],
                    scoutingBudget: GameConstants.SCOUTING_BUDGET,
                    scoutingUsed: 0,
                    teamAnalysisData: {}
                };
                parsed.state = fullState;
            }

            // Convert date strings back to Date objects
            if (parsed.state.currentDate) {
                const parsedDate = new Date(parsed.state.currentDate);
                // Validate that the date is valid and reasonable (between 2020 and 2030)
                if (parsedDate instanceof Date && !isNaN(parsedDate) && 
                    parsedDate.getFullYear() >= 2020 && parsedDate.getFullYear() <= 2030) {
                    parsed.state.currentDate = parsedDate;
                } else {
                    console.warn('Invalid date in save, using default');
                    parsed.state.currentDate = new Date(2024, 5, 15); // June 15, 2024
                }
            } else {
                parsed.state.currentDate = new Date(2024, 5, 15); // June 15, 2024
            }

            // Reconstruct Player, Team, and Coach objects to restore their methods
            await this.reconstructGameObjects(parsed.state);

            console.log(`Game state loaded from ${parsed.timestamp} (v${parsed.version || '1.0'})`);
            return parsed.state;
        } catch (error) {
            console.error('Failed to load game state:', error);
            return null;
        }
    }

    /**
     * Reconstruct game objects to restore their prototype methods
     * @param {Object} state - Game state to reconstruct
     */
    async reconstructGameObjects(state) {
        try {
            // Import data models dynamically to avoid circular dependencies
            // const { Player, Team, Coach } = await import('./dataModels.js');
            // No need to import in non-module version, classes are global

            // Reconstruct players
            if (state.availablePlayers && Array.isArray(state.availablePlayers)) {
                state.availablePlayers = state.availablePlayers.map(playerData => new Player(playerData));
            }

            if (state.allTeams && Array.isArray(state.allTeams)) {
                state.allTeams = state.allTeams.map(teamData => {
                    const team = new Team(teamData);
                    // Reconstruct team roster
                    if (teamData.roster && Array.isArray(teamData.roster)) {
                        team.roster = teamData.roster.map(playerData => new Player(playerData));
                    }
                    return team;
                });
            }

            // Reconstruct user team
            if (state.userTeam) {
                const userTeam = new Team(state.userTeam);
                if (state.userTeam.roster && Array.isArray(state.userTeam.roster)) {
                    userTeam.roster = state.userTeam.roster.map(playerData => new Player(playerData));
                }
                state.userTeam = userTeam;
            }

            // Reconstruct coaches
            if (state.allCoaches && Array.isArray(state.allCoaches)) {
                state.allCoaches = state.allCoaches.map(coachData => new Coach(coachData));
            }

            if (state.availableCoaches && Array.isArray(state.availableCoaches)) {
                state.availableCoaches = state.availableCoaches.map(coachData => new Coach(coachData));
            }

            if (state.userCoach) {
                state.userCoach = new Coach(state.userCoach);
            }
        } catch (error) {
            console.error('Failed to reconstruct game objects:', error);
        }
    }

    /**
     * Delete the saved game state
     */
    deleteSave() {
        try {
            localStorage.removeItem('basketballManagerSave');
            console.log('Save game deleted');
        } catch (error) {
            console.error('Failed to delete save game:', error);
        }
    }

    /**
     * Check if a save game exists
     * @returns {boolean} Whether a save game exists
     */
    hasSaveGame() {
        return localStorage.getItem('basketballManagerSave') !== null;
    }

    /**
     * Clear the saved game state
     */
    clearSave() {
        localStorage.removeItem('basketballManagerSave');
        console.log('Save game cleared');
    }

    /**
     * Reset the game state to defaults
     */
    reset() {
        this.state = this.initializeState();
        this.notifySubscribers('reset', this.state);
    }

    /**
     * Advance the game date
     * @param {number} days - Number of days to advance
     */
    advanceDate(days = 1) {
        const newDate = new Date(this.state.currentDate);
        newDate.setDate(newDate.getDate() + days);
        this.set('currentDate', newDate);
    }

    /**
     * Get a unique player ID
     * @returns {number} Unique player ID
     */
    getPlayerId() {
        return this.state.playerIdCounter++;
    }

    /**
     * Get a unique team ID
     * @returns {number} Unique team ID
     */
    getTeamId() {
        return this.state.teamIdCounter++;
    }

    /**
     * Get a unique coach ID
     * @returns {number} Unique coach ID
     */
    getCoachId() {
        return this.state.coachIdCounter++;
    }

    /**
     * Add funds to the user team
     * @param {number} amount - Amount to add
     */
    addFunds(amount) {
        this.set('funds', this.state.funds + amount);
    }

    /**
     * Subtract funds from the user team
     * @param {number} amount - Amount to subtract
     * @returns {boolean} Whether the transaction was successful
     */
    subtractFunds(amount) {
        if (this.state.funds < amount) return false;

        this.set('funds', this.state.funds - amount);
        return true;
    }

    /**
     * Add a team to the game state
     * @param {Object} team - Team to add
     */
    addTeam(team) {
        this.state.allTeams.push(team);
    }

    /**
     * Remove a team from the game state
     * @param {number} teamId - ID of team to remove
     */
    removeTeam(teamId) {
        const index = this.state.allTeams.findIndex(t => t.id === teamId);
        if (index > -1) {
            this.state.allTeams.splice(index, 1);
        }
    }

    /**
     * Get a team by ID
     * @param {number} teamId - ID of team to get
     * @returns {Object|null} Team object or null if not found
     */
    getTeam(teamId) {
        return this.state.allTeams.find(t => t.id === teamId) || null;
    }

    /**
     * Add a player to the game state
     * @param {Object} player - Player to add
     */
    addPlayer(player) {
        this.state.availablePlayers.push(player);
    }

    /**
     * Remove a player from the game state
     * @param {number} playerId - ID of player to remove
     */
    removePlayer(playerId) {
        const index = this.state.availablePlayers.findIndex(p => p.id === playerId);
        if (index > -1) {
            this.state.availablePlayers.splice(index, 1);
        }
    }

    /**
     * Get a player by ID
     * @param {number} playerId - ID of player to get
     * @returns {Object|null} Player object or null if not found
     */
    getPlayer(playerId) {
        return this.state.availablePlayers.find(p => p.id === playerId) || null;
    }

    /**
     * Add a coach to the game state
     * @param {Object} coach - Coach to add
     */
    addCoach(coach) {
        this.state.allCoaches.push(coach);
    }

    /**
     * Remove a coach from the game state
     * @param {number} coachId - ID of coach to remove
     */
    removeCoach(coachId) {
        const index = this.state.allCoaches.findIndex(c => c.id === coachId);
        if (index > -1) {
            this.state.allCoaches.splice(index, 1);
        }
    }

    /**
     * Get a coach by ID
     * @param {number} coachId - ID of coach to get
     * @returns {Object|null} Coach object or null if not found
     */
    getCoach(coachId) {
        return this.state.allCoaches.find(c => c.id === coachId) || null;
    }

    /**
     * Add a scouting report
     * @param {Object} report - Scouting report to add
     */
    addScoutingReport(report) {
        this.state.scoutingReports.push(report);
    }

    /**
     * Remove a scouting report
     * @param {number} reportId - ID of report to remove
     */
    removeScoutingReport(reportId) {
        const index = this.state.scoutingReports.findIndex(r => r.id === reportId);
        if (index > -1) {
            this.state.scoutingReports.splice(index, 1);
        }
    }

    /**
     * Use scouting budget
     * @param {number} amount - Amount to use
     * @returns {boolean} Whether the transaction was successful
     */
    useScoutingBudget(amount) {
        if (this.state.scoutingUsed + amount > this.state.scoutingBudget) return false;

        this.set('scoutingUsed', this.state.scoutingUsed + amount);
        return true;
    }

    /**
     * Reset scouting budget for new season
     */
    resetScoutingBudget() {
        this.set('scoutingUsed', 0);
    }

    /**
     * Get game statistics
     * @returns {Object} Game statistics
     */
    getGameStats() {
        return {
            currentSeason: this.state.currentSeason,
            seasonPhase: this.state.seasonPhase,
            currentDate: this.state.currentDate,
            userTeam: this.state.userTeam ? this.state.userTeam.name : 'None',
            funds: this.state.funds,
            scholarships: this.state.scholarships,
            totalTeams: this.state.allTeams.length,
            totalPlayers: this.state.availablePlayers.length,
            totalCoaches: this.state.allCoaches.length,
            scoutingReports: this.state.scoutingReports.length
        };
    }
}