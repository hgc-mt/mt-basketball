/**
 * Game Engine module
 * Handles game simulation mechanics and logic
 */

// import { GameConstants, Tactics } from '../data/gameData.js';

/**
 * Game Engine class
 * Manages game simulation and mechanics
 */
// Game Engine class
class GameEngine {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.eventSystem = null;
        this.isInitialized = false;
        this.activeGame = null;
        this.gameSpeed = 1;
        this.isPaused = false;
        this.nbaUI = null;
    }

    /**
     * Initialize the game engine
     */
    async initialize() {
        if (this.isInitialized) return;

        this.isInitialized = true;
        if (typeof NBAGameUI !== 'undefined') {
            this.nbaUI = new NBAGameUI(this);
            this.nbaUI.initialize();
        }
        console.log('Game Engine initialized');
    }

    /**
     * Set the event system for game events
     * @param {EventSystem} eventSystem - Event system instance
     */
    setEventSystem(eventSystem) {
        this.eventSystem = eventSystem;
    }

    /**
     * Set the schedule manager
     * @param {ScheduleManager} scheduleManager - Schedule manager instance
     */
    setScheduleManager(scheduleManager) {
        this.scheduleManager = scheduleManager;
    }

    /**
     * Start a new game simulation
     * @param {Object} gameData - Game data including teams and settings
     * @returns {Object} Game state object
     */
    startGame(gameData) {
        const gameState = {
            id: Date.now(),
            scheduleGameId: gameData.id || null,
            homeTeam: gameData.homeTeam,
            awayTeam: gameData.awayTeam,
            homeScore: 0,
            awayScore: 0,
            quarter: 1,
            timeRemaining: GameConstants.QUARTER_LENGTH * 60,
            possession: Math.random() < 0.5 ? 'home' : 'away',
            homeLineup: gameData.homeTeam.getBestLineup ? gameData.homeTeam.getBestLineup() : gameData.homeTeam.roster?.slice(0, 5),
            awayLineup: gameData.awayTeam.getBestLineup ? gameData.awayTeam.getBestLineup() : gameData.awayTeam.roster?.slice(0, 5),
            homeTactic: gameData.homeTactic || 'balanced',
            awayTactic: gameData.awayTactic || 'balanced',
            events: [],
            playerStats: {
                home: this.initializePlayerStats(gameData.homeTeam),
                away: this.initializePlayerStats(gameData.awayTeam)
            },
            teamStats: {
                home: {
                    fieldGoals: { made: 0, attempted: 0 },
                    threePoints: { made: 0, attempted: 0 },
                    freeThrows: { made: 0, attempted: 0 },
                    rebounds: { offense: 0, defense: 0, total: 0 },
                    assists: 0,
                    steals: 0,
                    blocks: 0,
                    turnovers: 0,
                    fouls: 0
                },
                away: {
                    fieldGoals: { made: 0, attempted: 0 },
                    threePoints: { made: 0, attempted: 0 },
                    freeThrows: { made: 0, attempted: 0 },
                    rebounds: { offense: 0, defense: 0, total: 0 },
                    assists: 0,
                    steals: 0,
                    blocks: 0,
                    turnovers: 0,
                    fouls: 0
                }
            }
        };

        this.activeGame = gameState;
        this.showGameModal(gameState);
        this.startGameLoop(gameState);

        return gameState;
    }

    /**
     * Initialize player statistics for a game
     * @param {Object} team - Team object
     * @returns {Object} Player statistics object
     */
    initializePlayerStats(team) {
        const playerStats = {};

        // Initialize stats for all players in the lineup
        Object.values(team.getBestLineup()).forEach(player => {
            if (player) {
                playerStats[player.id] = {
                    player: player,
                    minutes: 0,
                    points: 0,
                    rebounds: 0,
                    assists: 0,
                    steals: 0,
                    blocks: 0,
                    turnovers: 0,
                    fouls: 0,
                    fieldGoals: { made: 0, attempted: 0 },
                    threePoints: { made: 0, attempted: 0 },
                    freeThrows: { made: 0, attempted: 0 },
                    plusMinus: 0
                };
            }
        });

        return playerStats;
    }

    /**
     * Show the game modal
     * @param {Object} gameState - Game state object
     */
    showGameModal(gameState) {
        if (this.nbaUI) {
            document.getElementById('game-modal').classList.add('game-ui-mode');
            this.nbaUI.startGame(gameState);
        } else {
            document.getElementById('game-info').innerHTML = `
                <div class="team-info">
                    <h3>${gameState.homeTeam.name}</h3>
                    <p>战术: ${this.getTacticName(gameState.homeTactic)}</p>
                </div>
                <div class="vs">VS</div>
                <div class="team-info">
                    <h3>${gameState.awayTeam.name}</h3>
                    <p>战术: ${this.getTacticName(gameState.awayTactic)}</p>
                </div>
            `;
            document.getElementById('game-modal').style.display = 'block';
        }
    }

    /**
     * Start the game simulation loop
     * @param {Object} gameState - Game state object
     */
    startGameLoop(gameState) {
        const gameLoop = (currentTime) => {
            if (!this.activeGame || this.activeGame.id !== gameState.id) {
                return; // Game ended or different game started
            }

            if (!this.isPaused) {
                this.updateGameState(gameState);
                this.updateGameUI(gameState);

                // Check if game is over
                if (gameState.timeRemaining <= 0 && gameState.quarter >= 4) {
                    this.endGame(gameState);
                    return;
                }
            }

            // Continue game loop
            setTimeout(() => {
                requestAnimationFrame(gameLoop);
            }, 1000 / (30 * this.gameSpeed)); // 30 FPS adjusted by game speed
        };

        requestAnimationFrame(gameLoop);
    }

    /**
     * Update the game state
     * @param {Object} gameState - Game state object
     */
    updateGameState(gameState) {
        // Decrease time
        gameState.timeRemaining -= 1 / 30; // Decrease by frame time

        // Check for quarter end
        if (gameState.timeRemaining <= 0) {
            if (gameState.quarter < 4) {
                // Start next quarter
                gameState.quarter++;
                gameState.timeRemaining = GameConstants.QUARTER_LENGTH * 60;
                this.addGameEvent(gameState, `第${gameState.quarter}节开始`, 'info');
            } else {
                // Game over
                return;
            }
        }

        // Simulate possessions (simplified)
        if (Math.random() < 0.05) { // 5% chance per frame
            this.simulatePossession(gameState);
        }
    }

    /**
     * Simulate a possession
     * @param {Object} gameState - Game state object
     */
    simulatePossession(gameState) {
        const isHomePossession = gameState.possession === 'home';
        const attackingTeam = isHomePossession ? gameState.homeTeam : gameState.awayTeam;
        const defendingTeam = isHomePossession ? gameState.awayTeam : gameState.homeTeam;
        const attackingLineup = isHomePossession ? gameState.homeLineup : gameState.awayLineup;
        const defendingLineup = isHomePossession ? gameState.awayLineup : gameState.homeLineup;
        const tactic = isHomePossession ? gameState.homeTactic : gameState.awayTactic;

        // Calculate team strength with tactic bonus
        const attackStrength = this.calculateTeamStrength(attackingTeam, tactic);
        const defenseStrength = this.calculateTeamStrength(defendingTeam,
            isHomePossession ? gameState.awayTactic : gameState.homeTactic);

        // Determine possession outcome
        const strengthDiff = attackStrength - defenseStrength;
        const successChance = 0.5 + (strengthDiff / 200); // Base 50% + strength difference

        if (Math.random() < successChance) {
            // Score
            const points = this.calculateScore(attackingLineup, defendingLineup, tactic);

            if (isHomePossession) {
                gameState.homeScore += points;
            } else {
                gameState.awayScore += points;
            }

            // Update player stats
            this.updateScoringStats(gameState, isHomePossession, points);

            // Add event
            this.addGameEvent(gameState,
                `${attackingTeam.name} 得分 ${points} 分`,
                'score');
        } else {
            // Turnover
            this.addGameEvent(gameState,
                `${attackingTeam.name} 失误`,
                'turnover');

            // Update turnover stats
            this.updateTurnoverStats(gameState, isHomePossession);
        }

        // Switch possession
        gameState.possession = isHomePossession ? 'away' : 'home';
    }

    /**
     * Calculate team strength with tactic bonus
     * @param {Object} team - Team object
     * @param {string} tactic - Tactic ID
     * @returns {number} Team strength rating
     */
    calculateTeamStrength(team, tactic) {
        let baseStrength = team.getTeamStrength();

        // Add tactic bonus
        const tacticData = Tactics[tactic];
        if (tacticData && tacticData.bonuses) {
            const lineup = team.getBestLineup();

            for (const [attr, bonus] of Object.entries(tacticData.bonuses)) {
                // Calculate average attribute for the team
                let totalAttr = 0;
                let playerCount = 0;

                Object.values(lineup).forEach(player => {
                    if (player && player.attributes[attr]) {
                        totalAttr += player.attributes[attr];
                        playerCount++;
                    }
                });

                if (playerCount > 0) {
                    const avgAttr = totalAttr / playerCount;
                    baseStrength += (avgAttr * bonus) / 100;
                }
            }
        }

        return Math.round(baseStrength);
    }

    /**
     * Calculate points scored in a possession
     * @param {Object} attackingLineup - Attacking team lineup
     * @param {Object} defendingLineup - Defending team lineup
     * @param {string} tactic - Attacking tactic
     * @returns {number} Points scored
     */
    calculateScore(attackingLineup, defendingLineup, tactic) {
        // Determine shot type based on tactic
        const shotType = this.determineShotType(tactic, attackingLineup);

        // Calculate shooting percentage based on players and defense
        let shootingPercentage = 0.45; // Base 45%

        // Adjust based on tactic
        if (tactic === 'outside-shooting' && shotType === 'three') {
            shootingPercentage += 0.1;
        } else if (tactic === 'inside-scoring' && shotType === 'two') {
            shootingPercentage += 0.1;
        }

        // Adjust based on player quality
        let totalRating = 0;
        let playerCount = 0;

        Object.values(attackingLineup).forEach(player => {
            if (player) {
                if (shotType === 'three') {
                    totalRating += player.attributes.threePoint;
                } else {
                    totalRating += player.attributes.shooting;
                }
                playerCount++;
            }
        });

        if (playerCount > 0) {
            const avgRating = totalRating / playerCount;
            shootingPercentage += (avgRating - 50) / 200; // Adjust by rating difference from 50
        }

        // Determine if shot is made
        if (Math.random() < shootingPercentage) {
            return shotType === 'three' ? 3 : 2;
        }

        // Missed shot, check for offensive rebound
        if (Math.random() < 0.3) { // 30% chance of offensive rebound
            return this.calculateScore(attackingLineup, defendingLineup, tactic);
        }

        return 0;
    }

    /**
     * Determine shot type based on tactic and lineup
     * @param {string} tactic - Tactic ID
     * @param {Object} lineup - Team lineup
     * @returns {string} Shot type ('three' or 'two')
     */
    determineShotType(tactic, lineup) {
        if (tactic === 'outside-shooting') {
            return 'three';
        } else if (tactic === 'inside-scoring') {
            return 'two';
        }

        // For balanced tactics, determine based on lineup
        let threePointSkill = 0;
        let insideSkill = 0;

        Object.values(lineup).forEach(player => {
            if (player) {
                threePointSkill += player.attributes.threePoint;
                insideSkill += (player.attributes.shooting + player.attributes.strength) / 2;
            }
        });

        return threePointSkill > insideSkill ? 'three' : 'two';
    }

    /**
     * Update scoring statistics
     * @param {Object} gameState - Game state object
     * @param {boolean} isHomeTeam - Whether the scoring team is home
     * @param {number} points - Points scored
     */
    updateScoringStats(gameState, isHomeTeam, points) {
        const teamKey = isHomeTeam ? 'home' : 'away';
        const teamStats = gameState.teamStats[teamKey];
        const playerStats = gameState.playerStats[teamKey];

        // Update team stats
        if (points === 3) {
            teamStats.threePoints.attempted++;
            teamStats.threePoints.made++;
        } else {
            teamStats.fieldGoals.attempted++;
            teamStats.fieldGoals.made++;
        }

        // Update player stats (simplified - random player gets credit)
        const players = Object.values(playerStats);
        if (players.length > 0) {
            const scorer = players[Math.floor(Math.random() * players.length)];
            scorer.points += points;

            if (points === 3) {
                scorer.threePoints.attempted++;
                scorer.threePoints.made++;
            } else {
                scorer.fieldGoals.attempted++;
                scorer.fieldGoals.made++;
            }

            // Random assist
            if (Math.random() < 0.7 && players.length > 1) {
                const assisters = players.filter(p => p !== scorer);
                if (assisters.length > 0) {
                    const assister = assisters[Math.floor(Math.random() * assisters.length)];
                    assister.assists++;
                    teamStats.assists++;
                }
            }
        }
    }

    /**
     * Update turnover statistics
     * @param {Object} gameState - Game state object
     * @param {boolean} isHomeTeam - Whether the team with turnover is home
     */
    updateTurnoverStats(gameState, isHomeTeam) {
        const teamKey = isHomeTeam ? 'home' : 'away';
        const teamStats = gameState.teamStats[teamKey];
        const playerStats = gameState.playerStats[teamKey];

        // Update team stats
        teamStats.turnovers++;

        // Update player stats (simplified - random player gets credit)
        const players = Object.values(playerStats);
        if (players.length > 0) {
            const player = players[Math.floor(Math.random() * players.length)];
            player.turnovers++;
        }
    }

    /**
     * Add a game event
     * @param {Object} gameState - Game state object
     * @param {string} text - Event text
     * @param {string} type - Event type
     */
    addGameEvent(gameState, text, type = 'info') {
        const event = {
            time: this.formatGameTime(gameState),
            text: text,
            type: type
        };

        gameState.events.push(event);

        // Keep only last 20 events
        if (gameState.events.length > 20) {
            gameState.events.shift();
        }
    }

    /**
     * Format game time for display
     * @param {Object} gameState - Game state object
     * @returns {string} Formatted time
     */
    formatGameTime(gameState) {
        const minutes = Math.floor(gameState.timeRemaining / 60);
        const seconds = Math.floor(gameState.timeRemaining % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Get tactic display name
     * @param {string} tacticId - Tactic ID
     * @returns {string} Tactic name
     */
    getTacticName(tacticId) {
        const tactic = Tactics[tacticId];
        return tactic ? tactic.name : '未知战术';
    }

    /**
     * Update the game UI
     * @param {Object} gameState - Game state object
     */
    updateGameUI(gameState) {
        if (this.nbaUI) {
            this.nbaUI.updateFromGameState(gameState);
            return;
        }

        // Update score
        document.getElementById('game-score').innerHTML = `
            <div class="score">
                <div class="team-score">
                    <h3>${gameState.homeTeam.name}</h3>
                    <div class="score-number">${gameState.homeScore}</div>
                </div>
                <div class="score-divider">:</div>
                <div class="team-score">
                    <div class="score-number">${gameState.awayScore}</div>
                    <h3>${gameState.awayTeam.name}</h3>
                </div>
            </div>
            <div class="quarter-info">第${gameState.quarter}节</div>
        `;

        // Update timer
        document.getElementById('game-timer').textContent = this.formatGameTime(gameState);

        // Update events
        const eventsContainer = document.getElementById('game-events');
        eventsContainer.innerHTML = gameState.events.map(event => `
            <div class="game-event ${event.type}">
                <span class="event-time">${event.time}</span>
                <span class="event-text">${event.text}</span>
            </div>
        `).join('');

        // Scroll to bottom of events
        eventsContainer.scrollTop = eventsContainer.scrollHeight;

        // Update player stats
        this.updatePlayerStatsTable(gameState.homeTeam, document.getElementById('home-player-stats'), gameState.playerStats.home);
        this.updatePlayerStatsTable(gameState.awayTeam, document.getElementById('away-player-stats'), gameState.playerStats.away);
    }

    /**
     * Update player statistics table
     * @param {Object} team - Team object
     * @param {HTMLElement} container - Container element
     * @param {Object} playerStats - Player statistics
     */
    updatePlayerStatsTable(team, container, playerStats) {
        const statsHtml = Object.values(playerStats).map(stat => `
            <tr>
                <td>${stat.player.name}</td>
                <td>${stat.points}</td>
                <td>${stat.rebounds}</td>
                <td>${stat.assists}</td>
                <td>${stat.fieldGoals.made}/${stat.fieldGoals.attempted}</td>
                <td>${stat.threePoints.made}/${stat.threePoints.attempted}</td>
            </tr>
        `).join('');

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>球员</th>
                        <th>得分</th>
                        <th>篮板</th>
                        <th>助攻</th>
                        <th>投篮</th>
                        <th>三分</th>
                    </tr>
                </thead>
                <tbody>
                    ${statsHtml}
                </tbody>
            </table>
        `;
    }

    /**
     * End the game
     * @param {Object} gameState - Game state object
     */
    endGame(gameState) {
        const homeWon = gameState.homeScore > gameState.awayScore;

        gameState.homeTeam.updateStats(gameState.homeScore, gameState.awayScore, false, homeWon);
        gameState.awayTeam.updateStats(gameState.awayScore, gameState.homeScore, false, !homeWon);

        this.updatePlayerSeasonStats(gameState.homeTeam, gameState.playerStats.home);
        this.updatePlayerSeasonStats(gameState.awayTeam, gameState.playerStats.away);

        this.addGameEvent(gameState,
            `比赛结束！${homeWon ? gameState.homeTeam.name : gameState.awayTeam.name} 获胜！`,
            'info');

        this.updateGameUI(gameState);

        document.getElementById('pause-game-btn').style.display = 'none';
        document.getElementById('resume-game-btn').style.display = 'none';
        document.getElementById('close-game-btn').style.display = 'inline-block';

        if (this.eventSystem) {
            this.eventSystem.publish('gameEnded', {
                gameState: gameState,
                winner: homeWon ? gameState.homeTeam : gameState.awayTeam,
                loser: homeWon ? gameState.awayTeam : gameState.homeTeam,
                homeScore: gameState.homeScore,
                awayScore: gameState.awayScore
            });
        }

        if (this.scheduleManager && gameState.scheduleGameId) {
            const gameData = {
                homeScore: gameState.homeScore,
                awayScore: gameState.awayScore,
                stats: gameState.playerStats
            };

            this.scheduleManager.updateGameResult(gameState.scheduleGameId, gameData);

            const game = this.scheduleManager.schedule.find(g => g.id === gameState.scheduleGameId);
            if (game) {
                const playerTeamId = this.scheduleManager.playerTeamId;
                const isPlayerTeam = game.homeTeam.id === playerTeamId || game.awayTeam.id === playerTeamId;

                if (isPlayerTeam) {
                    const resultText = homeWon ? '恭喜获胜！' : '比赛失利，继续努力！';
                    this.addGameEvent(gameState, `你的球队${game.homeTeam.id === playerTeamId ? game.homeTeam.name : game.awayTeam.name} ${gameState.homeScore}-${gameState.awayScore} ${resultText}`, 'important');
                }
            }
        }

        this.completeScheduledGames();

        this.activeGame = null;
    }

    /**
     * Complete all scheduled games up to current date
     */
    completeScheduledGames() {
        if (this.scheduleManager) {
            const currentDate = this.gameStateManager.get('currentDate');
            this.scheduleManager.checkAndCompleteGames(currentDate);
        }
    }

    /**
     * Update player season statistics
     * @param {Object} team - Team object
     * @param {Object} playerStats - Player statistics from the game
     */
    updatePlayerSeasonStats(team, playerStats) {
        Object.values(playerStats).forEach(stat => {
            const player = team.getPlayer(stat.player.id);
            if (player) {
                player.seasonStats.games++;
                player.seasonStats.points += stat.points;
                player.seasonStats.rebounds += stat.rebounds;
                player.seasonStats.assists += stat.assists;
                player.seasonStats.steals += stat.steals;
                player.seasonStats.blocks += stat.blocks;
                player.seasonStats.fouls += stat.fouls;
                player.seasonStats.turnovers += stat.turnovers;
                player.seasonStats.minutes += stat.minutes;
            }
        });
    }

    /**
     * Pause the game
     */
    pauseGame() {
        this.isPaused = true;
        if (this.nbaUI) {
            this.nbaUI.setPaused(true);
        } else {
            document.getElementById('pause-game-btn').style.display = 'none';
            document.getElementById('resume-game-btn').style.display = 'inline-block';
        }
    }

    /**
     * Resume the game
     */
    resumeGame() {
        this.isPaused = false;
        if (this.nbaUI) {
            this.nbaUI.setPaused(false);
        } else {
            document.getElementById('resume-game-btn').style.display = 'none';
            document.getElementById('pause-game-btn').style.display = 'inline-block';
        }
    }

    /**
     * Change game speed
     * @param {number} speed - New game speed
     */
    changeGameSpeed(speed) {
        this.gameSpeed = speed;
        document.getElementById('speed-up-btn').textContent = `加速 x${speed}`;
    }

    /**
     * Close the game modal
     */
    closeGame() {
        document.getElementById('game-modal').style.display = 'none';
        this.activeGame = null;
    }
}