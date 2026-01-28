/**
 * Game Simulation Interface Adapter
 * 连接现有的GameEngine与新的比赛模拟界面
 */

class GameSimulationAdapter {
    constructor(gameEngine, gameStateManager) {
        this.gameEngine = gameEngine;
        this.gameStateManager = gameStateManager;
        this.simulationUI = null;
        this.isInitialized = false;
        this.messageListener = null;
    }

    /**
     * 初始化适配器
     */
    async initialize() {
        if (this.isInitialized) return;

        this.setupMessageListener();
        this.isInitialized = true;
        console.log('Game Simulation Adapter initialized');
    }

    setupMessageListener() {
        this.messageListener = (event) => {
            if (event.data && event.data.type === 'gameSimulationComplete') {
                this.handleSimulationComplete(event.data.data);
            }
        };

        window.addEventListener('message', this.messageListener);
    }

    handleSimulationComplete(gameResult) {
        console.log('Game simulation completed:', gameResult);
        
        this.syncSimulationResult(gameResult);
        this.saveGameResult(gameResult);

        if (this.gameEngine && this.gameEngine.eventSystem) {
            this.gameEngine.eventSystem.emit('simulationComplete', gameResult);
        }
    }

    /**
     * 启动比赛模拟界面
     * @param {Object} gameData - 比赛数据，包含主队和客队
     */
    launchSimulation(gameData) {
        const homeTeam = this.convertTeamToSimulationFormat(gameData.homeTeam);
        const awayTeam = this.convertTeamToSimulationFormat(gameData.awayTeam);

        const simulationData = {
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            gameId: gameData.id || Date.now(),
            scheduleGameId: gameData.scheduleGameId || null
        };

        this.openSimulationWindow(simulationData);
    }

    /**
     * 将现有Team对象转换为模拟界面格式
     * @param {Team} team - 现有的Team对象
     * @returns {Object} 模拟界面格式的球队数据
     */
    convertTeamToSimulationFormat(team) {
        const lineup = team.getBestLineup ? team.getBestLineup() : {};
        const players = [];

        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        
        positions.forEach(position => {
            const player = lineup[position];
            if (player) {
                players.push({
                    id: player.id,
                    name: player.name,
                    position: player.position,
                    rating: player.getOverallRating ? player.getOverallRating() : player.rating || 70,
                    attributes: {
                        scoring: player.attributes?.scoring || 70,
                        shooting: player.attributes?.shooting || 70,
                        threePoint: player.attributes?.threePoint || 70,
                        passing: player.attributes?.passing || 70,
                        dribbling: player.attributes?.dribbling || 70,
                        defense: player.attributes?.defense || 70,
                        rebounding: player.attributes?.rebounding || 70,
                        speed: player.attributes?.speed || 70
                    }
                });
            }
        });

        return {
            name: team.name,
            players: players,
            score: 0,
            teamStrength: team.getTeamStrength ? team.getTeamStrength() : 70
        };
    }

    /**
     * 打开模拟窗口
     * @param {Object} simulationData - 模拟数据
     */
    openSimulationWindow(simulationData) {
        const simulationWindow = window.open(
            'game-simulation.html',
            'game_simulation',
            'width=1400,height=900,scrollbars=yes,resizable=yes'
        );

        if (simulationWindow) {
            simulationWindow.onload = () => {
                this.injectSimulationData(simulationWindow, simulationData);
            };
        } else {
            alert('无法打开模拟窗口，请检查浏览器弹窗设置');
        }
    }

    /**
     * 向模拟窗口注入数据
     * @param {Window} simulationWindow - 模拟窗口对象
     * @param {Object} simulationData - 模拟数据
     */
    injectSimulationData(simulationWindow, simulationData) {
        try {
            if (simulationWindow.game) {
                simulationWindow.game.loadExternalData(simulationData);
            } else {
                setTimeout(() => {
                    this.injectSimulationData(simulationWindow, simulationData);
                }, 500);
            }
        } catch (error) {
            console.error('Failed to inject simulation data:', error);
        }
    }

    /**
     * 从GameEngine获取比赛数据
     * @param {Object} gameState - 游戏状态
     * @returns {Object} 比赛数据
     */
    getGameDataFromEngine(gameState) {
        return {
            id: gameState.id,
            scheduleGameId: gameState.scheduleGameId,
            homeTeam: gameState.homeTeam,
            awayTeam: gameState.awayTeam,
            homeScore: gameState.homeScore,
            awayScore: gameState.awayScore,
            quarter: gameState.quarter,
            timeRemaining: gameState.timeRemaining,
            possession: gameState.possession
        };
    }

