/**
 * 球员成长系统 - 改进版
 * 实现科学的潜力值转化机制、培养系统和转会逻辑
 */

class PlayerGrowthSystem {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        
        // 潜力值转化配置
        this.growthConfig = {
            // 每年潜力值转化为能力值的比例
            conversionRate: {
                1: 0.15,  // 大一：15%的潜力差值转化为能力值
                2: 0.20,  // 大二：20%
                3: 0.25,  // 大三：25%
                4: 0.30   // 大四：30%（最后冲刺）
            },
            
            // 培养效率（基于球队资源投入）
            trainingEfficiency: {
                minimal: 0.5,    // 最低投入：50%效率
                low: 0.75,       // 低投入：75%效率
                normal: 1.0,     // 正常投入：100%效率
                high: 1.25,      // 高投入：125%效率
                maximum: 1.5     // 最大投入：150%效率
            },
            
            // 天赋对成长的影响
            talentBonus: {
                '得分天赋': { scoring: 2, shooting: 1 },
                '防守天赋': { defense: 2, stealing: 1 },
                '篮板天赋': { rebounding: 2, strength: 1 },
                '速度天赋': { speed: 2, stamina: 1 },
                '传球天赋': { passing: 2, basketballIQ: 1 },
                '投篮天赋': { shooting: 2, threePoint: 1 },
                '身体天赋': { strength: 2, stamina: 1 },
                '篮球智商': { basketballIQ: 2, passing: 1 }
            },
            
            // 随机波动范围
            randomFactor: 0.1  // ±10%随机波动
        };
        
        // 潜力值衰减配置（模拟年龄和上限）
        this.potentialDecay = {
            // 每年未使用潜力值的保留比例
            retentionRate: {
                1: 0.95,  // 大一保留95%
                2: 0.90,  // 大二保留90%
                3: 0.85,  // 大三保留85%
                4: 0.80   // 大四保留80%
            },
            
            // 潜力值上限（防止无限增长）
            maxPotential: {
                1: 95,
                2: 92,
                3: 88,
                4: 85
            }
        };
        
