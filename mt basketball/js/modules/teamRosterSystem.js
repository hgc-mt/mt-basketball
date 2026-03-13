/**
 * 球队阵容管理系统 - 改进版
 * 实现更真实的球队阵容配置和球员管理
 */

class TeamRosterSystem {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        
        // 阵容规模配置 - 差异化配置
        this.rosterSizeConfig = {
            minSize: 10,      // 最小阵容规模
            maxSize: 15,      // 最大阵容规模
            defaultSize: 13,  // 默认阵容规模
            
            // 根据球队级别确定阵容规模
            sizeByLevel: {
                champion: { min: 13, max: 15, preferred: 15 },    // 冠军级：满编
                strong: { min: 12, max: 15, preferred: 14 },      // 强队：接近满编
                average: { min: 11, max: 14, preferred: 13 },     // 普通队：标准规模
                weak: { min: 10, max: 13, preferred: 12 }         // 弱队：精简阵容
            }
        };
        
        // 位置配置策略 - 支持多样化阵容
        this.positionStrategies = {
            // 标准均衡配置
            balanced: {
                PG: { min: 2, max: 3, preferred: 2 },
                SG: { min: 2, max: 3, preferred: 2 },
                SF: { min: 2, max: 3, preferred: 2 },
                PF: { min: 2, max: 3, preferred: 2 },
                C: { min: 2, max: 3, preferred: 2 }
            },
            // 双塔阵容（内线优势）
            twin_towers: {
                PG: { min: 2, max: 3, preferred: 2 },
                SG: { min: 1, max: 2, preferred: 2 },
                SF: { min: 2, max: 3, preferred: 2 },
                PF: { min: 2, max: 3, preferred: 2 },
                C: { min: 3, max: 5, preferred: 4 }
            },
            // 小球阵容（外线优势）
            small_ball: {
                PG: { min: 3, max: 4, preferred: 3 },
                SG: { min: 3, max: 4, preferred: 3 },
                SF: { min: 3, max: 4, preferred: 3 },
                PF: { min: 1, max: 2, preferred: 2 },
                C: { min: 0, max: 2, preferred: 1 }
            },
            // 锋线大队
            wing_heavy: {
                PG: { min: 2, max: 3, preferred: 2 },
                SG: { min: 2, max: 4, preferred: 3 },
                SF: { min: 3, max: 5, preferred: 4 },
                PF: { min: 2, max: 3, preferred: 2 },
                C: { min: 1, max: 2, preferred: 1 }
            },
            // 后卫线优势
            guard_heavy: {
                PG: { min: 3, max: 4, preferred: 3 },
                SG: { min: 3, max: 4, preferred: 3 },
                SF: { min: 2, max: 3, preferred: 2 },
                PF: { min: 2, max: 3, preferred: 2 },
                C: { min: 1, max: 2, preferred: 1 }
            }
        };
        
        // 球员实力等级配置（基于当前能力值，非潜力）
        this.playerTiers = {
            superstar: { minRating: 85, maxRating: 99, label: '超级巨星' },
            star: { minRating: 78, maxRating: 84, label: '球星' },
            starter: { minRating: 70, maxRating: 77, label: '主力' },
            rotation: { minRating: 63, maxRating: 69, label: '轮换' },
            bench: { minRating: 55, maxRating: 62, label: '替补' },
            deep: { minRating: 45, maxRating: 54, label: '边缘' }
        };
        
