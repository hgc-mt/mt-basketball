// 游戏核心数据结构
const GameState = {
    currentDate: new Date(2024, 9, 1), // 游戏开始日期：2024年10月1日
    currentSeason: 2024,
    seasonPhase: 'regular', // regular, playoffs, offseason
    userTeam: null,
    allTeams: [],
    availablePlayers: [],
    gameSchedule: [],
    nextGameIndex: 0,
    maxScholarships: 13, // NCAA D1级别篮球项目有13个全额奖学金名额
    playerIdCounter: 1000,
    teamIdCounter: 20,
    coachIdCounter: 1, // 教练ID计数器
    // 球探系统数据
    scoutingReports: [], // 球探报告
    scoutingBudget: 50000, // 球探预算
    scoutingUsed: 0, // 已使用的球探预算
    teamAnalysisData: {}, // 球队分析数据缓存
    // 教练系统数据
    allCoaches: [], // 所有教练
    userCoach: null, // 用户球队的教练
    availableCoaches: [], // 可签约的教练市场
    coachMarketRefreshDate: new Date() // 教练市场刷新日期
};

// 球员位置定义
const Positions = {
    PG: '控球后卫',
    SG: '得分后卫',
    SF: '小前锋',
    PF: '大前锋',
    C: '中锋'
};

// 球员属性定义
const PlayerAttributes = {
    // 进攻属性
    scoring: '得分',
    shooting: '投篮',
    threePoint: '三分',
    freeThrow: '罚球',
    
    // 组织属性
    passing: '传球',
    dribbling: '运球',
    
    // 防守属性
    defense: '防守',
    rebounding: '篮板',
    stealing: '抢断',
    blocking: '盖帽',
    
    // 身体属性
    speed: '速度',
    stamina: '体力',
    strength: '力量',
    
    // 心理属性
    basketballIQ: '篮球智商'
};

// 技能系统
const Skills = {
    // 进攻技能
    'three_point_specialist': {
        id: 'three_point_specialist',
        name: '三分专家',
        description: '提升三分投篮能力',
        requirements: [
            { type: 'attribute', attribute: 'threePoint', value: 50 },
            { type: 'year', value: 2 }
        ],
        effects: [
            { type: 'attribute', attribute: 'threePoint', value: 5 }
        ]
    },
    'mid_range_master': {
        id: 'mid_range_master',
        name: '中距离大师',
        description: '提升中距离投篮能力',
        requirements: [
            { type: 'attribute', attribute: 'shooting', value: 50 },
            { type: 'year', value: 2 }
        ],
        effects: [
            { type: 'attribute', attribute: 'shooting', value: 5 },
            { type: 'attribute', attribute: 'scoring', value: 3 }
        ]
    },
    'slasher': {
        id: 'slasher',
        name: '突破手',
        description: '提升突破和上篮能力',
        requirements: [
            { type: 'attribute', attribute: 'dribbling', value: 50 },
            { type: 'attribute', attribute: 'speed', value: 50 },
            { type: 'year', value: 2 }
        ],
        effects: [
            { type: 'attribute', attribute: 'dribbling', value: 4 },
            { type: 'attribute', attribute: 'speed', value: 3 },
            { type: 'attribute', attribute: 'scoring', value: 3 }
        ]
    },
    'post_scoring': {
        id: 'post_scoring',
        name: '低位得分',
        description: '提升低位单打能力',
        requirements: [
            { type: 'attribute', attribute: 'strength', value: 50 },
            { type: 'year', value: 2 }
        ],
        effects: [
            { type: 'attribute', attribute: 'strength', value: 4 },
            { type: 'attribute', attribute: 'scoring', value: 4 }
        ]
    },
    
    // 防守技能
    'lockdown_defender': {
        id: 'lockdown_defender',
        name: '防守大闸',
        description: '提升单防能力',
        requirements: [
            { type: 'attribute', attribute: 'defense', value: 50 },
            { type: 'year', value: 2 }
        ],
        effects: [
            { type: 'attribute', attribute: 'defense', value: 5 },
            { type: 'attribute', attribute: 'stealing', value: 3 }
        ]
    },
    'rim_protector': {
        id: 'rim_protector',
        name: '护框者',
        description: '提升护框和盖帽能力',
        requirements: [
            { type: 'attribute', attribute: 'blocking', value: 40 },
            { type: 'attribute', attribute: 'strength', value: 45 }
        ],
        effects: [
            { type: 'attribute', attribute: 'blocking', value: 5 },
            { type: 'attribute', attribute: 'rebounding', value: 3 }
        ]
    },
    'rebound_machine': {
        id: 'rebound_machine',
        name: '篮板机器',
        description: '提升篮板能力',
        requirements: [
            { type: 'attribute', attribute: 'rebounding', value: 45 },
            { type: 'year', value: 2 }
        ],
        effects: [
            { type: 'attribute', attribute: 'rebounding', value: 6 },
            { type: 'attribute', attribute: 'strength', value: 2 }
        ]
    },
    
    // 组织技能
    'playmaker': {
        id: 'playmaker',
        name: '组织者',
        description: '提升传球和组织能力',
        requirements: [
            { type: 'attribute', attribute: 'passing', value: 50 },
            { type: 'attribute', attribute: 'basketballIQ', value: 45 },
            { type: 'year', value: 2 }
        ],
        effects: [
            { type: 'attribute', attribute: 'passing', value: 5 },
            { type: 'attribute', attribute: 'basketballIQ', value: 3 },
            { type: 'attribute', attribute: 'leadership', value: 2 }
        ]
    },
    'floor_general': {
        id: 'floor_general',
        name: '场上指挥官',
        description: '提升场上视野和决策能力',
        requirements: [
            { type: 'skill', skillId: 'playmaker' },
            { type: 'attribute', attribute: 'basketballIQ', value: 55 },
            { type: 'year', value: 3 }
        ],
        effects: [
            { type: 'attribute', attribute: 'basketballIQ', value: 5 },
            { type: 'attribute', attribute: 'leadership', value: 4 },
            { type: 'attribute', attribute: 'passing', value: 3 }
        ]
    },
    
    // 身体技能
    'endurance_freak': {
        id: 'endurance_freak',
        name: '体力怪兽',
        description: '提升耐力和疲劳恢复',
        requirements: [
            { type: 'attribute', attribute: 'stamina', value: 50 },
            { type: 'year', value: 2 }
        ],
        effects: [
            { type: 'attribute', attribute: 'stamina', value: 6 }
        ]
    },
    'speedster': {
        id: 'speedster',
        name: '速度达人',
        description: '提升速度和敏捷性',
        requirements: [
            { type: 'attribute', attribute: 'speed', value: 50 },
            { type: 'year', value: 2 }
        ],
        effects: [
            { type: 'attribute', attribute: 'speed', value: 5 },
            { type: 'attribute', attribute: 'dribbling', value: 2 }
        ]
    },
    
    // 心理技能
    'clutch_performer': {
        id: 'clutch_performer',
        name: '关键时刻先生',
        description: '提升关键时刻表现',
        requirements: [
            { type: 'attribute', attribute: 'basketballIQ', value: 50 },
            { type: 'attribute', attribute: 'scoring', value: 50 },
            { type: 'year', value: 3 }
        ],
        effects: [
            { type: 'attribute', attribute: 'basketballIQ', value: 4 },
            { type: 'attribute', attribute: 'scoring', value: 3 },
            { type: 'attribute', attribute: 'leadership', value: 3 }
        ]
    },
    'team_leader': {
        id: 'team_leader',
        name: '球队领袖',
        description: '提升领导力和团队士气',
        requirements: [
            { type: 'attribute', attribute: 'leadership', value: 45 },
            { type: 'year', value: 3 }
        ],
        effects: [
            { type: 'attribute', attribute: 'leadership', value: 6 },
            { type: 'attribute', attribute: 'morale', value: 4 }
        ]
    }
};

// 球员天赋定义
const PlayerTalents = {
    // 进攻天赋
    sharpshooter: {
        name: '射手',
        description: '提升投篮和三分能力上限，提高投篮训练效率',
        attributes: ['shooting', 'threePoint', 'freeThrow'],
        caps: { shooting: 95, threePoint: 95, freeThrow: 90 },
        trainingBonus: { shooting: 1.3, threePoint: 1.4, freeThrow: 1.2 },
        rarity: 'common'
    },
    scorer: {
        name: '得分手',
        description: '提升得分能力上限，提高得分训练效率',
        attributes: ['scoring', 'dribbling'],
        caps: { scoring: 95, dribbling: 90 },
        trainingBonus: { scoring: 1.4, dribbling: 1.2 },
        rarity: 'common'
    },
    playmaker: {
        name: '组织者',
        description: '提升传球和运球能力上限，提高组织训练效率',
        attributes: ['passing', 'dribbling', 'basketballIQ'],
        caps: { passing: 95, dribbling: 90, basketballIQ: 90 },
        trainingBonus: { passing: 1.4, dribbling: 1.2, basketballIQ: 1.2 },
        rarity: 'common'
    },
    
    // 防守天赋
    rimProtector: {
        name: '护框者',
        description: '提升盖帽和篮板能力上限，提高内线防守训练效率',
        attributes: ['blocking', 'rebounding', 'defense'],
        caps: { blocking: 95, rebounding: 90, defense: 90 },
        trainingBonus: { blocking: 1.4, rebounding: 1.2, defense: 1.2 },
        rarity: 'common'
    },
    lockdownDefender: {
        name: '防守专家',
        description: '提升防守和抢断能力上限，提高防守训练效率',
        attributes: ['defense', 'stealing'],
        caps: { defense: 95, stealing: 95 },
        trainingBonus: { defense: 1.4, stealing: 1.4 },
        rarity: 'common'
    },
    
    // 身体天赋
    athlete: {
        name: '运动员',
        description: '提升速度和体力能力上限，提高体能训练效率',
        attributes: ['speed', 'stamina'],
        caps: { speed: 95, stamina: 95 },
        trainingBonus: { speed: 1.3, stamina: 1.3 },
        rarity: 'common'
    },
    brute: {
        name: '力量型',
        description: '提升力量和篮板能力上限，提高力量训练效率',
        attributes: ['strength', 'rebounding'],
        caps: { strength: 95, rebounding: 90 },
        trainingBonus: { strength: 1.4, rebounding: 1.2 },
        rarity: 'common'
    },
    
    // 稀有天赋
    allAround: {
        name: '全能型',
        description: '全面提升所有属性上限，提高综合训练效率',
        attributes: ['scoring', 'shooting', 'threePoint', 'freeThrow', 'passing', 'dribbling', 'defense', 'rebounding', 'stealing', 'blocking', 'speed', 'stamina', 'strength', 'basketballIQ'],
        caps: { scoring: 90, shooting: 90, threePoint: 90, freeThrow: 85, passing: 90, dribbling: 85, defense: 90, rebounding: 85, stealing: 85, blocking: 85, speed: 90, stamina: 90, strength: 90, basketballIQ: 85 },
        trainingBonus: { scoring: 1.1, shooting: 1.1, threePoint: 1.1, freeThrow: 1.1, passing: 1.1, dribbling: 1.1, defense: 1.1, rebounding: 1.1, stealing: 1.1, blocking: 1.1, speed: 1.1, stamina: 1.1, strength: 1.1, basketballIQ: 1.1 },
        rarity: 'rare'
    },
    lateBloomer: {
        name: '大器晚成',
        description: '初期成长缓慢，但后期成长潜力巨大',
        attributes: ['scoring', 'shooting', 'threePoint', 'freeThrow', 'passing', 'dribbling', 'defense', 'rebounding', 'stealing', 'blocking', 'speed', 'stamina', 'strength', 'basketballIQ'],
        caps: { scoring: 99, shooting: 99, threePoint: 99, freeThrow: 95, passing: 99, dribbling: 95, defense: 99, rebounding: 95, stealing: 95, blocking: 95, speed: 99, stamina: 99, strength: 99, basketballIQ: 95 },
        trainingBonus: { scoring: 0.8, shooting: 0.8, threePoint: 0.8, freeThrow: 0.8, passing: 0.8, dribbling: 0.8, defense: 0.8, rebounding: 0.8, stealing: 0.8, blocking: 0.8, speed: 0.8, stamina: 0.8, strength: 0.8, basketballIQ: 0.8 },
        growthCurve: 'exponential', // 指数增长曲线
        rarity: 'rare'
    },
    prodigy: {
        name: '天才',
        description: '初期成长极快，但后期成长放缓',
        attributes: ['scoring', 'shooting', 'threePoint', 'freeThrow', 'passing', 'dribbling', 'defense', 'rebounding', 'stealing', 'blocking', 'speed', 'stamina', 'strength', 'basketballIQ'],
        caps: { scoring: 95, shooting: 95, threePoint: 95, freeThrow: 90, passing: 95, dribbling: 90, defense: 95, rebounding: 90, stealing: 90, blocking: 90, speed: 95, stamina: 95, strength: 95, basketballIQ: 90 },
        trainingBonus: { scoring: 1.5, shooting: 1.5, threePoint: 1.5, freeThrow: 1.4, passing: 1.4, dribbling: 1.4, defense: 1.4, rebounding: 1.3, stealing: 1.3, blocking: 1.3, speed: 1.4, stamina: 1.3, strength: 1.3, basketballIQ: 1.3 },
        growthCurve: 'logarithmic', // 对数增长曲线
        rarity: 'legendary'
    }
};

// 球员类
class Player {
    constructor(name, position, age, attributes = {}) {
        this.id = GameState.playerIdCounter++;
        this.name = name;
        this.position = position;
        this.age = age;
        this.year = this.determineCollegeYear(age); // 大学年级
        this.attributes = this.generateAttributes(attributes);
        this.experience = 0;
        this.level = 1;
        this.fatigue = 0; // 疲劳度 0-100
        this.injuryDays = 0; // 伤病天数
        this.scholarship = this.calculateScholarship(); // 奖学金等级
        // NCAA球员通常有4年参赛资格
        this.eligibilityYears = Math.max(0, 4 - (this.year - 1)); // 剩余资格年限
        
        // 天赋系统 - 为球员分配天赋
        this.talents = this.generateTalents();
        
        // 属性上限 - 基于天赋设定
        this.attributeCaps = this.calculateAttributeCaps();
        
        // 成长系统
        this.trainingHistory = []; // 训练历史
        this.matchPerformance = []; // 比赛表现记录
        this.attributeProgress = {}; // 各属性进度追踪
        this.growthPoints = 0; // 成长点数
        
        // 初始化属性进度
        for (const attr in PlayerAttributes) {
            this.attributeProgress[attr] = {
                current: this.attributes[attr],
                trainingGains: 0,
                matchGains: 0,
                totalGains: 0
            };
        }
        
        // 球探评级 - 初始为未评价
        this.scoutRating = null;
        
        this.stats = {
            points: 0,
            rebounds: 0,
            assists: 0,
            steals: 0,
            blocks: 0,
            fouls: 0,
            turnovers: 0
        };
        this.seasonStats = {
            gamesPlayed: 0,
            points: 0,
            rebounds: 0,
            assists: 0,
            steals: 0,
            blocks: 0,
            fouls: 0,
            turnovers: 0
        };
        
        // 训练相关属性
        this.trainingProgress = {
            shooting: 0,
            dribbling: 0,
            defense: 0,
            physical: 0,
            basketballIQ: 0
        };
        
        // 技能相关属性
        this.skills = [];
        this.learningSkills = []; // 正在学习的技能
        
        // 训练潜力
        this.trainingPotential = {
            shooting: Math.random() * 0.5 + 0.5, // 0.5-1.0
            dribbling: Math.random() * 0.5 + 0.5,
            defense: Math.random() * 0.5 + 0.5,
            physical: Math.random() * 0.5 + 0.5,
            basketballIQ: Math.random() * 0.5 + 0.5
        };
    }
    
    // 确定大学年级
    determineCollegeYear(age) {
        // NCAA篮球运动员年龄通常在17-22岁之间
        // 大学四年制：新生、大二、大三、大四
        
        if (age <= 18) return 1; // 新生 (Freshman) - 通常17-18岁
        if (age <= 19) return 2; // 大二 (Sophomore) - 通常18-19岁
        if (age <= 20) return 3; // 大三 (Junior) - 通常19-20岁
        if (age <= 21) return 4; // 大四 (Senior) - 通常20-21岁
        return 4; // 超龄大四 - 少数情况，如22岁
    }
    
    // 获取大学年级文本
    getCollegeYearText() {
        const yearTexts = ['', '新生', '大二', '大三', '大四'];
        return yearTexts[this.year] || '大四';
    }
    
    // 生成球员属性
    generateAttributes(customAttributes = {}) {
        const attributes = {};
        
        // 为每个属性生成基础值
        for (const key in PlayerAttributes) {
            if (customAttributes[key]) {
                attributes[key] = customAttributes[key];
            } else {
                // 大学球员属性范围：30-75，平均约52，低于职业联赛
                // 根据大学年级调整属性范围，高年级评分更高
                let baseValue = 30;
                let range = 35;
                
                switch (this.year) {
                    case 1: // 新生
                        baseValue = 25;
                        range = 30;
                        break;
                    case 2: // 大二
                        baseValue = 30;
                        range = 35;
                        break;
                    case 3: // 大三
                        baseValue = 35;
                        range = 35;
                        break;
                    case 4: // 大四
                        baseValue = 40;
                        range = 30;
                        break;
                }
                
                attributes[key] = Math.floor(baseValue + Math.random() * range);
            }
        }
        
        // 根据位置调整属性
        this.adjustAttributesByPosition(attributes);
        
        return attributes;
    }
    
    // 根据位置调整属性
    adjustAttributesByPosition(attributes) {
        switch (this.position) {
            case 'PG':
                attributes.dribbling += 10;
                attributes.passing += 10;
                attributes.speed += 8;
                attributes.stealing += 5;
                attributes.scoring -= 5;
                attributes.blocking -= 5;
                break;
            case 'SG':
                attributes.shooting += 10;
                attributes.threePoint += 10;
                attributes.scoring += 8;
                attributes.speed += 5;
                attributes.passing -= 5;
                attributes.rebounding -= 5;
                break;
            case 'SF':
                attributes.scoring += 8;
                attributes.shooting += 5;
                attributes.speed += 5;
                attributes.defense += 5;
                attributes.strength += 3;
                attributes.passing -= 3;
                break;
            case 'PF':
                attributes.rebounding += 10;
                attributes.strength += 10;
                attributes.defense += 8;
                attributes.scoring += 5;
                attributes.threePoint -= 8;
                attributes.speed -= 5;
                break;
            case 'C':
                attributes.rebounding += 12;
                attributes.blocking += 10;
                attributes.strength += 12;
                attributes.defense += 8;
                attributes.threePoint -= 10;
                attributes.dribbling -= 8;
                break;
        }
        
        // 确保属性值在合理范围内
        for (const key in attributes) {
            attributes[key] = Math.max(20, Math.min(100, attributes[key]));
        }
    }
    
    // 计算奖学金等级
    calculateScholarship() {
        let totalAttribute = 0;
        let attributeCount = 0;
        
        for (const key in this.attributes) {
            totalAttribute += this.attributes[key];
            attributeCount++;
        }
        
        const averageAttribute = totalAttribute / attributeCount;
        
        // NCAA篮球奖学金规则：
        // NCAA D1级别篮球项目有13个全额奖学金名额，可以分配给最多15名球员
        // 奖学金可以是全额、部分或无奖学金
        // 1.0 = 全额奖学金 (Full Ride)
        // 0.75 = 75%奖学金
        // 0.5 = 50%奖学金
        // 0.25 = 25%奖学金
        // 0.0 = 无奖学金 (Walk-on)
        
        let scholarshipValue;
        
        if (averageAttribute >= 65) {
            scholarshipValue = 1.0; // 全额奖学金 - 顶级招募对象
        } else if (averageAttribute >= 60) {
            scholarshipValue = 0.75; // 75%奖学金 - 重要招募对象
        } else if (averageAttribute >= 55) {
            scholarshipValue = 0.5; // 50%奖学金 - 角色球员
        } else if (averageAttribute >= 50) {
            scholarshipValue = 0.25; // 25%奖学金 - 深度阵容球员
        } else {
            scholarshipValue = 0.0; // 无奖学金 - 自费球员 (Walk-on)
        }
        
        return scholarshipValue;
    }
    
    // 获取奖学金文本描述
    getScholarshipText() {
        const value = this.scholarship;
        
        if (value === 1.0) {
            return "全额奖学金";
        } else if (value === 0.75) {
            return "75%奖学金";
        } else if (value === 0.5) {
            return "50%奖学金";
        } else if (value === 0.25) {
            return "25%奖学金";
        } else {
            return "自费球员";
        }
    }
    
    // 计算球员潜力
    calculatePotential(teamId = null, playStyle = null) {
        // 基础潜力值
        let basePotential = 60 + Math.floor(Math.random() * 25); // 60-85
        
        // 天赋异禀加成
        if (this.isProdigy) {
            basePotential += 15; // 天赋异禀球员额外15点潜力
        }
        
        // 年级调整 - 低年级球员潜力更高
        const yearBonus = (4 - this.year) * 5; // 新生+15, 大二+10, 大三+5, 大四+0
        
        // 队伍适配度加成
        let teamFitBonus = 0;
        if (teamId !== null) {
            teamFitBonus = this.calculateTeamFitBonus(teamId);
        }
        
        // 战术适配度加成
        let tacticalFitBonus = 0;
        if (playStyle !== null) {
            tacticalFitBonus = this.calculateTacticalFitBonus(playStyle);
        }
        
        // 教练发展加成
        let coachBonus = 0;
        if (teamId !== null) {
            const team = GameState.allTeams.find(t => t.id === teamId);
            if (team && team.coach) {
                // 计算教练对球员发展的加成
                coachBonus = team.coach.calculateDevelopmentBonus(this);
            }
        }
        
        // 确保潜力值在合理范围内
        let potential = basePotential + yearBonus + teamFitBonus + tacticalFitBonus + coachBonus;
        potential = Math.min(99, Math.max(60, potential));
        
        return potential;
    }
    
    // 生成天赋
    generateTalents() {
        const talents = [];
        
        // 根据稀有度决定天赋数量
        const rand = Math.random();
        let numTalents;
        
        if (rand < 0.05) { // 5%概率获得传奇天赋
            numTalents = 1;
            const legendaryTalents = Object.keys(PlayerTalents).filter(key => PlayerTalents[key].rarity === 'legendary');
            if (legendaryTalents.length > 0) {
                const talentId = legendaryTalents[Math.floor(Math.random() * legendaryTalents.length)];
                talents.push(talentId);
            }
        } else if (rand < 0.2) { // 15%概率获得稀有天赋
            numTalents = 1;
            const rareTalents = Object.keys(PlayerTalents).filter(key => PlayerTalents[key].rarity === 'rare');
            if (rareTalents.length > 0) {
                const talentId = rareTalents[Math.floor(Math.random() * rareTalents.length)];
                talents.push(talentId);
            }
        } else { // 80%概率获得普通天赋
            numTalents = 1 + Math.floor(Math.random() * 2); // 1-2个普通天赋
            const commonTalents = Object.keys(PlayerTalents).filter(key => PlayerTalents[key].rarity === 'common');
            
            for (let i = 0; i < numTalents && commonTalents.length > 0; i++) {
                const index = Math.floor(Math.random() * commonTalents.length);
                const talentId = commonTalents[index];
                if (!talents.includes(talentId)) {
                    talents.push(talentId);
                }
            }
        }
        
        return talents;
    }
    
    // 计算属性上限
    calculateAttributeCaps() {
        // 默认上限
        const defaultCaps = {
            scoring: 85, shooting: 85, threePoint: 85, freeThrow: 85,
            passing: 85, dribbling: 85, defense: 85, rebounding: 85,
            stealing: 85, blocking: 85, speed: 85, stamina: 85,
            strength: 85, basketballIQ: 85
        };
        
        // 根据天赋调整上限
        this.talents.forEach(talentId => {
            const talent = PlayerTalents[talentId];
            if (talent && talent.caps) {
                for (const attr in talent.caps) {
                    defaultCaps[attr] = Math.max(defaultCaps[attr] || 0, talent.caps[attr]);
                }
            }
        });
        
        return defaultCaps;
    }
    
    // 获取天赋加成
    getTalentBonus(attribute) {
        let bonus = 1.0; // 默认无加成
        
        this.talents.forEach(talentId => {
            const talent = PlayerTalents[talentId];
            if (talent && talent.trainingBonus && talent.trainingBonus[attribute]) {
                bonus *= talent.trainingBonus[attribute];
            }
        });
        
        return bonus;
    }
    
    // 获取成长曲线
    getGrowthCurve() {
        // 检查是否有特殊成长曲线的天赋
        for (const talentId of this.talents) {
            const talent = PlayerTalents[talentId];
            if (talent && talent.growthCurve) {
                return talent.growthCurve;
            }
        }
        
        // 默认线性成长
        return 'linear';
    }
    
    // 计算成长修正值
    calculateGrowthModifier(baseValue, growthStage) {
        const curve = this.getGrowthCurve();
        
        switch (curve) {
            case 'exponential': // 大器晚成 - 指数增长
                // 初期(0-30): 0.5x, 中期(30-70): 1.0x, 后期(70-100): 1.5x-2.0x
                if (growthStage < 30) return baseValue * 0.5;
                if (growthStage < 70) return baseValue;
                return baseValue * (1.5 + (growthStage - 70) / 60);
                
            case 'logarithmic': // 天才 - 对数增长
                // 初期(0-30): 2.0x-1.5x, 中期(30-70): 1.5x-1.0x, 后期(70-100): 1.0x-0.5x
                if (growthStage < 30) return baseValue * (2.0 - growthStage / 60);
                if (growthStage < 70) return baseValue * (1.5 - (growthStage - 30) / 80);
                return baseValue * (1.0 - (growthStage - 70) / 60);
                
            default: // 线性增长
                return baseValue;
        }
    }
    
    // 计算队伍适配度
    calculateTeamFitBonus(teamId) {
        // 如果没有提供球队ID，返回0
        if (!teamId) return 0;
        
        // 获取球队信息
        const team = GameState.allTeams.find(t => t.id === teamId);
        if (!team) return 0;
        
        // 计算当前球队在该位置的球员平均评分
        const positionPlayers = team.roster.filter(p => p.position === this.position);
        const avgPositionRating = positionPlayers.length > 0 ? 
            positionPlayers.reduce((sum, p) => sum + p.getOverallRating(), 0) / positionPlayers.length : 0;
        
        // 如果球员能力高于球队该位置平均水平，给予适配度加成
        const playerRating = this.getOverallRating();
        if (playerRating > avgPositionRating) {
            return Math.min(5, Math.floor((playerRating - avgPositionRating) / 5)); // 最高5点加成
        }
        
        return 0;
    }
    
