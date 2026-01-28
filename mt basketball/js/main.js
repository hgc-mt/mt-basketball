/**
 * Main application entry point for the Basketball Manager game
 * Initializes and coordinates all modules
 */

// import { GameStateManager } from './modules/gameStateManager.js';
// import { UIManager } from './modules/uiManager.js';
// import { GameEngine } from './modules/gameEngine.js';
// import { TeamManager } from './modules/teamManager.js';
// import { PlayerDevelopment } from './modules/playerDevelopment.js';
// import { MarketManager } from './modules/marketManager.js';
// import { ScoutingSystem } from './modules/scoutingSystem.js';
// import { CoachManager } from './modules/coachManager.js';
// import { SeasonManager } from './modules/seasonManager.js';
// import { FinanceManager } from './modules/financeManager.js';
// import { EventSystem } from './modules/eventSystem.js';
// import { GameInitializer } from './modules/gameInitializer.js';
// import { PixiRenderer } from './modules/pixiRenderer.js';
// import { NegotiationManager } from './modules/negotiationManager.js';

/**
 * Main application class
 */
class BasketballManagerApp {
    constructor() {
        this.gameStateManager = new GameStateManager();
        this.uiManager = new UIManager(this.gameStateManager);
        this.gameEngine = new GameEngine(this.gameStateManager);
        this.teamManager = new TeamManager(this.gameStateManager);
        this.playerDevelopment = new PlayerDevelopment(this.gameStateManager);
        this.scheduleManager = new ScheduleManager(this.gameStateManager);
        this.contractManager = new ContractManager(this.gameStateManager);
        this.marketManager = new MarketManager(this.gameStateManager);
        this.scoutingSystem = new ScoutingSystem(this.gameStateManager);
        this.coachManager = new CoachManager(this.gameStateManager);
        this.seasonManager = new SeasonManager(this.gameStateManager);
        this.financeManager = new FinanceManager(this.gameStateManager);
        this.eventSystem = new EventSystem(this.gameStateManager);
        this.gameSimulationAdapter = new GameSimulationAdapter(this.gameEngine, this.gameStateManager);
        this.gameInitializer = new GameInitializer(this.gameStateManager);
        this.negotiationManager = new NegotiationManager(this.gameStateManager);
        this.enhancedNegotiationManager = new EnhancedNegotiationManager(this.gameStateManager);
        this.skipRuleManager = new SkipRuleManager(this.gameStateManager);
        this.recruitmentInterface = new RecruitmentInterface(this.gameStateManager, this.gameInitializer);
        this.dataSyncManager = new DataSyncManager(this.gameStateManager);

        this.pixiRenderer = null;
        this.currentScheduleWeek = 1;

        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Check for save game and show start screen
            this.checkSaveGame();
            this.showStartScreen();
            
            this.isInitialized = true;
            console.log('Application ready, waiting for user input...');
        } catch (error) {
            console.error('Failed to initialize application:', error);
        }
    }
    
    /**
     * Check if save game exists
     */
    checkSaveGame() {
        const saveData = localStorage.getItem('basketballManagerSave');
        const saveInfo = document.getElementById('save-info');
        const saveDetails = document.getElementById('save-details');
        const continueBtn = document.getElementById('btn-continue');
        const startWarning = document.getElementById('start-warning');
        
        if (saveData) {
            try {
                const parsed = JSON.parse(saveData);
                const saveDate = parsed.savedAt ? new Date(parsed.savedAt) : null;
                
                saveInfo.style.display = 'block';
                continueBtn.style.display = 'flex';
                startWarning.style.display = 'block';
                
                let rosterSize = 0;
                if (parsed.state?.userTeam?.roster) {
                    rosterSize = parsed.state.userTeam.roster.length;
                }
                
                let teamName = '未知';
                if (parsed.state?.userTeam?.name) {
                    teamName = parsed.state.userTeam.name;
                }
                
                let currentDate = '未知';
                if (parsed.state?.currentDate) {
                    const date = new Date(parsed.state.currentDate);
                    currentDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
                }
                
                let seasonPhase = '休赛期';
                if (parsed.state?.seasonPhase) {
                    seasonPhase = parsed.state.seasonPhase === 'offseason' ? '休赛期' : 
                                  parsed.state.seasonPhase === 'preseason' ? '季前赛' : 
                                  parsed.state.seasonPhase === 'regular' ? '常规赛' : '季后赛';
                }
                
                saveDetails.innerHTML = `
                    <div>🏀 球队: ${teamName}</div>
                    <div>👥 球员数: ${rosterSize} 人</div>
                    <div>📅 日期: ${currentDate}</div>
                    <div>🎯 阶段: ${seasonPhase}</div>
                    <div class="save-date">💾 保存时间: ${saveDate ? saveDate.toLocaleString('zh-CN') : '未知'}</div>
                `;
            } catch (e) {
                console.error('Failed to parse save data:', e);
                saveInfo.style.display = 'none';
            }
        } else {
            saveInfo.style.display = 'none';
            continueBtn.style.display = 'none';
            startWarning.style.display = 'none';
        }
    }
    
    /**
     * Show start screen
     */
    showStartScreen() {
        const startScreen = document.getElementById('start-screen');
        const app = document.getElementById('app');
        if (startScreen) {
            startScreen.style.display = 'flex';
        }
        if (app) {
            app.style.display = 'none';
        }
    }
    
    /**
     * Hide start screen and show app
     */
    hideStartScreen() {
        const startScreen = document.getElementById('start-screen');
        const app = document.getElementById('app');
        if (startScreen) {
            startScreen.style.display = 'none';
        }
        if (app) {
            app.style.display = 'block';
        }
    }
    
    /**
     * Update all team name displays
     */
    updateTeamNameDisplay() {
        const state = this.gameStateManager.getState();
        const teamName = state.userTeam?.name || state.teamName || '未命名球队';
        
        // Update header
        const headerTeamName = document.getElementById('team-name');
        if (headerTeamName) {
            headerTeamName.textContent = teamName;
        }
        
        // Update team management screen
        const screenTeamName = document.getElementById('team-university-name');
        if (screenTeamName) {
            screenTeamName.textContent = teamName;
        }
    }
    
    /**
     * Edit team name
     */
    editTeamName() {
        const state = this.gameStateManager.getState();
        const currentName = state.userTeam?.name || state.teamName || '';
        
        const newName = prompt('请输入球队名称:', currentName);
        
        if (newName && newName.trim() !== '') {
            const trimmedName = newName.trim();
            
            // Update in game state
            if (state.userTeam) {
                state.userTeam.name = trimmedName;
            }
            this.gameStateManager.set('teamName', trimmedName);
            
            // Update display
            this.updateTeamNameDisplay();
            
            // Save game
            this.gameStateManager.saveGameState();
            
            this.showNotification(`球队名称已更新为: ${trimmedName}`, 'success');
        }
    }
    
    /**
     * Start the actual game initialization
     */
    async startGameInitialization(loadSave = false) {
        try {
            console.log('Starting application initialization...', loadSave ? '(loading save)' : '(new game)');

            // Initialize Pixi.js renderer first (if available)
            if (typeof window.PixiRenderer !== 'undefined') {
                console.log('Initializing Pixi.js Renderer...');
                this.pixiRenderer = new window.PixiRenderer();
                const pixiReady = await this.pixiRenderer.init('pixi-canvas');
                if (pixiReady) {
                    console.log('Pixi.js Renderer initialized successfully');
                } else {
                    this.pixiRenderer = null;
                }
            } else {
                console.log('Pixi.js not available, skipping PixiRenderer initialization');
                this.pixiRenderer = null;
            }

            // Initialize game state first
            console.log('Initializing Game State Manager...');
            await this.gameStateManager.initialize();

            // If loading save, don't create new game
            if (!loadSave) {
                console.log('Initializing new game with empty roster...');
                this.gameInitializer.initializeNewGame();
            } else {
                console.log('Loaded save game, preserving roster...');
            }

            // Initialize all modules in sequence
            console.log('Initializing UI Manager...');
            await this.uiManager.initialize();

            console.log('Initializing Team Manager...');
            await this.teamManager.initialize();

            console.log('Initializing Player Development...');
            await this.playerDevelopment.initialize();

            console.log('Initializing Schedule Manager...');
            await this.scheduleManager.initialize();

            console.log('Initializing Contract Manager...');
            await this.contractManager.initialize();
            this.contractManager.setDataSyncManager(this.dataSyncManager);

            console.log('Initializing Market Manager...');
            await this.marketManager.initialize();

            console.log('Initializing Scouting System...');
            await this.scoutingSystem.initialize();

            console.log('Initializing Coach Manager...');
            await this.coachManager.initialize();

            console.log('Initializing Season Manager...');
            await this.seasonManager.initialize();

            console.log('Initializing Finance Manager...');
            await this.financeManager.initialize();

            console.log('Initializing Game Engine...');
            await this.gameEngine.initialize();

            console.log('Initializing Event System...');
            await this.eventSystem.initialize();

            console.log('Initializing Game Initializer...');
            await this.gameInitializer.initialize();

            console.log('Initializing Negotiation Manager...');
            await this.negotiationManager.initialize();

            console.log('Initializing Enhanced Negotiation Manager...');
            await this.enhancedNegotiationManager.initialize();

            console.log('Initializing Skip Rule Manager...');
            await this.skipRuleManager.initialize();
            
            // Set up skipRuleManager reference for enhancedNegotiationManager
            this.enhancedNegotiationManager.setSkipRuleManager(this.skipRuleManager);

            // Initialize Recruitment Interface AFTER game data is created
            console.log('Initializing Recruitment Interface...');
            await this.recruitmentInterface.initialize();
            
            // Set up recruitment tabs
            this.recruitmentInterface.setupRecruitmentTabs();
            this.recruitmentInterface.updateAllTabCounts();
            
            // Update batch skip section
            updateBatchSkipSection();

            // Update team name display
            this.updateTeamNameDisplay();

            // Set up module dependencies
            console.log('Setting up module dependencies...');
            this.setupModuleDependencies();
            
            // Initialize Data Sync Manager after all modules are ready
            console.log('Initializing Data Sync Manager...');
            await this.dataSyncManager.initialize();
            
            // Set global reference for negotiation manager
            window.negotiationManager = this.negotiationManager;
            
            // Set global reference for recruitment interface
            window.recruitmentInterface = this.recruitmentInterface;
            
            // Set global notification function
            window.showNotification = (message, type = 'info') => {
                this.showNotification(message, type);
            };

            // Set up event listeners
            console.log('Setting up event listeners...');
            this.setupEventListeners();

            // Render schedule UI
            console.log('Rendering schedule...');
            this.renderSchedule();

            // Set up Pixi.js event handlers
            this.setupPixiEventHandlers();

            this.isInitialized = true;
            console.log('Basketball Manager application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
        }
    }

    /**
     * Set up Pixi.js event handlers
     */
    setupPixiEventHandlers() {
        if (this.pixiRenderer && this.pixiRenderer.app) {
            this.pixiRenderer.onCardClick = (player) => {
                console.log('Player card clicked:', player.name);
                if (this.teamManager) {
                    this.teamManager.showPlayerDetails(player.id);
                }
            };
        }
    }

    /**
     * Render player cards using Pixi.js
     */
    renderPlayerCards(containerId = 'roster') {
        if (!this.pixiRenderer || !this.pixiRenderer.app) return;

        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        if (!userTeam) return;

        this.pixiRenderer.clearCards();

        userTeam.roster.forEach((player, index) => {
            const x = 30 + (index % 2) * 400;
            const y = 30 + Math.floor(index / 2) * 230;
            this.pixiRenderer.createPlayerCard(player, x, y);
        });
    }

    /**
     * Render standings using Pixi.js
     */
    renderStandings(containerId = 'standings-content') {
        if (!this.pixiRenderer || !this.pixiRenderer.app) return;

        const state = this.gameStateManager.getState();
        const allTeams = state.allTeams || [];
        const userTeam = state.userTeam;

        this.pixiRenderer.clearStandings();

        const sortedTeams = [...allTeams].sort((a, b) => {
            const aWins = a.stats?.wins || 0;
            const aLosses = a.stats?.losses || 0;
            const bWins = b.stats?.wins || 0;
            const bLosses = b.stats?.losses || 0;
            const aPct = aWins + aLosses > 0 ? aWins / (aWins + aLosses) : 0;
            const bPct = bWins + bLosses > 0 ? bWins / (bWins + bLosses) : 0;
            return bPct - aPct;
        });

        sortedTeams.forEach((team, index) => {
            const isUserTeam = userTeam && team.id === userTeam.id;
            this.pixiRenderer.createStandingRow(
                team,
                index + 1,
                30,
                30 + index * 60,
                760,
                50,
                isUserTeam
            );
        });
    }

    /**
     * Show training effect using Pixi.js
     */
    showTrainingEffect(playerId, attribute) {
        if (!this.pixiRenderer || !this.pixiRenderer.app) return;

        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        if (!userTeam) return;

        const player = userTeam.getPlayer(playerId);
        if (!player) return;

        const playerIndex = userTeam.roster.indexOf(player);
        const x = 80 + (playerIndex % 2) * 400;
        const y = 80 + Math.floor(playerIndex / 2) * 230;

        this.pixiRenderer.createTrainingEffect(x, y);
    }

    /**
     * Show skill badge using Pixi.js
     */
    showSkillBadge(playerId, skillName) {
        if (!this.pixiRenderer || !this.pixiRenderer.app) return;

        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        if (!userTeam) return;

        const player = userTeam.getPlayer(playerId);
        if (!player) return;

        const playerIndex = userTeam.roster.indexOf(player);
        const x = 250 + (playerIndex % 2) * 400;
        const y = 150 + Math.floor(playerIndex / 2) * 230;

        this.pixiRenderer.createSkillBadge(x, y, skillName);
    }

    /**
     * Set up dependencies between modules
     */
    setupModuleDependencies() {
        // UI Manager needs to know about other modules for screen updates
        this.uiManager.setDependencies({
            teamManager: this.teamManager,
            playerDevelopment: this.playerDevelopment,
            recruitmentInterface: this.recruitmentInterface,
            scoutingSystem: this.scoutingSystem,
            coachManager: this.coachManager,
            seasonManager: this.seasonManager,
            financeManager: this.financeManager,
            gameEngine: this.gameEngine
        });

        // Game engine needs to notify other modules of game events
        this.gameEngine.setEventSystem(this.eventSystem);

        // Season manager needs to coordinate with other modules
        this.seasonManager.setDependencies({
            teamManager: this.teamManager,
            gameEngine: this.gameEngine,
            financeManager: this.financeManager
        });

        // Schedule manager setup
        this.scheduleManager.setPlayerTeam();
    }

    /**
     * Render schedule screen
     */
    renderSchedule() {
        if (!this.scheduleManager) return;
        
        const scheduleManager = this.scheduleManager;
        const progress = scheduleManager.getSeasonProgress();
        const summary = scheduleManager.getSeasonSummary();
        const nextGame = scheduleManager.getNextGame();
        
        // Handle offseason display
        const isOffseason = progress.isBeforeSeason || progress.phase === 'offseason';
        const weekDisplay = isOffseason ? '休赛期' : `第 ${progress.week} 周`;
        const remainingDisplay = isOffseason ? '-' : (progress.totalWeeks - progress.week + 1);
        const progressPercent = isOffseason ? 0 : progress.progress;
        
        // Update season stats
        document.getElementById('season-week').textContent = isOffseason ? '休赛期' : progress.week;
        document.getElementById('season-record').textContent = `${summary.wins}-${summary.losses}`;
        document.getElementById('season-games').textContent = summary.played;
        document.getElementById('season-remaining').textContent = remainingDisplay;
        
        // Update progress bar
        document.getElementById('season-progress-bar').style.width = `${progressPercent}%`;
        document.getElementById('progress-week').textContent = weekDisplay;
        document.getElementById('progress-total').textContent = `共 ${progress.totalWeeks} 周`;
        
        // Show next game reminder (only during season)
        const nextGameReminder = document.getElementById('next-game-reminder');
        if (nextGame && !isOffseason) {
            nextGameReminder.style.display = 'block';
            document.getElementById('next-home-team').textContent = nextGame.homeTeam.name;
            document.getElementById('next-home-record').textContent = nextGame.homeTeam.record;
            document.getElementById('next-away-team').textContent = nextGame.awayTeam.name;
            document.getElementById('next-away-record').textContent = nextGame.awayTeam.record;
            document.getElementById('next-game-date').textContent = scheduleManager.formatDate(nextGame.date, 'full');
            document.getElementById('next-game-venue').textContent = nextGame.venue === '主场' ? '🏠 主场作战' : '✈️ 客场作战';
        } else {
            nextGameReminder.style.display = 'none';
        }
        
        // Render week navigation (only during season)
        if (!isOffseason) {
            this.renderScheduleWeek(Math.max(1, Math.min(progress.week, this.currentScheduleWeek)));
        } else {
            // Show offseason message
            const gamesContainer = document.getElementById('schedule-games');
            gamesContainer.innerHTML = `
                <div class="offseason-message">
                    <div class="offseason-icon">🏀</div>
                    <div class="offseason-title">休赛期</div>
                    <div class="offseason-desc">现在是休赛期期间，转会市场和训练活动已开启</div>
                </div>
            `;
            document.getElementById('current-week').textContent = '休赛期';
            document.getElementById('week-date-range').textContent = '2024年6月-8月';
        }
        
        // Disable navigation buttons during offseason
        document.getElementById('prev-week-btn').disabled = isOffseason;
        document.getElementById('next-week-btn').disabled = isOffseason;
        
        // Set up navigation buttons
        document.getElementById('prev-week-btn').onclick = () => {
            if (isOffseason) return;
            if (this.currentScheduleWeek > 1) {
                this.currentScheduleWeek--;
                this.renderScheduleWeek(this.currentScheduleWeek);
            }
        };
        
        document.getElementById('next-week-btn').onclick = () => {
            if (isOffseason) return;
            if (this.currentScheduleWeek < progress.totalWeeks) {
                this.currentScheduleWeek++;
                this.renderScheduleWeek(this.currentScheduleWeek);
            }
        };
        
        // Set up start game button
        document.getElementById('start-next-game-btn').onclick = () => {
            if (nextGame) {
                this.startGame(nextGame);
            }
        };
    }

    /**
     * Render schedule for a specific week
     */
    renderScheduleWeek(week) {
        const scheduleManager = this.scheduleManager;
        const weekDates = scheduleManager.getWeekDates(week);
        const progress = scheduleManager.getSeasonProgress();
        
        // Update week display
        document.getElementById('current-week').textContent = `第 ${week} 周`;
        
        const weekStart = weekDates[0];
        const weekEnd = weekDates[6];
        document.getElementById('week-date-range').textContent = 
            `${scheduleManager.formatDate(weekStart, 'short')} - ${scheduleManager.formatDate(weekEnd, 'short')}`;
        
        // Update navigation buttons
        document.getElementById('prev-week-btn').disabled = week <= 1;
        document.getElementById('next-week-btn').disabled = week >= progress.totalWeeks;
        
        // Render date picker
        const datePicker = document.getElementById('week-dates');
        datePicker.innerHTML = '';
        
        weekDates.forEach((date, index) => {
            const dateBtn = document.createElement('button');
            dateBtn.className = 'date-btn';
            const dateStr = date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
            const weekday = date.toLocaleDateString('zh-CN', { weekday: 'short' });
            dateBtn.textContent = `${dateStr} ${weekday}`;
            
            const isToday = scheduleManager.isToday(date);
            const playerGame = scheduleManager.getPlayerGameForDate(date);
            const games = scheduleManager.getScheduleForDate(date);
            
            if (isToday) dateBtn.classList.add('today');
            if (playerGame) dateBtn.classList.add('player-game');
            
            dateBtn.onclick = () => {
                document.querySelectorAll('.date-btn').forEach(btn => btn.classList.remove('selected'));
                dateBtn.classList.add('selected');
                this.renderScheduleDate(date);
            };
            
            datePicker.appendChild(dateBtn);
        });
        
        // Render first date's schedule by default
        const today = weekDates[0];
        const todayIndex = weekDates.findIndex(d => d.toDateString() === today.toDateString());
        if (todayIndex >= 0) {
            datePicker.children[todayIndex]?.classList.add('selected');
        }
        this.renderScheduleDate(today);
    }

    /**
     * Render schedule for a specific date
     */
    renderScheduleDate(date) {
        const scheduleManager = this.scheduleManager;
        const dateStr = scheduleManager.formatDate(date, 'full');
        const isToday = scheduleManager.isToday(date);
        const playerGame = scheduleManager.getPlayerGameForDate(date);
        const games = scheduleManager.getScheduleForDate(date);
        
        // Update date header
        const dateHeader = document.getElementById('schedule-date-header');
        dateHeader.textContent = dateStr;
        if (isToday) {
            dateHeader.classList.add('today');
        } else {
            dateHeader.classList.remove('today');
        }
        
        // Render games or rest day
        const gamesContainer = document.getElementById('schedule-games');
        gamesContainer.innerHTML = '';
        
        if (playerGame) {
            // Player's game today
            gamesContainer.appendChild(this.createPlayerGameCard(playerGame, isToday));
        } else if (games.length > 0) {
            // Other games today
            const dateSection = document.createElement('div');
            dateSection.className = 'schedule-date-section';
            
            games.forEach(game => {
                dateSection.appendChild(this.createGameCard(game));
            });
            
            gamesContainer.appendChild(dateSection);
        } else {
            // No games - rest or training day
            const isTrainingDay = date.getDay() !== 0 && date.getDay() !== 6;
            const activity = isTrainingDay ? 
                this.scheduleManager.getTrainingDayActivity() : 
                this.scheduleManager.getRestDayActivity();
            const restDayCard = document.createElement('div');
            restDayCard.className = `rest-day-card ${isTrainingDay ? 'training-day' : ''}`;
            
            restDayCard.innerHTML = `
                <div class="rest-day-icon">${activity.icon}</div>
                <div class="rest-day-title">${activity.title}</div>
                <div class="rest-day-desc">${activity.description}</div>
                <div class="rest-day-schedule">📅 ${activity.schedule}</div>
            `;
            
            gamesContainer.appendChild(restDayCard);
        }
    }

    /**
     * Create a game card element
     */
    createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        
        if (game.conferenceGame) {
            card.classList.add('conference-game');
        }
        
        if (game.status === 'completed') {
            card.classList.add('completed');
        }
        
        const isPlayerGame = game.homeTeam.id === this.scheduleManager.playerTeamId || 
                            game.awayTeam.id === this.scheduleManager.playerTeamId;
        if (isPlayerGame) {
            card.classList.add('player-game');
        }
        
        const gameDate = new Date(game.date);
        const timeStr = this.scheduleManager.formatTime(game.time);
        
        card.innerHTML = `
            <div class="game-date">${gameDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })} ${timeStr}</div>
            <div class="game-teams">
                <div class="game-team home">
                    <div class="team-logo">🏀</div>
                    <div class="team-info">
                        <div class="team-name">${game.homeTeam.name}</div>
                        <div class="team-record">${game.homeTeam.record}</div>
                    </div>
                </div>
                <div class="game-vs">
                    <span class="vs">VS</span>
                    ${game.status === 'completed' ? `
                        <div class="game-score">
                            <span class="home-score">${game.result.homeScore}</span>
                            -
                            <span class="away-score">${game.result.awayScore}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="game-team away">
                    <div class="team-info">
                        <div class="team-name">${game.awayTeam.name}</div>
                        <div class="team-record">${game.awayTeam.record}</div>
                    </div>
                    <div class="team-logo">🏀</div>
                </div>
            </div>
            <div class="game-venue ${game.venue === '主场' ? 'home' : 'away'}">${game.venue === '主场' ? '🏠 主场' : '✈️ 客场'}</div>
        `;
        
        return card;
    }

    /**
     * Create a player game card with start button
     */
    createPlayerGameCard(game, isToday) {
        const card = document.createElement('div');
        card.className = 'game-card player-game';
        if (isToday) card.classList.add('today');
        
        const gameDate = new Date(game.date);
        const timeStr = this.scheduleManager.formatTime(game.time);
        const daysUntil = this.scheduleManager.getDaysUntilGame(game);
        
        let statusText = '';
        if (daysUntil === 0) {
            statusText = '今日比赛';
        } else if (daysUntil === 1) {
            statusText = '明天比赛';
        } else if (daysUntil > 0) {
            statusText = `${daysUntil}天后比赛`;
        } else {
            statusText = '比赛结束';
        }
        
        card.innerHTML = `
            <div class="today-game-header">${statusText}</div>
            <div class="game-date">${gameDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })} ${timeStr}</div>
            <div class="game-teams">
                <div class="game-team home">
                    <div class="team-logo">🏀</div>
                    <div class="team-info">
                        <div class="team-name">${game.homeTeam.name}</div>
                        <div class="team-record">${game.homeTeam.record}</div>
                    </div>
                </div>
                <div class="game-vs">
                    <span class="vs">VS</span>
                </div>
                <div class="game-team away">
                    <div class="team-info">
                        <div class="team-name">${game.awayTeam.name}</div>
                        <div class="team-record">${game.awayTeam.record}</div>
                    </div>
                    <div class="team-logo">🏀</div>
                </div>
            </div>
            <div class="game-venue ${game.venue === '主场' ? 'home' : 'away'}">${game.venue === '主场' ? '🏠 主场作战' : '✈️ 客场挑战'}</div>
            ${daysUntil >= 0 ? `
                <div style="margin-top: 15px; text-align: center;">
                    <button class="start-game-btn" onclick="app.startGameById('${game.id}')">${daysUntil === 0 ? '开始比赛' : '查看比赛信息'}</button>
                </div>
            ` : ''}
        `;
        
        return card;
    }

    /**
     * Start a game
     */
    startGame(game) {
        this.gameEngine.setScheduleManager(this.scheduleManager);
        
        if (this.gameSimulationAdapter) {
            this.showGameModeSelection(game);
        } else {
            this.gameEngine.startGame(game);
        }
    }

    /**
     * Show game mode selection dialog
     */
    showGameModeSelection(game) {
        const modal = document.createElement('div');
        modal.className = 'game-mode-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        modal.innerHTML = `
            <div class="game-mode-content" style="
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border-radius: 20px;
                padding: 40px;
                max-width: 600px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                border: 2px solid rgba(255, 255, 255, 0.1);
            ">
                <h2 style="
                    color: #ffffff;
                    font-size: 1.8rem;
                    margin-bottom: 20px;
                    text-align: center;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                ">选择比赛模式</h2>
                
                <div style="
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 20px;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div style="color: #d4d4dc; font-size: 1.1rem;">${game.homeTeam.name}</div>
                        <div style="color: #e94560; font-weight: 700; font-size: 1.2rem;">VS</div>
                        <div style="color: #d4d4dc; font-size: 1.1rem;">${game.awayTeam.name}</div>
                    </div>
                    <div style="color: #9898a8; font-size: 0.9rem; text-align: center;">
                        ${new Date(game.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
                    </div>
                </div>
                
                <div style="display: grid; gap: 15px;">
                    <button id="quick-sim-btn" style="
                        padding: 20px;
                        background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
                        border: none;
                        border-radius: 12px;
                        color: white;
                        font-weight: 700;
                        font-size: 1.1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        box-shadow: 0 4px 15px rgba(233, 69, 96, 0.4);
                    ">
                        🏀 快速模拟
                    </button>
                    
                    <button id="full-sim-btn" style="
                        padding: 20px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        border-radius: 12px;
                        color: white;
                        font-weight: 700;
                        font-size: 1.1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                    ">
                        🎮 完整模拟
                    </button>
                </div>
                
                <button id="cancel-btn" style="
                    margin-top: 20px;
                    padding: 15px 30px;
                    background: transparent;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    color: #d4d4dc;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    width: 100%;
                ">
                    取消
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        const quickSimBtn = modal.querySelector('#quick-sim-btn');
        const fullSimBtn = modal.querySelector('#full-sim-btn');
        const cancelBtn = modal.querySelector('#cancel-btn');

        quickSimBtn.addEventListener('click', () => {
            modal.remove();
            this.gameSimulationAdapter.launchSimulation(game);
        });

        fullSimBtn.addEventListener('click', () => {
            modal.remove();
            this.gameEngine.startGame(game);
        });

        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });

        quickSimBtn.addEventListener('mouseenter', () => {
            quickSimBtn.style.transform = 'translateY(-3px)';
            quickSimBtn.style.boxShadow = '0 8px 25px rgba(233, 69, 96, 0.6)';
        });

        quickSimBtn.addEventListener('mouseleave', () => {
            quickSimBtn.style.transform = 'translateY(0)';
            quickSimBtn.style.boxShadow = '0 4px 15px rgba(233, 69, 96, 0.4)';
        });

        fullSimBtn.addEventListener('mouseenter', () => {
            fullSimBtn.style.transform = 'translateY(-3px)';
            fullSimBtn.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
        });

        fullSimBtn.addEventListener('mouseleave', () => {
            fullSimBtn.style.transform = 'translateY(0)';
            fullSimBtn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        });
    }

    /**
     * Start game by schedule ID
     */
    startGameById(gameId) {
        const game = this.scheduleManager.schedule.find(g => g.id === gameId);
        if (game) {
            this.startGame(game);
        }
    }

    /**
     * Open negotiation modal for a player
     */
    openNegotiationModal(player) {
        if (!this.contractManager.canOfferScholarship()) {
            this.showNotification('没有可用的奖学金名额了！', 'error');
            return;
        }

        this.currentNegotiatingPlayer = player;
        const modal = document.getElementById('negotiation-modal');
        const difficulty = this.contractManager.calculateSigningDifficulty(player, 100);
        const willingness = this.contractManager.calculateTransferWillingness(player);

        // Update player info
        document.getElementById('negotiation-player-name').textContent = player.name;
        document.getElementById('negotiation-player-details').textContent = 
            `${this.getYearLabel(player.year)} ${this.getPositionLabel(player.position)}`;
        document.getElementById('negotiation-avatar').textContent = this.getPositionEmoji(player.position);

        // Update difficulty display
        this.updateNegotiationDifficulty(difficulty);

        // Show transfer warning for upperclassmen
        this.updateTransferWarning(player);

        // Show willingness meter for transfers
        this.updateWillingnessMeter(willingness);

        // Clear previous result
        document.getElementById('negotiation-result-container').innerHTML = '';

        // Show modal
        modal.classList.add('active');

        // Set up event listeners
        this.setupNegotiationEvents(player);
    }

    /**
     * Update negotiation difficulty display
     */
    updateNegotiationDifficulty(difficulty) {
        const container = document.getElementById('negotiation-difficulty-container');
        const difficultyClass = difficulty.successProbability >= 70 ? 'easy' : 
                               difficulty.successProbability >= 40 ? 'medium' : 'hard';
        
        container.innerHTML = `
            <div class="negotiation-difficulty">
                <div class="difficulty-header">
                    <span class="difficulty-label">签约成功率</span>
                    <span class="difficulty-value">${difficulty.successProbability}%</span>
                </div>
                <div class="difficulty-bar">
                    <div class="difficulty-fill ${difficultyClass}" style="width: ${difficulty.successProbability}%"></div>
                </div>
                <ul class="difficulty-factors">
                    ${difficulty.factors.map(f => `<li>${f}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * Update transfer warning for upperclassmen
     */
    updateTransferWarning(player) {
        const container = document.getElementById('transfer-warning-container');
        
        if (player.year >= 2) {
            container.innerHTML = `
                <div class="transfer-warning">
                    <span class="warning-icon">⚠️</span>
                    <span class="warning-text">${this.getYearLabel(player.year)}学生转学难度较高，需要提供更好的条件</span>
                </div>
            `;
        } else {
            container.innerHTML = '';
        }
    }

    /**
     * Update willingness meter for transfers
     */
    updateWillingnessMeter(willingness) {
        const container = document.getElementById('willingness-meter-container');
        
        if (!willingness) {
            container.innerHTML = '';
            return;
        }

        const willingnessClass = willingness.score >= 70 ? 'high' : 
                                willingness.score >= 50 ? 'medium' : 'low';
        
        container.innerHTML = `
            <div class="willingness-meter">
                <div class="willingness-header">
                    <span class="willingness-label">转学意愿</span>
                    <span class="willingness-value">${willingness.score}%</span>
                </div>
                <div class="willingness-bar">
                    <div class="willingness-fill ${willingnessClass}" style="width: ${willingness.score}%"></div>
                </div>
            </div>
        `;
    }

    /**
     * Set up negotiation event listeners
     */
    setupNegotiationEvents(player) {
        const slider = document.getElementById('scholarship-slider');
        const valueDisplay = document.getElementById('scholarship-value');
        const presetBtns = document.querySelectorAll('.preset-btn');
        const submitBtn = document.getElementById('submit-offer');
        const cancelBtn = document.getElementById('cancel-negotiation');
        const closeBtn = document.getElementById('close-negotiation');

        // Slider change
        slider.oninput = () => {
            const value = slider.value;
            valueDisplay.textContent = `${value}%`;
            presetBtns.forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.value) === parseInt(value));
            });
            
            // Update difficulty preview
            const difficulty = this.contractManager.calculateSigningDifficulty(player, parseInt(value));
            this.updateNegotiationDifficulty(difficulty);
        };

        // Preset buttons
        presetBtns.forEach(btn => {
            btn.onclick = () => {
                const value = parseInt(btn.dataset.value);
                slider.value = value;
                valueDisplay.textContent = `${value}%`;
                presetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const difficulty = this.contractManager.calculateSigningDifficulty(player, value);
                this.updateNegotiationDifficulty(difficulty);
            };
        });

        // Submit offer
        submitBtn.onclick = () => {
            const scholarshipPercent = parseInt(slider.value);
            this.submitNegotiationOffer(player, scholarshipPercent);
        };

        // Close modal
        const closeModal = () => {
            document.getElementById('negotiation-modal').classList.remove('active');
            this.currentNegotiatingPlayer = null;
        };

        cancelBtn.onclick = closeModal;
        closeBtn.onclick = closeModal;
    }

    /**
     * Submit negotiation offer
     */
    submitNegotiationOffer(player, scholarshipPercent) {
        let result;
        
        if (player.year === 1) {
            result = this.contractManager.signPlayer(player.id, scholarshipPercent);
        } else {
            result = this.contractManager.offerTransfer(player.id, scholarshipPercent);
        }

        const resultContainer = document.getElementById('negotiation-result-container');
        
        if (result.success) {
            resultContainer.innerHTML = `
                <div class="negotiation-result success">
                    <div class="result-icon">🎉</div>
                    <div class="result-message">${result.message}</div>
                    <div class="result-detail">祝福你在新赛季取得好成绩！</div>
                </div>
            `;
            
            this.showNotification(result.message, 'success');
            
            // Refresh market display
            if (this.recruitmentInterface) {
                this.recruitmentInterface.loadPlayers();
                this.recruitmentInterface.renderAll();
            }
            
            // Close modal after delay
            setTimeout(() => {
                document.getElementById('negotiation-modal').classList.remove('active');
                this.currentNegotiatingPlayer = null;
            }, 2000);
        } else {
            resultContainer.innerHTML = `
                <div class="negotiation-result failure">
                    <div class="result-icon">😔</div>
                    <div class="result-message">${result.message}</div>
                    ${result.remainingAttempts ? `<div class="result-detail">剩余谈判次数: ${result.remainingAttempts}</div>` : ''}
                    ${result.disappeared ? `<div class="result-detail">该球员已离开转会市场</div>` : ''}
                </div>
            `;
            
            this.showNotification(result.message, 'error');
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `negotiation-notification ${type}`;
        
        const icons = {
            'info': '💬',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };
        
        notification.innerHTML = `
            <div class="notification-icon">${icons[type] || '💬'}</div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Get year label
     */
    getYearLabel(year) {
        const labels = { 1: '大一', 2: '大二', 3: '大三', 4: '大四' };
        return labels[year] || '未知';
    }

    /**
     * Get position label
     */
    getPositionLabel(position) {
        const labels = { 'PG': '控球后卫', 'SG': '得分后卫', 'SF': '小前锋', 'PF': '大前锋', 'C': '中锋' };
        return labels[position] || position;
    }

    /**
     * Get position emoji
     */
    getPositionEmoji(position) {
        const emojis = { 'PG': '🏀', 'SG': '🎯', 'SF': '🔥', 'PF': '💪', 'C': '🛡️' };
        return emojis[position] || '🏀';
    }

    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Set up modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                closeBtn.closest('.modal').style.display = 'none';
            });
        });
    }

    /**
     * Start the application
     */
    start() {
        if (!this.isInitialized) {
            throw new Error('Application must be initialized before starting');
        }

        this.uiManager.showScreen('team-management');
        this.seasonManager.startSeason();
    }
}

// Create global app instance
const app = new BasketballManagerApp();

// Global fast forward functions
function showNotification(message, type = 'info') {
    if (window.app && typeof window.app.showNotification === 'function') {
        window.app.showNotification(message, type);
        return;
    }
    
    const notification = document.createElement('div');
    notification.className = `negotiation-notification ${type}`;
    
    const icons = {
        'info': '💬',
        'success': '✅',
        'warning': '⚠️',
        'error': '❌'
    };
    
    notification.innerHTML = `
        <div class="notification-icon">${icons[type] || '💬'}</div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function fastForwardDays(days) {
    // 在快进前执行检查
    const validation = validateFastForwardConditions();
    if (!validation.canProceed) {
        showNotification(validation.message, 'warning');
        return;
    }

    if (!window.app || !window.app.marketManager) {
        showNotification('市场管理器未加载', 'error');
        return;
    }

    const result = window.app.marketManager.fastForward(days);

    if (!result.success) {
        showNotification(result.message, 'warning');
        return;
    }

    // 执行球队人员更新
    updateTeamPlayerAgesAndRetirements();

    updateOffseasonPanel();

    let summaryHTML = `
        <div class="fast-forward-summary">
            <div class="summary-row">
                <span class="label">跳过时间</span>
                <span class="value">${result.daysSkipped} 天</span>
            </div>
            <div class="summary-row">
                <span class="label">日期变化</span>
                <span class="value">${result.initialDate} → ${result.newDate}</span>
            </div>
            <div class="summary-row">
                <span class="label">被其他球队签走</span>
                <span class="value positive">${result.playersPickedUp} 人</span>
            </div>
            <div class="summary-row">
                <span class="label">剩余球员</span>
                <span class="value">${result.finalCount} 人</span>
            </div>
            <div class="summary-row">
                <span class="label">签约难度降低</span>
                <span class="value negative">${result.difficultyReduced.toFixed(1)}%</span>
            </div>
        </div>
    `;

    if (result.pickedUpDetails && result.pickedUpDetails.length > 0) {
        summaryHTML += `
            <h4 style="margin: 15px 0 10px; font-size: 0.95rem; color: var(--text-secondary);">被签走的球员：</h4>
            <div class="picked-up-list">
                ${result.pickedUpDetails.map(p => `
                    <div class="picked-up-item">
                        <span class="player-name">${p.name}</span>
                        <span class="player-rating">评分 ${p.rating} | ${p.position}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showModal('快速前进摘要', summaryHTML);

    if (window.app && window.app.recruitmentInterface) {
        window.app.recruitmentInterface.loadPlayers();
        window.app.recruitmentInterface.renderAll();
    }

    if (window.app && window.app.scheduleManager) {
        window.app.scheduleManager.renderSchedule();
    }

    // Auto-save after fast forward
    if (window.app && window.app.gameStateManager) {
        window.app.gameStateManager.saveGameState();
    }

    console.log(`[快速前进] 跳过 ${result.daysSkipped} 天，${result.playersPickedUp} 名球员被签走`);
}

/**
 * 验证快进条件
 * 检查是否满足快进要求
 */
function validateFastForwardConditions() {
    if (!window.app || !window.app.gameStateManager) {
        return { canProceed: true, message: "游戏状态管理器未加载，跳过验证" };
    }

    const state = window.app.gameStateManager.getState();
    const userTeam = state.userTeam;
    
    if (!userTeam) {
        return { canProceed: true, message: "用户球队未加载，跳过验证" };
    }

    // 检查招募结果：验证球队是否成功招募到足够球员
    // 根据奖学金系统，检查奖学金使用情况
    const scholarships = state.scholarships;
    let usedScholarships = 0;
    
    if (scholarships && typeof scholarships === 'object') {
        usedScholarships = scholarships.used || 0;
    } else {
        // 后备方案：使用阵容长度
        usedScholarships = userTeam.roster?.length || 0;
    }
    
    // 检查是否使用了全部5个奖学金名额
    const totalScholarships = 5; // 根据我们的设置
    
    if (usedScholarships < totalScholarships) {
        return { 
            canProceed: false, 
            message: `球队奖学金未满！当前使用：${usedScholarships}/${totalScholarships} 个奖学金名额，需要填满所有奖学金名额才能跳过当前周期` 
        };
    }

    // 如果当前奖学金使用达到要求，允许快进
    return { canProceed: true, message: "" };
}

/**
 * 更新球队球员年龄并处理毕业球员
 * 在每个休赛期执行球员学龄升级和大四球员退役
 */
function updateTeamPlayerAgesAndRetirements() {
    if (!window.app || !window.app.gameStateManager) {
        console.warn('游戏状态管理器未加载，跳过球员年龄更新');
        return;
    }

    const state = window.app.gameStateManager.getState();
    const userTeam = state.userTeam;
    
    if (!userTeam || !userTeam.roster) {
        console.warn('用户球队或阵容未加载，跳过球员年龄更新');
        return;
    }

    const retiredPlayers = [];
    const updatedRoster = [];

    // 遍历球队阵容，更新球员学龄并处理毕业球员
    for (const player of userTeam.roster) {
        // 更新球员学龄（年份递增）
        if (player.year && player.year < 4) {
            player.year += 1;
        } else if (player.year === 4) {
            // 大四球员标记为毕业并移除
            retiredPlayers.push(player);
            continue; // 不添加到新阵容中
        }
        
        // 添加到更新后的阵容
        updatedRoster.push(player);
    }

    // 更新球队阵容
    userTeam.roster = updatedRoster;

    // 如果有球员退休，显示通知
    if (retiredPlayers.length > 0) {
        const retiredNames = retiredPlayers.map(p => p.name).join(', ');
        showNotification(`赛季结束！${retiredPlayers.length}名球员毕业离队：${retiredNames}`, 'info');
        
        // 触发自由市场招募机制
        triggerFreeMarketRecruitment(updatedRoster.length);
    }

    // 更新游戏状态
    window.app.gameStateManager.set('userTeam', userTeam);
    window.app.gameStateManager.saveGameState();
    
    console.log(`[球员更新] ${updatedRoster.length}名球员继续留队，${retiredPlayers.length}名球员毕业`);
}

/**
 * 触发自由市场招募机制
 * 当球队有空缺名额时，强制进行招募
 */
function triggerFreeMarketRecruitment(currentRosterSize) {
    if (!window.app || !window.app.gameStateManager) {
        console.warn('游戏状态管理器未加载，跳过自由市场招募');
        return;
    }

    const state = window.app.gameStateManager.getState();
    const userTeam = state.userTeam;
    
    if (!userTeam) {
        console.warn('用户球队未加载，跳过自由市场招募');
        return;
    }

    // 计算空缺名额（基于奖学金系统，总共5个名额）
    const scholarships = state.scholarships;
    const totalScholarships = scholarships && typeof scholarships === 'object' 
        ? scholarships.total || 5 
        : 5;
        
    // 获取已使用的奖学金数量
    const usedScholarships = scholarships && typeof scholarships === 'object'
        ? scholarships.used || 0
        : currentRosterSize;
    
    const vacancies = Math.max(0, totalScholarships - usedScholarships);
    
    if (vacancies > 0) {
        showNotification(`发现 ${vacancies} 个奖学金空缺，需要进行补充招募！`, 'warning');
        
        // 在这里可以实现自动招募逻辑或强制玩家进行招募
        // 目前先显示提醒，后续可根据需要扩展自动招募功能
    }
}

function fastForwardToSeason() {
    if (!window.app || !window.app.marketManager) {
        showNotification('市场管理器未加载', 'error');
        return;
    }

    const state = window.app.gameStateManager.getState();
    
    // 检查球员数量：招募的球员 + 谈判中的球员 ≥ 13 才能开始新赛季
    const rosterCount = state.userTeam?.roster?.length || 0;
    const playerNegotiations = state.playerNegotiations || state.negotiations?.playerNegotiations || [];
    const negotiationCount = playerNegotiations.filter(n => n.status === 'active').length;
    const totalPlayers = rosterCount + negotiationCount;
    
    if (totalPlayers < 13) {
        showNotification(`无法开始新赛季！\n\n当前状态：\n- 已招募球员：${rosterCount} 人\n- 谈判中球员：${negotiationCount} 人\n- 总计：${totalPlayers} 人\n\n要求：招募的球员 + 谈判中的球员 ≥ 13 人\n\n请继续招募或完成谈判。`, 'warning');
        return;
    }

    const seasonEndDate = new Date(state.seasonEndDate);
    const nextSeasonStart = new Date(seasonEndDate);
    nextSeasonStart.setFullYear(nextSeasonStart.getFullYear() + 1);

    const currentDate = new Date(state.currentDate);
    const daysToSkip = Math.ceil((nextSeasonStart - currentDate) / (1000 * 60 * 60 * 24));

    const result = window.app.marketManager.fastForward(daysToSkip);

    if (!result.success) {
        showNotification(result.message, 'warning');
        return;
    }

    updateOffseasonPanel();

    let summaryHTML = `
        <div class="fast-forward-summary">
            <div class="summary-row">
                <span class="label">跳过天数</span>
                <span class="value">${result.daysSkipped} 天</span>
            </div>
            <div class="summary-row">
                <span class="label">被其他球队签走</span>
                <span class="value positive">${result.playersPickedUp} 人</span>
            </div>
            <div class="summary-row">
                <span class="label">最终球员数</span>
                <span class="value">${result.finalCount} 人</span>
            </div>
        </div>
        <p style="text-align: center; color: var(--success-color); font-weight: 600; margin-top: 15px;">
            🏁 新赛季即将开始！
        </p>
    `;

    if (result.pickedUpDetails && result.pickedUpDetails.length > 0 && result.pickedUpDetails.length <= 10) {
        summaryHTML += `
            <h4 style="margin: 15px 0 10px; font-size: 0.95rem; color: var(--text-secondary);">被签走的球员：</h4>
            <div class="picked-up-list">
                ${result.pickedUpDetails.map(p => `
                    <div class="picked-up-item">
                        <span class="player-name">${p.name}</span>
                        <span class="player-rating">评分 ${p.rating} | ${p.position}</span>
                    </div>
                `).join('')}
            </div>
        `;
    } else if (result.pickedUpDetails && result.pickedUpDetails.length > 10) {
        summaryHTML += `
            <h4 style="margin: 15px 0 10px; font-size: 0.95rem; color: var(--text-secondary);">被签走的球员（部分展示）：</h4>
            <div class="picked-up-list">
                ${result.pickedUpDetails.slice(0, 10).map(p => `
                    <div class="picked-up-item">
                        <span class="player-name">${p.name}</span>
                        <span class="player-rating">评分 ${p.rating} | ${p.position}</span>
                    </div>
                `).join('')}
                <div class="picked-up-item" style="justify-content: center; color: var(--text-muted);">
                    ... 还有 ${result.pickedUpDetails.length - 10} 人被签走
                </div>
            </div>
        `;
    }

    showModal('休赛期结束', summaryHTML);

    if (window.app && window.app.recruitmentInterface) {
        window.app.recruitmentInterface.loadPlayers();
        window.app.recruitmentInterface.renderAll();
    }

    if (window.app && window.app.scheduleManager) {
        window.app.scheduleManager.renderSchedule();
    }

    // Auto-save after fast forward to season
    if (window.app && window.app.gameStateManager) {
        window.app.gameStateManager.saveGameState();
    }

    console.log(`[快速前进] 休赛期结束，共 ${result.playersPickedUp} 名球员被签走`);
}

function batchSkipNegotiations() {
    if (!window.app || !window.app.skipRuleManager) {
        showNotification('跳过规则管理器未加载', 'error');
        return;
    }
    
    const result = window.app.skipRuleManager.batchSkipLowPriority(10);
    
    if (result.success) {
        showNotification(`已跳过 ${result.skipped} 个低优先级谈判`, 'success');
        updateOffseasonPanel();
        
        if (window.app.recruitmentInterface) {
            window.app.recruitmentInterface.renderNegotiationList();
        }
        
        // Auto-save after batch skip
        window.app.gameStateManager.saveGameState();
    } else {
        showNotification(result.message, 'warning');
    }
}

function updateBatchSkipSection() {
    const state = window.app?.gameStateManager?.getState();
    if (!state) return;
    
    const rosterSize = state.userTeam?.roster?.length || 0;
    const negotiationCount = state.negotiations?.playerNegotiations?.length || 0;
    const totalUsed = rosterSize + negotiationCount;
    const maxSlots = 15;
    
    const slotInfo = document.getElementById('slot-info');
    const batchSkipBtn = document.getElementById('batch-skip-btn');
    const skipCount = document.getElementById('skip-count');
    
    if (slotInfo) {
        slotInfo.textContent = `已用 ${totalUsed}/${maxSlots} 名额`;
    }
    
    if (skipCount) {
        const availableToSkip = 13 - totalUsed;
        skipCount.textContent = availableToSkip > 0 ? availableToSkip : 0;
    }
    
    const isActivated = totalUsed === 13;
    
    if (batchSkipBtn) {
        batchSkipBtn.disabled = !isActivated;
        batchSkipBtn.style.opacity = isActivated ? '1' : '0.5';
        batchSkipBtn.style.cursor = isActivated ? 'pointer' : 'not-allowed';
    }
}

function updateOffseasonPanel() {
    if (!window.app || !window.app.marketManager) return;

    const urgency = window.app.marketManager.getRecruitmentUrgency();
    const timeRemaining = window.app.marketManager.getOffseasonTimeRemaining();

    const urgencyBadge = document.getElementById('urgency-badge');
    if (urgencyBadge) {
        urgencyBadge.textContent = urgency.level === 'high' ? '紧急' : urgency.level === 'medium' ? '注意' : '充足';
        urgencyBadge.className = `status-badge ${urgency.level}`;
    }

    const weeksRemaining = document.getElementById('weeks-remaining');
    if (weeksRemaining) {
        weeksRemaining.textContent = timeRemaining.weeksRemaining;
    }

    const eliteCount = document.getElementById('elite-count');
    if (eliteCount) {
        eliteCount.textContent = urgency.elitePlayersRemaining;
    }

    const marketProgress = document.getElementById('market-progress');
    if (marketProgress) {
        marketProgress.textContent = timeRemaining.progress;
    }

    const offseasonNotice = document.getElementById('offseason-notice');
    if (offseasonNotice) {
        offseasonNotice.textContent = urgency.message;
    }

    updateBatchSkipSection();
}

// 奖学金分配方案系统
let currentScholarshipPlan = 'plan13';

function updateScholarshipPlan() {
    const select = document.getElementById('scholarship-plan-select');
    if (select) {
        currentScholarshipPlan = select.value;
    }
    renderScholarshipPanel();
}

function renderScholarshipPanel() {
    const distributionContainer = document.getElementById('scholarship-distribution');
    const rosterTarget = document.getElementById('roster-target');
    const scholarshipsUsed = document.getElementById('scholarships-used');
    
    if (!distributionContainer || !ScholarshipConfig) return;
    
    const plan = ScholarshipConfig.calculateDistribution(currentScholarshipPlan);
    if (!plan) return;
    
    if (rosterTarget) {
        rosterTarget.textContent = `${plan.roster} 人`;
    }
    
    if (scholarshipsUsed) {
        scholarshipsUsed.textContent = `${plan.totalUsed} 份全额等效`;
    }
    
    const levelConfig = ScholarshipConfig.levels;
    
    const planAllocation = plan.allocation || [];
    const levelCounts = {
        full: planAllocation.filter(a => a.level === 'full').length,
        half: planAllocation.filter(a => a.level === 'half').length,
        quarter: planAllocation.filter(a => a.level === 'quarter').length,
        minimal: planAllocation.filter(a => a.level === 'minimal').length
    };
    
    const totalPlayers = plan.roster;
    const segments = [
        { level: 'full', count: levelCounts.full, percentage: levelCounts.full / totalPlayers * 100 },
        { level: 'half', count: levelCounts.half, percentage: levelCounts.half / totalPlayers * 100 },
        { level: 'quarter', count: levelCounts.quarter, percentage: levelCounts.quarter / totalPlayers * 100 },
        { level: 'minimal', count: levelCounts.minimal, percentage: levelCounts.minimal / totalPlayers * 100 }
    ].filter(s => s.count > 0);
    
    let barHtml = '<div class="distribution-bar">';
    segments.forEach(seg => {
        const config = levelConfig[seg.level];
        barHtml += `
            <div class="distribution-segment ${seg.level}" style="width: ${seg.percentage}%" title="${config.name}: ${seg.count}人">
                ${seg.count}
            </div>
        `;
    });
    barHtml += '</div>';
    
    let legendHtml = '<div class="distribution-legend">';
    segments.forEach(seg => {
        const config = levelConfig[seg.level];
        const totalPercent = (config.percentage * seg.count).toFixed(1);
        legendHtml += `
            <div class="legend-item">
                <div class="legend-icon">${config.icon}</div>
                <div class="legend-info">
                    <div class="legend-name">${config.name}</div>
                    <div class="legend-details">${(config.percentage * 100).toFixed(0)}% × ${seg.count}人 = ${totalPercent}份</div>
                </div>
                <div class="legend-count">${seg.count}</div>
            </div>
        `;
    });
    legendHtml += '</div>';
    
    distributionContainer.innerHTML = barHtml + legendHtml;
}

function showModal(title, content) {
    let modal = document.getElementById('fast-forward-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'fast-forward-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content fast-forward-modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close" onclick="document.getElementById('fast-forward-modal').style.display='none'">&times;</button>
                </div>
                <div class="modal-body" id="fast-forward-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    modal.querySelector('h3').textContent = title;
    document.getElementById('fast-forward-body').innerHTML = content;
    modal.style.display = 'flex';
}

// ==================== 跳过规则全局函数 ====================

function getSkipStatus() {
    if (!window.app || !window.app.negotiationManager) {
        return { isEnabled: false, reason: '谈判管理器未加载' };
    }
    return window.app.negotiationManager.getSkipStatus();
}

function skipNegotiation(negotiationId, type) {
    if (!window.app || !window.app.negotiationManager) {
        showNotification('谈判管理器未加载', 'error');
        return { success: false, message: '谈判管理器未加载' };
    }
    return window.app.negotiationManager.skipNegotiation(negotiationId, type);
}

function probeMinimumScholarship(negotiationId, type) {
    if (!window.app || !window.app.negotiationManager) {
        showNotification('谈判管理器未加载', 'error');
        return { success: false, message: '谈判管理器未加载' };
    }
    return window.app.negotiationManager.probeMinimumScholarship(negotiationId, type);
}

function adjustOfferWithProbe(negotiationId, type) {
    if (!window.app || !window.app.negotiationManager) {
        showNotification('谈判管理器未加载', 'error');
        return null;
    }
    return window.app.negotiationManager.adjustOfferWithProbeResult(negotiationId, type);
}

function getScholarshipStats() {
    if (!window.app || !window.app.negotiationManager) {
        return null;
    }
    return window.app.negotiationManager.getScholarshipStats();
}

function saveActiveNegotiations() {
    if (!window.app || !window.app.negotiationManager) {
        return { players: 0, coaches: 0 };
    }
    return window.app.negotiationManager.saveActiveNegotiations();
}

function restoreActiveNegotiations() {
    if (!window.app || !window.app.negotiationManager) {
        return { restored: 0 };
    }
    return window.app.negotiationManager.restoreActiveNegotiations();
}

function inheritScholarshipBalance() {
    if (!window.app || !window.app.negotiationManager) {
        return { inherited: 0, message: '谈判管理器未加载' };
    }
    return window.app.negotiationManager.inheritScholarshipBalance();
}

function applyInheritedScholarship() {
    if (!window.app || !window.app.negotiationManager) {
        return { applied: 0, message: '谈判管理器未加载' };
    }
    return window.app.negotiationManager.applyInheritedScholarship();
}

function renderSkipRulePanel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`容器 ${containerId} 不存在`);
        return;
    }

    const status = getSkipStatus();
    const stats = getScholarshipStats();
    const quoteMode = status.quoteModeKey || 'initial';

    container.innerHTML = `
        <div class="skip-rule-panel">
            <div class="skip-rule-header">
                <h4>⚡ 跳过规则状态</h4>
                <span class="skip-status-badge ${status.isEnabled ? 'enabled' : 'disabled'}">
                    ${status.isEnabled ? '已启用' : '已禁用'}
                </span>
            </div>
            <div class="skip-info-grid">
                <div class="skip-info-item">
                    <span class="label">有效报价</span>
                    <span class="value ${status.effectiveOffers >= 13 ? 'highlight' : 'danger'}">
                        ${status.effectiveOffers || 0}
                    </span>
                </div>
                <div class="skip-info-item">
                    <span class="label">门槛</span>
                    <span class="value">${status.threshold || 13}</span>
                </div>
                <div class="skip-info-item">
                    <span class="label">可用名额</span>
                    <span class="value ${stats?.available > 5 ? 'highlight' : stats?.available > 2 ? 'warning' : 'danger'}">
                        ${stats?.available || 0}
                    </span>
                </div>
            </div>
            <div class="quote-mode-indicator">
                <span class="mode-icon">${quoteMode === 'initial' ? '💰' : '💡'}</span>
                <span class="mode-text">${status.quoteMode || '初始模式'}</span>
                <span class="mode-desc">
                    ${quoteMode === 'initial' 
                        ? '高额奖学金报价优质球员' 
                        : '高性价比报价策略'}
                </span>
            </div>
            <div class="skip-actions">
                <button class="skip-action-btn probe" onclick="showProbeInstructions()">
                    🔍 试探底线
                </button>
                <button class="skip-action-btn skip" ${!status.canSkip ? 'disabled' : ''} 
                        onclick="showSkipConfirmation()">
                    ⏭️ 跳过谈判
                </button>
                <button class="skip-action-btn adjust" onclick="showAdjustOfferInfo()">
                    📊 调整报价
                </button>
            </div>
        </div>
        <div class="scholarship-inheritance-panel">
            <div class="inheritance-header">
                <h4>🎓 奖学金管理</h4>
            </div>
            <div class="inheritance-stats">
                <div class="inheritance-stat-item">
                    <span class="label">总名额</span>
                    <span class="value">${stats?.total || 0}</span>
                </div>
                <div class="inheritance-stat-item">
                    <span class="label">已用</span>
                    <span class="value">${stats?.used || 0}</span>
                </div>
                <div class="inheritance-stat-item">
                    <span class="label">可用</span>
                    <span class="value">${stats?.available || 0}</span>
                </div>
                <div class="inheritance-stat-item">
                    <span class="label">结转</span>
                    <span class="value">${stats?.inherited || 0}</span>
                </div>
            </div>
            <div class="inheritance-actions">
                <button class="inheritance-btn apply" onclick="applyInheritedScholarship()">
                    ✅ 应用结转名额
                </button>
                <button class="inheritance-btn inherit" onclick="inheritScholarshipBalance()">
                    💾 结转当前余额
                </button>
            </div>
        </div>
    `;
}

function showProbeInstructions() {
    showModal('试探球员底线', `
        <div style="text-align: left; padding: 10px 0;">
            <p style="margin-bottom: 15px;">试探功能可以帮你了解球员可能接受的最低奖学金金额。</p>
            <h4 style="color: var(--warning-color); margin-bottom: 10px;">使用说明：</h4>
            <ul style="padding-left: 20px; line-height: 1.8;">
                <li>点击"试探"按钮分析目标球员</li>
                <li>系统会估算该球员可接受的最低奖学金比例</li>
                <li>根据试探结果调整报价，提高成功率</li>
            </ul>
            <p style="margin-top: 15px; color: var(--text-muted); font-size: 0.9rem;">
                💡 提示：试探次数越多，结果越准确
            </p>
        </div>
    `);
}

function showSkipConfirmation() {
    const status = getSkipStatus();
    if (!status.canSkip) {
        showNotification(status.reason || '当前无法跳过', 'warning');
        return;
    }

    showModal('确认跳过', `
        <div style="text-align: center; padding: 10px 0;">
            <p style="margin-bottom: 20px;">确定要跳过当前谈判吗？</p>
            <div style="background: rgba(239, 68, 68, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: var(--error-color); font-weight: 600;">跳过后谈判将被标记为已跳过</p>
                <p style="color: var(--text-muted); font-size: 0.9rem;">当前有效报价: ${status.effectiveOffers}/${status.threshold}</p>
            </div>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
                💡 提示：有效报价低于${status.threshold}人时将无法跳过
            </p>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button class="action-btn secondary" style="flex: 1;" 
                    onclick="document.getElementById('fast-forward-modal').style.display='none'">
                取消
            </button>
            <button class="action-btn danger" style="flex: 1;" onclick="confirmSkipAll()">
                确认跳过
            </button>
        </div>
    `);
}

function confirmSkipAll() {
    document.getElementById('fast-forward-modal').style.display = 'none';
    
    const negotiations = window.app?.negotiationManager?.playerNegotiations || [];
    const activeNegotiation = negotiations.find(n => n.status === 'active' && !n.skipped);
    
    if (activeNegotiation) {
        const result = skipNegotiation(activeNegotiation.id, 'player');
        if (result.success) {
            showNotification(`已跳过与 ${activeNegotiation.targetName} 的谈判`, 'info');
            if (window.app?.negotiationManager?.showNegotiationCenter) {
                window.app.negotiationManager.showNegotiationCenter('player');
            }
        } else {
            showNotification(result.message, 'warning');
        }
    } else {
        showNotification('没有活跃的谈判可以跳过', 'warning');
    }
}

function showAdjustOfferInfo() {
    showModal('调整报价策略', `
        <div style="text-align: left; padding: 10px 0;">
            <h4 style="margin-bottom: 15px;">报价调整策略：</h4>
            <div style="margin-bottom: 15px;">
                <h5 style="color: var(--secondary-color);">🏀 球员报价</h5>
                <ul style="padding-left: 20px; line-height: 1.8;">
                    <li><strong>激进策略：</strong>高于市场价10%，速度快</li>
                    <li><strong>均衡策略：</strong>合理报价，成功率稳定</li>
                    <li><strong>耐心策略：</strong>低于市场价15%，成本最低</li>
                    <li><strong>关系策略：</strong>强调球队文化，建立情感联系</li>
                </ul>
            </div>
            <div style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 8px;">
                <p style="color: var(--secondary-color); font-size: 0.9rem;">
                    💡 当前模式：${getSkipStatus()?.quoteMode || '初始模式'}
                </p>
            </div>
        </div>
    `);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await app.initialize();
});

