/**
 * Enhanced Negotiation Manager
 * 完整的球员和教练签约谈判系统，包括策略制定、背景研究、合同条款、谈判会议、竞争对手分析和风险评估
 */

class EnhancedNegotiationManager {
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

    async initialize() {
        if (this.isInitialized) return;

        this.loadNegotiationState();
        this.isInitialized = true;

        console.log('Enhanced Negotiation Manager initialized');
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

    renderTargetResearch(type, targetPool) {
        return `
            <div class="target-research-section">
                <div class="research-header">
                    <h3>目标${type === 'player' ? '球员' : '教练'}研究</h3>
                    <p>选择目标进行深入研究，了解其需求和谈判底线</p>
                </div>

                <div class="target-filter">
                    <input type="text" id="target-search" placeholder="搜索目标..." class="search-input">
                    <select id="target-sort">
                        <option value="rating-desc">能力值 高→低</option>
                        <option value="rating-asc">能力值 低→高</option>
                        <option value="priority">优先级</option>
                    </select>
                </div>

                <div class="target-grid">
                    ${targetPool.slice(0, 20).map(target => this.renderResearchCard(target, type)).join('')}
                </div>
            </div>
        `;
    }

    renderResearchCard(target, type) {
        const research = this.targetResearch[`${type}_${target.id}`] || {};

        let rating, potential;
        if (type === 'player') {
            rating = target.getOverallRating ? target.getOverallRating() : (target.rating || 70);
            potential = target.potential || 70;
        } else {
            rating = target.overallRating || 70;
            potential = null;
        }

        return `
            <div class="research-card" data-id="${target.id}" data-type="${type}">
                <div class="research-card-header">
                    <div class="target-avatar large">${type === 'player' ? '🏀' : '👨‍🏫'}</div>
                    <div class="target-info">
                        <h4>${target.name}</h4>
                        <p>${type === 'player'
                            ? `${target.position || '未知位置'} | ${this.getYearName(target.year)}`
                            : target.archetype || '未知类型'}</p>
                    </div>
                </div>

                <div class="target-stats">
                    <div class="stat">
                        <span class="stat-label">能力</span>
                        <span class="stat-value">${rating}</span>
                    </div>
                    ${type === 'player' ? `
                        <div class="stat">
                            <span class="stat-label">潜力</span>
                            <span class="stat-value">${potential}</span>
                        </div>
                    ` : ''}
                    <div class="stat">
                        <span class="stat-label">优先级</span>
                        <span class="stat-value priority-${research.priority || 'medium'}">
                            ${research.priority ? this.getPriorityName(research.priority) : '未评估'}
                        </span>
                    </div>
                </div>

                ${research.needs ? `
                    <div class="needs-summary">
                        <h5>球员需求</h5>
                        <div class="needs-tags">
                            ${research.needs.map(need => `<span class="need-tag">${need}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="research-actions">
                    <button class="action-btn start-research" data-id="${target.id}" data-type="${type}">
                        开始研究
                    </button>
                    <button class="action-btn primary start-negotiation" data-id="${target.id}" data-type="${type}">
                        开始谈判
                    </button>
                </div>
            </div>
        `;
    }

    renderStrategyPlanning(type) {
        const strategies = Object.entries(this.negotiationStrategies);

        return `
            <div class="strategy-planning-section">
                <div class="planning-header">
                    <h3>谈判策略制定</h3>
                    <p>选择最适合的谈判策略，根据目标特点调整</p>
                </div>

                <div class="strategy-grid">
                    ${strategies.map(([key, strategy]) => `
                        <div class="strategy-card" data-strategy="${key}">
                            <div class="strategy-header">
                                <h4>${strategy.name}</h4>
                            </div>
                            <p class="strategy-description">${strategy.description}</p>
                            <div class="strategy-pros-cons">
                                <div class="pros">
                                    <span class="label">优势</span>
                                    <span class="text">${strategy.pros}</span>
                                </div>
                                <div class="cons">
                                    <span class="label">劣势</span>
                                    <span class="text">${strategy.cons}</span>
                                </div>
                            </div>
                            <button class="action-btn select-strategy" data-strategy="${key}" data-type="${type}">
                                选择策略
                            </button>
                        </div>
                    `).join('')}
                </div>

                <div class="custom-strategy">
                    <h4>自定义策略</h4>
                    <div class="strategy-form">
                        <div class="form-group">
                            <label>奖学金加成</label>
                            <input type="range" id="scholarship-bonus" min="-30" max="30" value="0">
                            <span id="scholarship-bonus-value">0%</span>
                        </div>
                        <div class="form-group">
                            <label>谈判速度</label>
                            <select id="negotiation-speed">
                                <option value="slow">耐心等待</option>
                                <option value="normal" selected>正常速度</option>
                                <option value="fast">快速推进</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>关系建设</label>
                            <input type="checkbox" id="relationship-building">
                            <span>强调球队文化和长期发展</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderCompetitorAnalysis(type) {
        return `
            <div class="competitor-analysis-section">
                <div class="analysis-header">
                    <h3>竞争对手报价分析</h3>
                    <p>了解竞争对手的报价策略，调整自己的谈判方案</p>
                </div>

                <div class="competitor-insights">
                    <div class="insight-card">
                        <div class="insight-icon">📊</div>
                        <div class="insight-content">
                            <h4>市场概况</h4>
                            <p>当前市场平均报价为 <strong>${type === 'player' ? '75%' : '$750,000'}</strong></p>
                        </div>
                    </div>
                    <div class="insight-card">
                        <div class="insight-icon">🏆</div>
                        <div class="insight-content">
                            <h4>热门目标</h4>
                            <p>${type === 'player' ? '顶级新秀' : '冠军教练'}受到多支球队关注</p>
                        </div>
                    </div>
                </div>

                <div class="competitor-offers-list">
                    <h4>竞争对手动态</h4>
                    ${this.generateCompetitorUpdates(type)}
                </div>
            </div>
        `;
    }

    generateCompetitorUpdates(type) {
        const updates = [
            { team: '大学A', action: '向顶级新秀发出邀请', time: '2天前' },
            { team: '大学B', action: '成功签约潜力球员', time: '3天前' },
            { team: '大学C', action: '正在与明星球员谈判', time: '1天前' }
        ];

        return updates.map(update => `
            <div class="competitor-update">
                <span class="team-name">${update.team}</span>
                <span class="action">${update.action}</span>
                <span class="time">${update.time}</span>
            </div>
        `).join('');
    }

    renderRiskAssessment(type) {
        const negotiations = type === 'player' ? this.playerNegotiations : this.coachNegotiations;

        return `
            <div class="risk-assessment-section">
                <div class="assessment-header">
                    <h3>谈判风险评估</h3>
                    <p>全面评估谈判风险，制定应对策略</p>
                </div>

                <div class="risk-overview">
                    <div class="risk-summary">
                        <div class="risk-stat low">
                            <span class="count">${negotiations.filter(n => this.calculateNegotiationRisk(n).level === 'low').length}</span>
                            <span class="label">低风险</span>
                        </div>
                        <div class="risk-stat medium">
                            <span class="count">${negotiations.filter(n => this.calculateNegotiationRisk(n).level === 'medium').length}</span>
                            <span class="label">中风险</span>
                        </div>
                        <div class="risk-stat high">
                            <span class="count">${negotiations.filter(n => this.calculateNegotiationRisk(n).level === 'high').length}</span>
                            <span class="label">高风险</span>
                        </div>
                    </div>
                </div>

                <div class="risk-recommendations">
                    <h4>风险应对建议</h4>
                    ${this.generateRiskRecommendations(negotiations)}
                </div>
            </div>
        `;
    }

    generateRiskRecommendations(negotiations) {
        if (negotiations.length === 0) {
            return '<p>暂无谈判数据</p>';
        }

        return negotiations.map(neg => {
            const risk = this.calculateNegotiationRisk(neg);
            return `
                <div class="recommendation-card ${risk.level}">
                    <h5>${neg.targetName}</h5>
                    <p class="risk-level">风险等级: <span style="color: ${this.riskLevels[risk.level].color}">${this.riskLevels[risk.level].name}</span></p>
                    <p class="recommendation">${risk.recommendation}</p>
                </div>
            `;
        }).join('');
    }

    renderNegotiationHistory(type) {
        const history = this.negotiationHistory
            .filter(h => h.type === type)
            .slice(-20)
            .reverse();

        if (history.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📜</div>
                    <h3>暂无谈判历史</h3>
                    <p>开始谈判后将显示历史记录</p>
                </div>
            `;
        }

        return `
            <div class="negotiation-history-list">
                ${history.map(entry => `
                    <div class="history-entry ${entry.status}">
                        <div class="entry-header">
                            <span class="target-name">${entry.targetName}</span>
                            <span class="entry-date">${new Date(entry.endedAt).toLocaleDateString()}</span>
                        </div>
                        <div class="entry-details">
                            <span class="status-badge ${entry.status}">${this.getStatusText(entry.status)}</span>
                            <span class="rounds">${entry.rounds}轮谈判</span>
                            <span class="cost">${entry.finalCost}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ==================== 谈判核心功能 ====================

    startNegotiation(targetId, type, strategy = 'balanced') {
        const state = this.gameStateManager.getState();
        const targetPool = type === 'player'
            ? state.availablePlayers || []
            : state.availableCoaches || [];

        const target = targetPool.find(t => t.id === targetId);
        if (!target) {
            this.showNotification('找不到目标', 'error');
            return null;
        }

        const existingNeg = this.getActiveNegotiation(targetId, type);
        if (existingNeg) {
            this.showNotification('谈判已在进行中', 'warning');
            return existingNeg;
        }

        const strategyConfig = this.negotiationStrategies[strategy];
        const initialOffer = this.calculateInitialOffer(target, type, strategy);

        let targetRating, targetPotential;
        if (type === 'player') {
            targetRating = target.getOverallRating ? target.getOverallRating() : (target.rating || 70);
            targetPotential = target.potential || 70;
        } else {
            targetRating = target.overallRating || 70;
            targetPotential = null;
        }

        const negotiation = {
            id: this.generateNegotiationId(),
            targetId: targetId,
            targetName: target.name,
            targetType: type,
            targetRating: targetRating,
            targetPotential: targetPotential,
            targetPosition: type === 'player' ? target.position : null,
            targetYear: type === 'player' ? target.year : null,
            targetArchetype: type === 'player' ? null : target.archetype,

            strategy: strategy,
            status: 'active',
            round: 0,
            maxRounds: 5,

            offer: initialOffer,
            targetNeeds: this.analyzeTargetNeeds(target, type),
            competitorThreat: this.assessCompetitorThreat(targetId, type),

            acceptanceProbability: this.calculateInitialProbability(target, initialOffer, type),
            riskLevel: this.calculateNegotiationRisk({ ...negotiation, offer: initialOffer }),

            startedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            history: [{
                round: 0,
                action: 'started',
                offer: { ...initialOffer },
                note: `使用${strategyConfig.name}开始谈判`
            }]
        };

        if (type === 'player') {
            this.playerNegotiations.push(negotiation);
        } else {
            this.coachNegotiations.push(negotiation);
        }

        this.researchTarget(targetId, type);
        this.saveNegotiationState();

        this.showNotification(`已向 ${target.name} 发起谈判`, 'success');
        return negotiation;
    }

    researchTarget(targetId, type) {
        const state = this.gameStateManager.getState();
        const targetPool = type === 'player'
            ? state.availablePlayers || []
            : state.availableCoaches || [];

        const target = targetPool.find(t => t.id === targetId);
        if (!target) return;

        const research = {
            priority: this.determinePriority(target),
            needs: this.analyzeTargetNeeds(target, type),
            strengths: this.identifyStrengths(target),
            weaknesses: this.identifyWeaknesses(target),
            marketValue: this.estimateMarketValue(target, type),
            competitorInterest: this.assessCompetitorInterest(target, type),
            optimalOffer: this.calculateOptimalOffer(target, type),
            researchedAt: new Date().toISOString()
        };

        this.targetResearch[`${type}_${targetId}`] = research;
        this.saveNegotiationState();
    }

    makeCounterOffer(negotiationId, type, modifiedOffer) {
        const negotiations = type === 'player' ? this.playerNegotiations : this.coachNegotiations;
        const negotiation = negotiations.find(n => n.id === negotiationId);

        if (!negotiation || negotiation.status !== 'active') {
            this.showNotification('谈判已结束', 'error');
            return null;
        }

        negotiation.round++;
        negotiation.lastUpdated = new Date().toISOString();
        negotiation.offer = { ...modifiedOffer };

        const response = this.generateNegotiationResponse(negotiation, type);

        if (response.accepted) {
            negotiation.status = 'accepted';
            negotiation.playerResponse = response;
            this.completeNegotiation(negotiation, type);
            this.showNotification(`🎉 签约成功！${negotiation.targetName} 已加入球队！`, 'success');
            
            // 关闭弹窗
            this.closeNegotiationModal();
            
            // 刷新招募界面
            this.refreshRecruitmentInterface();
        } else {
            negotiation.status = 'counter';
            negotiation.playerResponse = response;

            if (negotiation.round >= negotiation.maxRounds) {
                negotiation.status = 'failed';
                this.showNotification(`谈判失败：${negotiation.targetName} 选择了其他球队`, 'error');
            } else {
                this.showNotification('球员提出了还价条件', 'warning');
            }
        }

        negotiation.history.push({
            round: negotiation.round,
            action: response.accepted ? 'accepted' : 'countered',
            offer: { ...modifiedOffer },
            response: response,
            timestamp: new Date().toISOString()
        });

        this.saveNegotiationState();
        return negotiation;
    }

    generateNegotiationResponse(negotiation, type) {
        const targetNeeds = negotiation.targetNeeds;
        const currentOffer = negotiation.offer;
        const probability = negotiation.acceptanceProbability;

        const roll = Math.random() * 100;

        if (roll < probability * 0.8) {
            return {
                accepted: true,
                message: this.getAcceptanceMessage(negotiation.targetName),
                conditions: { ...currentOffer }
            };
        }

        const counterOffer = {
            scholarship: type === 'player'
                ? Math.min(1, currentOffer.scholarship + (Math.random() * 0.15))
                : currentOffer.salary * (1 + Math.random() * 0.2),
            playingTime: currentOffer.playingTime || 25,
            salary: currentOffer.salary || 500000,
            bonus: currentOffer.bonus || 50000
        };

        const reasons = [
            '希望获得更高的出场时间保障',
            '对球队发展前景有疑虑',
            '需要更多奖学金支持',
            '家庭原因需要考虑其他因素',
            '希望获得主力位置的承诺'
        ];

        return {
            accepted: false,
            message: reasons[Math.floor(Math.random() * reasons.length)],
            counterOffer: counterOffer
        };
    }

    completeNegotiation(negotiation, type) {
        const state = this.gameStateManager.getState();

        if (type === 'player') {
            const playerIndex = state.availablePlayers.findIndex(p => p.id === negotiation.targetId);
            if (playerIndex > -1) {
                const player = state.availablePlayers[playerIndex];
                // 设置球员的奖学金比例（如0.2表示20%）
                player.scholarship = negotiation.offer.scholarship;
                player.playingTimeGuarantee = negotiation.offer.playingTime;

                state.availablePlayers.splice(playerIndex, 1);

                if (state.userTeam) {
                    state.userTeam.addPlayer(player);
                    
                    // 触发奖学金显示更新
                    if (this.dataSyncManager) {
                        this.dataSyncManager.publishSyncEvent('scholarshipUpdated', {
                            teamId: state.userTeam.id,
                            playerId: player.id,
                            scholarshipPercent: player.scholarship,
                            timestamp: Date.now()
                        });
                    }
                }
            }
        } else {
            const coachIndex = state.availableCoaches.findIndex(c => c.id === negotiation.targetId);
            if (coachIndex > -1) {
                const coach = state.availableCoaches[coachIndex];
                coach.salary = negotiation.offer.salary;
                coach.bonus = negotiation.offer.bonus || 0;

                state.availableCoaches.splice(coachIndex, 1);
                state.userCoach = coach;
            }
        }

        this.negotiationHistory.push({
            id: negotiation.id,
            type: negotiation.targetType,
            targetId: negotiation.targetId,
            targetName: negotiation.targetName,
            status: 'accepted',
            rounds: negotiation.round,
            finalCost: type === 'player'
                ? `${Math.round(negotiation.offer.scholarship * 100)}%`
                : `$${this.formatCurrency(negotiation.offer.salary)}`,
            startedAt: negotiation.startedAt,
            endedAt: new Date().toISOString()
        });

        this.playerNegotiations = this.playerNegotiations.filter(n => n.id !== negotiation.id);
        this.coachNegotiations = this.coachNegotiations.filter(n => n.id !== negotiation.id);

        this.saveNegotiationState();
    }

    withdrawNegotiation(negotiationId, type) {
        const negotiations = type === 'player' ? this.playerNegotiations : this.coachNegotiations;
        const negotiation = negotiations.find(n => n.id === negotiationId);

        if (!negotiation) return false;

        this.negotiationHistory.push({
            id: negotiation.id,
            type: type,
            targetId: negotiation.targetId,
            targetName: negotiation.targetName,
            status: 'withdrawn',
            rounds: negotiation.round,
            finalCost: 'N/A',
            startedAt: negotiation.startedAt,
            endedAt: new Date().toISOString()
        });

        if (type === 'player') {
            this.playerNegotiations = this.playerNegotiations.filter(n => n.id !== negotiationId);
        } else {
            this.coachNegotiations = this.coachNegotiations.filter(n => n.id !== negotiationId);
        }

        this.saveNegotiationState();
        this.showNotification('已退出谈判', 'info');
        return true;
    }

    // ==================== 辅助功能 ====================

    calculateInitialOffer(target, type, strategy) {
        const strategyConfig = this.negotiationStrategies[strategy];
        if (!strategyConfig) {
            console.error('Strategy not found:', strategy);
            strategy = 'balanced';
        }
        
        const config = this.negotiationStrategies[strategy];
        const baseValue = type === 'player'
            ? (target.getOverallRating ? target.getOverallRating() : (target.rating || 70)) / 100
            : ((target.overallRating || 70) / 1000000);

        const scholarship = Math.max(0.1, Math.min(1, baseValue + (config.baseBonus || 0)));
        const playingTime = type === 'player' ? Math.round(20 + Math.random() * 15) : null;
        const salary = type === 'player' ? null : Math.round(300000 + baseValue * 700000);

        return {
            scholarship: Math.round(scholarship * 100) / 100,
            playingTime: playingTime,
            salary: salary,
            bonus: type === 'coach' ? Math.round(salary * 0.1) : null
        };
    }

    calculateInitialProbability(target, offer, type) {
        let probability = 50;

        if (type === 'player') {
            probability += (offer.scholarship - 0.5) * 40;
            probability += (offer.playingTime - 20) * 0.5;

            const signingDifficulty = target.signingDifficulty || 0.5;
            probability -= signingDifficulty * 30;

            if (target.potential >= 80) probability -= 10;
            if (target.year === 4) probability -= 5;
        } else {
            const marketRate = 500000;
            probability += ((offer.salary - marketRate) / marketRate) * 20;
        }

        probability = Math.max(10, Math.min(95, probability));
        return Math.round(probability);
    }

    analyzeTargetNeeds(target, type) {
        const needs = [];

        if (type === 'player') {
            const potential = target.potential || 70;
            const year = target.year || 2;
            
            if (potential >= 80) needs.push('高潜力球员希望加入有竞争力的球队');
            if (year === 4) needs.push('高年级球员希望获得更多出场时间');
            if (potential < 60) needs.push('球员更看重奖学金金额');
            needs.push('希望获得主力位置');
        } else {
            needs.push('期望合理的薪酬待遇');
            needs.push('希望有足够的执教权限');
            needs.push('关注球队发展前景');
        }

        return needs;
    }

    assessCompetitorThreat(targetId, type) {
        return {
            level: Math.random() < 0.3 ? 'high' : Math.random() < 0.5 ? 'medium' : 'low',
            competingTeams: Math.floor(Math.random() * 5) + 1,
            lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        };
    }

    determinePriority(target) {
        const rating = target.getOverallRating ? target.getOverallRating() : (target.overallRating || 70);
        const potential = target.potential || 70;

        if (rating >= 80 || potential >= 85) return 'high';
        if (rating >= 65 || potential >= 75) return 'medium';
        return 'low';
    }

    identifyStrengths(target) {
        return ['技术全面', '比赛态度积极', '有领导力'];
    }

    identifyWeaknesses(target) {
        return ['经验不足', '需要提升体能', '心理素质待加强'];
    }

    estimateMarketValue(target, type) {
        if (type === 'player') {
            const rating = target.getOverallRating();
            return `${Math.round(rating * 0.8)}% - ${Math.round(rating * 1.2)}%`;
        } else {
            const rating = target.overallRating || 70;
            return `$${this.formatCurrency(rating * 8000)} - $${this.formatCurrency(rating * 12000)}`;
        }
    }

    calculateOptimalOffer(target, type) {
        const marketValue = this.estimateMarketValue(target, type);
        return type === 'player'
            ? { scholarship: 0.75, playingTime: 25 }
            : { salary: 750000, bonus: 75000 };
    }

    assessCompetitorInterest(target, type) {
        return {
            interestedTeams: Math.floor(Math.random() * 10) + 1,
            topCompetitors: ['大学A', '大学B', '大学C'].slice(0, Math.floor(Math.random() * 3) + 1),
            averageOffer: type === 'player' ? '70%' : '$700,000'
        };
    }

    getActiveNegotiation(targetId, type) {
        const negotiations = type === 'player' ? this.playerNegotiations : this.coachNegotiations;
        return negotiations.find(n => n.targetId === targetId && n.status === 'active');
    }

    calculateNegotiationRisk(negotiation) {
        const probability = negotiation.acceptanceProbability || 50;
        const roundsUsed = negotiation.round || 0;
        const maxRounds = negotiation.maxRounds || 5;
        const threatLevel = negotiation.competitorThreat?.level || 'medium';

        let riskScore = 0;

        if (probability < 40) riskScore += 40;
        else if (probability < 60) riskScore += 20;
        else if (probability < 80) riskScore += 5;

        if (roundsUsed > maxRounds * 0.6) riskScore += 15;

        if (threatLevel === 'high') riskScore += 20;
        else if (threatLevel === 'medium') riskScore += 10;

        let level, recommendation;
        if (riskScore >= 50) {
            level = 'high';
            recommendation = '建议提高报价或考虑替代目标';
        } else if (riskScore >= 25) {
            level = 'medium';
            recommendation = '保持当前策略，注意对手动态';
        } else {
            level = 'low';
            recommendation = '谈判顺利，可适时达成协议';
        }

        return { level, score: riskScore, recommendation };
    }

    getStatusText(status) {
        const statusMap = {
            'active': '进行中',
            'counter': '还价中',
            'accepted': '已签约',
            'failed': '失败',
            'withdrawn': '已退出'
        };
        return statusMap[status] || status;
    }

    getPriorityName(priority) {
        const names = { high: '高', medium: '中', low: '低' };
        return names[priority] || priority;
    }

    getYearName(year) {
        const names = { 1: '大一', 2: '大二', 3: '大三', 4: '大四' };
        return names[year] || `年级${year}`;
    }

    getAcceptanceMessage(name) {
        const messages = [
            `很高兴能加入球队！我已经迫不及待想要开始训练了。`,
            `感谢球队给我这个机会，我一定不会辜负大家的期望。`,
            `我接受这份合同，让我们一起为球队创造辉煌！`,
            `期待与队友们合作，我们会是一支伟大的队伍。`
        ];
        return `${name}表示：${messages[Math.floor(Math.random() * messages.length)]}`;
    }

    formatCurrency(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(0) + 'K';
        }
        return amount.toString();
    }

    generateNegotiationId() {
        return 'neg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    showNotification(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    setupNegotiationCenterEvents(type) {
        document.querySelectorAll('.negotiation-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;

                document.querySelectorAll('.negotiation-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

                e.target.classList.add('active');
                document.getElementById(tabId)?.classList.add('active');
            });
        });

        document.querySelectorAll('.start-negotiation').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.target.dataset.id;
                const targetType = e.target.dataset.type;
                this.startNegotiation(targetId, targetType, 'balanced');
                this.showNegotiationCenter(targetType);
            });
        });

        document.querySelectorAll('.improve-offer').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const negotiationId = e.target.dataset.id;
                const targetType = e.target.dataset.type;
                this.improveOffer(negotiationId, targetType);
            });
        });

        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const negotiationId = e.target.dataset.id;
                const targetType = e.target.dataset.type;
                this.viewNegotiationDetails(negotiationId, targetType);
            });
        });

        document.querySelectorAll('.withdraw').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const negotiationId = e.target.dataset.id;
                const targetType = e.target.dataset.type;
                this.withdrawNegotiation(negotiationId, targetType);
                this.showNegotiationCenter(targetType);
            });
        });

        document.querySelectorAll('.select-strategy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const strategy = e.target.dataset.strategy;
                const targetType = e.target.dataset.type;
                this.showNotification(`已选择${this.negotiationStrategies[strategy].name}`, 'success');
            });
        });
    }

    // ==================== 跳过规则集成方法 ====================

    generateInitialOffer(target, type, strategy) {
        if (this.skipRuleManager) {
            const offer = this.skipRuleManager.generateInitialOffer(target, strategy);
            if (offer) {
                console.log(`[报价模式] 使用${this.skipRuleManager.getQuoteModeName()}`);
                return offer;
            }
        }

        const strategyConfig = this.negotiationStrategies[strategy];
        if (!strategyConfig) {
            console.error('Strategy not found:', strategy);
            strategy = 'balanced';
        }
        
        const config = this.negotiationStrategies[strategy];
        const baseValue = type === 'player'
            ? (target.getOverallRating ? target.getOverallRating() : (target.rating || 70)) / 100
            : ((target.overallRating || 70) / 1000000);

        const scholarship = Math.max(0.1, Math.min(1, baseValue + (config.baseBonus || 0)));
        const playingTime = type === 'player' ? Math.round(20 + Math.random() * 15) : null;
        const salary = type === 'player' ? null : Math.round(300000 + baseValue * 700000);

        return {
            scholarship: Math.round(scholarship * 100) / 100,
            playingTime: playingTime,
            salary: salary,
            bonus: type === 'coach' ? Math.round(salary * 0.1) : null
        };
    }

    getSkipStatus() {
        if (!this.skipRuleManager) {
            return { isEnabled: false, reason: '跳过规则管理器未加载' };
        }
        return this.skipRuleManager.getSkipStatus();
    }

    skipNegotiation(negotiationId, type) {
        if (!this.skipRuleManager) {
            this.showNotification('跳过功能不可用', 'error');
            return { success: false, message: '跳过规则管理器未加载' };
        }

        const negotiations = type === 'player' ? this.playerNegotiations : this.coachNegotiations;
        const negotiation = negotiations.find(n => n.id === negotiationId);
        
        if (!negotiation) {
            return { success: false, message: '未找到谈判' };
        }

        const result = this.skipRuleManager.skipNegotiation(negotiation.targetId, type);
        
        if (result.success) {
            negotiation.skipped = true;
            negotiation.skippedAt = new Date().toISOString();
            this.saveNegotiationState();
            
            this.showNotification(`已跳过与 ${negotiation.targetName} 的谈判`, 'info');
        } else {
            this.showNotification(result.message, 'warning');
        }
        
        return result;
    }

    probeMinimumScholarship(negotiationId, type) {
        if (!this.skipRuleManager) {
            return { success: false, message: '试探功能不可用' };
        }

        const negotiations = type === 'player' ? this.playerNegotiations : this.coachNegotiations;
        const negotiation = negotiations.find(n => n.id === negotiationId);
        
        if (!negotiation) {
            return { success: false, message: '未找到谈判' };
        }

        const result = this.skipRuleManager.probeMinimumScholarship(negotiation.targetId, type);
        
        if (result.success) {
            negotiation.probeResult = result;
            negotiation.probedAt = new Date().toISOString();
            this.saveNegotiationState();
            
            this.showNotification(result.message, 'success');
        }
        
        return result;
    }

    adjustOfferWithProbeResult(negotiationId, type) {
        const negotiations = type === 'player' ? this.playerNegotiations : this.coachNegotiations;
        const negotiation = negotiations.find(n => n.id === negotiationId);
        
        if (!negotiation || !negotiation.probeResult) {
            return null;
        }

        if (this.skipRuleManager) {
            return this.skipRuleManager.adjustOfferBasedOnProbing(negotiation, negotiation.probeResult);
        }
        
        return negotiation.offer;
    }

    getScholarshipStats() {
        if (!this.skipRuleManager) {
            return null;
        }
        return this.skipRuleManager.getScholarshipStats();
    }

    saveActiveNegotiations() {
        if (!this.skipRuleManager) {
            return { players: 0, coaches: 0 };
        }
        return this.skipRuleManager.saveActiveNegotiations();
    }

    restoreActiveNegotiations() {
        if (!this.skipRuleManager) {
            return { restored: 0 };
        }
        return this.skipRuleManager.restoreActiveNegotiations();
    }

    inheritScholarshipBalance() {
        if (!this.skipRuleManager) {
            return { inherited: 0, message: '奖学金管理器未加载' };
        }
        return this.skipRuleManager.inheritScholarshipBalance();
    }

    applyInheritedScholarship() {
        if (!this.skipRuleManager) {
            return { applied: 0, message: '奖学金管理器未加载' };
        }
        return this.skipRuleManager.applyInheritedBalance();
    }

    checkPlayerSignedByOther(targetId, targetName) {
        if (!this.skipRuleManager) {
            return { processed: false };
        }
        
        const result = this.skipRuleManager.checkPlayerSignedByOther(targetId, targetName);
        
        if (result.processed) {
            const playerNeg = this.playerNegotiations.findIndex(n => n.targetId === targetId);
            if (playerNeg !== -1) {
                this.playerNegotiations[playerNeg].status = 'expired';
                this.playerNegotiations[playerNeg].expiredReason = '被其他球队签走';
                this.playerNegotiations[playerNeg].expiredAt = new Date().toISOString();
                this.saveNegotiationState();
            }
            
            if (!result.skipEnabled) {
                this.showNotification(`跳过功能已禁用: ${result.reason}`, 'warning');
            }
        }
        
        return result;
    }

    setSkipRuleManager(skipRuleManager) {
        this.skipRuleManager = skipRuleManager;
        console.log('[谈判系统] 跳过规则管理器已连接');
    }

    closeNegotiationModal() {
        const modal = document.getElementById('player-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    refreshRecruitmentInterface() {
        if (typeof window.recruitmentInterface !== 'undefined') {  
            window.recruitmentInterface.loadPlayers();
            window.recruitmentInterface.renderPlayerCards();       
            window.recruitmentInterface.renderNegotiationList();   
            window.recruitmentInterface.updateAllTabCounts();      
        }
    }

    // 提升报价方法
    improveOffer(negotiationId, type) {
        const negotiation = this.getNegotiationById(negotiationId, type);
        if (!negotiation) {
            this.showNotification('谈判不存在', 'error');
            return;
        }

        // 根据当前报价和球员偏好增加报价
        const increment = type === 'player' ? 0.05 : 25000; // 球员奖学金增加5%，教练薪水增加25000
        
        if (type === 'player') {
            // 检查是否有足够的奖学金额度
            const state = this.gameStateManager.getState();
            if (!state.userTeam) {
                this.showNotification('球队信息不可用', 'error');
                return;
            }
            
            const availableScholarshipShare = state.userTeam.getAvailableScholarshipShare ? state.userTeam.getAvailableScholarshipShare() : 0;
            
            if (negotiation.offer.scholarship < 1.0) {
                const newScholarship = Math.min(1.0, negotiation.offer.scholarship + 0.05);
                const scholarshipIncrease = newScholarship - negotiation.offer.scholarship;
                
                if (scholarshipIncrease <= availableScholarshipShare) {
                    negotiation.offer.scholarship = newScholarship;
                    negotiation.round++;
                    
                    // 更新接受概率
                    negotiation.acceptanceProbability = Math.min(95, negotiation.acceptanceProbability + 8);
                    
                    this.updateNegotiationInState(negotiation, type);
                    this.showNotification(`报价已提升至 ${Math.round(negotiation.offer.scholarship * 100)}%`, 'success');
                    
                    // 触发数据同步
                    if (this.dataSyncManager) {
                        this.dataSyncManager.publishSyncEvent('contractUpdated', {
                            playerId: negotiation.targetId,
                            scholarshipPercent: negotiation.offer.scholarship,
                            timestamp: Date.now()
                        });
                    }
                } else {
                    this.showNotification(`奖学金份额不足 (需要 ${scholarshipIncrease.toFixed(2)}，可用 ${availableScholarshipShare.toFixed(2)})`, 'error');
                }
            } else {
                this.showNotification('奖学金已达上限', 'warning');
            }
        } else {
            // 教练薪水提升
            negotiation.offer.salary += increment;
            negotiation.round++;
            
            // 更新接受概率
            negotiation.acceptanceProbability = Math.min(95, negotiation.acceptanceProbability + 5);
            
            this.updateNegotiationInState(negotiation, type);
            this.showNotification(`薪水已提升至 $${this.formatCurrency(negotiation.offer.salary)}`, 'success');
        }

        // 重新显示谈判中心以更新UI
        this.showNegotiationCenter(type);
    }

    // 查看谈判详情方法
    viewNegotiationDetails(negotiationId, type) {
        const negotiation = this.getNegotiationById(negotiationId, type);
        if (!negotiation) {
            this.showNotification('谈判不存在', 'error');
            return;
        }

        // 显示谈判详情弹窗
        this.showNegotiationDetailsModal(negotiation, type);
    }

    // 显示谈判详情弹窗
    showNegotiationDetailsModal(negotiation, type) {
        const modal = document.createElement('div');
        modal.className = 'negotiation-details-modal';
        modal.id = 'negotiation-details-modal';
        modal.innerHTML = `
            <div class="negotiation-details-content">
                <div class="modal-header">
                    <h3>${negotiation.targetName} 谈判详情</h3>
                    <button class="close-btn" onclick="document.getElementById('negotiation-details-modal').remove()">×</button>
                </div>
                
                <div class="details-body">
                    <div class="detail-section">
                        <h4>球员信息</h4>
                        <div class="detail-row">
                            <span class="label">位置:</span>
                            <span>${negotiation.targetPosition || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">年级:</span>
                            <span>${this.getYearName(negotiation.targetYear) || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">能力值:</span>
                            <span>${negotiation.targetRating}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">潜力:</span>
                            <span>${negotiation.targetPotential || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>当前报价</h4>
                        <div class="detail-row">
                            <span class="label">${type === 'player' ? '奖学金:' : '薪水:'}</span>
                            <span>${type === 'player' 
                                ? `${Math.round(negotiation.offer.scholarship * 100)}%` 
                                : `$${this.formatCurrency(negotiation.offer.salary)}`}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">出场时间:</span>
                            <span>${negotiation.offer.playingTime || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">奖金:</span>
                            <span>${negotiation.offer.bonus ? `$${this.formatCurrency(negotiation.offer.bonus)}` : 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>谈判状态</h4>
                        <div class="detail-row">
                            <span class="label">轮次:</span>
                            <span>${negotiation.round}/${negotiation.maxRounds}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">成功率:</span>
                            <span class="probability">${negotiation.acceptanceProbability}%</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">状态:</span>
                            <span class="status-${negotiation.status}">${this.getStatusText(negotiation.status)}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>球员偏好</h4>
                        <div class="preferences-list">
                            ${Object.entries(this.playerPriorities).map(([key, priority]) => `
                                <div class="preference-item">
                                    <span class="preference-name">${priority.name}</span>
                                    <div class="preference-bar">
                                        <div class="preference-fill" style="width: ${(negotiation.preferences?.[key] || 0) * 100}%"></div>
                                    </div>
                                    <span class="preference-value">${Math.round((negotiation.preferences?.[key] || 0) * 100)}%</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="action-btn primary" onclick="document.getElementById('negotiation-details-modal').remove()">关闭</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // 根据ID获取谈判对象
    getNegotiationById(negotiationId, type) {
        const negotiations = type === 'player' ? this.playerNegotiations : this.coachNegotiations;
        return negotiations.find(n => n.id === negotiationId);
    }

    // 更新谈判状态到游戏状态
    updateNegotiationInState(negotiation, type) {
        const negotiations = type === 'player' ? this.playerNegotiations : this.coachNegotiations;
        const index = negotiations.findIndex(n => n.id === negotiation.id);
        
        if (index !== -1) {
            negotiations[index] = { ...negotiation };
            this.saveNegotiationState();
        }
    }
}

if (typeof window !== 'undefined') {
    window.EnhancedNegotiationManager = EnhancedNegotiationManager;
}