    /**
     * 将模拟结果同步回GameEngine
     * @param {Object} simulationResult - 模拟结果
     */
    syncSimulationResult(simulationResult) {
        if (this.gameEngine && this.gameEngine.activeGame) {
            const gameState = this.gameEngine.activeGame;
            
            gameState.homeScore = simulationResult.homeScore;
            gameState.awayScore = simulationResult.awayScore;
            gameState.quarter = simulationResult.quarter;
            gameState.timeRemaining = simulationResult.timeRemaining;

            if (this.gameEngine.eventSystem) {
                const winner = simulationResult.homeScore > simulationResult.awayScore ? 
                    gameState.homeTeam.name : 
                    gameState.awayTeam.name;
                
                this.gameEngine.eventSystem.emit('gameCompleted', {
                    gameId: gameState.id,
                    winner: winner,
                    homeScore: simulationResult.homeScore,
                    awayScore: simulationResult.awayScore
                });
            }
        }
    }

    /**
     * 创建快速模拟按钮
     * @param {HTMLElement} container - 容器元素
     * @param {Object} gameData - 比赛数据
     */
    createQuickSimButton(container, gameData) {
        const button = document.createElement('button');
        button.className = 'quick-sim-btn';
        button.innerHTML = '🏀 快速模拟';
        button.style.cssText = `
            padding: 12px 24px;
            background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
            border: none;
            border-radius: 10px;
            color: white;
            font-weight: 700;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 4px 15px rgba(233, 69, 96, 0.4);
            margin: 10px;
        `;

        button.addEventListener('click', () => {
            this.launchSimulation(gameData);
        });

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-3px)';
            button.style.boxShadow = '0 8px 25px rgba(233, 69, 96, 0.6)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 4px 15px rgba(233, 69, 96, 0.4)';
        });

        container.appendChild(button);
    }

    /**
     * 获取当前用户球队
     * @returns {Team|null} 用户球队
     */
    getUserTeam() {
        const state = this.gameStateManager.getState();
        return state?.userTeam || null;
    }

    /**
     * 获取对手球队
     * @param {string} opponentId - 对手ID
     * @returns {Team|null} 对手球队
     */
    getOpponentTeam(opponentId) {
        const state = this.gameStateManager.getState();
        if (state?.teams) {
            return state.teams.find(team => team.id === opponentId) || null;
        }
        return null;
    }

    /**
     * 创建示例比赛数据（用于测试）
     * @returns {Object} 示例比赛数据
     */
    createSampleGameData() {
        const userTeam = this.getUserTeam();
        
        if (userTeam) {
            const opponentId = this.getRandomOpponentId();
            const opponentTeam = this.getOpponentTeam(opponentId);

            if (opponentTeam) {
                return {
                    id: Date.now(),
                    homeTeam: userTeam,
                    awayTeam: opponentTeam,
                    scheduleGameId: null
                };
            }
        }

        return null;
    }

    /**
     * 获取随机对手ID
     * @returns {string} 对手ID
     */
    getRandomOpponentId() {
        const state = this.gameStateManager.getState();
        if (state?.teams && state.teams.length > 1) {
            const userTeamId = state.userTeam?.id;
            const opponents = state.teams.filter(team => team.id !== userTeamId);
            if (opponents.length > 0) {
                const randomIndex = Math.floor(Math.random() * opponents.length);
                return opponents[randomIndex].id;
            }
        }
        return null;
    }

    /**
     * 在指定容器中添加快速模拟功能
     * @param {string} containerId - 容器ID
     */
    addQuickSimToContainer(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id '${containerId}' not found`);
            return;
        }

        const gameData = this.createSampleGameData();
        if (gameData) {
            this.createQuickSimButton(container, gameData);
        } else {
            console.error('Failed to create sample game data');
        }
    }

    /**
     * 更新球队统计
     * @param {string} teamId - 球队ID
     * @param {Object} stats - 统计数据
     */
    updateTeamStats(teamId, stats) {
        const state = this.gameStateManager.getState();
        if (state?.teams) {
            const team = state.teams.find(t => t.id === teamId);
            if (team) {
                if (team.stats) {
                    team.stats.pointsFor += stats.pointsFor || 0;
                    team.stats.pointsAgainst += stats.pointsAgainst || 0;
                    
                    if (stats.won) {
                        team.stats.wins++;
                    } else {
                        team.stats.losses++;
                    }
                }
            }
        }
    }

    /**
     * 保存比赛结果
     * @param {Object} gameResult - 比赛结果
     */
    saveGameResult(gameResult) {
        const state = this.gameStateManager.getState();
        
        if (state?.gameHistory) {
            state.gameHistory.push({
                id: gameResult.gameId,
                date: new Date().toISOString(),
                homeTeam: gameResult.homeTeam,
                awayTeam: gameResult.awayTeam,
                homeScore: gameResult.homeScore,
                awayScore: gameResult.awayScore,
                winner: gameResult.winner
            });
        }

        this.updateTeamStats(gameResult.homeTeam.id, {
            pointsFor: gameResult.homeScore,
            pointsAgainst: gameResult.awayScore,
            won: gameResult.homeScore > gameResult.awayScore
        });

        this.updateTeamStats(gameResult.awayTeam.id, {
            pointsFor: gameResult.awayScore,
            pointsAgainst: gameResult.homeScore,
            won: gameResult.awayScore > gameResult.homeScore
        });
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameSimulationAdapter;
}