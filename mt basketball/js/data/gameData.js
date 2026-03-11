/**
 * Game data structures and constants
 * Contains all the game's static data and configurations
 */

// Player positions
// Player positions
const Positions = {
    PG: '控球后卫',
    SG: '得分后卫',
    SF: '小前锋',
    PF: '大前锋',
    C: '中锋'
};

// Player attributes
// Player attributes
const PlayerAttributes = {
    // Offensive attributes
    scoring: '得分',
    shooting: '投篮',
    threePoint: '三分',
    freeThrow: '罚球',
    
    // Playmaking attributes
    passing: '传球',
    dribbling: '运球',
    
    // Defensive attributes
    defense: '防守',
    rebounding: '篮板',
    stealing: '抢断',
    blocking: '盖帽',
    
    // Physical attributes
    speed: '速度',
    stamina: '体力',
    strength: '力量',
    
    // Mental attributes
    basketballIQ: '篮球智商'
};

// Skills system
// Skills system
const Skills = {
    // Offensive skills
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
            { type: 'attribute', attribute: 'dribbling', value: 5 },
            { type: 'attribute', attribute: 'scoring', value: 4 }
        ]
    },
    'post_scoring': {
        id: 'post_scoring',
        name: '内线得分',
        description: '提升内线得分能力',
        requirements: [
            { type: 'attribute', attribute: 'strength', value: 60 },
            { type: 'year', value: 2 }
        ],
        effects: [
            { type: 'attribute', attribute: 'scoring', value: 5 },
            { type: 'attribute', attribute: 'strength', value: 3 }
        ]
    },
    
    // Defensive skills
    'lockdown_defender': {
        id: 'lockdown_defender',
        name: '防守专家',
        description: '提升单防和协防能力',
        requirements: [
            { type: 'attribute', attribute: 'defense', value: 60 },
            { type: 'year', value: 2 }
        ],
        effects: [
            { type: 'attribute', attribute: 'defense', value: 6 },
            { type: 'attribute', attribute: 'stealing', value: 3 }
        ]
    },
    'rim_protector': {
        id: 'rim_protector',
        name: '护筐者',
        description: '提升盖帽和防守篮板能力',
        requirements: [
            { type: 'attribute', attribute: 'blocking', value: 50 },
            { type: 'attribute', attribute: 'rebounding', value: 60 },
            { type: 'year', value: 2 }
        ],
        effects: [
            { type: 'attribute', attribute: 'blocking', value: 6 },
            { type: 'attribute', attribute: 'rebounding', value: 4 }
        ]
    },
    
    // Playmaking skills
    'floor_general': {
        id: 'floor_general',
        name: '球场指挥官',
        description: '提升组织能力和视野',
        requirements: [
            { type: 'attribute', attribute: 'passing', value: 60 },
            { type: 'attribute', attribute: 'basketballIQ', value: 60 },
            { type: 'year', value: 2 }
        ],
        effects: [
            { type: 'attribute', attribute: 'passing', value: 6 },
            { type: 'attribute', attribute: 'basketballIQ', value: 4 }
        ]
    },
    
    // Physical skills
    'iron_man': {
        id: 'iron_man',
        name: '铁人',
        description: '提升体力和耐力',
        requirements: [
            { type: 'attribute', attribute: 'stamina', value: 60 },
            { type: 'year', value: 2 }
        ],
        effects: [
            { type: 'attribute', attribute: 'stamina', value: 8 }
        ]
    },
    'explosive_athlete': {
        id: 'explosive_athlete',
        name: '爆发型运动员',
        description: '提升速度和力量',
        requirements: [
            { type: 'attribute', attribute: 'speed', value: 60 },
            { type: 'attribute', attribute: 'strength', value: 50 },
            { type: 'year', value: 2 }
        ],
        effects: [
            { type: 'attribute', attribute: 'speed', value: 5 },
            { type: 'attribute', attribute: 'strength', value: 4 }
        ]
    }
};

