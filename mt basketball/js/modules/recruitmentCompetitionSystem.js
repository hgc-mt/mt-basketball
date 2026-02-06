/**
 * 招募竞争系统
 * 实现AI球队之间的竞争招募机制，包括球员兴趣度、多球队谈判、竞争难度动态调整
 * 使用游戏内已存在的球队作为竞争对手
 */

class RecruitmentCompetitionSystem {
    constructor(gameStateManager, aiCoachingSystem) {
        this.gameStateManager = gameStateManager;
        this.aiCoachingSystem = aiCoachingSystem;
        
        // AI球队数据库 - 使用游戏内现有球队
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
            
            // 招募周期配置 - 与完整休赛期对齐（约7个月）
            recruitmentCycle: {
                // 早期招募期（3-5月）：球员初步接触，建立关系
                earlyPhase: {
                    freshman: 60,    // 新生招募：60天
                    transfer: 45,    // 转学生：45天
                    freeAgent: 30    // 自由球员：30天
                },
                // 招募高峰期（6-8月）：主要决策期
                peakPhase: {
                    freshman: 90,    // 新生招募：90天
                    transfer: 60,    // 转学生：60天
                    freeAgent: 45    // 自由球员：45天
                },
                // 招募冲刺期（9-10月）：最终签约期
                latePhase: {
                    freshman: 30,    // 新生招募：30天
                    transfer: 21,    // 转学生：21天
                    freeAgent: 14    // 自由球员：14天
                }
            }
        };
        
