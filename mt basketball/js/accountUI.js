let accountManager;

async function initializeAccountSystem() {
    accountManager = new AccountManager();
    await accountManager.initialize();

    setupAccountTabs();
    checkLoginStatus();
}

function setupAccountTabs() {
    const tabs = document.querySelectorAll('.account-tab');
    const forms = document.querySelectorAll('.account-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            forms.forEach(form => form.classList.remove('active'));
            
            if (targetTab === 'login') {
                document.getElementById('login-form').classList.add('active');
            } else if (targetTab === 'register') {
                document.getElementById('register-form').classList.add('active');
            } else if (targetTab === 'manage') {
                document.getElementById('manage-form').classList.add('active');
                updateAccountList();
            }
        });
    });
}

function checkLoginStatus() {
    if (accountManager.isLoggedIn()) {
        const user = accountManager.getCurrentUser();
        showStartScreen(user);
    } else {
        showAccountScreen();
    }
}

function showAccountScreen() {
    document.getElementById('account-screen').style.display = 'flex';
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('app').style.display = 'none';
}

function showStartScreen(user) {
    document.getElementById('account-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';

    const savedState = accountManager.loadGameState();
    const continueBtn = document.getElementById('btn-continue');
    
    if (savedState) {
        continueBtn.style.display = 'flex';
        continueBtn.disabled = false;
    } else {
        continueBtn.style.display = 'none';
        continueBtn.disabled = true;
    }
}

function showAccountMessage(message, type = 'info') {
    const messageElement = document.getElementById('account-message');
    messageElement.textContent = message;
    messageElement.className = `account-message ${type}`;
    
    setTimeout(() => {
        messageElement.className = 'account-message';
    }, 5000);
}

function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        showAccountMessage('请输入用户名和密码', 'error');
        return;
    }

    const result = accountManager.login(username, password);
    
    if (result.success) {
        showAccountMessage(result.message, 'success');
        setTimeout(() => {
            showStartScreen(result.account);
        }, 1000);
    } else {
        showAccountMessage(result.message, 'error');
    }
}

function register() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const email = document.getElementById('register-email').value.trim();

    if (!username || !password) {
        showAccountMessage('请输入用户名和密码', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showAccountMessage('两次输入的密码不一致', 'error');
        return;
    }

    if (password.length < 6) {
        showAccountMessage('密码长度至少为6位', 'error');
        return;
    }

    const result = accountManager.register(username, password, email);
    
    if (result.success) {
        showAccountMessage(result.message, 'success');
        
        document.getElementById('register-username').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-confirm-password').value = '';
        document.getElementById('register-email').value = '';

        setTimeout(() => {
            document.querySelector('[data-tab="login"]').click();
            document.getElementById('login-username').value = username;
            document.getElementById('login-password').value = password;
        }, 1500);
    } else {
        showAccountMessage(result.message, 'error');
    }
}

function logout() {
    const result = accountManager.logout();
    
    if (result.success) {
        showAccountMessage(result.message, 'success');
        setTimeout(() => {
            showAccountScreen();
        }, 500);
    }
}

