/**
 * Team Manager module
 * Handles team roster management and team-related operations
 */

class TeamManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log('Team Manager initialized');
    }

    updateTeamManagementScreen() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;

        if (!userTeam) return;

        this.updateTeamHeader(userTeam);
        this.updateCoachInfo(userTeam);
        this.updateTeamStats(userTeam);
        this.updateScholarshipDisplay(userTeam);
        this.updatePositionDistribution(userTeam);
        this.updateYearDistribution(userTeam);
        this.updateRatingDetails(userTeam);
        this.updateRosterDisplay(userTeam);
        this.setupTeamManagementEvents();
    }

    updateTeamHeader(team) {
        const teamNameEl = document.getElementById('team-university-name');
        if (teamNameEl) {
            teamNameEl.textContent = team.name || '未知大学';
        }

        const coachAvatarEl = document.getElementById('coach-avatar');
        if (coachAvatarEl && team.coach) {
            const coachInitials = this.getInitials(team.coach.name);
            coachAvatarEl.textContent = coachInitials;
        }
    }

    getInitials(name) {
        if (!name) return '👔';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '👔';
    }

    updateCoachInfo(team) {
        const coachNameEl = document.getElementById('coach-name');
        const coachTitleEl = document.getElementById('coach-title');
        const coachRatingEl = document.getElementById('coach-rating');
        const coachSpecialtiesEl = document.getElementById('coach-specialties');

        if (team.coach) {
            if (coachNameEl) coachNameEl.textContent = team.coach.name || '待定';
            if (coachTitleEl) coachTitleEl.textContent = team.coach.title || '暂无';
            if (coachRatingEl) coachRatingEl.textContent = team.coach.rating || '-';

            if (coachSpecialtiesEl && team.coach.specialties) {
                const specialtyLabels = {
                    'interior': '内线进攻',
                    'perimeter': '外线进攻',
                    'defense': '防守专家',
                    'rebounding': '篮板训练',
                    'player_dev': '新人培养',
                    'xs_and_os': '战术大师',
                    'motivation': '激励大师',
                    'conditioning': '体能训练',
                    'three_point': '三分战术',
                    'transition': '快攻战术'
                };

                coachSpecialtiesEl.innerHTML = team.coach.specialties.map(specialty => `
                    <span class="specialty-tag">${specialtyLabels[specialty] || specialty}</span>
                `).join('');
            }
        } else {
            if (coachNameEl) coachNameEl.textContent = '待定';
            if (coachTitleEl) coachTitleEl.textContent = '暂无';
            if (coachRatingEl) coachRatingEl.textContent = '-';
            if (coachSpecialtiesEl) coachSpecialtiesEl.innerHTML = '';
        }
    }

    updateTeamStats(team) {
        const playerCountEl = document.getElementById('player-count');
        const teamStrengthEl = document.getElementById('team-strength');
        const teamRecordEl = document.getElementById('team-record');
        const teamRankEl = document.getElementById('team-rank');

        if (playerCountEl) playerCountEl.textContent = team.roster ? team.roster.length : 0;
        if (teamStrengthEl) teamStrengthEl.textContent = team.getTeamStrength ? team.getTeamStrength() : '-';

        if (teamRecordEl) {
            const wins = team.stats?.wins || 0;
            const losses = team.stats?.losses || 0;
            teamRecordEl.textContent = `${wins}-${losses}`;
        }

        if (teamRankEl) {
            const rank = team.stats?.conferenceRank || '-';
            teamRankEl.textContent = rank === '-' ? '-' : `#${rank}`;
        }
    }

    updateScholarshipDisplay(team) {
        const usedEl = document.getElementById('scholarship-used');
        const totalEl = document.getElementById('scholarship-total');
        const totalValueEl = document.getElementById('scholarship-total-value');
        const availableEl = document.getElementById('scholarship-available');
        const progressPathEl = document.getElementById('scholarship-progress-path');

        // 使用新的奖学金计算逻辑
        let total, used;
        
        if (typeof team.scholarships === 'number') {
            // 新数据结构：总奖学金份额
            total = team.scholarships;
            // 使用Team类的计算方法获取已使用的奖学金份额
            used = team.calculateUsedScholarshipShare ? team.calculateUsedScholarshipShare() : (team.roster ? team.roster.length : 0);
        } else if (team.scholarships && typeof team.scholarships === 'object') {
            // 旧数据结构 { total: 5, used: 0 }
            total = team.scholarships.total || 5;
            used = team.scholarships.used || 0;
        } else {
            // 默认值
            total = 5;
            used = team.roster ? team.roster.length : 0;
        }

        // 确保使用的数量不超过总数
        used = Math.min(used, total);
        const available = total - used;

        if (usedEl) usedEl.textContent = Math.round(used * 100) / 100;
        if (totalEl) totalEl.textContent = total;
        if (totalValueEl) totalValueEl.textContent = total;
        if (availableEl) availableEl.textContent = Math.round(available * 100) / 100;

        if (progressPathEl) {
            const percentage = total > 0 ? (used / total) : 0;
            // 根据SVG圆形的半径计算周长，半径现在是45
            const radius = 45;
            const circumference = 2 * Math.PI * radius;
            
            // 简单的圆形进度条计算：stroke-dasharray设为周长，stroke-dashoffset控制进度
            const offset = circumference * (1 - percentage);
            
            // 设置SVG属性
            progressPathEl.style.strokeDasharray = circumference;
            progressPathEl.style.strokeDashoffset = offset;
            progressPathEl.style.stroke = percentage >= 1 ? '#ff6b6b' : '#e94560';
            
            // 确保SVG元素可见
            progressPathEl.style.opacity = 1;
            progressPathEl.style.visibility = 'visible';
        }
    }

    updatePositionDistribution(team) {
        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        const counts = { PG: 0, SG: 0, SF: 0, PF: 0, C: 0 };

        if (team.roster) {
            team.roster.forEach(player => {
                if (counts.hasOwnProperty(player.position)) {
                    counts[player.position]++;
                }
            });
        }

        positions.forEach(pos => {
            const countEl = document.getElementById(`pos-${pos.toLowerCase()}-count`);
            if (countEl) countEl.textContent = counts[pos];
        });
    }

    updateYearDistribution(team) {
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };

        if (team.roster) {
            team.roster.forEach(player => {
                if (counts.hasOwnProperty(player.year)) {
                    counts[player.year]++;
                }
            });
        }

        document.getElementById('year-freshman-count').textContent = counts[1];
        document.getElementById('year-sophomore-count').textContent = counts[2];
        document.getElementById('year-junior-count').textContent = counts[3];
        document.getElementById('year-senior-count').textContent = counts[4];
    }

    updateRatingDetails(team) {
        // 获取所有DOM元素
        const offenseRatingEl = document.getElementById('offense-rating');
        const defenseRatingEl = document.getElementById('defense-rating');
        const avgPotentialEl = document.getElementById('avg-potential');
        const overallRatingEl = document.getElementById('overall-team-rating');
        const offenseBarEl = document.getElementById('offense-bar');
        const defenseBarEl = document.getElementById('defense-bar');
        const potentialBarEl = document.getElementById('potential-bar');
        const overallBarEl = document.getElementById('overall-bar');

        if (!team.roster || team.roster.length === 0) {
            if (offenseRatingEl) offenseRatingEl.textContent = '0';
            if (defenseRatingEl) defenseRatingEl.textContent = '0';
            if (avgPotentialEl) avgPotentialEl.textContent = '0';
            if (overallRatingEl) overallRatingEl.textContent = '0';
            if (offenseBarEl) offenseBarEl.style.width = '0%';
            if (defenseBarEl) defenseBarEl.style.width = '0%';
            if (potentialBarEl) potentialBarEl.style.width = '0%';
            if (overallBarEl) overallBarEl.style.width = '0%';
            return;
        }

        let totalOffense = 0;
        let totalDefense = 0;
        let totalPotential = 0;
        let totalRating = 0;
        let validPlayerCount = 0;

        team.roster.forEach(player => {
            // 验证玩家数据的有效性
            if (player && player.attributes) {
                const offense = player.attributes.scoring || 0;
                const defense = player.attributes.defense || 0;
                const potential = player.potential || 0;
                const rating = player.getOverallRating ? player.getOverallRating() : 0;
                
                totalOffense += offense;
                totalDefense += defense;
                totalPotential += potential;
                totalRating += rating;
                validPlayerCount++;
            }
        });

        // 避免除零错误
        const count = validPlayerCount > 0 ? validPlayerCount : 1;
        const avgOffense = Math.round(totalOffense / count);
        const avgDefense = Math.round(totalDefense / count);
        const avgPotential = Math.round(totalPotential / count);
        const avgRating = Math.round(totalRating / count);

        if (offenseRatingEl) offenseRatingEl.textContent = avgOffense;
        if (defenseRatingEl) defenseRatingEl.textContent = avgDefense;
        if (avgPotentialEl) avgPotentialEl.textContent = avgPotential;
        if (overallRatingEl) overallRatingEl.textContent = avgRating;

        if (offenseBarEl) offenseBarEl.style.width = `${Math.min(avgOffense, 100)}%`;
        if (defenseBarEl) defenseBarEl.style.width = `${Math.min(avgDefense, 100)}%`;
        if (potentialBarEl) potentialBarEl.style.width = `${Math.min(avgPotential, 100)}%`;
        if (overallBarEl) overallBarEl.style.width = `${Math.min(avgRating, 100)}%`;
    }

    updateRosterDisplay(team) {
        const listContainer = document.getElementById('roster-list');
        const countDisplay = document.getElementById('player-count-display');

        if (!listContainer) return;

        if (!team.roster || team.roster.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-roster-message">
                    <div class="empty-roster-icon">📋</div>
                    <div class="empty-roster-title">暂无球员</div>
                    <div class="empty-roster-desc">您的球队还没有球员</div>
                    <div class="empty-roster-action">前往转会市场签约球员</div>
                </div>
            `;
            if (countDisplay) countDisplay.textContent = '0 名球员';
            return;
        }

        const searchTerm = document.getElementById('player-search')?.value?.toLowerCase() || '';
        const positionFilter = document.getElementById('position-filter')?.value || '';
        const yearFilter = document.getElementById('year-filter')?.value || '';
        const sortBy = document.getElementById('sort-by')?.value || 'rating-desc';

        let filteredPlayers = team.roster.filter(player => {
            const matchesSearch = !searchTerm || 
                player.name?.toLowerCase().includes(searchTerm);
            const matchesPosition = !positionFilter || player.position === positionFilter;
            const matchesYear = !yearFilter || player.year?.toString() === yearFilter;
            return matchesSearch && matchesPosition && matchesYear;
        });

        filteredPlayers.sort((a, b) => {
            switch (sortBy) {
                case 'rating-desc': return b.getOverallRating() - a.getOverallRating();
                case 'rating-asc': return a.getOverallRating() - b.getOverallRating();
                case 'potential-desc': return b.potential - a.potential;
                case 'potential-asc': return a.potential - b.potential;
                case 'name-asc': return (a.name || '').localeCompare(b.name || '');
                case 'name-desc': return (b.name || '').localeCompare(a.name || '');
                case 'year-desc': return (b.year || 0) - (a.year || 0);
                case 'year-asc': return (a.year || 0) - (b.year || 0);
                default: return 0;
            }
        });

        if (countDisplay) {
            countDisplay.textContent = `${filteredPlayers.length} / ${team.roster.length} 名球员`;
        }

        if (filteredPlayers.length === 0) {
            listContainer.innerHTML = `
                <div class="no-players-message">
                    <div class="no-players-icon">🔍</div>
                    <div class="no-players-title">未找到球员</div>
                    <div class="no-players-desc">尝试调整筛选条件</div>
                </div>
            `;
            return;
        }

        // 按位置分组球员
        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        const groupedPlayers = {};
        
        positions.forEach(pos => {
            groupedPlayers[pos] = filteredPlayers.filter(p => p.position === pos);
        });
        
        // 创建分组展示
        const fragment = document.createDocumentFragment();
        const container = document.createElement('div');
        container.className = 'player-group-container';
        
        // 渲染每个位置的球员
        positions.forEach(position => {
            const playersInPos = groupedPlayers[position];
            if (playersInPos.length > 0) {
                const positionSection = document.createElement('div');
                positionSection.className = 'position-group';
                
                positionSection.innerHTML = `
                    <div class="position-header">
                        <h3 class="position-title">${position}</h3>
                        <span class="position-count">(${playersInPos.length}人)</span>
                    </div>
                    <div class="position-players">
                        ${playersInPos.map((player, idx) => this.createPlayerCardElement(player, idx + 1)).join('')}
                    </div>
                `;
                
                container.appendChild(positionSection);
            }
        });
        
        // 添加未分类球员（如果有的话）
        const ungroupedPlayers = filteredPlayers.filter(p => !positions.includes(p.position));
        if (ungroupedPlayers.length > 0) {
            const ungroupedSection = document.createElement('div');
            ungroupedSection.className = 'position-group';
            
            ungroupedSection.innerHTML = `
                <div class="position-header">
                    <h3 class="position-title">其他</h3>
                    <span class="position-count">(${ungroupedPlayers.length}人)</span>
                </div>
                <div class="position-players">
                    ${ungroupedPlayers.map((player, idx) => this.createPlayerCardElement(player, idx + 1)).join('')}
                </div>
            `;
            
            container.appendChild(ungroupedSection);
        }
        
        fragment.appendChild(container);
        listContainer.innerHTML = '';
        listContainer.appendChild(fragment);

        this.setupPlayerListEvents();
    }

    createPlayerCardElement(player, index) {
        const yearLabels = { 1: '大一', 2: '大二', 3: '大三', 4: '大四' };
        const positionLabels = { 'PG': 'PG', 'SG': 'SG', 'SF': 'SF', 'PF': 'PF', 'C': 'C' };
        const positionEmojis = { 'PG': '🏀', 'SG': '🎯', 'SF': '🔥', 'PF': '💪', 'C': '🛡️' };
        const overallRating = player.getOverallRating();
        const potentialRating = player.potential;

        const ratingClass = overallRating >= 80 ? 'excellent' : 
                           overallRating >= 70 ? 'good' : 
                           overallRating >= 60 ? 'average' : 'poor';
                           
        const potentialClass = potentialRating >= 85 ? 'excellent' : 
                              potentialRating >= 75 ? 'good' : 
                              potentialRating >= 65 ? 'average' : 'poor';

        return `
            <div class="player-card-optimized" data-player-id="${player.id}">
                <div class="player-card-header">
                    <div class="player-position-badge">
                        ${positionEmojis[player.position] || '👤'} ${player.position}
                    </div>
                    <div class="player-rank">${index}</div>
                </div>
                
                <div class="player-card-body">
                    <div class="player-avatar-large">
                        <span class="avatar-text">${player.name.charAt(0)}</span>
                    </div>
                    
                    <div class="player-info">
                        <h4 class="player-name">${player.name}</h4>
                        <div class="player-details">
                            <div class="detail-item">
                                <span class="detail-label">年级:</span>
                                <span class="detail-value year-badge-small year-${player.year}">${yearLabels[player.year]}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">年龄:</span>
                                <span class="detail-value">${player.age}岁</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="player-stats">
                    <div class="stat-item">
                        <div class="stat-label">能力值</div>
                        <div class="stat-value rating-badge ${ratingClass}">${overallRating}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">潜力</div>
                        <div class="stat-value potential-badge ${potentialClass}">${potentialRating}</div>
                    </div>
                </div>
                
                <div class="player-actions">
                    <button class="action-btn view-btn" data-player-id="${player.id}" title="查看详情">
                        <span class="btn-icon">👁️</span>
                        <span class="btn-text">详情</span>
                    </button>
                    <button class="action-btn release-btn" data-player-id="${player.id}" data-player-name="${player.name}" title="解约球员">
                        <span class="btn-icon">📤</span>
                        <span class="btn-text">解约</span>
                    </button>
                </div>
            </div>
        `;
    }

    setupPlayerListEvents() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                const playerId = parseInt(event.target.getAttribute('data-player-id'));
                this.showPlayerDetails(playerId);
            });
        });

        document.querySelectorAll('.release-btn').forEach(btn => {
            btn.addEventListener('click', (event) => {
                const playerId = parseInt(event.target.getAttribute('data-player-id'));
                const playerName = event.target.getAttribute('data-player-name');
                this.confirmReleasePlayer(playerId, playerName);
            });
        });
    }

    confirmReleasePlayer(playerId, playerName) {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;

        if (!userTeam) {
            this.showNotification('无法获取球队信息', 'error');
            return;
        }

        const player = userTeam.getPlayer(playerId);
        if (!player) {
            this.showNotification('球员不存在', 'error');
            return;
        }

        const scholarships = (userTeam.scholarships && typeof userTeam.scholarships === 'object') ? userTeam.scholarships.total : (userTeam.scholarships || 5);
        const rosterCount = userTeam.roster?.length || 0;
        const availableSlots = scholarships - rosterCount + 1;

        const modalContent = `
            <div class="release-confirmation">
                <div class="release-warning">
                    <span class="warning-icon">⚠️</span>
                    <h3>确认解约球员</h3>
                </div>
                
                <div class="release-player-info">
                    <div class="player-name-display">${playerName}</div>
                    <div class="player-details-display">
                        ${Positions[player.position]} | 能力值: ${player.getOverallRating()} | 潜力: ${player.potential}
                    </div>
                </div>

                <div class="release-notice">
                    <p>此操作将产生以下影响：</p>
                    <ul>
                        <li>球员将从球队阵容中移除</li>
                        <li>球员将进入自由球员市场</li>
                        <li>此操作<span class="highlight">不可撤销</span></li>
                        ${availableSlots <= 0 ? '<li class="warning-text">⚠️ 解约后将释放一个奖学金名额</li>' : ''}
                    </ul>
                </div>

                <div class="release-input">
                    <label>输入 "<span class="confirm-text">${playerName}</span>" 确认解约：</label>
                    <input type="text" id="release-confirm-input" placeholder="输入球员姓名" />
                </div>

                <div class="release-buttons">
                    <button class="btn cancel-btn" id="cancel-release">取消</button>
                    <button class="btn confirm-release-btn" id="confirm-release" disabled>确认解约</button>
                </div>
            </div>
        `;

        const modal = document.getElementById('player-modal');
        const modalContentDiv = modal.querySelector('.modal-content');
        modalContentDiv.innerHTML = modalContent;
        modal.style.display = 'block';

        const confirmInput = document.getElementById('release-confirm-input');
        const confirmBtn = document.getElementById('confirm-release');
        const cancelBtn = document.getElementById('cancel-release');

        confirmInput.addEventListener('input', () => {
            confirmBtn.disabled = confirmInput.value !== playerName;
        });

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        confirmBtn.addEventListener('click', () => {
            this.releasePlayer(playerId);
            modal.style.display = 'none';
        });
    }

    setupTeamManagementEvents() {
        const rosterToggle = document.getElementById('roster-toggle');
        const rosterContent = document.getElementById('roster-overview-content');

        if (rosterToggle && rosterContent) {
            rosterToggle.onclick = () => {
                rosterContent.classList.toggle('collapsed');
                rosterToggle.querySelector('.toggle-icon').textContent =
                    rosterContent.classList.contains('collapsed') ? '▼' : '▲';
            };
        }

        const searchInput = document.getElementById('player-search');
        const positionFilter = document.getElementById('position-filter');
        const yearFilter = document.getElementById('year-filter');
        const sortBy = document.getElementById('sort-by');

        const refreshRoster = () => {
            const state = this.gameStateManager.getState();
            if (state.userTeam) {
                this.updateRosterDisplay(state.userTeam);
            }
        };

        if (searchInput) searchInput.addEventListener('input', refreshRoster);
        if (positionFilter) positionFilter.addEventListener('change', refreshRoster);
        if (yearFilter) yearFilter.addEventListener('change', refreshRoster);
        if (sortBy) sortBy.addEventListener('change', refreshRoster);

        const goToMarketBtn = document.getElementById('go-to-market');
        if (goToMarketBtn) {
            goToMarketBtn.onclick = () => {
                document.getElementById('market-btn')?.click();
            };
        }

        const actionButtons = [
            { id: 'action-manage-roster', target: 'player-development-btn' }, // 管理阵容跳转到球员发展界面
            { id: 'action-view-schedule', target: 'schedule-btn' },
            { id: 'action-training', target: 'training-btn' },
            { id: 'action-analytics', target: 'scouting-btn' }
        ];

        actionButtons.forEach(({ id, target }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.onclick = () => {
                    document.getElementById(target)?.click();
                };
            }
        });
    }

    createPlayerCard(player) {
        const yearLabels = { 1: '大一', 2: '大二', 3: '大三', 4: '大四' };
        const yearTypes = { 1: '新秀', 2: '二年级', 3: '三年级', 4: '老将' };
        const positionEmojis = {
            'PG': '🏀', 'SG': '🎯', 'SF': '🔥', 'PF': '💪', 'C': '🛡️'
        };

        const overallRating = player.getOverallRating();
        const potential = player.potential;
        const playerType = yearTypes[player.year] || '新秀';
        const playerInfo = player.getInfo();

        const attributeLabels = {
            scoring: '得分', shooting: '投篮', threePoint: '三分', freeThrow: '罚球',
            passing: '传球', dribbling: '运球', defense: '防守', rebounding: '篮板',
            steal: '抢断', block: '盖帽', speed: '速度', strength: '力量',
            vertical: '弹跳', stamina: '体力', IQ: '智商'
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
    }

    setupPlayerCardEvents() {
        document.querySelectorAll('.details-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const playerId = parseInt(event.target.getAttribute('data-player-id'));
                this.showPlayerDetails(playerId);
            });
        });

        document.querySelectorAll('.train-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const playerId = parseInt(event.target.getAttribute('data-player-id'));
                this.showPlayerTraining(playerId);
            });
        });
    }

    showPlayerDetails(playerId) {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;

        if (!userTeam) return;

        const player = userTeam.getPlayer(playerId);
        if (!player) return;

        const yearNames = ['', '大一', '大二', '大三', '大四'];
        const playerInfo = player.getInfo();

        const modalContent = `
            <div class="player-details">
                <div class="player-header">
                    <h3>${playerInfo.name}</h3>
                    <div class="player-meta">
                        <span class="player-position">${Positions[playerInfo.position]}</span>
                        <span class="player-year">${yearNames[playerInfo.year]}</span>
                        <span class="player-age">年龄: ${playerInfo.age}</span>
                    </div>
                </div>

                <div class="player-ratings">
                    <div class="rating-item">
                        <span class="rating-label">综合评分</span>
                        <span class="rating-value">${playerInfo.overallRating}</span>
                    </div>
                    <div class="rating-item">
                        <span class="rating-label">潜力</span>
                        <span class="rating-value">${playerInfo.potential}</span>
                    </div>
                    <div class="rating-item">
                        <span class="rating-label">前景</span>
                        <span class="rating-value">${playerInfo.scoutRating}</span>
                    </div>
                </div>

                <div class="player-attributes-detailed">
                    <h4>属性</h4>
                    <div class="attributes-grid">
                        ${Object.entries(playerInfo.attributes).map(([key, value]) => `
                            <div class="attribute-item">
                                <span class="attr-name">${this.getAttributeName(key)}</span>
                                <div class="attr-bar">
                                    <div class="attr-fill" style="width: ${value}%"></div>
                                </div>
                                <span class="attr-value">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="player-description">
                    <h4>球员简介</h4>
                    <p class="description-text">${playerInfo.description}</p>
                </div>

                <div class="player-stats">
                    <h4>赛季统计</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">比赛</span>
                            <span class="stat-value">${playerInfo.seasonStats.games}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">得分</span>
                            <span class="stat-value">${playerInfo.seasonStats.points}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">篮板</span>
                            <span class="stat-value">${playerInfo.seasonStats.rebounds}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">助攻</span>
                            <span class="stat-value">${playerInfo.seasonStats.assists}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">抢断</span>
                            <span class="stat-value">${playerInfo.seasonStats.steals}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">盖帽</span>
                            <span class="stat-value">${playerInfo.seasonStats.blocks}</span>
                        </div>
                    </div>
                </div>

                ${playerInfo.talents.length > 0 ? `
                    <div class="player-talents">
                        <h4>天赋</h4>
                        <div class="talents-list">
                            ${playerInfo.talents.map(talent => `
                                <div class="talent-item ${talent.rarity}">
                                    <h5>${talent.name}</h5>
                                    <p>${talent.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${playerInfo.skills.length > 0 ? `
                    <div class="player-skills">
                        <h4>技能</h4>
                        <div class="skills-list">
                            ${playerInfo.skills.map(skill => `
                                <div class="skill-item">
                                    <h5>${skill.name}</h5>
                                    <p>${skill.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="player-actions">
                    <button class="btn train-btn" data-player-id="${playerId}">训练</button>
                    <button class="btn release-btn" data-player-id="${playerId}">释放</button>
                </div>
            </div>
        `;

        const modal = document.getElementById('player-modal');
        const modalContentDiv = modal.querySelector('.modal-content');
        modalContentDiv.innerHTML = modalContent;
        modal.style.display = 'block';

        modal.querySelector('.train-btn').addEventListener('click', () => {
            this.showPlayerTraining(playerId);
            modal.style.display = 'none';
        });

        modal.querySelector('.release-btn').addEventListener('click', () => {
            this.releasePlayer(playerId);
            modal.style.display = 'none';
        });
    }

    showPlayerTraining(playerId) {
        document.getElementById('player-development-btn').click();

        setTimeout(() => {
            const playerCard = document.querySelector(`.player-list .player-card[data-player-id="${playerId}"]`);
            if (playerCard) {
                playerCard.click();
            }
        }, 100);
    }

    releasePlayer(playerId) {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;

        if (!userTeam) return;

        const player = userTeam.getPlayer(playerId);
        if (!player) return;

        const message = `确定要释放 ${player.name} 吗？此操作不可撤销。`;

        const onConfirm = () => {
            userTeam.removePlayer(playerId);
            this.gameStateManager.addPlayer(player);
            this.updateTeamManagementScreen();
            this.showNotification(`${player.name} 已被释放`, 'success');
            this.gameStateManager.saveGameState();
        };

        this.showConfirmation(message, onConfirm);
    }

    updateTeamStatsDisplay(team) {
        const statsContainer = document.getElementById('stats-content');

        if (!statsContainer) return;

        const teamInfo = team.getInfo();

        const statsHtml = `
            <div class="team-overview">
                <div class="team-record">
                    <h4>战绩</h4>
                    <p>${teamInfo.stats.wins}胜 ${teamInfo.stats.losses}负</p>
                    <p>联盟战绩: ${teamInfo.stats.conferenceWins}胜 ${teamInfo.stats.conferenceLosses}负</p>
                </div>
                <div class="team-strength">
                    <h4>球队实力</h4>
                    <p>综合评分: ${teamInfo.teamStrength}</p>
                </div>
            </div>

            <div class="team-stats-detailed">
                <h4>赛季统计</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">场均得分</span>
                        <span class="stat-value">${teamInfo.stats.wins > 0 ?
                Math.round(teamInfo.stats.pointsFor / teamInfo.stats.wins) : 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">场均失分</span>
                        <span class="stat-value">${teamInfo.stats.losses > 0 ?
                Math.round(teamInfo.stats.pointsAgainst / teamInfo.stats.losses) : 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">资金</span>
                        <span class="stat-value">$${teamInfo.funds.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">奖学金使用</span>
                        <span class="stat-value">${teamInfo.usedScholarships}/${teamInfo.scholarships}</span>
                    </div>
                </div>
            </div>
        `;

        statsContainer.innerHTML = statsHtml;
    }

    getAttributeName(attributeKey) {
        const attributeNames = {
            scoring: '得分',
            shooting: '投篮',
            threePoint: '三分',
            freeThrow: '罚球',
            passing: '传球',
            dribbling: '运球',
            defense: '防守',
            rebounding: '篮板',
            stealing: '抢断',
            blocking: '盖帽',
            speed: '速度',
            stamina: '体力',
            strength: '力量',
            basketballIQ: '篮球智商'
        };

        return attributeNames[attributeKey] || attributeKey;
    }

    showNotification(message, type = 'info') {
        if (window.app && typeof window.app.showNotification === 'function') {
            try {
                window.app.showNotification(message, type);
                return;
            } catch (e) {
                console.warn('Failed to use app notification, falling back to default');
            }
        }

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
                notification.remove();
            }, 300);
        }, 3000);
    }

    showConfirmation(message, onConfirm) {
        const confirmation = document.createElement('div');
        confirmation.className = 'confirmation-dialog';
        confirmation.innerHTML = `
            <div class="confirmation-content">
                <p>${message}</p>
                <div class="confirmation-buttons">
                    <button class="confirm-btn">确认</button>
                    <button class="cancel-btn">取消</button>
                </div>
            </div>
        `;

        document.body.appendChild(confirmation);

        setTimeout(() => {
            confirmation.classList.add('show');
        }, 10);

        const confirmBtn = confirmation.querySelector('.confirm-btn');
        const cancelBtn = confirmation.querySelector('.cancel-btn');

        confirmBtn.addEventListener('click', () => {
            this.hideConfirmation(confirmation);
            if (onConfirm) onConfirm();
        });

        cancelBtn.addEventListener('click', () => {
            this.hideConfirmation(confirmation);
        });
    }

    hideConfirmation(confirmation) {
        confirmation.classList.remove('show');
        setTimeout(() => {
            confirmation.remove();
        }, 300);
    }
}