// Player talents
// Player talents
const PlayerTalents = {
    // Offensive talents
    'sharpshooter': {
        id: 'sharpshooter',
        name: '神射手',
        description: '天生的射手，投篮能力出众',
        rarity: 'rare',
        attributeBonuses: {
            shooting: 5,
            threePoint: 8,
            freeThrow: 4
        },
        overallBonus: 3
    },
    'scorer_instinct': {
        id: 'scorer_instinct',
        name: '得分本能',
        description: '天生的得分能力，擅长各种得分方式',
        rarity: 'rare',
        attributeBonuses: {
            scoring: 7,
            shooting: 3
        },
        overallBonus: 3
    },
    'playmaker': {
        id: 'playmaker',
        name: '组织者',
        description: '天生的组织能力，善于传球和创造机会',
        rarity: 'rare',
        attributeBonuses: {
            passing: 8,
            dribbling: 5,
            basketballIQ: 4
        },
        overallBonus: 3
    },
    
    // Defensive talents
    'defensive_anchor': {
        id: 'defensive_anchor',
        name: '防守核心',
        description: '天生的防守能力，是球队防守的核心',
        rarity: 'rare',
        attributeBonuses: {
            defense: 7,
            rebounding: 5,
            blocking: 4
        },
        overallBonus: 3
    },
    'ball_hawk': {
        id: 'ball_hawk',
        name: '抢断专家',
        description: '天生的抢断能力，善于预判和抢断',
        rarity: 'common',
        attributeBonuses: {
            stealing: 8,
            defense: 3
        },
        overallBonus: 2
    },
    
    // Physical talents
    'athlete': {
        id: 'athlete',
        name: '运动员',
        description: '天生的身体素质，速度和力量出众',
        rarity: 'common',
        attributeBonuses: {
            speed: 6,
            strength: 6,
            stamina: 3
        },
        overallBonus: 2
    },
    'workhorse': {
        id: 'workhorse',
        name: '工作狂',
        description: '天生的体力，能够长时间保持高水平表现',
        rarity: 'common',
        attributeBonuses: {
            stamina: 8
        },
        overallBonus: 1
    },
    
    // Mental talents
    'high_basketball_iq': {
        id: 'high_basketball_iq',
        name: '高篮球智商',
        description: '天生的篮球理解能力，善于阅读比赛',
        rarity: 'common',
        attributeBonuses: {
            basketballIQ: 8,
            passing: 3
        },
        overallBonus: 2
    },
    'clutch_performer': {
        id: 'clutch_performer',
        name: '关键先生',
        description: '关键时刻能够发挥出色',
        rarity: 'rare',
        attributeBonuses: {
            shooting: 5,
            freeThrow: 5,
            basketballIQ: 3
        },
        overallBonus: 3
    },
    
    // Legendary talents
    'once_in_a_generation': {
        id: 'once_in_a_generation',
        name: '一代天才',
        description: '百年一遇的篮球天才，各项能力都极为出众',
        rarity: 'legendary',
        attributeBonuses: {
            scoring: 8,
            shooting: 6,
            threePoint: 6,
            passing: 6,
            dribbling: 6,
            defense: 6,
            rebounding: 6,
            stealing: 4,
            blocking: 4,
            speed: 6,
            stamina: 5,
            strength: 5,
            basketballIQ: 8
        },
        overallBonus: 10
    }
};

