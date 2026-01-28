/**
 * Contract & Scholarship Manager Module
 * Handles player contracts, scholarships, negotiations, and transfer logic
 */

class ContractManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.dataSyncManager = null;
        this.SCHOLARSHIP_LIMIT = 5;
        this.SEASON_MONTHS = ['九月', '十月', '十一月', '十二月', '一月', '二月', '三月', '四月'];
        
        this.REJECTION_REASONS = [
            '家太远了，不想离开家乡',
            '这不是我心仪的学校',
            '我想加入更强的球队',
            '你们的打法不适合我',
            '我已经有其他选择了',
            '我想先读完高中再做决定',
            '父母不同意我转学',
            '这里的气候我不适应',
            '我想和我的好朋友一起打球',
            '你们的训练太辛苦了'
        ];

        this.SENIOR_REJECTION_REASONS = [
            '快毕业了，不想折腾',
            '我想专心找工作',
            '研究生阶段不想再转学',
            '这里有我的朋友',
            '我已经习惯了这里的生活'
        ];

        this.TRANSFER_FAILURE_MESSAGES = [
            '你在羞辱我',
            '请尊重我的选择',
            '我不会考虑你的报价',
            '你太让我失望了',
            '我们没什么好谈的了'
        ];
    }

    initialize() {
        console.log('Contract Manager initialized');
    }

    setDataSyncManager(dataSyncManager) {
        this.dataSyncManager = dataSyncManager;
    }

    getState() {
        return this.gameStateManager.getState();
    }

    /**
     * Get available scholarship count
     */
    getAvailableScholarships() {
        const scholarships = this.gameStateManager.get('scholarships') || { total: 5, used: 0 };
        return scholarships.total - (scholarships.used || 0);
    }

    /**
     * Get used scholarship count
     */
    getUsedScholarships() {
        const scholarships = this.gameStateManager.get('scholarships') || { total: 5, used: 0 };
        return scholarships.used || 0;
    }

    /**
     * Check if can offer more scholarships
     */
    canOfferScholarship() {
        return this.getAvailableScholarships() > 0;
    }

    /**
     * Calculate signing difficulty for a player
     * @param {Object} player - Player object
     * @param {number} scholarshipPercent - Offered scholarship percentage (0-100)
     * @returns {Object} Difficulty result with success probability and factors
     */
    calculateSigningDifficulty(player, scholarshipPercent) {
        const overallRating = player.getOverallRating();
        const potential = player.potential;
        const year = player.year;
        let baseDifficulty = 0;
        let factors = [];

        // Base difficulty by year
        const yearMultipliers = { 1: 1.0, 2: 1.5, 3: 1.8, 4: 2.5 };
        baseDifficulty += yearMultipliers[year] || 1.0;
        factors.push(`年级系数: ${yearMultipliers[year]}x`);

        // Rating factor (exponential increase for high rated players)
        const ratingFactor = Math.pow(overallRating / 50, 1.8);
        baseDifficulty *= ratingFactor;
        factors.push(`评分影响: ${ratingFactor.toFixed(2)}x (评分${overallRating})`);

        // Potential factor
        const potentialFactor = Math.pow(potential / 70, 1.5);
        baseDifficulty *= potentialFactor;
        factors.push(`潜力影响: ${potentialFactor.toFixed(2)}x (潜力${potential})`);

        // Scholarship reduction
        let scholarshipReduction = 1.0;
        if (scholarshipPercent >= 100) {
            scholarshipReduction = 0.7;
            factors.push('全额奖学金: 难度降低30%');
        } else if (scholarshipPercent >= 75) {
            scholarshipReduction = 0.85;
            factors.push('高额奖学金(75%+): 难度降低15%');
        } else if (scholarshipPercent >= 50) {
            scholarshipReduction = 0.95;
            factors.push('中额奖学金(50%+): 难度降低5%');
        } else if (scholarshipPercent >= 25 && overallRating <= 50 && potential <= 70) {
            scholarshipReduction = 0.5;
            factors.push('低评分低潜力优惠: 难度降低50%');
        }
        baseDifficulty *= scholarshipReduction;

        // Calculate success probability (inverse of difficulty)
        let successProbability = Math.max(0.05, Math.min(0.95, 1 / (1 + baseDifficulty * 0.1)));

        // Apply minimum rejection chance for high-end players
        if (overallRating >= 80 || potential >= 90) {
            const minRejection = 0.1 + (overallRating - 80) * 0.02 + (potential - 90) * 0.02;
            successProbability = Math.min(successProbability, 1 - Math.min(0.3, minRejection));
            factors.push(`高潜力最低成功率: ${(successProbability * 100).toFixed(0)}%`);
        }

        return {
            successProbability: Math.round(successProbability * 100),
            baseDifficulty: baseDifficulty,
            factors: factors,
            willAccept: successProbability >= 0.5
        };
    }

    /**
     * Process freshman signing without scholarship
     * @param {Object} player - Player object
     * @returns {Object} Signing result
     */
    processFreshmanNoScholarship(player) {
        if (player.year !== 1) {
            return { success: false, message: '此操作仅适用于大一新生' };
        }

        // 50% rejection rate
        const isRejected = Math.random() < 0.5;

        if (isRejected) {
            const reason = this.REJECTION_REASONS[Math.floor(Math.random() * this.REJECTION_REASONS.length)];
            
            // Mark player as rejected
            player.contractStatus = 'rejected';
            player.rejectionReason = reason;
            player.rejectionDate = new Date().toISOString();
            
            return {
                success: false,
                rejected: true,
                message: `拒绝了你，原因是${reason}`,
                playerId: player.id
            };
        }

        return {
            success: true,
            message: `${player.name} 愿意加入球队！`,
            playerId: player.id
        };
    }

    /**
     * Process scholarship negotiation
     * @param {Object} player - Player object
     * @param {number} scholarshipPercent - Offered percentage
     * @returns {Object} Negotiation result
     */
    processScholarshipNegotiation(player, scholarshipPercent) {
        const difficulty = this.calculateSigningDifficulty(player, scholarshipPercent);
        const roll = Math.random() * 100;
        const success = roll < difficulty.successProbability;

        // Record negotiation attempt
        if (!player.negotiationHistory) {
            player.negotiationHistory = [];
        }
        player.negotiationHistory.push({
            date: new Date().toISOString(),
            offer: scholarshipPercent,
            result: success ? 'success' : 'failed'
        });

        if (success) {
            player.contractStatus = 'offer_accepted';
            player.scholarshipPercent = scholarshipPercent;
            return {
                success: true,
                message: `${player.name} 接受了 ${scholarshipPercent}% 奖学金offer！`,
                difficulty: difficulty
            };
        } else {
            const reason = player.year >= 4 ? 
                this.SENIOR_REJECTION_REASONS[Math.floor(Math.random() * this.SENIOR_REJECTION_REASONS.length)] :
                this.REJECTION_REASONS[Math.floor(Math.random() * this.REJECTION_REASONS.length)];
            
            return {
                success: false,
                rejected: false,
                message: `${player.name} 拒绝了你，原因是：${reason}`,
                difficulty: difficulty,
                playerId: player.id
            };
        }
    }

    /**
     * Calculate transfer willingness for upperclassmen
     * @param {Object} player - Player object
     * @returns {Object} Transfer analysis
     */
    calculateTransferWillingness(player) {
        if (player.year === 1) {
            return { willing: true, score: 100, message: '大一新生，转学意愿强烈' };
        }

        let willingnessScore = 50; // Base score
        let factors = [];

        // Low rating, low potential, limited playing time bonus
        if (player.year >= 2 && player.year <= 3) {
            const overallRating = player.getOverallRating();
            
            if (overallRating <= 65 && player.potential <= 55) {
                willingnessScore += 30;
                factors.push('低评分低潜力: +30');
            }

            // Simulated playing time (in real app, this would come from stats)
            const avgMinutes = player.stats?.avgMinutes || 15;
            if (avgMinutes < 10) {
                willingnessScore += 15;
                factors.push('出场时间少: +15');
            }

            // Current scholarship impact
            if (player.currentScholarship) {
                willingnessScore -= player.currentScholarship * 0.5;
                factors.push(`当前奖学金: -${player.currentScholarship * 0.5}`);
            }
        }

        // Senior year penalty
        if (player.year === 4) {
            willingnessScore = Math.max(5, willingnessScore * 0.2);
            factors.push('大四临近毕业: 大幅降低');
        }

        // Year multiplier
        const yearMultipliers = { 2: 1.0, 3: 0.9, 4: 0.2 };
        willingnessScore *= yearMultipliers[player.year] || 1.0;

        return {
            willing: willingnessScore >= 50,
            score: Math.round(willingnessScore),
            factors: factors,
            message: willingnessScore >= 70 ? '转学意愿强烈' : 
                     willingnessScore >= 50 ? '可以考虑转学' : 
                     '转学可能性较低'
        };
    }

    /**
     * Process transfer offer
     * @param {Object} player - Player object
     * @param {number} scholarshipPercent - Offered scholarship
     * @returns {Object} Transfer result
     */
    processTransferOffer(player, scholarshipPercent) {
        if (player.year === 1) {
            return this.processScholarshipNegotiation(player, scholarshipPercent);
        }

        const willingness = this.calculateTransferWillingness(player);
        
        // Initialize negotiation count
        if (!player.transferNegotiationCount) {
            player.transferNegotiationCount = 0;
        }

        // Check for disappearance after 3 failures
        if (player.transferNegotiationCount >= 3) {
            const farewellMsg = this.TRANSFER_FAILURE_MESSAGES[Math.floor(Math.random() * this.TRANSFER_FAILURE_MESSAGES.length)];
            player.contractStatus = 'transferred_away';
            player.disappeared = true;
            return {
                success: false,
                disappeared: true,
                message: farewellMsg,
                playerId: player.id
            };
        }

        // Calculate success probability
        const baseSuccess = 0.3; // 30% base
        const scholarshipBonus = scholarshipPercent >= (player.currentScholarship || 0) ? 
            (scholarshipPercent - (player.currentScholarship || 0)) * 0.02 : 0;
        
        let successProbability = Math.min(0.8, baseSuccess + scholarshipBonus + (willingness.score / 200));

        // Senior penalty
        if (player.year === 4) {
            successProbability *= 0.2; // 5% base for seniors
        }

        // Apply difficulty multiplier
        const difficultyMultiplier = player.year >= 4 ? 2.5 : 1.0;
        successProbability /= difficultyMultiplier;

        const roll = Math.random();
        const success = roll < successProbability;

        player.transferNegotiationCount++;

        if (success) {
            player.contractStatus = 'transferred_in';
            player.scholarshipPercent = scholarshipPercent;
            return {
                success: true,
                message: `${player.name} 同意转学！`,
                scholarship: scholarshipPercent,
                negotiationCount: player.transferNegotiationCount
            };
        } else {
            const reason = player.year >= 4 ? 
                this.SENIOR_REJECTION_REASONS[Math.floor(Math.random() * this.SENIOR_REJECTION_REASONS.length)] :
                this.REJECTION_REASONS[Math.floor(Math.random() * this.REJECTION_REASONS.length)];
            
            return {
                success: false,
                message: `转学谈判失败：${reason}`,
                remainingAttempts: 3 - player.transferNegotiationCount,
                playerId: player.id
            };
        }
    }

    /**
     * Sign player to team
     * @param {string} playerId - Player ID
     * @param {number} scholarshipPercent - Scholarship percentage
     * @returns {Object} Signing result
     */
    signPlayer(playerId, scholarshipPercent = 100) {
        const state = this.getState();
        const userTeam = state.userTeam;
        const availablePlayers = state.availablePlayers;

        if (!userTeam || !this.canOfferScholarship()) {
            return { success: false, message: '无法签约：没有可用奖学金名额' };
        }

        const playerIndex = availablePlayers.findIndex(p => p.id === playerId);
        if (playerIndex === -1) {
            return { success: false, message: '球员不存在' };
        }

        const player = availablePlayers[playerIndex];

        // Check if player is already rejected
        if (player.contractStatus === 'rejected') {
            return { success: false, message: `${player.name} 已经被标记为拒绝签约` };
        }

        // Process based on year and scholarship
        let result;
        if (player.year === 1 && scholarshipPercent < 100) {
            result = this.processFreshmanNoScholarship(player);
            if (result.rejected) {
                // Remove from available players
                availablePlayers.splice(playerIndex, 1);
                this.gameStateManager.set('availablePlayers', [...availablePlayers]);
                return result;
            }
        }

        // Process scholarship negotiation
        result = this.processScholarshipNegotiation(player, scholarshipPercent);

        if (result.success) {
            // Add to team
            if (userTeam.addPlayer(player)) {
                // Update scholarships used in the new structure
                const currentScholarships = this.gameStateManager.get('scholarships') || { total: 5, used: 0 };
                currentScholarships.used = (currentScholarships.used || 0) + 1;
                this.gameStateManager.set('scholarships', currentScholarships);
                
                player.scholarshipPercent = scholarshipPercent;
                player.currentScholarship = scholarshipPercent;
                player.contractStatus = 'signed';
                player.signedDate = new Date().toISOString();

                // Remove from available players
                availablePlayers.splice(playerIndex, 1);
                
                // Update game state
                this.gameStateManager.set('availablePlayers', [...availablePlayers]);
                this.gameStateManager.saveGameState();

                if (this.dataSyncManager) {
                    this.dataSyncManager.publishSyncEvent('playerSigned', {
                        playerId: player.id,
                        playerName: player.name,
                        scholarshipPercent: scholarshipPercent,
                        timestamp: Date.now()
                    });
                }

                return {
                    success: true,
                    message: `成功签约 ${player.name}！`,
                    player: player.getInfo()
                };
            } else {
                return {
                    success: false,
                    message: '球队阵容已满，无法签约更多球员'
                };
            }
        }

        return result;
    }

    /**
     * Offer transfer to roster player
     * @param {string} playerId - Player ID from available players
     * @param {number} scholarshipPercent - Offered scholarship
     * @returns {Object} Transfer result
     */
    offerTransfer(playerId, scholarshipPercent) {
        const state = this.getState();
        const userTeam = state.userTeam;
        const availablePlayers = state.availablePlayers;

        const player = availablePlayers.find(p => p.id === playerId);
        if (!player) {
            return { success: false, message: '球员不存在' };
        }

        const result = this.processTransferOffer(player, scholarshipPercent);

        if (result.success && !result.disappeared) {
            // Add to team
            if (userTeam.addPlayer(player)) {
                // Update scholarships used in the new structure
                const currentScholarships = this.gameStateManager.get('scholarships') || { total: 5, used: 0 };
                currentScholarships.used = (currentScholarships.used || 0) + 1;
                this.gameStateManager.set('scholarships', currentScholarships);
                
                player.scholarshipPercent = scholarshipPercent;
                player.currentScholarship = scholarshipPercent;
                player.contractStatus = 'signed';
                player.signedDate = new Date().toISOString();

                // Remove from available players
                const playerIndex = availablePlayers.findIndex(p => p.id === playerId);
                availablePlayers.splice(playerIndex, 1);

                this.gameStateManager.set('availablePlayers', [...availablePlayers]);
                this.gameStateManager.saveGameState();

                if (this.dataSyncManager) {
                    this.dataSyncManager.publishSyncEvent('playerSigned', {
                        playerId: player.id,
                        playerName: player.name,
                        scholarshipPercent: scholarshipPercent,
                        isTransfer: true,
                        timestamp: Date.now()
                    });
                }

                return {
                    success: true,
                    message: `成功签下转学生 ${player.name}！`,
                    player: player.getInfo()
                };
            }
        }

        if (result.disappeared) {
            // Remove from available players
            const playerIndex = availablePlayers.findIndex(p => p.id === playerId);
            if (playerIndex >= 0) {
                availablePlayers.splice(playerIndex, 1);
                this.gameStateManager.set('availablePlayers', [...availablePlayers]);
            }
        }

        return result;
    }

    /**
     * Get scholarship allocation suggestions
     * @returns {Object} Suggestions for scholarship allocation
     */
    getScholarshipSuggestions() {
        const state = this.getState();
        const userTeam = state.userTeam;
        
        if (!userTeam) return null;

        const roster = userTeam.roster || [];
        const suggestions = {
            currentUsage: roster.length,
            available: this.getAvailableScholarships(),
            positions: {},
            recommendations: []
        };

        // Analyze current roster composition
        const positionNeeds = { 'PG': 0, 'SG': 0, 'SF': 0, 'PF': 0, 'C': 0 };
        roster.forEach(player => {
            if (positionNeeds.hasOwnProperty(player.position)) {
                positionNeeds[player.position]++;
            }
        });

        // Find gaps
        const positionLabels = { 'PG': '控球后卫', 'SG': '得分后卫', 'SF': '小前锋', 'PF': '大前锋', 'C': '中锋' };
        
        Object.keys(positionNeeds).forEach(pos => {
            if (positionNeeds[pos] < 2) {
                suggestions.recommendations.push({
                    position: pos,
                    label: positionLabels[pos],
                    current: positionNeeds[pos],
                    suggested: 2,
                    priority: positionNeeds[pos] === 0 ? 'high' : 'medium'
                });
            }
        });

        // Suggest players from available pool
        const availablePlayers = state.availablePlayers || [];
        const topProspects = availablePlayers
            .filter(p => !p.contractStatus || p.contractStatus === 'available')
            .sort((a, b) => {
                const aScore = a.potential * 0.6 + a.getOverallRating() * 0.4;
                const bScore = b.potential * 0.6 + b.getOverallRating() * 0.4;
                return bScore - aScore;
            })
            .slice(0, 5);

        suggestions.topProspects = topProspects.map(p => ({
            id: p.id,
            name: p.name,
            position: p.position,
            rating: p.getOverallRating(),
            potential: p.potential,
            year: p.year
        }));

        return suggestions;
    }

    /**
     * Release player from team
     * @param {string} playerId - Player ID
     * @returns {Object} Release result
     */
    releasePlayer(playerId) {
        const state = this.getState();
        const userTeam = state.userTeam;

        if (!userTeam) {
            return { success: false, message: '球队不存在' };
        }

        const player = userTeam.getPlayer(playerId);
        if (!player) {
            return { success: false, message: '球员不在球队中' };
        }

        // Remove from team
        userTeam.removePlayer(playerId);
        
        // Update scholarships used in the new structure
        const currentScholarships = this.gameStateManager.get('scholarships') || { total: 5, used: 0 };
        currentScholarships.used = Math.max(0, (currentScholarships.used || 1) - 1);
        this.gameStateManager.set('scholarships', currentScholarships);

        // Return to available players with free agent status
        player.contractStatus = 'free_agent';
        player.releasedDate = new Date().toISOString();
        
        const availablePlayers = state.availablePlayers || [];
        availablePlayers.push(player);
        this.gameStateManager.set('availablePlayers', availablePlayers);
        this.gameStateManager.saveGameState();

        if (this.dataSyncManager) {
            this.dataSyncManager.publishSyncEvent('playerReleased', {
                playerId: player.id,
                playerName: player.name,
                timestamp: Date.now()
            });
        }

        return {
            success: true,
            message: `已释放 ${player.name}，球员已进入自由市场`,
            scholarshipRecovered: 1
        };
    }
}

window.ContractManager = ContractManager;