function updateAccountList() {
    const accounts = accountManager.getAllAccounts();
    const accountList = document.getElementById('account-list');
    
    if (accounts.length === 0) {
        accountList.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 40px;">暂无账号</div>';
        return;
    }

    const currentUser = accountManager.getCurrentUser();
    
    accountList.innerHTML = accounts.map(account => {
        const isCurrent = currentUser && currentUser.username === account.username;
        const lastLogin = account.lastLogin ? new Date(account.lastLogin).toLocaleString('zh-CN') : '从未登录';
        const createdAt = new Date(account.createdAt).toLocaleDateString('zh-CN');
        
        return `
            <div class="account-item">
                <div class="account-item-info">
                    <div class="account-item-name">
                        ${account.username}
                        ${isCurrent ? '<span style="color: var(--success-color); margin-left: 8px;">● 当前登录</span>' : ''}
                    </div>
                    <div class="account-item-details">
                        创建于: ${createdAt} | 最后登录: ${lastLogin}
                    </div>
                </div>
                <div class="account-item-actions">
                    ${!isCurrent ? `<button class="account-item-btn switch" onclick="switchAccount('${account.username}')">切换</button>` : ''}
                    <button class="account-item-btn delete" onclick="deleteAccount('${account.username}')">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

function switchAccount(username) {
    const accounts = accountManager.getAllAccounts();
    const account = accounts.find(acc => acc.username === username);
    
    if (!account) {
        showAccountMessage('账号不存在', 'error');
        return;
    }

    if (confirm(`切换到账号 ${username}？`)) {
        accountManager.currentUser = account;
        accountManager.saveCurrentUser();
        showAccountMessage('账号切换成功', 'success');
        setTimeout(() => {
            showStartScreen(account);
        }, 1000);
    }
}

function deleteAccount(username) {
    if (confirm(`确定要删除账号 ${username} 吗？此操作不可恢复！`)) {
        const result = accountManager.deleteAccount(username);
        
        if (result.success) {
            showAccountMessage(result.message, 'success');
            updateAccountList();
        } else {
            showAccountMessage(result.message, 'error');
        }
    }
}

function showImportExport() {
    document.getElementById('manage-form').classList.remove('active');
    document.getElementById('import-export-form').classList.add('active');
}

function showManageTab() {
    document.getElementById('import-export-form').classList.remove('active');
    document.getElementById('manage-form').classList.add('active');
    updateAccountList();
}

function exportCurrentAccount() {
    if (!accountManager.isLoggedIn()) {
        showAccountMessage('请先登录', 'error');
        return;
    }

    const username = accountManager.getCurrentUser().username;
    const result = accountManager.exportAccountData(username);
    
    if (result.success) {
        showAccountMessage(result.message, 'success');
    } else {
        showAccountMessage(result.message, 'error');
    }
}

function exportAllAccounts() {
    const accounts = accountManager.getAllAccounts();
    
    if (accounts.length === 0) {
        showAccountMessage('没有可导出的账号', 'error');
        return;
    }

    const exportData = {
        accounts: accounts,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `basketball_game_all_accounts_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showAccountMessage('所有账号数据导出成功', 'success');
}

function importAccountData() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];
    
    if (!file) {
        showAccountMessage('请选择要导入的文件', 'error');
        return;
    }

    accountManager.importAccountData(file).then(result => {
        if (result.success) {
            showAccountMessage(result.message, 'success');
            updateAccountList();
        } else {
            showAccountMessage(result.message, 'error');
        }
        fileInput.value = '';
    });
}

function clearAllData() {
    if (confirm('确定要清除所有账号数据吗？此操作不可恢复！')) {
        if (confirm('再次确认：这将删除所有账号和游戏数据！')) {
            const result = accountManager.clearAllData();
            
            if (result.success) {
                showAccountMessage(result.message, 'success');
                updateAccountList();
            } else {
                showAccountMessage(result.message, 'error');
            }
        }
    }
}

async function startNewGame() {
    if (!accountManager.isLoggedIn()) {
        alert('请先登录');
        showAccountScreen();
        return;
    }

    if (accountManager.loadGameState()) {
        if (!confirm('开始新游戏将覆盖当前存档，确定继续吗？')) {
            return;
        }
    }

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';

    if (typeof initializeGame === 'function') {
        await initializeGame();
    }
}

async function continueGame() {
    if (!accountManager.isLoggedIn()) {
        alert('请先登录');
        showAccountScreen();
        return;
    }

    const savedState = accountManager.loadGameState();
    
    if (!savedState) {
        alert('没有找到存档');
        return;
    }

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';

    if (typeof loadGame === 'function') {
        await loadGame(savedState);
    }
}

function saveGameToAccount(gameState) {
    if (!accountManager.isLoggedIn()) {
        console.warn('未登录，无法保存游戏数据');
        return false;
    }

    const result = accountManager.saveGameState(gameState);
    return result.success;
}

function loadGameFromAccount() {
    if (!accountManager.isLoggedIn()) {
        return null;
    }

    return accountManager.loadGameState();
}

function getAccountSettings() {
    if (!accountManager.isLoggedIn()) {
        return null;
    }

    return accountManager.getSettings();
}

function updateAccountSettings(settings) {
    if (!accountManager.isLoggedIn()) {
        return false;
    }

    const result = accountManager.updateSettings(settings);
    return result.success;
}

function getAccountStatistics() {
    if (!accountManager.isLoggedIn()) {
        return null;
    }

    return accountManager.getStatistics();
}

function updateAccountStatistics(statistics) {
    if (!accountManager.isLoggedIn()) {
        return false;
    }

    const result = accountManager.updateStatistics(statistics);
    return result.success;
}

document.addEventListener('DOMContentLoaded', () => {
    initializeAccountSystem();
});