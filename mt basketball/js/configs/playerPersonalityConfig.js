/**
 * 球员性格维度系统
 * 每个球员在多个性格维度上都有0-100的独立评分
 * 根据维度组合确定主要性格标签
 */

const PlayerPersonalityConfig = {
    // 性格维度定义
    dimensions: {
        // 1. 雄心 vs 务实
        ambition: {
            id: 'ambition',
            name: '雄心',
            nameEn: 'Ambition',
            description: '追求个人成就和荣耀的欲望',
            icon: '🚀',
            lowLabel: '务实',
            highLabel: '雄心勃勃',
            // 对游戏的影响
            effects: {
                scholarshipExpectation: { min: -10, max: 20 },  // 奖学金期望 -10% 到 +20%
                playingTimeDemand: { min: -10, max: 25 },       // 出场时间要求
                trainingEffort: { min: 0.95, max: 1.15 },       // 训练努力度
                clutchPerformance: { min: 0.95, max: 1.15 },    // 关键球表现
                transferLikelihood: { min: 0.8, max: 1.4 },     // 转学概率
                ego: { min: 0.2, max: 0.9 }                     // 自我中心程度
            }
        },

        // 2. 团队导向 vs 个人导向
        teamOrientation: {
            id: 'teamOrientation',
            name: '团队精神',
            nameEn: 'Team Orientation',
            description: '重视团队成功胜过个人成就',
            icon: '🤝',
            lowLabel: '个人主义',
            highLabel: '团队优先',
            effects: {
                scholarshipExpectation: { min: -15, max: 5 },   // 团队型球员接受更低奖学金
                chemistryBonus: { min: -5, max: 15 },           // 对团队化学反应的贡献
                leadership: { min: 0.3, max: 0.95 },            // 领导力
                consistency: { min: 0.9, max: 1.1 },            // 稳定性
                transferIfLosing: { min: 0.3, max: 0.7 },       // 输球时转学概率
                loyalty: { min: 0.3, max: 0.95 }                // 忠诚度
            }
        },

        // 3. 职业素养
        workEthic: {
            id: 'workEthic',
            name: '职业素养',
            nameEn: 'Work Ethic',
            description: '训练态度和努力程度',
            icon: '💪',
            lowLabel: '懒散',
            highLabel: '刻苦',
            effects: {
                trainingEffort: { min: 0.8, max: 1.25 },        // 训练效果
                skillGrowthRate: { min: 0.9, max: 1.2 },        // 技能成长速度
                potentialRealization: { min: 0.85, max: 1.15 }, // 潜力实现率
                consistency: { min: 0.85, max: 1.15 },          // 比赛稳定性
                coachSatisfaction: { min: -20, max: 20 }        // 教练满意度
            }
        },

        // 4. 金钱观念
        moneyFocus: {
            id: 'moneyFocus',
            name: '金钱观念',
            nameEn: 'Money Focus',
            description: '对经济利益的重视程度',
            icon: '💰',
            lowLabel: '淡泊',
            highLabel: '看重金钱',
            effects: {
                scholarshipExpectation: { min: -20, max: 30 },  // 奖学金期望大幅波动
                transferIfLowScholarship: { min: 0.2, max: 0.95 }, // 低奖学金时转学概率
                trainingEffort: { min: 0.9, max: 1.05 },        // 对训练影响较小
                teamChemistry: { min: -5, max: 0 }              // 对团队氛围的负面影响
            }
        },

        // 5. 竞争意识
        competitiveness: {
            id: 'competitiveness',
            name: '竞争意识',
            nameEn: 'Competitiveness',
            description: '渴望胜利和竞争的欲望',
            icon: '🔥',
            lowLabel: '随和',
            highLabel: '好胜',
            effects: {
                clutchPerformance: { min: 0.9, max: 1.2 },      // 关键球表现
                riskTaking: { min: 0.85, max: 1.2 },            // 冒险倾向
                transferIfLosing: { min: 0.2, max: 0.9 },       // 输球时转学概率
                moraleSensitivity: { min: 0.5, max: 1.5 },      // 士气敏感度
                trainingIntensity: { min: 0.9, max: 1.15 }      // 训练强度
            }
        },

        // 6. 忠诚度
        loyalty: {
            id: 'loyalty',
            name: '忠诚度',
            nameEn: 'Loyalty',
            description: '对球队和承诺的忠诚程度',
            icon: '🛡️',
            lowLabel: '现实',
            highLabel: '忠诚',
            effects: {
                transferLikelihood: { min: 1.5, max: 0.3 },     // 转学概率（反向）
                stayIfBenched: { min: 0.2, max: 0.9 },          // 板凳时留队意愿
                stayIfLosing: { min: 0.3, max: 0.85 },          // 输球时留队意愿
                contractNegotiation: { min: -10, max: 10 },     // 续约谈判难度
                teamChemistry: { min: 0, max: 10 }              // 对团队氛围的正面影响
            }
        },

        // 7. 耐心程度
        patience: {
            id: 'patience',
            name: '耐心',
            nameEn: 'Patience',
            description: '愿意等待机会和发展的耐心',
            icon: '🧘',
            lowLabel: '急躁',
            highLabel: '耐心',
            effects: {
                transferIfNotStarter: { min: 0.8, max: 0.2 },   // 非首发时转学概率
                developmentSatisfaction: { min: 0.6, max: 1.2 }, // 对发展进度的满意度
                playingTimeDemand: { min: 15, max: -10 },       // 出场时间要求
                trainingConsistency: { min: 0.9, max: 1.1 }     // 训练持续性
            }
        },

        // 8. 抗压能力
        pressureHandling: {
            id: 'pressureHandling',
            name: '抗压能力',
            nameEn: 'Pressure Handling',
            description: '在压力下的表现稳定性',
            icon: '🧊',
            lowLabel: '易紧张',
            highLabel: '大心脏',
            effects: {
                clutchPerformance: { min: 0.85, max: 1.25 },    // 关键球表现
                consistencyInBigGames: { min: 0.85, max: 1.2 }, // 重要比赛稳定性
                moraleImpact: { min: 1.2, max: 0.8 },           // 士气波动
                mediaHandling: { min: 0.6, max: 1.0 }           // 媒体应对能力
            }
        }
    },

    // 主要性格标签定义（基于维度组合）
    personalityTags: {
        // 高雄心 + 高竞争 + 中等团队
        ambitious: {
            id: 'ambitious',
            name: '雄心勃勃',
            icon: '🚀',
            description: '渴望成为明星，追求个人荣耀',
            conditions: {
                ambition: { min: 70 },
                competitiveness: { min: 60 },
                teamOrientation: { max: 70 }
            },
            priority: 10
        },

        // 高团队 + 高忠诚 + 低金钱
        teamFirst: {
            id: 'team_first',
            name: '团队优先',
            icon: '🤝',
            description: '将团队成功置于个人之上',
            conditions: {
                teamOrientation: { min: 75 },
                loyalty: { min: 60 },
                moneyFocus: { max: 50 }
            },
            priority: 9
        },

        // 高金钱 + 低忠诚
        moneyFocused: {
            id: 'money_focused',
            name: '看重金钱',
            icon: '💰',
            description: '非常关注经济利益',
            conditions: {
                moneyFocus: { min: 70 },
                loyalty: { max: 50 }
            },
            priority: 8
        },

        // 高职业素养 + 高耐心 + 中等雄心
        development: {
            id: 'development',
            name: '看重发展',
            icon: '📈',
            description: '最看重个人技能成长',
            conditions: {
                workEthic: { min: 70 },
                patience: { min: 65 },
                ambition: { min: 50 }
            },
            priority: 8
        },

        // 高竞争 + 高雄心 + 低耐心
        competitive: {
            id: 'competitive',
            name: '竞争型',
            icon: '🔥',
            description: '极度渴望胜利，讨厌输球',
            conditions: {
                competitiveness: { min: 75 },
                ambition: { min: 60 },
                patience: { max: 50 }
            },
            priority: 9
        },

        // 高忠诚 + 高团队 + 高耐心
        loyal: {
            id: 'loyal',
            name: '忠诚型',
            icon: '🛡️',
            description: '一旦承诺就会坚守',
            conditions: {
                loyalty: { min: 75 },
                teamOrientation: { min: 60 },
                patience: { min: 60 }
            },
            priority: 8
        },

        // 低职业素养 + 低竞争 + 低雄心
        laidBack: {
            id: 'laid_back',
            name: '随性型',
            icon: '😎',
            description: '性格随和，不太在意细节',
            conditions: {
                workEthic: { max: 50 },
                competitiveness: { max: 50 },
                ambition: { max: 55 }
            },
            priority: 6
        },

        // 高抗压 + 高职业素养 + 中等竞争
        clutch: {
            id: 'clutch',
            name: '大心脏',
            icon: '🧊',
            description: '关键时刻从不手软',
            conditions: {
                pressureHandling: { min: 80 },
                workEthic: { min: 65 },
                competitiveness: { min: 60 }
            },
            priority: 7
        },

        // 默认标签
        balanced: {
            id: 'balanced',
            name: '均衡型',
            icon: '⚖️',
            description: '各方面都很均衡',
            conditions: {},
            priority: 1
        }
    },

    /**
     * 生成随机性格维度评分
     * @returns {Object} 各维度评分 (0-100)
     */
    generatePersonalityDimensions() {
        const dimensions = {};

        // 为每个维度生成随机评分（正态分布，均值50，标准差15）
        for (const [key, config] of Object.entries(this.dimensions)) {
            // 使用Box-Muller变换生成正态分布
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

            // 均值为50，标准差为15
            let value = Math.round(50 + z * 15);

            // 限制在0-100范围内
            value = Math.max(0, Math.min(100, value));

            dimensions[key] = value;
        }

        return dimensions;
    },

    /**
     * 根据维度评分确定主要性格标签
     * @param {Object} dimensions - 维度评分
     * @returns {Object} 主要性格标签
     */
    determinePersonalityTag(dimensions) {
        const matches = [];

        // 检查每个标签的条件
        for (const [tagKey, tagConfig] of Object.entries(this.personalityTags)) {
            if (tagKey === 'balanced') continue; // 跳过默认标签

            let matchesAll = true;
            for (const [dimKey, condition] of Object.entries(tagConfig.conditions)) {
                const value = dimensions[dimKey];
                if (condition.min !== undefined && value < condition.min) {
                    matchesAll = false;
                    break;
                }
                if (condition.max !== undefined && value > condition.max) {
                    matchesAll = false;
                    break;
                }
            }

            if (matchesAll) {
                matches.push(tagConfig);
            }
        }

        // 按优先级排序，返回最高优先级的标签
        if (matches.length > 0) {
            matches.sort((a, b) => b.priority - a.priority);
            return matches[0];
        }

        // 返回默认标签
        return this.personalityTags.balanced;
    },

    /**
     * 获取维度效果值
     * @param {string} dimension - 维度ID
     * @param {number} value - 维度评分 (0-100)
     * @param {string} effect - 效果名称
     * @returns {number} 效果值
     */
    getDimensionEffect(dimension, value, effect) {
        const dimConfig = this.dimensions[dimension];
        if (!dimConfig || !dimConfig.effects[effect]) {
            return 1.0; // 默认值
        }

        const effectConfig = dimConfig.effects[effect];
        const min = effectConfig.min;
        const max = effectConfig.max;

        // 线性插值
        return min + (max - min) * (value / 100);
    },

    /**
     * 计算综合性格效果
     * @param {Object} dimensions - 维度评分
     * @param {string} effectType - 效果类型
     * @returns {number} 综合效果值
     */
    calculateCompositeEffect(dimensions, effectType) {
        let totalWeight = 0;
        let weightedSum = 0;

        for (const [dimKey, value] of Object.entries(dimensions)) {
            const dimConfig = this.dimensions[dimKey];
            if (dimConfig && dimConfig.effects[effectType]) {
                const effect = this.getDimensionEffect(dimKey, value, effectType);
                // 使用维度值作为权重
                weightedSum += effect * value;
                totalWeight += value;
            }
        }

        return totalWeight > 0 ? weightedSum / totalWeight : 1.0;
    },

    /**
     * 获取完整的性格档案
     * @param {Object} dimensions - 维度评分（可选，会生成新的如果未提供）
     * @returns {Object} 完整性格档案
     */
    generateFullPersonality(dimensions = null) {
        const dims = dimensions || this.generatePersonalityDimensions();
        const primaryTag = this.determinePersonalityTag(dims);

        // 计算主要效果
        const effects = {
            scholarshipModifier: this.calculateCompositeEffect(dims, 'scholarshipExpectation'),
            trainingEffort: this.calculateCompositeEffect(dims, 'trainingEffort'),
            clutchPerformance: this.calculateCompositeEffect(dims, 'clutchPerformance'),
            transferLikelihood: this.calculateCompositeEffect(dims, 'transferLikelihood'),
            consistency: this.calculateCompositeEffect(dims, 'consistency'),
            leadership: this.calculateCompositeEffect(dims, 'leadership')
        };

        return {
            dimensions: dims,
            primaryTag: primaryTag,
            effects: effects,
            description: this.generatePersonalityDescription(dims, primaryTag)
        };
    },

    /**
     * 生成性格描述
     * @param {Object} dimensions - 维度评分
     * @param {Object} primaryTag - 主要标签
     * @returns {string} 描述文本
     */
    generatePersonalityDescription(dimensions, primaryTag) {
        const highDims = [];
        const lowDims = [];

        for (const [key, value] of Object.entries(dimensions)) {
            const config = this.dimensions[key];
            if (value >= 75) {
                highDims.push(config.name);
            } else if (value <= 25) {
                lowDims.push(config.name);
            }
        }

        let desc = primaryTag.description;

        if (highDims.length > 0) {
            desc += ` 突出的优点：${highDims.join('、')}。`;
        }

        if (lowDims.length > 0) {
            desc += ` 需要注意：${lowDims.join('、')}方面较弱。`;
        }

        return desc;
    },

    /**
     * 获取所有维度列表
     * @returns {Array} 维度列表
     */
    getAllDimensions() {
        return Object.values(this.dimensions);
    },

    /**
     * 获取所有性格标签
     * @returns {Array} 标签列表
     */
    getAllPersonalityTags() {
        return Object.values(this.personalityTags);
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayerPersonalityConfig;
}
