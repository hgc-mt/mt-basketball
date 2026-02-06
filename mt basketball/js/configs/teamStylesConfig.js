/**
 * 球队风格配置系统
 * 为每个球队定义独特的风格、性格和阵容策略
 */

const TeamStylesConfig = {
    // 球队风格类型定义
    styles: {
        // 1. 豪门霸主型 - 像杜克、肯塔基这样的顶级名校
        ELITE_DYNASTY: {
            id: 'elite_dynasty',
            name: '豪门霸主',
            description: '篮球名校，资源丰富，吸引顶级天才',
            icon: '👑',
            characteristics: {
                reputation: 95,           // 声望极高
                facilities: 95,           // 设施顶级
                academicPrestige: 90,     // 学术声望高
                fanSupport: 95,           // 球迷支持度
                pressureLevel: 90         // 压力水平高
            },
            // 阵容偏好
            rosterPreference: {
                starPlayers: 2,           // 需要2个明星
                qualityDepth: true,       // 注重阵容深度
                recruitAggressiveness: 0.9, // 招募激进程度
                scholarshipStrategy: 'dualCore', // 双核驱动
                targetRosterSize: 15
            },
            // 球员能力偏好
            playerPreferences: {
                prioritizePotential: true,  // 优先潜力
                prioritizeRating: true,     // 也看即战力
                minAcceptableRating: 70,    // 最低接受能力
                preferredPositions: ['PG', 'SF', 'C'], // 优先位置
                preferredAttributes: ['scoring', 'shooting', 'basketballIQ']
            },
            // 奖学金分配策略
            scholarshipDistribution: {
                full: 2,      // 2个全额
                major: 3,     // 3个主要
                partial: 2,   // 2个部分
                minimal: 2,   // 2个基础
                none: 4       // 4个无奖学金
            },
            // 教练风格匹配
            preferredCoachingStyles: ['star_developer', 'offensive_guru'],
            // 战术偏好
            preferredTactics: ['isolation', 'pick_and_roll', 'motion_offense'],
            // 颜色主题
            colorTheme: {
                primary: '#1a1a2e',
                accent: '#e94560',
                success: '#4ade80'
            }
        },

        // 2. 学术强校型 - 斯坦福、杜克（学术版）
        ACADEMIC_POWERHOUSE: {
            id: 'academic_powerhouse',
            name: '学术强校',
            description: '学术与体育并重，招募品学兼优的球员',
            icon: '🎓',
            characteristics: {
                reputation: 80,
                facilities: 85,
                academicPrestige: 98,
                fanSupport: 75,
                pressureLevel: 60
            },
            rosterPreference: {
                starPlayers: 1,
                qualityDepth: true,
                recruitAggressiveness: 0.6,
                scholarshipStrategy: 'balanced',
                targetRosterSize: 15
            },
            playerPreferences: {
                prioritizePotential: true,
                prioritizeRating: false,
                minAcceptableRating: 65,
                preferredPositions: ['PG', 'PF'],
                preferredAttributes: ['basketballIQ', 'passing', 'defense']
            },
            scholarshipDistribution: {
                full: 1,
                major: 3,
                partial: 4,
                minimal: 3,
                none: 4
            },
            preferredCoachingStyles: ['balanced_team', 'defensive_minded'],
            preferredTactics: ['triangle_offense', 'motion_offense', 'zone_defense'],
            colorTheme: {
                primary: '#1e3a5f',
                accent: '#c9a227',
                success: '#2d5016'
            }
        },

        // 3. 防守铁血型 - 弗吉尼亚风格的球队
        DEFENSIVE_JUGGERNAUT: {
            id: 'defensive_juggernaut',
            name: '防守铁军',
            description: '以防守立足，纪律严明，团队协作',
            icon: '🛡️',
            characteristics: {
                reputation: 75,
                facilities: 75,
                academicPrestige: 75,
                fanSupport: 70,
                pressureLevel: 65
            },
            rosterPreference: {
                starPlayers: 1,
                qualityDepth: true,
                recruitAggressiveness: 0.7,
                scholarshipStrategy: 'singleCore',
                targetRosterSize: 16
            },
            playerPreferences: {
                prioritizePotential: false,
                prioritizeRating: true,
                minAcceptableRating: 62,
                preferredPositions: ['C', 'PF', 'SG'],
                preferredAttributes: ['defense', 'stealing', 'blocking', 'strength', 'stamina']
            },
            scholarshipDistribution: {
                full: 1,
                major: 4,
                partial: 3,
                minimal: 3,
                none: 5
            },
            preferredCoachingStyles: ['defensive_minded', 'balanced_team'],
            preferredTactics: ['zone_defense', 'man_to_man', 'full_court_press'],
            colorTheme: {
                primary: '#2c3e50',
                accent: '#e74c3c',
                success: '#27ae60'
            }
        },

        // 4. 进攻华丽型 - 跑轰风格的球队
        OFFENSIVE_SHOWTIME: {
            id: 'offensive_showtime',
            name: '进攻华丽',
            description: '追求快节奏、高得分，观赏性强的打法',
            icon: '🔥',
            characteristics: {
                reputation: 78,
                facilities: 80,
                academicPrestige: 70,
                fanSupport: 85,
                pressureLevel: 70
            },
            rosterPreference: {
                starPlayers: 2,
                qualityDepth: false,
                recruitAggressiveness: 0.8,
                scholarshipStrategy: 'superstar',
                targetRosterSize: 14
            },
            playerPreferences: {
                prioritizePotential: true,
                prioritizeRating: true,
                minAcceptableRating: 68,
                preferredPositions: ['PG', 'SG', 'SF'],
                preferredAttributes: ['scoring', 'shooting', 'threePoint', 'speed', 'dribbling']
            },
            scholarshipDistribution: {
                full: 2,
                major: 2,
                partial: 2,
                minimal: 2,
                none: 6
            },
            preferredCoachingStyles: ['offensive_guru', 'star_developer'],
            preferredTactics: ['spread_offense', 'transition', 'pick_and_roll'],
            colorTheme: {
                primary: '#8b0000',
                accent: '#ffd700',
                success: '#ff4500'
            }
        },

        // 5. 平民奋斗型 - 资源有限但团结拼搏
        UNDERDOG_GRIT: {
            id: 'underdog_grit',
            name: '平民奋斗',
            description: '资源有限，依靠团队和努力弥补天赋差距',
            icon: '💪',
            characteristics: {
                reputation: 55,
                facilities: 60,
                academicPrestige: 65,
                fanSupport: 80,
                pressureLevel: 40
            },
            rosterPreference: {
                starPlayers: 0,
                qualityDepth: true,
                recruitAggressiveness: 0.5,
                scholarshipStrategy: 'underdog',
                targetRosterSize: 18
            },
            playerPreferences: {
                prioritizePotential: true,
                prioritizeRating: false,
                minAcceptableRating: 55,
                preferredPositions: ['PF', 'C', 'SG'],
                preferredAttributes: ['stamina', 'strength', 'defense', 'rebounding']
            },
            scholarshipDistribution: {
                full: 0,
                major: 2,
                partial: 4,
                minimal: 4,
                none: 6
            },
            preferredCoachingStyles: ['balanced_team', 'defensive_minded'],
            preferredTactics: ['motion_offense', 'zone_defense', 'slow_tempo'],
            colorTheme: {
                primary: '#4a4a4a',
                accent: '#ff6b35',
                success: '#4ecdc4'
            }
        },

        // 6. 均衡发展型 - 没有明显短板
        BALANCED_PROGRAM: {
            id: 'balanced_program',
            name: '均衡发展',
            description: '各方面都很均衡，没有明显短板',
            icon: '⚖️',
            characteristics: {
                reputation: 70,
                facilities: 75,
                academicPrestige: 75,
                fanSupport: 75,
                pressureLevel: 60
            },
            rosterPreference: {
                starPlayers: 1,
                qualityDepth: true,
                recruitAggressiveness: 0.65,
                scholarshipStrategy: 'balanced',
                targetRosterSize: 15
            },
            playerPreferences: {
                prioritizePotential: true,
                prioritizeRating: false,
                minAcceptableRating: 62,
                preferredPositions: ['PG', 'SF', 'C'],
                preferredAttributes: ['basketballIQ', 'passing', 'defense', 'scoring']
            },
            scholarshipDistribution: {
                full: 1,
                major: 3,
                partial: 3,
                minimal: 3,
                none: 5
            },
            preferredCoachingStyles: ['balanced_team'],
            preferredTactics: ['motion_offense', 'man_to_man', 'pick_and_roll'],
            colorTheme: {
                primary: '#34495e',
                accent: '#3498db',
                success: '#2ecc71'
            }
        },

        // 7. 潜力开发型 - 专注于培养年轻球员
        DEVELOPMENT_FOCUSED: {
            id: 'development_focused',
            name: '潜力开发',
            description: '专注于培养年轻球员，着眼长远发展',
            icon: '🌱',
            characteristics: {
                reputation: 65,
                facilities: 70,
                academicPrestige: 70,
                fanSupport: 65,
                pressureLevel: 45
            },
            rosterPreference: {
                starPlayers: 1,
                qualityDepth: true,
                recruitAggressiveness: 0.6,
                scholarshipStrategy: 'singleCore',
                targetRosterSize: 16
            },
            playerPreferences: {
                prioritizePotential: true,
                prioritizeRating: false,
                minAcceptableRating: 58,
                preferredPositions: ['PG', 'SG'],
                preferredAttributes: ['potential', 'speed', 'dribbling', 'shooting']
            },
            scholarshipDistribution: {
                full: 1,
                major: 2,
                partial: 4,
                minimal: 4,
                none: 5
            },
            preferredCoachingStyles: ['star_developer', 'balanced_team'],
            preferredTactics: ['motion_offense', 'spread_offense'],
            colorTheme: {
                primary: '#2d5016',
                accent: '#7cb342',
                success: '#8bc34a'
            }
        },

        // 8. 地方骄傲型 - 依靠本地球员
        HOMETOWN_PRIDE: {
            id: 'hometown_pride',
            name: '地方骄傲',
            description: '依靠本地球员，社区支持度高',
            icon: '🏠',
            characteristics: {
                reputation: 60,
                facilities: 65,
                academicPrestige: 65,
                fanSupport: 90,
                pressureLevel: 50
            },
            rosterPreference: {
                starPlayers: 1,
                qualityDepth: true,
                recruitAggressiveness: 0.55,
                scholarshipStrategy: 'balanced',
                targetRosterSize: 16
            },
            playerPreferences: {
                prioritizePotential: false,
                prioritizeRating: true,
                minAcceptableRating: 58,
                preferredPositions: ['SF', 'PF', 'C'],
                preferredAttributes: ['strength', 'defense', 'rebounding', 'loyalty']
            },
            scholarshipDistribution: {
                full: 1,
                major: 3,
                partial: 3,
                minimal: 4,
                none: 5
            },
            preferredCoachingStyles: ['balanced_team', 'defensive_minded'],
            preferredTactics: ['motion_offense', 'zone_defense'],
            colorTheme: {
                primary: '#5d4037',
                accent: '#8d6e63',
                success: '#a1887f'
            }
        }
    },

    // 为特定球队分配风格（示例）
    teamStyleAssignments: {
        // 顶级豪门
        'Duke': 'ELITE_DYNASTY',
        'Kentucky': 'ELITE_DYNASTY',
        'North Carolina': 'ELITE_DYNASTY',
        'Kansas': 'ELITE_DYNASTY',
        
        // 学术强校
        'Stanford': 'ACADEMIC_POWERHOUSE',
        'Vanderbilt': 'ACADEMIC_POWERHOUSE',
        'Notre Dame': 'ACADEMIC_POWERHOUSE',
        
        // 防守铁军
        'Virginia': 'DEFENSIVE_JUGGERNAUT',
        'Wisconsin': 'DEFENSIVE_JUGGERNAUT',
        'San Diego State': 'DEFENSIVE_JUGGERNAUT',
        
        // 进攻华丽
        'Gonzaga': 'OFFENSIVE_SHOWTIME',
        'Arizona': 'OFFENSIVE_SHOWTIME',
        'Memphis': 'OFFENSIVE_SHOWTIME',
        
        // 其他球队将随机分配或根据配置分配
    },

    /**
     * 获取球队风格配置
     * @param {string} styleId - 风格ID
     * @returns {Object} 风格配置
     */
    getStyle(styleId) {
        return this.styles[styleId] || this.styles.BALANCED_PROGRAM;
    },

    /**
     * 为球队分配风格
     * @param {string} teamName - 球队名称
     * @returns {string} 风格ID
     */
    assignStyleForTeam(teamName) {
        // 检查是否有预分配
        if (this.teamStyleAssignments[teamName]) {
            return this.teamStyleAssignments[teamName];
        }
        
        // 随机分配（基于球队名称的哈希，确保一致性）
        const styleKeys = Object.keys(this.styles);
        let hash = 0;
        for (let i = 0; i < teamName.length; i++) {
            hash = ((hash << 5) - hash) + teamName.charCodeAt(i);
            hash = hash & hash;
        }
        const index = Math.abs(hash) % styleKeys.length;
        return styleKeys[index];
    },

    /**
     * 根据风格生成阵容配置
     * @param {string} styleId - 风格ID
     * @returns {Object} 阵容配置
     */
    generateRosterConfig(styleId) {
        const style = this.getStyle(styleId);
        return {
            targetSize: style.rosterPreference.targetRosterSize,
            scholarshipDistribution: style.scholarshipDistribution,
            minRating: style.playerPreferences.minAcceptableRating,
            preferredPositions: style.playerPreferences.preferredPositions,
            prioritizePotential: style.playerPreferences.prioritizePotential
        };
    },

    /**
     * 获取所有风格列表
     * @returns {Array} 风格列表
     */
    getAllStyles() {
        return Object.entries(this.styles).map(([key, style]) => ({
            id: key,
            ...style
        }));
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeamStylesConfig;
}