        // 延迟初始化，等待游戏状态加载完成
        this.isInitialized = false;
    }
    
    /**
     * 初始化AI球队 - 使用游戏内现有球队
     */
    initializeAITeams() {
        if (this.isInitialized) return;
        
        const state = this.gameStateManager.getState();
        const allTeams = state.allTeams || [];
        const userTeam = state.userTeam;
        
        if (allTeams.length === 0) {
            console.warn('[招募竞争系统] 游戏球队数据尚未加载，延迟初始化');
            return;
        }
        
        const styles = ['STAR_DEVELOPER', 'BALANCED_TEAM', 'DEFENSIVE_MINDED', 'OFFENSIVE_GURU'];
        
        // 使用游戏内除玩家球队外的所有球队
        allTeams.forEach((team, index) => {
            // 跳过玩家球队
            if (userTeam && team.id === userTeam.id) return;
            
            const teamId = team.id || `team_${index}`;
            const teamName = team.name || `球队${index + 1}`;
            const style = styles[Math.floor(Math.random() * styles.length)];
            
            // 使用球队现有阵容
            const roster = team.roster || team.players || [];
            
            // 创建AI球队数据
            const aiTeam = {
                id: teamId,
                name: teamName,
                style: this.aiCoachingSystem.coachingStyles[style],
                roster: roster,
                team: team, // 保存原始球队引用
                recruitment: {
                    reputation: this.calculateTeamReputation(roster),
                    facilities: team.facilities || (50 + Math.floor(Math.random() * 45)),
                    academicPrestige: team.academicPrestige || (50 + Math.floor(Math.random() * 45)),
                    recentSuccess: team.recentSuccess || Math.floor(Math.random() * 100),
                    activeTargets: new Set(),
                    scholarshipsAvailable: team.scholarshipsAvailable || Math.max(0, 13 - roster.length),
                    recruitmentBudget: team.recruitmentBudget || (500000 + Math.floor(Math.random() * 1000000)),
                    priorityNeeds: this.identifyTeamNeeds(roster)
                }
            };
            
            this.aiTeams.set(teamId, aiTeam);
        });
        
        this.isInitialized = true;
        console.log(`[招募竞争系统] 已加载 ${this.aiTeams.size} 支游戏内球队作为竞争对手`);
    }
    
    /**
     * 确保系统已初始化
     */
    ensureInitialized() {
        if (!this.isInitialized) {
            this.initializeAITeams();
        }
    }
    
    /**
     * 计算球队声望
     */
    calculateTeamReputation(roster) {
        if (!roster || roster.length === 0) return 50;
        
        // 计算平均能力值
        const avgRating = roster.reduce((sum, p) => {
            const rating = p.rating || (p.getOverallRating ? p.getOverallRating() : 60);
            return sum + rating;
        }, 0) / roster.length;
        
        // 考虑球队战绩历史（如果有）
        const historicalBonus = 0; // 可以从球队历史数据中获取
        
        return Math.min(95, Math.max(50, Math.round(avgRating + historicalBonus)));
    }
    
    /**
     * 识别球队阵容需求
     */
    identifyTeamNeeds(roster) {
        const needs = [];
        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        
        if (!roster || roster.length === 0) {
            // 如果阵容为空，所有位置都需要
            positions.forEach(pos => {
                needs.push({ position: pos, priority: 'high', type: 'position_need' });
            });
            return needs;
        }
        
        // 统计各位置人数
        const positionCount = {};
        positions.forEach(pos => positionCount[pos] = 0);
        
        roster.forEach(player => {
            const pos = player.position || 'SF';
            if (positionCount[pos] !== undefined) {
                positionCount[pos]++;
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
        const youngTalent = roster.filter(p => {
            const year = p.year || 1;
            const rating = p.rating || (p.getOverallRating ? p.getOverallRating() : 60);
            return year <= 2 && rating >= 75;
        }).length;
        
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
        // 确保系统已初始化
        this.ensureInitialized();
        
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
        const rating = player.rating || (player.getOverallRating ? player.getOverallRating() : 50);
        if (rating >= 80) baseInterest += 8;
        else if (rating >= 70) baseInterest += 4;
        
        return Math.max(10, Math.min(90, Math.round(baseInterest)));
    }
    
    /**
     * 判断球员与教练风格是否匹配
     */
    isPlayerStyleMatch(player, style) {
        if (!style || !style.preferredAttributes) return true;
        
        const attrs = player.attributes || {};
        
        // 检查球员是否具备教练偏好的属性
        const preferredAttrs = style.preferredAttributes || [];
        let matchCount = 0;
        
        preferredAttrs.forEach(attr => {
            if (attrs[attr] >= 70) matchCount++;
        });
        
        return matchCount >= preferredAttrs.length * 0.5;
    }
    
    /**
     * 选择竞争球队
     */
    selectCompetingTeams(player, intensity) {
        // 确保系统已初始化
        this.ensureInitialized();
        
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
        const rating = player.rating || (player.getOverallRating ? player.getOverallRating() : 50);
        const ratingBonus = (rating - 50) * 1500;
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
        const rating = player.rating || (player.getOverallRating ? player.getOverallRating() : 50);
        if (rating >= 80) {
            intensity *= 1.2;
        }
        
        return Math.min(1.0, intensity);
    }
    
    /**
     * 计算招募截止时间 - 基于完整休赛期（约7个月）
     * 大学篮球休赛期通常从3月（赛季结束）到11月（新赛季开始）
     * 招募活动贯穿整个休赛期，分为三个阶段：
     * - 早期招募期（3-5月）：60天
     * - 招募高峰期（6-8月）：90天
     * - 招募冲刺期（9-10月）：30天
     */
    calculateDeadline(playerStatus) {
        const state = this.gameStateManager.getState();
        const currentDate = state.currentDate ? new Date(state.currentDate) : new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        
        // 确定当前处于哪个招募阶段
        const phase = this.getRecruitmentPhase(currentDate);
        
        // 获取对应阶段的招募周期配置
        let daysToAdd;
        const cycleConfig = this.competitionConfig.recruitmentCycle;
        
        switch (phase.phase) {
            case 'early_recruitment':
                daysToAdd = cycleConfig.earlyPhase[playerStatus] || cycleConfig.earlyPhase.freshman;
                break;
            case 'peak_recruitment':
                daysToAdd = cycleConfig.peakPhase[playerStatus] || cycleConfig.peakPhase.freshman;
                break;
            case 'late_recruitment':
                daysToAdd = cycleConfig.latePhase[playerStatus] || cycleConfig.latePhase.freshman;
                break;
            default:
                // 赛季期间，使用最短的冲刺期
                daysToAdd = cycleConfig.latePhase[playerStatus] || 14;
        }
        
        // 计算截止日期
        let deadline = new Date(currentDate);
        deadline.setDate(deadline.getDate() + daysToAdd);
        
        // 休赛期结束时间（新赛季开始）：11月1日
        const offseasonEnd = new Date(currentYear, 10, 1); // 11月1日
        if (currentDate > offseasonEnd) {
            offseasonEnd.setFullYear(currentYear + 1);
        }
        
        // 确保截止日期不超过休赛期结束（给签约留1周时间）
        const maxDeadline = new Date(offseasonEnd);
        maxDeadline.setDate(maxDeadline.getDate() - 7);
        
        if (deadline > maxDeadline) {
            deadline = maxDeadline;
        }
        
        return deadline.getTime();
    }
    
    /**
     * 获取招募阶段描述 - 与完整休赛期对齐
     * 大学篮球招募周期（3月-10月，约7个月）：
     * - 早期招募期（3-5月）：初步接触，建立关系，周期60天
     * - 招募高峰期（6-8月）：主要决策期，校园访问，周期90天
     * - 招募冲刺期（9-10月）：最终承诺和签约，周期30天
     */
    getRecruitmentPhase(currentDate) {
        const date = currentDate ? new Date(currentDate) : new Date();
        const month = date.getMonth(); // 0-11
        
        // 大学篮球招募周期
        if (month >= 2 && month <= 4) { // 3-5月：早期招募期
            return {
                phase: 'early_recruitment',
                name: '早期招募期',
                description: '赛季刚结束，球员开始初步评估。建议建立联系，了解球员需求',
                duration: '约60天',
                tips: '此阶段竞争相对缓和，是建立关系的好时机',
                intensity: 'low'
            };
        } else if (month >= 5 && month <= 7) { // 6-8月：招募高峰期
            return {
                phase: 'peak_recruitment',
                name: '招募高峰期',
                description: '夏季是招募最活跃的时期，球员进行校园访问，做出重要决定',
                duration: '约90天',
                tips: '竞争最激烈，需要积极展示球队优势',
                intensity: 'high'
            };
        } else if (month >= 8 && month <= 9) { // 9-10月：招募冲刺期
            return {
                phase: 'late_recruitment',
                name: '招募冲刺期',
                description: '招募即将结束，球员需要做出最终承诺。时间紧迫，决策加速',
                duration: '约30天',
                tips: '最后机会，可以考虑提供更有吸引力的条件',
                intensity: 'critical'
            };
        } else { // 11月-次年2月：赛季进行中
            return {
                phase: 'season',
                name: '赛季进行中',
                description: '常规赛期间，招募活动受限。只能接触已承诺球员或紧急补员',
                duration: '有限',
                tips: '关注现有阵容，为下赛季做准备',
                intensity: 'restricted'
            };
        }
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
        
        const rating = player.rating || (player.getOverallRating ? player.getOverallRating() : 50);
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
        // 确保系统已初始化
        this.ensureInitialized();
        
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
            daysRemaining: this.calculateDaysRemaining(status.deadline)
        };
    }
    
    /**
     * 计算剩余天数 - 使用游戏内时间
     * @param {number} deadline - 截止时间戳
     * @returns {number} 剩余天数
     */
    calculateDaysRemaining(deadline) {
        const state = this.gameStateManager.getState();
        const currentDate = state.currentDate ? new Date(state.currentDate) : new Date();
        const deadlineDate = new Date(deadline);
        
        const diffTime = deadlineDate - currentDate;
        const diffDays = Math.ceil(diffTime / (24 * 60 * 60 * 1000));
        
        return Math.max(0, diffDays);
    }
    
    /**
     * 获取所有活跃招募
     */
    getActiveRecruitments() {
        // 确保系统已初始化
        this.ensureInitialized();
        
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
        
        // 恢复AI球队招募数据
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
        
        this.isInitialized = true;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecruitmentCompetitionSystem;
}