// Coach archetypes
// Coach archetypes
const CoachArchetypes = {
    'offensive': {
        id: 'offensive',
        name: '进攻型',
        description: '专注于进攻战术和得分能力',
        attributeFocus: ['offense', 'development'],
        preferredPlayStyles: ['fast-break', 'outside-shooting', 'high-tempo'],
        attributeBonuses: {
            offense: 10,
            defense: -5,
            recruiting: 5,
            development: 5,
            motivation: 0
        },
        salaryRange: [800000, 1500000]
    },
    'defensive': {
        id: 'defensive',
        name: '防守型',
        description: '专注于防守战术和限制对手得分',
        attributeFocus: ['defense', 'motivation'],
        preferredPlayStyles: ['half-court', 'inside-scoring', 'low-tempo'],
        attributeBonuses: {
            offense: -5,
            defense: 10,
            recruiting: 5,
            development: 0,
            motivation: 5
        },
        salaryRange: [700000, 1200000]
    },
    'balanced': {
        id: 'balanced',
        name: '均衡型',
        description: '攻防均衡，没有明显弱点',
        attributeFocus: ['recruiting', 'motivation'],
        preferredPlayStyles: ['balanced', 'flexible'],
        attributeBonuses: {
            offense: 3,
            defense: 3,
            recruiting: 7,
            development: 3,
            motivation: 4
        },
        salaryRange: [600000, 1000000]
    },
    'developmental': {
        id: 'developmental',
        name: '培养型',
        description: '专注于球员发展和潜力挖掘',
        attributeFocus: ['development', 'recruiting'],
        preferredPlayStyles: ['balanced', 'team-oriented'],
        attributeBonuses: {
            offense: 0,
            defense: 0,
            recruiting: 8,
            development: 10,
            motivation: 2
        },
        salaryRange: [500000, 900000]
    },
    'veteran': {
        id: 'veteran',
        name: '老练型',
        description: '经验丰富，善于激励和管理球队',
        attributeFocus: ['motivation', 'offense'],
        preferredPlayStyles: ['experienced', 'disciplined'],
        attributeBonuses: {
            offense: 5,
            defense: 5,
            recruiting: 3,
            development: 2,
            motivation: 10
        },
        salaryRange: [900000, 1500000]
    }
};

// Team tactics
// Team tactics
const Tactics = {
    'fast-break': {
        id: 'fast-break',
        name: '快攻',
        description: '强调快速转换和进攻节奏',
        bonuses: {
            speed: 5,
            scoring: 3,
            defense: -2
        }
    },
    'half-court': {
        id: 'half-court',
        name: '半场进攻',
        description: '强调阵地战和战术执行',
        bonuses: {
            basketballIQ: 5,
            passing: 3,
            speed: -2
        }
    },
    'outside-shooting': {
        id: 'outside-shooting',
        name: '外线投篮',
        description: '强调三分和远投',
        bonuses: {
            threePoint: 8,
            shooting: 4,
            rebounding: -3
        }
    },
    'inside-scoring': {
        id: 'inside-scoring',
        name: '内线得分',
        description: '强调内线进攻和篮板',
        bonuses: {
            rebounding: 6,
            strength: 5,
            threePoint: -4
        }
    },
    'balanced': {
        id: 'balanced',
        name: '均衡',
        description: '攻防均衡，没有明显侧重',
        bonuses: {
            // No significant bonuses or penalties
        }
    },
    'defensive-focus': {
        id: 'defensive-focus',
        name: '防守专注',
        description: '强调防守和限制对手',
        bonuses: {
            defense: 8,
            rebounding: 3,
            scoring: -3
        }
    }
};

// Game constants
// Game constants
const GameConstants = {
    // Season constants
    SEASONS_PER_YEAR: 1,
    GAMES_PER_SEASON: 30,
    CONFERENCE_GAMES_PER_SEASON: 18,
    
    // Team constants - 参考NCAA D1规则
    MAX_SCHOLARSHIPS: 5,         // 每队最多5份全额奖学金等效名额
    MIN_ROSTER_SIZE: 11,         // 最少11人
    MAX_ROSTER_SIZE: 15,         // 最多15人
    OPTIMAL_ROSTER_SIZE: 13,     // 最佳阵容规模
    
    // Player constants
    MIN_PLAYER_AGE: 17,
    MAX_PLAYER_AGE: 23,
    MIN_PLAYER_POTENTIAL: 50,
    MAX_PLAYER_POTENTIAL: 99,
    
    // Coach constants
    MIN_COACH_AGE: 30,
    MAX_COACH_AGE: 70,
    MIN_COACH_SALARY: 200000,
    MAX_COACH_SALARY: 2000000,
    
    // Financial constants
    INITIAL_FUNDS: 1000000,
    MIN_FUNDS: 100000,
    SCOUTING_BUDGET: 50000,
    
    // Training constants
    TRAINING_INTENSITY_MIN: 0.5,
    TRAINING_INTENSITY_MAX: 2.0,
    TRAINING_PROGRESS_MAX: 100,
    
    // Game simulation constants
    QUARTER_LENGTH: 10, // minutes
    GAME_LENGTH: 40, // minutes
    OT_LENGTH: 5, // minutes
    MAX_OT_PERIODS: 4,
    
    // UI constants
    ANIMATION_DURATION: 300, // milliseconds
    MODAL_FAIN_DURATION: 200 // milliseconds
};

