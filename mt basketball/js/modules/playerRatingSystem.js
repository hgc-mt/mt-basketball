/**
 * 球员数值计算系统 - 改进版
 * 参考 NBA 2K 正代和真实大学篮球数据
 */

/**
 * 球员评级系统
 * 采用分层生成模型，确保数值合理性和真实性
 */
class PlayerRatingSystem {
    constructor() {
        // 定义属性层级（核心属性 > 次要属性 > 基础属性）
        this.attributeTiers = {
            // 核心属性 - 对位置最重要
            core: {
                PG: ['passing', 'dribbling', 'speed', 'basketballIQ'],
                SG: ['shooting', 'threePoint', 'scoring', 'speed'],
                SF: ['scoring', 'defense', 'speed', 'rebounding'],
                PF: ['rebounding', 'defense', 'strength', 'scoring'],
                C: ['rebounding', 'blocking', 'strength', 'defense']
            },
            // 次要属性 - 对位置较重要
            secondary: {
                PG: ['stealing', 'shooting', 'defense', 'stamina'],
                SG: ['dribbling', 'defense', 'stealing', 'stamina'],
                SF: ['shooting', 'dribbling', 'stealing', 'stamina'],
                PF: ['scoring', 'speed', 'stamina', 'blocking'],
                C: ['scoring', 'defense', 'stamina', 'basketballIQ']
            },
            // 基础属性 - 所有位置都需要
            base: ['freeThrow', 'passing', 'basketballIQ']
        };

        // 属性基准值（参考真实大学球员数据，降低以避免过高）
        this.baseValues = {
            elite: { min: 70, max: 80, mean: 75, stdDev: 3 },      // 顶级球员（降低）
            good: { min: 60, max: 70, mean: 65, stdDev: 3 },       // 优秀球员（降低）
            average: { min: 50, max: 60, mean: 55, stdDev: 3 },    // 普通球员（降低）
            belowAvg: { min: 40, max: 50, mean: 45, stdDev: 3 }    // 较差球员（降低）
        };

        // 位置权重（归一化，总和为1）
        this.positionWeights = {
            PG: {
                passing: 0.12, dribbling: 0.12, speed: 0.10, basketballIQ: 0.10,
                stealing: 0.08, shooting: 0.08, threePoint: 0.08, scoring: 0.08,
                defense: 0.08, stamina: 0.06, freeThrow: 0.04, rebounding: 0.02,
                strength: 0.01, blocking: 0.01
            },
            SG: {
                shooting: 0.14, threePoint: 0.12, scoring: 0.12, speed: 0.10,
                dribbling: 0.08, defense: 0.08, stealing: 0.08, stamina: 0.08,
                passing: 0.06, freeThrow: 0.06, rebounding: 0.04, strength: 0.02,
                basketballIQ: 0.05, blocking: 0.01
            },
            SF: {
                scoring: 0.12, defense: 0.12, rebounding: 0.10, speed: 0.10,
                shooting: 0.10, dribbling: 0.08, stealing: 0.08, strength: 0.08,
                stamina: 0.08, threePoint: 0.06, passing: 0.04, blocking: 0.04,
                basketballIQ: 0.05, freeThrow: 0.04
            },
            PF: {
                rebounding: 0.14, defense: 0.12, strength: 0.12, scoring: 0.10,
                blocking: 0.10, stamina: 0.10, shooting: 0.08, speed: 0.06,
                threePoint: 0.04, passing: 0.04, freeThrow: 0.04, dribbling: 0.03,
                stealing: 0.02, basketballIQ: 0.04
            },
            C: {
                rebounding: 0.16, blocking: 0.14, strength: 0.14, defense: 0.12,
                scoring: 0.10, stamina: 0.10, basketballIQ: 0.08, shooting: 0.04,
                passing: 0.04, freeThrow: 0.04, dribbling: 0.02, speed: 0.01,
                stealing: 0.01, threePoint: 0.01
            }
        };

        // 球员类型定义（影响属性分布，降低加成以避免过高）
        this.archetypes = {
            PG: {
                '组织者': { passing: +5, dribbling: +5, basketballIQ: +4, stealing: +3, shooting: -3, rebounding: -4 },
                '得分型控卫': { scoring: +5, shooting: +4, threePoint: +4, dribbling: +3, passing: -3, defense: -3 },
                '防守专家': { stealing: +6, defense: +5, speed: +4, passing: -3, shooting: -4, scoring: -3 }
            },
            SG: {
                '神射手': { shooting: +8, threePoint: +8, freeThrow: +4, defense: -3, rebounding: -3, passing: -3 },
                '得分手': { scoring: +6, shooting: +4, threePoint: +3, dribbling: +3, defense: -3, passing: -3 },
                '3D球员': { defense: +5, stealing: +4, shooting: +4, threePoint: +4, dribbling: -3, passing: -3 }
            },
            SF: {
                '全能前锋': { scoring: +3, defense: +3, rebounding: +3, shooting: +3, speed: +3 },
                '防守前锋': { defense: +6, rebounding: +4, stealing: +4, blocking: +3, shooting: -4, scoring: -4 },
                '得分手': { scoring: +6, shooting: +5, threePoint: +4, dribbling: +3, defense: -4, rebounding: -3 }
            },
            PF: {
                '空间型大前': { shooting: +6, threePoint: +6, scoring: +4, rebounding: -3, defense: -3, strength: -3 },
                '篮板手': { rebounding: +8, defense: +5, strength: +5, blocking: +4, shooting: -5, threePoint: -5 },
                '全能大前': { scoring: +4, rebounding: +4, defense: +4, strength: +3, shooting: +2 }
            },
            C: {
                '护框中锋': { blocking: +8, defense: +6, rebounding: +6, strength: +5, scoring: -4, speed: -4 },
                '篮板机器': { rebounding: +8, strength: +7, defense: +5, blocking: +4, shooting: -4, threePoint: -4 },
                '技术型中锋': { scoring: +5, passing: +4, basketballIQ: +4, shooting: +3, blocking: -3, strength: -3 }
            }
        };
    }

