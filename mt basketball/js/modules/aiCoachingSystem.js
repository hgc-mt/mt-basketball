/**
 * AI球队培养系统
 * 实现教练风格分类、NBA战术应用、资源分配和培养评估
 */

class AICoachingSystem {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        
        // 教练风格定义
        this.coachingStyles = {
            STAR_DEVELOPER: {
                id: 'star_developer',
                name: '核心培养型',
                description: '优先识别并重点培养1-2名具有明星潜力的球员',
                icon: '⭐',
                characteristics: {
                    starFocus: 0.8,           // 明星球员关注度
                    teamBalance: 0.3,         // 团队平衡度
                    rolePlayerDevelopment: 0.4, // 角色球员培养
                    tacticalFlexibility: 0.6   // 战术灵活性
                },
                resourceAllocation: {
                    starTraining: 0.45,       // 明星训练资源 45%
                    teamTraining: 0.30,       // 团队训练资源 30%
                    medical: 0.15,            // 医疗 15%
                    scouting: 0.10            // 球探 10%
                },
                tactics: ['isolation', 'pick_and_roll', 'post_up'],
                preferredAttributes: ['scoring', 'shooting', 'basketballIQ'],
                decisionWeights: {
                    potential: 0.4,
                    currentRating: 0.3,
                    age: 0.2,
                    position: 0.1
                }
            },
            
            BALANCED_TEAM: {
                id: 'balanced_team',
                name: '整体均衡型',
                description: '注重团队整体实力提升，确保各个位置均衡发展',
                icon: '⚖️',
                characteristics: {
                    starFocus: 0.3,
                    teamBalance: 0.9,
                    rolePlayerDevelopment: 0.8,
                    tacticalFlexibility: 0.8
                },
                resourceAllocation: {
                    starTraining: 0.20,
                    teamTraining: 0.45,
                    medical: 0.20,
                    scouting: 0.15
                },
                tactics: ['motion_offense', 'triangle_offense', 'spread_offense'],
                preferredAttributes: ['defense', 'passing', 'basketballIQ', 'stamina'],
                decisionWeights: {
                    potential: 0.25,
                    currentRating: 0.35,
                    age: 0.25,
                    position: 0.15
                }
            },
            
            DEFENSIVE_MINDED: {
                id: 'defensive_minded',
                name: '防守至上型',
                description: '以防守为核心，打造铁血防守体系',
                icon: '🛡️',
                characteristics: {
                    starFocus: 0.5,
                    teamBalance: 0.7,
                    rolePlayerDevelopment: 0.7,
                    tacticalFlexibility: 0.5
                },
                resourceAllocation: {
                    starTraining: 0.25,
                    teamTraining: 0.40,
                    medical: 0.20,
                    scouting: 0.15
                },
                tactics: ['zone_defense', 'man_to_man', 'full_court_press'],
                preferredAttributes: ['defense', 'stealing', 'blocking', 'strength', 'stamina'],
                decisionWeights: {
                    potential: 0.3,
                    currentRating: 0.4,
                    age: 0.2,
                    position: 0.1
                }
            },
            
            OFFENSIVE_GURU: {
                id: 'offensive_guru',
                name: '进攻大师型',
                description: '追求极致进攻，打造华丽进攻体系',
                icon: '🔥',
                characteristics: {
                    starFocus: 0.7,
                    teamBalance: 0.5,
                    rolePlayerDevelopment: 0.5,
                    tacticalFlexibility: 0.9
                },
                resourceAllocation: {
                    starTraining: 0.40,
                    teamTraining: 0.35,
                    medical: 0.15,
                    scouting: 0.10
                },
                tactics: ['pace_and_space', 'seven_seconds', 'pick_and_roll'],
                preferredAttributes: ['scoring', 'shooting', 'threePoint', 'speed', 'passing'],
                decisionWeights: {
                    potential: 0.35,
                    currentRating: 0.35,
                    age: 0.2,
                    position: 0.1
                }
            }
        };
        