    // 计算战术适配度
    calculateTacticalFitBonus(playStyle) {
        // 战术风格与球员属性的匹配度
        let fitScore = 0;
        
        switch (playStyle) {
            case 'fast-break': // 快攻
                // 速度、体力、得分能力更重要
                fitScore = (this.attributes.speed * 0.3) + 
                           (this.attributes.stamina * 0.2) + 
                           (this.attributes.scoring * 0.3) + 
                           (this.attributes.dribbling * 0.2);
                break;
                
            case 'half-court': // 半场阵地
                // 投篮、防守、篮板更重要
                fitScore = (this.attributes.shooting * 0.3) + 
                           (this.attributes.defense * 0.3) + 
                           (this.attributes.rebounding * 0.2) + 
                           (this.attributes.basketballIQ * 0.2);
                break;
                
            case 'three-point': // 三分战术
                // 三分、传球、篮球智商更重要
                fitScore = (this.attributes.threePoint * 0.4) + 
                           (this.attributes.passing * 0.2) + 
                           (this.attributes.basketballIQ * 0.2) + 
                           (this.attributes.shooting * 0.2);
                break;
                
            case 'inside': // 内线战术
                // 力量、篮板、盖帽更重要
                fitScore = (this.attributes.strength * 0.3) + 
                           (this.attributes.rebounding * 0.3) + 
                           (this.attributes.blocking * 0.2) + 
                           (this.attributes.scoring * 0.2);
                break;
                
            case 'balanced': // 平衡战术
                // 所有属性均衡考虑
                fitScore = (this.attributes.scoring * 0.15) + 
                           (this.attributes.shooting * 0.15) + 
                           (this.attributes.threePoint * 0.1) + 
                           (this.attributes.passing * 0.1) + 
                           (this.attributes.dribbling * 0.1) + 
                           (this.attributes.defense * 0.15) + 
                           (this.attributes.rebounding * 0.1) + 
                           (this.attributes.stealing * 0.05) + 
                           (this.attributes.blocking * 0.05) + 
                           (this.attributes.speed * 0.1) + 
                           (this.attributes.stamina * 0.05) + 
                           (this.attributes.strength * 0.05) + 
                           (this.attributes.basketballIQ * 0.1);
                break;
                
            default:
                // 默认平衡战术
                fitScore = this.getOverallRating();
        }
        
        // 将适配度分数转换为加成
        const normalizedScore = fitScore / 100; // 标准化到0-1
        return Math.floor(normalizedScore * 5); // 最高5点加成
    }
    
    // 获取球探评级
    getScoutRating() {
        if (this.scoutRating !== null) {
            return this.scoutRating;
        }
        
        // 根据潜力值确定球探评级
        const potential = this.potential;
        
        if (potential >= 90) {
            this.scoutRating = 'A'; // 精英潜力
        } else if (potential >= 80) {
            this.scoutRating = 'B'; // 优秀潜力
        } else if (potential >= 70) {
            this.scoutRating = 'C'; // 平均潜力
        } else {
            this.scoutRating = 'D'; // 低于平均潜力
        }
        
        return this.scoutRating;
    }
    
    // 获取球探评级颜色
    getScoutRatingColor() {
        const rating = this.getScoutRating();
        
        switch (rating) {
            case 'A': return '#4CAF50'; // 绿色
            case 'B': return '#2196F3'; // 蓝色
            case 'C': return '#FF9800'; // 橙色
            case 'D': return '#F44336'; // 红色
            default: return '#9E9E9E'; // 灰色
        }
    }
    
    // 获取球探评级文本
    getScoutRatingText() {
        const rating = this.getScoutRating();
        
        switch (rating) {
            case 'A': return '精英潜力';
            case 'B': return '优秀潜力';
            case 'C': return '平均潜力';
            case 'D': return '低于平均潜力';
            default: return '未评价';
        }
    }
    
    // 获取综合评分
    getOverallRating() {
        let total = 0;
        let count = 0;
        
        for (const key in this.attributes) {
            total += this.attributes[key];
            count++;
        }
        
        return Math.floor(total / count);
    }
    
    // 训练提升属性
    train(attributeType, intensity = 1) {
        if (this.fatigue > 80) {
            return { success: false, message: "球员过于疲劳，需要休息" };
        }
        
        if (this.injuryDays > 0) {
            return { success: false, message: "球员正在伤病中，无法训练" };
        }
        
        // 计算基础提升值
        let baseImprovement = Math.floor(Math.random() * 3 * intensity) + 1;
        
        // 应用天赋加成
        const talentBonus = this.getTalentBonus(attributeType);
        const adjustedImprovement = Math.floor(baseImprovement * talentBonus);
        
        // 计算成长阶段 (0-100)
        const growthStage = this.calculateGrowthStage(attributeType);
        
        // 应用成长曲线修正
        const finalImprovement = this.calculateGrowthModifier(adjustedImprovement, growthStage);
        
        const currentValue = this.attributes[attributeType];
        const cap = this.attributeCaps[attributeType] || 85;
        
        // 属性提升难度递增
        let successChance = 0.8;
        if (currentValue > 70) successChance = 0.6;
        if (currentValue > 80) successChance = 0.4;
        if (currentValue > 90) successChance = 0.2;
        
        // 接近上限时成功率降低
        if (currentValue > cap * 0.9) successChance *= 0.7;
        if (currentValue > cap * 0.95) successChance *= 0.5;
        
        // 记录训练历史
        const trainingRecord = {
            date: new Date(),
            attribute: attributeType,
            intensity: intensity,
            baseImprovement: baseImprovement,
            talentBonus: talentBonus,
            finalImprovement: finalImprovement,
            success: false
        };
        
        if (Math.random() < successChance) {
            // 应用属性提升
            const actualImprovement = Math.min(finalImprovement, cap - currentValue);
            this.attributes[attributeType] = Math.min(cap, currentValue + actualImprovement);
            
            // 更新属性进度
            this.attributeProgress[attributeType].trainingGains += actualImprovement;
            this.attributeProgress[attributeType].totalGains += actualImprovement;
            this.attributeProgress[attributeType].current = this.attributes[attributeType];
            
            // 增加疲劳和经验
            this.fatigue += 10 * intensity;
            this.experience += 5 * intensity;
            
            // 增加成长点数
            this.growthPoints += Math.floor(actualImprovement * intensity);
            
            // 记录训练成功
            trainingRecord.success = true;
            trainingRecord.actualImprovement = actualImprovement;
            this.trainingHistory.push(trainingRecord);
            
            // 检查升级
            if (this.experience >= this.level * 100) {
                this.level++;
                this.experience = 0;
                return { 
                    success: true, 
                    message: `训练成功！${PlayerAttributes[attributeType]}提升${actualImprovement}点，球员升到${this.level}级！`,
                    levelUp: true,
                    improvement: actualImprovement
                };
            }
            
            return { 
                success: true, 
                message: `训练成功！${PlayerAttributes[attributeType]}提升${actualImprovement}点`,
                levelUp: false,
                improvement: actualImprovement
            };
        } else {
            this.fatigue += 5 * intensity;
            
            // 记录训练失败
            this.trainingHistory.push(trainingRecord);
            
            return { success: false, message: "训练效果不明显，继续努力" };
        }
    }
    
    // 计算成长阶段
    calculateGrowthStage(attributeType) {
        const current = this.attributes[attributeType];
        const cap = this.attributeCaps[attributeType] || 85;
        
        // 返回0-100的成长阶段百分比
        return Math.floor((current / cap) * 100);
    }
    
    // 获取成长路径信息
    getGrowthPathInfo() {
        const pathInfo = {
            talents: this.talents.map(talentId => ({
                id: talentId,
                name: PlayerTalents[talentId].name,
                description: PlayerTalents[talentId].description,
                rarity: PlayerTalents[talentId].rarity
            })),
            attributeCaps: this.attributeCaps,
            growthCurve: this.getGrowthCurve(),
            totalGrowthPoints: this.growthPoints,
            trainingHistory: this.trainingHistory.slice(-10), // 最近10次训练
            recentPerformance: this.matchPerformance.slice(-5), // 最近5场比赛
            attributeProgress: {}
        };
        
        // 添加属性进度信息
        for (const attr in this.attributeProgress) {
            const progress = this.attributeProgress[attr];
            const cap = this.attributeCaps[attr] || 85;
            const current = this.attributes[attr];
            
            pathInfo.attributeProgress[attr] = {
                current: current,
                cap: cap,
                progressPercentage: Math.floor((current / cap) * 100),
                trainingGains: progress.trainingGains,
                matchGains: progress.matchGains,
                totalGains: progress.totalGains,
                remaining: cap - current
            };
        }
        
        return pathInfo;
    }
    
    // 获取天赋描述
    getTalentDescription(talentId) {
        const talent = PlayerTalents[talentId];
        if (!talent) return '';
        
        let description = `<strong>${talent.name}</strong> (${this.getRarityName(talent.rarity)})<br>`;
        description += `${talent.description}<br>`;
        description += `<strong>影响属性:</strong> `;
        
        talent.attributes.forEach((attr, index) => {
            const attrName = PlayerAttributes[attr];
            const cap = talent.caps[attr];
            const bonus = talent.trainingBonus[attr];
            
            description += `${attrName}(上限:${cap}, 训练加成:${bonus}x)`;
            
            if (index < talent.attributes.length - 1) {
                description += ', ';
            }
        });
        
        return description;
    }
    
    // 获取稀有度名称
    getRarityName(rarity) {
        const names = {
            common: '普通',
            rare: '稀有',
            legendary: '传奇'
        };
        return names[rarity] || '未知';
    }
    
    // 休息恢复疲劳
    rest() {
        this.fatigue = Math.max(0, this.fatigue - 30);
        if (this.injuryDays > 0) {
            this.injuryDays--;
        }
    }
    
    // 比赛后恢复
    postGameRecovery() {
        this.fatigue = Math.min(100, this.fatigue + 15);
        
        // 疲劳可能导致伤病
        if (this.fatigue > 85 && Math.random() < 0.2) {
            this.injuryDays = Math.floor(Math.random() * 5) + 1;
            return true; // 受伤
        }
        return false;
    }
    
    // 获取状态描述
    getStatusDescription() {
        if (this.injuryDays > 0) {
            return `伤病中 (${this.injuryDays}天)`;
        } else if (this.fatigue > 80) {
            return "极度疲劳";
        } else if (this.fatigue > 60) {
            return "疲劳";
        } else if (this.fatigue > 40) {
            return "正常";
        } else {
            return "状态良好";
        }
    }
    
    // 训练球员
    train(trainingType, intensity = 1) {
        if (this.fatigue > 80) {
            return { success: false, message: "球员过于疲劳，无法训练" };
        }
        
        // 增加疲劳度
        this.fatigue += 10 * intensity;
        
        // 增加训练进度
        const potential = this.trainingPotential[trainingType];
        const progressGain = Math.floor(Math.random() * 5 * intensity * potential) + 1;
        this.trainingProgress[trainingType] = Math.min(100, this.trainingProgress[trainingType] + progressGain);
        
        // 训练进度达到100时提升相关属性
        if (this.trainingProgress[trainingType] >= 100) {
            this.applyTrainingBenefits(trainingType);
            this.trainingProgress[trainingType] = 0; // 重置进度
            
            // 训练潜力略微下降（ diminishing returns）
            this.trainingPotential[trainingType] *= 0.95;
            
            return { 
                success: true, 
                message: `训练完成！${this.name}的${this.getTrainingName(trainingType)}能力提升`,
                levelUp: true
            };
        }
        
        return { 
            success: true, 
            message: `训练进行中... ${this.trainingProgress[trainingType]}/100`,
            progress: this.trainingProgress[trainingType]
        };
    }
    
    // 应用训练收益
    applyTrainingBenefits(trainingType) {
        const attributeGains = this.getTrainingAttributes(trainingType);
        for (const attr in attributeGains) {
            if (this.attributes[attr]) {
                this.attributes[attr] = Math.min(75, this.attributes[attr] + attributeGains[attr]);
            }
        }
    }
    
    // 获取训练类型对应的属性
    getTrainingAttributes(trainingType) {
        switch (trainingType) {
            case 'shooting':
                return { scoring: 3, threePoint: 3, freeThrow: 2 };
            case 'dribbling':
                return { dribbling: 3, speed: 2 };
            case 'defense':
                return { defense: 3, rebounding: 2, stealing: 2, blocking: 1 };
            case 'physical':
                return { strength: 3, stamina: 2 };
            case 'basketballIQ':
                return { passing: 2, basketballIQ: 3, leadership: 1 };
            default:
                return {};
        }
    }
    
    // 获取训练类型名称
    getTrainingName(trainingType) {
        const names = {
            shooting: '投篮',
            dribbling: '运球',
            defense: '防守',
            physical: '体能',
            basketballIQ: '篮球智商'
        };
        return names[trainingType] || '未知';
    }
    
    // 学习技能
    learnSkill(skillId) {
        // 检查是否已经学会该技能
        if (this.skills.includes(skillId)) {
            return { success: false, message: "已经学会了该技能" };
        }
        
        // 检查是否正在学习该技能
        if (this.learningSkills.find(s => s.id === skillId)) {
            return { success: false, message: "正在学习该技能中" };
        }
        
        const skill = Skills[skillId];
        if (!skill) {
            return { success: false, message: "技能不存在" };
        }
        
        // 检查是否满足学习条件
        if (!this.checkSkillRequirements(skill)) {
            return { success: false, message: "不满足学习该技能的条件" };
        }
        
        // 开始学习技能
        this.learningSkills.push({
            id: skillId,
            progress: 0
        });
        
        return { success: true, message: `开始学习技能：${skill.name}` };
    }
    
    // 检查技能学习条件
    checkSkillRequirements(skill) {
        if (!skill.requirements) return true;
        
        for (const req of skill.requirements) {
            if (req.type === 'attribute' && this.attributes[req.attribute] < req.value) {
                return false;
            }
            if (req.type === 'skill' && !this.skills.includes(req.skillId)) {
                return false;
            }
            if (req.type === 'year' && this.year < req.value) {
                return false;
            }
        }
        
        return true;
    }
    
    // 更新技能学习进度
    updateSkillLearning() {
        const completedSkills = [];
        
        this.learningSkills.forEach((learning, index) => {
            learning.progress += Math.floor(Math.random() * 10) + 5;
            
            if (learning.progress >= 100) {
                this.skills.push(learning.id);
                completedSkills.push(index);
            }
        });
        
        // 移除已完成的技能学习
        for (let i = completedSkills.length - 1; i >= 0; i--) {
            const index = completedSkills[i];
            const skillId = this.learningSkills[index].id;
            this.learningSkills.splice(index, 1);
            
            // 应用技能效果
            this.applySkillEffect(skillId);
        }
        
        return completedSkills.length > 0;
    }
    
    // 应用技能效果
    applySkillEffect(skillId) {
        const skill = Skills[skillId];
        if (!skill || !skill.effects) return;
        
        skill.effects.forEach(effect => {
            if (effect.type === 'attribute' && this.attributes[effect.attribute]) {
                this.attributes[effect.attribute] = Math.min(75, this.attributes[effect.attribute] + effect.value);
            }
        });
    }
    
    // 恢复疲劳
    rest(amount = 20) {
        this.fatigue = Math.max(0, this.fatigue - amount);
    }
}

// 教练原型定义
const CoachArchetypes = {
    offensive: {
        name: '进攻型教练',
        description: '专注于进攻战术，擅长提升球队得分能力',
        preferredPlayStyles: ['fast-break', 'three-point'],
        attributeFocus: ['offense', 'motivation'],
        trainingBonus: { scoring: 1.3, shooting: 1.2, threePoint: 1.3 },
        tendencies: { tempo: 80, threePointFocus: 70, insideFocus: 40, defenseAggression: 40, fastBreak: 80 }
    },
    defensive: {
        name: '防守型教练',
        description: '专注于防守战术，擅长提升球队防守能力',
        preferredPlayStyles: ['half-court', 'inside'],
        attributeFocus: ['defense', 'discipline'],
        trainingBonus: { defense: 1.3, rebounding: 1.2, stealing: 1.2, blocking: 1.2 },
        tendencies: { tempo: 30, threePointFocus: 30, insideFocus: 80, defenseAggression: 80, fastBreak: 30 }
    },
    balanced: {
        name: '均衡型教练',
        description: '注重攻防平衡，适合全面发展的球队',
        preferredPlayStyles: ['balanced'],
        attributeFocus: ['development', 'discipline'],
        trainingBonus: { scoring: 1.1, shooting: 1.1, defense: 1.1, passing: 1.1 },
        tendencies: { tempo: 50, threePointFocus: 50, insideFocus: 50, defenseAggression: 50, fastBreak: 50 }
    },
    developmental: {
        name: '培养型教练',
        description: '专注于球员发展，擅长提升年轻球员潜力',
        preferredPlayStyles: ['balanced'],
        attributeFocus: ['development', 'motivation'],
        trainingBonus: { scoring: 1.2, shooting: 1.2, defense: 1.2, passing: 1.2, dribbling: 1.2 },
        tendencies: { tempo: 60, threePointFocus: 40, insideFocus: 60, defenseAggression: 50, fastBreak: 60 }
    },
    veteran: {
        name: '老练教练',
        description: '经验丰富，擅长临场调整和心理建设',
        preferredPlayStyles: ['half-court', 'balanced'],
        attributeFocus: ['motivation', 'discipline'],
        trainingBonus: { basketballIQ: 1.4, passing: 1.2, defense: 1.1 },
        tendencies: { tempo: 40, threePointFocus: 50, insideFocus: 60, defenseAggression: 60, fastBreak: 40 }
    }
};

// 教练类
class Coach {
    constructor(name, teamId = null, archetype = null) {
        this.id = GameState.coachIdCounter++;
        this.name = name;
        this.teamId = teamId; // 所属球队ID
        this.age = 35 + Math.floor(Math.random() * 30); // 35-65岁
        this.experience = Math.floor(Math.random() * 30); // 0-30年执教经验
        
        // 教练原型
        this.archetype = archetype || this.determineArchetype();
        const archetypeData = CoachArchetypes[this.archetype];
        
        // 基于原型设置教练属性
        this.attributes = {
            offense: this.getAttributeBasedOnArchetype('offense', archetypeData),
            defense: this.getAttributeBasedOnArchetype('defense', archetypeData),
            motivation: this.getAttributeBasedOnArchetype('motivation', archetypeData),
            discipline: this.getAttributeBasedOnArchetype('discipline', archetypeData),
            development: this.getAttributeBasedOnArchetype('development', archetypeData),
            recruiting: this.getAttributeBasedOnArchetype('recruiting', archetypeData)
        };
        
        // 基于原型设置战术倾向
        this.tendencies = { ...archetypeData.tendencies };
        
        // 训练风格
        this.trainingStyle = this.determineTrainingStyle();
        
        // 战术体系 - 基于原型偏好
        const preferredStyles = archetypeData.preferredPlayStyles;
        this.playStyle = preferredStyles[Math.floor(Math.random() * preferredStyles.length)];
        
        // 合同信息
        this.contract = {
            years: 1 + Math.floor(Math.random() * 5), // 1-5年合同
            salary: 200000 + Math.floor(Math.random() * 1300000) // 20万-150万年薪
        };
        
        // 执教记录
        this.record = {
            totalWins: Math.floor(Math.random() * 500),
            totalLosses: Math.floor(Math.random() * 500),
            championships: Math.floor(Math.random() * 5)
        };
        
        // 声誉 (0-100)
        this.reputation = 40 + Math.floor(Math.random() * 40);
        
        // 基于原型的训练加成
        this.trainingBonus = archetypeData.trainingBonus || {};
    }
    
    // 确定教练原型
    determineArchetype() {
        const archetypes = Object.keys(CoachArchetypes);
        return archetypes[Math.floor(Math.random() * archetypes.length)];
    }
    
    // 基于原型获取属性值
    getAttributeBasedOnArchetype(attribute, archetypeData) {
        // 如果是原型重点属性，给予更高值
        if (archetypeData.attributeFocus.includes(attribute)) {
            return 60 + Math.floor(Math.random() * 30); // 60-89
        } else {
            return 40 + Math.floor(Math.random() * 40); // 40-79
        }
    }
    
    // 战术体系
    this.playStyle = this.determinePlayStyle();
    
    // 合同信息
    this.contract = {
        years: 1 + Math.floor(Math.random() * 5), // 1-5年合同
        salary: 200000 + Math.floor(Math.random() * 1300000) // 20万-150万年薪
    };
    
    // 执教记录
    this.record = {
        totalWins: Math.floor(Math.random() * 500),
        totalLosses: Math.floor(Math.random() * 500),
        championships: Math.floor(Math.random() * 5)
    };
    
    // 声誉 (0-100)
    this.reputation = 40 + Math.floor(Math.random() * 40);
}

// 确定训练风格
determineTrainingStyle() {
    const styles = ['balanced', 'intensive', 'technical', 'physical', 'mental'];
    return styles[Math.floor(Math.random() * styles.length)];
}

// 确定战术体系
determinePlayStyle() {
    const styles = ['fast-break', 'half-court', 'three-point', 'inside', 'balanced'];
    return styles[Math.floor(Math.random() * styles.length)];
}

// 获取训练风格名称
getTrainingStyleName() {
    const names = {
        balanced: '均衡型',
        intensive: '高强度型',
        technical: '技术型',
        physical: '体能型',
        mental: '心理型'
    };
    return names[this.trainingStyle] || '未知';
}

// 获取战术体系名称
getPlayStyleName() {
    const names = {
        'fast-break': '快攻体系',
        'half-court': '半场阵地',
        'three-point': '三分战术',
        'inside': '内线战术',
        'balanced': '平衡战术'
    };
    return names[this.playStyle] || '未知';
}
    
    // 计算教练综合评分
    getOverallRating() {
        let total = 0;
        let count = 0;
        
        for (const key in this.attributes) {
            total += this.attributes[key];
            count++;
        }
        
        return Math.floor(total / count);
    }
    
    // 计算对球员发展的加成
    calculateDevelopmentBonus(player) {
        let bonus = 0;
        
        // 基于训练风格的加成
        switch (this.trainingStyle) {
            case 'balanced':
                bonus = 2; // 均衡发展
                break;
            case 'intensive':
                bonus = 4; // 高强度训练效果更好
                break;
            case 'technical':
                // 技术型教练对技术属性加成更多
                if (['shooting', 'dribbling', 'passing'].includes(player.trainingType)) {
                    bonus = 5;
                } else {
                    bonus = 2;
                }
                break;
            case 'physical':
                // 体能型教练对体能属性加成更多
                if (['physical', 'defense'].includes(player.trainingType)) {
                    bonus = 5;
                } else {
                    bonus = 2;
                }
                break;
            case 'mental':
                // 心理型教练对篮球智商加成更多
                if (player.trainingType === 'basketballIQ') {
                    bonus = 5;
                } else {
                    bonus = 2;
                }
                break;
        }
        
        // 基于教练发展能力的额外加成
        bonus += Math.floor(this.attributes.development / 20);
        
        // 应用教练原型的特定训练加成
        if (this.trainingBonus && player.trainingType && this.trainingBonus[player.trainingType]) {
            bonus += Math.floor((this.trainingBonus[player.trainingType] - 1) * 5);
        }
        
        return bonus;
    }
    
    // 获取教练原型描述
    getArchetypeDescription() {
        const archetypeData = CoachArchetypes[this.archetype];
        if (!archetypeData) return '';
        
        return `
            <div class="coach-archetype">
                <h4>${archetypeData.name}</h4>
                <p>${archetypeData.description}</p>
                <div class="coach-focus">
                    <h5>专长属性:</h5>
                    <ul>
                        ${archetypeData.attributeFocus.map(attr => `
                            <li>${this.getAttributeDisplayName(attr)}: ${this.attributes[attr]}</li>
                        `).join('')}
                    </ul>
                </div>
                <div class="coach-preferences">
                    <h5>偏好战术:</h5>
                    <ul>
                        ${archetypeData.preferredPlayStyles.map(style => `
                            <li>${this.getPlayStyleName(style)}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    
    // 获取属性显示名称
    getAttributeDisplayName(attribute) {
        const names = {
            offense: '进攻',
            defense: '防守',
            motivation: '激励',
            discipline: '纪律',
            development: '发展',
            recruiting: '招募'
        };
        return names[attribute] || attribute;
    }
    
    // 计算与球队的适配度
    calculateTeamFit(team) {
        let fitScore = 0;
        
        // 基于球队阵容与教练战术的匹配度
        const teamPlayStyle = team.getPlayStyle();
        if (this.playStyle === teamPlayStyle) {
            fitScore += 30; // 战术体系完全匹配
        } else if (this.archetype === 'balanced') {
            fitScore += 20; // 均衡型教练适应性强
        }
        
        // 基于球队实力与教练经验的匹配度
        const teamStrength = team.getTeamStrength();
        if (teamStrength > 70 && this.attributes.offense > 70) {
            fitScore += 15; // 强队需要进攻能力强的教练
        } else if (teamStrength < 50 && this.attributes.development > 70) {
            fitScore += 15; // 弱队需要发展能力强的教练
        }
        
        // 基于球队年龄结构与教练类型的匹配度
        const avgAge = team.roster.reduce((sum, player) => sum + player.age, 0) / team.roster.length;
        if (avgAge < 20 && this.archetype === 'developmental') {
            fitScore += 15; // 年轻球队需要培养型教练
        } else if (avgAge > 22 && this.archetype === 'veteran') {
            fitScore += 15; // 年长球队需要老练教练
        }
        
        return Math.min(100, fitScore);
    }
    
    // 计算对球队表现的影响
    calculateTeamImpact() {
        let impact = 0;
        
        // 基于教练属性计算对球队的影响
        impact += this.attributes.offense * 0.2;
        impact += this.attributes.defense * 0.2;
        impact += this.attributes.motivation * 0.15;
        impact += this.attributes.discipline * 0.15;
        impact += this.attributes.development * 0.15;
        impact += this.attributes.recruiting * 0.15;
        
        return Math.floor(impact);
    }
    
    // 计算招募能力
    calculateRecruitingPower() {
        let power = 0;
        
        // 基于招募属性和声誉
        power += this.attributes.recruiting * 0.6;
        power += this.reputation * 0.3;
        power += this.experience * 0.1;
        
        return Math.floor(power);
    }
}

// 球队类
class Team {
    constructor(name, isUserTeam = false) {
        this.id = GameState.teamIdCounter++;
        this.name = name;
        this.isUserTeam = isUserTeam;
        this.roster = [];
        this.coach = null; // 教练
        this.wins = 0;
        this.losses = 0;
        this.pointsFor = 0;
        this.pointsAgainst = 0;
        this.streak = 0; // 连胜/连败
        this.championships = 0;
        this.scholarshipsUsed = 0; // 已使用的奖学金数量
        this.rank = 0; // 排名
        
        // 大学篮球队财务系统
        if (isUserTeam) {
            // NCAA D1级别大学篮球队预算通常在100万-1000万美元之间
            // 我们设置为中等水平：500万美元
            this.funds = 5000000; // 初始资金：500万美元
            this.budget = 5000000; // 年度预算
            this.revenue = 0; // 赛季收入
            this.expenses = 0; // 赛季支出
        }
    }
    
    // 添加球员
    addPlayer(player) {
        // 大学篮球队阵容上限为12人（ NCAA标准）
        if (this.roster.length < 12) {
            this.roster.push(player);
            return true;
        }
        return false;
    }
    
    // 计算当前使用的奖学金数量
    calculateScholarshipsUsed() {
        let total = 0;
        this.roster.forEach(player => {
            // NCAA D1级别篮球项目有13个全额奖学金名额
            // 使用新的奖学金值系统：1.0=全额, 0.75=75%, 0.5=50%, 0.25=25%, 0.0=无
            total += player.scholarship;
        });
        this.scholarshipsUsed = total;
        return total;
    }
    
    // 检查是否可以添加球员
    canAddPlayer(player) {
        // 检查阵容人数限制（NCAA最多15人）
        if (this.roster.length >= 15) {
            return { canAdd: false, reason: "阵容已满（最多15人）" };
        }
        
        return { canAdd: true, reason: "" };
    }
    
    // 移除球员
    removePlayer(playerId) {
        const index = this.roster.findIndex(p => p.id === playerId);
        if (index !== -1) {
            this.roster.splice(index, 1);
            return true;
        }
        return false;
    }
    
    // 财务管理方法
    generateRevenue() {
        // NCAA D1篮球队收入来源
        let revenue = 0;
        
        // 比赛门票收入（根据球队表现和对手实力）
        const ticketRevenue = this.wins * 50000 + this.losses * 30000;
        revenue += ticketRevenue;
        
        // 转播收入（根据球队排名和表现）
        const broadcastRevenue = this.rank > 0 ? (20 - this.rank) * 25000 : 250000;
        revenue += broadcastRevenue;
        
        // 赞助收入（根据球队表现）
        const sponsorshipRevenue = this.wins * 10000;
        revenue += sponsorshipRevenue;
        
        // 商品销售
        const merchandiseRevenue = 100000;
        revenue += merchandiseRevenue;
        
        this.revenue = revenue;
        this.funds += revenue;
        
        return revenue;
    }
    
