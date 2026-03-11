/**
 * Game Initialization module
 * Handles game setup and utility functions
 */

// import { Player, Coach, Team } from './dataModels.js';
// import { GameConstants, FirstNames, LastNames, Positions, TeamNames, Conferences, CoachArchetypes } from '../data/gameData.js';

/**
 * 年龄与年级对应配置
 * 确保年龄数据符合大学篮球运动员实际情况
 */
const AgeYearConfig = {
    1: { name: '大一', minAge: 18, maxAge: 20, description: '新生球员，年轻且充满潜力' },
    2: { name: '大二', minAge: 19, maxAge: 22, description: '二年级学生，开始适应大学篮球节奏' },
    3: { name: '大三', minAge: 20, maxAge: 23, description: '三年级球员，技术逐渐成熟' },
    4: { name: '大四', minAge: 21, maxAge: 25, description: '经验丰富的老将，技术全面' }
};

/**
 * 潜力评估配置 - 增强版
 * 让强队更强，冠军球队能力达到90
 * 
 * 调整思路：
 * - 超级天才(95+潜力)：约0.3%概率（300人中1人）- 十年一遇
 * - 顶级精英(90-94潜力)：约2-3%概率（每年2-3人）
 * - 优秀(80-89潜力)：约15-20%概率（每年15-25人）
 * - 基础能力提高，让强队平均85，冠军90
 */
const PotentialConfig = {
    // 大一新生基础潜力值配置（用于其他球队球员）
    freshmanBase: {
        mean: 72,                   // 平均值提高到72
        stdDev: 6,                  // 标准差
        // 分层潜力概率 - 提高精英概率
        superstarRate: 0.003,       // 0.3% 超级天才 (95-99) - 十年一遇
        superstarMin: 95,
        topEliteRate: 0.025,        // 2.5% 顶级精英 (90-94) - 每年2-3人
        topEliteMin: 90,
        excellentRate: 0.18,        // 18% 优秀 (80-89) - 每年15-25人
        excellentMin: 80
    },
    
    // 招募中心/资源池球员配置（玩家招募渠道）
    poolPlayerBase: {
        mean: 74,                   // 平均值更高
        stdDev: 6,                  // 标准差
        superstarRate: 0.005,       // 0.5% 超级天才 (95-99)
        superstarMin: 95,
        topEliteRate: 0.03,         // 3% 顶级精英 (90-94)
        topEliteMin: 90,
        excellentRate: 0.20,        // 20% 优秀 (80-89)
        excellentMin: 80
    },
    
    // 高能力+高潜力组合控制（关键配置）
    // 逻辑：提高基础能力，让强队平均85，冠军90
    // 80-89潜力：能力78左右（优秀球员）
    // 90-94潜力：能力80左右（精英球员）
    // 95+潜力：超级天才，能力82-88
    highPotentialRatingCap: {
        // 普通球员基础能力（潜力<80）
        normal: { baseRating: 75, variance: 8 },  // 基础75，范围67-83
        
        // 80-89潜力：优秀球员，能力78左右
        80: { baseRating: 78, maxRating: 82, highRatingChance: 0.4 },   // 基础78，40%到82
        
        // 90-94潜力：精英球员，能力80左右
        90: { baseRating: 80, maxRating: 85, highRatingChance: 0.5 },   // 基础80，50%到85
        
        // 95+潜力：超级天才，能力82-88
        95: { baseRating: 82, maxRating: 88, highRatingChance: 0.6 }    // 基础82，60%到88
    },
    
    // 年级成长配置 - 增强版
    yearDecay: {
        1: { potentialDecay: 0, ratingBoost: 0 },           // 大一：基础
        2: { potentialDecay: { min: 8, max: 15 }, ratingBoost: { min: 10, max: 15 } },   // 大二：+10-15
        3: { potentialDecay: { min: 10, max: 18 }, ratingBoost: { min: 12, max: 18 } },  // 大三：+12-18
        4: { potentialDecay: { min: 15, max: 25 }, ratingBoost: { min: 15, max: 22 } }   // 大四：+15-22
    },
    
    // 潜力等级阈值
    potentialLevels: {
        elite: { min: 90, color: '#ef4444', label: 'elite', icon: '👑', borderColor: '#ef4444' },
        excellent: { min: 80, color: '#f59e0b', label: 'excellent', icon: '⭐', borderColor: '#f59e0b' },
        good: { min: 70, color: '#3b82f6', label: 'good', icon: '💎', borderColor: '#3b82f6' },
        normal: { min: 50, color: '#6b7280', label: 'normal', icon: '📋', borderColor: '#6b7280' }
    },
    
    // 战力等级阈值
    ratingLevels: {
        star: { min: 80, color: '#ef4444', label: '球星' },
        starter: { min: 70, color: '#f59e0b', label: '主力' },
        rotation: { min: 60, color: '#3b82f6', label: '轮换' },
        bench: { min: 50, color: '#6b7280', label: '替补' }
    }
};

/**
 * 球员资源池配置
 * 控制球员数量和分类
 */
const PlayerPoolConfig = {
    // 球员总数范围
    totalMin: 80,
    totalMax: 100,
    
    // 球员分类比例
    freeAgentRatio: 0.45,     // 45% 自由球员（主要是大一新生）
    transferWantedRatio: 0.55, // 55% 转会球员（大二、大三、大四）
    
    // 位置分布
    positionDistribution: {
        PG: 0.2,  // 控球后卫
        SG: 0.2,  // 得分后卫
        SF: 0.2,  // 小前锋
        PF: 0.2,  // 大前锋
        C: 0.2    // 中锋
    },
    
    // 年级分布 - 调整为更符合实际情况
    yearDistribution: {
        1: 0.45, // 大一 45% - 新生是主力，每个学校需要招4-5名新生
        2: 0.20, // 大二 20% - 主要是转会球员
        3: 0.20, // 大三 20% - 主要是转会球员
        4: 0.15  // 大四 15% - 退役前最后搏一次机会
    },
    
    // 技术特点配置
    technicalInfo: {
        strongFootOptions: ['右手', '左手', '双手均衡'],
        playStyleOptions: ['攻守平衡', '进攻型', '防守型', '组织型', '全能型'],
        bestSkillOptions: ['投篮', '突破', '组织进攻', '篮板', '盖帽', '抢断', '关键球'],
        weaknessOptions: ['防守', '投篮', '体能', '篮板', '组织', '经验']
    },
    
    // 转会原因
    transferReasons: [
        '寻求更多出场时间',
        '转会窗口开放',
        '与教练理念不合',
        '家庭原因',
        '追求更好的发展',
        '合同到期',
        '球队重建'
    ],
    
    formerTeamNames: [
        '橡树高中', '山景高中', '湖滨高中', '中央高中', '东城高中',
        '第一大学', '州立大学', '理工大学', '文理学院', '体育学院'
    ]
};

/**
 * 球员背景资料配置
 */
const PlayerBackgroundConfig = {
    highSchoolTypes: ['重点高中', '普通高中', '体育特长校', '国际学校', '社区学校'],
    playStyles: ['攻守均衡', '进攻型', '防守型', '团队配合', '个人单打'],
    specialties: ['三分球', '突破', '组织', '篮板', '盖帽', '抢断', '关键球'],
    achievements: ['MVP', '最佳阵容', '得分王', '篮板王', '助攻王', '最佳防守', '明星赛', '州冠军', '全国冠军'],
    injuryTypes: ['无', '轻微扭伤', '肌肉拉伤', '骨折', '膝盖伤病', '脚踝伤病']
};

/**
 * Game Initialization class
 * Handles game setup and utility functions
 */
class GameInitializer {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.potentialDistribution = { elite: 0, excellent: 0, good: 0, normal: 0 };
        
        // 初始化新的评级系统
        this.ratingSystem = new PlayerRatingSystem();
        
        // 初始化球员成长系统
        this.growthSystem = new PlayerGrowthSystem(gameStateManager);
        
        // 初始化高年级专项系统
        this.seniorSpecialistSystem = new SeniorSpecialistSystem();
        
        // 初始化AI教练系统
        this.aiCoachingSystem = new AICoachingSystem(gameStateManager);
        
