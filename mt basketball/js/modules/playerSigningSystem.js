/**
 * 球员签约系统
 * 实现真实的球员转会签约流程
 * 
 * 核心功能：
 * 1. 球员预期报价计算（基于能力、潜力、年级等因素）
 * 2. 直接签约逻辑（报价远超预期时直接签约）
 * 3. 超级球星特殊签约规则
 * 4. 谈判流程管理
 */

class PlayerSigningSystem {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        
        // 签约配置参数
        this.config = {
            // 直接签约阈值（报价超过预期的百分比）
            directSignThreshold: 1.5,  // 150% 预期价格可直接签约
            
            // 超级球星判定标准
            superstarThreshold: 85,    // 能力值85+为超级球星
            
            // 超级球星签约难度
            superstarDirectSignThreshold: 2.0,  // 超级球星需要200%报价才能直接签约
            superstarForceNegotiation: true,     // 超级球星强制进入谈判
            
            // 顶价设定（系统最高报价限制）
            maxOfferMultiplier: 2.5,   // 最高报价为预期的250%
            
            // 年级影响系数
            yearMultipliers: {
                1: 1.0,   // 大一
                2: 1.2,   // 大二
                3: 1.5,   // 大三
                4: 1.8    // 大四
            },
            
            // 潜力影响系数
            potentialMultipliers: {
                elite: 1.5,      // 90+ 潜力
                excellent: 1.3,  // 80-89 潜力
                good: 1.1,       // 70-79 潜力
                normal: 1.0      // <70 潜力
            }
        };
    }

    /**
     * 计算球员预期报价
     * @param {Object} player - 球员对象
     * @returns {Object} 预期报价信息
     */
    calculateExpectedOffer(player) {
        const rating = player.rating || (player.getOverallRating ? player.getOverallRating() : 50);
        const potential = player.potential || 50;
        const year = player.year || 1;
        
        // 基础报价（基于能力值）
        let baseOffer = rating * 1000;
        
        // 潜力加成
        let potentialLevel = 'normal';
        if (potential >= 90) potentialLevel = 'elite';
        else if (potential >= 80) potentialLevel = 'excellent';
        else if (potential >= 70) potentialLevel = 'good';
        
        const potentialMultiplier = this.config.potentialMultipliers[potentialLevel];
        
        // 年级加成
        const yearMultiplier = this.config.yearMultipliers[year] || 1.0;
        
        // 计算预期报价范围
        const expectedOffer = Math.round(baseOffer * potentialMultiplier * yearMultiplier);
        const minAcceptable = Math.round(expectedOffer * 0.7);  // 最低可接受报价 70%
        const maxExpected = Math.round(expectedOffer * 1.3);    // 最高预期 130%
        const topOffer = Math.round(expectedOffer * this.config.maxOfferMultiplier);  // 顶价
        
        // 判断是否超级球星
        const isSuperstar = rating >= this.config.superstarThreshold;
        
        // 签约难度评级
        let difficultyLevel = 'normal';
        if (isSuperstar) difficultyLevel = 'superstar';
        else if (potential >= 85) difficultyLevel = 'hard';
        else if (potential >= 75) difficultyLevel = 'medium';
        
        return {
            playerId: player.id,
            playerName: player.name,
            rating,
            potential,
            year,
            isSuperstar,
            potentialLevel,
            difficultyLevel,
            baseOffer,
            expectedOffer,      // 预期报价
            minAcceptable,      // 最低可接受
            maxExpected,        // 最高预期
            topOffer,           // 系统顶价
            directSignThreshold: isSuperstar 
                ? this.config.superstarDirectSignThreshold 
                : this.config.directSignThreshold,
            forceNegotiation: isSuperstar && this.config.superstarForceNegotiation
        };
    }

    /**
     * 评估签约报价
     * @param {Object} player - 球员对象
     * @param {number} offeredAmount - 报价金额
     * @returns {Object} 评估结果
     */
    evaluateOffer(player, offeredAmount) {
        const offerInfo = this.calculateExpectedOffer(player);
        const ratio = offeredAmount / offerInfo.expectedOffer;
        
        let result = {
            success: false,
            method: null,  // 'direct' | 'negotiation' | 'rejected'
            message: '',
            offerInfo,
            offeredAmount,
            ratio,
            playerReaction: ''
        };

        // 低于最低可接受报价
        if (offeredAmount < offerInfo.minAcceptable) {
            result.method = 'rejected';
            result.message = '报价过低，球员直接拒绝了你的报价';
            result.playerReaction = this.getRejectionReaction('too_low', offerInfo.isSuperstar);
            return result;
        }

        // 超级球星特殊处理
        if (offerInfo.isSuperstar) {
            if (offerInfo.forceNegotiation && ratio < offerInfo.directSignThreshold) {
                // 超级球星强制谈判
                result.method = 'negotiation';
                result.message = '这是一位超级球星，需要通过谈判才能签约';
                result.playerReaction = this.getSuperstarReaction('force_negotiation');
                return result;
            }
        }

        // 直接签约判断
        if (ratio >= offerInfo.directSignThreshold) {
            result.success = true;
            result.method = 'direct';
            result.message = `报价极具诚意！球员${offerInfo.isSuperstar ? '经过考虑后' : '欣然'}接受了你的报价`;
            result.playerReaction = this.getAcceptanceReaction(ratio, offerInfo.isSuperstar);
            return result;
        }

        // 进入谈判流程
        result.method = 'negotiation';
        result.message = '球员对你的报价感兴趣，希望进一步谈判';
        result.playerReaction = this.getNegotiationReaction(ratio, offerInfo);
        
        return result;
    }

    /**
     * 尝试直接签约
     * @param {Object} player - 球员对象
     * @param {number} offeredAmount - 报价金额
     * @returns {Object} 签约结果
     */
    attemptDirectSigning(player, offeredAmount) {
        const evaluation = this.evaluateOffer(player, offeredAmount);
        
        if (evaluation.method === 'direct' && evaluation.success) {
            // 直接签约成功
            return {
                success: true,
                method: 'direct_signing',
                player: player,
                offeredAmount: offeredAmount,
                message: evaluation.message,
                playerReaction: evaluation.playerReaction,
                timestamp: new Date().toISOString()
            };
        }
        
        return {
            success: false,
            method: evaluation.method,
            player: player,
            offeredAmount: offeredAmount,
            message: evaluation.message,
            playerReaction: evaluation.playerReaction,
            offerInfo: evaluation.offerInfo,
            requiresNegotiation: evaluation.method === 'negotiation'
        };
    }

    /**
     * 获取球员拒绝反应
     */
    getRejectionReaction(type, isSuperstar) {
        const reactions = {
            too_low: [
                '这个报价是在羞辱我吗？',
                '请尊重我的价值',
                '看来你们并不真正了解我',
                '我需要更好的报价',
                '这远远不够'
            ]
        };
        
        const list = reactions[type] || reactions.too_low;
        return list[Math.floor(Math.random() * list.length)];
    }

    /**
     * 获取球员接受反应
     */
    getAcceptanceReaction(ratio, isSuperstar) {
        if (ratio >= 2.0) {
            return '这个报价太令人心动了！我接受！';
        } else if (ratio >= 1.5) {
            return isSuperstar 
                ? '你们的诚意打动了我，我愿意加入'
                : '非常好的报价，我很乐意加入你们！';
        } else {
            return '这个报价很合理，我接受。';
        }
    }

    /**
     * 获取超级球星特殊反应
     */
    getSuperstarReaction(type) {
        const reactions = {
            force_negotiation: [
                '作为顶级球员，我需要更多时间考虑',
                '我想了解更多关于球队的未来规划',
                '让我们坐下来好好谈谈细节',
                '我需要和团队商量一下',
                '这个决定很重要，我们需要进一步沟通'
            ]
        };
        
        const list = reactions[type] || reactions.force_negotiation;
        return list[Math.floor(Math.random() * list.length)];
    }

    /**
     * 获取谈判反应
     */
    getNegotiationReaction(ratio, offerInfo) {
        if (ratio >= 1.2) {
            return '报价不错，但还有一些细节需要讨论';
        } else if (ratio >= 1.0) {
            return '报价接近我的预期，我们可以谈谈';
        } else if (ratio >= 0.8) {
            return '报价偏低，但我愿意听听你们的想法';
        } else {
            return '报价还有很大提升空间';
        }
    }

    /**
     * 获取签约建议
     * @param {Object} player - 球员对象
     * @returns {Object} 签约建议
     */
    getSigningAdvice(player) {
        const offerInfo = this.calculateExpectedOffer(player);
        
        let advice = '';
        let recommendedOffer = offerInfo.expectedOffer;
        let strategy = '';
        
        if (offerInfo.isSuperstar) {
            advice = '这是一位超级球星，签约难度很高。建议准备充足预算，并做好长期谈判的准备。';
            recommendedOffer = offerInfo.expectedOffer * 1.8;
            strategy = 'superstar';
        } else if (offerInfo.potentialLevel === 'elite') {
            advice = '该球员潜力极高，预计会有多支球队竞争。建议提供有竞争力的报价。';
            recommendedOffer = offerInfo.expectedOffer * 1.4;
            strategy = 'high_potential';
        } else if (offerInfo.potentialLevel === 'excellent') {
            advice = '该球员潜力不错，值得投资。提供合理报价即可。';
            recommendedOffer = offerInfo.expectedOffer * 1.2;
            strategy = 'good_potential';
        } else {
            advice = '普通球员，可根据球队需求决定是否签约。';
            recommendedOffer = offerInfo.expectedOffer;
            strategy = 'normal';
        }
        
        return {
            advice,
            recommendedOffer: Math.round(recommendedOffer),
            strategy,
            offerInfo
        };
    }

    /**
     * 批量评估多个球员的签约可能性
     * @param {Array} players - 球员数组
     * @returns {Array} 评估结果
     */
    batchEvaluatePlayers(players) {
        return players.map(player => {
            const offerInfo = this.calculateExpectedOffer(player);
            return {
                player,
                offerInfo,
                signingDifficulty: this.calculateSigningDifficulty(offerInfo)
            };
        }).sort((a, b) => b.offerInfo.rating - a.offerInfo.rating);
    }

    /**
     * 计算签约难度
     */
    calculateSigningDifficulty(offerInfo) {
        let difficulty = 0;
        
        // 能力值难度
        difficulty += offerInfo.rating * 0.5;
        
        // 潜力难度
        if (offerInfo.potentialLevel === 'elite') difficulty += 30;
        else if (offerInfo.potentialLevel === 'excellent') difficulty += 20;
        else if (offerInfo.potentialLevel === 'good') difficulty += 10;
        
        // 超级球星加成
        if (offerInfo.isSuperstar) difficulty += 50;
        
        // 年级加成
        difficulty += (offerInfo.year - 1) * 10;
        
        return Math.min(100, difficulty);
    }

    /**
     * 获取签约系统配置
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * 更新签约系统配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}

// 全局导出
if (typeof window !== 'undefined') {
    window.PlayerSigningSystem = PlayerSigningSystem;
}

// ES6 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayerSigningSystem;
}