    calculateExpenses() {
        // NCAA D1篮球队支出项目
        let expenses = 0;
        
        // 奖学金支出（根据球员奖学金水平）
        const scholarshipExpenses = this.calculateScholarshipsUsed() * 40000; // 每个奖学金名额约4万美元
        expenses += scholarshipExpenses;
        
        // 教练团队薪资
        const coachingSalary = 800000; // 主教练约50万，助教团队约30万
        expenses += coachingSalary;
        
        // 设施维护
        const facilities = 500000;
        expenses += facilities;
        
        // 差旅费用
        const travel = this.roster.length * 5000 + (this.wins + this.losses) * 10000;
        expenses += travel;
        
        // 装备费用
        const equipment = 200000;
        expenses += equipment;
        
        // 招募费用
        const recruiting = 150000;
        expenses += recruiting;
        
        this.expenses = expenses;
        this.funds -= expenses;
        
        return expenses;
    }
    
    // 获取财务报告
    getFinancialReport() {
        return {
            funds: this.funds,
            budget: this.budget,
            revenue: this.revenue,
            expenses: this.expenses,
            netIncome: this.revenue - this.expenses,
            budgetRemaining: this.budget - this.expenses,
            scholarshipsUsed: this.calculateScholarshipsUsed(),
            scholarshipExpenses: this.calculateScholarshipsUsed() * 40000
        };
    }
    
    // 获取球员
    getPlayer(playerId) {
        return this.roster.find(p => p.id === playerId);
    }
    
    // 按位置获取球员
    getPlayersByPosition(position) {
        return this.roster.filter(p => p.position === position);
    }
    
    // 获取首发阵容
    getStartingLineup() {
        const lineup = {};
        
        // 确保每个位置至少有一个球员
        for (const pos in Positions) {
            const players = this.getPlayersByPosition(pos);
            if (players.length > 0) {
                // 选择该位置综合评分最高的球员
                lineup[pos] = players.reduce((best, player) => 
                    player.getOverallRating() > best.getOverallRating() ? player : best
                );
            }
        }
        
        return lineup;
    }
    
    // 计算球队实力
    getTeamStrength() {
        if (this.roster.length === 0) return 0;
        
        const totalStrength = this.roster.reduce((sum, player) => {
            return sum + player.getOverallRating();
        }, 0);
        
        return Math.floor(totalStrength / this.roster.length);
    }
    
    // 更新赛季统计
    updateSeasonStats(pointsFor, pointsAgainst, won) {
        this.pointsFor += pointsFor;
        this.pointsAgainst += pointsAgainst;
        
        if (won) {
            this.wins++;
            if (this.streak >= 0) {
                this.streak++;
            } else {
                this.streak = 1;
            }
        } else {
            this.losses++;
            if (this.streak <= 0) {
                this.streak--;
            } else {
                this.streak = -1;
            }
        }
    }
    
    // 获取胜率
    getWinPercentage() {
        const totalGames = this.wins + this.losses;
        if (totalGames === 0) return 0;
        return (this.wins / totalGames * 100).toFixed(1);
    }
    
    // 重置赛季数据
    resetSeasonStats() {
        this.wins = 0;
        this.losses = 0;
        this.pointsFor = 0;
        this.pointsAgainst = 0;
        this.streak = 0;
        
        // 重置球员赛季统计
        this.roster.forEach(player => {
            player.seasonStats = {
                gamesPlayed: 0,
                points: 0,
                rebounds: 0,
                assists: 0,
                steals: 0,
                blocks: 0,
                fouls: 0,
                turnovers: 0
            };
        });
    }
    
    // 设置教练
    setCoach(coach) {
        this.coach = coach;
        coach.teamId = this.id;
    }
    
    // 移除教练
    removeCoach() {
        if (this.coach) {
            this.coach.teamId = null;
            this.coach = null;
        }
    }
    
    // 获取球队战术体系
    getPlayStyle() {
        return this.coach ? this.coach.playStyle : 'balanced';
    }
    
    // 计算教练对球队的影响
    calculateCoachImpact() {
        if (!this.coach) return 0;
        return this.coach.calculateTeamImpact();
    }
}

// 生成随机球员名字
const firstNames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高'];
const lastNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛'];

function generateRandomName() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return firstName + lastName;
}

// 生成随机球员
function generateRandomPlayer(position = null, minAge = 17, maxAge = 22) {
    const positions = Object.keys(Positions);
    const selectedPosition = position || positions[Math.floor(Math.random() * positions.length)];
    const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
    
    return new Player(generateRandomName(), selectedPosition, age);
}

// 生成初始球员池
function generateInitialPlayerPool(count = 100) {
    const players = [];
    
    // 确保每个位置都有足够的球员
    const positions = Object.keys(Positions);
    const playersPerPosition = Math.floor(count / positions.length);
    
    positions.forEach(position => {
        for (let i = 0; i < playersPerPosition; i++) {
            players.push(generateRandomPlayer(position));
        }
    });
    
    // 添加剩余的随机位置球员
    const remaining = count - players.length;
    for (let i = 0; i < remaining; i++) {
        players.push(generateRandomPlayer());
    }
    
    return players;
}

// 初始化游戏
async function initializeGame() {
    // 创建用户球队
    GameState.userTeam = new Team('大学篮球队', true);
    
    // 创建并设置用户球队教练
    const userCoach = new Coach('张教练');
    GameState.userTeam.setCoach(userCoach);
    GameState.userCoach = userCoach;
    
    // 生成初始球员池
    GameState.availablePlayers = generateInitialPlayerPool(30); // 减少自由球员数量
    
    // 生成其他大学球队
    const teamNames = ['清华雄鹰', '北大猛虎', '复旦飞龙', '交大闪电', '浙大烈火', '南大钢铁', '中大风暴', '武大雷霆', '华科火箭', '西交太阳'];
    
    teamNames.forEach(name => {
        const team = new Team(name);
        
        // 为每个球队创建并设置教练
        const coach = new Coach(generateRandomName() + '教练');
        team.setCoach(coach);
        GameState.allCoaches.push(coach);
        
        // 为每个球队填充球员
        const positions = Object.keys(Positions);
        positions.forEach(position => {
            // 每个位置至少2个球员
            for (let i = 0; i < 2; i++) {
                const player = generateRandomPlayer(position);
                team.addPlayer(player);
            }
        });
        
        // 再添加一些随机位置的球员
        while (team.roster.length < 10) { // 大学球队标准阵容10-12人
            const player = generateRandomPlayer();
            team.addPlayer(player);
        }
        
        GameState.allTeams.push(team);
    });
    
    // 初始化教练市场
    initializeCoachMarket();
    
    // 更新UI
    updateUI();

    // 保存游戏状态到账号
    if (typeof gameStateManager !== 'undefined' && gameStateManager.saveGameState) {
        gameStateManager.saveGameState();
    }
}

// 初始化教练市场
function initializeCoachMarket() {
    // 生成教练市场
    GameState.availableCoaches = [];
    
    // 生成10-15名可签约教练
    const coachCount = 10 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < coachCount; i++) {
        // 随机选择教练原型
        const archetypes = Object.keys(CoachArchetypes);
        const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
        
        // 生成教练名字
        const coachNames = ['李教练', '王教练', '张教练', '刘教练', '陈教练', '杨教练', '赵教练', '黄教练', '周教练', '吴教练'];
        const name = coachNames[Math.floor(Math.random() * coachNames.length)];
        
        // 创建教练
        const coach = new Coach(name, null, archetype);
        GameState.availableCoaches.push(coach);
    }
    
    // 设置下次刷新日期（30天后）
    GameState.coachMarketRefreshDate = new Date();
    GameState.coachMarketRefreshDate.setDate(GameState.coachMarketRefreshDate.getDate() + 30);
}

// 刷新教练市场
function refreshCoachMarket() {
    // 移除已被签约的教练
    GameState.availableCoaches = GameState.availableCoaches.filter(coach => !coach.teamId);
    
    // 如果教练数量不足，添加新教练
    while (GameState.availableCoaches.length < 8) {
        const archetypes = Object.keys(CoachArchetypes);
        const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
        
        const coachNames = ['李教练', '王教练', '张教练', '刘教练', '陈教练', '杨教练', '赵教练', '黄教练', '周教练', '吴教练'];
        const name = coachNames[Math.floor(Math.random() * coachNames.length)];
        
        const coach = new Coach(name, null, archetype);
        GameState.availableCoaches.push(coach);
    }
    
    // 更新刷新日期
    GameState.coachMarketRefreshDate = new Date();
    GameState.coachMarketRefreshDate.setDate(GameState.coachMarketRefreshDate.getDate() + 30);
}

// 加载游戏
async function loadGame(savedState) {
    if (!savedState) {
        console.error('No saved state provided');
        return;
    }

    console.log('Loading saved game state...');
    
    // 恢复游戏状态
    Object.assign(GameState, savedState);
    
    // 确保必要的数组存在
    if (!GameState.allTeams) GameState.allTeams = [];
    if (!GameState.availablePlayers) GameState.availablePlayers = [];
    if (!GameState.allCoaches) GameState.allCoaches = [];
    if (!GameState.availableCoaches) GameState.availableCoaches = [];
    if (!GameState.gameSchedule) GameState.gameSchedule = [];
    if (!GameState.scoutingReports) GameState.scoutingReports = [];
    
    // 恢复日期对象
    if (typeof GameState.currentDate === 'string') {
        GameState.currentDate = new Date(GameState.currentDate);
    }
    if (typeof GameState.coachMarketRefreshDate === 'string') {
        GameState.coachMarketRefreshDate = new Date(GameState.coachMarketRefreshDate);
    }
    
    // 更新UI
    updateUI();
    
    console.log('Game loaded successfully');
}

// 更新游戏日期
function advanceDate(days = 1) {
    GameState.currentDate.setDate(GameState.currentDate.getDate() + days);
    
    // 处理比赛日
    processGameDay();
    
    // 检查赛季阶段变化
    checkSeasonPhase();
    
    // 更新市场动态（休赛期期间）
    updateMarketDynamics();
    
    // 更新UI
    updateUI();
}

// 更新市场动态（休赛期期间球员被挑走、难度降低等）
function updateMarketDynamics() {
    const currentMonth = GameState.currentDate.getMonth();
    const isOffseason = currentMonth >= 5 && currentMonth <= 8;
    
    if (!isOffseason) return;
    
    if (!GameState.availablePlayers) return;
    
    const progress = getOffseasonProgress();
    
    // 模拟其他球队签约球员
    simulateAIPlayerSignings(progress);
    
    // 更新剩余球员的签约难度
    updatePlayerSigningDifficulty(progress);
}

// 获取休赛期进度 (0.0 - 1.0)
function getOffseasonProgress() {
    const now = new Date();
    const seasonEnd = new Date(now.getFullYear(), 5, 15);
    const seasonStart = new Date(now.getFullYear() + 1, 9, 1);
    
    if (now < seasonEnd) {
        seasonEnd.setFullYear(seasonEnd.getFullYear() - 1);
        seasonStart.setFullYear(seasonStart.getFullYear() - 1);
    }
    
    const totalDays = (seasonStart - seasonEnd) / (1000 * 60 * 60 * 24);
    const daysPassed = (now - seasonEnd) / (1000 * 60 * 60 * 24);
    
    return Math.min(1, Math.max(0, daysPassed / totalDays));
}

// 模拟AI球队签约球员
function simulateAIPlayerSignings(progress) {
    const userRosterIds = GameState.userTeam.roster.map(p => p.id);
    
    for (let i = GameState.availablePlayers.length - 1; i >= 0; i--) {
        const player = GameState.availablePlayers[i];
        
        if (userRosterIds.includes(player.id)) continue;
        
        // 高评分球员更早被签走
        const baseProbability = (player.overallRating - 50) / 100;
        const timeFactor = 0.1 + (progress * 0.8);
        const yearMultiplier = player.year >= 3 ? 1.3 : 1.0;
        const pickupProb = baseProbability * timeFactor * yearMultiplier * 0.15;
        
        if (Math.random() < pickupProb) {
            console.log(`[市场动态] ${player.name} 被其他球队签走了 (评分: ${player.overallRating})`);
            GameState.availablePlayers.splice(i, 1);
        }
    }
}

// 更新球员签约难度（随时间降低）
function updatePlayerSigningDifficulty(progress) {
    GameState.availablePlayers.forEach(player => {
        if (!player.signingDifficulty) {
            player.signingDifficulty = player.overallRating >= 80 ? 0.9 : 
                                     player.overallRating >= 70 ? 0.7 : 
                                     player.overallRating >= 60 ? 0.5 : 0.3;
        }
        
        // 难度随时间降低，最低降到0.2
        if (player.signingDifficulty > 0.2) {
            player.signingDifficulty = Math.max(0.2, player.signingDifficulty - progress * 0.02);
        }
    });
}

// 阵容适配度计算器
class RosterFitCalculator {
    // 计算球员与球队的适配度
    static calculatePlayerFit(player, team) {
        let fitScore = 0;
        
        // 1. 位置互补性评估
        const positionFit = this.calculatePositionFit(player, team);
        fitScore += positionFit * 0.25;
        
        // 2. 战术体系契合度评估（考虑教练战术）
        const tacticalFit = this.calculateTacticalFit(player, team);
        fitScore += tacticalFit * 0.35;
        
        // 3. 教练战术适配度评估
        const coachFit = this.calculateCoachFit(player, team);
        fitScore += coachFit * 0.15;
        
        // 4. 薪资空间匹配度评估
        const salaryFit = this.calculateSalaryFit(player, team);
        fitScore += salaryFit * 0.15;
        
        // 5. 球队化学反应评估
        const chemistryFit = this.calculateChemistryFit(player, team);
        fitScore += chemistryFit * 0.1;
        
        return Math.min(100, Math.floor(fitScore));
    }
    
    // 计算位置互补性
    static calculatePositionFit(player, team) {
        // 获取球队在该位置的球员
        const positionPlayers = team.getPlayersByPosition(player.position);
        
        // 如果球队在该位置没有球员，适配度高
        if (positionPlayers.length === 0) {
            return 90;
        }
        
        // 计算该位置球员的平均能力
        const avgPositionRating = positionPlayers.reduce((sum, p) => sum + p.getOverallRating(), 0) / positionPlayers.length;
        const playerRating = player.getOverallRating();
        
        // 如果球员能力高于该位置平均水平，适配度高
        if (playerRating > avgPositionRating + 10) {
            return 85;
        } else if (playerRating > avgPositionRating + 5) {
            return 75;
        } else if (playerRating > avgPositionRating) {
            return 65;
        } else if (playerRating > avgPositionRating - 5) {
            return 50;
        } else {
            return 30;
        }
    }
    
    // 计算战术体系契合度
    static calculateTacticalFit(player, team) {
        // 获取球队的战术体系
        const playStyle = team.getPlayStyle();
        
        // 使用球员的战术适配度计算方法
        const tacticalBonus = player.calculateTacticalFitBonus(playStyle);
        
        // 将加成转换为适配度分数
        return 50 + tacticalBonus * 10; // 0-50分加成，加上基础50分
    }
    
    // 计算教练战术适配度
    static calculateCoachFit(player, team) {
        // 如果球队没有教练，返回默认值
        if (!team.coach) {
            return 60;
        }
        
        const coach = team.coach;
        let fitScore = 0;
        
        // 1. 球员属性与教练专长的匹配度
        const archetypeData = CoachArchetypes[coach.archetype];
        if (archetypeData && archetypeData.trainingBonus) {
            // 计算球员在教练擅长属性上的平均能力
            let specialtyAttributes = [];
            
            if (coach.archetype === 'offensive') {
                specialtyAttributes = ['scoring', 'shooting', 'threePoint'];
            } else if (coach.archetype === 'defensive') {
                specialtyAttributes = ['defense', 'rebounding', 'stealing', 'blocking'];
            } else if (coach.archetype === 'balanced') {
                specialtyAttributes = ['scoring', 'shooting', 'defense', 'passing'];
            } else if (coach.archetype === 'developmental') {
                specialtyAttributes = ['scoring', 'shooting', 'defense', 'passing', 'dribbling'];
            } else if (coach.archetype === 'veteran') {
                specialtyAttributes = ['basketballIQ', 'passing', 'defense'];
            }
            
            const avgSpecialtyRating = specialtyAttributes.reduce((sum, attr) => {
                return sum + (player.attributes[attr] || 0);
            }, 0) / specialtyAttributes.length;
            
            // 基于平均能力计算适配度
            fitScore += (avgSpecialtyRating / 99) * 40;
        }
        
        // 2. 球员位置与教练战术倾向的匹配度
        if (coach.tendencies) {
            let positionFit = 0;
            
            // 根据球员位置和教练战术倾向计算适配度
            if (player.position === 1 || player.position === 2) { // 后卫
                // 如果教练偏好快攻和三分，后卫适配度高
                if (coach.tendencies.fastBreak > 70 && coach.tendencies.threePointFocus > 60) {
                    positionFit = 30;
                } else if (coach.tendencies.fastBreak > 50 || coach.tendencies.threePointFocus > 40) {
                    positionFit = 20;
                } else {
                    positionFit = 10;
                }
            } else if (player.position === 3) { // 小前锋
                // 小前锋适合各种战术体系，适配度中等
                positionFit = 20;
            } else if (player.position === 4 || player.position === 5) { // 内线
                // 如果教练偏好内线和防守，内线球员适配度高
                if (coach.tendencies.insideFocus > 70 && coach.tendencies.defenseAggression > 60) {
                    positionFit = 30;
                } else if (coach.tendencies.insideFocus > 50 || coach.tendencies.defenseAggression > 40) {
                    positionFit = 20;
                } else {
                    positionFit = 10;
                }
            }
            
            fitScore += positionFit;
        }
        
        // 3. 球员潜力与教练发展能力的匹配度
        if (coach.attributes.development && player.potential) {
            // 高潜力球员在发展能力强的教练手下适配度高
            const developmentBonus = (coach.attributes.development / 99) * (player.potential / 99) * 30;
            fitScore += developmentBonus;
        }
        
        return Math.min(100, Math.floor(fitScore));
    }
    
    // 计算薪资空间匹配度
    static calculateSalaryFit(player, team) {
        // 如果不是用户球队，返回默认值
        if (!team.isUserTeam) {
            return 70;
        }
        
        // 计算球员期望薪资
        const expectedSalary = player.potential * 10000; // 基于潜力值的期望薪资
        
        // 计算球队剩余薪资空间
        const totalSalary = team.roster.reduce((sum, p) => sum + (p.contract ? p.contract.salary : 0), 0);
        const salaryCap = team.budget * 0.8; // 薪资上限为预算的80%
        const remainingSpace = salaryCap - totalSalary;
        
        // 如果期望薪资超过剩余空间，适配度低
        if (expectedSalary > remainingSpace) {
            return Math.max(20, 70 - ((expectedSalary - remainingSpace) / remainingSpace) * 50);
        }
        
        // 如果期望薪资远低于剩余空间，适配度中等
        if (expectedSalary < remainingSpace * 0.5) {
            return 60;
        }
        
        // 如果期望薪资在剩余空间的50%-80%之间，适配度高
        return 80;
    }
    
    // 计算球队化学反应评估
    static calculateChemistryFit(player, team) {
        // 基于球员属性与球队现有球员的相似性
        let chemistryScore = 50; // 基础分
        
        // 如果球队没有球员，返回基础分
        if (team.roster.length === 0) {
            return chemistryScore;
        }
        
        // 计算球队平均属性
        const teamAvgAttributes = {};
        for (const attr in PlayerAttributes) {
            teamAvgAttributes[attr] = team.roster.reduce((sum, p) => sum + p.attributes[attr], 0) / team.roster.length;
        }
        
        // 计算球员属性与球队平均属性的相似度
        let similarity = 0;
        let attrCount = 0;
        
        for (const attr in PlayerAttributes) {
            const diff = Math.abs(player.attributes[attr] - teamAvgAttributes[attr]);
            similarity += Math.max(0, 100 - diff * 2); // 差异越小，相似度越高
            attrCount++;
        }
        
        similarity = similarity / attrCount;
        
        // 如果球员属性与球队相似，化学反应可能更好
        if (similarity > 80) {
            chemistryScore = 80;
        } else if (similarity > 60) {
            chemistryScore = 70;
        } else if (similarity > 40) {
            chemistryScore = 60;
        } else {
            chemistryScore = 50;
        }
        
        // 天赋异禀的球员可能更容易融入
        if (player.isProdigy) {
            chemistryScore += 10;
        }
        
        return Math.min(100, chemistryScore);
    }
    
    // 生成适配度报告
    static generateFitReport(player, team) {
        const overallFit = this.calculatePlayerFit(player, team);
        const positionFit = this.calculatePositionFit(player, team);
        const tacticalFit = this.calculateTacticalFit(player, team);
        const coachFit = this.calculateCoachFit(player, team);
        const salaryFit = this.calculateSalaryFit(player, team);
        const chemistryFit = this.calculateChemistryFit(player, team);
        
        return {
            overall: overallFit,
            position: positionFit,
            tactical: tacticalFit,
            coach: coachFit,
            salary: salaryFit,
            chemistry: chemistryFit,
            recommendation: this.generateRecommendation(overallFit, positionFit, tacticalFit, coachFit, salaryFit, chemistryFit)
        };
    }
    
    // 生成建议
    static generateRecommendation(overallFit, positionFit, tacticalFit, coachFit, salaryFit, chemistryFit) {
        if (overallFit >= 80) {
            return "强烈推荐签约，该球员与您的球队高度匹配";
        } else if (overallFit >= 60) {
            return "建议考虑签约，该球员与您的球队较为匹配";
        } else if (overallFit >= 40) {
            return "可以谨慎考虑，该球员与您的球队匹配度一般";
        } else {
            return "不建议签约，该球员与您的球队匹配度较低";
        }
    }
}

// 检查赛季阶段
function checkSeasonPhase() {
    const month = GameState.currentDate.getMonth(); // 0-11 (0=1月)
    
    if (month >= 0 && month < 8) { // 1月-8月
        if (GameState.seasonPhase !== 'offseason') {
            GameState.seasonPhase = 'offseason';
            startOffseason();
        }
    } else if (month === 8) { // 9月
        if (GameState.seasonPhase !== 'regular') {
            GameState.seasonPhase = 'regular';
            startNewSeason();
        }
    } else { // 10月-12月
        GameState.seasonPhase = 'regular';
    }
}

// 更新UI
function updateUI() {
    // 更新顶部信息栏
    document.getElementById('current-date').textContent = formatDate(GameState.currentDate);
    document.getElementById('team-name').textContent = GameState.userTeam.name;
    document.getElementById('funds').textContent = `资金: $${GameState.userTeam.funds.toLocaleString()}`;
    document.getElementById('scholarships').textContent = `奖学金: ${GameState.userTeam.calculateScholarshipsUsed().toFixed(2)}/${GameState.maxScholarships}`;
    
    // 根据当前活动屏幕更新内容
    updateActiveScreen();
}

// 格式化日期
function formatDate(date) {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// 导航功能
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const screens = document.querySelectorAll('.screen');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有活动状态
            navButtons.forEach(btn => btn.classList.remove('active'));
            screens.forEach(screen => screen.classList.remove('active'));
            
            // 添加当前活动状态
            button.classList.add('active');
            const screenId = button.id.replace('-btn', '');
            document.getElementById(screenId).classList.add('active');
            
            // 更新屏幕内容
            updateActiveScreen();
        });
    });
}

// 更新当前活动屏幕
function updateActiveScreen() {
    const activeScreen = document.querySelector('.screen.active');
    
    if (!activeScreen) return;
    
    switch (activeScreen.id) {
        case 'team-management':
            updateTeamManagementScreen();
            break;
        case 'schedule':
            updateScheduleScreen();
            break;
        case 'training':
            updateTrainingScreen();
            break;
        case 'player-development':
            updatePlayerDevelopmentScreen();
            break;
        case 'market':
            updateMarketScreen();
            break;
        case 'finance':
            updateFinanceScreen();
            break;
        case 'scouting':
            updateScoutingScreen();
            break;
        case 'coach-market':
            updateCoachMarketScreen();
            break;
        case 'standings':
            updateStandingsScreen();
            break;
    }
}

// 更新球队管理屏幕
function updateTeamManagementScreen() {
    const rosterContainer = document.getElementById('roster');
    const statsContainer = document.getElementById('stats-content');
    
    // 更新阵容
    rosterContainer.innerHTML = '';
    
    if (GameState.userTeam.roster.length === 0) {
        rosterContainer.innerHTML = '<p>您的球队还没有球员，请前往球员市场招募球员！</p>';
    } else {
        GameState.userTeam.roster.forEach(player => {
            const playerCard = createPlayerCard(player);
            rosterContainer.appendChild(playerCard);
        });
    }
    
    // 更新球队统计
    statsContainer.innerHTML = `
        <p>球队人数: ${GameState.userTeam.roster.length}/15</p>
        <p>球队实力: ${GameState.userTeam.getTeamStrength()}</p>
        <p>赛季战绩: ${GameState.userTeam.wins}胜${GameState.userTeam.losses}负 (${GameState.userTeam.getWinPercentage()}%)</p>
        <p>连胜/连败: ${GameState.userTeam.streak > 0 ? `${GameState.userTeam.streak}连胜` : GameState.userTeam.streak < 0 ? `${Math.abs(GameState.userTeam.streak)}连败` : '无'}</p>
        <p>冠军次数: ${GameState.userTeam.championships}</p>
    `;
}

// 创建球员卡片
function createPlayerCard(player) {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.dataset.playerId = player.id;
    
    const header = document.createElement('div');
    header.className = 'player-header';
    
    const name = document.createElement('div');
    name.className = 'player-name';
    name.textContent = player.name;
    
    const position = document.createElement('div');
    position.className = 'player-position';
    position.textContent = Positions[player.position];
    
    header.appendChild(name);
    header.appendChild(position);
    
    const details = document.createElement('div');
    details.innerHTML = `
        <p>年龄: ${player.age} | 年级: ${player.getCollegeYearText()} | 综合评分: ${player.getOverallRating()}</p>
        <p>状态: ${player.getStatusDescription()} | 奖学金: ${player.getScholarshipText()}</p>
        <p>剩余资格: ${player.eligibilityYears}年</p>
    `;
    
    const attributes = document.createElement('div');
    attributes.className = 'player-attributes';
    
    // 只显示主要属性
    const mainAttributes = ['scoring', 'shooting', 'passing', 'defense', 'rebounding', 'speed'];
    
    mainAttributes.forEach(attr => {
        const attributeDiv = document.createElement('div');
        attributeDiv.className = 'attribute';
        
        const name = document.createElement('span');
        name.textContent = PlayerAttributes[attr];
        
        const value = document.createElement('span');
        value.textContent = player.attributes[attr];
        
        const bar = document.createElement('div');
        bar.className = 'attribute-bar';
        
        const fill = document.createElement('div');
        fill.className = 'attribute-fill';
        fill.style.width = `${player.attributes[attr]}%`;
        
        bar.appendChild(fill);
        
        attributeDiv.appendChild(name);
        attributeDiv.appendChild(bar);
        attributeDiv.appendChild(value);
        
        attributes.appendChild(attributeDiv);
    });
    
    card.appendChild(header);
    card.appendChild(details);
    card.appendChild(attributes);
    
    // 添加点击事件显示球员详情
    card.addEventListener('click', () => showPlayerDetails(player));
    
    return card;
}

