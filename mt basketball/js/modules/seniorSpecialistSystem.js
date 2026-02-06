/**
 * 高年级学生专项特长系统
 * 为大三、大四学生提供篮板或防守的专项强化，同时削弱其他能力以保持平衡
 * 符合"非核心球员得不到大量培养资源"的设定
 */

class SeniorSpecialistSystem {
    constructor() {
        // 专项类型定义
        this.specialistTypes = {
            REBOUNDING: {
                id: 'rebounding',
                name: '篮板专家',
                description: '专注于篮板球能力的高年级球员',
                icon: '🏀',
                primaryAttribute: 'rebounding',
                secondaryAttributes: ['strength', 'blocking'],
                // 核心属性加成
                primaryBoost: 0.25,      // +25%
                secondaryBoost: 0.15,    // +15%
                // 削弱的属性（选择2-3个非核心属性）
                weakenedAttributes: {
                    shooting: 0.20,      // -20%
                    threePoint: 0.25,    // -25%
                    passing: 0.15,       // -15%
                    dribbling: 0.15      // -15%
                }
            },
            DEFENSE: {
                id: 'defense',
                name: '防守专家',
                description: '专注于防守能力的高年级球员',
                icon: '🛡️',
                primaryAttribute: 'defense',
                secondaryAttributes: ['stealing', 'blocking'],
                // 核心属性加成
                primaryBoost: 0.25,      // +25%
                secondaryBoost: 0.15,    // +15%
                // 削弱的属性
                weakenedAttributes: {
                    shooting: 0.20,      // -20%
                    threePoint: 0.25,    // -25%
                    scoring: 0.15,       // -15%
                    passing: 0.10        // -10%
                }
            }
        };

        // 高年级专项球员生成概率
        this.generationRates = {
            3: 0.40,  // 大三：40%概率成为专项球员
            4: 0.60   // 大四：60%概率成为专项球员
        };

        // 专项类型选择权重
        this.specialistWeights = {
            REBOUNDING: 0.5,
            DEFENSE: 0.5
        };

        // 综合能力值惩罚（确保专项球员综合评分较低）
        this.overallRatingPenalty = {
            3: 5,   // 大三-5
            4: 8    // 大四-8
        };

        // 潜力值调整（高年级专项球员潜力较低）
        this.potentialAdjustment = {
            3: -5,  // 大三潜力-5
            4: -10  // 大四潜力-10
        };
    }

    /**
     * 判断是否生成专项球员
     * @param {number} year - 年级（3或4）
     * @returns {boolean} 是否生成专项球员
     */
    shouldGenerateSpecialist(year) {
        if (year < 3) return false;
        const rate = this.generationRates[year] || 0;
        return Math.random() < rate;
    }

    /**
     * 随机选择专项类型
     * @returns {string} 专项类型ID
     */
    selectSpecialistType() {
        const random = Math.random();
        return random < this.specialistWeights.REBOUNDING ? 'REBOUNDING' : 'DEFENSE';
    }

