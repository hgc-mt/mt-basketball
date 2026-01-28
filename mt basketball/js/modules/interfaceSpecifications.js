/**
 * Interface Specifications
 * 定义系统中所有功能模块的接口规范
 */

/**
 * 接口基础类
 * 所有接口必须继承此类
 */
class BaseInterface {
    constructor() {
        this.interfaceName = 'BaseInterface';
        this.version = '1.0.0';
    }

    /**
     * 获取接口名称
     * @returns {string} 接口名称
     */
    getName() {
        return this.interfaceName;
    }

    /**
     * 获取接口版本
     * @returns {string} 接口版本
     */
    getVersion() {
        return this.version;
    }

    /**
     * 验证接口实现
     * @returns {boolean} 是否有效
     */
    validate() {
        return true;
    }
}

/**
 * 接口规范定义
 */
const InterfaceSpecs = {
    // 奖学金计算接口
    IScholarshipCalculator: {
        name: 'IScholarshipCalculator',
        version: '1.0.0',
        description: '奖学金计算接口',
        methods: {
            calculateUsedShare: {
                description: '计算已使用的奖学金份额',
                input: { team: 'Team对象' },
                output: { share: 'number, 已使用的奖学金份额' },
                errors: ['TEAM_NOT_FOUND', 'INVALID_TEAM']
            },
            calculateAvailableShare: {
                description: '计算可用的奖学金份额',
                input: { team: 'Team对象' },
                output: { share: 'number, 可用的奖学金份额' },
                errors: ['TEAM_NOT_FOUND', 'INVALID_TEAM']
            },
            validateScholarshipAvailability: {
                description: '验证奖学金可用性',
                input: { 
                    player: 'Player对象', 
                    team: 'Team对象' 
                },
                output: { 
                    canSign: 'boolean, 是否可以签约',
                    currentUsed: 'number, 当前已使用份额',
                    playerShare: 'number, 球员需要的份额',
                    wouldBeUsed: 'number, 签约后总使用份额',
                    availableAfter: 'number, 签约后可用份额',
                    reason: 'string, 原因说明'
                },
                errors: ['PLAYER_NOT_FOUND', 'TEAM_NOT_FOUND', 'INVALID_DATA']
            }
        }
    },

    // 赛程管理接口
    IScheduleManager: {
        name: 'IScheduleManager',
        version: '1.0.0',
        description: '赛程管理接口',
        methods: {
            generateSchedule: {
                description: '生成赛季赛程',
                input: { 
                    teams: 'Array<Team>, 所有球队',
                    startDate: 'Date, 赛季开始日期' 
                },
                output: { 
                    schedule: 'Array<Game>, 赛程数组',
                    totalGames: 'number, 总比赛场数'
                },
                errors: ['INVALID_TEAMS', 'INVALID_DATE', 'GENERATION_FAILED']
            },
            syncDates: {
                description: '同步赛程日期',
                input: { 
                    currentDate: 'Date, 当前游戏日期',
                    schedule: 'Array<Game>, 赛程数组' 
                },
                output: { 
                    success: 'boolean, 是否成功',
                    updatedCount: 'number, 更新的比赛数量'
                },
                errors: ['INVALID_DATE', 'INVALID_SCHEDULE', 'SYNC_FAILED']
            },
            getNextGame: {
                description: '获取下一场比赛',
                input: { 
                    teamId: 'number, 球队ID',
                    schedule: 'Array<Game>, 赛程数组' 
                },
                output: { 
                    game: 'Game, 下一场比赛对象',
                    daysUntil: 'number, 距离比赛天数'
                },
                errors: ['TEAM_NOT_FOUND', 'NO_MORE_GAMES']
            }
        }
    },

    // 谈判管理接口
    INegotiationManager: {
        name: 'INegotiationManager',
        version: '1.0.0',
        description: '谈判管理接口',
        methods: {
            startNegotiation: {
                description: '开始谈判',
                input: { 
                    targetId: 'number, 目标ID',
                    targetType: 'string, 目标类型(player/coach)',
                    initialOffer: 'Object, 初始报价' 
                },
                output: { 
                    success: 'boolean, 是否成功',
                    negotiationId: 'number, 谈判ID',
                    message: 'string, 提示信息'
                },
                errors: ['TARGET_NOT_FOUND', 'INVALID_OFFER', 'NEGOTIATION_EXISTS']
            },
            updateOffer: {
                description: '更新报价',
                input: { 
                    negotiationId: 'number, 谈判ID',
                    newOffer: 'Object, 新报价' 
                },
                output: { 
                    success: 'boolean, 是否成功',
                    acceptanceProbability: 'number, 接受概率',
                    message: 'string, 提示信息'
                },
                errors: ['NEGOTIATION_NOT_FOUND', 'INVALID_OFFER', 'UPDATE_FAILED']
            },
            completeNegotiation: {
                description: '完成谈判',
                input: { 
                    negotiationId: 'number, 谈判ID',
                    accept: 'boolean, 是否接受' 
                },
                output: { 
                    success: 'boolean, 是否成功',
                    signedTarget: 'Object, 签约对象',
                    message: 'string, 提示信息'
                },
                errors: ['NEGOTIATION_NOT_FOUND', 'SIGN_FAILED', 'ALREADY_SIGNED']
            }
        }
    },

    // 球队管理接口
    ITeamManager: {
        name: 'ITeamManager',
        version: '1.0.0',
        description: '球队管理接口',
        methods: {
            addPlayer: {
                description: '添加球员到球队',
                input: { 
                    player: 'Player, 球员对象',
                    team: 'Team, 球队对象' 
                },
                output: { 
                    success: 'boolean, 是否成功',
                    message: 'string, 提示信息'
                },
                errors: ['PLAYER_NOT_FOUND', 'TEAM_NOT_FOUND', 'ROSTER_FULL']
            },
            removePlayer: {
                description: '从球队移除球员',
                input: { 
                    playerId: 'number, 球员ID',
                    team: 'Team, 球队对象' 
                },
                output: { 
                    success: 'boolean, 是否成功',
                    message: 'string, 提示信息'
                },
                errors: ['PLAYER_NOT_FOUND', 'TEAM_NOT_FOUND', 'REMOVE_FAILED']
            },
            getTeamInfo: {
                description: '获取球队信息',
                input: { teamId: 'number, 球队ID' },
                output: { 
                    team: 'Team, 球队对象',
                    roster: 'Array<Player>, 球员列表',
                    stats: 'Object, 统计数据'
                },
                errors: ['TEAM_NOT_FOUND']
            }
        }
    },

    // 数据同步接口
    IDataSyncManager: {
        name: 'IDataSyncManager',
        version: '1.0.0',
        description: '数据同步接口',
        methods: {
            publishEvent: {
                description: '发布同步事件',
                input: { 
                    eventType: 'string, 事件类型',
                    data: 'Object, 事件数据' 
                },
                output: { 
                    success: 'boolean, 是否成功',
                    eventId: 'string, 事件ID'
                },
                errors: ['INVALID_EVENT_TYPE', 'INVALID_DATA', 'PUBLISH_FAILED']
            },
            subscribeEvent: {
                description: '订阅同步事件',
                input: { 
                    eventType: 'string, 事件类型',
                    callback: 'Function, 回调函数' 
                },
                output: { 
                    success: 'boolean, 是否成功',
                    subscriptionId: 'string, 订阅ID'
                },
                errors: ['INVALID_EVENT_TYPE', 'INVALID_CALLBACK', 'SUBSCRIBE_FAILED']
            },
            unsubscribeEvent: {
                description: '取消订阅事件',
                input: { subscriptionId: 'string, 订阅ID' },
                output: { 
                    success: 'boolean, 是否成功',
                    message: 'string, 提示信息'
                },
                errors: ['SUBSCRIPTION_NOT_FOUND', 'UNSUBSCRIBE_FAILED']
            }
        }
    },

    // 球员发展接口
    IPlayerDevelopment: {
        name: 'IPlayerDevelopment',
        version: '1.0.0',
        description: '球员发展接口',
        methods: {
            trainPlayer: {
                description: '训练球员',
                input: { 
                    playerId: 'number, 球员ID',
                    trainingType: 'string, 训练类型',
                    duration: 'number, 训练时长' 
                },
                output: { 
                    success: 'boolean, 是否成功',
                    improvements: 'Object, 提升属性',
                    message: 'string, 提示信息'
                },
                errors: ['PLAYER_NOT_FOUND', 'INVALID_TRAINING_TYPE', 'TRAINING_FAILED']
            },
            developPlayer: {
                description: '发展球员',
                input: { 
                    playerId: 'number, 球员ID',
                    developmentPlan: 'Object, 发展计划' 
                },
                output: { 
                    success: 'boolean, 是否成功',
                    progress: 'number, 进度百分比',
                    message: 'string, 提示信息'
                },
                errors: ['PLAYER_NOT_FOUND', 'INVALID_PLAN', 'DEVELOPMENT_FAILED']
            }
        }
    },

    // 财务管理接口
    IFinanceManager: {
        name: 'IFinanceManager',
        version: '1.0.0',
        description: '财务管理接口',
        methods: {
            getTeamFinances: {
                description: '获取球队财务状况',
                input: { teamId: 'number, 球队ID' },
                output: { 
                    funds: 'number, 资金',
                    expenses: 'number, 支出',
                    income: 'number, 收入',
                    balance: 'number, 余额'
                },
                errors: ['TEAM_NOT_FOUND']
            },
            updateFunds: {
                description: '更新球队资金',
                input: { 
                    teamId: 'number, 球队ID',
                    amount: 'number, 金额',
                    type: 'string, 类型(income/expense)' 
                },
                output: { 
                    success: 'boolean, 是否成功',
                    newBalance: 'number, 新余额',
                    message: 'string, 提示信息'
                },
                errors: ['TEAM_NOT_FOUND', 'INVALID_AMOUNT', 'UPDATE_FAILED']
            }
        }
    },

    // 招募管理接口
    IRecruitmentManager: {
        name: 'IRecruitmentManager',
        version: '1.0.0',
        description: '招募管理接口',
        methods: {
            getAvailablePlayers: {
                description: '获取可用球员列表',
                input: { 
                    filters: 'Object, 筛选条件',
                    limit: 'number, 数量限制' 
                },
                output: { 
                    players: 'Array<Player>, 球员列表',
                    total: 'number, 总数'
                },
                errors: ['INVALID_FILTERS', 'QUERY_FAILED']
            },
            recruitPlayer: {
                description: '招募球员',
                input: { 
                    playerId: 'number, 球员ID',
                    offer: 'Object, 报价' 
                },
                output: { 
                    success: 'boolean, 是否成功',
                    message: 'string, 提示信息'
                },
                errors: ['PLAYER_NOT_FOUND', 'INVALID_OFFER', 'RECRUITMENT_FAILED']
            }
        }
    }
};

