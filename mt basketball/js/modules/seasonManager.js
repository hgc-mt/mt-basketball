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

        // ===== 处理谈判中的球员（必须在 offseasonManager 之前）=====
        console.log('[SeasonManager] 处理谈判中的球员...');
        const negotiationResult = this.processPendingNegotiations();
        console.log(`[SeasonManager] 谈判处理完成：${negotiationResult.signed}人签约，${negotiationResult.failed}人谈判失败`);

        // ===== 使用新的休赛期管理系统处理球员变动 =====
        if (window.offseasonManager) {
            console.log('[SeasonManager] 使用 offseasonManager 处理休赛期变动（赛季结束）');
            // isInitialSetup: false 表示这是赛季结束后的处理
            const offseasonReport = window.offseasonManager.processOffseason({ isInitialSetup: false });
            
            // 显示休赛期变动摘要
            const summary = window.offseasonManager.generateOffseasonSummary(offseasonReport);
            this.showNotification(`休赛期变动：${summary}`, 'info');
            
            // 详细记录
            console.log('[Offseason Report]', offseasonReport);
            
            // 如果有AI球队重建，显示额外信息
            if (offseasonReport.aiRebuilds && offseasonReport.aiRebuilds.length > 0) {
                const rebuildCount = offseasonReport.aiRebuilds.length;
                console.log(`[SeasonManager] ${rebuildCount} 支AI球队进行了阵容重建`);
            }
        } else {
            // 降级处理：使用旧逻辑
            console.warn('[SeasonManager] offseasonManager 未初始化，使用旧逻辑');
            this.agePlayers();
            this.processContracts();
        }

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
        const availablePlayers = state.availablePlayers || [];

        // 基于32支球队的需求生成新球员
        // 每队需要约5名球员，总计约160名
        // 75%大一新生，25%转学生
        const totalNeeded = 140 + Math.floor(Math.random() * 40); // 140-180人
        const freshmenCount = Math.round(totalNeeded * 0.75);
        const transferCount = totalNeeded - freshmenCount;
        
        const freshmenPlayers = this.generatePlayers(freshmenCount, 1);
        const transferPlayers = this.generatePlayers(transferCount, 'mixed');
        const newPlayers = [...freshmenPlayers, ...transferPlayers];

        console.log(`[SeasonManager] 新赛季生成 ${newPlayers.length} 名球员(大一:${freshmenCount}, 转学:${transferCount})`);

        // Update game state
        this.gameStateManager.set('availablePlayers', [...availablePlayers, ...newPlayers]);
    }

    generatePlayers(count, yearConfig = 1) {
        const players = [];
        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        const chineseSurnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
        const chineseGivenNames = ['小明', '建国', '建军', '志强', '伟', '强', '勇', '杰', '磊', '浩', '宇', '鹏', '超', '峰', '亮', '涛', '斌', '刚', '明', '平', '文', '武', '龙', '虎', '飞', '翔', '华', '东', '南', '西', '北'];

        for (let i = 0; i < count; i++) {
            const surname = chineseSurnames[Math.floor(Math.random() * chineseSurnames.length)];
            const givenName = chineseGivenNames[Math.floor(Math.random() * chineseGivenNames.length)];
            const position = positions[Math.floor(Math.random() * positions.length)];

            // 确定年级和属性
            let year, age, status, rating, potential;
            
            if (yearConfig === 1) {
                // 大一新生
                year = 1;
                age = 17 + Math.floor(Math.random() * 2);
                status = 'free_agent';
                rating = 50 + Math.floor(Math.random() * 25);
                potential = 60 + Math.floor(Math.random() * 30);
            } else if (yearConfig === 'mixed') {
                // 转学生 - 大二大三大四
                const yearRand = Math.random();
                if (yearRand < 0.5) {
                    year = 2;
                    age = 19;
                } else if (yearRand < 0.8) {
                    year = 3;
                    age = 20;
                } else {
                    year = 4;
                    age = 21;
                }
                status = 'transfer_wanted';
                rating = 60 + Math.floor(Math.random() * 20);
                potential = 55 + Math.floor(Math.random() * 25);
            } else {
                year = 1;
                age = 18;
                status = 'free_agent';
                rating = 55 + Math.floor(Math.random() * 20);
                potential = 65 + Math.floor(Math.random() * 25);
            }

            const player = {
                id: this.gameStateManager.getPlayerId(),
                name: `${surname}${givenName}`,
                position: position,
                age: age,
                year: year,
                status: status,
                rating: rating,
                potential: potential,
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

    /**
     * 处理谈判中的球员（跳过休赛期/开始新赛季时调用）
     * 自动处理所有进行中的谈判：成功签约或谈判失败
     * @returns {Object} 处理结果 { signed: number, failed: number, details: Array }
     */
    processPendingNegotiations() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        
        // 从多个可能的位置获取谈判数据
        let negotiations = [];
        
        // 1. 从 state.activeNegotiations 获取（negotiationManager 使用）
        if (state.activeNegotiations && Array.isArray(state.activeNegotiations)) {
            negotiations = [...state.activeNegotiations];
        }
        
        // 2. 从 state.negotiations?.playerNegotiations 获取（兼容旧版）
        if (state.negotiations?.playerNegotiations && Array.isArray(state.negotiations.playerNegotiations)) {
            negotiations = [...negotiations, ...state.negotiations.playerNegotiations];
        }
        
        // 3. 从 window.negotiationManager 直接获取
        if (window.negotiationManager?.negotiations && Array.isArray(window.negotiationManager.negotiations)) {
            const managerNegotiations = window.negotiationManager.negotiations.filter(n => 
                !negotiations.find(existing => existing.playerId === n.playerId || existing.targetId === n.targetId)
            );
            negotiations = [...negotiations, ...managerNegotiations];
        }
        
        const result = {
            signed: 0,
            failed: 0,
            details: []
        };
        
        if (!userTeam || negotiations.length === 0) {
            console.log('[SeasonManager] 没有需要处理的谈判');
            return result;
        }
        
        console.log(`[SeasonManager] 总共找到 ${negotiations.length} 个谈判记录`);
        
        // 过滤出活跃的谈判
        const activeNegotiations = negotiations.filter(n => {
            const status = n.status || 'pending';
            return status === 'active' || status === 'pending' || status === 'paused' || status === 'in_progress';
        });
        
        console.log(`[SeasonManager] 发现 ${activeNegotiations.length} 个活跃谈判需要处理`);
        
        if (activeNegotiations.length === 0) {
            return result;
        }
        
        for (const negotiation of activeNegotiations) {
            // 兼容不同的字段命名
            const playerId = negotiation.playerId || negotiation.targetId;
            const playerName = negotiation.playerName || negotiation.targetName;
            
            if (!playerId) {
                console.warn('[SeasonManager] 谈判记录缺少playerId:', negotiation);
                continue;
            }
            
            // 查找球员
            let player = null;
            
            // 从 availablePlayers 中找
            if (state.availablePlayers) {
                player = state.availablePlayers.find(p => p.id === playerId);
            }
            
            // 如果没找到，可能是 Player 对象
            if (!player && window.playerPool) {
                player = window.playerPool.getPlayerById(playerId);
            }
            
            // 从 negotiation 对象本身获取球员信息
            if (!player && negotiation.player) {
                player = negotiation.player;
            }
            
            if (!player) {
                console.warn(`[SeasonManager] 找不到谈判球员: ${playerName}(${playerId})`);
                result.failed++;
                result.details.push({ playerName, status: 'failed', reason: '找不到球员' });
                // 标记为完成
                this.markNegotiationCompleted(negotiation, 'failed');
                continue;
            }
            
            // 计算签约成功率
            const successChance = this.calculateSigningChance(negotiation, player);
            console.log(`[SeasonManager] ${playerName} 签约成功率: ${(successChance * 100).toFixed(1)}%`);
            
            if (Math.random() < successChance) {
                // 签约成功
                const success = this.signPlayerToTeam(player, userTeam, negotiation);
                if (success) {
                    result.signed++;
                    result.details.push({ playerName, status: 'signed', reason: '谈判成功' });
                    this.showNotification(`${playerName} 签约成功！`, 'success');
                    this.markNegotiationCompleted(negotiation, 'signed');
                } else {
                    result.failed++;
                    result.details.push({ playerName, status: 'failed', reason: '签约失败' });
                    this.markNegotiationCompleted(negotiation, 'failed');
                }
            } else {
                // 签约失败
                result.failed++;
                result.details.push({ playerName, status: 'failed', reason: '谈判破裂' });
                
                // 从 availablePlayers 中移除（被其他球队签走）
                if (state.availablePlayers) {
                    const idx = state.availablePlayers.findIndex(p => p.id === playerId);
                    if (idx !== -1) {
                        state.availablePlayers.splice(idx, 1);
                        console.log(`[SeasonManager] ${playerName} 被其他球队签走`);
                    }
                }
                
                this.markNegotiationCompleted(negotiation, 'failed');
            }
        }
        
        // 保存状态
        this.gameStateManager.saveGameState();
        
        return result;
    }
    
    /**
     * 标记谈判为已完成
     * @param {Object} negotiation - 谈判对象
     * @param {string} result - 结果类型 'signed' | 'failed'
     */
    markNegotiationCompleted(negotiation, result) {
        const playerId = negotiation.playerId || negotiation.targetId;
        
        // 更新 state.activeNegotiations
        const state = this.gameStateManager.getState();
        if (state.activeNegotiations) {
            const idx = state.activeNegotiations.findIndex(n => 
                (n.playerId === playerId) || (n.targetId === playerId)
            );
            if (idx !== -1) {
                state.activeNegotiations[idx].status = result === 'signed' ? 'completed' : 'failed';
                state.activeNegotiations[idx].completedAt = new Date().toISOString();
                state.activeNegotiations[idx].result = result;
            }
        }
        
        // 更新 state.negotiations.playerNegotiations
        if (state.negotiations?.playerNegotiations) {
            const idx = state.negotiations.playerNegotiations.findIndex(n => 
                (n.playerId === playerId) || (n.targetId === playerId)
            );
            if (idx !== -1) {
                state.negotiations.playerNegotiations[idx].status = result === 'signed' ? 'completed' : 'failed';
                state.negotiations.playerNegotiations[idx].completedAt = new Date().toISOString();
                state.negotiations.playerNegotiations[idx].result = result;
            }
        }
        
        // 更新 window.negotiationManager
        if (window.negotiationManager?.negotiations) {
            const idx = window.negotiationManager.negotiations.findIndex(n => 
                (n.playerId === playerId) || (n.targetId === playerId)
            );
            if (idx !== -1) {
                window.negotiationManager.negotiations[idx].status = result === 'signed' ? 'completed' : 'failed';
                window.negotiationManager.negotiations[idx].completedAt = new Date().toISOString();
                window.negotiationManager.negotiations[idx].result = result;
            }
        }
        
        console.log(`[SeasonManager] 谈判 ${result}: ${negotiation.playerName || negotiation.targetName}`);
    }
    
    /**
     * 计算签约成功率
     * @param {Object} negotiation - 谈判对象
     * @param {Object} player - 球员对象
     * @returns {number} 成功率 (0-1)
     */
    calculateSigningChance(negotiation, player) {
        let chance = 0.5; // 基础50%成功率
        
        // 根据谈判进度调整
        const progress = negotiation.progress || 0;
        chance += progress * 0.3; // 进度越高，成功率越高
        
        // 根据球员兴趣度调整
        const interest = negotiation.playerInterest || 50;
        chance += (interest - 50) / 100; // 兴趣度每高10点，成功率+10%
        
        // 根据奖学金报价调整
        const scholarship = negotiation.scholarship || 0.5;
        const playerRequirement = player.scholarshipRequirement || 0.5;
        if (scholarship >= playerRequirement) {
            chance += 0.2; // 满足奖学金要求+20%
        } else {
            chance -= 0.3; // 不满足-30%
        }
        
        // 根据球员质量调整（好球员更难签）
        const rating = player.rating || player.getOverallRating?.() || 70;
        if (rating >= 80) {
            chance -= 0.15; // 顶级球员-15%
        } else if (rating >= 75) {
            chance -= 0.05; // 优秀球员-5%
        }
        
        // 限制在合理范围
        return Math.max(0.1, Math.min(0.9, chance));
    }
    
    /**
     * 将球员签约到球队
     * @param {Object} player - 球员对象
     * @param {Object} team - 球队对象
     * @param {Object} negotiation - 谈判对象
     * @returns {boolean} 是否成功
     */
    signPlayerToTeam(player, team, negotiation) {
        try {
            // 检查球队阵容空间
            const currentRosterSize = team.roster?.length || 0;
            if (currentRosterSize >= 15) {
                console.warn(`[SeasonManager] 球队阵容已满，无法签约 ${player.name}`);
                return false;
            }
            
            // 检查奖学金空间
            const scholarshipNeeded = negotiation.scholarship || player.scholarshipRequirement || 0.5;
            const totalScholarships = team.scholarships?.total || 5;
            const usedScholarships = team.roster?.reduce((sum, p) => sum + (p.scholarship || 0), 0) || 0;
            
            if (usedScholarships + scholarshipNeeded > totalScholarships + 0.01) {
                console.warn(`[SeasonManager] 奖学金不足，无法签约 ${player.name}`);
                return false;
            }
            
            // 准备球员数据
            const playerData = {
                id: player.id,
                name: player.name,
                position: player.position,
                year: player.year || 1,
                age: player.age || 18,
                rating: player.rating || player.getOverallRating?.() || 70,
                potential: player.potential || 75,
                scholarship: scholarshipNeeded,
                scholarshipRequirement: player.scholarshipRequirement || scholarshipNeeded,
                attributes: player.attributes || {},
                stats: player.stats || { games: 0, points: 0, rebounds: 0, assists: 0 },
                seasonStats: player.seasonStats || { games: 0, points: 0, rebounds: 0, assists: 0, minutes: 0 }
            };
            
            // 添加到球队阵容
            if (!team.roster) {
                team.roster = [];
            }
            team.roster.push(playerData);
            
            // 从 availablePlayers 中移除
            const state = this.gameStateManager.getState();
            if (state.availablePlayers) {
                const idx = state.availablePlayers.findIndex(p => p.id === player.id);
                if (idx !== -1) {
                    state.availablePlayers.splice(idx, 1);
                }
            }
            
            console.log(`[SeasonManager] ${player.name} 成功签约到 ${team.name}`);
            return true;
            
        } catch (error) {
            console.error(`[SeasonManager] 签约球员失败:`, error);
            return false;
        }
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