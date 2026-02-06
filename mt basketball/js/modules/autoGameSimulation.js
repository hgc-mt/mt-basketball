/**
 * 自动比赛模拟引擎 - 小电视式播报
 * 自动播放，无需控制，像看电视一样观看比赛
 */

class AutoGameSimulation {
    constructor() {
        this.gameState = null;
        this.isRunning = false;
        this.gameLoop = null;
        this.speed = 1;
        
        this.homeTeam = null;
        this.awayTeam = null;
        
        // 统计数据
        this.stats = {
            home: { score: 0, fg: { made: 0, attempted: 0 }, tp: { made: 0, attempted: 0 }, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 },
            away: { score: 0, fg: { made: 0, attempted: 0 }, tp: { made: 0, attempted: 0 }, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 }
        };
        
        this.events = [];
        this.onUpdate = null;
        this.onEvent = null;
        this.onComplete = null;
        
        // 当前持球球员
        this.ballHandler = null;
        this.possessionTeam = null;
    }

    initialize(homeTeam, awayTeam, speed = 1) {
        this.homeTeam = this.processTeam(homeTeam, 'home');
        this.awayTeam = this.processTeam(awayTeam, 'away');
        this.speed = speed;
        
        this.gameState = {
            quarter: 1,
            timeRemaining: 720, // 12分钟
            shotClock: 24,
            possession: Math.random() < 0.5 ? 'home' : 'away',
            lastEventTime: 720
        };
        
        this.stats = {
            home: { score: 0, fg: { made: 0, attempted: 0 }, tp: { made: 0, attempted: 0 }, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 },
            away: { score: 0, fg: { made: 0, attempted: 0 }, tp: { made: 0, attempted: 0 }, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 }
        };
        
        this.events = [];
        this.ballHandler = null;
        this.possessionTeam = this.gameState.possession === 'home' ? this.homeTeam : this.awayTeam;
        
        this.addEvent('比赛开始！欢迎收看本场精彩对决', 'game_start');
        this.addEvent(`${this.homeTeam.name} vs ${this.awayTeam.name}`, 'info');
        
        return this.getStatus();
    }

    processTeam(team, side) {
        const processed = {
            id: team.id || side,
            name: team.name || (side === 'home' ? '主队' : '客队'),
            players: [],
            lineup: [],
            totalRating: 0
        };

        const players = team.players || team.roster || [];
        players.forEach((player, index) => {
            const rating = player.rating || (player.getOverallRating ? player.getOverallRating() : 70);
            const processedPlayer = {
                id: player.id || `${side}_${index}`,
                name: player.name || `球员${index + 1}`,
                position: player.position || ['PG', 'SG', 'SF', 'PF', 'C'][index % 5],
                rating: rating,
                stats: { points: 0, fg: { made: 0, attempted: 0 }, tp: { made: 0, attempted: 0 }, reb: 0, ast: 0 }
            };
            processed.players.push(processedPlayer);
        });

        processed.lineup = processed.players.slice(0, 5);
        processed.totalRating = Math.round(processed.lineup.reduce((sum, p) => sum + p.rating, 0) / processed.lineup.length);
        
        return processed;
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        const interval = 1000 / this.speed;
        this.gameLoop = setInterval(() => this.tick(), interval);
    }

