/**
 * AI教练系统可视化报告模块
 * 生成培养计划、成长曲线、战术分析等可视化报告
 */

class AICoachingReport {
    constructor(aiCoachingSystem) {
        this.aiSystem = aiCoachingSystem;
        this.chartColors = {
            primary: '#3b82f6',
            secondary: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#8b5cf6',
            neutral: '#6b7280'
        };
    }

    /**
     * 生成完整的球队培养报告
     */
    generateFullReport(aiTeam) {
        const report = this.aiSystem.generateDevelopmentReport(aiTeam);
        
        return {
            summary: this.generateExecutiveSummary(report),
            rosterAnalysis: this.generateRosterAnalysis(report),
            developmentPlan: this.generateDevelopmentPlan(aiTeam),
            tacticalAnalysis: this.generateTacticalAnalysis(aiTeam),
            resourceAllocation: this.generateResourceReport(aiTeam),
            growthProjection: this.generateGrowthProjection(aiTeam),
            matchupAnalysis: this.generateMatchupAnalysis(aiTeam),
            recommendations: this.generateActionItems(report)
        };
    }

    /**
     * 生成执行摘要
     */
    generateExecutiveSummary(report) {
        return {
            title: `${report.teamName} 培养报告`,
            date: new Date().toLocaleDateString('zh-CN'),
            overview: {
                coachingStyle: report.coachingStyle,
                tacticalSystem: report.tacticalSystem,
                teamStrength: this.getTeamStrengthLabel(report.rosterAnalysis.averageRating),
                developmentStage: this.getDevelopmentStage(report)
            },
            keyMetrics: [
                { label: '球队评分', value: report.rosterAnalysis.averageRating, max: 100 },
                { label: '进攻评分', value: report.rosterAnalysis.offensiveRating, max: 100 },
                { label: '防守评分', value: report.rosterAnalysis.defensiveRating, max: 100 },
                { label: '明星球员', value: report.rosterAnalysis.starPlayers, max: 5 },
                { label: '角色球员', value: report.rosterAnalysis.rolePlayers, max: 10 }
            ],
            highlights: this.generateHighlights(report)
        };
    }

    /**
     * 生成阵容分析
     */
    generateRosterAnalysis(report) {
        const players = report.rosterAnalysis;
        
        return {
            composition: {
                labels: ['明星球员', '角色球员', '潜力新秀'],
                data: [players.starPlayers, players.rolePlayers, players.prospects],
                colors: [this.chartColors.primary, this.chartColors.secondary, this.chartColors.info]
            },
            positionDistribution: this.analyzePositionDistribution(report),
            ageDistribution: this.analyzeAgeDistribution(report),
            ratingDistribution: this.analyzeRatingDistribution(report),
            topPlayers: this.getTopPlayers(report, 5),
            positionStrengths: this.analyzePositionStrengths(report)
        };
    }

    /**
     * 生成培养计划
     */
    generateDevelopmentPlan(aiTeam) {
        const plan = aiTeam.development.trainingFocus;
        const style = aiTeam.style;
        
        return {
            strategy: {
                name: style.name,
                description: style.description,
                focus: this.getDevelopmentFocus(style)
            },
            starPlayerPlans: aiTeam.development.starPlayers.map(player => ({
                playerName: player.name,
                position: player.position,
                currentRating: player.rating,
                potential: player.potential,
                trainingIntensity: plan.starTraining[player.id]?.intensity || 'medium',
                focusAreas: plan.starTraining[player.id]?.focus || [],
                dailyMinutes: plan.starTraining[player.id]?.minutesPerDay || 90,
                budget: plan.starTraining[player.id]?.budget || 0,
                projectedGrowth: this.calculateProjectedGrowth(player, plan.starTraining[player.id])
            })),
            teamTraining: {
                intensity: plan.teamTraining.intensity,
                focus: plan.teamTraining.focus,
                dailyMinutes: plan.teamTraining.minutesPerDay,
                budget: plan.teamTraining.budget
            },
            medicalPlan: {
                preventionFocus: plan.medical.prevention * 100,
                treatmentFocus: plan.medical.treatment * 100,
                budget: plan.medical.budget
            },
            weeklySchedule: this.generateWeeklySchedule(aiTeam)
        };
    }

