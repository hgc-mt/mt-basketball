/**
 * 球员招募界面控制器
 * 管理球员招募界面的所有交互功能
 */

class RecruitmentInterface {
    constructor(gameStateManager, gameInitializer) {
        this.gameStateManager = gameStateManager;
        this.gameInitializer = gameInitializer;
        
        this.favorites = new Set();
        this.filters = {
            position: 'all',
            year: 'all',
            potentialMin: 50,
            potentialMax: 99,
            rating: 'all',
            search: '',
            showFavorites: false,
            status: 'all'
        };
        
        this.pendingFilters = {
            position: 'all',
            year: 'all',
            potentialMin: 50,
            potentialMax: 99,
            rating: 'all',
            search: '',
            showFavorites: false,
            status: 'all'
        };
        
        this.players = [];
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        this.loadFavorites();
        this.loadPlayers();
        
        console.log('RecruitmentInterface initialize:', {
            playersLoaded: this.players.length,
            samplePlayer: this.players[0] ? { id: this.players[0].id, name: this.players[0].name } : 'none'
        });
        
        this.setupEventListeners();
        this.renderAll();
        
        this.isInitialized = true;
        console.log('Recruitment Interface initialized');
    }

    loadFavorites() {
        const saved = localStorage.getItem('playerFavorites');
        if (saved) {
            try {
                this.favorites = new Set(JSON.parse(saved));
            } catch (e) {
                this.favorites = new Set();
            }
        }
    }

    saveFavorites() {
        localStorage.setItem('playerFavorites', JSON.stringify([...this.favorites]));
    }

    loadPlayers() {
        const state = this.gameStateManager.getState();
        this.players = state.availablePlayers || [];
    }

    savePlayers() {
        this.gameStateManager.set('availablePlayers', this.players);
        this.gameStateManager.saveGameState();
    }

