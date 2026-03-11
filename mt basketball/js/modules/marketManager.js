/**
 * Market Manager module
 * Handles player recruitment and market operations
 */

// import { Player } from './dataModels.js';

class MarketManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log('Market Manager initialized');
    }

    updateMarketScreen() {
        this.displayAvailablePlayers();
        this.setupMarketEvents();
    }

    displayAvailablePlayers() {
        const state = this.gameStateManager.getState();
        const availablePlayers = state.availablePlayers;
        const container = document.getElementById('available-players');

        if (!container) return;

        const playersHtml = availablePlayers.map(player => this.createMarketPlayerCard(player)).join('');
        container.innerHTML = playersHtml;

        // Add event listeners
        container.querySelectorAll('.sign-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const playerId = parseInt(event.target.getAttribute('data-player-id'));
                this.signPlayer(playerId);
            });
        });
    }

    createMarketPlayerCard(player) {
        const yearNames = ['', '大一', '大二', '大三', '大四'];
        const playerInfo = player.getInfo();

        return `
            <div class="market-player-card">
                <div class="player-header">
                    <h4 class="player-name">${playerInfo.name}</h4>
                    <span class="player-position">${playerInfo.position}</span>
                </div>
                <div class="player-info">
                    <div class="player-year">${yearNames[playerInfo.year]}</div>
                    <div class="player-age">年龄: ${playerInfo.age}</div>
                </div>
                <div class="player-rating">
                    <div class="overall-rating">${playerInfo.overallRating}</div>
                    <div class="potential">潜力: ${playerInfo.potential}</div>
                </div>
                <div class="player-attributes">
                    <div class="attribute-bar">
                        <span class="attr-name">得分</span>
                        <div class="attr-bar">
                            <div class="attr-fill" style="width: ${playerInfo.attributes.scoring}%"></div>
                        </div>
                        <span class="attr-value">${playerInfo.attributes.scoring}</span>
                    </div>
                    <div class="attribute-bar">
                        <span class="attr-name">投篮</span>
                        <div class="attr-bar">
                            <div class="attr-fill" style="width: ${playerInfo.attributes.shooting}%"></div>
                        </div>
                        <span class="attr-value">${playerInfo.attributes.shooting}</span>
                    </div>
                    <div class="attribute-bar">
                        <span class="attr-name">三分</span>
                        <div class="attr-bar">
                            <div class="attr-fill" style="width: ${playerInfo.attributes.threePoint}%"></div>
                        </div>
                        <span class="attr-value">${playerInfo.attributes.threePoint}</span>
                    </div>
                    <div class="attribute-bar">
                        <span class="attr-name">防守</span>
                        <div class="attr-bar">
                            <div class="attr-fill" style="width: ${playerInfo.attributes.defense}%"></div>
                        </div>
                        <span class="attr-value">${playerInfo.attributes.defense}</span>
                    </div>
                </div>
                <div class="player-actions">
                    <button class="btn sign-btn" data-player-id="${playerInfo.id}">签约</button>
                </div>
            </div>
        `;
    }

    signPlayer(playerId) {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        const availablePlayers = state.availablePlayers;

        if (!userTeam) return;

        // Find player in available players
        const playerIndex = availablePlayers.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return;

        const player = availablePlayers[playerIndex];

        // Add player to team
        if (userTeam.addPlayer(player)) {
            // Remove from available players
            availablePlayers.splice(playerIndex, 1);

            // Update game state
            this.gameStateManager.set('availablePlayers', [...availablePlayers]);

            // Update UI
            this.displayAvailablePlayers();

            // Show notification
            this.showNotification(`成功签约 ${player.name}`, 'success');

            // Save game state
            this.gameStateManager.saveGameState();
        }
    }

    setupMarketEvents() {
        // Implementation for market events
    }

    showNotification(message, type = 'info') {
        if (window.app && typeof window.app.showNotification === 'function') {
            try {
                window.app.showNotification(message, type);
                return;
            } catch (e) {
                console.warn('Failed to use app notification, falling back to default');
            }
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /**
     * Get current offseason progress (0.0 to 1.0)
     * @returns {number} Progress through offseason
     */
    getOffseasonProgress() {
        const state = this.gameStateManager.getState();
        const currentDate = new Date(state.currentDate);
        
        let seasonEndDate = state.seasonEndDate;
        if (!seasonEndDate) {
            seasonEndDate = new Date(currentDate);
            seasonEndDate.setMonth(seasonEndDate.getMonth() - 3);
        }
        
        const seasonEndDateObj = new Date(seasonEndDate);
        const nextSeasonStart = new Date(seasonEndDateObj);
        nextSeasonStart.setFullYear(nextSeasonStart.getFullYear() + 1);

        const totalOffseasonDays = (nextSeasonStart - seasonEndDateObj) / (1000 * 60 * 60 * 24);
        const daysPassed = (currentDate - seasonEndDateObj) / (1000 * 60 * 60 * 24);

        return Math.min(1, Math.max(0, daysPassed / totalOffseasonDays));
    }

    /**
     * Calculate the probability that AI teams will pick up a player today
     * Higher rated players are picked up earlier
     * @param {Object} player 
     * @returns {number} Probability (0-1)
     */
    calculatePickupProbability(player) {
        const progress = this.getOffseasonProgress();
        const playerInfo = player.getInfo ? player.getInfo() : player;
        
        const rating = playerInfo.overallRating || 70;
        const potential = playerInfo.potential || 70;
        const year = playerInfo.year || 1;
        
        const baseRating = (rating + potential) / 2;
        
        const yearMultiplier = {
            1: 0.8,
            2: 1.0,
            3: 1.2,
            4: 1.4
        }[year] || 1.0;

        const ratingFactor = (baseRating - 50) / 50;
        
        const timeFactor = 0.1 + (progress * 0.9);
        
        const probability = (ratingFactor * 0.3 + 0.5) * yearMultiplier * timeFactor;
        
        return Math.min(0.95, Math.max(0.05, probability));
    }

    /**
     * Simulate AI teams picking up available players
     * Called daily during offseason
     * @returns {Object} Summary of market changes
     */
    simulateMarketDaily() {
        const state = this.gameStateManager.getState();
        const scheduleManager = window.app?.scheduleManager;
        
        if (!scheduleManager || !scheduleManager.isOffseason()) {
            return { pickedUp: 0, changes: [] };
        }

        const availablePlayers = state.availablePlayers;
        if (!availablePlayers || availablePlayers.length === 0) {
            return { pickedUp: 0, changes: [] };
        }

        const progress = this.getOffseasonProgress();
        const userTeam = state.userTeam;
        const userRosterIds = userTeam?.roster?.map(p => p.id) || [];

        const pickedUp = [];
        const changes = [];

        for (let i = availablePlayers.length - 1; i >= 0; i--) {
            const player = availablePlayers[i];
            
            if (userRosterIds.includes(player.id)) continue;

            const pickupProb = this.calculatePickupProbability(player);
            
            if (Math.random() < pickupProb * 0.3) {
                const playerInfo = player.getInfo ? player.getInfo() : player;
                pickedUp.push({
                    id: playerInfo.id,
                    name: playerInfo.name,
                    rating: playerInfo.overallRating,
                    position: playerInfo.position
                });
                
                availablePlayers.splice(i, 1);
                changes.push(`${playerInfo.name} 被其他球队签走了`);
                
                // ===== 关键修复：通知skipRuleManager该球员被签走 =====
                this.notifySkipRuleManagerOfSignedPlayer(playerInfo.id, playerInfo.name);
            }
        }

        if (changes.length > 0) {
            this.gameStateManager.set('availablePlayers', [...availablePlayers]);
            this.gameStateManager.saveGameState();
            
            if (window.app && window.app.recruitmentInterface) {
                window.app.recruitmentInterface.refreshPlayerList();
            }
            
            console.log(`[市场动态] ${changes.length} 名球员被其他球队签走`);
        }

        return {
            pickedUp: pickedUp.length,
            players: pickedUp,
            changes: changes
        };
    }
    
    /**
     * 通知SkipRuleManager球员被其他球队签走
     * 使用RecruitmentUtils工具函数避免代码重复
     */
    notifySkipRuleManagerOfSignedPlayer(playerId, playerName) {
        // 使用公共工具函数
        if (typeof RecruitmentUtils !== 'undefined') {
            RecruitmentUtils.notifySkipRuleManagerOfSignedPlayer(playerId, playerName, {
                source: '市场管理器',
                gameStateManager: this.gameStateManager
            });
        } else {
            // 降级处理：如果工具函数不可用，使用内联逻辑
            console.warn('[市场管理器] RecruitmentUtils不可用，使用降级处理');
            this._fallbackNotifySkipRuleManager(playerId, playerName);
        }
    }
    
    /**
     * 降级处理：直接更新谈判状态
     * 当RecruitmentUtils不可用时使用
     */
    _fallbackNotifySkipRuleManager(playerId, playerName) {
        const state = this.gameStateManager.getState();
        const playerNegotiations = state.negotiations?.playerNegotiations || [];
        const negotiationIndex = playerNegotiations.findIndex(n => n.targetId === playerId);
        
        if (negotiationIndex !== -1 && playerNegotiations[negotiationIndex]) {
            playerNegotiations[negotiationIndex].status = 'expired';
            playerNegotiations[negotiationIndex].expiredReason = '被其他球队签走';
            playerNegotiations[negotiationIndex].expiredAt = new Date().toISOString();
            console.log(`[市场管理器] 已更新谈判状态: ${playerName} 被标记为过期`);
        }
    }

    /**
     * Update player demands/requirements based on time passed
     * Players become easier to sign as offseason progresses
     * Called daily during offseason
     * @returns {Object} Summary of demand changes
     */
    updatePlayerDemands() {
        const state = this.gameStateManager.getState();
        const scheduleManager = window.app?.scheduleManager;
        
        if (!scheduleManager || !scheduleManager.isOffseason()) {
            return { adjusted: 0 };
        }

        const progress = this.getOffseasonProgress();
        const availablePlayers = state.availablePlayers;
        
        if (!availablePlayers || availablePlayers.length === 0) {
            return { adjusted: 0 };
        }

        const userTeam = state.userTeam;
        const userRosterIds = userTeam?.roster?.map(p => p.id) || [];

        let adjusted = 0;

        availablePlayers.forEach(player => {
            if (userRosterIds.includes(player.id)) return;

            const playerInfo = player.getInfo ? player.getInfo() : player;

            if (!player.signingDifficulty) {
                player.signingDifficulty = {};
            }

            const difficultyReduction = progress * 0.4;
            
            if (!player.signingDifficulty.current) {
                player.signingDifficulty.initial = playerInfo.overallRating >= 85 ? 0.9 : 
                                             playerInfo.overallRating >= 75 ? 0.7 : 
                                             playerInfo.overallRating >= 65 ? 0.5 : 0.3;
                player.signingDifficulty.current = player.signingDifficulty.initial;
            }

            if (player.signingDifficulty.current > 0.2) {
                player.signingDifficulty.current = Math.max(0.2, player.signingDifficulty.current - difficultyReduction * 0.05);
                player.signingDifficulty.reduced = true;
                adjusted++;
            }
        });

        if (adjusted > 0) {
            this.gameStateManager.set('availablePlayers', [...availablePlayers]);
            this.gameStateManager.saveGameState();
        }

        return { adjusted: adjusted };
    }

    /**
     * Get market status summary
     * @returns {Object} Market statistics
     */
    getMarketStatus() {
        const state = this.gameStateManager.getState();
        const availablePlayers = state.availablePlayers || [];
        
        const progress = this.getOffseasonProgress();
        
        const avgDifficulty = availablePlayers.length > 0 
            ? availablePlayers.reduce((sum, p) => {
                const info = p.getInfo ? p.getInfo() : p;
                return sum + (p.signingDifficulty?.current || 0.5);
            }, 0) / availablePlayers.length 
            : 0;

        return {
            totalPlayers: availablePlayers.length,
            offseasonProgress: Math.round(progress * 100),
            averageDifficulty: Math.round(avgDifficulty * 100),
            phase: progress < 0.3 ? '早期' : progress < 0.7 ? '中期' : '末期'
        };
    }

    /**
     * Get player signing difficulty (adjusted for time)
     * @param {Object} player 
     * @returns {number} Difficulty 0-1 (lower = easier)
     */
    getPlayerDifficulty(player) {
        const playerInfo = player.getInfo ? player.getInfo() : player;
        
        if (!player.signingDifficulty) {
            player.signingDifficulty = {
                initial: playerInfo.overallRating >= 85 ? 0.9 : 
                         playerInfo.overallRating >= 75 ? 0.7 : 
                         playerInfo.overallRating >= 65 ? 0.5 : 0.3,
                current: playerInfo.overallRating >= 85 ? 0.9 : 
                         playerInfo.overallRating >= 75 ? 0.7 : 
                         playerInfo.overallRating >= 65 ? 0.5 : 0.3
            };
        }

        return player.signingDifficulty.current;
    }

    /**
     * Complete daily market update
     * Should be called from game loop during offseason
     */
    dailyUpdate() {
        const pickupResult = this.simulateMarketDaily();
        const demandResult = this.updatePlayerDemands();

        if (pickupResult.pickedUp > 0 || demandResult.adjusted > 0) {
            console.log(`[市场日报] 被签走: ${pickupResult.pickedUp}, 难度降低: ${demandResult.adjusted}`);
        }

        return {
            pickups: pickupResult.pickedUp,
            demandAdjustments: demandResult.adjusted,
            marketStatus: this.getMarketStatus()
        };
    }

    /**
     * Fast forward through offseason days
     * Simulates multiple days at once while updating market dynamics
     * @param {number} days - Number of days to skip
     * @returns {Object} Summary of changes during fast forward
     */
    fastForward(days = 7) {
        const scheduleManager = window.app?.scheduleManager;
        
        if (!scheduleManager || !scheduleManager.isOffseason()) {
            return { success: false, message: '现在不是休赛期' };
        }

        const state = this.gameStateManager.getState();
        const initialPlayerCount = (state.availablePlayers || []).length;
        const initialDate = new Date(state.currentDate);

        const pickedUpPlayers = [];
        const difficultyChanges = [];
        const signedByAI = []; // 记录被AI签走的球员

        for (let day = 0; day < days; day++) {
            const dayProgress = (day + 1) / days;
            const progress = this.getOffseasonProgress() + (dayProgress * days / 365);

            // 模拟市场活动
            const dailyPickup = this.simulateDayMarket(progress);
            if (dailyPickup.pickedUp.length > 0) {
                pickedUpPlayers.push(...dailyPickup.pickedUp);
            }

            // ===== 关键修复：调用招募竞争系统的每日更新 =====
            if (window.recruitmentCompetitionSystem) {
                window.recruitmentCompetitionSystem.dailyUpdate();
                
                // 检查是否有玩家正在谈判的球员被AI签走
                const negotiatingPlayers = this.getNegotiatingPlayers();
                for (const player of negotiatingPlayers) {
                    const status = window.recruitmentCompetitionSystem.getPlayerRecruitmentStatus(player.playerId);
                    if (status && status.isSigned && status.signedWith !== 'user') {
                        // 检查是否已记录
                        const alreadyRecorded = signedByAI.some(p => p.playerId === player.playerId);
                        if (!alreadyRecorded) {
                            signedByAI.push({
                                playerId: player.playerId,
                                playerName: player.playerName,
                                signedWith: status.signedWith,
                                signedAt: new Date(state.currentDate).toLocaleDateString('zh-CN')
                            });
                        }
                    }
                }
            }
        }

        const finalPlayerCount = (state.availablePlayers || []).length;
        const avgDifficultyReduction = this.calculateAverageDifficultyReduction();

        const newDate = new Date(state.currentDate);
        newDate.setDate(newDate.getDate() + days);
        this.gameStateManager.set('currentDate', newDate);

        this.gameStateManager.set('availablePlayers', [...state.availablePlayers]);
        this.gameStateManager.saveGameState();

        return {
            success: true,
            daysSkipped: days,
            initialDate: initialDate.toLocaleDateString('zh-CN'),
            newDate: newDate.toLocaleDateString('zh-CN'),
            playersPickedUp: pickedUpPlayers.length,
            pickedUpDetails: pickedUpPlayers,
            signedByAI: signedByAI, // 新增：被AI签走的谈判中球员
            initialCount: initialPlayerCount,
            finalCount: finalPlayerCount,
            difficultyReduced: avgDifficultyReduction,
            marketStatus: this.getMarketStatus()
        };
    }

    /**
     * 获取玩家正在谈判的球员列表
     * @returns {Array} 正在谈判的球员列表
     */
    getNegotiatingPlayers() {
        const negotiatingPlayers = [];
        
        // 从negotiationManager获取活跃谈判
        if (window.negotiationManager?.activeNegotiations) {
            for (const [id, negotiation] of window.negotiationManager.activeNegotiations) {
                if (negotiation.status === 'active' || negotiation.status === 'pending') {
                    negotiatingPlayers.push({
                        playerId: negotiation.playerId,
                        playerName: negotiation.playerName
                    });
                }
            }
        }
        
        // 从recruitmentCompetitionSystem获取玩家正在招募的球员
        if (window.recruitmentCompetitionSystem) {
            const allStatus = window.recruitmentCompetitionSystem.getAllRecruitmentStatus();
            for (const [playerId, status] of allStatus) {
                // 检查玩家是否对这个球员有兴趣（兴趣度>0且未签约）
                if (status.playerInterestInUser > 0 && !status.isSigned) {
                    // 检查是否已添加
                    const alreadyAdded = negotiatingPlayers.some(p => p.playerId === playerId);
                    if (!alreadyAdded) {
                        negotiatingPlayers.push({
                            playerId: playerId,
                            playerName: status.playerName
                        });
                    }
                }
            }
        }
        
        return negotiatingPlayers;
    }

    /**
     * Simulate a single day of market activity
     * @param {number} progress - Offseason progress (0-1)
     * @returns {Object} Daily market changes
     */
    simulateDayMarket(progress) {
        const state = this.gameStateManager.getState();
        const availablePlayers = state.availablePlayers;
        const userTeam = state.userTeam;
        const userRosterIds = userTeam?.roster?.map(p => p.id) || [];

        const pickedUp = [];

        for (let i = availablePlayers.length - 1; i >= 0; i--) {
            const player = availablePlayers[i];
            
            if (userRosterIds.includes(player.id)) continue;

            const pickupProb = this.calculatePickupProbability(player);
            
            if (Math.random() < pickupProb * 0.3) {
                const playerInfo = player.getInfo ? player.getInfo() : player;
                pickedUp.push({
                    id: playerInfo.id,
                    name: playerInfo.name,
                    rating: playerInfo.overallRating,
                    position: playerInfo.position,
                    potential: playerInfo.potential || playerInfo.overallRating,
                    year: playerInfo.year || 1,
                    status: playerInfo.status || 'unknown'
                });
                
                // ===== 关键修复：更新AI球队阵容信息 =====
                this.updateAITeamAfterSigning(playerInfo);
                
                availablePlayers.splice(i, 1);
            }
        }

        this.updatePlayerDemandsForProgress(progress);

        return { pickedUp: pickedUp };
    }
    
    /**
     * AI球队签下球员后更新阵容信息
     * @param {Object} playerInfo - 球员信息
     */
    updateAITeamAfterSigning(playerInfo) {
        // 通过recruitmentCompetitionSystem获取AI球队信息
        if (!window.recruitmentCompetitionSystem) return;
        
        const aiTeams = window.recruitmentCompetitionSystem.aiTeams;
        if (!aiTeams || aiTeams.size === 0) return;
        
        // 随机选择一个有空缺且有奖学金的AI球队
        const eligibleTeams = [];
        for (const [teamId, team] of aiTeams) {
            if (team.recruitment.scholarshipsAvailable > 0 && team.roster.length < 13) {
                eligibleTeams.push({ teamId, team });
            }
        }
        
        if (eligibleTeams.length === 0) return;
        
        // 根据球员位置匹配度选择球队
        const playerPosition = playerInfo.position || 'SF';
        let selectedTeam = null;
        
        // 优先选择需要该位置的球队
        for (const { teamId, team } of eligibleTeams) {
            const needs = team.recruitment.priorityNeeds || [];
            const positionNeed = needs.find(n => n.position === playerPosition);
            if (positionNeed && positionNeed.priority === 'high') {
                selectedTeam = { teamId, team };
                break;
            }
        }
        
        // 如果没有匹配的位置需求，随机选择
        if (!selectedTeam) {
            selectedTeam = eligibleTeams[Math.floor(Math.random() * eligibleTeams.length)];
        }
        
        if (selectedTeam) {
            const { teamId, team } = selectedTeam;
            
            // 添加到球队阵容
            team.roster.push({
                id: playerInfo.id,
                name: playerInfo.name,
                position: playerInfo.position,
                rating: playerInfo.overallRating,
                potential: playerInfo.potential || playerInfo.overallRating,
                year: playerInfo.year || 1
            });
            
            // 减少奖学金数量
            team.recruitment.scholarshipsAvailable = Math.max(0, team.recruitment.scholarshipsAvailable - 1);
            
            // 重新计算阵容需求
            team.recruitment.priorityNeeds = window.recruitmentCompetitionSystem.identifyTeamNeeds(team.roster);
            
            console.log(`[市场签约] ${team.name} 签下 ${playerInfo.name}，剩余奖学金: ${team.recruitment.scholarshipsAvailable}`);
        }
    }

    /**
     * Update player demands for a specific progress level
     * @param {number} progress - Offseason progress (0-1)
     */
    updatePlayerDemandsForProgress(progress) {
        const state = this.gameStateManager.getState();
        const availablePlayers = state.availablePlayers || [];
        const userTeam = state.userTeam;
        const userRosterIds = userTeam?.roster?.map(p => p.id) || [];

        availablePlayers.forEach(player => {
            if (userRosterIds.includes(player.id)) return;

            if (!player.signingDifficulty) {
                const playerInfo = player.getInfo ? player.getInfo() : player;
                player.signingDifficulty = playerInfo.overallRating >= 85 ? 0.9 : 
                                         playerInfo.overallRating >= 75 ? 0.7 : 
                                         playerInfo.overallRating >= 65 ? 0.5 : 0.3;
            }

            if (player.signingDifficulty > 0.2) {
                player.signingDifficulty = Math.max(0.2, player.signingDifficulty - progress * 0.02);
            }
        });
    }

    /**
     * Calculate average difficulty reduction across all available players
     * @returns {number} Average reduction percentage
     */
    calculateAverageDifficultyReduction() {
        const state = this.gameStateManager.getState();
        const availablePlayers = state.availablePlayers || [];

        if (availablePlayers.length === 0) return 0;

        let totalReduction = 0;
        let count = 0;

        availablePlayers.forEach(player => {
            if (player.signingDifficulty) {
                const initial = player.signingDifficulty.initial || player.signingDifficulty;
                const current = player.signingDifficulty.current || player.signingDifficulty;
                totalReduction += (initial - current);
                count++;
            }
        });

        return count > 0 ? (totalReduction / count) * 100 : 0;
    }

    /**
     * Get time remaining in offseason
     * @returns {Object} Time remaining information
     */
    getOffseasonTimeRemaining() {
        const state = this.gameStateManager.getState();
        const currentDate = new Date(state.currentDate);
        
        let seasonEndDate = state.seasonEndDate;
        if (!seasonEndDate) {
            seasonEndDate = new Date(currentDate);
            seasonEndDate.setMonth(seasonEndDate.getMonth() - 3);
        }
        
        const seasonEndDateObj = new Date(seasonEndDate);
        const nextSeasonStart = new Date(seasonEndDateObj);
        nextSeasonStart.setFullYear(nextSeasonStart.getFullYear() + 1);

        const daysRemaining = Math.ceil((nextSeasonStart - currentDate) / (1000 * 60 * 60 * 24));
        const progress = this.getOffseasonProgress();

        return {
            daysRemaining: Math.max(0, daysRemaining),
            weeksRemaining: Math.max(0, Math.ceil(daysRemaining / 7)),
            progress: Math.round(progress * 100),
            phase: progress < 0.3 ? '早期' : progress < 0.7 ? '中期' : '末期'
        };
    }

    /**
     * Get recruitment urgency level
     * @returns {Object} Urgency assessment
     */
    getRecruitmentUrgency() {
        const state = this.gameStateManager.getState();
        const availablePlayers = state.availablePlayers || [];
        const timeRemaining = this.getOffseasonTimeRemaining();

        const elitePlayers = availablePlayers.filter(p => {
            const info = p.getInfo ? p.getInfo() : p;
            return info.overallRating >= 80;
        }).length;

        const highUrgency = timeRemaining.weeksRemaining <= 2 || elitePlayers <= 3;
        const mediumUrgency = timeRemaining.weeksRemaining <= 6 || elitePlayers <= 8;

        return {
            level: highUrgency ? 'high' : mediumUrgency ? 'medium' : 'low',
            message: highUrgency 
                ? '休赛期即将结束，顶级球员正在快速流失！' 
                : mediumUrgency 
                    ? '时间过半，高端球员竞争激烈' 
                    : '还有充足时间，可以慢慢挑选',
            elitePlayersRemaining: elitePlayers,
            weeksLeft: timeRemaining.weeksRemaining
        };
    }
}