    /**
     * 生成战术分析
     */
    generateTacticalAnalysis(aiTeam) {
        const system = aiTeam.tacticalSystem;
        
        if (!system) {
            return { error: '未选择战术体系' };
        }
        
        return {
            currentSystem: {
                name: system.name,
                description: system.description,
                coach: system.coach,
                teams: system.teams,
                fitScore: Math.round(system.fitScore * 100),
                effectiveness: Math.round(system.effectiveness)
            },
            requirements: this.analyzeTacticalRequirements(aiTeam, system),
            effects: system.effects,
            keyPlayers: this.identifyTacticalKeyPlayers(aiTeam, system),
            alternatives: this.suggestAlternativeTactics(aiTeam),
            optimization: this.generateTacticalOptimization(aiTeam)
        };
    }

    /**
     * 生成资源分配报告
     */
    generateResourceReport(aiTeam) {
        const resources = aiTeam.resources;
        const allocation = aiTeam.style.resourceAllocation;
        
        return {
            totalBudget: resources.totalBudget,
            breakdown: [
                { 
                    category: '明星训练', 
                    amount: resources.trainingBudget, 
                    percentage: allocation.starTraining * 100,
                    color: this.chartColors.primary 
                },
                { 
                    category: '团队训练', 
                    amount: resources.teamTrainingBudget, 
                    percentage: allocation.teamTraining * 100,
                    color: this.chartColors.secondary 
                },
                { 
                    category: '医疗保障', 
                    amount: resources.medicalBudget, 
                    percentage: allocation.medical * 100,
                    color: this.chartColors.warning 
                },
                { 
                    category: '球探系统', 
                    amount: resources.scoutingBudget, 
                    percentage: allocation.scouting * 100,
                    color: this.chartColors.info 
                }
            ],
            efficiency: this.calculateResourceEfficiency(aiTeam),
            recommendations: this.generateResourceRecommendations(aiTeam)
        };
    }

    /**
     * 生成成长预测
     */
    generateGrowthProjection(aiTeam) {
        const projections = this.aiSystem.projectFutureDevelopment(aiTeam, 3);
        const players = aiTeam.roster;
        
        return {
            teamProjection: {
                seasons: projections.map(p => `第${p.season}赛季`),
                ratings: projections.map(p => p.projectedRating),
                trend: this.calculateTrend(projections)
            },
            playerProjections: players.slice(0, 5).map(player => ({
                name: player.name,
                position: player.position,
                currentRating: player.rating,
                potential: player.potential,
                projection: this.projectPlayerGrowth(player, 3)
            })),
            keyMilestones: this.identifyMilestones(aiTeam, projections),
            riskFactors: this.identifyRiskFactors(aiTeam)
        };
    }

    /**
     * 生成对抗分析
     */
    generateMatchupAnalysis(aiTeam) {
        // 获取其他AI球队进行对比
        const otherTeams = Array.from(this.aiSystem.aiTeams.values())
            .filter(t => t.id !== aiTeam.id)
            .slice(0, 3);
        
        const matchups = otherTeams.map(opponent => 
            this.aiSystem.simulateMatchup(aiTeam.id, opponent.id)
        );
        
        return {
            teamProfile: {
                name: aiTeam.name,
                style: aiTeam.style.name,
                rating: aiTeam.analytics.teamRating,
                strengths: this.identifyTeamStrengths(aiTeam),
                weaknesses: this.identifyTeamWeaknesses(aiTeam)
            },
            matchups: matchups.map(m => ({
                opponent: m.team2.name,
                opponentStyle: m.team2.style,
                winProbability: m.team1.winProbability,
                predictedScore: m.predictedScore,
                keyFactors: this.analyzeMatchupFactors(m)
            })),
            tacticalAdvantages: this.identifyTacticalAdvantages(aiTeam, otherTeams)
        };
    }