        // 转会系统配置
        this.transferConfig = {
            // 触发转会的条件
            triggerConditions: {
                // 培养资源不足
                lowTraining: {
                    consecutiveYears: 2,  // 连续2年培养资源不足
                    minDissatisfaction: 60  // 不满意度阈值
                },
                // 出场时间不足
                lowPlayingTime: {
                    consecutiveYears: 2,
                    minDissatisfaction: 70
                },
                // 球队战绩不佳
                poorTeamPerformance: {
                    consecutiveYears: 2,
                    maxWinRate: 0.3  // 胜率低于30%
                }
            },
            
            // 转会后能力值调整
            transferPenalty: {
                ratingDrop: 3,  // 能力值下降3点
                adaptationPeriod: 1  // 适应期1年
            },
            
            // 转会后成长加成（新环境刺激）
            transferBonus: {
                firstYear: 2,  // 第一年额外成长
                motivationBoost: 0.15  // 动机提升15%
            }
        };
    }

    /**
     * 计算球员年度成长
     * @param {Player} player - 球员对象
     * @param {string} trainingLevel - 培养级别（minimal/low/normal/high/maximum）
     * @param {number} playingTime - 出场时间比例（0-1）
     * @returns {Object} 成长结果
     */
    calculateYearlyGrowth(player, trainingLevel = 'normal', playingTime = 0.5) {
        const year = player.year;
        const currentRating = player.rating;
        const currentPotential = player.potential;
        
        // 1. 计算潜力差值
        const potentialGap = currentPotential - currentRating;
        
        if (potentialGap <= 0) {
            // 潜力已耗尽，只能维持或微小提升
            return this.calculateMaintenanceGrowth(player, trainingLevel);
        }
        
        // 2. 基础转化率
        const baseConversionRate = this.growthConfig.conversionRate[year];
        
        // 3. 培养效率
        const trainingEfficiency = this.growthConfig.trainingEfficiency[trainingLevel];
        
        // 4. 出场时间影响（出场时间越多，成长越快）
        const playingTimeBonus = playingTime * 0.2;  // 最多+20%
        
        // 5. 天赋加成
        const talentBonus = this.calculateTalentBonus(player);
        
        // 6. 随机因素
        const randomFactor = 1 + (Math.random() * 2 - 1) * this.growthConfig.randomFactor;
        
        // 7. 计算实际成长值
        const growthMultiplier = baseConversionRate * trainingEfficiency * (1 + playingTimeBonus) * randomFactor;
        let ratingIncrease = potentialGap * growthMultiplier + talentBonus;
        
        // 8. 限制成长幅度（防止过度成长）
        const maxGrowth = {
            1: 8,   // 大一最多+8
            2: 10,  // 大二最多+10
            3: 8,   // 大三最多+8
            4: 6    // 大四最多+6
        };
        ratingIncrease = Math.min(ratingIncrease, maxGrowth[year]);
        ratingIncrease = Math.max(0, ratingIncrease);  // 不能负增长
        
        // 9. 更新属性
        const newRating = Math.min(95, Math.round(currentRating + ratingIncrease));
        const attributesGrowth = this.distributeAttributeGrowth(player, ratingIncrease);
        
        // 10. 更新潜力值（未使用潜力的衰减）
        const retentionRate = this.potentialDecay.retentionRate[year];
        const unusedPotential = currentPotential - newRating;
        const newPotential = Math.round(newRating + unusedPotential * retentionRate);
        
        return {
            oldRating: currentRating,
            newRating: newRating,
            ratingIncrease: Math.round(ratingIncrease * 10) / 10,
            oldPotential: currentPotential,
            newPotential: newPotential,
            potentialDecrease: currentPotential - newPotential,
            attributesGrowth: attributesGrowth,
            trainingLevel: trainingLevel,
            playingTime: playingTime
        };
    }

    /**
     * 计算维持性成长（潜力已耗尽）
     */
    calculateMaintenanceGrowth(player, trainingLevel) {
        const trainingEfficiency = this.growthConfig.trainingEfficiency[trainingLevel];
        const talentBonus = this.calculateTalentBonus(player) * 0.5;  // 天赋加成减半
        
        // 维持性成长很小（0-2点）
        let ratingIncrease = (Math.random() * 2) * trainingEfficiency + talentBonus;
        ratingIncrease = Math.min(2, ratingIncrease);
        
        const newRating = Math.min(95, Math.round(player.rating + ratingIncrease));
        
        return {
            oldRating: player.rating,
            newRating: newRating,
            ratingIncrease: Math.round(ratingIncrease * 10) / 10,
            oldPotential: player.potential,
            newPotential: player.potential,  // 潜力不变
            potentialDecrease: 0,
            attributesGrowth: this.distributeAttributeGrowth(player, ratingIncrease),
            trainingLevel: trainingLevel,
            playingTime: 0.5,
            maintenanceMode: true  // 标记为维护模式
        };
    }

    /**
     * 计算天赋加成
     */
    calculateTalentBonus(player) {
        let bonus = 0;
        if (player.talents && player.talents.length > 0) {
            player.talents.forEach(talent => {
                if (this.growthConfig.talentBonus[talent.name]) {
                    bonus += 0.5;  // 每个天赋+0.5能力值
                }
            });
        }
        return bonus;
    }

    /**
     * 分配属性成长
     */
    distributeAttributeGrowth(player, ratingIncrease) {
        const attributes = player.attributes || {};
        const position = player.position || 'SF';
        
        // 根据位置确定重点属性
        const positionFocus = {
            PG: ['passing', 'dribbling', 'speed', 'basketballIQ'],
            SG: ['shooting', 'threePoint', 'scoring', 'speed'],
            SF: ['scoring', 'defense', 'speed', 'rebounding'],
            PF: ['rebounding', 'defense', 'strength', 'scoring'],
            C: ['rebounding', 'blocking', 'strength', 'defense']
        };
        
        const focusAttrs = positionFocus[position] || positionFocus.SF;
        const growth = {};
        
        // 重点属性获得更多成长
        focusAttrs.forEach(attr => {
            growth[attr] = Math.round(ratingIncrease * 0.4);  // 每个重点属性获得40%
        });
        
        // 其他属性获得少量成长
        const allAttrs = Object.keys(attributes);
        allAttrs.forEach(attr => {
            if (!growth[attr]) {
                growth[attr] = Math.round(ratingIncrease * 0.1);  // 非重点属性10%
            }
        });
        
        return growth;
    }

    /**
     * 检查转会触发条件
     * @param {Player} player - 球员对象
     * @param {Object} teamStats - 球队统计数据
     * @returns {Object} 转会可能性评估
     */
    checkTransferTrigger(player, teamStats = {}) {
        const conditions = this.transferConfig.triggerConditions;
        const triggers = [];
        let transferProbability = 0;
        
        // 1. 检查培养资源不足
        const trainingHistory = player.trainingHistory || [];
        const recentTraining = trainingHistory.slice(-2);  // 最近2年
        const lowTrainingYears = recentTraining.filter(t => t.level === 'minimal' || t.level === 'low').length;
        
        if (lowTrainingYears >= conditions.lowTraining.consecutiveYears) {
            triggers.push('培养资源不足');
            transferProbability += 0.3;
        }
        
        // 2. 检查出场时间
        const playingTimeHistory = player.playingTimeHistory || [];
        const recentPlayingTime = playingTimeHistory.slice(-2);
        const lowPlayingTimeYears = recentPlayingTime.filter(pt => pt < 0.3).length;
        
        if (lowPlayingTimeYears >= conditions.lowPlayingTime.consecutiveYears) {
            triggers.push('出场时间不足');
            transferProbability += 0.4;
        }
        
        // 3. 检查球队战绩
        if (teamStats.winRate !== undefined && teamStats.winRate < conditions.poorTeamPerformance.maxWinRate) {
            const poorSeasons = teamStats.poorSeasons || 0;
            if (poorSeasons >= conditions.poorTeamPerformance.consecutiveYears) {
                triggers.push('球队战绩不佳');
                transferProbability += 0.2;
            }
        }
        
        // 4. 球员满意度（综合因素）
        const satisfaction = this.calculatePlayerSatisfaction(player, teamStats);
        if (satisfaction < 30) {
            triggers.push('球员极度不满');
            transferProbability += 0.3;
        }
        
        // 5. 潜力未开发（高潜力但低培养）
        if (player.potential >= 80 && lowTrainingYears >= 1) {
            triggers.push('潜力未得到开发');
            transferProbability += 0.2;
        }
        
        return {
            willTransfer: transferProbability > 0.5 || (transferProbability > 0.3 && Math.random() < transferProbability),
            transferProbability: Math.min(1, transferProbability),
            triggers: triggers,
            satisfaction: satisfaction,
            recommendedAction: this.getTransferRecommendation(transferProbability, satisfaction)
        };
    }

    /**
     * 计算球员满意度
     */
    calculatePlayerSatisfaction(player, teamStats) {
        let satisfaction = 50;  // 基础满意度
        
        // 培养资源满意度
        const trainingHistory = player.trainingHistory || [];
        const avgTrainingLevel = trainingHistory.reduce((sum, t) => {
            const levels = { minimal: 20, low: 40, normal: 60, high: 80, maximum: 100 };
            return sum + (levels[t.level] || 60);
        }, 0) / (trainingHistory.length || 1);
        satisfaction += (avgTrainingLevel - 60) * 0.3;
        
        // 出场时间满意度
        const playingTimeHistory = player.playingTimeHistory || [];
        const avgPlayingTime = playingTimeHistory.reduce((sum, pt) => sum + pt, 0) / (playingTimeHistory.length || 1);
        satisfaction += (avgPlayingTime - 0.5) * 40;
        
        // 球队战绩满意度
        if (teamStats.winRate !== undefined) {
            satisfaction += (teamStats.winRate - 0.5) * 30;
        }
        
        // 潜力开发满意度（高潜力球员期望更多培养）
        if (player.potential >= 80) {
            const development = (player.rating / player.potential);
            satisfaction += (development - 0.7) * 20;
        }
        
        return Math.max(0, Math.min(100, Math.round(satisfaction)));
    }

    /**
     * 获取转会建议
     */
    getTransferRecommendation(probability, satisfaction) {
        if (probability > 0.7) {
            return '球员极有可能转会，建议立即增加培养资源或准备替代方案';
        } else if (probability > 0.5) {
            return '球员有转会风险，建议改善培养条件';
        } else if (probability > 0.3) {
            return '球员存在不满情绪，建议关注其发展';
        } else if (satisfaction < 40) {
            return '球员满意度较低，建议适当改善条件';
        }
        return '球员状态良好，继续当前培养策略';
    }

    /**
     * 处理球员转会
     * @param {Player} player - 球员对象
     * @param {Object} newTeam - 新球队信息
     * @returns {Object} 转会结果
     */
    processTransfer(player, newTeam) {
        const penalty = this.transferConfig.transferPenalty;
        const bonus = this.transferConfig.transferBonus;
        
        // 1. 能力值下降（适应期）
        const oldRating = player.rating;
        const newRating = Math.max(40, oldRating - penalty.ratingDrop);
        
        // 2. 属性调整
        const attributes = { ...player.attributes };
        const attrKeys = Object.keys(attributes);
        attrKeys.forEach(attr => {
            attributes[attr] = Math.max(25, attributes[attr] - 2);  // 所有属性-2
        });
        
        // 3. 标记适应期
        player.adaptationPeriod = penalty.adaptationPeriod;
        player.transferHistory = player.transferHistory || [];
        player.transferHistory.push({
            from: player.team,
            to: newTeam.name,
            year: this.gameStateManager.getState().currentYear,
            ratingDrop: oldRating - newRating
        });
        
        return {
            oldRating: oldRating,
            newRating: newRating,
            ratingDrop: oldRating - newRating,
            attributes: attributes,
            adaptationPeriod: penalty.adaptationPeriod,
            nextYearBonus: bonus.firstYear,
            message: `${player.name} 转会至 ${newTeam.name}，需要${penalty.adaptationPeriod}年适应期`
        };
    }

    /**
     * 计算适应期后的加成
     */
    calculateAdaptationBonus(player) {
        if (player.adaptationPeriod > 0) {
            player.adaptationPeriod--;
            
            if (player.adaptationPeriod === 0) {
                // 适应期结束，获得额外加成
                const bonus = this.transferConfig.transferBonus.firstYear;
                return {
                    adaptationComplete: true,
                    bonus: bonus,
                    message: `${player.name} 已适应新环境，获得额外成长加成`
                };
            }
        }
        return { adaptationComplete: false };
    }

    /**
     * 生成球员培养报告
     */
    generateDevelopmentReport(player) {
        const growth = this.calculateYearlyGrowth(player, 'normal', 0.5);
        const transferCheck = this.checkTransferTrigger(player);
        
        return {
            playerName: player.name,
            currentRating: player.rating,
            currentPotential: player.potential,
            projectedGrowth: growth.ratingIncrease,
            projectedRating: growth.newRating,
            remainingPotential: growth.newPotential - growth.newRating,
            transferRisk: transferCheck.transferProbability,
            satisfaction: transferCheck.satisfaction,
            recommendations: transferCheck.recommendedAction,
            attributesToFocus: this.getAttributesToFocus(player),
            developmentStage: this.getDevelopmentStage(player)
        };
    }

    /**
     * 获取需要重点培养的属性
     */
    getAttributesToFocus(player) {
        const attributes = player.attributes || {};
        const position = player.position || 'SF';
        
        // 根据位置确定重点属性
        const positionFocus = {
            PG: ['passing', 'dribbling', 'speed'],
            SG: ['shooting', 'threePoint', 'scoring'],
            SF: ['scoring', 'defense', 'rebounding'],
            PF: ['rebounding', 'defense', 'strength'],
            C: ['rebounding', 'blocking', 'strength']
        };
        
        const focusAttrs = positionFocus[position] || positionFocus.SF;
        
        // 找出较低的属性
        const weakAttributes = focusAttrs
            .map(attr => ({ attr, value: attributes[attr] || 50 }))
            .sort((a, b) => a.value - b.value)
            .slice(0, 2);
        
        return weakAttributes.map(a => a.attr);
    }

    /**
     * 获取球员发展阶段
     */
    getDevelopmentStage(player) {
        const developmentRatio = player.rating / player.potential;
        const year = player.year;
        
        if (developmentRatio >= 0.9) {
            return { stage: 'mature', label: '成熟期', description: '球员已接近潜力上限' };
        } else if (developmentRatio >= 0.7) {
            return { stage: 'developing', label: '发展期', description: '球员正在稳步成长' };
        } else if (year <= 2) {
            return { stage: 'raw', label: ' raw talent', description: '球员潜力巨大，需要培养' };
        }
        return { stage: 'stalled', label: '停滞期', description: '球员发展缓慢，需要关注' };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PlayerGrowthSystem };
}
