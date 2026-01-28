/**
 * 跳过规则管理器
 * 管理球员签约跳过规则、报价模式和奖学金继承
 */

class SkipRuleManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.isSkipEnabled = true;
        this.currentQuoteMode = 'initial';
        this.minOfferPlayers = 13;
        this.probingNegotiations = new Map();
        this.scholarshipBalance = 0;
    }

    initialize() {
        this.loadScholarshipBalance();
        this.updateQuoteMode();
        console.log('跳过规则管理器初始化完成');
    }

    /**
     * 获取当前报价模式
     */
    getQuoteMode() {
        return this.currentQuoteMode;
    }

    /**
     * 更新报价模式
     * 根据奖学金余额和已用比例自动切换
     */
    updateQuoteMode() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        
        if (!userTeam) {
            this.currentQuoteMode = 'initial';
            return;
        }

        const totalScholarships = (userTeam.scholarships && typeof userTeam.scholarships === 'object') ? userTeam.scholarships.total : (userTeam.scholarships || 5);
        const usedScholarships = userTeam.roster?.length || 0;
        const availableScholarships = totalScholarships - usedScholarships;
        
        const usageRatio = usedScholarships / totalScholarships;

        if (usageRatio >= 0.8 || availableScholarships <= 2) {
            this.currentQuoteMode = 'cost_effective';
        } else {
            this.currentQuoteMode = 'initial';
        }

        console.log(`[报价模式] ${this.getQuoteModeName()} (可用名额: ${availableScholarships})`);
        return this.currentQuoteMode;
    }

    getQuoteModeName() {
        return this.currentQuoteMode === 'initial' ? '初始模式' : '资金不足模式';
    }

    /**
     * 生成初始报价
     * 根据报价模式和球员质量生成
     */
    generateInitialOffer(player, strategy = 'balanced') {
        const mode = this.getQuoteMode();
        const playerInfo = player.getInfo ? player.getInfo() : player;
        
        let scholarship, playingTime;
        const baseRating = playerInfo.overallRating || 70;
        const potential = playerInfo.potential || 70;
        
        if (mode === 'initial') {
            if (baseRating >= 80 || potential >= 85) {
                scholarship = 0.95;
                playingTime = 25;
            } else if (baseRating >= 75 || potential >= 80) {
                scholarship = 0.85;
                playingTime = 22;
            } else if (baseRating >= 70 || potential >= 75) {
                scholarship = 0.75;
                playingTime = 18;
            } else {
                scholarship = 0.65;
                playingTime = 15;
            }

            switch (strategy) {
                case 'aggressive':
                    scholarship = Math.min(1, scholarship + 0.1);
                    playingTime += 5;
                    break;
                case 'patient':
                    scholarship = Math.max(0.3, scholarship - 0.15);
                    playingTime = Math.max(10, playingTime - 5);
                    break;
                case 'relationship':
                    scholarship = Math.max(0.4, scholarship - 0.05);
                    break;
            }
        } else {
            const budget = this.calculateBudget();
            scholarship = Math.min(0.6, budget);
            playingTime = Math.max(10, 20 - (baseRating - 60));
            
            if (potential >= 80) {
                scholarship = Math.min(0.7, scholarship + 0.1);
            }
        }

        return {
            scholarship: Math.round(scholarship * 100) / 100,
            playingTime: Math.round(playingTime),
            salary: null,
            bonus: null
        };
    }

    /**
     * 计算当前预算
     */
    calculateBudget() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        
        if (!userTeam) return 0.5;

        const totalScholarships = (userTeam.scholarships && typeof userTeam.scholarships === 'object') ? userTeam.scholarships.total : (userTeam.scholarships || 5);
        const usedScholarships = userTeam.roster?.length || 0;
        const available = totalScholarships - usedScholarships;
        
        if (available <= 2) return 0.3;
        if (available <= 4) return 0.4;
        if (available <= 6) return 0.5;
        return 0.6;
    }

    /**
     * 检查是否可以跳过
     */
    canSkip() {
        if (!this.isSkipEnabled) {
            return { canSkip: false, reason: '跳过功能已禁用' };
        }

        const totalPlayers = this.getTotalPlayerCount();
        
        if (totalPlayers >= this.minOfferPlayers) {
            this.isSkipEnabled = false;
            return { 
                canSkip: false, 
                reason: `球员总数已达上限 (${totalPlayers}/${this.minOfferPlayers})，已禁用跳过功能` 
            };
        }

        return { canSkip: true, reason: '可以跳过' };
    }

    /**
     * 获取有效报价数量
     */
    getEffectiveOfferCount() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        
        if (!userTeam || !userTeam.offers) return 0;
        
        return userTeam.offers.filter(offer => {
            if (offer.status === 'rejected') return false;
            if (offer.status === 'accepted') return false;
            return true;
        }).length;
    }

    /**
     * 获取球员总数（已招募球员数量加上正在谈判的球员数量）
     */
    getTotalPlayerCount() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        
        if (!userTeam) return 0;

        // 已招募的球员数量
        const recruitedCount = userTeam.roster?.length || 0;
        
        // 正在谈判的球员数量
        const negotiatingCount = this.getNegotiatingPlayerCount();
        
        return recruitedCount + negotiatingCount;
    }

    /**
     * 获取正在谈判的球员数量
     */
    getNegotiatingPlayerCount() {
        const state = this.gameStateManager.getState();
        const negotiations = state.negotiations?.playerNegotiations || [];
        
        return negotiations.filter(n => {
            // 只计算活跃的谈判，不包括已完成、过期或跳过的谈判
            if (n.status === 'completed') return false;
            if (n.status === 'expired') return false;
            if (n.skipped) return false;
            return true;
        }).length;
    }

    /**
     * 手动触发跳过
     */
    skipNegotiation(targetId, type) {
        const checkResult = this.canSkip();
        
        if (!checkResult.canSkip) {
            console.log(`[跳过] 无法跳过: ${checkResult.reason}`);
            return { success: false, message: checkResult.reason };
        }

        const state = this.gameStateManager.getState();
        const negotiations = type === 'player' 
            ? state.negotiations?.playerNegotiations 
            : state.negotiations?.coachNegotiations;
        
        const negotiationIndex = negotiations?.findIndex(n => n.targetId === targetId);
        
        if (negotiationIndex === -1 || negotiationIndex === undefined) {
            return { success: false, message: '未找到该谈判' };
        }

        const negotiation = negotiations[negotiationIndex];
        
        const result = {
            success: true,
            skipped: {
                targetId: targetId,
                targetName: negotiation.targetName,
                type: type,
                scholarship: negotiation.offer?.scholarship,
                playingTime: negotiation.offer?.playingTime,
                timestamp: new Date().toISOString()
            },
            totalPlayers: this.getTotalPlayerCount()
        };

        if (negotiations[negotiationIndex]) {
            negotiations[negotiationIndex].skipped = true;
            negotiations[negotiationIndex].skippedAt = new Date().toISOString();
        }

        console.log(`[跳过] 已跳过与 ${negotiation.targetName} 的谈判`);
        this.checkSkipCondition();

        return result;
    }

    /**
     * 检查跳过条件
     * 当谈判中球员被其他球队签走时调用
     */
    checkPlayerSignedByOther(targetId, targetName) {
        console.log(`[跳过检查] 球员 ${targetName} 被其他球队签走`);
        
        const state = this.gameStateManager.getState();
        
        const playerNegotiations = state.negotiations?.playerNegotiations || [];
        const coachNegotiations = state.negotiations?.coachNegotiations || [];
        
        const negotiationIndex = playerNegotiations.findIndex(n => n.targetId === targetId);
        
        if (negotiationIndex !== -1) {
            if (playerNegotiations[negotiationIndex]) {
                playerNegotiations[negotiationIndex].status = 'expired';
                playerNegotiations[negotiationIndex].expiredReason = '被其他球队签走';
                playerNegotiations[negotiationIndex].expiredAt = new Date().toISOString();
            }
            
            console.log(`[跳过检查] 谈判已标记为过期: ${targetName}`);
        }

        this.checkSkipCondition();

        const totalPlayers = this.getTotalPlayerCount();
        
        return {
            processed: true,
            targetId: targetId,
            targetName: targetName,
            totalPlayersAfter: totalPlayers,
            skipEnabled: this.isSkipEnabled
        };
    }

    /**
     * 检查跳过功能状态
     * 根据球员总数自动启用/禁用
     */
    checkSkipCondition() {
        const totalPlayers = this.getTotalPlayerCount();
        
        const wasEnabled = this.isSkipEnabled;
        
        if (totalPlayers >= this.minOfferPlayers) {
            this.isSkipEnabled = false;
            console.log(`[跳过状态] 已禁用 (球员总数: ${totalPlayers}/${this.minOfferPlayers})`);
        } else {
            this.isSkipEnabled = true;
            if (!wasEnabled) {
                console.log(`[跳过状态] 已启用 (球员总数: ${totalPlayers}/${this.minOfferPlayers})`);
            }
        }

        return {
            isEnabled: this.isSkipEnabled,
            totalPlayers: totalPlayers,
            threshold: this.minOfferPlayers
        };
    }

    /**
     * 获取跳过功能状态
     */
    getSkipStatus() {
        const totalPlayers = this.getTotalPlayerCount();
        const recruitedCount = this.gameStateManager.getState().userTeam?.roster?.length || 0;
        const negotiatingCount = this.getNegotiatingPlayerCount();
        
        return {
            isEnabled: this.isSkipEnabled,
            totalPlayers: totalPlayers,
            recruitedCount: recruitedCount,
            negotiatingCount: negotiatingCount,
            threshold: this.minOfferPlayers,
            canSkip: this.isSkipEnabled && totalPlayers < this.minOfferPlayers,
            quoteMode: this.getQuoteModeName(),
            quoteModeKey: this.currentQuoteMode
        };
    }

    /**
     * 试探球员接受的最低奖学金金额
     */
    probeMinimumScholarship(playerId, type) {
        const state = this.gameStateManager.getState();
        const negotiations = type === 'player' 
            ? state.negotiations?.playerNegotiations 
            : state.negotiations?.coachNegotiations;
        
        const negotiation = negotiations?.find(n => n.targetId === playerId);
        
        if (!negotiation) {
            return { success: false, message: '未找到该谈判' };
        }

        const currentOffer = negotiation.offer;
        const baseRating = negotiation.targetRating || 70;
        const potential = negotiation.targetPotential || 70;

        let minimumScholarcraft = 0.4;
        
        if (baseRating >= 80 || potential >= 85) {
            minimumScholarcraft = 0.75;
        } else if (baseRating >= 75 || potential >= 80) {
            minimumScholarcraft = 0.65;
        } else if (baseRating >= 70 || potential >= 75) {
            minimumScholarcraft = 0.55;
        } else if (baseRating >= 65) {
            minimumScholarcraft = 0.45;
        }

        const playerNeeds = negotiation.targetNeeds || [];
        if (playerNeeds.includes('高潜力球员希望加入有竞争力的球队')) {
            minimumScholarcraft += 0.1;
        }
        if (playerNeeds.includes('高年级球员希望获得更多出场时间')) {
            minimumScholarcraft += 0.05;
        }

        const variance = (Math.random() - 0.5) * 0.1;
        minimumScholarcraft = Math.max(0.3, Math.min(0.95, minimumScholarcraft + variance));

        this.probingNegotiations.set(playerId, {
            minimumScholarcraft: minimumScholarcraft,
            probedAt: new Date().toISOString(),
            attempts: (this.probingNegotiations.get(playerId)?.attempts || 0) + 1
        });

        return {
            success: true,
            playerId: playerId,
            type: type,
            minimumScholarcraft: Math.round(minimumScholarcraft * 100) / 100,
            confidence: 'medium',
            message: `试探结果: 该球员可能接受 ${Math.round(minimumScholarcraft * 100)}% 以上的奖学金`
        };
    }

    /**
     * 获取试探结果
     */
    getProbingResult(playerId) {
        return this.probingNegotiations.get(playerId) || null;
    }

    /**
     * 根据试探结果调整报价
     */
    adjustOfferBasedOnProbing(negotiation, probeResult) {
        if (!probeResult) return negotiation.offer;

        const currentOffer = { ...negotiation.offer };
        const minimum = probeResult.minimumScholarcraft;
        
        if (currentOffer.scholarship < minimum) {
            currentOffer.scholarship = Math.round((minimum + 0.05) * 100) / 100;
            currentOffer.adjustedForMinimum = true;
            currentOffer.adjustmentNote = '根据试探结果调整至最低可接受金额';
        }

        return currentOffer;
    }

    /**
     * 获取谈判中球员列表（模拟结束后）
     */
    getActiveNegotiations(type) {
        const state = this.gameStateManager.getState();
        const negotiations = type === 'player' 
            ? state.negotiations?.playerNegotiations 
            : state.negotiations?.coachNegotiations;
        
        if (!negotiations) return [];

        return negotiations.filter(n => {
            if (n.status === 'completed') return false;
            if (n.status === 'expired' && n.expiredReason === '被其他球队签走') return false;
            if (n.skipped && !n.resumed) return false;
            return true;
        }).map(n => ({
            id: n.id,
            targetId: n.targetId,
            targetName: n.targetName,
            type: type,
            status: n.status,
            offer: n.offer,
            rounds: n.round,
            startedAt: n.startedAt,
            strategy: n.strategy
        }));
    }

    /**
     * 保存谈判中球员（模拟结束后）
     */
    saveActiveNegotiations() {
        const state = this.gameStateManager.getState();
        
        if (!state.savedNegotiations) {
            state.savedNegotiations = { players: [], coaches: [] };
        }

        state.savedNegotiations.players = this.getActiveNegotiations('player');
        state.savedNegotiations.coaches = this.getActiveNegotiations('coach');

        this.gameStateManager.saveGameState();
        
        console.log(`[保存谈判] 已保存 ${state.savedNegotiations.players.length} 个球员谈判`);
        
        return {
            players: state.savedNegotiations.players.length,
            coaches: state.savedNegotiations.coaches.length
        };
    }

    /**
     * 恢复谈判中球员（开始新赛季时）
     */
    restoreActiveNegotiations() {
        const state = this.gameStateManager.getState();
        
        if (!state.savedNegotiations) {
            return { restored: 0 };
        }

        const restored = {
            players: 0,
            coaches: 0
        };

        state.savedNegotiations.players.forEach(saved => {
            if (state.negotiations?.playerNegotiations) {
                const exists = state.negotiations.playerNegotiations.find(n => n.targetId === saved.targetId);
                if (!exists) {
                    state.negotiations.playerNegotiations.push({
                        ...saved,
                        status: 'paused',
                        pausedAt: new Date().toISOString(),
                        resumedAt: null
                    });
                    restored.players++;
                }
            }
        });

        state.savedNegotiations.coaches.forEach(saved => {
            if (state.negotiations?.coachNegotiations) {
                const exists = state.negotiations.coachNegotiations.find(n => n.targetId === saved.targetId);
                if (!exists) {
                    state.negotiations.coachNegotiations.push({
                        ...saved,
                        status: 'paused',
                        pausedAt: new Date().toISOString(),
                        resumedAt: null
                    });
                    restored.coaches++;
                }
            }
        });

        if (restored.players > 0 || restored.coaches > 0) {
            this.gameStateManager.saveGameState();
            console.log(`[恢复谈判] 已恢复 ${restored.players} 个球员谈判，${restored.coaches} 个教练谈判`);
        }

        return restored;
    }

    /**
     * 计算奖学金余额
     */
    calculateScholarshipBalance() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        
        if (!userTeam) return 0;

        const totalScholarships = (userTeam.scholarships && typeof userTeam.scholarships === 'object') ? userTeam.scholarships.total : (userTeam.scholarships || 5);
        const usedScholarships = userTeam.roster?.length || 0;
        
        this.scholarshipBalance = totalScholarships - usedScholarships;
        
        return this.scholarshipBalance;
    }

    /**
     * 加载保存的奖学金余额
     */
    loadScholarshipBalance() {
        const state = this.gameStateManager.getState();
        
        if (state.inheritedScholarshipBalance !== undefined) {
            this.scholarshipBalance = state.inheritedScholarshipBalance;
        } else {
            this.scholarshipBalance = 0;
        }
        
        return this.scholarshipBalance;
    }

    /**
     * 继承奖学金余额到下个赛季
     */
    inheritScholarshipBalance() {
        const balance = this.calculateScholarshipBalance();
        
        const state = this.gameStateManager.getState();
        
        state.inheritedScholarshipBalance = balance;
        
        const message = balance > 0 
            ? `✅ 奖学金余额已结转: ${balance} 个名额将延续至下赛季`
            : `ℹ️ 本赛季奖学金已用完，无结转余额`;
        
        console.log(`[奖学金继承] 结转 ${balance} 个名额至下赛季`);
        
        return {
            inherited: balance,
            message: message
        };
    }

    /**
     * 应用继承的奖学金余额
     */
    applyInheritedBalance() {
        const inherited = this.loadScholarshipBalance();
        
        if (inherited <= 0) return { applied: 0 };

        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        
        if (!userTeam) return { applied: 0 };

        // 处理新的奖学金结构
        let originalScholarships;
        if (userTeam.scholarships && typeof userTeam.scholarships === 'object') {
            originalScholarships = userTeam.scholarships.total || 5;
            userTeam.scholarships.total = originalScholarships + inherited;
        } else {
            originalScholarships = userTeam.scholarships || 15;
            userTeam.scholarships = originalScholarships + inherited;
        }

        state.inheritedScholarshipBalance = 0;
        this.scholarshipBalance = 0;

        const result = {
            applied: inherited,
            newTotal: userTeam.scholarships,
            message: `已应用上赛季结转的 ${inherited} 个奖学金名额`
        };

        console.log(`[应用继承] 奖学金总额从 ${originalScholarships} 增加到 ${userTeam.scholarships}`);
        
        return result;
    }

    /**
     * 获取奖学金统计
     */
    getScholarshipStats() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        
        if (!userTeam) {
            return {
                total: 5,
                used: 0,
                available: 5,
                balance: 0,
                inherited: 0
            };
        }

        let total;
        if (userTeam.scholarships && typeof userTeam.scholarships === 'object') {
            total = userTeam.scholarships.total || 5;
        } else {
            total = userTeam.scholarships || 5;
        }
        const used = userTeam.roster?.length || 0;
        const available = total - used;
        const inherited = state.inheritedScholarshipBalance || 0;

        return {
            total: total,
            used: used,
            available: available,
            balance: this.scholarshipBalance,
            inherited: inherited
        };
    }

    /**
     * 生成报价摘要
     */
    getOfferSummary() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        
        if (!userTeam || !userTeam.offers) {
            return {
                total: 0,
                pending: 0,
                accepted: 0,
                rejected: 0
            };
        }

        const offers = userTeam.offers;
        
        return {
            total: offers.length,
            pending: offers.filter(o => o.status === 'pending').length,
            accepted: offers.filter(o => o.status === 'accepted').length,
            rejected: offers.filter(o => o.status === 'rejected').length
        };
    }

    /**
     * 批量跳过低优先级谈判
     */
    batchSkipLowPriority(count = 5) {
        const checkResult = this.canSkip();
        
        if (!checkResult.canSkip) {
            return { success: false, message: checkResult.reason };
        }

        const state = this.gameStateManager.getState();
        const negotiations = state.negotiations?.playerNegotiations || [];
        
        const lowPriority = negotiations
            .filter(n => {
                if (n.status !== 'active') return false;
                if (n.skipped) return false;
                const rating = n.targetRating || 70;
                const potential = n.targetPotential || 70;
                return rating < 75 && potential < 80;
            })
            .slice(0, count);

        if (lowPriority.length === 0) {
            return { success: false, message: '没有找到低优先级谈判可以跳过' };
        }

        const skipped = [];
        
        lowPriority.forEach(n => {
            const result = this.skipNegotiation(n.targetId, 'player');
            if (result.success) {
                skipped.push(result.skipped);
            }
        });

        return {
            success: true,
            skipped: skipped.length,
            skippedDetails: skipped,
            totalPlayers: this.getTotalPlayerCount()
        };
    }

    /**
     * 重置跳过规则
     */
    reset() {
        this.isSkipEnabled = true;
        this.currentQuoteMode = 'initial';
        this.probingNegotiations.clear();
        this.scholarshipBalance = 0;
        
        console.log('跳过规则已重置');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SkipRuleManager };
}

if (typeof window !== 'undefined') {
    window.SkipRuleManager = SkipRuleManager;
}
