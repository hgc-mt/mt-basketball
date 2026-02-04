/**
 * 招募竞争系统
 * 实现AI球队之间的竞争招募机制，包括球员兴趣度、多球队谈判、竞争难度动态调整
 */

class RecruitmentCompetitionSystem {
    constructor(gameStateManager, aiCoachingSystem) {
        this.gameStateManager = gameStateManager;
        this.aiCoachingSystem = aiCoachingSystem;
        
        // AI球队数据库
        this.aiTeams = new Map();
        
        // 球员招募状态跟踪
        this.playerRecruitmentStatus = new Map();
        
        // 竞争配置
        this.competitionConfig = {
            // 基础竞争强度
            baseCompetitionIntensity: 0.6,
            
            // 根据球员潜力调整竞争强度
            potentialCompetitionMultiplier: {
                elite: 1.5,      // 90+ 潜力：极高竞争
                excellent: 1.2,  // 80-89 潜力：高竞争
                good: 0.9,       // 70-79 潜力：中等竞争
                normal: 0.6      // <70 潜力：低竞争
            },
            
            // AI球队数量配置
            aiTeamCount: {
                min: 2,
                max: 5
            },
            
            // 兴趣度衰减配置
            interestDecay: {
                dailyDecay: 2,           // 每日自然衰减
                competingOfferPenalty: 5, // 竞争对手报价惩罚
                timePressureBonus: 3     // 时间紧迫奖励
            },
            
            // 招募周期配置
            recruitmentCycle: {
                freshman: 14,    // 新生招募：14天
                transfer: 7,     // 转会招募：7天
                freeAgent: 5     // 自由球员：5天
            }
        };
        
        // AI球队名称池
        this.aiTeamNames = [
            '杜克蓝魔', '肯塔基野猫', '北卡焦油踵', '堪萨斯松鸦鹰',
            '密歇根州立斯巴达人', '佛罗里达短吻鳄', '亚利桑那野猫',
            '雪城橘子人', '康涅狄格哈士奇', '俄亥俄州立七叶树',
            '印第安纳胡希尔人', '德克萨斯长角牛', '加州大学洛杉矶分校棕熊',
            '维拉诺瓦野猫', '贡萨加斗牛犬', '贝勒熊', '休斯顿美洲狮',
            '阿肯色野猪', '田纳西志愿者', '普渡锅炉工'
        ];
        
        // 初始化AI球队
        this.initializeAITeams();
    }
    
    /**
     * 初始化AI球队
     */
    initializeAITeams() {
        const styles = ['STAR_DEVELOPER', 'BALANCED_TEAM', 'DEFENSIVE_MINDED', 'OFFENSIVE_GURU'];
        
        // 创建8-12支AI球队
        const teamCount = 8 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < teamCount; i++) {
            const teamId = `ai_team_${i}`;
            const teamName = this.aiTeamNames[i % this.aiTeamNames.length];
            const style = styles[Math.floor(Math.random() * styles.length)];
            
            // 生成AI球队阵容
            const roster = this.generateAIRoster(teamId, style);
            
            // 创建AI球队
            const aiTeam = this.aiCoachingSystem.createAITeam(teamId, teamName, style, roster);
            
            if (aiTeam) {
                // 添加额外招募相关属性
                aiTeam.recruitment = {
                    reputation: this.calculateTeamReputation(roster),  // 声望 50-95
                    facilities: 50 + Math.floor(Math.random() * 45),   // 设施 50-95
                    academicPrestige: 50 + Math.floor(Math.random() * 45), // 学术声望
                    recentSuccess: Math.floor(Math.random() * 100),    // 近期战绩
                    activeTargets: new Set(),                          // 正在招募的目标
                    scholarshipsAvailable: 13 - roster.length,         // 剩余奖学金名额
                    recruitmentBudget: 500000 + Math.floor(Math.random() * 1000000), // 招募预算
                    priorityNeeds: this.identifyTeamNeeds(roster)      // 阵容需求
                };
                
                this.aiTeams.set(teamId, aiTeam);
            }
        }
        
