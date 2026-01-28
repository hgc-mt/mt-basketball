/**
 * Interface System Initializer
 * 接口系统初始化脚本
 */

class InterfaceSystemInitializer {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.coreInterfaceManager = null;
        this.adapters = [];
    }

    /**
     * 初始化接口系统
     * @returns {Object} 初始化结果
     */
    async initialize() {
        console.log('========================================');
        console.log('初始化接口系统');
        console.log('========================================\n');

        try {
            // 1. 创建核心接口管理器
            console.log('1. 创建核心接口管理器...');
            this.coreInterfaceManager = new CoreInterfaceManager(this.gameStateManager);
            const initResult = await this.coreInterfaceManager.initialize();
            console.log(`✓ 核心接口管理器初始化完成 (版本: ${initResult.version})\n`);

            // 2. 注册奖学金计算接口
            console.log('2. 注册奖学金计算接口...');
            await this.registerScholarshipCalculator();

            // 3. 注册赛程管理接口
            console.log('3. 注册赛程管理接口...');
            await this.registerScheduleManager();

            // 4. 注册谈判管理接口
            console.log('4. 注册谈判管理接口...');
            await this.registerNegotiationManager();

            // 5. 注册数据同步接口
            console.log('5. 注册数据同步接口...');
            await this.registerDataSyncManager();

            // 6. 设置事件监听器
            console.log('6. 设置事件监听器...');
            await this.setupEventListeners();

            // 7. 显示系统状态
            console.log('7. 接口系统状态:');
            const status = this.coreInterfaceManager.getStatus();
            console.log(`   - 已注册接口: ${status.interfacesCount}`);
            console.log(`   - 支持的事件类型: ${status.eventTypes.length}`);
            console.log(`   - 中间件数量: ${status.middlewareCount}`);

            console.log('\n========================================');
            console.log('接口系统初始化完成！');
            console.log('========================================\n');

            return {
                success: true,
                coreInterfaceManager: this.coreInterfaceManager,
                adapters: this.adapters,
                status: status
            };

        } catch (error) {
            console.error('接口系统初始化失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 注册奖学金计算接口
     */
    async registerScholarshipCalculator() {
        const adapter = new ScholarshipCalculatorAdapter(this.gameStateManager);
        const result = this.coreInterfaceManager.registerInterface('IScholarshipCalculator', adapter);
        
        if (result.success) {
            this.adapters.push({
                name: 'IScholarshipCalculator',
                adapter: adapter,
                version: adapter.getVersion()
            });
            console.log(`✓ 奖学金计算接口已注册 (版本: ${adapter.getVersion()})`);
        } else {
            console.error(`✗ 奖学金计算接口注册失败: ${result.message}`);
            throw new Error(result.message);
        }
    }

    /**
     * 注册赛程管理接口
     */
    async registerScheduleManager() {
        const adapter = new ScheduleManagerAdapter(this.gameStateManager);
        const result = this.coreInterfaceManager.registerInterface('IScheduleManager', adapter);
        
        if (result.success) {
            this.adapters.push({
                name: 'IScheduleManager',
                adapter: adapter,
                version: adapter.getVersion()
            });
            console.log(`✓ 赛程管理接口已注册 (版本: ${adapter.getVersion()})`);
        } else {
            console.error(`✗ 赛程管理接口注册失败: ${result.message}`);
            throw new Error(result.message);
        }
    }

    /**
     * 注册谈判管理接口
     */
    async registerNegotiationManager() {
        const adapter = new NegotiationManagerAdapter(this.gameStateManager);
        const result = this.coreInterfaceManager.registerInterface('INegotiationManager', adapter);
        
        if (result.success) {
            this.adapters.push({
                name: 'INegotiationManager',
                adapter: adapter,
                version: adapter.getVersion()
            });
            console.log(`✓ 谈判管理接口已注册 (版本: ${adapter.getVersion()})`);
        } else {
            console.error(`✗ 谈判管理接口注册失败: ${result.message}`);
            throw new Error(result.message);
        }
    }

    /**
     * 注册数据同步接口
     */
    async registerDataSyncManager() {
        const adapter = new DataSyncManagerAdapter(this.gameStateManager);
        const result = this.coreInterfaceManager.registerInterface('IDataSyncManager', adapter);
        
        if (result.success) {
            this.adapters.push({
                name: 'IDataSyncManager',
                adapter: adapter,
                version: adapter.getVersion()
            });
            console.log(`✓ 数据同步接口已注册 (版本: ${adapter.getVersion()})`);
        } else {
            console.error(`✗ 数据同步接口注册失败: ${result.message}`);
            throw new Error(result.message);
        }
    }

    /**
     * 设置事件监听器
     */
    async setupEventListeners() {
        // 监听球员签约事件
        this.coreInterfaceManager.subscribeEvent('playerSigned', (eventData) => {
            console.log(`[事件] 球员签约: ${eventData.data.playerName}`);
            // 更新UI或其他操作
        });

        // 监听奖学金更新事件
        this.coreInterfaceManager.subscribeEvent('scholarshipUpdated', (eventData) => {
            console.log(`[事件] 奖学金更新: 球员ID ${eventData.data.playerId}`);
            // 更新UI或其他操作
        });

        // 监听赛程生成事件
        this.coreInterfaceManager.subscribeEvent('scheduleGenerated', (eventData) => {
            console.log(`[事件] 赛程生成: ${eventData.data.totalGames} 场比赛`);
            // 更新UI或其他操作
        });

        // 监听谈判完成事件
        this.coreInterfaceManager.subscribeEvent('negotiationCompleted', (eventData) => {
            console.log(`[事件] 谈判完成: ${eventData.data.targetName}`);
            // 更新UI或其他操作
        });

        console.log(`✓ 事件监听器已设置`);
    }

    /**
     * 获取核心接口管理器
     * @returns {CoreInterfaceManager} 核心接口管理器
     */
    getCoreInterfaceManager() {
        return this.coreInterfaceManager;
    }

    /**
     * 获取已注册的适配器
     * @returns {Array} 适配器列表
     */
    getAdapters() {
        return this.adapters;
    }

    /**
     * 获取指定接口
     * @param {string} interfaceName - 接口名称
     * @returns {Object} 接口实现
     */
    getInterface(interfaceName) {
        return this.coreInterfaceManager.getInterface(interfaceName);
    }
}

// 全局变量
let interfaceSystemInitializer = null;
let coreInterfaceManager = null;

/**
 * 初始化接口系统（全局函数）
 */
async function initializeInterfaceSystem() {
    if (interfaceSystemInitializer) {
        console.log('接口系统已初始化');
        return interfaceSystemInitializer;
    }

    interfaceSystemInitializer = new InterfaceSystemInitializer(gameStateManager);
    const result = await interfaceSystemInitializer.initialize();

    if (result.success) {
        coreInterfaceManager = result.coreInterfaceManager;
        return interfaceSystemInitializer;
    } else {
        console.error('接口系统初始化失败:', result.error);
        return null;
    }
}

/**
 * 获取核心接口管理器（全局函数）
 */
function getCoreInterfaceManager() {
    return coreInterfaceManager;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InterfaceSystemInitializer;
}