    /**
     * 生成正态分布随机数
     * @param {number} mean - 均值
     * @param {number} stdDev - 标准差
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机数
     */
    normalDistribution(mean, stdDev, min, max) {
        // Box-Muller 变换生成正态分布
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        num = num * stdDev + mean;
        
        // 截断到范围
        return Math.max(min, Math.min(max, Math.round(num)));
    }

    /**
     * 根据潜力确定球员等级
     * @param {number} potential - 潜力值
     * @returns {string} 等级
     */
    getPlayerTier(potential) {
        if (potential >= 85) return 'elite';
        if (potential >= 75) return 'good';
        if (potential >= 65) return 'average';
        return 'belowAvg';
    }

    /**
     * 生成球员属性
     * @param {string} position - 位置
     * @param {number} potential - 潜力值
     * @param {string} archetypeName - 球员类型名称
     * @returns {Object} 属性对象
     */
    generateAttributes(position, potential, archetypeName = null) {
        const tier = this.getPlayerTier(potential);
        const baseConfig = this.baseValues[tier];
        
        // 随机选择球员类型
        const positionArchetypes = this.archetypes[position];
        const archetype = archetypeName 
            ? positionArchetypes[archetypeName]
            : Object.values(positionArchetypes)[Math.floor(Math.random() * Object.keys(positionArchetypes).length)];
        
        const attributes = {};
        const allAttrs = [
            'scoring', 'shooting', 'threePoint', 'freeThrow', 'passing', 'dribbling',
            'defense', 'rebounding', 'stealing', 'blocking', 'speed', 'stamina', 'strength', 'basketballIQ'
        ];

        // 生成核心属性（更高）
        const coreAttrs = this.attributeTiers.core[position] || [];
        const secondaryAttrs = this.attributeTiers.secondary[position] || [];

        allAttrs.forEach(attr => {
            let baseValue;
            
            // 根据属性层级调整基础值（降低层级加成）
            if (coreAttrs.includes(attr)) {
                baseValue = this.normalDistribution(
                    baseConfig.mean + 3, 
                    baseConfig.stdDev, 
                    baseConfig.min + 3, 
                    baseConfig.max + 3
                );
            } else if (secondaryAttrs.includes(attr)) {
                baseValue = this.normalDistribution(
                    baseConfig.mean, 
                    baseConfig.stdDev, 
                    baseConfig.min, 
                    baseConfig.max
                );
            } else {
                baseValue = this.normalDistribution(
                    baseConfig.mean - 3, 
                    baseConfig.stdDev, 
                    Math.max(25, baseConfig.min - 3), 
                    baseConfig.max - 3
                );
            }

            // 应用球员类型加成
            const bonus = archetype[attr] || 0;
            let finalValue = baseValue + bonus;

            // 确保数值在合理范围内（降低上限到90）
            finalValue = Math.max(25, Math.min(90, Math.round(finalValue)));
            
            attributes[attr] = finalValue;
        });

        // 确保某些属性有合理范围
        attributes.freeThrow = Math.max(45, Math.min(95, attributes.freeThrow));
        attributes.stamina = Math.max(55, Math.min(95, attributes.stamina));
        attributes.basketballIQ = Math.max(40, Math.min(95, attributes.basketballIQ));

        return attributes;
    }

