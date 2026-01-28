/**
 * Core Interface Manager
 * 核心接口管理器，负责所有模块间的标准化通信
 */

class CoreInterfaceManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.interfaces = new Map();
        this.adapters = new Map();
        this.eventBus = new Map();
        this.middleware = [];
        this.version = '2.0.0';
        this.isInitialized = false;
    }

    /**
     * 初始化接口管理器
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('接口管理器已初始化');
            return;
        }

        console.log('初始化核心接口管理器...');
        
        // 初始化事件总线
        this.initializeEventBus();
        
        // 加载默认中间件
        this.loadDefaultMiddleware();
        
        this.isInitialized = true;
        console.log(`核心接口管理器初始化完成 (版本: ${this.version})`);
        
        return {
            success: true,
            version: this.version,
            interfacesCount: this.interfaces.size
        };
    }

    /**
     * 初始化事件总线
     */
    initializeEventBus() {
        const eventTypes = [
            'scholarshipUpdated',
            'playerSigned',
            'playerReleased',
            'scheduleGenerated',
            'scheduleUpdated',
            'negotiationStarted',
            'negotiationCompleted',
            'negotiationFailed',
            'gameCompleted',
            'seasonStarted',
            'seasonEnded',
            'dataSync',
            'error'
        ];

        eventTypes.forEach(eventType => {
            this.eventBus.set(eventType, []);
        });

        console.log(`事件总线已初始化，支持 ${eventTypes.length} 种事件类型`);
    }

    /**
     * 加载默认中间件
     */
    loadDefaultMiddleware() {
        // 日志中间件
        this.addMiddleware({
            name: 'LoggingMiddleware',
            priority: 1,
            execute: (context) => {
                const timestamp = new Date().toISOString();
                console.log(`[接口调用] ${timestamp} - ${context.interfaceName}.${context.methodName}`, context);
                return context;
            }
        });

        // 错误处理中间件
        this.addMiddleware({
            name: 'ErrorHandlingMiddleware',
            priority: 2,
            execute: (context) => {
                if (context.error) {
                    console.error(`[接口错误] ${context.interfaceName}.${context.methodName}:`, context.error);
                    this.publishEvent('error', {
                        interfaceName: context.interfaceName,
                        methodName: context.methodName,
                        error: context.error,
                        timestamp: new Date().toISOString()
                    });
                }
                return context;
            }
        });

        // 性能监控中间件
        this.addMiddleware({
            name: 'PerformanceMiddleware',
            priority: 3,
            execute: (context) => {
                if (!context.startTime) {
                    context.startTime = Date.now();
                } else {
                    const duration = Date.now() - context.startTime;
                    context.duration = duration;
                    if (duration > 1000) {
                        console.warn(`[性能警告] ${context.interfaceName}.${context.methodName} 耗时 ${duration}ms`);
                    }
                }
                return context;
            }
        });
    }

    /**
     * 注册接口
     * @param {string} interfaceName - 接口名称
     * @param {Object} interfaceImplementation - 接口实现
     * @returns {Object} 注册结果
     */
    registerInterface(interfaceName, interfaceImplementation) {
        if (!interfaceName || !interfaceImplementation) {
            return {
                success: false,
                error: 'INVALID_INPUT',
                message: '接口名称或实现不能为空'
            };
        }

        // 验证接口实现
        if (!this.validateInterface(interfaceImplementation)) {
            return {
                success: false,
                error: 'INVALID_INTERFACE',
                message: '接口实现验证失败'
            };
        }

        this.interfaces.set(interfaceName, interfaceImplementation);
        
        console.log(`接口已注册: ${interfaceName} (版本: ${interfaceImplementation.version || 'N/A'})`);
        
        // 发布接口注册事件
        this.publishEvent('dataSync', {
            type: 'interfaceRegistered',
            interfaceName: interfaceName,
            version: interfaceImplementation.version,
            timestamp: new Date().toISOString()
        });

        return {
            success: true,
            interfaceName: interfaceName,
            version: interfaceImplementation.version
        };
    }

    /**
     * 验证接口实现
     * @param {Object} interfaceImplementation - 接口实现
     * @returns {boolean} 是否有效
     */
    validateInterface(interfaceImplementation) {
        // 检查必需的方法
        const requiredMethods = ['getName', 'getVersion', 'validate'];
        for (const method of requiredMethods) {
            if (typeof interfaceImplementation[method] !== 'function') {
                console.error(`接口缺少必需方法: ${method}`);
                return false;
            }
        }

        // 调用接口的validate方法
        if (typeof interfaceImplementation.validate === 'function') {
            try {
                return interfaceImplementation.validate();
            } catch (error) {
                console.error('接口验证失败:', error);
                return false;
            }
        }

        return true;
    }

    /**
     * 获取接口
     * @param {string} interfaceName - 接口名称
     * @returns {Object} 接口实现
     */
    getInterface(interfaceName) {
        const interfaceImpl = this.interfaces.get(interfaceName);
        if (!interfaceImpl) {
            console.warn(`接口未注册: ${interfaceName}`);
            return null;
        }
        return interfaceImpl;
    }

    /**
     * 调用接口方法
     * @param {string} interfaceName - 接口名称
     * @param {string} methodName - 方法名称
     * @param {Array} args - 参数数组
     * @returns {Object} 调用结果
     */
    async invoke(interfaceName, methodName, ...args) {
        const context = {
            interfaceName,
            methodName,
            args,
            startTime: Date.now(),
            error: null
        };

        try {
            // 执行前置中间件
            for (const middleware of this.middleware) {
                context = middleware.execute(context);
                if (context.error) {
                    return {
                        success: false,
                        error: context.error,
                        message: '中间件处理失败'
                    };
                }
            }

            // 获取接口
            const interfaceImpl = this.getInterface(interfaceName);
            if (!interfaceImpl) {
                context.error = `接口未注册: ${interfaceName}`;
                return {
                    success: false,
                    error: 'INTERFACE_NOT_FOUND',
                    message: context.error
                };
            }

            // 调用方法
            if (typeof interfaceImpl[methodName] !== 'function') {
                context.error = `方法不存在: ${methodName}`;
                return {
                    success: false,
                    error: 'METHOD_NOT_FOUND',
                    message: context.error
                };
            }

            const result = await interfaceImpl[methodName](...args);
            
            // 执行后置中间件
            context.result = result;
            for (const middleware of this.middleware) {
                context = middleware.execute(context);
            }

            return {
                success: true,
                data: result,
                duration: context.duration
            };

        } catch (error) {
            context.error = error;
            return {
                success: false,
                error: error.message || 'UNKNOWN_ERROR',
                message: error.message || '接口调用失败'
            };
        }
    }

    /**
     * 添加中间件
     * @param {Object} middleware - 中间件对象
     */
    addMiddleware(middleware) {
        if (!middleware.name || typeof middleware.execute !== 'function') {
            console.error('无效的中间件');
            return;
        }

        this.middleware.push(middleware);
        // 按优先级排序
        this.middleware.sort((a, b) => (a.priority || 0) - (b.priority || 0));
        
        console.log(`中间件已添加: ${middleware.name} (优先级: ${middleware.priority || 0})`);
    }

    /**
     * 发布事件
     * @param {string} eventType - 事件类型
     * @param {Object} data - 事件数据
     */
    publishEvent(eventType, data) {
        const listeners = this.eventBus.get(eventType);
        if (!listeners || listeners.length === 0) {
            return {
                success: false,
                message: `没有监听器订阅事件: ${eventType}`
            };
        }

        console.log(`发布事件: ${eventType}`, data);

        // 通知所有监听器
        const results = [];
        for (const listener of listeners) {
            try {
                const result = listener.callback(data);
                results.push({
                    listenerId: listener.id,
                    success: true,
                    result
                });
            } catch (error) {
                console.error(`事件监听器执行失败 (${listener.id}):`, error);
                results.push({
                    listenerId: listener.id,
                    success: false,
                    error: error.message
                });
            }
        }

        return {
            success: true,
            eventType,
            listenerCount: listeners.length,
            results
        };
    }

    /**
     * 订阅事件
     * @param {string} eventType - 事件类型
     * @param {Function} callback - 回调函数
     * @returns {string} 订阅ID
     */
    subscribeEvent(eventType, callback) {
        if (typeof callback !== 'function') {
            console.error('回调函数必须是函数');
            return null;
        }

        const listeners = this.eventBus.get(eventType);
        if (!listeners) {
            console.warn(`不支持的事件类型: ${eventType}`);
            return null;
        }

        const subscriptionId = `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        listeners.push({
            id: subscriptionId,
            callback,
            subscribedAt: new Date().toISOString()
        });

        console.log(`事件订阅: ${eventType} -> ${subscriptionId}`);

        return subscriptionId;
    }

    /**
     * 取消订阅事件
     * @param {string} subscriptionId - 订阅ID
     * @returns {boolean} 是否成功
     */
    unsubscribeEvent(subscriptionId) {
        for (const [eventType, listeners] of this.eventBus) {
            const index = listeners.findIndex(l => l.id === subscriptionId);
            if (index !== -1) {
                listeners.splice(index, 1);
                console.log(`取消事件订阅: ${subscriptionId}`);
                return true;
            }
        }

        console.warn(`订阅ID不存在: ${subscriptionId}`);
        return false;
    }

    /**
     * 获取接口状态
     * @returns {Object} 状态信息
     */
    getStatus() {
        const interfaceList = [];
        for (const [name, impl] of this.interfaces) {
            interfaceList.push({
                name,
                version: impl.version || 'N/A',
                validated: this.validateInterface(impl)
            });
        }

        return {
            version: this.version,
            isInitialized: this.isInitialized,
            interfacesCount: this.interfaces.size,
            interfaces: interfaceList,
            eventTypes: Array.from(this.eventBus.keys()),
            middlewareCount: this.middleware.length,
            middleware: this.middleware.map(m => m.name)
        };
    }

    /**
     * 重置接口管理器
     */
    reset() {
        this.interfaces.clear();
        this.adapters.clear();
        this.eventBus.clear();
        this.middleware = [];
        this.isInitialized = false;
        console.log('接口管理器已重置');
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoreInterfaceManager;
}