        // 初始化招募竞争系统
        this.recruitmentCompetitionSystem = new RecruitmentCompetitionSystem(
            gameStateManager, 
            this.aiCoachingSystem
        );
    }

    /**
     * Initialize the game initializer
     */
    async initialize() {
        // GameInitializer doesn't need complex initialization
        // It's ready to use immediately
        return;
    }

    /**
     * Initialize a new game
     */
    initializeNewGame() {
        // Reset game state to defaults first
        this.gameStateManager.reset();
        
        // Set current date to July 15, 2024 (start of recruitment season after gaokao)
        // 高考结束后的7月是大学篮球招生季
        const offseasonStart = new Date(2024, 6, 15); // July 15, 2024
        this.gameStateManager.set('currentDate', offseasonStart);
        this.gameStateManager.set('currentSeason', 2024);
        this.gameStateManager.set('seasonPhase', 'offseason');
        
        // Create teams
        const allTeams = this.createTeams();

        // Create coaches
        const allCoaches = this.createCoaches();

        // Create available players using new pool system
        // Pass any number, pool will determine size based on config
        const availablePlayers = this.createPlayers(1);
        console.log('Created player pool:', availablePlayers.length, 'players');
        
        // Count by status
        const freshmen = availablePlayers.filter(p => p.status === 'freshman_recruit').length;
        const freeAgents = availablePlayers.filter(p => p.status === 'free_agent').length;
        const transfers = availablePlayers.filter(p => p.status === 'transfer_wanted').length;
        console.log(`Pool breakdown: ${freshmen} 新生招募, ${freeAgents} 自由球员, ${transfers} 转学生`);

        // Create user team - 玩家创建全新球队
        const userTeam = this.createUserTeam();

        // Create available coaches
        const availableCoaches = this.createAvailableCoaches();

        // Update game state
        this.gameStateManager.update({
            allTeams: allTeams,
            userTeam: userTeam,
            availablePlayers: availablePlayers,
            allCoaches: allCoaches,
            availableCoaches: availableCoaches
        });

        // Save game state
        this.gameStateManager.saveGameState();

        // Generate initial schedule
        this.generateInitialSchedule(allTeams);

        return {
            allTeams: allTeams,
            userTeam: userTeam,
            availablePlayers: availablePlayers,
            allCoaches: allCoaches,
            availableCoaches: availableCoaches
        };
    }

    /**
     * Validate age and year relationship
     * @param {number} age - Player age
     * @param {number} year - Academic year (1-4)
     * @returns {boolean} Whether the age-year relationship is valid
     */
    validateAgeYearRelationship(age, year) {
        const config = AgeYearConfig[year];
        if (!config) return false;
        return age >= config.minAge && age <= config.maxAge;
    }

    /**
     * Generate valid age based on year
     * @param {number} year - Academic year (1-4)
     * @returns {number} Valid age for the year
     */
    generateAgeForYear(year) {
        const config = AgeYearConfig[year];
        if (!config) return 18;
        return config.minAge + Math.floor(Math.random() * (config.maxAge - config.minAge + 1));
    }

    /**
     * Get year from age (for backwards compatibility)
     * @param {number} age - Player age
     * @returns {number} Academic year (1-4)
     */
    getYearFromAge(age) {
        if (age >= 21 && age <= 25) return 4;
        if (age >= 20 && age <= 23) return 3;
        if (age >= 19 && age <= 22) return 2;
        return 1;
    }

    /**
     * Generate player potential based on year and distribution
     * 使用新的评级系统生成潜力值
     * @param {number} year - Academic year (1-4)
     * @param {boolean} isFreshmanClass - Whether this is part of the current freshman generation
     * @returns {number} Generated potential
     */
    generatePotential(year, isFreshmanClass = false, age = null) {
        // 使用新的评级系统的正态分布生成潜力值
        const baseConfig = PotentialConfig.freshmanBase;
        
        // 基础潜力值（正态分布）
        let potential = this.ratingSystem.normalDistribution(
            baseConfig.mean,
            baseConfig.stdDev,
            60,  // 最小值提高
            88   // 最大值
        );
        
        // 分层潜力生成 - 增强版
        const random = Math.random();
        
        // 超级天才 (95-99)：0.3% - 十年一遇
        if (random < baseConfig.superstarRate) {
            potential = baseConfig.superstarMin + Math.floor(Math.random() * 5);
            this.potentialDistribution.elite++;
        } 
        // 顶级精英 (90-94)：2.5% - 每年2-3人
        else if (random < baseConfig.superstarRate + baseConfig.topEliteRate) {
            potential = baseConfig.topEliteMin + Math.floor(Math.random() * 5);
            this.potentialDistribution.excellent++;
        } 
        // 优秀 (80-89)：18% - 每年15-25人
        else if (random < baseConfig.superstarRate + baseConfig.topEliteRate + baseConfig.excellentRate) {
            potential = baseConfig.excellentMin + Math.floor(Math.random() * 10);
            this.potentialDistribution.good++;
        }
        
        // 根据年级调整潜力（高年级潜力降低）
        const yearDecay = { 1: 0, 2: -3, 3: -6, 4: -10 };
        potential += yearDecay[year] || 0;
        
        // 根据年龄进一步调整潜力（年龄越大潜力越低）
        if (age !== null) {
            const baseAge = 18; // 基础年龄
            const ageDiff = age - baseAge;
            if (ageDiff > 0) {
                // 每大一岁，潜力额外降低 2-4 点
                const ageDecay = ageDiff * (2 + Math.floor(Math.random() * 3));
                potential -= ageDecay;
            }
        }
        
        return Math.min(99, Math.max(50, Math.round(potential)));
    }

    /**
     * Calculate potential based on year and attributes - 全新科学模型
     * @param {number} year - Academic year (1-4)
     * @param {Object} attributes - Player attributes
     * @param {number} baseRating - Player's overall rating
     * @param {boolean} isFreshmanClass - Whether this is part of the current freshman generation
     * @param {boolean} isPoolPlayer - Whether this player is from the recruitment pool
     * @returns {number} Calculated potential
     */
    calculatePotential(year, attributes, baseRating, isFreshmanClass = false, isPoolPlayer = false, age = null) {
        // 统一使用 generatePotential 方法，确保潜力分布符合配置
        const baseConfig = isPoolPlayer ? PotentialConfig.poolPlayerBase : PotentialConfig.freshmanBase;
        
        // 基础潜力值（正态分布）
        let potential = this.ratingSystem.normalDistribution(
            baseConfig.mean,
            baseConfig.stdDev,
            60,  // 最小值提高
            88   // 最大值
        );
        
        // 分层潜力生成 - 增强版
        const random = Math.random();
        
        // 超级天才 (95-99)：0.3-0.5%
        if (random < baseConfig.superstarRate) {
            potential = baseConfig.superstarMin + Math.floor(Math.random() * 5);
            this.potentialDistribution.elite++;
        } 
        // 顶级精英 (90-94)：2.5-3%
        else if (random < baseConfig.superstarRate + baseConfig.topEliteRate) {
            potential = baseConfig.topEliteMin + Math.floor(Math.random() * 5);
            this.potentialDistribution.excellent++;
        } 
        // 优秀 (80-89)：18-20%
        else if (random < baseConfig.superstarRate + baseConfig.topEliteRate + baseConfig.excellentRate) {
            potential = baseConfig.excellentMin + Math.floor(Math.random() * 10);
            this.potentialDistribution.good++;
        }
        
        // 根据年级调整潜力（高年级潜力降低）
        const yearDecay = { 1: 0, 2: -3, 3: -6, 4: -10 };
        potential += yearDecay[year] || 0;
        
        // 根据年龄进一步调整潜力（年龄越大潜力越低）
        if (age !== null) {
            const baseAge = 18; // 基础年龄
            const ageDiff = age - baseAge;
            if (ageDiff > 0) {
                // 每大一岁，潜力额外降低 2-4 点
                const ageDecay = ageDiff * (2 + Math.floor(Math.random() * 3));
                potential -= ageDecay;
            }
        }
        
        return Math.min(99, Math.max(50, Math.round(potential)));
    }
    
    /**
     * 根据当前能力值反推原始潜力值
     * @param {number} currentRating - 当前能力值
     * @param {number} year - 年级
     * @returns {number} 原始潜力值
     */
    estimateOriginalPotential(currentRating, year) {
        const base = currentRating + 8;
        const adjustment = (year - 1) * 6;
        return Math.min(95, base + adjustment);
    }
    
    /**
     * 计算球员战力 - 使用新的成长系统
     * @param {number} year - Academic year (1-4)
     * @param {Object} attributes - Player attributes
     * @param {number} baseRating - 基础能力值
     * @param {number} potential - 潜力值
     * @param {Array} talents - 天赋列表
     * @returns {number} 最终能力值
     */
    calculateRatingWithGrowth(year, attributes, baseRating, potential = null, talents = []) {
        if (year === 1) {
            return Math.round(baseRating);
        }
        
        // 如果没有提供潜力值，估算一个
        if (potential === null) {
            potential = baseRating + 10 + Math.floor(Math.random() * 10);
        }
        
        // 创建临时球员对象用于成长计算
        const tempPlayer = {
            year: year,
            rating: baseRating,
            potential: potential,
            attributes: attributes,
            talents: talents
        };
        
        // 使用新的成长系统计算成长
        // 模拟之前年级的成长累积
        let currentRating = baseRating;
        for (let y = 2; y <= year; y++) {
            const growthResult = this.growthSystem.calculateYearlyGrowth(
                { ...tempPlayer, rating: currentRating, year: y },
                'normal',  // 默认正常培养
                0.5        // 默认50%出场时间
            );
            currentRating = growthResult.newRating;
        }
        
        return Math.round(currentRating);
    }
    
    /**
     * 随机数生成（指定范围）
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机数
     */
    randomInRange(min, max) {
        if (typeof min === 'number' && typeof max === 'number') {
            return min + Math.random() * (max - min);
        }
        return 0;
    }
    
    /**
     * 获取潜力等级信息
     * @param {number} potential - 潜力值
     * @returns {Object} 潜力等级信息
     */
    getPotentialLevel(potential) {
        if (potential >= 90) return PotentialConfig.potentialLevels.elite;
        if (potential >= 80) return PotentialConfig.potentialLevels.excellent;
        if (potential >= 70) return PotentialConfig.potentialLevels.good;
        return PotentialConfig.potentialLevels.normal;
    }
    
    /**
     * 获取战力等级信息
     * @param {number} rating - 能力值
     * @returns {Object} 战力等级信息
     */
    getRatingLevel(rating) {
        if (rating >= 80) return PotentialConfig.ratingLevels.star;
        if (rating >= 70) return PotentialConfig.ratingLevels.starter;
        if (rating >= 60) return PotentialConfig.ratingLevels.rotation;
        return PotentialConfig.ratingLevels.bench;
    }
    
    /**
     * 生成球员背景资料
     * @param {string} position - 位置
     * @param {number} year - 年级
     * @returns {Object} 背景资料
     */
    generatePlayerBackground(position, year) {
        const highSchoolType = PlayerBackgroundConfig.highSchoolTypes[
            Math.floor(Math.random() * PlayerBackgroundConfig.highSchoolTypes.length)
        ];
        
        const playStyle = PlayerBackgroundConfig.playStyles[
            Math.floor(Math.random() * PlayerBackgroundConfig.playStyles.length)
        ];
        
        const specialtyCount = 1 + Math.floor(Math.random() * 2);
        const specialties = [];
        const availableSpecialties = [...PlayerBackgroundConfig.specialties];
        
        for (let i = 0; i < specialtyCount && availableSpecialties.length > 0; i++) {
            const index = Math.floor(Math.random() * availableSpecialties.length);
            specialties.push(availableSpecialties.splice(index, 1)[0]);
        }
        
        const achievementCount = Math.random() < 0.3 ? (1 + Math.floor(Math.random() * 3)) : 0;
        const achievements = [];
        for (let i = 0; i < achievementCount; i++) {
            achievements.push(PlayerBackgroundConfig.achievements[
                Math.floor(Math.random() * PlayerBackgroundConfig.achievements.length)
            ]);
        }
        
        const injuryRoll = Math.random();
        const hasInjuryHistory = injuryRoll < 0.2;
        const injuryType = hasInjuryHistory
            ? PlayerBackgroundConfig.injuryTypes[1 + Math.floor(Math.random() * (PlayerBackgroundConfig.injuryTypes.length - 1))]
            : '无';

        const yearsAtHighSchool = year === 1 ? '高三' : (year === 2 ? '毕业' : '高四');
        
        return {
            highSchool: `${highSchoolType}明星球员`,
            yearsAtHighSchool: yearsAtHighSchool,
            playStyle: playStyle,
            specialties: specialties,
            achievements: achievements,
            injuryHistory: injuryType,
            height: this.generateHeight(position),
            weight: this.generateWeight(position),
            wingspan: this.generateWingspan(position),
            verticalLeap: this.generateVerticalLeap(year),
            highlightVideo: Math.random() < 0.1 // 10% 概率有集锦
        };
    }
    
    /**
     * 生成球员身高
     */
    generateHeight(position) {
        const baseHeights = { 'PG': 185, 'SG': 190, 'SF': 198, 'PF': 203, 'C': 210 };
        const base = baseHeights[position] || 190;
        const variation = Math.floor(Math.random() * 20) - 10;
        const height = base + variation;
        return `${Math.floor(height / 30.48)}'${Math.round((height / 2.54) % 12)}"`;
    }
    
    /**
     * 生成球员体重
     */
    generateWeight(position) {
        const baseWeights = { 'PG': 82, 'SG': 88, 'SF': 95, 'PF': 105, 'C': 115 };
        const base = baseWeights[position] || 90;
        const variation = Math.floor(Math.random() * 15) - 7;
        return `${base + variation}kg`;
    }
    
    /**
     * 生成臂展
     */
    generateWingspan(position) {
        const base = { 'PG': 190, 'SG': 195, 'SF': 205, 'PF': 210, 'C': 220 };
        const baseWingspan = base[position] || 195;
        const variation = Math.floor(Math.random() * 15) - 5;
        return `${baseWingspan + variation}cm`;
    }
    
    /**
     * 生成垂直弹跳（随年级提升）
     */
    generateVerticalLeap(year) {
        const base = 65 + Math.floor(Math.random() * 15);
        const boost = (year - 1) * 3;
        return `${base + boost}cm`;
    }

    /**
     * 生成球员性格维度评分
     * @returns {Object} 各维度评分 (0-100)
     */
    generatePlayerPersonalityDimensions() {
        // 如果配置系统存在，使用配置系统
        if (typeof PlayerPersonalityConfig !== 'undefined') {
            return PlayerPersonalityConfig.generatePersonalityDimensions();
        }

        // 默认实现：生成正态分布的随机值
        const dimensions = {};
        const dimNames = ['ambition', 'teamOrientation', 'workEthic', 'moneyFocus',
                         'competitiveness', 'loyalty', 'patience', 'pressureHandling'];

        for (const dim of dimNames) {
            // 使用Box-Muller变换生成正态分布
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            let value = Math.round(50 + z * 15);
            value = Math.max(0, Math.min(100, value));
            dimensions[dim] = value;
        }

        return dimensions;
    }

    /**
     * 验证潜力值分布
     * @param {Array} players - 球员数组
     * @returns {Object} 分布统计和验证结果
     */
    validatePotentialDistribution(players) {
        const stats = {
            total: players.length,
            distribution: { elite: 0, excellent: 0, good: 0, normal: 0 },
            percentages: {}
        };
        
        for (const player of players) {
            if (player.year === 1) {
                const level = this.getPotentialLevel(player.potential);
                stats.distribution[level.label]++;
            }
        }
        
        const freshmanCount = players.filter(p => p.year === 1).length;
        if (freshmanCount > 0) {
            stats.percentages = {
                elite: (stats.distribution.elite / freshmanCount * 100).toFixed(2),
                excellent: (stats.distribution.excellent / freshmanCount * 100).toFixed(2),
                good: (stats.distribution.good / freshmanCount * 100).toFixed(2)
            };
        }
        
        stats.isValid = 
            parseFloat(stats.percentages.elite) >= 0.4 && 
            parseFloat(stats.percentages.elite) <= 0.6 &&
            parseFloat(stats.percentages.excellent) >= 4 &&
            parseFloat(stats.percentages.excellent) <= 6;
        
        return stats;
    }
    
    /**
     * 修正异常潜力值
     * @param {number} potential - 原始潜力值
     * @returns {number} 修正后的潜力值
     */
    fixAbnormalPotential(potential) {
        if (potential < 50) return 50;
        if (potential > 100) return 99;
        return Math.round(potential);
    }

    /**
     * Create all teams with unique styles
     * @returns {Array} Array of team objects
     */
    createTeams() {
        const teams = [];

        // Create teams from each conference
        for (const [conferenceId, conference] of Object.entries(Conferences)) {
            for (const teamName of conference.teams) {
                const teamData = TeamNames[conferenceId][teamName];
                
                // 为球队分配风格
                const styleId = TeamStylesConfig.assignStyleForTeam(teamName);
                const style = TeamStylesConfig.getStyle(styleId);
                
                const team = new Team({
                    id: teamData.id,
                    name: teamName,
                    conference: conferenceId,
                    funds: teamData.funds,
                    scholarships: GameConstants.MAX_SCHOLARSHIPS,
                    roster: [],
                    // 添加风格信息
                    styleId: styleId,
                    styleName: style.name,
                    reputation: style.characteristics.reputation,
                    facilities: style.characteristics.facilities,
                    academicPrestige: style.characteristics.academicPrestige,
                    fanSupport: style.characteristics.fanSupport
                });

                // 根据风格生成阵容
                this.generateTeamRosterWithStyle(team, style);

                teams.push(team);
            }
        }

        return teams;
    }

    /**
     * Generate initial roster for a team with proper scholarship distribution
     * 使用新的5级奖学金系统（总额5份）
     * @param {Team} team - Team to generate roster for
     */
    generateTeamRoster(team) {
        // 默认使用均衡风格
        const defaultStyle = TeamStylesConfig.getStyle('BALANCED_PROGRAM');
        this.generateTeamRosterWithStyle(team, defaultStyle);
    }
    
    /**
     * 根据球队风格生成阵容 - 新版按球队级别分配潜力
     * @param {Team} team - 球队对象
     * @param {Object} style - 球队风格配置
     */
    generateTeamRosterWithStyle(team, style) {
        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        const preferredPositions = style.playerPreferences.preferredPositions || positions;
        
        // 根据球队级别确定潜力分配策略
        const teamLevel = this.getTeamLevelByStyle(style);
        const potentialDistribution = this.getPotentialDistributionByTeamLevel(teamLevel);
        
        let playerIndex = 0;
        
        // 按潜力等级生成球员
        for (const tier of potentialDistribution) {
            for (let i = 0; i < tier.count; i++) {
                // 根据风格优先选择位置
                let position;
                if (playerIndex < preferredPositions.length) {
                    position = preferredPositions[playerIndex % preferredPositions.length];
                } else {
                    position = positions[playerIndex % positions.length];
                }
                
                // 根据年级分布生成球员
                const year = this.getYearByRosterPosition(playerIndex);
                const potential = this.generatePotentialForTier(tier.level);
                
                // 创建球员
                const player = this.createPlayerWithCorrectAgeAndPotential(position, year, false, potential);
                
                // 根据风格调整属性权重
                this.adjustPlayerAttributesByStyle(player, style);
                
                // 设置奖学金 - 根据球员等级
                const scholarshipInfo = this.getScholarshipForTier(tier.level);
                player.scholarship = scholarshipInfo.percentage;
                player.scholarshipLevel = scholarshipInfo.level;
                
                // 同步更新scholarshipRequirement
                player.scholarshipRequirement = this.generateScholarshipRequirement(
                    player.potential, 
                    player.rating || player.getOverallRating(), 
                    player.year
                );
                
                team.addPlayer(player);
                playerIndex++;
            }
        }
    }
    
    /**
     * 根据风格确定球队级别
     * @param {Object} style - 球队风格
     * @returns {string} 球队级别
     */
    getTeamLevelByStyle(style) {
        switch (style.id) {
            case 'ELITE_DYNASTY':
                return 'champion';      // 冠军级
            case 'OFFENSIVE_SHOWTIME':
            case 'DEFENSIVE_JUGGERNAUT':
                return 'strong';        // 强队
            case 'ACADEMIC_POWERHOUSE':
            case 'BALANCED_PROGRAM':
                return 'average';       // 普通队
            case 'UNDERDOG_GRIT':
            case 'DEVELOPMENT_FOCUSED':
                return 'weak';          // 弱队
            default:
                return 'average';
        }
    }
    
    /**
     * 根据球队级别获取潜力分配
     * @param {string} teamLevel - 球队级别
     * @returns {Array} 潜力分配配置
     */
    getPotentialDistributionByTeamLevel(teamLevel) {
        const distributions = {
            // 冠军级球队 - 3名核心(90+能力)，5名主力，7名替补
            champion: [
                { level: 'superstar', count: 1 },   // 超级天才 95+潜力
                { level: 'elite', count: 2 },       // 精英 90-94潜力
                { level: 'starter', count: 3 },     // 主力 85-89潜力
                { level: 'rotation', count: 2 },    // 轮换 80-84潜力
                { level: 'bench', count: 3 },       // 替补 75-79潜力
                { level: 'deep', count: 4 }         // 边缘 70-74潜力
            ],
            // 强队 - 1-2名核心，4名主力
            strong: [
                { level: 'elite', count: 1 },       // 精英 90-94潜力
                { level: 'starter', count: 2 },     // 主力 85-89潜力
                { level: 'rotation', count: 3 },    // 轮换 80-84潜力
                { level: 'bench', count: 4 },       // 替补 75-79潜力
                { level: 'deep', count: 5 }         // 边缘 70-74潜力
            ],
            // 普通队 - 没有核心，3名主力
            average: [
                { level: 'starter', count: 1 },     // 主力 85-89潜力
                { level: 'rotation', count: 2 },    // 轮换 80-84潜力
                { level: 'bench', count: 4 },       // 替补 75-79潜力
                { level: 'deep', count: 8 }         // 边缘 70-74潜力
            ],
            // 弱队 - 没有高潜力球员
            weak: [
                { level: 'rotation', count: 1 },    // 轮换 80-84潜力
                { level: 'bench', count: 3 },       // 替补 75-79潜力
                { level: 'deep', count: 11 }        // 边缘 70-74潜力
            ]
        };
        
        return distributions[teamLevel] || distributions.average;
    }
    
    /**
     * 根据球员等级生成潜力
     * @param {string} tier - 球员等级
     * @returns {number} 潜力值
     */
    generatePotentialForTier(tier) {
        const ranges = {
            superstar: { min: 95, max: 99 },    // 十年一遇
            elite: { min: 90, max: 94 },        // 顶级精英
            starter: { min: 85, max: 89 },      // 主力
            rotation: { min: 80, max: 84 },     // 轮换
            bench: { min: 75, max: 79 },        // 替补
            deep: { min: 70, max: 74 }          // 边缘
        };
        
        const range = ranges[tier] || { min: 70, max: 75 };
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }
    
    /**
     * 根据球员等级获取奖学金
     * @param {string} tier - 球员等级
     * @returns {Object} 奖学金信息
     */
    getScholarshipForTier(tier) {
        const scholarships = {
            superstar: { level: 'full', percentage: 1.0 },
            elite: { level: 'full', percentage: 1.0 },
            starter: { level: 'major', percentage: 0.6 },
            rotation: { level: 'partial', percentage: 0.35 },
            bench: { level: 'minimal', percentage: 0.15 },
            deep: { level: 'none', percentage: 0 }
        };
        
        return scholarships[tier] || { level: 'none', percentage: 0 };
    }
    
    /**
     * 根据阵容位置确定年级
     * @param {number} index - 球员索引
     * @returns {number} 年级 1-4
     */
    getYearByRosterPosition(index) {
        // 标准阵容分布：4大一，4大二，4大三，3大四
        if (index < 4) return 1;    // 0-3: 大一
        if (index < 8) return 2;    // 4-7: 大二
        if (index < 12) return 3;   // 8-11: 大三
        return 4;                    // 12+: 大四
    }
    
    /**
     * 根据球队风格调整球员属性
     * @param {Player} player - 球员对象
     * @param {Object} style - 球队风格
     */
    adjustPlayerAttributesByStyle(player, style) {
        const preferredAttrs = style.playerPreferences.preferredAttributes || [];
        
        // 根据风格偏好提升相应属性
        preferredAttrs.forEach(attr => {
            if (player.attributes[attr] !== undefined) {
                // 提升5-10点
                const boost = 5 + Math.floor(Math.random() * 6);
                player.attributes[attr] = Math.min(99, player.attributes[attr] + boost);
            }
        });
        
        // 重新计算能力值
        if (player.calculateOverallRating) {
            player.rating = player.calculateOverallRating();
        }
    }
    
    /**
     * Get base potential range for scholarship level - 使用新的5级系统
     * @param {string} level - Scholarship level
     * @returns {number} Base potential
     */
    getPotentialForScholarshipLevel(level) {
        const potentialRanges = {
            'full': { min: 80, max: 95 },      // 全额：高潜力（80-95）
            'major': { min: 72, max: 85 },     // 主要：中高潜力（72-85）
            'partial': { min: 65, max: 78 },   // 部分：中等潜力（65-78）
            'minimal': { min: 58, max: 70 },   // 基础：中低潜力（58-70）
            'none': { min: 50, max: 62 }       // 无奖学金：发展型潜力（50-62）
        };
        
        const range = potentialRanges[level] || { min: 55, max: 65 };
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }
    
    /**
     * Create a player with specific potential
     * @param {string} position - Player position
     * @param {number} forcedYear - Optional forced year
     * @param {boolean} isFreshmanClass - Whether freshman
     * @param {number} targetPotential - Target potential value
     * @returns {Player} Player object
     */
    createPlayerWithCorrectAgeAndPotential(position, forcedYear, isFreshmanClass, targetPotential) {
        // 使用现有的createPlayerWithCorrectAge方法，但调整潜力
        const firstName = FirstNames[Math.floor(Math.random() * FirstNames.length)];
        const lastName = LastNames[Math.floor(Math.random() * LastNames.length)];
        const playerPosition = position || Object.keys(Positions)[Math.floor(Math.random() * Object.keys(Positions).length)];

        const year = forcedYear || (Math.floor(Math.random() * 4) + 1);
        const age = this.generateAgeForYear(year);

        // 使用目标潜力值
        const potential = Math.min(99, Math.max(50, targetPotential));
        const attributes = this.generateAttributes(playerPosition, potential);

        const talents = this.generateTalents(potential, year);
        const skills = this.generateSkills(talents, playerPosition);
        
        const rating = this.calculateBaseRating(attributes, playerPosition, year, talents);
        
        const background = this.generatePlayerBackground(playerPosition, year);

        // 生成球员性格维度
        const personalityDimensions = this.generatePlayerPersonalityDimensions();

        let player = new Player({
            id: this.gameStateManager.getPlayerId(),
            name: `${firstName} ${lastName}`,
            position: playerPosition,
            age: age,
            year: year,
            attributes: attributes,
            potential: potential,
            rating: rating,
            talents: talents,
            skills: skills,
            background: background,
            personalityDimensions: personalityDimensions, // 添加性格维度
            status: 'active',
            contract: {
                type: 'scholarship',
                years: 5 - year, // 剩余学年
                amount: 0
            },
            stats: {
                games: 0,
                points: 0,
                rebounds: 0,
                assists: 0,
                steals: 0,
                blocks: 0,
                turnovers: 0,
                fouls: 0,
                minutes: 0
            },
            fatigue: 0,
            morale: 70 + Math.floor(Math.random() * 20), // 70-90
            chemistry: 50 + Math.floor(Math.random() * 30), // 50-80
            development: {
                trainingCount: 0,
                growthHistory: [],
                lastTrainingWeek: 0
            }
        });

        return player;
    }

    /**
     * Create a player with correct age-year relationship
     * @param {string} position - Player position
     * @param {number} forcedYear - Optional forced year (1-4)
     * @param {boolean} isFreshmanClass - Whether this is part of the current freshman generation (for special potential distribution)
     * @returns {Player} Player object
     */
    createPlayerWithCorrectAge(position = null, forcedYear = null, isFreshmanClass = false) {
        const firstName = FirstNames[Math.floor(Math.random() * FirstNames.length)];
        const lastName = LastNames[Math.floor(Math.random() * LastNames.length)];
        const playerPosition = position || Object.keys(Positions)[Math.floor(Math.random() * Object.keys(Positions).length)];

        const year = forcedYear || (Math.floor(Math.random() * 4) + 1);
        const age = this.generateAgeForYear(year);

        // 先生成潜力值，再根据潜力生成属性（传入年龄参数）
        const potential = this.generatePotential(year, isFreshmanClass, age);
        const attributes = this.generateAttributes(playerPosition, potential);

        const talents = this.generateTalents(potential, year);
        const skills = this.generateSkills(talents, playerPosition);
        
        // 使用新的评级系统计算能力值
        const rating = this.calculateBaseRating(attributes, playerPosition, year, talents);
        
        // 生成背景资料
        const background = this.generatePlayerBackground(playerPosition, year);

        let player = new Player({
            id: this.gameStateManager.getPlayerId(),
            name: `${firstName} ${lastName}`,
            position: playerPosition,
            age: age,
            year: year,
            attributes: attributes,
            potential: potential,
            rating: rating,
            talents: talents,
            skills: skills,
            background: background,
            training: {},
            scholarshipRequirement: this.generateScholarshipRequirement(potential, rating, year)
        });

        // 对高年级学生应用专项特长系统
        if (year >= 3) {
            player = this.seniorSpecialistSystem.processSeniorPlayer(player);
            // 更新奖学金要求（专项球员要求较低）
            if (player.specialistInfo) {
                player.scholarshipRequirement = this.seniorSpecialistSystem.generateSpecialistRequirements(player);
            }
        }

        return player;
    }

    /**
     * Create a player for the resource pool with status and contract information
     * @param {string} playerType - Type of player: 'free_agent' or 'transfer_wanted'
     * @param {string} position - Player position (optional)
     * @param {number} forcedYear - Optional forced year (1-4)
     * @returns {Player} Player object with full status info
     */
    createPoolPlayer(playerType = 'free_agent', position = null, forcedYear = null) {
        const firstName = FirstNames[Math.floor(Math.random() * FirstNames.length)];
        const lastName = LastNames[Math.floor(Math.random() * LastNames.length)];
        const playerPosition = position || this.getPositionByDistribution();
        
        // 根据分布获取年级
        const year = forcedYear || this.getYearByDistribution();
        const age = this.generateAgeForYear(year);

        // 先生成潜力值，再根据潜力生成属性（传入年龄参数）
        const potential = this.calculatePotential(year, null, 0, false, true, age);
        const attributes = this.generateAttributes(playerPosition, potential);

        const baseRating = this.calculateBaseRating(attributes, playerPosition, year);
        
        // 使用新的成长系统计算能力值
        const rating = this.calculateRatingWithGrowth(year, attributes, baseRating, potential);

        const talents = this.generateTalents(potential, year);
        const skills = this.generateSkills(talents, playerPosition);
        
        const background = this.generatePlayerBackground(playerPosition, year);
        
        // 生成技术特点
        const technicalInfo = this.generateTechnicalInfo();

        // 生成合同信息
        const contract = this.generateContractInfo(playerType, rating);

        // 生成转会信息
        // 大一新生刚高考结束被招募，不可能是转学生
        const isTransfer = playerType === 'transfer_wanted' && year > 1;
        const formerTeam = isTransfer
            ? PlayerPoolConfig.formerTeamNames[Math.floor(Math.random() * PlayerPoolConfig.formerTeamNames.length)]
            : null;
            
        const transferReason = isTransfer
            ? PlayerPoolConfig.transferReasons[Math.floor(Math.random() * PlayerPoolConfig.transferReasons.length)]
            : '';

        let player = new Player({
            id: this.gameStateManager.getPlayerId(),
            name: `${firstName} ${lastName}`,
            position: playerPosition,
            age: age,
            year: year,
            attributes: attributes,
            potential: potential,
            rating: rating,
            talents: talents,
            skills: skills,
            background: background,
            technicalInfo: technicalInfo,
            // 大一新生是新生招募，不是转学生
            status: year === 1 ? 'freshman_recruit' : playerType,
            contract: contract,
            transferIntention: isTransfer,
            formerTeam: formerTeam,
            transferReason: transferReason,
            training: {},
            scholarshipRequirement: this.generateScholarshipRequirement(potential, rating, year)
        });

        // 对高年级学生应用专项特长系统
        if (year >= 3) {
            player = this.seniorSpecialistSystem.processSeniorPlayer(player);
            // 更新奖学金要求（专项球员要求较低）
            if (player.specialistInfo) {
                player.scholarshipRequirement = this.seniorSpecialistSystem.generateSpecialistRequirements(player);
            }
        }

        return player;
    }

    /**
     * Get position based on distribution
     * @returns {string} Player position
     */
    getPositionByDistribution() {
        const rand = Math.random();
        const positions = Object.keys(PlayerPoolConfig.positionDistribution);
        let cumulative = 0;
        
        for (const pos of positions) {
            cumulative += PlayerPoolConfig.positionDistribution[pos];
            if (rand < cumulative) {
                return pos;
            }
        }
        
        return positions[Math.floor(Math.random() * positions.length)];
    }

    /**
     * Get year based on distribution
     * @returns {number} Academic year (1-4)
     */
    getYearByDistribution() {
        const rand = Math.random();
        let cumulative = 0;
        
        for (const [year, ratio] of Object.entries(PlayerPoolConfig.yearDistribution)) {
            cumulative += ratio;
            if (rand < cumulative) {
                return parseInt(year);
            }
        }
        
        return Math.floor(Math.random() * 4) + 1;
    }

    /**
     * Generate technical info for a player
     * @returns {Object} Technical info object
     */
    generateTechnicalInfo() {
        const tech = PlayerPoolConfig.technicalInfo;
        
        return {
            strongFoot: tech.strongFootOptions[Math.floor(Math.random() * tech.strongFootOptions.length)],
            playStyle: tech.playStyleOptions[Math.floor(Math.random() * tech.playStyleOptions.length)],
            bestSkill: tech.bestSkillOptions[Math.floor(Math.random() * tech.bestSkillOptions.length)],
            weakness: tech.weaknessOptions[Math.floor(Math.random() * tech.weaknessOptions.length)]
        };
    }

    /**
     * Generate contract information based on player type
     * @param {string} playerType - Type of player
     * @param {number} rating - Player rating
     * @returns {Object} Contract info object
     */
    generateContractInfo(playerType, rating) {
        if (playerType === 'free_agent') {
            return {
                type: 'none',
                salary: 0,
                remainingYears: 0,
                team: null
            };
        } else {
            // 转会球员有合同历史
            const contractTypes = ['full', 'scholarship', 'rookie'];
            const remainingYears = Math.floor(Math.random() * 3) + 1;
            const baseSalary = rating * 1000 + Math.floor(Math.random() * 50000);
            
            return {
                type: contractTypes[Math.floor(Math.random() * contractTypes.length)],
                salary: baseSalary,
                remainingYears: remainingYears,
                team: PlayerPoolConfig.formerTeamNames[Math.floor(Math.random() * PlayerPoolConfig.formerTeamNames.length)]
            };
        }
    }

    /**
     * Generate scholarship requirement for a player - 使用新的5级奖学金系统
     * @param {number} potential - Player potential
     * @param {number} rating - Player rating
     * @param {number} year - Academic year (1-4)
     * @returns {Object} Scholarship requirement object
     */
    generateScholarshipRequirement(potential, rating, year) {
        const maxVal = Math.max(potential, rating);
        const rand = Math.random();
        
        // 5级奖学金系统标准值
        const levels = {
            none: { value: 0, min: 0, max: 0.1, preferred: 0 },
            minimal: { value: 0.15, min: 0, max: 0.25, preferred: 0.15 },
            partial: { value: 0.35, min: 0.15, max: 0.5, preferred: 0.35 },
            major: { value: 0.6, min: 0.4, max: 0.8, preferred: 0.6 },
            full: { value: 1.0, min: 0.8, max: 1.0, preferred: 1.0 }
        };
        
        let selectedLevel = 'none';
        
        // 根据能力值确定基础等级
        if (maxVal >= 80) {
            selectedLevel = 'full';
        } else if (maxVal >= 72) {
            selectedLevel = 'major';
        } else if (maxVal >= 65) {
            selectedLevel = 'partial';
        } else if (maxVal >= 58) {
            selectedLevel = 'minimal';
        } else {
            selectedLevel = 'none';
        }
        
        // 年级调整（高年级更现实，要求可能略低）
        const levelOrder = ['none', 'minimal', 'partial', 'major', 'full'];
        let levelIndex = levelOrder.indexOf(selectedLevel);
        
        if (year === 4 && levelIndex > 0) {
            // 大四学生有20%概率降低一级期望（更现实）
            if (rand < 0.2) levelIndex--;
        } else if (year === 1 && levelIndex < 4) {
            // 大一新生有15%概率提高一级期望（更有野心）
            if (rand < 0.15) levelIndex++;
        }
        
        selectedLevel = levelOrder[levelIndex];
        
        // 特殊情况：非常优秀的球员坚持要全额
        if (maxVal >= 85) {
            selectedLevel = 'full';
        }
        
        // 特殊情况：能力很低的球员接受无奖学金
        if (maxVal < 50) {
            selectedLevel = 'none';
        }
        
        const config = levels[selectedLevel];

        // 生成性格维度（影响奖学金期望）
        const personalityDimensions = this.generatePlayerPersonalityDimensions();

        // 根据性格维度调整期望
        let finalMin = config.min;
        let finalMax = config.max;
        let finalPreferred = config.preferred;

        // 雄心影响期望（高雄心期望更高）
        const ambition = personalityDimensions.ambition || 50;
        if (ambition >= 70) {
            finalMin = Math.min(1.0, config.min * 1.1);
            finalPreferred = Math.min(1.0, config.preferred * 1.1);
        } else if (ambition <= 30) {
            finalMin = config.min * 0.9;
            finalPreferred = config.preferred * 0.95;
        }

        // 金钱观念影响期望（高金钱观念期望更高）
        const moneyFocus = personalityDimensions.moneyFocus || 50;
        if (moneyFocus >= 70) {
            finalMin = Math.min(1.0, finalMin * 1.15);
            finalPreferred = Math.min(1.0, finalPreferred * 1.1);
        } else if (moneyFocus <= 30) {
            finalMin = finalMin * 0.85;
            finalPreferred = finalPreferred * 0.9;
        }

        // 团队精神影响期望（高团队精神可以接受更低）
        const teamOrientation = personalityDimensions.teamOrientation || 50;
        if (teamOrientation >= 70) {
            finalMin = finalMin * 0.85;
            finalPreferred = finalPreferred * 0.9;
        }

        // 耐心影响灵活性
        const patience = personalityDimensions.patience || 50;
        const isFlexible = patience >= 60 || teamOrientation >= 65 || maxVal < 70;

        return {
            level: selectedLevel,
            min: Math.round(finalMin * 100) / 100,
            max: Math.round(finalMax * 100) / 100,
            preferred: Math.round(finalPreferred * 100) / 100,
            flexible: isFlexible,
            personalityDimensions: personalityDimensions
        };
    }

    /**
     * Calculate base rating from attributes
     * 使用新的评级系统计算能力值
     * @param {Object} attributes - Player attributes
     * @param {string} position - Player position
     * @param {number} year - Academic year
     * @param {Array} talents - Player talents
     * @returns {number} Base rating
     */
    calculateBaseRating(attributes, position = 'SF', year = 1, talents = []) {
        // 使用新的评级系统计算能力值
        return this.ratingSystem.calculateOverallRating(attributes, position, year, talents);
    }

    /**
     * Create a player (legacy method, updated to use new age logic)
     * @param {string} position - Player position
     * @param {number} minAge - Minimum age (deprecated, use generateAgeForYear instead)
     * @param {number} maxAge - Maximum age (deprecated)
     * @returns {Player} Player object
     * @deprecated Use createPlayerWithCorrectAge instead
     */
    createPlayer(position = null, minAge = 17, maxAge = 22) {
        const firstName = FirstNames[Math.floor(Math.random() * FirstNames.length)];
        const lastName = LastNames[Math.floor(Math.random() * LastNames.length)];
        const playerPosition = position || Object.keys(Positions)[Math.floor(Math.random() * Object.keys(Positions).length)];

        const year = Math.floor(Math.random() * 4) + 1;
        const age = this.generateAgeForYear(year);

        // 先生成潜力值，再根据潜力生成属性（传入年龄参数）
        const potential = this.calculatePotential(year, null, 0, false, false, age);
        const attributes = this.generateAttributes(playerPosition, potential);

        const baseRating = this.calculateBaseRating(attributes, playerPosition, year);
        
        // 使用新的成长系统计算能力值
        const rating = this.calculateRatingWithGrowth(year, attributes, baseRating, potential);

        const talents = this.generateTalents(potential, year);
        const skills = this.generateSkills(talents, playerPosition);
        
        const background = this.generatePlayerBackground(playerPosition, year);

        const player = new Player({
            id: this.gameStateManager.getPlayerId(),
            name: `${firstName} ${lastName}`,
            position: playerPosition,
            age: age,
            year: year,
            attributes: attributes,
            potential: potential,
            rating: rating,
            talents: talents,
            skills: skills,
            background: background,
            training: {},
            scholarshipRequirement: this.generateScholarshipRequirement(potential, rating, year)
        });

        return player;
    }

    /**
     * Generate player attributes based on position and archetype
     * 使用新的评级系统，参考2K正代和真实大学篮球数据
     * @param {string} position - Player position
     * @param {number} potential - Player potential (optional)
     * @returns {Object} Player attributes
     */
    generateAttributes(position, potential = null) {
        // 如果没有提供潜力值，生成一个随机的
        if (potential === null) {
            potential = 70 + Math.floor(Math.random() * 15); // 70-85
        }
        
        // 根据潜力等级调整实际能力值生成
        // 增强版：提高基础能力，让强队平均85，冠军90
        let effectivePotential = potential;
        const ratingCap = PotentialConfig.highPotentialRatingCap;
        
        // 普通球员（潜力<80）：基础75，范围67-83
        if (potential < 80 && ratingCap.normal) {
            const cap = ratingCap.normal;
            effectivePotential = cap.baseRating - cap.variance/2 + Math.floor(Math.random() * cap.variance);
        }
        // 优秀球员（80-89潜力）：基础78，40%到82
        else if (potential >= 80 && potential < 90 && ratingCap[80]) {
            const cap = ratingCap[80];
            if (Math.random() < cap.highRatingChance) {
                effectivePotential = cap.maxRating - 2 + Math.floor(Math.random() * 3);
            } else {
                effectivePotential = cap.baseRating - 3 + Math.floor(Math.random() * 6); // 75-81
            }
        }
        // 精英球员（90-94潜力）：基础80，50%到85
        else if (potential >= 90 && potential < 95 && ratingCap[90]) {
            const cap = ratingCap[90];
            if (Math.random() < cap.highRatingChance) {
                effectivePotential = cap.maxRating - 2 + Math.floor(Math.random() * 3);
            } else {
                effectivePotential = cap.baseRating - 3 + Math.floor(Math.random() * 6); // 77-83
            }
        }
        // 超级天才（95+潜力）：基础82，60%到88
        else if (potential >= 95 && ratingCap[95]) {
            const cap = ratingCap[95];
            if (Math.random() < cap.highRatingChance) {
                effectivePotential = cap.baseRating + Math.floor(Math.random() * (cap.maxRating - cap.baseRating));
            } else {
                effectivePotential = cap.baseRating - 3 + Math.floor(Math.random() * 6); // 79-85
            }
        }
        
        // 使用新的评级系统生成属性（使用调整后的effectivePotential）
        return this.ratingSystem.generateAttributes(position, effectivePotential);
    }

    /**
     * Generate player talents based on potential and year
     * @param {number} potential - Player potential
     * @param {number} year - Academic year (1-4)
     * @returns {Array} Array of talent IDs
     */
    generateTalents(potential, year = 1) {
        const talents = [];

        // Higher potential and lower year = more talents
        let talentCount = potential > 85 ? 3 : (potential > 75 ? 2 : 1);

        // Reduce talents for upperclassmen (they've already developed some)
        if (year === 4) talentCount = Math.max(1, talentCount - 1);
        if (year === 3) talentCount = Math.max(1, talentCount);

        const talentPool = {
            PG: ['playmaker', 'sharpshooter', 'clutch', 'passing', 'speed'],
            SG: ['sharpshooter', 'scorer', 'clutch', 'athlete', 'shooting'],
            SF: ['defender', 'threeD', 'athlete', 'scorer', 'speed'],
            PF: ['rebounding', 'defender', 'athlete', 'strength', 'blocking'],
            C: ['rebounding', 'rimProtector', 'defender', 'strength', 'blocking']
        };

        for (let i = 0; i < talentCount; i++) {
            const randomTalent = Math.random();
            
            if (randomTalent < 0.25) {
                talents.push('sharpshooter');
            } else if (randomTalent < 0.45) {
                talents.push('athlete');
            } else if (randomTalent < 0.60) {
                talents.push('defender');
            } else if (randomTalent < 0.75) {
                talents.push('playmaker');
            } else {
                talents.push('scorer');
            }
        }

        return [...new Set(talents)];
    }

    /**
     * Generate player skills based on talents and position
     * @param {Array} talents - Player talents
     * @param {string} position - Player position
     * @returns {Array} Array of skill IDs
     */
    generateSkills(talents, position = 'SF') {
        const skills = [];

        const skillPool = {
            PG: ['advancedPassing', 'courtVision', 'clutchShot', 'pullUp', 'steals', 'speed'],
            SG: ['pullUp', 'catchAndShoot', 'dunks', 'clutchShot', 'defensiveStopper'],
            SF: ['lockdownDefense', 'cornerThree', 'transitionFinish', 'midRange', 'cutting'],
            PF: ['pickAndRoll', 'boxOut', 'shotBlock', 'putbackDunk', 'postMoves'],
            C: ['backToBasket', 'hookShot', 'boxOut', 'interiorDefense', 'rebound']
        };

        const pool = skillPool[position] || skillPool.SF;

        // Generate 2-3 skills based on talents
        const skillCount = 2 + Math.floor(Math.random() * 2);

        for (let i = 0; i < skillCount; i++) {
            const skill = pool[Math.floor(Math.random() * pool.length)];
            if (!skills.includes(skill)) {
                skills.push(skill);
            }
        }

        return skills;
    }

    /**
     * Create multiple players with correct potential distribution
     * Only the current year's freshman class gets the special potential distribution (0.5% heaven, 5% excellent)
     * @param {number} count - Number of players to create
     * @returns {Array} Array of player objects
     */
    createPlayers(count) {
        const players = [];
        
        // Determine pool size between min and max
        const poolSize = PlayerPoolConfig.totalMin + 
            Math.floor(Math.random() * (PlayerPoolConfig.totalMax - PlayerPoolConfig.totalMin + 1));
        
        // Calculate number of each type
        const freeAgentCount = Math.round(poolSize * PlayerPoolConfig.freeAgentRatio);
        const transferCount = poolSize - freeAgentCount;
        
        // Create free agents
        for (let i = 0; i < freeAgentCount; i++) {
            const player = this.createPoolPlayer('free_agent');
            players.push(player);
        }
        
        // Create transfer wanted players
        for (let i = 0; i < transferCount; i++) {
            const player = this.createPoolPlayer('transfer_wanted');
            players.push(player);
        }
        
        return players;
    }

    /**
     * Analyze team roster distribution based on 15-player standard model
     * @param {Array} teams - All teams to analyze
     */
    analyzeTeamRosterDistribution(teams) {
        console.log('\n========== 球队阵容分布分析 ==========');
        console.log(`球队总数: ${teams.length} 支`);
        console.log(`标准阵容模型: 15人`);
        console.log(`分布标准: 4-5名大一替补, 3-4名大二轮换, 2-3名大三主力, 3-4名大四核心\n`);

        let totalFreshmen = 0;
        let totalSophomores = 0;
        let totalJuniors = 0;
        let totalSeniors = 0;
        let totalPlayers = 0;

        const teamDetails = teams.map((team, index) => {
            const freshmen = team.roster.filter(p => p.year === 1).length;
            const sophomores = team.roster.filter(p => p.year === 2).length;
            const juniors = team.roster.filter(p => p.year === 3).length;
            const seniors = team.roster.filter(p => p.year === 4).length;
            const rosterSize = team.roster.length;

            totalFreshmen += freshmen;
            totalSophomores += sophomores;
            totalJuniors += juniors;
            totalSeniors += seniors;
            totalPlayers += rosterSize;

            return {
                index: index + 1,
                teamName: team.name,
                rosterSize: rosterSize,
                freshmen: freshmen,
                sophomores: sophomores,
                juniors: juniors,
                seniors: seniors
            };
        });

        console.log('各球队详细分布:');
        console.log('序号 | 球队名称 | 阵容规模 | 大一 | 大二 | 大三 | 大四');
        console.log('------|----------|----------|------|------|------|------');
        
        teamDetails.forEach(detail => {
            console.log(
                `${String(detail.index).padStart(4, ' ')} | ` +
                `${detail.teamName.padEnd(10, ' ')} | ` +
                `${String(detail.rosterSize).padStart(8, ' ')} | ` +
                `${String(detail.freshmen).padStart(4, ' ')} | ` +
                `${String(detail.sophomores).padStart(4, ' ')} | ` +
                `${String(detail.juniors).padStart(4, ' ')} | ` +
                `${String(detail.seniors).padStart(4, ' ')}`
            );
        });

        console.log('\n总体统计:');
        console.log(`大一新生总数: ${totalFreshmen} 人 (平均每队 ${(totalFreshmen / teams.length).toFixed(1)} 人)`);
        console.log(`大二学生总数: ${totalSophomores} 人 (平均每队 ${(totalSophomores / teams.length).toFixed(1)} 人)`);
        console.log(`大三学生总数: ${totalJuniors} 人 (平均每队 ${(totalJuniors / teams.length).toFixed(1)} 人)`);
        console.log(`大四学生总数: ${totalSeniors} 人 (平均每队 ${(totalSeniors / teams.length).toFixed(1)} 人)`);
        console.log(`球员总数: ${totalPlayers} 人 (平均每队 ${(totalPlayers / teams.length).toFixed(1)} 人)`);

        console.log('\n与标准模型对比:');
        console.log(`标准大一: 4-5人/队 | 实际: ${(totalFreshmen / teams.length).toFixed(1)} 人/队`);
        console.log(`标准大二: 3-4人/队 | 实际: ${(totalSophomores / teams.length).toFixed(1)} 人/队`);
        console.log(`标准大三: 2-3人/队 | 实际: ${(totalJuniors / teams.length).toFixed(1)} 人/队`);
        console.log(`标准大四: 3-4人/队 | 实际: ${(totalSeniors / teams.length).toFixed(1)} 人/队`);

        const freshmanStatus = (totalFreshmen / teams.length >= 4 && totalFreshmen / teams.length <= 5) ? '✓ 符合' : '✗ 偏差';
        const sophomoreStatus = (totalSophomores / teams.length >= 3 && totalSophomores / teams.length <= 4) ? '✓ 符合' : '✗ 偏差';
        const juniorStatus = (totalJuniors / teams.length >= 2 && totalJuniors / teams.length <= 3) ? '✓ 符合' : '✗ 偏差';
        const seniorStatus = (totalSeniors / teams.length >= 3 && totalSeniors / teams.length <= 4) ? '✓ 符合' : '✗ 偏差';

        console.log('\n符合度评估:');
        console.log(`大一替补: ${freshmanStatus}`);
        console.log(`大二轮换: ${sophomoreStatus}`);
        console.log(`大三主力: ${juniorStatus}`);
        console.log(`大四核心: ${seniorStatus}`);
        console.log('========================================\n');
    }

    /**
     * Create coaches
     * @returns {Array} Array of coach objects
     */
    createCoaches() {
        const coaches = [];
        const firstNames = ['约翰', '迈克', '汤姆', '大卫', '詹姆斯', '罗伯特', '威廉', '理查德', '史蒂夫', '格雷格', '菲尔', '帕特', '格雷格', '杰夫', '斯坦', '弗兰克'];
        const lastNames = ['史密斯', '约翰逊', '威廉姆斯', '布朗', '琼斯', '加西亚', '米勒', '戴维斯', '罗德里格斯', '马丁内斯', '波波维奇', '莱利', '杰克逊', '范甘迪', '科尔', '斯波尔斯特拉'];
        const archetypes = Object.keys(CoachArchetypes);
        
        const almaMaters = ['杜克大学', '北卡罗来纳', '肯塔基大学', '堪萨斯大学', '印第安纳大学', 'UCLA', '亚利桑那大学', '密歇根州立', '佛罗里达大学', '康涅狄格大学'];
        const playingCareers = ['NBA球员', 'NCAA球星', '高中传奇', '职业联赛', '大学替补', '高中教练', '助理教练起步'];
        const philosophies = [
            '团队至上，防守赢得冠军',
            '进攻是最好的防守',
            '培养球员，建立王朝',
            '快速转换，高效得分',
            '纪律严明，执行战术',
            '信任球员，发挥潜力',
            '适应变化，灵活调整',
            '注重细节，追求完美'
        ];
        const mottos = [
            '每一天都是新的开始',
            '永不放弃，永不言败',
            '团队的力量无限大',
            '成功源于坚持',
            '细节决定成败',
            '信任你的队友',
            '保持饥饿，保持愚蠢',
            '只有第一，没有第二'
        ];
        const coachingStyles = ['offensive', 'defensive', 'balanced'];
        const specialties = ['inside', 'perimeter', 'defense', 'transition', 'halfcourt', 'playerDev', 'clutch', 'rebounding', 'pickroll', 'threePoint'];
        const achievements = [
            '全国冠军', '年度最佳教练', '联盟冠军', '锦标赛冠军', 
            '最佳防守教练', '最佳进攻教练', '最佳新人教练', '多次季后赛',
            '连续50胜', '单赛季70胜', '王朝建立者', '逆转大师'
        ];
        const notablePlayers = [
            '詹姆斯', '杜兰特', '库里', '字母哥', '戴维斯', '伦纳德', '哈登', '威斯布鲁克',
            '科比', '邓肯', '加内特', '诺维茨基', '韦德', '保罗', '欧文', '利拉德'
        ];
        const awards = [
            '年度最佳教练', '最佳防守教练', '最佳进攻教练', '月度最佳教练', 
            '名人堂成员', '终身成就奖', '最佳新人教练', '联盟杰出贡献奖'
        ];

        for (let i = 0; i < 40; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
            const archetypeData = CoachArchetypes[archetype];
            const experience = Math.floor(Math.random() * 20) + 5;
            const seasons = Math.floor(experience * 0.8);
            const wins = Math.floor(seasons * (15 + Math.random() * 15));
            const losses = Math.floor(seasons * (5 + Math.random() * 10));
            const championships = Math.random() < 0.15 ? (Math.random() < 0.3 ? 2 : 1) : 0;
            const isChampion = championships > 0;

            const baseAttributes = {
                offense: 40 + Math.floor(Math.random() * 30),
                defense: 40 + Math.floor(Math.random() * 30),
                recruiting: 40 + Math.floor(Math.random() * 30),
                development: 40 + Math.floor(Math.random() * 30),
                motivation: 40 + Math.floor(Math.random() * 30)
            };

            const bonuses = archetypeData.attributeBonuses;
            const adjustedAttributes = {
                offense: Math.min(99, Math.max(30, baseAttributes.offense + (bonuses.offense || 0))),
                defense: Math.min(99, Math.max(30, baseAttributes.defense + (bonuses.defense || 0))),
                recruiting: Math.min(99, Math.max(30, baseAttributes.recruiting + (bonuses.recruiting || 0))),
                development: Math.min(99, Math.max(30, baseAttributes.development + (bonuses.development || 0))),
                motivation: Math.min(99, Math.max(30, baseAttributes.motivation + (bonuses.motivation || 0)))
            };

            const salaryRange = archetypeData.salaryRange;
            const salary = salaryRange[0] + Math.floor(Math.random() * (salaryRange[1] - salaryRange[0]));

            const coach = new Coach({
                id: this.gameStateManager.getCoachId(),
                name: `${firstName} ${lastName}`,
                age: 40 + Math.floor(Math.random() * 30),
                archetype: archetype,
                attributes: adjustedAttributes,
                salary: salary,
                preferredPlayStyles: archetypeData.preferredPlayStyles,
                experience: experience,
                coachingStyle: coachingStyles[Math.floor(Math.random() * coachingStyles.length)],
                specialties: this.generateCoachSpecialties(specialties),
                isChampion: isChampion,
                playerDevRating: adjustedAttributes.development,
                philosophy: philosophies[Math.floor(Math.random() * philosophies.length)],
                almaMater: almaMaters[Math.floor(Math.random() * almaMaters.length)],
                playingCareer: playingCareers[Math.floor(Math.random() * playingCareers.length)],
                coachingHistory: this.generateCoachingHistory(experience),
                achievements: this.generateCoachAchievements(achievements, championships),
                notablePlayers: this.generateNotablePlayers(notablePlayers, championships),
                awards: this.generateCoachAwards(awards, championships),
                motto: mottos[Math.floor(Math.random() * mottos.length)],
                influence: 40 + Math.floor(Math.random() * 40),
                innovation: 40 + Math.floor(Math.random() * 40),
                adaptability: 40 + Math.floor(Math.random() * 40)
            });

            coach.careerStats = {
                seasons: seasons,
                wins: wins,
                losses: losses,
                championships: championships
            };

            coaches.push(coach);
        }

        return coaches;
    }

    generateCoachSpecialties(specialties) {
        const count = 2 + Math.floor(Math.random() * 3);
        const shuffled = [...specialties].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    generateCoachingHistory(experience) {
        const history = [];
        const teams = ['杜克大学', '北卡罗来纳', '肯塔基大学', '堪萨斯大学', '印第安纳大学', 'UCLA', '亚利桑那大学', '密歇根州立'];
        const numTeams = Math.min(Math.floor(experience / 5) + 1, 4);
        
        for (let i = 0; i < numTeams; i++) {
            const years = Math.floor(experience / numTeams);
            const team = teams[Math.floor(Math.random() * teams.length)];
            const achievement = Math.random() < 0.3 ? ['联盟冠军', '锦标赛冠军', '最佳战绩'][Math.floor(Math.random() * 3)] : '';
            
            history.push({
                team: team,
                years: `${years}年`,
                achievements: achievement
            });
        }
        
        return history;
    }

    generateCoachAchievements(achievements, championships) {
        const result = [];
        const numAchievements = Math.floor(Math.random() * 3);
        
        if (championships > 0) {
            result.push('全国冠军');
        }
        
        for (let i = 0; i < numAchievements; i++) {
            const achievement = achievements[Math.floor(Math.random() * achievements.length)];
            if (!result.includes(achievement)) {
                result.push(achievement);
            }
        }
        
        return result;
    }

    generateNotablePlayers(notablePlayers, championships) {
        const result = [];
        const count = championships > 0 ? 2 + Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2);
        
        for (let i = 0; i < count; i++) {
            const player = notablePlayers[Math.floor(Math.random() * notablePlayers.length)];
            if (!result.includes(player)) {
                result.push(player);
            }
        }
        
        return result;
    }

    generateCoachAwards(awards, championships) {
        const result = [];
        const count = Math.floor(Math.random() * 2);
        
        if (championships > 0 && Math.random() < 0.5) {
            result.push('年度最佳教练');
        }
        
        for (let i = 0; i < count; i++) {
            const award = awards[Math.floor(Math.random() * awards.length)];
            if (!result.includes(award)) {
                result.push(award);
            }
        }
        
        return result;
    }

    /**
     * Create available coaches for the market
     * @returns {Array} Array of coach objects
     */
    createAvailableCoaches() {
        const coaches = [];
        const firstNames = ['约翰', '迈克', '汤姆', '大卫', '詹姆斯', '罗伯特', '威廉', '理查德', '史蒂夫', '格雷格', '菲尔', '帕特', '格雷格', '杰夫', '斯坦', '弗兰克'];
        const lastNames = ['史密斯', '约翰逊', '威廉姆斯', '布朗', '琼斯', '加西亚', '米勒', '戴维斯', '罗德里格斯', '马丁内斯', '波波维奇', '莱利', '杰克逊', '范甘迪', '科尔', '斯波尔斯特拉'];
        const archetypes = Object.keys(CoachArchetypes);
        
        const almaMaters = ['杜克大学', '北卡罗来纳', '肯塔基大学', '堪萨斯大学', '印第安纳大学', 'UCLA', '亚利桑那大学', '密歇根州立', '佛罗里达大学', '康涅狄格大学'];
        const playingCareers = ['NBA球员', 'NCAA球星', '高中传奇', '职业联赛', '大学替补', '高中教练', '助理教练起步'];
        const philosophies = [
            '团队至上，防守赢得冠军',
            '进攻是最好的防守',
            '培养球员，建立王朝',
            '快速转换，高效得分',
            '纪律严明，执行战术',
            '信任球员，发挥潜力',
            '适应变化，灵活调整',
            '注重细节，追求完美'
        ];
        const mottos = [
            '每一天都是新的开始',
            '永不放弃，永不言败',
            '团队的力量无限大',
            '成功源于坚持',
            '细节决定成败',
            '信任你的队友',
            '保持饥饿，保持愚蠢',
            '只有第一，没有第二'
        ];
        const coachingStyles = ['offensive', 'defensive', 'balanced'];
        const specialties = ['inside', 'perimeter', 'defense', 'transition', 'halfcourt', 'playerDev', 'clutch', 'rebounding', 'pickroll', 'threePoint'];
        const achievements = [
            '全国冠军', '年度最佳教练', '联盟冠军', '锦标赛冠军', 
            '最佳防守教练', '最佳进攻教练', '最佳新人教练', '多次季后赛',
            '连续50胜', '单赛季70胜', '王朝建立者', '逆转大师'
        ];
        const notablePlayers = [
            '詹姆斯', '杜兰特', '库里', '字母哥', '戴维斯', '伦纳德', '哈登', '威斯布鲁克',
            '科比', '邓肯', '加内特', '诺维茨基', '韦德', '保罗', '欧文', '利拉德'
        ];
        const awards = [
            '年度最佳教练', '最佳防守教练', '最佳进攻教练', '月度最佳教练', 
            '名人堂成员', '终身成就奖', '最佳新人教练', '联盟杰出贡献奖'
        ];

        for (let i = 0; i < 10; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
            const archetypeData = CoachArchetypes[archetype];
            const experience = Math.floor(Math.random() * 20) + 5;
            const seasons = Math.floor(experience * 0.8);
            const wins = Math.floor(seasons * (15 + Math.random() * 15));
            const losses = Math.floor(seasons * (5 + Math.random() * 10));
            const championships = Math.random() < 0.15 ? (Math.random() < 0.3 ? 2 : 1) : 0;
            const isChampion = championships > 0;

            const baseAttributes = {
                offense: 40 + Math.floor(Math.random() * 30),
                defense: 40 + Math.floor(Math.random() * 30),
                recruiting: 40 + Math.floor(Math.random() * 30),
                development: 40 + Math.floor(Math.random() * 30),
                motivation: 40 + Math.floor(Math.random() * 30)
            };

            const bonuses = archetypeData.attributeBonuses;
            const adjustedAttributes = {
                offense: Math.min(99, Math.max(30, baseAttributes.offense + (bonuses.offense || 0))),
                defense: Math.min(99, Math.max(30, baseAttributes.defense + (bonuses.defense || 0))),
                recruiting: Math.min(99, Math.max(30, baseAttributes.recruiting + (bonuses.recruiting || 0))),
                development: Math.min(99, Math.max(30, baseAttributes.development + (bonuses.development || 0))),
                motivation: Math.min(99, Math.max(30, baseAttributes.motivation + (bonuses.motivation || 0)))
            };

            const salaryRange = archetypeData.salaryRange;
            const salary = salaryRange[0] + Math.floor(Math.random() * (salaryRange[1] - salaryRange[0]));

            const coach = new Coach({
                id: this.gameStateManager.getCoachId(),
                name: `${firstName} ${lastName}`,
                age: 40 + Math.floor(Math.random() * 30),
                archetype: archetype,
                attributes: adjustedAttributes,
                salary: salary,
                preferredPlayStyles: archetypeData.preferredPlayStyles,
                experience: experience,
                coachingStyle: coachingStyles[Math.floor(Math.random() * coachingStyles.length)],
                specialties: this.generateCoachSpecialties(specialties),
                isChampion: isChampion,
                playerDevRating: adjustedAttributes.development,
                philosophy: philosophies[Math.floor(Math.random() * philosophies.length)],
                almaMater: almaMaters[Math.floor(Math.random() * almaMaters.length)],
                playingCareer: playingCareers[Math.floor(Math.random() * playingCareers.length)],
                coachingHistory: this.generateCoachingHistory(experience),
                achievements: this.generateCoachAchievements(achievements, championships),
                notablePlayers: this.generateNotablePlayers(notablePlayers, championships),
                awards: this.generateCoachAwards(awards, championships),
                motto: mottos[Math.floor(Math.random() * mottos.length)],
                influence: 40 + Math.floor(Math.random() * 40),
                innovation: 40 + Math.floor(Math.random() * 40),
                adaptability: 40 + Math.floor(Math.random() * 40)
            });

            coach.careerStats = {
                seasons: seasons,
                wins: wins,
                losses: losses,
                championships: championships
            };

            coaches.push(coach);
        }

        return coaches;
    }

    /**
     * Create user team - 玩家创建全新球队
     * @returns {Team} User team object
     */
    createUserTeam() {
        // 创建一支全新的球队，不是从现有球队中选择
        const userTeam = new Team({
            id: 'user_team',
            name: '', // 空名称，等待玩家输入
            conference: '', // 稍后根据玩家选择分配
            funds: GameConstants.INITIAL_FUNDS,
            scholarships: 5,
            roster: [], // 空阵容，玩家从头开始
            coach: null, // 无教练，玩家需要雇佣
            stats: {
                wins: 0,
                losses: 0,
                conferenceWins: 0,
                conferenceLosses: 0,
                pointsFor: 0,
                pointsAgainst: 0
            }
        });

        // 标记为新创建的球队
        userTeam.isNewTeam = true;
        userTeam.prestige = 50; // 新球队初始声望较低

        return userTeam;
    }

    /**
     * Create a coach for the user team
     * @returns {Coach} Coach object
     */
    createCoachForUser() {
        const coach = new Coach({
            id: this.gameStateManager.getCoachId(),
            name: '玩家教练',
            age: 35,
            archetype: 'balanced',
            attributes: {
                offense: 60,
                defense: 60,
                recruiting: 60,
                development: 60,
                motivation: 60
            },
            salary: 500000,
            preferredPlayStyles: ['balanced'],
            experience: 5
        });

        return coach;
    }

    /**
     * Generate initial season schedule
     * @param {Array} allTeams - All teams
     */
    generateInitialSchedule(allTeams) {
        const schedule = [];
        const gamesPerTeam = 30;
        
        // 获取当前游戏日期作为赛季开始日期
        const currentDate = this.gameStateManager.get('currentDate') || new Date(2024, 9, 1);
        
        // 计算赛季开始日期（通常是10月1日）
        const seasonStartMonth = 9; // 10月（0-indexed）
        const seasonStartDay = 1;
        const seasonStartDate = new Date(currentDate.getFullYear(), seasonStartMonth, seasonStartDay);

        // Simplified schedule generation
        for (let i = 0; i < gamesPerTeam / 2; i++) {
            for (let j = 0; j < allTeams.length / 2; j++) {
                const homeTeam = allTeams[j * 2];
                const awayTeam = allTeams[j * 2 + 1];

                if (homeTeam && awayTeam) {
                    // 使用赛季开始日期作为基准，每周一场比赛
                    const gameDate = new Date(seasonStartDate);
                    gameDate.setDate(gameDate.getDate() + i * 7);
                    
                    schedule.push({
                        id: schedule.length + 1,
                        date: gameDate,
                        homeTeam: homeTeam,
                        awayTeam: awayTeam,
                        played: false,
                        homeScore: 0,
                        awayScore: 0
                    });
                }
            }
        }

        this.gameStateManager.set('gameSchedule', schedule);
        console.log(`初始赛程已生成，赛季开始日期: ${seasonStartDate.toISOString().split('T')[0]}`);
    }
}