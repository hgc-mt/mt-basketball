/**
 * Account Manager module
 * Handles user account management and data persistence
 */

class AccountManager {
    constructor() {
        this.currentUser = null;
        this.accounts = [];
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        this.loadAccounts();
        this.loadCurrentUser();

        this.isInitialized = true;
        console.log('Account Manager initialized');
    }

    loadAccounts() {
        try {
            const accountsData = localStorage.getItem('basketball_accounts');
            if (accountsData) {
                this.accounts = JSON.parse(accountsData);
            }
        } catch (error) {
            console.error('Failed to load accounts:', error);
            this.accounts = [];
        }
    }

    saveAccounts() {
        try {
            localStorage.setItem('basketball_accounts', JSON.stringify(this.accounts));
        } catch (error) {
            console.error('Failed to save accounts:', error);
        }
    }

    loadCurrentUser() {
        try {
            const currentUserData = localStorage.getItem('basketball_current_user');
            if (currentUserData) {
                this.currentUser = JSON.parse(currentUserData);
            }
        } catch (error) {
            console.error('Failed to load current user:', error);
            this.currentUser = null;
        }
    }

    saveCurrentUser() {
        try {
            localStorage.setItem('basketball_current_user', JSON.stringify(this.currentUser));
        } catch (error) {
            console.error('Failed to save current user:', error);
        }
    }

    register(username, password, email = '') {
        if (this.accounts.find(acc => acc.username === username)) {
            return { success: false, message: '用户名已存在' };
        }

        const account = {
            id: Date.now(),
            username: username,
            password: this.hashPassword(password),
            email: email,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            gameData: {
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
            }
        };

        this.accounts.push(account);
        this.saveAccounts();

        return { success: true, message: '注册成功', account };
    }

    login(username, password) {
        const account = this.accounts.find(acc => acc.username === username);

        if (!account) {
            return { success: false, message: '用户名不存在' };
        }

        if (account.password !== this.hashPassword(password)) {
            return { success: false, message: '密码错误' };
        }

        account.lastLogin = new Date().toISOString();
        this.currentUser = account;
        this.saveAccounts();
        this.saveCurrentUser();

        return { success: true, message: '登录成功', account };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('basketball_current_user');
        return { success: true, message: '已退出登录' };
    }

    deleteAccount(username) {
        const index = this.accounts.findIndex(acc => acc.username === username);
        if (index === -1) {
            return { success: false, message: '账号不存在' };
        }

        this.accounts.splice(index, 1);
        this.saveAccounts();

        if (this.currentUser && this.currentUser.username === username) {
            this.logout();
        }

        return { success: true, message: '账号已删除' };
    }

    updatePassword(username, oldPassword, newPassword) {
        const account = this.accounts.find(acc => acc.username === username);

        if (!account) {
            return { success: false, message: '账号不存在' };
        }

        if (account.password !== this.hashPassword(oldPassword)) {
            return { success: false, message: '原密码错误' };
        }

        account.password = this.hashPassword(newPassword);
        this.saveAccounts();

        return { success: true, message: '密码修改成功' };
    }

    saveGameState(gameState) {
        if (!this.currentUser) {
            return { success: false, message: '请先登录' };
        }

        const account = this.accounts.find(acc => acc.username === this.currentUser.username);
        if (account) {
            account.gameData.gameState = gameState;
            account.lastLogin = new Date().toISOString();
            this.saveAccounts();
            return { success: true, message: '游戏数据已保存' };
        }

        return { success: false, message: '账号不存在' };
    }

    loadGameState() {
        if (!this.currentUser) {
            return null;
        }

        const account = this.accounts.find(acc => acc.username === this.currentUser.username);
        return account ? account.gameData.gameState : null;
    }

    updateSettings(settings) {
        if (!this.currentUser) {
            return { success: false, message: '请先登录' };
        }

        const account = this.accounts.find(acc => acc.username === this.currentUser.username);
        if (account) {
            account.gameData.settings = { ...account.gameData.settings, ...settings };
            this.saveAccounts();
            return { success: true, message: '设置已更新' };
        }

        return { success: false, message: '账号不存在' };
    }

    getSettings() {
        if (!this.currentUser) {
            return null;
        }

        const account = this.accounts.find(acc => acc.username === this.currentUser.username);
        return account ? account.gameData.settings : null;
    }

    updateStatistics(statistics) {
        if (!this.currentUser) {
            return { success: false, message: '请先登录' };
        }

        const account = this.accounts.find(acc => acc.username === this.currentUser.username);
        if (account) {
            account.gameData.statistics = { ...account.gameData.statistics, ...statistics };
            this.saveAccounts();
            return { success: true, message: '统计数据已更新' };
        }

        return { success: false, message: '账号不存在' };
    }

    getStatistics() {
        if (!this.currentUser) {
            return null;
        }

        const account = this.accounts.find(acc => acc.username === this.currentUser.username);
        return account ? account.gameData.statistics : null;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getAllAccounts() {
        return this.accounts;
    }

    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    exportAccountData(username) {
        const account = this.accounts.find(acc => acc.username === username);
        if (!account) {
            return { success: false, message: '账号不存在' };
        }

        const exportData = {
            username: account.username,
            email: account.email,
            createdAt: account.createdAt,
            gameData: account.gameData,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `basketball_game_${username}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return { success: true, message: '数据导出成功' };
    }

    importAccountData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);

                    if (!importData.username || !importData.gameData) {
                        resolve({ success: false, message: '无效的数据文件' });
                        return;
                    }

                    const existingAccount = this.accounts.find(acc => acc.username === importData.username);
                    if (existingAccount) {
                        const overwrite = confirm(`账号 ${importData.username} 已存在，是否覆盖？`);
                        if (!overwrite) {
                            resolve({ success: false, message: '导入已取消' });
                            return;
                        }

                        const index = this.accounts.indexOf(existingAccount);
                        this.accounts[index] = {
                            ...existingAccount,
                            ...importData,
                            id: existingAccount.id
                        };
                    } else {
                        this.accounts.push({
                            ...importData,
                            id: Date.now(),
                            password: this.hashPassword('123456'),
                            lastLogin: null
                        });
                    }

                    this.saveAccounts();
                    resolve({ success: true, message: '数据导入成功' });
                } catch (error) {
                    resolve({ success: false, message: '数据文件格式错误' });
                }
            };
            reader.onerror = () => {
                resolve({ success: false, message: '文件读取失败' });
            };
            reader.readAsText(file);
        });
    }

    clearAllData() {
        localStorage.removeItem('basketball_accounts');
        localStorage.removeItem('basketball_current_user');
        this.accounts = [];
        this.currentUser = null;
        return { success: true, message: '所有数据已清除' };
    }
}

window.AccountManager = AccountManager;