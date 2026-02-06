/**
 * 默认账号配置文件
 * 存储预设账号信息，方便管理和修改
 */

const DEFAULT_ACCOUNTS_CONFIG = {
    // 预设账号列表
    accounts: [
        {
            username: 'coach1',
            password: '123456',
            email: 'coach1@game.com',
            description: '新手教练',
            role: '新手',
            avatar: '👤'
        },
        {
            username: 'coach2',
            password: '123456',
            email: 'coach2@game.com',
            description: '资深教练',
            role: '资深',
            avatar: '🎯'
        },
        {
            username: 'coach3',
            password: '123456',
            email: 'coach3@game.com',
            description: '传奇教练',
            role: '传奇',
            avatar: '👑'
        },
        {
            username: 'test',
            password: '123456',
            email: 'test@game.com',
            description: '测试账号',
            role: '测试',
            avatar: '🧪'
        }
    ],

    // 默认游戏数据模板
    defaultGameData: {
        gameState: null,
        settings: {
            gameSpeed: 1,
            autoSimulate: false,
            difficulty: 'normal',
            soundEnabled: true,
            musicEnabled: true
        },
        statistics: {
            totalGamesPlayed: 0,
            totalWins: 0,
            totalLosses: 0,
            championships: 0,
            seasonsPlayed: 0
        }
    },

    // 获取所有预设账号
    getAccounts() {
        return this.accounts;
    },

    // 根据用户名获取账号信息
    getAccountByUsername(username) {
        return this.accounts.find(acc => acc.username === username);
    },

    // 验证账号密码
    validateCredentials(username, password) {
        const account = this.getAccountByUsername(username);
        if (!account) {
            return { valid: false, message: '账号不存在' };
        }
        if (account.password !== password) {
            return { valid: false, message: '密码错误' };
        }
        return { valid: true, account };
    },

    // 获取默认游戏数据
    getDefaultGameData() {
        return JSON.parse(JSON.stringify(this.defaultGameData));
    },

    // 导出账号信息（用于备份）
    exportAccounts() {
        return {
            accounts: this.accounts.map(acc => ({
                username: acc.username,
                email: acc.email,
                description: acc.description,
                role: acc.role,
                avatar: acc.avatar
            })),
            exportTime: new Date().toISOString(),
            version: '1.0'
        };
    }
};

// 兼容旧版本，保留全局访问
if (typeof window !== 'undefined') {
    window.DEFAULT_ACCOUNTS_CONFIG = DEFAULT_ACCOUNTS_CONFIG;
}

// ES6 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DEFAULT_ACCOUNTS_CONFIG;
}