    /**
     * 应用专项特长调整
     * @param {Object} player - 球员对象
     * @param {string} specialistType - 专项类型
     * @returns {Object} 调整后的球员数据
     */
    applySpecialistAdjustment(player, specialistType) {
        const config = this.specialistTypes[specialistType];
        if (!config) return player;

        const year = player.year;
        const attributes = { ...player.attributes };

        // 1. 强化核心属性
        // 主要属性 +25%
        const primaryValue = attributes[config.primaryAttribute] || 50;
        attributes[config.primaryAttribute] = Math.min(95, Math.round(
            primaryValue * (1 + config.primaryBoost)
        ));

        // 次要属性 +15%
        config.secondaryAttributes.forEach(attr => {
            const value = attributes[attr] || 50;
            attributes[attr] = Math.min(95, Math.round(
                value * (1 + config.secondaryBoost)
            ));
        });

        // 2. 削弱非核心属性
        Object.entries(config.weakenedAttributes).forEach(([attr, reduction]) => {
            const value = attributes[attr] || 50;
            attributes[attr] = Math.max(25, Math.round(
                value * (1 - reduction)
            ));
        });

        // 3. 计算调整后的能力值（带惩罚）
        const baseRating = this.calculateSpecialistRating(
            attributes, 
            player.position, 
            year
        );
        const penalty = this.overallRatingPenalty[year] || 0;
        const adjustedRating = Math.max(40, baseRating - penalty);

        // 4. 调整潜力值
        const potentialPenalty = this.potentialAdjustment[year] || 0;
        const adjustedPotential = Math.max(50, player.potential + potentialPenalty);

        // 5. 生成专项球员描述
        const description = this.generateSpecialistDescription(
            player.name,
            config,
            attributes[config.primaryAttribute]
        );

        return {
            ...player,
            attributes: attributes,
            rating: adjustedRating,
            potential: adjustedPotential,
            specialistInfo: {
                type: config.id,
                name: config.name,
                description: config.description,
                icon: config.icon,
                primaryAttribute: config.primaryAttribute,
                primaryValue: attributes[config.primaryAttribute],
                specialistDescription: description
            },
            // 标记为非核心球员（得不到大量培养资源）
            isCorePlayer: false,
            developmentPriority: 'low'
        };
    }

    /**
     * 计算专项球员的能力值（使用不同的权重）
     * @param {Object} attributes - 属性
     * @param {string} position - 位置
     * @param {number} year - 年级
     * @returns {number} 能力值
     */
    calculateSpecialistRating(attributes, position, year) {
        // 专项球员使用简化的权重计算（更注重核心属性）
        const specialistWeights = {
            PG: { defense: 0.25, stealing: 0.20, rebounding: 0.05, passing: 0.10, shooting: 0.10, scoring: 0.10, speed: 0.10, stamina: 0.10 },
            SG: { defense: 0.25, stealing: 0.20, rebounding: 0.05, shooting: 0.10, scoring: 0.15, speed: 0.10, stamina: 0.10, threePoint: 0.05 },
            SF: { defense: 0.25, rebounding: 0.20, stealing: 0.10, scoring: 0.10, shooting: 0.10, speed: 0.10, strength: 0.10, blocking: 0.05 },
            PF: { rebounding: 0.30, defense: 0.20, strength: 0.15, blocking: 0.10, scoring: 0.10, shooting: 0.05, speed: 0.05, stamina: 0.05 },
            C: { rebounding: 0.30, blocking: 0.20, defense: 0.15, strength: 0.15, scoring: 0.10, shooting: 0.05, speed: 0.03, stamina: 0.02 }
        };

        const weights = specialistWeights[position] || specialistWeights.SF;
        let weightedSum = 0;
        let totalWeight = 0;

        for (const [attr, weight] of Object.entries(weights)) {
            const value = attributes[attr] || 50;
            weightedSum += value * weight;
            totalWeight += weight;
        }

        // 添加年级惩罚（高年级但非核心）
        const yearPenalty = year === 3 ? 3 : 5;

        return Math.round(weightedSum / totalWeight) - yearPenalty;
    }

    /**
     * 生成专项球员描述
     */
    generateSpecialistDescription(name, config, primaryValue) {
        const descriptions = {
            REBOUNDING: [
                `${name}是一名经验丰富的篮板手，虽然其他技术相对粗糙，但在篮板球方面有着出色的嗅觉和卡位能力。`,
                `作为高年级球员，${name}深知自己的定位，专注于篮板球拼抢，是球队内线的重要屏障。`,
                `${name}的篮板能力在队内数一数二，虽然进攻手段单一，但总能用篮板球为球队创造机会。`
            ],
            DEFENSE: [
                `${name}是球队的防守悍将，凭借丰富的经验和强硬的防守态度，成为对手进攻的噩梦。`,
                `虽然进攻能力有限，但${name}在防守端从不惜力，是高年级球员的楷模。`,
                `${name}专注于防守，用强硬的防守弥补天赋的不足，是教练信任的防守尖兵。`
            ]
        };

        const descList = descriptions[config.id] || descriptions.DEFENSE;
        return descList[Math.floor(Math.random() * descList.length)];
    }

