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
    
    // Team constants
    MAX_SCHOLARSHIPS: 5,
    MIN_ROSTER_SIZE: 8,
    MAX_ROSTER_SIZE: 15,
    
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

// Conference data - 替换为CBA联赛分区
// Conference data - 替换为CBA联赛分区
const Conferences = {
    'CBA-North': {
        id: 'CBA-North',
        name: 'CBA北区',
        teams: ['辽宁本钢', '北京首钢', '山东高速', '吉林九台农商银行', '山西汾酒股份', '天津先行者', '青岛国信海天', '新疆广汇']
    },
    'CBA-South': {
        id: 'CBA-South',
        name: 'CBA南区',
        teams: ['广东宏远', '浙江稠州银行', '上海久事', '深圳马可波罗', '广州龙狮', '福建浔兴股份', '江苏肯帝亚', '四川金强']
    },
    'CBA-East': {
        id: 'CBA-East',
        name: 'CBA东区',
        teams: ['浙江广厦', '南京同曦宙光', '宁波富邦', '苏州肯帝亚', '上海大鲨鱼', '福建豹发力', '青岛每日优鲜', '山东王者']
    },
    'CBA-West': {
        id: 'CBA-West',
        name: 'CBA西区',
        teams: ['新疆伊力特', '四川五粮金樽', '重庆华熙国际', '陕西信达', '甘肃农垦', '宁夏哈纳斯', '青海三江源', '西藏净土']
    }
};

// Team names - 替换为CBA球队数据
// Team names - 替换为CBA球队数据
const TeamNames = {
    'CBA-North': {
        '辽宁本钢': { id: 1, prestige: 95, funds: 25000000, city: '沈阳', arena: '辽宁体育馆' },
        '北京首钢': { id: 2, prestige: 94, funds: 24000000, city: '北京', arena: '首钢体育馆' },
        '山东高速': { id: 3, prestige: 90, funds: 22000000, city: '济南', arena: '山东省体育中心' },
        '吉林九台农商银行': { id: 4, prestige: 85, funds: 20000000, city: '长春', arena: '长春市体育馆' },
        '山西汾酒股份': { id: 5, prestige: 80, funds: 18000000, city: '太原', arena: '山西省体育中心' },
        '天津先行者': { id: 6, prestige: 78, funds: 17000000, city: '天津', arena: '天津体育馆' },
        '青岛国信海天': { id: 7, prestige: 82, funds: 19000000, city: '青岛', arena: '青岛国信体育中心' },
        '新疆广汇': { id: 8, prestige: 75, funds: 16000000, city: '乌鲁木齐', arena: '红山体育中心' }
    },
    'CBA-South': {
        '广东宏远': { id: 9, prestige: 96, funds: 26000000, city: '东莞', arena: '东莞篮球中心' },
        '浙江稠州银行': { id: 10, prestige: 91, funds: 22500000, city: '义乌', arena: '义乌梅湖体育中心' },
        '上海久事': { id: 11, prestige: 88, funds: 21000000, city: '上海', arena: '源深体育中心' },
        '深圳马可波罗': { id: 12, prestige: 82, funds: 19000000, city: '深圳', arena: '深圳大运中心' },
        '广州龙狮': { id: 13, prestige: 80, funds: 18000000, city: '广州', arena: '天河体育中心' },
        '福建浔兴股份': { id: 14, prestige: 79, funds: 17500000, city: '晋江', arena: '祖昌体育馆' },
        '江苏肯帝亚': { id: 15, prestige: 81, funds: 18500000, city: '南京', arena: '五台山体育中心' },
        '四川金强': { id: 16, prestige: 75, funds: 16000000, city: '成都', arena: '四川省体育馆' }
    },
    'CBA-East': {
        '浙江广厦': { id: 17, prestige: 92, funds: 23000000, city: '杭州', arena: '杭州体育馆' },
        '南京同曦宙光': { id: 18, prestige: 87, funds: 20500000, city: '南京', arena: '南京青奥体育公园' },
        '宁波富邦': { id: 19, prestige: 90, funds: 22000000, city: '宁波', arena: '宁波市体育中心' },
        '苏州肯帝亚': { id: 20, prestige: 86, funds: 20000000, city: '苏州', arena: '苏州市体育中心' },
        '上海大鲨鱼': { id: 21, prestige: 84, funds: 19500000, city: '上海', arena: '东方体育中心' },
        '福建豹发力': { id: 22, prestige: 78, funds: 17000000, city: '福州', arena: '福建省体育馆' },
        '青岛每日优鲜': { id: 23, prestige: 80, funds: 18000000, city: '青岛', arena: '青岛大学体育馆' },
        '山东王者': { id: 24, prestige: 74, funds: 15500000, city: '烟台', arena: '烟台体育公园' }
    },
    'CBA-West': {
        '新疆伊力特': { id: 25, prestige: 93, funds: 23500000, city: '乌鲁木齐', arena: '新疆体育中心' },
        '四川五粮金樽': { id: 26, prestige: 89, funds: 21500000, city: '宜宾', arena: '宜宾市体育中心' },
        '重庆华熙国际': { id: 27, prestige: 83, funds: 19000000, city: '重庆', arena: '重庆体育馆' },
        '陕西信达': { id: 28, prestige: 79, funds: 17500000, city: '西安', arena: '陕西省体育场' },
        '甘肃农垦': { id: 29, prestige: 76, funds: 16500000, city: '兰州', arena: '兰州体育馆' },
        '宁夏哈纳斯': { id: 30, prestige: 77, funds: 17000000, city: '银川', arena: '宁夏体育馆' },
        '青海三江源': { id: 31, prestige: 73, funds: 15000000, city: '西宁', arena: '青海省体育馆' },
        '西藏净土': { id: 32, prestige: 70, funds: 14000000, city: '拉萨', arena: '西藏自治区体育馆' }
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