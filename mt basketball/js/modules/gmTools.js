/**
 * GM工具模块 - 游戏管理员工具
 * 用于测试和调试游戏功能
 * 注意：此模块仅用于开发测试，正式发布时可移除
 */

class GMTools {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log('[GM Tools] 初始化完成');
    }

    /**
     * 快速招募13名球员
     * 自动选择13名合理的球员并发起谈判
     * 用于快速填充球队进行测试
     */
    quickRecruit13Players() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        const availablePlayers = state.availablePlayers || [];
        
        if (!userTeam) {
            console.error('[GM Tools] 用户球队不存在');
            this.showNotification('请先创建球队', 'error');
            return false;
        }

        // 检查当前阵容人数
        const currentRosterSize = userTeam.roster?.length || 0;
        const neededPlayers = 13 - currentRosterSize;
        
        if (neededPlayers <= 0) {
            console.log('[GM Tools] 球队已满员，无需招募');
            this.showNotification('球队已满员（13人）', 'info');
            return true;
        }

        // 获取当前谈判中的球员
        const activeNegotiations = state.activeNegotiations || [];
        const negotiatingPlayerIds = new Set(activeNegotiations.map(n => n.playerId));

        // 筛选可用球员（不在阵容中，不在谈判中）
        let eligiblePlayers = availablePlayers.filter(player => {
            // 不在当前阵容中
            const inRoster = userTeam.roster?.some(p => p.id === player.id);
            // 不在谈判中
            const inNegotiation = negotiatingPlayerIds.has(player.id);
            return !inRoster && !inNegotiation;
        });

        if (eligiblePlayers.length === 0) {
            console.error('[GM Tools] 没有可用球员');
            this.showNotification('没有可用球员', 'error');
            return false;
        }

        // 按能力值排序，优先选择能力较强的球员
        eligiblePlayers.sort((a, b) => {
            const ratingA = a.getOverallRating ? a.getOverallRating() : (a.rating || 50);
            const ratingB = b.getOverallRating ? b.getOverallRating() : (b.rating || 50);
            return ratingB - ratingA;
        });

        // 选择球员，尽量覆盖不同位置
        const selectedPlayers = this.selectBalancedPlayers(eligiblePlayers, neededPlayers);
        
        console.log(`[GM Tools] 选中 ${selectedPlayers.length} 名球员进行快速招募`);

        // 为每个选中的球员发起谈判
        let successCount = 0;
        selectedPlayers.forEach(player => {
            const result = this.startNegotiationForPlayer(player);
            if (result) successCount++;
        });

        this.showNotification(
            `快速招募完成：成功发起 ${successCount}/${selectedPlayers.length} 名球员的谈判`,
            successCount > 0 ? 'success' : 'warning'
        );

        return successCount > 0;
    }

    /**
     * 选择均衡的球员阵容
     * 尽量覆盖不同位置，同时考虑能力值
     */
    selectBalancedPlayers(players, count) {
        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        const selected = [];
        const positionCount = { 'PG': 0, 'SG': 0, 'SF': 0, 'PF': 0, 'C': 0 };
        
        // 每个位置最多选3人，最少1人
        const maxPerPosition = Math.min(3, Math.ceil(count / 3));
        
        // 第一轮：确保每个位置至少有一人
        for (const position of positions) {
            if (selected.length >= count) break;
            
            const positionPlayers = players.filter(p => p.position === position);
            if (positionPlayers.length > 0) {
                // 选择该位置能力最强的
                const bestPlayer = positionPlayers[0];
                selected.push(bestPlayer);
                positionCount[position]++;
                // 从候选列表中移除
                const index = players.indexOf(bestPlayer);
                if (index > -1) players.splice(index, 1);
            }
        }
        
        // 第二轮：继续选择直到达到数量
        while (selected.length < count && players.length > 0) {
            // 找到人数最少的位置
            let minPosition = positions[0];
            let minCount = positionCount[minPosition];
            
            for (const pos of positions) {
                if (positionCount[pos] < minCount) {
                    minCount = positionCount[pos];
                    minPosition = pos;
                }
            }
            
            // 如果最少的位置已经达到上限，选择任意位置的球员
            let targetPosition = minPosition;
            if (positionCount[minPosition] >= maxPerPosition) {
                targetPosition = null; // 不限制位置
            }
            
            // 选择球员
            let playerToAdd;
            if (targetPosition) {
                playerToAdd = players.find(p => p.position === targetPosition);
            }
            
            // 如果没有找到指定位置的球员，选择第一个可用球员
            if (!playerToAdd) {
                playerToAdd = players[0];
            }
            
            selected.push(playerToAdd);
            positionCount[playerToAdd.position]++;
            
            // 从候选列表中移除
            const index = players.indexOf(playerToAdd);
            if (index > -1) players.splice(index, 1);
        }
        
        return selected;
    }

    /**
     * 为指定球员发起谈判
     */
    startNegotiationForPlayer(player) {
        try {
            // 使用全局的negotiationManager
            if (window.app && window.app.negotiationManager) {
                const result = window.app.negotiationManager.startNegotiation(player.id);
                if (result) {
                    console.log(`[GM Tools] 成功发起与 ${player.name} 的谈判`);
                    return true;
                }
            } else {
                console.error('[GM Tools] negotiationManager 未找到');
            }
        } catch (error) {
            console.error(`[GM Tools] 发起谈判失败:`, error);
        }
        return false;
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            console.log(`[GM Tools] ${type}: ${message}`);
        }
    }

    /**
     * 添加GM工具按钮到UI
     */
    addGMButtonToUI() {
        // 检查是否已存在
        if (document.getElementById('gm-tools-btn')) return;

        // 创建GM工具按钮
        const gmBtn = document.createElement('button');
        gmBtn.id = 'gm-tools-btn';
        gmBtn.innerHTML = '🛠️ GM工具';
        gmBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 20px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
        `;
        
        gmBtn.addEventListener('mouseenter', () => {
            gmBtn.style.transform = 'translateY(-2px)';
            gmBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
        });
        
        gmBtn.addEventListener('mouseleave', () => {
            gmBtn.style.transform = 'translateY(0)';
            gmBtn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        });

        gmBtn.addEventListener('click', () => this.showGMMenu());

        document.body.appendChild(gmBtn);
        console.log('[GM Tools] GM工具按钮已添加');
    }

    /**
     * 显示GM工具菜单
     */
    showGMMenu() {
        // 移除已存在的菜单
        const existingMenu = document.getElementById('gm-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        // 创建菜单
        const menu = document.createElement('div');
        menu.id = 'gm-menu';
        menu.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            min-width: 250px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        menu.innerHTML = `
            <div style="font-weight: bold; font-size: 16px; margin-bottom: 12px; color: #333; border-bottom: 2px solid #667eea; padding-bottom: 8px;">
                🛠️ GM 工具箱
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <button id="gm-quick-recruit" style="
                    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 10px 16px;
                    font-size: 13px;
                    cursor: pointer;
                    text-align: left;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: opacity 0.2s;
                ">
                    ⚡ 快速招募13人
                </button>
                <button id="gm-close-menu" style="
                    background: #f3f4f6;
                    color: #666;
                    border: none;
                    border-radius: 6px;
                    padding: 8px 16px;
                    font-size: 12px;
                    cursor: pointer;
                    margin-top: 8px;
                ">
                    关闭菜单
                </button>
            </div>
            <div style="margin-top: 12px; font-size: 11px; color: #999; text-align: center;">
                仅用于开发测试
            </div>
        `;

        document.body.appendChild(menu);

        // 绑定事件
        document.getElementById('gm-quick-recruit').addEventListener('click', () => {
            this.quickRecruit13Players();
            menu.remove();
        });

        document.getElementById('gm-close-menu').addEventListener('click', () => {
            menu.remove();
        });

        // 点击外部关闭菜单
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && e.target.id !== 'gm-tools-btn') {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GMTools;
}