    /**
     * 为高年级球员生成专项特长（入口方法）
     * @param {Object} player - 球员对象
     * @returns {Object} 处理后的球员对象
     */
    processSeniorPlayer(player) {
        // 只处理大三、大四学生
        if (player.year < 3) {
            return player;
        }

        // 判断是否生成专项球员
        if (!this.shouldGenerateSpecialist(player.year)) {
            // 非专项高年级球员也给予一定惩罚（资源不足）
            return this.applyNonSpecialistPenalty(player);
        }

        // 选择专项类型并应用调整
        const specialistType = this.selectSpecialistType();
        return this.applySpecialistAdjustment(player, specialistType);
    }

    /**
     * 对非专项高年级球员应用惩罚
     */
    applyNonSpecialistPenalty(player) {
        const year = player.year;
        const penalty = year === 3 ? 3 : 5;
        
        return {
            ...player,
            rating: Math.max(40, (player.rating || 50) - penalty),
            potential: Math.max(50, player.potential - 3),
            isCorePlayer: false,
            developmentPriority: 'low',
            specialistInfo: null
        };
    }

    /**
     * 获取专项球员的能力值显示（用于UI）
     * @param {Object} player - 球员对象
     * @returns {Object} 显示信息
     */
    getSpecialistDisplayInfo(player) {
        if (!player.specialistInfo) {
            return null;
        }

        const info = player.specialistInfo;
        return {
            icon: info.icon,
            name: info.name,
            primaryAttribute: info.primaryAttribute,
            primaryValue: info.primaryValue,
            description: info.specialistDescription,
            // 高亮显示强项属性
            highlightedAttributes: [
                info.primaryAttribute,
                ...this.specialistTypes[info.type.toUpperCase()]?.secondaryAttributes || []
            ],
            // 弱化显示的属性
            weakenedAttributes: Object.keys(
                this.specialistTypes[info.type.toUpperCase()]?.weakenedAttributes || {}
            )
        };
    }

    /**
     * 比较专项球员与普通球员
     * @param {Object} specialist - 专项球员
     * @param {Object} regular - 普通球员
     * @returns {Object} 比较结果
     */
    comparePlayers(specialist, regular) {
        const specInfo = specialist.specialistInfo;
        if (!specInfo) return null;

        const config = this.specialistTypes[specInfo.type.toUpperCase()];
        
        return {
            overallComparison: {
                specialist: specialist.rating,
                regular: regular.rating,
                difference: specialist.rating - regular.rating
            },
            primaryAttributeComparison: {
                attribute: config.primaryAttribute,
                specialist: specialist.attributes[config.primaryAttribute],
                regular: regular.attributes[config.primaryAttribute],
                advantage: specialist.attributes[config.primaryAttribute] - regular.attributes[config.primaryAttribute]
            },
            weakenedAttributesComparison: Object.entries(config.weakenedAttributes).map(([attr, _]) => ({
                attribute: attr,
                specialist: specialist.attributes[attr],
                regular: regular.attributes[attr],
                disadvantage: specialist.attributes[attr] - regular.attributes[attr]
            })),
            conclusion: specialist.rating < regular.rating 
                ? '专项球员综合能力值较低，但在特定领域有优势'
                : '综合能力值相当'
        };
    }

    /**
     * 生成专项球员的招募要求（降低要求，因为不是核心球员）
     * @param {Object} player - 球员对象
     * @returns {Object} 招募要求
     */
    generateSpecialistRequirements(player) {
        const baseRating = player.rating || 50;
        const potential = player.potential || 60;

        // 专项球员要求较低（非核心，得不到大量资源）
        return {
            minScholarship: 0.3,      // 最低30%奖学金
            preferredScholarship: 0.5, // 期望50%
            maxScholarship: 0.7,      // 最高70%
            playingTime: 15,          // 期望15分钟出场时间
            requirements: [
                '提供稳定的轮换位置',
                '允许专注于特定技能发展',
                '不保证首发位置'
            ],
            // 专项球员更容易招募
            recruitmentDifficulty: 'easy',
            acceptanceBonus: 15       // +15%接受率
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SeniorSpecialistSystem };
}
