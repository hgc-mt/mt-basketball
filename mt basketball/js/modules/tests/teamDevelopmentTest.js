/**
 * 球队发展系统测试套件
 * 测试核心功能接口
 */

class TeamDevelopmentTest {
    constructor() {
        this.results = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const entry = { timestamp, message, type };
        this.results.push(entry);
        console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    }

    assert(condition, message) {
        if (condition) {
            this.log(`✅ ${message}`, 'success');
        } else {
            this.log(`❌ ${message}`, 'error');
        }
        return condition;
    }

    /**
     * 测试设施系统
     */
    testFacilities() {
        this.log('=== 测试设施系统 ===', 'info');

        // 模拟 gameStateManager
        const mockState = {
            teamFacilities: null,
            coaches: { headCoach: null },
            userTeam: { roster: [] },
            seasonStats: {}
        };

        const mockGameStateManager = {
            getState: () => mockState
        };

        // 创建系统实例
        const system = new TeamDevelopmentSystem(mockGameStateManager);

        // 测试1: 设施初始化
        const facilities = system.initializeFacilities();
        const test1 = this.assert(
            facilities && 
            facilities.trainingCenter === 1 &&
            facilities.weightRoom === 1,
            '设施初始化 - 所有设施应从1级开始'
        );

        // 测试2: 获取设施等级信息
        const levelInfo = system.getFacilityLevel('trainingCenter');
        const test2 = this.assert(
            levelInfo.current &&
            levelInfo.current.level === 1 &&
            levelInfo.canUpgrade === true,
            '获取设施等级信息 - 应返回当前等级和升级信息'
        );

        // 测试3: 计算设施加成
        const bonus = system.calculateFacilityBonus();
        const test3 = this.assert(
            typeof bonus === 'number' && bonus >= 0,
            '计算设施加成 - 应返回数值类型的加成值'
        );

        // 测试4: 计算维护费用
        const maintenance = system.calculateMaintenanceCost();
        const test4 = this.assert(
            typeof maintenance === 'number' && maintenance >= 0,
            '计算维护费用 - 应返回数值类型的费用'
        );

        return test1 && test2 && test3 && test4;
    }

    /**
     * 测试球员成长计算
     */
    testPlayerGrowth() {
        this.log('=== 测试球员成长计算 ===', 'info');

        const mockState = {
            teamFacilities: {
                trainingCenter: 2,
                weightRoom: 2,
                shootingLab: 1,
                filmRoom: 1,
                medicalCenter: 1
            },
            coaches: {
                headCoach: {
                    name: '测试教练',
                    tier: 'experienced',
                    developmentBonus: 5,
                    specialty: 'playerDev'
                }
            },
            userTeam: { roster: [] },
            seasonStats: {}
        };

        const mockGameStateManager = {
            getState: () => mockState
        };

        const system = new TeamDevelopmentSystem(mockGameStateManager);

        // 创建测试球员
        const testPlayer = {
            id: 'test_001',
            name: '测试球员',
            year: 2,
            potential: 75,
            attributes: {
                shooting: 60,
                threePoint: 55,
                strength: 50,
                speed: 65,
                basketballIQ: 58
            },
            talent: '投篮天赋'
        };

        const seasonStats = {
            averageMinutes: 28,
            performanceRating: 'good',
            gamesPlayed: 25
        };

        // 测试1: 成长计算
        const growthData = system.calculatePlayerGrowth(testPlayer, seasonStats);
        const test1 = this.assert(
            growthData &&
            growthData.growth &&
            typeof growthData.totalGrowth === 'number' &&
            growthData.totalGrowth > 0,
            '球员成长计算 - 应返回包含成长值的对象'
        );

        // 测试2: 成长因素
        const test2 = this.assert(
            growthData.factors &&
            typeof growthData.factors.baseGrowth === 'number' &&
            typeof growthData.factors.facilityBonus === 'number',
            '成长因素 - 应包含各项影响因素'
        );

        // 测试3: 属性上限计算
        const caps = system.calculateAttributeCaps(testPlayer);
        const test3 = this.assert(
            caps &&
            typeof caps.shooting === 'number' &&
            caps.shooting > testPlayer.attributes.shooting,
            '属性上限计算 - 应返回合理的属性上限'
        );

        // 测试4: 上场时间倍率
        const multiplier1 = system.getPlayingTimeMultiplier(35);
        const multiplier2 = system.getPlayingTimeMultiplier(15);
        const test4 = this.assert(
            multiplier1 > multiplier2,
            '上场时间倍率 - 更多上场时间应获得更高倍率'
        );

        return test1 && test2 && test3 && test4;
    }