// 显示球员详情
function showPlayerDetails(player) {
    const modal = document.getElementById('player-modal');
    const playerName = document.getElementById('player-name');
    const playerDetails = document.getElementById('player-details');
    
    playerName.textContent = `${player.name} - ${Positions[player.position]}`;
    
    let attributesHTML = '<div class="player-attributes">';
    
    for (const attr in player.attributes) {
        attributesHTML += `
            <div class="attribute">
                <span>${PlayerAttributes[attr]}:</span>
                <div class="attribute-bar">
                    <div class="attribute-fill" style="width: ${player.attributes[attr]}%"></div>
                </div>
                <span>${player.attributes[attr]}</span>
            </div>
        `;
    }
    
    attributesHTML += '</div>';
    
    playerDetails.innerHTML = `
        <p>年龄: ${player.age} | 年级: ${player.getCollegeYearText()} | 经验: ${player.experience}/${player.level * 100}</p>
        <p>状态: ${player.getStatusDescription()}</p>
        <p>疲劳度: ${player.fatigue}/100</p>
        <p>奖学金: ${player.getScholarshipText()} | 剩余资格: ${player.eligibilityYears}年</p>
        <h3>属性</h3>
        ${attributesHTML}
        <h3>赛季数据</h3>
        <p>场均得分: ${player.seasonStats.gamesPlayed > 0 ? (player.seasonStats.points / player.seasonStats.gamesPlayed).toFixed(1) : '0'}</p>
        <p>场均篮板: ${player.seasonStats.gamesPlayed > 0 ? (player.seasonStats.rebounds / player.seasonStats.gamesPlayed).toFixed(1) : '0'}</p>
        <p>场均助攻: ${player.seasonStats.gamesPlayed > 0 ? (player.seasonStats.assists / player.seasonStats.gamesPlayed).toFixed(1) : '0'}</p>
        <p>场均抢断: ${player.seasonStats.gamesPlayed > 0 ? (player.seasonStats.steals / player.seasonStats.gamesPlayed).toFixed(1) : '0'}</p>
        <p>场均盖帽: ${player.seasonStats.gamesPlayed > 0 ? (player.seasonStats.blocks / player.seasonStats.gamesPlayed).toFixed(1) : '0'}</p>
    `;
    
    modal.style.display = 'block';
}

// 更新赛程屏幕
function updateScheduleScreen() {
    const seasonInfo = document.getElementById('season-info');
    const gameSchedule = document.getElementById('game-schedule');
    const nextGame = document.getElementById('next-game');
    
    // 更新赛季信息
    seasonInfo.innerHTML = `
        <p>当前赛季: ${GameState.currentSeason}-${GameState.currentSeason + 1}</p>
        <p>赛季阶段: ${GameState.seasonPhase === 'regular' ? '常规赛' : GameState.seasonPhase === 'playoffs' ? '季后赛' : '休赛期'}</p>
        <p>球队战绩: ${GameState.userTeam.wins}胜${GameState.userTeam.losses}负</p>
    `;
    
    // 如果还没有生成赛程，生成一个
    if (GameState.gameSchedule.length === 0 && GameState.seasonPhase === 'regular') {
        generateSeasonSchedule();
    }
    
    // 更新赛程表
    gameSchedule.innerHTML = '';
    
    if (GameState.gameSchedule.length === 0) {
        gameSchedule.innerHTML = '<p>暂无赛程安排</p>';
    } else {
        // 显示接下来的10场比赛
        const upcomingGames = GameState.gameSchedule.slice(GameState.nextGameIndex, GameState.nextGameIndex + 10);
        
        upcomingGames.forEach((game, index) => {
            const gameDiv = document.createElement('div');
            gameDiv.className = 'game-card';
            
            const gameDate = new Date(game.date);
            const isHomeGame = game.homeTeam === GameState.userTeam.id;
            const opponent = isHomeGame ? 
                GameState.allTeams.find(t => t.id === game.awayTeam) : 
                GameState.allTeams.find(t => t.id === game.homeTeam);
            
            gameDiv.innerHTML = `
                <p>第${GameState.nextGameIndex + index + 1}场: ${formatDate(gameDate)}</p>
                <p>${isHomeGame ? '主场' : '客场'} vs ${opponent.name}</p>
                <p>${game.isPlayed ? '已结束' : '未开始'}</p>
                ${game.isPlayed ? `<p>比分: ${game.homeScore} : ${game.awayScore}</p>` : ''}
            `;
            
            gameSchedule.appendChild(gameDiv);
        });
    }
    
    // 更新下一场比赛信息
    if (GameState.nextGameIndex < GameState.gameSchedule.length) {
        const nextGameData = GameState.gameSchedule[GameState.nextGameIndex];
        const gameDate = new Date(nextGameData.date);
        const isHomeGame = nextGameData.homeTeam === GameState.userTeam.id;
        const opponent = isHomeGame ? 
            GameState.allTeams.find(t => t.id === nextGameData.awayTeam) : 
            GameState.allTeams.find(t => t.id === nextGameData.homeTeam);
        
        nextGame.innerHTML = `
            <h3>下一场比赛</h3>
            <p>日期: ${formatDate(gameDate)}</p>
            <p>${isHomeGame ? '主场' : '客场'} vs ${opponent.name}</p>
            <p>对手实力: ${opponent.getTeamStrength()}</p>
            <button id="play-game-btn" ${nextGameData.isPlayed ? 'disabled' : ''}>
                ${nextGameData.isPlayed ? '已结束' : '开始比赛'}
            </button>
        `;
        
        // 添加比赛按钮事件
        const playGameBtn = document.getElementById('play-game-btn');
        if (playGameBtn && !nextGameData.isPlayed) {
            playGameBtn.addEventListener('click', () => playGame(nextGameData));
        }
    } else {
        nextGame.innerHTML = '<p>本赛季所有比赛已完成</p>';
    }
}

// 生成赛季赛程
function generateSeasonSchedule() {
    GameState.gameSchedule = [];
    GameState.nextGameIndex = 0;
    
    // 每个对手打2场（主客场）
    GameState.allTeams.forEach(team => {
        if (team.id !== GameState.userTeam.id) {
            // 主场比赛
            const homeGameDate = new Date(GameState.currentDate);
            homeGameDate.setDate(homeGameDate.getDate() + Math.floor(Math.random() * 200) + 1); // 赛季内随机日期
            
            GameState.gameSchedule.push({
                date: homeGameDate,
                homeTeam: GameState.userTeam.id,
                awayTeam: team.id,
                isPlayed: false
            });
            
            // 客场比赛
            const awayGameDate = new Date(GameState.currentDate);
            awayGameDate.setDate(awayGameDate.getDate() + Math.floor(Math.random() * 200) + 1);
            
            GameState.gameSchedule.push({
                date: awayGameDate,
                homeTeam: team.id,
                awayTeam: GameState.userTeam.id,
                isPlayed: false
            });
        }
    });
    
    // 生成AI球队之间的比赛
    generateAIGames();
    
    // 按日期排序
    GameState.gameSchedule.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 确保不超过30场比赛
    if (GameState.gameSchedule.length > 30) {
        GameState.gameSchedule = GameState.gameSchedule.slice(0, 30);
    }
}

// 生成AI球队之间的比赛
function generateAIGames() {
    const aiTeams = GameState.allTeams.filter(team => !team.isUserTeam);
    
    // 每个AI球队与其他AI球队打1场比赛
    for (let i = 0; i < aiTeams.length; i++) {
        for (let j = i + 1; j < aiTeams.length; j++) {
            const team1 = aiTeams[i];
            const team2 = aiTeams[j];
            
            // 随机决定主客场
            const isTeam1Home = Math.random() > 0.5;
            
            const gameDate = new Date(GameState.currentDate);
            gameDate.setDate(gameDate.getDate() + Math.floor(Math.random() * 200) + 1);
            
            GameState.gameSchedule.push({
                date: gameDate,
                homeTeam: isTeam1Home ? team1.id : team2.id,
                awayTeam: isTeam1Home ? team2.id : team1.id,
                isPlayed: false,
                isAIGame: true
            });
        }
    }
}

// 比赛日处理
function processGameDay() {
    const currentDateStr = GameState.currentDate.toISOString().split('T')[0];
    
    // 找出当天的所有比赛
    const todayGames = GameState.gameSchedule.filter(game => {
        const gameDateStr = game.date.toISOString().split('T')[0];
        return gameDateStr === currentDateStr && !game.isPlayed;
    });
    
    if (todayGames.length === 0) return;
    
    // 处理每场比赛
    todayGames.forEach(game => {
        const homeTeam = GameState.allTeams.find(team => team.id === game.homeTeam);
        const awayTeam = GameState.allTeams.find(team => team.id === game.awayTeam);
        
        if (!homeTeam || !awayTeam) return;
        
        // 如果是用户球队的比赛，不自动模拟
        if (homeTeam.isUserTeam || awayTeam.isUserTeam) {
            return;
        }
        
        // 模拟AI比赛
        const result = simulateAIGame(homeTeam, awayTeam);
        
        // 更新比赛结果
        game.homeScore = result.homeScore;
        game.awayScore = result.awayScore;
        game.isPlayed = true;
        
        // 更新球队战绩
        updateTeamStats(homeTeam, awayTeam, result.homeScore, result.awayScore);
        
        // 更新球员数据
        updatePlayerGameStats(homeTeam, result.homeScore, result.awayScore, true);
        updatePlayerGameStats(awayTeam, result.awayScore, result.homeScore, false);
    });
    
    // 更新排名
    updateStandings();
}

// 模拟AI比赛
function simulateAIGame(homeTeam, awayTeam) {
    // 计算球队实力
    const homePower = calculateTeamPower(homeTeam);
    const awayPower = calculateTeamPower(awayTeam);
    
    // 主场优势
    const homeAdvantage = 5;
    
    // 计算基础得分
    let homeBaseScore = 70 + (homePower - awayPower) / 10 + homeAdvantage;
    let awayBaseScore = 70 + (awayPower - homePower) / 10;
    
    // 添加随机因素
    const randomFactor = 15;
    const homeScore = Math.round(homeBaseScore + (Math.random() - 0.5) * randomFactor * 2);
    const awayScore = Math.round(awayBaseScore + (Math.random() - 0.5) * randomFactor * 2);
    
    return {
        homeScore: Math.max(50, homeScore),
        awayScore: Math.max(50, awayScore)
    };
}

// 计算球队实力
function calculateTeamPower(team) {
    if (!team.roster || team.roster.length === 0) return 50;
    
    let totalPower = 0;
    let playerCount = 0;
    
    team.roster.forEach(player => {
        // 只计算前8名球员的实力（轮换阵容）
        if (playerCount < 8) {
            totalPower += player.getOverallRating();
            playerCount++;
        }
    });
    
    // 确保至少有5名球员
    if (playerCount < 5) playerCount = 5;
    
    return Math.round(totalPower / playerCount);
}

// 更新球队战绩
function updateTeamStats(homeTeam, awayTeam, homeScore, awayScore) {
    if (homeScore > awayScore) {
        homeTeam.wins++;
        awayTeam.losses++;
    } else {
        awayTeam.wins++;
        homeTeam.losses++;
    }
    
    homeTeam.pointsFor += homeScore;
    homeTeam.pointsAgainst += awayScore;
    awayTeam.pointsFor += awayScore;
    awayTeam.pointsAgainst += homeScore;
}

// 更新球员比赛数据
function updatePlayerGameStats(team, teamScore, opponentScore, isHome) {
    if (!team.roster || team.roster.length === 0) return;
    
    // 根据球队得分分配个人得分
    const totalScore = teamScore;
    
    team.roster.forEach(player => {
        // 计算球员得分贡献
        const scoringRatio = player.attributes.scoring / 100;
        const playerPoints = Math.round(totalScore * scoringRatio * (0.5 + Math.random() * 0.5) / team.roster.length);
        
        // 计算其他数据
        const rebounds = Math.round(player.attributes.rebounding * (0.2 + Math.random() * 0.3));
        const assists = Math.round(player.attributes.passing * (0.1 + Math.random() * 0.2));
        const steals = Math.round(player.attributes.stealing * (0.05 + Math.random() * 0.1));
        const blocks = Math.round(player.attributes.blocking * (0.05 + Math.random() * 0.1));
        
        // 更新球员统计
        player.seasonStats.points += playerPoints;
        player.seasonStats.rebounds += rebounds;
        player.seasonStats.assists += assists;
        player.seasonStats.steals += steals;
        player.seasonStats.blocks += blocks;
        player.seasonStats.gamesPlayed++;
        
        // 记录比赛表现
        const performance = {
            date: new Date(),
            points: playerPoints,
            rebounds: rebounds,
            assists: assists,
            steals: steals,
            blocks: blocks,
            teamScore: teamScore,
            opponentScore: opponentScore,
            isWin: teamScore > opponentScore
        };
        
        player.matchPerformance.push(performance);
        
        // 计算比赛表现评分
        const performanceRating = calculatePerformanceRating(player, performance);
        
        // 基于表现给予属性增益
        applyPerformanceBasedGains(player, performance, performanceRating);
        
        // 比赛后恢复
        player.fatigue = Math.max(0, player.fatigue - 10);
    });
}

// 计算比赛表现评分
function calculatePerformanceRating(player, performance) {
    let rating = 0;
    
    // 基础得分
    rating += performance.points * 0.4;
    rating += performance.rebounds * 0.3;
    rating += performance.assists * 0.2;
    rating += performance.steals * 0.05;
    rating += performance.blocks * 0.05;
    
    // 位置加成
    switch (player.position) {
        case 1: // PG
            rating += performance.assists * 0.3;
            break;
        case 2: // SG
            rating += performance.points * 0.2;
            break;
        case 3: // SF
            rating += (performance.points + performance.rebounds) * 0.1;
            break;
        case 4: // PF
            rating += performance.rebounds * 0.2;
            break;
        case 5: // C
            rating += (performance.rebounds + performance.blocks) * 0.2;
            break;
    }
    
    // 胜利加成
    if (performance.isWin) {
        rating *= 1.2;
    }
    
    return Math.floor(rating);
}

// 应用基于表现的属性增益
function applyPerformanceBasedGains(player, performance, performanceRating) {
    // 根据表现评分决定增益概率和幅度
    let gainChance = 0.1; // 基础10%概率
    let gainAmount = 1; // 基础1点增益
    
    // 表现越好，增益概率和幅度越大
    if (performanceRating > 30) {
        gainChance = 0.2;
        gainAmount = 2;
    }
    if (performanceRating > 50) {
        gainChance = 0.3;
        gainAmount = 3;
    }
    if (performanceRating > 70) {
        gainChance = 0.4;
        gainAmount = 4;
    }
    
    // 应用天赋加成
    const talentBonus = player.getTalentBonus('scoring');
    const adjustedGainAmount = Math.floor(gainAmount * talentBonus);
    
    // 检查是否获得增益
    if (Math.random() < gainChance) {
        // 根据表现类型决定增益属性
        let attributesToGain = [];
        
        // 得分表现
        if (performance.points > 15) {
            attributesToGain.push('scoring');
        }
        
        // 篮板表现
        if (performance.rebounds > 10) {
            attributesToGain.push('rebounding');
        }
        
        // 助攻表现
        if (performance.assists > 8) {
            attributesToGain.push('passing');
        }
        
        // 防守表现
        if (performance.steals > 3 || performance.blocks > 2) {
            attributesToGain.push('defense');
        }
        
        // 如果没有突出表现，随机选择一个属性
        if (attributesToGain.length === 0) {
            const allAttributes = Object.keys(PlayerAttributes);
            attributesToGain.push(allAttributes[Math.floor(Math.random() * allAttributes.length)]);
        }
        
        // 应用属性增益
        attributesToGain.forEach(attr => {
            const current = player.attributes[attr];
            const cap = player.attributeCaps[attr] || 85;
            
            // 应用增益
            const actualGain = Math.min(adjustedGainAmount, cap - current);
            player.attributes[attr] = Math.min(cap, current + actualGain);
            
            // 更新属性进度
            player.attributeProgress[attr].matchGains += actualGain;
            player.attributeProgress[attr].totalGains += actualGain;
            player.attributeProgress[attr].current = player.attributes[attr];
            
            // 增加成长点数
            player.growthPoints += actualGain;
        });
    }
}

// 更新训练屏幕
function updateTrainingScreen() {
    const trainingOptions = document.getElementById('training-options');
    const playerSelect = document.getElementById('player-select');
    const trainingResult = document.getElementById('training-result');
    
    // 更新训练选项
    trainingOptions.innerHTML = '';
    
    const trainingTypes = [
        { id: 'scoring', name: '得分训练', description: '提升球员得分能力' },
        { id: 'shooting', name: '投篮训练', description: '提升球员投篮命中率' },
        { id: 'defense', name: '防守训练', description: '提升球员防守能力' },
        { id: 'physical', name: '体能训练', description: '提升球员体能和耐力' },
        { id: 'skills', name: '技术训练', description: '提升球员综合技术' },
        { id: 'rest', name: '休息恢复', description: '帮助球员恢复疲劳和伤病' }
    ];
    
    trainingTypes.forEach(type => {
        const option = document.createElement('div');
        option.className = 'training-type';
        option.dataset.trainingType = type.id;
        
        option.innerHTML = `
            <h3>${type.name}</h3>
            <p>${type.description}</p>
        `;
        
        option.addEventListener('click', () => {
            // 移除其他选中状态
            document.querySelectorAll('.training-type').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // 添加选中状态
            option.classList.add('selected');
            
            // 更新球员选择区域
            updatePlayerSelectForTraining(type.id);
        });
        
        trainingOptions.appendChild(option);
    });
    
    // 初始化球员选择区域
    playerSelect.innerHTML = '<p>请先选择训练类型</p>';
    trainingResult.innerHTML = '';
}

// 更新训练球员选择
function updatePlayerSelectForTraining(trainingType) {
    const playerSelect = document.getElementById('player-select');
    
    playerSelect.innerHTML = '<h3>选择训练球员</h3>';
    
    if (GameState.userTeam.roster.length === 0) {
        playerSelect.innerHTML += '<p>您的球队还没有球员</p>';
        return;
    }
    
    const playersList = document.createElement('div');
    playersList.className = 'players-list';
    
    GameState.userTeam.roster.forEach(player => {
        const playerOption = document.createElement('div');
        playerOption.className = 'player-option';
        playerOption.dataset.playerId = player.id;
        
        playerOption.innerHTML = `
            <p>${player.name} - ${Positions[player.position]}</p>
            <p>等级: ${player.level} | 状态: ${player.getStatusDescription()}</p>
            <p>疲劳度: ${player.fatigue}/100</p>
        `;
        
        playerOption.addEventListener('click', () => {
            // 移除其他选中状态
            document.querySelectorAll('.player-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // 添加选中状态
            playerOption.classList.add('selected');
            
            // 显示训练按钮
            showTrainingButton(player.id, trainingType);
        });
        
        playersList.appendChild(playerOption);
    });
    
    playerSelect.appendChild(playersList);
}

// 显示训练按钮
function showTrainingButton(playerId, trainingType) {
    const trainingResult = document.getElementById('training-result');
    
    trainingResult.innerHTML = `
        <div class="training-controls">
            <h3>训练强度</h3>
            <div class="intensity-options">
                <button data-intensity="1">轻度训练</button>
                <button data-intensity="2">中度训练</button>
                <button data-intensity="3">高强度训练</button>
            </div>
            <button id="confirm-training-btn">开始训练</button>
        </div>
    `;
    
    // 添加强度选择事件
    document.querySelectorAll('.intensity-options button').forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除其他选中状态
            document.querySelectorAll('.intensity-options button').forEach(b => {
                b.classList.remove('selected');
            });
            
            // 添加选中状态
            btn.classList.add('selected');
        });
    });
    
    // 添加确认训练事件
    document.getElementById('confirm-training-btn').addEventListener('click', () => {
        const selectedIntensity = document.querySelector('.intensity-options button.selected');
        const intensity = selectedIntensity ? parseInt(selectedIntensity.dataset.intensity) : 1;
        
        conductTraining(playerId, trainingType, intensity);
    });
}

// 执行训练
function conductTraining(playerId, trainingType, intensity) {
    const player = GameState.userTeam.getPlayer(playerId);
    const trainingResult = document.getElementById('training-result');
    
    if (!player) {
        trainingResult.innerHTML = '<p class="error">球员不存在</p>';
        return;
    }
    
    let result;
    
    if (trainingType === 'rest') {
        // 休息恢复
        player.rest();
        result = { 
            success: true, 
            message: `${player.name}进行了休息，疲劳度降低到${player.fatigue}，伤病恢复${player.injuryDays > 0 ? 1 : 0}天` 
        };
    } else {
        // 属性训练
        let attributeToTrain;
        
        switch (trainingType) {
            case 'scoring':
                attributeToTrain = 'scoring';
                break;
            case 'shooting':
                attributeToTrain = 'shooting';
                break;
            case 'defense':
                attributeToTrain = 'defense';
                break;
            case 'physical':
                attributeToTrain = 'stamina';
                break;
            case 'skills':
                // 随机选择一个技术属性
                const skillAttributes = ['dribbling', 'passing', 'stealing', 'blocking'];
                attributeToTrain = skillAttributes[Math.floor(Math.random() * skillAttributes.length)];
                break;
            default:
                attributeToTrain = 'scoring';
        }
        
        result = player.train(attributeToTrain, intensity);
    }
    
    // 显示训练结果
    trainingResult.innerHTML = `
        <div class="training-result ${result.success ? 'success' : 'failure'}">
            <h3>训练结果</h3>
            <p>${result.message}</p>
            <button id="continue-training-btn">继续训练</button>
        </div>
    `;
    
    // 添加继续训练按钮事件
    document.getElementById('continue-training-btn').addEventListener('click', () => {
        updateTrainingScreen();
    });
    
    // 更新UI
    updateUI();
}

// 更新球员市场屏幕
function updateMarketScreen() {
    const marketFilters = document.getElementById('market-filters');
    const availablePlayers = document.getElementById('available-players');
    
    // 更新筛选器
    marketFilters.innerHTML = `
        <div class="filter-container">
            <h3>筛选条件</h3>
            <div class="filter-group">
                <label>位置:</label>
                <select id="position-filter">
                    <option value="">全部</option>
                    <option value="PG">控球后卫</option>
                    <option value="SG">得分后卫</option>
                    <option value="SF">小前锋</option>
                    <option value="PF">大前锋</option>
                    <option value="C">中锋</option>
                </select>
            </div>
            <div class="filter-group">
                <label>最低综合评分:</label>
                <select id="rating-filter">
                    <option value="0">不限</option>
                    <option value="35">35+</option>
                    <option value="45">45+</option>
                    <option value="55">55+</option>
                    <option value="65">65+</option>
                </select>
            </div>
            <div class="filter-group">
                <label>奖学金等级:</label>
                <select id="scholarship-filter">
                    <option value="0">不限</option>
                    <option value="1">全额奖学金</option>
                    <option value="2">75%奖学金</option>
                    <option value="3">50%奖学金</option>
                    <option value="4">25%奖学金</option>
                    <option value="5">自费</option>
                </select>
            </div>
            <div class="filter-group">
                <label>年级:</label>
                <select id="year-filter">
                    <option value="0">不限</option>
                    <option value="1">新生</option>
                    <option value="2">大二</option>
                    <option value="3">大三</option>
                    <option value="4">大四</option>
                </select>
            </div>
            <button id="apply-filters-btn">应用筛选</button>
        </div>
    `;
    
    // 显示可用球员
    displayAvailablePlayers();
    
    // 添加筛选事件
    document.getElementById('apply-filters-btn').addEventListener('click', () => {
        displayAvailablePlayers();
    });
}

// 显示可用球员
function displayAvailablePlayers() {
    const availablePlayers = document.getElementById('available-players');
    const positionFilter = document.getElementById('position-filter').value;
    const ratingFilter = parseInt(document.getElementById('rating-filter').value);
    const scholarshipFilter = parseInt(document.getElementById('scholarship-filter').value);
    const yearFilter = parseInt(document.getElementById('year-filter').value);
    
    // 筛选球员
    let filteredPlayers = GameState.availablePlayers.filter(player => {
        // 位置筛选
        if (positionFilter && player.position !== positionFilter) {
            return false;
        }
        
        // 评分筛选
        if (player.getOverallRating() < ratingFilter) {
            return false;
        }
        
        // 奖学金筛选
        if (scholarshipFilter && player.scholarship !== scholarshipFilter) {
            return false;
        }
        
        // 年级筛选
        if (yearFilter && player.year !== yearFilter) {
            return false;
        }
        
        return true;
    });
    
    availablePlayers.innerHTML = '';
    
    if (filteredPlayers.length === 0) {
        availablePlayers.innerHTML = '<p>没有符合条件的球员</p>';
        return;
    }
    
    // 只显示前15个球员
    filteredPlayers.slice(0, 15).forEach(player => {
        const playerCard = createMarketPlayerCard(player);
        availablePlayers.appendChild(playerCard);
    });
}

// 创建市场球员卡片
function createMarketPlayerCard(player) {
    const card = document.createElement('div');
    card.className = 'player-card';
    
    const header = document.createElement('div');
    header.className = 'player-header';
    
    const name = document.createElement('div');
    name.className = 'player-name';
    name.textContent = player.name;
    
    const position = document.createElement('div');
    position.className = 'player-position';
    position.textContent = Positions[player.position];
    
    header.appendChild(name);
    header.appendChild(position);
    
    const details = document.createElement('div');
    details.innerHTML = `
        <p>年龄: ${player.age} | 年级: ${player.getCollegeYearText()} | 综合评分: ${player.getOverallRating()}</p>
        <p>奖学金: ${player.getScholarshipText()} | 剩余资格: ${player.eligibilityYears}年</p>
    `;
    
    const actions = document.createElement('div');
    actions.className = 'player-actions';
    
    const signButton = document.createElement('button');
    signButton.textContent = '招募';
    
    // 检查是否可以招募
    const currentScholarshipsUsed = GameState.userTeam.calculateScholarshipsUsed();
    const scholarshipNeeded = player.scholarship === 1 ? 1 : 
                           player.scholarship === 2 ? 0.75 : 
                           player.scholarship === 3 ? 0.5 : 
                           player.scholarship === 4 ? 0.25 : 0;
    
    signButton.disabled = GameState.userTeam.roster.length >= 15;
    
    signButton.addEventListener('click', () => signPlayer(player));
    
    actions.appendChild(signButton);
    
    card.appendChild(header);
    card.appendChild(details);
    card.appendChild(actions);
    
    return card;
}

// 签约球员
function signPlayer(player) {
    // 检查是否可以添加球员
    const canAddResult = GameState.userTeam.canAddPlayer(player);
    if (!canAddResult.canAdd) {
        alert(canAddResult.reason);
        return;
    }
    
    // 添加到球队
    GameState.userTeam.addPlayer(player);
    
    // 从市场移除
    const index = GameState.availablePlayers.findIndex(p => p.id === player.id);
    if (index !== -1) {
        GameState.availablePlayers.splice(index, 1);
    }
    
    // 更新UI
    updateUI();
    updateMarketScreen();
    
    alert(`成功招募 ${player.name}！`);
}

// 更新排名
function updateStandings() {
    // 创建包含用户球队的排名列表
    const allTeams = [...GameState.allTeams];
    if (!allTeams.find(t => t.id === GameState.userTeam.id)) {
        allTeams.push(GameState.userTeam);
    }
    
    // 按胜率排序
    allTeams.sort((a, b) => {
        const winPercentA = parseFloat(a.getWinPercentage());
        const winPercentB = parseFloat(b.getWinPercentage());
        
        if (winPercentA !== winPercentB) {
            return winPercentB - winPercentA;
        }
        
        // 胜率相同则按胜场数排序
        return (b.wins - a.wins);
    });
    
    // 更新每个球队的排名
    allTeams.forEach((team, index) => {
        team.rank = index + 1;
    });
}