    stop() {
        this.isRunning = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    tick() {
        if (!this.isRunning) return;

        const state = this.gameState;
        
        // 时间推进 - 每次减少3-8秒（模拟一次进攻回合）
        const timeAdvance = 3 + Math.floor(Math.random() * 6);
        state.timeRemaining -= timeAdvance;
        state.shotClock -= timeAdvance;

        // 检查节次结束
        if (state.timeRemaining <= 0) {
            this.handleQuarterEnd();
            return;
        }

        // 进攻时间到
        if (state.shotClock <= 0) {
            this.handleShotClockViolation();
            return;
        }

        // 模拟进攻回合
        this.simulatePossession();

        // 更新UI
        if (this.onUpdate) {
            this.onUpdate(this.getStatus());
        }
    }

    simulatePossession() {
        const state = this.gameState;
        const isHome = state.possession === 'home';
        const attackingTeam = isHome ? this.homeTeam : this.awayTeam;
        const defendingTeam = isHome ? this.awayTeam : this.homeTeam;
        const attackStats = isHome ? this.stats.home : this.stats.away;
        const defenseStats = isHome ? this.stats.away : this.stats.home;

        // 选择持球球员（优先评分高的）
        const ballHandler = this.selectBallHandler(attackingTeam);
        this.ballHandler = ballHandler;
        this.possessionTeam = attackingTeam;

        // 计算进攻成功率
        const baseSuccess = 0.45;
        const ratingDiff = (ballHandler.rating - 75) / 200; // 评分影响
        const homeAdvantage = isHome ? 0.03 : 0; // 主场优势
        const randomFactor = (Math.random() - 0.5) * 0.2; // 随机因素
        
        const successRate = Math.max(0.25, Math.min(0.75, baseSuccess + ratingDiff + homeAdvantage + randomFactor));

        attackStats.fg.attempted++;
        ballHandler.stats.fg.attempted++;

        // 播报进攻
        this.addEvent(`${attackingTeam.name} ${ballHandler.name} (${ballHandler.position}) 持球进攻`, 'possession');

        if (Math.random() < successRate) {
            // 得分成功
            const isThreePointer = Math.random() < 0.35;
            const points = isThreePointer ? 3 : 2;
            
            attackStats.score += points;
            attackStats.fg.made++;
            ballHandler.stats.points += points;
            ballHandler.stats.fg.made++;
            
            if (isThreePointer) {
                attackStats.tp.attempted++;
                attackStats.tp.made++;
                ballHandler.stats.tp.attempted++;
                ballHandler.stats.tp.made++;
                this.addEvent(`🎯 ${ballHandler.name} 三分命中！${points}分`, 'three');
            } else {
                this.addEvent(`🏀 ${ballHandler.name} 投篮命中！${points}分`, 'score');
            }

            // 助攻（40%概率）
            if (Math.random() < 0.4) {
                const assister = this.selectAssister(attackingTeam, ballHandler);
                attackStats.ast++;
                assister.stats.ast++;
                this.addEvent(`👟 ${assister.name} 助攻`, 'assist');
            }
        } else {
            // 投篮不中 - 争夺篮板
            this.addEvent(`❌ ${ballHandler.name} 投篮不中`, 'miss');
            this.simulateRebound(attackingTeam, defendingTeam, attackStats, defenseStats);
        }

        // 重置进攻
        state.shotClock = 24;
        state.possession = isHome ? 'away' : 'home';
        state.lastEventTime = state.timeRemaining;
    }

    selectBallHandler(team) {
        // 优先选择评分高的球员，但有一定随机性
        const sorted = [...team.lineup].sort((a, b) => b.rating - a.rating);
        const rand = Math.random();
        if (rand < 0.5) return sorted[0]; // 50%概率给最好球员
        if (rand < 0.8) return sorted[1]; // 30%概率给第二
        return sorted[Math.floor(Math.random() * sorted.length)]; // 20%随机
    }

    selectAssister(team, scorer) {
        const others = team.lineup.filter(p => p.id !== scorer.id);
        return others.sort((a, b) => b.rating - a.rating)[0] || team.lineup[0];
    }

    simulateRebound(attackingTeam, defendingTeam, attackStats, defenseStats) {
        // 篮板争夺
        const attackReboundChance = 0.25; // 进攻篮板25%
        
        if (Math.random() < attackReboundChance) {
            // 进攻篮板
            const rebounder = this.selectRebounder(attackingTeam);
            attackStats.reb++;
            rebounder.stats.reb++;
            this.addEvent(`💪 ${rebounder.name} 抢到进攻篮板！`, 'rebound_off');
            // 继续进攻，不交换球权
            this.gameState.shotClock = 14;
        } else {
            // 防守篮板
            const rebounder = this.selectRebounder(defendingTeam);
            defenseStats.reb++;
            rebounder.stats.reb++;
            this.addEvent(`🛡️ ${rebounder.name} 抢到防守篮板`, 'rebound_def');
        }
    }

    selectRebounder(team) {
        // 内线球员更容易抢到篮板
        const weights = team.lineup.map(p => {
            let weight = p.rating;
            if (p.position === 'C') weight += 15;
            if (p.position === 'PF') weight += 10;
            return { player: p, weight };
        });
        
        const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const w of weights) {
            random -= w.weight;
            if (random <= 0) return w.player;
        }
        return weights[0].player;
    }