    /**
     * 测试赛季结算
     */
    testSeasonEnd() {
        this.log('=== 测试赛季结算 ===', 'info');

        const testPlayer = {
            id: 'test_002',
            name: '成长测试',
            year: 1,
            potential: 80,
            attributes: {
                shooting: 55,
                strength: 50
            }
        };

        const mockState = {
            teamFacilities: {
                trainingCenter: 1,
                weightRoom: 1,
                shootingLab: 1,
                filmRoom: 1,
                medicalCenter: 1
            },
            coaches: { headCoach: null },
            userTeam: { roster: [testPlayer] },
            seasonStats: {
                'test_002': {
                    averageMinutes: 25,
                    performanceRating: 'average'
                }
            }
        };

        const mockGameStateManager = {
            getState: () => mockState
        };

        // 模拟预算管理器
        window.recruitmentBudgetManager = {
            spendBudget: (amount, reason) => {
                this.log(`预算支出: $${amount} - ${reason}`, 'info');
                return true;
            }
        };

        const system = new TeamDevelopmentSystem(mockGameStateManager);

        // 测试赛季结算
        const result = system.processSeasonEndGrowth();
        const test1 = this.assert(
            result &&
            result.success === true &&
            Array.isArray(result.playerGrowths),
            '赛季结算 - 应成功处理所有球员成长'
        );

        // 测试年级增长
        const test2 = this.assert(
            testPlayer.year === 2,
            '年级增长 - 球员年级应增加'
        );

        // 测试属性成长
        const test3 = this.assert(
            testPlayer.attributes.shooting > 55 ||
            testPlayer.attributes.strength > 50,
            '属性成长 - 至少有一项属性应获得成长'
        );

        return test1 && test2 && test3;
    }

    /**
     * 测试升级建议
     */
    testUpgradeSuggestions() {
        this.log('=== 测试升级建议 ===', 'info');

        const mockState = {
            teamFacilities: {
                trainingCenter: 1,
                weightRoom: 1,
                shootingLab: 1,
                filmRoom: 1,
                medicalCenter: 1
            },
            coaches: { headCoach: null },
            userTeam: { roster: [] },
            teamStats: {},
            seasonStats: {}
        };

        const mockGameStateManager = {
            getState: () => mockState
        };

        const system = new TeamDevelopmentSystem(mockGameStateManager);

        // 测试升级建议
        const suggestions = system.getFacilityUpgradeSuggestions();
        const test1 = this.assert(
            Array.isArray(suggestions) &&
            suggestions.length > 0,
            '升级建议 - 应返回建议列表'
        );

        // 测试建议格式
        if (suggestions.length > 0) {
            const first = suggestions[0];
            const test2 = this.assert(
                first.facility &&
                first.name &&
                typeof first.cost === 'number' &&
                typeof first.priority === 'number',
                '建议格式 - 应包含必要的建议信息'
            );
            return test1 && test2;
        }

        return test1;
    }

    /**
     * 测试发展报告
     */
    testDevelopmentReport() {
        this.log('=== 测试发展报告 ===', 'info');

        const mockState = {
            teamFacilities: {
                trainingCenter: 2,
                weightRoom: 2,
                shootingLab: 2,
                filmRoom: 1,
                medicalCenter: 1
            },
            coaches: {
                headCoach: {
                    name: '优秀教练',
                    tier: 'expert',
                    developmentBonus: 10
                }
            },
            userTeam: { roster: [] },
            teamStats: {},
            seasonStats: {}
        };

        const mockGameStateManager = {
            getState: () => mockState
        };

        const system = new TeamDevelopmentSystem(mockGameStateManager);

        // 测试报告生成
        const report = system.getDevelopmentReport();
        const test1 = this.assert(
            report &&
            report.facilities &&
            report.coaching &&
            report.upgradeSuggestions,
            '发展报告 - 应包含设施、教练和升级建议'
        );

        // 测试设施信息
        const test2 = this.assert(
            typeof report.facilities.maintenanceCost === 'number' &&
            typeof report.facilities.totalBonus === 'number',
            '设施信息 - 应包含维护费用和总加成'
        );

        // 测试教练信息
        const test3 = this.assert(
            report.coaching.headCoach &&
            typeof report.coaching.developmentBonus === 'number',
            '教练信息 - 应包含教练和发展加成'
        );

        return test1 && test2 && test3;
    }

    /**
     * 运行所有测试
     */
    runAllTests() {
        this.log('开始运行球队发展系统测试...', 'info');
        this.log('===============================', 'info');

        const tests = [
            { name: '设施系统', fn: () => this.testFacilities() },
            { name: '球员成长计算', fn: () => this.testPlayerGrowth() },
            { name: '赛季结算', fn: () => this.testSeasonEnd() },
            { name: '升级建议', fn: () => this.testUpgradeSuggestions() },
            { name: '发展报告', fn: () => this.testDevelopmentReport() }
        ];

        let passed = 0;
        let failed = 0;

        tests.forEach(test => {
            try {
                const result = test.fn();
                if (result) {
                    passed++;
                } else {
                    failed++;
                }
            } catch (error) {
                this.log(`测试异常: ${error.message}`, 'error');
                failed++;
            }
            this.log('-------------------------------', 'info');
        });

        this.log('===============================', 'info');
        this.log(`测试完成: ${passed} 通过, ${failed} 失败`, 'info');

        return {
            passed,
            failed,
            total: tests.length,
            results: this.results
        };
    }
}

// 导出测试类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeamDevelopmentTest;
}