    /**
     * 生成行动建议
     */
    generateActionItems(report) {
        const recommendations = report.recommendations;
        
        return {
            immediate: recommendations
                .filter(r => r.priority === 'high')
                .map(r => ({
                    action: r.message,
                    type: r.type,
                    impact: 'high',
                    timeline: '立即'
                })),
            shortTerm: recommendations
                .filter(r => r.priority === 'medium')
                .map(r => ({
                    action: r.message,
                    type: r.type,
                    impact: 'medium',
                    timeline: '本赛季'
                })),
            longTerm: [
                {
                    action: '持续监控球员成长，调整培养策略',
                    type: 'development',
                    impact: 'medium',
                    timeline: '未来3个赛季'
                },
                {
                    action: '根据球队发展调整战术体系',
                    type: 'tactics',
                    impact: 'high',
                    timeline: '未来2个赛季'
                }
            ]
        };
    }

    // 辅助方法

    getTeamStrengthLabel(rating) {
        if (rating >= 80) return '顶级强队';
        if (rating >= 70) return '季后赛级别';
        if (rating >= 60) return '中等水平';
        if (rating >= 50) return '需要重建';
        return '鱼腩球队';
    }

    getDevelopmentStage(report) {
        const starCount = report.rosterAnalysis.starPlayers;
        const prospectCount = report.rosterAnalysis.prospects;
        
        if (starCount >= 2 && prospectCount >= 3) return '黄金期';
        if (starCount >= 1) return '发展期';
        if (prospectCount >= 5) return '重建期';
        return '调整期';
    }

    generateHighlights(report) {
        const highlights = [];
        
        if (report.rosterAnalysis.starPlayers >= 2) {
            highlights.push('拥有多名明星球员，具备争冠潜力');
        }
        
        if (report.rosterAnalysis.averageRating > 70) {
            highlights.push('球队整体实力强劲');
        }
        
        if (report.rosterAnalysis.offensiveRating > report.rosterAnalysis.defensiveRating + 10) {
            highlights.push('进攻火力强大，但防守需要加强');
        }
        
        return highlights;
    }

    analyzePositionDistribution(report) {
        // 简化实现
        return {
            PG: 2, SG: 2, SF: 3, PF: 2, C: 2
        };
    }

    analyzeAgeDistribution(report) {
        return {
            labels: ['大一', '大二', '大三', '大四'],
            data: [5, 4, 3, 2]
        };
    }

    analyzeRatingDistribution(report) {
        return {
            ranges: ['<50', '50-60', '60-70', '70-80', '80+'],
            counts: [2, 5, 8, 4, 1]
        };
    }

    getTopPlayers(report, count) {
        // 简化实现
        return [];
    }

    analyzePositionStrengths(report) {
        return {
            PG: { rating: 65, assessment: 'average' },
            SG: { rating: 70, assessment: 'good' },
            SF: { rating: 68, assessment: 'average' },
            PF: { rating: 72, assessment: 'good' },
            C: { rating: 75, assessment: 'strong' }
        };
    }

    getDevelopmentFocus(style) {
        const focusMap = {
            'star_developer': '重点培养明星球员，打造核心阵容',
            'balanced_team': '均衡发展，提升整体实力',
            'defensive_minded': '打造铁血防守，提升防守效率',
            'offensive_guru': '追求进攻火力，提升得分能力'
        };
        return focusMap[style.id] || '综合发展';
    }

    calculateProjectedGrowth(player, training) {
        if (!training) return 0;
        
        const intensityMultiplier = {
            'low': 1,
            'medium': 2,
            'high': 3
        };
        
        const potentialGap = (player.potential || 60) - (player.rating || 50);
        const intensity = intensityMultiplier[training.intensity] || 2;
        
        return Math.round(potentialGap * 0.1 * intensity);
    }

