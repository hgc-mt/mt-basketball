/**
 * Scouting System module
 * Handles player scouting and team analysis
 */

class ScoutingSystem {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.isInitialized = false;
        this.selectedTeamId = null;
    }

    async initialize() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log('Scouting System initialized');
    }

    updateScoutingScreen() {
        this.updateTeamSelector();
        this.setupScoutingEvents();
        this.setupTabSwitching();
    }

    updateTeamSelector() {
        const state = this.gameStateManager.getState();
        const allTeams = state.allTeams;
        const teamSelect = document.getElementById('team-select');

        if (!teamSelect) return;

        // Clear existing options
        teamSelect.innerHTML = '<option value="">请选择球队...</option>';

        // Add team options
        allTeams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.id;
            option.textContent = team.name;
            teamSelect.appendChild(option);
        });

        // Add change event
        teamSelect.addEventListener('change', () => {
            const teamId = parseInt(teamSelect.value);
            if (teamId) {
                this.selectedTeamId = teamId;
                this.displayTeamRoster(teamId);
            }
        });
    }

    displayTeamRoster(teamId) {
        const state = this.gameStateManager.getState();
        const team = state.allTeams.find(t => t.id === teamId);

        if (!team) return;

        const rosterContainer = document.getElementById('roster-details');
        if (!rosterContainer) return;

        const rosterHtml = team.roster.map(player => `
            <div class="scout-player-card">
                <div class="player-header">
                    <h4 class="player-name">${player.name}</h4>
                    <span class="player-position">${player.position}</span>
                </div>
                <div class="player-rating">
                    <div class="overall-rating">${player.getOverallRating()}</div>
                    <div class="potential">潜力: ${player.potential}</div>
                </div>
            </div>
        `).join('');

        rosterContainer.innerHTML = rosterHtml;
    }

    setupScoutingEvents() {
        // Scout selected team button
        const scoutTeamBtn = document.getElementById('scout-selected-team');
        if (scoutTeamBtn) {
            scoutTeamBtn.addEventListener('click', () => {
                if (this.selectedTeamId) {
                    this.scoutTeam(this.selectedTeamId);
                }
            });
        }

        // Scout free agents button
        const scoutFreeAgentsBtn = document.getElementById('scout-free-agents');
        if (scoutFreeAgentsBtn) {
            scoutFreeAgentsBtn.addEventListener('click', () => {
                this.scoutFreeAgents();
            });
        }

        // Refresh scouting data button
        const refreshBtn = document.getElementById('refresh-scouting-data');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshScoutingData();
            });
        }
    }

    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');

                // Update active states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                button.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    scoutTeam(teamId) {
        const state = this.gameStateManager.getState();
        const team = state.allTeams.find(t => t.id === teamId);

        if (!team) return;

        // Check scouting budget
        const cost = 5000;
        if (state.scoutingUsed + cost > state.scoutingBudget) {
            this.showNotification('球探预算不足', 'error');
            return;
        }

        // Use scouting budget
        if (this.gameStateManager.useScoutingBudget(cost)) {
            // Analyze team roster distribution
            const rosterAnalysis = this.analyzeTeamRoster(team);

            // Create scouting report
            const report = {
                id: Date.now(),
                date: new Date(),
                type: 'team',
                targetId: teamId,
                targetName: team.name,
                cost: cost,
                data: {
                    teamStrength: team.getTeamStrength(),
                    rosterSize: team.roster.length,
                    bestPlayer: team.roster.reduce((best, player) =>
                        player.getOverallRating() > best.getOverallRating() ? player : best, team.roster[0]),
                    rosterAnalysis: rosterAnalysis
                }
            };

            // Add report
            state.scoutingReports.push(report);

            // Update UI
            this.updateScoutingReports();
            this.updateScoutingBudgetDisplay();

            this.showNotification(`已完成对 ${team.name} 的球探分析`, 'success');

            // Save game state
            this.gameStateManager.saveGameState();
        }
    }

    analyzeTeamRoster(team) {
        const freshmen = team.roster.filter(p => p.year === 1).length;
        const sophomores = team.roster.filter(p => p.year === 2).length;
        const juniors = team.roster.filter(p => p.year === 3).length;
        const seniors = team.roster.filter(p => p.year === 4).length;
        const rosterSize = team.roster.length;

        const freshmanStatus = (freshmen >= 4 && freshmen <= 5) ? '符合' : '偏差';
        const sophomoreStatus = (sophomores >= 3 && sophomores <= 4) ? '符合' : '偏差';
        const juniorStatus = (juniors >= 2 && juniors <= 3) ? '符合' : '偏差';
        const seniorStatus = (seniors >= 3 && seniors <= 4) ? '符合' : '偏差';

        return {
            rosterSize: rosterSize,
            freshmen: freshmen,
            sophomores: sophomores,
            juniors: juniors,
            seniors: seniors,
            freshmanStatus: freshmanStatus,
            sophomoreStatus: sophomoreStatus,
            juniorStatus: juniorStatus,
            seniorStatus: seniorStatus
        };
    }

    scoutFreeAgents() {
        const state = this.gameStateManager.getState();
        const availablePlayers = state.availablePlayers;

        if (availablePlayers.length === 0) {
            this.showNotification('没有可球探的自由球员', 'warning');
            return;
        }

        // Check scouting budget
        const cost = 3000;
        if (state.scoutingUsed + cost > state.scoutingBudget) {
            this.showNotification('球探预算不足', 'error');
            return;
        }

        // Use scouting budget
        if (this.gameStateManager.useScoutingBudget(cost)) {
            // Get random players to scout
            const playersToScout = availablePlayers.slice(0, Math.min(5, availablePlayers.length));

            // Create scouting report
            const report = {
                id: Date.now(),
                date: new Date(),
                type: 'free-agents',
                targetId: null,
                targetName: '自由球员',
                cost: cost,
                data: {
                    players: playersToScout.map(player => ({
                        id: player.id,
                        name: player.name,
                        position: player.position,
                        overallRating: player.getOverallRating(),
                        potential: player.potential
                    }))
                }
            };

            // Add report
            state.scoutingReports.push(report);

            // Update UI
            this.updateScoutingReports();
            this.updateScoutingBudgetDisplay();

            this.showNotification(`已完成对自由球员的球探分析`, 'success');

            // Save game state
            this.gameStateManager.saveGameState();
        }
    }

    refreshScoutingData() {
        // Reset scouting budget
        this.gameStateManager.resetScoutingBudget();

        // Update UI
        this.updateScoutingBudgetDisplay();

        this.showNotification('球探数据已刷新', 'info');
    }

    updateScoutingReports() {
        const state = this.gameStateManager.getState();
        const reports = state.scoutingReports;
        const container = document.getElementById('reports-container');

        if (!container) return;

        if (reports.length === 0) {
            container.innerHTML = '<p>暂无球探报告</p>';
            return;
        }

        const reportsHtml = reports.map(report => `
            <div class="scouting-report">
                <div class="report-header">
                    <h4>${report.targetName}</h4>
                    <span class="report-date">${this.formatDate(report.date)}</span>
                </div>
                <div class="report-content">
                    ${this.generateReportContent(report)}
                </div>
            </div>
        `).join('');

        container.innerHTML = reportsHtml;
    }

    generateReportContent(report) {
        if (report.type === 'team') {
            const data = report.data;
            const analysis = data.rosterAnalysis;
            return `
                <p>球队实力: ${data.teamStrength}</p>
                <p>阵容规模: ${data.rosterSize}人</p>
                <p>最佳球员: ${data.bestPlayer.name} (${data.bestPlayer.getOverallRating()})</p>
                <div class="roster-analysis">
                    <h5>阵容分布分析</h5>
                    <div class="analysis-grid">
                        <div class="analysis-item">
                            <span class="label">大一替补</span>
                            <span class="value">${analysis.freshmen}人</span>
                            <span class="status ${analysis.freshmanStatus === '符合' ? 'good' : 'bad'}">${analysis.freshmanStatus}</span>
                        </div>
                        <div class="analysis-item">
                            <span class="label">大二轮换</span>
                            <span class="value">${analysis.sophomores}人</span>
                            <span class="status ${analysis.sophomoreStatus === '符合' ? 'good' : 'bad'}">${analysis.sophomoreStatus}</span>
                        </div>
                        <div class="analysis-item">
                            <span class="label">大三主力</span>
                            <span class="value">${analysis.juniors}人</span>
                            <span class="status ${analysis.juniorStatus === '符合' ? 'good' : 'bad'}">${analysis.juniorStatus}</span>
                        </div>
                        <div class="analysis-item">
                            <span class="label">大四核心</span>
                            <span class="value">${analysis.seniors}人</span>
                            <span class="status ${analysis.seniorStatus === '符合' ? 'good' : 'bad'}">${analysis.seniorStatus}</span>
                        </div>
                    </div>
                </div>
            `;
        } else if (report.type === 'free-agents') {
            const data = report.data;
            return `
                <div class="scouted-players">
                    ${data.players.map(player => `
                        <div class="scouted-player">
                            <span class="player-name">${player.name}</span>
                            <span class="player-position">${player.position}</span>
                            <span class="player-rating">${player.overallRating}</span>
                            <span class="player-potential">潜力: ${player.potential}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        return '<p>无详细数据</p>';
    }

    updateScoutingBudgetDisplay() {
        const state = this.gameStateManager.getState();
        const budgetElement = document.getElementById('scouting-budget');
        const usedElement = document.getElementById('scouting-used');

        if (budgetElement) {
            budgetElement.textContent = `$${state.scoutingBudget.toLocaleString()}`;
        }

        if (usedElement) {
            usedElement.textContent = `$${state.scoutingUsed.toLocaleString()}`;
        }
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