        // 球队实力评估权重（以实力为核心）
        this.teamStrengthWeights = {
            top5Weight: 0.70,      // 首发5人 70%
            benchWeight: 0.20,     // 主要替补 20%
            deepWeight: 0.10       // 边缘球员 10%
        };
    }
    
    /**
     * 根据球队级别获取阵容规模
     * @param {string} teamLevel - 球队级别
     * @returns {Object} 阵容规模配置
     */
    getRosterSizeByLevel(teamLevel) {
        return this.rosterSizeConfig.sizeByLevel[teamLevel] || this.rosterSizeConfig.sizeByLevel.average;
    }
    
    /**
     * 随机选择位置策略
     * @param {string} teamLevel - 球队级别
     * @returns {Object} 位置策略
     */
    selectPositionStrategy(teamLevel) {
        const strategies = Object.keys(this.positionStrategies);
        
        // 根据球队级别调整策略概率
        let weights = {};
        switch (teamLevel) {
            case 'champion':
                weights = { balanced: 0.5, twin_towers: 0.2, small_ball: 0.15, wing_heavy: 0.1, guard_heavy: 0.05 };
                break;
            case 'strong':
                weights = { balanced: 0.4, twin_towers: 0.2, small_ball: 0.2, wing_heavy: 0.1, guard_heavy: 0.1 };
                break;
            case 'average':
                weights = { balanced: 0.5, twin_towers: 0.15, small_ball: 0.15, wing_heavy: 0.1, guard_heavy: 0.1 };
                break;
            case 'weak':
                weights = { balanced: 0.6, twin_towers: 0.1, small_ball: 0.1, wing_heavy: 0.1, guard_heavy: 0.1 };
                break;
            default:
                weights = { balanced: 0.5, twin_towers: 0.15, small_ball: 0.15, wing_heavy: 0.1, guard_heavy: 0.1 };
        }
        
        const random = Math.random();
        let cumulative = 0;
        for (const [strategy, weight] of Object.entries(weights)) {
            cumulative += weight;
            if (random <= cumulative) {
                return this.positionStrategies[strategy];
            }
        }
        return this.positionStrategies.balanced;
    }
    
    /**
     * 根据实力值获取球员等级
     * @param {number} rating - 能力值
     * @returns {string} 球员等级
     */
    getPlayerTierByRating(rating) {
        for (const [tier, config] of Object.entries(this.playerTiers)) {
            if (rating >= config.minRating && rating <= config.maxRating) {
                return tier;
            }
        }
        return 'deep';
    }
    
    /**
     * 计算球队实力 - 以当前实力为核心，非潜力
     * @param {Array} roster - 球队阵容
     * @returns {number} 球队实力评分 (0-100)
     */
    calculateTeamStrength(roster) {
        if (!roster || roster.length === 0) return 0;
        
        // 按能力值排序（不是潜力）
        const sortedRoster = [...roster].sort((a, b) => {
            const ratingA = a.rating || (a.getOverallRating ? a.getOverallRating() : 50);
            const ratingB = b.rating || (b.getOverallRating ? b.getOverallRating() : 50);
            return ratingB - ratingA;
        });
        
        // 获取各层级球员
        const top5 = sortedRoster.slice(0, 5);
        const bench = sortedRoster.slice(5, 10);
        const deep = sortedRoster.slice(10);
        
        // 计算加权实力
        let strength = 0;
        
        if (top5.length > 0) {
            const top5Avg = top5.reduce((sum, p) => {
                return sum + (p.rating || (p.getOverallRating ? p.getOverallRating() : 50));
            }, 0) / top5.length;
            strength += top5Avg * this.teamStrengthWeights.top5Weight;
        }
        
        if (bench.length > 0) {
            const benchAvg = bench.reduce((sum, p) => {
                return sum + (p.rating || (p.getOverallRating ? p.getOverallRating() : 50));
            }, 0) / bench.length;
            strength += benchAvg * this.teamStrengthWeights.benchWeight;
        }
        
        if (deep.length > 0) {
            const deepAvg = deep.reduce((sum, p) => {
                return sum + (p.rating || (p.getOverallRating ? p.getOverallRating() : 50));
            }, 0) / deep.length;
            strength += deepAvg * this.teamStrengthWeights.deepWeight;
        }
        
        return Math.min(99, Math.round(strength));
    }
    
    /**
     * 计算球队声望 - 基于实力而非潜力
     * @param {Array} roster - 球队阵容
     * @param {Object} teamHistory - 球队历史战绩
     * @returns {number} 声望值 (0-100)
     */
    calculateTeamReputation(roster, teamHistory = null) {
        if (!roster || roster.length === 0) return 40;
        
        // 基础声望：基于球队实力
        const teamStrength = this.calculateTeamStrength(roster);
        let reputation = teamStrength * 0.8; // 实力占80%
        
        // 历史战绩加成（如果有）
        if (teamHistory) {
            const championshipBonus = (teamHistory.championships || 0) * 3;
            const playoffBonus = (teamHistory.playoffAppearances || 0) * 0.5;
            const recentSuccess = (teamHistory.recentWinRate || 0) * 10;
            reputation += championshipBonus + playoffBonus + recentSuccess;
        }
        
        // 阵容深度加成
        const rosterSize = roster.length;
        if (rosterSize >= 13) reputation += 2;
        else if (rosterSize < 11) reputation -= 3;
        
        return Math.min(99, Math.max(30, Math.round(reputation)));
    }
    
    /**
     * 识别球队需求 - 基于位置策略
     * @param {Array} roster - 当前阵容
     * @param {Object} positionStrategy - 位置策略
     * @returns {Array} 需求列表
     */
    identifyTeamNeeds(roster, positionStrategy = null) {
        const needs = [];
        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        
        if (!positionStrategy) {
            positionStrategy = this.positionStrategies.balanced;
        }
        
        // 统计各位置人数
        const positionCount = {};
        positions.forEach(pos => positionCount[pos] = 0);
        
        roster.forEach(player => {
            const pos = player.position || 'SF';
            if (positionCount[pos] !== undefined) {
                positionCount[pos]++;
            }
        });
        
        // 根据策略识别需求
        positions.forEach(pos => {
            const config = positionStrategy[pos];
            const current = positionCount[pos];
            
            if (current < config.min) {
                needs.push({ 
                    position: pos, 
                    priority: 'high', 
                    type: 'position_need',
                    current: current,
                    target: config.preferred
                });
            } else if (current < config.preferred) {
                needs.push({ 
                    position: pos, 
                    priority: 'medium', 
                    type: 'position_need',
                    current: current,
                    target: config.preferred
                });
            }
        });
        
        // 检查阵容规模需求
        const rosterSize = roster.length;
        if (rosterSize < this.rosterSizeConfig.defaultSize) {
            needs.push({
                position: 'any',
                priority: rosterSize < 11 ? 'high' : 'medium',
                type: 'roster_size',
                current: rosterSize,
                target: this.rosterSizeConfig.defaultSize
            });
        }
        
        return needs;
    }
    
    /**
     * 生成符合策略的阵容
     * @param {string} teamLevel - 球队级别
     * @param {Object} style - 球队风格
     * @returns {Object} 生成配置
     */
    generateRosterConfig(teamLevel, style) {
        const sizeConfig = this.getRosterSizeByLevel(teamLevel);
        const targetSize = sizeConfig.preferred;
        
        // 选择位置策略
        const positionStrategy = this.selectPositionStrategy(teamLevel);
        
        // 生成各位置目标人数
        const positionTargets = {};
        let totalTarget = 0;
        
        for (const [pos, config] of Object.entries(positionStrategy)) {
            // 在min和preferred之间随机
            const target = config.min + Math.floor(Math.random() * (config.preferred - config.min + 1));
            positionTargets[pos] = target;
            totalTarget += target;
        }
        
        // 调整总人数到目标规模
        if (totalTarget !== targetSize) {
            const diff = targetSize - totalTarget;
            // 随机调整某些位置
            const positions = Object.keys(positionTargets);
            for (let i = 0; i < Math.abs(diff); i++) {
                const pos = positions[Math.floor(Math.random() * positions.length)];
                const maxPos = positionStrategy[pos].max;
                if (diff > 0 && positionTargets[pos] < maxPos) {
                    positionTargets[pos]++;
                } else if (diff < 0 && positionTargets[pos] > positionStrategy[pos].min) {
                    positionTargets[pos]--;
                }
            }
        }
        
        return {
            targetSize: targetSize,
            positionTargets: positionTargets,
            positionStrategy: positionStrategy
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeamRosterSystem;
}
