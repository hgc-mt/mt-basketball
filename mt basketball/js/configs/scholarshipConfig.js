/**
 * 奖学金分配系统 - 全新设计版 v2.0
 *
 * 核心设计理念：
 * - 总奖学金份额：5份（全额等效）
 * - 阵容规模：5-8人
 * - 游戏难点：如何在有限奖学金下组建有竞争力的阵容
 * - 策略深度：奖学金分配成为游戏核心玩法之一
 */

const ScholarshipConfig = {
    // 学校奖学金名额配置 - 5份总额
    school: {
        // 总奖学金份额（全额等效）
        maxScholarships: 5,
        // 阵容人数限制
        rosterMinSize: 13,             // 最少13人
        rosterMaxSize: 18,             // 最多18人（包含无奖学金球员）
        rosterOptimalSize: 15,         // 最佳15人
        // 核心轮换人数
        coreRotationSize: 8,           // 8人核心轮换
        // 奖学金类型
        scholarshipTypes: ['full', 'major', 'partial', 'minimal', 'none']
    },
    
    // 奖学金等级定义 - 重新设计
    levels: {
        // A级：全额奖学金（100%）- 球队核心
        full: {
            name: '全额奖学金',
            nameEn: 'Full Scholarship',
            percentage: 1.0,
            value: 1.0,  // 占用的奖学金份额
            description: '球队核心，免除全部费用',
            color: '#ef4444',
            icon: '👑',
            maxPerTeam: 2,  // 每队最多2人
            requirements: {
                minRating: 78,
                minPotential: 80,
                description: ' rating≥78 或 potential≥80'
            },
            priority: 1
        },
        // B级：主要奖学金（60%）- 主力球员
        major: {
            name: '主要奖学金',
            nameEn: 'Major Scholarship',
            percentage: 0.6,
            value: 0.6,
            description: '主力轮换，免除60%费用',
            color: '#f97316',
            icon: '💎',
            maxPerTeam: 3,
            requirements: {
                minRating: 70,
                minPotential: 72,
                description: ' rating≥70 或 potential≥72'
            },
            priority: 2
        },
        // C级：部分奖学金（35%）- 重要替补
        partial: {
            name: '部分奖学金',
            nameEn: 'Partial Scholarship',
            percentage: 0.35,
            value: 0.35,
            description: '重要替补，免除35%费用',
            color: '#f59e0b',
            icon: '⭐',
            maxPerTeam: 4,
            requirements: {
                minRating: 62,
                minPotential: 65,
                description: ' rating≥62 或 potential≥65'
            },
            priority: 3
        },
        // D级：基础奖学金（15%）- 边缘轮换
        minimal: {
            name: '基础奖学金',
            nameEn: 'Minimal Scholarship',
            percentage: 0.15,
            value: 0.15,
            description: '边缘球员，象征性支持',
            color: '#3b82f6',
            icon: '📋',
            maxPerTeam: 6,
            requirements: {
                minRating: 55,
                minPotential: 58,
                description: ' rating≥55 或 potential≥58'
            },
            priority: 4
        },
        // E级：无奖学金 - 底薪/新秀
        none: {
            name: '无奖学金',
            nameEn: 'Walk-on',
            percentage: 0,
            value: 0,
            description: '自费球员或新秀',
            color: '#6b7280',
            icon: '🌱',
            maxPerTeam: 10,  // 无限制（受阵容总人数限制）
            requirements: {
                minRating: 0,
                minPotential: 0,
                description: '任何球员都可以无奖学金加入'
            },
            priority: 5
        }
    },
    
    // 推荐的分配方案 - 基于5份奖学金总额
    distributionPlans: {
        // 方案1：双核驱动（推荐）
        // 2全额 + 3主要 + 2部分 + 2基础 + 6无奖学金 = 15人
        // 奖学金使用：2*1.0 + 3*0.6 + 2*0.35 + 2*0.15 = 4.6份
        dualCore: {
            name: '双核驱动（推荐）',
            description: '两个明星球员领衔，阵容均衡',
            roster: 15,
            allocation: [
                { level: 'full', count: 2, description: '2名核心球员' },
                { level: 'major', count: 3, description: '3名主力球员' },
                { level: 'partial', count: 2, description: '2名重要替补' },
                { level: 'minimal', count: 2, description: '2名边缘轮换' },
                { level: 'none', count: 6, description: '6名无奖学金球员' }
            ],
            totalUsed: 4.6,
            availableForNegotiation: 0.4,
            pros: ['有2个明星球员', '主力阵容强大', '有一定深度'],
            cons: ['无奖学金球员较多', '伤病风险较高']
        },
        
        // 方案2：单核+深度
        // 1全额 + 4主要 + 3部分 + 3基础 + 4无奖学金 = 15人
        // 奖学金使用：1*1.0 + 4*0.6 + 3*0.35 + 3*0.15 = 4.9份
        singleCore: {
            name: '单核+深度',
            description: '一个超级明星，阵容深度更好',
            roster: 15,
            allocation: [
                { level: 'full', count: 1, description: '1名超级核心' },
                { level: 'major', count: 4, description: '4名主力球员' },
                { level: 'partial', count: 3, description: '3名重要替补' },
                { level: 'minimal', count: 3, description: '3名边缘轮换' },
                { level: 'none', count: 4, description: '4名无奖学金球员' }
            ],
            totalUsed: 4.9,
            availableForNegotiation: 0.1,
            pros: ['阵容深度好', '伤病影响小', '轮换灵活'],
            cons: ['只有一个明星', '缺乏顶级天赋']
        },
        
        // 方案3：均衡配置
        // 1全额 + 3主要 + 4部分 + 3基础 + 4无奖学金 = 15人
        // 奖学金使用：1*1.0 + 3*0.6 + 4*0.35 + 3*0.15 = 4.65份
        balanced: {
            name: '均衡配置',
            description: '没有明显短板，依靠团队',
            roster: 15,
            allocation: [
                { level: 'full', count: 1, description: '1名核心球员' },
                { level: 'major', count: 3, description: '3名主力球员' },
                { level: 'partial', count: 4, description: '4名重要替补' },
                { level: 'minimal', count: 3, description: '3名边缘轮换' },
                { level: 'none', count: 4, description: '4名无奖学金球员' }
            ],
            totalUsed: 4.65,
            availableForNegotiation: 0.35,
            pros: ['配置均衡', '调整空间大', '适合长期发展'],
            cons: ['缺乏顶级天赋', '依赖战术执行']
        },
        
        // 方案4：平民阵容（挑战模式）
        // 0全额 + 5主要 + 4部分 + 4基础 + 5无奖学金 = 18人
        // 奖学金使用：0 + 5*0.6 + 4*0.35 + 4*0.15 = 4.6份
        underdog: {
            name: '平民阵容（挑战）',
            description: '没有明星，依靠团队和努力',
            roster: 18,
            allocation: [
                { level: 'full', count: 0, description: '无核心球员' },
                { level: 'major', count: 5, description: '5名主力球员' },
                { level: 'partial', count: 4, description: '4名重要替补' },
                { level: 'minimal', count: 4, description: '4名边缘轮换' },
                { level: 'none', count: 5, description: '5名无奖学金球员' }
            ],
            totalUsed: 4.6,
            availableForNegotiation: 0.4,
            pros: ['人数众多', '无奖学金球员多', '竞争氛围好'],
            cons: ['缺乏明星', '上限较低', '招募困难']
        },
        
        // 方案5：巨星策略（高风险高回报）
        // 2全额 + 2主要 + 1部分 + 1基础 + 7无奖学金 = 13人
        // 奖学金使用：2*1.0 + 2*0.6 + 1*0.35 + 1*0.15 = 3.7份
        superstar: {
            name: '巨星策略（高风险）',
            description: '押注明星球员，其他随缘',
            roster: 13,
            allocation: [
                { level: 'full', count: 2, description: '2名超级明星' },
                { level: 'major', count: 2, description: '2名主力球员' },
                { level: 'partial', count: 1, description: '1名重要替补' },
                { level: 'minimal', count: 1, description: '1名边缘轮换' },
                { level: 'none', count: 7, description: '7名无奖学金球员' }
            ],
            totalUsed: 3.7,
            availableForNegotiation: 1.3,
            pros: ['明星球员多', '调整空间大', '上限极高'],
            cons: ['阵容薄弱', '伤病致命', '依赖明星发挥']
        },

        // 方案6：最低配置（13人及格线）
        // 1全额 + 3主要 + 2部分 + 2基础 + 5无奖学金 = 13人
        // 奖学金使用：1*1.0 + 3*0.6 + 2*0.35 + 2*0.15 = 3.9份
        minimum: {
            name: '最低配置（13人）',
            description: '刚好满足最低人数要求',
            roster: 13,
            allocation: [
                { level: 'full', count: 1, description: '1名核心球员' },
                { level: 'major', count: 3, description: '3名主力球员' },
                { level: 'partial', count: 2, description: '2名重要替补' },
                { level: 'minimal', count: 2, description: '2名边缘轮换' },
                { level: 'none', count: 5, description: '5名无奖学金球员' }
            ],
            totalUsed: 3.9,
            availableForNegotiation: 1.1,
            pros: ['调整空间极大', '可以灵活应对'],
            cons: ['人数紧张', '容错率低', '伤病风险高']
        }
    },
    
    // 无奖学金球员发展系统
    walkOnSystem: {
        // 无奖学金球员晋升通道
        promotionPath: {
            // 评估周期（月）
            evaluationPeriod: 3,
            
            // 晋升条件
            requirements: {
                // 表现评级要求
                performanceRating: 6.5,  // 场均表现评分≥6.5
                // 出场时间要求
                minMinutesPerGame: 10,   // 场均至少10分钟
                // 比赛场次要求
                minGamesPlayed: 10,      // 至少出战10场
                // 态度要求
                attitudeRequirement: 'good',  // 态度良好
                // GPA要求
                minGPA: 2.5              // 绩点≥2.5
            },
            
            // 晋升奖励
            rewards: {
                // 首次晋升：无奖学金 → 基础奖学金
                firstPromotion: {
                    from: 'none',
                    to: 'minimal',
                    scholarshipValue: 0.15,
                    description: '获得基础奖学金（15%）'
                },
                // 二次晋升：基础 → 部分
                secondPromotion: {
                    from: 'minimal',
                    to: 'partial',
                    scholarshipValue: 0.35,
                    description: '提升至部分奖学金（35%）'
                },
                // 三次晋升：部分 → 主要
                thirdPromotion: {
                    from: 'partial',
                    to: 'major',
                    scholarshipValue: 0.6,
                    description: '提升至主要奖学金（60%）'
                }
            }
        },
        
        // 无奖学金球员特殊类型
        types: {
            // 潜力新秀 - 为了发展机会加入
            prospect: {
                name: '潜力新秀',
                description: '看好球队发展，愿意自费加入',
                motivation: 'development',
                loyaltyBonus: 1.2,  // 忠诚度加成
                growthBonus: 1.1    // 成长速度加成
            },
            // 本地球员 - 离家近
            local: {
                name: '本地球员',
                description: '本地学生，家庭可以负担费用',
                motivation: 'location',
                loyaltyBonus: 1.3,
                fanAppealBonus: 1.2  // 球迷吸引力加成
            },
            // 学术奖学金 - 有学术资助
            academic: {
                name: '学术资助生',
                description: '获得学术奖学金，不需要体育奖学金',
                motivation: 'academic',
                gpaBonus: 0.3,  // GPA加成
                eligibilityBonus: 1.1  // 资格稳定性加成
            },
            // 转学生 - 从其他学校转来
            transfer: {
                name: '转学生',
                description: '从其他学校转学，暂时无奖学金',
                motivation: 'fresh_start',
                experienceBonus: 1.1  // 经验加成
            }
        }
    },
    
    // 奖学金动态调整机制
    adjustmentSystem: {
        // 调整周期
        adjustmentPeriod: 'semester',  // 每学期评估
        
        // 上调条件（表现优秀）
        upgradeCriteria: {
            // 场上表现
            performance: {
                minRating: 7.0,           // 场均评分≥7.0
                minMinutes: 15,           // 场均15分钟以上
                gamesPlayed: 15,          // 出战15场以上
                improvement: 3            // 能力值提升3点以上
            },
            // 场下表现
            offCourt: {
                minGPA: 3.0,              // GPA≥3.0
                attendance: 0.95,         // 出勤率95%
                behavior: 'excellent'     // 行为优秀
            },
            // 上调幅度
            upgradeLevels: {
                minimal: 'partial',       // 基础→部分
                partial: 'major',         // 部分→主要
                major: 'full'             // 主要→全额
            }
        },
        
        // 下调条件（表现不佳）
        downgradeCriteria: {
            // 表现下滑
            performance: {
                ratingDrop: 2,            // 评分下降2分以上
                minutesDrop: 30,          // 出场时间减少30%
                injuryProne: true         // 频繁受伤
            },
            // 纪律问题
            disciplinary: {
                violations: 2,            // 2次以上违规
                academicProbation: true,  // 学术警告
                suspension: true          // 被禁赛
            },
            // 下调幅度
            downgradeLevels: {
                full: 'major',
                major: 'partial',
                partial: 'minimal',
                minimal: 'none'
            }
        },
        
        // 特殊情况处理
        specialCases: {
            // 伤病保护期
            injuryProtection: {
                duration: 6,  // 6个月保护期
                description: '受伤期间不降低奖学金'
            },
            // 毕业年级保护
            seniorProtection: {
                applies: true,
                description: '大四学生不降低奖学金'
            },
            // 明星球员保护
            starProtection: {
                minRating: 80,
                description: '核心球员不降低奖学金'
            }
        }
    },
    
    // 奖学金相关的转会机制
    transferSystem: {
        // 触发转会的奖学金条件
        transferTriggers: {
            // 期望落空
            unmetExpectations: {
                promisedLevel: null,      // 承诺的奖学金等级
                actualLevel: null,        // 实际获得的等级
                timeWaited: 12,           // 等待时间（月）
                description: '承诺的奖学金未兑现'
            },
            // 被削减奖学金
            scholarshipCut: {
                originalLevel: null,
                newLevel: null,
                description: '奖学金被削减'
            },
            // 长期无奖学金
            noScholarship: {
                duration: 24,             // 24个月无奖学金
                performance: 'good',      // 但表现良好
                description: '长期无奖学金但表现好'
            }
        },
        
        // 转会概率加成
        transferProbability: {
            scholarshipCut: 0.8,          // 削减奖学金 +80%转会概率
            unmetPromise: 0.6,            // 承诺未兑现 +60%
            longWait: 0.4,                // 长期等待 +40%
            noPromotion: 0.3              // 未晋升 +30%
        },
        
        // 转会谈判影响
        negotiationImpact: {
            // 提供更高奖学金的球队优势
            higherOffer: {
                advantage: 0.25,          // +25%成功率
                description: '提供更高奖学金'
            },
            // 相同奖学金但更好球队
            betterTeam: {
                advantage: 0.15,
                description: '球队实力更强'
            },
            // 当前球队挽留
            retention: {
                canMatch: true,           // 可以匹配报价
                loyaltyBonus: 0.1,        // 忠诚度加成
                description: '可以匹配其他球队报价'
            }
        }
    },
    
    // AI球队奖学金策略
    aiStrategies: {
        // 顶级球队策略
        elite: {
            name: '精英策略',
            description: '优先招募明星球员',
            preferences: {
                full: 2,      // 尽量招满2个全额
                major: 3,
                partial: 2,
                minimal: 2,
                none: 4
            },
            aggressiveness: 1.2  // 更激进
        },
        // 中等球队策略
        average: {
            name: '平衡策略',
            description: '均衡分配奖学金',
            preferences: {
                full: 1,
                major: 3,
                partial: 3,
                minimal: 3,
                none: 5
            },
            aggressiveness: 1.0
        },
        // 较弱球队策略
        weak: {
            name: '发展策略',
            description: '多用无奖学金球员，培养潜力',
            preferences: {
                full: 0,
                major: 2,
                partial: 3,
                minimal: 4,
                none: 6
            },
            aggressiveness: 0.8
        }
    },
    
    /**
     * 根据球员能力推荐奖学金等级
     * @param {Object} player - 球员对象
     * @returns {string} 推荐的奖学金等级
     */
    getRecommendedScholarship(player) {
        const potential = player.potential || 60;
        const rating = player.rating || player.getOverallRating?.() || 60;
        const maxVal = Math.max(potential, rating);
        
        // 核心球员 - 全额
        if (maxVal >= 80) {
            return 'full';
        }
        
        // 主力球员 - 主要奖学金
        if (maxVal >= 72) {
            return 'major';
        }
        
        // 合格轮换 - 部分奖学金
        if (maxVal >= 65) {
            return 'partial';
        }
        
        // 边缘球员 - 基础奖学金
        if (maxVal >= 58) {
            return 'minimal';
        }
        
        // 发展型球员 - 无奖学金
        return 'none';
    },
    
    /**
     * 计算球员期望的奖学金范围
     * @param {Object} player - 球员对象
     * @param {Object} team - 球队对象（影响期望）
     * @returns {Object} 期望奖学金范围
     */
    getPlayerScholarshipExpectation(player, team = null) {
        const recommended = this.getRecommendedScholarship(player);
        const level = this.levels[recommended];
        
        // 球队声望影响
        let reputationModifier = 1.0;
        if (team) {
            const teamRating = team.getTeamRating?.() || 70;
            reputationModifier = teamRating >= 80 ? 0.9 : 
                                teamRating >= 70 ? 0.95 : 
                                teamRating >= 60 ? 1.0 : 1.1;
        }
        
        // 球员性格影响期望
        const personality = player.personality || 'balanced';
        const personalityModifiers = {
            'ambitious': 1.1,      // 雄心勃勃 - 期望更高
            'team_first': 0.9,     // 团队优先 - 可以接受更低
            'money_focused': 1.15, // 看重金钱 - 期望更高
            'development': 0.85,   // 看重发展 - 可以接受更低
            'balanced': 1.0
        };
        const personalityMod = personalityModifiers[personality] || 1.0;
        
        // 计算调整后的期望
        const adjustedExpectation = level.percentage * reputationModifier * personalityMod;
        
        // 确定最低可接受等级
        const levels = ['full', 'major', 'partial', 'minimal', 'none'];
        const currentIndex = levels.indexOf(recommended);
        
        // 雄心勃勃的球员不会接受低于推荐等级2级以下的奖学金
        const minAcceptableIndex = personality === 'ambitious' || personality === 'money_focused' 
            ? Math.min(currentIndex + 1, levels.length - 1)
            : Math.min(currentIndex + 2, levels.length - 1);
        
        const minLevel = levels[minAcceptableIndex];
        
        return {
            preferred: {
                level: recommended,
                percentage: level.percentage,
                name: level.name,
                icon: level.icon
            },
            acceptable: {
                level: minLevel,
                percentage: this.levels[minLevel].percentage,
                name: this.levels[minLevel].name,
                icon: this.levels[minLevel].icon
            },
            // 谈判空间
            negotiationRange: level.percentage - this.levels[minLevel].percentage,
            // 影响因素
            factors: {
                reputation: reputationModifier,
                personality: personalityMod,
                teamName: team?.name || '未知球队'
            }
        };
    },
    
    /**
     * 检查是否可以提供某等级的奖学金
     * @param {Object} team - 球队对象
     * @param {string} level - 奖学金等级
     * @returns {Object} 检查结果
     */
    canOfferScholarship(team, level) {
        const currentUsed = team.calculateUsedScholarshipShare?.() || 0;
        const levelValue = this.levels[level]?.value || 0;
        const maxScholarships = this.school.maxScholarships;
        
        // 检查该等级的名额限制
        const currentCountAtLevel = team.roster?.filter(p => p.scholarshipLevel === level).length || 0;
        const maxAtLevel = this.levels[level]?.maxPerTeam || 999;
        
        const canAfford = (currentUsed + levelValue) <= maxScholarships;
        const hasSlot = currentCountAtLevel < maxAtLevel;
        
        return {
            canOffer: canAfford && hasSlot,
            canAfford,
            hasSlot,
            currentUsed,
            wouldUse: currentUsed + levelValue,
            remaining: maxScholarships - currentUsed,
            currentCountAtLevel,
            maxAtLevel,
            messages: []
                .concat(!canAfford ? [`奖学金不足：需要${levelValue}份，剩余${(maxScholarships - currentUsed).toFixed(2)}份`] : [])
                .concat(!hasSlot ? [`${this.levels[level].name}名额已满：${currentCountAtLevel}/${maxAtLevel}`] : [])
        };
    },
    
    /**
     * 获取分配方案详情
     * @param {string} planName - 方案名称
     * @returns {Object} 分配方案详情
     */
    getDistributionPlan(planName = 'dualCore') {
        const plan = this.distributionPlans[planName];
        if (!plan) return null;
        
        return {
            ...plan,
            id: planName
        };
    },
    
    /**
     * 获取所有分配方案
     * @returns {Array} 所有分配方案
     */
    getAllPlans() {
        return Object.entries(this.distributionPlans).map(([key, plan]) => ({
            id: key,
            ...plan
        }));
    },
    
    /**
     * 验证奖学金分配是否合法
     * @param {Array} roster - 阵容列表（包含scholarshipLevel属性）
     * @returns {Object} 验证结果
     */
    validateDistribution(roster) {
        const totalUsed = roster.reduce((sum, player) => {
            const level = player.scholarshipLevel || 'none';
            return sum + (this.levels[level]?.value || 0);
        }, 0);
        
        // 统计各等级人数
        const levelCounts = {};
        roster.forEach(player => {
            const level = player.scholarshipLevel || 'none';
            levelCounts[level] = (levelCounts[level] || 0) + 1;
        });
        
        // 检查各等级是否超额
        const levelViolations = [];
        Object.entries(levelCounts).forEach(([level, count]) => {
            const maxAllowed = this.levels[level]?.maxPerTeam || 999;
            if (count > maxAllowed) {
                levelViolations.push(`${this.levels[level].name}: ${count}/${maxAllowed}（超额）`);
            }
        });
        
        const rosterSize = roster.length;
        const isValid = totalUsed <= this.school.maxScholarships &&
                       rosterSize >= this.school.rosterMinSize &&
                       rosterSize <= this.school.rosterMaxSize &&
                       levelViolations.length === 0;
        
        return {
            isValid,
            totalUsed: totalUsed.toFixed(2),
            maxAllowed: this.school.maxScholarships,
            remaining: (this.school.maxScholarships - totalUsed).toFixed(2),
            rosterSize,
            rosterValid: rosterSize >= this.school.rosterMinSize && 
                        rosterSize <= this.school.rosterMaxSize,
            levelCounts,
            levelViolations,
            messages: []
                .concat(totalUsed > this.school.maxScholarships ? 
                    [`超出奖学金上限：使用了${totalUsed.toFixed(2)}份，上限为${this.school.maxScholarships}份`] : [])
                .concat(rosterSize < this.school.rosterMinSize ? 
                    [`阵容人数不足：当前${rosterSize}人，最少需要${this.school.rosterMinSize}人`] : [])
                .concat(rosterSize > this.school.rosterMaxSize ? 
                    [`阵容人数过多：当前${rosterSize}人，最多允许${this.school.rosterMaxSize}人`] : [])
                .concat(levelViolations)
        };
    },
    
    /**
     * 计算最优奖学金分配建议
     * @param {Array} roster - 当前阵容
     * @param {number} targetSize - 目标阵容人数
     * @returns {Object} 分配建议
     */
    calculateOptimalDistribution(roster, targetSize = 15) {
        // 按能力排序
        const sortedRoster = [...roster].sort((a, b) => {
            const ratingA = a.rating || a.getOverallRating?.() || 60;
            const ratingB = b.rating || b.getOverallRating?.() || 60;
            return ratingB - ratingA;
        });
        
        // 为每个球员推荐奖学金
        const recommendations = sortedRoster.map((player, index) => {
            const recommended = this.getRecommendedScholarship(player);
            const expectation = this.getPlayerScholarshipExpectation(player);
            
            return {
                player,
                rank: index + 1,
                recommendedLevel: recommended,
                expectation,
                currentLevel: player.scholarshipLevel || 'none'
            };
        });
        
        // 计算当前使用情况
        const currentUsage = this.validateDistribution(roster);
        
        return {
            recommendations,
            currentUsage,
            targetSize,
            remainingSlots: targetSize - roster.length,
            suggestions: this.generateSuggestions(recommendations, currentUsage)
        };
    },
    
    /**
     * 生成分配建议
     * @private
     */
    generateSuggestions(recommendations, currentUsage) {
        const suggestions = [];
        
        // 检查是否有明星球员没有全额奖学金
        const starsWithoutFull = recommendations.filter(r => 
            r.recommendedLevel === 'full' && r.currentLevel !== 'full'
        );
        if (starsWithoutFull.length > 0) {
            suggestions.push({
                type: 'warning',
                message: `有${starsWithoutFull.length}名核心球员未获得全额奖学金，可能影响球队稳定性`,
                players: starsWithoutFull.map(r => r.player.name)
            });
        }
        
        // 检查奖学金使用效率
        if (currentUsage.remaining > 1.0) {
            suggestions.push({
                type: 'info',
                message: `还有${currentUsage.remaining}份奖学金未使用，可以考虑提升现有球员奖学金或招募新球员`
            });
        }
        
        // 检查阵容深度
        const scholarshipPlayers = recommendations.filter(r => r.currentLevel !== 'none').length;
        if (scholarshipPlayers < 8) {
            suggestions.push({
                type: 'warning',
                message: `只有${scholarshipPlayers}名有奖学金球员，建议至少保证8人核心轮换有奖学金保障`
            });
        }
        
        return suggestions;
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScholarshipConfig;
}
