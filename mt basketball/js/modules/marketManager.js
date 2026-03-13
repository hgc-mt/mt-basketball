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
        // 创建数组的副本，避免直接修改原始数组
        const availablePlayers = [...(state.availablePlayers || [])];

        if (!userTeam) return;

        // Find player in available players
        const playerIndex = availablePlayers.findIndex(p => p.id === playerId);
        if (playerIndex === -1) {
            console.error(`[signPlayer] 球员 ${playerId} 不在可用球员列表中`);
            return;
        }

        const player = availablePlayers[playerIndex];

        // Add player to team
        if (userTeam.addPlayer(player)) {
            // Remove from available players
            availablePlayers.splice(playerIndex, 1);

            // Update game state
            this.gameStateManager.set('availablePlayers', availablePlayers);

            // Update UI
            this.displayAvailablePlayers();

            // Show notification
            this.showNotification(`成功签约 ${player.name}`, 'success');
            
            console.log(`[signPlayer] 球员 ${player.name} 已签约并从市场移除，剩余可用球员: ${availablePlayers.length}`);

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

        // 创建数组的副本，避免直接修改原始数组
        const availablePlayers = [...(state.availablePlayers || [])];
        if (availablePlayers.length === 0) {
            return { pickedUp: 0, changes: [] };
        }

        const progress = this.getOffseasonProgress();
        const userTeam = state.userTeam;
        const userRosterIds = userTeam?.roster?.map(p => p.id) || [];
        
        // ===== 关键修复：获取需要补强的AI球队 =====
        const aiTeamsNeedingPlayers = this.getAITeamsNeedingPlayers();

        const pickedUp = [];
        const changes = [];

        for (let i = availablePlayers.length - 1; i >= 0; i--) {
            const player = availablePlayers[i];
            
            if (userRosterIds.includes(player.id)) continue;

            const pickupProb = this.calculatePickupProbability(player);
            
            // ===== 提高AI签约概率，确保球队能正常补强 =====
            // 基础概率 * 时间因子（越往后签约概率越高）
            const progress = this.getOffseasonProgress();
            const timeBoost = 0.5 + (progress * 0.5); // 0.5-1.0
            const finalProb = pickupProb * timeBoost;
            
            if (Math.random() < finalProb) {
                const playerInfo = player.getInfo ? player.getInfo() : player;
                
                // ===== 关键修复：选择一个需要球员的AI球队 =====
                const signingTeam = this.selectAITeamForPlayer(playerInfo, aiTeamsNeedingPlayers);
                
                pickedUp.push({
                    id: playerInfo.id,
                    name: playerInfo.name,
                    rating: playerInfo.overallRating,
                    position: playerInfo.position,
                    teamId: signingTeam?.id,
                    teamName: signingTeam?.name
                });
                
                availablePlayers.splice(i, 1);
                changes.push(`${playerInfo.name} 被 ${signingTeam?.name || '其他球队'} 签走了`);
                
                // ===== 关键修复：将球员实际添加到AI球队阵容 =====
                if (signingTeam) {
                    this.addPlayerToAITeam(signingTeam, playerInfo);
                }
                
                // ===== 关键修复：通知skipRuleManager该球员被签走 =====
                this.notifySkipRuleManagerOfSignedPlayer(playerInfo.id, playerInfo.name);
            }
        }

        if (changes.length > 0) {
            // 保存更新后的可用球员列表（已经是副本，不需要再展开）
            this.gameStateManager.set('availablePlayers', availablePlayers);
            this.gameStateManager.saveGameState();
            
            if (window.app && window.app.recruitmentInterface) {
                window.app.recruitmentInterface.refreshPlayerList();
            }
            
            console.log(`[市场动态] ${changes.length} 名球员被其他球队签走，剩余可用球员: ${availablePlayers.length}`);
        }

        return {
            pickedUp: pickedUp.length,
            players: pickedUp,
            changes: changes
        };
    }
    
    /**
     * 获取需要补强的AI球队列表
     * @returns {Array} 需要球员的球队列表
     */
    getAITeamsNeedingPlayers() {
        const state = this.gameStateManager.getState();
        const allTeams = state.allTeams || [];
        const userTeam = state.userTeam;
        
        return allTeams.filter(team => {
            // 跳过玩家球队
            if (userTeam && team.id === userTeam.id) return false;
            
            const roster = team.roster || [];
            const scholarships = team.scholarshipsAvailable !== undefined 
                ? team.scholarshipsAvailable 
                : Math.max(0, 13 - roster.length);
            
            // 阵容不足13人且还有奖学金的球队
            return roster.length < 13 && scholarships > 0;
        }).map(team => ({
            id: team.id,
            name: team.name,
            roster: team.roster || [],
            scholarshipsAvailable: team.scholarshipsAvailable !== undefined 
                ? team.scholarshipsAvailable 
                : Math.max(0, 13 - (team.roster || []).length)
        }));
    }
    
    /**
     * 为球员选择合适的AI球队
     * @param {Object} player - 球员信息
     * @param {Array} aiTeams - 可选的AI球队列表
     * @returns {Object|null} 选中的球队
     */
    selectAITeamForPlayer(player, aiTeams) {
        if (!aiTeams || aiTeams.length === 0) return null;
        
        // 优先选择阵容人数较少的球队（更急需补强）
        const sortedTeams = [...aiTeams].sort((a, b) => a.roster.length - b.roster.length);
        
        // 从前50%的球队中随机选择
        const candidateCount = Math.max(1, Math.ceil(sortedTeams.length * 0.5));
        const candidates = sortedTeams.slice(0, candidateCount);
        
        return candidates[Math.floor(Math.random() * candidates.length)];
    }
    
    /**
     * 将球员添加到AI球队阵容
     * @param {Object} team - AI球队信息
     * @param {Object} playerInfo - 球员信息
     */
    addPlayerToAITeam(team, playerInfo) {
        const state = this.gameStateManager.getState();
        // 创建 allTeams 的深拷贝
        const allTeams = JSON.parse(JSON.stringify(state.allTeams || []));
        
        // 在 allTeams 中找到对应的球队
        const teamIndex = allTeams.findIndex(t => t.id === team.id);
        if (teamIndex === -1) {
            console.warn(`[市场管理器] 未在allTeams中找到球队 ${team.id}`);
            return;
        }
        
        const gameTeam = allTeams[teamIndex];
        
        // 确保 roster 数组存在
        if (!gameTeam.roster) {
            gameTeam.roster = [];
        }
        
        // 创建球员数据
        const playerData = {
            id: playerInfo.id,
            name: playerInfo.name,
            position: playerInfo.position,
            rating: playerInfo.overallRating || playerInfo.rating || 70,
            potential: playerInfo.potential || playerInfo.overallRating || 70,
            year: playerInfo.year || 1,
            isNewSigning: true,
            signedThisSeason: true
        };
        
        // 添加到阵容
        gameTeam.roster.push(playerData);
        
        // 更新奖学金数量
        if (gameTeam.scholarshipsAvailable !== undefined) {
            gameTeam.scholarshipsAvailable = Math.max(0, gameTeam.scholarshipsAvailable - 1);
        } else {
            gameTeam.scholarshipsAvailable = Math.max(0, 13 - gameTeam.roster.length);
        }
        
        // 保存更新（使用深拷贝后的数组）
        this.gameStateManager.set('allTeams', allTeams);
        
        console.log(`[市场管理器] ${playerInfo.name} 已加入 ${gameTeam.name}，阵容: ${gameTeam.roster.length}人`);
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
        // 1. 更新 state.negotiations.playerNegotiations
        const state = this.gameStateManager.getState();
        const playerNegotiations = state.negotiations?.playerNegotiations || [];
        const negotiationIndex = playerNegotiations.findIndex(n => n.targetId === playerId);
        
        if (negotiationIndex !== -1 && playerNegotiations[negotiationIndex]) {
            playerNegotiations[negotiationIndex].status = 'expired';
            playerNegotiations[negotiationIndex].expiredReason = '被其他球队签走';
            playerNegotiations[negotiationIndex].expiredAt = new Date().toISOString();
            console.log(`[市场管理器] 已更新谈判状态: ${playerName} 被标记为过期`);
        }
        
        // 2. 更新 window.negotiationManager.negotiations
        if (window.negotiationManager?.negotiations) {
            const managerNegotiation = window.negotiationManager.negotiations.find(
                n => n.playerId === playerId && n.status === 'active'
            );
            if (managerNegotiation) {
                managerNegotiation.status = 'expired';
                managerNegotiation.expiredReason = '被其他球队签走';
                managerNegotiation.expiredAt = new Date().toISOString();
                managerNegotiation.lastUpdated = new Date().toISOString();
                console.log(`[市场管理器] 已更新 negotiationManager: ${playerName} 被标记为过期`);
                
                // 保存谈判状态
                window.negotiationManager.saveNegotiations?.();
                
                // 刷新谈判列表
                if (typeof window.recruitmentInterface !== 'undefined') {
                    window.recruitmentInterface.renderNegotiationList();
                    window.recruitmentInterface.updateAllTabCounts();
                }
            }
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

        // ===== 补充新球员到市场 =====
        const replenishResult = this.replenishPlayerPool();

        if (pickupResult.pickedUp > 0 || demandResult.adjusted > 0 || replenishResult.added > 0) {
            console.log(`[市场日报] 被签走: ${pickupResult.pickedUp}, 新补充: ${replenishResult.added}, 难度降低: ${demandResult.adjusted}`);
        }

        return {
            pickups: pickupResult.pickedUp,
            demandAdjustments: demandResult.adjusted,
            replenished: replenishResult.added,
            marketStatus: this.getMarketStatus()
        };
    }

    /**
     * 补充球员池
     * 当球员数量不足时，自动补充新球员
     * 基于32支球队的实际需求：75%大一新生，25%转学生
     */
    replenishPlayerPool() {
        const state = this.gameStateManager.getState();
        // 创建数组的副本，避免直接修改原始数组
        const availablePlayers = [...(state.availablePlayers || [])];

        // 最低球员数量阈值 - 基于32支球队的需求
        // 每队需要约5名球员，总计约160名
        const MIN_PLAYERS = 120;
        const TARGET_PLAYERS = 160;

        if (availablePlayers.length < MIN_PLAYERS) {
            const needed = TARGET_PLAYERS - availablePlayers.length;
            
            // 75%大一新生，25%转学生
            const freshmenCount = Math.round(needed * 0.75);
            const transferCount = needed - freshmenCount;
            
            const freshmenPlayers = this.generateNewPlayers(freshmenCount, 1);
            const transferPlayers = this.generateNewPlayers(transferCount, 'mixed');
            
            const newPlayers = [...freshmenPlayers, ...transferPlayers];

            // 添加到市场（使用副本）
            availablePlayers.push(...newPlayers);
            
            // 保存更新后的列表
            this.gameStateManager.set('availablePlayers', availablePlayers);

            console.log(`[市场补充] 球员数量不足(${availablePlayers.length - newPlayers.length}人)，补充 ${newPlayers.length} 名新球员(大一:${freshmenCount}, 转学:${transferCount})，现在共 ${availablePlayers.length} 人`);
            return { added: newPlayers.length };
        }

        return { added: 0 };
    }

    /**
     * 生成新球员
     * @param {number} count - 需要生成的球员数量
     * @param {number|string} yearConfig - 年级配置: 1=大一, 'mixed'=混合(大二大三大四)
     * @returns {Array} 新球员数组
     */
    generateNewPlayers(count, yearConfig = 1) {
        const players = [];
        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        const chineseSurnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
        const chineseGivenNames = ['小明', '建国', '建军', '志强', '伟', '强', '勇', '杰', '磊', '浩', '宇', '鹏', '超', '峰', '亮', '涛', '斌', '刚', '明', '平', '文', '武', '龙', '虎', '飞', '翔', '华', '东', '南', '西', '北'];

        for (let i = 0; i < count; i++) {
            const surname = chineseSurnames[Math.floor(Math.random() * chineseSurnames.length)];
            const givenName = chineseGivenNames[Math.floor(Math.random() * chineseGivenNames.length)];
            const position = positions[Math.floor(Math.random() * positions.length)];

            // 确定年级
            let year, age, status, rating, potential;
            
            if (yearConfig === 1) {
                // 大一新生
                year = 1;
                age = 17 + Math.floor(Math.random() * 2); // 17-18岁
                status = 'free_agent';
                rating = 50 + Math.floor(Math.random() * 25); // 50-75
                potential = 60 + Math.floor(Math.random() * 30); // 60-90
            } else if (yearConfig === 'mixed') {
                // 转学生 - 大二大三大四
                const yearRand = Math.random();
                if (yearRand < 0.5) {
                    year = 2; // 50%大二
                    age = 19;
                } else if (yearRand < 0.8) {
                    year = 3; // 30%大三
                    age = 20;
                } else {
                    year = 4; // 20%大四
                    age = 21;
                }
                status = 'transfer_wanted';
                rating = 60 + Math.floor(Math.random() * 20); // 60-80，转学生实力更强
                potential = 55 + Math.floor(Math.random() * 25); // 55-80
            } else {
                // 默认大一
                year = 1;
                age = 18;
                status = 'free_agent';
                rating = 55 + Math.floor(Math.random() * 20);
                potential = 65 + Math.floor(Math.random() * 25);
            }

            const player = {
                id: this.gameStateManager.getPlayerId(),
                name: `${surname}${givenName}`,
                position: position,
                age: age,
                year: year,
                status: status,
                rating: rating,
                potential: potential,
                attributes: {
                    scoring: 30 + Math.floor(Math.random() * 40),
                    shooting: 30 + Math.floor(Math.random() * 40),
                    threePoint: 30 + Math.floor(Math.random() * 40),
                    freeThrow: 30 + Math.floor(Math.random() * 40),
                    passing: 30 + Math.floor(Math.random() * 40),
                    dribbling: 30 + Math.floor(Math.random() * 40),
                    defense: 30 + Math.floor(Math.random() * 40),
                    rebounding: 30 + Math.floor(Math.random() * 40),
                    stealing: 30 + Math.floor(Math.random() * 40),
                    blocking: 30 + Math.floor(Math.random() * 40),
                    speed: 30 + Math.floor(Math.random() * 40),
                    stamina: 30 + Math.floor(Math.random() * 40),
                    strength: 30 + Math.floor(Math.random() * 40),
                    basketballIQ: 30 + Math.floor(Math.random() * 40)
                },
                talents: [],
                skills: [],
                stats: { games: 0, points: 0, rebounds: 0, assists: 0 },
                seasonStats: { games: 0, points: 0, rebounds: 0, assists: 0, minutes: 0 }
            };

            players.push(player);
        }

        return players;
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

        // ===== 快进期间补充球员池 =====
        const replenishResult = this.replenishPlayerPool();
        if (replenishResult.added > 0) {
            console.log(`[MarketManager] 快进期间补充 ${replenishResult.added} 名新球员`);
        }

        const finalPlayerCount = (state.availablePlayers || []).length;
        const avgDifficultyReduction = this.calculateAverageDifficultyReduction();

        const newDate = new Date(state.currentDate);
        newDate.setDate(newDate.getDate() + days);
        this.gameStateManager.set('currentDate', newDate);

        // ===== 快进结束时处理谈判中的球员 =====
        let negotiationResult = { signed: 0, failed: 0, details: [] };
        if (window.seasonManager) {
            console.log('[MarketManager] 快进结束，处理谈判中的球员...');
            negotiationResult = window.seasonManager.processPendingNegotiations();
            console.log(`[MarketManager] 谈判处理完成：${negotiationResult.signed}人签约，${negotiationResult.failed}人谈判失败`);
        }

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
            negotiationsResolved: negotiationResult, // 新增：谈判处理结果
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
            
            // ===== 提高AI签约概率，确保球队能正常补强 =====
            const timeBoost = 0.5 + (progress * 0.5); // 0.5-1.0
            const finalProb = pickupProb * timeBoost;
            
            if (Math.random() < finalProb) {
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
            
            // 创建球员数据
            const playerData = {
                id: playerInfo.id,
                name: playerInfo.name,
                position: playerInfo.position,
                rating: playerInfo.overallRating,
                potential: playerInfo.potential || playerInfo.overallRating,
                year: playerInfo.year || 1,
                isNewSigning: true,
                signedThisSeason: true
            };
            
            // 添加到球队阵容
            team.roster.push(playerData);
            
            // 减少奖学金数量
            team.recruitment.scholarshipsAvailable = Math.max(0, team.recruitment.scholarshipsAvailable - 1);
            
            // 重新计算阵容需求
            team.recruitment.priorityNeeds = window.recruitmentCompetitionSystem.identifyTeamNeeds(team.roster);
            
            // ===== 关键修复：同步到 gameStateManager 的 allTeams =====
            this.syncAITeamToGameState(teamId, playerData);
            
            console.log(`[市场签约] ${team.name} 签下 ${playerInfo.name}，剩余奖学金: ${team.recruitment.scholarshipsAvailable}，已同步到allTeams`);
        }
    }

    /**
     * 同步AI球队阵容到 gameStateManager 的 allTeams
     * 这是关键修复，确保GM工具能看到正确的阵容
     * @param {string} teamId - AI球队ID
     * @param {Object} playerData - 新签约球员数据
     */
    syncAITeamToGameState(teamId, playerData) {
        const state = this.gameStateManager.getState();
        // 创建 allTeams 的深拷贝
        const allTeams = JSON.parse(JSON.stringify(state.allTeams || []));
        
        // 在 allTeams 中找到对应的球队
        const teamIndex = allTeams.findIndex(t => t.id === teamId);
        if (teamIndex !== -1) {
            const gameTeam = allTeams[teamIndex];
            
            // 确保 roster 数组存在
            if (!gameTeam.roster) {
                gameTeam.roster = [];
            }
            
            // 检查球员是否已存在（避免重复添加）
            const existingIndex = gameTeam.roster.findIndex(p => p.id === playerData.id);
            if (existingIndex === -1) {
                // 添加球员到游戏球队的阵容
                gameTeam.roster.push(playerData);
                
                // 更新奖学金数量
                if (gameTeam.scholarshipsAvailable !== undefined) {
                    gameTeam.scholarshipsAvailable = Math.max(0, gameTeam.scholarshipsAvailable - 1);
                }
                
                // 保存更新后的 allTeams（使用深拷贝后的数组）
                this.gameStateManager.set('allTeams', allTeams);
                
                console.log(`[阵容同步] ${gameTeam.name} 阵容已更新，现在共 ${gameTeam.roster.length} 人`);
            } else {
                console.log(`[阵容同步] 球员 ${playerData.name} 已存在于 ${gameTeam.name} 阵容中`);
            }
        } else {
            console.warn(`[阵容同步] 未在allTeams中找到球队 ${teamId}`);
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