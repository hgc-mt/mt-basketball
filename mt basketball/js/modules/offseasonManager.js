/**
 * 休赛期管理系统
 * 处理球员退役、转会、毕业等 offseason 变动
 * 支持AI球队阵容重建
 */

class OffseasonManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        
        // 球员变动配置
        this.offseasonConfig = {
            // 大四球员退役概率（几乎100%）
            seniorGraduationRate: 0.95,
            
            // 大三球员提前毕业/退役概率（低）
            juniorEarlyExitRate: 0.05,
            
            // 因上场时间不足导致的转会概率
            transferByPlayingTime: {
                year2: { threshold: 15, probability: 0.25 },  // 大二：场均<15分钟，25%转会
                year3: { threshold: 20, probability: 0.35 },  // 大三：场均<20分钟，35%转会
                year4: { threshold: 25, probability: 0.20 }   // 大四：场均<25分钟，20%转会
            },
            
            // 因球队战绩不佳导致的转会概率
            transferByTeamPerformance: {
                poorRecord: { maxWinRate: 0.3, probability: 0.15 },      // 胜率<30%，15%转会
                disappointing: { maxWinRate: 0.45, probability: 0.08 }   // 胜率<45%，8%转会
            },
            
            // 潜力衰减配置（每年）
            potentialDecay: {
                year1: { minDecay: 0, maxDecay: 2 },      // 大一：几乎不衰减
                year2: { minDecay: 1, maxDecay: 4 },      // 大二：轻微衰减
                year3: { minDecay: 2, maxDecay: 6 },      // 大三：中等衰减
                year4: { minDecay: 3, maxDecay: 8 },      // 大四：明显衰减
                year5: { minDecay: 5, maxDecay: 12 }      // 大五（如果有）：大幅衰减
            },
            
            // 年龄相关衰减
            ageDecay: {
                18: 0, 19: 0, 20: 1, 21: 2, 22: 3, 23: 5, 24: 8, 25: 12
            },
            
            // AI球队阵容重建配置
            aiTeamRebuilding: {
                // 触发重建的条件
                triggerConditions: {
                    minRosterSize: 8,        // 阵容少于8人必须重建
                    maxRosterSize: 15,       // 阵容上限
                    poorRecordThreshold: 0.3, // 胜率低于30%可能重建
                    rebuildProbability: 0.3   // 战绩差时30%概率重建
                },
                // 重建目标人数
                targetRosterSize: {
                    elite: { min: 13, max: 15 },      // 顶级球队
                    strong: { min: 12, max: 15 },     // 强队
                    average: { min: 11, max: 14 },    // 普通队
                    weak: { min: 10, max: 13 }        // 弱队
                }
            }
        };
    }
    
    /**
     * 执行完整的休赛期处理
     * @param {Object} options - 处理选项
     * @param {boolean} options.isInitialSetup - 是否是游戏初始设置（true=游戏开始，false=赛季结束）
     * @returns {Object} 休赛期变动报告
     */
    processOffseason(options = {}) {
        const { isInitialSetup = false } = options;
        const state = this.gameStateManager.getState();
        const allTeams = state.allTeams || [];
        const userTeam = state.userTeam;
        
        console.log(`[OffseasonManager] 开始处理休赛期，isInitialSetup=${isInitialSetup}`);
        
        const report = {
            isInitialSetup,       // 记录是否是初始设置
            graduations: [],      // 毕业球员
            transfers: [],        // 转会球员
            retirements: [],      // 退役球员
            potentialDecays: [],  // 潜力衰减
            teamUpdates: [],      // 球队更新
            aiRebuilds: []        // AI球队重建记录
        };
        
        // 处理所有AI球队
        for (const team of allTeams) {
            // 判断是否需要重建阵容
            const needsRebuild = this.checkIfTeamNeedsRebuild(team, isInitialSetup);
            
            let teamReport;
            if (needsRebuild && !isInitialSetup) {
                // 需要重建且不是初始设置：执行阵容重建
                console.log(`[OffseasonManager] ${team.name} 触发阵容重建`);
                teamReport = this.rebuildAITeamRoster(team);
                report.aiRebuilds.push({
                    teamId: team.id,
                    teamName: team.name,
                    reason: needsRebuild.reason,
                    beforeSize: needsRebuild.beforeSize,
                    afterSize: team.roster.length
                });
            } else {
                // 正常处理 offseason 变动
                teamReport = this.processTeamOffseason(team);
            }
            
            report.graduations.push(...teamReport.graduations);
            report.transfers.push(...teamReport.transfers);
            report.retirements.push(...teamReport.retirements);
            report.potentialDecays.push(...teamReport.potentialDecays);
            report.teamUpdates.push(teamReport.teamUpdate);
        }
        
        // 处理玩家球队（玩家球队不自动重建，只处理变动）
        if (userTeam) {
            const userReport = this.processTeamOffseason(userTeam, true);
            report.graduations.push(...userReport.graduations);
            report.transfers.push(...userReport.transfers);
            report.retirements.push(...userReport.retirements);
            report.potentialDecays.push(...userReport.potentialDecays);
            report.teamUpdates.push(userReport.teamUpdate);
        }
        
        // 保存状态
        this.gameStateManager.saveGameState();
        
        console.log('[OffseasonManager] 休赛期处理完成', report);
        return report;
    }
    
    /**
     * 检查AI球队是否需要重建阵容
     * @param {Object} team - 球队对象
     * @param {boolean} isInitialSetup - 是否是初始设置
     * @returns {Object|null} 如果需要重建返回原因，否则返回null
     */
    checkIfTeamNeedsRebuild(team, isInitialSetup) {
        const config = this.offseasonConfig.aiTeamRebuilding.triggerConditions;
        const currentSize = team.roster ? team.roster.length : 0;
        
        // 初始设置时：如果阵容为空或太少，需要生成
        if (isInitialSetup) {
            if (currentSize < config.minRosterSize) {
                return {
                    needsRebuild: true,
                    reason: 'initial_setup',
                    beforeSize: currentSize
                };
            }
            return null;
        }
        
        // 赛季结束后：
        // 1. 阵容人数过少必须重建
        if (currentSize < config.minRosterSize) {
            return {
                needsRebuild: true,
                reason: 'roster_too_small',
                beforeSize: currentSize
            };
        }
        
        // 2. 战绩极差且阵容质量差，考虑重建
        const teamRecord = this.getTeamRecord(team);
        if (teamRecord.winRate < config.poorRecordThreshold) {
            // 计算阵容平均实力
            const avgRating = team.roster.reduce((sum, p) => {
                const rating = p.rating || (p.getOverallRating ? p.getOverallRating() : 60);
                return sum + rating;
            }, 0) / currentSize;
            
            // 战绩差且实力弱，概率重建
            if (avgRating < 65 && Math.random() < config.rebuildProbability) {
                return {
                    needsRebuild: true,
                    reason: 'poor_record_and_weak_roster',
                    beforeSize: currentSize
                };
            }
        }
        
        return null;
    }
    
    /**
     * 重建AI球队阵容
     * @param {Object} team - 球队对象
     * @returns {Object} 重建报告
     */
    rebuildAITeamRoster(team) {
        console.log(`[OffseasonManager] 开始重建 ${team.name} 的阵容`);
        
        const report = {
            graduations: [],
            transfers: [],
            retirements: [],
            potentialDecays: [],
            teamUpdate: {
                teamId: team.id,
                teamName: team.name,
                beforeSize: team.roster ? team.roster.length : 0,
                afterSize: 0,
                changes: []
            }
        };
        
        // 清空现有阵容（这些球员进入自由市场或退役）
        const oldRoster = team.roster || [];
        oldRoster.forEach(player => {
            report.transfers.push({
                playerId: player.id,
                playerName: player.name,
                teamId: team.id,
                teamName: team.name,
                year: player.year,
                reason: '球队重建，进入转会市场',
                destination: '自由市场'
            });
        });
        
        // 使用 gameInitializer 生成新阵容
        if (window.gameInitializer) {
            // 清空阵容
            team.roster = [];
            
            // 获取球队风格
            const styleId = team.styleId || 'BALANCED_PROGRAM';
            const style = window.TeamStylesConfig ? 
                window.TeamStylesConfig.getStyle(styleId) : 
                { name: '均衡型', preferredAttributes: [] };
            
            // 生成新阵容
            window.gameInitializer.generateTeamRosterWithStyle(team, style);
            
            console.log(`[OffseasonManager] ${team.name} 重建完成，新阵容 ${team.roster.length} 人`);
        } else {
            console.warn('[OffseasonManager] gameInitializer 未找到，无法重建阵容');
        }
        
        report.teamUpdate.afterSize = team.roster ? team.roster.length : 0;
        report.teamUpdate.changes.push({
            type: 'rebuild',
            message: `阵容重建完成，现有 ${report.teamUpdate.afterSize} 名球员`
        });
        
        return report;
    }
    
    /**
     * 处理单个球队的休赛期
     * @param {Object} team - 球队对象
     * @param {boolean} isUserTeam - 是否是玩家球队
     * @returns {Object} 球队变动报告
     */
    processTeamOffseason(team, isUserTeam = false) {
        const report = {
            graduations: [],
            transfers: [],
            retirements: [],
            potentialDecays: [],
            teamUpdate: {
                teamId: team.id,
                teamName: team.name,
                beforeSize: team.roster ? team.roster.length : 0,
                afterSize: 0,
                changes: []
            }
        };
        
        if (!team.roster || team.roster.length === 0) {
            return report;
        }
        
        const playersToRemove = [];
        const playersToUpdate = [];
        
        // 获取球队战绩
        const teamRecord = this.getTeamRecord(team);
        
        for (const player of team.roster) {
            const playerInfo = this.getPlayerInfo(player);
            const decision = this.evaluatePlayerDecision(player, teamRecord, isUserTeam);
            
            switch (decision.action) {
                case 'graduate':
                    playersToRemove.push(player);
                    report.graduations.push({
                        playerId: playerInfo.id,
                        playerName: playerInfo.name,
                        teamId: team.id,
                        teamName: team.name,
                        year: playerInfo.year,
                        reason: '正常毕业'
                    });
                    break;
                    
                case 'transfer':
                    playersToRemove.push(player);
                    report.transfers.push({
                        playerId: playerInfo.id,
                        playerName: playerInfo.name,
                        teamId: team.id,
                        teamName: team.name,
                        year: playerInfo.year,
                        reason: decision.reason,
                        destination: decision.destination
                    });
                    break;
                    
                case 'retire':
                    playersToRemove.push(player);
                    report.retirements.push({
                        playerId: playerInfo.id,
                        playerName: playerInfo.name,
                        teamId: team.id,
                        teamName: team.name,
                        year: playerInfo.year,
                        reason: decision.reason
                    });
                    break;
                    
                case 'stay':
                default:
                    // 处理潜力衰减
                    const decay = this.calculatePotentialDecay(player);
                    if (decay.amount > 0) {
                        const oldPotential = playerInfo.potential;
                        player.potential = Math.max(50, oldPotential - decay.amount);
                        
                        report.potentialDecays.push({
                            playerId: playerInfo.id,
                            playerName: playerInfo.name,
                            teamId: team.id,
                            oldPotential: oldPotential,
                            newPotential: player.potential,
                            decayAmount: decay.amount,
                            reason: decay.reason
                        });
                    }
                    
                    // 年级增长
                    player.year = (player.year || 1) + 1;
                    player.age = (player.age || 18) + 1;
                    
                    playersToUpdate.push(player);
                    break;
            }
        }
        
        // 更新阵容
        team.roster = playersToUpdate;
        report.teamUpdate.afterSize = team.roster.length;
        report.teamUpdate.changes = [
            ...report.graduations.map(g => ({ type: 'graduate', playerName: g.playerName })),
            ...report.transfers.map(t => ({ type: 'transfer', playerName: t.playerName })),
            ...report.retirements.map(r => ({ type: 'retire', playerName: r.playerName }))
        ];
        
        return report;
    }
    
    /**
     * 评估球员 offseason 决定
     * @param {Object} player - 球员对象
     * @param {Object} teamRecord - 球队战绩
     * @param {boolean} isUserTeam - 是否是玩家球队
     * @returns {Object} 决定结果
     */
    evaluatePlayerDecision(player, teamRecord, isUserTeam) {
        const playerInfo = this.getPlayerInfo(player);
        const year = playerInfo.year;
        const age = playerInfo.age;
        
        // 大四球员：几乎必然毕业
        if (year >= 4 || age >= 22) {
            if (Math.random() < this.offseasonConfig.seniorGraduationRate) {
                return { action: 'graduate', reason: '完成学业毕业' };
            }
        }
        
        // 大三球员：小概率提前进入职业联赛
        if (year === 3 && playerInfo.rating >= 80 && playerInfo.potential >= 85) {
            if (Math.random() < this.offseasonConfig.juniorEarlyExitRate) {
                return { action: 'retire', reason: '提前参加职业联赛选秀' };
            }
        }
        
        // 检查上场时间
        const avgMinutes = playerInfo.seasonStats && playerInfo.seasonStats.games > 0
            ? (playerInfo.seasonStats.minutes / playerInfo.seasonStats.games)
            : 0;
        
        // 大二/大三因上场时间不足考虑转会
        if (year >= 2 && year <= 3) {
            const config = this.offseasonConfig.transferByPlayingTime[`year${year}`];
            if (config && avgMinutes < config.threshold) {
                // 考虑球员满意度和球队情况
                let transferProb = config.probability;
                
                // 球队战绩差增加转会概率
                if (teamRecord.winRate < 0.3) {
                    transferProb += 0.1;
                }
                
                // 潜力高的球员更可能寻求更好机会
                if (playerInfo.potential >= 80) {
                    transferProb += 0.05;
                }
                
                if (Math.random() < transferProb) {
                    return {
                        action: 'transfer',
                        reason: `场均仅${avgMinutes.toFixed(1)}分钟上场时间，寻求更多机会`,
                        destination: this.findTransferDestination(player)
                    };
                }
            }
        }
        
        // 因球队战绩不佳转会
        if (teamRecord.winRate < 0.3 && year >= 2) {
            const config = this.offseasonConfig.transferByTeamPerformance.poorRecord;
            if (Math.random() < config.probability) {
                return {
                    action: 'transfer',
                    reason: '球队战绩不佳，寻求更好发展',
                    destination: this.findTransferDestination(player)
                };
            }
        }
        
        // 默认留队
        return { action: 'stay' };
    }
    
    /**
     * 计算潜力衰减
     * @param {Object} player - 球员对象
     * @returns {Object} 衰减信息
     */
    calculatePotentialDecay(player) {
        const playerInfo = this.getPlayerInfo(player);
        const year = playerInfo.year || 1;
        const age = playerInfo.age || 18;
        
        // 获取年级相关衰减
        const yearConfig = this.offseasonConfig.potentialDecay[`year${Math.min(year, 5)}`];
        const yearDecay = yearConfig
            ? yearConfig.minDecay + Math.random() * (yearConfig.maxDecay - yearConfig.minDecay)
            : 0;
        
        // 获取年龄相关衰减
        const ageDecay = this.offseasonConfig.ageDecay[Math.min(age, 25)] || 12;
        
        // 综合衰减（取较大值）
        const totalDecay = Math.max(yearDecay, ageDecay);
        const roundedDecay = Math.round(totalDecay);
        
        let reason = '';
        if (yearDecay > ageDecay) {
            reason = `年级增长 (${year}年级)`;
        } else {
            reason = `年龄增长 (${age}岁)`;
        }
        
        return {
            amount: roundedDecay,
            reason: reason
        };
    }
    
    /**
     * 寻找转会目标球队
     * @param {Object} player - 球员对象
     * @returns {string} 目标球队名称
     */
    findTransferDestination(player) {
        const state = this.gameStateManager.getState();
        const allTeams = state.allTeams || [];
        
        if (allTeams.length === 0) {
            return '其他学校';
        }
        
        // 随机选择一个球队（简化逻辑，实际应该考虑球队需求等）
        const randomTeam = allTeams[Math.floor(Math.random() * allTeams.length)];
        return randomTeam.name || '其他学校';
    }
    
    /**
     * 获取球队战绩
     * @param {Object} team - 球队对象
     * @returns {Object} 战绩信息
     */
    getTeamRecord(team) {
        const stats = team.stats || {};
        const wins = stats.wins || 0;
        const losses = stats.losses || 0;
        const total = wins + losses;
        
        return {
            wins: wins,
            losses: losses,
            winRate: total > 0 ? wins / total : 0.5
        };
    }
    
    /**
     * 获取标准化球员信息
     * @param {Object} player - 球员对象
     * @returns {Object} 标准化信息
     */
    getPlayerInfo(player) {
        return {
            id: player.id || 0,
            name: player.name || 'Unknown',
            year: player.year || 1,
            age: player.age || 18,
            rating: player.rating || (player.getOverallRating ? player.getOverallRating() : 60),
            potential: player.potential || 70,
            position: player.position || 'SF',
            seasonStats: player.seasonStats || { games: 0, minutes: 0 }
        };
    }
    
    /**
     * 生成休赛期变动摘要
     * @param {Object} report - 休赛期报告
     * @returns {string} 摘要文本
     */
    generateOffseasonSummary(report) {
        const parts = [];
        
        if (report.graduations.length > 0) {
            parts.push(`${report.graduations.length}名球员毕业`);
        }
        if (report.transfers.length > 0) {
            parts.push(`${report.transfers.length}名球员转会`);
        }
        if (report.retirements.length > 0) {
            parts.push(`${report.retirements.length}名球员退役`);
        }
        if (report.potentialDecays.length > 0) {
            const avgDecay = report.potentialDecays.reduce((sum, d) => sum + d.decayAmount, 0) / report.potentialDecays.length;
            parts.push(`平均潜力衰减${avgDecay.toFixed(1)}点`);
        }
        
        return parts.length > 0 ? parts.join('，') : '本赛季无重大变动';
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OffseasonManager;
}
