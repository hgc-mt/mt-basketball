/**
 * 球队发展系统 - 赛季自动成长模式
 * 
 * 核心设计理念：
 * 1. 经理模式 - 玩家管理资源而非直接控制球员成长
 * 2. 自动成长 - 球员每赛季根据多种因素自动成长
 * 3. 设施投资 - 升级训练设施提升成长效率
 * 4. 教练影响 - 雇佣优秀教练促进球员发展
 * 5. 预算管理 - 合理分配预算到设施、教练、招募
 */

class TeamDevelopmentSystem {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        
        // 训练设施配置
        this.facilities = {
            trainingCenter: {
                name: '训练中心',
                description: '基础训练设施，影响所有球员成长',
                levels: [
                    { level: 1, name: '基础场馆', cost: 0, bonus: 0, maintenance: 0 },
                    { level: 2, name: '标准训练馆', cost: 50000, bonus: 5, maintenance: 5000 },
                    { level: 3, name: '现代化训练中心', cost: 150000, bonus: 10, maintenance: 15000 },
                    { level: 4, name: '顶级训练基地', cost: 300000, bonus: 15, maintenance: 30000 },
                    { level: 5, name: '传奇训练殿堂', cost: 600000, bonus: 20, maintenance: 50000 }
                ]
            },
            weightRoom: {
                name: '力量房',
                description: '提升身体属性成长速度',
                levels: [
                    { level: 1, name: '基础健身房', cost: 0, bonus: 0, maintenance: 0 },
                    { level: 2, name: '标准力量房', cost: 30000, bonus: 8, maintenance: 3000 },
                    { level: 3, name: '专业健身中心', cost: 80000, bonus: 15, maintenance: 8000 },
                    { level: 4, name: '顶级体能中心', cost: 180000, bonus: 22, maintenance: 18000 }
                ]
            },
            shootingLab: {
                name: '投篮实验室',
                description: '提升投篮属性成长速度',
                levels: [
                    { level: 1, name: '基础投篮馆', cost: 0, bonus: 0, maintenance: 0 },
                    { level: 2, name: '标准投篮房', cost: 35000, bonus: 8, maintenance: 3500 },
                    { level: 3, name: '专业投篮中心', cost: 90000, bonus: 15, maintenance: 9000 },
                    { level: 4, name: '顶级投篮实验室', cost: 200000, bonus: 22, maintenance: 20000 }
                ]
            },
            filmRoom: {
                name: '录像分析室',
                description: '提升篮球智商和战术理解',
                levels: [
                    { level: 1, name: '基础放映室', cost: 0, bonus: 0, maintenance: 0 },
                    { level: 2, name: '标准分析室', cost: 25000, bonus: 8, maintenance: 2500 },
                    { level: 3, name: '专业分析中心', cost: 70000, bonus: 15, maintenance: 7000 },
                    { level: 4, name: '顶级战术实验室', cost: 150000, bonus: 22, maintenance: 15000 }
                ]
            },
            medicalCenter: {
                name: '医疗中心',
                description: '减少伤病概率，加速恢复',
                levels: [
                    { level: 1, name: '基础医务室', cost: 0, injuryReduction: 0, recoveryBonus: 0, maintenance: 0 },
                    { level: 2, name: '标准医疗室', cost: 40000, injuryReduction: 10, recoveryBonus: 15, maintenance: 4000 },
                    { level: 3, name: '专业运动医疗中心', cost: 100000, injuryReduction: 20, recoveryBonus: 30, maintenance: 10000 },
                    { level: 4, name: '顶级康复中心', cost: 220000, injuryReduction: 30, recoveryBonus: 50, maintenance: 22000 }
                ]
            }
        };
        
        // 教练等级配置
        this.coachTiers = {
            rookie: { name: '新秀教练', salary: 50000, developmentBonus: 0, maxPotentialBoost: 0 },
            experienced: { name: '资深教练', salary: 120000, developmentBonus: 5, maxPotentialBoost: 2 },
            expert: { name: '专家教练', salary: 250000, developmentBonus: 10, maxPotentialBoost: 5 },
            elite: { name: '精英教练', salary: 500000, developmentBonus: 15, maxPotentialBoost: 8 },
            legendary: { name: '传奇教练', salary: 1000000, developmentBonus: 20, maxPotentialBoost: 12 }
        };
        
