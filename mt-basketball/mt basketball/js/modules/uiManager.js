/**
 * UI Manager module
 * Handles UI navigation, screen updates, and user interactions
 */

/**
 * UI Manager class
 * Manages all UI-related operations
 */
// UI Manager class
class UIManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.currentScreen = 'team-management';
        this.dependencies = {};
        this.isInitialized = false;
    }

    /**
     * Initialize the UI manager
     */
    async initialize() {
        if (this.isInitialized) return;

        this.setupNavigation();
        this.setupModals();
        this.setupEventListeners();

        // Subscribe to game state changes
        this.gameStateManager.subscribe(this.handleStateChange.bind(this));

        this.isInitialized = true;
        console.log('UI Manager initialized');
    }

    /**
     * Set up navigation between screens
     */
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        console.log(`Found ${navButtons.length} navigation buttons`);

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log(`Navigation button clicked: ${button.id}`);
                const screenId = button.id.replace('-btn', '');
                this.showScreen(screenId);

                // Update active button
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    /**
     * Set up modal windows
     */
    setupModals() {
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const openModal = document.querySelector('.modal[style*="display: block"]');
                if (openModal) {
                    openModal.style.display = 'none';
                }
            }
        });
    }

    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Window resize handler
        window.addEventListener('resize', this.handleResize.bind(this));

        // Prevent context menu on certain elements
        document.addEventListener('contextmenu', (event) => {
            if (event.target.closest('.no-context-menu')) {
                event.preventDefault();
            }
        });
    }

    /**
     * Set module dependencies
     * @param {Object} dependencies - Module dependencies
     */
    setDependencies(dependencies) {
        this.dependencies = dependencies;
    }

    /**
     * Handle game state changes
     * @param {string} key - Key that changed
     * @param {*} value - New value
     * @param {Object} state - Full game state
     */
    handleStateChange(key, value, state) {
        // Update UI based on state changes
        switch (key) {
            case 'currentDate':
                this.updateDateDisplay(value);
                break;
            case 'userTeam':
                this.updateTeamDisplay(value);
                break;
            case 'funds':
                this.updateFundsDisplay(value);
                break;
            case 'scholarships':
                this.updateScholarshipsDisplay(value);
                break;
            case 'seasonPhase':
                this.updateSeasonPhaseDisplay(value);
                break;
        }
    }

    /**
     * Show a specific screen
     * @param {string} screenId - ID of screen to show
     */
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show selected screen
        const selectedScreen = document.getElementById(screenId);
        if (selectedScreen) {
            selectedScreen.classList.add('active');
            this.currentScreen = screenId;

            // Update screen-specific content
            this.updateScreenContent(screenId);
        }
    }

    /**
     * Update content for the current screen
     * @param {string} screenId - ID of screen to update
     */
    updateScreenContent(screenId) {
        console.log(`Updating screen: ${screenId}`);
        console.log('Available dependencies:', Object.keys(this.dependencies));

        switch (screenId) {
            case 'team-management':
                if (this.dependencies.teamManager) {
                    this.dependencies.teamManager.updateTeamManagementScreen();
                } else {
                    console.error('Team Manager dependency not found');
                }
                break;
            case 'schedule':
                if (window.app && window.app.scheduleManager) {
                    window.app.renderSchedule();
                } else {
                    console.error('Schedule Manager not found');
                }
                break;
            case 'training':
                if (this.dependencies.playerDevelopment) {
                    this.dependencies.playerDevelopment.updateTrainingScreen();
                } else {
                    console.error('Player Development dependency not found');
                }
                break;
            case 'player-development':
                if (this.dependencies.playerDevelopment) {
                    this.dependencies.playerDevelopment.updatePlayerDevelopmentScreen();
                } else {
                    console.error('Player Development dependency not found');
                }
                break;
            case 'market':
                if (this.dependencies.recruitmentInterface) {
                    this.dependencies.recruitmentInterface.renderAll();
                } else {
                    console.error('Recruitment Interface dependency not found');
                }
                break;
            case 'scouting':
                if (this.dependencies.scoutingSystem) {
                    this.dependencies.scoutingSystem.updateScoutingScreen();
                } else {
                    console.error('Scouting System dependency not found');
                }
                break;
            case 'coach-market':
                if (this.dependencies.coachManager) {
                    this.dependencies.coachManager.updateCoachMarketScreen();
                } else {
                    console.error('Coach Manager dependency not found');
                }
                break;
            case 'finance':
                if (this.dependencies.financeManager) {
                    this.dependencies.financeManager.updateFinanceScreen();
                } else {
                    console.error('Finance Manager dependency not found');
                }
                break;
            case 'standings':
                if (this.dependencies.seasonManager) {
                    this.dependencies.seasonManager.updateStandingsScreen();
                } else {
                    console.error('Season Manager dependency not found');
                }
                break;
            default:
                console.warn(`Unknown screen: ${screenId}`);
        }
    }

    /**
     * Update the date display in the header
     * @param {Date} date - Current date
     */
    updateDateDisplay(date) {
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            dateElement.textContent = this.formatDate(date);
        }
    }

    /**
     * Update the team name display in the header
     * @param {Object} team - User team
     */
    updateTeamDisplay(team) {
        const teamElement = document.getElementById('team-name');
        if (teamElement && team) {
            teamElement.textContent = team.name;
        }
    }

    /**
     * Update the funds display in the header
     * @param {number} funds - Current funds
     */
    updateFundsDisplay(funds) {
        const fundsElement = document.getElementById('funds');
        if (fundsElement) {
            fundsElement.textContent = `$${funds.toLocaleString()}`;
        }
    }

    /**
     * Update the scholarships display in the header
     * @param {number} scholarships - Available scholarships
     */
    updateScholarshipsDisplay(scholarships) {
        const scholarshipsElement = document.getElementById('scholarships');
        if (scholarshipsElement) {
            const userTeam = this.gameStateManager.get('userTeam');
            const gameStateScholarships = this.gameStateManager.get('scholarships');
            
            let used, total;
            if (gameStateScholarships && typeof gameStateScholarships === 'object') {
                used = gameStateScholarships.used || 0;
                total = gameStateScholarships.total || 5;
            } else {
                // Fallback to old method if scholarships is just a number
                used = userTeam ? userTeam.roster.length : 0;
                total = gameStateScholarships || 5;
            }
            
            scholarshipsElement.textContent = `奖学金: ${used}/${total}`;
        }
    }

    /**
     * Update the season phase display
     * @param {string} seasonPhase - Current season phase
     */
    updateSeasonPhaseDisplay(seasonPhase) {
        const seasonElement = document.getElementById('season-phase');
        if (seasonElement) {
            const phaseNames = {
                'regular': '常规赛',
                'playoffs': '季后赛',
                'offseason': '休赛期'
            };
            seasonElement.textContent = phaseNames[seasonPhase] || seasonPhase;
        }
    }

    /**
     * Format a date for display
     * @param {Date} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        const months = [
            '1月', '2月', '3月', '4月', '5月', '6月',
            '7月', '8月', '9月', '10月', '11月', '12月'
        ];

        return `${date.getFullYear()}年${months[date.getMonth()]}${date.getDate()}日`;
    }

    /**
     * Show a modal dialog
     * @param {string} modalId - ID of modal to show
     * @param {Object} data - Data to populate modal with
     */
    showModal(modalId, data = {}) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Populate modal with data if provided
        this.populateModal(modal, data);

        // Show modal
        modal.style.display = 'block';

        // Add animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    /**
     * Hide a modal dialog
     * @param {string} modalId - ID of modal to hide
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Remove animation
        modal.classList.remove('show');

        // Hide modal after animation
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    /**
     * Populate a modal with data
     * @param {HTMLElement} modal - Modal element
     * @param {Object} data - Data to populate modal with
     */
    populateModal(modal, data) {
        // This is a generic method that can be overridden by specific modals
        // For now, just set the title if provided
        if (data.title) {
            const titleElement = modal.querySelector('h2, h3, h4');
            if (titleElement) {
                titleElement.textContent = data.title;
            }
        }
    }

    /**
     * Show a notification message
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Hide and remove after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, duration);
    }

    /**
     * Show a confirmation dialog
     * @param {string} message - Message to display
     * @param {Function} onConfirm - Callback when confirmed
     * @param {Function} onCancel - Callback when cancelled
     */
    showConfirmation(message, onConfirm, onCancel) {
        // Create confirmation dialog
        const confirmation = document.createElement('div');
        confirmation.className = 'confirmation-dialog';
        confirmation.innerHTML = `
            <div class="confirmation-content">
                <p>${message}</p>
                <div class="confirmation-buttons">
                    <button class="confirm-btn">确认</button>
                    <button class="cancel-btn">取消</button>
                </div>
            </div>
        `;

        // Add to page
        document.body.appendChild(confirmation);

        // Show dialog
        setTimeout(() => {
            confirmation.classList.add('show');
        }, 10);

        // Set up button handlers
        const confirmBtn = confirmation.querySelector('.confirm-btn');
        const cancelBtn = confirmation.querySelector('.cancel-btn');

        confirmBtn.addEventListener('click', () => {
            this.hideConfirmation(confirmation);
            if (onConfirm) onConfirm();
        });

        cancelBtn.addEventListener('click', () => {
            this.hideConfirmation(confirmation);
            if (onCancel) onCancel();
        });
    }

    /**
     * Hide a confirmation dialog
     * @param {HTMLElement} confirmation - Confirmation dialog element
     */
    hideConfirmation(confirmation) {
        confirmation.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(confirmation);
        }, 300);
    }

    /**
     * Handle window resize events
     */
    handleResize() {
        // Adjust UI elements based on window size
        const width = window.innerWidth;

        if (width < 768) {
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }

    /**
     * Create a loading indicator
     * @param {string} message - Loading message
     * @returns {HTMLElement} Loading indicator element
     */
    createLoadingIndicator(message = '加载中...') {
        const loading = document.createElement('div');
        loading.className = 'loading-indicator';
        loading.innerHTML = `
            <div class="loading-spinner"></div>
            <p>${message}</p>
        `;

        document.body.appendChild(loading);

        // Show loading indicator
        setTimeout(() => {
            loading.classList.add('show');
        }, 10);

        return loading;
    }

    /**
     * Remove a loading indicator
     * @param {HTMLElement} loading - Loading indicator element
     */
    removeLoadingIndicator(loading) {
        loading.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(loading);
        }, 300);
    }

    /**
     * Update the game info header
     */
    updateGameInfoHeader() {
        const state = this.gameStateManager.getState();

        this.updateDateDisplay(state.currentDate);
        this.updateTeamDisplay(state.userTeam);
        this.updateFundsDisplay(state.funds);
        this.updateScholarshipsDisplay(state.scholarships);
        this.updateSeasonPhaseDisplay(state.seasonPhase);
    }

    /**
     * Get the current screen ID
     * @returns {string} Current screen ID
     */
    getCurrentScreen() {
        return this.currentScreen;
    }
}