/**
 * Negotiation Manager Adapter
 * 谈判管理接口适配器
 */

class NegotiationManagerAdapter {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.interfaceName = 'INegotiationManager';
        this.version = '1.0.0';
    }

    /**
     * 开始谈判
     * @param {number} targetId - 目标ID
     * @param {string} targetType - 目标类型(player/coach)
     * @param {Object} initialOffer - 初始报价
     * @returns {Object} 谈判结果
     */
    startNegotiation(targetId, targetType, initialOffer) {
        if (!targetId) {
            return {
                success: false,
                error: 'TARGET_NOT_FOUND',
                message: '目标ID不能为空'
            };
        }

        if (!targetType || !['player', 'coach'].includes(targetType)) {
            return {
                success: false,
                error: 'INVALID_TARGET_TYPE',
                message: '目标类型必须是player或coach'
            };
        }

        if (!initialOffer) {
            return {
                success: false,
                error: 'INVALID_OFFER',
                message: '初始报价不能为空'
            };
        }

        try {
            const state = this.gameStateManager.getState();
            
            // 检查是否已有谈判
            const existingNegotiation = this.findExistingNegotiation(targetId, targetType);
            if (existingNegotiation) {
                return {
                    success: false,
                    error: 'NEGOTIATION_EXISTS',
                    message: '该目标已在谈判中',
                    existingNegotiationId: existingNegotiation.id
                };
            }

            // 获取目标对象
            const target = this.getTarget(targetId, targetType);
            if (!target) {
                return {
                    success: false,
                    error: 'TARGET_NOT_FOUND',
                    message: `未找到${targetType === 'player' ? '球员' : '教练'}: ${targetId}`
                };
            }

            // 创建谈判
            const negotiationId = Date.now();
            const negotiation = {
                id: negotiationId,
                targetId: targetId,
                targetType: targetType,
                targetName: target.name,
                offer: initialOffer,
                status: 'active',
                round: 1,
                startedAt: new Date().toISOString(),
                acceptanceProbability: this.calculateInitialProbability(target, initialOffer, targetType)
            };

            // 保存谈判
            this.saveNegotiation(negotiation, targetType);

            return {
                success: true,
                negotiationId: negotiationId,
                negotiation: negotiation,
                message: `已开始与${target.name}的谈判`,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: 'NEGOTIATION_FAILED',
                message: `开始谈判失败: ${error.message}`
            };
        }
    }

    /**
     * 更新报价
     * @param {number} negotiationId - 谈判ID
     * @param {Object} newOffer - 新报价
     * @returns {Object} 更新结果
     */
    updateOffer(negotiationId, newOffer) {
        if (!negotiationId) {
            return {
                success: false,
                error: 'NEGOTIATION_NOT_FOUND',
                message: '谈判ID不能为空'
            };
        }

        if (!newOffer) {
            return {
                success: false,
                error: 'INVALID_OFFER',
                message: '新报价不能为空'
            };
        }

        try {
            const negotiation = this.findNegotiationById(negotiationId);
            if (!negotiation) {
                return {
                    success: false,
                    error: 'NEGOTIATION_NOT_FOUND',
                    message: '谈判不存在'
                };
            }

            // 验证奖学金可用性
            if (negotiation.targetType === 'player') {
                const state = this.gameStateManager.getState();
                if (state.userTeam) {
                    const availableShare = state.userTeam.getAvailableScholarshipShare 
                        ? state.userTeam.getAvailableScholarshipShare() 
                        : 0;
                    
                    const currentShare = negotiation.offer.scholarship || 0;
                    const newShare = newOffer.scholarship || 0;
                    const increase = newShare - currentShare;
                    
                    if (increase > availableShare) {
                        return {
                            success: false,
                            error: 'INSUFFICIENT_SCHOLARSHIP',
                            message: `奖学金份额不足 (需要 ${increase.toFixed(2)}，可用 ${availableShare.toFixed(2)})`
                        };
                    }
                }
            }

            // 更新报价
            negotiation.offer = newOffer;
            negotiation.round++;
            negotiation.updatedAt = new Date().toISOString();

            // 重新计算接受概率
            const target = this.getTarget(negotiation.targetId, negotiation.targetType);
            if (target) {
                negotiation.acceptanceProbability = this.calculateUpdatedProbability(
                    target, 
                    newOffer, 
                    negotiation.targetType,
                    negotiation.round
                );
            }

            // 保存谈判
            this.updateNegotiationInState(negotiation);

            return {
                success: true,
                negotiation: negotiation,
                acceptanceProbability: negotiation.acceptanceProbability,
                message: `报价已更新，当前接受概率: ${negotiation.acceptanceProbability}%`,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: 'UPDATE_FAILED',
                message: `更新报价失败: ${error.message}`
            };
        }
    }

    /**
     * 完成谈判
     * @param {number} negotiationId - 谈判ID
     * @param {boolean} accept - 是否接受
     * @returns {Object} 完成结果
     */
    completeNegotiation(negotiationId, accept) {
        if (!negotiationId) {
            return {
                success: false,
                error: 'NEGOTIATION_NOT_FOUND',
                message: '谈判ID不能为空'
            };
        }

        try {
            const negotiation = this.findNegotiationById(negotiationId);
            if (!negotiation) {
                return {
                    success: false,
                    error: 'NEGOTIATION_NOT_FOUND',
                    message: '谈判不存在'
                };
            }

            if (!accept) {
                // 拒绝谈判
                negotiation.status = 'rejected';
                negotiation.endedAt = new Date().toISOString();
                this.updateNegotiationInState(negotiation);

                return {
                    success: true,
                    message: '谈判已取消',
                    negotiation: negotiation,
                    timestamp: new Date().toISOString()
                };
            }

            // 接受谈判
            const state = this.gameStateManager.getState();
            
            if (negotiation.targetType === 'player') {
                // 签约球员
                const playerIndex = state.availablePlayers.findIndex(p => p.id === negotiation.targetId);
                if (playerIndex === -1) {
                    return {
                        success: false,
                        error: 'TARGET_NOT_FOUND',
                        message: '球员不存在'
                    };
                }

                const player = state.availablePlayers[playerIndex];
                player.scholarship = negotiation.offer.scholarship;
                player.playingTimeGuarantee = negotiation.offer.playingTime;

                state.availablePlayers.splice(playerIndex, 1);

                if (state.userTeam) {
                    const added = state.userTeam.addPlayer(player);
                    if (!added) {
                        return {
                            success: false,
                            error: 'SIGN_FAILED',
                            message: '签约失败，可能奖学金份额不足'
                        };
                    }
                }

                negotiation.status = 'completed';
                negotiation.endedAt = new Date().toISOString();
                this.updateNegotiationInState(negotiation);

                return {
                    success: true,
                    signedTarget: player,
                    message: `成功签约球员 ${player.name}`,
                    scholarshipPercent: player.scholarship,
                    timestamp: new Date().toISOString()
                };
            } else {
                // 签约教练
                const coachIndex = state.availableCoaches.findIndex(c => c.id === negotiation.targetId);
                if (coachIndex === -1) {
                    return {
                        success: false,
                        error: 'TARGET_NOT_FOUND',
                        message: '教练不存在'
                    };
                }

                const coach = state.availableCoaches[coachIndex];
                coach.salary = negotiation.offer.salary;
                coach.bonus = negotiation.offer.bonus || 0;

                state.availableCoaches.splice(coachIndex, 1);
                state.userCoach = coach;

                negotiation.status = 'completed';
                negotiation.endedAt = new Date().toISOString();
                this.updateNegotiationInState(negotiation);

                return {
                    success: true,
                    signedTarget: coach,
                    message: `成功签约教练 ${coach.name}`,
                    salary: coach.salary,
                    timestamp: new Date().toISOString()
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'SIGN_FAILED',
                message: `签约失败: ${error.message}`
            };
        }
    }

    /**
     * 计算初始接受概率
     * @param {Object} target - 目标对象
     * @param {Object} offer - 报价
     * @param {string} targetType - 目标类型
     * @returns {number} 接受概率
     */
    calculateInitialProbability(target, offer, targetType) {
        let probability = 50;

        if (targetType === 'player') {
            probability += (offer.scholarship - 0.5) * 40;
            probability += (offer.playingTime - 20) * 0.5;

            const signingDifficulty = target.signingDifficulty || 0.5;
            probability -= signingDifficulty * 30;

            if (target.potential >= 80) probability -= 10;
            if (target.year === 4) probability -= 5;
        } else {
            const marketRate = 500000;
            probability += ((offer.salary - marketRate) / marketRate) * 20;
        }

        return Math.max(5, Math.min(95, Math.round(probability)));
    }

    /**
     * 计算更新后的接受概率
     * @param {Object} target - 目标对象
     * @param {Object} offer - 报价
     * @param {string} targetType - 目标类型
     * @param {number} round - 轮次
     * @returns {number} 接受概率
     */
    calculateUpdatedProbability(target, offer, targetType, round) {
        let probability = this.calculateInitialProbability(target, offer, targetType);
        
        // 轮次加成
        probability += round * 2;
        
        return Math.max(5, Math.min(95, probability));
    }

    /**
     * 查找现有谈判
     * @param {number} targetId - 目标ID
     * @param {string} targetType - 目标类型
     * @returns {Object} 谈判对象
     */
    findExistingNegotiation(targetId, targetType) {
        const state = this.gameStateManager.getState();
        const negotiations = targetType === 'player' 
            ? state.negotiations?.playerNegotiations 
            : state.negotiations?.coachNegotiations;
        
        if (!negotiations) return null;
        
        return negotiations.find(n => n.targetId === targetId && n.status === 'active');
    }

    /**
     * 根据ID查找谈判
     * @param {number} negotiationId - 谈判ID
     * @returns {Object} 谈判对象
     */
    findNegotiationById(negotiationId) {
        const state = this.gameStateManager.getState();
        const allNegotiations = [
            ...(state.negotiations?.playerNegotiations || []),
            ...(state.negotiations?.coachNegotiations || [])
        ];
        
        return allNegotiations.find(n => n.id === negotiationId);
    }

    /**
     * 获取目标对象
     * @param {number} targetId - 目标ID
     * @param {string} targetType - 目标类型
     * @returns {Object} 目标对象
     */
    getTarget(targetId, targetType) {
        const state = this.gameStateManager.getState();
        
        if (targetType === 'player') {
            return state.availablePlayers?.find(p => p.id === targetId);
        } else {
            return state.availableCoaches?.find(c => c.id === targetId);
        }
    }

    /**
     * 保存谈判
     * @param {Object} negotiation - 谈判对象
     * @param {string} targetType - 目标类型
     */
    saveNegotiation(negotiation, targetType) {
        const state = this.gameStateManager.getState();
        
        if (!state.negotiations) {
            state.negotiations = {
                playerNegotiations: [],
                coachNegotiations: []
            };
        }

        if (targetType === 'player') {
            state.negotiations.playerNegotiations.push(negotiation);
        } else {
            state.negotiations.coachNegotiations.push(negotiation);
        }

        this.gameStateManager.saveGameState();
    }

    /**
     * 更新谈判状态
     * @param {Object} negotiation - 谈判对象
     */
    updateNegotiationInState(negotiation) {
        const state = this.gameStateManager.getState();
        
        if (!state.negotiations) return;

        const negotiations = negotiation.targetType === 'player' 
            ? state.negotiations.playerNegotiations 
            : state.negotiations.coachNegotiations;
        
        const index = negotiations.findIndex(n => n.id === negotiation.id);
        if (index !== -1) {
            negotiations[index] = negotiation;
            this.gameStateManager.saveGameState();
        }
    }

    /**
     * 获取接口名称
     * @returns {string} 接口名称
     */
    getName() {
        return this.interfaceName;
    }

    /**
     * 获取接口版本
     * @returns {string} 接口版本
     */
    getVersion() {
        return this.version;
    }

    /**
     * 验证接口实现
     * @returns {boolean} 是否有效
     */
    validate() {
        const requiredMethods = [
            'startNegotiation',
            'updateOffer',
            'completeNegotiation'
        ];

        for (const method of requiredMethods) {
            if (typeof this[method] !== 'function') {
                console.error(`接口缺少必需方法: ${method}`);
                return false;
            }
        }

        return true;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NegotiationManagerAdapter;
}