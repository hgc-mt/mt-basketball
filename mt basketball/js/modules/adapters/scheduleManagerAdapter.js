/**
 * Schedule Manager Adapter
 * 赛程管理接口适配器
 */

class ScheduleManagerAdapter {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.interfaceName = 'IScheduleManager';
        this.version = '1.0.0';
    }

    /**
     * 生成赛季赛程
     * @param {Array} teams - 所有球队
     * @param {Date} startDate - 赛季开始日期
     * @returns {Object} 生成结果
     */
    generateSchedule(teams, startDate) {
        if (!teams || !Array.isArray(teams) || teams.length === 0) {
            return {
                success: false,
                error: 'INVALID_TEAMS',
                message: '球队列表不能为空'
            };
        }

        if (!startDate || !(startDate instanceof Date)) {
            return {
                success: false,
                error: 'INVALID_DATE',
                message: '开始日期无效'
            };
        }

        try {
            const schedule = [];
            const gamesPerTeam = 30;
            const seasonStartMonth = 9; // 10月（0-indexed）
            const seasonStartDay = 1;
            
            // 使用提供的开始日期或默认的10月1日
            const seasonStartDate = new Date(startDate);
            seasonStartDate.setMonth(seasonStartMonth);
            seasonStartDate.setDate(seasonStartDay);

            // 简化的赛程生成
            for (let i = 0; i < gamesPerTeam / 2; i++) {
                for (let j = 0; j < teams.length / 2; j++) {
                    const homeTeam = teams[j * 2];
                    const awayTeam = teams[j * 2 + 1];

                    if (homeTeam && awayTeam) {
                        // 使用赛季开始日期作为基准，每周一场比赛
                        const gameDate = new Date(seasonStartDate);
                        gameDate.setDate(gameDate.getDate() + i * 7);
                        
                        schedule.push({
                            id: schedule.length + 1,
                            date: gameDate,
                            homeTeam: homeTeam,
                            awayTeam: awayTeam,
                            played: false,
                            homeScore: 0,
                            awayScore: 0
                        });
                    }
                }
            }

            return {
                success: true,
                schedule: schedule,
                totalGames: schedule.length,
                startDate: seasonStartDate,
                endDate: schedule.length > 0 ? schedule[schedule.length - 1].date : null,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: 'GENERATION_FAILED',
                message: `赛程生成失败: ${error.message}`
            };
        }
    }

    /**
     * 同步赛程日期
     * @param {Date} currentDate - 当前游戏日期
     * @param {Array} schedule - 赛程数组
     * @returns {Object} 同步结果
     */
    syncDates(currentDate, schedule) {
        if (!currentDate || !(currentDate instanceof Date)) {
            return {
                success: false,
                error: 'INVALID_DATE',
                message: '当前日期无效'
            };
        }

        if (!schedule || !Array.isArray(schedule)) {
            return {
                success: false,
                error: 'INVALID_SCHEDULE',
                message: '赛程数组无效'
            };
        }

        try {
            let updatedCount = 0;
            const seasonStartMonth = 9; // 10月（0-indexed）
            const seasonStartDay = 1;
            
            // 计算赛季开始日期
            const seasonStartDate = new Date(currentDate.getFullYear(), seasonStartMonth, seasonStartDay);

            // 更新每场比赛的日期
            const updatedSchedule = schedule.map((game, index) => {
                const gameDate = new Date(seasonStartDate);
                const weekIndex = Math.floor(index / (schedule.length / 15)); // 假设15周
                gameDate.setDate(gameDate.getDate() + weekIndex * 7);
                
                if (game.date.getTime() !== gameDate.getTime()) {
                    updatedCount++;
                }
                
                return {
                    ...game,
                    date: gameDate
                };
            });

            return {
                success: true,
                updatedCount: updatedCount,
                schedule: updatedSchedule,
                seasonStartDate: seasonStartDate,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: 'SYNC_FAILED',
                message: `日期同步失败: ${error.message}`
            };
        }
    }

    /**
     * 获取下一场比赛
     * @param {number} teamId - 球队ID
     * @param {Array} schedule - 赛程数组
     * @returns {Object} 下一场比赛信息
     */
    getNextGame(teamId, schedule) {
        if (!teamId) {
            return {
                success: false,
                error: 'TEAM_NOT_FOUND',
                message: '球队ID不能为空'
            };
        }

        if (!schedule || !Array.isArray(schedule)) {
            return {
                success: false,
                error: 'INVALID_SCHEDULE',
                message: '赛程数组无效'
            };
        }

        try {
            // 查找该球队的下一场比赛
            const nextGame = schedule.find(game => {
                return !game.played && 
                       (game.homeTeam.id === teamId || game.awayTeam.id === teamId);
            });

            if (!nextGame) {
                return {
                    success: false,
                    error: 'NO_MORE_GAMES',
                    message: '没有更多比赛'
                };
            }

            // 计算距离比赛的天数
            const today = new Date();
            const gameDate = new Date(nextGame.date);
            const daysUntil = Math.ceil((gameDate - today) / (1000 * 60 * 60 * 24));

            return {
                success: true,
                game: nextGame,
                daysUntil: daysUntil,
                isHome: nextGame.homeTeam.id === teamId,
                opponent: nextGame.homeTeam.id === teamId ? nextGame.awayTeam : nextGame.homeTeam,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: 'QUERY_FAILED',
                message: `查询失败: ${error.message}`
            };
        }
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
        const requiredMethods = [
            'generateSchedule',
            'syncDates',
            'getNextGame'
        ];

        for (const method of requiredMethods) {
            if (typeof this[method] !== 'function') {
                console.error(`接口缺少必需方法: ${method}`);
                return false;
            }
        }

        return true;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScheduleManagerAdapter;
}