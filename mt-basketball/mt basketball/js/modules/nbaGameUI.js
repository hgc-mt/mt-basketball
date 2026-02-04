/**
 * NBA-Style Game UI Module
 * Handles professional broadcast-style game interface
 */

class NBAGameUI {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.gameState = null;
        this.animationFrame = null;
        this.lastUpdate = 0;
        this.substitutionQueue = [];
        this.isSubstitutionAnimating = false;
        this.teamColors = {
            home: { primary: '#CE1141', secondary: '#C4CED4' },
            away: { primary: '#007A33', secondary: '#BEC0C2' }
        };
    }

    /**
     * Initialize the NBA-style game UI
     */
    initialize() {
        this.setupGameModal();
        this.setupScorePanel();
        this.setupPlayerStatsPanel();
        this.setupSubstitutionPanel();
        this.setupGameControls();
    }

    /**
     * Setup game modal structure
     */
    setupGameModal() {
        const modal = document.getElementById('game-modal');
        if (!modal) return;

        const content = modal.querySelector('.game-modal-content');
        if (!content) return;

        content.innerHTML = `
            <span class="close">&times;</span>
            
            <!-- 主比赛画面区域 -->
            <div class="game-court-container" id="game-court">
                <div class="court-overlay">
                    <div class="court-lines"></div>
                    <div class="center-court-logo" id="center-logo"></div>
                </div>
                
                <!-- 比赛画面中心信息 -->
                <div class="game-center-info" id="game-center-info">
                    <div class="current-quarter" id="current-quarter">Q1</div>
                    <div class="shot-clock" id="shot-clock">24</div>
                </div>
            </div>
            
            <!-- 左上角球队信息 -->
            <div class="team-header home-team-header" id="home-team-header">
                <div class="team-logo" id="home-team-logo"></div>
                <div class="team-info">
                    <div class="team-name" id="home-team-name">HOME</div>
                    <div class="team-record" id="home-team-record">0-0</div>
                </div>
            </div>
            
            <!-- 右上角球队信息 -->
            <div class="team-header away-team-header" id="away-team-header">
                <div class="team-info">
                    <div class="team-name" id="away-team-name">AWAY</div>
                    <div class="team-record" id="away-team-record">0-0</div>
                </div>
                <div class="team-logo" id="away-team-logo"></div>
            </div>
            
            <!-- 右下角实时比分面板 -->
            <div class="score-panel" id="score-panel">
                <div class="score-row">
                    <div class="team-score home">
                        <span class="score-value" id="home-score">0</span>
                    </div>
                    <div class="score-divider">
                        <span class="period-indicator" id="period-indicator">Q1</span>
                        <span class="time-remaining" id="time-remaining">12:00</span>
                    </div>
                    <div class="team-score away">
                        <span class="score-value" id="away-score">0</span>
                    </div>
                </div>
                <div class="score-details">
                    <div class="team-details home">
                        <span class="fouls" id="home-fouls">F:0</span>
                        <span class="timeouts" id="home-timeouts">T:0</span>
                    </div>
                    <div class="shot-clock-indicator">
                        <span class="label">SHOT</span>
                        <span class="value" id="shot-clock-display">24</span>
                    </div>
                    <div class="team-details away">
                        <span class="timeouts" id="away-timeouts">T:0</span>
                        <span class="fouls" id="away-fouls">F:0</span>
                    </div>
                </div>
            </div>
            
            <!-- 左侧球员数据面板 -->
            <div class="player-stats-panel left-panel" id="player-stats-left">
                <div class="panel-header">
                    <span class="team-abbrev" id="home-abbrev">HOME</span>
                </div>
                <div class="player-stats-list" id="home-players-list"></div>
                <div class="team-totals" id="home-totals"></div>
            </div>
            
            <!-- 右侧球员数据面板 -->
            <div class="player-stats-panel right-panel" id="player-stats-right">
                <div class="panel-header">
                    <span class="team-abbrev" id="away-abbrev">AWAY</span>
                </div>
                <div class="player-stats-list" id="away-players-list"></div>
                <div class="team-totals" id="away-totals"></div>
            </div>
            
            <!-- 轮换信息提示 -->
            <div class="substitution-panel" id="substitution-panel">
                <div class="substitution-content">
                    <div class="sub-out">
                        <span class="label">OUT</span>
                        <span class="player-name" id="sub-out-name"></span>
                    </div>
                    <div class="sub-arrow">→</div>
                    <div class="sub-in">
                        <span class="label">IN</span>
                        <span class="player-name" id="sub-in-name"></span>
                    </div>
                </div>
            </div>
            
            <!-- 底部比赛控制栏 -->
            <div class="game-controls-overlay">
                <div class="control-group left">
                    <button class="control-btn" id="pause-game-btn">
                        <span class="icon">⏸</span>
                        <span class="label">暂停</span>
                    </button>
                    <button class="control-btn" id="resume-game-btn" style="display:none;">
                        <span class="icon">▶</span>
                        <span class="label">继续</span>
                    </button>
                </div>
                <div class="control-group center">
                    <div class="speed-control">
                        <button class="speed-btn active" data-speed="1">1x</button>
                        <button class="speed-btn" data-speed="2">2x</button>
                        <button class="speed-btn" data-speed="4">4x</button>
                    </div>
                </div>
                <div class="control-group right">
                    <button class="control-btn" id="speed-up-btn">
                        <span class="icon">⚡</span>
                        <span class="label">加速</span>
                    </button>
                    <button class="control-btn close-btn" id="close-game-btn">
                        <span class="icon">✕</span>
                        <span class="label">关闭</span>
                    </button>
                </div>
            </div>
            
            <!-- 实时事件流 -->
            <div class="game-events-feed" id="game-events-feed">
                <div class="events-header">LIVE EVENTS</div>
                <div class="events-list" id="events-list"></div>
            </div>
        `;

        this.bindEvents();
    }

    /**
     * Setup score panel
     */
    setupScorePanel() {
        this.scorePanel = document.getElementById('score-panel');
        this.homeScoreEl = document.getElementById('home-score');
        this.awayScoreEl = document.getElementById('away-score');
        this.timeRemainingEl = document.getElementById('time-remaining');
        this.periodIndicatorEl = document.getElementById('period-indicator');
        this.shotClockDisplayEl = document.getElementById('shot-clock-display');
    }

    /**
     * Setup player stats panels
     */
    setupPlayerStatsPanel() {
        this.homePlayersList = document.getElementById('home-players-list');
        this.awayPlayersList = document.getElementById('away-players-list');
        this.homeTotals = document.getElementById('home-totals');
        this.awayTotals = document.getElementById('away-totals');
    }

    /**
     * Setup substitution panel
     */
    setupSubstitutionPanel() {
        this.substitutionPanel = document.getElementById('substitution-panel');
        this.subOutName = document.getElementById('sub-out-name');
        this.subInName = document.getElementById('sub-in-name');
    }

    /**
     * Setup game controls
     */
    setupGameControls() {
        const pauseBtn = document.getElementById('pause-game-btn');
        const resumeBtn = document.getElementById('resume-game-btn');
        const closeBtn = document.getElementById('close-game-btn');
        const speedBtns = document.querySelectorAll('.speed-btn');

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.gameEngine.pauseGame());
        }
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => this.gameEngine.resumeGame());
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeGame());
        }

        speedBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const speed = parseInt(e.target.dataset.speed);
                this.setGameSpeed(speed);
                speedBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        const closeBtn = document.querySelector('#game-modal .close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeGame());
        }
    }

    /**
     * Start a new game with NBA-style UI
     */
    startGame(gameState) {
        this.gameState = gameState;
        this.updateTeamHeaders();
        this.updateScorePanel();
        this.updatePlayerStats();
        this.showGameModal();
        this.startGameLoop();
    }

    /**
     * Show game modal
     */
    showGameModal() {
        const modal = document.getElementById('game-modal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Close game
     */
    closeGame() {
        const modal = document.getElementById('game-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        this.stopGameLoop();
        if (this.gameEngine) {
            this.gameEngine.endGame(this.gameState);
        }
    }

    /**
     * Update team headers
     */
    updateTeamHeaders() {
        if (!this.gameState) return;

        const homeTeam = this.gameState.homeTeam;
        const awayTeam = this.gameState.awayTeam;

        const homeNameEl = document.getElementById('home-team-name');
        const awayNameEl = document.getElementById('away-team-name');
        const homeAbbrevEl = document.getElementById('home-abbrev');
        const awayAbbrevEl = document.getElementById('away-abbrev');

        if (homeNameEl) homeNameEl.textContent = homeTeam.name.substring(0, 10);
        if (awayNameEl) awayNameEl.textContent = awayTeam.name.substring(0, 10);
        if (homeAbbrevEl) homeAbbrevEl.textContent = homeTeam.abbrev || homeTeam.name.substring(0, 3).toUpperCase();
        if (awayAbbrevEl) awayAbbrevEl.textContent = awayTeam.abbrev || awayTeam.name.substring(0, 3).toUpperCase();

        this.applyTeamColors();
    }

    /**
     * Apply team colors to UI
     */
    applyTeamColors() {
        const homeHeader = document.querySelector('.home-team-header');
        const awayHeader = document.querySelector('.away-team-header');
        const homeScore = document.querySelector('.team-score.home');
        const awayScore = document.querySelector('.team-score.away');
        const homePanel = document.querySelector('.player-stats-panel.left-panel');
        const awayPanel = document.querySelector('.player-stats-panel.right-panel');

        if (homeHeader) {
            homeHeader.style.background = `linear-gradient(135deg, ${this.teamColors.home.primary}dd, ${this.teamColors.home.primary}88)`;
        }
        if (awayHeader) {
            awayHeader.style.background = `linear-gradient(135deg, ${this.teamColors.away.primary}dd, ${this.teamColors.away.primary}88)`;
        }
        if (homeScore) {
            homeScore.style.color = this.teamColors.home.primary;
        }
        if (awayScore) {
            awayScore.style.color = this.teamColors.away.primary;
        }
        if (homePanel) {
            homePanel.style.borderColor = this.teamColors.home.primary;
        }
        if (awayPanel) {
            awayPanel.style.borderColor = this.teamColors.away.primary;
        }
    }

    /**
     * Update score panel
     */
    updateScorePanel() {
        if (!this.gameState) return;

        const quarters = ['Q1', 'Q2', 'Q3', 'Q4', 'OT'];
        const currentQuarter = quarters[Math.min(this.gameState.quarter - 1, 4)];
        const timeRemaining = this.formatTime(this.gameState.timeRemaining);

        if (this.homeScoreEl) {
            this.homeScoreEl.textContent = this.gameState.homeScore;
        }
        if (this.awayScoreEl) {
            this.awayScoreEl.textContent = this.gameState.awayScore;
        }
        if (this.timeRemainingEl) {
            this.timeRemainingEl.textContent = timeRemaining;
        }
        if (this.periodIndicatorEl) {
            this.periodIndicatorEl.textContent = currentQuarter;
        }
        if (this.shotClockDisplayEl) {
            this.shotClockDisplayEl.textContent = this.gameState.shotClock || 24;
        }

        const homeFouls = document.getElementById('home-fouls');
        const awayFouls = document.getElementById('away-fouls');
        const homeTimeouts = document.getElementById('home-timeouts');
        const awayTimeouts = document.getElementById('away-timeouts');

        if (homeFouls) homeFouls.textContent = `F:${this.gameState.teamStats?.home?.fouls || 0}`;
        if (awayFouls) awayFouls.textContent = `F:${this.gameState.teamStats?.away?.fouls || 0}`;
        if (homeTimeouts) homeTimeouts.textContent = `T:${this.gameState.homeTimeouts || 6}`;
        if (awayTimeouts) awayTimeouts.textContent = `T:${this.gameState.awayTimeouts || 6}`;
    }

    /**
     * Update player stats panels
     */
    updatePlayerStats() {
        if (!this.gameState) return;

        this.renderHomePlayerStats();
        this.renderAwayPlayerStats();
        this.renderTeamTotals();
    }

    /**
     * Render home team player stats
     */
    renderHomePlayerStats() {
        if (!this.homePlayersList || !this.gameState.playerStats?.home) return;

        const starters = this.gameState.homeLineup || [];
        const stats = this.gameState.playerStats.home;

        let html = '';
        starters.forEach(player => {
            const playerStats = stats[player.id] || this.getEmptyPlayerStats();
            html += this.createPlayerStatItem(player, playerStats, 'home');
        });

        this.homePlayersList.innerHTML = html;
    }

    /**
     * Render away team player stats
     */
    renderAwayPlayerStats() {
        if (!this.awayPlayersList || !this.gameState.playerStats?.away) return;

        const starters = this.gameState.awayLineup || [];
        const stats = this.gameState.playerStats.away;

        let html = '';
        starters.forEach(player => {
            const playerStats = stats[player.id] || this.getEmptyPlayerStats();
            html += this.createPlayerStatItem(player, playerStats, 'away');
        });

        this.awayPlayersList.innerHTML = html;
    }

    /**
     * Create player stat item HTML
     */
    createPlayerStatItem(player, stats, team) {
        const position = player.position?.substring(0, 2) || '';
        const number = player.number || '#';
        const color = team === 'home' ? this.teamColors.home.primary : this.teamColors.away.primary;

        return `
            <div class="player-stat-item" style="border-left-color: ${color}">
                <div class="player-info">
                    <span class="player-number">${number}</span>
                    <span class="player-name">${player.name?.substring(0, 6) || 'N/A'}</span>
                    <span class="player-position">${position}</span>
                </div>
                <div class="player-stats">
                    <span class="stat pts">${stats.points || 0}</span>
                    <span class="stat reb">${stats.rebounds || 0}</span>
                    <span class="stat ast">${stats.assists || 0}</span>
                </div>
            </div>
        `;
    }

    /**
     * Get empty player stats
     */
    getEmptyPlayerStats() {
        return {
            points: 0,
            rebounds: 0,
            assists: 0,
            steals: 0,
            blocks: 0,
            turnovers: 0,
            minutes: '0:00'
        };
    }

    /**
     * Render team totals
     */
    renderTeamTotals() {
        if (!this.gameState) return;

        const homeStats = this.gameState.teamStats?.home || {};
        const awayStats = this.gameState.teamStats?.away || {};

        if (this.homeTotals) {
            this.homeTotals.innerHTML = `
                <div class="total-item">
                    <span class="label">TOTAL</span>
                    <span class="value">${homeStats.assists || 0} AST</span>
                </div>
                <div class="total-item">
                    <span class="label">REB</span>
                    <span class="value">${homeStats.rebounds?.total || 0}</span>
                </div>
            `;
        }

        if (this.awayTotals) {
            this.awayTotals.innerHTML = `
                <div class="total-item">
                    <span class="label">TOTAL</span>
                    <span class="value">${awayStats.assists || 0} AST</span>
                </div>
                <div class="total-item">
                    <span class="label">REB</span>
                    <span class="value">${awayStats.rebounds?.total || 0}</span>
                </div>
            `;
        }
    }

    /**
     * Show substitution notification
     */
    showSubstitution(outPlayer, inPlayer) {
        if (this.isSubstitutionAnimating) {
            this.substitutionQueue.push({ outPlayer, inPlayer });
            return;
        }

        this.isSubstitutionAnimating = true;

        if (this.subOutName) this.subOutName.textContent = outPlayer?.name || 'Unknown';
        if (this.subInName) this.subInName.textContent = inPlayer?.name || 'Unknown';

        this.substitutionPanel.classList.add('show');

        setTimeout(() => {
            this.substitutionPanel.classList.remove('show');
            this.isSubstitutionAnimating = false;

            if (this.substitutionQueue.length > 0) {
                const next = this.substitutionQueue.shift();
                this.showSubstitution(next.outPlayer, next.inPlayer);
            }
        }, 3000);
    }

    /**
     * Add game event
     */
    addGameEvent(event) {
        const eventsList = document.getElementById('events-list');
        if (!eventsList) return;

        const eventEl = document.createElement('div');
        eventEl.className = `game-event ${event.type}`;
        eventEl.innerHTML = `
            <span class="event-time">${this.formatTime(this.gameState?.timeRemaining || 0)}</span>
            <span class="event-text">${event.text}</span>
        `;

        eventsList.insertBefore(eventEl, eventsList.firstChild);

        while (eventsList.children.length > 10) {
            eventsList.removeChild(eventsList.lastChild);
        }
    }

    /**
     * Start game loop
     */
    startGameLoop() {
        this.lastUpdate = performance.now();
        this.gameLoop();
    }

    /**
     * Game loop
     */
    gameLoop() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastUpdate;

        if (deltaTime >= 16) { // ~60 FPS
            this.lastUpdate = currentTime;
            this.updateUI();
        }

        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Stop game loop
     */
    stopGameLoop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /**
     * Update UI
     */
    updateUI() {
        if (!this.gameState || this.gameEngine.isPaused) return;

        this.updateScorePanel();
        this.updatePlayerStats();
    }

    /**
     * Set game speed
     */
    setGameSpeed(speed) {
        if (this.gameEngine) {
            this.gameEngine.setSpeed(speed);
        }
    }

    /**
     * Format time
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Update from game state
     */
    updateFromGameState(gameState) {
        this.gameState = gameState;
        this.updateUI();
    }

    /**
     * Handle pause/resume
     */
    setPaused(isPaused) {
        const pauseBtn = document.getElementById('pause-game-btn');
        const resumeBtn = document.getElementById('resume-game-btn');

        if (pauseBtn) pauseBtn.style.display = isPaused ? 'none' : 'flex';
        if (resumeBtn) resumeBtn.style.display = isPaused ? 'flex' : 'none';
    }
}