        // 成长计算公式配置
        this.growthConfig = {
            // 基础成长率（每年）
            baseGrowthRate: {
                1: 0.12,  // 大一：12%
                2: 0.18,  // 大二：18%
                3: 0.22,  // 大三：22%
                4: 0.25   // 大四：25%
            },
            
            // 上场时间影响
            playingTimeMultiplier: {
                minimal: 0.3,    // < 10分钟
                limited: 0.6,    // 10-20分钟
                moderate: 0.85,  // 20-25分钟
                significant: 1.0, // 25-30分钟
                major: 1.15,     // 30-35分钟
                star: 1.25       // > 35分钟
            },
            
            // 赛季表现影响
            performanceMultiplier: {
                poor: 0.7,       // 表现差
                belowAverage: 0.85,
                average: 1.0,
                good: 1.15,
                excellent: 1.3,
                outstanding: 1.5
            },
            
            // 潜力转化效率
            potentialEfficiency: {
                low: 0.6,        // 潜力<60
                medium: 0.75,    // 60-70
                high: 0.9,       // 70-80
                elite: 1.0,      // 80-90
                generational: 1.1 // 90+
            },
            
            // 随机波动
            randomFactor: 0.15  // ±15%
        };
        
        // 属性分类
        this.attributeCategories = {
            physical: ['strength', 'speed', 'stamina', 'vertical', 'rebounding'],
            shooting: ['shooting', 'threePoint', 'midRange', 'freeThrow'],
            offense: ['layup', 'post', 'dribbling', 'passing'],
            defense: ['perimeterD', 'interiorD', 'stealing', 'blocking'],
            mental: ['basketballIQ', 'vision', 'clutch']
        };
        
