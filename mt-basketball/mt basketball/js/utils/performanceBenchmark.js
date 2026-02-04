/**
 * 性能基准测试工具
 * 用于测试篮球经理游戏系统优化前后的性能差异
 */
class PerformanceBenchmark {
    constructor() {
        this.results = [];
        this.metrics = {
            startTime: 0,
            endTime: 0,
            memoryUsage: [],
            frameRate: [],
            operationTimes: {}
        };
    }

    // 开始性能测试
    startTest(testName) {
        console.log(`开始性能测试: ${testName}`);
        this.metrics.startTime = performance.now();
        
        // 如果浏览器支持内存API，则收集内存信息
        if (performance.memory) {
            this.metrics.initialMemory = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
    }

    // 结束性能测试
    endTest(testName) {
        this.metrics.endTime = performance.now();
        const duration = this.metrics.endTime - this.metrics.startTime;
        
        // 收集结束时的内存信息
        if (performance.memory) {
            this.metrics.finalMemory = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        
        const result = {
            testName,
            duration: duration.toFixed(2) + 'ms',
            memoryChange: this.calculateMemoryChange(),
            timestamp: new Date().toISOString()
        };
        
        this.results.push(result);
        console.log(`性能测试完成: ${testName}, 耗时: ${duration.toFixed(2)}ms`);
        
        return result;
    }

    // 计算内存变化
    calculateMemoryChange() {
        if (this.metrics.initialMemory && this.metrics.finalMemory) {
            const change = this.metrics.finalMemory.used - this.metrics.initialMemory.used;
            return {
                initial: this.formatBytes(this.metrics.initialMemory.used),
                final: this.formatBytes(this.metrics.finalMemory.used),
                change: this.formatBytes(change),
                changeBytes: change
            };
        }
        return null;
    }

    // 格式化字节数
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 测试渲染性能
    async testRenderPerformance(renderFunction, iterations = 100) {
        this.startTest(`渲染性能测试 (${iterations}次)`);

        const times = [];
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            renderFunction(i);
            const end = performance.now();
            times.push(end - start);
        }

        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const totalTime = times.reduce((a, b) => a + b, 0);

        this.endTest(`渲染性能测试 (${iterations}次)`);
        
        return {
            averageTime: avgTime.toFixed(2) + 'ms',
            totalTime: totalTime.toFixed(2) + 'ms',
            iterations: iterations,
            opsPerSecond: (iterations / (totalTime / 1000)).toFixed(2)
        };
    }

    // 测试数组操作性能
    testArrayOperations() {
        const sizes = [100, 500, 1000, 5000];
        const results = {};

        sizes.forEach(size => {
            const testData = this.generateTestData(size);
            
            // 测试旧方法（filter多次）
            this.startTest(`数组操作旧方法 (${size}项)`);
            const oldMethodTime = this.oldArrayMethod(testData);
            this.endTest(`数组操作旧方法 (${size}项)`);
            
            // 测试新方法（一次遍历）
            this.startTest(`数组操作新方法 (${size}项)`);
            const newMethodTime = this.newArrayMethod(testData);
            this.endTest(`数组操作新方法 (${size}项)`);
            
            results[size] = {
                oldMethod: oldMethodTime.toFixed(2) + 'ms',
                newMethod: newMethodTime.toFixed(2) + 'ms',
                improvement: ((oldMethodTime - newMethodTime) / oldMethodTime * 100).toFixed(2) + '%'
            };
        });

        return results;
    }

    // 生成测试数据
    generateTestData(size) {
        const data = [];
        for (let i = 0; i < size; i++) {
            data.push({
                id: i,
                name: `Player ${i}`,
                status: ['freshman_recruit', 'free_agent', 'transfer_wanted'][i % 3],
                rating: Math.floor(Math.random() * 100),
                potential: Math.floor(Math.random() * 100)
            });
        }
        return data;
    }

    // 旧方法：多次filter操作
    oldArrayMethod(data) {
        const start = performance.now();
        
        // 模拟旧代码中的多次filter操作
        const freshmen = data.filter(p => p.status === 'freshman_recruit').length;
        const freeAgents = data.filter(p => p.status === 'free_agent').length;
        const transfers = data.filter(p => p.status === 'transfer_wanted').length;
        
        const end = performance.now();
        return end - start;
    }

    // 新方法：一次遍历统计
    newArrayMethod(data) {
        const start = performance.now();
        
        // 模拟优化后的代码：一次遍历统计
        const stats = { freshmen: 0, freeAgents: 0, transfers: 0 };
        for (const item of data) {
            switch (item.status) {
                case 'freshman_recruit':
                    stats.freshmen++;
                    break;
                case 'free_agent':
                    stats.freeAgents++;
                    break;
                case 'transfer_wanted':
                    stats.transfers++;
                    break;
            }
        }
        
        const end = performance.now();
        return end - start;
    }

    // 运行所有基准测试
    async runAllBenchmarks() {
        console.log('开始运行所有性能基准测试...');
        
        // 测试数组操作性能
        console.log('\n1. 数组操作性能测试:');
        const arrayResults = this.testArrayOperations();
        console.table(arrayResults);
        
        // 测试渲染性能
        console.log('\n2. 渲染性能测试:');
        const renderResult = await this.testRenderPerformance(() => {
            // 模拟渲染操作
            const div = document.createElement('div');
            div.innerHTML = '<span>Test Render</span>';
            return div;
        }, 1000);
        console.log(renderResult);
        
        // 输出总体结果
        console.log('\n3. 总体测试结果:');
        console.table(this.results);
        
        return {
            arrayResults,
            renderResult,
            overallResults: this.results
        };
    }

    // 导出测试结果
    exportResults() {
        const exportData = {
            timestamp: new Date().toISOString(),
            results: this.results,
            systemInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                hardwareConcurrency: navigator.hardwareConcurrency,
                deviceMemory: navigator.deviceMemory || 'Unknown'
            }
        };
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "performance_benchmark_results.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}

// 创建全局实例
window.PerformanceBenchmark = PerformanceBenchmark;

// 使用示例
/*
const benchmark = new PerformanceBenchmark();
benchmark.runAllBenchmarks().then(results => {
    console.log('基准测试完成!', results);
    // benchmark.exportResults(); // 导出结果
});
*/