async function continueGame() {
    if (!window.app) {
        showNotification('游戏未加载', 'error');
        return;
    }
    
    if (!accountManager || !accountManager.isLoggedIn()) {
        showNotification('请先登录', 'error');
        return;
    }
    
    const savedState = accountManager.loadGameState();
    if (!savedState) {
        showNotification('没有找到存档', 'error');
        return;
    }
    
    const btn = document.getElementById('btn-continue');
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> <span class="btn-text">加载中...</span>';
    
    // Hide start screen
    app.hideStartScreen();
    
    // Show app element
    document.getElementById('app').style.display = 'block';
    
    // Load game state
    await app.gameStateManager.loadGameState();
    
    // Start the app
    app.start();
    
    // Update team name display
    app.updateTeamNameDisplay();
    updateOffseasonPanel();
    
    showNotification('存档已加载', 'success');
}

async function startNewGame() {
    if (!window.app) {
        showNotification('游戏未加载', 'error');
        return;
    }
    
    if (!accountManager || !accountManager.isLoggedIn()) {
        showNotification('请先登录', 'error');
        return;
    }
    
    // Check if there's a save in the account and warn user
    const savedState = accountManager.loadGameState();
    if (savedState) {
        if (!confirm('开始新游戏将覆盖当前存档，确定继续吗？')) {
            return;
        }
        // Clear the save
        window.app.gameStateManager.clearSave();
    }
    
    const btn = document.querySelector('.start-btn.secondary');
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> <span class="btn-text">初始化中...</span>';
    
    // Hide start screen
    app.hideStartScreen();
    
    // Show app element
    document.getElementById('app').style.display = 'block';
    
    // Start initialization without save (new game)
    await app.startGameInitialization(false);
    
    // Start the app
    app.start();
    
    // Update team name display
    app.updateTeamNameDisplay();
    updateOffseasonPanel();
    renderScholarshipPanel();
    
    showNotification('新游戏已开始', 'success');
}

function editTeamName() {
    if (!window.app) {
        showNotification('游戏未加载', 'error');
        return;
    }
    window.app.editTeamName();
}

// Export app instance for debugging
window.app = app;
window.BasketballManagerApp = app;