// Conference data - 世界名校篮球联赛分区
const Conferences = {
    'Asia-Pacific': {
        id: 'Asia-Pacific',
        name: '中亚赛区',
        teams: ['北京大学', '清华大学', '东京大学', '首尔大学', '新加坡国立', '香港大学', '台湾大学', '早稻田大学']
    },
    'Europe': {
        id: 'Europe',
        name: '欧洲赛区',
        teams: ['牛津大学', '剑桥大学', '帝国理工', '伦敦政经', '巴黎高师', '慕尼黑工大', '苏黎世联邦', '代尔夫特理工']
    },
    'Americas': {
        id: 'Americas',
        name: '美洲赛区',
        teams: ['哈佛大学', '麻省理工', '斯坦福大学', '耶鲁大学', '普林斯顿', '加州理工', '芝加哥大学', '多伦多大学']
    },
    'Wild-Card': {
        id: 'Wild-Card',
        name: '外卡赛区',
        teams: ['悉尼大学', '墨尔本大学', '开普敦大学', '开罗大学', '耶路撒冷希伯来', '伊斯坦布尔大学', '奥克兰大学', '圣保罗大学']
    }
};

// Team names - 世界名校篮球队数据
const TeamNames = {
    'Asia-Pacific': {
        '北京大学': { id: 1, prestige: 92, funds: 22000000, city: '北京', arena: '北大体育馆' },
        '清华大学': { id: 2, prestige: 94, funds: 24000000, city: '北京', arena: '清华紫荆体育馆' },
        '东京大学': { id: 3, prestige: 88, funds: 20000000, city: '东京', arena: '东大安田体育馆' },
        '首尔大学': { id: 4, prestige: 85, funds: 19000000, city: '首尔', arena: '首尔大体育馆' },
        '新加坡国立': { id: 5, prestige: 87, funds: 21000000, city: '新加坡', arena: '国大体育中心' },
        '香港大学': { id: 6, prestige: 84, funds: 18000000, city: '香港', arena: '港大体育馆' },
        '台湾大学': { id: 7, prestige: 82, funds: 17000000, city: '台北', arena: '台大小巨蛋' },
        '早稻田大学': { id: 8, prestige: 86, funds: 19500000, city: '东京', arena: '早稻田体育馆' }
    },
    'Europe': {
        '牛津大学': { id: 9, prestige: 96, funds: 26000000, city: '牛津', arena: '牛津大学体育馆' },
        '剑桥大学': { id: 10, prestige: 95, funds: 25000000, city: '剑桥', arena: '剑桥体育中心' },
        '帝国理工': { id: 11, prestige: 91, funds: 23000000, city: '伦敦', arena: '帝国理工体育馆' },
        '伦敦政经': { id: 12, prestige: 89, funds: 22000000, city: '伦敦', arena: 'LSE体育中心' },
        '巴黎高师': { id: 13, prestige: 90, funds: 22500000, city: '巴黎', arena: '巴黎高师体育馆' },
        '慕尼黑工大': { id: 14, prestige: 88, funds: 21000000, city: '慕尼黑', arena: 'TUM体育馆' },
        '苏黎世联邦': { id: 15, prestige: 93, funds: 24000000, city: '苏黎世', arena: 'ETH体育中心' },
        '代尔夫特理工': { id: 16, prestige: 87, funds: 20000000, city: '代尔夫特', arena: 'TUD体育馆' }
    },
    'Americas': {
        '哈佛大学': { id: 17, prestige: 98, funds: 28000000, city: '波士顿', arena: '哈佛体育馆' },
        '麻省理工': { id: 18, prestige: 97, funds: 27000000, city: '波士顿', arena: 'MIT体育中心' },
        '斯坦福大学': { id: 19, prestige: 96, funds: 26000000, city: '斯坦福', arena: '斯坦福体育馆' },
        '耶鲁大学': { id: 20, prestige: 95, funds: 25000000, city: '纽黑文', arena: '耶鲁体育中心' },
        '普林斯顿': { id: 21, prestige: 94, funds: 24500000, city: '普林斯顿', arena: '普林斯顿体育馆' },
        '加州理工': { id: 22, prestige: 92, funds: 23000000, city: '帕萨迪纳', arena: 'Caltech体育馆' },
        '芝加哥大学': { id: 23, prestige: 91, funds: 22500000, city: '芝加哥', arena: '芝大体育中心' },
        '多伦多大学': { id: 24, prestige: 89, funds: 21000000, city: '多伦多', arena: '多大体育馆' }
    },
    'Wild-Card': {
        '悉尼大学': { id: 25, prestige: 88, funds: 20000000, city: '悉尼', arena: '悉尼大体育馆' },
        '墨尔本大学': { id: 26, prestige: 87, funds: 19500000, city: '墨尔本', arena: '墨大体育中心' },
        '开普敦大学': { id: 27, prestige: 82, funds: 17000000, city: '开普敦', arena: '开普敦大体育馆' },
        '开罗大学': { id: 28, prestige: 80, funds: 16000000, city: '开罗', arena: '开罗大体育馆' },
        '耶路撒冷希伯来': { id: 29, prestige: 85, funds: 18500000, city: '耶路撒冷', arena: '希伯来体育馆' },
        '伊斯坦布尔大学': { id: 30, prestige: 83, funds: 17500000, city: '伊斯坦布尔', arena: '伊斯坦布尔体育馆' },
        '奥克兰大学': { id: 31, prestige: 84, funds: 18000000, city: '奥克兰', arena: '奥大体育中心' },
        '圣保罗大学': { id: 32, prestige: 86, funds: 19000000, city: '圣保罗', arena: '圣保罗大体育馆' }
    }
};