// 更新排名屏幕
function updateStandingsScreen() {
    const leagueStandings = document.getElementById('league-standings');
    
    // 创建包含用户球队的排名列表
    const allTeams = [...GameState.allTeams];
    if (!allTeams.find(t => t.id === GameState.userTeam.id)) {
        allTeams.push(GameState.userTeam);
    }
    
    // 按胜率排序
    allTeams.sort((a, b) => {
        const winPercentA = parseFloat(a.getWinPercentage());
        const winPercentB = parseFloat(b.getWinPercentage());
        
        if (winPercentA !== winPercentB) {
            return winPercentB - winPercentA;
        }
        
        // 胜率相同则按胜场数排序
        return (b.wins - a.wins);
    });
    
    leagueStandings.innerHTML = '';
    
    // 创建表头
    const headerRow = document.createElement('div');
    headerRow.className = 'standing-row header';
    headerRow.innerHTML = `
        <div>排名</div>
        <div>球队</div>
        <div>战绩</div>
        <div>胜率</div>
        <div>连胜</div>
    `;
    leagueStandings.appendChild(headerRow);
    
    // 创建排名行
    allTeams.forEach((team, index) => {
        const row = document.createElement('div');
        row.className = 'standing-row';
        
        if (team.isUserTeam) {
            row.classList.add('user-team');
        }
        
        // 更新球队排名
        team.rank = index + 1;
        
        row.innerHTML = `
            <div>${team.rank}</div>
            <div>${team.name}</div>
            <div>${team.wins}胜${team.losses}负</div>
            <div>${team.getWinPercentage()}%</div>
            <div>${team.streak > 0 ? `${team.streak}连胜` : team.streak < 0 ? `${Math.abs(team.streak)}连败` : '-'}</div>
        `;
        
        leagueStandings.appendChild(row);
    });
}

// 开始新赛季
function startNewSeason() {
    const rosterSize = GameState.userTeam.roster ? GameState.userTeam.roster.length : 0;
    const playerNegotiations = GameState.playerNegotiations || [];
    const negotiationCount = playerNegotiations.filter(n => n.status === 'active').length;
    const totalPlayers = rosterSize + negotiationCount;
    const minPlayers = 13;

    if (totalPlayers < minPlayers) {
        alert(`无法开始新赛季！\n\n当前状态：\n- 已招募球员：${rosterSize} 人\n- 谈判中球员：${negotiationCount} 人\n- 总计：${totalPlayers} 人\n\n要求：招募的球员 + 谈判中的球员 ≥ 13 人\n\n请继续招募或完成谈判。`);
        return;
    }

    // 重置赛季数据
    GameState.userTeam.resetSeasonStats();
    GameState.allTeams.forEach(team => {
        if (!team.isUserTeam) {
            team.resetSeasonStats();
        }
    });
    
    // 生成新赛季赛程
    generateSeasonSchedule();
    
    // 更新UI
    updateUI();
    
    // 显示新赛季开始模态框
    showNewSeasonModal();
}

