/**
 * Event System module
 * Handles game events and notifications
 */

class EventSystem {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.isInitialized = false;
        this.subscribers = {};
        this.eventHistory = [];
    }

    async initialize() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log('Event System initialized');
    }

    /**
     * Subscribe to an event type
     * @param {string} eventType - Type of event to subscribe to
     * @param {Function} callback - Callback function to call when event is published
     * @returns {Function} Unsubscribe function
     */
    subscribe(eventType, callback) {
        if (!this.subscribers[eventType]) {
            this.subscribers[eventType] = [];
        }

        this.subscribers[eventType].push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers[eventType];
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    /**
     * Publish an event
     * @param {string} eventType - Type of event to publish
     * @param {*} data - Event data
     */
    publish(eventType, data) {
        // Add to event history
        this.eventHistory.push({
            type: eventType,
            data: data,
            timestamp: new Date()
        });

        // Keep only last 100 events
        if (this.eventHistory.length > 100) {
            this.eventHistory.shift();
        }

        // Notify subscribers
        const callbacks = this.subscribers[eventType];
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event subscriber for ${eventType}:`, error);
                }
            });
        }
    }

    /**
     * Get event history
     * @param {string} eventType - Optional event type to filter by
     * @returns {Array} Array of events
     */
    getEventHistory(eventType = null) {
        if (eventType) {
            return this.eventHistory.filter(event => event.type === eventType);
        }
        return [...this.eventHistory];
    }

    /**
     * Clear event history
     */
    clearEventHistory() {
        this.eventHistory = [];
    }

    /**
     * Show a notification for an event
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
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    /**
     * Create a game event
     * @param {string} text - Event text
     * @param {string} type - Event type
     * @param {Object} data - Additional event data
     */
    createGameEvent(text, type = 'info', data = {}) {
        const event = {
            text: text,
            type: type,
            data: data,
            timestamp: new Date()
        };

        // Publish game event
        this.publish('gameEvent', event);

        return event;
    }

    /**
     * Create a season event
     * @param {string} text - Event text
     * @param {string} type - Event type
     * @param {Object} data - Additional event data
     */
    createSeasonEvent(text, type = 'info', data = {}) {
        const event = {
            text: text,
            type: type,
            data: data,
            timestamp: new Date()
        };

        // Publish season event
        this.publish('seasonEvent', event);

        return event;
    }

    /**
     * Create a player event
     * @param {Object} player - Player object
     * @param {string} text - Event text
     * @param {string} type - Event type
     * @param {Object} data - Additional event data
     */
    createPlayerEvent(player, text, type = 'info', data = {}) {
        const event = {
            playerId: player.id,
            playerName: player.name,
            text: text,
            type: type,
            data: data,
            timestamp: new Date()
        };

        // Publish player event
        this.publish('playerEvent', event);

        return event;
    }

    /**
     * Create a team event
     * @param {Object} team - Team object
     * @param {string} text - Event text
     * @param {string} type - Event type
     * @param {Object} data - Additional event data
     */
    createTeamEvent(team, text, type = 'info', data = {}) {
        const event = {
            teamId: team.id,
            teamName: team.name,
            text: text,
            type: type,
            data: data,
            timestamp: new Date()
        };

        // Publish team event
        this.publish('teamEvent', event);

        return event;
    }

    /**
     * Create a financial event
     * @param {number} amount - Amount involved
     * @param {string} text - Event text
     * @param {string} type - Event type
     * @param {Object} data - Additional event data
     */
    createFinancialEvent(amount, text, type = 'info', data = {}) {
        const event = {
            amount: amount,
            text: text,
            type: type,
            data: data,
            timestamp: new Date()
        };

        // Publish financial event
        this.publish('financialEvent', event);

        return event;
    }

    /**
     * Create a recruiting event
     * @param {Object} player - Player object
     * @param {string} text - Event text
     * @param {string} type - Event type
     * @param {Object} data - Additional event data
     */
    createRecruitingEvent(player, text, type = 'info', data = {}) {
        const event = {
            playerId: player.id,
            playerName: player.name,
            text: text,
            type: type,
            data: data,
            timestamp: new Date()
        };

        // Publish recruiting event
        this.publish('recruitingEvent', event);

        return event;
    }

    /**
     * Create a training event
     * @param {Object} player - Player object
     * @param {string} attribute - Attribute trained
     * @param {number} improvement - Amount of improvement
     * @param {string} type - Event type
     * @param {Object} data - Additional event data
     */
    createTrainingEvent(player, attribute, improvement, type = 'info', data = {}) {
        const event = {
            playerId: player.id,
            playerName: player.name,
            attribute: attribute,
            improvement: improvement,
            text: `${player.name} 的${attribute}提升了 ${improvement} 点`,
            type: type,
            data: data,
            timestamp: new Date()
        };

        // Publish training event
        this.publish('trainingEvent', event);

        return event;
    }

    /**
     * Create a scouting event
     * @param {string} target - Target of scouting
     * @param {string} text - Event text
     * @param {string} type - Event type
     * @param {Object} data - Additional event data
     */
    createScoutingEvent(target, text, type = 'info', data = {}) {
        const event = {
            target: target,
            text: text,
            type: type,
            data: data,
            timestamp: new Date()
        };

        // Publish scouting event
        this.publish('scoutingEvent', event);

        return event;
    }

    /**
     * Create a coach event
     * @param {Object} coach - Coach object
     * @param {string} text - Event text
     * @param {string} type - Event type
     * @param {Object} data - Additional event data
     */
    createCoachEvent(coach, text, type = 'info', data = {}) {
        const event = {
            coachId: coach.id,
            coachName: coach.name,
            text: text,
            type: type,
            data: data,
            timestamp: new Date()
        };

        // Publish coach event
        this.publish('coachEvent', event);

        return event;
    }
}