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
        
        // 承诺签约跟踪 - 存储玩家承诺的球员
        this.playerCommitments = new Map(); // playerId -> { committedAt, expiresAt, teamId }
        
        // 竞争配置
        this.competitionConfig = {
            // 基础竞争强度
            baseCompetitionIntensity: 0.4,
            
            // 根据球员潜力调整竞争强度
            potentialCompetitionMultiplier: {
                elite: 1.3,      // 90+ 潜力：极高竞争
                excellent: 1.0,  // 80-89 潜力：高竞争
                good: 0.7,       // 70-79 潜力：中等竞争
                normal: 0.4      // <70 潜力：低竞争
            },
            
            // AI球队数量配置
            aiTeamCount: {
                min: 1,
                max: 3
            },
            
            // 兴趣度衰减配置
            interestDecay: {
                dailyDecay: 3,           // 每日自然衰减（增加）
                competingOfferPenalty: 3, // 竞争对手报价惩罚（降低）
                timePressureBonus: 2     // 时间紧迫奖励（降低）
            },
            
            // AI签约配置
            aiSigning: {
                minInterestThreshold: 75,    // 最低兴趣度阈值（降低到75，让AI能正常签约）
                leadGapRequired: 15,          // 领先差距要求（降低到15）
                signingProbability: 0.35,     // 签约概率（提高到35%）
                actionProbability: {          // AI行动概率
                    high: 0.15,               // 高优先级（提高）
                    medium: 0.08,             // 中优先级（提高）
                    low: 0.03                 // 低优先级
                },
                interestIncrease: {           // AI兴趣度增加量
                    high: { min: 3, max: 6 },   // 高优先级（提高）
                    medium: { min: 2, max: 4 }  // 中优先级（提高）
                }
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
     * 计算球队声望 - 改进版
     * 基于球队实力而非潜力，考虑历史战绩和阵容深度
     */
    calculateTeamReputation(roster, teamHistory = null) {
        if (!roster || roster.length === 0) return 40;
        
        // 按能力值排序（不是潜力）
        const sortedRoster = [...roster].sort((a, b) => {
            const ratingA = a.rating || (a.getOverallRating ? a.getOverallRating() : 50);
            const ratingB = b.rating || (b.getOverallRating ? b.getOverallRating() : 50);
            return ratingB - ratingA;
        });
        
        // 计算加权实力（首发70%，替补20%，边缘10%）
        const top5 = sortedRoster.slice(0, 5);
        const bench = sortedRoster.slice(5, 10);
        const deep = sortedRoster.slice(10);
        
        let baseStrength = 0;
        
        if (top5.length > 0) {
            const top5Avg = top5.reduce((sum, p) => {
                return sum + (p.rating || (p.getOverallRating ? p.getOverallRating() : 50));
            }, 0) / top5.length;
            baseStrength += top5Avg * 0.70;
        }
        
        if (bench.length > 0) {
            const benchAvg = bench.reduce((sum, p) => {
                return sum + (p.rating || (p.getOverallRating ? p.getOverallRating() : 50));
            }, 0) / bench.length;
            baseStrength += benchAvg * 0.20;
        }
        
        if (deep.length > 0) {
            const deepAvg = deep.reduce((sum, p) => {
                return sum + (p.rating || (p.getOverallRating ? p.getOverallRating() : 50));
            }, 0) / deep.length;
            baseStrength += deepAvg * 0.10;
        }
        
        // 基础声望：实力占80%
        let reputation = baseStrength * 0.80;
        
        // 历史战绩加成（如果有）
        if (teamHistory) {
            const championshipBonus = (teamHistory.championships || 0) * 3;
            const playoffBonus = (teamHistory.playoffAppearances || 0) * 0.5;
            const recentSuccess = (teamHistory.recentWinRate || 0) * 10;
            reputation += championshipBonus + playoffBonus + recentSuccess;
        }
        
        // 阵容深度加成
        const rosterSize = roster.length;
        if (rosterSize >= 13) reputation += 2;
        else if (rosterSize < 11) reputation -= 3;
        
        return Math.min(99, Math.max(30, Math.round(reputation)));
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
        
        // 计算球员的报价期望
        const playerExpectations = this.calculatePlayerExpectations(player);
        
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
            stage: 'initial',  // initial, inquiry, interested, negotiating, committed, signed, rejected, insulted
            
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
            signedWith: null,
            
            // ===== 球员报价期望系统 =====
            // 球员期望配置
            expectations: playerExpectations,
            
            // 是否已经询问过初始报价
            hasInquired: false,
            
            // 是否被羞辱（报价低于最低要求）
            isInsulted: false,
            
            // 羞辱后消失时间
            disappearUntil: null,
            
            // 是否已经直接签约（达到最高预期）
            isAutoSigned: false
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
     * 计算球员报价期望
     * @param {Object} player - 球员对象
     * @returns {Object} 球员期望配置
     */
    calculatePlayerExpectations(player) {
        const rating = player.rating || player.getOverallRating?.() || 70;
        const potential = player.potential || 70;
        const status = player.status || 'freshman_recruit';
        
        // 基础期望根据评分和潜力计算
        const baseExpectation = (rating + potential) / 2;
        
        // 根据球员类型调整
        let typeMultiplier = 1.0;
        let playerType = 'unknown';
        if (status === 'freshman_recruit') {
            typeMultiplier = 0.9; // 新生期望较低
            playerType = 'freshman';
        } else if (status === 'transfer_wanted') {
            typeMultiplier = 1.1; // 转学生期望较高
            playerType = 'transfer';
        } else if (status === 'free_agent') {
            typeMultiplier = 1.0; // 自由球员正常
            playerType = 'free_agent';
        }
        
        // 随机因素（每个球员有不同的性格）
        const personalityFactor = 0.9 + Math.random() * 0.2; // 0.9 - 1.1
        
        // 计算各项期望值
        const adjustedExpectation = baseExpectation * typeMultiplier * personalityFactor;
        
        // 最低接受报价（低于此值会被羞辱）
        const minAcceptable = Math.max(20, Math.min(50, adjustedExpectation * 0.4));
        
        // 理想报价（达到此值会直接签约）
        const idealOffer = Math.min(95, adjustedExpectation * 1.1);
        
        // 初始询问报价（球员会先询问这个）
        const initialInquiry = Math.min(85, adjustedExpectation * 0.95);
        
        // 根据球员类型配置时间衰减规则
        let decayConfig;
        
        if (playerType === 'freshman') {
            // 大一新生：不会衰减，保持坚定
            decayConfig = {
                canDecay: false, // 大一新生不会衰减
                dailyDecay: 0,
                floorValue: initialInquiry,
                startDecayAfterDays: 999, // 实际上不会触发
                accelerationFactor: 1.0
            };
        } else if (playerType === 'transfer') {
            // 转学生：前2个月（约60天）不衰减，最后1个月衰减
            decayConfig = {
                canDecay: true,
                dailyDecay: 0.8 + Math.random() * 0.4, // 0.8% - 1.2% 每天
                floorValue: minAcceptable * 0.85,
                startDecayAfterDays: 60, // 60天后开始衰减（前2个月不降价）
                accelerationFactor: 1.2 + Math.random() * 0.3, // 1.2 - 1.5，最后一个月加速
                transferPhase: 'early' // 当前阶段：early(前2月), late(最后1月)
            };
        } else {
            // 自由球员：7-14天后开始衰减（标准规则）
            decayConfig = {
                canDecay: true,
                dailyDecay: 0.5 + Math.random() * 0.5, // 0.5% - 1.0% 每天
                floorValue: minAcceptable * 0.8,
                startDecayAfterDays: 7 + Math.floor(Math.random() * 7), // 7-14天后开始衰减
                accelerationFactor: 1.0 + Math.random() * 0.5 // 1.0 - 1.5
            };
        }
        
        return {
            // 球员类型
            playerType: playerType,
            // 最低可接受报价（百分比）
            minAcceptable: Math.round(minAcceptable),
            // 理想报价（达到直接签约）
            idealOffer: Math.round(idealOffer),
            // 初始询问报价
            initialInquiry: Math.round(initialInquiry),
            // 时间衰减配置
            decay: decayConfig,
            // 当前期望（会随时间变化）
            currentExpectation: Math.round(initialInquiry),
            // 球员性格描述
            personality: this.getPersonalityDescription(personalityFactor, minAcceptable, idealOffer, playerType)
        };
    }
    
    /**
     * 获取球员性格描述
     * @param {number} factor - 性格因子
     * @param {number} minAcceptable - 最低可接受报价
     * @param {number} idealOffer - 理想报价
     * @param {string} playerType - 球员类型
     */
    getPersonalityDescription(factor, minAcceptable, idealOffer, playerType) {
        // 根据球员类型添加前缀描述
        let typePrefix = '';
        if (playerType === 'freshman') {
            typePrefix = '【大一新生】坚定自信，价格不会随时间降低。';
        } else if (playerType === 'transfer') {
            typePrefix = '【转学生】前2个月价格稳定，最后1个月可能降价。';
        }
        
        let personalityDesc = '';
        if (factor > 1.05 && idealOffer > 85) {
            personalityDesc = '雄心勃勃，要求高报价';
        } else if (factor > 1.05) {
            personalityDesc = '自信，但务实';
        } else if (factor < 0.95 && minAcceptable < 30) {
            personalityDesc = '谦逊，容易满足';
        } else if (factor < 0.95) {
            personalityDesc = '谨慎，但有自己的底线';
        } else if (idealOffer - minAcceptable > 50) {
            personalityDesc = '灵活，谈判空间大';
        } else {
            personalityDesc = '标准心态';
        }
        
        return typePrefix + personalityDesc;
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
        
        // 当前能力值影响（权重更高）
        const rating = player.rating || (player.getOverallRating ? player.getOverallRating() : 50);
        if (rating >= 80) baseInterest += 12;
        else if (rating >= 75) baseInterest += 8;
        else if (rating >= 70) baseInterest += 4;
        else if (rating >= 65) baseInterest += 2;
        
        // 潜力影响兴趣度（权重降低）
        if (player.potential >= 90) baseInterest += 6;
        else if (player.potential >= 85) baseInterest += 4;
        else if (player.potential >= 80) baseInterest += 2;
        
        // 综合评估：高实力+高潜力 = 超级目标
        if (rating >= 75 && player.potential >= 85) {
            baseInterest += 5; // 额外加成
        }
        
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
            
            // 声望匹配（基于球员实力而非潜力）
            const playerRating = player.rating || (player.getOverallRating ? player.getOverallRating() : 50);
            if (playerRating >= 75) {
                // 实力强的球员更倾向于高声望球队
                score += (team.recruitment.reputation - 50) * 0.4;
            } else if (player.potential >= 85) {
                // 高潜力但实力一般的球员也考虑声望，但权重较低
                score += (team.recruitment.reputation - 50) * 0.2;
            }
            
            suitableTeams.push({ teamId, score });
        });
        
        // 按分数排序并选择前N个
        suitableTeams.sort((a, b) => b.score - a.score);
        return suitableTeams.slice(0, numTeams).map(t => t.teamId);
    }
    
    /**
     * 估算招募成本 - 改进版
     * 基于实力为主，潜力为辅
     */
    estimateRecruitmentCost(player) {
        const baseCost = 50000;
        
        // 当前能力值权重更高（60%）
        const rating = player.rating || (player.getOverallRating ? player.getOverallRating() : 50);
        const ratingBonus = (rating - 50) * 2000;
        
        // 潜力权重降低（40%）
        const potentialBonus = (player.potential - 60) * 1000;
        
        // 年级因素（大四球员成本更低，因为只能打一年）
        const year = player.year || 1;
        const yearDiscount = year === 4 ? 0.8 : (year === 3 ? 0.9 : 1.0);
        
        return Math.round((baseCost + ratingBonus + potentialBonus) * yearDiscount);
    }
    
    /**
     * 计算竞争强度 - 改进版
     * 平衡潜力和实力的权重
     */
    calculateCompetitionIntensity(player) {
        let intensity = this.competitionConfig.baseCompetitionIntensity;
        
        const rating = player.rating || (player.getOverallRating ? player.getOverallRating() : 50);
        const potential = player.potential || 70;
        
        // 综合评分（实力60%，潜力40%）
        const compositeScore = rating * 0.6 + potential * 0.4;
        
        // 根据综合评分调整竞争强度
        if (compositeScore >= 85) {
            intensity *= this.competitionConfig.potentialCompetitionMultiplier.elite;
        } else if (compositeScore >= 75) {
            intensity *= this.competitionConfig.potentialCompetitionMultiplier.excellent;
        } else if (compositeScore >= 65) {
            intensity *= this.competitionConfig.potentialCompetitionMultiplier.good;
        } else {
            intensity *= this.competitionConfig.potentialCompetitionMultiplier.normal;
        }
        
        // 根据球员类型调整
        if (player.status === 'transfer_wanted') {
            intensity *= 1.3; // 转学生竞争更激烈
        }
        
        // 纯实力加成（即战力高的球员竞争更激烈）
        if (rating >= 80) {
            intensity *= 1.25;
        } else if (rating >= 75) {
            intensity *= 1.15;
        }
        
        // 年级因素（低年级高潜力球员竞争更激烈）
        const year = player.year || 1;
        if (year === 1 && potential >= 85) {
            intensity *= 1.2; // 大一高潜力新星竞争激烈
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
     * 大幅降低AI行动频率，让玩家有更多时间反应
     */
    processAITeamActions(status) {
        const aiConfig = this.competitionConfig.aiSigning;
        
        status.competingTeams.forEach(teamId => {
            const team = this.aiTeams.get(teamId);
            if (!team) return;
            
            const currentInterest = status.teamInterest.get(teamId) || 0;
            
            // AI决策：是否增加投入
            const priority = this.evaluateRecruitmentPriority(team, { 
                id: status.playerId, 
                potential: 75 // 简化处理
            });
            
            // ===== 大幅降低AI行动频率 =====
            const actionProb = aiConfig.actionProbability[priority] || 0;
            
            if (Math.random() < actionProb) {
                // 根据优先级增加兴趣度
                const increaseRange = aiConfig.interestIncrease[priority] || { min: 1, max: 2 };
                const increase = increaseRange.min + Math.floor(Math.random() * (increaseRange.max - increaseRange.min + 1));
                status.teamInterest.set(teamId, Math.min(100, currentInterest + increase));
                
                // 消耗预算
                team.recruitment.recruitmentBudget -= 5000;
                
                if (priority === 'high') {
                    console.log(`[AI行动] ${team.name} 加大招募投入，兴趣度提升至 ${status.teamInterest.get(teamId)}`);
                }
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
     * 检查是否可以签约 - 优化玩家优先机制
     * 当玩家兴趣度满100时，获得显著优势保护
     */
    checkForCommitment(status) {
        const aiConfig = this.competitionConfig.aiSigning;
        const playerInterest = status.playerInterestInUser;
        
        // ===== 玩家兴趣度满100时的优先保护机制 =====
        if (playerInterest >= 100) {
            // 玩家兴趣满时，AI几乎不可能签约
            let aiMaxInterest = 0;
            let leadingAITeam = null;
            
            status.teamInterest.forEach((interest, teamId) => {
                if (interest > aiMaxInterest) {
                    aiMaxInterest = interest;
                    leadingAITeam = teamId;
                }
            });
            
            // AI必须兴趣满100且领先玩家20点以上才能抢人
            if (aiMaxInterest >= 100 && aiMaxInterest - playerInterest >= 20) {
                // 极低的概率（5%）AI能抢走
                if (Math.random() < 0.05) {
                    this.resolveRecruitment(status.playerId, 'commitment', leadingAITeam);
                    console.log(`[AI签约-罕见] 球员 ${status.playerName} 被 ${this.aiTeams.get(leadingAITeam)?.name} 抢走（玩家兴趣满但被超越）`);
                }
            }
            
            // 玩家兴趣满时，保护期内AI无法签约
            return;
        }
        
        // ===== 玩家兴趣度90-99时的保护机制 =====
        if (playerInterest >= 90) {
            let aiMaxInterest = 0;
            let leadingAITeam = null;
            
            status.teamInterest.forEach((interest, teamId) => {
                if (interest > aiMaxInterest) {
                    aiMaxInterest = interest;
                    leadingAITeam = teamId;
                }
            });
            
            // AI必须兴趣满95且领先玩家15点以上
            if (aiMaxInterest >= 95 && aiMaxInterest - playerInterest >= 15) {
                if (Math.random() < aiConfig.signingProbability * 0.5) {
                    this.resolveRecruitment(status.playerId, 'commitment', leadingAITeam);
                    console.log(`[AI签约] 球员 ${status.playerName} 被 ${this.aiTeams.get(leadingAITeam)?.name} 签下`);
                }
            }
            return;
        }
        
        // 检查是否有承诺锁定
        const commitment = this.getPlayerCommitment(status.playerId);
        if (commitment) {
            // 如果有承诺，只有承诺的球队可以签约
            if (commitment.teamId === 'user') {
                // 玩家承诺的球员，检查玩家兴趣度是否足够
                if (status.playerInterestInUser >= 70) {
                    // 玩家可以在承诺期内随时签约
                    return; // 不自动签约，等待玩家手动签约
                }
            } else {
                // AI承诺的球员，其他球队不能签约
                return;
            }
        }
        
        // 找出兴趣度最高的球队
        let maxInterest = status.playerInterestInUser;
        let leadingTeam = 'user';
        
        status.teamInterest.forEach((interest, teamId) => {
            if (interest > maxInterest) {
                maxInterest = interest;
                leadingTeam = teamId;
            }
        });
        
        // ===== 普通情况：AI签约门槛 =====
        // 只有AI球队可以自动签约，玩家球队需要手动操作
        if (leadingTeam !== 'user' && maxInterest >= aiConfig.minInterestThreshold) {
            const secondMax = this.getSecondHighestInterest(status);
            
            // 需要非常大的领先优势
            if (maxInterest - secondMax >= aiConfig.leadGapRequired) {
                // 很低的签约概率，给玩家更多机会
                if (Math.random() < aiConfig.signingProbability) {
                    this.resolveRecruitment(status.playerId, 'commitment', leadingTeam);
                    console.log(`[AI签约] 球员 ${status.playerName} 被 ${this.aiTeams.get(leadingTeam)?.name || leadingTeam} 签下`);
                }
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
                
                // ===== 关键修复：当AI球队签下玩家正在谈判的球员时，通知skipRuleManager =====
                this.notifySkipRuleManagerOfSignedPlayer(playerId, status.playerName);
                
                // ===== 关键修复：更新AI球队的阵容和奖学金数量 =====
                this.updateAITeamRosterAfterSigning(winningTeam, status);
                
                // ===== 关键修复：从availablePlayers中移除已签约球员 =====
                this.removePlayerFromAvailable(playerId);
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
     * 从可用球员列表中移除已签约球员
     * @param {string|number} playerId - 球员ID
     */
    removePlayerFromAvailable(playerId) {
        const state = this.gameStateManager.getState();
        if (state.availablePlayers) {
            const index = state.availablePlayers.findIndex(p => p.id === playerId);
            if (index !== -1) {
                const player = state.availablePlayers[index];
                state.availablePlayers.splice(index, 1);
                console.log(`[招募结果] 已从可用球员列表移除: ${player.name}`);
                
                // 同时从recruitmentInterface的players中移除
                if (window.recruitmentInterface && window.recruitmentInterface.players) {
                    const riIndex = window.recruitmentInterface.players.findIndex(p => p.id === playerId);
                    if (riIndex !== -1) {
                        window.recruitmentInterface.players.splice(riIndex, 1);
                        console.log(`[招募结果] 已从招募界面移除: ${player.name}`);
                    }
                }
                
                // 刷新招募界面显示
                if (window.recruitmentInterface) {
                    window.recruitmentInterface.renderAll();
                }
            }
        }
    }
    
    /**
     * AI球队签下球员后更新阵容信息
     * @param {string} teamId - AI球队ID
     * @param {Object} status - 球员招募状态
     */
    updateAITeamRosterAfterSigning(teamId, status) {
        const team = this.aiTeams.get(teamId);
        if (!team) return;
        
        // 获取球员信息
        const state = this.gameStateManager.getState();
        const player = state.availablePlayers?.find(p => p.id === status.playerId);
        
        if (player) {
            // 添加到AI球队阵容
            const playerInfo = player.getInfo ? player.getInfo() : player;
            const playerData = {
                id: playerInfo.id,
                name: playerInfo.name,
                position: playerInfo.position,
                rating: playerInfo.overallRating,
                potential: playerInfo.potential || playerInfo.overallRating,
                year: playerInfo.year || 1,
                isNewSigning: true,
                signedThisSeason: true
            };
            
            team.roster.push(playerData);
            
            // ===== 关键修复：同步到 gameStateManager 的 allTeams =====
            this.syncAITeamToGameState(teamId, playerData);
            
            // 减少奖学金数量
            team.recruitment.scholarshipsAvailable = Math.max(0, team.recruitment.scholarshipsAvailable - 1);
            
            // 重新计算阵容需求
            team.recruitment.priorityNeeds = this.identifyTeamNeeds(team.roster);
            
            // 更新球队声望
            team.recruitment.reputation = this.calculateTeamReputation(team.roster);
            
            console.log(`[AI阵容更新] ${team.name} 签下 ${playerInfo.name}，剩余奖学金: ${team.recruitment.scholarshipsAvailable}，已同步到allTeams`);
        }
    }
    
    /**
     * 同步AI球队阵容到 gameStateManager 的 allTeams
     * 这是关键修复，确保GM工具能看到正确的阵容
     * @param {string} teamId - AI球队ID
     * @param {Object} playerData - 新签约球员数据
     */
    syncAITeamToGameState(teamId, playerData) {
        const state = this.gameStateManager.getState();
        // 创建 allTeams 的深拷贝
        const allTeams = JSON.parse(JSON.stringify(state.allTeams || []));
        
        // 在 allTeams 中找到对应的球队
        const teamIndex = allTeams.findIndex(t => t.id === teamId);
        if (teamIndex !== -1) {
            const gameTeam = allTeams[teamIndex];
            
            // 确保 roster 数组存在
            if (!gameTeam.roster) {
                gameTeam.roster = [];
            }
            
            // 添加球员到游戏球队的阵容
            gameTeam.roster.push(playerData);
            
            // 更新奖学金数量
            if (gameTeam.scholarshipsAvailable !== undefined) {
                gameTeam.scholarshipsAvailable = Math.max(0, gameTeam.scholarshipsAvailable - 1);
            }
            
            // 保存更新后的 allTeams（使用深拷贝后的数组）
            this.gameStateManager.set('allTeams', allTeams);
            
            console.log(`[阵容同步] ${gameTeam.name} 阵容已更新，现在共 ${gameTeam.roster.length} 人`);
        } else {
            console.warn(`[阵容同步] 未在allTeams中找到球队 ${teamId}`);
        }
    }
    
    /**
     * 通知SkipRuleManager球员被其他球队签走
     * 使用RecruitmentUtils工具函数避免代码重复
     */
    notifySkipRuleManagerOfSignedPlayer(playerId, playerName) {
        // 使用公共工具函数
        if (typeof RecruitmentUtils !== 'undefined') {
            RecruitmentUtils.notifySkipRuleManagerOfSignedPlayer(playerId, playerName, {
                source: '招募竞争系统',
                gameStateManager: this.gameStateManager
            });
        } else {
            // 降级处理：如果工具函数不可用，使用内联逻辑
            console.warn('[招募竞争系统] RecruitmentUtils不可用，使用降级处理');
            this._fallbackNotifySkipRuleManager(playerId, playerName);
        }
    }
    
    /**
     * 降级处理：直接更新谈判状态
     * 当RecruitmentUtils不可用时使用
     */
    _fallbackNotifySkipRuleManager(playerId, playerName) {
        const state = this.gameStateManager.getState();
        const playerNegotiations = state.negotiations?.playerNegotiations || [];
        const negotiationIndex = playerNegotiations.findIndex(n => n.targetId === playerId);
        
        if (negotiationIndex !== -1 && playerNegotiations[negotiationIndex]) {
            playerNegotiations[negotiationIndex].status = 'expired';
            playerNegotiations[negotiationIndex].expiredReason = '被其他球队签走';
            playerNegotiations[negotiationIndex].expiredAt = new Date().toISOString();
            console.log(`[招募竞争系统] 已更新谈判状态: ${playerName} 被标记为过期`);
        }
    }
    
    /**
     * 玩家采取行动提升兴趣度 - 优化版本
     * 增加更多策略性选项和个性化反馈
     */
    playerTakeAction(playerId, actionType, actionData = {}) {
        const status = this.playerRecruitmentStatus.get(playerId);
        if (!status || status.isSigned) {
            return { success: false, message: '该球员已不可招募' };
        }
        
        // 获取球员信息用于个性化计算
        const state = this.gameStateManager.getState();
        const player = state.availablePlayers?.find(p => p.id === playerId);
        
        let interestIncrease = 0;
        let cost = 0;
        let message = '';
        let specialEffect = null;
        
        // 基础行动配置
        const actionConfigs = {
            campus_visit: {
                baseIncrease: 8,
                randomRange: 7,
                cost: 5000,
                baseMessage: '校园参观给球员留下了深刻印象',
                // 对注重体验的球员效果更好
                personalityBonus: { 'ambitious': -2, 'team_oriented': 2, 'flashy': 3 }
            },
            home_visit: {
                baseIncrease: 10,
                randomRange: 10,
                cost: 8000,
                baseMessage: '家访增进了彼此了解',
                // 对重视家庭的球员效果更好
                personalityBonus: { 'loyal': 3, 'team_oriented': 2, 'flashy': -1 }
            },
            introduce_team_culture: {
                baseIncrease: 10,
                randomRange: 8,
                cost: 0,
                baseMessage: '球队文化深深吸引了球员',
                // 对团队型球员效果更好
                personalityBonus: { 'team_oriented': 4, 'loyal': 2, 'ambitious': -1 }
            },
            promise_playing_time: {
                baseIncrease: 5,
                randomRange: 10,
                cost: 0,
                baseMessage: '上场时间承诺增加了吸引力',
                // 对野心型球员效果更好
                personalityBonus: { 'ambitious': 5, 'flashy': 3, 'team_oriented': -2 }
            },
            highlight_facilities: {
                baseIncrease: 6,
                randomRange: 6,
                cost: 2000,
                baseMessage: '先进的训练设施令人印象深刻',
                // 对华丽型球员效果更好
                personalityBonus: { 'flashy': 4, 'ambitious': 2 }
            },
            emphasize_academics: {
                baseIncrease: 4,
                randomRange: 6,
                cost: 1000,
                baseMessage: '学术优势得到了认可',
                // 对忠诚型球员效果更好
                personalityBonus: { 'loyal': 3, 'team_oriented': 2 }
            },
            // ===== 新增招募行动 =====
            invite_to_game: {
                baseIncrease: 12,
                randomRange: 8,
                cost: 3000,
                baseMessage: '现场观赛让球员对球队实力有了直观认识',
                personalityBonus: { 'ambitious': 4, 'flashy': 3, 'team_oriented': 2 },
                specialEffect: 'momentum', // 产生势头效果
                cooldown: 7 // 7天冷却
            },
            connect_with_alumni: {
                baseIncrease: 8,
                randomRange: 6,
                cost: 4000,
                baseMessage: '校友的成功故事激励了球员',
                personalityBonus: { 'loyal': 4, 'ambitious': 3 },
                specialEffect: 'trust', // 增加信任度
                cooldown: 5
            },
            offer_scholarship: {
                baseIncrease: 15,
                randomRange: 10,
                cost: 0,
                baseMessage: '正式奖学金offer展现了球队的诚意',
                personalityBonus: { 'loyal': 5, 'team_oriented': 3 },
                specialEffect: 'commitment_boost', // 加速承诺
                oncePerRecruitment: true // 每个招募周期只能使用一次
            },
            social_media_campaign: {
                baseIncrease: 6,
                randomRange: 5,
                cost: 1500,
                baseMessage: '社交媒体宣传提升了球员的关注度',
                personalityBonus: { 'flashy': 5, 'ambitious': 2 },
                specialEffect: 'visibility', // 增加曝光度
                cooldown: 3
            },
            one_on_one_training: {
                baseIncrease: 10,
                randomRange: 7,
                cost: 6000,
                baseMessage: '一对一训练展示了对球员发展的重视',
                personalityBonus: { 'ambitious': 5, 'flashy': 2 },
                specialEffect: 'development', // 展示发展承诺
                cooldown: 10
            },
            family_dinner: {
                baseIncrease: 14,
                randomRange: 8,
                cost: 7000,
                baseMessage: '家庭晚宴建立了深厚的个人关系',
                personalityBonus: { 'loyal': 5, 'team_oriented': 4 },
                specialEffect: 'relationship', // 加深关系
                cooldown: 14
            }
        };
        
        const config = actionConfigs[actionType];
        if (!config) {
            return { success: false, message: '未知的行动类型' };
        }
        
        // 检查冷却时间
        if (config.cooldown) {
            const lastUsed = status.actionCooldowns?.[actionType];
            if (lastUsed) {
                const daysSinceLastUse = (Date.now() - lastUsed) / (24 * 60 * 60 * 1000);
                if (daysSinceLastUse < config.cooldown) {
                    const daysRemaining = Math.ceil(config.cooldown - daysSinceLastUse);
                    return { 
                        success: false, 
                        message: `该行动需要冷却，${daysRemaining}天后可再次使用`,
                        cooldown: daysRemaining
                    };
                }
            }
        }
        
        // 检查是否每个招募周期只能使用一次
        if (config.oncePerRecruitment && status.usedActions?.includes(actionType)) {
            return { 
                success: false, 
                message: '该行动在本招募周期内已使用过' 
            };
        }
        
        // 计算基础兴趣增长
        interestIncrease = config.baseIncrease + Math.floor(Math.random() * config.randomRange);
        cost = config.cost;
        message = config.baseMessage;
        specialEffect = config.specialEffect;
        
        // 应用性格加成
        if (player?.personality && config.personalityBonus) {
            const personality = player.personality;
            let bonus = 0;
            let bonusMessage = '';
            
            // 检查主要性格特征
            if (personality.primary && config.personalityBonus[personality.primary]) {
                bonus += config.personalityBonus[personality.primary];
                bonusMessage = this.getPersonalityReaction(personality.primary, actionType);
            }
            
            // 检查次要性格特征
            if (personality.secondary && config.personalityBonus[personality.secondary]) {
                bonus += config.personalityBonus[personality.secondary] * 0.5;
            }
            
            // 应用加成
            if (bonus !== 0) {
                interestIncrease += Math.round(bonus);
                if (bonusMessage) {
                    message += `。${bonusMessage}`;
                }
            }
        }
        
        // 根据球员当前兴趣度调整效果（边际递减）
        if (status.playerInterestInUser >= 80) {
            interestIncrease = Math.floor(interestIncrease * 0.7); // 高兴趣时效果降低
            message += '（球员已对你很感兴趣，进一步提升变得困难）';
        } else if (status.playerInterestInUser >= 60) {
            interestIncrease = Math.floor(interestIncrease * 0.85);
        }
        
        // 记录行动使用
        if (!status.actionCooldowns) status.actionCooldowns = {};
        status.actionCooldowns[actionType] = Date.now();
        
        if (!status.usedActions) status.usedActions = [];
        if (config.oncePerRecruitment) {
            status.usedActions.push(actionType);
        }
        
        // 扣除预算（先检查预算是否足够）
        if (cost > 0) {
            let budgetSufficient = false;
            
            if (window.recruitmentBudgetManager) {
                // 使用预算管理器检查并扣减预算
                budgetSufficient = window.recruitmentBudgetManager.spendBudget(cost, actionType);
            } else {
                // 兼容旧代码：检查预算是否足够
                const state = this.gameStateManager.getState();
                if (state.recruitmentBudget !== undefined) {
                    if (state.recruitmentBudget >= cost) {
                        state.recruitmentBudget -= cost;
                        this.gameStateManager.set('recruitmentBudget', state.recruitmentBudget);
                        budgetSufficient = true;
                    } else {
                        console.log(`[招募行动] 预算不足: 需要$${cost.toLocaleString()}，只有$${state.recruitmentBudget.toLocaleString()}`);
                    }
                }
            }
            
            // 如果预算不足，返回失败
            if (!budgetSufficient) {
                return {
                    success: false,
                    message: '招募预算不足，无法执行此行动',
                    interestIncrease: 0,
                    newInterest: status.playerInterestInUser,
                    cost: 0
                };
            }
        }
        
        // 应用增加（预算检查通过后）
        const oldInterest = status.playerInterestInUser;
        status.playerInterestInUser = Math.min(100, status.playerInterestInUser + interestIncrease);
        const actualIncrease = status.playerInterestInUser - oldInterest;
        
        // 处理特殊效果
        let specialEffectResult = null;
        if (specialEffect) {
            specialEffectResult = this.applySpecialEffect(status, specialEffect, player);
        }
        
        return {
            success: true,
            interestIncrease: actualIncrease,
            newInterest: status.playerInterestInUser,
            cost,
            message,
            specialEffect: specialEffectResult,
            playerReaction: this.generatePlayerReaction(player, actualIncrease, status.playerInterestInUser)
        };
    }
    
    /**
     * 根据性格获取反应消息
     */
    getPersonalityReaction(personality, actionType) {
        const reactions = {
            ambitious: {
                campus_visit: '球员对学校的竞技水平印象深刻',
                home_visit: '球员更关注职业发展机会',
                introduce_team_culture: '球员希望了解赢球文化',
                promise_playing_time: '这正是球员想要的！',
                highlight_facilities: '球员对训练条件很满意',
                emphasize_academics: '球员对此不太感兴趣',
                invite_to_game: '球员被球队的竞争力吸引',
                connect_with_alumni: '球员关注校友的职业成就',
                offer_scholarship: '球员认为这是对他能力的认可',
                social_media_campaign: '球员喜欢这种关注度',
                one_on_one_training: '球员渴望这种发展机会',
                family_dinner: '球员感谢这种重视'
            },
            loyal: {
                campus_visit: '球员感受到了学校的温暖',
                home_visit: '这种重视让球员很感动',
                introduce_team_culture: '球员喜欢这种归属感',
                promise_playing_time: '球员承诺会全力以赴',
                highlight_facilities: '球员对此反应一般',
                emphasize_academics: '这正是球员看重的！',
                invite_to_game: '球员对球队氛围很有好感',
                connect_with_alumni: '球员被校友的忠诚打动',
                offer_scholarship: '球员认为这是信任的证明',
                social_media_campaign: '球员对此不太感冒',
                one_on_one_training: '球员感谢这种投入',
                family_dinner: '这种关怀让球员很温暖！'
            },
            flashy: {
                campus_visit: '球员喜欢这种体验',
                home_visit: '球员希望有更多曝光',
                introduce_team_culture: '球员想了解明星球员',
                promise_playing_time: '球员想成为焦点',
                highlight_facilities: '这种展示很合球员胃口！',
                emphasize_academics: '球员对此不太感兴趣',
                invite_to_game: '球员被现场氛围感染',
                connect_with_alumni: '球员关注知名校友',
                offer_scholarship: '球员喜欢这种正式感',
                social_media_campaign: '这正是球员想要的！',
                one_on_one_training: '球员希望被特别关注',
                family_dinner: '球员觉得这样很酷'
            },
            team_oriented: {
                campus_visit: '球员感受到了团队精神',
                home_visit: '这种重视让球员很感激',
                introduce_team_culture: '这正是球员追求的！',
                promise_playing_time: '球员更在意团队角色',
                highlight_facilities: '球员关注团队设施',
                emphasize_academics: '球员认可这种平衡',
                invite_to_game: '球员被团队配合打动',
                connect_with_alumni: '球员关注团队成就',
                offer_scholarship: '球员认为这是团队邀请',
                social_media_campaign: '球员对此反应一般',
                one_on_one_training: '球员希望融入团队',
                family_dinner: '这种关怀让球员很感动！'
            }
        };
        
        return reactions[personality]?.[actionType] || '';
    }
    
    /**
     * 应用特殊效果
     */
    applySpecialEffect(status, effectType, player) {
        switch (effectType) {
            case 'momentum':
                // 势头效果：接下来3天AI兴趣增长减半
                status.momentumBoost = {
                    expires: Date.now() + 3 * 24 * 60 * 60 * 1000,
                    aiDecayMultiplier: 0.5
                };
                return { type: 'momentum', message: '你获得了招募势头，AI竞争暂时减弱' };
                
            case 'trust':
                // 信任效果：兴趣衰减减少
                status.trustBonus = {
                    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
                    decayReduction: 0.3
                };
                return { type: 'trust', message: '球员对你的信任度提升了' };
                
            case 'commitment_boost':
                // 承诺加速：降低签约所需的兴趣度阈值
                status.commitmentThreshold = 85; // 正常是95
                return { type: 'commitment_boost', message: '球员更愿意提前做出承诺' };
                
            case 'visibility':
                // 曝光度：增加球员对其他AI的吸引力（但玩家保持领先）
                status.visibilityBoost = true;
                return { type: 'visibility', message: '球员的知名度提升了，更多球队会关注他' };
                
            case 'development':
                // 发展承诺：对高潜力球员效果更好
                if (player?.potential >= 80) {
                    status.developmentCommitment = true;
                    return { type: 'development', message: '高潜力球员对这种发展机会特别感兴趣！' };
                }
                return { type: 'development', message: '球员认可这种发展投入' };
                
            case 'relationship':
                // 关系加深：大幅提升，但成本也高
                status.relationshipLevel = (status.relationshipLevel || 0) + 1;
                return { type: 'relationship', message: `你们的关系加深到了${status.relationshipLevel}级` };
                
            default:
                return null;
        }
    }
    
    /**
     * 生成球员反应消息
     */
    generatePlayerReaction(player, increase, currentInterest) {
        const reactions = {
            low: ['球员似乎有些犹豫', '球员还在考虑中', '球员反应平淡'],
            medium: ['球员表现出了兴趣', '球员开始认真考虑', '球员对你更感兴趣了'],
            high: ['球员非常兴奋！', '球员迫不及待想加入', '球员认为这是最好的选择'],
            very_high: ['球员已经把你当作首选！', '球员几乎要做出承诺了', '球员对你完全信任']
        };
        
        let category = 'low';
        if (currentInterest >= 90) category = 'very_high';
        else if (currentInterest >= 70) category = 'high';
        else if (currentInterest >= 50) category = 'medium';
        
        const reactionList = reactions[category];
        return reactionList[Math.floor(Math.random() * reactionList.length)];
    }
    
    /**
     * 获取可用的招募行动列表（供UI使用）
     */
    getAvailableActions(playerId) {
        const status = this.playerRecruitmentStatus.get(playerId);
        if (!status) return [];
        
        const actions = [
            { id: 'campus_visit', name: '🏫 校园参观', cost: 5000, desc: '展示校园设施和文化', cooldown: 0 },
            { id: 'home_visit', name: '🏠 家访', cost: 8000, desc: '深入了解球员家庭', cooldown: 0 },
            { id: 'introduce_team_culture', name: '🏆 介绍球队文化', cost: 0, desc: '展示球队历史和荣誉', cooldown: 0 },
            { id: 'promise_playing_time', name: '⏱️ 承诺上场时间', cost: 0, desc: '保证赛季出场时间', cooldown: 0 },
            { id: 'highlight_facilities', name: '🏋️ 展示设施', cost: 2000, desc: '展示训练设施', cooldown: 0 },
            { id: 'emphasize_academics', name: '📚 强调学术', cost: 1000, desc: '突出学术优势', cooldown: 0 },
            { id: 'invite_to_game', name: '🎫 邀请观赛', cost: 3000, desc: '邀请观看主场比赛', cooldown: 7 },
            { id: 'connect_with_alumni', name: '🤝 校友交流', cost: 4000, desc: '安排与成功校友见面', cooldown: 5 },
            { id: 'offer_scholarship', name: '🎓 提供奖学金', cost: 0, desc: '正式提供奖学金offer', cooldown: 0, once: true },
            { id: 'social_media_campaign', name: '📱 社媒宣传', cost: 1500, desc: '在社交媒体宣传', cooldown: 3 },
            { id: 'one_on_one_training', name: '💪 一对一训练', cost: 6000, desc: '展示个人发展计划', cooldown: 10 },
            { id: 'family_dinner', name: '🍽️ 家庭晚宴', cost: 7000, desc: '与球员家庭共进晚餐', cooldown: 14 }
        ];
        
        // 检查冷却时间和使用次数
        return actions.map(action => {
            let disabled = false;
            let disabledReason = '';
            
            // 检查冷却
            if (action.cooldown > 0 && status.actionCooldowns?.[action.id]) {
                const daysSince = (Date.now() - status.actionCooldowns[action.id]) / (24 * 60 * 60 * 1000);
                if (daysSince < action.cooldown) {
                    disabled = true;
                    disabledReason = `${Math.ceil(action.cooldown - daysSince)}天后可用`;
                }
            }
            
            // 检查是否已使用
            if (action.once && status.usedActions?.includes(action.id)) {
                disabled = true;
                disabledReason = '本周期已使用';
            }
            
            return { ...action, disabled, disabledReason };
        });
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
     * 获取所有招募状态（包括已签约的）
     * @returns {Map} 所有球员的招募状态
     */
    getAllRecruitmentStatus() {
        // 确保系统已初始化
        this.ensureInitialized();
        
        return this.playerRecruitmentStatus;
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
    
    /**
     * 承诺签约 - 当球员兴趣度≥80%时可以承诺签约
     * @param {string} playerId - 球员ID
     * @returns {Object} - 承诺结果
     */
    commitToPlayer(playerId) {
        const status = this.playerRecruitmentStatus.get(playerId);
        if (!status) {
            return { success: false, message: '球员未在招募中' };
        }
        
        if (status.isSigned) {
            return { success: false, message: '该球员已签约其他球队' };
        }
        
        // 检查是否已被其他球队承诺
        const existingCommitment = this.playerCommitments.get(playerId);
        if (existingCommitment) {
            // 检查是否过期
            const now = Date.now();
            if (existingCommitment.expiresAt > now) {
                if (existingCommitment.teamId === 'user') {
                    return { success: false, message: '你已经承诺了该球员' };
                } else {
                    return { success: false, message: '该球员已被其他球队承诺' };
                }
            }
        }
        
        // 检查兴趣度是否足够
        if (status.playerInterestInUser < 80) {
            return { 
                success: false, 
                message: `球员兴趣度不足，需要≥80%（当前${status.playerInterestInUser}%）`,
                currentInterest: status.playerInterestInUser,
                requiredInterest: 80
            };
        }
        
        // 创建承诺
        const now = Date.now();
        const lockDuration = 14 * 24 * 60 * 60 * 1000; // 14天（毫秒）
        const commitment = {
            playerId: playerId,
            teamId: 'user',
            committedAt: now,
            expiresAt: now + lockDuration,
            playerName: status.playerName
        };
        
        this.playerCommitments.set(playerId, commitment);
        
        // 更新球员状态
        status.isCommitted = true;
        status.committedTeam = 'user';
        status.commitmentExpiry = now + lockDuration;
        
        console.log(`[承诺签约] 玩家承诺签约球员 ${status.playerName}，锁定14天`);
        
        return {
            success: true,
            message: `成功承诺签约 ${status.playerName}！你有14天时间腾出奖学金名额`,
            commitment: commitment,
            expiresAt: commitment.expiresAt
        };
    }
    
    /**
     * 检查球员是否被承诺
     * @param {string} playerId - 球员ID
     * @returns {Object|null} - 承诺信息
     */
    getPlayerCommitment(playerId) {
        const commitment = this.playerCommitments.get(playerId);
        if (!commitment) return null;
        
        // 检查是否过期
        const now = Date.now();
        if (commitment.expiresAt <= now) {
            // 过期，清除承诺
            this.playerCommitments.delete(playerId);
            
            // 更新球员状态
            const status = this.playerRecruitmentStatus.get(playerId);
            if (status) {
                status.isCommitted = false;
                status.committedTeam = null;
                status.commitmentExpiry = null;
            }
            
            return null;
        }
        
        return commitment;
    }
    
    /**
     * 检查是否可以签约（考虑承诺状态）
     * @param {string} playerId - 球员ID
     * @param {string} teamId - 球队ID
     * @returns {Object} - 检查结果
     */
    canSignPlayer(playerId, teamId = 'user') {
        const status = this.playerRecruitmentStatus.get(playerId);
        if (!status) {
            return { canSign: false, reason: '球员未在招募中' };
        }
        
        if (status.isSigned) {
            return { canSign: false, reason: '球员已签约' };
        }
        
        // 检查承诺状态
        const commitment = this.getPlayerCommitment(playerId);
        if (commitment && commitment.teamId !== teamId) {
            const daysRemaining = Math.ceil((commitment.expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
            return { 
                canSign: false, 
                reason: `该球员被其他球队锁定，还剩${daysRemaining}天`,
                locked: true,
                daysRemaining
            };
        }
        
        return { canSign: true, commitment: commitment };
    }
    
    /**
     * 获取所有活跃的承诺
     * @returns {Array} - 承诺列表
     */
    getActiveCommitments() {
        const commitments = [];
        const now = Date.now();
        
        for (const [playerId, commitment] of this.playerCommitments) {
            if (commitment.expiresAt > now) {
                const daysRemaining = Math.ceil((commitment.expiresAt - now) / (24 * 60 * 60 * 1000));
                commitments.push({
                    ...commitment,
                    daysRemaining
                });
            }
        }
        
        return commitments.sort((a, b) => a.expiresAt - b.expiresAt);
    }
    
    /**
     * 取消承诺
     * @param {string} playerId - 球员ID
     * @returns {Object} - 取消结果
     */
    cancelCommitment(playerId) {
        const commitment = this.playerCommitments.get(playerId);
        if (!commitment) {
            return { success: false, message: '没有该球员的承诺' };
        }
        
        if (commitment.teamId !== 'user') {
            return { success: false, message: '无法取消其他球队的承诺' };
        }
        
        // 删除承诺
        this.playerCommitments.delete(playerId);
        
        // 更新球员状态
        const status = this.playerRecruitmentStatus.get(playerId);
        if (status) {
            status.isCommitted = false;
            status.committedTeam = null;
            status.commitmentExpiry = null;
        }
        
        console.log(`[承诺签约] 玩家取消了对 ${commitment.playerName} 的承诺`);
        
        return { 
            success: true, 
            message: `已取消对 ${commitment.playerName} 的承诺`,
            playerName: commitment.playerName
        };
    }
    
    /**
     * 每日更新 - 清理过期承诺，更新球员期望报价，处理AI招募
     */
    dailyUpdate() {
        const now = Date.now();
        let expiredCount = 0;
        
        for (const [playerId, commitment] of this.playerCommitments) {
            if (commitment.expiresAt <= now) {
                // 承诺过期
                this.playerCommitments.delete(playerId);
                
                // 更新球员状态
                const status = this.playerRecruitmentStatus.get(playerId);
                if (status) {
                    status.isCommitted = false;
                    status.committedTeam = null;
                    status.commitmentExpiry = null;
                }
                
                console.log(`[承诺签约] 球员 ${commitment.playerName} 的承诺已过期`);
                expiredCount++;
            }
        }
        
        // 更新所有球员的期望报价（时间衰减）
        this.updatePlayerExpectations();
        
        // 处理AI招募行动和签约检查
        this.updateRecruitmentStatus();
        
        if (expiredCount > 0) {
            console.log(`[承诺签约] 清理了 ${expiredCount} 个过期承诺`);
        }
        
        return expiredCount;
    }
    
    /**
     * 更新所有球员的期望报价（时间衰减）
     * 规则：
     * - 大一新生(freshman)：不会衰减，保持坚定
     * - 转学生(transfer)：前60天不衰减，60-90天开始衰减
     * - 自由球员(free_agent)：7-14天后开始衰减
     */
    updatePlayerExpectations() {
        const now = Date.now();
        
        this.playerRecruitmentStatus.forEach((status, playerId) => {
            if (status.isSigned || status.isInsulted) return;
            
            const decay = status.expectations.decay;
            
            // 如果不能衰减（如大一新生），直接跳过
            if (decay.canDecay === false) {
                return;
            }
            
            const daysSinceStart = Math.floor((now - status.startTime) / (24 * 60 * 60 * 1000));
            
            // 过了开始衰减的天数后才开始降低期望
            if (daysSinceStart >= decay.startDecayAfterDays) {
                const daysOfDecay = daysSinceStart - decay.startDecayAfterDays;
                
                // 计算衰减量（随时间加速）
                const acceleration = Math.pow(decay.accelerationFactor, daysOfDecay / 7);
                const totalDecay = decay.dailyDecay * daysOfDecay * acceleration;
                
                // 更新当前期望
                let newExpectation = status.expectations.initialInquiry - totalDecay;
                newExpectation = Math.max(decay.floorValue, newExpectation);
                
                const oldExpectation = status.expectations.currentExpectation;
                status.expectations.currentExpectation = Math.round(newExpectation);
                
                // 转学生进入最后阶段时更新阶段标记
                if (status.expectations.playerType === 'transfer' && daysSinceStart >= 60) {
                    status.expectations.decay.transferPhase = 'late';
                }
                
                // 如果期望降低了，记录日志
                if (status.expectations.currentExpectation < oldExpectation) {
                    console.log(`[期望衰减] ${status.playerName}: ${oldExpectation}% -> ${status.expectations.currentExpectation}% (已招募${daysSinceStart}天)`);
                }
            }
        });
    }
    
    /**
     * 球员询问初始报价
     * @param {string|number} playerId - 球员ID
     * @returns {Object} 询问结果
     */
    inquireInitialOffer(playerId) {
        const status = this.playerRecruitmentStatus.get(playerId);
        if (!status) {
            return { success: false, message: '球员招募状态未找到' };
        }
        
        if (status.isInsulted) {
            return { success: false, message: '该球员已被羞辱，不再考虑您的球队' };
        }
        
        if (status.hasInquired) {
            return { 
                success: true, 
                message: '已经询问过初始报价',
                expectations: status.expectations
            };
        }
        
        // 标记已询问
        status.hasInquired = true;
        status.stage = 'inquiry';
        
        return {
            success: true,
            message: `${status.playerName} 愿意听取您的报价`,
            expectations: status.expectations,
            hint: `球员期望：${status.expectations.personality}`
        };
    }
    
    /**
     * 处理玩家报价
     * @param {string|number} playerId - 球员ID
     * @param {Object} offer - 报价对象 { scholarship, playingTime, role }
     * @returns {Object} 报价结果
     */
    processPlayerOffer(playerId, offer) {
        const status = this.playerRecruitmentStatus.get(playerId);
        if (!status) {
            return { success: false, message: '球员招募状态未找到' };
        }
        
        if (status.isInsulted) {
            return { success: false, message: '该球员已被羞辱，不再考虑您的球队' };
        }
        
        if (status.isSigned) {
            return { success: false, message: '该球员已经签约' };
        }
        
        const scholarshipPercent = (offer.scholarship || 0) * 100;
        const expectations = status.expectations;
        
        // 检查是否低于最低可接受报价（被羞辱）
        if (scholarshipPercent < expectations.minAcceptable) {
            status.isInsulted = true;
            status.stage = 'insulted';
            
            // 设置消失时间（30天后可以重新出现，但兴趣度降低）
            status.disappearUntil = Date.now() + 30 * 24 * 60 * 60 * 1000;
            
            // 大幅降低对玩家球队的兴趣度
            status.playerInterestInUser = Math.max(0, status.playerInterestInUser - 30);
            
            return {
                success: false,
                type: 'INSULTED',
                message: `${status.playerName} 感到被羞辱！您的报价 ${scholarshipPercent}% 远低于他的最低要求 ${expectations.minAcceptable}%`,
                consequence: '该球员将从您的招募列表中消失30天，之后可以重新尝试，但难度增加',
                playerReaction: '球员愤怒地拒绝了您的报价，并表示不再考虑您的球队'
            };
        }
        
        // 检查是否达到理想报价（直接签约）
        if (scholarshipPercent >= expectations.idealOffer) {
            status.isAutoSigned = true;
            status.stage = 'committed';
            status.bestOffer = offer;
            
            // 大幅提升兴趣度
            status.playerInterestInUser = 100;
            
            return {
                success: true,
                type: 'AUTO_SIGN',
                message: `${status.playerName} 对您的报价非常满意！`,
                playerReaction: '球员毫不犹豫地接受了您的报价，表示这是他的理想选择',
                canSignImmediately: true
            };
        }
        
        // 正常谈判流程
        status.stage = 'negotiating';
        status.bestOffer = offer;
        
        // 根据报价与期望的差距计算兴趣度变化
        const gap = expectations.currentExpectation - scholarshipPercent;
        let interestChange = 0;
        
        if (gap <= 0) {
            // 报价达到或超过当前期望
            interestChange = 10 + Math.floor(Math.random() * 10);
        } else if (gap <= 10) {
            // 差距在10%以内
            interestChange = 5 + Math.floor(Math.random() * 5);
        } else if (gap <= 20) {
            // 差距在10-20%
            interestChange = 0 + Math.floor(Math.random() * 5);
        } else {
            // 差距超过20%
            interestChange = -5 - Math.floor(Math.random() * 5);
        }
        
        status.playerInterestInUser = Math.min(100, Math.max(0, status.playerInterestInUser + interestChange));
        
        return {
            success: true,
            type: 'NEGOTIATION',
            message: `${status.playerName} 正在考虑您的报价`,
            playerReaction: gap <= 10 ? '球员对报价表示兴趣，但希望进一步讨论' : '球员认为报价还有提升空间',
            interestChange: interestChange,
            currentInterest: status.playerInterestInUser,
            gapToExpectation: gap
        };
    }
    
    /**
     * 检查球员是否因被羞辱而消失
     * @param {string|number} playerId - 球员ID
     * @returns {boolean} 是否可见
     */
    isPlayerVisible(playerId) {
        const status = this.playerRecruitmentStatus.get(playerId);
        if (!status) return true;
        
        if (!status.isInsulted) return true;
        
        // 检查消失时间是否已过
        if (status.disappearUntil && Date.now() >= status.disappearUntil) {
            // 重新显示，但保持羞辱状态（需要特殊行动来修复关系）
            return true;
        }
        
        return false;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecruitmentCompetitionSystem;
}
