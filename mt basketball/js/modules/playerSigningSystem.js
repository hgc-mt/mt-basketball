/**
 * 球员签约系统
 * 实现真实的球员转会签约流程 - 基于奖学金等级制度
 * 
 * 核心功能：
 * 1. 球员预期奖学金等级计算（基于能力、潜力、年级等因素）
 * 2. 直接签约逻辑（提供足够高的奖学金等级时直接签约）
 * 3. 超级球星特殊签约规则
 * 4. 谈判流程管理
 * 
 * 奖学金等级：
 * - full: 全额奖学金 (100%) - 占用1.0份额
 * - major: 主要奖学金 (60%) - 占用0.6份额  
 * - partial: 部分奖学金 (35%) - 占用0.35份额
 * - minimal: 基础奖学金 (15%) - 占用0.15份额
 * - none: 无奖学金 (0%) - 不占用份额
 */

class PlayerSigningSystem {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        
        // 签约配置参数
        this.config = {
            // 直接签约条件：提供≥预期等级的奖学金，且兴趣度≥此阈值
            directSignInterestThreshold: 85,  // 兴趣度≥85%可直接签约
            
            // 超级球星判定标准
            superstarThreshold: 85,    // 能力值85+为超级球星
            
            // 超级球星签约难度
            superstarInterestThreshold: 95,  // 超级球星需要兴趣度≥95%才能签约
            superstarForceNegotiation: true,     // 超级球星强制进入谈判
            
            // 奖学金等级定义（与ScholarshipConfig保持一致）
            scholarshipLevels: {
                full: { name: '全额奖学金', percentage: 1.0, value: 1.0, minRating: 78 },
                major: { name: '主要奖学金', percentage: 0.6, value: 0.6, minRating: 70 },
                partial: { name: '部分奖学金', percentage: 0.35, value: 0.35, minRating: 60 },
                minimal: { name: '基础奖学金', percentage: 0.15, value: 0.15, minRating: 50 },
                none: { name: '无奖学金', percentage: 0, value: 0, minRating: 0 }
            },
            
            // 年级影响系数（年级越大，对奖学金要求越低）
            yearMultipliers: {
                1: 1.0,   // 大一：标准需求
                2: 0.9,   // 大二：需求降低10%
                3: 0.75,  // 大三：需求降低25%
                4: 0.5    // 大四：需求降低50%（急于找工作/打职业）
            },
            
            // 潜力影响系数
            potentialMultipliers: {
                elite: 1.2,      // 90+ 潜力：要求更高奖学金
                excellent: 1.1,  // 80-89 潜力
                good: 1.0,       // 70-79 潜力：标准
                normal: 0.8      // <70 潜力：要求较低
            }
        };
    }

    /**
     * 计算球员预期奖学金等级
     * @param {Object} player - 球员对象
     * @returns {Object} 预期奖学金信息
     */
    calculateExpectedScholarship(player) {
        const rating = player.rating || (player.getOverallRating ? player.getOverallRating() : 50);
        const potential = player.potential || 50;
        const year = player.year || 1;
        
        // 基础需求等级（基于能力值）
        let baseLevel = 'none';
        if (rating >= 78) baseLevel = 'full';
        else if (rating >= 70) baseLevel = 'major';
        else if (rating >= 60) baseLevel = 'partial';
        else if (rating >= 50) baseLevel = 'minimal';
        
        // 潜力加成
        let potentialLevel = 'normal';
        if (potential >= 90) potentialLevel = 'elite';
        else if (potential >= 80) potentialLevel = 'excellent';
        else if (potential >= 70) potentialLevel = 'good';
        
        const potentialMultiplier = this.config.potentialMultipliers[potentialLevel];
        
        // 年级加成（年级越大，需求越低）
        const yearMultiplier = this.config.yearMultipliers[year] || 1.0;
        
        // 计算预期奖学金等级（数值化）
        const levels = ['none', 'minimal', 'partial', 'major', 'full'];
        const levelValues = { none: 0, minimal: 0.15, partial: 0.35, major: 0.6, full: 1.0 };
        
        let expectedValue = levelValues[baseLevel] * potentialMultiplier * yearMultiplier;
        
        // 根据数值确定预期等级
        let expectedLevel = 'none';
        if (expectedValue >= 0.9) expectedLevel = 'full';
        else if (expectedValue >= 0.5) expectedLevel = 'major';
        else if (expectedValue >= 0.25) expectedLevel = 'partial';
        else if (expectedValue >= 0.08) expectedLevel = 'minimal';
        
        // 最低可接受等级（降一级）
        const minAcceptableLevel = this.getLowerScholarshipLevel(expectedLevel);
        
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
            baseLevel,
            expectedLevel,      // 预期奖学金等级
            expectedValue,      // 预期数值（0-1）
            minAcceptableLevel, // 最低可接受等级
            directSignInterestThreshold: isSuperstar 
                ? this.config.superstarInterestThreshold 
                : this.config.directSignInterestThreshold,
            forceNegotiation: isSuperstar && this.config.superstarForceNegotiation,
            // 兼容旧接口（用于signingInterface.js）
            expectedOffer: expectedValue,
            minAcceptable: levelValues[minAcceptableLevel],
            maxExpected: Math.min(1.0, expectedValue * 1.3),
            topOffer: 1.0,
            directSignThreshold: isSuperstar ? 1.5 : 1.2  // 用于显示，实际使用兴趣度阈值
        };
    }
    
    /**
     * 获取低一级的奖学金等级
     */
    getLowerScholarshipLevel(level) {
        const levels = ['full', 'major', 'partial', 'minimal', 'none'];
        const index = levels.indexOf(level);
        if (index === -1 || index >= levels.length - 1) return 'none';
        return levels[index + 1];
    }
    
    /**
     * 获取奖学金等级数值
     */
    getScholarshipValue(level) {
        const values = { none: 0, minimal: 0.15, partial: 0.35, major: 0.6, full: 1.0 };
        return values[level] || 0;
    }

    /**
     * 计算球员预期报价（兼容旧接口，调用 calculateExpectedScholarship）
     * @param {Object} player - 球员对象
     * @returns {Object} 预期报价信息
     */
    calculateExpectedOffer(player) {
        return this.calculateExpectedScholarship(player);
    }

    /**
     * 评估签约奖学金等级
     * @param {Object} player - 球员对象
     * @param {string} offeredLevel - 提供的奖学金等级 (full/major/partial/minimal/none)
     * @param {number} playerInterest - 球员对球队的兴趣度 (0-100)
     * @returns {Object} 评估结果
     */
    evaluateScholarshipOffer(player, offeredLevel, playerInterest = 0) {
        const offerInfo = this.calculateExpectedScholarship(player);
        const offeredValue = this.getScholarshipValue(offeredLevel);
        
        // 检查提供的奖学金是否满足预期
        const meetsExpectation = offeredValue >= offerInfo.expectedValue;
        const meetsMinimum = offeredValue >= this.getScholarshipValue(offerInfo.minAcceptableLevel);
        
        let result = {
            success: false,
            method: null,  // 'direct' | 'negotiation' | 'rejected'
            message: '',
            offerInfo,
            offeredLevel,
            offeredValue,
            playerInterest,
            meetsExpectation,
            playerReaction: ''
        };

        // 低于最低可接受等级
        if (!meetsMinimum) {
            result.method = 'rejected';
            result.message = `奖学金等级过低，球员期望至少${offerInfo.minAcceptableLevel}，但你只提供了${offeredLevel}`;
            result.playerReaction = this.getRejectionReaction('too_low', offerInfo.isSuperstar);
            return result;
        }

        // 超级球星特殊处理
        if (offerInfo.isSuperstar) {
            // 超级球星需要满足预期等级 + 高兴趣度
            if (!meetsExpectation || playerInterest < this.config.superstarInterestThreshold) {
                result.method = 'negotiation';
                result.message = '这是一位超级球星，需要提供满足期望的奖学金并且兴趣度达到95%以上';
                result.playerReaction = this.getSuperstarReaction('force_negotiation');
                return result;
            }
        }

        // 直接签约判断：满足预期等级 + 兴趣度达标
        if (meetsExpectation && playerInterest >= this.config.directSignInterestThreshold) {
            result.success = true;
            result.method = 'direct';
            result.message = `你提供了球员期望的${offeredLevel}奖学金，球员${offerInfo.isSuperstar ? '经过考虑后' : '欣然'}接受了你的offer！`;
            result.playerReaction = this.getAcceptanceReaction(1.0, offerInfo.isSuperstar);
            return result;
        }

        // 满足最低要求但未达预期，或兴趣度不够
        if (!meetsExpectation) {
            result.method = 'negotiation';
            result.message = `球员期望${offerInfo.expectedLevel}奖学金，但你只提供了${offeredLevel}，需要进一步谈判`;
            result.playerReaction = this.getNegotiationReaction(0.8, offerInfo);
        } else if (playerInterest < this.config.directSignInterestThreshold) {
            result.method = 'negotiation';
            result.message = `奖学金条件符合期望，但球员兴趣度(${playerInterest}%)还不够高，需要继续培养关系`;
            result.playerReaction = this.getNegotiationReaction(1.0, offerInfo);
        }
        
        return result;
    }
    
    /**
     * 评估签约报价（兼容旧接口，使用金额）
     * @deprecated 请使用 evaluateScholarshipOffer
     */
    evaluateOffer(player, offeredAmount) {
        // 将金额转换为等级（兼容旧代码）
        let offeredLevel = 'none';
        if (offeredAmount >= 0.9) offeredLevel = 'full';
        else if (offeredAmount >= 0.5) offeredLevel = 'major';
        else if (offeredAmount >= 0.25) offeredLevel = 'partial';
        else if (offeredAmount >= 0.08) offeredLevel = 'minimal';
        
        return this.evaluateScholarshipOffer(player, offeredLevel);
    }

    /**
     * 尝试直接签约（基于奖学金等级和兴趣度）
     * @param {Object} player - 球员对象
     * @param {string} offeredLevel - 提供的奖学金等级
     * @param {number} playerInterest - 球员兴趣度 (0-100)
     * @returns {Object} 签约结果
     */
    attemptDirectSigning(player, offeredLevel, playerInterest = 0) {
        const evaluation = this.evaluateScholarshipOffer(player, offeredLevel, playerInterest);
        
        if (evaluation.method === 'direct' && evaluation.success) {
            // 直接签约成功
            return {
                success: true,
                method: 'direct_signing',
                player: player,
                offeredLevel: offeredLevel,
                offeredValue: evaluation.offeredValue,
                playerInterest: playerInterest,
                message: evaluation.message,
                playerReaction: evaluation.playerReaction,
                timestamp: new Date().toISOString()
            };
        }
        
        return {
            success: false,
            method: evaluation.method,
            player: player,
            offeredLevel: offeredLevel,
            offeredValue: evaluation.offeredValue,
            playerInterest: playerInterest,
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
