/**
 * 招募预算管理器
 * 管理招募预算的获取、消耗和显示
 * 
 * 预算获取途径：
 * 1. 赛季奖励 - 根据比赛结果发放
 * 2. 球员发展奖励 - 球员能力提升、毕业等
 * 3. 学校声望奖励 - 根据赛季排名发放
 * 4. 特殊事件奖励 - 连胜、击败强队等
 * 5. 基础收入 - 每日/每周固定收入
 * 6. 校友捐赠 - 随机事件
 */

class RecruitmentBudgetManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        
        // 预算配置
        this.config = {
            // 初始预算
            initialBudget: 50000,
            
            // 赛季奖励
            seasonRewards: {
                winGame: 5000,           // 每赢一场
                loseGame: 1000,          // 每输一场（安慰奖）
                makePlayoffs: 50000,     // 进入季后赛
                winConference: 100000,   // 联盟冠军
                winChampionship: 200000, // 全国冠军
                perfectSeason: 300000    // 全胜赛季
            },
            
            // 球员发展奖励
            playerDevelopment: {
                ratingImprovement: 3000,  // 每提升1点能力值
                playerGraduate: 10000,    // 球员毕业
                playerToNBA: 50000,       // 球员进入NBA
                playerAllConference: 20000, // 入选联盟最佳阵容
                playerAllAmerican: 50000,   // 入选全美最佳阵容
                playerAward: 30000        // 获得个人奖项
            },
            
            // 学校声望奖励（根据赛季结束排名）
            prestigeRewards: {
                top5: 150000,      // 前5%
                top10: 120000,     // 前10%
                top25: 100000,     // 前25%
                top50: 70000,      // 前50%
                top75: 40000,      // 前75%
                other: 20000       // 其他
            },
            
            // 特殊事件奖励
            specialEvents: {
                winStreak3: 10000,     // 3连胜
                winStreak5: 20000,     // 5连胜
                winStreak10: 50000,    // 10连胜
                beatTopTeam: 15000,    // 击败排名前10的球队
                upsetWin: 25000,       // 以弱胜强（排名差距>20）
                rivalryWin: 20000,     // 击败宿敌
                comebackWin: 15000,    // 落后20分逆转
                buzzerBeater: 10000    // 绝杀获胜
            },
            
            // 基础收入
            baseIncome: {
                daily: 2000,      // 每日基础收入
                weekly: 15000,    // 每周额外收入
                monthly: 50000    // 每月大额收入
            },
            
            // 校友捐赠（随机）
            alumniDonation: {
                min: 5000,
                max: 25000,
                chance: 0.1  // 10%概率每天触发
            }
        };
        
        // 统计数据
        this.stats = {
            totalEarned: 0,
            totalSpent: 0,
            seasonEarnings: [],
            lastUpdate: null
        };
    }
    
    /**
     * 初始化预算
     */
    initializeBudget() {
        const state = this.gameStateManager.getState();
        if (!state.recruitmentBudget) {
            state.recruitmentBudget = this.config.initialBudget;
            this.gameStateManager.set('recruitmentBudget', state.recruitmentBudget);
        }
        return state.recruitmentBudget;
    }
    
    /**
     * 获取当前预算
     * 确保返回非负数
     */
    getCurrentBudget() {
        const state = this.gameStateManager.getState();
        const budget = state.recruitmentBudget || 0;
        // 如果预算为负数，修正为0并更新状态
        if (budget < 0) {
            console.warn(`[招募预算] 检测到负数预算 (${budget})，修正为 0`);
            state.recruitmentBudget = 0;
            this.gameStateManager.set('recruitmentBudget', 0);
            return 0;
        }
        return budget;
    }
    
    /**
     * 增加预算
     * @param {number} amount - 增加金额
     * @param {string} reason - 原因
     * @param {string} category - 类别
     */
    addBudget(amount, reason, category = 'other') {
        if (amount <= 0) return false;
        
        const state = this.gameStateManager.getState();
        const currentBudget = state.recruitmentBudget || 0;
        const newBudget = currentBudget + amount;
        
        state.recruitmentBudget = newBudget;
        this.gameStateManager.set('recruitmentBudget', newBudget);
        
        // 记录统计
        this.stats.totalEarned += amount;
        
        // 显示通知
        this.showBudgetNotification(amount, reason, 'add');
        
        console.log(`[招募预算] +$${amount.toLocaleString()} (${reason})，当前: $${newBudget.toLocaleString()}`);
        
        return true;
    }
    
    /**
     * 消耗预算
     * @param {number} amount - 消耗金额
     * @param {string} reason - 原因
     */
    spendBudget(amount, reason) {
        if (amount <= 0) return false;
        
        const state = this.gameStateManager.getState();
        const currentBudget = state.recruitmentBudget || 0;
        
        if (currentBudget < amount) {
            console.log(`[招募预算] 预算不足: 需要$${amount.toLocaleString()}，只有$${currentBudget.toLocaleString()}`);
            return false;
        }
        
        const newBudget = currentBudget - amount;
        state.recruitmentBudget = newBudget;
        this.gameStateManager.set('recruitmentBudget', newBudget);
        
        // 记录统计
        this.stats.totalSpent += amount;
        
        console.log(`[招募预算] -$${amount.toLocaleString()} (${reason})，剩余: $${newBudget.toLocaleString()}`);
        
        return true;
    }
    
    /**
     * 检查是否有足够预算
     */
    hasEnoughBudget(amount) {
        return this.getCurrentBudget() >= amount;
    }
    
    // ==================== 赛季奖励 ====================
    
    /**
     * 比赛结束奖励
     * @param {boolean} isWin - 是否获胜
     * @param {Object} gameStats - 比赛统计数据
     */
    onGameEnd(isWin, gameStats = {}) {
        let amount = 0;
        let reasons = [];
        
        // 基础胜负奖励
        if (isWin) {
            amount += this.config.seasonRewards.winGame;
            reasons.push('比赛胜利');
            
            // 连胜奖励
            const winStreak = gameStats.winStreak || 0;
            if (winStreak >= 10) {
                amount += this.config.specialEvents.winStreak10;
                reasons.push('10连胜！');
            } else if (winStreak >= 5) {
                amount += this.config.specialEvents.winStreak5;
                reasons.push('5连胜');
            } else if (winStreak >= 3) {
                amount += this.config.specialEvents.winStreak3;
                reasons.push('3连胜');
            }
            
            // 击败强队
            if (gameStats.opponentRank && gameStats.opponentRank <= 10) {
                amount += this.config.specialEvents.beatTopTeam;
                reasons.push('击败排名前10的强队');
            }
            
            // 以弱胜强
            if (gameStats.teamRank && gameStats.opponentRank && 
                gameStats.opponentRank - gameStats.teamRank > 20) {
                amount += this.config.specialEvents.upsetWin;
                reasons.push('以弱胜强');
            }
            
            // 逆转获胜
            if (gameStats.wasBehindBy20) {
                amount += this.config.specialEvents.comebackWin;
                reasons.push('20分大逆转');
            }
            
            // 绝杀
            if (gameStats.buzzerBeater) {
                amount += this.config.specialEvents.buzzerBeater;
                reasons.push('绝杀获胜');
            }
        } else {
            amount += this.config.seasonRewards.loseGame;
            reasons.push('参与奖');
        }
        
        if (amount > 0) {
            this.addBudget(amount, reasons.join(' + '), 'game');
        }
        
        return amount;
    }
    
    /**
     * 赛季结束奖励
     * @param {Object} seasonStats - 赛季统计数据
     */
    onSeasonEnd(seasonStats = {}) {
        let amount = 0;
        let reasons = [];
        
        // 季后赛奖励
        if (seasonStats.madePlayoffs) {
            amount += this.config.seasonRewards.makePlayoffs;
            reasons.push('进入季后赛');
        }
        
        // 联盟冠军
        if (seasonStats.wonConference) {
            amount += this.config.seasonRewards.winConference;
            reasons.push('联盟冠军');
        }
        
        // 全国冠军
        if (seasonStats.wonChampionship) {
            amount += this.config.seasonRewards.winChampionship;
            reasons.push('全国冠军！');
        }
        
        // 全胜赛季
        if (seasonStats.wins > 0 && seasonStats.losses === 0) {
            amount += this.config.seasonRewards.perfectSeason;
            reasons.push('全胜赛季！！');
        }
        
        // 排名奖励
        const rankPercentile = seasonStats.rankPercentile || 100;
        let prestigeAmount = 0;
        if (rankPercentile <= 5) {
            prestigeAmount = this.config.prestigeRewards.top5;
        } else if (rankPercentile <= 10) {
            prestigeAmount = this.config.prestigeRewards.top10;
        } else if (rankPercentile <= 25) {
            prestigeAmount = this.config.prestigeRewards.top25;
        } else if (rankPercentile <= 50) {
            prestigeAmount = this.config.prestigeRewards.top50;
        } else if (rankPercentile <= 75) {
            prestigeAmount = this.config.prestigeRewards.top75;
        } else {
            prestigeAmount = this.config.prestigeRewards.other;
        }
        amount += prestigeAmount;
        reasons.push(`赛季排名奖励(前${rankPercentile}%)`);
        
        if (amount > 0) {
            this.addBudget(amount, reasons.join(' + '), 'season');
            
            // 记录赛季收入
            this.stats.seasonEarnings.push({
                season: seasonStats.season || 1,
                amount: amount,
                reasons: reasons
            });
        }
        
        return amount;
    }
    
    // ==================== 球员发展奖励 ====================
    
    /**
     * 球员能力值提升奖励
     * @param {Object} player - 球员对象
     * @param {number} improvement - 提升点数
     */
    onPlayerImprovement(player, improvement) {
        const amount = improvement * this.config.playerDevelopment.ratingImprovement;
        this.addBudget(
            amount, 
            `${player.name} 能力值提升${improvement}点`, 
            'player_development'
        );
        return amount;
    }
    
    /**
     * 球员毕业奖励
     * @param {Object} player - 球员对象
     */
    onPlayerGraduate(player) {
        const amount = this.config.playerDevelopment.playerGraduate;
        this.addBudget(
            amount,
            `${player.name} 顺利毕业`,
            'player_development'
        );
        return amount;
    }
    
    /**
     * 球员进入NBA奖励
     * @param {Object} player - 球员对象
     */
    onPlayerToNBA(player) {
        const amount = this.config.playerDevelopment.playerToNBA;
        this.addBudget(
            amount,
            `${player.name} 成功进入NBA！`,
            'player_development'
        );
        return amount;
    }
    
    /**
     * 球员获得荣誉奖励
     * @param {Object} player - 球员对象
     * @param {string} awardType - 奖项类型
     */
    onPlayerAward(player, awardType) {
        let amount = 0;
        let reason = '';
        
        switch (awardType) {
            case 'all_conference':
                amount = this.config.playerDevelopment.playerAllConference;
                reason = `${player.name} 入选联盟最佳阵容`;
                break;
            case 'all_american':
                amount = this.config.playerDevelopment.playerAllAmerican;
                reason = `${player.name} 入选全美最佳阵容`;
                break;
            default:
                amount = this.config.playerDevelopment.playerAward;
                reason = `${player.name} 获得${awardType}奖项`;
        }
        
        this.addBudget(amount, reason, 'player_development');
        return amount;
    }
    
    // ==================== 基础收入和随机事件 ====================
    
    /**
     * 每日更新 - 基础收入和随机事件
     */
    dailyUpdate() {
        let amount = 0;
        let reasons = [];
        
        // 每日基础收入
        amount += this.config.baseIncome.daily;
        reasons.push('每日基础收入');
        
        // 校友捐赠（随机）
        if (Math.random() < this.config.alumniDonation.chance) {
            const donation = Math.floor(
                this.config.alumniDonation.min + 
                Math.random() * (this.config.alumniDonation.max - this.config.alumniDonation.min)
            );
            amount += donation;
            reasons.push('校友慷慨捐赠');
        }
        
        this.addBudget(amount, reasons.join(' + '), 'daily');
        
        return amount;
    }
    
    /**
     * 每周更新
     */
    weeklyUpdate() {
        const amount = this.config.baseIncome.weekly;
        this.addBudget(amount, '每周招募基金', 'weekly');
        return amount;
    }
    
    /**
     * 每月更新
     */
    monthlyUpdate() {
        const amount = this.config.baseIncome.monthly;
        this.addBudget(amount, '月度招募拨款', 'monthly');
        return amount;
    }
    
    // ==================== 通知和UI ====================
    
    /**
     * 显示预算变动通知
     */
    showBudgetNotification(amount, reason, type) {
        const icon = type === 'add' ? '💰' : '💸';
        const sign = type === 'add' ? '+' : '-';
        const color = type === 'add' ? '#10b981' : '#ef4444';
        
        if (typeof window.showNotification === 'function') {
            window.showNotification(
                `${icon} 招募预算 ${sign}$${amount.toLocaleString()} (${reason})`,
                type === 'add' ? 'success' : 'info'
            );
        }
    }
    
    /**
     * 获取预算统计
     */
    getStats() {
        return {
            ...this.stats,
            currentBudget: this.getCurrentBudget(),
            netIncome: this.stats.totalEarned - this.stats.totalSpent
        };
    }
    
    /**
     * 格式化预算显示
     */
    formatBudget(amount) {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(1)}K`;
        }
        return `$${amount}`;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecruitmentBudgetManager;
}