    /**
     * 计算球员能力值（OVR）
     * @param {Object} attributes - 属性对象
     * @param {string} position - 位置
     * @param {number} year - 年级（1-4）
     * @param {Array} talents - 天赋列表
     * @returns {number} 能力值
     */
    calculateOverallRating(attributes, position, year = 1, talents = []) {
        const weights = this.positionWeights[position] || this.positionWeights.SF;
        
        let weightedSum = 0;
        let totalWeight = 0;

        for (const [attr, weight] of Object.entries(weights)) {
            const attrValue = attributes[attr] || 50;
            weightedSum += attrValue * weight;
            totalWeight += weight;
        }

        // 基础能力值（加权平均）
        let baseRating = Math.round(weightedSum / totalWeight);

        // 年级加成（更平滑）
        const yearBonus = (4 - year) * 1.5;

        // 天赋加成（根据天赋数量和质量）
        let talentBonus = 0;
        if (talents && talents.length > 0) {
            talentBonus = talents.length * 1.5;
        }

        // 最终能力值
        let finalRating = baseRating + yearBonus + talentBonus;

        // 确保在合理范围内
        return Math.min(95, Math.max(40, Math.round(finalRating)));
    }

    /**
     * 计算球员潜力值
     * @param {Object} attributes - 属性对象
     * @param {string} position - 位置
     * @param {number} year - 年级
     * @returns {number} 潜力值
     */
    calculatePotential(attributes, position, year = 1) {
        const weights = this.positionWeights[position] || this.positionWeights.SF;
        
        let weightedSum = 0;
        let totalWeight = 0;

        for (const [attr, weight] of Object.entries(weights)) {
            const attrValue = attributes[attr] || 50;
            weightedSum += attrValue * weight;
            totalWeight += weight;
        }

        const baseRating = weightedSum / totalWeight;
        
        // 潜力基于当前能力，但考虑年级
        // 低年级球员有更大的成长空间
        const growthPotential = (4 - year) * 8 + Math.random() * 10;
        
        let potential = Math.round(baseRating + growthPotential);
        
        return Math.min(95, Math.max(50, potential));
    }

    /**
     * 获取属性评级
     * @param {number} value - 属性值
     * @returns {Object} 评级信息
     */
    getAttributeGrade(value) {
        if (value >= 85) return { label: 'A+', color: '#22c55e', desc: '精英' };
        if (value >= 80) return { label: 'A', color: '#4ade80', desc: '优秀' };
        if (value >= 75) return { label: 'A-', color: '#86efac', desc: '良好' };
        if (value >= 70) return { label: 'B+', color: '#3b82f6', desc: '中上' };
        if (value >= 65) return { label: 'B', color: '#60a5fa', desc: '中等' };
        if (value >= 60) return { label: 'B-', color: '#93c5fd', desc: '中下' };
        if (value >= 55) return { label: 'C+', color: '#f59e0b', desc: '一般' };
        if (value >= 50) return { label: 'C', color: '#fbbf24', desc: '及格' };
        return { label: 'D', color: '#ef4444', desc: '较差' };
    }

    /**
     * 获取能力值评级
     * @param {number} rating - 能力值
     * @returns {Object} 评级信息
     */
    getOverallGrade(rating) {
        if (rating >= 85) return { label: '精英', color: '#ef4444', icon: '👑' };
        if (rating >= 80) return { label: '优秀', color: '#f59e0b', icon: '⭐' };
        if (rating >= 75) return { label: '良好', color: '#3b82f6', icon: '💎' };
        if (rating >= 70) return { label: '中上', color: '#22c55e', icon: '📈' };
        if (rating >= 65) return { label: '中等', color: '#6b7280', icon: '📊' };
        return { label: '普通', color: '#9ca3af', icon: '📋' };
    }
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayerRatingSystem;
}