        console.log(`[招募竞争系统] 已创建 ${this.aiTeams.size} 支AI球队`);
    }
    
    /**
     * 生成AI球队阵容
     */
    generateAIRoster(teamId, style) {
        const roster = [];
        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        
        // 每个位置1-2名球员
        positions.forEach(pos => {
            const count = 1 + Math.floor(Math.random() * 2);
            for (let i = 0; i < count; i++) {
                roster.push({
                    id: `${teamId}_${pos}_${i}`,
                    position: pos,
                    year: 1 + Math.floor(Math.random() * 4),
                    rating: 60 + Math.floor(Math.random() * 25)
                });
            }
        });
        
        // 添加一些替补
        const benchCount = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < benchCount; i++) {
            roster.push({
                id: `${teamId}_bench_${i}`,
                position: positions[Math.floor(Math.random() * positions.length)],
                year: 1 + Math.floor(Math.random() * 4),
                rating: 55 + Math.floor(Math.random() * 20)
            });
        }
        
        return roster;
    }
    
    /**
     * 计算球队声望
     */
    calculateTeamReputation(roster) {
        if (roster.length === 0) return 50;
        const avgRating = roster.reduce((sum, p) => sum + p.rating, 0) / roster.length;
        return Math.min(95, Math.max(50, Math.round(avgRating + 10)));
    }
    
    /**
     * 识别球队阵容需求
     */
    identifyTeamNeeds(roster) {
        const needs = [];
        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        
        // 统计各位置人数
        const positionCount = {};
        positions.forEach(pos => positionCount[pos] = 0);
        roster.forEach(player => {
            if (positionCount[player.position] !== undefined) {
                positionCount[player.position]++;
            }
        });
        
        // 找出人数不足的位置
        positions.forEach(pos => {
            if (positionCount[pos] < 2) {
                needs.push({
                    position: pos,
                    priority: positionCount[pos] === 0 ? 'high' : 'medium',
                    type: 'position_need'
                });
            }
        });
        
        // 检查是否需要高潜力球员
        const youngTalent = roster.filter(p => p.year <= 2 && p.rating >= 75).length;
        if (youngTalent < 2) {
            needs.push({
                priority: 'high',
                type: 'young_talent',
                description: '需要年轻天才球员'
            });
        }
        
        return needs;
    }
    
    /**
     * 初始化球员招募状态
     */
    initializePlayerRecruitment(player) {
        const status = {
            playerId: player.id,
            playerName: player.name,
            
            // 球员对各球队的兴趣度 Map<teamId, interest>
            teamInterest: new Map(),
            
            // 球员对玩家球队的兴趣度
            playerInterestInUser: this.calculateInitialInterest(player, 'user'),
            
            // 正在竞争的AI球队
            competingTeams: [],
            
            // 招募阶段
            stage: 'initial',  // initial, interested, negotiating, committed, signed
            
            // 招募开始时间
            startTime: Date.now(),
            
            // 招募截止时间
            deadline: this.calculateDeadline(player.status),
            
            // 最高报价
            bestOffer: null,
            
            // 最后更新时间
            lastUpdate: Date.now(),
            
            // 竞争强度
            competitionIntensity: this.calculateCompetitionIntensity(player),
            
            // 是否已签约
            isSigned: false,
            
            // 签约球队
            signedWith: null
        };
        
        // 确定竞争球队
        status.competingTeams = this.selectCompetingTeams(player, status.competitionIntensity);
        
        // 初始化各球队兴趣度
        status.competingTeams.forEach(teamId => {
            const interest = this.calculateInitialInterest(player, teamId);
            status.teamInterest.set(teamId, interest);
        });
        
        this.playerRecruitmentStatus.set(player.id, status);
        
        // 通知AI球队开始招募
        this.notifyAITeamsOfNewPlayer(player, status.competingTeams);
        
        return status;
    }
    
    /**
     * 计算初始兴趣度
     */
    calculateInitialInterest(player, teamId) {
        let baseInterest = 30 + Math.floor(Math.random() * 20); // 30-50基础值
        
        if (teamId === 'user') {
            // 玩家球队基础值
            const state = this.gameStateManager.getState();
            const userTeam = state.userTeam || {};
            
            // 根据玩家球队声望调整
            const teamRep = userTeam.reputation || 60;
            baseInterest += (teamRep - 60) * 0.3;
            
            // 根据球员类型调整
            if (player.status === 'freshman_recruit') {
                // 新生更看重学术声望和发展机会
                baseInterest += 5;
            } else if (player.status === 'transfer_wanted') {
                // 转学生更看重即战力机会
                baseInterest += userTeam.recentSuccess > 70 ? 10 : -5;
            }
        } else {
            // AI球队
            const aiTeam = this.aiTeams.get(teamId);
            if (aiTeam) {
                // 声望影响
                baseInterest += (aiTeam.recruitment.reputation - 60) * 0.4;
                
                // 设施影响
                baseInterest += (aiTeam.recruitment.facilities - 60) * 0.2;
                
                // 阵容需求匹配度
                const needs = aiTeam.recruitment.priorityNeeds;
                const positionNeed = needs.find(n => n.position === player.position);
                if (positionNeed) {
                    baseInterest += positionNeed.priority === 'high' ? 15 : 8;
                }
                
                // 教练风格匹配
                const style = aiTeam.style;
                if (this.isPlayerStyleMatch(player, style)) {
                    baseInterest += 10;
                }
            }
        }
        
        // 潜力影响兴趣度
        if (player.potential >= 90) baseInterest += 10;
        else if (player.potential >= 80) baseInterest += 5;
        
        // 当前能力值影响
        const rating = player.rating || player.getOverallRating?.() || 50;
        if (rating >= 80) baseInterest += 8;
        else if (rating >= 70) baseInterest += 4;
        
        return Math.max(10, Math.min(90, Math.round(baseInterest)));
    }
    
    /**
     * 判断球员与教练风格是否匹配
     */
    isPlayerStyleMatch(player, style) {
        const attrs = player.attributes || {};
        
        switch (style.id) {
            case 'STAR_DEVELOPER':
                return (attrs.scoring > 75 || attrs.shooting > 75) && player.potential >= 85;
            case 'DEFENSIVE_MINDED':
                return attrs.defense > 70 || attrs.stealing > 70 || attrs.blocking > 70;
            case 'OFFENSIVE_GURU':
                return attrs.scoring > 70 || attrs.shooting > 70 || attrs.passing > 70;
            default:
                return true;
        }
    }
    
    /**
     * 选择竞争球队
     */
    selectCompetingTeams(player, intensity) {
        const numTeams = Math.min(
            this.aiTeams.size,
            this.competitionConfig.aiTeamCount.min + 
            Math.floor(intensity * (this.competitionConfig.aiTeamCount.max - this.competitionConfig.aiTeamCount.min))
        );
        
        // 根据球员特点筛选合适的AI球队
        const suitableTeams = [];
        
        this.aiTeams.forEach((team, teamId) => {
            let score = 0;
            
            // 阵容需求匹配
            const needs = team.recruitment.priorityNeeds;
            const positionNeed = needs.find(n => n.position === player.position);
            if (positionNeed) {
                score += positionNeed.priority === 'high' ? 30 : 15;
            }
            
            // 风格匹配
            if (this.isPlayerStyleMatch(player, team.style)) {
                score += 20;
            }
            
            // 预算充足度
            const estimatedCost = this.estimateRecruitmentCost(player);
            if (team.recruitment.recruitmentBudget >= estimatedCost) {
                score += 15;
            }
            
            // 奖学金名额
            if (team.recruitment.scholarshipsAvailable > 0) {
                score += 20;
            }
            
            // 声望匹配（高潜力球员更倾向于高声望球队）
            if (player.potential >= 85) {
                score += (team.recruitment.reputation - 50) * 0.3;
            }
            
            suitableTeams.push({ teamId, score });
        });
        
        // 按分数排序并选择前N个
        suitableTeams.sort((a, b) => b.score - a.score);
        return suitableTeams.slice(0, numTeams).map(t => t.teamId);
    }
    
    /**
     * 估算招募成本
     */
    estimateRecruitmentCost(player) {
        const baseCost = 50000;
        const potentialBonus = (player.potential - 60) * 2000;
        const ratingBonus = ((player.rating || 50) - 50) * 1500;
        return baseCost + potentialBonus + ratingBonus;
    }
    
    /**
     * 计算竞争强度
     */
    calculateCompetitionIntensity(player) {
        let intensity = this.competitionConfig.baseCompetitionIntensity;
        
        // 根据潜力调整
        if (player.potential >= 90) {
            intensity *= this.competitionConfig.potentialCompetitionMultiplier.elite;
        } else if (player.potential >= 80) {
            intensity *= this.competitionConfig.potentialCompetitionMultiplier.excellent;
        } else if (player.potential >= 70) {
            intensity *= this.competitionConfig.potentialCompetitionMultiplier.good;
        } else {
            intensity *= this.competitionConfig.potentialCompetitionMultiplier.normal;
        }
        
        // 根据球员类型调整
        if (player.status === 'transfer_wanted') {
            intensity *= 1.3; // 转学生竞争更激烈
        }
        
        // 根据当前能力值调整
        const rating = player.rating || player.getOverallRating?.() || 50;
        if (rating >= 80) {
            intensity *= 1.2;
        }
        
        return Math.min(1.0, intensity);
    }
    
    /**
     * 计算招募截止时间
     */
    calculateDeadline(playerStatus) {
        const days = this.competitionConfig.recruitmentCycle[playerStatus] || 
                     this.competitionConfig.recruitmentCycle.freshman;
        return Date.now() + days * 24 * 60 * 60 * 1000;
    }
    
    /**
     * 通知AI球队有新球员可招募
     */
    notifyAITeamsOfNewPlayer(player, teamIds) {
        teamIds.forEach(teamId => {
            const team = this.aiTeams.get(teamId);
            if (team) {
                team.recruitment.activeTargets.add(player.id);
                
                // AI评估是否重点招募
                const priority = this.evaluateRecruitmentPriority(team, player);
                
                console.log(`[AI招募] ${team.name} 开始关注 ${player.name}，优先级: ${priority}`);
            }
        });
    }
    
    /**
     * AI评估招募优先级
     */
    evaluateRecruitmentPriority(aiTeam, player) {
        let score = 0;
        
        // 阵容需求
        const needs = aiTeam.recruitment.priorityNeeds;
        const positionNeed = needs.find(n => n.position === player.position);
        if (positionNeed?.priority === 'high') score += 40;
        else if (positionNeed?.priority === 'medium') score += 20;
        
        // 球员质量
        if (player.potential >= 90) score += 30;
        else if (player.potential >= 80) score += 20;
        else if (player.potential >= 70) score += 10;
        
        const rating = player.rating || player.getOverallRating?.() || 50;
        if (rating >= 80) score += 20;
        else if (rating >= 70) score += 10;
        
        // 预算充足度
        const cost = this.estimateRecruitmentCost(player);
        if (aiTeam.recruitment.recruitmentBudget >= cost * 2) score += 10;
        
        if (score >= 70) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    }
    
    /**
     * 更新招募状态（每日调用）
     */
    updateRecruitmentStatus() {
        this.playerRecruitmentStatus.forEach((status, playerId) => {
            if (status.isSigned) return;
            
            // 检查是否超时
            if (Date.now() > status.deadline) {
                this.resolveRecruitment(playerId, 'timeout');
                return;
            }
            
            // AI球队行动
            this.processAITeamActions(status);
            
            // 更新兴趣度
            this.updateInterestLevels(status);
            
            // 检查是否有球队可以签约
            this.checkForCommitment(status);
            
            status.lastUpdate = Date.now();
        });
    }
    
    /**
     * 处理AI球队行动
     */
    processAITeamActions(status) {
        status.competingTeams.forEach(teamId => {
            const team = this.aiTeams.get(teamId);
            if (!team) return;
            
            const currentInterest = status.teamInterest.get(teamId) || 0;
            
            // AI决策：是否增加投入
            const priority = this.evaluateRecruitmentPriority(team, { 
                id: status.playerId, 
                potential: 75 // 简化处理
            });
            
            if (priority === 'high' && Math.random() < 0.4) {
                // 高优先级：大幅增加兴趣度
                const increase = 5 + Math.floor(Math.random() * 10);
                status.teamInterest.set(teamId, Math.min(100, currentInterest + increase));
                
                // 消耗预算
                team.recruitment.recruitmentBudget -= 10000;
                
                console.log(`[AI行动] ${team.name} 加大招募投入，兴趣度提升至 ${status.teamInterest.get(teamId)}`);
            } else if (priority === 'medium' && Math.random() < 0.2) {
                // 中优先级：适度增加
                const increase = 3 + Math.floor(Math.random() * 5);
                status.teamInterest.set(teamId, Math.min(100, currentInterest + increase));
            }
        });
    }
    
    /**
     * 更新兴趣度
     */
    updateInterestLevels(status) {
        const decay = this.competitionConfig.interestDecay.dailyDecay;
        
        // 玩家兴趣度自然衰减
        status.playerInterestInUser = Math.max(0, status.playerInterestInUser - decay);
        
        // AI球队兴趣度自然衰减
        status.teamInterest.forEach((interest, teamId) => {
            const newInterest = Math.max(0, interest - decay);
            status.teamInterest.set(teamId, newInterest);
        });
        
        // 竞争压力影响
        const maxAIInterest = Math.max(0, ...status.teamInterest.values());
        if (maxAIInterest > status.playerInterestInUser) {
            // AI领先时，玩家需要更努力
            status.playerInterestInUser -= 2;
        }
    }
    
    /**
     * 检查是否可以签约
     */
    checkForCommitment(status) {
        // 找出兴趣度最高的球队
        let maxInterest = status.playerInterestInUser;
        let leadingTeam = 'user';
        
        status.teamInterest.forEach((interest, teamId) => {
            if (interest > maxInterest) {
                maxInterest = interest;
                leadingTeam = teamId;
            }
        });
        
        // 如果兴趣度达到阈值且领先明显，可以签约
        if (maxInterest >= 80) {
            const secondMax = this.getSecondHighestInterest(status);
            if (maxInterest - secondMax >= 15) {
                this.resolveRecruitment(status.playerId, 'commitment', leadingTeam);
            }
        }
    }
    
    /**
     * 获取第二高的兴趣度
     */
    getSecondHighestInterest(status) {
        const interests = [status.playerInterestInUser, ...status.teamInterest.values()];
        interests.sort((a, b) => b - a);
        return interests[1] || 0;
    }
    
    /**
     * 解决招募结果
     */
    resolveRecruitment(playerId, reason, winningTeam = null) {
        const status = this.playerRecruitmentStatus.get(playerId);
        if (!status || status.isSigned) return;
        
        status.isSigned = true;
        status.signedWith = winningTeam;
        
        if (reason === 'commitment' && winningTeam) {
            if (winningTeam === 'user') {
                console.log(`[招募结果] ${status.playerName} 承诺加入玩家球队！`);
                this.showNotification(`${status.playerName} 已承诺加入你的球队！`, 'success');
            } else {
                const team = this.aiTeams.get(winningTeam);
                console.log(`[招募结果] ${status.playerName} 被 ${team?.name || winningTeam} 签下`);
                this.showNotification(`${status.playerName} 已被 ${team?.name || '其他球队'} 签下`, 'warning');
            }
        } else if (reason === 'timeout') {
            console.log(`[招募结果] ${status.playerName} 招募期结束，未签约`);
        }
        
        // 从AI球队目标列表中移除
        status.competingTeams.forEach(teamId => {
            const team = this.aiTeams.get(teamId);
            if (team) {
                team.recruitment.activeTargets.delete(playerId);
            }
        });
    }
    
    /**
     * 玩家采取行动提升兴趣度
     */
    playerTakeAction(playerId, actionType, actionData = {}) {
        const status = this.playerRecruitmentStatus.get(playerId);
        if (!status || status.isSigned) {
            return { success: false, message: '该球员已不可招募' };
        }
        
        let interestIncrease = 0;
        let cost = 0;
        let message = '';
        
        switch (actionType) {
            case 'campus_visit':
                // 校园参观
                interestIncrease = 8 + Math.floor(Math.random() * 7);
                cost = 5000;
                message = '校园参观给球员留下了深刻印象';
                break;
                
            case 'home_visit':
                // 家访
                interestIncrease = 10 + Math.floor(Math.random() * 10);
                cost = 8000;
                message = '家访增进了彼此了解';
                break;
                
            case 'offer_scholarship':
                // 提供奖学金
                interestIncrease = 15 + Math.floor(Math.random() * 10);
                cost = 0; // 奖学金不计入招募预算
                message = '奖学金offer让球员非常心动';
                break;
                
            case 'promise_playing_time':
                // 承诺上场时间
                interestIncrease = 5 + Math.floor(Math.random() * 10);
                cost = 0;
                message = '上场时间承诺增加了吸引力';
                break;
                
            case 'highlight_facilities':
                // 展示设施
                interestIncrease = 6 + Math.floor(Math.random() * 6);
                cost = 2000;
                message = '先进的训练设施令人印象深刻';
                break;
                
            case 'emphasize_academics':
                // 强调学术
                interestIncrease = 4 + Math.floor(Math.random() * 6);
                cost = 1000;
                message = '学术优势得到了认可';
                break;
                
            default:
                return { success: false, message: '未知的行动类型' };
        }
        
        // 应用增加
        const oldInterest = status.playerInterestInUser;
        status.playerInterestInUser = Math.min(100, status.playerInterestInUser + interestIncrease);
        const actualIncrease = status.playerInterestInUser - oldInterest;
        
        // 扣除预算
        if (cost > 0) {
            const state = this.gameStateManager.getState();
            if (state.recruitmentBudget !== undefined) {
                state.recruitmentBudget -= cost;
                this.gameStateManager.set('recruitmentBudget', state.recruitmentBudget);
            }
        }
        
        return {
            success: true,
            interestIncrease: actualIncrease,
            newInterest: status.playerInterestInUser,
            cost,
            message
        };
    }
    
    /**
     * 获取球员招募状态（供UI使用）
     */
    getPlayerRecruitmentStatus(playerId) {
        let status = this.playerRecruitmentStatus.get(playerId);
        
        // 如果没有初始化，先初始化
        if (!status) {
            const state = this.gameStateManager.getState();
            const player = state.availablePlayers?.find(p => p.id === playerId);
            if (player) {
                status = this.initializePlayerRecruitment(player);
            }
        }
        
        if (!status) return null;
        
        // 转换为普通对象供UI使用
        return {
            playerId: status.playerId,
            playerName: status.playerName,
            playerInterestInUser: status.playerInterestInUser,
            competingTeams: status.competingTeams.map(teamId => {
                const team = this.aiTeams.get(teamId);
                return {
                    teamId,
                    teamName: team?.name || teamId,
                    interest: status.teamInterest.get(teamId) || 0,
                    reputation: team?.recruitment?.reputation || 50
                };
            }),
            stage: status.stage,
            deadline: status.deadline,
            competitionIntensity: status.competitionIntensity,
            isSigned: status.isSigned,
            signedWith: status.signedWith,
            daysRemaining: Math.ceil((status.deadline - Date.now()) / (24 * 60 * 60 * 1000))
        };
    }
    
    /**
     * 获取所有活跃招募
     */
    getActiveRecruitments() {
        const active = [];
        this.playerRecruitmentStatus.forEach((status, playerId) => {
            if (!status.isSigned) {
                active.push(this.getPlayerRecruitmentStatus(playerId));
            }
        });
        return active;
    }
    
    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        if (typeof window !== 'undefined' && window.app?.showNotification) {
            window.app.showNotification(message, type);
        }
        console.log(`[招募通知] ${type}: ${message}`);
    }
    
    /**
     * 保存状态
     */
    saveState() {
        const state = {
            aiTeams: Array.from(this.aiTeams.entries()).map(([id, team]) => ({
                id,
                name: team.name,
                style: team.style.id,
                recruitment: {
                    reputation: team.recruitment.reputation,
                    facilities: team.recruitment.facilities,
                    academicPrestige: team.recruitment.academicPrestige,
                    recruitmentBudget: team.recruitment.recruitmentBudget,
                    scholarshipsAvailable: team.recruitment.scholarshipsAvailable,
                    activeTargets: Array.from(team.recruitment.activeTargets)
                }
            })),
            playerRecruitmentStatus: Array.from(this.playerRecruitmentStatus.entries()).map(([id, status]) => ({
                playerId: id,
                playerInterestInUser: status.playerInterestInUser,
                teamInterest: Array.from(status.teamInterest.entries()),
                competingTeams: status.competingTeams,
                stage: status.stage,
                startTime: status.startTime,
                deadline: status.deadline,
                isSigned: status.isSigned,
                signedWith: status.signedWith
            }))
        };
        
        return state;
    }
    
    /**
     * 加载状态
     */
    loadState(state) {
        if (!state) return;
        
        // 恢复AI球队
        if (state.aiTeams) {
            state.aiTeams.forEach(teamData => {
                const existingTeam = this.aiTeams.get(teamData.id);
                if (existingTeam && teamData.recruitment) {
                    existingTeam.recruitment = {
                        ...existingTeam.recruitment,
                        ...teamData.recruitment,
                        activeTargets: new Set(teamData.recruitment.activeTargets || [])
                    };
                }
            });
        }
        
        // 恢复球员招募状态
        if (state.playerRecruitmentStatus) {
            state.playerRecruitmentStatus.forEach(data => {
                this.playerRecruitmentStatus.set(data.playerId, {
                    playerId: data.playerId,
                    playerName: data.playerName || '',
                    playerInterestInUser: data.playerInterestInUser,
                    teamInterest: new Map(data.teamInterest || []),
                    competingTeams: data.competingTeams || [],
                    stage: data.stage || 'initial',
                    startTime: data.startTime,
                    deadline: data.deadline,
                    isSigned: data.isSigned,
                    signedWith: data.signedWith,
                    lastUpdate: Date.now()
                });
            });
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecruitmentCompetitionSystem;
}
