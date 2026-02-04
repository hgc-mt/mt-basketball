/**
 * Optimized Enhanced Negotiation Manager
 * 完整的球员和教练签约谈判系统，包括策略制定、背景研究、合同条款、谈判会议、竞争对手分析和风险评估
 * 包含性能优化功能
 */

class OptimizedEnhancedNegotiationManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.isInitialized = false;

        this.playerNegotiations = [];
        this.coachNegotiations = [];
        this.negotiationHistory = [];
        this.targetResearch = {};
        this.competitorOffers = {};

        // 添加性能优化工具
        this.debouncedRender = this.debounce((fn) => fn(), 100);
        this.renderCache = new Map();
        this.eventHandlers = {}; // 用于清理事件监听器

        this.negotiationStrategies = {
            aggressive: {
                name: '激进策略',
                description: '一开始就提出高于市场价的报价，快速达成协议',
                pros: '成功率高，速度快',
                cons: '成本较高，可能被球员利用',
                baseBonus: 0.2,
                speedBonus: 0.5
            },
            balanced: {
                name: '均衡策略',
                description: '提出合理报价，逐步协商',
                pros: '成本适中，成功率稳定',
                cons: '谈判回合较多',
                baseBonus: 0,
                speedBonus: 0
            },
            patient: {
                name: '耐心策略',
                description: '等待球员降低期望，最后一刻达成协议',
                pros: '成本最低',
                cons: '可能错失目标球员',
                baseBonus: -0.15,
                speedBonus: -0.3
            },
            relational: {
                name: '关系策略',
                description: '强调球队文化和长期发展，建立情感联系',
                pros: '有助于球员长期留队',
                cons: '不适用于所有球员',
                loyaltyBonus: 0.15
            }
        };

        this.playerPriorities = {
            scholarship: { name: '奖学金', weight: 0.4, description: '经济利益最大化' },
            playingTime: { name: '出场时间', weight: 0.25, description: '获得更多出场机会' },
            teamSuccess: { name: '球队成绩', weight: 0.2, description: '加入有竞争力的球队' },
            coachQuality: { name: '教练水平', weight: 0.15, description: '在名帅指导下成长' },
            location: { name: '地理位置', weight: 0.1, description: '距离家乡或偏好城市' },
            academics: { name: '学术质量', weight: 0.1, description: '教育水平和发展前景' }
        };

        this.riskLevels = {
            low: { name: '低风险', color: '#4caf50', description: '成功率>70%，成本可控' },
            medium: { name: '中风险', color: '#ff9800', description: '成功率40-70%，需要策略调整' },
            high: { name: '高风险', color: '#f44336', description: '成功率<40%，可能失败' }
        };
    }

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 节流函数
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

    // 缓存渲染结果
    getCachedRender(key, renderFn) {
        const cached = this.renderCache.get(key);
        if (cached && (Date.now() - cached.timestamp) < 1000) { // 1秒缓存
            return cached.result;
        }
        
        const result = renderFn();
        this.renderCache.set(key, {
            result: result,
            timestamp: Date.now()
        });
        
        return result;
    }

    // 清理事件监听器
    cleanup() {
        Object.values(this.eventHandlers).forEach(handler => {
            if (handler.element && handler.event && handler.fn) {
                handler.element.removeEventListener(handler.event, handler.fn);
            }
        });
        this.eventHandlers = {};
    }

    async initialize() {
        if (this.isInitialized) return;

        this.loadNegotiationState();
        this.isInitialized = true;

        console.log('Optimized Enhanced Negotiation Manager initialized');
    }

    loadNegotiationState() {
        const state = this.gameStateManager.getState();
        if (state.playerNegotiations) this.playerNegotiations = state.playerNegotiations;
        if (state.coachNegotiations) this.coachNegotiations = state.coachNegotiations;
        if (state.negotiationHistory) this.negotiationHistory = state.negotiationHistory;
        if (state.targetResearch) this.targetResearch = state.targetResearch;
        if (state.competitorOffers) this.competitorOffers = state.competitorOffers;
    }

    saveNegotiationState() {
        this.gameStateManager.set('playerNegotiations', this.playerNegotiations);
        this.gameStateManager.set('coachNegotiations', this.coachNegotiations);
        this.gameStateManager.set('negotiationHistory', this.negotiationHistory);
        this.gameStateManager.set('targetResearch', this.targetResearch);
        this.gameStateManager.set('competitorOffers', this.competitorOffers);
        this.gameStateManager.saveGameState();
    }

    // ==================== 谈判中心界面 ====================

    showNegotiationCenter(type = 'player') {
        this.createNegotiationCenterUI(type);
    }

    createNegotiationCenterUI(type) {
        let existingModal = document.getElementById('negotiation-center-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'negotiation-center-modal';
        modal.className = 'negotiation-center-modal';

        const activeNegotiations = type === 'player' ? this.playerNegotiations : this.coachNegotiations;
        const targetPool = type === 'player'
            ? this.gameStateManager.get('availablePlayers') || []
            : this.gameStateManager.get('availableCoaches') || [];

        modal.innerHTML = `
            <div class="negotiation-center-content">
                <div class="negotiation-center-header">
                    <h2>${type === 'player' ? '球员' : '教练'}签约谈判中心</h2>
                    <button class="close-btn" onclick="document.getElementById('negotiation-center-modal').remove()">×</button>
                </div>

                <div class="negotiation-tabs">
                    <button class="tab-btn active" data-tab="active-negotiations">进行中的谈判</button>
                    <button class="tab-btn" data-tab="target-research">目标研究</button>
                    <button class="tab-btn" data-tab="strategy-planning">策略制定</button>
                    <button class="tab-btn" data-tab="competitor-analysis">竞争对手</button>
                    <button class="tab-btn" data-tab="risk-assessment">风险评估</button>
                    <button class="tab-btn" data-tab="history">谈判历史</button>
                </div>

                <div class="negotiation-tab-content">
                    <div class="tab-panel active" id="active-negotiations">
                        ${this.renderActiveNegotiations(type)}
                    </div>
                    <div class="tab-panel" id="target-research">
                        ${this.renderTargetResearch(type, targetPool)}
                    </div>
                    <div class="tab-panel" id="strategy-planning">
                        ${this.renderStrategyPlanning(type)}
                    </div>
                    <div class="tab-panel" id="competitor-analysis">
                        ${this.renderCompetitorAnalysis(type)}
                    </div>
                    <div class="tab-panel" id="risk-assessment">
                        ${this.renderRiskAssessment(type)}
                    </div>
                    <div class="tab-panel" id="history">
                        ${this.renderNegotiationHistory(type)}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        this.setupNegotiationCenterEvents(type);
    }

    renderActiveNegotiations(type) {
        const cacheKey = `active_negotiations_${type}_${this.playerNegotiations.length}_${this.coachNegotiations.length}`;
        
        return this.getCachedRender(cacheKey, () => {
            const negotiations = type === 'player' ? this.playerNegotiations : this.coachNegotiations;

            if (negotiations.length === 0) {
                return `
                    <div class="empty-state">
                        <div class="empty-icon">${type === 'player' ? '🤝' : '👨‍🏫'}</div>
                        <h3>暂无进行中的谈判</h3>
                        <p>前往"目标研究"标签页选择目标，开始谈判</p>
                    </div>
                `;
            }

            return `
                <div class="negotiation-list">
                    ${negotiations.map(neg => this.renderNegotiationCard(neg, type)).join('')}
                </div>
            `;
        });
    }

    renderNegotiationCard(negotiation, type) {
        const statusColors = {
            'active': '#4caf50',
            'counter': '#ff9800',
            'accepted': '#2196f3',
            'failed': '#f44336',
            'withdrawn': '#9e9e9e'
        };

        const riskLevel = this.calculateNegotiationRisk(negotiation);
        const progress = Math.min(100, (negotiation.round / negotiation.maxRounds) * 100);

        return `
            <div class="negotiation-card" data-id="${negotiation.id}">
                <div class="negotiation-card-header">
                    <div class="target-info">
                        <div class="target-avatar">${type === 'player' ? '🏀' : '👨‍🏫'}</div>
                        <div class="target-details">
                            <h4>${negotiation.targetName}</h4>
                            <p>${type === 'player' ? `${negotiation.targetPosition} | ${negotiation.targetYear}` : negotiation.targetArchetype}</p>
                            <div class="target-rating">
                                <span class="rating-badge">能力: ${negotiation.targetRating}</span>
                                <span class="potential-badge">潜力: ${negotiation.targetPotential || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="negotiation-status" style="background: ${statusColors[negotiation.status]}">
                        ${this.getStatusText(negotiation.status)}
                    </div>
                </div>

                <div class="negotiation-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">第 ${negotiation.round} / ${negotiation.maxRounds} 轮</span>
                </div>

                <div class="negotiation-offer-summary">
                    <div class="offer-item">
                        <span class="label">当前报价</span>
                        <span class="value">${type === 'player'
                            ? `${Math.round(negotiation.offer.scholarship * 100)}% 奖学金`
                            : `$${this.formatCurrency(negotiation.offer.salary)}`}</span>
                    </div>
                    <div class="offer-item">
                        <span class="label">成功率</span>
                        <span class="value ${riskLevel.level === 'high' ? 'risk-high' : riskLevel.level === 'medium' ? 'risk-medium' : 'risk-low'}">
                            ${negotiation.acceptanceProbability}%
                        </span>
                    </div>
                    <div class="offer-item">
                        <span class="label">风险等级</span>
                        <span class="value" style="color: ${this.riskLevels[riskLevel.level].color}">
                            ${this.riskLevels[riskLevel.level].name}
                        </span>
                    </div>
                </div>

                ${negotiation.status === 'active' ? `
                    <div class="negotiation-actions">
                        <button class="action-btn improve-offer" data-id="${negotiation.id}" data-type="${type}">
                            提升报价
                        </button>
                        <button class="action-btn secondary view-details" data-id="${negotiation.id}" data-type="${type}">
                            详情
                        </button>
                        <button class="action-btn danger withdraw" data-id="${negotiation.id}" data-type="${type}">
                            退出谈判
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // 添加更多优化方法...
}