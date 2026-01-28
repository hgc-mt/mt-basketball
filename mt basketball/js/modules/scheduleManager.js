/**
 * Schedule Manager Module
 * Handles game schedules, dates, and game day management
 */

class ScheduleManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.schedule = [];
        this.currentDate = gameStateManager.get('currentDate') || new Date();
        this.seasonStartDate = null;
        this.seasonEndDate = null;
        this.totalWeeks = 16;
        this.gamesPerWeek = 2;
        this.playerTeamId = null;
        this.conferences = ['东部', '西部'];
        this.divisions = {
            '东部': ['大西洋', '中部', '东南'],
            '西部': ['太平洋', '西南', '西北']
        };
        this.teamNames = [
            '凯尔特人', '湖人', '勇士', '热火', '公牛',
            '马刺', '太阳', '雄鹿', '掘金', '独行侠',
            '快船', '76人', '篮网', '猛龙', '骑士',
            '尼克斯', '雷霆', '森林狼', '爵士', '国王'
        ];
    }

    /**
     * Initialize schedule manager
     * @param {Object} options - Initialization options
     */
    initialize(options = {}) {
        const gameDate = this.gameStateManager.get('currentDate');
        this.currentDate = gameDate;

        this.seasonStartDate = new Date(gameDate.getFullYear(), 9, 1);
        this.seasonEndDate = new Date(this.seasonStartDate);
        this.seasonEndDate.setDate(this.seasonEndDate.getDate() + (this.totalWeeks * 7));

        if (gameDate < this.seasonStartDate) {
            console.log('Currently in offseason, generating next season schedule');
            this.generateSeasonSchedule();
        } else if (gameDate >= this.seasonStartDate && gameDate <= this.seasonEndDate) {
            console.log('Currently in regular season, generating schedule from current date');
            this.generateSeasonSchedule();
        } else {
            console.log('Season already ended, generating next season schedule');
            this.seasonStartDate = new Date(gameDate.getFullYear() + 1, 9, 1);
            this.seasonEndDate = new Date(this.seasonStartDate);
            this.seasonEndDate.setDate(this.seasonEndDate.getDate() + (this.totalWeeks * 7));
            this.generateSeasonSchedule();
        }

        this.setPlayerTeam();
        this.initializeTeamRecords();

        const playedGames = this.schedule.filter(g => g.status === 'completed').length;
        console.log(`Schedule initialized: ${this.schedule.length} games, ${playedGames} already played`);

        this.saveSeasonDates();
    }

    saveSeasonDates() {
        this.gameStateManager.update('seasonStartDate', this.seasonStartDate);
        this.gameStateManager.update('seasonEndDate', this.seasonEndDate);
    }

    /**
     * Set the player's team ID
     */
    setPlayerTeam() {
        const teamId = this.gameStateManager.getState('playerTeamId');
        this.playerTeamId = teamId || 'team_001';
    }

    /**
     * Generate complete season schedule
     */
    generateSeasonSchedule() {
        const gameDate = this.gameStateManager.get('currentDate') || new Date();
        this.seasonStartDate = new Date(gameDate.getFullYear(), 9, 1);
        this.seasonEndDate = new Date(this.seasonStartDate);
        this.seasonEndDate.setDate(this.seasonEndDate.getDate() + (this.totalWeeks * 7));

        const teams = this.generateTeams();
        const conferenceTeams = this.divideIntoConferences(teams);
        
        for (let week = 1; week <= this.totalWeeks; week++) {
            const weekStartDate = new Date(this.seasonStartDate);
            weekStartDate.setDate(weekStartDate.getDate() + ((week - 1) * 7));
            
            for (let gameDay = 0; gameDay < this.gamesPerWeek; gameDay++) {
                const gameDate = new Date(weekStartDate);
                gameDate.setDate(gameDate.getDate() + (gameDay * 3));
                
                const games = this.generateWeekGames(week, gameDate, conferenceTeams, teams);
                this.schedule.push(...games);
            }
        }
        
        this.schedule.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    /**
     * Generate teams for the schedule
     */
    generateTeams() {
        const teams = [];
        for (let i = 0; i < this.teamNames.length; i++) {
            teams.push({
                id: `team_${String(i + 1).padStart(3, '0')}`,
                name: this.teamNames[i],
                conference: i < 10 ? '东部' : '西部',
                division: this.getDivision(i),
                wins: 0,
                losses: 0
            });
        }
        return teams;
    }

    /**
     * Get division for a team
     */
    getDivision(index) {
        const divisions = index < 10 ? 
            ['大西洋', '大西洋', '大西洋', '中部', '中部', '中部', '东南', '东南', '东南', '东南'] :
            ['太平洋', '太平洋', '太平洋', '西南', '西南', '西南', '西北', '西北', '西北', '西北'];
        return divisions[index % 10];
    }

    /**
     * Divide teams into conferences
     */
    divideIntoConferences(teams) {
        const conferenceTeams = { '东部': [], '西部': [] };
        teams.forEach(team => {
            conferenceTeams[team.conference].push(team);
        });
        return conferenceTeams;
    }

    /**
     * Generate games for a week
     */
    generateWeekGames(week, gameDate, conferenceTeams, allTeams) {
        const games = [];
        const shuffledTeams = [...allTeams].sort(() => Math.random() - 0.5);
        
        const teamCount = shuffledTeams.length;
        const numGames = Math.min(Math.floor(teamCount / 2), 5);
        
        for (let i = 0; i < numGames * 2; i += 2) {
            const homeTeam = shuffledTeams[i];
            const awayTeam = shuffledTeams[i + 1];
            
            const game = {
                id: `game_${Date.now()}_${games.length}`,
                date: gameDate.toISOString(),
                week: week,
                homeTeam: {
                    id: homeTeam.id,
                    name: homeTeam.name,
                    conference: homeTeam.conference,
                    division: homeTeam.division,
                    seed: 0,
                    record: `${homeTeam.wins}-${homeTeam.losses}`
                },
                awayTeam: {
                    id: awayTeam.id,
                    name: awayTeam.name,
                    conference: awayTeam.conference,
                    division: awayTeam.division,
                    seed: 0,
                    record: `${awayTeam.wins}-${awayTeam.losses}`
                },
                status: 'scheduled',
                time: this.generateGameTime(),
                venue: Math.random() < 0.5 ? '主场' : '客场',
                conferenceGame: homeTeam.conference === awayTeam.conference,
                tournament: false,
                result: null,
                stats: null
            };
            
            games.push(game);
        }
        
        return games;
    }

    /**
     * Generate game time
     */
    generateGameTime() {
        const hours = [19, 20, 21, 22];
        const hour = hours[Math.floor(Math.random() * hours.length)];
        const minutes = [0, 15, 30, 45];
        const minute = minutes[Math.floor(Math.random() * minutes.length)];
        return `${hour}:${String(minute).padStart(2, '0')}`;
    }

    /**
     * Get schedule for a specific date
     */
    getScheduleForDate(date) {
        const targetDate = new Date(date).toDateString();
        return this.schedule.filter(game => 
            new Date(game.date).toDateString() === targetDate
        );
    }

    /**
     * Get schedule for a date range
     */
    getScheduleForRange(startDate, endDate) {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        return this.schedule.filter(game => {
            const gameTime = new Date(game.date).getTime();
            return gameTime >= start && gameTime <= end;
        });
    }

    /**
     * Check if player team has a game on a specific date
     */
    getPlayerGameForDate(date) {
        const targetDate = new Date(date).toDateString();
        return this.schedule.find(game => {
            const gameDate = new Date(game.date).toDateString();
            return gameDate === targetDate && 
                   (game.homeTeam.id === this.playerTeamId || 
                    game.awayTeam.id === this.playerTeamId);
        });
    }

    /**
     * Get today's games
     */
    getTodayGames() {
        const gameDate = this.gameStateManager.get('currentDate');
        return this.getScheduleForDate(gameDate);
    }

    /**
     * Get player's today game
     */
    getPlayerTodayGame() {
        const gameDate = this.gameStateManager.get('currentDate');
        return this.getPlayerGameForDate(gameDate);
    }

    /**
     * Check if today is a game day for player
     */
    isPlayerGameDay(date = null) {
        const gameDate = date || this.gameStateManager.get('currentDate');
        return this.getPlayerGameForDate(gameDate) !== undefined;
    }

    /**
     * Get upcoming games for player team
     */
    getUpcomingPlayerGames(limit = 5) {
        const gameDate = this.gameStateManager.get('currentDate');
        const today = gameDate.getTime();
        return this.schedule
            .filter(game => 
                new Date(game.date).getTime() > today &&
                (game.homeTeam.id === this.playerTeamId || 
                 game.awayTeam.id === this.playerTeamId)
            )
            .slice(0, limit);
    }

    /**
     * Get recent games for player team
     */
    getRecentPlayerGames(limit = 5) {
        const gameDate = this.gameStateManager.get('currentDate');
        const today = gameDate.getTime();
        return this.schedule
            .filter(game => 
                new Date(game.date).getTime() < today &&
                (game.homeTeam.id === this.playerTeamId || 
                 game.awayTeam.id === this.playerTeamId)
            )
            .slice(-limit)
            .reverse();
    }

    /**
     * Get next game info
     */
    getNextGame() {
        const upcoming = this.getUpcomingPlayerGames(1);
        return upcoming.length > 0 ? upcoming[0] : null;
    }

    /**
     * Get season progress
     */
    getSeasonProgress() {
        const today = this.gameStateManager.get('currentDate');
        
        // Validate date
        if (!(today instanceof Date) || isNaN(today.getTime())) {
            console.warn('Invalid date in getSeasonProgress, using season start date');
            today = this.seasonStartDate;
        }
        
        // Check if before season (offseason)
        if (today < this.seasonStartDate) {
            return {
                week: 0,  // 休赛期
                totalWeeks: this.totalWeeks,
                progress: 0,
                isSeasonOver: false,
                isBeforeSeason: true,
                phase: 'offseason'
            };
        }
        
        // Check if after season (playoffs ended)
        if (today > this.seasonEndDate) {
            return {
                week: this.totalWeeks,  // 最后一周
                totalWeeks: this.totalWeeks,
                progress: 100,
                isSeasonOver: true,
                isBeforeSeason: false,
                phase: 'playoffs'
            };
        }
        
        // Normal season calculation
        const totalDays = (this.seasonEndDate - this.seasonStartDate) / (1000 * 60 * 60 * 24);
        const elapsedDays = (today - this.seasonStartDate) / (1000 * 60 * 60 * 24);
        
        // Calculate week (1-based)
        const week = Math.min(this.totalWeeks, Math.floor(elapsedDays / 7) + 1);
        const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
        
        // Determine phase
        const preseasonEnd = new Date(this.seasonStartDate);
        preseasonEnd.setDate(preseasonEnd.getDate() + 14);
        
        let phase = 'regular';
        if (today < preseasonEnd) {
            phase = 'preseason';
        }
        
        return {
            week: week,
            totalWeeks: this.totalWeeks,
            progress: Math.round(progress),
            isSeasonOver: false,
            isBeforeSeason: false,
            phase: phase
        };
    }

    /**
     * Navigate to a specific week
     */
    navigateToWeek(week) {
        const targetDate = new Date(this.seasonStartDate);
        targetDate.setDate(targetDate.getDate() + ((week - 1) * 7));
        return targetDate;
    }

    /**
     * Get week dates
     */
    getWeekDates(week) {
        const weekStart = this.navigateToWeek(week);
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            dates.push(date);
        }
        return dates;
    }

    /**
     * Format date for display
     */
    formatDate(date, format = 'full') {
        try {
            const d = new Date(date);
            // Validate date
            if (isNaN(d.getTime())) {
                return '未知日期';
            }
            
            const options = {
                'full': { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
                'short': { month: 'short', day: 'numeric' },
                'compact': { month: 'numeric', day: 'numeric' },
                'weekday': { weekday: 'long' }
            };
            return d.toLocaleDateString('zh-CN', options[format] || options['full']);
        } catch (error) {
            console.warn('Error formatting date:', error);
            return '日期错误';
        }
    }

    /**
     * Format time for display
     */
    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        return `${hours}时${minutes}分`;
    }

    /**
     * Get days until game
     */
    getDaysUntilGame(game) {
        const gameDate = new Date(game.date);
        const gameStateDate = this.gameStateManager.get('currentDate');
        const today = new Date(gameStateDate);
        today.setHours(0, 0, 0, 0);
        gameDate.setHours(0, 0, 0, 0);
        const diffTime = gameDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    /**
     * Check if date is today (using game date)
     */
    isToday(date) {
        const gameStateDate = this.gameStateManager.get('currentDate');
        return new Date(date).toDateString() === gameStateDate.toDateString();
    }

    /**
     * Get season summary
     */
    getSeasonSummary() {
        const playerGames = this.schedule.filter(game => 
            game.homeTeam.id === this.playerTeamId || game.awayTeam.id === this.playerTeamId
        );
        
        const playedGames = playerGames.filter(g => g.status === 'completed');
        const upcomingGames = playerGames.filter(g => g.status === 'scheduled');
        
        let wins = 0, losses = 0;
        playedGames.forEach(game => {
            const isHome = game.homeTeam.id === this.playerTeamId;
            if (game.result) {
                if (isHome) {
                    if (game.result.homeScore > game.result.awayScore) wins++;
                    else losses++;
                } else {
                    if (game.result.awayScore > game.result.homeScore) wins++;
                    else losses++;
                }
            }
        });

        return {
            totalGames: playerGames.length,
            played: playedGames.length,
            upcoming: upcomingGames.length,
            wins: wins,
            losses: losses,
            remaining: this.totalWeeks - this.getSeasonProgress().week + 1
        };
    }

    /**
     * Get training day activity for college players
     */
    getTrainingDayActivity() {
        const activities = [
            {
                icon: '📚',
                title: '文化课学习',
                description: '上午文化课学习，下午进行篮球训练',
                schedule: '8:00-12:00 理论课 | 14:00-18:00 训练'
            },
            {
                icon: '🏀',
                title: '技战术训练',
                description: '重点训练进攻配合和防守策略',
                schedule: '14:00-18:00 战术演练'
            },
            {
                icon: '💪',
                title: '体能训练',
                description: '力量训练和有氧耐力训练',
                schedule: '6:00-8:00 晨跑 | 16:00-18:00 健身房'
            },
            {
                icon: '🎯',
                title: '投篮特训',
                description: '专项投篮训练，提升命中率',
                schedule: '14:00-16:00 投篮训练'
            },
            {
                icon: '📹',
                title: '录像分析',
                description: '观看比赛录像，分析对手战术',
                schedule: '19:00-21:00 战术研讨'
            },
            {
                icon: '🤝',
                title: '团队建设',
                description: '团队配合训练和化学反应培养',
                schedule: '14:00-17:00 合练'
            }
        ];
        return activities[Math.floor(Math.random() * activities.length)];
    }

    /**
     * Get rest day activity for college players
     */
    getRestDayActivity() {
        const activities = [
            {
                icon: '📖',
                title: '自习时间',
                description: '图书馆自习，完成作业和预习课程',
                schedule: '9:00-12:00 图书馆 | 14:00-17:00 自习'
            },
            {
                icon: '🎓',
                title: '学术讲座',
                description: '参加学校组织的学术讲座和活动',
                schedule: '9:00-11:00 讲座'
            },
            {
                icon: '🛏️',
                title: '充分休息',
                description: '球员进行充分休息，恢复体能',
                schedule: '全天休息调整'
            },
            {
                icon: '📝',
                title: '期中/期末复习',
                description: '集中时间复习备考，应对学业考核',
                schedule: '9:00-12:00 复习 | 14:00-17:00 复习'
            },
            {
                icon: '👨‍⚕️',
                title: '康复理疗',
                description: '队医检查，恢复性治疗和按摩',
                schedule: '10:00-12:00 康复'
            },
            {
                icon: '🎮',
                title: '团队活动',
                description: '队内团建活动，增进队友感情',
                schedule: '14:00-17:00 团建'
            }
        ];
        return activities[Math.floor(Math.random() * activities.length)];
    }

    /**
     * Check if date is a rest day (weekend)
     */
    isRestDay(date) {
        const day = new Date(date).getDay();
        return day === 0 || day === 6;
    }

    /**
     * Check if date is a training day (weekday without game)
     */
    isTrainingDay(date) {
        const day = new Date(date).getDay();
        return day !== 0 && day !== 6;
    }

    /**
     * Update game result and team records
     * @param {string} gameId - Game ID
     * @param {Object} result - Game result { homeScore, awayScore, stats }
     * @returns {boolean} Whether update was successful
     */
    updateGameResult(gameId, result) {
        const game = this.schedule.find(g => g.id === gameId);
        if (!game || game.status === 'completed') {
            console.warn(`Game not found or already completed: ${gameId}`);
            return false;
        }

        game.status = 'completed';
        game.result = {
            homeScore: result.homeScore,
            awayScore: result.awayScore,
            overtime: result.overtime || false,
            stats: result.stats || null
        };

        const homeWin = result.homeScore > result.awayScore;
        const awayWin = result.awayScore > result.homeScore;

        if (homeWin) {
            this.updateTeamRecord(game.homeTeam.id, 'win');
            this.updateTeamRecord(game.awayTeam.id, 'loss');
        } else if (awayWin) {
            this.updateTeamRecord(game.awayTeam.id, 'win');
            this.updateTeamRecord(game.homeTeam.id, 'loss');
        }

        this.syncTeamRecordsToGames();

        console.log(`Game completed: ${game.homeTeam.name} ${result.homeScore} - ${result.awayScore} ${game.awayTeam.name}`);
        return true;
    }

    /**
     * Update single team record
     * @param {string} teamId - Team ID
     * @param {string} result - 'win' or 'loss'
     */
    updateTeamRecord(teamId, result) {
        const team = this.teamRecords[teamId];
        if (team) {
            if (result === 'win') {
                team.wins++;
            } else if (result === 'loss') {
                team.losses++;
            }
        }
    }

    /**
     * Sync team records to all game entries
     */
    syncTeamRecordsToGames() {
        this.schedule.forEach(game => {
            const homeRecord = this.teamRecords[game.homeTeam.id];
            const awayRecord = this.teamRecords[game.awayTeam.id];

            if (homeRecord) {
                game.homeTeam.record = `${homeRecord.wins}-${homeRecord.losses}`;
            }
            if (awayRecord) {
                game.awayTeam.record = `${awayRecord.wins}-${awayRecord.losses}`;
            }
        });
    }

    /**
     * Initialize team records from schedule data
     */
    initializeTeamRecords() {
        this.teamRecords = {};
        const teamsSeen = new Set();

        this.schedule.forEach(game => {
            if (!teamsSeen.has(game.homeTeam.id)) {
                this.teamRecords[game.homeTeam.id] = {
                    id: game.homeTeam.id,
                    name: game.homeTeam.name,
                    conference: game.homeTeam.conference,
                    division: game.homeTeam.division,
                    wins: 0,
                    losses: 0
                };
                teamsSeen.add(game.homeTeam.id);
            }

            if (!teamsSeen.has(game.awayTeam.id)) {
                this.teamRecords[game.awayTeam.id] = {
                    id: game.awayTeam.id,
                    name: game.awayTeam.name,
                    conference: game.awayTeam.conference,
                    division: game.awayTeam.division,
                    wins: 0,
                    losses: 0
                };
                teamsSeen.add(game.awayTeam.id);
            }
        });
    }

    /**
     * Get current season standings
     * @param {string} conference - Optional conference filter ('东部' or '西部')
     * @returns {Array} Sorted standings array
     */
    getSeasonStandings(conference = null) {
        const teams = Object.values(this.teamRecords || {});

        const filteredTeams = conference
            ? teams.filter(t => t.conference === conference)
            : teams;

        return filteredTeams.map(team => {
            const games = this.schedule.filter(g =>
                g.homeTeam.id === team.id || g.awayTeam.id === team.id
            );
            const playedGames = games.filter(g => g.status === 'completed');
            const wins = playedGames.filter(g => {
                const isHome = g.homeTeam.id === team.id;
                return isHome ? g.result.homeScore > g.result.awayScore
                              : g.result.awayScore > g.result.homeScore;
            }).length;
            const losses = playedGames.length - wins;
            const winRate = playedGames.length > 0 ? (wins / playedGames.length * 100).toFixed(1) : '0.0';

            return {
                ...team,
                gamesPlayed: playedGames.length,
                wins: wins,
                losses: losses,
                winRate: winRate,
                streak: this.getTeamStreak(team.id)
            };
        }).sort((a, b) => {
            if (b.wins !== a.wins) return b.wins - a.wins;
            return parseFloat(b.winRate) - parseFloat(a.winRate);
        });
    }

    /**
     * Get team's current streak
     * @param {string} teamId - Team ID
     * @returns {string} Streak info (e.g., "3连胜", "2连败", "无")
     */
    getTeamStreak(teamId) {
        const teamGames = this.schedule
            .filter(g => (g.homeTeam.id === teamId || g.awayTeam.id === teamId) && g.status === 'completed')
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (teamGames.length === 0) return '无';

        let streak = 0;
        let streakType = null;

        for (const game of teamGames) {
            const isHome = game.homeTeam.id === teamId;
            const won = isHome ? game.result.homeScore > game.result.awayScore
                              : game.result.awayScore > game.result.homeScore;

            if (streakType === null) {
                streakType = won ? 'win' : 'loss';
                streak = 1;
            } else if ((streakType === 'win' && won) || (streakType === 'loss' && !won)) {
                streak++;
            } else {
                break;
            }
        }

        if (streak === 0) return '无';
        const prefix = streakType === 'win' ? '连胜' : '连败';
        return `${streak}${prefix}`;
    }

    /**
     * Check if current date is in offseason
     * @returns {boolean}
     */
    isOffseason() {
        const currentDate = this.gameStateManager.get('currentDate');
        return currentDate < this.seasonStartDate || currentDate > this.seasonEndDate;
    }

    /**
     * Get current season phase
     * @returns {string} 'offseason', 'preseason', 'regular', 'playoffs'
     */
    getSeasonPhase() {
        const currentDate = this.gameStateManager.get('currentDate');
        const preseasonStart = new Date(this.seasonStartDate);
        preseasonStart.setDate(preseasonStart.getDate() - 14);

        if (currentDate < preseasonStart) {
            return 'offseason';
        } else if (currentDate < this.seasonStartDate) {
            return 'preseason';
        } else if (currentDate > this.seasonEndDate) {
            return 'playoffs';
        }
        return 'regular';
    }

    /**
     * Check and complete games that should have been played by current game date
     * @param {Date} currentDate - Current game date
     */
    checkAndCompleteGames(currentDate) {
        if (this.isOffseason()) {
            console.log('Currently in offseason, skipping game completion');
            return 0;
        }

        let completedCount = 0;

        this.schedule.forEach(game => {
            if (game.status === 'scheduled') {
                const gameDate = new Date(game.date);
                if (gameDate <= currentDate) {
                    if (!game.result) {
                        this.simulateGameResult(game);
                        completedCount++;
                    }
                }
            }
        });

        if (completedCount > 0) {
            console.log(`Auto-completed ${completedCount} games`);
        }
        return completedCount;
    }

    /**
     * Advance to next season (call at end of playoffs)
     */
    advanceToNextSeason() {
        this.seasonStartDate = new Date(this.seasonStartDate.getFullYear() + 1, 9, 1);
        this.seasonEndDate = new Date(this.seasonStartDate);
        this.seasonEndDate.setDate(this.seasonEndDate.getDate() + (this.totalWeeks * 7));

        this.teamRecords = {};

        this.generateSeasonSchedule();
        this.initializeTeamRecords();

        console.log(`Advanced to season ${this.seasonStartDate.getFullYear()}-${this.seasonStartDate.getFullYear() + 1}`);
    }

    /**
     * Get offseason activities for player team
     * @returns {Array} Available offseason activities
     */
    getOffseasonActivities() {
        const phase = this.getSeasonPhase();
        const activities = [];

        if (phase === 'offseason' || phase === 'preseason') {
            activities.push(
                { id: 'recruiting', name: '球员招募', description: '在转会市场签约新球员', icon: '🏀', action: 'openRecruitment' },
                { id: 'player-negotiations', name: '球员谈判', description: '与目标球员进行深度签约谈判', icon: '🤝', action: 'openPlayerNegotiations' },
                { id: 'coaching', name: '教练招聘', description: '寻找并签约合适的新教练', icon: '👨‍🏫', action: 'openCoachNegotiations' },
                { id: 'schedule', name: '查看新赛季', description: '查看下赛季赛程安排', icon: '📅', action: 'openSchedule' }
            );
        }

        return activities;
    }

    /**
     * Open recruitment interface
     */
    openRecruitment() {
        if (window.recruitmentInterface) {
            window.recruitmentInterface.show();
            return true;
        }
        return false;
    }

    /**
     * Open player negotiations interface
     */
    openPlayerNegotiations() {
        if (window.negotiationManager) {
            window.negotiationManager.showNegotiationCenter('player');
            return true;
        }
        return false;
    }

    /**
     * Open coach negotiations interface
     */
    openCoachNegotiations() {
        if (window.coachNegotiationManager) {
            window.coachNegotiationManager.showNegotiationCenter();
            return true;
        }
        if (window.uiManager) {
            window.uiManager.showScreen('coach-market');
            return true;
        }
        return false;
    }

    /**
     * Open schedule interface
     */
    openSchedule() {
        if (window.uiManager) {
            window.uiManager.showScreen('schedule');
            return true;
        }
        return false;
    }

    /**
     * Check if player team has any completed games
     * @returns {boolean}
     */
    hasPlayedGames() {
        return this.schedule.some(game =>
            (game.homeTeam.id === this.playerTeamId || game.awayTeam.id === this.playerTeamId) &&
            game.status === 'completed'
        );
    }

    /**
     * Get next opponent info
     * @returns {Object|null}
     */
    getNextOpponent() {
        const currentDate = this.gameStateManager.get('currentDate');
        const upcomingGames = this.schedule.filter(game =>
            new Date(game.date) > currentDate &&
            (game.homeTeam.id === this.playerTeamId || game.awayTeam.id === this.playerTeamId)
        );

        if (upcomingGames.length === 0) return null;

        const nextGame = upcomingGames[0];
        const isHome = nextGame.homeTeam.id === this.playerTeamId;
        const opponent = isHome ? nextGame.awayTeam : nextGame.homeTeam;

        return {
            opponent: opponent,
            isHome: isHome,
            date: nextGame.date,
            venue: nextGame.venue,
            daysUntil: Math.ceil((new Date(nextGame.date) - currentDate) / (1000 * 60 * 60 * 24))
        };
    }

    /**
     * Simulate game result for non-player games
     * @param {Object} game - Game object
     */
    simulateGameResult(game) {
        const baseScore = 85;
        const variance = 25;

        const homeScore = Math.floor(baseScore + Math.random() * variance);
        const awayScore = Math.floor(baseScore + Math.random() * variance);

        const homeTeam = this.teamRecords[game.homeTeam.id];
        const awayTeam = this.teamRecords[game.awayTeam.id];

        const homeRating = homeTeam ? this.calculateTeamRating(homeTeam.id) : 80;
        const awayRating = awayTeam ? this.calculateTeamRating(awayTeam.id) : 80;

        const ratingDiff = (homeRating - awayRating) / 10;
        const adjustedHomeScore = Math.round(homeScore + ratingDiff);
        const adjustedAwayScore = Math.round(awayScore - ratingDiff);

        this.updateGameResult(game.id, {
            homeScore: Math.max(70, Math.min(150, adjustedHomeScore)),
            awayScore: Math.max(70, Math.min(150, adjustedAwayScore)),
            overtime: Math.random() < 0.1
        });
    }

    /**
     * Calculate team rating based on record
     * @param {string} teamId - Team ID
     * @returns {number} Team rating
     */
    calculateTeamRating(teamId) {
        const team = this.teamRecords[teamId];
        if (!team || (team.wins + team.losses) === 0) return 75;

        const winRate = team.wins / (team.wins + team.losses);
        const baseRating = 70;
        return Math.round(baseRating + (winRate * 20));
    }

    /**
     * Set custom season dates (for game time system)
     * @param {Date} startDate - Season start date
     * @param {Date} endDate - Season end date
     */
    setSeasonDates(startDate, endDate) {
        this.seasonStartDate = new Date(startDate);
        this.seasonEndDate = new Date(endDate);
        this.totalWeeks = Math.ceil((this.seasonEndDate - this.seasonStartDate) / (7 * 24 * 60 * 60 * 1000));
    }

    /**
     * Get games that should be played on or before a specific date
     * @param {Date} date - Reference date
     * @returns {Array} Array of games to complete
     */
    getGamesToComplete(date) {
        if (this.isOffseason()) return [];

        return this.schedule.filter(game =>
            game.status === 'scheduled' && new Date(game.date) <= date
        );
    }

    /**
     * Complete all pending games up to current game date
     */
    completePendingGames() {
        const currentDate = this.gameStateManager.get('currentDate');
        const gamesToComplete = this.getGamesToComplete(currentDate);

        gamesToComplete.forEach(game => {
            if (!game.result) {
                this.simulateGameResult(game);
            }
        });

        return gamesToComplete.length;
    }

    /**
     * Reset all schedule data for new season
     */
    resetSchedule() {
        this.schedule = [];
        this.teamRecords = {};
        this.currentDate = this.gameStateManager.get('currentDate') || new Date();
        this.seasonStartDate = null;
        this.seasonEndDate = null;
    }
}

window.ScheduleManager = ScheduleManager;