    generateWeeklySchedule(aiTeam) {
        return [
            { day: '周一', focus: '体能训练', intensity: 'medium' },
            { day: '周二', focus: '技术训练', intensity: 'high' },
            { day: '周三', focus: '战术演练', intensity: 'high' },
            { day: '周四', focus: '恢复训练', intensity: 'low' },
            { day: '周五', focus: '对抗训练', intensity: 'high' },
            { day: '周六', focus: '比赛日', intensity: 'max' },
            { day: '周日', focus: '休息/恢复', intensity: 'none' }
        ];
    }

    analyzeTacticalRequirements(aiTeam, system) {
        const requirements = [];
        
        for (const [req, threshold] of Object.entries(system.requirements)) {
            const current = this.aiSystem.getTeamAttributeAverage(aiTeam.roster, req);
            requirements.push({
                name: req,
                required: threshold,
                current: Math.round(current),
                status: current >= threshold ? '满足' : '不足',
                gap: Math.round(threshold - current)
            });
        }
        
        return requirements;
    }

    identifyTacticalKeyPlayers(aiTeam, system) {
        const keyPositions = system.positions || [];
        
        return keyPositions.map(pos => {
            const player = aiTeam.roster.find(p => p.position === pos);
            return {
                position: pos,
                player: player ? player.name : '缺人',
                importance: 'high'
            };
        });
    }

    suggestAlternativeTactics(aiTeam) {
        const alternatives = [];
        const currentTactic = aiTeam.tacticalSystem?.name;
        
        for (const [id, tactic] of Object.entries(this.aiSystem.tacticalSystems)) {
            if (tactic.name !== currentTactic) {
                const fit = this.aiSystem.calculateTacticFit(tactic, aiTeam.roster, aiTeam.style, id);
                if (fit > 0.6) {
                    alternatives.push({
                        name: tactic.name,
                        fitScore: Math.round(fit * 100),
                        description: tactic.description
                    });
                }
            }
        }
        
        return alternatives.sort((a, b) => b.fitScore - a.fitScore).slice(0, 3);
    }

    generateTacticalOptimization(aiTeam) {
        return {
            currentEffectiveness: Math.round(aiTeam.tacticalSystem?.effectiveness || 50),
            suggestions: [
                '加强战术演练，提升执行效率',
                '根据对手特点灵活调整战术',
                '培养关键位置球员的战术理解'
            ]
        };
    }

    calculateResourceEfficiency(aiTeam) {
        // 简化计算
        return {
            overall: 75,
            training: 80,
            medical: 70,
            scouting: 75
        };
    }

    generateResourceRecommendations(aiTeam) {
        return [
            '根据球员成长情况动态调整训练预算',
            '增加医疗保障投入，减少伤病风险',
            '加强球探系统，发掘更多潜力新秀'
        ];
    }

    projectPlayerGrowth(player, seasons) {
        const projections = [];
        let currentRating = player.rating || 50;
        const potential = player.potential || 60;
        
        for (let i = 1; i <= seasons; i++) {
            const growth = Math.min(5, (potential - currentRating) * 0.2);
            currentRating += growth;
            
            projections.push({
                season: i,
                rating: Math.round(currentRating),
                growth: Math.round(growth * 10) / 10
            });
        }
        
        return projections;
    }

    identifyMilestones(aiTeam, projections) {
        const milestones = [];
        
        projections.forEach(p => {
            if (p.projectedRating > 70 && p.season === 1) {
                milestones.push({
                    season: p.season,
                    event: '球队实力突破70分大关',
                    type: 'achievement'
                });
            }
        });
        
        return milestones;
    }

    identifyRiskFactors(aiTeam) {
        const risks = [];
        
        if (aiTeam.development.starPlayers.length < 2) {
            risks.push({
                type: 'talent',
                description: '明星球员不足，缺乏核心竞争力',
                severity: 'high'
            });
        }
        
        return risks;
    }

    calculateTrend(projections) {
        if (projections.length < 2) return 'stable';
        
        const first = projections[0].projectedRating;
        const last = projections[projections.length - 1].projectedRating;
        
        if (last - first > 10) return 'upward';
        if (last - first < -5) return 'downward';
        return 'stable';
    }

