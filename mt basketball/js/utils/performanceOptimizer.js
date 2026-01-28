/**
 * 性能优化工具类
 * 包含防抖、节流、批量更新等功能
 */
class PerformanceOptimizer {
    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 延迟毫秒数
     * @returns {Function} 防抖后的函数
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} limit - 限制间隔毫秒数
     * @returns {Function} 节流后的函数
     */
    static throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * 批量 DOM 更新
     * @param {Array} updates - 更新操作数组
     */
    static batchDOMUpdates(updates) {
        // 使用文档片段减少重排
        const fragment = document.createDocumentFragment();
        updates.forEach(update => {
            const element = document.getElementById(update.elementId);
            if (element) {
                if (update.type === 'innerHTML') {
                    element.innerHTML = update.content;
                } else if (update.type === 'textContent') {
                    element.textContent = update.content;
                } else if (update.type === 'appendChild') {
                    element.appendChild(update.content);
                }
            }
        });
    }

    /**
     * 缓存装饰器
     * @param {Function} func - 要缓存的函数
     * @param {Function} keyGenerator - 生成缓存键的函数
     * @returns {Function} 带缓存的函数
     */
    static cached(func, keyGenerator = (...args) => JSON.stringify(args)) {
        const cache = new Map();
        return function (...args) {
            const key = keyGenerator(...args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = func.apply(this, args);
            cache.set(key, result);
            return result;
        };
    }
}

/**
 * 虚拟滚动容器类
 */
class VirtualScrollContainer {
    constructor(container, itemHeight, totalItems, renderItem) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.totalItems = totalItems;
        this.renderItem = renderItem;
        this.visibleStart = 0;
        this.visibleEnd = 0;
        this.itemsPerView = Math.ceil(container.clientHeight / itemHeight) + 2;
        
        this.setupContainer();
        this.bindEvents();
    }

    setupContainer() {
        this.container.style.height = `${this.totalItems * this.itemHeight}px`;
        this.container.style.position = 'relative';
        this.viewport = document.createElement('div');
        this.viewport.style.position = 'absolute';
        this.viewport.style.top = '0';
        this.viewport.style.left = '0';
        this.viewport.style.width = '100%';
        this.viewport.style.overflow = 'hidden';
        this.container.appendChild(this.viewport);
    }

    bindEvents() {
        this.container.addEventListener('scroll', this.throttle(() => {
            this.updateVisibleRange();
        }, 16)); // 约60fps
    }

    updateVisibleRange() {
        const scrollTop = this.container.scrollTop;
        this.visibleStart = Math.max(0, Math.floor(scrollTop / this.itemHeight) - 1);
        this.visibleEnd = Math.min(this.totalItems, this.visibleStart + this.itemsPerView);

        this.renderVisibleItems();
    }

    renderVisibleItems() {
        this.viewport.innerHTML = '';
        for (let i = this.visibleStart; i < this.visibleEnd; i++) {
            const item = this.renderItem(i);
            item.style.position = 'absolute';
            item.style.top = `${i * this.itemHeight}px`;
            item.style.left = '0';
            item.style.width = '100%';
            this.viewport.appendChild(item);
        }
    }

    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

/**
 * 对象池管理器
 */
class ObjectPool {
    constructor(createFn, resetFn) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
    }

    get() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return this.createFn();
    }

    release(obj) {
        this.resetFn(obj);
        this.pool.push(obj);
    }

    clear() {
        this.pool = [];
    }
}

window.PerformanceOptimizer = PerformanceOptimizer;
window.VirtualScrollContainer = VirtualScrollContainer;
window.ObjectPool = ObjectPool;