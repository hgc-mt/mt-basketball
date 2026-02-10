/**
 * 球员谈判管理器
 * 处理球员签约谈判的完整流程，包括合同条款展示、谈判进度跟踪等
 */

class NegotiationManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.isInitialized = false;
        
        this.negotiations = [];
        this.negotiationHistory = [];
        
        this.rejectionReasons = [
            '家太远，想留在家乡附近',
            '不是心仪的学校，没有归属感',
            '已经有更合适的选择',
            '对球队发展前景存疑',
            '伤病史让我担忧',
            '教练风格与我不合',
            '球队文化与我价值观不符',
            '想要更多的出场时间',
            '薪资待遇未达到预期',
            '家庭原因需要就近照顾'
        ];
        
        this.acceptanceFactors = {
            scholarship: 0.4,
            playingTime: 0.25,
            teamSuccess: 0.2,
            coachQuality: 0.15
        };
    }

    async initialize() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        this.loadNegotiationHistory();
        console.log('Negotiation Manager initialized');
    }

    loadNegotiationHistory() {
        const state = this.gameStateManager.getState();
        if (state.negotiationHistory) {
            this.negotiationHistory = state.negotiationHistory;
        }
        if (state.activeNegotiations) {
            this.negotiations = state.activeNegotiations;
        }
    }

    saveNegotiationHistory() {
        this.gameStateManager.set('negotiationHistory', this.negotiationHistory);
        this.gameStateManager.saveGameState();
    }

    startNegotiation(playerId, initialOffer = null) {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        const availablePlayers = state.availablePlayers;

        console.log('startNegotiation called:', { playerId, availablePlayersCount: availablePlayers?.length });
        
        // 首先检查球员是否已经在球队中
        const playerInTeam = userTeam?.roster?.find(p => p.id == playerId || p.id === playerId);
        if (playerInTeam) {
            this.showNotification(`${playerInTeam.name} 已经在您的球队中`, 'warning');
            return null;
        }
        
        // 处理类型不匹配问题
        const player = availablePlayers?.find(p => p.id == playerId || p.id === playerId);
        if (!player) {
            this.showNotification('找不到该球员，可能已被签约', 'error');
            console.error('Player not found:', { playerId, availableIds: availablePlayers?.slice(0, 5).map(p => p.id) });
            return null;
        }

        const existingNegotiation = this.getActiveNegotiation(playerId);
        if (existingNegotiation) {
            this.showNotification('该球员正在谈判中', 'warning');
            return existingNegotiation;
        }

        const scholarship = initialOffer || this.calculateRecommendedScholarship(player);
        const playingTime = 20 + Math.floor(Math.random() * 15);
        
        const currentOffer = {
            scholarship: scholarship,
            playingTime: playingTime,
            guaranteed: true,
            redShirt: false
        };
        
        const negotiation = {
            id: this.generateNegotiationId(),
            playerId: playerId,
            playerName: player.name,
            playerPosition: player.position,
            playerYear: player.year,
            playerRating: player.getOverallRating ? player.getOverallRating() : (player.rating || 50),
            playerPotential: player.potential,
            
            teamId: userTeam.id,
            teamName: userTeam.name,
            
            status: 'active',
            round: 0,
            maxRounds: 5,
            
            offer: { ...currentOffer },
            
            playerResponse: null,
            acceptanceProbability: this.calculateAcceptanceProbability(player, scholarship, playingTime),
            
            startedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            
            history: [{
                round: 0,
                action: 'started',
                offer: { ...currentOffer },
                timestamp: new Date().toISOString()
            }]
        };

        this.negotiations.push(negotiation);
        this.saveNegotiations();
        
        this.showNotification(`已向 ${player.name} 发起签约谈判`, 'success');
        
        return negotiation;
    }

    calculateRecommendedScholarship(player) {
        // 优先使用玩家的scholarshipRequirement（已由Player类根据新系统计算）
        if (player.scholarshipRequirement) {
            const req = player.scholarshipRequirement;
            // 返回推荐值，考虑一定浮动
            if (req.flexible) {
                const variance = (req.max - req.min) * 0.2; // 降低浮动范围
                const recommended = req.preferred + (Math.random() * variance * 2 - variance);
                // 将结果映射到最近的奖学金等级
                return this.mapToScholarshipLevel(Math.max(req.min, Math.min(req.max, Math.round(recommended * 100) / 100)));
            } else {
                return this.mapToScholarshipLevel(req.preferred);
            }
        }
        
        // 如果没有scholarshipRequirement，使用新的5级系统计算
        const rating = player.getOverallRating ? player.getOverallRating() : (player.rating || 50);
        const potential = player.potential || 60;
        const maxVal = Math.max(rating, potential);
        
        // 直接映射到5级奖学金系统
        if (maxVal >= 80) return 1.0;      // 全额
        if (maxVal >= 72) return 0.6;      // 主要
        if (maxVal >= 65) return 0.35;     // 部分
        if (maxVal >= 58) return 0.15;     // 基础
        return 0;                           // 无奖学金
    }
    
    /**
     * 将任意奖学金值映射到标准5级
     * @param {number} value - 原始值
     * @returns {number} 标准等级值
     */
    mapToScholarshipLevel(value) {
        // 5级奖学金标准值
        const levels = [0, 0.15, 0.35, 0.6, 1.0];
        
        // 找到最近的等级
        let closest = levels[0];
        let minDiff = Math.abs(value - levels[0]);
        
        for (const level of levels) {
            const diff = Math.abs(value - level);
            if (diff < minDiff) {
                minDiff = diff;
                closest = level;
            }
        }
        
        return closest;
    }

    calculateAcceptanceProbability(player, scholarship, playingTime) {
        // 处理从localStorage加载的普通对象（没有getOverallRating方法）
        const rating = player.getOverallRating ? player.getOverallRating() : (player.rating || 50);
        const potential = player.potential || 60;
        const year = player.year || 1;
        
        // 基础接受概率
        let probability = 40;
        
        // 根据奖学金要求计算
        if (player.scholarshipRequirement) {
            const req = player.scholarshipRequirement;
            
            // 低于最低要求 - 几乎不可能接受
            if (scholarship < req.min) {
                probability -= 50;
            } 
            // 达到或超过最高期望 - 大幅提升概率
            else if (scholarship >= req.max) {
                probability += 30;
            } 
            // 在可接受范围内
            else {
                const range = req.max - req.min;
                const position = range > 0 ? (scholarship - req.min) / range : 0;
                // 线性插值：在范围内概率从-20到+15
                probability += position * 35 - 20;
            }
            
            // 达到或超过期望值 - 额外加成
            if (scholarship >= req.preferred) {
                probability += 15;
            }
        } else {
            // 没有明确要求时的默认逻辑
            // 映射到5级系统评估
            const maxVal = Math.max(rating, potential);
            let expectedLevel = 0;
            if (maxVal >= 80) expectedLevel = 1.0;
            else if (maxVal >= 72) expectedLevel = 0.6;
            else if (maxVal >= 65) expectedLevel = 0.35;
            else if (maxVal >= 58) expectedLevel = 0.15;
            
            if (scholarship >= expectedLevel) {
                probability += 20;
            } else {
                probability -= 20;
            }
        }
        
        // 能力值影响（能力越高越挑剔）
        if (rating >= 80) {
            probability -= 10; // 明星球员更挑剔
        } else if (rating >= 70) {
            probability -= 5;
        } else if (rating <= 55) {
            probability += 10; // 普通球员更容易满足
        }
        
        // 年级影响
        if (year === 1) {
            probability += 8;  // 新生更看重发展机会
        } else if (year === 2) {
            probability += 3;
        } else if (year === 4) {
            probability -= 10; // 大四学生更现实，但也更挑剔
        }
        
        // 出场时间承诺影响
        if (playingTime >= 30) {
            probability += 15; // 承诺主力位置
        } else if (playingTime >= 20) {
            probability += 5;  // 承诺轮换位置
        } else if (playingTime < 10) {
            probability -= 15; // 出场时间太少
        }
        
        // 确保概率在合理范围内（5%-95%）
        probability = Math.max(5, Math.min(95, probability));
        
        return Math.round(probability);
    }

    makeOffer(negotiationId, newOffer) {
        const negotiation = this.getNegotiation(negotiationId);
        if (!negotiation || negotiation.status !== 'active') {
            this.showNotification('谈判已结束或不存在', 'error');
            return null;
        }

        negotiation.round++;
        negotiation.offer = { ...newOffer };
        negotiation.lastUpdated = new Date().toISOString();
        
        const player = this.getPlayer(negotiation.playerId);
        
        // 如果是第一次报价（round=0），则计算初始成功率
        // 如果是后续谈判，降低成功概率，使谈判更加困难
        if (negotiation.round === 1) {
            negotiation.acceptanceProbability = this.calculateAcceptanceProbability(
                player, 
                newOffer.scholarship, 
                newOffer.playingTime
            );
        } else {
            // 后续谈判降低成功率，增加谈判回合
            negotiation.acceptanceProbability = Math.max(20, negotiation.acceptanceProbability - 15);
        }

        // 第一次提交报价时有一定概率成功，后续谈判基本不会直接成功
        const roll = Math.random() * 100;
        const success = (negotiation.round === 1) && (roll < negotiation.acceptanceProbability);

        if (success) {
            negotiation.status = 'accepted';
            negotiation.playerResponse = {
                type: 'accepted',
                message: this.getAcceptanceMessage(),
                conditions: { ...newOffer }
            };
            
            this.signPlayer(negotiation);
            this.showNotification(`🎉 签约成功！${player.name} 已加入球队！`, 'success');
            
            // 关闭弹窗
            this.closeNegotiationModal();
            
            // 刷新招募界面
            if (typeof window.recruitmentInterface !== 'undefined') {
                window.recruitmentInterface.loadPlayers();
                window.recruitmentInterface.renderPlayerCards();
                window.recruitmentInterface.renderNegotiationList();
                window.recruitmentInterface.updateAllTabCounts();
            }
        } else {
            if (negotiation.round >= negotiation.maxRounds) {
                negotiation.status = 'failed';
                negotiation.playerResponse = {
                    type: 'max_rounds',
                    message: '谈判次数已用完，未能达成协议'
                };
                this.showNotification('谈判失败：谈判次数已用完', 'error');
            } else {
                // 生成还价
                const counterOffer = this.generateCounterOffer(negotiation);
                negotiation.playerResponse = {
                    type: 'rejected',
                    message: this.getRejectionMessage(),
                    counterOffer: counterOffer
                };
                // 还价存储在playerResponse中，同时更新当前offer为还价
                negotiation.offer = counterOffer;
                this.showNotification('球员拒绝了报价并提出了还价', 'warning');
            }
        }

        negotiation.history.push({
            round: negotiation.round,
            action: success ? 'accepted' : (negotiation.status === 'failed' ? 'failed' : 'countered'),
            offer: { ...newOffer },
            response: negotiation.playerResponse,
            timestamp: new Date().toISOString()
        });

        this.saveNegotiations();
        this.addToHistory(negotiation);
        
        // 返回结果对象
        return {
            success: success,
            negotiation: negotiation,
            message: success ? '签约成功' : (negotiation.status === 'failed' ? '谈判失败' : '球员提出还价'),
            status: negotiation.status
        };
    }

    getAcceptanceMessage() {
        const messages = [
            '很高兴能加入球队！我已经迫不及待想要开始训练了。',
            '感谢球队给我这个机会，我一定不会辜负大家的期望。',
            '我接受这份合同，让我们一起为球队创造辉煌！',
            '期待与队友们合作，我们会是一支伟大的队伍。',
            '这笔签约对双方都是正确的选择，我会全力以赴。'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    getRejectionMessage() {
        const reason = this.rejectionReasons[Math.floor(Math.random() * this.rejectionReasons.length)];
        return `很抱歉，我暂时无法接受这份合同。${reason}。`;
    }

    generateCounterOffer(negotiation) {
        const currentOffer = negotiation.offer;
        
        const scholarshipIncrease = currentOffer.scholarship < 1.0 ? 0.1 : 0;
        const playingTimeIncrease = currentOffer.playingTime < 35 ? 5 : 0;
        
        return {
            scholarship: Math.min(1.0, currentOffer.scholarship + scholarshipIncrease),
            playingTime: Math.min(40, currentOffer.playingTime + playingTimeIncrease),
            guaranteed: true,
            redShirt: false
        };
    }

    acceptCounterOffer(negotiationId) {
        const negotiation = this.getNegotiation(negotiationId);
        if (!negotiation || negotiation.status !== 'active' || !negotiation.playerResponse?.counterOffer) {
            return null;
        }

        negotiation.offer = negotiation.playerResponse.counterOffer;
        negotiation.status = 'accepted';
        negotiation.playerResponse = {
            type: 'accepted',
            message: '经过协商，我们达成了共识！',
            conditions: { ...negotiation.offer }
        };

        negotiation.history.push({
            round: negotiation.round,
            action: 'accepted_counter',
            offer: { ...negotiation.offer },
            timestamp: new Date().toISOString()
        });

        this.signPlayer(negotiation);
        this.saveNegotiations();
        this.addToHistory(negotiation);
        
        // 关闭弹窗
        this.closeNegotiationModal();
        
        // 刷新招募界面
        if (typeof window.recruitmentInterface !== 'undefined') {
            window.recruitmentInterface.loadPlayers();
            window.recruitmentInterface.renderPlayerCards();
            window.recruitmentInterface.renderNegotiationList();
            window.recruitmentInterface.updateAllTabCounts();
        }
        
        return negotiation;
    }

    withdrawNegotiation(negotiationId) {
        const negotiation = this.getNegotiation(negotiationId);
        if (!negotiation) return false;

        negotiation.status = 'withdrawn';
        negotiation.lastUpdated = new Date().toISOString();
        
        negotiation.history.push({
            round: negotiation.round,
            action: 'withdrawn',
            timestamp: new Date().toISOString()
        });

        this.addToHistory(negotiation);
        this.saveNegotiations();
        
        this.showNotification('已取消谈判', 'info');
        
        // 刷新招募界面的谈判列表
        if (typeof window.recruitmentInterface !== 'undefined') {
            window.recruitmentInterface.renderNegotiationList();
            window.recruitmentInterface.updateAllTabCounts();
        }
        
        return true;
    }

    signPlayer(negotiation) {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        const availablePlayers = state.availablePlayers;

        const playerIndex = availablePlayers.findIndex(p => p.id === negotiation.playerId);
        if (playerIndex === -1) return false;

        const player = availablePlayers[playerIndex];
        // 设置球员的奖学金比例（如0.2表示20%）
        player.scholarship = negotiation.offer.scholarship;
        player.playingTimeGuarantee = negotiation.offer.playingTime;
        player.guaranteed = negotiation.offer.guaranteed;

        availablePlayers.splice(playerIndex, 1);
        
        if (userTeam.addPlayer(player)) {
            this.gameStateManager.set('availablePlayers', [...availablePlayers]);
            this.showNotification(`成功签约球员 ${player.name}！`, 'success');
            
            this.gameStateManager.saveGameState();
            
            // 刷新招募界面的所有列表
            if (typeof window.recruitmentInterface !== 'undefined') {
                window.recruitmentInterface.loadPlayers();
                window.recruitmentInterface.renderPlayerCards();
                window.recruitmentInterface.renderNegotiationList();
                window.recruitmentInterface.renderSignedPlayerList();
                window.recruitmentInterface.updateAllTabCounts();
            }
            
            return true;
        }

        return false;
    }

    /**
     * 刷新招募界面
     */
    refreshRecruitmentInterface() {
        if (typeof window.recruitmentInterface !== 'undefined' && window.recruitmentInterface) {
            window.recruitmentInterface.loadPlayers();
            window.recruitmentInterface.renderPlayerCards();
            window.recruitmentInterface.renderNegotiationList();
            window.recruitmentInterface.updateAllTabCounts();
            console.log('Recruitment interface refreshed');
        } else {
            console.warn('recruitmentInterface not available');
        }
    }

    /**
     * 立即签约球员（不需要谈判）
     */
    immediateSignPlayer(playerId, offer) {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        const availablePlayers = state.availablePlayers;

        const playerIndex = availablePlayers.findIndex(p => p.id == playerId || p.id === playerId);
        if (playerIndex === -1) {
            this.showNotification('找不到该球员', 'error');
            return false;
        }

        const player = availablePlayers[playerIndex];
        
        // 检查是否有奖学金名额
        const rosterSize = userTeam?.roster?.length || 0;
        const maxRoster = 13;
        if (rosterSize >= maxRoster) {
            this.showNotification('没有可用的奖学金名额了！', 'error');
            return false;
        }

        // 直接签约
        // 设置球员的奖学金比例（如0.2表示20%）
        player.scholarship = offer.scholarship;
        player.playingTimeGuarantee = offer.playingTime;
        player.guaranteed = offer.guaranteed;
        player.redShirt = offer.redShirt;

        availablePlayers.splice(playerIndex, 1);
        
        if (userTeam.addPlayer(player)) {
            this.gameStateManager.set('availablePlayers', [...availablePlayers]);
            this.showNotification(`🎉 签约成功！${player.name} 已加入球队！`, 'success');
            this.gameStateManager.saveGameState();
            
            // 关闭modal
            this.closeNegotiationModal();
            
            // 刷新招募界面的所有列表
            if (typeof window.recruitmentInterface !== 'undefined') {
                window.recruitmentInterface.loadPlayers();
                window.recruitmentInterface.renderPlayerCards();
                window.recruitmentInterface.renderNegotiationList();
                window.recruitmentInterface.renderSignedPlayerList();
                window.recruitmentInterface.updateAllTabCounts();
            }
            
            return true;
        } else {
            this.showNotification('签约失败，请重试', 'error');
            return false;
        }
    }

    getNegotiation(negotiationId) {
        return this.negotiations.find(n => n.id === negotiationId);
    }

    getActiveNegotiation(playerId) {
        return this.negotiations.find(n => n.playerId === playerId && n.status === 'active');
    }

    getAllActiveNegotiations() {
        return this.negotiations.filter(n => n.status === 'active');
    }

    getNegotiationsByStatus(status) {
        return this.negotiations.filter(n => n.status === status);
    }

    addToHistory(negotiation) {
        this.negotiationHistory.push({
            id: negotiation.id,
            playerId: negotiation.playerId,
            playerName: negotiation.playerName,
            teamId: negotiation.teamId,
            status: negotiation.status,
            finalOffer: { ...negotiation.offer },
            rounds: negotiation.round,
            startedAt: negotiation.startedAt,
            endedAt: new Date().toISOString()
        });

        if (this.negotiationHistory.length > 100) {
            this.negotiationHistory = this.negotiationHistory.slice(-100);
        }

        this.saveNegotiationHistory();
    }

    saveNegotiations() {
        this.gameStateManager.set('activeNegotiations', this.negotiations);
        this.gameStateManager.saveGameState();
    }

    generateNegotiationId() {
        return 'neg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getPlayer(playerId) {
        const state = this.gameStateManager.getState();
        
        // 首先尝试从availablePlayers查找
        let player = state.availablePlayers?.find(p => p.id == playerId || p.id === playerId);
        
        // 如果找不到，尝试从球队阵容查找（已签约的球员）
        if (!player && state.userTeam?.roster) {
            player = state.userTeam.roster.find(p => p.id == playerId || p.id === playerId);
        }
        
        // 如果还是找不到，尝试从谈判数据中重建球员信息
        if (!player) {
            const negotiation = this.negotiations.find(n => n.playerId == playerId || n.playerId === playerId);
            if (negotiation) {
                player = {
                    id: negotiation.playerId,
                    name: negotiation.playerName,
                    position: negotiation.playerPosition,
                    year: negotiation.playerYear,
                    rating: negotiation.playerRating,
                    potential: negotiation.playerPotential,
                    getOverallRating: () => negotiation.playerRating
                };
            }
        }
        
        return player;
    }

    showNotification(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    sendNegotiationMessage(negotiationId, message) {
        const negotiation = this.getNegotiation(negotiationId);
        if (!negotiation || negotiation.status !== 'active') {
            this.showNotification('谈判已结束，无法发送消息', 'error');
            return false;
        }

        negotiation.history.push({
            round: negotiation.round,
            action: 'message_sent',
            message: message,
            timestamp: new Date().toISOString()
        });

        negotiation.lastUpdated = new Date().toISOString();

        this.showNotification('消息已发送给球员', 'success');
        this.saveNegotiations();
        
        // 刷新界面
        if (typeof window.recruitmentInterface !== 'undefined') {
            window.recruitmentInterface.renderNegotiationList();
        }
        this.refreshNegotiationInterface(negotiation.playerId);

        return true;
    }

    refreshNegotiationInterface() {
        if (typeof window.recruitmentInterface !== 'undefined' && window.recruitmentInterface) {
            window.recruitmentInterface.renderNegotiationList();
            window.recruitmentInterface.updateAllTabCounts();
        }
    }

    getNegotiationDetails(negotiationId) {
        const negotiation = this.getNegotiation(negotiationId);
        if (!negotiation) return null;

        const player = this.getPlayer(negotiation.playerId);
        
        return {
            ...negotiation,
            player: player ? {
                name: player.name,
                position: player.position,
                age: player.age,
                year: player.year,
                rating: player.getOverallRating ? player.getOverallRating() : (player.rating || 50),
                potential: player.potential,
                attributes: player.attributes
            } : null,
            acceptanceBar: this.createAcceptanceBar(negotiation.acceptanceProbability),
            historyHtml: this.formatHistoryHtml(negotiation.history)
        };
    }

    createAcceptanceBar(probability) {
        const width = Math.min(100, Math.max(0, probability));
        const color = probability >= 70 ? '#4ade80' : (probability >= 40 ? '#fbbf24' : '#ef4444');
        
        return `
            <div class="acceptance-bar-container">
                <div class="acceptance-bar-label">
                    <span>签约成功率</span>
                    <span>${probability}%</span>
                </div>
                <div class="acceptance-bar">
                    <div class="acceptance-bar-fill" style="width: ${width}%; background: ${color};"></div>
                </div>
            </div>
        `;
    }

    formatHistoryHtml(history) {
        if (!history || history.length === 0) return '<p>暂无谈判记录</p>';

        return history.map((entry, index) => `
            <div class="history-entry ${index === history.length - 1 ? 'latest' : ''}">
                <div class="history-round">第 ${entry.round} 轮</div>
                <div class="history-action">${this.getActionLabel(entry.action)}</div>
                <div class="history-timestamp">${this.formatTimestamp(entry.timestamp)}</div>
                ${entry.offer ? `
                    <div class="history-offer">
                        报价: ${Math.round(entry.offer.scholarship * 100)}%奖学金, ${entry.offer.playingTime}分钟
                    </div>
                ` : ''}
                ${entry.response ? `
                    <div class="history-response">${entry.response.message}</div>
                ` : ''}
            </div>
        `).join('');
    }

    getActionLabel(action) {
        const labels = {
            'started': '开始谈判',
            'offered': '提出报价',
            'accepted': '接受报价',
            'rejected': '拒绝报价',
            'countered': '还价',
            'accepted_counter': '接受还价',
            'failed': '谈判失败',
            'withdrawn': '取消谈判'
        };
        return labels[action] || action;
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN');
    }

    createNegotiationInterface(player, negotiation = null) {
        const isNew = !negotiation;
        const currentOffer = negotiation?.offer || {
            scholarship: this.calculateRecommendedScholarship(player),
            playingTime: 25,
            guaranteed: true,
            redShirt: false
        };
        
        const acceptanceProb = negotiation?.acceptanceProbability || 
                              this.calculateAcceptanceProbability(player, currentOffer.scholarship, currentOffer.playingTime);

        return `
            <div class="negotiation-interface">
                <div class="negotiation-header">
                    <div class="player-brief">
                        <h3>${player.name}</h3>
                        <div class="player-tags">
                            <span class="tag position">${Positions[player.position]}</span>
                            <span class="tag year">${this.getYearLabel(player.year)}</span>
                            <span class="tag rating">能力值: ${player.getOverallRating ? player.getOverallRating() : (player.rating || 50)}</span>
                            <span class="tag potential">潜力: ${player.potential}</span>
                        </div>
                    </div>
                    ${this.createAcceptanceBar(acceptanceProb)}
                </div>

                <div class="negotiation-form">
                    <div class="form-section">
                        <h4>合同条款</h4>
                        
                        <div class="form-group">
                            <label>奖学金比例</label>
                            <div class="slider-container">
                                <input type="range" id="scholarship-slider" 
                                    min="25" max="100" value="${Math.round(currentOffer.scholarship * 100)}"
                                    ${!isNew ? 'disabled' : ''}>
                                <span id="scholarship-value">${Math.round(currentOffer.scholarship * 100)}%</span>
                            </div>
                            <div class="slider-labels">
                                <span>25%</span>
                                <span>50%</span>
                                <span>75%</span>
                                <span>100%</span>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>出场时间保障</label>
                            <div class="slider-container">
                                <input type="range" id="playingtime-slider" 
                                    min="0" max="40" value="${currentOffer.playingTime}"
                                    ${!isNew ? 'disabled' : ''}>
                                <span id="playingtime-value">${currentOffer.playingTime}分钟</span>
                            </div>
                            <div class="slider-labels">
                                <span>0</span>
                                <span>10</span>
                                <span>20</span>
                                <span>30</span>
                                <span>40</span>
                            </div>
                        </div>

                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" id="guaranteed-checkbox" 
                                    ${currentOffer.guaranteed ? 'checked' : ''}
                                    ${!isNew ? 'disabled' : ''}>
                                <span>保障合同</span>
                            </label>
                            <label>
                                <input type="checkbox" id="redshirt-checkbox" 
                                    ${currentOffer.redShirt ? 'checked' : ''}
                                    ${!isNew ? 'disabled' : ''}>
                                <span>红衫军资格</span>
                            </label>
                        </div>
                    </div>

                    ${negotiation?.playerResponse ? `
                        <div class="player-response">
                            <h4>球员回复</h4>
                            <div class="response-message">${negotiation.playerResponse.message}</div>
                            ${negotiation.playerResponse.counterOffer ? `
                                <div class="counter-offer">
                                    <strong>球员还价：</strong>
                                    奖学金 ${Math.round(negotiation.playerResponse.counterOffer.scholarship * 100)}%, 
                                    出场 ${negotiation.playerResponse.counterOffer.playingTime}分钟
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    <div class="negotiation-actions">
                        ${isNew ? `
                            <button class="btn btn-primary" id="submit-offer">提交报价</button>
                            <button class="btn btn-success" id="immediate-sign">立即签约</button>
                        ` : negotiation?.status === 'active' ? `
                            <button class="btn btn-primary" id="submit-counter">还价</button>
                            <button class="btn btn-success" id="accept-counter">接受还价</button>
                            <button class="btn btn-warning" id="withdraw-negotiation">取消谈判</button>
                        ` : ''}
                    </div>
                </div>

                ${negotiation ? this.formatHistoryHtml(negotiation.history) : ''}
            </div>
        `;
    }

    getYearLabel(year) {
        const labels = { 1: '大一', 2: '大二', 3: '大三', 4: '大四' };
        return labels[year] || '未知';
    }

    setupNegotiationEvents(negotiationId, playerId) {
        const scholarshipSlider = document.getElementById('scholarship-slider');
        const playingTimeSlider = document.getElementById('playingtime-slider');
        const scholarshipValue = document.getElementById('scholarship-value');
        const playingTimeValue = document.getElementById('playingtime-value');

        if (scholarshipSlider) {
            scholarshipSlider.addEventListener('input', (e) => {
                scholarshipValue.textContent = e.target.value + '%';
            });
        }

        if (playingTimeSlider) {
            playingTimeSlider.addEventListener('input', (e) => {
                playingTimeValue.textContent = e.target.value + '分钟';
            });
        }

        const submitOffer = document.getElementById('submit-offer');
        const submitCounter = document.getElementById('submit-counter');
        const acceptCounter = document.getElementById('accept-counter');
        const withdraw = document.getElementById('withdraw-negotiation');

        if (submitOffer) {
            submitOffer.addEventListener('click', () => {
                const offer = this.getOfferFromForm();
                // 检查是否已有谈判
                const existingNegotiation = this.getActiveNegotiation(playerId);
                if (existingNegotiation) {
                    // 有进行中的谈判，使用还价
                    this.makeOffer(existingNegotiation.id, offer);
                    this.refreshNegotiationInterface(playerId);
                } else {
                    // 没有谈判，发起新谈判
                    this.startNegotiation(playerId, offer.scholarship);
                    this.refreshNegotiationInterface(playerId);
                }
            });
        }

        // 立即签约按钮
        const immediateSign = document.getElementById('immediate-sign');
        if (immediateSign) {
            immediateSign.addEventListener('click', () => {
                const offer = this.getOfferFromForm();
                this.immediateSignPlayer(playerId, offer);
            });
        }

        if (submitCounter) {
            submitCounter.addEventListener('click', () => {
                const offer = this.getOfferFromForm();
                this.makeOffer(negotiationId, offer);
                this.refreshNegotiationInterface(playerId);
            });
        }

        if (acceptCounter) {
            acceptCounter.addEventListener('click', () => {
                const result = this.acceptCounterOffer(negotiationId);
                if (result) {
                    // 刷新招募界面的谈判列表
                    if (typeof window.recruitmentInterface !== 'undefined') {
                        window.recruitmentInterface.renderNegotiationList();
                        window.recruitmentInterface.updateAllTabCounts();
                    }
                    // 刷新当前谈判界面
                    this.refreshNegotiationInterface(playerId);
                }
            });
        }

        if (withdraw) {
            withdraw.addEventListener('click', () => {
                this.withdrawNegotiation(negotiationId);
                this.closeNegotiationModal();
            });
        }
    }

    getOfferFromForm() {
        const scholarshipSlider = document.getElementById('scholarship-slider');
        const playingTimeSlider = document.getElementById('playingtime-slider');
        const guaranteed = document.getElementById('guaranteed-checkbox');
        const redshirt = document.getElementById('redshirt-checkbox');

        return {
            scholarship: (scholarshipSlider ? parseInt(scholarshipSlider.value) : 50) / 100,
            playingTime: playingTimeSlider ? parseInt(playingTimeSlider.value) : 25,
            guaranteed: guaranteed?.checked ?? true,
            redShirt: redshirt?.checked ?? false
        };
    }

    refreshNegotiationInterface(playerId) {
        const negotiation = this.getActiveNegotiation(playerId);
        const player = this.getPlayer(playerId);
        
        if (!player) return;

        const interfaceHtml = this.createNegotiationInterface(player, negotiation);
        const container = document.getElementById('negotiation-interface-container');
        
        if (container) {
            container.innerHTML = interfaceHtml;
            
            // 重新绑定事件监听器
            const newNegotiation = this.getActiveNegotiation(playerId);
            if (newNegotiation) {
                this.setupNegotiationEvents(newNegotiation.id, playerId);
            }
        }
    }

    closeNegotiationModal() {
        const modal = document.getElementById('player-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    getNegotiationSummary() {
        const active = this.getAllActiveNegotiations();
        const recent = this.negotiationHistory.slice(-10);

        return {
            activeCount: active.length,
            activeNegotiations: active.map(n => ({
                id: n.id,
                playerName: n.playerName,
                round: n.round,
                acceptanceProb: n.acceptanceProbability
            })),
            recentHistory: recent
        };
    }
}

if (typeof window !== 'undefined') {
    window.NegotiationManager = NegotiationManager;
}