    identifyTeamStrengths(aiTeam) {
        const strengths = [];
        
        if (aiTeam.analytics.offensiveRating > 70) {
            strengths.push('进攻火力');
        }
        if (aiTeam.analytics.defensiveRating > 70) {
            strengths.push('防守强度');
        }
        
        return strengths;
    }

    identifyTeamWeaknesses(aiTeam) {
        const weaknesses = [];
        
        if (aiTeam.analytics.offensiveRating < 60) {
            weaknesses.push('进攻效率');
        }
        if (aiTeam.analytics.defensiveRating < 60) {
            weaknesses.push('防守漏洞');
        }
        
        return weaknesses;
    }

    analyzeMatchupFactors(matchup) {
        return [
            '球队整体实力对比',
            '战术体系相克关系',
            '关键位置对位优势'
        ];
    }

    identifyTacticalAdvantages(aiTeam, opponents) {
        return opponents.map(opp => ({
            opponent: opp.name,
            advantages: ['主场优势'],
            disadvantages: []
        }));
    }

    /**
     * 生成HTML格式的报告
     */
    generateHTMLReport(aiTeam) {
        const report = this.generateFullReport(aiTeam);
        
        return `
        <div class="ai-coaching-report">
            <div class="report-header">
                <h1>${report.summary.title}</h1>
                <p class="report-date">生成日期: ${report.summary.date}</p>
            </div>
            
            <div class="report-section">
                <h2>执行摘要</h2>
                <div class="overview-grid">
                    <div class="overview-item">
                        <label>教练风格</label>
                        <value>${report.summary.overview.coachingStyle}</value>
                    </div>
                    <div class="overview-item">
                        <label>战术体系</label>
                        <value>${report.summary.overview.tacticalSystem}</value>
                    </div>
                    <div class="overview-item">
                        <label>球队实力</label>
                        <value>${report.summary.overview.teamStrength}</value>
                    </div>
                    <div class="overview-item">
                        <label>发展阶段</label>
                        <value>${report.summary.overview.developmentStage}</value>
                    </div>
                </div>
            </div>
            
            <div class="report-section">
                <h2>关键指标</h2>
                <div class="metrics-grid">
                    ${report.summary.keyMetrics.map(m => `
                        <div class="metric-card">
                            <div class="metric-label">${m.label}</div>
                            <div class="metric-value">${m.value}/${m.max}</div>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: ${(m.value/m.max*100)}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="report-section">
                <h2>培养计划</h2>
                <div class="development-plan">
                    <h3>明星球员培养</h3>
                    ${report.developmentPlan.starPlayerPlans.map(p => `
                        <div class="player-plan">
                            <div class="player-info">
                                <strong>${p.playerName}</strong> (${p.position})
                                <span class="rating">${p.currentRating} → ${p.currentRating + p.projectedGrowth}</span>
                            </div>
                            <div class="training-details">
                                训练强度: ${p.trainingIntensity} | 
                                每日时长: ${p.dailyMinutes}分钟 | 
                                预算: $${p.budget?.toLocaleString()}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="report-section">
                <h2>未来预测</h2>
                <div class="projection-chart">
                    <div class="chart-labels">
                        ${report.growthProjection.teamProjection.seasons.map(s => `
                            <span class="season-label">${s}</span>
                        `).join('')}
                    </div>
                    <div class="chart-bars">
                        ${report.growthProjection.teamProjection.ratings.map(r => `
                            <div class="projection-bar" style="height: ${r}%">
                                <span class="bar-value">${r}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="report-section">
                <h2>行动建议</h2>
                <div class="action-items">
                    <div class="action-category">
                        <h4>立即行动</h4>
                        ${report.recommendations.immediate.map(item => `
                            <div class="action-item high-priority">
                                <span class="action-type">${item.type}</span>
                                <span class="action-text">${item.action}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AICoachingReport };
}