/**
 * 错误代码定义
 */
const ErrorCodes = {
    // 通用错误
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    INVALID_DATA: 'INVALID_DATA',
    OPERATION_FAILED: 'OPERATION_FAILED',

    // 球员相关
    PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
    INVALID_PLAYER: 'INVALID_PLAYER',

    // 球队相关
    TEAM_NOT_FOUND: 'TEAM_NOT_FOUND',
    INVALID_TEAM: 'INVALID_TEAM',
    ROSTER_FULL: 'ROSTER_FULL',

    // 谈判相关
    NEGOTIATION_NOT_FOUND: 'NEGOTIATION_NOT_FOUND',
    NEGOTIATION_EXISTS: 'NEGOTIATION_EXISTS',
    INVALID_OFFER: 'INVALID_OFFER',
    ALREADY_SIGNED: 'ALREADY_SIGNED',

    // 赛程相关
    INVALID_TEAMS: 'INVALID_TEAMS',
    INVALID_DATE: 'INVALID_DATE',
    INVALID_SCHEDULE: 'INVALID_SCHEDULE',
    NO_MORE_GAMES: 'NO_MORE_GAMES',
    GENERATION_FAILED: 'GENERATION_FAILED',

    // 同步相关
    INVALID_EVENT_TYPE: 'INVALID_EVENT_TYPE',
    INVALID_CALLBACK: 'INVALID_CALLBACK',
    PUBLISH_FAILED: 'PUBLISH_FAILED',
    SUBSCRIBE_FAILED: 'SUBSCRIBE_FAILED',
    UNSUBSCRIBE_FAILED: 'UNSUBSCRIBE_FAILED',
    SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',

    // 训练相关
    INVALID_TRAINING_TYPE: 'INVALID_TRAINING_TYPE',
    TRAINING_FAILED: 'TRAINING_FAILED',
    INVALID_PLAN: 'INVALID_PLAN',
    DEVELOPMENT_FAILED: 'DEVELOPMENT_FAILED',

    // 财务相关
    INVALID_AMOUNT: 'INVALID_AMOUNT',
    UPDATE_FAILED: 'UPDATE_FAILED',

    // 招募相关
    INVALID_FILTERS: 'INVALID_FILTERS',
    QUERY_FAILED: 'QUERY_FAILED',
    RECRUITMENT_FAILED: 'RECRUITMENT_FAILED',
    SIGN_FAILED: 'SIGN_FAILED'
};

/**
 * 接口响应格式
 */
class InterfaceResponse {
    constructor(success, data = null, error = null, message = '') {
        this.success = success;
        this.data = data;
        this.error = error;
        this.message = message;
        this.timestamp = new Date().toISOString();
    }

    static success(data, message = '') {
        return new InterfaceResponse(true, data, null, message);
    }

    static error(errorCode, message = '') {
        return new InterfaceResponse(false, null, errorCode, message);
    }
}

// 导出接口规范
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BaseInterface,
        InterfaceSpecs,
        ErrorCodes,
        InterfaceResponse
    };
}