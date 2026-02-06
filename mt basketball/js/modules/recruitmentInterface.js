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
        
        // 初始化竞争性招募界面
        if (gameInitializer && gameInitializer.recruitmentCompetitionSystem) {
            this.competitiveInterface = new CompetitiveRecruitmentInterface(
                this,
                gameInitializer.recruitmentCompetitionSystem
            );
        }
    }

    async initialize() {
        console.log('RecruitmentInterface.initialize() called, isInitialized:', this.isInitialized);

        this.loadFavorites();
        this.loadPlayers();

        console.log('RecruitmentInterface initialize:', {
            playersLoaded: this.players.length,
            samplePlayer: this.players[0] ? {
                id: this.players[0].id,
                name: this.players[0].name,
                hasDims: !!this.players[0].personalityDimensions,
                dims: this.players[0].personalityDimensions
            } : 'none'
        });

        // 只在第一次初始化时设置事件监听
        if (!this.isInitialized) {
            this.setupEventListeners();
        }

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
        const rawPlayers = state.availablePlayers || [];

        console.log('Loading players, count:', rawPlayers.length);
        if (rawPlayers.length > 0) {
            console.log('First player personalityDimensions:', rawPlayers[0].personalityDimensions);
        }

        // 将普通对象转换为Player实例，确保性格维度正确
        this.players = rawPlayers.map(p => {
            // 检查是否已经是Player实例
            const isPlayerInstance = p instanceof Player ||
                (p.constructor && p.constructor.name === 'Player');

            if (isPlayerInstance && p.personalityDimensions) {
                // 已经是Player实例且有性格维度
                return p;
            }

            // 需要创建新的Player实例
            console.log('Creating Player instance for:', p.name, 'has dimensions:', !!p.personalityDimensions);
            const playerInstance = new Player(p);
            console.log('Created Player instance with dimensions:', playerInstance.personalityDimensions);
            return playerInstance;
        });

        console.log('Loaded players with personality:', this.players.map(p => ({
            name: p.name,
            dims: p.personalityDimensions
        })));
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
            // 使用新的5级奖学金系统计算
            const used = userTeam?.calculateUsedScholarshipShare ? 
                userTeam.calculateUsedScholarshipShare() : 
                (userTeam?.roster?.reduce((sum, p) => sum + (p.scholarship || 0), 0) || 0);
            const max = 5; // 新的奖学金总额
            scholarshipRemaining.textContent = `${(max - used).toFixed(1)}/${max}`;
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
                    <p>🏀 暂无符合条件的球员</p>
                    <p>当前共有 ${this.players.length} 名球员在库中</p>
                    ${this.players.length === 0 ? `
                        <button onclick="window.location.reload()" style="margin-top: 15px; padding: 10px 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; cursor: pointer;">
                            🔄 刷新页面重新加载
                        </button>
                    ` : `
                        <button onclick="window.recruitmentInterface.resetFilters()" style="margin-top: 15px; padding: 10px 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; cursor: pointer;">
                            🔄 重置筛选条件
                        </button>
                    `}
                </div>
            `;
            return;
        }

        try {
            container.innerHTML = filteredPlayers.map(player => {
                try {
                    return this.createPlayerCard(player);
                } catch (e) {
                    console.error('Error creating card for player:', player.name, e);
                    return `<div class="player-card error">[球员卡片加载失败: ${player.name}]</div>`;
                }
            }).join('');
        } catch (e) {
            console.error('Error rendering player cards:', e);
            container.innerHTML = '<div class="no-results"><p>加载球员卡片时出错</p></div>';
            return;
        }

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

        // 获取性格信息
        const personalityHtml = this.renderPersonalityTag(player);

        return `
            <div class="player-card ${level.label} ${isFavorite ? 'is-favorite' : ''}" data-player-id="${player.id}">
                <!-- 顶部状态栏 -->
                <div class="card-top-bar">
                    <div class="player-status-badge ${statusClass}">
                        <span>${statusIcon}</span>
                        <span>${statusLabel}</span>
                    </div>
                    <div class="card-actions">
                        <button class="icon-btn favorite-btn ${isFavorite ? 'favorited' : ''}"
                            data-player-id="${player.id}" title="${isFavorite ? '取消收藏' : '收藏球员'}">
                            ${isFavorite ? '⭐' : '☆'}
                        </button>
                    </div>
                </div>

                <!-- 球员基本信息 -->
                <div class="card-main-info">
                    <div class="player-avatar">${initials}</div>
                    <div class="player-info">
                        <h3 class="player-name">${player.name}</h3>
                        <div class="player-tags">
                            <span class="tag position-tag">${Positions[player.position]}</span>
                            <span class="tag year-tag">${yearLabels[player.year]}</span>
                            <span class="tag age-tag">${player.age}岁</span>
                        </div>
                    </div>
                </div>

                <!-- 能力值和潜力 -->
                <div class="card-ratings">
                    <div class="rating-box">
                        <div class="rating-label">能力</div>
                        <div class="rating-value" style="color: ${ratingColor};">${rating}</div>
                        <div class="rating-bar">
                            <div class="rating-fill" style="width: ${rating}%; background: ${ratingColor};"></div>
                        </div>
                    </div>
                    <div class="potential-box ${level.label}">
                        <div class="potential-label">潜力</div>
                        <div class="potential-value">${player.potential}</div>
                        <div class="potential-icon">${level.icon}</div>
                    </div>
                </div>

                <!-- 关键属性 -->
                <div class="card-attributes">
                    <div class="attr-box">
                        <span class="attr-name">进攻</span>
                        <span class="attr-val">${player.attributes.scoring}</span>
                    </div>
                    <div class="attr-box">
                        <span class="attr-name">防守</span>
                        <span class="attr-val">${player.attributes.defense}</span>
                    </div>
                    <div class="attr-box">
                        <span class="attr-name">篮板</span>
                        <span class="attr-val">${player.attributes.rebounding}</span>
                    </div>
                </div>

                <!-- 性格特征 -->
                ${personalityHtml}

                <!-- 底部按钮 -->
                <div class="card-footer">
                    <button class="btn-primary" data-action="detail" data-player-id="${player.id}">
                        查看详情
                    </button>
                    <button class="btn-secondary" data-action="negotiate" data-player-id="${player.id}">
                        ${player.status === 'freshman_recruit' ? '招募' : (player.status === 'transfer_wanted' ? '转会' : '谈判')}
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
                // 使用竞争性招募界面显示详情
                if (this.competitiveInterface) {
                    this.competitiveInterface.showCompetitivePlayerDetail(player);
                } else {
                    this.showPlayerDetail(player);
                }
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
                // 先启动谈判
                window.negotiationManager.startNegotiation(player.id);
                // 然后显示详情弹窗（带谈判界面）
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
                rating = 50;
            }
        }
        if (!rating || isNaN(rating)) {
            rating = 50;
        }
        const yearLabels = { 1: '大一', 2: '大二', 3: '大三', 4: '大四' };
        const initials = player.name.split(' ').map(n => n[0]).join('');
        const background = player.background || {};

        content.innerHTML = `
            <div class="player-detail-new">
                <!-- 头部信息 -->
                <div class="detail-header-new">
                    <div class="detail-avatar-large">${initials}</div>
                    <div class="detail-header-info">
                        <h2>${player.name}</h2>
                        <div class="header-tags">
                            <span class="ht-tag position">${Positions[player.position]}</span>
                            <span class="ht-tag year">${yearLabels[player.year]}</span>
                            <span class="ht-tag age">${player.age}岁</span>
                        </div>
                    </div>
                    <div class="header-ratings">
                        <div class="h-rating-box">
                            <div class="h-rating-value" style="color: ${this.getRatingColor(rating)};">${rating}</div>
                            <div class="h-rating-label">能力值</div>
                        </div>
                        <div class="h-rating-box">
                            <div class="h-rating-value" style="color: ${level.color};">${player.potential}</div>
                            <div class="h-rating-label">潜力 ${level.icon}</div>
                        </div>
                    </div>
                </div>

                <!-- 性格特征 - 放在显眼位置 -->
                <div class="detail-personality-section">
                    <h3>性格特征</h3>
                    ${this.renderPersonalityDetail(player)}
                </div>

                <!-- 技术属性 -->
                <div class="detail-attributes-section">
                    <h3>技术属性</h3>
                    <div class="attr-grid">
                        ${this.createAttrBox('得分', player.attributes?.scoring, '#ef4444')}
                        ${this.createAttrBox('投篮', player.attributes?.shooting, '#f59e0b')}
                        ${this.createAttrBox('三分', player.attributes?.threePoint, '#3b82f6')}
                        ${this.createAttrBox('防守', player.attributes?.defense, '#10b981')}
                        ${this.createAttrBox('篮板', player.attributes?.rebounding, '#8b5cf6')}
                        ${this.createAttrBox('速度', player.attributes?.speed, '#06b6d4')}
                    </div>
                </div>

                <!-- 球员背景 -->
                <div class="detail-background-section">
                    <h3>球员资料</h3>
                    <div class="bg-info-grid">
                        <div class="bg-item"><span class="bg-label">高中</span><span class="bg-val">${background.highSchool || '未知'}</span></div>
                        <div class="bg-item"><span class="bg-label">身高</span><span class="bg-val">${background.height || '未知'}</span></div>
                        <div class="bg-item"><span class="bg-label">体重</span><span class="bg-val">${background.weight || '未知'}</span></div>
                        <div class="bg-item"><span class="bg-label">打法</span><span class="bg-val">${background.playStyle || '未知'}</span></div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                ${!showNegotiation ? `
                    <div class="detail-actions">
                        <button class="btn-detail-primary" onclick="window.recruitmentInterface.startNegotiationFromDetail('${player.id}')">
                            ${player.status === 'freshman_recruit' ? '发起招募' : (player.status === 'transfer_wanted' ? '申请转会' : '发起谈判')}
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        modal.style.display = 'block';
    }

    createAttrBox(name, value, color) {
        const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
        return `
            <div class="attr-box-new">
                <div class="attr-box-name">${name}</div>
                <div class="attr-box-value" style="color: ${color};">${numValue}</div>
                <div class="attr-box-bar">
                    <div class="attr-box-fill" style="width: ${numValue}%; background: ${color};"></div>
                </div>
            </div>
        `;
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

    /**
     * 渲染球员性格标签
     * @param {Player} player - 球员对象
     * @returns {string} HTML字符串
     */
    renderPersonalityTag(player) {
        console.log('renderPersonalityTag called for:', player.name);
        console.log('player.personalityDimensions:', player.personalityDimensions);
        console.log('player.personalityProfile:', player.personalityProfile);

        // 获取性格信息
        let personalityTag = { name: '均衡型', icon: '⚖️', description: '各方面都很均衡' };
        let dimensions = {};

        if (player.personalityProfile && player.personalityProfile.primaryTag) {
            personalityTag = player.personalityProfile.primaryTag;
            dimensions = player.personalityProfile.dimensions || player.personalityDimensions || {};
            console.log('Using personalityProfile');
        } else if (player.getPersonalityInfo) {
            const info = player.getPersonalityInfo();
            personalityTag = info.tag || personalityTag;
            dimensions = info.dimensions || player.personalityDimensions || {};
            console.log('Using getPersonalityInfo');
        } else if (player.personalityDimensions) {
            dimensions = player.personalityDimensions;
            console.log('Using personalityDimensions directly');
        }

        console.log('Final dimensions:', dimensions);
        console.log('Final personalityTag:', personalityTag);

        // 找出最高和最低的维度
        let highestDim = null;
        let lowestDim = null;
        let highestVal = -1;
        let lowestVal = 101;

        const dimNames = {
            ambition: '雄心',
            teamOrientation: '团队精神',
            workEthic: '职业素养',
            moneyFocus: '金钱观念',
            competitiveness: '竞争意识',
            loyalty: '忠诚度',
            patience: '耐心',
            pressureHandling: '抗压能力'
        };

        for (const [key, value] of Object.entries(dimensions)) {
            if (value > highestVal) {
                highestVal = value;
                highestDim = key;
            }
            if (value < lowestVal) {
                lowestVal = value;
                lowestDim = key;
            }
        }

        // 生成维度提示文本
        let dimensionTooltip = '';
        for (const [key, value] of Object.entries(dimensions)) {
            const bar = '█'.repeat(Math.floor(value / 10)) + '░'.repeat(10 - Math.floor(value / 10));
            dimensionTooltip += `${dimNames[key] || key}: ${value}/100 ${bar}\n`;
        }

        const html = `
            <div class="player-personality" title="${dimensionTooltip.trim()}">
                <span class="personality-icon">${personalityTag.icon || '⚖️'}</span>
                <span class="personality-name">${personalityTag.name || '均衡型'}</span>
                ${highestDim && highestVal >= 70 ? `<span class="personality-highlight high">${dimNames[highestDim]}↑</span>` : ''}
                ${lowestDim && lowestVal <= 30 ? `<span class="personality-highlight low">${dimNames[lowestDim]}↓</span>` : ''}
            </div>
        `;

        console.log('renderPersonalityTag returning HTML:', html);
        return html;
    }

    /**
     * 渲染球员性格详情（用于详情弹窗）
     * @param {Player} player - 球员对象
     * @returns {string} HTML字符串
     */
    renderPersonalityDetail(player) {
        console.log('renderPersonalityDetail called for:', player.name);
        console.log('player.personalityDimensions:', player.personalityDimensions);
        console.log('player.personalityProfile:', player.personalityProfile);

        // 获取性格信息
        let personalityTag = { name: '均衡型', icon: '⚖️', description: '各方面都很均衡' };
        let dimensions = {};
        let effects = {};

        if (player.personalityProfile) {
            personalityTag = player.personalityProfile.primaryTag || personalityTag;
            dimensions = player.personalityProfile.dimensions || player.personalityDimensions || {};
            effects = player.personalityProfile.effects || {};
        } else if (player.getPersonalityInfo) {
            const info = player.getPersonalityInfo();
            personalityTag = info.tag || personalityTag;
            dimensions = info.dimensions || player.personalityDimensions || {};
            effects = info.effects || {};
        } else if (player.personalityDimensions) {
            dimensions = player.personalityDimensions;
        }

        const dimNames = {
            ambition: '雄心',
            teamOrientation: '团队精神',
            workEthic: '职业素养',
            moneyFocus: '金钱观念',
            competitiveness: '竞争意识',
            loyalty: '忠诚度',
            patience: '耐心',
            pressureHandling: '抗压能力'
        };

        const dimDescriptions = {
            ambition: '追求个人成就的欲望',
            teamOrientation: '重视团队成功胜过个人',
            workEthic: '训练态度和努力程度',
            moneyFocus: '对经济利益的重视',
            competitiveness: '渴望胜利和竞争',
            loyalty: '对球队和承诺的忠诚',
            patience: '愿意等待机会的耐心',
            pressureHandling: '在压力下的表现'
        };

        // 生成维度条
        const dimensionBars = Object.entries(dimensions).map(([key, value]) => {
            const percentage = value;
            const color = value >= 70 ? '#22c55e' : (value >= 40 ? '#f59e0b' : '#ef4444');
            return `
                <div class="personality-dimension-row">
                    <div class="dimension-label">
                        <span class="dim-name">${dimNames[key] || key}</span>
                        <span class="dim-value">${value}</span>
                    </div>
                    <div class="dimension-bar-wrapper">
                        <div class="dimension-bar-bg">
                            <div class="dimension-bar" style="width: ${percentage}%; background: ${color};"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // 生成效果说明
        const effectDescriptions = [];
        if (effects.scholarshipModifier) {
            const mod = Math.round((effects.scholarshipModifier - 1) * 100);
            effectDescriptions.push(`奖学金期望${mod > 0 ? '+' : ''}${mod}%`);
        }
        if (effects.trainingEffort) {
            const mod = Math.round((effects.trainingEffort - 1) * 100);
            effectDescriptions.push(`训练效果${mod > 0 ? '+' : ''}${mod}%`);
        }
        if (effects.clutchPerformance) {
            const mod = Math.round((effects.clutchPerformance - 1) * 100);
            effectDescriptions.push(`关键球${mod > 0 ? '+' : ''}${mod}%`);
        }
        if (effects.transferLikelihood) {
            const mod = Math.round((effects.transferLikelihood - 1) * 100);
            effectDescriptions.push(`转学概率${mod > 0 ? '+' : ''}${mod}%`);
        }

        return `
            <div class="personality-detail-section">
                <div class="personality-header">
                    <span class="personality-big-icon">${personalityTag.icon || '⚖️'}</span>
                    <div class="personality-title">
                        <h3>${personalityTag.name || '均衡型'}</h3>
                        <p>${personalityTag.description || '各方面都很均衡'}</p>
                    </div>
                </div>

                <div class="personality-dimensions">
                    ${dimensionBars}
                </div>

                ${effectDescriptions.length > 0 ? `
                    <div class="personality-effects">
                        <h5>性格影响</h5>
                        <div class="effects-list">
                            ${effectDescriptions.map(eff => `<span class="effect-tag">${eff}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
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

    /**
     * 从详情弹窗发起谈判
     * @param {string|number} playerId - 球员ID
     */
    startNegotiationFromDetail(playerId) {
        // 转换 playerId 为数字类型（如果可能）
        const numericPlayerId = parseInt(playerId, 10);
        const searchId = !isNaN(numericPlayerId) ? numericPlayerId : playerId;

        // 查找球员
        const player = this.players.find(p => p.id == searchId || p.id === searchId);

        if (!player) {
            console.error('Player not found for negotiation:', playerId);
            this.showNotification('找不到该球员', 'error');
            return;
        }

        // 关闭当前详情弹窗
        const modal = document.getElementById('player-modal');
        if (modal) {
            modal.style.display = 'none';
        }

        // 发起谈判
        this.openNegotiation(player);
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