    setupEventListeners() {
        // 位置筛选
        document.querySelectorAll('#position-filter-group .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter('position', e.target.dataset.value);
                this.updateActiveButton('#position-filter-group', e.target);
                this.applyFilters();
            });
        });

        // 球员类型筛选
        document.querySelectorAll('#status-filter-group .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter('status', e.target.dataset.value);
                this.updateActiveButton('#status-filter-group', e.target);
                this.applyFilters();
            });
        });

        // 年级筛选
        document.querySelectorAll('#year-filter-group .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter('year', e.target.dataset.value);
                this.updateActiveButton('#year-filter-group', e.target);
                this.applyFilters();
            });
        });

        // 战力筛选
        document.querySelectorAll('#rating-filter-group .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter('rating', e.target.dataset.value);
                this.updateActiveButton('#rating-filter-group', e.target);
                this.applyFilters();
            });
        });

        // 潜力值滑块
        const potentialMin = document.getElementById('potential-min');
        const potentialMax = document.getElementById('potential-max');
        
        if (potentialMin && potentialMax) {
            potentialMin.addEventListener('input', (e) => {
                let min = parseInt(e.target.value);
                let max = parseInt(potentialMax.value);
                if (min > max) {
                    min = max;
                    e.target.value = min;
                }
                this.pendingFilters.potentialMin = min;
                this.updatePotentialDisplay();
            });

            potentialMax.addEventListener('input', (e) => {
                let max = parseInt(e.target.value);
                let min = parseInt(potentialMin.value);
                if (max < min) {
                    max = min;
                    e.target.value = max;
                }
                this.pendingFilters.potentialMax = max;
                this.updatePotentialDisplay();
            });
        }

        // 搜索框
        const searchInput = document.getElementById('player-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.pendingFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // 显示选项
        const showFavorites = document.getElementById('show-favorites');
        if (showFavorites) {
            showFavorites.addEventListener('change', (e) => {
                this.pendingFilters.showFavorites = e.target.checked;
                this.applyFilters();
            });
        }

        // 应用筛选按钮
        const applyBtn = document.getElementById('apply-filters');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }

        // 重置筛选按钮
        const resetBtn = document.getElementById('reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // 弹窗关闭
        const modal = document.getElementById('player-modal');
        if (modal) {
            const closeBtn = modal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.style.display = 'none';
                });
            }
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }

    setFilter(key, value) {
        this.pendingFilters[key] = value;
        
        if (key === 'potentialMin' || key === 'potentialMax') {
            this.updatePotentialDisplay();
        }
    }

    applyFilters() {
        // 深拷贝pendingFilters到filters，确保所有字段都被正确同步
        this.filters = JSON.parse(JSON.stringify(this.pendingFilters));
        this.renderAll();
        this.updateButtonStates();
    }

    resetFilters() {
        this.pendingFilters = {
            position: 'all',
            year: 'all',
            potentialMin: 50,
            potentialMax: 99,
            rating: 'all',
            search: '',
            showFavorites: false,
            status: 'all'
        };
        
        this.syncUIWithFilters();
        this.renderAll();
    }

    syncUIWithFilters() {
        document.querySelectorAll('#position-filter-group .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === this.pendingFilters.position);
        });
        
        document.querySelectorAll('#status-filter-group .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === this.pendingFilters.status);
        });
        
        document.querySelectorAll('#year-filter-group .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === this.pendingFilters.year);
        });
        
        document.querySelectorAll('#rating-filter-group .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === this.pendingFilters.rating);
        });
        
        const potentialMin = document.getElementById('potential-min');
        const potentialMax = document.getElementById('potential-max');
        if (potentialMin) potentialMin.value = this.pendingFilters.potentialMin;
        if (potentialMax) potentialMax.value = this.pendingFilters.potentialMax;
        this.updatePotentialDisplay();
        
        const searchInput = document.getElementById('player-search');
        if (searchInput) searchInput.value = this.pendingFilters.search;
        
        const showFavorites = document.getElementById('show-favorites');
        if (showFavorites) showFavorites.checked = this.pendingFilters.showFavorites;
    }

    updateButtonStates() {
        const applyBtn = document.getElementById('apply-filters');
        if (applyBtn) {
            const hasChanges = JSON.stringify(this.filters) !== JSON.stringify(this.pendingFilters);
            applyBtn.classList.toggle('has-changes', hasChanges);
        }
    }

    updateActiveButton(groupSelector, activeBtn) {
        document.querySelectorAll(`${groupSelector} .filter-btn`).forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    updatePotentialDisplay() {
        const display = document.getElementById('potential-range-display');
        if (display) {
            display.textContent = `${this.pendingFilters.potentialMin}-${this.pendingFilters.potentialMax}`;
        }
    }

    getFilteredPlayers() {
        return this.players.filter(player => {
            // 位置筛选
            if (this.filters.position !== 'all' && player.position !== this.filters.position) {
                return false;
            }

            // 球员类型筛选
            if (this.filters.status !== 'all' && player.status !== this.filters.status) {
                return false;
            }

            // 年级筛选
            if (this.filters.year !== 'all' && player.year !== parseInt(this.filters.year)) {
                return false;
            }

            // 潜力值筛选
            if (player.potential < this.filters.potentialMin || player.potential > this.filters.potentialMax) {
                return false;
            }

            // 战力筛选
            const rating = player.rating || player.getOverallRating();
            if (this.filters.rating !== 'all') {
                const thresholds = {
                    'star': 80, 'starter': 70, 'rotation': 60, 'bench': 50
                };
                if (rating < thresholds[this.filters.rating]) {
                    return false;
                }
            }

            // 搜索
            if (this.filters.search && !player.name.toLowerCase().includes(this.filters.search)) {
                return false;
            }

            // 收藏筛选
            if (this.filters.showFavorites && !this.favorites.has(player.id)) {
                return false;
            }

            return true;
        });
    }

    renderAll() {
        this.renderStats();
        this.renderDistribution();
        this.renderPlayerCards();
        this.updateAllTabCounts();
    }

    renderStats() {
        const availableCount = document.getElementById('available-count');
        const scholarshipRemaining = document.getElementById('scholarship-remaining');
        const activeNegotiations = document.getElementById('active-negotiations');
        const freshmanCount = document.getElementById('freshman-count');
        const freeAgentCount = document.getElementById('free-agent-count');
        const transferCount = document.getElementById('transfer-count');

        if (availableCount) {
            availableCount.textContent = this.players.length;
        }
        
        // 使用预计算的统计数据而不是每次都filter
        if (freshmanCount || freeAgentCount || transferCount) {
            if (!this.playerStatsCache) {
                this.calculatePlayerStats();
            }
            if (freshmanCount) freshmanCount.textContent = this.playerStatsCache.freshmen;
            if (freeAgentCount) freeAgentCount.textContent = this.playerStatsCache.freeAgents;
            if (transferCount) transferCount.textContent = this.playerStatsCache.transfers;
        }

        if (scholarshipRemaining) {
            const state = this.gameStateManager.getState();
            const userTeam = state.userTeam;
            const used = userTeam?.roster?.length || 0;
            const max = 13;
            scholarshipRemaining.textContent = `${max - used}/${max}`;
        }

        if (activeNegotiations) {
            const state = this.gameStateManager.getState();
            const negotiations = state.activeNegotiations || [];
            activeNegotiations.textContent = negotiations.length;
        }
    }

    // 预计算玩家统计数据
    calculatePlayerStats() {
        if (this.playerStatsCache && this.cacheTimestamp && 
            (Date.now() - this.cacheTimestamp) < 1000) { // 1秒缓存
            return this.playerStatsCache;
        }

        const stats = { freshmen: 0, freeAgents: 0, transfers: 0 };
        
        for (const player of this.players) {
            switch (player.status) {
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
        
        this.playerStatsCache = stats;
        this.cacheTimestamp = Date.now();
        return stats;
    }

    renderDistribution() {
        const distribution = {
            elite: 0, excellent: 0, good: 0, normal: 0
        };

        const filteredPlayers = this.getFilteredPlayers();
        
        for (const player of filteredPlayers) {
            if (player.potential >= 90) distribution.elite++;
            else if (player.potential >= 80) distribution.excellent++;
            else if (player.potential >= 70) distribution.good++;
            else distribution.normal++;
        }

        const total = filteredPlayers.length || 1;

        Object.keys(distribution).forEach(level => {
            const bar = document.querySelector(`.dist-bar[data-level="${level}"]`);
            if (bar) {
                const count = distribution[level];
                const percentage = (count / total * 100).toFixed(0);
                
                bar.querySelector('.dist-fill').style.width = `${percentage}%`;
                bar.querySelector('.dist-count').textContent = count;
            }
        });
    }

    renderPlayerCards() {
        const container = document.getElementById('available-players');
        if (!container) {
            console.error('available-players container not found');
            return;
        }

        const filteredPlayers = this.getFilteredPlayers();
        
        console.log('renderPlayerCards:', {
            totalPlayers: this.players.length,
            filteredCount: filteredPlayers.length,
            filters: this.filters
        });
        
        if (filteredPlayers.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <p>没有找到符合条件的球员</p>
                    <p>请尝试调整筛选条件</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredPlayers.map(player => this.createPlayerCard(player)).join('');
        
        // 绑定事件
        this.bindCardEvents();
    }

    createPlayerCard(player) {
        const level = this.getPotentialLevel(player.potential);
        
        // 安全获取能力值
        let rating = player.rating;
        if (!rating && typeof player.getOverallRating === 'function') {
            try {
                rating = player.getOverallRating();
            } catch (e) {
                rating = 50;
            }
        }
        if (!rating || isNaN(rating)) {
            rating = 50;
        }
        
        const ratingLevel = this.getRatingLevel(rating);
        const isFavorite = this.favorites.has(player.id);
        const yearLabels = { 1: '大一', 2: '大二', 3: '大三', 4: '大四' };

        const ratingColor = this.getRatingColor(rating);
        const initials = player.name.split(' ').map(n => n[0]).join('');
        
        // 获取球员状态
        const statusLabel = player.getStatusLabel();
        const isTransfer = player.status === 'transfer_wanted';
        const isFreshman = player.status === 'freshman_recruit';
        const statusClass = isTransfer ? 'status-transfer' : (isFreshman ? 'status-freshman' : 'status-free');
        const statusIcon = isTransfer ? '🔄' : (isFreshman ? '🎓' : '🏀');
        
        // 获取技术特点
        const techInfo = player.technicalInfo || {};
        const playStyle = techInfo.playStyle || '攻守平衡';
        const bestSkill = techInfo.bestSkill || '投篮';

        return `
            <div class="player-card ${level.label} ${isFavorite ? 'is-favorite' : ''}" data-player-id="${player.id}">
                <div class="favorite-indicator">⭐</div>
                <div class="card-quick-actions">
                    <button class="quick-action-btn favorite-btn ${isFavorite ? 'favorited' : ''}" 
                        data-player-id="${player.id}" title="${isFavorite ? '取消收藏' : '收藏球员'}">
                        ${isFavorite ? '⭐' : '☆'}
                    </button>
                    <button class="quick-action-btn compare-btn" data-player-id="${player.id}" title="对比">
                        📊
                    </button>
                </div>
                
                <div class="player-status-badge ${statusClass}">
                    <span>${statusIcon}</span>
                    <span>${statusLabel}</span>
                </div>
                
                <div class="card-header">
                    <div class="player-avatar">${initials}</div>
                    <div class="player-basic-info">
                        <h3 class="player-name">${player.name}</h3>
                        <div class="player-meta">
                            <span class="meta-tag">${Positions[player.position]}</span>
                            <span class="meta-tag">${yearLabels[player.year]}</span>
                            <span class="meta-tag">${player.age}岁</span>
                        </div>
                    </div>
                </div>
                
                <div class="rating-display-center">
                    <div class="rating-center-label">能力值</div>
                    <div class="rating-center-value" style="color: ${ratingColor};">${rating}</div>
                    <div class="rating-center-level">${ratingLevel.label}</div>
                    <div class="rating-bar-horizontal">
                        <div class="rating-bar-fill" style="width: ${rating}%; background: ${ratingColor};"></div>
                    </div>
                </div>
                
                <div class="potential-side ${level.label}">
                    <div class="potential-label">潜力</div>
                    <div class="potential-value">${player.potential}</div>
                    <div class="potential-badge">
                        <span>${level.icon}</span>
                    </div>
                </div>
                
                <div class="attributes-summary">
                    <div class="attr-item">
                        <div class="attr-label">进攻</div>
                        <div class="attr-value">${player.attributes.scoring}</div>
                    </div>
                    <div class="attr-item">
                        <div class="attr-label">防守</div>
                        <div class="attr-value">${player.attributes.defense}</div>
                    </div>
                    <div class="attr-item">
                        <div class="attr-label">篮板</div>
                        <div class="attr-value">${player.attributes.rebounding}</div>
                    </div>
                </div>
                
                <div class="player-tech-info">
                    <span class="tech-tag">${playStyle}</span>
                    <span class="tech-tag">擅长: ${bestSkill}</span>
                    ${player.specialistInfo ? `
                    <span class="tech-tag specialist-tag" title="${player.specialistInfo.description}">
                        ${player.specialistInfo.icon} ${player.specialistInfo.name}
                    </span>
                    ` : ''}
                </div>
                
                ${player.status === 'transfer_wanted' ? `
                <div class="transfer-info">
                    <span>前东家: ${player.formerTeam || '未知'}</span>
                </div>
                ` : ''}
                
                <div class="card-footer">
                    <button class="action-btn btn-negotiate" data-action="negotiate" data-player-id="${player.id}">
                        ${player.status === 'freshman_recruit' ? '招募球员' : (player.status === 'transfer_wanted' ? '申请转会' : '发起谈判')}
                    </button>
                    <button class="action-btn btn-detail" data-action="detail" data-player-id="${player.id}">
                        查看详情
                    </button>
                </div>
            </div>
        `;
    }

    bindCardEvents() {
        const container = document.getElementById('available-players');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            let playerId = btn.dataset.playerId;
            const action = btn.dataset.action;
            
            // 转换 playerId 为数字类型（如果可能）
            const numericPlayerId = parseInt(playerId, 10);
            if (!isNaN(numericPlayerId)) {
                playerId = numericPlayerId;
            }
            
            // 调试日志
            console.log('Button clicked:', { playerId, action, originalId: btn.dataset.playerId });
            
            // 处理类型不匹配问题：playerId 可能是字符串，但 p.id 是数字
            const player = this.players.find(p => p.id == playerId || p.id === playerId);

            if (!player) {
                console.log('Player not found:', { 
                    playerId, 
                    numericPlayerId,
                    availableIds: this.players.slice(0, 5).map(p => ({ id: p.id, type: typeof p.id }))
                });
                this.showNotification('找不到该球员，请刷新页面重试', 'error');
                return;
            }

            if (action === 'negotiate') {
                this.openNegotiation(player);
            } else if (action === 'detail') {
                this.showPlayerDetail(player);
            }
        });

        // 收藏按钮
        container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const playerId = btn.dataset.playerId;
                this.toggleFavorite(playerId);
            });
        });

        // 对比按钮
        container.querySelectorAll('.compare-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                // TODO: 实现球员对比功能
                this.showNotification('球员对比功能开发中', 'info');
            });
        });
    }

    toggleFavorite(playerId) {
        if (this.favorites.has(playerId)) {
            this.favorites.delete(playerId);
            this.showNotification('已取消收藏', 'info');
        } else {
            this.favorites.add(playerId);
            this.showNotification('已添加到收藏', 'success');
        }
        this.saveFavorites();
        this.renderPlayerCards();
    }

    openNegotiation(player) {
        console.log('openNegotiation called for player:', player.id, player.name);
        
        if (typeof window.negotiationManager !== 'undefined' && window.negotiationManager) {
            try {
                window.negotiationManager.startNegotiation(player.id);
                this.showPlayerDetail(player, true);
            } catch (error) {
                console.error('Negotiation error:', error);
                this.showNotification('谈判系统出错: ' + error.message, 'error');
            }
        } else {
            console.error('negotiationManager not available');
            this.showNotification('谈判系统未加载，请刷新页面重试', 'warning');
        }
    }

    showPlayerDetail(player, showNegotiation = false) {
        const modal = document.getElementById('player-modal');
        const content = document.getElementById('player-detail-content');
        if (!modal || !content) return;

        const level = this.getPotentialLevel(player.potential);
        let rating = player.rating;
        if (!rating && typeof player.getOverallRating === 'function') {
            try {
                rating = player.getOverallRating();
            } catch (e) {
                console.error('Error calculating rating:', e);
                rating = 50; // 默认值
            }
        }
        if (!rating || isNaN(rating)) {
            rating = 50; // 默认值
        }
        const ratingLevel = this.getRatingLevel(rating);
        const yearLabels = { 1: '大一', 2: '大二', 3: '大三', 4: '大四' };
        const initials = player.name.split(' ').map(n => n[0]).join('');

        const background = player.background || {};
        const achievements = background.achievements || [];
        const specialties = background.specialties || [];

        content.innerHTML = `
            <div class="detail-header">
                <div class="detail-avatar">${initials}</div>
                <div class="detail-info">
                    <h2 class="detail-name">${player.name}</h2>
                    <div class="detail-tags">
                        <span class="tag position">${Positions[player.position]}</span>
                        <span class="tag year">${yearLabels[player.year]}</span>
                        <span class="tag rating" style="background: ${this.getRatingColor(rating)}20; color: ${this.getRatingColor(rating)};">
                            能力值 ${rating}
                        </span>
                        <span class="tag potential" style="background: ${level.color}20; color: ${level.color};">
                            ${level.icon} 潜力值 ${player.potential}
                        </span>
                        ${player.specialistInfo ? `
                        <span class="tag specialist" style="background: #8b5cf620; color: #8b5cf6;" title="${player.specialistInfo.description}">
                            ${player.specialistInfo.icon} ${player.specialistInfo.name}
                        </span>
                        ` : ''}
                    </div>
                    ${player.specialistInfo ? `
                    <div class="specialist-description" style="margin-top: 10px; padding: 10px; background: #f3f4f6; border-radius: 8px; font-size: 14px; color: #666;">
                        <strong>${player.specialistInfo.name}:</strong> ${player.specialistInfo.specialistDescription}
                        <div style="margin-top: 5px; font-size: 12px;">
                            <span style="color: #10b981;">强项: ${player.specialistInfo.primaryAttribute} (${player.specialistInfo.primaryValue})</span>
                            ${player.isCorePlayer === false ? '<span style="color: #ef4444; margin-left: 10px;">非核心球员</span>' : ''}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>

            <!-- 核心属性区 -->
            <div class="detail-section">
                <h4>核心属性</h4>
                <div class="core-attributes">
                    <div class="core-attr-card">
                        <div class="core-attr-value" style="color: ${level.color};">${player.potential}</div>
                        <div class="core-attr-label">潜力值</div>
                    </div>
                    <div class="core-attr-card">
                        <div class="core-attr-value" style="color: ${this.getRatingColor(rating)};">${rating}</div>
                        <div class="core-attr-label">当前战力</div>
                    </div>
                    <div class="core-attr-card">
                        <div class="core-attr-value">${player.age}</div>
                        <div class="core-attr-label">年龄</div>
                    </div>
                </div>
            </div>

            <!-- 详细属性区 -->
            <div class="detail-section">
                <h4>技术指标</h4>
                <div class="detailed-attributes">
                    <div class="attr-category">
                        <h5>进攻能力</h5>
                        <div class="attr-list">
                            ${this.createAttrRow('得分', player.attributes?.scoring, '#ef4444')}
                            ${this.createAttrRow('投篮', player.attributes?.shooting, '#f59e0b')}
                            ${this.createAttrRow('三分', player.attributes?.threePoint, '#3b82f6')}
                            ${this.createAttrRow('罚球', player.attributes?.freeThrow, '#10b981')}
                            ${this.createAttrRow('控球', player.attributes?.dribbling, '#8b5cf6')}
                            ${this.createAttrRow('传球', player.attributes?.passing, '#06b6d4')}
                        </div>
                    </div>
                    <div class="attr-category">
                        <h5>防守与身体</h5>
                        <div class="attr-list">
                            ${this.createAttrRow('防守', player.attributes?.defense, '#ef4444')}
                            ${this.createAttrRow('篮板', player.attributes?.rebounding, '#f59e0b')}
                            ${this.createAttrRow('抢断', player.attributes?.stealing, '#3b82f6')}
                            ${this.createAttrRow('盖帽', player.attributes?.blocking, '#10b981')}
                            ${this.createAttrRow('速度', player.attributes?.speed, '#8b5cf6')}
                            ${this.createAttrRow('体能', player.attributes?.stamina, '#06b6d4')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 背景资料区 -->
            <div class="detail-section">
                <h4>球员背景</h4>
                <div class="background-section">
                    <div class="background-grid">
                        <div class="background-item">
                            <div class="bg-label">高中</div>
                            <div class="bg-value">${background.highSchool || '未知'}</div>
                        </div>
                        <div class="background-item">
                            <div class="bg-label">打法风格</div>
                            <div class="bg-value">${background.playStyle || '未知'}</div>
                        </div>
                        <div class="background-item">
                            <div class="bg-label">身高</div>
                            <div class="bg-value">${background.height || '未知'}</div>
                        </div>
                        <div class="background-item">
                            <div class="bg-label">体重</div>
                            <div class="bg-value">${background.weight || '未知'}</div>
                        </div>
                        <div class="background-item">
                            <div class="bg-label">臂展</div>
                            <div class="bg-value">${background.wingspan || '未知'}</div>
                        </div>
                        <div class="background-item">
                            <div class="bg-label">垂直弹跳</div>
                            <div class="bg-value">${background.verticalLeap || '未知'}</div>
                        </div>
                        <div class="background-item">
                            <div class="bg-label">特长</div>
                            <div class="bg-value">${specialties.join('、') || '无'}</div>
                        </div>
                        <div class="background-item">
                            <div class="bg-label">伤病史</div>
                            <div class="bg-value">${background.injuryHistory || '无'}</div>
                        </div>
                    </div>
                    ${achievements.length > 0 ? `
                        <div style="margin-top: 15px;">
                            <div class="bg-label" style="margin-bottom: 8px;">所获荣誉</div>
                            <div class="bg-value">${achievements.join('、')}</div>
                        </div>
                    ` : ''}
                </div>
            </div>

            ${showNegotiation ? `
                <div class="negotiation-details" id="negotiation-details">
                    <h4>谈判界面</h4>
                    <div id="negotiation-interface-container"></div>
                </div>
            ` : ''}

            ${!showNegotiation ? `
                <div style="display: flex; gap: 15px; margin-top: 20px;">
                    <button class="action-btn btn-negotiate" style="flex: 1; padding: 15px;" 
                        onclick="if(window.recruitmentInterface) window.recruitmentInterface.showPlayerDetail(${JSON.stringify(player).replace(/"/g, '&quot;')}, true);">
                        发起签约谈判
                    </button>
                    <button class="action-btn btn-detail" style="flex: 1; padding: 15px;" 
                        onclick="if(window.negotiationManager) window.negotiationManager.startNegotiation('${player.id}');">
                        发起谈判
                    </button>
                </div>
            ` : ''}
        `;

        // 显示模态框
        modal.style.display = 'block';
        console.log('Player detail modal displayed for:', player.name);

        if (showNegotiation && typeof window.negotiationManager !== 'undefined') {
            const container = document.getElementById('negotiation-interface-container');
            if (container) {
                const interfaceHtml = window.negotiationManager.createNegotiationInterface(player);
                container.innerHTML = interfaceHtml;
                window.negotiationManager.setupNegotiationEvents(null, player.id);
            }
        }
    }

    createAttrRow(name, value, color) {
        // 确保值是有效数字
        const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
        return `
            <div class="attr-row">
                <span class="attr-name">${name}</span>
                <div class="attr-value-bar">
                    <div class="attr-bar-bg">
                        <div class="attr-bar-fill" style="width: ${numValue}%; background: ${color};"></div>
                    </div>
                    <span class="attr-num">${numValue}</span>
                </div>
            </div>
        `;
    }

    getPotentialLevel(potential) {
        if (potential >= 90) return { label: 'elite', color: '#ef4444', icon: '👑' };
        if (potential >= 80) return { label: 'excellent', color: '#f59e0b', icon: '⭐' };
        if (potential >= 70) return { label: 'good', color: '#3b82f6', icon: '💎' };
        return { label: 'normal', color: '#6b7280', icon: '📋' };
    }

    getPotentialLabel(potential) {
        if (potential >= 90) return '天之骄子';
        if (potential >= 80) return '精英球员';
        if (potential >= 70) return '优秀球员';
        return '普通球员';
    }

    getRatingLevel(rating) {
        if (rating >= 80) return { label: 'star', color: '#ef4444' };
        if (rating >= 70) return { label: 'starter', color: '#f59e0b' };
        if (rating >= 60) return { label: 'rotation', color: '#3b82f6' };
        return { label: 'bench', color: '#6b7280' };
    }

    getRatingColor(rating) {
        if (rating >= 80) return '#ef4444';
        if (rating >= 70) return '#f59e0b';
        if (rating >= 60) return '#3b82f6';
        return '#6b7280';
    }

    showNotification(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    validateDistribution() {
        if (this.gameInitializer && typeof this.gameInitializer.validatePotentialDistribution === 'function') {
            const stats = this.gameInitializer.validatePotentialDistribution(this.players);
            console.log('潜力值分布验证:', stats);
            return stats;
        }
        return null;
    }

    updatePlayer(playerId, updates) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return false;

        Object.assign(player, updates);
        this.savePlayers();
        this.renderAll();

        // 3秒内更新界面并提供视觉反馈
        const card = document.querySelector(`.player-card[data-player-id="${playerId}"]`);
        if (card) {
            card.classList.add('update-flash');
            setTimeout(() => card.classList.remove('update-flash'), 500);
        }

        return true;
    }

    refreshPlayers() {
        this.loadPlayers();
        this.renderAll();
        this.showNotification('球员列表已刷新', 'success');
    }

    setupRecruitmentTabs() {
        document.querySelectorAll('.recruit-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.recruitTab;
                this.switchRecruitmentTab(tabName);
            });
        });
    }

    switchRecruitmentTab(tabName) {
        document.querySelectorAll('.recruit-tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.recruitTab === tabName) {
                btn.classList.add('active');
            }
        });

        document.querySelectorAll('.recruit-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const targetContent = document.getElementById(`recruit-tab-${tabName}`);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        switch (tabName) {
            case 'available':
                this.renderPlayerCards();
                break;
            case 'negotiating':
                this.renderNegotiationList();
                break;
            case 'offer-pending':
                this.renderPendingOfferList();
                break;
            case 'signed':
                this.renderSignedPlayerList();
                break;
        }
    }

    renderNegotiationList() {
        const container = document.getElementById('negotiation-list');
        if (!container) return;

        const negotiations = window.negotiationManager?.getAllActiveNegotiations() || [];

        if (negotiations.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <div style="font-size: 4rem; margin-bottom: 20px;">💬</div>
                    <h3 style="color: var(--text-primary); margin-bottom: 10px;">暂无进行中的谈判</h3>
                    <p>前往"可用球员"页签发起新的谈判</p>
                </div>
            `;
            this.updateNegotiationStats(negotiations);
            return;
        }

        container.innerHTML = negotiations.map(neg => this.createNegotiationCard(neg)).join('');
        this.bindNegotiationCardEvents();
        this.updateNegotiationStats(negotiations);
    }

    createNegotiationCard(negotiation) {
        const progressPercent = (negotiation.round / negotiation.maxRounds) * 100;
        const statusClass = this.getNegotiationStatusClass(negotiation);
        const statusText = this.getNegotiationStatusText(negotiation);
        const initials = negotiation.playerName.split(' ').map(n => n[0]).join('');
        const elapsedDays = this.calculateElapsedDays(negotiation.startedAt);

        return `
            <div class="negotiation-card ${statusClass}" data-negotiation-id="${negotiation.id}">
                <div class="negotiation-player-info">
                    <div class="player-avatar-large">${initials}</div>
                    <div class="player-name-large">${negotiation.playerName}</div>
                    <div class="player-position-large">${Positions[negotiation.playerPosition] || negotiation.playerPosition}</div>
                </div>
                <div class="negotiation-details">
                    <div class="negotiation-header">
                        <span class="negotiation-status ${statusClass}">${statusText}</span>
                        <div class="negotiation-timer">
                            <span>⏱️</span>
                            <span>已进行 ${elapsedDays} 天</span>
                        </div>
                    </div>
                    <div class="negotiation-progress-section">
                        <div class="progress-label">
                            <span>谈判进度</span>
                            <span>${negotiation.round}/${negotiation.maxRounds} 轮</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                    <div class="negotiation-offer-info">
                        <div class="offer-item">
                            <span class="offer-label">奖学金</span>
                            <span class="offer-value scholarship">${Math.round(negotiation.offer.scholarship * 100)}%</span>
                        </div>
                        <div class="offer-item">
                            <span class="offer-label">出场时间</span>
                            <span class="offer-value playing-time">${negotiation.offer.playingTime}分钟</span>
                        </div>
                        <div class="offer-item">
                            <span class="offer-label">成功率</span>
                            <span class="offer-value">${negotiation.acceptanceProbability}%</span>
                        </div>
                    </div>
                </div>
                <div class="negotiation-actions">
                    <button class="neg-action-btn modify" data-action="modify" data-negotiation-id="${negotiation.id}">
                        <span>✏️</span> 修改报价
                    </button>
                    <button class="neg-action-btn message" data-action="message" data-negotiation-id="${negotiation.id}">
                        <span>💬</span> 发送消息
                    </button>
                    <button class="neg-action-btn history" data-action="history" data-negotiation-id="${negotiation.id}">
                        <span>📜</span> 历史记录
                    </button>
                    <button class="neg-action-btn terminate" data-action="terminate" data-negotiation-id="${negotiation.id}">
                        <span>❌</span> 终止谈判
                    </button>
                </div>
            </div>
        `;
    }

    getNegotiationStatusClass(negotiation) {
        if (negotiation.playerResponse?.counterOffer) return 'counter';
        if (negotiation.round >= negotiation.maxRounds - 1) return 'urgent';
        return 'active';
    }

    getNegotiationStatusText(negotiation) {
        if (negotiation.playerResponse?.counterOffer) return '🔄 还价中';
        if (negotiation.round >= negotiation.maxRounds - 1) return '⚠️ 紧急';
        return '💬 进行中';
    }

    calculateElapsedDays(startDate) {
        const start = new Date(startDate);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    bindNegotiationCardEvents() {
        const container = document.getElementById('negotiation-list');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action = btn.dataset.action;
            const negotiationId = btn.dataset.negotiationId;

            switch (action) {
                case 'modify':
                    this.openModifyNegotiation(negotiationId);
                    break;
                case 'message':
                    this.openMessageModal(negotiationId);
                    break;
                case 'history':
                    this.openHistoryModal(negotiationId);
                    break;
                case 'terminate':
                    this.terminateNegotiation(negotiationId);
                    break;
            }
        });
    }

    openModifyNegotiation(negotiationId) {
        const negotiation = window.negotiationManager?.getNegotiation(negotiationId);
        if (!negotiation) return;

        // 重新打开谈判界面，使用现有的谈判数据
        this.showPlayerDetail(negotiation.player, true);
    }

    openMessageModal(negotiationId) {
        const negotiation = window.negotiationManager?.getNegotiation(negotiationId);
        if (!negotiation) return;

        const modal = document.getElementById('negotiation-message-modal');
        const playerInfo = document.getElementById('message-player-info');
        const initials = negotiation.playerName.split(' ').map(n => n[0]).join('');

        playerInfo.innerHTML = `
            <div class="player-avatar-small">${initials}</div>
            <div class="player-info-basic">
                <div class="player-name-small">${negotiation.playerName}</div>
                <div class="player-meta-small">${Positions[negotiation.playerPosition]} | 成功率 ${negotiation.acceptanceProbability}%</div>
            </div>
        `;

        modal.style.display = 'block';

        const sendBtn = document.getElementById('send-message-btn');
        const textArea = document.getElementById('custom-message-text');

        const newSendBtn = sendBtn.cloneNode(true);
        sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);

        newSendBtn.addEventListener('click', () => {
            const message = textArea.value.trim();
            if (!message) {
                this.showNotification('请输入消息内容', 'warning');
                return;
            }

            window.negotiationManager?.sendNegotiationMessage(negotiationId, message);
            this.showNotification('消息已发送', 'success');
            modal.style.display = 'none';
            textArea.value = '';
        });

        document.querySelectorAll('.message-template').forEach(template => {
            template.addEventListener('click', (e) => {
                textArea.value = e.target.textContent;
            });
        });
    }

    openHistoryModal(negotiationId) {
        const negotiation = window.negotiationManager?.getNegotiation(negotiationId);
        if (!negotiation) return;

        const modal = document.getElementById('negotiation-history-modal');
        const playerInfo = document.getElementById('history-player-info');
        const timeline = document.getElementById('negotiation-timeline');
        const initials = negotiation.playerName.split(' ').map(n => n[0]).join('');

        playerInfo.innerHTML = `
            <div class="player-avatar-large">${initials}</div>
            <div class="player-info-basic">
                <div class="player-name-large">${negotiation.playerName}</div>
                <div class="player-meta-small">${Positions[negotiation.playerPosition]} | 谈判轮数: ${negotiation.round}/${negotiation.maxRounds}</div>
            </div>
        `;

        timeline.innerHTML = negotiation.history.map((entry, index) => {
            const icon = this.getHistoryIcon(entry.action);
            const time = new Date(entry.timestamp).toLocaleString('zh-CN');

            return `
                <div class="timeline-item">
                    <div class="timeline-icon">${icon}</div>
                    <div class="timeline-content">
                        <div class="timeline-title">${this.getHistoryTitle(entry.action)}</div>
                        <div class="timeline-details">${entry.action === 'started' ? '发起谈判' : (entry.action === 'countered' ? '对方还价' : (entry.action === 'accepted' ? '接受报价' : entry.action))}</div>
                        ${entry.offer ? `
                            <div class="timeline-offer">
                                <span>奖学金: ${Math.round(entry.offer.scholarship * 100)}%</span>
                                <span>出场时间: ${entry.offer.playingTime}分钟</span>
                            </div>
                        ` : ''}
                        <div class="timeline-time">${time}</div>
                    </div>
                </div>
            `;
        }).join('');

        modal.style.display = 'block';
    }

    getHistoryIcon(action) {
        const icons = {
            'started': '🚀',
            'countered': '🔄',
            'accepted': '✅',
            'rejected': '❌',
            'withdrawn': '🚫',
            'failed': '💔',
            'accepted_counter': '🤝'
        };
        return icons[action] || '📝';
    }

    getHistoryTitle(action) {
        const titles = {
            'started': '谈判开始',
            'countered': '对方还价',
            'accepted': '接受报价',
            'rejected': '拒绝报价',
            'withdrawn': '取消谈判',
            'failed': '谈判失败',
            'accepted_counter': '达成协议'
        };
        return titles[action] || '谈判记录';
    }

    terminateNegotiation(negotiationId) {
        if (!confirm('确定要终止这场谈判吗？')) return;

        const result = window.negotiationManager?.withdrawNegotiation(negotiationId);
        if (result !== false) {
            this.showNotification('谈判已终止', 'info');
            this.renderNegotiationList();
        }
    }

    updateNegotiationStats(negotiations) {
        document.getElementById('active-negotiations-count').textContent = negotiations.length;
        document.getElementById('tab-badge-negotiating').textContent = negotiations.length;
        document.getElementById('negotiation-count').textContent = negotiations.length;

        const avgTime = negotiations.length > 0
            ? Math.round(negotiations.reduce((sum, n) => sum + this.calculateElapsedDays(n.startedAt), 0) / negotiations.length)
            : 0;
        document.getElementById('avg-negotiation-time').textContent = `${avgTime}天`;

        const totalInvestment = negotiations.reduce((sum, n) => sum + Math.round(n.offer.scholarship * 100000), 0);
        document.getElementById('total-investment').textContent = `$${(totalInvestment / 10000).toFixed(1)}万`;
    }

    renderPendingOfferList() {
        const container = document.getElementById('pending-offer-list');
        if (!container) return;

        const pendingPlayers = this.getPendingPlayers();

        if (pendingPlayers.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                    <p>暂无待报价球员</p>
                </div>
            `;
            return;
        }

        container.innerHTML = pendingPlayers.map(player => {
            const initials = player.name.split(' ').map(n => n[0]).join('');
            return `
                <div class="pending-offer-card" data-player-id="${player.id}">
                    <div class="player-avatar-small">${initials}</div>
                    <div class="player-info-basic">
                        <div class="player-name-small">${player.name}</div>
                        <div class="player-meta-small">${Positions[player.position]} | 潜力值 ${player.potential}</div>
                    </div>
                    <div class="pending-actions">
                        <button class="pending-action-btn start-negotiation" data-action="start-negotiation" data-player-id="${player.id}">
                            发起谈判
                        </button>
                        <button class="pending-action-btn remove" data-action="remove" data-player-id="${player.id}">
                            移除
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.start-negotiation').forEach(btn => {
            btn.addEventListener('click', (e) => {
                let playerId = btn.dataset.playerId;
                const numericPlayerId = parseInt(playerId, 10);
                if (!isNaN(numericPlayerId)) {
                    playerId = numericPlayerId;
                }
                
                const result = window.negotiationManager?.startNegotiation(playerId);
                if (result) {
                    this.renderNegotiationList();
                    this.switchRecruitmentTab('negotiating');
                }
            });
        });

        container.querySelectorAll('.remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerId = e.target.dataset.playerId;
                this.removeFromPending(playerId);
                this.renderPendingOfferList();
            });
        });
    }

    getPendingPlayers() {
        const pendingIds = JSON.parse(localStorage.getItem('pendingPlayers') || '[]');
        return this.players.filter(p => pendingIds.includes(p.id));
    }

    addToPending(playerId) {
        const pendingIds = JSON.parse(localStorage.getItem('pendingPlayers') || '[]');
        if (!pendingIds.includes(playerId)) {
            pendingIds.push(playerId);
            localStorage.setItem('pendingPlayers', JSON.stringify(pendingIds));
        }
    }

    removeFromPending(playerId) {
        const pendingIds = JSON.parse(localStorage.getItem('pendingPlayers') || '[]');
        const index = pendingIds.indexOf(playerId);
        if (index > -1) {
            pendingIds.splice(index, 1);
            localStorage.setItem('pendingPlayers', JSON.stringify(pendingIds));
        }
    }

    renderSignedPlayerList() {
        const container = document.getElementById('signed-player-list');
        if (!container) return;

        const state = window.gameStateManager?.getState();
        const signedPlayers = state?.userTeam?.roster || [];

        if (signedPlayers.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                    <p>暂无已签约球员</p>
                </div>
            `;
            return;
        }

        container.innerHTML = signedPlayers.map(player => {
            const initials = player.name.split(' ').map(n => n[0]).join('');
            return `
                <div class="signed-player-card">
                    <div class="player-avatar-small">${initials}</div>
                    <div class="player-info-basic">
                        <div class="player-name-small">${player.name}</div>
                        <div class="player-meta-small">${Positions[player.position]} | 能力值 ${player.getOverallRating()}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateAllTabCounts() {
        const negotiations = window.negotiationManager?.getAllActiveNegotiations() || [];
        document.getElementById('tab-badge-negotiating').textContent = negotiations.length;
        document.getElementById('negotiation-count').textContent = negotiations.length;

        const pendingCount = this.getPendingPlayers().length;
        document.getElementById('tab-badge-offer').textContent = pendingCount;

        const state = window.gameStateManager?.getState();
        const signedCount = state?.userTeam?.roster?.length || 0;
        document.getElementById('tab-badge-signed').textContent = signedCount;

        document.getElementById('tab-badge-available').textContent = this.players.length;
    }
}

if (typeof window !== 'undefined') {
    window.RecruitmentInterface = RecruitmentInterface;
}
