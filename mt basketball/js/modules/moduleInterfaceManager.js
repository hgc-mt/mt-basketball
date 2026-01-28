/**
 * Module Interface Manager
 * Provides standardized interfaces for module communication and data consistency
 */

class ModuleInterfaceManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.interfaces = {
            scholarship: null,
            schedule: null
        };
    }

    /**
     * Initialize interface manager
     */
    initialize() {
        console.log('模块接口管理器初始化完成');
    }

    /**
     * Register scholarship calculation interface
     * @param {Object} interface - Scholarship interface implementation
     */
    registerScholarshipInterface(interface) {
        this.interfaces.scholarship = interface;
        console.log('奖学金计算接口已注册');
    }

    /**
     * Register schedule interface
     * @param {Object} interface - Schedule interface implementation
     */
    registerScheduleInterface(interface) {
        this.interfaces.schedule = interface;
        console.log('赛程接口已注册');
    }

    /**
     * Get scholarship calculation result
     * @param {Object} team - Team object
     * @returns {Object} Scholarship calculation result
     */
    getScholarshipCalculation(team) {
        if (!this.interfaces.scholarship) {
            console.warn('奖学金计算接口未注册');
            return this.getDefaultScholarshipCalculation(team);
        }

        return this.interfaces.scholarship.calculate(team);
    }

    /**
     * Get default scholarship calculation
     * @param {Object} team - Team object
     * @returns {Object} Default scholarship calculation
     */
    getDefaultScholarshipCalculation(team) {
        const totalScholarships = typeof team.scholarships === 'number' ? team.scholarships : 13;
        const usedShare = team.calculateUsedScholarshipShare ? team.calculateUsedScholarshipShare() : (team.roster ? team.roster.length : 0);
        const availableShare = totalScholarships - usedShare;

        return {
            total: totalScholarships,
            usedShare: usedShare,
            availableShare: availableShare,
            rosterCount: team.roster ? team.roster.length : 0,
            percentage: totalScholarships > 0 ? (usedShare / totalScholarships) : 0
        };
    }

    /**
     * Update scholarship display
     * @param {Object} team - Team object
     */
    updateScholarshipDisplay(team) {
        const calculation = this.getScholarshipCalculation(team);
        
        const usedEl = document.getElementById('scholarship-used');
        const totalEl = document.getElementById('scholarship-total');
        const totalValueEl = document.getElementById('scholarship-total-value');
        const availableEl = document.getElementById('scholarship-available');
        const progressPathEl = document.getElementById('scholarship-progress-path');

        if (usedEl) usedEl.textContent = Math.round(calculation.usedShare * 100) / 100;
        if (totalEl) totalEl.textContent = calculation.total;
        if (totalValueEl) totalValueEl.textContent = calculation.total;
        if (availableEl) availableEl.textContent = Math.round(calculation.availableShare * 100) / 100;

        if (progressPathEl) {
            const percentage = calculation.percentage;
            const radius = 45;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference * (1 - percentage);
            
            progressPathEl.style.strokeDasharray = circumference;
            progressPathEl.style.strokeDashoffset = offset;
            progressPathEl.style.stroke = percentage >= 1 ? '#ff6b6b' : '#e94560';
            progressPathEl.style.opacity = 1;
            progressPathEl.style.visibility = 'visible';
        }
    }

    /**
     * Get schedule with updated dates
     * @returns {Array} Schedule with correct dates
     */
    getUpdatedSchedule() {
        if (!this.interfaces.schedule) {
            console.warn('赛程接口未注册');
            return this.getDefaultSchedule();
        }

        return this.interfaces.schedule.getSchedule();
    }

    /**
     * Get default schedule
     * @returns {Array} Default schedule
     */
    getDefaultSchedule() {
        const state = this.gameStateManager.getState();
        return state.gameSchedule || [];
    }

    /**
     * Sync schedule dates with current game date
     * @param {Date} currentDate - Current game date
     */
    syncScheduleDates(currentDate) {
        if (!this.interfaces.schedule) {
            console.warn('赛程接口未注册');
            return;
        }

        this.interfaces.schedule.syncDates(currentDate);
    }

    /**
     * Trigger season start with synchronized dates
     */
    startSeasonWithSync() {
        const state = this.gameStateManager.getState();
        const currentDate = state.currentDate || new Date();

        // 同步赛程日期
        this.syncScheduleDates(currentDate);

        // 更新奖学金显示
        if (state.userTeam) {
            this.updateScholarshipDisplay(state.userTeam);
        }

        console.log('赛季开始，日期和奖学金已同步');
    }

    /**
     * Update scholarship after player signing
     * @param {Object} player - Signed player
     * @param {Object} team - Team object
     */
    updateScholarshipAfterSigning(player, team) {
        const calculation = this.getScholarshipCalculation(team);
        
        console.log(`球员 ${player.name} 签约，奖学金份额: ${player.scholarship || 1.0}`);
        console.log(`当前奖学金使用情况: ${calculation.usedShare}/${calculation.total}`);
        
        // 更新显示
        this.updateScholarshipDisplay(team);
    }

    /**
     * Validate scholarship availability
     * @param {Object} player - Player to sign
     * @param {Object} team - Team object
     * @returns {Object} Validation result
     */
    validateScholarshipAvailability(player, team) {
        const calculation = this.getScholarshipCalculation(team);
        const playerScholarshipShare = player.scholarship || 1.0;
        const wouldBeUsed = calculation.usedShare + playerScholarshipShare;

        const result = {
            canSign: wouldBeUsed <= calculation.total,
            currentUsed: calculation.usedShare,
            playerShare: playerScholarshipShare,
            wouldBeUsed: wouldBeUsed,
            totalAvailable: calculation.total,
            availableAfter: calculation.total - wouldBeUsed,
            reason: wouldBeUsed > calculation.total 
                ? `奖学金份额不足 (需要 ${playerScholarshipShare}，可用 ${calculation.availableShare})`
                : '可以签约'
        };

        return result;
    }

    /**
     * Get interface status
     * @returns {Object} Interface status
     */
    getStatus() {
        return {
            scholarshipInterface: this.interfaces.scholarship ? 'registered' : 'not_registered',
            scheduleInterface: this.interfaces.schedule ? 'registered' : 'not_registered',
            currentDate: this.gameStateManager.get('currentDate'),
            seasonPhase: this.gameStateManager.get('seasonPhase')
        };
    }
}

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleInterfaceManager;
}