    handleShotClockViolation() {
        const team = this.gameState.possession === 'home' ? this.homeTeam : this.awayTeam;
        const stats = this.gameState.possession === 'home' ? this.stats.home : this.stats.away;
        
        stats.to++;
        this.addEvent(`⏰ ${team.name} 进攻时间违例！`, 'violation');
        
        this.gameState.shotClock = 24;
        this.gameState.possession = this.gameState.possession === 'home' ? 'away' : 'home';
    }

    handleQuarterEnd() {
        const state = this.gameState;
        const homeScore = this.stats.home.score;
        const awayScore = this.stats.away.score;
        
        this.addEvent(`📢 第${state.quarter}节结束！比分 ${homeScore}:${awayScore}`, 'quarter_end');

        if (state.quarter < 4) {
            state.quarter++;
            state.timeRemaining = 720;
            state.shotClock = 24;
            this.addEvent(`🏀 第${state.quarter}节开始！`, 'quarter_start');
        } else {
            this.endGame();
        }
    }

    endGame() {
        this.stop();
        
        const homeScore = this.stats.home.score;
        const awayScore = this.stats.away.score;
        const winner = homeScore > awayScore ? this.homeTeam.name : 
                      awayScore > homeScore ? this.awayTeam.name : '平局';
        
        this.addEvent(`🏆 比赛结束！${winner} 获胜！`, 'game_end');
        this.addEvent(`📊 最终比分 ${homeScore} : ${awayScore}`, 'final');
        
        // 播报最佳球员
        const allPlayers = [...this.homeTeam.lineup, ...this.awayTeam.lineup];
        const mvp = allPlayers.sort((a, b) => b.stats.points - a.stats.points)[0];
        if (mvp && mvp.stats.points > 0) {
            this.addEvent(`⭐ 本场最佳：${mvp.name} ${mvp.stats.points}分 ${mvp.stats.reb}板 ${mvp.stats.ast}助`, 'mvp');
        }

        if (this.onComplete) {
            this.onComplete({
                homeTeam: this.homeTeam,
                awayTeam: this.awayTeam,
                homeScore,
                awayScore,
                winner,
                stats: this.stats,
                events: this.events
            });
        }
    }

    addEvent(text, type) {
        const event = {
            id: Date.now() + Math.random(),
            quarter: this.gameState?.quarter || 1,
            time: this.getTimeString(),
            text,
            type
        };
        
        this.events.unshift(event);
        if (this.events.length > 50) this.events.pop();
        
        if (this.onEvent) this.onEvent(event);
        return event;
    }

    getTimeString() {
        if (!this.gameState) return '12:00';
        const minutes = Math.floor(this.gameState.timeRemaining / 60);
        const seconds = this.gameState.timeRemaining % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            quarter: this.gameState?.quarter,
            timeRemaining: this.gameState?.timeRemaining,
            shotClock: this.gameState?.shotClock,
            possession: this.gameState?.possession,
            homeScore: this.stats.home.score,
            awayScore: this.stats.away.score,
            homeTeam: this.homeTeam,
            awayTeam: this.awayTeam,
            ballHandler: this.ballHandler,
            stats: this.stats
        };
    }

    setSpeed(speed) {
        this.speed = speed;
        if (this.isRunning) {
            clearInterval(this.gameLoop);
            const interval = 1000 / this.speed;
            this.gameLoop = setInterval(() => this.tick(), interval);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoGameSimulation;
}
