/**
 * Interface Test Suite
 * 接口测试套件，验证所有接口的正确性
 */

class InterfaceTestSuite {
    constructor(coreInterfaceManager, gameStateManager) {
        this.coreInterfaceManager = coreInterfaceManager;
        this.gameStateManager = gameStateManager;
        this.testResults = [];
        this.testStats = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0
        };
    }

    /**
     * 运行所有测试
     * @returns {Object} 测试结果
     */
    async runAllTests() {
        console.log('========================================');
        console.log('开始运行接口测试套件');
        console.log('========================================\n');

        // 测试核心接口管理器
        await this.testCoreInterfaceManager();

        // 测试奖学金计算接口
        await this.testScholarshipCalculator();

        // 测试赛程管理接口
        await this.testScheduleManager();

        // 测试谈判管理接口
        await this.testNegotiationManager();

        // 测试数据同步接口
        await this.testDataSyncManager();

        // 生成测试报告
        return this.generateTestReport();
    }

    /**
     * 测试核心接口管理器
     */
    async testCoreInterfaceManager() {
        console.log('\n--- 测试核心接口管理器 ---');

        // 测试1: 初始化
        await this.runTest(
            'CoreInterfaceManager',
            'initialize',
            '测试接口管理器初始化',
            async () => {
                const result = await this.coreInterfaceManager.initialize();
                return result.success && result.interfacesCount >= 0;
            }
        );

        // 测试2: 注册接口
        await this.runTest(
            'CoreInterfaceManager',
            'registerInterface',
            '测试接口注册',
            async () => {
                const mockInterface = {
                    getName: () => 'MockInterface',
                    getVersion: () => '1.0.0',
                    validate: () => true
                };
                const result = this.coreInterfaceManager.registerInterface('MockInterface', mockInterface);
                return result.success;
            }
        );

        // 测试3: 获取接口
        await this.runTest(
            'CoreInterfaceManager',
            'getInterface',
            '测试获取接口',
            async () => {
                const interfaceImpl = this.coreInterfaceManager.getInterface('MockInterface');
                return interfaceImpl !== null && typeof interfaceImpl.getName === 'function';
            }
        );

        // 测试4: 事件订阅
        await this.runTest(
            'CoreInterfaceManager',
            'subscribeEvent',
            '测试事件订阅',
            async () => {
                let eventReceived = false;
                const subscriptionId = this.coreInterfaceManager.subscribeEvent('testEvent', (data) => {
                    eventReceived = true;
                });
                
                this.coreInterfaceManager.publishEvent('testEvent', { test: true });
                
                return subscriptionId !== null && eventReceived;
            }
        );

        // 测试5: 获取状态
        await this.runTest(
            'CoreInterfaceManager',
            'getStatus',
            '测试获取状态',
            async () => {
                const status = this.coreInterfaceManager.getStatus();
                return status.isInitialized && status.interfacesCount >= 0;
            }
        );
    }

    /**
     * 测试奖学金计算接口
     */
    async testScholarshipCalculator() {
        console.log('\n--- 测试奖学金计算接口 ---');

        // 创建测试数据
        const mockTeam = {
            id: 1,
            name: 'Test Team',
            scholarships: 13,
            roster: [
                { id: 1, name: 'Player1', scholarship: 1.0 },
                { id: 2, name: 'Player2', scholarship: 0.8 },
                { id: 3, name: 'Player3', scholarship: 0.5 }
            ]
        };

        // 测试1: 计算已使用份额
        await this.runTest(
            'IScholarshipCalculator',
            'calculateUsedShare',
            '测试计算已使用份额',
            async () => {
                const result = await this.coreInterfaceManager.invoke(
                    'IScholarshipCalculator',
                    'calculateUsedShare',
                    mockTeam
                );
                return result.success && result.data.share === 2.3;
            }
        );

        // 测试2: 计算可用份额
        await this.runTest(
            'IScholarshipCalculator',
            'calculateAvailableShare',
            '测试计算可用份额',
            async () => {
                const result = await this.coreInterfaceManager.invoke(
                    'IScholarshipCalculator',
                    'calculateAvailableShare',
                    mockTeam
                );
                return result.success && result.data.share === 10.7;
            }
        );

        // 测试3: 验证奖学金可用性
        const mockPlayer = { id: 4, name: 'Player4', scholarship: 0.7 };
        await this.runTest(
            'IScholarshipCalculator',
            'validateScholarshipAvailability',
            '测试验证奖学金可用性',
            async () => {
                const result = await this.coreInterfaceManager.invoke(
                    'IScholarshipCalculator',
                    'validateScholarshipAvailability',
                    mockPlayer,
                    mockTeam
                );
                return result.success && result.data.canSign === true;
            }
        );

        // 测试4: 验证奖学金不足情况
        const mockPlayer2 = { id: 5, name: 'Player5', scholarship: 1.0 };
        await this.runTest(
            'IScholarshipCalculator',
            'validateScholarshipAvailability',
            '测试验证奖学金不足',
            async () => {
                const result = await this.coreInterfaceManager.invoke(
                    'IScholarshipCalculator',
                    'validateScholarshipAvailability',
                    mockPlayer2,
                    mockTeam
                );
                return result.success && result.data.canSign === false;
            }
        );
    }

    /**
     * 测试赛程管理接口
     */
    async testScheduleManager() {
        console.log('\n--- 测试赛程管理接口 ---');

        // 创建测试数据
        const mockTeams = [
            { id: 1, name: 'Team1' },
            { id: 2, name: 'Team2' },
            { id: 3, name: 'Team3' },
            { id: 4, name: 'Team4' }
        ];
        const startDate = new Date(2024, 9, 1);

        // 测试1: 生成赛程
        await this.runTest(
            'IScheduleManager',
            'generateSchedule',
            '测试生成赛程',
            async () => {
                const result = await this.coreInterfaceManager.invoke(
                    'IScheduleManager',
                    'generateSchedule',
                    mockTeams,
                    startDate
                );
                return result.success && result.data.schedule.length > 0;
            }
        );

        // 测试2: 同步日期
        const mockSchedule = [
            { id: 1, date: new Date(2024, 8, 1), homeTeam: mockTeams[0], awayTeam: mockTeams[1] },
            { id: 2, date: new Date(2024, 8, 8), homeTeam: mockTeams[2], awayTeam: mockTeams[3] }
        ];
        const currentDate = new Date(2024, 9, 1);

        await this.runTest(
            'IScheduleManager',
            'syncDates',
            '测试同步日期',
            async () => {
                const result = await this.coreInterfaceManager.invoke(
                    'IScheduleManager',
                    'syncDates',
                    currentDate,
                    mockSchedule
                );
                return result.success && result.data.updatedCount > 0;
            }
        );

        // 测试3: 获取下一场比赛
        await this.runTest(
            'IScheduleManager',
            'getNextGame',
            '测试获取下一场比赛',
            async () => {
                const result = await this.coreInterfaceManager.invoke(
                    'IScheduleManager',
                    'getNextGame',
                    1,
                    mockSchedule
                );
                return result.success && result.data.game !== null;
            }
        );
    }

    /**
     * 测试谈判管理接口
     */
    async testNegotiationManager() {
        console.log('\n--- 测试谈判管理接口 ---');

        // 设置游戏状态
        const state = this.gameStateManager.getState();
        state.availablePlayers = [
            { id: 1, name: 'Player1', potential: 75, year: 2, signingDifficulty: 0.5 }
        ];
        state.negotiations = {
            playerNegotiations: [],
            coachNegotiations: []
        };

        // 测试1: 开始谈判
        await this.runTest(
            'INegotiationManager',
            'startNegotiation',
            '测试开始谈判',
            async () => {
                const result = await this.coreInterfaceManager.invoke(
                    'INegotiationManager',
                    'startNegotiation',
                    1,
                    'player',
                    { scholarship: 0.8, playingTime: 25 }
                );
                return result.success && result.data.negotiationId !== undefined;
            }
        );

        // 测试2: 更新报价
        const negotiationId = Date.now();
        await this.runTest(
            'INegotiationManager',
            'updateOffer',
            '测试更新报价',
            async () => {
                const result = await this.coreInterfaceManager.invoke(
                    'INegotiationManager',
                    'updateOffer',
                    negotiationId,
                    { scholarship: 0.9, playingTime: 30 }
                );
                return result.success && result.data.acceptanceProbability > 0;
            }
        );

        // 测试3: 完成谈判（接受）
        await this.runTest(
            'INegotiationManager',
            'completeNegotiation',
            '测试完成谈判（接受）',
            async () => {
                const result = await this.coreInterfaceManager.invoke(
                    'INegotiationManager',
                    'completeNegotiation',
                    negotiationId,
                    true
                );
                return result.success && result.data.signedTarget !== undefined;
            }
        );

        // 测试4: 完成谈判（拒绝）
        await this.runTest(
            'INegotiationManager',
            'completeNegotiation',
            '测试完成谈判（拒绝）',
            async () => {
                const result = await this.coreInterfaceManager.invoke(
                    'INegotiationManager',
                    'completeNegotiation',
                    negotiationId + 1,
                    false
                );
                return result.success && result.data.negotiation.status === 'rejected';
            }
        );
    }

    /**
     * 测试数据同步接口
     */
    async testDataSyncManager() {
        console.log('\n--- 测试数据同步接口 ---');

        // 测试1: 发布事件
        await this.runTest(
            'IDataSyncManager',
            'publishEvent',
            '测试发布事件',
            async () => {
                const result = await this.coreInterfaceManager.invoke(
                    'IDataSyncManager',
                    'publishEvent',
                    'testEvent',
                    { data: 'test data' }
                );
                return result.success && result.data.eventId !== undefined;
            }
        );

        // 测试2: 订阅事件
        await this.runTest(
            'IDataSyncManager',
            'subscribeEvent',
            '测试订阅事件',
            async () => {
                let eventReceived = false;
                const result = await this.coreInterfaceManager.invoke(
                    'IDataSyncManager',
                    'subscribeEvent',
                    'testEvent2',
                    (data) => {
                        eventReceived = true;
                    }
                );
                
                // 发布事件触发订阅
                this.coreInterfaceManager.publishEvent('testEvent2', { trigger: true });
                
                return result.success && eventReceived;
            }
        );

        // 测试3: 取消订阅
        await this.runTest(
            'IDataSyncManager',
            'unsubscribeEvent',
            '测试取消订阅',
            async () => {
                const subscribeResult = await this.coreInterfaceManager.invoke(
                    'IDataSyncManager',
                    'subscribeEvent',
                    'testEvent3',
                    () => {}
                );
                
                if (!subscribeResult.success) return false;
                
                const unsubscribeResult = await this.coreInterfaceManager.invoke(
                    'IDataSyncManager',
                    'unsubscribeEvent',
                    subscribeResult.data.subscriptionId
                );
                
                return unsubscribeResult.success;
            }
        );

        // 测试4: 获取事件历史
        await this.runTest(
            'IDataSyncManager',
            'getEventHistory',
            '测试获取事件历史',
            async () => {
                // 先发布一些事件
                this.coreInterfaceManager.publishEvent('historyEvent1', { id: 1 });
                this.coreInterfaceManager.publishEvent('historyEvent2', { id: 2 });
                
                const result = await this.coreInterfaceManager.invoke(
                    'IDataSyncManager',
                    'getEventHistory',
                    { eventType: 'historyEvent1' }
                );
                
                return result.success && result.data.total > 0;
            }
        );
    }

    /**
     * 运行单个测试
     * @param {string} interfaceName - 接口名称
     * @param {string} testName - 测试名称
     * @param {string} description - 测试描述
     * @param {Function} testFn - 测试函数
     */
    async runTest(interfaceName, testName, description, testFn) {
        this.testStats.total++;
        const startTime = Date.now();

        try {
            console.log(`\n[测试] ${interfaceName}.${testName}`);
            console.log(`描述: ${description}`);
            
            const passed = await testFn();
            const duration = Date.now() - startTime;

            const testResult = {
                interfaceName,
                testName,
                description,
                passed,
                duration,
                timestamp: new Date().toISOString()
            };

            this.testResults.push(testResult);

            if (passed) {
                this.testStats.passed++;
                console.log(`✓ 通过 (${duration}ms)`);
            } else {
                this.testStats.failed++;
                console.log(`✗ 失败 (${duration}ms)`);
            }

        } catch (error) {
            this.testStats.failed++;
            const testResult = {
                interfaceName,
                testName,
                description,
                passed: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            this.testResults.push(testResult);
            console.log(`✗ 错误: ${error.message}`);
        }
    }

    /**
     * 生成测试报告
     * @returns {Object} 测试报告
     */
    generateTestReport() {
        console.log('\n========================================');
        console.log('测试报告');
        console.log('========================================\n');

        // 统计各接口的测试结果
        const interfaceStats = {};
        for (const result of this.testResults) {
            if (!interfaceStats[result.interfaceName]) {
                interfaceStats[result.interfaceName] = {
                    total: 0,
                    passed: 0,
                    failed: 0,
                    tests: []
                };
            }
            interfaceStats[result.interfaceName].total++;
            if (result.passed) {
                interfaceStats[result.interfaceName].passed++;
            } else {
                interfaceStats[result.interfaceName].failed++;
            }
            interfaceStats[result.interfaceName].tests.push(result);
        }

        // 打印各接口统计
        for (const [interfaceName, stats] of Object.entries(interfaceStats)) {
            console.log(`\n${interfaceName}:`);
            console.log(`  总测试数: ${stats.total}`);
            console.log(`  通过: ${stats.passed}`);
            console.log(`  失败: ${stats.failed}`);
            console.log(`  成功率: ${((stats.passed / stats.total) * 100).toFixed(1)}%`);
            
            // 打印失败的测试
            const failedTests = stats.tests.filter(t => !t.passed);
            if (failedTests.length > 0) {
                console.log(`  失败的测试:`);
                for (const test of failedTests) {
                    console.log(`    - ${test.testName}: ${test.description}`);
                    if (test.error) {
                        console.log(`      错误: ${test.error}`);
                    }
                }
            }
        }

        // 打印总体统计
        console.log('\n========================================');
        console.log('总体统计:');
        console.log('========================================');
        console.log(`总测试数: ${this.testStats.total}`);
        console.log(`通过: ${this.testStats.passed}`);
        console.log(`失败: ${this.testStats.failed}`);
        console.log(`跳过: ${this.testStats.skipped}`);
        console.log(`总成功率: ${((this.testStats.passed / this.testStats.total) * 100).toFixed(1)}%`);

        // 生成报告对象
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.testStats.total,
                passed: this.testStats.passed,
                failed: this.testStats.failed,
                skipped: this.testStats.skipped,
                successRate: ((this.testStats.passed / this.testStats.total) * 100).toFixed(1) + '%'
            },
            interfaceStats: interfaceStats,
            allTests: this.testResults
        };

        // 保存报告到本地存储
        try {
            localStorage.setItem('interfaceTestReport', JSON.stringify(report));
            console.log('\n测试报告已保存到本地存储');
        } catch (error) {
            console.warn('保存测试报告失败:', error);
        }

        return report;
    }

    /**
     * 导出测试报告为JSON
     * @returns {string} JSON格式的报告
     */
    exportReportAsJSON() {
        const report = this.generateTestReport();
        return JSON.stringify(report, null, 2);
    }

    /**
     * 导出测试报告为HTML
     * @returns {string} HTML格式的报告
     */
    exportReportAsHTML() {
        const report = this.generateTestReport();
        
        let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>接口测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; border-radius: 5px; }
        .summary { margin: 20px 0; }
        .interface { margin: 20px 0; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .test { margin: 10px 0; padding: 10px; }
        .passed { color: green; }
        .failed { color: red; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>接口测试报告</h1>
        <p>生成时间: ${report.timestamp}</p>
    </div>

    <div class="summary">
        <h2>总体统计</h2>
        <table>
            <tr><th>总测试数</th><td>${report.summary.total}</td></tr>
            <tr><th>通过</th><td class="passed">${report.summary.passed}</td></tr>
            <tr><th>失败</th><td class="failed">${report.summary.failed}</td></tr>
            <tr><th>成功率</th><td>${report.summary.successRate}</td></tr>
        </table>
    </div>
`;

        // 添加各接口统计
        for (const [interfaceName, stats] of Object.entries(report.interfaceStats)) {
            html += `
    <div class="interface">
        <h2>${interfaceName}</h2>
        <table>
            <tr><th>总测试数</th><td>${stats.total}</td></tr>
            <tr><th>通过</th><td class="passed">${stats.passed}</td></tr>
            <tr><th>失败</th><td class="failed">${stats.failed}</td></tr>
            <tr><th>成功率</th><td>${((stats.passed / stats.total) * 100).toFixed(1)}%</td></tr>
        </table>
        
        <h3>测试详情</h3>
        <table>
            <tr><th>测试名称</th><th>描述</th><th>结果</th><th>耗时</th></tr>
`;
            for (const test of stats.tests) {
                html += `
            <tr>
                <td>${test.testName}</td>
                <td>${test.description}</td>
                <td class="${test.passed ? 'passed' : 'failed'}">${test.passed ? '✓ 通过' : '✗ 失败'}</td>
                <td>${test.duration}ms</td>
            </tr>
`;
            }
            html += `        </table>
    </div>
`;
        }

        html += `
</body>
</html>
`;

        return html;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InterfaceTestSuite;
}