        // NBA战术体系
        this.tacticalSystems = {
            // 1. 三角进攻 (Phil Jackson)
            triangle_offense: {
                name: '三角进攻',
                description: '通过三名球员在强侧形成三角，创造传球和进攻机会',
                coach: 'Phil Jackson',
                teams: ['Chicago Bulls', 'LA Lakers'],
                requirements: {
                    postPlayer: 75,      // 需要强力低位球员
                    playmaker: 70,       // 需要组织者
                    shooters: 65         // 需要射手
                },
                effects: {
                    teamChemistry: 0.15,
                    ballMovement: 0.20,
                    scoringEfficiency: 0.10
                },
                positions: ['C', 'PF', 'SF'],
                keyAttributes: ['passing', 'basketballIQ', 'scoring']
            },
            
            // 2. 跑轰战术 (Mike D'Antoni)
            seven_seconds: {
                name: '七秒进攻',
                description: '在7秒内完成进攻，追求快速转换和三分',
                coach: 'Mike D\'Antoni',
                teams: ['Phoenix Suns', 'Houston Rockets'],
                requirements: {
                    speed: 75,
                    threePoint: 70,
                    stamina: 75
                },
                effects: {
                    pace: 0.30,
                    threePointAttempts: 0.25,
                    transitionScoring: 0.20
                },
                positions: ['PG', 'SG', 'SF'],
                keyAttributes: ['speed', 'threePoint', 'stamina', 'passing']
            },
            
            // 3.  motion offense (Gregg Popovich)
            motion_offense: {
                name: '动态进攻',
                description: '强调传球、移动和团队协作，没有固定进攻模式',
                coach: 'Gregg Popovich',
                teams: ['San Antonio Spurs'],
                requirements: {
                    basketballIQ: 70,
                    passing: 68,
                    teamChemistry: 70
                },
                effects: {
                    ballMovement: 0.25,
                    playerDevelopment: 0.20,
                    teamChemistry: 0.15
                },
                positions: ['All'],
                keyAttributes: ['passing', 'basketballIQ', 'defense']
            },
            
            // 4. 区域联防 (Various)
            zone_defense: {
                name: '区域联防',
                description: '通过区域防守限制对手突破和内线得分',
                coach: 'Syracuse Zone',
                teams: ['Syracuse University'],
                requirements: {
                    length: 70,
                    basketballIQ: 65,
                    communication: 70
                },
                effects: {
                    defense: 0.20,
                    rebounding: 0.15,
                    blocks: 0.10
                },
                positions: ['C', 'PF', 'SF'],
                keyAttributes: ['blocking', 'rebounding', 'basketballIQ']
            },
            
            // 5. 挡拆战术 (Jerry Sloan)
            pick_and_roll: {
                name: '挡拆战术',
                description: '通过挡拆配合创造错位进攻机会',
                coach: 'Jerry Sloan',
                teams: ['Utah Jazz'],
                requirements: {
                    ballHandler: 72,
                    screener: 70,
                    decisionMaking: 68
                },
                effects: {
                    pickAndRollEfficiency: 0.25,
                    assists: 0.15,
                    scoring: 0.10
                },
                positions: ['PG', 'C', 'PF'],
                keyAttributes: ['passing', 'basketballIQ', 'scoring']
            },
            
            // 6. 空间进攻 (Steve Kerr)
            pace_and_space: {
                name: '空间进攻',
                description: '拉开空间，强调三分和快速传导球',
                coach: 'Steve Kerr',
                teams: ['Golden State Warriors'],
                requirements: {
                    threePoint: 72,
                    passing: 70,
                    speed: 68
                },
                effects: {
                    threePointEfficiency: 0.25,
                    spacing: 0.20,
                    ballMovement: 0.15
                },
                positions: ['PG', 'SG', 'SF', 'PF'],
                keyAttributes: ['threePoint', 'passing', 'speed']
            }
        };
        
