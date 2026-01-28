/**
 * Data Sync Manager Adapter
 * 数据同步接口适配器
 */

class DataSyncManagerAdapter {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.interfaceName = 'IDataSyncManager';
        this.version = '1.0.0';
        this.listeners = new Map();
        this.eventHistory = [];
        this.maxHistorySize = 100;
    }

    /**
     * 发布同步事件
     * @param {string} eventType - 事件类型
     * @param {Object} data - 事件数据
     * @returns {Object} 发布结果
     */
    publishEvent(eventType, data) {
        if (!eventType) {
            return {
                success: false,
                error: 'INVALID_EVENT_TYPE',
                message: '事件类型不能为空'
            };
        }

        if (!data) {
            return {
                success: false,
                error: 'INVALID_DATA',
                message: '事件数据不能为空'
            };
        }

        try {
            const eventId = `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const eventData = {
                id: eventId,
                type: eventType,
                data: data,
                timestamp: new Date().toISOString(),
                published: true
            };

            // 添加到历史记录
            this.eventHistory.push(eventData);
            if (this.eventHistory.length > this.maxHistorySize) {
                this.eventHistory.shift();
            }

            // 获取监听器
            const listeners = this.listeners.get(eventType);
            if (!listeners || listeners.length === 0) {
                return {
                    success: true,
                    eventId: eventId,
                    message: `事件已发布，但没有监听器: ${eventType}`,
                    listenerCount: 0
                };
            }

            // 通知所有监听器
            const results = [];
            for (const listener of listeners) {
                try {
                    const result = listener.callback(eventData);
                    results.push({
                        listenerId: listener.id,
                        success: true,
                        result: result
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
                eventId: eventId,
                eventType: eventType,
                listenerCount: listeners.length,
                results: results,
                timestamp: eventData.timestamp
            };
        } catch (error) {
            return {
                success: false,
                error: 'PUBLISH_FAILED',
                message: `事件发布失败: ${error.message}`
            };
        }
    }

    /**
     * 订阅同步事件
     * @param {string} eventType - 事件类型
     * @param {Function} callback - 回调函数
     * @returns {Object} 订阅结果
     */
    subscribeEvent(eventType, callback) {
        if (!eventType) {
            return {
                success: false,
                error: 'INVALID_EVENT_TYPE',
                message: '事件类型不能为空'
            };
        }

        if (typeof callback !== 'function') {
            return {
                success: false,
                error: 'INVALID_CALLBACK',
                message: '回调函数必须是函数'
            };
        }

        try {
            const subscriptionId = `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            if (!this.listeners.has(eventType)) {
                this.listeners.set(eventType, []);
            }

            const listeners = this.listeners.get(eventType);
            listeners.push({
                id: subscriptionId,
                callback: callback,
                subscribedAt: new Date().toISOString()
            });

            console.log(`事件订阅: ${eventType} -> ${subscriptionId}`);

            return {
                success: true,
                subscriptionId: subscriptionId,
                eventType: eventType,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: 'SUBSCRIBE_FAILED',
                message: `订阅失败: ${error.message}`
            };
        }
    }

    /**
     * 取消订阅事件
     * @param {string} subscriptionId - 订阅ID
     * @returns {Object} 取消结果
     */
    unsubscribeEvent(subscriptionId) {
        if (!subscriptionId) {
            return {
                success: false,
                error: 'SUBSCRIPTION_NOT_FOUND',
                message: '订阅ID不能为空'
            };
        }

        try {
            for (const [eventType, listeners] of this.listeners) {
                const index = listeners.findIndex(l => l.id === subscriptionId);
                if (index !== -1) {
                    listeners.splice(index, 1);
                    
                    // 如果该事件类型没有监听器了，删除事件类型
                    if (listeners.length === 0) {
                        this.listeners.delete(eventType);
                    }

                    console.log(`取消事件订阅: ${subscriptionId}`);

                    return {
                        success: true,
                        subscriptionId: subscriptionId,
                        eventType: eventType,
                        timestamp: new Date().toISOString()
                    };
                }
            }

            return {
                success: false,
                error: 'SUBSCRIPTION_NOT_FOUND',
                message: `订阅ID不存在: ${subscriptionId}`
            };
        } catch (error) {
            return {
                success: false,
                error: 'UNSUBSCRIBE_FAILED',
                message: `取消订阅失败: ${error.message}`
            };
        }
    }

    /**
     * 获取事件历史
     * @param {Object} filters - 筛选条件
     * @returns {Object} 历史记录
     */
    getEventHistory(filters = {}) {
        let history = [...this.eventHistory];

        // 按事件类型筛选
        if (filters.eventType) {
            history = history.filter(event => event.type === filters.eventType);
        }

        // 按时间范围筛选
        if (filters.startTime) {
            const startTime = new Date(filters.startTime);
            history = history.filter(event => new Date(event.timestamp) >= startTime);
        }

        if (filters.endTime) {
            const endTime = new Date(filters.endTime);
            history = history.filter(event => new Date(event.timestamp) <= endTime);
        }

        // 限制数量
        if (filters.limit && filters.limit > 0) {
            history = history.slice(-filters.limit);
        }

        return {
            success: true,
            events: history,
            total: history.length,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 清除事件历史
     * @param {Object} filters - 筛选条件
     * @returns {Object} 清除结果
     */
    clearEventHistory(filters = {}) {
        try {
            let clearedCount = 0;

            if (Object.keys(filters).length === 0) {
                // 清除所有历史
                clearedCount = this.eventHistory.length;
                this.eventHistory = [];
            } else {
                // 按条件清除
                const originalLength = this.eventHistory.length;
                
                if (filters.eventType) {
                    this.eventHistory = this.eventHistory.filter(event => event.type !== filters.eventType);
                }

                if (filters.beforeTime) {
                    const beforeTime = new Date(filters.beforeTime);
                    this.eventHistory = this.eventHistory.filter(event => new Date(event.timestamp) < beforeTime);
                }

                clearedCount = originalLength - this.eventHistory.length;
            }

            return {
                success: true,
                clearedCount: clearedCount,
                remainingCount: this.eventHistory.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: 'CLEAR_FAILED',
                message: `清除历史失败: ${error.message}`
            };
        }
    }

    /**
     * 获取接口名称
     * @returns {string} 接口名称
     */
    getName() {
        return this.interfaceName;
    }

    /**
     * 获取接口版本
     * @returns {string} 接口版本
     */
    getVersion() {
        return this.version;
    }

    /**
     * 验证接口实现
     * @returns {boolean} 是否有效
     */
    validate() {
        const requiredMethods = [
            'publishEvent',
            'subscribeEvent',
            'unsubscribeEvent'
        ];

        for (const method of requiredMethods) {
            if (typeof this[method] !== 'function') {
                console.error(`接口缺少必需方法: ${method}`);
                return false;
            }
        }

        return true;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataSyncManagerAdapter;
}