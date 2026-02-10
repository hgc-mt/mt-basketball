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
        
        // 初始化 PixiJS 渲染器
        if (window.recruitmentPixiRenderer && !window.recruitmentPixiRenderer.isInitialized) {
            await window.recruitmentPixiRenderer.init();
        }

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

    /**
     * 生成NBA 2K风格球员头像
     * @param {Object} player - 球员对象
     * @param {string} emoji - 位置emoji
     * @param {string} color - 头像颜色
     * @returns {string} 头像HTML
     */
    generatePlayerAvatar(player, emoji, color) {
        const nameParts = player.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts[nameParts.length - 1] || '';
        const initials = (firstName[0] || '') + (lastName[0] || '');
        
        // 根据球员能力值决定头像边框颜色
        const rating = typeof player.getOverallRating === 'function' 
            ? player.getOverallRating() 
            : (player.rating || 70);
        
        let borderColor = color;
        let glowColor = color;
        
        if (rating >= 85) {
            borderColor = '#ffd700'; // 金色 - 超级巨星
            glowColor = 'rgba(255, 215, 0, 0.5)';
        } else if (rating >= 75) {
            borderColor = '#c0c0c0'; // 银色 - 明星
            glowColor = 'rgba(192, 192, 192, 0.4)';
        } else if (rating >= 65) {
            borderColor = '#cd7f32'; // 铜色 - 普通
            glowColor = 'rgba(205, 127, 50, 0.3)';
        }
        
        return `
            <div class="player-avatar-nba2k" style="--avatar-color: ${color}; --border-color: ${borderColor}; --glow-color: ${glowColor};">
                <div class="avatar-inner">
                    <span class="avatar-emoji">${emoji}</span>
                    <span class="avatar-initials">${initials}</span>
                </div>
                <div class="avatar-rating-badge">${Math.round(rating)}</div>
            </div>
        `;
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
        
        // 更新招募预算显示
        if (window.recruitmentBudgetManager) {
            updateRecruitmentBudgetDisplay();
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

        // 添加 PixiJS 入场动画（只在招募界面可见时执行）
        if (window.recruitmentPixiRenderer && window.recruitmentPixiRenderer.isInitialized) {
            // 检查招募界面是否可见
            const recruitmentSection = document.getElementById('recruitment');
            if (recruitmentSection && recruitmentSection.offsetParent !== null) {
                const cards = container.querySelectorAll('.player-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        window.recruitmentPixiRenderer.animateCardEntry(card, index);
                    }, index * 30);
                });
            }
        }
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
        
        // NBA 2K风格头像 - 使用位置emoji和颜色
        const positionEmojis = {
            'PG': '🏀', 'SG': '🔥', 'SF': '⚡', 'PF': '💪', 'C': '🏆'
        };
        const positionColors = {
            'PG': '#e74c3c', 'SG': '#f39c12', 'SF': '#3498db', 'PF': '#9b59b6', 'C': '#1abc9c'
        };
        const avatarEmoji = positionEmojis[player.position] || '🏀';
        const avatarColor = positionColors[player.position] || '#667eea';
        
        // 生成球员照片风格头像
        const avatarHtml = this.generatePlayerAvatar(player, avatarEmoji, avatarColor);

        // 获取球员状态
        const statusLabel = player.getStatusLabel();
        const isTransfer = player.status === 'transfer_wanted';
        const isFreshman = player.status === 'freshman_recruit';
        const statusClass = isTransfer ? 'status-transfer' : (isFreshman ? 'status-freshman' : 'status-free');
        const statusIcon = isTransfer ? '↔️' : (isFreshman ? '⭐' : '●');

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

                <!-- 球员基本信息 - NBA 2K风格 -->
                <div class="card-main-info-nba2k">
                    ${avatarHtml}
                    <div class="player-info-nba2k">
                        <h3 class="player-name-nba2k">${player.name}</h3>
                        <div class="player-meta-nba2k">
                            <span class="meta-badge position-${player.position}">${Positions[player.position]}</span>
                            <span class="meta-badge year-badge">${yearLabels[player.year]}</span>
                            <span class="meta-badge age-badge">${player.age}岁</span>
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
                // 先显示报价设置弹窗，而不是直接开始谈判
                this.showOfferSetupModal(player);
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
                
                // 同时初始化竞争系统的招募状态
                if (window.recruitmentCompetitionSystem) {
                    window.recruitmentCompetitionSystem.initializePlayerRecruitment(player);
                }
                
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
        const background = player.background || {};
        
        // NBA 2K风格头像
        const positionEmojis = {
            'PG': '🏀', 'SG': '🔥', 'SF': '⚡', 'PF': '💪', 'C': '🏆'
        };
        const positionColors = {
            'PG': '#e74c3c', 'SG': '#f39c12', 'SF': '#3498db', 'PF': '#9b59b6', 'C': '#1abc9c'
        };
        const avatarEmoji = positionEmojis[player.position] || '🏀';
        const avatarColor = positionColors[player.position] || '#667eea';
        const avatarHtml = this.generatePlayerAvatar(player, avatarEmoji, avatarColor);

        content.innerHTML = `
            <div class="player-detail-new">
                <!-- 头部信息 -->
                <div class="detail-header-new">
                    <div class="detail-avatar-nba2k-wrapper">
                        ${avatarHtml}
                    </div>
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
                ` : `
                    <!-- 谈判界面 -->
                    <div class="negotiation-panel" id="negotiation-panel-${player.id}" style="background: linear-gradient(145deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); border-radius: 16px; padding: 20px; margin-top: 20px;">
                        <!-- 头部 -->
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 1.5rem;">💬</span>
                                <h3 style="margin: 0; font-size: 1.1rem; color: var(--text-primary);">招募谈判</h3>
                            </div>
                            <span id="neg-status-badge-${player.id}" style="padding: 6px 12px; background: rgba(16, 185, 129, 0.2); color: #10b981; border-radius: 20px; font-size: 0.8rem; font-weight: 500;">进行中</span>
                        </div>
                        
                        <!-- 状态信息 -->
                        <div class="negotiation-status-info" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                            <div class="status-item" style="text-align: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 12px;">
                                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 6px;">当前轮次</div>
                                <div id="neg-round-${player.id}" style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary);">1/5</div>
                            </div>
                            <div class="status-item" style="text-align: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 12px;">
                                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 6px;">成功率</div>
                                <div id="neg-probability-${player.id}" style="font-size: 1.1rem; font-weight: 600; color: #f59e0b;">--</div>
                            </div>
                            <div class="status-item" style="text-align: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 12px;">
                                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 6px;">剩余天数</div>
                                <div id="neg-days-${player.id}" style="font-size: 1.1rem; font-weight: 600; color: #3b82f6;">7天</div>
                            </div>
                        </div>
                        
                        <!-- 当前报价 -->
                        <div class="offer-section" style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                                <span style="font-size: 1.1rem;">📋</span>
                                <h4 style="margin: 0; font-size: 0.95rem; color: var(--text-primary);">当前报价</h4>
                            </div>
                            <div class="offer-details" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                                <div class="offer-item" style="text-align: center; padding: 12px; background: rgba(102, 126, 234, 0.1); border-radius: 10px;">
                                    <div style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px;">💰 奖学金</div>
                                    <div id="neg-scholarship-${player.id}" style="font-size: 1rem; font-weight: 600; color: #667eea;">--</div>
                                </div>
                                <div class="offer-item" style="text-align: center; padding: 12px; background: rgba(16, 185, 129, 0.1); border-radius: 10px;">
                                    <div style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px;">⏱️ 出场时间</div>
                                    <div id="neg-playingtime-${player.id}" style="font-size: 1rem; font-weight: 600; color: #10b981;">--</div>
                                </div>
                                <div class="offer-item" style="text-align: center; padding: 12px; background: rgba(245, 158, 11, 0.1); border-radius: 10px;">
                                    <div style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px;">🎯 角色定位</div>
                                    <div id="neg-role-${player.id}" style="font-size: 1rem; font-weight: 600; color: #f59e0b;">--</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 招募行动 -->
                        <div class="recruitment-actions-section" style="margin-bottom: 20px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                                <span style="font-size: 1.1rem;">🎯</span>
                                <h4 style="margin: 0; font-size: 0.95rem; color: var(--text-primary);">招募行动</h4>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">(提升球员兴趣度)</span>
                            </div>
                            <div class="recruitment-actions-grid" id="recruitment-actions-${player.id}" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                                <button class="recruitment-action-btn" data-action="campus_visit" data-player-id="${player.id}" style="padding: 12px; background: rgba(102, 126, 234, 0.1); border: 1px solid rgba(102, 126, 234, 0.3); border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s;">
                                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">🏫 校园参观</div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary);">展示校园设施和文化</div>
                                    <div style="font-size: 0.75rem; color: #f59e0b; margin-top: 4px;">💰 $5,000 | 兴趣度 +8-15%</div>
                                </button>
                                <button class="recruitment-action-btn" data-action="home_visit" data-player-id="${player.id}" style="padding: 12px; background: rgba(102, 126, 234, 0.1); border: 1px solid rgba(102, 126, 234, 0.3); border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s;">
                                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">🏠 家访</div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary);">深入了解球员家庭</div>
                                    <div style="font-size: 0.75rem; color: #f59e0b; margin-top: 4px;">💰 $8,000 | 兴趣度 +10-20%</div>
                                </button>
                                <button class="recruitment-action-btn" data-action="promise_playing_time" data-player-id="${player.id}" style="padding: 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s;">
                                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">⏱️ 承诺上场时间</div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary);">保证赛季出场时间</div>
                                    <div style="font-size: 0.75rem; color: #10b981; margin-top: 4px;">免费 | 兴趣度 +5-15%</div>
                                </button>
                                <button class="recruitment-action-btn" data-action="highlight_facilities" data-player-id="${player.id}" style="padding: 12px; background: rgba(102, 126, 234, 0.1); border: 1px solid rgba(102, 126, 234, 0.3); border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s;">
                                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">🏋️ 展示设施</div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary);">展示训练设施</div>
                                    <div style="font-size: 0.75rem; color: #f59e0b; margin-top: 4px;">💰 $2,000 | 兴趣度 +6-12%</div>
                                </button>
                                <button class="recruitment-action-btn" data-action="emphasize_academics" data-player-id="${player.id}" style="padding: 12px; background: rgba(102, 126, 234, 0.1); border: 1px solid rgba(102, 126, 234, 0.3); border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s;">
                                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">📚 强调学术</div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary);">突出学术优势</div>
                                    <div style="font-size: 0.75rem; color: #f59e0b; margin-top: 4px;">💰 $1,000 | 兴趣度 +4-10%</div>
                                </button>
                                <button class="recruitment-action-btn" data-action="offer_scholarship" data-player-id="${player.id}" style="padding: 12px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; cursor: pointer; text-align: left; transition: all 0.2s;">
                                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">💰 提供奖学金</div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary);">正式提供奖学金offer</div>
                                    <div style="font-size: 0.75rem; color: #f59e0b; margin-top: 4px;">免费 | 兴趣度 +15-25%</div>
                                </button>
                            </div>
                            <div id="action-result-${player.id}" style="margin-top: 12px;"></div>
                        </div>

                        <!-- 操作按钮 -->
                        <div class="negotiation-actions-panel" style="display: flex; gap: 10px; margin-bottom: 20px;">
                            <button class="neg-action-btn primary" onclick="window.recruitmentInterface.makeOffer('${player.id}')" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 10px; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
                                <span>📤</span> 提交报价
                            </button>
                            <button class="neg-action-btn secondary" onclick="window.recruitmentInterface.modifyOffer('${player.id}')" style="flex: 1; padding: 12px; background: rgba(102, 126, 234, 0.2); color: #667eea; border: 1px solid rgba(102, 126, 234, 0.3); border-radius: 10px; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
                                <span>✏️</span> 修改报价
                            </button>
                            <button class="neg-action-btn danger" onclick="window.recruitmentInterface.endNegotiation('${player.id}')" style="padding: 12px 16px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
                                <span>❌</span> 结束
                            </button>
                        </div>
                        
                        <!-- 谈判记录 -->
                        <div class="negotiation-history" id="neg-history-${player.id}" style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 16px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                                <span style="font-size: 1.1rem;">📜</span>
                                <h4 style="margin: 0; font-size: 0.95rem; color: var(--text-primary);">谈判记录</h4>
                            </div>
                            <div class="history-list" id="neg-history-list-${player.id}" style="display: flex; flex-direction: column; gap: 8px;">
                                <div class="history-item" style="display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px; font-size: 0.85rem;">
                                    <span style="color: var(--text-muted); font-size: 0.75rem;">刚刚</span>
                                    <span style="color: var(--text-secondary);">发起招募谈判</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `}
            </div>
        `;

        modal.style.display = 'block';
        
        // 如果显示谈判界面，加载谈判数据
        if (showNegotiation) {
            this.loadNegotiationData(player.id);
        }
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
        const elapsedDays = this.calculateElapsedDays(negotiation.startedAt);
        
        // NBA 2K风格头像
        const positionEmojis = {
            'PG': '🏀', 'SG': '🔥', 'SF': '⚡', 'PF': '💪', 'C': '🏆'
        };
        const positionColors = {
            'PG': '#e74c3c', 'SG': '#f39c12', 'SF': '#3498db', 'PF': '#9b59b6', 'C': '#1abc9c'
        };
        const position = negotiation.playerPosition || 'PG';
        const avatarEmoji = positionEmojis[position] || '🏀';
        const avatarColor = positionColors[position] || '#667eea';
        
        // 创建临时球员对象用于生成头像
        const tempPlayer = {
            name: negotiation.playerName,
            position: position,
            rating: negotiation.playerRating || 70
        };
        const avatarHtml = this.generatePlayerAvatar(tempPlayer, avatarEmoji, avatarColor);

        return `
            <div class="negotiation-card ${statusClass}" data-negotiation-id="${negotiation.id}">
                <div class="negotiation-player-info">
                    <div class="negotiation-avatar-wrapper">
                        ${avatarHtml}
                    </div>
                    <div class="player-name-large">${negotiation.playerName}</div>
                    <div class="player-position-large">${Positions[position] || position}</div>
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
        if (!negotiation) {
            this.showNotification('找不到谈判记录', 'error');
            return;
        }

        // 获取球员信息 - 优先使用player对象，否则通过playerId查找
        let player = negotiation.player;
        if (!player && negotiation.playerId) {
            player = this.players.find(p => p.id == negotiation.playerId || p.id === negotiation.playerId);
        }
        
        if (!player) {
            this.showNotification('找不到球员信息', 'error');
            return;
        }

        // 重新打开谈判界面，使用现有的谈判数据
        this.showPlayerDetail(player, true);
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

        // 计算平均成功率
        const avgSuccessRate = negotiations.length > 0
            ? Math.round(negotiations.reduce((sum, n) => sum + (n.acceptanceProbability || 0), 0) / negotiations.length)
            : 0;
        document.getElementById('success-rate').textContent = `${avgSuccessRate}%`;

        // 计算累计投入（实际招募行动花费）
        let totalInvestment = 0;
        if (window.recruitmentBudgetManager) {
            const stats = window.recruitmentBudgetManager.getStats();
            totalInvestment = stats.totalSpent || 0;
        }
        
        // 格式化显示：小于1万显示具体数值，大于1万显示X.X万
        let investmentText;
        if (totalInvestment === 0) {
            investmentText = '$0';
        } else if (totalInvestment < 10000) {
            investmentText = `$${totalInvestment}`;
        } else {
            investmentText = `$${(totalInvestment / 10000).toFixed(1)}万`;
        }
        document.getElementById('total-investment').textContent = investmentText;
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

    /**
     * 显示报价设置弹窗（从球员卡片点击招募时使用）
     * @param {Object} player - 球员对象
     */
    showOfferSetupModal(player) {
        // 创建弹窗
        let modal = document.getElementById('offer-setup-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'offer-setup-modal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }

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
        
        // NBA 2K风格头像
        const positionEmojis = {
            'PG': '🏀', 'SG': '🔥', 'SF': '⚡', 'PF': '💪', 'C': '🏆'
        };
        const positionColors = {
            'PG': '#e74c3c', 'SG': '#f39c12', 'SF': '#3498db', 'PF': '#9b59b6', 'C': '#1abc9c'
        };
        const avatarEmoji = positionEmojis[player.position] || '🏀';
        const avatarColor = positionColors[player.position] || '#667eea';
        const avatarHtml = this.generatePlayerAvatar(player, avatarEmoji, avatarColor);

        modal.innerHTML = `
            <div class="recruit-offer-modal" id="offer-setup-content">
                <!-- 头部 -->
                <div class="recruit-offer-header">
                    <h2 class="recruit-offer-title">
                        <span class="title-icon">🏀</span>
                        招募报价
                    </h2>
                    <button class="recruit-offer-close" onclick="document.getElementById('offer-setup-modal').style.display='none'">✕</button>
                </div>
                
                <!-- 球员信息卡片 -->
                <div class="recruit-player-banner">
                    <div class="offer-avatar-wrapper">
                        ${avatarHtml}
                    </div>
                    <div class="player-info-main">
                        <h3 class="player-name">${player.name}</h3>
                        <div class="player-meta">
                            <span class="meta-tag potential" style="background: ${level.color}20; color: ${level.color}; border-color: ${level.color}40;">${level.icon} ${player.potential}潜力</span>
                            <span class="meta-tag rating">${rating}评分</span>
                            <span class="meta-tag year">${yearLabels[player.year]}</span>
                        </div>
                    </div>
                </div>
                
                <!-- 报价设置区域 -->
                <div class="recruit-offer-body">
                    <!-- 奖学金 -->
                    <div class="offer-field">
                        <div class="field-label">
                            <span class="field-icon">🎓</span>
                            <span>奖学金比例</span>
                            <span class="field-value" id="scholarship-value-${player.id}">50%</span>
                        </div>
                        <div class="field-control">
                            <button class="field-btn" onclick="window.recruitmentInterface.setOfferValue('scholarship', ${player.id}, 0)">0%</button>
                            <button class="field-btn" onclick="window.recruitmentInterface.setOfferValue('scholarship', ${player.id}, 25)">25%</button>
                            <button class="field-btn active" onclick="window.recruitmentInterface.setOfferValue('scholarship', ${player.id}, 50)">50%</button>
                            <button class="field-btn" onclick="window.recruitmentInterface.setOfferValue('scholarship', ${player.id}, 75)">75%</button>
                            <button class="field-btn" onclick="window.recruitmentInterface.setOfferValue('scholarship', ${player.id}, 100)">100%</button>
                        </div>
                        <input type="hidden" id="setup-scholarship-${player.id}" value="50">
                    </div>
                    
                    <!-- 出场时间 -->
                    <div class="offer-field">
                        <div class="field-label">
                            <span class="field-icon">⏱️</span>
                            <span>承诺出场时间</span>
                            <span class="field-value" id="playingtime-value-${player.id}">25分钟</span>
                        </div>
                        <div class="field-control">
                            <button class="field-btn" onclick="window.recruitmentInterface.setOfferValue('playingtime', ${player.id}, 5)">5分钟</button>
                            <button class="field-btn" onclick="window.recruitmentInterface.setOfferValue('playingtime', ${player.id}, 15)">15分钟</button>
                            <button class="field-btn active" onclick="window.recruitmentInterface.setOfferValue('playingtime', ${player.id}, 25)">25分钟</button>
                            <button class="field-btn" onclick="window.recruitmentInterface.setOfferValue('playingtime', ${player.id}, 35)">35分钟</button>
                        </div>
                        <input type="hidden" id="setup-playingtime-${player.id}" value="25">
                    </div>
                    
                    <!-- 角色定位 -->
                    <div class="offer-field">
                        <div class="field-label">
                            <span class="field-icon">⭐</span>
                            <span>角色定位</span>
                            <span class="field-value" id="role-value-${player.id}">主力</span>
                        </div>
                        <div class="field-control role-control">
                            <button class="role-card" data-role="替补" onclick="window.recruitmentInterface.setRole(${player.id}, '替补', this)">
                                <span class="role-emoji">🪑</span>
                                <span class="role-text">替补</span>
                            </button>
                            <button class="role-card" data-role="轮换" onclick="window.recruitmentInterface.setRole(${player.id}, '轮换', this)">
                                <span class="role-emoji">🔄</span>
                                <span class="role-text">轮换</span>
                            </button>
                            <button class="role-card active" data-role="主力" onclick="window.recruitmentInterface.setRole(${player.id}, '主力', this)">
                                <span class="role-emoji">🏀</span>
                                <span class="role-text">主力</span>
                            </button>
                            <button class="role-card" data-role="核心" onclick="window.recruitmentInterface.setRole(${player.id}, '核心', this)">
                                <span class="role-emoji">👑</span>
                                <span class="role-text">核心</span>
                            </button>
                        </div>
                        <input type="hidden" id="setup-role-${player.id}" value="主力">
                    </div>
                    
                    <!-- 招募行动 -->
                    <div class="offer-field actions-field">
                        <div class="field-label">
                            <span class="field-icon">🎯</span>
                            <span>招募行动</span>
                            <span class="field-hint">提升球员兴趣度</span>
                        </div>
                        <div class="actions-grid" id="offer-actions-${player.id}">
                            <button type="button" class="action-card" data-action="campus_visit" data-cost="5000" onclick="window.recruitmentInterface.executeOfferAction(${player.id}, 'campus_visit', 5000, this)">
                                <span class="action-icon">🏫</span>
                                <span class="action-name">校园参观</span>
                                <span class="action-effect">兴趣度 +8-15%</span>
                                <span class="action-cost">💰 $5,000</span>
                            </button>
                            <button type="button" class="action-card" data-action="home_visit" data-cost="8000" onclick="window.recruitmentInterface.executeOfferAction(${player.id}, 'home_visit', 8000, this)">
                                <span class="action-icon">🏠</span>
                                <span class="action-name">家访</span>
                                <span class="action-effect">兴趣度 +10-20%</span>
                                <span class="action-cost">💰 $8,000</span>
                            </button>
                            <button type="button" class="action-card" data-action="highlight_facilities" data-cost="2000" onclick="window.recruitmentInterface.executeOfferAction(${player.id}, 'highlight_facilities', 2000, this)">
                                <span class="action-icon">🏋️</span>
                                <span class="action-name">展示设施</span>
                                <span class="action-effect">兴趣度 +6-12%</span>
                                <span class="action-cost">💰 $2,000</span>
                            </button>
                            <button type="button" class="action-card" data-action="emphasize_academics" data-cost="1000" onclick="window.recruitmentInterface.executeOfferAction(${player.id}, 'emphasize_academics', 1000, this)">
                                <span class="action-icon">📚</span>
                                <span class="action-name">强调学术</span>
                                <span class="action-effect">兴趣度 +4-10%</span>
                                <span class="action-cost">💰 $1,000</span>
                            </button>
                            <button type="button" class="action-card free" data-action="promise_playing_time" data-cost="0" onclick="window.recruitmentInterface.executeOfferAction(${player.id}, 'promise_playing_time', 0, this)">
                                <span class="action-icon">⏱️</span>
                                <span class="action-name">承诺上场时间</span>
                                <span class="action-effect">兴趣度 +5-15%</span>
                                <span class="action-cost free">免费</span>
                            </button>
                            <button type="button" class="action-card free" data-action="introduce_team_culture" data-cost="0" onclick="window.recruitmentInterface.executeOfferAction(${player.id}, 'introduce_team_culture', 0, this)">
                                <span class="action-icon">🌟</span>
                                <span class="action-name">介绍球队文化</span>
                                <span class="action-effect">兴趣度 +10-18%</span>
                                <span class="action-cost free">免费</span>
                            </button>
                        </div>
                        <div class="action-result" id="offer-action-result-${player.id}"></div>
                    </div>
                    
                    <!-- 招募话术 -->
                    <div class="offer-field message-field">
                        <div class="field-label">
                            <span class="field-icon">💬</span>
                            <span>招募话术</span>
                            <span class="field-hint">选填</span>
                        </div>
                        <div class="message-templates-grid">
                            <button type="button" class="template-chip" onclick="window.recruitmentInterface.selectMessageTemplate(${player.id}, '很高兴能与您沟通，我们球队非常期待您的加入！')">🎯 表达诚意</button>
                            <button type="button" class="template-chip" onclick="window.recruitmentInterface.selectMessageTemplate(${player.id}, '我们可以慢慢谈，确保找到双方都满意的方案。')">🤝 表示耐心</button>
                            <button type="button" class="template-chip" onclick="window.recruitmentInterface.selectMessageTemplate(${player.id}, '请您尽快考虑我们的报价，我们期待您的回复。')">⏰ 催促回复</button>
                            <button type="button" class="template-chip" onclick="window.recruitmentInterface.selectMessageTemplate(${player.id}, '如果您有其他要求，我们可以进一步协商。')">🔄 表示灵活</button>
                            <button type="button" class="template-chip" onclick="window.recruitmentInterface.selectMessageTemplate(${player.id}, '我们的球队正在建设期，您的加入将非常重要。')">🏆 强调球队</button>
                            <button type="button" class="template-chip" onclick="window.recruitmentInterface.selectMessageTemplate(${player.id}, '我们拥有优秀的训练设施和学术资源。')">📚 强调资源</button>
                        </div>
                        <textarea class="message-input" id="setup-message-${player.id}" placeholder="点击上方模板快速填充，或在此输入自定义话术..."></textarea>
                    </div>
                </div>
                
                <!-- 底部按钮 -->
                <div class="recruit-offer-footer">
                    <button class="btn-secondary" onclick="document.getElementById('offer-setup-modal').style.display='none'">取消</button>
                    <button class="btn-primary" id="confirm-offer-btn-${player.id}" onclick="window.recruitmentInterface.confirmOfferFromSetup(${player.id}, this)">
                        <span>提交报价</span>
                    </button>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    /**
     * 从报价设置弹窗确认报价
     * @param {number} playerId - 球员ID
     * @param {HTMLElement} buttonElement - 按钮元素
     */
    confirmOfferFromSetup(playerId, buttonElement) {
        // 触发PixiJS确认按钮动画
        console.log('[Recruitment] confirmOfferFromSetup called:', {
            playerId,
            hasButtonElement: !!buttonElement,
            hasPixiRenderer: !!window.recruitmentPixiRenderer,
            pixiInitialized: window.recruitmentPixiRenderer?.isInitialized
        });
        if (buttonElement && window.recruitmentPixiRenderer) {
            window.recruitmentPixiRenderer.animateConfirmOffer(buttonElement);
        } else {
            console.warn('[Recruitment] Cannot trigger animation:', {
                reason: !buttonElement ? 'no button element' : 'no pixi renderer'
            });
        }

        // 获取表单数据
        const scholarshipInput = document.getElementById(`setup-scholarship-${playerId}`);
        const playingTimeInput = document.getElementById(`setup-playingtime-${playerId}`);
        const roleInput = document.getElementById(`setup-role-${playerId}`);
        const messageTextarea = document.getElementById(`setup-message-${playerId}`);
        
        const offer = {
            scholarship: parseFloat(scholarshipInput?.value || 50) / 100,
            playingTime: parseInt(playingTimeInput?.value || 25),
            role: roleInput?.value || '主力',
            message: messageTextarea?.value || ''
        };
        
        // 查找球员
        const player = this.players.find(p => p.id == playerId || p.id === playerId);
        if (!player) {
            this.showNotification('找不到球员信息', 'error');
            return;
        }
        
        // 检查谈判管理器
        if (!window.negotiationManager) {
            this.showNotification('谈判系统未加载', 'error');
            return;
        }
        
        try {
            // 延迟关闭弹窗，让动画播放
            setTimeout(() => {
                const modal = document.getElementById('offer-setup-modal');
                if (modal) modal.style.display = 'none';
            }, 800);
            
            // 启动谈判
            const negotiation = window.negotiationManager.startNegotiation(player.id);
            
            if (!negotiation) {
                this.showNotification('发起谈判失败', 'error');
                return;
            }
            
            // 同时初始化竞争系统的招募状态
            if (window.recruitmentCompetitionSystem) {
                window.recruitmentCompetitionSystem.initializePlayerRecruitment(player);
            }
            
            // 提交报价
            const result = window.negotiationManager.makeOffer(negotiation.id, offer);
            
            if (result && result.success) {
                this.showNotification('报价已提交，谈判开始！', 'success');
                
                // PixiJS 谈判开启动画
                if (window.recruitmentPixiRenderer && window.recruitmentPixiRenderer.isInitialized) {
                    const centerX = window.innerWidth / 2;
                    const centerY = window.innerHeight / 2;
                    window.recruitmentPixiRenderer.animateNegotiationStart(centerX, centerY);
                }
                
                // 显示谈判详情
                setTimeout(() => {
                    this.showPlayerDetail(player, true);
                }, 300);
            } else {
                this.showNotification(result?.message || '提交报价失败', 'error');
            }
        } catch (error) {
            console.error('Negotiation error:', error);
            this.showNotification('谈判系统错误: ' + error.message, 'error');
        }
    }

    /**
     * 更新滑块值
     * @param {string} type - 滑块类型
     * @param {number} playerId - 球员ID
     * @param {number} value - 滑块值
     */
    updateSliderValue(type, playerId, value) {
        const valueEl = document.getElementById(`${type}-value-${playerId}`);
        const fillEl = document.getElementById(`${type}-fill-${playerId}`);
        const thumbEl = document.getElementById(`${type}-thumb-${playerId}`);
        
        // 更新显示值
        if (valueEl) {
            if (type === 'scholarship') {
                valueEl.textContent = value + '%';
            } else if (type === 'playingtime') {
                valueEl.textContent = value + '分钟';
            }
        }
        
        // 计算百分比
        const inputEl = document.getElementById(`setup-${type}-${playerId}`);
        let percentage = 50;
        if (inputEl) {
            const min = parseInt(inputEl.min);
            const max = parseInt(inputEl.max);
            percentage = ((value - min) / (max - min)) * 100;
        }
        
        // 更新填充条宽度
        if (fillEl) {
            fillEl.style.width = percentage + '%';
        }
        
        // 更新滑块按钮位置
        if (thumbEl) {
            thumbEl.style.left = percentage + '%';
        }
    }

    /**
     * 执行招募行动（报价弹窗中）
     * @param {number} playerId - 球员ID
     * @param {string} actionType - 行动类型
     * @param {number} cost - 金币消耗
     * @param {HTMLElement} btnElement - 按钮元素
     */
    executeOfferAction(playerId, actionType, cost, btnElement) {
        const resultDiv = document.getElementById(`offer-action-result-${playerId}`);
        
        // 检查金币是否足够
        if (cost > 0) {
            const state = window.gameState?.getState?.() || window.gameState || {};
            const currentBudget = state.recruitmentBudget || 0;
            if (currentBudget < cost) {
                if (resultDiv) {
                    resultDiv.innerHTML = `
                        <div class="result-error">
                            <span>❌</span>
                            <div>
                                <div class="result-title">招募预算不足</div>
                                <div class="result-desc">当前预算: $${currentBudget.toLocaleString()}, 需要: $${cost.toLocaleString()}</div>
                            </div>
                        </div>
                    `;
                }
                this.showNotification('招募预算不足，请减少开支或等待下赛季', 'warning');
                return;
            }
        }
        
        // 获取按钮位置用于动画
        let btnRect = null;
        if (btnElement) {
            btnRect = btnElement.getBoundingClientRect();
        }
        
        // 执行行动
        let result = null;
        if (window.recruitmentCompetitionSystem) {
            result = window.recruitmentCompetitionSystem.playerTakeAction(playerId, actionType);
        } else {
            // 模拟结果
            result = this.getMockActionResult(actionType);
            result.success = true;
            result.newInterest = Math.min(100, (result.newInterest || 50) + result.interestIncrease);
        }
        
        if (result.success) {
            // PixiJS 动画效果
            if (window.recruitmentPixiRenderer && window.recruitmentPixiRenderer.isInitialized && btnRect) {
                const centerX = btnRect.left + btnRect.width / 2;
                const centerY = btnRect.top + btnRect.height / 2;
                window.recruitmentPixiRenderer.animateRecruitmentAction(actionType, centerX, centerY);
                window.recruitmentPixiRenderer.animateInterestIncrease(centerX, centerY - 80, result.interestIncrease);
            }
            
            // 显示成功结果
            const costText = cost > 0 ? `💰 -$${cost.toLocaleString()}` : '🆓 免费';
            if (resultDiv) {
                resultDiv.innerHTML = `
                    <div class="result-success">
                        <span>✅</span>
                        <div>
                            <div class="result-title">${result.message}</div>
                            <div class="result-desc">兴趣度 +${result.interestIncrease}% | ${costText}</div>
                        </div>
                    </div>
                `;
            }
            this.showNotification(`${result.message} (兴趣度 +${result.interestIncrease}%)`, 'success');
            
            // 标记按钮为已使用
            if (btnElement) {
                btnElement.classList.add('used');
                btnElement.disabled = true;
            }
        } else {
            // 显示失败结果
            if (resultDiv) {
                resultDiv.innerHTML = `
                    <div class="result-error">
                        <span>❌</span>
                        <div>
                            <div class="result-title">${result.message}</div>
                        </div>
                    </div>
                `;
            }
            this.showNotification(result.message, 'warning');
        }
    }

    /**
     * 选择消息模板
     * @param {number} playerId - 球员ID
     * @param {string} text - 模板文本
     */
    selectMessageTemplate(playerId, text) {
        const textarea = document.getElementById(`setup-message-${playerId}`);
        if (textarea) {
            // 如果已有内容，追加换行
            if (textarea.value && !textarea.value.endsWith('\n')) {
                textarea.value += '\n';
            }
            textarea.value += text;
            // 触发input事件更新状态
            textarea.dispatchEvent(new Event('input'));
        }
    }

    /**
     * 设置报价值（新界面）
     * @param {string} type - 类型
     * @param {number} playerId - 球员ID
     * @param {number} value - 值
     */
    setOfferValue(type, playerId, value) {
        const valueEl = document.getElementById(`${type}-value-${playerId}`);
        const inputEl = document.getElementById(`setup-${type}-${playerId}`);
        
        // 更新显示值
        if (valueEl) {
            if (type === 'scholarship') {
                valueEl.textContent = value + '%';
            } else if (type === 'playingtime') {
                valueEl.textContent = value + '分钟';
            }
        }
        
        // 更新隐藏input
        if (inputEl) {
            inputEl.value = value;
        }
        
        // 更新按钮状态
        const field = inputEl?.closest('.offer-field');
        if (field) {
            field.querySelectorAll('.field-btn').forEach(btn => {
                btn.classList.remove('active');
                const btnText = btn.textContent.trim();
                const matchValue = type === 'scholarship' ? value + '%' : value + '分钟';
                if (btnText === matchValue) {
                    btn.classList.add('active');
                }
            });
        }
    }

    /**
     * 设置角色（新界面）
     * @param {number} playerId - 球员ID
     * @param {string} role - 角色
     * @param {HTMLElement} btnElement - 按钮元素
     */
    setRole(playerId, role, btnElement) {
        const valueEl = document.getElementById(`role-value-${playerId}`);
        const inputEl = document.getElementById(`setup-role-${playerId}`);
        
        // 更新显示值
        if (valueEl) {
            valueEl.textContent = role;
        }
        
        // 更新隐藏input
        if (inputEl) {
            inputEl.value = role;
        }
        
        // 更新按钮状态
        const field = btnElement?.closest('.offer-field');
        if (field) {
            field.querySelectorAll('.role-card').forEach(btn => {
                btn.classList.remove('active');
            });
        }
        
        if (btnElement) {
            btnElement.classList.add('active');
        }
    }

    /**
     * 选择节点
     * @param {string} type - 节点类型
     * @param {number} playerId - 球员ID
     * @param {number} value - 节点值
     * @param {string} displayText - 显示文本
     */
    selectNode(type, playerId, value, displayText) {
        const trackEl = document.getElementById(`${type}-track-${playerId}`);
        const valueEl = document.getElementById(`${type}-value-${playerId}`);
        const inputEl = document.getElementById(`setup-${type}-${playerId}`);
        
        if (!trackEl) return;
        
        // 更新显示值
        if (valueEl) valueEl.textContent = displayText;
        if (inputEl) inputEl.value = value;
        
        // 更新节点状态
        trackEl.querySelectorAll('.offer-node').forEach(node => {
            node.classList.remove('active');
            if (parseInt(node.dataset.value) === value) {
                node.classList.add('active');
            }
        });
    }

    /**
     * 选择角色定位
     * @param {number} playerId - 球员ID
     * @param {string} role - 角色值
     * @param {HTMLElement} btnElement - 按钮元素
     */
    selectRole(playerId, role, btnElement) {
        const roleContainer = document.getElementById(`setup-role-${playerId}`);
        if (!roleContainer) return;
        
        // 移除所有active状态
        roleContainer.querySelectorAll('.offer-role-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 添加active状态到当前按钮
        btnElement.classList.add('active');
    }

    /**
     * 加载谈判数据到界面
     * @param {string|number} playerId - 球员ID
     */
    loadNegotiationData(playerId) {
        // 从negotiationManager获取所有谈判，找到对应playerId的
        let negotiation = null;
        
        if (window.negotiationManager) {
            // 尝试从activeNegotiations Map中获取
            if (window.negotiationManager.activeNegotiations) {
                for (const [id, neg] of window.negotiationManager.activeNegotiations) {
                    if (neg.playerId == playerId || neg.player?.id == playerId) {
                        negotiation = neg;
                        negotiation.id = id;
                        break;
                    }
                }
            }
            
            // 如果没找到，尝试getNegotiation方法
            if (!negotiation) {
                negotiation = window.negotiationManager.getNegotiation?.(playerId);
            }
        }
        
        if (!negotiation) {
            console.warn('No negotiation found for player:', playerId);
            return;
        }

        // 更新状态显示
        const statusEl = document.getElementById(`neg-status-${playerId}`);
        const roundEl = document.getElementById(`neg-round-${playerId}`);
        const probEl = document.getElementById(`neg-probability-${playerId}`);
        const scholarshipEl = document.getElementById(`neg-scholarship-${playerId}`);
        const playingTimeEl = document.getElementById(`neg-playingtime-${playerId}`);
        const roleEl = document.getElementById(`neg-role-${playerId}`);

        if (statusEl) {
            const statusMap = {
                'active': '进行中',
                'pending': '等待回复',
                'countered': '还价中',
                'accepted': '已接受',
                'rejected': '已拒绝'
            };
            statusEl.textContent = statusMap[negotiation.status] || negotiation.status || '进行中';
        }

        if (roundEl) {
            roundEl.textContent = `${negotiation.round || 1}/${negotiation.maxRounds || 5}`;
        }

        if (probEl) {
            probEl.textContent = `${negotiation.acceptanceProbability || 0}%`;
        }

        if (scholarshipEl && negotiation.offer) {
            scholarshipEl.textContent = `${Math.round((negotiation.offer.scholarship || 0) * 100)}%`;
        }

        if (playingTimeEl && negotiation.offer) {
            playingTimeEl.textContent = `${negotiation.offer.playingTime || 0}分钟`;
        }

        if (roleEl && negotiation.offer) {
            const roleMap = {
                '核心': '⭐ 核心球星',
                '主力': '🏀 首发主力',
                '轮换': '🔄 重要轮换',
                '替补': '🪑 替补球员',
                'star': '⭐ 核心球星',
                'starter': '🏀 首发主力',
                'rotation': '🔄 重要轮换',
                'bench': '🪑 替补球员'
            };
            roleEl.textContent = roleMap[negotiation.offer.role] || negotiation.offer.role || '待定';
        }

        // 更新历史记录
        this.updateNegotiationHistory(playerId, negotiation.history);
        
        // 绑定招募行动按钮事件
        this.bindRecruitmentActionButtons(playerId);
    }
    
    /**
     * 绑定招募行动按钮事件
     * @param {string|number} playerId - 球员ID
     */
    bindRecruitmentActionButtons(playerId) {
        const actionButtons = document.querySelectorAll(`#recruitment-actions-${playerId} .recruitment-action-btn`);
        const resultDiv = document.getElementById(`action-result-${playerId}`);
        
        actionButtons.forEach(btn => {
            // 移除旧的事件监听器（避免重复绑定）
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', () => {
                const actionType = newBtn.dataset.action;
                this.executeRecruitmentAction(playerId, actionType, resultDiv);
            });
        });
    }
    
    /**
     * 执行招募行动
     * @param {string|number} playerId - 球员ID
     * @param {string} actionType - 行动类型
     * @param {HTMLElement} resultDiv - 结果显示容器
     */
    executeRecruitmentAction(playerId, actionType, resultDiv) {
        // 获取按钮位置用于动画
        const btn = document.querySelector(`#recruitment-actions-${playerId} [data-action="${actionType}"]`);
        let btnRect = null;
        if (btn) {
            btnRect = btn.getBoundingClientRect();
        }

        // 使用竞争系统执行行动
        if (window.recruitmentCompetitionSystem) {
            const result = window.recruitmentCompetitionSystem.playerTakeAction(playerId, actionType);
            
            if (result.success) {
                // PixiJS 动画效果
                if (window.recruitmentPixiRenderer && window.recruitmentPixiRenderer.isInitialized && btnRect) {
                    const centerX = btnRect.left + btnRect.width / 2;
                    const centerY = btnRect.top + btnRect.height / 2;
                    window.recruitmentPixiRenderer.animateRecruitmentAction(actionType, centerX, centerY);
                    window.recruitmentPixiRenderer.animateInterestIncrease(centerX, centerY - 80, result.interestIncrease);
                }
                
                // 显示成功结果
                if (resultDiv) {
                    resultDiv.innerHTML = `
                        <div style="padding: 12px 16px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.2rem;">✅</span>
                            <div>
                                <div style="font-weight: 600; color: #10b981;">${result.message}</div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary);">球员兴趣度 +${result.interestIncrease}%</div>
                            </div>
                        </div>
                    `;
                }
                this.showNotification(`${result.message} (兴趣度 +${result.interestIncrease}%)`, 'success');
                
                // 更新成功率显示
                this.updateNegotiationProbability(playerId);
            } else {
                // 显示失败结果
                if (resultDiv) {
                    resultDiv.innerHTML = `
                        <div style="padding: 12px 16px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.2rem;">❌</span>
                            <div style="font-weight: 600; color: #ef4444;">${result.message}</div>
                        </div>
                    `;
                }
                this.showNotification(result.message, 'warning');
            }
        } else {
            // 如果没有竞争系统，显示模拟结果
            const mockResult = this.getMockActionResult(actionType);
            
            // PixiJS 动画效果
            if (window.recruitmentPixiRenderer && window.recruitmentPixiRenderer.isInitialized && btnRect) {
                const centerX = btnRect.left + btnRect.width / 2;
                const centerY = btnRect.top + btnRect.height / 2;
                window.recruitmentPixiRenderer.animateRecruitmentAction(actionType, centerX, centerY);
                window.recruitmentPixiRenderer.animateInterestIncrease(centerX, centerY - 80, mockResult.interestIncrease);
            }
            
            if (resultDiv) {
                resultDiv.innerHTML = `
                    <div style="padding: 12px 16px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.2rem;">✅</span>
                        <div>
                            <div style="font-weight: 600; color: #10b981;">${mockResult.message}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">球员兴趣度 +${mockResult.interestIncrease}%</div>
                        </div>
                    </div>
                `;
            }
            this.showNotification(`${mockResult.message} (兴趣度 +${mockResult.interestIncrease}%)`, 'success');
        }
    }
    
    /**
     * 获取模拟行动结果（当竞争系统不可用时使用）
     * @param {string} actionType - 行动类型
     * @returns {Object} 行动结果
     */
    getMockActionResult(actionType) {
        const actionResults = {
            'campus_visit': { message: '校园参观给球员留下了深刻印象', interestIncrease: 12 },
            'home_visit': { message: '家访增进了彼此了解', interestIncrease: 15 },
            'promise_playing_time': { message: '上场时间承诺增加了吸引力', interestIncrease: 10 },
            'highlight_facilities': { message: '先进的训练设施令人印象深刻', interestIncrease: 9 },
            'emphasize_academics': { message: '学术优势得到了认可', interestIncrease: 7 },
            'introduce_team_culture': { message: '球队文化深深吸引了球员', interestIncrease: 14 }
        };
        return actionResults[actionType] || { message: '行动执行成功', interestIncrease: 5 };
    }
    
    /**
     * 更新谈判成功率显示
     * @param {string|number} playerId - 球员ID
     */
    updateNegotiationProbability(playerId) {
        const probEl = document.getElementById(`neg-probability-${playerId}`);
        if (!probEl || !window.recruitmentCompetitionSystem) return;
        
        // 获取球员招募状态
        const status = window.recruitmentCompetitionSystem.getPlayerRecruitmentStatus(playerId);
        if (status) {
            probEl.textContent = `${status.playerInterestInUser}%`;
        }
    }

    /**
     * 更新谈判历史显示
     * @param {string|number} playerId - 球员ID
     * @param {Array} history - 历史记录
     */
    updateNegotiationHistory(playerId, history) {
        const historyList = document.getElementById(`neg-history-list-${playerId}`);
        if (!historyList || !history) return;

        historyList.innerHTML = history.map(entry => {
            const time = new Date(entry.timestamp).toLocaleString('zh-CN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const actionMap = {
                'started': '发起招募谈判',
                'offer_submitted': '提交报价',
                'countered': '对方还价',
                'accepted': '接受报价',
                'rejected': '拒绝报价',
                'message_sent': '发送消息'
            };

            return `
                <div class="history-item">
                    <span class="history-time">${time}</span>
                    <span class="history-action">${actionMap[entry.action] || entry.action}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * 提交报价
     * @param {string|number} playerId - 球员ID
     */
    makeOffer(playerId) {
        const negotiation = window.negotiationManager?.getNegotiationByPlayerId?.(playerId) ||
                           window.negotiationManager?.getNegotiation?.(playerId);
        
        if (!negotiation) {
            this.showNotification('找不到谈判记录', 'error');
            return;
        }

        // 提交当前报价
        const result = window.negotiationManager?.makeOffer?.(negotiation.id, negotiation.offer);
        
        if (result && result.success) {
            this.showNotification('报价已提交，等待对方回复', 'success');
            this.loadNegotiationData(playerId);
        } else {
            this.showNotification(result?.message || '提交失败', 'error');
        }
    }

    /**
     * 修改报价
     * @param {string|number} playerId - 球员ID
     */
    modifyOffer(playerId) {
        // 从negotiationManager获取所有谈判，找到对应playerId的
        let negotiation = null;
        
        if (window.negotiationManager) {
            // 尝试从activeNegotiations Map中获取
            if (window.negotiationManager.activeNegotiations) {
                for (const [id, neg] of window.negotiationManager.activeNegotiations) {
                    if (neg.playerId == playerId || neg.player?.id == playerId) {
                        negotiation = neg;
                        negotiation.id = id;
                        break;
                    }
                }
            }
            
            // 如果没找到，尝试getNegotiation方法
            if (!negotiation) {
                negotiation = window.negotiationManager.getNegotiation?.(playerId);
            }
        }
        
        if (!negotiation) {
            this.showNotification('找不到谈判记录', 'error');
            console.error('Negotiation not found for player:', playerId);
            return;
        }

        // 打开修改报价弹窗
        this.showModifyOfferModal(negotiation.id || playerId);
    }

    /**
     * 结束谈判
     * @param {string|number} playerId - 球员ID
     */
    endNegotiation(playerId) {
        if (!confirm('确定要结束这场招募谈判吗？')) return;

        const negotiation = window.negotiationManager?.getNegotiationByPlayerId?.(playerId) ||
                           window.negotiationManager?.getNegotiation?.(playerId);
        
        if (!negotiation) {
            this.showNotification('找不到谈判记录', 'error');
            return;
        }

        const result = window.negotiationManager?.withdrawNegotiation?.(negotiation.id);
        
        if (result !== false) {
            this.showNotification('谈判已结束', 'info');
            // 关闭弹窗
            const modal = document.getElementById('player-modal');
            if (modal) modal.style.display = 'none';
            // 刷新列表
            this.renderPlayerCards();
        }
    }

    /**
     * 显示修改报价弹窗
     * @param {string|number} negotiationId - 谈判ID
     */
    showModifyOfferModal(negotiationId) {
        const negotiation = window.negotiationManager?.getNegotiation?.(negotiationId);
        if (!negotiation) {
            this.showNotification('找不到谈判记录', 'error');
            return;
        }

        // 获取球员信息
        const player = negotiation.player || this.players.find(p => p.id == negotiation.playerId);
        if (!player) {
            this.showNotification('找不到球员信息', 'error');
            return;
        }

        const level = this.getPotentialLevel(player.potential);
        const yearLabels = { 1: '大一', 2: '大二', 3: '大三', 4: '大四' };
        const initials = player.name.split(' ').map(n => n[0]).join('');

        // 创建弹窗
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'modify-offer-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 480px; border-radius: 16px; overflow: hidden;">
                <!-- 头部 -->
                <div class="modal-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 600;">${initials}</div>
                        <div>
                            <h3 style="margin: 0; font-size: 1.1rem;">✏️ 修改报价</h3>
                            <div style="font-size: 0.85rem; opacity: 0.9; margin-top: 4px;">${player.name} · ${yearLabels[player.year]} · ${level.icon} ${player.potential}潜力</div>
                        </div>
                    </div>
                    <span class="close" onclick="this.closest('.modal').remove()" style="position: absolute; right: 20px; top: 20px; font-size: 1.5rem; cursor: pointer; opacity: 0.8;">&times;</span>
                </div>
                
                <!-- 内容 -->
                <div class="modal-body" style="padding: 24px;">
                    <div class="offer-form">
                        <!-- 奖学金 -->
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px;">
                                <span>💰 奖学金比例</span>
                                <span id="mod-scholarship-val" style="color: var(--accent-color); font-weight: 600;">${Math.round((negotiation.offer?.scholarship || 0.5) * 100)}%</span>
                            </label>
                            <input type="range" id="mod-scholarship" min="0" max="100" value="${Math.round((negotiation.offer?.scholarship || 0.5) * 100)}" 
                                style="width: 100%; height: 6px; border-radius: 3px; background: linear-gradient(to right, #667eea 0%, #764ba2 ${(negotiation.offer?.scholarship || 0.5) * 100}%, rgba(255,255,255,0.1) ${(negotiation.offer?.scholarship || 0.5) * 100}%); -webkit-appearance: none; cursor: pointer;"
                                oninput="this.style.background = 'linear-gradient(to right, #667eea 0%, #764ba2 ' + this.value + '%, rgba(255,255,255,0.1) ' + this.value + '%)'; document.getElementById('mod-scholarship-val').textContent = this.value + '%'">
                            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-top: 6px;">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                        </div>
                        
                        <!-- 出场时间 -->
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px;">
                                <span>⏱️ 承诺出场时间</span>
                                <span id="mod-playingtime-val" style="color: var(--accent-color); font-weight: 600;">${negotiation.offer?.playingTime || 20}分钟/场</span>
                            </label>
                            <input type="range" id="mod-playingtime" min="5" max="40" step="5" value="${negotiation.offer?.playingTime || 20}" 
                                style="width: 100%; height: 6px; border-radius: 3px; background: linear-gradient(to right, #667eea 0%, #764ba2 ${((negotiation.offer?.playingTime || 20) / 40) * 100}%, rgba(255,255,255,0.1) ${((negotiation.offer?.playingTime || 20) / 40) * 100}%); -webkit-appearance: none; cursor: pointer;"
                                oninput="this.style.background = 'linear-gradient(to right, #667eea 0%, #764ba2 ' + (this.value/40*100) + '%, rgba(255,255,255,0.1) ' + (this.value/40*100) + '%)'; document.getElementById('mod-playingtime-val').textContent = this.value + '分钟/场'">
                            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-top: 6px;">
                                <span>5分钟</span>
                                <span>20分钟</span>
                                <span>40分钟</span>
                            </div>
                        </div>
                        
                        <!-- 角色定位 -->
                        <div class="form-group" style="margin-bottom: 10px;">
                            <label style="display: block; font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px;">🎯 角色定位</label>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                                <label style="display: flex; align-items: center; gap: 8px; padding: 12px; background: ${negotiation.offer?.role === '核心' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255,255,255,0.05)'}; border: 2px solid ${negotiation.offer?.role === '核心' ? '#667eea' : 'transparent'}; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
                                    <input type="radio" name="mod-role" value="核心" ${negotiation.offer?.role === '核心' ? 'checked' : ''} style="display: none;">
                                    <span>⭐ 核心球星</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; padding: 12px; background: ${negotiation.offer?.role === '主力' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255,255,255,0.05)'}; border: 2px solid ${negotiation.offer?.role === '主力' ? '#667eea' : 'transparent'}; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
                                    <input type="radio" name="mod-role" value="主力" ${negotiation.offer?.role === '主力' ? 'checked' : ''} style="display: none;">
                                    <span>🏀 首发主力</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; padding: 12px; background: ${negotiation.offer?.role === '轮换' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255,255,255,0.05)'}; border: 2px solid ${negotiation.offer?.role === '轮换' ? '#667eea' : 'transparent'}; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
                                    <input type="radio" name="mod-role" value="轮换" ${negotiation.offer?.role === '轮换' ? 'checked' : ''} style="display: none;">
                                    <span>🔄 重要轮换</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; padding: 12px; background: ${negotiation.offer?.role === '替补' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255,255,255,0.05)'}; border: 2px solid ${negotiation.offer?.role === '替补' ? '#667eea' : 'transparent'}; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
                                    <input type="radio" name="mod-role" value="替补" ${negotiation.offer?.role === '替补' ? 'checked' : ''} style="display: none;">
                                    <span>🪑 替补球员</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 按钮 -->
                    <div class="modal-actions" style="margin-top: 24px; display: flex; gap: 12px;">
                        <button class="btn-secondary" onclick="this.closest('.modal').remove()" style="flex: 1; padding: 12px; background: rgba(107, 114, 128, 0.2); color: var(--text-secondary); border: 1px solid rgba(107, 114, 128, 0.3); border-radius: 10px; font-size: 0.95rem; cursor: pointer;">取消</button>
                        <button class="btn-primary" id="save-offer-btn" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-size: 0.95rem; cursor: pointer; font-weight: 500;">💾 保存报价</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        // 绑定角色选择事件
        modal.querySelectorAll('input[name="mod-role"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                modal.querySelectorAll('input[name="mod-role"]').forEach(r => {
                    const label = r.closest('label');
                    if (r.checked) {
                        label.style.background = 'rgba(102, 126, 234, 0.2)';
                        label.style.borderColor = '#667eea';
                    } else {
                        label.style.background = 'rgba(255,255,255,0.05)';
                        label.style.borderColor = 'transparent';
                    }
                });
            });
        });

        // 绑定保存按钮
        document.getElementById('save-offer-btn').addEventListener('click', () => {
            const selectedRole = modal.querySelector('input[name="mod-role"]:checked')?.value || '主力';
            const newOffer = {
                scholarship: parseInt(document.getElementById('mod-scholarship').value) / 100,
                playingTime: parseInt(document.getElementById('mod-playingtime').value),
                role: selectedRole
            };

            // 更新报价
            if (window.negotiationManager?.updateOffer) {
                window.negotiationManager.updateOffer(negotiationId, newOffer);
            } else if (negotiation.offer) {
                // 直接修改谈判对象
                Object.assign(negotiation.offer, newOffer);
            }

            // 更新显示
            this.loadNegotiationData(negotiation.playerId || negotiation.player?.id || player.id);
            
            modal.remove();
            this.showNotification('报价已更新', 'success');
        });
    }
}

if (typeof window !== 'undefined') {
    window.RecruitmentInterface = RecruitmentInterface;
}
