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

        // 计算当前已使用的奖学金份额
        const usedInRoster = userTeam?.calculateUsedScholarshipShare ? 
            userTeam.calculateUsedScholarshipShare() : 
            (userTeam?.roster?.reduce((sum, p) => sum + (p.scholarship || 0), 0) || 0);
        
        // 计算正在谈判中占用的奖学金份额
        const activeNegotiations = state.activeNegotiations || [];
        const usedInNegotiations = activeNegotiations.reduce((sum, neg) => {
            if (neg.status === 'active' || neg.status === 'pending' || neg.status === 'countered') {
                const scholarshipPercent = neg.offer?.scholarship || 0;
                let scholarshipShare = 0;
                if (scholarshipPercent >= 0.8) scholarshipShare = 1.0;
                else if (scholarshipPercent >= 0.6) scholarshipShare = 0.75;
                else if (scholarshipPercent >= 0.4) scholarshipShare = 0.5;
                else if (scholarshipPercent >= 0.2) scholarshipShare = 0.25;
                else scholarshipShare = 0;
                return sum + scholarshipShare;
            }
            return sum;
        }, 0);
        
        const totalUsed = usedInRoster + usedInNegotiations;
        const maxScholarships = 5;
        const availableScholarshipShare = Math.max(0, maxScholarships - totalUsed);
        
        console.log(`[GM Tools] 奖学金使用情况: 已用${totalUsed.toFixed(1)}/5, 可用${availableScholarshipShare.toFixed(1)}`);
        
        if (availableScholarshipShare <= 0) {
            this.showNotification('奖学金份额已满，无法发起新的谈判', 'warning');
            return false;
        }

        // 获取当前谈判中的球员
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

        // 选择球员，考虑奖学金份额限制
        const selectedPlayers = this.selectBalancedPlayersWithScholarshipLimit(
            eligiblePlayers, 
            neededPlayers,
            availableScholarshipShare
        );
        
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
        return this.selectBalancedPlayersWithScholarshipLimit(players, count, 5);
    }

    /**
     * 选择均衡的球员阵容（考虑奖学金份额限制）
     * 尽量覆盖不同位置，同时考虑能力值和奖学金限制
     */
    selectBalancedPlayersWithScholarshipLimit(players, count, availableScholarshipShare) {
        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        const selected = [];
        const positionCount = { 'PG': 0, 'SG': 0, 'SF': 0, 'PF': 0, 'C': 0 };
        
        // 计算每个球员需要的奖学金份额（根据球员能力估算）
        const getPlayerScholarshipShare = (player) => {
            const rating = player.getOverallRating ? player.getOverallRating() : (player.rating || 50);
            // 根据能力值估算奖学金需求
            if (rating >= 80) return 1.0;      // 全额奖学金
            else if (rating >= 70) return 0.75; // 四分之三
            else if (rating >= 60) return 0.5;  // 半额
            else return 0.25;                   // 四分之一
        };
        
        // 每个位置最多选3人，最少1人
        const maxPerPosition = Math.min(3, Math.ceil(count / 3));
        
        let remainingScholarship = availableScholarshipShare;
        
        // 第一轮：确保每个位置至少有一人（优先选择奖学金需求低的）
        for (const position of positions) {
            if (selected.length >= count) break;
            if (remainingScholarship <= 0) break;
            
            const positionPlayers = players.filter(p => p.position === position);
            if (positionPlayers.length > 0) {
                // 按奖学金需求排序，优先选择需求低的
                positionPlayers.sort((a, b) => {
                    return getPlayerScholarshipShare(a) - getPlayerScholarshipShare(b);
                });
                
                // 选择第一个符合奖学金限制的球员
                const affordablePlayer = positionPlayers.find(p => getPlayerScholarshipShare(p) <= remainingScholarship);
                
                if (affordablePlayer) {
                    selected.push(affordablePlayer);
                    positionCount[position]++;
                    remainingScholarship -= getPlayerScholarshipShare(affordablePlayer);
                    // 从候选列表中移除
                    const index = players.indexOf(affordablePlayer);
                    if (index > -1) players.splice(index, 1);
                }
            }
        }
        
        // 第二轮：继续选择直到达到数量或奖学金用完
        while (selected.length < count && players.length > 0 && remainingScholarship > 0) {
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
            
            // 筛选符合奖学金限制的球员
            let affordablePlayers = players.filter(p => getPlayerScholarshipShare(p) <= remainingScholarship);
            if (targetPosition) {
                affordablePlayers = affordablePlayers.filter(p => p.position === targetPosition);
            }
            
            if (affordablePlayers.length === 0) {
                // 没有符合奖学金限制的球员，尝试放宽位置限制
                affordablePlayers = players.filter(p => getPlayerScholarshipShare(p) <= remainingScholarship);
            }
            
            if (affordablePlayers.length === 0) {
                // 仍然没有，结束选择
                break;
            }
            
            // 选择奖学金需求最低的球员
            affordablePlayers.sort((a, b) => getPlayerScholarshipShare(a) - getPlayerScholarshipShare(b));
            const playerToAdd = affordablePlayers[0];
            
            selected.push(playerToAdd);
            positionCount[playerToAdd.position]++;
            remainingScholarship -= getPlayerScholarshipShare(playerToAdd);
            
            // 从候选列表中移除
            const index = players.indexOf(playerToAdd);
            if (index > -1) players.splice(index, 1);
        }
        
        console.log(`[GM Tools] 选中 ${selected.length} 人，剩余奖学金份额: ${remainingScholarship.toFixed(1)}`);
        
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
                <button id="gm-view-ai-teams" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                    👥 查看AI球队阵容
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

        document.getElementById('gm-view-ai-teams').addEventListener('click', () => {
            this.showAITeamsViewer();
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

    /**
     * 显示AI球队查看器
     * 查看所有AI球队的球员组成和新签约球员
     */
    showAITeamsViewer() {
        const state = this.gameStateManager.getState();
        const allTeams = state.allTeams || [];
        const userTeam = state.userTeam;

        // 创建查看器弹窗
        const modal = document.createElement('div');
        modal.id = 'gm-ai-teams-viewer';
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: auto;
        `;

        // 构建球队列表HTML
        let teamsHTML = '';
        allTeams.forEach((team, index) => {
            if (userTeam && team.id === userTeam.id) return; // 跳过玩家球队

            const roster = team.roster || [];
            const newSignings = roster.filter(p => p.isNewSigning || p.signedThisSeason).slice(0, 5);
            
            // 计算球队平均实力
            const avgRating = roster.length > 0 
                ? (roster.reduce((sum, p) => sum + (p.rating || 70), 0) / roster.length).toFixed(1)
                : 0;

            // 位置分布
            const positionCount = { 'PG': 0, 'SG': 0, 'SF': 0, 'PF': 0, 'C': 0 };
            roster.forEach(p => {
                if (positionCount[p.position] !== undefined) {
                    positionCount[p.position]++;
                }
            });

            teamsHTML += `
                <div style="
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 16px;
                    border: 1px solid rgba(255,255,255,0.1);
                ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 12px;
                        padding-bottom: 12px;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                    ">
                        <div>
                            <div style="font-size: 16px; font-weight: bold; color: #fff;">${team.name}</div>
                            <div style="font-size: 12px; color: #888; margin-top: 4px;">
                                ${roster.length}人 | 平均实力: ${avgRating} | 
                                PG:${positionCount.PG} SG:${positionCount.SG} SF:${positionCount.SF} PF:${positionCount.PF} C:${positionCount.C}
                            </div>
                        </div>
                        <div style="
                            background: ${roster.length >= 13 ? '#11998e' : '#e74c3c'};
                            color: white;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: bold;
                        ">
                            ${roster.length}人
                        </div>
                    </div>
                    
                    ${newSignings.length > 0 ? `
                        <div style="margin-bottom: 12px;">
                            <div style="font-size: 12px; color: #38ef7d; margin-bottom: 8px; font-weight: bold;">
                                🆕 新签约球员 (${newSignings.length}人)
                            </div>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                ${newSignings.map(p => `
                                    <div style="
                                        background: rgba(56, 239, 125, 0.2);
                                        border: 1px solid rgba(56, 239, 125, 0.3);
                                        border-radius: 6px;
                                        padding: 6px 10px;
                                        font-size: 11px;
                                        color: #38ef7d;
                                    ">
                                        ${p.name} ${p.position} ${p.rating || 70}分
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div>
                        <div style="font-size: 12px; color: #667eea; margin-bottom: 8px; font-weight: bold;">
                            👥 完整阵容
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px;">
                            ${roster.map(p => `
                                <div style="
                                    background: rgba(102, 126, 234, 0.1);
                                    border-radius: 6px;
                                    padding: 8px;
                                    font-size: 11px;
                                    color: #ccc;
                                ">
                                    <div style="font-weight: bold; color: #fff;">${p.name}</div>
                                    <div style="color: #888; margin-top: 2px;">
                                        ${p.position} | ${p.year || 1}年级 | ${p.rating || 70}分
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        });

        modal.innerHTML = `
            <div style="
                background: #0f0f1a;
                border-radius: 16px;
                width: 90%;
                max-width: 1000px;
                max-height: 85vh;
                overflow: auto;
                padding: 24px;
                position: relative;
            ">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid #667eea;
                ">
                    <div>
                        <h2 style="margin: 0; color: #fff; font-size: 20px;">🏀 AI球队阵容查看器</h2>
                        <div style="color: #888; font-size: 12px; margin-top: 4px;">
                            共 ${allTeams.length - (userTeam ? 1 : 0)} 支AI球队 | 🆕 标记为新签约球员
                        </div>
                    </div>
                    <button onclick="this.closest('.modal').remove()" style="
                        background: rgba(255,255,255,0.1);
                        border: none;
                        color: #fff;
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 18px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">×</button>
                </div>
                
                <div style="max-height: calc(85vh - 100px); overflow-y: auto;">
                    ${teamsHTML || '<div style="color: #888; text-align: center; padding: 40px;">暂无AI球队数据</div>'}
                </div>
            </div>
        `;

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
        console.log('[GM Tools] 已打开AI球队查看器');
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GMTools;
}
