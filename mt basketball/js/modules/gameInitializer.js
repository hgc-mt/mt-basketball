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
 * 潜力评估配置 - 全新优化版本
 * 实现科学的潜力值计算模型
 * 注意：大学生篮球联赛中天之骄子应该是极少数，因为优秀球员已被职业队挑走
 */
const PotentialConfig = {
    // 大一新生基础潜力值配置（用于其他球队球员）
    freshmanBase: {
        mean: 72,      // 平均值 72 (提高2点)
        stdDev: 4,     // 标准差 ±4 (增加1点)
        highPotentialRatio: 0.12,   // 12% 达到 80±2 (从5%提高到12%)
        heavenFavorRate: 0.015,     // 1.5% 天之骄子 (90+) - 其他球队（180人中约2-3人，从0.5%提高到1.5%）
        heavenFavorMin: 90
    },
    
    // 招募中心/资源池球员配置（略高，因为这是玩家能招募的最后机会）
    poolPlayerBase: {
        mean: 73,      // 平均值略高 (提高2点)
        stdDev: 4,     // 标准差 (增加1点)
        highPotentialRatio: 0.18,   // 18% 达到 80±2 (从8%提高到18%)
        heavenFavorRate: 0.04,      // 4% 天之骄子 (90+) - 资源池（60-80人中约2-3人，从2%提高到4%）
        heavenFavorMin: 90
    },
    
    // 年级衰减配置
    yearDecay: {
        1: { potentialDecay: 0, ratingBoost: 0 },           // 大一
        2: { potentialDecay: { min: 10, max: 20 }, ratingBoost: { min: 8, max: 12 } },   // 大二
        3: { potentialDecay: { min: 10, max: 20 }, ratingBoost: { min: 10, max: 15 } },  // 大三
        4: { potentialDecay: { min: 25, max: 40 }, ratingBoost: { min: 12, max: 18 } }   // 大四
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

        // Create user team
        const userTeam = this.createUserTeam(allTeams);

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
     * Calculate potential based on year and attributes - 全新科学模型
     * @param {number} year - Academic year (1-4)
     * @param {Object} attributes - Player attributes
     * @param {number} baseRating - Player's overall rating
     * @param {boolean} isFreshmanClass - Whether this is part of the current freshman generation
     * @param {boolean} isPoolPlayer - Whether this player is from the recruitment pool
     * @returns {number} Calculated potential
     */
    calculatePotential(year, attributes, baseRating, isFreshmanClass = false, isPoolPlayer = false) {
        const baseConfig = isPoolPlayer ? PotentialConfig.poolPlayerBase : PotentialConfig.freshmanBase;
        
        if (year === 1 && isFreshmanClass) {
            const freshmanConfig = baseConfig;
            const random = Math.random();
            
            if (random < freshmanConfig.heavenFavorRate) {
                const potential = freshmanConfig.heavenFavorMin + Math.floor(Math.random() * 10);
                this.potentialDistribution.elite++;
                return Math.min(99, potential);
            }
            
            if (random < freshmanConfig.heavenFavorRate + freshmanConfig.highPotentialRatio) {
                const potential = 78 + Math.floor(Math.random() * 5);
                this.potentialDistribution.excellent++;
                return potential;
            }
            
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
            let potential = Math.round(freshmanConfig.mean + z * freshmanConfig.stdDev);
            
            potential = Math.max(67, Math.min(73, potential));
            this.potentialDistribution.good++;
            
            return potential;
        }
        
        let potential;
        if (year === 1) {
            potential = baseRating + Math.floor(Math.random() * 11) + 8;
        } else if (year === 2) {
            potential = baseRating + Math.floor(Math.random() * 8) + 2;
        } else if (year === 3) {
            potential = baseRating + Math.floor(Math.random() * 6) + 1;
        } else {
            potential = baseRating + Math.floor(Math.random() * 4);
        }
        
        potential = Math.min(99, Math.max(baseRating + 1, potential));
        
        const eliteChance = isPoolPlayer ? 0.10 : 0.05;
        
        if (potential >= 88 && Math.random() < eliteChance) {
            potential = 90 + Math.floor(Math.random() * 9);
            this.potentialDistribution.elite++;
        } else if (potential >= 80) {
            this.potentialDistribution.excellent++;
        } else if (potential >= 70) {
            this.potentialDistribution.good++;
        } else {
            this.potentialDistribution.normal++;
        }
        
        return Math.round(potential);
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
     * 计算球员战力 - 包含年级增长机制
     * @param {number} year - Academic year (1-4)
     * @param {Object} attributes - Player attributes
     * @param {number} baseRating - 基础能力值
     * @returns {number} 最终能力值
     */
    calculateRatingWithGrowth(year, attributes, baseRating) {
        if (year === 1) {
            return baseRating;
        }
        
        const growthConfig = PotentialConfig.yearDecay[year];
        const growth = this.randomInRange(growthConfig.ratingBoost.min, growthConfig.ratingBoost.max);
        
        let rating = baseRating + growth;
        rating = Math.max(50, Math.min(99, rating));
        
        return Math.round(rating);
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
     * Create all teams
     * @returns {Array} Array of team objects
     */
    createTeams() {
        const teams = [];

        // Create teams from each conference
        for (const [conferenceId, conference] of Object.entries(Conferences)) {
            for (const teamName of conference.teams) {
                const teamData = TeamNames[conferenceId][teamName];
                const team = new Team({
                    id: teamData.id,
                    name: teamName,
                    conference: conferenceId,
                    funds: teamData.funds,
                    scholarships: GameConstants.MAX_SCHOLARSHIPS,
                    roster: []
                });

                // Generate initial roster
                this.generateTeamRoster(team);

                teams.push(team);
            }
        }

        return teams;
    }

    /**
     * Generate initial roster for a team
     * @param {Team} team - Team to generate roster for
     */
    generateTeamRoster(team) {
        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        const rosterSize = 15;

        for (let i = 0; i < rosterSize; i++) {
            const position = positions[i % positions.length];
            const player = this.createPlayerWithCorrectAge(position, null, false);
            team.addPlayer(player);
        }
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

        const attributes = this.generateAttributes(playerPosition);

        const baseRating = this.calculateBaseRating(attributes);
        const potential = this.calculatePotential(year, attributes, baseRating, isFreshmanClass);
        
        // 使用新的战力计算模型
        const rating = this.calculateRatingWithGrowth(year, attributes, baseRating);

        const talents = this.generateTalents(potential, year);
        const skills = this.generateSkills(talents, playerPosition);
        
        // 生成背景资料
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

        const attributes = this.generateAttributes(playerPosition);

        const baseRating = this.calculateBaseRating(attributes);
        const potential = this.calculatePotential(year, attributes, baseRating, false);
        
        const rating = this.calculateRatingWithGrowth(year, attributes, baseRating);

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
     * Generate scholarship requirement for a player
     * @param {number} potential - Player potential
     * @param {number} rating - Player rating
     * @param {number} year - Academic year (1-4)
     * @returns {Object} Scholarship requirement object
     */
    generateScholarshipRequirement(potential, rating, year) {
        const rand = Math.random();
        
        let minScholarship = 0.5;
        let maxScholarship = 1.0;
        let preferredScholarship = 0.7;
        
        if (potential >= 90) {
            minScholarship = 0.8;
            maxScholarship = 1.0;
            preferredScholarship = 1.0;
        } else if (potential >= 80) {
            minScholarship = 0.6;
            maxScholarship = 1.0;
            preferredScholarship = 0.85;
        } else if (potential >= 70) {
            minScholarship = 0.4;
            maxScholarship = 0.8;
            preferredScholarship = 0.6;
        } else if (potential >= 60) {
            minScholarship = 0.3;
            maxScholarship = 0.6;
            preferredScholarship = 0.5;
        } else {
            minScholarship = 0.2;
            maxScholarship = 0.5;
            preferredScholarship = 0.3;
        }
        
        if (year === 4) {
            minScholarship = Math.max(0.2, minScholarship - 0.1);
            maxScholarship = Math.max(0.3, maxScholarship - 0.1);
            preferredScholarship = Math.max(0.3, preferredScholarship - 0.1);
        } else if (year === 3) {
            minScholarship = Math.max(0.2, minScholarship - 0.05);
            maxScholarship = Math.max(0.4, maxScholarship - 0.05);
            preferredScholarship = Math.max(0.4, preferredScholarship - 0.05);
        }
        
        const noScholarshipChance = 0.15;
        const fullScholarshipChance = 0.15;
        
        let finalMin = minScholarship;
        let finalMax = maxScholarship;
        let finalPreferred = preferredScholarship;
        
        if (rand < noScholarshipChance) {
            finalMin = 0;
            finalMax = 0.3;
            finalPreferred = 0.1;
        } else if (rand < noScholarshipChance + fullScholarshipChance) {
            finalMin = 0.9;
            finalMax = 1.0;
            finalPreferred = 1.0;
        }
        
        return {
            min: Math.round(finalMin * 100) / 100,
            max: Math.round(finalMax * 100) / 100,
            preferred: Math.round(finalPreferred * 100) / 100,
            flexible: Math.random() < 0.5
        };
    }

    /**
     * Calculate base rating from attributes
     * @param {Object} attributes - Player attributes
     * @returns {number} Base rating
     */
    calculateBaseRating(attributes) {
        const weights = {
            scoring: 0.15, shooting: 0.1, threePoint: 0.1, freeThrow: 0.05,
            passing: 0.1, dribbling: 0.1, defense: 0.1, rebounding: 0.1,
            stealing: 0.05, blocking: 0.05, speed: 0.05, stamina: 0.05,
            strength: 0.05, basketballIQ: 0.1
        };

        let rating = 0;
        for (const [attr, weight] of Object.entries(weights)) {
            rating += (attributes[attr] || 50) * weight;
        }

        return Math.round(rating);
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

        const attributes = this.generateAttributes(playerPosition);

        const baseRating = this.calculateBaseRating(attributes);
        // 对于普通方法，不使用特殊的新生潜力分布
        const potential = this.calculatePotential(year, attributes, baseRating, false);
        
        const rating = this.calculateRatingWithGrowth(year, attributes, baseRating);

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
     * Generate player attributes based on position
     * @param {string} position - Player position
     * @returns {Object} Player attributes
     */
    generateAttributes(position) {
        const baseAttributes = {
            scoring: 30 + Math.floor(Math.random() * 40),
            shooting: 30 + Math.floor(Math.random() * 40),
            threePoint: 30 + Math.floor(Math.random() * 40),
            freeThrow: 30 + Math.floor(Math.random() * 40),
            passing: 30 + Math.floor(Math.random() * 40),
            dribbling: 30 + Math.floor(Math.random() * 40),
            defense: 30 + Math.floor(Math.random() * 40),
            rebounding: 30 + Math.floor(Math.random() * 40),
            stealing: 30 + Math.floor(Math.random() * 40),
            blocking: 30 + Math.floor(Math.random() * 40),
            speed: 30 + Math.floor(Math.random() * 40),
            stamina: 30 + Math.floor(Math.random() * 40),
            strength: 30 + Math.floor(Math.random() * 40),
            basketballIQ: 30 + Math.floor(Math.random() * 40)
        };

        switch (position) {
            case 'PG':
                baseAttributes.passing += 10;
                baseAttributes.dribbling += 10;
                baseAttributes.basketballIQ += 10;
                baseAttributes.stealing += 5;
                break;
            case 'SG':
                baseAttributes.shooting += 10;
                baseAttributes.threePoint += 10;
                baseAttributes.scoring += 5;
                break;
            case 'SF':
                baseAttributes.scoring += 5;
                baseAttributes.shooting += 5;
                baseAttributes.defense += 5;
                baseAttributes.rebounding += 5;
                break;
            case 'PF':
                baseAttributes.rebounding += 10;
                baseAttributes.strength += 10;
                baseAttributes.defense += 5;
                break;
            case 'C':
                baseAttributes.rebounding += 15;
                baseAttributes.strength += 15;
                baseAttributes.blocking += 10;
                baseAttributes.defense += 5;
                break;
        }

        for (const [key, value] of Object.entries(baseAttributes)) {
            baseAttributes[key] = Math.min(99, Math.max(1, value));
        }

        return baseAttributes;
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
     * Create user team
     * @param {Array} allTeams - All teams
     * @returns {Team} User team object
     */
    createUserTeam(allTeams) {
        // Select a random team for the user
        const teamIndex = Math.floor(Math.random() * allTeams.length);
        const userTeam = allTeams[teamIndex];

        // Clear all players - player starts from scratch to build roster
        userTeam.roster = [];

        // Clear coach - user must hire from coach market
        userTeam.coach = null;

        // Set initial funds
        userTeam.funds = GameConstants.INITIAL_FUNDS;

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