        // AI球队数据库
        this.aiTeams = new Map();
    }

    /**
     * 创建AI球队
     */
    createAITeam(teamId, teamName, styleId, roster) {
        const style = this.coachingStyles[styleId];
        if (!style) {
            console.error(`Unknown coaching style: ${styleId}`);
            return null;
        }
        
        const aiTeam = {
            id: teamId,
            name: teamName,
            style: style,
            roster: roster,
            tacticalSystem: null,
            resources: {
                trainingBudget: 1000000,
                medicalBudget: 500000,
                scoutingBudget: 300000,
                totalBudget: 1800000
            },
            development: {
                starPlayers: [],
                rolePlayers: [],
                prospects: [],
                trainingFocus: {}
            },
            history: {
                wins: 0,
                losses: 0,
                championships: 0,
                playerDeveloped: []
            },
            analytics: {
                teamRating: 0,
                offensiveRating: 0,
                defensiveRating: 0,
                chemistry: 50
            }
        };
        
        // 分析阵容并制定培养策略
        this.analyzeRoster(aiTeam);
        
        // 选择战术体系
        this.selectTacticalSystem(aiTeam);
        
        // 分配资源
        this.allocateResources(aiTeam);
        
        this.aiTeams.set(teamId, aiTeam);
        return aiTeam;
    }

    /**
     * 分析阵容
     */
    analyzeRoster(aiTeam) {
        const players = aiTeam.roster;
        const style = aiTeam.style;
        
        // 计算球员评分
        const playerScores = players.map(player => ({
            player: player,
            score: this.calculatePlayerScore(player, style),
            potential: player.potential || 60,
            rating: player.rating || 50,
            age: player.year || 1
        }));
        
        // 排序
        playerScores.sort((a, b) => b.score - a.score);
        
        // 分类球员
        if (style.id === 'star_developer') {
            // 核心培养型：识别1-2名明星潜力球员
            aiTeam.development.starPlayers = playerScores
                .filter(p => p.potential >= 80)
                .slice(0, 2)
                .map(p => p.player);
            
            aiTeam.development.rolePlayers = playerScores
                .filter(p => p.potential < 80 && p.potential >= 65)
                .map(p => p.player);
            
            aiTeam.development.prospects = playerScores
                .filter(p => p.potential < 65)
                .map(p => p.player);
        } else {
            // 整体均衡型：更注重团队平衡
            const avgRating = playerScores.reduce((sum, p) => sum + p.rating, 0) / playerScores.length;
            
            aiTeam.development.starPlayers = playerScores
                .filter(p => p.rating > avgRating + 10)
                .slice(0, 1)
                .map(p => p.player);
            
            aiTeam.development.rolePlayers = playerScores
                .filter(p => Math.abs(p.rating - avgRating) <= 10)
                .map(p => p.player);
            
            aiTeam.development.prospects = playerScores
                .filter(p => p.potential > p.rating + 15)
                .map(p => p.player);
        }
        
        // 计算球队分析数据
        aiTeam.analytics.teamRating = Math.round(
            playerScores.reduce((sum, p) => sum + p.rating, 0) / playerScores.length
        );
        
        aiTeam.analytics.offensiveRating = this.calculateOffensiveRating(players);
        aiTeam.analytics.defensiveRating = this.calculateDefensiveRating(players);
    }

    /**
     * 计算球员评分（基于教练风格）
     */
    calculatePlayerScore(player, style) {
        const weights = style.decisionWeights;
        const attributes = player.attributes || {};
        
        let score = 0;
        
        // 潜力评分
        score += (player.potential || 60) * weights.potential;
        
        // 当前能力评分
        score += (player.rating || 50) * weights.currentRating;
        
        // 年龄因素（年轻更有价值）
        const ageValue = (5 - (player.year || 1)) * 20;
        score += ageValue * weights.age;
        
        // 位置适配度
        const positionFit = this.calculatePositionFit(player, style);
        score += positionFit * weights.position * 100;
        
        // 属性匹配度
        const attributeMatch = this.calculateAttributeMatch(attributes, style.preferredAttributes);
        score += attributeMatch * 20;
        
        return score;
    }

    /**
     * 计算位置适配度
     */
    calculatePositionFit(player, style) {
        const positionImportance = {
            'star_developer': { PG: 0.9, SG: 0.95, SF: 0.9, PF: 0.85, C: 0.8 },
            'balanced_team': { PG: 0.9, SG: 0.9, SF: 0.9, PF: 0.9, C: 0.9 },
            'defensive_minded': { PG: 0.85, SG: 0.85, SF: 0.9, PF: 0.95, C: 0.95 },
            'offensive_guru': { PG: 0.95, SG: 0.95, SF: 0.9, PF: 0.85, C: 0.8 }
        };
        
        const importance = positionImportance[style.id] || positionImportance['balanced_team'];
        return importance[player.position] || 0.5;
    }

    /**
     * 计算属性匹配度
     */
    calculateAttributeMatch(attributes, preferredAttributes) {
        if (!preferredAttributes || preferredAttributes.length === 0) return 0.5;
        
        let totalMatch = 0;
        preferredAttributes.forEach(attr => {
            const value = attributes[attr] || 50;
            totalMatch += value / 100;
        });
        
        return totalMatch / preferredAttributes.length;
    }

    /**
     * 选择战术体系
     */
    selectTacticalSystem(aiTeam) {
        const players = aiTeam.roster;
        const style = aiTeam.style;
        
        // 计算每种战术的适配度
        let bestTactic = null;
        let bestScore = -1;
        
        for (const [tacticId, tactic] of Object.entries(this.tacticalSystems)) {
            const score = this.calculateTacticFit(tactic, players, style, tacticId);
            if (score > bestScore) {
                bestScore = score;
                bestTactic = tactic;
            }
        }
        
        aiTeam.tacticalSystem = {
            ...bestTactic,
            fitScore: bestScore,
            effectiveness: bestScore * 100
        };
        
        return aiTeam.tacticalSystem;
    }

    /**
     * 计算战术适配度
     */
    calculateTacticFit(tactic, players, style, tacticId = null) {
        let score = 0;
        let totalWeight = 0;
        
        // 检查战术要求
        for (const [requirement, threshold] of Object.entries(tactic.requirements)) {
            const teamValue = this.getTeamAttributeAverage(players, requirement);
            const weight = threshold / 100;
            
            if (teamValue >= threshold) {
                score += weight * 1.0;
            } else {
                score += weight * (teamValue / threshold);
            }
            totalWeight += weight;
        }
        
        // 检查教练风格匹配
        if (tacticId && style.tactics.includes(tacticId)) {
            score += 0.2;
            totalWeight += 0.2;
        }
        
        return totalWeight > 0 ? score / totalWeight : 0.5;
    }

    /**
     * 获取球队属性平均值
     */
    getTeamAttributeAverage(players, attribute) {
        if (attribute === 'speed' || attribute === 'threePoint' || attribute === 'stamina') {
            const values = players.map(p => p.attributes?.[attribute] || 50);
            return values.reduce((sum, v) => sum + v, 0) / values.length;
        }
        
        // 特殊属性计算
        if (attribute === 'postPlayer') {
            const bigs = players.filter(p => p.position === 'C' || p.position === 'PF');
            const values = bigs.map(p => p.attributes?.scoring || 50);
            return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 50;
        }
        
        if (attribute === 'playmaker') {
            const guards = players.filter(p => p.position === 'PG' || p.position === 'SG');
            const values = guards.map(p => p.attributes?.passing || 50);
            return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 50;
        }
        
        return 50;
    }

    /**
     * 分配资源
     */
    allocateResources(aiTeam) {
        const allocation = aiTeam.style.resourceAllocation;
        const totalBudget = aiTeam.resources.totalBudget;
        
        // 计算各项预算
        aiTeam.resources.trainingBudget = Math.round(totalBudget * allocation.starTraining);
        aiTeam.resources.teamTrainingBudget = Math.round(totalBudget * allocation.teamTraining);
        aiTeam.resources.medicalBudget = Math.round(totalBudget * allocation.medical);
        aiTeam.resources.scoutingBudget = Math.round(totalBudget * allocation.scouting);
        
        // 制定训练计划
        this.createTrainingPlan(aiTeam);
    }

    /**
     * 创建训练计划
     */
    createTrainingPlan(aiTeam) {
        const style = aiTeam.style;
        const plan = {
            starTraining: {},
            teamTraining: {},
            medical: {},
            focus: []
        };
        
        // 明星球员训练计划
        aiTeam.development.starPlayers.forEach(player => {
            plan.starTraining[player.id] = {
                intensity: 'high',
                focus: style.preferredAttributes.slice(0, 2),
                minutesPerDay: 120,
                budget: Math.round(aiTeam.resources.trainingBudget * 0.6 / aiTeam.development.starPlayers.length)
            };
        });
        
        // 团队训练计划
        plan.teamTraining = {
            intensity: 'medium',
            focus: ['defense', 'teamChemistry'],
            minutesPerDay: 90,
            budget: aiTeam.resources.teamTrainingBudget
        };
        
        // 医疗计划
        plan.medical = {
            prevention: 0.6,
            treatment: 0.4,
            budget: aiTeam.resources.medicalBudget
        };
        
        aiTeam.development.trainingFocus = plan;
        return plan;
    }

    /**
     * 计算进攻评分
     */
    calculateOffensiveRating(players) {
        const offensiveAttrs = ['scoring', 'shooting', 'threePoint', 'passing'];
        let total = 0;
        
        players.forEach(player => {
            const attrs = player.attributes || {};
            const avg = offensiveAttrs.reduce((sum, attr) => sum + (attrs[attr] || 50), 0) / offensiveAttrs.length;
            total += avg;
        });
        
        return Math.round(total / players.length);
    }

    /**
     * 计算防守评分
     */
    calculateDefensiveRating(players) {
        const defensiveAttrs = ['defense', 'stealing', 'blocking', 'rebounding'];
        let total = 0;
        
        players.forEach(player => {
            const attrs = player.attributes || {};
            const avg = defensiveAttrs.reduce((sum, attr) => sum + (attrs[attr] || 50), 0) / defensiveAttrs.length;
            total += avg;
        });
        
        return Math.round(total / players.length);
    }

    /**
     * 生成培养报告
     */
    generateDevelopmentReport(aiTeam) {
        const report = {
            teamName: aiTeam.name,
            coachingStyle: aiTeam.style.name,
            tacticalSystem: aiTeam.tacticalSystem?.name,
            
            rosterAnalysis: {
                totalPlayers: aiTeam.roster.length,
                starPlayers: aiTeam.development.starPlayers.length,
                rolePlayers: aiTeam.development.rolePlayers.length,
                prospects: aiTeam.development.prospects.length,
                averageRating: aiTeam.analytics.teamRating,
                offensiveRating: aiTeam.analytics.offensiveRating,
                defensiveRating: aiTeam.analytics.defensiveRating
            },
            
            resourceAllocation: {
                training: aiTeam.resources.trainingBudget,
                teamTraining: aiTeam.resources.teamTrainingBudget,
                medical: aiTeam.resources.medicalBudget,
                scouting: aiTeam.resources.scoutingBudget
            },
            
            trainingPlan: aiTeam.development.trainingFocus,
            
            recommendations: this.generateRecommendations(aiTeam),
            
            futureProjection: this.projectFutureDevelopment(aiTeam, 3)
        };
        
        return report;
    }

    /**
     * 生成建议
     */
    generateRecommendations(aiTeam) {
        const recommendations = [];
        const style = aiTeam.style;
        
        // 基于风格的建议
        if (style.id === 'star_developer' && aiTeam.development.starPlayers.length < 2) {
            recommendations.push({
                type: 'recruitment',
                priority: 'high',
                message: '需要招募更多高潜力球员作为核心培养对象'
            });
        }
        
        if (style.id === 'balanced_team' && aiTeam.analytics.teamRating < 60) {
            recommendations.push({
                type: 'development',
                priority: 'medium',
                message: '球队整体实力较弱，建议加强团队训练'
            });
        }
        
        // 战术适配建议
        if (aiTeam.tacticalSystem?.fitScore < 0.6) {
            recommendations.push({
                type: 'tactics',
                priority: 'high',
                message: `当前战术体系(${aiTeam.tacticalSystem?.name})适配度较低，建议调整阵容或更换战术`
            });
        }
        
        return recommendations;
    }

    /**
     * 预测未来发展
     */
    projectFutureDevelopment(aiTeam, seasons) {
        const projections = [];
        let currentRating = aiTeam.analytics.teamRating;
        
        for (let i = 1; i <= seasons; i++) {
            // 模拟成长
            const starGrowth = aiTeam.development.starPlayers.length * 3;
            const roleGrowth = aiTeam.development.rolePlayers.length * 1;
            const prospectGrowth = aiTeam.development.prospects.length * 2;
            
            const totalGrowth = (starGrowth + roleGrowth + prospectGrowth) / aiTeam.roster.length;
            currentRating += totalGrowth;
            
            projections.push({
                season: i,
                projectedRating: Math.round(currentRating),
                starPlayersRating: Math.round(currentRating + 5),
                teamStrength: currentRating > 75 ? 'strong' : (currentRating > 60 ? 'average' : 'weak')
            });
        }
        
        return projections;
    }

    /**
     * 模拟AI球队对抗
     */
    simulateMatchup(team1Id, team2Id) {
        const team1 = this.aiTeams.get(team1Id);
        const team2 = this.aiTeams.get(team2Id);
        
        if (!team1 || !team2) {
            return { error: 'Team not found' };
        }
        
        // 计算胜率
        const rating1 = team1.analytics.teamRating;
        const rating2 = team2.analytics.teamRating;
        
        const ratingDiff = rating1 - rating2;
        const winProbability1 = 1 / (1 + Math.exp(-ratingDiff / 10));
        
        // 战术相克
        const tacticAdvantage = this.calculateTacticAdvantage(team1, team2);
        
        // 最终胜率
        const adjustedProb1 = Math.max(0.1, Math.min(0.9, winProbability1 + tacticAdvantage));
        
        return {
            team1: {
                name: team1.name,
                style: team1.style.name,
                rating: rating1,
                winProbability: Math.round(adjustedProb1 * 100)
            },
            team2: {
                name: team2.name,
                style: team2.style.name,
                rating: rating2,
                winProbability: Math.round((1 - adjustedProb1) * 100)
            },
            tacticAnalysis: this.analyzeTacticMatchup(team1, team2),
            predictedScore: this.predictScore(team1, team2, adjustedProb1)
        };
    }

    /**
     * 计算战术优势
     */
    calculateTacticAdvantage(team1, team2) {
        // 简化的战术相克逻辑
        const tacticPairs = {
            'seven_seconds': { weakAgainst: ['zone_defense'], strongAgainst: ['triangle_offense'] },
            'zone_defense': { weakAgainst: ['pace_and_space'], strongAgainst: ['seven_seconds'] },
            'pace_and_space': { weakAgainst: ['man_to_man'], strongAgainst: ['zone_defense'] }
        };
        
        const t1 = team1.tacticalSystem?.name;
        const t2 = team2.tacticalSystem?.name;
        
        if (!t1 || !t2) return 0;
        
        // 检查相克关系
        const advantage = tacticPairs[t1];
        if (advantage) {
            if (advantage.strongAgainst?.includes(t2)) return 0.1;
            if (advantage.weakAgainst?.includes(t2)) return -0.1;
        }
        
        return 0;
    }

    /**
     * 分析战术对决
     */
    analyzeTacticMatchup(team1, team2) {
        return {
            team1Tactic: team1.tacticalSystem?.name,
            team2Tactic: team2.tacticalSystem?.name,
            team1Effectiveness: Math.round((team1.tacticalSystem?.effectiveness || 50)),
            team2Effectiveness: Math.round((team2.tacticalSystem?.effectiveness || 50)),
            keyMatchups: this.identifyKeyMatchups(team1, team2)
        };
    }

    /**
     * 识别关键对位
     */
    identifyKeyMatchups(team1, team2) {
        const matchups = [];
        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        
        positions.forEach(pos => {
            const p1 = team1.roster.find(p => p.position === pos);
            const p2 = team2.roster.find(p => p.position === pos);
            
            if (p1 && p2) {
                const diff = (p1.rating || 50) - (p2.rating || 50);
                matchups.push({
                    position: pos,
                    team1Player: p1.name,
                    team2Player: p2.name,
                    advantage: diff > 5 ? 'team1' : (diff < -5 ? 'team2' : 'even'),
                    difference: Math.abs(diff)
                });
            }
        });
        
        return matchups;
    }

    /**
     * 预测比分
     */
    predictScore(team1, team2, prob1) {
        const baseScore = 70;
        const rating1 = team1.analytics.teamRating;
        const rating2 = team2.analytics.teamRating;
        
        const score1 = Math.round(baseScore + (rating1 - 60) * 0.5 + (prob1 - 0.5) * 20);
        const score2 = Math.round(baseScore + (rating2 - 60) * 0.5 + (0.5 - prob1) * 20);
        
        return {
            team1: score1,
            team2: score2
        };
    }

    /**
     * 自定义教练风格参数
     */
    customizeCoachingStyle(baseStyleId, customizations) {
        const baseStyle = this.coachingStyles[baseStyleId];
        if (!baseStyle) return null;
        
        const customStyle = {
            ...baseStyle,
            id: `${baseStyleId}_custom`,
            name: `${baseStyle.name} (自定义)`,
            characteristics: { ...baseStyle.characteristics, ...customizations.characteristics },
            resourceAllocation: { ...baseStyle.resourceAllocation, ...customizations.resourceAllocation },
            decisionWeights: { ...baseStyle.decisionWeights, ...customizations.decisionWeights }
        };
        
        return customStyle;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AICoachingSystem };
}
