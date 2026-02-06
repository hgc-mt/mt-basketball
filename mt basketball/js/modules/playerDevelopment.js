/**
 * Player Development module
 * Handles player training and skill development
 */

// import { Player } from './dataModels.js';

class PlayerDevelopment {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.isInitialized = false;
        this.selectedPlayerId = null;
        this.eventsSetup = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        this.setupPlayerDevelopmentEvents();
        this.setupTrainingScreenEvents();
        this.isInitialized = true;
        console.log('Player Development initialized');
    }

    updateTrainingScreen() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;

        if (!userTeam) return;

        // Get selected player for training progress display
        const selectedPlayer = this.selectedPlayerId ? userTeam.getPlayer(this.selectedPlayerId) : null;
        const trainingProgress = selectedPlayer?.training || {};

        // Update training screen (if exists)
        const trainingOptionsContainer = document.getElementById('training-options');
        const playerSelectContainer = document.getElementById('player-select');

        const trainingTypes = [
            {
                id: 'shooting',
                name: '投篮训练',
                description: '提升投篮、三分、罚球属性',
                icon: '🎯'
            },
            {
                id: 'dribbling',
                name: '运球训练',
                description: '提升运球、速度属性',
                icon: '🏀'
            },
            {
                id: 'defense',
                name: '防守训练',
                description: '提升防守、篮板、抢断属性',
                icon: '🛡️'
            },
            {
                id: 'physical',
                name: '体能训练',
                description: '提升力量、体力属性',
                icon: '💪'
            },
            {
                id: 'basketball-iq',
                name: '篮球智商训练',
                description: '提升传球、篮球智商属性',
                icon: '🧠'
            }
        ];

        // Check which interface is being used
        const isTrainingScreen = document.getElementById('training')?.classList.contains('active');
        const isPlayerDevelopmentScreen = document.getElementById('player-development')?.classList.contains('active');

        // Update training options in training screen
        if (trainingOptionsContainer && isTrainingScreen) {
            const trainingHtml = trainingTypes.map(type => {
                const progress = trainingProgress[type.id] || 0;
                return `
                <div class="training-type" data-training="${type.id}">
                    <div class="training-icon">${type.icon}</div>
                    <h4>${type.name}</h4>
                    <p>${type.description}</p>
                    <div class="training-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">${progress}/100</span>
                    </div>
                </div>
            `}).join('');

            trainingOptionsContainer.innerHTML = trainingHtml;
        }

        // Update training options in player development screen
        if (trainingOptionsContainer && isPlayerDevelopmentScreen) {
            const trainingHtml = trainingTypes.map(type => {
                const progress = trainingProgress[type.id] || 0;
                return `
                <div class="training-option" data-training="${type.id}">
                    <h5>${type.name}</h5>
                    <p>${type.description}</p>
                    <div class="training-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">${progress}/100</span>
                    </div>
                </div>
            `}).join('');

            trainingOptionsContainer.innerHTML = trainingHtml;
        }

        // Update player selection
        if (playerSelectContainer) {
            const playerSelectHtml = userTeam.roster.map(player => `
                <div class="player-select-item ${this.selectedPlayerId === player.id ? 'selected' : ''}" data-player-id="${player.id}">
                    <div class="player-select-info">
                        <span class="player-select-name">${player.name}</span>
                        <span class="player-select-details">${player.position} | 年级: ${player.year} | 评分: ${player.getOverallRating()}</span>
                    </div>
                    <span class="player-select-rating">${player.getOverallRating()}</span>
                </div>
            `).join('');

            playerSelectContainer.innerHTML = playerSelectHtml;

            playerSelectContainer.querySelectorAll('.player-select-item').forEach(item => {
                item.addEventListener('click', () => {
                    const playerId = parseInt(item.getAttribute('data-player-id'));
                    this.selectPlayer(playerId);
                });
            });
        }

        // Also update player-development screen if it exists
        // 避免循环调用，直接更新球员列表
        if (userTeam) {
            this.updatePlayerList(userTeam);
        }
    }

    updatePlayerDevelopmentScreen() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;

        if (!userTeam) return;

        // Update player list
        this.updatePlayerList(userTeam);

        // 注意：不要在这里调用 updateTrainingScreen，避免循环调用
    }

    updatePlayerList(team) {
        const playerListContainer = document.getElementById('player-list');
        if (!playerListContainer) return;

        const yearLabels = { 1: '大一', 2: '大二', 3: '大三', 4: '大四' };
        const yearTypes = { 1: '新秀', 2: '二年级', 3: '三年级', 4: '老将' };
        const positionEmojis = {
            'PG': '🏀', 'SG': '🎯', 'SF': '🔥', 'PF': '💪', 'C': '🛡️'
        };

        const playerListHtml = team.roster.map(player => {
            const overallRating = player.getOverallRating();
            const potential = player.potential;
            const playerType = yearTypes[player.year] || '新秀';
            const playerInfo = player.getInfo();

            const attributeLabels = {
                scoring: '得分', shooting: '投篮', threePoint: '三分', freeThrow: '罚球',
                passing: '传球', dribbling: '运球', defense: '防守', rebounding: '篮板',
                steal: '抢断', block: '盖帽', speed: '速度', strength: '力量'
            };

            const keyAttributes = ['scoring', 'shooting', 'threePoint', 'passing', 'defense', 'rebounding'];

            const getAttrClass = (value) => {
                if (value >= 75) return 'high';
                if (value <= 55) return 'low';
                return '';
            };

            const skills = player.skills || [];
            const learningSkills = player.learningSkills || [];

            return `
                <div class="player-card player-card-2k ${this.selectedPlayerId === player.id ? 'selected' : ''}" data-player-id="${player.id}">
                    <div class="player-avatar-section">
                        <div class="player-avatar">${positionEmojis[player.position] || '🏀'}</div>
                        <div class="player-rating-badge">${overallRating}</div>
                        <div class="player-rating-label">综合</div>
                    </div>
                    <div class="player-info-section">
                        <div class="player-header-row">
                            <h4 class="player-name-2k">${player.name}</h4>
                            <div class="player-meta-tags">
                                <span class="player-meta-tag position">${Positions[player.position]}</span>
                                <span class="player-meta-tag">${yearLabels[player.year]}</span>
                                <span class="player-meta-tag">${player.age}岁</span>
                                <span class="player-meta-tag star">${playerType}</span>
                            </div>
                        </div>
                        <div class="player-ratings-row">
                            <div class="rating-pill">
                                <span class="rating-pill-value">${potential}</span>
                                <span class="rating-pill-label">潜力</span>
                            </div>
                            <div class="rating-pill">
                                <span class="rating-pill-value">${playerInfo.scoutRating}</span>
                                <span class="rating-pill-label" title="基于当前能力与潜力的综合评估，反映球员发展前景">前景</span>
                            </div>
                            <div class="rating-pill">
                                <span class="rating-pill-value">${player.seasonStats?.games || 0}</span>
                                <span class="rating-pill-label">出场</span>
                            </div>
                        </div>
                        <div class="player-attributes-2k">
                            ${keyAttributes.map(attr => `
                                <div class="attribute-tile ${getAttrClass(player.attributes[attr])}">
                                    <span class="attribute-tile-name">${attributeLabels[attr] || attr}</span>
                                    <span class="attribute-tile-value">${player.attributes[attr]}</span>
                                    <div class="attribute-tile-bar">
                                        <div class="attribute-tile-fill" style="width: ${player.attributes[attr]}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        ${(skills.length > 0 || learningSkills.length > 0) ? `
                            <div class="player-skills">
                                ${skills.slice(0, 3).map(skill => `
                                    <span class="skill-badge gold">${skill.name || skill}</span>
                                `).join('')}
                                ${learningSkills.slice(0, 2).map(skill => `
                                    <span class="skill-badge">学习中: ${skill.name || skill}</span>
                                `).join('')}
                            </div>
                        ` : ''}
                        <div class="player-description-card">
                            <h4>球员简介</h4>
                            <p>${playerInfo.description || `${player.name}是一名${player.age}岁的${Positions[player.position]}，具备良好的篮球天赋和成长潜力。`}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        playerListContainer.innerHTML = playerListHtml;

        playerListContainer.querySelectorAll('.player-card').forEach(card => {
            card.addEventListener('click', () => {
                const playerId = parseInt(card.getAttribute('data-player-id'));
                this.selectPlayer(playerId);
            });
        });
    }

    selectPlayer(playerId) {
        this.selectedPlayerId = playerId;

        // Update UI
        this.updatePlayerList(this.gameStateManager.get('userTeam'));
        this.updatePlayerDetails(playerId);
        this.updateTrainingScreen();
        this.updateSkillOptions();
    }

    updatePlayerDetails(playerId) {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;

        if (!userTeam) return;

        const player = userTeam.getPlayer(playerId);
        if (!player) return;

        const playerDetailsContainer = document.getElementById('player-details');
        if (!playerDetailsContainer) return;

        const playerInfo = player.getInfo();

        playerDetailsContainer.innerHTML = `
            <div class="player-details-content">
                <h3>${playerInfo.name}</h3>
                <div class="player-info">
                    <p>位置: ${playerInfo.position}</p>
                    <p>年级: ${playerInfo.year}</p>
                    <p>年龄: ${playerInfo.age}</p>
                </div>
                <div class="player-ratings">
                    <p>综合评分: ${playerInfo.overallRating}</p>
                    <p>潜力: ${playerInfo.potential}</p>
                </div>
            </div>
        `;
    }

    updateTrainingOptions() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;

        if (!userTeam) return;

        const trainingOptionsContainer = document.getElementById('training-options');
        if (!trainingOptionsContainer) return;

        // Get selected player and their training progress
        const selectedPlayer = this.selectedPlayerId ? userTeam.getPlayer(this.selectedPlayerId) : null;
        const trainingProgress = selectedPlayer?.training || {};

        const trainingTypes = [
            { id: 'shooting', name: '投篮训练', description: '提升投篮、三分、罚球属性' },
            { id: 'dribbling', name: '运球训练', description: '提升运球、速度属性' },
            { id: 'defense', name: '防守训练', description: '提升防守、篮板、抢断属性' },
            { id: 'physical', name: '体能训练', description: '提升力量、体力属性' },
            { id: 'basketball-iq', name: '篮球智商训练', description: '提升传球、篮球智商属性' }
        ];

        // Check which interface is being used
        const isTrainingScreen = document.getElementById('training')?.classList.contains('active');
        const isPlayerDevelopmentScreen = document.getElementById('player-development')?.classList.contains('active');

        if (isTrainingScreen) {
            trainingOptionsContainer.querySelectorAll('.training-type').forEach(option => {
                option.addEventListener('click', () => {
                    trainingOptionsContainer.querySelectorAll('.training-type').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    option.classList.add('selected');
                });
            });
        } else if (isPlayerDevelopmentScreen) {
            trainingOptionsContainer.querySelectorAll('.training-option').forEach(option => {
                option.addEventListener('click', () => {
                    trainingOptionsContainer.querySelectorAll('.training-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    option.classList.add('selected');
                });
            });
        }
    }

    updateSkillOptions() {
        // Implementation for skill options
    }

    startTraining(playerId, trainingType) {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;

        if (!userTeam) return;

        const player = userTeam.getPlayer(playerId);
        if (!player) return;

        // Initialize training progress if not exists
        if (!player.training) {
            player.training = {};
        }

        if (!player.training[trainingType]) {
            player.training[trainingType] = 0;
        }

        // Add training progress
        const progressGain = Math.floor(Math.random() * 15) + 10; // 10-25 progress per training
        player.training[trainingType] = Math.min(100, player.training[trainingType] + progressGain);

        // Check if training is complete
        const isComplete = player.training[trainingType] >= 100;
        let improvement = 0;

        if (isComplete) {
            // Training complete - improve attribute
            const attribute = this.getTrainingAttribute(trainingType);
            improvement = player.improveAttribute(attribute, 1.0);

            if (improvement > 0) {
                this.showNotification(`${player.name} 的${this.getTrainingName(trainingType)}提升了 ${improvement} 点！`, 'success');
            } else {
                this.showNotification(`${player.name} 的${this.getTrainingName(trainingType)}已达到上限`, 'warning');
            }

            // Reset training progress after completion
            player.training[trainingType] = 0;
        } else {
            this.showNotification(`${player.name} 的${this.getTrainingName(trainingType)}进度 +${progressGain} (${player.training[trainingType]}/100)`, 'info');
        }

        // Update UI
        this.updatePlayerDetails(playerId);
        this.updateTrainingScreen();

        // Save game state
        this.gameStateManager.saveGameState();
    }

    getTrainingAttribute(trainingType) {
        const attributes = {
            'shooting': 'shooting',
            'dribbling': 'dribbling',
            'defense': 'defense',
            'physical': 'strength',
            'basketball-iq': 'basketballIQ'
        };

        return attributes[trainingType] || 'shooting';
    }

    getTrainingName(trainingType) {
        const names = {
            'shooting': '投篮',
            'dribbling': '运球',
            'defense': '防守',
            'physical': '体能',
            'basketball-iq': '篮球智商'
        };

        return names[trainingType] || '训练';
    }

    setupPlayerDevelopmentEvents() {
        // Only setup events once
        if (this.eventsSetup) return;
        this.eventsSetup = true;

        // Start training button
        const startTrainingBtn = document.getElementById('start-training-btn');
        if (startTrainingBtn) {
            startTrainingBtn.addEventListener('click', () => {
                if (this.selectedPlayerId) {
                    // Get selected training type
                    const selectedOption = document.querySelector('.training-option.selected') || 
                                         document.querySelector('.training-type.selected');
                    if (selectedOption) {
                        const trainingType = selectedOption.getAttribute('data-training');
                        this.startTraining(this.selectedPlayerId, trainingType);
                    } else {
                        this.showNotification('请先选择训练类型', 'warning');
                    }
                } else {
                    this.showNotification('请先选择球员', 'warning');
                }
            });
        }

        // Reset training button
        const resetTrainingBtn = document.getElementById('reset-training-btn');
        if (resetTrainingBtn) {
            resetTrainingBtn.addEventListener('click', () => {
                if (this.selectedPlayerId) {
                    this.resetTraining(this.selectedPlayerId);
                } else {
                    this.showNotification('请先选择球员', 'warning');
                }
            });
        }
    }

    setupTrainingScreenEvents() {
        // Use event delegation to avoid duplicate listeners
        const trainingOptionsContainer = document.getElementById('training-options');
        if (!trainingOptionsContainer) return;

        // Remove existing event listener if any
        if (this.trainingScreenHandler) {
            trainingOptionsContainer.removeEventListener('click', this.trainingScreenHandler);
        }

        // Create new handler with event delegation
        this.trainingScreenHandler = (event) => {
            const clickedElement = event.target.closest('.training-type, .training-option');
            if (!clickedElement) return;

            // Remove selected class from all options
            trainingOptionsContainer.querySelectorAll('.training-type, .training-option').forEach(opt => {
                opt.classList.remove('selected');
            });

            // Add selected class to clicked option
            clickedElement.classList.add('selected');
        };

        // Add event listener with delegation
        trainingOptionsContainer.addEventListener('click', this.trainingScreenHandler);
    }

    resetTraining(playerId) {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;

        if (!userTeam) return;

        const player = userTeam.getPlayer(playerId);
        if (!player) return;

        // Reset training progress
        player.training = {};

        // Update UI
        this.updatePlayerDetails(playerId);

        this.showNotification(`${player.name} 的训练进度已重置`, 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Hide and remove after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}