/**
 * Season Manager module
 * Handles season progression and scheduling
 */

class SeasonManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.isInitialized = false;
        this.dependencies = {};
    }

    async initialize() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log('Season Manager initialized');
    }

    setDependencies(dependencies) {
        this.dependencies = dependencies;
    }

    startSeason() {
        const state = this.gameStateManager.getState();

        // Generate season schedule
        const schedule = this.generateSeasonSchedule(state.allTeams);

        // Update game state
        this.gameStateManager.set('gameSchedule', schedule);
        this.gameStateManager.set('nextGameIndex', 0);
        this.gameStateManager.set('seasonPhase', 'regular');

        // Reset coach hiring count for new season
        this.gameStateManager.set('coachHiringCount', 0);

        // Update UI
        this.updateScheduleScreen();

        this.showNotification('新赛季开始', 'info');
    }

    generateSeasonSchedule(teams) {
        const schedule = [];
        const gamesPerTeam = 30;
        
        // 获取当前游戏日期作为赛季开始日期
        const state = this.gameStateManager.getState();
        const currentDate = state.currentDate || new Date(2024, 9, 1);
        
        // 计算赛季开始日期（通常是10月1日）
        const seasonStartMonth = 9; // 10月（0-indexed）
        const seasonStartDay = 1;
        const seasonStartDate = new Date(currentDate.getFullYear(), seasonStartMonth, seasonStartDay);

        // Simplified schedule generation
        for (let i = 0; i < gamesPerTeam / 2; i++) {
            for (let j = 0; j < teams.length / 2; j++) {
                const homeTeam = teams[j * 2];
                const awayTeam = teams[j * 2 + 1];

                if (homeTeam && awayTeam) {
                    // 使用赛季开始日期作为基准，每周一场比赛
                    const gameDate = new Date(seasonStartDate);
                    gameDate.setDate(gameDate.getDate() + i * 7);
                    
                    schedule.push({
                        id: schedule.length + 1,
                        date: gameDate,
                        homeTeam: homeTeam,
                        awayTeam: awayTeam,
                        played: false,
                        homeScore: 0,
                        awayScore: 0
                    });
                }
            }
        }

        return schedule;
    }

    updateScheduleScreen() {
        const state = this.gameStateManager.getState();
        const schedule = state.gameSchedule;
        const nextGameIndex = state.nextGameIndex;

        const scheduleContainer = document.getElementById('game-schedule');
        if (!scheduleContainer) return;

        if (schedule.length === 0) {
            scheduleContainer.innerHTML = '<p>暂无赛程</p>';
            return;
        }

        const scheduleHtml = schedule.map((game, index) => `
            <div class="game-item ${index < nextGameIndex ? 'played' : ''} ${index === nextGameIndex ? 'next-game' : ''}">
                <div class="game-date">${this.formatDate(game.date)}</div>
                <div class="game-teams">
                    <span class="team-name ${game.homeTeam === state.userTeam ? 'user-team' : ''}">${game.homeTeam.name}</span>
                    <span class="vs">VS</span>
                    <span class="team-name ${game.awayTeam === state.userTeam ? 'user-team' : ''}">${game.awayTeam.name}</span>
                </div>
                <div class="game-score">
                    ${game.played ? `${game.homeScore} - ${game.awayScore}` : '未进行'}
                </div>
                ${index === nextGameIndex && game.homeTeam === state.userTeam || game.awayTeam === state.userTeam ?
                `<button class="btn play-game-btn" data-game-id="${game.id}">比赛</button>` : ''}
            </div>
        `).join('');

        scheduleContainer.innerHTML = scheduleHtml;

        // Add event listeners
        scheduleContainer.querySelectorAll('.play-game-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const gameId = parseInt(event.target.getAttribute('data-game-id'));
                this.playGame(gameId);
            });
        });

        // Update next game info
        this.updateNextGameInfo();
    }

    updateNextGameInfo() {
        const state = this.gameStateManager.getState();
        const schedule = state.gameSchedule;
        const nextGameIndex = state.nextGameIndex;

        if (nextGameIndex >= schedule.length) {
            document.getElementById('next-game').innerHTML = '<p>本赛季已结束</p>';
            return;
        }

        const nextGame = schedule[nextGameIndex];
        const nextGameContainer = document.getElementById('next-game');

        if (nextGameContainer) {
            nextGameContainer.innerHTML = `
                <h3>下一场比赛</h3>
                <div class="next-game-info">
                    <p>${this.formatDate(nextGame.date)}</p>
                    <p>${nextGame.homeTeam.name} VS ${nextGame.awayTeam.name}</p>
                    ${nextGame.homeTeam === state.userTeam || nextGame.awayTeam === state.userTeam ?
                    '<button class="btn play-game-btn" data-game-id="' + nextGame.id + '">开始比赛</button>' : ''}
                </div>
            `;

            // Add event listener
            const playBtn = nextGameContainer.querySelector('.play-game-btn');
            if (playBtn) {
                playBtn.addEventListener('click', () => {
                    this.playGame(nextGame.id);
                });
            }
        }
    }

    playGame(gameId) {
        const state = this.gameStateManager.getState();
        const schedule = state.gameSchedule;
        const gameIndex = schedule.findIndex(g => g.id === gameId);

        if (gameIndex === -1) return;

        const game = schedule[gameIndex];

        // Start game simulation
        if (this.dependencies.gameEngine) {
            this.dependencies.gameEngine.startGame({
                homeTeam: game.homeTeam,
                awayTeam: game.awayTeam,
                homeTactic: 'balanced',
                awayTactic: 'balanced'
            });
        }
    }

    updateStandingsScreen() {
        const state = this.gameStateManager.getState();
        const allTeams = state.allTeams;

        // Sort teams by multiple criteria:
        // 1. Win percentage (descending)
        // 2. Head-to-head results (simplified)
        // 3. Conference record
        // 4. Points differential
        const sortedTeams = [...allTeams].sort((a, b) => {
            const aWinPct = a.stats.wins / (a.stats.wins + a.stats.losses || 1);
            const bWinPct = b.stats.wins / (b.stats.wins + b.stats.losses || 1);
            
            // Primary: Win percentage
            if (Math.abs(aWinPct - bWinPct) > 0.001) {
                return bWinPct - aWinPct;
            }
            
            // Secondary: Conference record
            const aConfWinPct = a.stats.conferenceWins / (a.stats.conferenceWins + a.stats.conferenceLosses || 1);
            const bConfWinPct = b.stats.conferenceWins / (b.stats.conferenceWins + b.stats.conferenceLosses || 1);
            if (Math.abs(aConfWinPct - bConfWinPct) > 0.001) {
                return bConfWinPct - aConfWinPct;
            }
            
            // Tertiary: Points differential
            const aDiff = a.stats.pointsFor - a.stats.pointsAgainst;
            const bDiff = b.stats.pointsFor - b.stats.pointsAgainst;
            if (aDiff !== bDiff) {
                return bDiff - aDiff;
            }
            
            // Default: Alphabetical order
            return a.name.localeCompare(b.name);
        });

        const standingsContainer = document.getElementById('league-standings');
        if (!standingsContainer) return;

        // Also render using Pixi.js if available
        if (window.app && window.app.pixiRenderer && window.app.pixiRenderer.app) {
            window.app.renderStandings('league-standings');
        }

        // Generate standings HTML with proper structure
        const standingsHtml = sortedTeams.map((team, index) => {
            const winPct = team.stats.wins / (team.stats.wins + team.stats.losses || 1);
            const gamesBehind = index > 0 ? this.calculateGamesBehind(team, sortedTeams[0]) : 0;

            return `
                <div class="standing-row ${team === state.userTeam ? 'user-team' : ''}" data-team-id="${team.id}">
                    <div class="rank">${index + 1}</div>
                    <div class="team-name">${team.name}</div>
                    <div class="conference">${team.conference || '普通'}</div>
                    <div class="record">${team.stats.wins}-${team.stats.losses}</div>
                    <div class="win-pct">${(winPct * 100).toFixed(1)}%</div>
                    <div class="games-behind">${index === 0 ? '-' : gamesBehind.toFixed(1)}</div>
                </div>
            `;
        }).join('');

        standingsContainer.innerHTML = `
            <div class="standings-header standing-row header">
                <div class="rank">排名</div>
                <div class="team-name">球队</div>
                <div class="conference">联盟</div>
                <div class="record">战绩</div>
                <div class="win-pct">胜率</div>
                <div class="games-behind">胜差</div>
            </div>
            <div class="standings-body">
                ${standingsHtml}
            </div>
        `;
    }

    calculateGamesBehind(team, leader) {
        const teamWinPct = team.stats.wins / (team.stats.wins + team.stats.losses || 1);
        const leaderWinPct = leader.stats.wins / (leader.stats.wins + leader.stats.losses || 1);

        const teamGamesPlayed = team.stats.wins + team.stats.losses;
        const leaderGamesPlayed = leader.stats.wins + leader.stats.losses;

        return Math.abs((leaderWinPct - teamWinPct) * teamGamesPlayed) / 2;
    }

    advanceSeason() {
        const state = this.gameStateManager.getState();

        // Age players
        this.agePlayers();

        // Process contracts
        this.processContracts();

        // Generate new free agents
        this.generateNewFreeAgents();

        // Reset team stats
        this.resetTeamStats();

        // Update season
        this.gameStateManager.set('currentSeason', state.currentSeason + 1);

        // Generate new schedule
        this.startSeason();

        this.showNotification('新赛季开始', 'info');
    }

    agePlayers() {
        const state = this.gameStateManager.getState();
        const allTeams = state.allTeams;

        allTeams.forEach(team => {
            team.roster.forEach(player => {
                player.ageUp();
            });
        });
    }

    processContracts() {
        // Simplified contract processing
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;

        if (!userTeam) return;

        // Check player eligibility (4 years max)
        const ineligiblePlayers = userTeam.roster.filter(player => player.year > 4);

        ineligiblePlayers.forEach(player => {
            userTeam.removePlayer(player.id);
            this.showNotification(`${player.name} 已毕业离队`, 'info');
        });
    }

    generateNewFreeAgents() {
        const state = this.gameStateManager.getState();
        const availablePlayers = state.availablePlayers;

        // Generate new players
        const newPlayers = this.generatePlayers(20);

        // Update game state
        this.gameStateManager.set('availablePlayers', [...availablePlayers, ...newPlayers]);
    }

    generatePlayers(count) {
        const players = [];
        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        const chineseSurnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
        const chineseGivenNames = ['小明', '建国', '建军', '志强', '伟', '强', '勇', '杰', '磊', '浩', '宇', '鹏', '超', '峰', '亮', '涛', '斌', '刚', '明', '平', '文', '武', '龙', '虎', '飞', '翔', '华', '东', '南', '西', '北'];

        for (let i = 0; i < count; i++) {
            const surname = chineseSurnames[Math.floor(Math.random() * chineseSurnames.length)];
            const givenName = chineseGivenNames[Math.floor(Math.random() * chineseGivenNames.length)];
            const position = positions[Math.floor(Math.random() * positions.length)];

            const player = {
                id: this.gameStateManager.getPlayerId(),
                name: `${surname}${givenName}`,
                position: position,
                age: 17 + Math.floor(Math.random() * 3),
                year: 1,
                attributes: {
                    scoring: 30 + Math.floor(Math.random() * 40),
                    shooting: 30 + Math.floor(Math.random() * 40),
                    threePoint: 30 + Math.floor(Math.random() * 40),
                    freeThrow: 30 + Math.floor(Math.random() * 40),
                    passing: 30 + Math.floor(Math.random() * 40),
                    dribbling: 30 + Math.floor(Math.random() * 40),
                    defense: 30 + Math.floor(Math.random() * 40),
                    rebounding: 30 + Math.floor(Math.random() * 40),
                    stealing: 30 + Math.floor(Math.random() * 40),
                    blocking: 30 + Math.floor(Math.random() * 40),
                    speed: 30 + Math.floor(Math.random() * 40),
                    stamina: 30 + Math.floor(Math.random() * 40),
                    strength: 30 + Math.floor(Math.random() * 40),
                    basketballIQ: 30 + Math.floor(Math.random() * 40)
                },
                potential: 50 + Math.floor(Math.random() * 40),
                talents: [],
                skills: [],
                stats: {
                    games: 0,
                    points: 0,
                    rebounds: 0,
                    assists: 0,
                    steals: 0,
                    blocks: 0,
                    fouls: 0,
                    turnovers: 0,
                    minutes: 0
                },
                seasonStats: {
                    games: 0,
                    points: 0,
                    rebounds: 0,
                    assists: 0,
                    steals: 0,
                    blocks: 0,
                    fouls: 0,
                    turnovers: 0,
                    minutes: 0
                }
            };

            players.push(player);
        }

        return players;
    }

    resetTeamStats() {
        const state = this.gameStateManager.getState();
        const allTeams = state.allTeams;

        allTeams.forEach(team => {
            team.stats = {
                wins: 0,
                losses: 0,
                conferenceWins: 0,
                conferenceLosses: 0,
                pointsFor: 0,
                pointsAgainst: 0
            };
        });
    }

    formatDate(date) {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}