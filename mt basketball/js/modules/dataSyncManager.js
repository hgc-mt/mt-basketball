/**
 * Data Sync Manager Module
 * Provides real-time bidirectional synchronization between team management
 * and player recruitment modules, including scholarship and player data sync
 */

class DataSyncManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.isInitialized = false;
        this.subscribers = new Map();
        this.syncHistory = [];
        this.pendingSyncs = new Map();
        this.syncInterval = null;
        this.consistencyCheckInterval = null;
        this.lastKnownState = {};
        this.syncListeners = new Map();
        
        // 添加防抖工具
        this.debouncedStateHandler = this.debounce((key, value, state) => {
            this.handleStateChange(key, value, state);
        }, 100);
        
        this.SYNC_EVENTS = {
            ROSTER_CHANGED: 'rosterChanged',
            SCHOLARSHIP_CHANGED: 'scholarshipChanged',
            PLAYER_SIGNED: 'playerSigned',
            PLAYER_RELEASED: 'playerReleased',
            AVAILABLE_PLAYERS_CHANGED: 'availablePlayersChanged',
            TEAM_DATA_CHANGED: 'teamDataChanged',
            CONTRACT_UPDATED: 'contractUpdated',
            FULL_SYNC: 'fullSync'
        };
        
        this.SYNC_PRIORITIES = {
            HIGH: 100,
            MEDIUM: 50,
            LOW: 10
        };
    }

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async initialize() {
        if (this.isInitialized) return;
        
        this.setupStateSubscription();
        this.setupSyncEventListeners();
        this.startPeriodicSyncCheck();
        this.startConsistencyVerification();
        
        this.isInitialized = true;
        console.log('Data Sync Manager initialized');
    }

    setupStateSubscription() {
        this.gameStateManager.subscribe((key, value, state) => {
            this.debouncedStateHandler(key, value, state);
        });
    }

    handleStateChange(key, value, state) {
        const timestamp = Date.now();
        const syncEvent = this.createSyncEvent(key, value, timestamp);
        
        switch (key) {
            case 'userTeam':
                this.handleTeamDataChange(state.userTeam, syncEvent);
                break;
            case 'availablePlayers':
                this.handleAvailablePlayersChange(state.availablePlayers, syncEvent);
                break;
            case 'funds':
            case 'scholarships':
                this.handleScholarshipChange(value, syncEvent);
                break;
        }
        
        this.recordSync(syncEvent);
    }

    createSyncEvent(key, value, timestamp) {
        return {
            key: key,
            value: value,
            timestamp: timestamp,
            eventId: this.generateEventId()
        };
    }

    generateEventId() {
        return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    handleTeamDataChange(teamData, syncEvent) {
        if (!teamData) return;
        
        const rosterChange = this.detectRosterChange(teamData);
        if (rosterChange.hasChanged) {
            this.publishSyncEvent(this.SYNC_EVENTS.ROSTER_CHANGED, {
                ...syncEvent,
                roster: teamData.roster,
                changeType: rosterChange.changeType,
                playerId: rosterChange.playerId
            });
        }
        
        this.publishSyncEvent(this.SYNC_EVENTS.TEAM_DATA_CHANGED, {
            ...syncEvent,
            teamData: this.sanitizeTeamData(teamData)
        });
    }

    detectRosterChange(teamData) {
        const lastState = this.lastKnownState.userTeam;
        const currentRoster = teamData.roster || [];
        const lastRoster = lastState?.roster || [];
        
        if (lastRoster.length !== currentRoster.length) {
            const added = currentRoster.filter(p => !lastRoster.find(lp => lp.id === p.id));
            const removed = lastRoster.filter(lp => !currentRoster.find(p => p.id === lp.id));
            
            return {
                hasChanged: true,
                changeType: added.length > 0 ? 'playerAdded' : 'playerRemoved',
                playerId: added.length > 0 ? added[0]?.id : removed[0]?.id
            };
        }
        
        return { hasChanged: false };
    }

    handleAvailablePlayersChange(players, syncEvent) {
        const lastState = this.lastKnownState.availablePlayers || [];
        const currentPlayers = players || [];
        
        const added = currentPlayers.filter(p => !lastState.find(lp => lp.id === p.id));
        const removed = lastState.filter(lp => !currentPlayers.find(p => p.id === lp.id));
        
        if (added.length > 0 || removed.length > 0) {
            this.publishSyncEvent(this.SYNC_EVENTS.AVAILABLE_PLAYERS_CHANGED, {
                ...syncEvent,
                players: currentPlayers,
                addedPlayers: added,
                removedPlayers: removed
            });
        }
    }

    handleScholarshipChange(value, syncEvent) {
        this.publishSyncEvent(this.SYNC_EVENTS.SCHOLARSHIP_CHANGED, {
            ...syncEvent,
            scholarships: value
        });
    }

    sanitizeTeamData(teamData) {
        return {
            id: teamData.id,
            name: teamData.name,
            roster: teamData.roster?.map(p => ({
                id: p.id,
                name: p.name,
                position: p.position,
                year: p.year,
                rating: p.getOverallRating?.() || p.rating,
                potential: p.potential,
                contract: p.contract
            })),
            scholarships: teamData.scholarships,
            scholarshipsUsed: teamData.scholarshipsUsed,
            stats: { ...teamData.stats }
        };
    }

    setupSyncEventListeners() {
        this.subscribeToSyncEvent(this.SYNC_EVENTS.PLAYER_SIGNED, (data) => {
            this.handlePlayerSigned(data);
        }, this.SYNC_PRIORITIES.HIGH);
        
        this.subscribeToSyncEvent(this.SYNC_EVENTS.PLAYER_RELEASED, (data) => {
            this.handlePlayerReleased(data);
        }, this.SYNC_PRIORITIES.HIGH);
        
        this.subscribeToSyncEvent(this.SYNC_EVENTS.ROSTER_CHANGED, (data) => {
            this.handleRosterChanged(data);
        }, this.SYNC_PRIORITIES.MEDIUM);
        
        this.subscribeToSyncEvent(this.SYNC_EVENTS.SCHOLARSHIP_CHANGED, (data) => {
            this.handleScholarshipSync(data);
        }, this.SYNC_PRIORITIES.MEDIUM);
    }

    handlePlayerSigned(data) {
        console.log('[DataSync] Player signed, triggering sync:', data.playerId);
        
        this.triggerTeamManagerUpdate();
        this.triggerRecruitmentInterfaceUpdate();
        this.syncScholarshipData();
        
        this.recordSync({
            type: 'playerSignedSync',
            timestamp: Date.now(),
            playerId: data.playerId
        });
    }

    handlePlayerReleased(data) {
        console.log('[DataSync] Player released, triggering sync:', data.playerId);
        
        this.triggerTeamManagerUpdate();
        this.triggerRecruitmentInterfaceUpdate();
        this.syncScholarshipData();
        
        this.recordSync({
            type: 'playerReleasedSync',
            timestamp: Date.now(),
            playerId: data.playerId
        });
    }

    handleRosterChanged(data) {
        this.triggerTeamManagerUpdate();
        this.syncScholarshipData();
    }

    handleScholarshipSync(data) {
        this.triggerScholarshipDisplayUpdate();
    }

    subscribeToSyncEvent(eventType, callback, priority = this.SYNC_PRIORITIES.MEDIUM) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, []);
        }
        
        const subscription = {
            callback: callback,
            priority: priority,
            id: this.generateEventId()
        };
        
        this.subscribers.get(eventType).push(subscription);
        this.subscribers.get(eventType).sort((a, b) => b.priority - a.priority);
        
        return () => this.unsubscribeFromSyncEvent(eventType, subscription.id);
    }

    unsubscribeFromSyncEvent(eventType, subscriptionId) {
        const eventSubscribers = this.subscribers.get(eventType);
        if (eventSubscribers) {
            const index = eventSubscribers.findIndex(s => s.id === subscriptionId);
            if (index > -1) {
                eventSubscribers.splice(index, 1);
            }
        }
    }

    publishSyncEvent(eventType, data) {
        const eventSubscribers = this.subscribers.get(eventType);
        if (eventSubscribers) {
            eventSubscribers.forEach(subscription => {
                try {
                    subscription.callback(data);
                } catch (error) {
                    console.error(`[DataSync] Error in sync event subscriber for ${eventType}:`, error);
                }
            });
        }
    }

    triggerTeamManagerUpdate() {
        if (window.teamManager && typeof window.teamManager.updateTeamManagementScreen === 'function') {
            try {
                window.teamManager.updateTeamManagementScreen();
                this.recordSync({
                    type: 'teamManagerUpdate',
                    timestamp: Date.now(),
                    success: true
                });
            } catch (error) {
                console.error('[DataSync] Failed to update team manager:', error);
                this.recordSync({
                    type: 'teamManagerUpdate',
                    timestamp: Date.now(),
                    success: false,
                    error: error.message
                });
            }
        }
    }

    triggerRecruitmentInterfaceUpdate() {
        if (window.game && window.game.recruitmentInterface) {
            try {
                const ri = window.game.recruitmentInterface;
                if (typeof ri.loadPlayers === 'function') {
                    ri.loadPlayers();
                }
                if (typeof ri.renderAll === 'function') {
                    ri.renderAll();
                }
                this.recordSync({
                    type: 'recruitmentInterfaceUpdate',
                    timestamp: Date.now(),
                    success: true
                });
            } catch (error) {
                console.error('[DataSync] Failed to update recruitment interface:', error);
                this.recordSync({
                    type: 'recruitmentInterfaceUpdate',
                    timestamp: Date.now(),
                    success: false,
                    error: error.message
                });
            }
        }
    }

    triggerScholarshipDisplayUpdate() {
        this.triggerTeamManagerUpdate();
        
        const scholarshipRemaining = document.getElementById('scholarship-remaining');
        if (scholarshipRemaining) {
            const state = this.gameStateManager.getState();
            const userTeam = state.userTeam;
            const used = userTeam?.roster?.length || 0;
            const max = 13;
            scholarshipRemaining.textContent = `${max - used}/${max}`;
        }
    }

    syncScholarshipData() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        
        if (!userTeam) return;
        
        const rosterCount = userTeam.roster?.length || 0;
        // 处理新旧奖学金数据结构
        let storedScholarshipsUsed = 0;
        if (userTeam.scholarships && typeof userTeam.scholarships === 'object') {
            storedScholarshipsUsed = userTeam.scholarships.used || 0;
        } else {
            storedScholarshipsUsed = userTeam.scholarshipsUsed || 0;
        }
        
        if (rosterCount !== storedScholarshipsUsed) {
            console.warn('[DataSync] Scholarship count mismatch, repairing:', {
                rosterCount,
                storedScholarshipsUsed
            });
            
            // 更新新的奖学金结构
            if (userTeam.scholarships && typeof userTeam.scholarships === 'object') {
                userTeam.scholarships.used = rosterCount;
            } else {
                userTeam.scholarshipsUsed = rosterCount;
            }
            
            this.gameStateManager.set('userTeam', userTeam);
            
            this.recordSync({
                type: 'scholarshipRepair',
                timestamp: Date.now(),
                oldValue: storedScholarshipsUsed,
                newValue: rosterCount
            });
        }
    }

    syncPlayerData(playerId) {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        const availablePlayers = state.availablePlayers || [];
        
        let playerFound = false;
        
        if (userTeam?.roster) {
            const rosterPlayer = userTeam.roster.find(p => p.id === playerId);
            if (rosterPlayer) {
                playerFound = true;
                this.recordSync({
                    type: 'playerDataSync',
                    timestamp: Date.now(),
                    playerId: playerId,
                    location: 'roster'
                });
            }
        }
        
        if (!playerFound) {
            const availablePlayer = availablePlayers.find(p => p.id === playerId);
            if (availablePlayer) {
                playerFound = true;
                this.recordSync({
                    type: 'playerDataSync',
                    timestamp: Date.now(),
                    playerId: playerId,
                    location: 'available'
                });
            }
        }
        
        if (!playerFound) {
            this.recordSync({
                type: 'playerNotFound',
                timestamp: Date.now(),
                playerId: playerId
            });
        }
        
        return playerFound;
    }

    startPeriodicSyncCheck() {
        this.syncInterval = setInterval(() => {
            this.performPeriodicSyncCheck();
        }, 5000);
    }

    performPeriodicSyncCheck() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        
        if (!userTeam) return;
        
        this.verifyScholarshipConsistency(userTeam);
        this.verifyRosterConsistency(userTeam);
        this.updateLastKnownState(state);
    }

    verifyScholarshipConsistency(userTeam) {
        const rosterCount = userTeam.roster?.length || 0;
        
        // 处理新旧奖学金数据结构
        let scholarshipsUsed = 0;
        let scholarshipsTotal = 13; // 默认值
        
        if (userTeam.scholarships && typeof userTeam.scholarships === 'object') {
            scholarshipsUsed = userTeam.scholarships.used || 0;
            scholarshipsTotal = userTeam.scholarships.total || 5;
        } else if (typeof userTeam.scholarships === 'number') {
            scholarshipsTotal = userTeam.scholarships;
            // 如果没有明确的used字段，fallback到roster长度
            scholarshipsUsed = userTeam.scholarshipsUsed || rosterCount;
        } else {
            scholarshipsUsed = userTeam.scholarshipsUsed || 0;
            // 获取全局设置的奖学金总数
            const gameStateScholarships = this.gameStateManager.get('scholarships');
            scholarshipsTotal = (gameStateScholarships && typeof gameStateScholarships === 'object') 
                ? gameStateScholarships.total 
                : 5;
        }
        
        const issues = [];
        
        if (rosterCount !== scholarshipsUsed) {
            issues.push({
                type: 'scholarshipCountMismatch',
                expected: rosterCount,
                actual: scholarshipsUsed,
                severity: 'high'
            });
        }
        
        if (scholarshipsUsed > scholarshipsTotal) {
            issues.push({
                type: 'scholarshipOverflow',
                used: scholarshipsUsed,
                max: scholarshipsTotal,
                severity: 'critical'
            });
        }
        
        if (issues.length > 0) {
            console.warn('[DataSync] Scholarship consistency issues found:', issues);
            
            // 自动修复问题
            if (rosterCount !== scholarshipsUsed) {
                console.log('[DataSync] Auto-fixing scholarship count mismatch');
                if (userTeam.scholarships && typeof userTeam.scholarships === 'object') {
                    userTeam.scholarships.used = rosterCount;
                } else {
                    userTeam.scholarshipsUsed = rosterCount;
                }
                this.gameStateManager.set('userTeam', userTeam);
            }
        }
    }

    verifyRosterConsistency(userTeam) {
        if (!userTeam.roster || !Array.isArray(userTeam.roster)) {
            return;
        }
        
        const playerIds = userTeam.roster.map(p => p.id);
        const duplicates = playerIds.filter((id, index) => playerIds.indexOf(id) !== index);
        
        if (duplicates.length > 0) {
            console.error('[DataSync] Duplicate players found in roster:', duplicates);
            
            userTeam.roster = userTeam.roster.filter((player, index, self) =>
                index === self.findIndex(p => p.id === player.id)
            );
            
            this.gameStateManager.set('userTeam', userTeam);
            
            this.recordSync({
                type: 'duplicatePlayersFixed',
                timestamp: Date.now(),
                duplicates: duplicates
            });
        }
    }

    updateLastKnownState(state) {
        this.lastKnownState = {
            userTeam: state.userTeam ? JSON.parse(JSON.stringify(state.userTeam)) : null,
            availablePlayers: state.availablePlayers ? JSON.parse(JSON.stringify(state.availablePlayers)) : [],
            funds: state.funds,
            scholarships: state.scholarships
        };
    }

    startConsistencyVerification() {
        this.consistencyCheckInterval = setInterval(() => {
            this.performFullConsistencyCheck();
        }, 30000);
    }

    performFullConsistencyCheck() {
        const state = this.gameStateManager.getState();
        
        console.log('[DataSync] Performing full consistency check...');
        
        let allConsistent = true;
        const issues = [];
        
        if (state.userTeam) {
            this.verifyScholarshipConsistency(state.userTeam);
            this.verifyRosterConsistency(state.userTeam);
        }
        
        if (state.availablePlayers) {
            const rosterPlayerIds = state.userTeam?.roster?.map(p => p.id) || [];
            const duplicateInAvailable = state.availablePlayers.filter(
                (p, index, self) => index !== self.findIndex(x => x.id === p.id)
            );
            
            if (duplicateInAvailable.length > 0) {
                issues.push({
                    type: 'duplicatesInAvailablePlayers',
                    count: duplicateInAvailable.length
                });
                allConsistent = false;
            }
            
            const playersInBothLists = state.availablePlayers.filter(
                p => rosterPlayerIds.includes(p.id)
            );
            
            if (playersInBothLists.length > 0) {
                issues.push({
                    type: 'playerInBothLists',
                    players: playersInBothLists.map(p => p.id)
                });
                allConsistent = false;
            }
        }
        
        if (issues.length > 0) {
            console.warn('[DataSync] Consistency issues found:', issues);
            
            this.fixConsistencyIssues(issues, state);
        }
        
        this.recordSync({
            type: 'fullConsistencyCheck',
            timestamp: Date.now(),
            consistent: allConsistent,
            issuesFound: issues.length
        });
        
        return { allConsistent, issues };
    }

    fixConsistencyIssues(issues, state) {
        issues.forEach(issue => {
            switch (issue.type) {
                case 'playerInBothLists':
                    if (state.userTeam && state.availablePlayers) {
                        const rosterIds = state.userTeam.roster.map(p => p.id);
                        state.availablePlayers = state.availablePlayers.filter(
                            p => !rosterIds.includes(p.id)
                        );
                        this.gameStateManager.set('availablePlayers', state.availablePlayers);
                    }
                    break;
            }
        });
    }

    recordSync(syncData) {
        this.syncHistory.push({
            ...syncData,
            timestamp: syncData.timestamp || Date.now()
        });
        
        if (this.syncHistory.length > 100) {
            this.syncHistory.shift();
        }
    }

    getSyncHistory(filter = null) {
        if (!filter) return [...this.syncHistory];
        
        return this.syncHistory.filter(sync => {
            for (const [key, value] of Object.entries(filter)) {
                if (sync[key] !== value) return false;
            }
            return true;
        });
    }

    forceFullSync() {
        console.log('[DataSync] Force full sync triggered');
        
        const state = this.gameStateManager.getState();
        
        this.updateLastKnownState(state);
        
        this.publishSyncEvent(this.SYNC_EVENTS.FULL_SYNC, {
            timestamp: Date.now(),
            state: state
        });
        
        this.triggerTeamManagerUpdate();
        this.triggerRecruitmentInterfaceUpdate();
        this.syncScholarshipData();
        
        this.recordSync({
            type: 'forceFullSync',
            timestamp: Date.now()
        });
    }

    getSyncStatus() {
        return {
            isInitialized: this.isInitialized,
            syncHistoryCount: this.syncHistory.length,
            subscriberCount: Array.from(this.subscribers.values()).reduce((sum, subs) => sum + subs.length, 0),
            lastSync: this.syncHistory[this.syncHistory.length - 1],
            activeIntervals: {
                syncCheck: this.syncInterval !== null,
                consistencyCheck: this.consistencyCheckInterval !== null
            }
        };
    }

    cleanup() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        if (this.consistencyCheckInterval) {
            clearInterval(this.consistencyCheckInterval);
            this.consistencyCheckInterval = null;
        }
        
        this.subscribers.clear();
        this.syncHistory = [];
        
        console.log('Data Sync Manager cleaned up');
    }
}

window.DataSyncManager = DataSyncManager;