// Player names for generation
// Player names for generation
const FirstNames = [
    '詹姆斯', '迈克尔', '科比', '勒布朗', '斯蒂芬', '凯文', '德克', '蒂姆', '沙奎尔', '阿伦',
    '保罗', '德怀恩', '卡梅隆', '克里斯', '拉塞尔', '约翰', '安东尼', '布雷克', '凯里', '戈登',
    '布拉德利', '朱利叶斯', '德安吉洛', '贾维尔', '埃里克', '贾巴里', '阿龙', '泰瑞斯', '贾伦', '杰森',
    '泰勒', '布兰登', '德里克', '马克', '贾斯汀', '特雷', '多诺万', '本', '贾马尔', '帕斯卡尔',
    '扎克', '尼古拉斯', '克里斯蒂安', '迈尔斯', '小贾伦', '朗佐', '马克尔', '达龙', '马利克', '约什'
];

const LastNames = [
    '詹姆斯', '乔丹', '布莱恩特', '约翰逊', '库里', '杜兰特', '诺维茨基', '邓肯', '奥尼尔', '艾弗森',
    '保罗', '韦德', '安东尼', '波什', '威斯布鲁克', '沃尔', '戴维斯', '格里芬', '欧文', '海沃德',
    '比尔', '兰德尔', '拉塞尔', '麦基', '戈登', '帕克', '戈登', '福克斯', '杰克逊', '塔图姆',
    '希罗', '英格拉姆', '罗斯', '加索尔', '温斯洛', '杨', '米切尔', '西蒙斯', '穆雷', '西亚卡姆',
    '拉文', '武切维奇', '伍德', '巴恩斯', '鲍尔', '富尔茨', '福克斯', '史密斯', '蒙克', '哈特'
];