        // 设施对属性的加成映射
        this.facilityAttributeBonus = {
            weightRoom: ['strength', 'speed', 'stamina', 'vertical', 'rebounding'],
            shootingLab: ['shooting', 'threePoint', 'midRange', 'freeThrow'],
            filmRoom: ['basketballIQ', 'vision', 'perimeterD', 'interiorD', 'passing']
        };
    }
    
    /**
     * 初始化球队设施
     */
    initializeFacilities() {
        const state = this.gameStateManager.getState();
        if (!state.teamFacilities) {
            state.teamFacilities = {
                trainingCenter: 1,
                weightRoom: 1,
                shootingLab: 1,
                filmRoom: 1,
                medicalCenter: 1
            };
        }
        return state.teamFacilities;
    }
    
    /**
     * 获取设施当前等级信息
     */
    getFacilityLevel(facilityType) {
        const state = this.gameStateManager.getState();
        const facilities = this.initializeFacilities();
        const currentLevel = facilities[facilityType] || 1;
        const facility = this.facilities[facilityType];
        
        return {
            current: facility.levels[currentLevel - 1],
            next: facility.levels[currentLevel] || null,
            maxLevel: facility.levels.length,
            canUpgrade: currentLevel < facility.levels.length
        };
    }
    
    /**
     * 升级设施
     */
    upgradeFacility(facilityType) {
        const levelInfo = this.getFacilityLevel(facilityType);
        
        if (!levelInfo.canUpgrade) {
            return { success: false, message: '已达到最高等级' };
        }
        
        const upgradeCost = levelInfo.next.cost;
        
        // 检查预算
        if (window.recruitmentBudgetManager && 
            !window.recruitmentBudgetManager.hasEnoughBudget(upgradeCost)) {
            return { 
                success: false, 
                message: `预算不足，需要 $${upgradeCost.toLocaleString()}` 
            };
        }
        
        // 扣除预算
        if (window.recruitmentBudgetManager) {
            window.recruitmentBudgetManager.spendBudget(
                upgradeCost, 
                `升级${this.facilities[facilityType].name}到${levelInfo.next.name}`
            );
        }
        
        // 升级设施
        const state = this.gameStateManager.getState();
        state.teamFacilities[facilityType]++;
        
        return {
            success: true,
            facility: facilityType,
            newLevel: state.teamFacilities[facilityType],
            cost: upgradeCost,
            message: `${this.facilities[facilityType].name}升级成功！`
        };
    }
    
    /**
     * 计算设施总加成
     */
    calculateFacilityBonus(attribute = null) {
        const facilities = this.initializeFacilities();
        let totalBonus = 0;
        
        // 训练中心基础加成
        const trainingCenter = this.facilities.trainingCenter.levels[facilities.trainingCenter - 1];
        totalBonus += trainingCenter.bonus;
        
        // 特定属性加成
        if (attribute) {
            for (const [facilityType, attributes] of Object.entries(this.facilityAttributeBonus)) {
                if (attributes.includes(attribute)) {
                    const facility = this.facilities[facilityType].levels[facilities[facilityType] - 1];
                    totalBonus += facility.bonus || 0;
                }
            }
        }
        
        return totalBonus;
    }
    
    /**
     * 计算赛季维护费用
     */
    calculateMaintenanceCost() {
        const facilities = this.initializeFacilities();
        let totalCost = 0;
        
        for (const [facilityType, level] of Object.entries(facilities)) {
            const facility = this.facilities[facilityType].levels[level - 1];
            totalCost += facility.maintenance;
        }
        
        return totalCost;
    }
    
    /**
     * 计算球员赛季成长
     * 核心算法：综合设施、教练、上场时间、表现、潜力等因素
     */
    calculatePlayerGrowth(player, seasonStats) {
        const year = player.year || 1;
        const potential = player.potential || 50;
        
        // 1. 基础成长值（基于年级）
        const baseGrowth = this.growthConfig.baseGrowthRate[year] || 0.15;
        
        // 2. 设施加成
        const facilityBonus = this.calculateFacilityBonus() / 100;
        
        // 3. 教练加成
        const coachBonus = this.getCoachDevelopmentBonus() / 100;
        
        // 4. 上场时间影响
        const avgMinutes = seasonStats?.averageMinutes || 20;
        const playingTimeMultiplier = this.getPlayingTimeMultiplier(avgMinutes);
        
        // 5. 赛季表现影响
        const performanceRating = seasonStats?.performanceRating || 'average';
        const performanceMultiplier = this.growthConfig.performanceMultiplier[performanceRating] || 1.0;
        
        // 6. 潜力效率
        const potentialEfficiency = this.getPotentialEfficiency(potential);
        
        // 7. 计算各项属性成长
        const growth = {};
        const caps = this.calculateAttributeCaps(player);
        
        for (const [category, attributes] of Object.entries(this.attributeCategories)) {
            // 该类别的设施额外加成
            const categoryFacilityBonus = this.getCategoryFacilityBonus(category) / 100;
            
            attributes.forEach(attr => {
                const current = player.attributes?.[attr] || 50;
                const cap = caps[attr] || 95;
                const room = cap - current;
                
                if (room > 0) {
                    // 成长公式
                    let attrGrowth = baseGrowth * room * potentialEfficiency;
                    attrGrowth *= (1 + facilityBonus + coachBonus + categoryFacilityBonus);
                    attrGrowth *= playingTimeMultiplier;
                    attrGrowth *= performanceMultiplier;
                    
                    // 随机波动
                    const randomFactor = 1 + (Math.random() * 2 - 1) * this.growthConfig.randomFactor;
                    attrGrowth *= randomFactor;
                    
                    // 确保不超过上限
                    growth[attr] = Math.min(room, Math.max(0.5, attrGrowth));
                } else {
                    growth[attr] = 0;
                }
            });
        }
        
        return {
            growth: growth,
            totalGrowth: Object.values(growth).reduce((sum, val) => sum + val, 0),
            factors: {
                baseGrowth: baseGrowth,
                facilityBonus: facilityBonus,
                coachBonus: coachBonus,
                playingTimeMultiplier: playingTimeMultiplier,
                performanceMultiplier: performanceMultiplier,
                potentialEfficiency: potentialEfficiency
            }
        };
    }
    
    /**
     * 获取上场时间倍率
     */
    getPlayingTimeMultiplier(minutes) {
        if (minutes < 10) return this.growthConfig.playingTimeMultiplier.minimal;
        if (minutes < 20) return this.growthConfig.playingTimeMultiplier.limited;
        if (minutes < 25) return this.growthConfig.playingTimeMultiplier.moderate;
        if (minutes < 30) return this.growthConfig.playingTimeMultiplier.significant;
        if (minutes < 35) return this.growthConfig.playingTimeMultiplier.major;
        return this.growthConfig.playingTimeMultiplier.star;
    }
    
    /**
     * 获取潜力效率
     */
    getPotentialEfficiency(potential) {
        if (potential >= 90) return this.growthConfig.potentialEfficiency.generational;
        if (potential >= 80) return this.growthConfig.potentialEfficiency.elite;
        if (potential >= 70) return this.growthConfig.potentialEfficiency.high;
        if (potential >= 60) return this.growthConfig.potentialEfficiency.medium;
        return this.growthConfig.potentialEfficiency.low;
    }
    
    /**
     * 获取类别设施加成
     */
    getCategoryFacilityBonus(category) {
        const facilities = this.initializeFacilities();
        let bonus = 0;
        
        const categoryFacilityMap = {
            physical: 'weightRoom',
            shooting: 'shootingLab',
            mental: 'filmRoom'
        };
        
        const facilityType = categoryFacilityMap[category];
        if (facilityType) {
            const facility = this.facilities[facilityType].levels[facilities[facilityType] - 1];
            bonus += facility.bonus || 0;
        }
        
        return bonus;
    }
    
    /**
     * 获取教练发展加成
     */
    getCoachDevelopmentBonus() {
        const state = this.gameStateManager.getState();
        const headCoach = state.coaches?.headCoach;
        
        if (!headCoach) return 0;
        
        // 如果是培养型教练，额外加成
        const specialtyBonus = headCoach.specialty === 'playerDev' ? 5 : 0;
        
        return headCoach.developmentBonus + specialtyBonus;
    }
    
    /**
     * 计算属性上限
     */
    calculateAttributeCaps(player) {
        const potential = player.potential || 50;
        const year = player.year || 1;
        
        // 基础上限 = 潜力 + 年级加成
        const yearBonus = { 1: 0, 2: 2, 3: 4, 4: 6 }[year] || 0;
        const coachBonus = this.getCoachMaxPotentialBoost();
        
        const baseCap = Math.min(99, potential + yearBonus + coachBonus);
        
        // 各属性上限（位置影响）
        const caps = {};
        const allAttributes = [
            'strength', 'speed', 'stamina', 'vertical', 'rebounding',
            'shooting', 'threePoint', 'midRange', 'freeThrow',
            'layup', 'post', 'dribbling', 'passing',
            'perimeterD', 'interiorD', 'stealing', 'blocking',
            'basketballIQ', 'vision', 'clutch'
        ];
        
        allAttributes.forEach(attr => {
            let attrCap = baseCap;
            
            // 天赋加成
            if (player.talent) {
                const talentBonus = this.getTalentBonus(player.talent, attr);
                attrCap += talentBonus;
            }
            
            caps[attr] = Math.min(99, attrCap);
        });
        
        return caps;
    }
    
    /**
     * 获取天赋加成
     */
    getTalentBonus(talent, attribute) {
        const talentMap = {
            '得分天赋': { shooting: 5, threePoint: 3, layup: 3 },
            '防守天赋': { perimeterD: 5, interiorD: 3, stealing: 3 },
            '篮板天赋': { rebounding: 5, strength: 3 },
            '速度天赋': { speed: 5, stamina: 3 },
            '传球天赋': { passing: 5, vision: 3 },
            '投篮天赋': { shooting: 5, threePoint: 5 },
            '身体天赋': { strength: 5, vertical: 3 },
            '篮球智商': { basketballIQ: 5, vision: 3 }
        };
        
        return talentMap[talent]?.[attribute] || 0;
    }
    
    /**
     * 获取教练潜力上限提升
     */
    getCoachMaxPotentialBoost() {
        const state = this.gameStateManager.getState();
        const headCoach = state.coaches?.headCoach;
        
        if (!headCoach) return 0;
        
        const tier = this.coachTiers[headCoach.tier] || this.coachTiers.rookie;
        return tier.maxPotentialBoost;
    }
    
    /**
     * 执行赛季成长结算
     * 在赛季结束时调用
     */
    processSeasonEndGrowth() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        
        if (!userTeam || !userTeam.roster) {
            return { success: false, message: '没有球队数据' };
        }
        
        const growthResults = [];
        
        // 扣除设施维护费
        const maintenanceCost = this.calculateMaintenanceCost();
        if (window.recruitmentBudgetManager) {
            window.recruitmentBudgetManager.spendBudget(maintenanceCost, '赛季设施维护费');
        }
        
        // 处理每个球员的成长
        userTeam.roster.forEach(player => {
            // 获取球员赛季数据
            const seasonStats = this.getPlayerSeasonStats(player);
            
            // 计算成长
            const growthData = this.calculatePlayerGrowth(player, seasonStats);
            
            // 应用成长
            if (!player.attributes) player.attributes = {};
            
            for (const [attr, value] of Object.entries(growthData.growth)) {
                if (value > 0) {
                    player.attributes[attr] = (player.attributes[attr] || 50) + value;
                }
            }
            
            // 年级增长
            if (player.year < 4) {
                player.year++;
            }
            
            growthResults.push({
                player: player,
                growth: growthData.growth,
                totalGrowth: growthData.totalGrowth,
                factors: growthData.factors,
                newYear: player.year
            });
        });
        
        return {
            success: true,
            maintenanceCost: maintenanceCost,
            playerGrowths: growthResults,
            summary: {
                totalPlayers: growthResults.length,
                totalGrowth: growthResults.reduce((sum, r) => sum + r.totalGrowth, 0),
                averageGrowth: growthResults.reduce((sum, r) => sum + r.totalGrowth, 0) / growthResults.length
            }
        };
    }
    
    /**
     * 获取球员赛季统计数据
     * 从赛季记录中提取
     */
    getPlayerSeasonStats(player) {
        const state = this.gameStateManager.getState();
        const seasonStats = state.seasonStats || {};
        const playerStats = seasonStats[player.id] || {};
        
        return {
            averageMinutes: playerStats.averageMinutes || 20,
            gamesPlayed: playerStats.gamesPlayed || 20,
            performanceRating: playerStats.performanceRating || 'average',
            ppg: playerStats.ppg || 8,
            rpg: playerStats.rpg || 3,
            apg: playerStats.apg || 2
        };
    }
    
    /**
     * 获取设施升级建议
     */
    getFacilityUpgradeSuggestions() {
        const suggestions = [];
        const facilities = this.initializeFacilities();
        
        for (const [facilityType, facility] of Object.entries(this.facilities)) {
            const levelInfo = this.getFacilityLevel(facilityType);
            
            if (levelInfo.canUpgrade) {
                const upgrade = levelInfo.next;
                const current = levelInfo.current;
                
                suggestions.push({
                    facility: facilityType,
                    name: facility.name,
                    description: facility.description,
                    currentLevel: current.name,
                    nextLevel: upgrade.name,
                    cost: upgrade.cost,
                    benefit: upgrade.bonus - current.bonus,
                    maintenanceIncrease: upgrade.maintenance - current.maintenance,
                    priority: this.calculateUpgradePriority(facilityType, upgrade.bonus)
                });
            }
        }
        
        return suggestions.sort((a, b) => b.priority - a.priority);
    }
    
    /**
     * 计算升级优先级
     */
    calculateUpgradePriority(facilityType, bonus) {
        const state = this.gameStateManager.getState();
        const teamStats = state.teamStats || {};
        
        let priority = bonus;
        
        // 根据球队需求调整优先级
        if (facilityType === 'shootingLab' && teamStats.threePointPercent < 0.35) {
            priority += 5;
        }
        if (facilityType === 'weightRoom' && teamStats.reboundsPerGame < 35) {
            priority += 5;
        }
        if (facilityType === 'medicalCenter' && teamStats.injuries > 3) {
            priority += 10;
        }
        
        return priority;
    }
    
    /**
     * 获取发展报告
     */
    getDevelopmentReport() {
        const state = this.gameStateManager.getState();
        const facilities = this.initializeFacilities();
        
        return {
            facilities: {
                current: facilities,
                maintenanceCost: this.calculateMaintenanceCost(),
                totalBonus: this.calculateFacilityBonus()
            },
            coaching: {
                headCoach: state.coaches?.headCoach,
                developmentBonus: this.getCoachDevelopmentBonus(),
                maxPotentialBoost: this.getCoachMaxPotentialBoost()
            },
            upgradeSuggestions: this.getFacilityUpgradeSuggestions()
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeamDevelopmentSystem;
}