// 显示新赛季开始模态框
function showNewSeasonModal() {
    const modal = document.getElementById('new-season-modal');
    const seasonSummary = document.getElementById('season-summary');
    const rosterSize = GameState.userTeam.roster ? GameState.userTeam.roster.length : 0;
    
    seasonSummary.innerHTML = `
        <h3>${GameState.currentSeason}-${GameState.currentSeason + 1}赛季开始</h3>
        <p>新赛季已经开始，祝您好运！</p>
        <p>您的球队实力: ${GameState.userTeam.getTeamStrength()}</p>
        <p>当前球员数: ${rosterSize} 人</p>
        <p>本赛季共有${GameState.gameSchedule.length}场比赛</p>
    `;
    
    modal.style.display = 'block';
    
    // 添加开始新赛季按钮事件
    document.getElementById('start-new-season').addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// 休赛期处理
function startOffseason() {
    // 检查是否需要生成冠军
    if (GameState.userTeam.wins > 0) {
        determineChampion();
    }
    
    // 处理球员合同
    processContracts();
    
    // 球员年龄增长
    agePlayers();
    
    // 生成新的自由球员
    generateNewFreeAgents();
    
    // 重置教练签约次数
    if (typeof GameState.coachHiringCount !== 'undefined') {
        GameState.coachHiringCount = 0;
    }
    
    // 更新赛季年份
    GameState.currentSeason++;
    
    // 更新UI
    updateUI();
}

// 确定冠军
function determineChampion() {
    // 创建包含用户球队的排名列表
    const allTeams = [...GameState.allTeams];
    if (!allTeams.find(t => t.id === GameState.userTeam.id)) {
        allTeams.push(GameState.userTeam);
    }
    
    // 按胜率排序
    allTeams.sort((a, b) => {
        const winPercentA = parseFloat(a.getWinPercentage());
        const winPercentB = parseFloat(b.getWinPercentage());
        
        if (winPercentA !== winPercentB) {
            return winPercentB - winPercentA;
        }
        
        return (b.wins - a.wins);
    });
    
    const champion = allTeams[0];
    
    if (champion.isUserTeam) {
        GameState.userTeam.championships++;
        alert(`恭喜！您的球队获得了${GameState.currentSeason}-${GameState.currentSeason + 1}赛季冠军！`);
    }
}

// 处理球员毕业和资格
function processContracts() {
    // 处理用户球队球员毕业和资格
    const playersToRelease = [];
    
    GameState.userTeam.roster.forEach(player => {
        player.eligibilityYears--;
        
        // 毕业或超龄球员处理
        if (player.eligibilityYears <= 0 || player.age > 22) {
            // 球员资格到期或超龄，毕业离队
            let reason = player.eligibilityYears <= 0 ? "已毕业" : "已超龄";
            alert(`${player.name}${reason}，将离开球队`);
            playersToRelease.push(player);
        } else {
            // 其他球员可以选择是否继续提供奖学金
            const keepScholarship = confirm(`${player.name}下学年将继续留在球队（${player.getCollegeYearText()}），是否保留其奖学金？`);
            if (!keepScholarship && player.scholarship > 0) {
                player.scholarship = 0; // 改为自费
                alert(`${player.name}将转为自费球员`);
            }
        }
    });
    
    // 释放毕业或超龄球员
    playersToRelease.forEach(player => {
        GameState.userTeam.removePlayer(player.id);
        // 毕业球员不加入自由市场，直接离队
    });
    
    // 处理AI球队球员毕业和资格（简化处理）
    GameState.allTeams.forEach(team => {
        const playersToRelease = [];
        
        team.roster.forEach(player => {
            player.eligibilityYears--;
            
            if (player.eligibilityYears <= 0 || player.age > 22) {
                playersToRelease.push(player);
            }
        });
        
        // 释放球员
        playersToRelease.forEach(player => {
            team.removePlayer(player.id);
            // AI球队毕业球员也不加入自由市场
        });
    });
}

// 球员年龄增长和年级晋升
function agePlayers() {
    // 所有球员年龄增长1岁，年级晋升
    GameState.userTeam.roster.forEach(player => {
        player.age++;
        
        // 年级晋升
        if (player.year < 4) {
            player.year++;
            alert(`${player.name}晋升为${player.getCollegeYearText()}`);
            
            // 年级提升时属性小幅增长
            const improvementAmount = Math.floor(Math.random() * 3) + 1;
            for (const attr in player.attributes) {
                player.attributes[attr] = Math.min(75, player.attributes[attr] + improvementAmount);
            }
        }
        
        // 年龄超过22岁的球员属性开始下降
        if (player.age > 22) {
            const declineAmount = Math.floor(Math.random() * 2) + 1;
            
            for (const attr in player.attributes) {
                player.attributes[attr] = Math.max(20, player.attributes[attr] - declineAmount);
            }
        }
    });
    
    GameState.allTeams.forEach(team => {
        team.roster.forEach(player => {
            player.age++;
            
            // 年级晋升
            if (player.year < 4) {
                player.year++;
                
                // 年级提升时属性小幅增长
                const improvementAmount = Math.floor(Math.random() * 3) + 1;
                for (const attr in player.attributes) {
                    player.attributes[attr] = Math.min(75, player.attributes[attr] + improvementAmount);
                }
            }
            
            if (player.age > 22) {
                const declineAmount = Math.floor(Math.random() * 2) + 1;
                
                for (const attr in player.attributes) {
                    player.attributes[attr] = Math.max(20, player.attributes[attr] - declineAmount);
                }
            }
        });
    });
    
    GameState.availablePlayers.forEach(player => {
        player.age++;
        
        if (player.age > 35) {
            const declineAmount = Math.floor(Math.random() * 3) + 1;
            
            for (const attr in player.attributes) {
                player.attributes[attr] = Math.max(20, player.attributes[attr] - declineAmount);
            }
        }
    });
}

// 生成新生球员
function generateNewFreeAgents() {
    // 生成10个新生球员（高中毕业生）
    const newPlayers = [];
    
    for (let i = 0; i < 10; i++) {
        // 新生年龄18岁，年级为1
        const age = 18;
        const positions = Object.keys(Positions);
        const position = positions[Math.floor(Math.random() * positions.length)];
        
        const player = new Player(generateRandomName(), position, age);
        newPlayers.push(player);
    }
    
    GameState.availablePlayers.push(...newPlayers);
}

// 比赛模拟系统 - 优化版本
function playGame(gameData) {
    // 检查球员数量：招募的球员 ≥ 13 才能开始比赛
    const rosterCount = GameState.userTeam?.roster?.length || 0;
    
    if (rosterCount < 13) {
        alert(`无法开始比赛！\n\n您的球队目前只有 ${rosterCount} 名球员。\n至少需要 13 名球员才能开始比赛。\n\n请先在球员招募界面招募更多球员。`);
        return;
    }

    // 如果是AI球队之间的比赛，直接模拟并返回
    if (gameData.isAIGame) {
        const homeTeam = GameState.allTeams.find(t => t.id === gameData.homeTeam);
        const awayTeam = GameState.allTeams.find(t => t.id === gameData.awayTeam);
        
        if (!homeTeam || !awayTeam) return;
        
        // 模拟比赛结果
        const result = simulateAIGame(homeTeam, awayTeam);
        
        // 更新比赛结果
        gameData.homeScore = result.homeScore;
        gameData.awayScore = result.awayScore;
        gameData.isPlayed = true;
        
        // 更新球队战绩
        updateTeamStats(homeTeam, awayTeam, result.homeScore, result.awayScore);
        
        // 更新球员数据
        updatePlayerGameStats(homeTeam, result.homeScore, result.awayScore, true);
        updatePlayerGameStats(awayTeam, result.awayScore, result.homeScore, false);
        
        // 更新排名
        updateStandings();
        
        return;
    }
    
    const modal = document.getElementById('game-modal');
    const gameInfo = document.getElementById('game-info');
    const gameScore = document.getElementById('game-score');
    const gameTimer = document.getElementById('game-timer');
    const gameStatus = document.getElementById('game-status');
    const gameEvents = document.getElementById('game-events');
    const tacticalOptions = document.getElementById('tactical-options');
    const homeTeamName = document.getElementById('home-team-name');
    const awayTeamName = document.getElementById('away-team-name');
    const homePlayerStats = document.getElementById('home-player-stats');
    const awayPlayerStats = document.getElementById('away-player-stats');
    
    modal.style.display = 'block';
    
    // 获取比赛双方球队
    const homeTeam = gameData.homeTeam === GameState.userTeam.id ? 
        GameState.userTeam : 
        GameState.allTeams.find(t => t.id === gameData.homeTeam);
    
    const awayTeam = gameData.awayTeam === GameState.userTeam.id ? 
        GameState.userTeam : 
        GameState.allTeams.find(t => t.id === gameData.awayTeam);
    
    // 显示比赛信息
    gameInfo.innerHTML = `
        <p>${homeTeam.name} (主场) vs ${awayTeam.name} (客场)</p>
        <p>球队实力对比: ${homeTeam.getTeamStrength()} vs ${awayTeam.getTeamStrength()}</p>
    `;
    
    // 初始化比赛状态
    const gameState = {
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        homeScore: 0,
        awayScore: 0,
        currentQuarter: 1,
        timeLeft: 720, // 12分钟 * 60秒
        isPlaying: false,
        isPaused: false,
        speed: 1, // 1x, 2x, 4x
        possession: 'home', // 'home' or 'away'
        homeLineup: homeTeam.getStartingLineup(),
        awayLineup: awayTeam.getStartingLineup(),
        userTactic: 'balanced',
        aiTactic: ['balanced', 'inside', 'outside', 'fast-break', 'defense'][Math.floor(Math.random() * 5)],
        playerStats: initializePlayerStats(homeTeam, awayTeam),
        eventLog: []
    };
    
    // 更新球队名称
    homeTeamName.textContent = homeTeam.name;
    awayTeamName.textContent = awayTeam.name;
    
    // 初始化比分显示
    updateGameScore(gameState);
    
    // 初始化计时器显示
    updateGameTimer(gameState);
    
    // 初始化状态显示
    gameStatus.innerHTML = `<p>比赛准备就绪</p>`;
    
    // 清空比赛事件
    gameEvents.innerHTML = '';
    
    // 显示战术选项
    tacticalOptions.innerHTML = `
        <h3>战术选择</h3>
        <div class="tactical-option selected" data-tactic="balanced">平衡进攻</div>
        <div class="tactical-option" data-tactic="inside">内线强攻</div>
        <div class="tactical-option" data-tactic="outside">外线投射</div>
        <div class="tactical-option" data-tactic="fast-break">快速反击</div>
        <div class="tactical-option" data-tactic="defense">防守反击</div>
        <button id="start-game-btn">开始比赛</button>
    `;
    
    // 添加战术选择事件
    document.querySelectorAll('.tactical-option').forEach(option => {
        option.addEventListener('click', () => {
            // 移除其他选中状态
            document.querySelectorAll('.tactical-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // 添加选中状态
            option.classList.add('selected');
            gameState.userTactic = option.dataset.tactic;
        });
    });
    
    // 初始化球员数据表
    updatePlayerStatsTable(homeTeam, homePlayerStats, gameState.playerStats.home);
    updatePlayerStatsTable(awayTeam, awayPlayerStats, gameState.playerStats.away);
    
    // 添加开始比赛按钮事件
    document.getElementById('start-game-btn').addEventListener('click', () => {
        document.getElementById('start-game-btn').disabled = true;
        gameState.isPlaying = true;
        addGameEvent(`比赛开始！${homeTeam.name} vs ${awayTeam.name}`, 'info');
        addGameEvent(`${homeTeam.name}战术: ${getTacticName(gameState.userTactic)} | ${awayTeam.name}战术: ${getTacticName(gameState.aiTactic)}`, 'info');
        gameStatus.innerHTML = `<p>比赛进行中</p>`;
        startGameLoop(gameState);
    });
    
    // 添加控制按钮事件
    document.getElementById('pause-game-btn').addEventListener('click', () => {
        gameState.isPaused = true;
        document.getElementById('pause-game-btn').style.display = 'none';
        document.getElementById('resume-game-btn').style.display = 'inline-block';
        gameStatus.innerHTML = `<p>比赛暂停</p>`;
        addGameEvent(`比赛暂停`, 'timeout');
    });
    
    document.getElementById('resume-game-btn').addEventListener('click', () => {
        gameState.isPaused = false;
        document.getElementById('resume-game-btn').style.display = 'none';
        document.getElementById('pause-game-btn').style.display = 'inline-block';
        gameStatus.innerHTML = `<p>比赛进行中</p>`;
        addGameEvent(`比赛继续`, 'timeout');
    });
    
    document.getElementById('speed-up-btn').addEventListener('click', () => {
        // 切换速度: 1x -> 2x -> 4x -> 1x
        gameState.speed = gameState.speed === 1 ? 2 : gameState.speed === 2 ? 4 : 1;
        document.getElementById('speed-up-btn').textContent = `加速 x${gameState.speed}`;
        addGameEvent(`比赛速度调整为 x${gameState.speed}`, 'info');
    });
    
    document.getElementById('close-game-btn').addEventListener('click', () => {
        gameState.isPlaying = false;
        document.getElementById('game-modal').style.display = 'none';
        updateUI();
    });
}

// 初始化球员统计数据
function initializePlayerStats(homeTeam, awayTeam) {
    const playerStats = {
        home: {},
        away: {}
    };
    
    // 初始化主队球员统计
    homeTeam.roster.forEach(player => {
        playerStats.home[player.id] = {
            id: player.id,
            name: player.name,
            position: player.position,
            points: 0,
            assists: 0,
            rebounds: 0,
            steals: 0,
            blocks: 0,
            fouls: 0,
            turnovers: 0,
            fieldGoalsMade: 0,
            fieldGoalsAttempted: 0,
            threePointsMade: 0,
            threePointsAttempted: 0,
            freeThrowsMade: 0,
            freeThrowsAttempted: 0,
            minutes: 0,
            plusMinus: 0
        };
    });
    
    // 初始化客队球员统计
    awayTeam.roster.forEach(player => {
        playerStats.away[player.id] = {
            id: player.id,
            name: player.name,
            position: player.position,
            points: 0,
            assists: 0,
            rebounds: 0,
            steals: 0,
            blocks: 0,
            fouls: 0,
            turnovers: 0,
            fieldGoalsMade: 0,
            fieldGoalsAttempted: 0,
            threePointsMade: 0,
            threePointsAttempted: 0,
            freeThrowsMade: 0,
            freeThrowsAttempted: 0,
            minutes: 0,
            plusMinus: 0
        };
    });
    
    return playerStats;
}

// 更新比分显示
function updateGameScore(gameState) {
    const gameScore = document.getElementById('game-score');
    gameScore.innerHTML = `
        <div class="score-board">
            <div class="team-score">
                <h3>${gameState.homeTeam.name}</h3>
                <div class="score">${gameState.homeScore}</div>
            </div>
            <div class="vs">VS</div>
            <div class="team-score">
                <h3>${gameState.awayTeam.name}</h3>
                <div class="score">${gameState.awayScore}</div>
            </div>
        </div>
        <div class="quarter-info">第${gameState.currentQuarter}节</div>
    `;
}

// 更新计时器显示
function updateGameTimer(gameState) {
    const gameTimer = document.getElementById('game-timer');
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    gameTimer.innerHTML = `
        <div class="timer-display">
            <div class="time">${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</div>
            <div class="possession">
                ${gameState.possession === 'home' ? gameState.homeTeam.name : gameState.awayTeam.name} 进攻
            </div>
        </div>
    `;
}

// 更新球员数据表
function updatePlayerStatsTable(team, containerElement, playerStats) {
    containerElement.innerHTML = '';
    
    const table = document.createElement('table');
    table.className = 'player-stats-table';
    
    // 创建表头
    const header = document.createElement('tr');
    header.innerHTML = `
        <th>球员</th>
        <th>得分</th>
        <th>篮板</th>
        <th>助攻</th>
        <th>抢断</th>
        <th>盖帽</th>
        <th>犯规</th>
        <th>失误</th>
        <th>+/-</th>
    `;
    table.appendChild(header);
    
    // 按位置排序球员
    const sortedPlayers = [...team.roster].sort((a, b) => {
        const positionOrder = { 'PG': 1, 'SG': 2, 'SF': 3, 'PF': 4, 'C': 5 };
        return positionOrder[a.position] - positionOrder[b.position];
    });
    
    // 添加球员数据行
    sortedPlayers.forEach(player => {
        const stats = playerStats[player.id];
        if (!stats) return;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="player-info">
                <div class="player-name">${player.name}</div>
                <div class="player-position">${Positions[player.position]}</div>
            </td>
            <td>${stats.points}</td>
            <td>${stats.rebounds}</td>
            <td>${stats.assists}</td>
            <td>${stats.steals}</td>
            <td>${stats.blocks}</td>
            <td>${stats.fouls}</td>
            <td>${stats.turnovers}</td>
            <td class="${stats.plusMinus >= 0 ? 'positive' : 'negative'}">${stats.plusMinus >= 0 ? '+' : ''}${stats.plusMinus}</td>
        `;
        
        table.appendChild(row);
    });
    
    containerElement.appendChild(table);
}

// 游戏主循环
function startGameLoop(gameState) {
    let lastTime = Date.now();
    let accumulator = 0;
    const stepTime = 1000 / 60; // 60 FPS
    
    function gameLoop(currentTime) {
        if (!gameState.isPlaying) return;
        
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        if (!gameState.isPaused) {
            accumulator += deltaTime * gameState.speed;
            
            // 每60个游戏秒（1秒）处理一次游戏逻辑
            while (accumulator >= stepTime) {
                updateGameState(gameState);
                accumulator -= stepTime;
            }
        }
        
        requestAnimationFrame(gameLoop);
    }
    
    requestAnimationFrame(gameLoop);
}

// 更新游戏状态
function updateGameState(gameState) {
    // 减少时间
    gameState.timeLeft--;
    
    // 检查节结束
    if (gameState.timeLeft <= 0) {
        if (gameState.currentQuarter < 4) {
            // 进入下一节
            gameState.currentQuarter++;
            gameState.timeLeft = 720; // 重置为12分钟
            addGameEvent(`===== 第${gameState.currentQuarter}节开始 =====`, 'info');
            
            // AI可能调整战术
            if (Math.random() < 0.3) {
                const tactics = ['balanced', 'inside', 'outside', 'fast-break', 'defense'];
                gameState.aiTactic = tactics[Math.floor(Math.random() * tactics.length)];
                addGameEvent(`${gameState.awayTeam.name}调整战术为: ${getTacticName(gameState.aiTactic)}`, 'info');
            }
        } else {
            // 比赛结束
            endGame(gameState);
            return;
        }
    }
    
    // 每12秒（游戏中）模拟一次进攻回合
    if (gameState.timeLeft % 12 === 0) {
        simulatePossession(gameState);
    }
    
    // 更新UI
    updateGameScore(gameState);
    updateGameTimer(gameState);
    
    // 每30秒更新一次球员数据表
    if (gameState.timeLeft % 30 === 0) {
        const homePlayerStats = document.getElementById('home-player-stats');
        const awayPlayerStats = document.getElementById('away-player-stats');
        updatePlayerStatsTable(gameState.homeTeam, homePlayerStats, gameState.playerStats.home);
        updatePlayerStatsTable(gameState.awayTeam, awayPlayerStats, gameState.playerStats.away);
    }
}

// 模拟一次进攻回合
function simulatePossession(gameState) {
    const isHomePossession = gameState.possession === 'home';
    const offensiveTeam = isHomePossession ? gameState.homeTeam : gameState.awayTeam;
    const defensiveTeam = isHomePossession ? gameState.awayTeam : gameState.homeTeam;
    const offensiveLineup = isHomePossession ? gameState.homeLineup : gameState.awayLineup;
    const defensiveLineup = isHomePossession ? gameState.awayLineup : gameState.homeLineup;
    const offensiveTactic = isHomePossession ? gameState.userTactic : gameState.aiTactic;
    const defensiveTactic = isHomePossession ? gameState.aiTactic : gameState.userTactic;
    const offensiveStats = isHomePossession ? gameState.playerStats.home : gameState.playerStats.away;
    const defensiveStats = isHomePossession ? gameState.playerStats.away : gameState.playerStats.home;
    
    // 计算进攻成功率
    const offenseStrength = calculateTeamStrength(offensiveTeam, offensiveTactic);
    const defenseStrength = calculateTeamStrength(defensiveTeam, defensiveTactic);
    const successRate = Math.max(0.2, Math.min(0.8, 0.5 + (offenseStrength - defenseStrength) / 200));
    
    // 确定进攻结果
    const isScore = Math.random() < successRate;
    
    // 选择参与进攻的球员
    const positions = Object.keys(offensiveLineup);
    const primaryPlayer = offensiveLineup[positions[Math.floor(Math.random() * positions.length)]];
    const secondaryPlayer = offensiveLineup[positions[Math.floor(Math.random() * positions.length)]];
    
    if (!primaryPlayer) return; // 防止空指针
    
    // 更新球员上场时间
    offensiveStats[primaryPlayer.id].minutes++;
    if (secondaryPlayer && secondaryPlayer.id !== primaryPlayer.id) {
        offensiveStats[secondaryPlayer.id].minutes++;
    }
    
    if (isScore) {
        // 得分情况
        const shotType = determineShotType(offensiveTactic, primaryPlayer);
        let points = 0;
        let eventText = '';
        
        // 更新投篮统计
        offensiveStats[primaryPlayer.id].fieldGoalsAttempted++;
        
        if (shotType === 'three') {
            offensiveStats[primaryPlayer.id].threePointsAttempted++;
            points = 3;
            eventText = `${primaryPlayer.name} 三分命中`;
        } else if (shotType === 'free') {
            // 罚球情况
            const freeThrows = Math.floor(Math.random() * 3) + 1; // 1-3次罚球
            let madeFreeThrows = 0;
            
            for (let i = 0; i < freeThrows; i++) {
                offensiveStats[primaryPlayer.id].freeThrowsAttempted++;
                const freeThrowSuccess = 0.5 + (primaryPlayer.attributes.freeThrow / 200);
                if (Math.random() < freeThrowSuccess) {
                    offensiveStats[primaryPlayer.id].freeThrowsMade++;
                    madeFreeThrows++;
                }
            }
            
            points = madeFreeThrows;
            eventText = `${primaryPlayer.name} 罚球 ${madeFreeThrows}/${freeThrows}`;
        } else {
            points = 2;
            eventText = `${primaryPlayer.name} 两分命中`;
        }
        
        // 更新得分统计
        offensiveStats[primaryPlayer.id].points += points;
        offensiveStats[primaryPlayer.id].fieldGoalsMade++;
        if (shotType === 'three') {
            offensiveStats[primaryPlayer.id].threePointsMade++;
        }
        
        // 更新助攻统计
        if (secondaryPlayer && Math.random() < 0.7) {
            offensiveStats[secondaryPlayer.id].assists++;
            eventText += ` (${secondaryPlayer.name} 助攻)`;
        }
        
        // 更新篮板统计
        if (Math.random() < 0.3) {
            const rebounder = offensiveLineup[positions[Math.floor(Math.random() * positions.length)]];
            if (rebounder) {
                offensiveStats[rebounder.id].rebounds++;
                eventText += ` (${rebounder.name} 篮板)`;
            }
        }
        
        // 更新比分
        if (isHomePossession) {
            gameState.homeScore += points;
        } else {
            gameState.awayScore += points;
        }
        
        // 更新+/-值
        updatePlusMinus(gameState, isHomePossession, points);
        
        addGameEvent(eventText, 'score');
    } else {
        // 失误情况
        const turnoverType = Math.random();
        let eventText = '';
        
        if (turnoverType < 0.4) {
            // 投篮不中，对方抢到防守篮板
            offensiveStats[primaryPlayer.id].fieldGoalsAttempted++;
            eventText = `${primaryPlayer.name} 投篮不中`;
            
            // 防守篮板
            const positions = Object.keys(defensiveLineup);
            const rebounder = defensiveLineup[positions[Math.floor(Math.random() * positions.length)]];
            if (rebounder) {
                defensiveStats[rebounder.id].rebounds++;
                eventText += ` (${rebounder.name} 防守篮板)`;
            }
        } else if (turnoverType < 0.7) {
            // 失误
            offensiveStats[primaryPlayer.id].turnovers++;
            eventText = `${primaryPlayer.name} 失误`;
            
            // 抢断
            if (Math.random() < 0.5) {
                const positions = Object.keys(defensiveLineup);
                const stealer = defensiveLineup[positions[Math.floor(Math.random() * positions.length)]];
                if (stealer) {
                    defensiveStats[stealer.id].steals++;
                    eventText += ` (${stealer.name} 抢断)`;
                }
            }
        } else {
            // 进攻犯规
            offensiveStats[primaryPlayer.id].fouls++;
            eventText = `${primaryPlayer.name} 进攻犯规`;
        }
        
        addGameEvent(eventText, 'turnover');
    }
    
    // 随机犯规
    if (Math.random() < 0.1) {
        const positions = Object.keys(defensiveLineup);
        const fouler = defensiveLineup[positions[Math.floor(Math.random() * positions.length)]];
        if (fouler) {
            defensiveStats[fouler.id].fouls++;
            addGameEvent(`${fouler.name} 防守犯规`, 'foul');
        }
    }
    
    // 随机盖帽
    if (Math.random() < 0.05 && !isScore) {
        const positions = Object.keys(defensiveLineup);
        const blocker = defensiveLineup[positions[Math.floor(Math.random() * positions.length)]];
        if (blocker) {
            defensiveStats[blocker.id].blocks++;
            addGameEvent(`${blocker.name} 盖帽`, 'defense');
        }
    }
    
    // 切换球权
    gameState.possession = gameState.possession === 'home' ? 'away' : 'home';
}

// 确定投篮类型
function determineShotType(tactic, player) {
    const rand = Math.random();
    
    if (tactic === 'outside') {
        return rand < 0.4 ? 'three' : 'two';
    } else if (tactic === 'inside') {
        return rand < 0.2 ? 'free' : 'two';
    } else if (tactic === 'fast-break') {
        return rand < 0.1 ? 'three' : 'two';
    } else {
        // balanced 或 defense
        if (player.position === 'PG' || player.position === 'SG') {
            return rand < 0.3 ? 'three' : 'two';
        } else {
            return rand < 0.1 ? 'three' : 'two';
        }
    }
}

// 计算球队实力（考虑战术）
function calculateTeamStrength(team, tactic) {
    let strength = team.getTeamStrength();
    
    // 根据战术调整实力
    switch (tactic) {
        case 'inside':
            strength += 5;
            break;
        case 'outside':
            strength += 5;
            break;
        case 'fast-break':
            strength += 8;
            break;
        case 'defense':
            strength += 3;
            break;
    }
    
    return strength;
}

// 更新+/-值
function updatePlusMinus(gameState, isHomePossession, points) {
    const offensiveStats = isHomePossession ? gameState.playerStats.home : gameState.playerStats.away;
    const defensiveStats = isHomePossession ? gameState.playerStats.away : gameState.playerStats.home;
    
    // 更新进攻方球员+/-值
    for (const playerId in offensiveStats) {
        offensiveStats[playerId].plusMinus += points;
    }
    
    // 更新防守方球员+/-值
    for (const playerId in defensiveStats) {
        defensiveStats[playerId].plusMinus -= points;
    }
}

// 比赛结束
function endGame(gameState) {
    gameState.isPlaying = false;
    
    const homeTeamWon = gameState.homeScore > gameState.awayScore;
    const userTeamWon = (gameState.homeTeam.isUserTeam && homeTeamWon) || (gameState.awayTeam.isUserTeam && !homeTeamWon);
    
    addGameEvent(`===== 全场比赛结束 =====`, 'info');
    addGameEvent(`最终比分: ${gameState.homeTeam.name} ${gameState.homeScore} : ${gameState.awayTeam.name} ${gameState.awayScore}`, 'info');
    
    if (userTeamWon) {
        addGameEvent(`恭喜！您的球队获得了胜利！`, 'score');
    } else {
        addGameEvent(`很遗憾，您的球队输掉了比赛。`, 'turnover');
    }
    
    // 更新比赛数据
    const gameData = GameState.gameSchedule[GameState.nextGameIndex];
    gameData.isPlayed = true;
    gameData.homeScore = gameState.homeScore;
    gameData.awayScore = gameState.awayScore;
    
    // 更新球队统计
    gameState.homeTeam.updateSeasonStats(gameState.homeScore, gameState.awayScore, homeTeamWon);
    gameState.awayTeam.updateSeasonStats(gameState.awayScore, gameState.homeScore, !homeTeamWon);
    
    // 更新球员赛季统计
    updatePlayerSeasonStats(gameState.homeTeam, gameState.playerStats.home);
    updatePlayerSeasonStats(gameState.awayTeam, gameState.playerStats.away);
    
    // 更新下一场比赛索引
    GameState.nextGameIndex++;
    
    // 更新状态显示
    document.getElementById('game-status').innerHTML = `<p>比赛结束</p>`;
    
    // 显示关闭按钮
    document.getElementById('pause-game-btn').style.display = 'none';
    document.getElementById('resume-game-btn').style.display = 'none';
    document.getElementById('speed-up-btn').style.display = 'none';
    document.getElementById('close-game-btn').style.display = 'inline-block';
    
    // 推进日期
    advanceDate(2); // 比赛后推进2天
}

// 更新球员赛季统计
function updatePlayerSeasonStats(team, playerStats) {
    team.roster.forEach(player => {
        const stats = playerStats[player.id];
        if (!stats) return;
        
        // 更新赛季统计
        player.seasonStats.gamesPlayed++;
        player.seasonStats.points += stats.points;
        player.seasonStats.rebounds += stats.rebounds;
        player.seasonStats.assists += stats.assists;
        player.seasonStats.steals += stats.steals;
        player.seasonStats.blocks += stats.blocks;
        player.seasonStats.fouls += stats.fouls;
        player.seasonStats.turnovers += stats.turnovers;
        
        // 比赛后恢复
        const isInjured = player.postGameRecovery();
        
        if (isInjured) {
            addGameEvent(`${player.name} 在比赛中受伤，将缺席${player.injuryDays}场比赛`, 'foul');
        }
    });
}

// 模拟单节比赛
function simulateQuarter(homeTeam, awayTeam, homeLineup, awayLineup, homeTactic, awayTactic) {
    let homeScore = 0;
    let awayScore = 0;
    
    // 计算球队实力加成
    const homeStrength = homeTeam.getTeamStrength();
    const awayStrength = awayTeam.getTeamStrength();
    
    // 计算战术加成
    const homeTacticBonus = getTacticBonus(homeTactic, homeLineup);
    const awayTacticBonus = getTacticBonus(awayTactic, awayLineup);
    
    // 计算最终实力
    const homeFinalStrength = homeStrength + homeTacticBonus;
    const awayFinalStrength = awayStrength + awayTacticBonus;
    
    // 基础得分（根据实力差）
    const strengthDiff = homeFinalStrength - awayFinalStrength;
    const baseScore = 25; // 每节基础得分
    
    // 计算本节得分
    homeScore = Math.floor(baseScore + strengthDiff / 10 + Math.random() * 10);
    awayScore = Math.floor(baseScore - strengthDiff / 10 + Math.random() * 10);
    
    // 确保得分在合理范围内
    homeScore = Math.max(15, Math.min(45, homeScore));
    awayScore = Math.max(15, Math.min(45, awayScore));
    
    // 生成一些比赛事件
    generateGameEvents(homeTeam, awayTeam, homeLineup, awayLineup, homeScore, awayScore);
    
    return { homeScore, awayScore };
}

// 获取战术名称
function getTacticName(tactic) {
    const tacticNames = {
        'balanced': '平衡进攻',
        'inside': '内线强攻',
        'outside': '外线投射',
        'fast-break': '快速反击',
        'defense': '防守反击'
    };
    
    return tacticNames[tactic] || '未知战术';
}

// 获取战术加成
function getTacticBonus(tactic, lineup) {
    let bonus = 0;
    
    // 根据战术类型和球员阵容计算加成
    switch (tactic) {
        case 'balanced':
            // 平衡战术，所有位置都有小幅加成
            bonus = 5;
            break;
        case 'inside':
            // 内线战术，C和PF位置加成
            if (lineup.C) bonus += lineup.C.attributes.rebounding / 5;
            if (lineup.PF) bonus += lineup.PF.attributes.rebounding / 5;
            break;
        case 'outside':
            // 外线战术，PG和SG位置加成
            if (lineup.PG) bonus += lineup.PG.attributes.threePoint / 5;
            if (lineup.SG) bonus += lineup.SG.attributes.threePoint / 5;
            break;
        case 'fast-break':
            // 快速反击，速度快的球员加成
            for (const pos in lineup) {
                if (lineup[pos]) bonus += lineup[pos].attributes.speed / 10;
            }
            break;
        case 'defense':
            // 防守反击，防守好的球员加成
            for (const pos in lineup) {
                if (lineup[pos]) bonus += lineup[pos].attributes.defense / 10;
            }
            break;
    }
    
    return Math.floor(bonus);
}

// 生成比赛事件
function generateGameEvents(homeTeam, awayTeam, homeLineup, awayLineup, homeScore, awayScore) {
    // 生成3-5个随机事件
    const eventCount = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < eventCount; i++) {
        const eventType = Math.random();
        
        if (eventType < 0.4) {
            // 得分事件
            const isHomeScore = Math.random() < 0.5;
            const team = isHomeScore ? homeTeam : awayTeam;
            const lineup = isHomeScore ? homeLineup : awayLineup;
            
            // 随机选择一个得分球员
            const positions = Object.keys(lineup);
            const randomPos = positions[Math.floor(Math.random() * positions.length)];
            const player = lineup[randomPos];
            
            if (player) {
                const scoreType = Math.random();
                let scoreText = '';
                
                if (scoreType < 0.6) {
                    scoreText = `${player.name} 两分命中`;
                } else if (scoreType < 0.9) {
                    scoreText = `${player.name} 三分命中`;
                } else {
                    scoreText = `${player.name} 罚球命中`;
                }
                
                addGameEvent(scoreText);
            }
        } else if (eventType < 0.7) {
            // 防守事件
            const isHomeEvent = Math.random() < 0.5;
            const team = isHomeEvent ? homeTeam : awayTeam;
            const lineup = isHomeEvent ? homeLineup : awayLineup;
            
            // 随机选择一个防守球员
            const positions = Object.keys(lineup);
            const randomPos = positions[Math.floor(Math.random() * positions.length)];
            const player = lineup[randomPos];
            
            if (player) {
                const defenseType = Math.random();
                let defenseText = '';
                
                if (defenseType < 0.5) {
                    defenseText = `${player.name} 抢断成功`;
                } else if (defenseType < 0.8) {
                    defenseText = `${player.name} 抢到篮板`;
                } else {
                    defenseText = `${player.name} 完成盖帽`;
                }
                
                addGameEvent(defenseText);
            }
        } else {
            // 其他事件
            const events = [
                '精彩的团队配合',
                '快速反击',
                '暂停调整',
                '球员替换',
                '关键时刻'
            ];
            
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            addGameEvent(randomEvent);
        }
    }
}

// 添加比赛事件
function addGameEvent(eventText, eventType = 'info') {
    const gameEvents = document.getElementById('game-events');
    const eventDiv = document.createElement('div');
    
    // 设置事件类型样式
    eventDiv.className = `event ${eventType}`;
    
    // 创建事件内容
    const currentTime = new Date();
    const timeString = `${currentTime.getMinutes().toString().padStart(2, '0')}:${currentTime.getSeconds().toString().padStart(2, '0')}`;
    
    eventDiv.innerHTML = `
        <div class="event-header">
            <span class="event-time">${timeString}</span>
        </div>
        <div class="event-details">
            <div class="event-text">${eventText}</div>
        </div>
    `;
    
    gameEvents.appendChild(eventDiv);
    
    // 自动滚动到底部
    gameEvents.scrollTop = gameEvents.scrollHeight;
}

// 更新比分显示
function updateGameScore(homeTeamName, awayTeamName, homeScore, awayScore, quarter) {
    const gameScore = document.getElementById('game-score');
    gameScore.innerHTML = `
        <h3>比分</h3>
        <p>${homeTeamName}: ${homeScore}</p>
        <p>${awayTeamName}: ${awayScore}</p>
        <p>第${quarter}节</p>
    `;
}

// 更新球员统计
function updatePlayerStats(team, teamScore, opponentScore, won) {
    team.roster.forEach(player => {
        // 更新出场次数
        player.seasonStats.gamesPlayed++;
        
        // 根据球员能力和比赛结果更新统计
        const overallRating = player.getOverallRating();
        const performanceFactor = overallRating / 70; // 70是平均评分
        
        // 基础数据
        const basePoints = Math.floor(Math.random() * 10 * performanceFactor) + 5;
        const baseRebounds = Math.floor(Math.random() * 8 * performanceFactor) + 2;
        const baseAssists = Math.floor(Math.random() * 6 * performanceFactor) + 1;
        const baseSteals = Math.floor(Math.random() * 3 * performanceFactor);
        const baseBlocks = Math.floor(Math.random() * 2 * performanceFactor);
        const baseFouls = Math.floor(Math.random() * 4) + 1;
        const baseTurnovers = Math.floor(Math.random() * 3) + 1;
        
        // 根据位置调整数据
        let adjustedPoints = basePoints;
        let adjustedRebounds = baseRebounds;
        let adjustedAssists = baseAssists;
        
        switch (player.position) {
            case 'PG':
                adjustedAssists = Math.floor(baseAssists * 1.5);
                adjustedPoints = Math.floor(basePoints * 0.9);
                adjustedRebounds = Math.floor(baseRebounds * 0.8);
                break;
            case 'SG':
                adjustedPoints = Math.floor(basePoints * 1.3);
                adjustedAssists = Math.floor(baseAssists * 0.8);
                break;
            case 'SF':
                adjustedPoints = Math.floor(basePoints * 1.1);
                adjustedRebounds = Math.floor(baseRebounds * 1.1);
                break;
            case 'PF':
                adjustedRebounds = Math.floor(baseRebounds * 1.4);
                adjustedPoints = Math.floor(basePoints * 0.9);
                break;
            case 'C':
                adjustedRebounds = Math.floor(baseRebounds * 1.6);
                adjustedBlocks = Math.floor(baseBlocks * 1.5);
                adjustedPoints = Math.floor(basePoints * 0.8);
                break;
        }
        
        // 更新赛季统计
        player.seasonStats.points += adjustedPoints;
        player.seasonStats.rebounds += adjustedRebounds;
        player.seasonStats.assists += adjustedAssists;
        player.seasonStats.steals += baseSteals;
        player.seasonStats.blocks += baseBlocks;
        player.seasonStats.fouls += baseFouls;
        player.seasonStats.turnovers += baseTurnovers;
        
        // 比赛后恢复
        const isInjured = player.postGameRecovery();
        
        if (isInjured) {
            addGameEvent(`${player.name} 在比赛中受伤，将缺席${player.injuryDays}场比赛`);
        }
    });
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    // 设置导航
    setupNavigation();
    
    // 设置模态框关闭按钮
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').style.display = 'none';
        });
    });
    
    // 初始化游戏
    initializeGame();
});

// 球员培养界面
let selectedPlayerForDevelopment = null;

function updatePlayerDevelopmentScreen() {
    const playerList = document.getElementById('player-list');
    const playerDetails = document.getElementById('player-details');
    
    // 更新球员列表
    playerList.innerHTML = '';
    
    if (GameState.userTeam.roster.length === 0) {
        playerList.innerHTML = '<p>您的球队还没有球员！</p>';
        playerDetails.innerHTML = '<p>请先招募球员</p>';
        return;
    }
    
    // 显示球员列表
    GameState.userTeam.roster.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-select-item';
        
        if (selectedPlayerForDevelopment && selectedPlayerForDevelopment.id === player.id) {
            playerItem.classList.add('selected');
        }
        
        playerItem.innerHTML = `
            <div class="player-select-info">
                <div class="player-select-name">${player.name}</div>
                <div class="player-select-details">${Positions[player.position]} | ${player.getCollegeYearText()}</div>
            </div>
            <div class="player-select-rating">${player.getOverallRating()}</div>
        `;
        
        playerItem.addEventListener('click', () => {
            // 移除之前的选择
            document.querySelectorAll('.player-select-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // 选择当前球员
            playerItem.classList.add('selected');
            selectedPlayerForDevelopment = player;
            updatePlayerDetails();
            updateTrainingOptions();
            updateSkillOptions();
        });
        
        playerList.appendChild(playerItem);
    });
    
    // 如果没有选择球员，默认选择第一个
    if (!selectedPlayerForDevelopment && GameState.userTeam.roster.length > 0) {
        selectedPlayerForDevelopment = GameState.userTeam.roster[0];
        updatePlayerDetails();
        updateTrainingOptions();
        updateSkillOptions();
    }
}

function updatePlayerDetails() {
    const playerDetails = document.getElementById('player-details');
    
    if (!selectedPlayerForDevelopment) {
        playerDetails.innerHTML = '<p>请选择一个球员</p>';
        return;
    }
    
    const player = selectedPlayerForDevelopment;
    
    playerDetails.innerHTML = `
        <h3>${player.name} - ${Positions[player.position]}</h3>
        <p>年龄: ${player.age} | 年级: ${player.getCollegeYearText()} | 综合评分: ${player.getOverallRating()}</p>
        <p>奖学金: ${player.getScholarshipText()} | 剩余资格: ${player.eligibilityYears}年</p>
        <p>疲劳度: ${player.fatigue}/100 | 状态: ${player.getFatigueStatus()}</p>
        
        <h4>属性详情</h4>
        <div class="player-attributes">
            ${Object.entries(PlayerAttributes).map(([key, name]) => `
                <div class="attribute">
                    <span class="attribute-name">${name}</span>
                    <div class="attribute-bar">
                        <div class="attribute-fill" style="width: ${player.attributes[key]}%"></div>
                    </div>
                    <span class="attribute-value">${player.attributes[key]}</span>
                </div>
            `).join('')}
        </div>
        
        <h4>已学技能</h4>
        <div class="player-skills">
            ${player.skills.length > 0 ? 
                player.skills.map(skillId => {
                    const skill = Skills[skillId];
                    return `<div class="skill-item learned">${skill.name}</div>`;
                }).join('') :
                '<p>尚未学习任何技能</p>'
            }
        </div>
        
        <h4>正在学习的技能</h4>
        <div class="learning-skills">
            ${player.learningSkills.length > 0 ? 
                player.learningSkills.map(learning => {
                    const skill = Skills[learning.id];
                    return `
                        <div class="skill-item learning">
                            <div class="skill-name">${skill.name}</div>
                            <div class="skill-progress">进度: ${learning.progress}/100</div>
                        </div>
                    `;
                }).join('') :
                '<p>当前没有正在学习的技能</p>'
            }
        </div>
    `;
}

function updateTrainingOptions() {
    const trainingOptions = document.querySelectorAll('.training-option');
    
    if (!selectedPlayerForDevelopment) return;
    
    const player = selectedPlayerForDevelopment;
    
    trainingOptions.forEach(option => {
        const trainingType = option.dataset.training;
        const progressBar = option.querySelector('.progress-fill');
        const progressText = option.querySelector('.progress-text');
        
        // 更新进度
        progressBar.style.width = `${player.trainingProgress[trainingType]}%`;
        progressText.textContent = `${player.trainingProgress[trainingType]}/100`;
        
        // 添加点击事件
        option.addEventListener('click', () => {
            // 移除其他选项的选中状态
            trainingOptions.forEach(opt => opt.classList.remove('selected'));
            
            // 选中当前选项
            option.classList.add('selected');
        });
    });
    
    // 添加训练按钮事件
    const startTrainingBtn = document.getElementById('start-training-btn');
    const resetTrainingBtn = document.getElementById('reset-training-btn');
    
    // 移除旧的事件监听器
    const newStartBtn = startTrainingBtn.cloneNode(true);
    const newResetBtn = resetTrainingBtn.cloneNode(true);
    startTrainingBtn.parentNode.replaceChild(newStartBtn, startTrainingBtn);
    resetTrainingBtn.parentNode.replaceChild(newResetBtn, resetTrainingBtn);
    
    // 添加新的事件监听器
    newStartBtn.addEventListener('click', () => {
        const selectedTraining = document.querySelector('.training-option.selected');
        if (!selectedTraining) {
            alert('请先选择一个训练项目');
            return;
        }
        
        const trainingType = selectedTraining.dataset.training;
        const result = player.train(trainingType);
        
        if (result.success) {
            if (result.levelUp) {
                alert(result.message);
                updatePlayerDetails();
            }
            updateTrainingOptions();
        } else {
            alert(result.message);
        }
    });
    
    newResetBtn.addEventListener('click', () => {
        if (confirm('确定要重置该球员的所有训练进度吗？')) {
            Object.keys(player.trainingProgress).forEach(key => {
                player.trainingProgress[key] = 0;
            });
            updateTrainingOptions();
        }
    });
}

function updateSkillOptions() {
    const availableSkills = document.getElementById('available-skills');
    
    if (!selectedPlayerForDevelopment) {
        availableSkills.innerHTML = '<p>请选择一个球员</p>';
        return;
    }
    
    const player = selectedPlayerForDevelopment;
    availableSkills.innerHTML = '';
    
    // 显示可学习的技能
    Object.entries(Skills).forEach(([skillId, skill]) => {
        // 跳过已学会的技能
        if (player.skills.includes(skillId)) return;
        
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        
        // 检查是否正在学习
        const learning = player.learningSkills.find(s => s.id === skillId);
        if (learning) {
            skillItem.classList.add('learning');
        }
        
        // 检查是否满足学习条件
        const canLearn = player.checkSkillRequirements(skill);
        if (!canLearn) {
            skillItem.style.opacity = '0.6';
        }
        
        skillItem.innerHTML = `
            <div class="skill-name">${skill.name}</div>
            <div class="skill-description">${skill.description}</div>
            ${learning ? 
                `<div class="skill-progress">学习进度: ${learning.progress}/100</div>` :
                canLearn ? 
                    `<button class="learn-skill-btn" data-skill="${skillId}">学习</button>` :
                    '<div class="skill-requirements">不满足学习条件</div>'
            }
        `;
        
        // 添加学习按钮事件
        const learnBtn = skillItem.querySelector('.learn-skill-btn');
        if (learnBtn) {
            learnBtn.addEventListener('click', () => {
                const result = player.learnSkill(skillId);
                alert(result.message);
                if (result.success) {
                    updatePlayerDetails();
                    updateSkillOptions();
                }
            });
        }
        
        availableSkills.appendChild(skillItem);
    });
}

// 财务管理界面
function updateFinanceScreen() {
    const financeSummary = document.getElementById('finance-summary');
    const revenueBreakdown = document.getElementById('revenue-breakdown');
    const expensesBreakdown = document.getElementById('expenses-breakdown');
    
    // 获取财务报告
    const report = GameState.userTeam.getFinancialReport();
    
    // 更新财务概览
    financeSummary.innerHTML = `
        <div class="finance-item">
            <h4>当前资金</h4>
            <p>$${report.funds.toLocaleString()}</p>
        </div>
        <div class="finance-item">
            <h4>年度预算</h4>
            <p>$${report.budget.toLocaleString()}</p>
        </div>
        <div class="finance-item ${report.netIncome >= 0 ? 'positive' : 'negative'}">
            <h4>净收入</h4>
            <p>$${report.netIncome.toLocaleString()}</p>
        </div>
        <div class="finance-item ${report.budgetRemaining >= 0 ? 'positive' : 'negative'}">
            <h4>预算剩余</h4>
            <p>$${report.budgetRemaining.toLocaleString()}</p>
        </div>
        <div class="finance-item">
            <h4>奖学金使用</h4>
            <p>${report.scholarshipsUsed.toFixed(2)}/13</p>
        </div>
        <div class="finance-item">
            <h4>奖学金支出</h4>
            <p>$${report.scholarshipExpenses.toLocaleString()}</p>
        </div>
    `;
    
    // 更新收入明细
    revenueBreakdown.innerHTML = `
        <div class="breakdown-item">
            <span class="breakdown-label">比赛门票收入</span>
            <span class="breakdown-value">$${(GameState.userTeam.wins * 50000 + GameState.userTeam.losses * 30000).toLocaleString()}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">转播收入</span>
            <span class="breakdown-value">$${(GameState.userTeam.rank > 0 ? (20 - GameState.userTeam.rank) * 25000 : 250000).toLocaleString()}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">赞助收入</span>
            <span class="breakdown-value">$${(GameState.userTeam.wins * 10000).toLocaleString()}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">商品销售</span>
            <span class="breakdown-value">$100,000</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">总收入</span>
            <span class="breakdown-value positive">$${report.revenue.toLocaleString()}</span>
        </div>
    `;
    
    // 更新支出明细
    expensesBreakdown.innerHTML = `
        <div class="breakdown-item">
            <span class="breakdown-label">奖学金支出</span>
            <span class="breakdown-value">$${report.scholarshipExpenses.toLocaleString()}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">教练团队薪资</span>
            <span class="breakdown-value">$800,000</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">设施维护</span>
            <span class="breakdown-value">$500,000</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">差旅费用</span>
            <span class="breakdown-value">$${(GameState.userTeam.roster.length * 5000 + (GameState.userTeam.wins + GameState.userTeam.losses) * 10000).toLocaleString()}</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">装备费用</span>
            <span class="breakdown-value">$200,000</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">招募费用</span>
            <span class="breakdown-value">$150,000</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">总支出</span>
            <span class="breakdown-value negative">$${report.expenses.toLocaleString()}</span>
        </div>
    `;
    
    // 添加按钮事件
    const generateRevenueBtn = document.getElementById('generate-revenue-btn');
    const calculateExpensesBtn = document.getElementById('calculate-expenses-btn');
    
    // 移除旧的事件监听器
    const newGenerateBtn = generateRevenueBtn.cloneNode(true);
    const newCalculateBtn = calculateExpensesBtn.cloneNode(true);
    generateRevenueBtn.parentNode.replaceChild(newGenerateBtn, generateRevenueBtn);
    calculateExpensesBtn.parentNode.replaceChild(newCalculateBtn, calculateExpensesBtn);
    
    // 添加新的事件监听器
    newGenerateBtn.addEventListener('click', () => {
        const revenue = GameState.userTeam.generateRevenue();
        alert(`已生成本月收入：$${revenue.toLocaleString()}`);
        updateFinanceScreen();
    });
    
    newCalculateBtn.addEventListener('click', () => {
        const expenses = GameState.userTeam.calculateExpenses();
        alert(`已计算本月支出：$${expenses.toLocaleString()}`);
        updateFinanceScreen();
    });
}

// 球探系统
class ScoutingSystem {
    // 生成球探报告
    static generateScoutingReport(teamId) {
        const team = GameState.allTeams.find(t => t.id === teamId);
        if (!team) return null;
        
        // 检查预算
        const reportCost = 5000;
        if (GameState.scoutingUsed + reportCost > GameState.scoutingBudget) {
            return { success: false, message: "球探预算不足" };
        }
        
        // 扣除预算
        GameState.scoutingUsed += reportCost;
        
        // 生成报告
        const report = {
            id: Date.now(),
            teamId: teamId,
            teamName: team.name,
            date: new Date(),
            cost: reportCost,
            content: this.generateReportContent(team)
        };
        
        // 保存报告
        GameState.scoutingReports.push(report);
        
        // 缓存球队数据
        GameState.teamAnalysisData[teamId] = {
            lastScouted: new Date(),
            data: this.extractTeamData(team)
        };
        
        return { success: true, report };
    }
    
    // 生成报告内容
    static generateReportContent(team) {
        const teamStrength = team.getTeamStrength();
        const strengths = [];
        const weaknesses = [];
        
        // 分析球队优势
        if (teamStrength > 60) strengths.push("整体实力强劲");
        if (team.wins > team.losses) strengths.push("近期战绩出色");
        
        // 分析球队弱点
        if (teamStrength < 50) weaknesses.push("整体实力不足");
        if (team.wins < team.losses) weaknesses.push("近期战绩不佳");
        
        // 分析阵容深度
        const positions = Object.keys(Positions);
        let depthIssues = [];
        positions.forEach(pos => {
            const players = team.getPlayersByPosition(pos);
            if (players.length < 2) {
                depthIssues.push(`${Positions[pos]}位置深度不足`);
            }
        });
        
        if (depthIssues.length > 0) weaknesses.push(...depthIssues);
        
        // 生成报告文本
        let content = `<p><strong>球队实力评估：</strong>${teamStrength}/100</p>`;
        
        if (strengths.length > 0) {
            content += `<p><strong>优势：</strong></p><ul>`;
            strengths.forEach(s => content += `<li>${s}</li>`);
            content += `</ul>`;
        }
        
        if (weaknesses.length > 0) {
            content += `<p><strong>弱点：</strong></p><ul>`;
            weaknesses.forEach(w => content += `<li>${w}</li>`);
            content += `</ul>`;
        }
        
        // 添加关键球员信息
        const keyPlayers = this.identifyKeyPlayers(team);
        if (keyPlayers.length > 0) {
            content += `<p><strong>关键球员：</strong></p><ul>`;
            keyPlayers.forEach(player => {
                const rating = player.getScoutRating ? player.getScoutRating() : '未评价';
                const ratingColor = player.getScoutRatingColor ? player.getScoutRatingColor() : '#9E9E9E';
                const prodigyTag = player.isProdigy ? ' [天赋异禀]' : '';
                content += `<li>${player.name} (${Positions[player.position]}) - 综合评分: ${player.getOverallRating()} <span style="color: ${ratingColor}">(${rating})</span>${prodigyTag}</li>`;
            });
            content += `</ul>`;
        }
        
        return content;
    }
    
    // 识别关键球员
    static identifyKeyPlayers(team) {
        return team.roster
            .filter(player => player.getOverallRating() > 60)
            .sort((a, b) => b.getOverallRating() - a.getOverallRating())
            .slice(0, 3);
    }
    
    // 提取球队数据
    static extractTeamData(team) {
        const data = {
            teamId: team.id,
            teamName: team.name,
            teamStrength: team.getTeamStrength(),
            wins: team.wins,
            losses: team.losses,
            roster: team.roster.map(player => ({
                id: player.id,
                name: player.name,
                position: player.position,
                year: player.year,
                overallRating: player.getOverallRating(),
                attributes: { ...player.attributes },
                scholarship: player.scholarship
            })),
            lineupStrength: this.calculateLineupStrength(team)
        };
        
        return data;
    }
    
    // 计算阵容强度
    static calculateLineupStrength(team) {
        const lineup = team.getStartingLineup();
        let totalStrength = 0;
        let count = 0;
        
        for (const pos in lineup) {
            if (lineup[pos]) {
                totalStrength += lineup[pos].getOverallRating();
                count++;
            }
        }
        
        return count > 0 ? Math.round(totalStrength / count) : 0;
    }
    
    // 生成自由球员球探报告
    static generateFreeAgentsReport() {
        // 检查预算
        const reportCost = 3000;
        if (GameState.scoutingUsed + reportCost > GameState.scoutingBudget) {
            return { success: false, message: "球探预算不足" };
        }
        
        // 扣除预算
        GameState.scoutingUsed += reportCost;
        
        // 生成报告
        const report = {
            id: Date.now(),
            teamName: "自由球员",
            date: new Date(),
            cost: reportCost,
            content: this.generateFreeAgentsReportContent()
        };
        
        // 保存报告
        GameState.scoutingReports.push(report);
        
        return { success: true, report };
    }
    
    // 生成自由球员报告内容
    static generateFreeAgentsReportContent() {
        const players = GameState.availablePlayers;
        const totalPlayers = players.length;
        
        // 按潜力分组
        const elitePlayers = players.filter(p => p.potential >= 90);
        const goodPlayers = players.filter(p => p.potential >= 80 && p.potential < 90);
        const averagePlayers = players.filter(p => p.potential >= 70 && p.potential < 80);
        const belowAveragePlayers = players.filter(p => p.potential < 70);
        
        // 按位置分组
        const positionCounts = {};
        Object.keys(Positions).forEach(pos => {
            positionCounts[pos] = players.filter(p => p.position === parseInt(pos)).length;
        });
        
        // 生成报告文本
        let content = `<p><strong>自由球员市场概况：</strong>共${totalPlayers}名球员</p>`;
        
        content += `<p><strong>球员评级分布：</strong></p><ul>`;
        content += `<li>A级（精英球员）：${elitePlayers.length}名</li>`;
        content += `<li>B级（优秀球员）：${goodPlayers.length}名</li>`;
        content += `<li>C级（平均水平）：${averagePlayers.length}名</li>`;
        content += `<li>D级（低于平均）：${belowAveragePlayers.length}名</li>`;
        content += `</ul>`;
        
        content += `<p><strong>位置分布：</strong></p><ul>`;
        Object.entries(positionCounts).forEach(([pos, count]) => {
            content += `<li>${Positions[pos]}：${count}名</li>`;
        });
        content += `</ul>`;
        
        // 添加顶级自由球员信息
        const topPlayers = [...players].sort((a, b) => b.potential - a.potential).slice(0, 5);
        if (topPlayers.length > 0) {
            content += `<p><strong>顶级自由球员：</strong></p><ul>`;
            topPlayers.forEach(player => {
                const rating = player.getScoutRating();
                const ratingColor = player.getScoutRatingColor();
                const prodigyTag = player.isProdigy ? ' [天赋异禀]' : '';
                content += `<li>${player.name} (${Positions[player.position]}) - 潜力值: ${player.potential} <span style="color: ${ratingColor}">(${rating})</span>${prodigyTag}</li>`;
            });
            content += `</ul>`;
        }
        
        return content;
    }
}

// 分析师系统
class AnalystSystem {
    // 分析球队
    static analyzeTeam(teamId) {
        const teamData = GameState.teamAnalysisData[teamId];
        if (!teamData) {
            return { success: false, message: "没有该球队的球探数据，请先进行球探" };
        }
        
        const analysis = {
            teamId: teamId,
            teamName: teamData.data.teamName,
            date: new Date(),
            strengths: this.identifyStrengths(teamData.data),
            weaknesses: this.identifyWeaknesses(teamData.data),
            keyPlayers: this.identifyKeyPlayers(teamData.data),
            tacticalRecommendations: this.generateTacticalRecommendations(teamData.data)
        };
        
        return { success: true, analysis };
    }
    
    // 比较两支球队
    static compareTeams(teamId1, teamId2) {
        const data1 = GameState.teamAnalysisData[teamId1];
        const data2 = GameState.teamAnalysisData[teamId2];
        
        if (!data1 || !data2) {
            return { success: false, message: "缺少球队的球探数据，请先进行球探" };
        }
        
        const comparison = {
            team1: data1.data,
            team2: data2.data,
            date: new Date(),
            overallComparison: this.compareOverall(data1.data, data2.data),
            positionComparison: this.compareByPosition(data1.data, data2.data),
            prediction: this.predictMatchOutcome(data1.data, data2.data)
        };
        
        return { success: true, comparison };
    }
    
    // 识别球队优势
    static identifyStrengths(teamData) {
        const strengths = [];
        
        // 整体实力优势
        if (teamData.teamStrength > 65) {
            strengths.push({
                type: "整体实力",
                description: "球队整体实力强劲，各项能力均衡",
                level: "高"
            });
        } else if (teamData.teamStrength > 55) {
            strengths.push({
                type: "整体实力",
                description: "球队整体实力良好",
                level: "中"
            });
        }
        
        // 战绩优势
        if (teamData.wins > teamData.losses * 1.5) {
            strengths.push({
                type: "战绩表现",
                description: "球队近期战绩出色，士气高涨",
                level: "高"
            });
        }
        
        // 阵容深度优势
        const positionDepth = {};
        teamData.roster.forEach(player => {
            if (!positionDepth[player.position]) {
                positionDepth[player.position] = 0;
            }
            positionDepth[player.position]++;
        });
        
        const deepPositions = Object.keys(positionDepth).filter(pos => positionDepth[pos] >= 3);
        if (deepPositions.length > 0) {
            strengths.push({
                type: "阵容深度",
                description: `${deepPositions.map(pos => Positions[pos]).join("、")}位置深度充足`,
                level: "中"
            });
        }
        
        // 关键球员优势
        const elitePlayers = teamData.roster.filter(player => player.overallRating > 70);
        if (elitePlayers.length >= 2) {
            strengths.push({
                type: "核心球员",
                description: "拥有多名精英球员，关键时刻有稳定得分点",
                level: "高"
            });
        }
        
        return strengths;
    }
    
    // 识别球队弱点
    static identifyWeaknesses(teamData) {
        const weaknesses = [];
        
        // 整体实力弱点
        if (teamData.teamStrength < 45) {
            weaknesses.push({
                type: "整体实力",
                description: "球队整体实力不足，缺乏竞争力",
                level: "高"
            });
        } else if (teamData.teamStrength < 55) {
            weaknesses.push({
                type: "整体实力",
                description: "球队整体实力一般",
                level: "中"
            });
        }
        
        // 战绩弱点
        if (teamData.losses > teamData.wins * 1.5) {
            weaknesses.push({
                type: "战绩表现",
                description: "球队近期战绩不佳，士气低落",
                level: "高"
            });
        }
        
        // 阵容深度弱点
        const positionDepth = {};
        teamData.roster.forEach(player => {
            if (!positionDepth[player.position]) {
                positionDepth[player.position] = 0;
            }
            positionDepth[player.position]++;
        });
        
        const shallowPositions = Object.keys(positionDepth).filter(pos => positionDepth[pos] < 2);
        if (shallowPositions.length > 0) {
            weaknesses.push({
                type: "阵容深度",
                description: `${shallowPositions.map(pos => Positions[pos]).join("、")}位置深度不足`,
                level: "高"
            });
        }
        
        // 缺乏关键球员
        const elitePlayers = teamData.roster.filter(player => player.overallRating > 70);
        if (elitePlayers.length === 0) {
            weaknesses.push({
                type: "核心球员",
                description: "缺乏精英球员，关键时刻缺乏稳定得分点",
                level: "高"
            });
        }
        
        return weaknesses;
    }
    
    // 识别关键球员
    static identifyKeyPlayers(teamData) {
        return teamData.roster
            .filter(player => player.overallRating > 60)
            .sort((a, b) => b.overallRating - a.overallRating)
            .slice(0, 5)
            .map(player => ({
                name: player.name,
                position: Positions[player.position],
                rating: player.overallRating,
                role: this.determinePlayerRole(player)
            }));
    }
    
    // 确定球员角色
    static determinePlayerRole(player) {
        const { attributes } = player;
        
        if (attributes.scoring > 65 && attributes.stealing > 60) {
            return "得分手";
        } else if (attributes.passing > 65 && attributes.dribbling > 60) {
            return "组织者";
        } else if (attributes.defense > 65 && attributes.stealing > 60) {
            return "防守专家";
        } else if (attributes.rebounding > 65 && attributes.strength > 60) {
            return "内线支柱";
        } else if (attributes.threePointers > 65 && attributes.scoring > 60) {
            return "射手";
        } else {
            return "角色球员";
        }
    }
    
    // 生成战术建议
    static generateTacticalRecommendations(teamData) {
        const recommendations = [];
        
        // 基于球队实力的建议
        if (teamData.teamStrength > 60) {
            recommendations.push({
                type: "进攻策略",
                description: "球队实力强劲，可以采用多样化的进攻战术"
            });
        } else {
            recommendations.push({
                type: "进攻策略",
                description: "建议采用简单高效的进攻战术，减少失误"
            });
        }
        
        // 基于阵容的建议
        const tallPlayers = teamData.roster.filter(player => player.attributes.strength > 60);
        if (tallPlayers.length >= 2) {
            recommendations.push({
                type: "内线策略",
                description: "内线实力强劲，可以加强内线进攻"
            });
        }
        
        const shooters = teamData.roster.filter(player => player.attributes.threePointers > 60);
        if (shooters.length >= 3) {
            recommendations.push({
                type: "外线策略",
                description: "外线射手众多，可以增加三分投射"
            });
        }
        
        return recommendations;
    }
    
    // 比较整体实力
    static compareOverall(team1, team2) {
        const diff = team1.teamStrength - team2.teamStrength;
        
        if (diff > 15) {
            return { winner: 1, advantage: "明显优势", description: "球队1整体实力明显优于球队2" };
        } else if (diff > 5) {
            return { winner: 1, advantage: "轻微优势", description: "球队1整体实力略优于球队2" };
        } else if (diff < -15) {
            return { winner: 2, advantage: "明显劣势", description: "球队1整体实力明显劣于球队2" };
        } else if (diff < -5) {
            return { winner: 2, advantage: "轻微劣势", description: "球队1整体实力略劣于球队2" };
        } else {
            return { winner: 0, advantage: "势均力敌", description: "两队整体实力相当" };
        }
    }
    
    // 按位置比较
    static compareByPosition(team1, team2) {
        const positions = Object.keys(Positions);
        const comparison = {};
        
        positions.forEach(pos => {
            const players1 = team1.roster.filter(p => p.position === pos);
            const players2 = team2.roster.filter(p => p.position === pos);
            
            const avg1 = players1.length > 0 ? 
                players1.reduce((sum, p) => sum + p.overallRating, 0) / players1.length : 0;
            const avg2 = players2.length > 0 ? 
                players2.reduce((sum, p) => sum + p.overallRating, 0) / players2.length : 0;
            
            const diff = avg1 - avg2;
            
            if (diff > 10) {
                comparison[pos] = { winner: 1, advantage: "明显优势" };
            } else if (diff > 3) {
                comparison[pos] = { winner: 1, advantage: "轻微优势" };
            } else if (diff < -10) {
                comparison[pos] = { winner: 2, advantage: "明显劣势" };
            } else if (diff < -3) {
                comparison[pos] = { winner: 2, advantage: "轻微劣势" };
            } else {
                comparison[pos] = { winner: 0, advantage: "势均力敌" };
            }
        });
        
        return comparison;
    }
    
    // 预测比赛结果
    static predictMatchOutcome(team1, team2) {
        const overallComparison = this.compareOverall(team1, team2);
        const positionComparison = this.compareByPosition(team1, team2);
        
        // 计算各位置优势数量
        let team1Advantages = 0;
        let team2Advantages = 0;
        
        for (const pos in positionComparison) {
            if (positionComparison[pos].winner === 1) team1Advantages++;
            else if (positionComparison[pos].winner === 2) team2Advantages++;
        }
        
        // 综合评估
        let prediction;
        let confidence;
        
        if (overallComparison.winner === 1 && team1Advantages >= team2Advantages) {
            prediction = "球队1获胜";
            confidence = overallComparison.advantage === "明显优势" ? "高" : "中";
        } else if (overallComparison.winner === 2 && team2Advantages >= team1Advantages) {
            prediction = "球队2获胜";
            confidence = overallComparison.advantage === "明显劣势" ? "高" : "中";
        } else if (team1Advantages > team2Advantages) {
            prediction = "球队1获胜";
            confidence = "中";
        } else if (team2Advantages > team1Advantages) {
            prediction = "球队2获胜";
            confidence = "中";
        } else {
            prediction = "势均力敌";
            confidence = "低";
        }
        
        return {
            prediction,
            confidence,
            keyFactors: this.identifyKeyFactors(team1, team2, positionComparison)
        };
    }
    
    // 识别关键因素
    static identifyKeyFactors(team1, team2, positionComparison) {
        const factors = [];
        
        // 找出优势最明显的位置
        let maxAdvantage = 0;
        let keyPosition = null;
        let winner = null;
        
        for (const pos in positionComparison) {
            const players1 = team1.roster.filter(p => p.position === pos);
            const players2 = team2.roster.filter(p => p.position === pos);
            
            const avg1 = players1.length > 0 ? 
                players1.reduce((sum, p) => sum + p.overallRating, 0) / players1.length : 0;
            const avg2 = players2.length > 0 ? 
                players2.reduce((sum, p) => sum + p.overallRating, 0) / players2.length : 0;
            
            const diff = Math.abs(avg1 - avg2);
            
            if (diff > maxAdvantage) {
                maxAdvantage = diff;
                keyPosition = pos;
                winner = positionComparison[pos].winner;
            }
        }
        
        if (keyPosition && maxAdvantage > 10) {
            factors.push({
                factor: `${Positions[keyPosition]}位置对决`,
                description: `球队${winner}在${Positions[keyPosition]}位置有明显优势`,
                impact: "高"
            });
        }
        
        // 整体实力差异
        const overallDiff = Math.abs(team1.teamStrength - team2.teamStrength);
        if (overallDiff > 15) {
            factors.push({
                factor: "整体实力差异",
                description: "两队整体实力差距较大",
                impact: "高"
            });
        }
        
        return factors;
    }
    
    // 分析自由球员
    static analyzeFreeAgents() {
        const players = GameState.availablePlayers;
        
        if (players.length === 0) {
            return { success: false, message: "没有自由球员可供分析" };
        }
        
        // 按评级分组
        const elitePlayers = players.filter(p => p.getOverallRating() >= 85);
        const goodPlayers = players.filter(p => p.getOverallRating() >= 75 && p.getOverallRating() < 85);
        const averagePlayers = players.filter(p => p.getOverallRating() >= 65 && p.getOverallRating() < 75);
        const belowAveragePlayers = players.filter(p => p.getOverallRating() < 65);
        
        // 按位置分组
        const positionGroups = {};
        Object.keys(Positions).forEach(pos => {
            positionGroups[pos] = players.filter(p => p.position === parseInt(pos));
        });
        
        // 识别顶级球员
        const topPlayers = [...players].sort((a, b) => b.getOverallRating() - a.getOverallRating()).slice(0, 5);
        
        const analysis = {
            title: "自由球员市场分析",
            date: new Date(),
            summary: {
                totalPlayers: players.length,
                eliteCount: elitePlayers.length,
                goodCount: goodPlayers.length,
                averageCount: averagePlayers.length,
                belowAverageCount: belowAveragePlayers.length,
                positionDistribution: positionGroups
            },
            topPlayers: topPlayers.map(player => ({
                name: player.name,
                position: Positions[player.position],
                rating: player.getOverallRating(),
                role: this.determinePlayerRole(player),
                scoutRating: player.getScoutRating(),
                isProdigy: player.isProdigy
            })),
            recommendations: this.generateFreeAgentRecommendations(positionGroups)
        };
        
        return { success: true, analysis };
    }
    
    // 分析所有球员
    static analyzeAllPlayers(positionFilter = '') {
        // 收集所有球员
        const allPlayers = [];
        
        // 添加用户球队球员
        GameState.userTeam.roster.forEach(player => {
            allPlayers.push({ ...player, team: GameState.userTeam.name, teamType: 'user' });
        });
        
        // 添加其他球队球员
        GameState.allTeams.forEach(team => {
            if (!team.isUserTeam) {
                team.roster.forEach(player => {
                    allPlayers.push({ ...player, team: team.name, teamType: 'ai' });
                });
            }
        });
        
        // 添加自由球员
        GameState.availablePlayers.forEach(player => {
            allPlayers.push({ ...player, team: '自由球员', teamType: 'free' });
        });
        
        // 应用位置过滤器
        const filteredPlayers = positionFilter ? 
            allPlayers.filter(player => player.position === parseInt(positionFilter)) : 
            allPlayers;
        
        if (filteredPlayers.length === 0) {
            return { success: false, message: "没有符合条件的球员" };
        }
        
        // 按潜力排序
        filteredPlayers.sort((a, b) => b.potential - a.potential);
        
        // 按潜力分组
        const elitePlayers = filteredPlayers.filter(p => p.potential >= 90);
        const goodPlayers = filteredPlayers.filter(p => p.potential >= 80 && p.potential < 90);
        const averagePlayers = filteredPlayers.filter(p => p.potential >= 70 && p.potential < 80);
        const belowAveragePlayers = filteredPlayers.filter(p => p.potential < 70);
        
        // 按球队类型分组
        const userPlayers = filteredPlayers.filter(p => p.teamType === 'user');
        const aiPlayers = filteredPlayers.filter(p => p.teamType === 'ai');
        const freePlayers = filteredPlayers.filter(p => p.teamType === 'free');
        
        // 识别顶级球员
        const topPlayers = filteredPlayers.slice(0, 10);
        
        const analysis = {
            title: `所有球员分析${positionFilter ? ` - ${Positions[parseInt(positionFilter)]}` : ''}`,
            date: new Date(),
            summary: {
                totalPlayers: filteredPlayers.length,
                eliteCount: elitePlayers.length,
                goodCount: goodPlayers.length,
                averageCount: averagePlayers.length,
                belowAverageCount: belowAveragePlayers.length,
                userCount: userPlayers.length,
                aiCount: aiPlayers.length,
                freeCount: freePlayers.length
            },
            topPlayers: topPlayers.map(player => ({
                name: player.name,
                team: player.team,
                position: Positions[player.position],
                rating: player.getOverallRating(),
                role: this.determinePlayerRole(player),
                scoutRating: player.getScoutRating(),
                isProdigy: player.isProdigy
            })),
            recommendations: this.generateAllPlayersRecommendations(topPlayers)
        };
        
        return { success: true, analysis };
    }
    
    // 生成自由球员市场建议
    static generateFreeAgentRecommendations(positionGroups) {
        const recommendations = [];
        
        // 分析每个位置的球员数量
        Object.entries(positionGroups).forEach(([pos, players]) => {
            const avgRating = players.length > 0 ? 
                players.reduce((sum, p) => sum + p.getOverallRating(), 0) / players.length : 0;
            
            if (players.length < 3) {
                recommendations.push({
                    type: "阵容补强",
                    description: `${Positions[pos]}位置自由球员稀少，建议尽快签约`
                });
            }
            
            if (avgRating > 75) {
                recommendations.push({
                    type: "机会",
                    description: `${Positions[pos]}位置有高质量自由球员可用，是补强阵容的好机会`
                });
            }
        });
        
        return recommendations;
    }
    
    // 生成所有球员分析建议
    static generateAllPlayersRecommendations(topPlayers) {
        const recommendations = [];
        
        // 分析顶级球员分布
        const userTopPlayers = topPlayers.filter(p => p.teamType === 'user');
        const aiTopPlayers = topPlayers.filter(p => p.teamType === 'ai');
        const freeTopPlayers = topPlayers.filter(p => p.teamType === 'free');
        
        if (freeTopPlayers.length > 0) {
            recommendations.push({
                type: "引援建议",
                description: `市场上有${freeTopPlayers.length}名顶级自由球员，建议考虑签约`
            });
        }
        
        if (userTopPlayers.length < 3 && aiTopPlayers.length > 5) {
            recommendations.push({
                type: "竞争力分析",
                description: "您的球队顶级球员数量相对较少，可能需要加强阵容"
            });
        }
        
        return recommendations;
    }
}

// 球探分析界面更新函数
function updateScoutingScreen() {
    // 更新球队选择器
    updateTeamSelector();
    
    // 更新球探预算显示
    document.getElementById('scouting-budget').textContent = `$${GameState.scoutingBudget.toLocaleString()}`;
    document.getElementById('scouting-used').textContent = `$${GameState.scoutingUsed.toLocaleString()}`;
    
    // 更新球探报告列表
    updateScoutingReports();
    
    // 设置标签页切换事件
    setupTabSwitching();
    
    // 设置球探和分析按钮事件
    setupScoutingButtons();
    
    // 设置视图切换事件
    setupViewToggle();
}

// 更新球队选择器
function updateTeamSelector() {
    const teamSelect = document.getElementById('team-select');
    const teamCompare1 = document.getElementById('team-compare-1');
    const teamCompare2 = document.getElementById('team-compare-2');
    
    // 清空现有选项
    teamSelect.innerHTML = '<option value="">请选择球队...</option>';
    teamCompare1.innerHTML = '<option value="">选择第一支球队...</option>';
    teamCompare2.innerHTML = '<option value="">选择第二支球队...</option>';
    
    // 添加球队选项（排除用户球队）
    GameState.allTeams.forEach(team => {
        if (!team.isUserTeam) {
            const option1 = document.createElement('option');
            option1.value = team.id;
            option1.textContent = team.name;
            teamSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = team.id;
            option2.textContent = team.name;
            teamCompare1.appendChild(option2);
            
            const option3 = document.createElement('option');
            option3.value = team.id;
            option3.textContent = team.name;
            teamCompare2.appendChild(option3);
        }
    });
    
    // 添加球队选择事件
    teamSelect.addEventListener('change', () => {
        const teamId = parseInt(teamSelect.value);
        if (teamId) {
            displayTeamRoster(teamId);
        } else {
            document.getElementById('roster-details').innerHTML = '';
        }
    });
}

// 显示球队阵容
function displayTeamRoster(teamId) {
    const team = GameState.allTeams.find(t => t.id === teamId);
    if (!team) return;
    
    const rosterDetails = document.getElementById('roster-details');
    
    // 检查是否有球探数据
    const hasScoutingData = GameState.teamAnalysisData[teamId] !== undefined;
    
    if (!hasScoutingData) {
        rosterDetails.innerHTML = `
            <div class="no-data-message">
                <p>没有该球队的球探数据</p>
                <p>请先使用球探功能收集该球队的信息</p>
            </div>
        `;
        return;
    }
    
    // 显示球员阵容
    const teamData = GameState.teamAnalysisData[teamId].data;
    let html = '';
    
    teamData.roster.forEach(player => {
        // 创建球员对象以获取球探评级
        const playerObj = new Player(player.name, player.position, 20, player.attributes);
        playerObj.isProdigy = playerObj.potential > 85; // 高潜力球员标记为天赋异禀
        
        html += `
            <div class="player-card">
                <h4>${player.name} <span class="position">${Positions[player.position]}</span> <span class="year">${player.year === 1 ? '新生' : player.year === 2 ? '大二' : player.year === 3 ? '大三' : '大四'}</span> ${playerObj.isProdigy ? '<span class="prodigy-tag">天赋异禀</span>' : ''}</h4>
                <p>潜力值: ${playerObj.potential} <span class="scout-rating" style="color: ${playerObj.getScoutRatingColor()}">(${playerObj.getScoutRating()})</span></p>
                <p>当前能力: ${player.overallRating}</p>
                <p>教练加成: ${team.coach ? `+${team.coach.calculateDevelopmentBonus(playerObj)}点` : '无教练'}</p>
                <p>奖学金: ${player.scholarship === 1.0 ? '全额' : player.scholarship === 0.75 ? '75%' : player.scholarship === 0.5 ? '50%' : player.scholarship === 0.25 ? '25%' : '自费'}</p>
                
                <div class="player-attributes-mini">
                    ${Object.entries(PlayerAttributes).map(([key, name]) => `
                        <div class="attribute-bar-mini">
                            <span class="attribute-name">${name}:</span>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${player.attributes[key]}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    rosterDetails.innerHTML = html;
}

// 显示自由球员
function displayFreeAgents() {
    const rosterDetails = document.getElementById('roster-details');
    
    if (GameState.availablePlayers.length === 0) {
        rosterDetails.innerHTML = '<p>当前没有自由球员</p>';
        return;
    }
    
    let html = '';
    GameState.availablePlayers.forEach(player => {
        // 计算阵容适配度
        const fitReport = RosterFitCalculator.generateFitReport(player, GameState.userTeam);
        const fitColor = fitReport.overall >= 80 ? '#4CAF50' : 
                        fitReport.overall >= 60 ? '#2196F3' : 
                        fitReport.overall >= 40 ? '#FF9800' : '#F44336';
        
        html += `
            <div class="player-card">
                <h4>${player.name} <span class="position">${Positions[player.position]}</span> <span class="year">${player.year === 1 ? '新生' : player.year === 2 ? '大二' : player.year === 3 ? '大三' : '大四'}</span> ${player.isProdigy ? '<span class="prodigy-tag">天赋异禀</span>' : ''}</h4>
                <p>潜力值: ${player.potential} <span class="scout-rating" style="color: ${player.getScoutRatingColor()}">(${player.getScoutRating()})</span></p>
                <p>当前能力: ${player.getOverallRating()}</p>
                <p>期望年薪: $${(player.potential * 10000).toLocaleString()}</p>
                <p>阵容适配度: <span style="color: ${fitColor}; font-weight: bold;">${fitReport.overall}%</span> - ${fitReport.recommendation}</p>
                
                <div class="talents-section">
                    <h5>天赋:</h5>
                    ${player.talents.length > 0 ? 
                        player.talents.map(talentId => `
                            <div class="talent-item ${PlayerTalents[talentId].rarity}">
                                <span class="talent-name">${PlayerTalents[talentId].name}</span>
                                <span class="talent-rarity">${player.getRarityName(PlayerTalents[talentId].rarity)}</span>
                            </div>
                        `).join('') : 
                        '<p class="no-talents">无特殊天赋</p>'
                    }
                </div>
                
                <div class="growth-section">
                    <h5>成长路径:</h5>
                    <div class="growth-curve">${player.getGrowthCurve() === 'exponential' ? '大器晚成' : player.getGrowthCurve() === 'logarithmic' ? '天才' : '标准成长'}</div>
                    <div class="growth-points">成长点数: ${player.growthPoints}</div>
                </div>
                
                <div class="fit-details">
                    <div class="fit-item">
                        <span class="fit-label">位置适配:</span>
                        <div class="fit-bar">
                            <div class="fit-fill" style="width: ${fitReport.position}%; background-color: ${fitReport.position >= 70 ? '#4CAF50' : fitReport.position >= 50 ? '#FF9800' : '#F44336'}"></div>
                        </div>
                        <span class="fit-value">${fitReport.position}%</span>
                    </div>
                    <div class="fit-item">
                        <span class="fit-label">战术适配:</span>
                        <div class="fit-bar">
                            <div class="fit-fill" style="width: ${fitReport.tactical}%; background-color: ${fitReport.tactical >= 70 ? '#4CAF50' : fitReport.tactical >= 50 ? '#FF9800' : '#F44336'}"></div>
                        </div>
                        <span class="fit-value">${fitReport.tactical}%</span>
                    </div>
                    <div class="fit-item">
                        <span class="fit-label">教练适配:</span>
                        <div class="fit-bar">
                            <div class="fit-fill" style="width: ${fitReport.coach}%; background-color: ${fitReport.coach >= 70 ? '#4CAF50' : fitReport.coach >= 50 ? '#FF9800' : '#F44336'}"></div>
                        </div>
                        <span class="fit-value">${fitReport.coach}%</span>
                    </div>
                    <div class="fit-item">
                        <span class="fit-label">薪资匹配:</span>
                        <div class="fit-bar">
                            <div class="fit-fill" style="width: ${fitReport.salary}%; background-color: ${fitReport.salary >= 70 ? '#4CAF50' : fitReport.salary >= 50 ? '#FF9800' : '#F44336'}"></div>
                        </div>
                        <span class="fit-value">${fitReport.salary}%</span>
                    </div>
                    <div class="fit-item">
                        <span class="fit-label">化学反应:</span>
                        <div class="fit-bar">
                            <div class="fit-fill" style="width: ${fitReport.chemistry}%; background-color: ${fitReport.chemistry >= 70 ? '#4CAF50' : fitReport.chemistry >= 50 ? '#FF9800' : '#F44336'}"></div>
                        </div>
                        <span class="fit-value">${fitReport.chemistry}%</span>
                    </div>
                </div>
                
                <div class="player-attributes-mini">
                    ${Object.entries(PlayerAttributes).map(([key, name]) => `
                        <div class="attribute-bar-mini">
                            <span class="attribute-name">${name}:</span>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${player.attributes[key]}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    rosterDetails.innerHTML = html;
}

// 显示所有球员
function displayAllPlayers(positionFilter = '') {
    const rosterDetails = document.getElementById('roster-details');
    
    // 收集所有球员
    const allPlayers = [];
    
    // 添加用户球队球员
    GameState.userTeam.roster.forEach(player => {
        allPlayers.push({ ...player, team: GameState.userTeam.name });
    });
    
    // 添加其他球队球员
    GameState.allTeams.forEach(team => {
        if (!team.isUserTeam) {
            team.roster.forEach(player => {
                allPlayers.push({ ...player, team: team.name });
            });
        }
    });
    
    // 添加自由球员
    GameState.availablePlayers.forEach(player => {
        allPlayers.push({ ...player, team: '自由球员' });
    });
    
    // 应用位置过滤器
    const filteredPlayers = positionFilter ? 
        allPlayers.filter(player => player.position === parseInt(positionFilter)) : 
        allPlayers;
    
    // 按评分排序
    filteredPlayers.sort((a, b) => b.getOverallRating() - a.getOverallRating());
    
    if (filteredPlayers.length === 0) {
        rosterDetails.innerHTML = '<p>没有符合条件的球员</p>';
        return;
    }
    
    let html = '';
    filteredPlayers.forEach(player => {
        html += `
            <div class="player-card">
                <h4>${player.name} <span class="position">${Positions[player.position]}</span> <span class="year">${player.year === 1 ? '新生' : player.year === 2 ? '大二' : player.year === 3 ? '大三' : '大四'}</span> ${player.isProdigy ? '<span class="prodigy-tag">天赋异禀</span>' : ''}</h4>
                <p>球队: ${player.team}</p>
                <p>潜力值: ${player.potential} <span class="scout-rating" style="color: ${player.getScoutRatingColor()}">(${player.getScoutRating()})</span></p>
                
                <div class="player-attributes-mini">
                    ${Object.entries(PlayerAttributes).map(([key, name]) => `
                        <div class="attribute-bar-mini">
                            <span class="attribute-name">${name}:</span>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${player.attributes[key]}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    rosterDetails.innerHTML = html;
}

// 更新球探报告
function updateScoutingReports() {
    const reportsContainer = document.getElementById('reports-container');
    
    if (GameState.scoutingReports.length === 0) {
        reportsContainer.innerHTML = '<p>暂无球探报告</p>';
        return;
    }
    
    // 按日期排序（最新的在前）
    const sortedReports = [...GameState.scoutingReports].sort((a, b) => b.date - a.date);
    
    let html = '';
    sortedReports.forEach(report => {
        const reportDate = new Date(report.date);
        const dateStr = `${reportDate.getFullYear()}-${(reportDate.getMonth() + 1).toString().padStart(2, '0')}-${reportDate.getDate().toString().padStart(2, '0')}`;
        
        html += `
            <div class="report-card">
                <h4>${report.teamName}</h4>
                <div class="report-date">${dateStr}</div>
                <div class="report-content">${report.content}</div>
            </div>
        `;
    });
    
    reportsContainer.innerHTML = html;
}

// 设置标签页切换
function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // 移除所有活动状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 添加活动状态
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// 设置球探和分析按钮事件
function setupScoutingButtons() {
    // 移除旧的事件监听器
    const scoutButton = document.getElementById('scout-selected-team');
    const newScoutButton = scoutButton.cloneNode(true);
    scoutButton.parentNode.replaceChild(newScoutButton, scoutButton);
    
    const scoutFreeAgentsButton = document.getElementById('scout-free-agents');
    const newScoutFreeAgentsButton = scoutFreeAgentsButton.cloneNode(true);
    scoutFreeAgentsButton.parentNode.replaceChild(newScoutFreeAgentsButton, scoutFreeAgentsButton);
    
    const refreshButton = document.getElementById('refresh-scouting-data');
    const newRefreshButton = refreshButton.cloneNode(true);
    refreshButton.parentNode.replaceChild(newRefreshButton, refreshButton);
    
    const analyzeButton = document.getElementById('analyze-selected-team');
    const newAnalyzeButton = analyzeButton.cloneNode(true);
    analyzeButton.parentNode.replaceChild(newAnalyzeButton, analyzeButton);
    
    const compareButton = document.getElementById('compare-teams');
    const newCompareButton = compareButton.cloneNode(true);
    compareButton.parentNode.replaceChild(newCompareButton, compareButton);
    
    // 球探选中的球队
    newScoutButton.addEventListener('click', () => {
        const teamSelect = document.getElementById('team-select');
        const teamId = parseInt(teamSelect.value);
        
        if (!teamId) {
            alert('请先选择要球探的球队');
            return;
        }
        
        const result = ScoutingSystem.generateScoutingReport(teamId);
        if (result.success) {
            alert(`成功生成${result.report.teamName}的球探报告`);
            updateScoutingReports();
            displayTeamRoster(teamId); // 更新阵容显示
        } else {
            alert(result.message);
        }
    });
    
    // 球探自由球员
    newScoutFreeAgentsButton.addEventListener('click', () => {
        const result = ScoutingSystem.generateFreeAgentsReport();
        if (result.success) {
            alert(`成功生成自由球员球探报告`);
            updateScoutingReports();
            displayFreeAgents(); // 更新自由球员显示
        } else {
            alert(result.message);
        }
    });
    
    // 刷新球探数据
    newRefreshButton.addEventListener('click', () => {
        alert('球探数据已刷新');
        updateScoutingScreen();
    });
    
    // 分析选中的球队
    newAnalyzeButton.addEventListener('click', () => {
        const viewType = document.querySelector('input[name="view-type"]:checked').value;
        
        if (viewType === 'team') {
            const teamSelect = document.getElementById('team-select');
            const teamId = parseInt(teamSelect.value);
            
            if (!teamId) {
                alert('请先选择要分析的球队');
                return;
            }
            
            const result = AnalystSystem.analyzeTeam(teamId);
            if (result.success) {
                displayAnalysisResult(result.analysis);
            } else {
                alert(result.message);
            }
        } else if (viewType === 'free-agents') {
            const result = AnalystSystem.analyzeFreeAgents();
            if (result.success) {
                displayAnalysisResult(result.analysis);
            } else {
                alert(result.message);
            }
        } else if (viewType === 'all-players') {
            const positionFilter = document.getElementById('position-filter').value;
            const result = AnalystSystem.analyzeAllPlayers(positionFilter);
            if (result.success) {
                displayAnalysisResult(result.analysis);
            } else {
                alert(result.message);
            }
        }
    });
    
    // 比较两支球队
    newCompareButton.addEventListener('click', () => {
        const team1Id = parseInt(document.getElementById('team-compare-1').value);
        const team2Id = parseInt(document.getElementById('team-compare-2').value);
        
        if (!team1Id || !team2Id) {
            alert('请选择两支要比较的球队');
            return;
        }
        
        if (team1Id === team2Id) {
            alert('不能比较同一支球队');
            return;
        }
        
        const result = AnalystSystem.compareTeams(team1Id, team2Id);
        if (result.success) {
            displayComparisonResult(result.comparison);
        } else {
            alert(result.message);
        }
    });
}

// 设置视图切换
function setupViewToggle() {
    const viewRadios = document.querySelectorAll('input[name="view-type"]');
    const teamSelect = document.getElementById('team-select');
    const positionFilter = document.getElementById('position-filter');
    const rosterTitle = document.querySelector('#selected-team-roster h3');
    
    viewRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const viewType = radio.value;
            
            if (viewType === 'team') {
                teamSelect.style.display = 'block';
                positionFilter.style.display = 'none';
                rosterTitle.textContent = '球队阵容';
                displayTeamRoster(parseInt(teamSelect.value) || null);
            } else if (viewType === 'free-agents') {
                teamSelect.style.display = 'none';
                positionFilter.style.display = 'none';
                rosterTitle.textContent = '自由球员';
                displayFreeAgents();
            } else if (viewType === 'all-players') {
                teamSelect.style.display = 'none';
                positionFilter.style.display = 'block';
                rosterTitle.textContent = '所有球员';
                displayAllPlayers(positionFilter.value);
            }
        });
    });
}

// 显示分析结果
function displayAnalysisResult(analysis) {
    const analysisContainer = document.getElementById('analysis-container');
    
    // 检查是否是自由球员或所有球员分析
    if (analysis.title) {
        // 自由球员或所有球员分析
        let html = `
            <div class="analysis-section">
                <h4>${analysis.title}</h4>
                <p>分析日期: ${new Date(analysis.date).toLocaleDateString()}</p>
            </div>
            
            <div class="analysis-section">
                <h4>球员分布</h4>
                <p>总球员数: ${analysis.summary.totalPlayers}</p>
                <p>A级（精英球员）: ${analysis.summary.eliteCount}名</p>
                <p>B级（优秀球员）: ${analysis.summary.goodCount}名</p>
                <p>C级（平均水平）: ${analysis.summary.averageCount}名</p>
                <p>D级（低于平均）: ${analysis.summary.belowAverageCount}名</p>
                ${analysis.summary.userCount !== undefined ? `<p>您的球队球员: ${analysis.summary.userCount}名</p>` : ''}
                ${analysis.summary.aiCount !== undefined ? `<p>其他球队球员: ${analysis.summary.aiCount}名</p>` : ''}
                ${analysis.summary.freeCount !== undefined ? `<p>自由球员: ${analysis.summary.freeCount}名</p>` : ''}
            </div>
            
            <div class="analysis-section">
                <h4>顶级球员</h4>
                ${analysis.topPlayers.length > 0 ? 
                    `<table>
                        <tr>
                            <th>球员</th>
                            <th>球队</th>
                            <th>位置</th>
                            <th>潜力值</th>
                            <th>评级</th>
                            <th>角色</th>
                        </tr>
                        ${analysis.topPlayers.map(p => `
                            <tr>
                                <td>${p.name}${p.isProdigy ? ' [天赋异禀]' : ''}</td>
                                <td>${p.team}</td>
                                <td>${p.position}</td>
                                <td>${p.rating}</td>
                                <td><span style="color: ${p.scoutRating === 'A' ? '#4CAF50' : p.scoutRating === 'B' ? '#2196F3' : p.scoutRating === 'C' ? '#FF9800' : '#F44336'}">${p.scoutRating}</span></td>
                                <td>${p.role}</td>
                            </tr>
                        `).join('')}
                    </table>` : 
                    '<p>无顶级球员</p>'
                }
            </div>
            
            <div class="analysis-section">
                <h4>建议</h4>
                ${analysis.recommendations.length > 0 ? 
                    analysis.recommendations.map(r => `
                        <div class="strength-item">
                            <strong>${r.type}：</strong> ${r.description}
                        </div>
                    `).join('') : 
                    '<p>暂无建议</p>'
                }
            </div>
        `;
        
        analysisContainer.innerHTML = html;
        return;
    }
    
    // 球队分析（原有逻辑）
    let html = `
        <div class="analysis-section">
            <h4>球队优势</h4>
            ${analysis.strengths.length > 0 ? 
                analysis.strengths.map(s => `
                    <div class="strength-item">
                        <strong>${s.type} (${s.level})：</strong> ${s.description}
                    </div>
                `).join('') : 
                '<p>无明显优势</p>'
            }
        </div>
        
        <div class="analysis-section">
            <h4>球队弱点</h4>
            ${analysis.weaknesses.length > 0 ? 
                analysis.weaknesses.map(w => `
                    <div class="weakness-item">
                        <strong>${w.type} (${w.level})：</strong> ${w.description}
                    </div>
                `).join('') : 
                '<p>无明显弱点</p>'
            }
        </div>
        
        <div class="analysis-section">
            <h4>关键球员</h4>
            ${analysis.keyPlayers.length > 0 ? 
                `<table>
                    <tr>
                        <th>球员</th>
                        <th>位置</th>
                        <th>评分</th>
                        <th>角色</th>
                    </tr>
                    ${analysis.keyPlayers.map(p => `
                        <tr>
                            <td>${p.name}</td>
                            <td>${p.position}</td>
                            <td>${p.rating}</td>
                            <td>${p.role}</td>
                        </tr>
                    `).join('')}
                </table>` : 
                '<p>无明显关键球员</p>'
            }
        </div>
        
        <div class="analysis-section">
            <h4>战术建议</h4>
            ${analysis.tacticalRecommendations.length > 0 ? 
                analysis.tacticalRecommendations.map(r => `
                    <div class="strength-item">
                        <strong>${r.type}：</strong> ${r.description}
                    </div>
                `).join('') : 
                '<p>暂无战术建议</p>'
            }
        </div>
    `;
    
    analysisContainer.innerHTML = html;
}

// 更新教练市场屏幕
function updateCoachMarketScreen() {
    // 更新市场信息
    const refreshDate = new Date(GameState.coachMarketRefreshDate);
    document.getElementById('market-refresh-date').textContent = refreshDate.toLocaleDateString();
    document.getElementById('available-coaches-count').textContent = GameState.availableCoaches.length;
    
    // 显示教练列表
    displayCoachList();
    
    // 设置筛选和刷新按钮事件
    setupCoachMarketButtons();
}

// 显示教练列表
function displayCoachList(archetypeFilter = '', salaryFilter = '') {
    const coachList = document.getElementById('coach-list');
    
    // 应用筛选条件
    let filteredCoaches = [...GameState.availableCoaches];
    
    if (archetypeFilter) {
        filteredCoaches = filteredCoaches.filter(coach => coach.archetype === archetypeFilter);
    }
    
    if (salaryFilter) {
        if (salaryFilter === 'low') {
            filteredCoaches = filteredCoaches.filter(coach => coach.contract.salary < 500000);
        } else if (salaryFilter === 'medium') {
            filteredCoaches = filteredCoaches.filter(coach => coach.contract.salary >= 500000 && coach.contract.salary < 1000000);
        } else if (salaryFilter === 'high') {
            filteredCoaches = filteredCoaches.filter(coach => coach.contract.salary >= 1000000);
        }
    }
    
    if (filteredCoaches.length === 0) {
        coachList.innerHTML = '<p>没有符合条件的教练</p>';
        return;
    }
    
    let html = '';
    filteredCoaches.forEach(coach => {
        const archetypeData = CoachArchetypes[coach.archetype];
        const teamFit = coach.calculateTeamFit(GameState.userTeam);
        const fitColor = teamFit >= 80 ? '#4CAF50' : teamFit >= 60 ? '#2196F3' : teamFit >= 40 ? '#FF9800' : '#F44336';
        
        html += `
            <div class="coach-card">
                <h3>
                    ${coach.name}
                    <span class="archetype-tag">${archetypeData.name}</span>
                </h3>
                
                <div class="coach-archetype">
                    <h4>${archetypeData.name}</h4>
                    <p>${archetypeData.description}</p>
                    <div class="coach-focus">
                        <h5>专长属性:</h5>
                        <ul>
                            ${archetypeData.attributeFocus.map(attr => `
                                <li>${coach.getAttributeDisplayName(attr)}: ${coach.attributes[attr]}</li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="coach-preferences">
                        <h5>偏好战术:</h5>
                        <ul>
                            ${archetypeData.preferredPlayStyles.map(style => `
                                <li>${coach.getPlayStyleName(style)}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="coach-stats">
                    <div class="coach-stat-item">
                        <span class="coach-stat-label">年龄:</span>
                        <span class="coach-stat-value">${coach.age}</span>
                    </div>
                    <div class="coach-stat-item">
                        <span class="coach-stat-label">经验:</span>
                        <span class="coach-stat-value">${coach.experience}年</span>
                    </div>
                    <div class="coach-stat-item">
                        <span class="coach-stat-label">声誉:</span>
                        <span class="coach-stat-value">${coach.reputation}</span>
                    </div>
                    <div class="coach-stat-item">
                        <span class="coach-stat-label">年薪:</span>
                        <span class="coach-stat-value">$${(coach.contract.salary / 10000).toFixed(0)}万</span>
                    </div>
                    <div class="coach-stat-item">
                        <span class="coach-stat-label">合同:</span>
                        <span class="coach-stat-value">${coach.contract.years}年</span>
                    </div>
                    <div class="coach-stat-item">
                        <span class="coach-stat-label">战绩:</span>
                        <span class="coach-stat-value">${coach.record.totalWins}胜${coach.record.totalLosses}负</span>
                    </div>
                </div>
                
                <div class="coach-fit-score">
                    <p>与您的球队适配度: <span style="color: ${fitColor}; font-weight: bold;">${teamFit}%</span></p>
                    <div class="fit-score-bar">
                        <div class="fit-score-fill" style="width: ${teamFit}%; background-color: ${fitColor};"></div>
                    </div>
                </div>
                
                <div class="coach-actions">
                    <button class="sign-coach-btn" data-coach-id="${coach.id}">签约教练</button>
                    <button class="secondary view-details-btn" data-coach-id="${coach.id}">查看详情</button>
                </div>
            </div>
        `;
    });
    
    coachList.innerHTML = html;
    
    // 添加签约和查看详情按钮事件
    document.querySelectorAll('.sign-coach-btn').forEach(button => {
        button.addEventListener('click', () => {
            const coachId = parseInt(button.dataset.coachId);
            signCoach(coachId);
        });
    });
    
    document.querySelectorAll('.view-details-btn').forEach(button => {
        button.addEventListener('click', () => {
            const coachId = parseInt(button.dataset.coachId);
            viewCoachDetails(coachId);
        });
    });
}

// 设置教练市场按钮事件
function setupCoachMarketButtons() {
    // 刷新按钮
    const refreshButton = document.getElementById('refresh-coach-market');
    const newRefreshButton = refreshButton.cloneNode(true);
    refreshButton.parentNode.replaceChild(newRefreshButton, refreshButton);
    
    newRefreshButton.addEventListener('click', () => {
        refreshCoachMarket();
        updateCoachMarketScreen();
        alert('教练市场已刷新');
    });
    
    // 筛选按钮
    const archetypeFilter = document.getElementById('archetype-filter');
    const salaryFilter = document.getElementById('salary-filter');
    
    // 移除旧的事件监听器
    const newArchetypeFilter = archetypeFilter.cloneNode(true);
    archetypeFilter.parentNode.replaceChild(newArchetypeFilter, archetypeFilter);
    
    const newSalaryFilter = salaryFilter.cloneNode(true);
    salaryFilter.parentNode.replaceChild(newSalaryFilter, salaryFilter);
    
    // 添加新的事件监听器
    newArchetypeFilter.addEventListener('change', () => {
        displayCoachList(newArchetypeFilter.value, newSalaryFilter.value);
    });
    
    newSalaryFilter.addEventListener('change', () => {
        displayCoachList(newArchetypeFilter.value, newSalaryFilter.value);
    });
}

// 签约教练
function signCoach(coachId) {
    const coach = GameState.availableCoaches.find(c => c.id === coachId);
    
    if (!coach) {
        alert('教练不存在');
        return;
    }
    
    // 检查是否已经有教练
    if (GameState.userCoach) {
        alert('您已经有教练了，需要先解雇现有教练');
        return;
    }
    
    // 检查资金是否足够
    if (GameState.userTeam.funds < coach.contract.salary) {
        alert('资金不足，无法签约该教练');
        return;
    }
    
    // 确认签约
    const confirmSign = confirm(`确定要签约${coach.name}吗？\n年薪: $${(coach.contract.salary / 10000).toFixed(0)}万\n合同年限: ${coach.contract.years}年`);
    
    if (confirmSign) {
        // 扣除资金
        GameState.userTeam.funds -= coach.contract.salary;
        
        // 设置教练
        coach.teamId = GameState.userTeam.id;
        GameState.userCoach = coach;
        GameState.userTeam.setCoach(coach);
        
        // 从市场移除
        GameState.availableCoaches = GameState.availableCoaches.filter(c => c.id !== coachId);
        
        // 更新UI
        updateCoachMarketScreen();
        updateTeamManagementScreen();
        
        alert(`成功签约${coach.name}！`);
    }
}

// 查看教练详情
function viewCoachDetails(coachId) {
    const coach = GameState.availableCoaches.find(c => c.id === coachId);
    
    if (!coach) {
        alert('教练不存在');
        return;
    }
    
    const archetypeData = CoachArchetypes[coach.archetype];
    const teamFit = coach.calculateTeamFit(GameState.userTeam);
    
    const details = `
        教练详情
        
        姓名: ${coach.name}
        类型: ${archetypeData.name}
        年龄: ${coach.age}
        执教经验: ${coach.experience}年
        声誉: ${coach.reputation}/100
        
        执教记录:
        总战绩: ${coach.record.totalWins}胜${coach.record.totalLosses}负
        冠军次数: ${coach.record.championships}
        
        合同信息:
        年薪: $${(coach.contract.salary / 10000).toFixed(0)}万
        合同年限: ${coach.contract.years}年
        
        教练属性:
        进攻能力: ${coach.attributes.offense}/99
        防守能力: ${coach.attributes.defense}/99
        激励能力: ${coach.attributes.motivation}/99
        纪律管理: ${coach.attributes.discipline}/99
        球员发展: ${coach.attributes.development}/99
        招募能力: ${coach.attributes.recruiting}/99
        
        战术倾向:
        节奏控制: ${coach.tendencies.tempo}/100
        三分倾向: ${coach.tendencies.threePointFocus}/100
        内线倾向: ${coach.tendencies.insideFocus}/100
        防守强度: ${coach.tendencies.defenseAggression}/100
        快攻倾向: ${coach.tendencies.fastBreak}/100
        
        与您的球队适配度: ${teamFit}%
        
        ${archetypeData.description}
    `;
    
    alert(details);
}

// 添加球探按钮事件监听器
document.getElementById('scouting-btn').addEventListener('click', () => {
    // 移除所有活动状态
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    
    // 添加当前活动状态
    document.getElementById('scouting-btn').classList.add('active');
    document.getElementById('scouting').classList.add('active');
    
    // 更新屏幕内容
    updateScoutingScreen();
});

// 添加教练市场按钮事件监听器
document.getElementById('coach-market-btn').addEventListener('click', () => {
    // 移除所有活动状态
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    
    // 添加当前活动状态
    document.getElementById('coach-market-btn').classList.add('active');
    document.getElementById('coach-market').classList.add('active');
    
    // 更新屏幕内容
    updateCoachMarketScreen();
});

// 显示比较结果
function displayComparisonResult(comparison) {
    const analysisContainer = document.getElementById('analysis-container');
    
    const team1Name = comparison.team1.teamName;
    const team2Name = comparison.team2.teamName;
    
    let html = `
        <div class="analysis-section">
            <h4>整体实力比较</h4>
            <p>${comparison.overallComparison.description}</p>
            <p><strong>评估结果：</strong> ${comparison.overallComparison.advantage}</p>
        </div>
        
        <div class="analysis-section">
            <h4>位置比较</h4>
            <table>
                <tr>
                    <th>位置</th>
                    <th>${team1Name}</th>
                    <th>${team2Name}</th>
                    <th>优势</th>
                </tr>
                ${Object.entries(comparison.positionComparison).map(([pos, comp]) => {
                    const team1Avg = comparison.team1.roster.filter(p => p.position === pos).length > 0 ? 
                        Math.round(comparison.team1.roster.filter(p => p.position === pos).reduce((sum, p) => sum + p.overallRating, 0) / comparison.team1.roster.filter(p => p.position === pos).length) : 0;
                    const team2Avg = comparison.team2.roster.filter(p => p.position === pos).length > 0 ? 
                        Math.round(comparison.team2.roster.filter(p => p.position === pos).reduce((sum, p) => sum + p.overallRating, 0) / comparison.team2.roster.filter(p => p.position === pos).length) : 0;
                    
                    return `
                        <tr>
                            <td>${Positions[pos]}</td>
                            <td>${team1Avg}</td>
                            <td>${team2Avg}</td>
                            <td>
                                <span class="advantage-indicator ${comp.winner === 1 ? 'advantage' : comp.winner === 2 ? 'disadvantage' : 'neutral'}">
                                    ${comp.winner === 1 ? team1Name : comp.winner === 2 ? team2Name : '势均力敌'} (${comp.advantage})
                                </span>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </table>
        </div>
        
        <div class="analysis-section">
            <h4>比赛预测</h4>
            <p><strong>预测结果：</strong> ${comparison.prediction.prediction}</p>
            <p><strong>预测信心：</strong> ${comparison.prediction.confidence}</p>
            
            <h5>关键因素</h5>
            ${comparison.prediction.keyFactors.length > 0 ? 
                comparison.prediction.keyFactors.map(f => `
                    <div class="${f.impact === '高' ? 'strength-item' : 'weakness-item'}">
                        <strong>${f.factor} (${f.impact})：</strong> ${f.description}
                    </div>
                `).join('') : 
                '<p>无明显关键因素</p>'
            }
        </div>
    `;
    
    analysisContainer.innerHTML = html;
}