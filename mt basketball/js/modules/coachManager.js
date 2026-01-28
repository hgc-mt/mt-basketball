/**
 * Coach Manager module
 * Handles coach hiring and management
 */

class CoachManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log('Coach Manager initialized');
    }

    updateCoachMarketScreen() {
        this.displayCoachList();
        this.setupCoachMarketEvents();
        this.updateMarketInfo();
    }

    displayCoachList(archetypeFilter = '') {
        const state = this.gameStateManager.getState();
        const availableCoaches = state.availableCoaches;
        const container = document.getElementById('coach-list');

        if (!container) return;

        // Filter coaches
        let filteredCoaches = [...availableCoaches];

        if (archetypeFilter) {
            filteredCoaches = filteredCoaches.filter(coach => coach.archetype === archetypeFilter);
        }

        if (filteredCoaches.length === 0) {
            container.innerHTML = '<p>没有符合条件的教练</p>';
            return;
        }

        const coachesHtml = filteredCoaches.map(coach => this.createCoachCard(coach)).join('');
        container.innerHTML = coachesHtml;

        // Add event listeners
        container.querySelectorAll('.hire-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const coachId = parseInt(event.target.getAttribute('data-coach-id'));
                this.hireCoach(coachId);
            });
        });

        container.querySelectorAll('.details-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const coachId = parseInt(event.target.getAttribute('data-coach-id'));
                this.viewCoachDetails(coachId);
            });
        });
    }

    createCoachCard(coach) {
        const coachInfo = coach.getInfo();
        const archetypeNames = {
            'offensive': '进攻型教练',
            'defensive': '防守型教练',
            'balanced': '均衡型教练',
            'developmental': '培养型教练',
            'veteran': '老练型教练'
        };
        
        const styleNames = {
            'offensive': '进攻型',
            'defensive': '防守型',
            'balanced': '平衡型',
            'tempo': '快节奏',
            'halfcourt': '半场阵地'
        };
        
        const specialtyNames = {
            'inside': '内线进攻',
            'perimeter': '外线进攻',
            'defense': '防守专家',
            'transition': '快攻战术',
            'halfcourt': '半场攻防',
            'playerDev': '新人培养',
            'clutch': '关键球',
            'rebounding': '篮板球',
            'pickroll': '挡拆配合',
            'threePoint': '三分战术',
            'transitionDefense': '防守反击',
            'halfCourtDefense': '半场防守',
            'zoneDefense': '区域联防',
            'manToMan': '人盯人',
            'pickAndRoll': '挡拆配合',
            'isolation': '单打战术',
            'motionOffense': '动态进攻',
            'postPlay': '低位单打',
            'fastBreak': '快攻得分',
            'threePointShooting': '三分投射'
        };

        const titlesHtml = coachInfo.titles && coachInfo.titles.length > 0
            ? `<div class="coach-titles">${coachInfo.titles.map(t => `<span class="title-badge">${t}</span>`).join('')}</div>`
            : '';
        
        const specialtiesHtml = coachInfo.specialties && coachInfo.specialties.length > 0
            ? `<div class="coach-specialties">${coachInfo.specialties.slice(0, 4).map(s => `<span class="specialty-tag">${specialtyNames[s] || s}</span>`).join('')}</div>`
            : '';
        
        const championBadge = coachInfo.isChampion
            ? `<span class="champion-badge">🏆 冠军教头</span>`
            : '';
        
        const devBonusClass = coachInfo.playerDevRating >= 75 ? 'high-dev' : (coachInfo.playerDevRating >= 60 ? 'medium-dev' : '');
        
        const winRate = coachInfo.careerStats.wins + coachInfo.careerStats.losses > 0
            ? ((coachInfo.careerStats.wins / (coachInfo.careerStats.wins + coachInfo.careerStats.losses)) * 100).toFixed(1)
            : '0.0';
        
        const mottoHtml = coachInfo.motto
            ? `<div class="coach-motto">"${coachInfo.motto}"</div>`
            : '';

        const coachRating = coachInfo.overallRating;
        const ratingColor = coachRating >= 85 ? '#ef4444' : (coachRating >= 75 ? '#f59e0b' : (coachRating >= 65 ? '#4ade80' : '#6b7280'));
        const ratingLevel = coachRating >= 90 ? '传奇' : (coachRating >= 85 ? '精英' : (coachRating >= 75 ? '优秀' : (coachRating >= 65 ? '良好' : '普通')));
        
        const experienceLevel = coachInfo.experience >= 20 ? '传奇教头' : (coachInfo.experience >= 15 ? '资深教练' : (coachInfo.experience >= 10 ? '经验丰富' : (coachInfo.experience >= 5 ? '中坚力量' : '新锐教练')));
        
        const topAttribute = Object.entries(coachInfo.attributes)
            .sort((a, b) => b[1] - a[1])[0];
        const topAttributeName = {
            'offense': '进攻',
            'defense': '防守',
            'recruiting': '招募',
            'development': '培养',
            'motivation': '激励'
        }[topAttribute[0]] || topAttribute[0];
        
        const bottomAttribute = Object.entries(coachInfo.attributes)
            .sort((a, b) => a[1] - b[1])[0];
        const bottomAttributeName = {
            'offense': '进攻',
            'defense': '防守',
            'recruiting': '招募',
            'development': '培养',
            'motivation': '激励'
        }[bottomAttribute[0]] || bottomAttribute[0];

        const recommendationScore = this.calculateRecommendationScore(coach);
        const recommendationLevel = recommendationScore >= 80 ? '强烈推荐' : (recommendationScore >= 60 ? '推荐签约' : (recommendationScore >= 40 ? '可以考虑' : '暂不推荐'));
        const recommendationColor = recommendationScore >= 80 ? '#ef4444' : (recommendationScore >= 60 ? '#f59e0b' : (recommendationScore >= 40 ? '#4ade80' : '#6b7280'));

        const avatarEmoji = this.getCoachAvatar(coach.archetype, coachInfo.age);
        const backgroundPattern = this.getBackgroundPattern(coach.archetype);

        return `
            <div class="coach-card ${backgroundPattern}">
                <div class="coach-card-header">
                    <div class="coach-avatar">${avatarEmoji}</div>
                    <div class="coach-name-section">
                        <h3 class="coach-name">${coachInfo.name}</h3>
                        <div class="coach-badges">
                            ${championBadge}
                            <span class="rating-level-badge" style="background-color: ${ratingColor}">${ratingLevel}</span>
                            <span class="experience-badge">${experienceLevel}</span>
                        </div>
                    </div>
                    <div class="coach-rating-section">
                        <span class="rating-label">综合</span>
                        <span class="coach-rating-badge" style="background-color: ${ratingColor}">${coachInfo.overallRating}</span>
                    </div>
                </div>
                ${titlesHtml}
                <div class="coach-recommendation" style="border-color: ${recommendationColor}">
                    <span class="recommendation-label">推荐指数</span>
                    <span class="recommendation-score" style="color: ${recommendationColor}">${recommendationScore}分</span>
                    <span class="recommendation-level" style="color: ${recommendationColor}">${recommendationLevel}</span>
                </div>
                <div class="coach-archetype">
                    <h4>${archetypeNames[coachInfo.archetype] || coachInfo.archetype}</h4>
                    <p>${this.getArchetypeDescription(coachInfo.archetype)}</p>
                </div>
                <div class="coach-style-info">
                    <span class="style-label">执教风格:</span>
                    <span class="style-value">${styleNames[coachInfo.coachingStyle] || coachInfo.coachingStyle}</span>
                    <span class="win-rate">${winRate}%胜率</span>
                </div>
                <div class="coach-strengths-weaknesses">
                    <div class="strength-item">
                        <span class="sw-label">强项</span>
                        <span class="sw-value strength">${topAttributeName} (${topAttribute[1]})</span>
                    </div>
                    <div class="weakness-item">
                        <span class="sw-label">弱项</span>
                        <span class="sw-value weakness">${bottomAttributeName} (${bottomAttribute[1]})</span>
                    </div>
                </div>
                ${specialtiesHtml}
                ${mottoHtml}
                <div class="coach-meta">
                    <div class="meta-item">
                        <span class="meta-label">年龄</span>
                        <span class="meta-value">${coachInfo.age}岁</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">经验</span>
                        <span class="meta-value">${coachInfo.experience}年</span>
                    </div>
                </div>
                <div class="coach-attributes">
                    <div class="attribute-bar">
                        <span class="attr-name">进攻</span>
                        <div class="attr-bar">
                            <div class="attr-fill" style="width: ${coachInfo.attributes.offense}%"></div>
                        </div>
                        <span class="attr-value">${coachInfo.attributes.offense}</span>
                    </div>
                    <div class="attribute-bar">
                        <span class="attr-name">防守</span>
                        <div class="attr-bar">
                            <div class="attr-fill" style="width: ${coachInfo.attributes.defense}%"></div>
                        </div>
                        <span class="attr-value">${coachInfo.attributes.defense}</span>
                    </div>
                    <div class="attribute-bar">
                        <span class="attr-name">招募</span>
                        <div class="attr-bar">
                            <div class="attr-fill" style="width: ${coachInfo.attributes.recruiting}%"></div>
                        </div>
                        <span class="attr-value">${coachInfo.attributes.recruiting}</span>
                    </div>
                    <div class="attribute-bar">
                        <span class="attr-name">培养</span>
                        <div class="attr-bar">
                            <div class="attr-fill ${devBonusClass}" style="width: ${coachInfo.attributes.development}%"></div>
                        </div>
                        <span class="attr-value">${coachInfo.attributes.development}</span>
                    </div>
                </div>
                <div class="coach-stats">
                    <div class="stat-item">
                        <span class="stat-label">执教赛季</span>
                        <span class="stat-value">${coachInfo.careerStats.seasons}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">总战绩</span>
                        <span class="stat-value">${coachInfo.careerStats.wins}胜${coachInfo.careerStats.losses}负</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">冠军</span>
                        <span class="stat-value">${coachInfo.careerStats.championships}次</span>
                    </div>
                </div>
                <div class="coach-philosophy">
                    <span class="philosophy-label">执教理念:</span>
                    <span class="philosophy-text">${coachInfo.philosophy || '暂无描述'}</span>
                </div>
                <div class="coach-actions">
                    <button class="btn details-btn" data-coach-id="${coachInfo.id}">查看详情</button>
                    <button class="btn hire-btn" data-coach-id="${coachInfo.id}">签约教练</button>
                </div>
            </div>
        `;
    }

    calculateRecommendationScore(coach) {
        let score = 0;
        
        const coachInfo = coach.getInfo();
        
        score += coachInfo.overallRating * 0.3;
        score += coachInfo.experience * 1.5;
        score += coachInfo.playerDevRating * 0.2;
        
        if (coachInfo.isChampion) {
            score += 10;
        }
        
        if (coachInfo.careerStats.championships > 0) {
            score += coachInfo.careerStats.championships * 5;
        }
        
        const winRate = coachInfo.careerStats.wins + coachInfo.careerStats.losses > 0
            ? (coachInfo.careerStats.wins / (coachInfo.careerStats.wins + coachInfo.careerStats.losses)) * 100
            : 0;
        score += winRate * 0.2;
        
        return Math.min(100, Math.round(score));
    }

    getCoachAvatar(archetype, age) {
        const avatars = {
            'offensive': ['🔥', '⚡', '🎯', '🏀', '🎪'],
            'defensive': ['🛡️', '🏰', '⛔', '🔒', '🚧'],
            'balanced': ['⚖️', '🎭', '🎪', '🌟', '💫'],
            'developmental': ['🌱', '📚', '🎓', '🏆', '🌟'],
            'veteran': ['👴', '🎖️', '🏅', '🎗️', '🎪']
        };
        
        const archetypeAvatars = avatars[archetype] || avatars['balanced'];
        return archetypeAvatars[Math.floor(Math.random() * archetypeAvatars.length)];
    }

    getBackgroundPattern(archetype) {
        const patterns = {
            'offensive': 'pattern-offensive',
            'defensive': 'pattern-defensive',
            'balanced': 'pattern-balanced',
            'developmental': 'pattern-developmental',
            'veteran': 'pattern-veteran'
        };
        
        return patterns[archetype] || 'pattern-balanced';
    }

    getArchetypeDescription(archetype) {
        const descriptions = {
            'offensive': '擅长进攻战术设计，提升球队进攻效率',
            'defensive': '专注防守体系打造，增强防守能力',
            'balanced': '攻守兼备，培养全面型球队',
            'developmental': '注重年轻球员成长，加速人才培养',
            'veteran': '经验丰富擅长季后赛，关键时刻稳定军心'
        };
        return descriptions[archetype] || '综合能力强';
    }

    hireCoach(coachId) {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        const availableCoaches = state.availableCoaches;

        if (!userTeam) return;

        // Find coach in available coaches
        const coachIndex = availableCoaches.findIndex(c => c.id === coachId);
        if (coachIndex === -1) return;

        const newCoach = availableCoaches[coachIndex];

        // Check coach hiring limit
        if (state.coachHiringCount >= state.maxCoachHiresPerSeason) {
            this.showNotification(`本赛季已达到最大签约次数（${state.maxCoachHiresPerSeason}次），无法再签约教练`, 'error');
            return;
        }

        // Check if team already has a coach
        if (userTeam.coach) {
            // Show confirmation dialog for replacing coach
            this.showReplaceCoachConfirmation(newCoach);
            return;
        }

        // Hire coach
        this.completeCoachHiring(newCoach, coachIndex);
    }

    showReplaceCoachConfirmation(newCoach) {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        
        const modal = document.getElementById('player-modal');
        const modalContentDiv = modal.querySelector('.modal-content');

        const modalContent = `
            <div class="replace-coach-confirmation">
                <div class="replace-warning">
                    <span class="warning-icon">⚠️</span>
                    <h3>确认更换教练</h3>
                </div>
                
                <div class="replace-coach-info">
                    <div class="current-coach">
                        <span class="label">当前教练:</span>
                        <span class="value">${userTeam.coach ? userTeam.coach.name : '无'}</span>
                    </div>
                    <div class="new-coach">
                        <span class="label">新教练:</span>
                        <span class="value">${newCoach.name}</span>
                    </div>
                </div>

                <div class="replace-notice">
                    <p>此操作将产生以下影响：</p>
                    <ul>
                        <li>当前教练将被解聘并返回市场</li>
                        <li>新教练将执掌球队</li>
                        <li>此操作<span class="highlight">不可撤销</span></li>
                    </ul>
                </div>

                <div class="replace-buttons">
                    <button class="btn cancel-btn" id="cancel-replace">取消</button>
                    <button class="btn confirm-replace-btn" id="confirm-replace">确认更换</button>
                </div>
            </div>
        `;

        modalContentDiv.innerHTML = modalContent;
        modal.style.display = 'block';

        const cancelBtn = document.getElementById('cancel-replace');
        const confirmBtn = document.getElementById('confirm-replace');

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        confirmBtn.addEventListener('click', () => {
            const currentState = this.gameStateManager.getState();
            const availableCoaches = currentState.availableCoaches;
            const coachIndex = availableCoaches.findIndex(c => c.id === newCoach.id);
            
            // Return old coach to market
            if (currentState.userTeam.coach) {
                currentState.userTeam.coach.teamId = null;
                availableCoaches.push(currentState.userTeam.coach);
            }
            
            this.completeCoachHiring(newCoach, coachIndex);
            modal.style.display = 'none';
        });
    }

    completeCoachHiring(coach, coachIndex) {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        const availableCoaches = state.availableCoaches;

        // Hire coach
        userTeam.coach = coach;
        coach.teamId = userTeam.id;

        // Remove from available coaches
        availableCoaches.splice(coachIndex, 1);

        // Update coach hiring count and date
        const newHiringCount = state.coachHiringCount + 1;
        this.gameStateManager.set('coachHiringCount', newHiringCount);
        this.gameStateManager.set('lastCoachHireDate', new Date());

        // Update game state
        this.gameStateManager.set('availableCoaches', [...availableCoaches]);

        // Update UI
        this.displayCoachList();

        const remainingHires = state.maxCoachHiresPerSeason - newHiringCount;
        this.showNotification(`成功签约教练 ${coach.name}（本赛季剩余签约次数：${remainingHires}）`, 'success');

        // Save game state
        this.gameStateManager.saveGameState();
    }

    viewCoachDetails(coachId) {
        const state = this.gameStateManager.getState();
        const coach = state.availableCoaches.find(c => c.id === coachId);

        if (!coach) return;

        const coachInfo = coach.getInfo();
        const archetypeNames = {
            'offensive': '进攻型教练',
            'defensive': '防守型教练',
            'balanced': '均衡型教练',
            'developmental': '培养型教练',
            'veteran': '老练型教练'
        };
        
        const styleNames = {
            'offensive': '进攻型',
            'defensive': '防守型',
            'balanced': '平衡型',
            'tempo': '快节奏',
            'halfcourt': '半场阵地'
        };
        
        const specialtyNames = {
            'inside': '内线进攻',
            'perimeter': '外线进攻',
            'defense': '防守专家',
            'transition': '快攻战术',
            'halfcourt': '半场攻防',
            'playerDev': '新人培养',
            'clutch': '关键球',
            'rebounding': '篮板球',
            'pickroll': '挡拆配合',
            'threePoint': '三分战术',
            'transitionDefense': '防守反击',
            'halfCourtDefense': '半场防守',
            'zoneDefense': '区域联防',
            'manToMan': '人盯人',
            'pickAndRoll': '挡拆配合',
            'isolation': '单打战术',
            'motionOffense': '动态进攻',
            'postPlay': '低位单打',
            'fastBreak': '快攻得分',
            'threePointShooting': '三分投射'
        };

        const winRate = coachInfo.careerStats.wins + coachInfo.careerStats.losses > 0
            ? Math.round(coachInfo.careerStats.wins / (coachInfo.careerStats.wins + coachInfo.careerStats.losses) * 100)
            : 0;
        
        const championBadge = coachInfo.isChampion
            ? `<span class="champion-badge">🏆 冠军教头</span>`
            : '';
        
        const titlesHtml = coachInfo.titles && coachInfo.titles.length > 0
            ? `<div class="coach-titles">${coachInfo.titles.map(t => `<span class="title-badge">${t}</span>`).join('')}</div>`
            : '';
        
        const specialtiesHtml = coachInfo.specialties && coachInfo.specialties.length > 0
            ? `<div class="coach-specialties">${coachInfo.specialties.map(s => `<span class="specialty-tag">${specialtyNames[s] || s}</span>`).join('')}</div>`
            : '';
        
        const achievementsHtml = coachInfo.achievements && coachInfo.achievements.length > 0
            ? `<div class="achievements-list">${coachInfo.achievements.map(a => `<span class="achievement-tag">${a}</span>`).join('')}</div>`
            : '';
        
        const notablePlayersHtml = coachInfo.notablePlayers && coachInfo.notablePlayers.length > 0
            ? `<div class="notable-players-list">${coachInfo.notablePlayers.map(p => `<span class="player-tag">${p}</span>`).join('')}</div>`
            : '';
        
        const awardsHtml = coachInfo.awards && coachInfo.awards.length > 0
            ? `<div class="awards-list">${coachInfo.awards.map(a => `<span class="award-tag">${a}</span>`).join('')}</div>`
            : '';
        
        const historyHtml = coachInfo.coachingHistory && coachInfo.coachingHistory.length > 0
            ? coachInfo.coachingHistory.map(h => `
                <div class="history-item">
                    <span class="history-team">${h.team}</span>
                    <span class="history-years">${h.years}</span>
                    ${h.achievements ? `<span class="history-achievement">${h.achievements}</span>` : ''}
                </div>
            `).join('')
            : '';
        
        const mottoHtml = coachInfo.motto
            ? `<div class="motto-section"><span class="motto-text">"${coachInfo.motto}"</span></div>`
            : '';

        const modalContent = `
            <div class="coach-details">
                <div class="coach-header">
                    <div class="coach-name-info">
                        <h3>${coachInfo.name}</h3>
                        ${championBadge}
                    </div>
                    ${titlesHtml}
                    ${mottoHtml}
                    <div class="coach-meta">
                        <div class="rating-item">
                            <span class="rating-label">综合评分</span>
                            <span class="rating-value">${coachInfo.overallRating}</span>
                        </div>
                    </div>
                </div>
                
                <div class="coach-basic-info">
                    <div class="info-row">
                        <span class="info-label">年龄:</span>
                        <span class="info-value">${coachInfo.age}岁</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">经验:</span>
                        <span class="info-value">${coachInfo.experience}年</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">毕业院校:</span>
                        <span class="info-value">${coachInfo.almaMater || '未知'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">球员生涯:</span>
                        <span class="info-value">${coachInfo.playingCareer || '无详细记录'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">执教风格:</span>
                        <span class="info-value">${styleNames[coachInfo.coachingStyle] || coachInfo.coachingStyle}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">类型:</span>
                        <span class="info-value">${archetypeNames[coachInfo.archetype] || coachInfo.archetype}</span>
                    </div>
                </div>
                
                <div class="coach-style-section">
                    <h4>执教专长</h4>
                    ${specialtiesHtml}
                </div>
                
                <div class="coach-archetype">
                    <h4>${archetypeNames[coachInfo.archetype] || coachInfo.archetype}</h4>
                    <p>${this.getArchetypeDescription(coachInfo.archetype)}</p>
                </div>
                
                <div class="coach-attributes-detailed">
                    <h4>详细属性</h4>
                    <div class="attributes-grid">
                        <div class="attribute-item">
                            <span class="attr-name">进攻</span>
                            <div class="attr-bar">
                                <div class="attr-fill" style="width: ${coachInfo.attributes.offense}%"></div>
                            </div>
                            <span class="attr-value">${coachInfo.attributes.offense}</span>
                        </div>
                        <div class="attribute-item">
                            <span class="attr-name">防守</span>
                            <div class="attr-bar">
                                <div class="attr-fill" style="width: ${coachInfo.attributes.defense}%"></div>
                            </div>
                            <span class="attr-value">${coachInfo.attributes.defense}</span>
                        </div>
                        <div class="attribute-item">
                            <span class="attr-name">招募</span>
                            <div class="attr-bar">
                                <div class="attr-fill" style="width: ${coachInfo.attributes.recruiting}%"></div>
                            </div>
                            <span class="attr-value">${coachInfo.attributes.recruiting}</span>
                        </div>
                        <div class="attribute-item">
                            <span class="attr-name">培养</span>
                            <div class="attr-bar">
                                <div class="attr-fill" style="width: ${coachInfo.attributes.development}%"></div>
                            </div>
                            <span class="attr-value">${coachInfo.attributes.development}</span>
                        </div>
                        <div class="attribute-item">
                            <span class="attr-name">激励</span>
                            <div class="attr-bar">
                                <div class="attr-fill" style="width: ${coachInfo.attributes.motivation}%"></div>
                            </div>
                            <span class="attr-value">${coachInfo.attributes.motivation}</span>
                        </div>
                        <div class="attribute-item">
                            <span class="attr-name">新人培养</span>
                            <div class="attr-bar">
                                <div class="attr-fill" style="width: ${coachInfo.playerDevRating}%"></div>
                            </div>
                            <span class="attr-value">${coachInfo.playerDevRating}</span>
                        </div>
                        <div class="attribute-item">
                            <span class="attr-name">联盟影响</span>
                            <div class="attr-bar">
                                <div class="attr-fill" style="width: ${coachInfo.influence}%"></div>
                            </div>
                            <span class="attr-value">${coachInfo.influence}</span>
                        </div>
                        <div class="attribute-item">
                            <span class="attr-name">战术创新</span>
                            <div class="attr-bar">
                                <div class="attr-fill" style="width: ${coachInfo.innovation}%"></div>
                            </div>
                            <span class="attr-value">${coachInfo.innovation}</span>
                        </div>
                    </div>
                </div>
                
                <div class="coach-career">
                    <h4>执教生涯数据</h4>
                    <div class="career-stats">
                        <div class="stat-item">
                            <span class="stat-label">执教赛季</span>
                            <span class="stat-value">${coachInfo.careerStats.seasons}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">总胜场</span>
                            <span class="stat-value">${coachInfo.careerStats.wins}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">总负场</span>
                            <span class="stat-value">${coachInfo.careerStats.losses}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">胜率</span>
                            <span class="stat-value">${winRate}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">冠军</span>
                            <span class="stat-value">${coachInfo.careerStats.championships}次</span>
                        </div>
                    </div>
                </div>
                
                ${awardsHtml ? `
                <div class="coach-awards-section">
                    <h4>获得奖项</h4>
                    ${awardsHtml}
                </div>
                ` : ''}
                
                ${achievementsHtml ? `
                <div class="coach-achievements-section">
                    <h4>主要成就</h4>
                    ${achievementsHtml}
                </div>
                ` : ''}
                
                ${historyHtml ? `
                <div class="coach-history-section">
                    <h4>执教履历</h4>
                    <div class="coach-history-list">
                        ${historyHtml}
                    </div>
                </div>
                ` : ''}
                
                ${notablePlayersHtml ? `
                <div class="coach-notable-players-section">
                    <h4>培养的知名球员</h4>
                    ${notablePlayersHtml}
                </div>
                ` : ''}
                
                <div class="coach-philosophy-section">
                    <h4>执教理念</h4>
                    <p class="philosophy-text">"${coachInfo.philosophy || '暂无描述'}"</p>
                </div>
                
                <div class="coach-strengths-weaknesses">
                    <div class="strengths-section">
                        <h4>执教优势</h4>
                        <p>${coachInfo.strengths || '暂无信息'}</p>
                    </div>
                    <div class="weaknesses-section">
                        <h4>执教短板</h4>
                        <p>${coachInfo.weaknesses || '暂无信息'}</p>
                    </div>
                </div>
                
                <div class="coach-actions">
                    <button class="btn hire-btn" data-coach-id="${coachId}" style="width: 100%;">确认签约</button>
                </div>
            </div>
        `;

        const modal = document.getElementById('player-modal');
        const modalContentDiv = modal.querySelector('.modal-content');
        modalContentDiv.innerHTML = modalContent;
        modal.style.display = 'block';

        modal.querySelector('.hire-btn').addEventListener('click', () => {
            this.hireCoach(coachId);
            modal.style.display = 'none';
        });
    }

    setupCoachMarketEvents() {
        // Refresh coach market button
        const refreshBtn = document.getElementById('refresh-coach-market');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshCoachMarket();
            });
        }

        // Filter buttons
        const archetypeFilter = document.getElementById('archetype-filter');

        if (archetypeFilter) {
            archetypeFilter.addEventListener('change', () => {
                const archetype = archetypeFilter.value;
                this.displayCoachList(archetype);
            });
        }
    }

    refreshCoachMarket() {
        const state = this.gameStateManager.getState();
        const availableCoaches = state.availableCoaches;

        // Generate new coaches
        const newCoaches = this.generateCoaches(10);

        // Update game state
        this.gameStateManager.set('availableCoaches', newCoaches);
        this.gameStateManager.set('coachMarketRefreshDate', new Date());

        // Update UI
        this.displayCoachList();
        this.updateMarketInfo();

        this.showNotification('教练市场已刷新', 'info');

        // Save game state
        this.gameStateManager.saveGameState();
    }

    updateMarketInfo() {
        const state = this.gameStateManager.getState();
        const refreshDate = state.coachMarketRefreshDate;
        const availableCoaches = state.availableCoaches || [];
        const hiringCount = state.coachHiringCount || 0;
        const maxHires = state.maxCoachHiresPerSeason || 2;

        const dateElement = document.getElementById('market-refresh-date');
        const countElement = document.getElementById('available-coaches-count');
        const hiringInfoElement = document.getElementById('coach-hiring-info');

        if (dateElement) {
            dateElement.textContent = this.formatDate(refreshDate);
        }

        if (countElement) {
            countElement.textContent = availableCoaches.length;
        }

        if (hiringInfoElement) {
            const remainingHires = maxHires - hiringCount;
            hiringInfoElement.textContent = `本赛季签约：${hiringCount}/${maxHires}（剩余${remainingHires}次）`;
            
            // Add warning class if reaching limit
            if (remainingHires === 0) {
                hiringInfoElement.classList.add('limit-reached');
            } else if (remainingHires === 1) {
                hiringInfoElement.classList.add('near-limit');
            } else {
                hiringInfoElement.classList.remove('limit-reached', 'near-limit');
            }
        }
    }

    generateCoaches(count) {
        const coaches = [];
        const archetypes = ['offensive', 'defensive', 'balanced', 'developmental', 'veteran'];
        const coachingStyles = ['offensive', 'defensive', 'balanced', 'tempo', 'halfcourt'];
        const specialtiesPool = [
            'inside', 'perimeter', 'defense', 'transition', 'halfcourt',
            'playerDev', 'clutch', 'rebounding', 'pickroll', 'threePoint',
            'transitionDefense', 'halfCourtDefense', 'zoneDefense', 'manToMan',
            'isolation', 'motionOffense', 'postPlay', 'fastBreak', 'threePointShooting'
        ];
        const philosophies = [
            '强调团队配合与无私分享球权，注重分享球和团队篮球',
            '注重防守反击与快速转换，追求高节奏比赛',
            '以内线为核心构建进攻体系，擅长低位战术',
            '崇尚三分球与空间篮球，现代进攻理念',
            '重视新人培养与球队长远发展，耐心培养年轻球员',
            '追求进攻效率与数据分析，科学化训练',
            '强调身体对抗与防守硬度，铁血防守风格',
            '善于临场调整与关键时刻决策，季后赛专家',
            '注重球员个性化发展，因材施教',
            '追求团队防守与纪律性，军队化管理'
        ];
        
        const colleges = [
            '杜克大学', '北卡罗来纳大学', '肯塔基大学', '堪萨斯大学', 'UCLA',
            '维拉诺瓦大学', '冈萨加大学', '俄勒冈大学', '密歇根大学', '雪城大学',
            '亚利桑那大学', ' Gonzaga', 'Michigan State', 'North Carolina', 'Duke',
            'UCLA', 'Kentucky', 'Kansas', 'Arizona', 'Villanova'
        ];
        
        const teams = [
            '凯尔特人', '湖人', '勇士', '热火', '公牛',
            '马刺', '太阳', '雄鹿', '掘金', '独行侠',
            '快船', '76人', '篮网', '猛龙', '骑士',
            ' Celtics', 'Lakers', 'Warriors', 'Heat', 'Bulls',
            'Spurs', 'Suns', 'Bucks', 'Nuggets', 'Mavericks'
        ];
        
        const firstNames = [
            '格雷格', '埃里克', '泰', '汤姆', '史蒂夫', '迈克', '道格', '里克', '弗兰克',
            '乔治', '菲尔', '帕特', '拉里', '杰里', '红衣主教', '查克', '德尔', '兰迪',
            'Gregg', 'Erik', 'Ty', 'Tom', 'Steve', 'Mike', 'Doug', 'Rick', 'Frank',
            'George', 'Phil', 'Pat', 'Larry', 'Jerry', 'Chuck', 'Del', 'Randy', 'Bud',
            '奎恩', '斯坦', '德里克', '贾森', '斯科特', '马克', '布拉德', '大卫'
        ];
        
        const lastNames = [
            '波波维奇', '斯波斯特拉', '科尔', '里弗斯', '锡伯杜', '卡莱尔', '德安东尼',
            '麦克米兰', '布登霍尔泽', '多诺万', '马龙', '基德', '纳斯', '比克斯塔夫',
            'Popovich', 'Spoelstra', 'Kerr', 'Rivers', 'Thibodeau', 'Carlisle', 'DAntoni',
            'McMillan', 'Budenholzer', 'Donovan', 'Malone', 'Kidd', 'Nurse', 'Bickerstaff',
            '奥利尼克', '哈蒙', '沃恩', '威罗贝尔', '米切尔', '伍德森', '莱利', '布朗',
            'Olson', 'Hammon', 'Vaughn', 'Wielobob', 'Mitchell', 'Woodson', 'Riley', 'Brown'
        ];
        
        const famousPlayers = [
            '迈克尔·乔丹', '勒布朗·詹姆斯', '科比·布莱恩特', '蒂姆·邓肯', '沙奎尔·奥尼尔',
            '凯文·杜兰特', '斯蒂芬·库里', '卡哇伊·莱昂纳德', '詹姆斯·哈登', '安东尼·戴维斯',
            '卢卡·东契奇', '扬尼斯·阿德托昆博', '杰森·塔图姆', '贾·莫兰特', '卢卡',
            'Magic Johnson', 'Larry Bird', 'Kobe Bryant', 'Tim Duncan', 'Shaq',
            'LeBron James', 'Kevin Durant', 'Stephen Curry', 'Kawhi Leonard', 'James Harden'
        ];
        
        const achievementPool = [
            '常规赛最佳战绩',
            '分区冠军',
            '防守效率前三',
            '进攻效率前三',
            '青年球员进步显著',
            '季后赛常客',
            '总决赛常客',
            '最佳教练奖',
            '年度最佳总经理',
            '体育精神奖',
            '社区贡献奖',
            '创新战术奖',
            '逆转之王',
            '下半场之王',
            '关键时刻专家'
        ];
        
        const awardPool = [
            '年度最佳教练',
            '分区最佳教练',
            '体育精神奖',
            '社区服务奖',
            '最佳进攻战术',
            '最佳防守体系',
            '新人培养奖',
            '季后赛最佳教练',
            'NBA名人堂提名',
            '教练协会最佳教练'
        ];
        
        const mottoPool = [
            '防守赢得冠军',
            '团队大于个人',
            '永不放弃',
            '细节决定成败',
            '努力成就伟大',
            '信任队友',
            '享受比赛',
            '追求卓越',
            '每球必争',
            '冠军心态'
        ];

        for (let i = 0; i < count; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
            const coachingStyle = coachingStyles[Math.floor(Math.random() * coachingStyles.length)];
            
            const numSpecialties = 3 + Math.floor(Math.random() * 4);
            const coachSpecialties = [];
            const availableSpecialties = [...specialtiesPool];
            for (let j = 0; j < numSpecialties && availableSpecialties.length > 0; j++) {
                const idx = Math.floor(Math.random() * availableSpecialties.length);
                coachSpecialties.push(availableSpecialties.splice(idx, 1)[0]);
            }

            const isChampion = Math.random() < 0.2;
            const numChampionships = isChampion ? (Math.random() < 0.4 ? 3 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 2)) : Math.floor(Math.random() * 2);
            const playerDevRating = 45 + Math.floor(Math.random() * 45);
            const seasons = 5 + Math.floor(Math.random() * 20);
            const totalGames = seasons * 82;
            const winRateBase = isChampion ? 0.55 + Math.random() * 0.15 : 0.4 + Math.random() * 0.25;
            const totalWins = Math.floor(totalGames * winRateBase);
            const totalLosses = totalGames - totalWins;
            
            const numAchievements = 2 + Math.floor(Math.random() * 5);
            const achievements = [];
            const availableAchievements = [...achievementPool];
            for (let j = 0; j < numAchievements && availableAchievements.length > 0; j++) {
                const idx = Math.floor(Math.random() * availableAchievements.length);
                achievements.push(availableAchievements.splice(idx, 1)[0]);
            }
            
            const numAwards = Math.floor(Math.random() * 4);
            const awards = [];
            for (let j = 0; j < numAwards; j++) {
                if (Math.random() < 0.3) {
                    awards.push(awardPool[Math.floor(Math.random() * awardPool.length)]);
                }
            }
            
            const numNotablePlayers = 2 + Math.floor(Math.random() * 4);
            const notablePlayers = [];
            const availablePlayers = [...famousPlayers];
            for (let j = 0; j < numNotablePlayers && availablePlayers.length > 0; j++) {
                const idx = Math.floor(Math.random() * availablePlayers.length);
                notablePlayers.push(availablePlayers.splice(idx, 1)[0]);
            }
            
            const numHistory = 2 + Math.floor(Math.random() * 4);
            const coachingHistory = [];
            const availableTeams = [...teams];
            for (let j = 0; j < numHistory && availableTeams.length > 0; j++) {
                const idx = Math.floor(Math.random() * availableTeams.length);
                const years = 1 + Math.floor(Math.random() * 5);
                coachingHistory.push({
                    team: availableTeams.splice(idx, 1)[0],
                    years: `${2015 - years}-${2015}`,
                    achievements: Math.random() < 0.5 ? achievements[Math.floor(Math.random() * Math.min(achievements.length, 2))] : null
                });
            }
            
            const titles = [];
            if (numChampionships > 0) titles.push('冠军教头');
            if (numChampionships >= 3) titles.push('王朝教头');
            if (playerDevRating >= 80) titles.push('新人教父');
            if (awards.includes('年度最佳教练') || awards.includes('NBA名人堂提名')) titles.push('名人堂级别');
            if (isChampion && numChampionships >= 5) titles.push('传奇教头');
            if (seasons >= 15) titles.push('千胜教头');
            if (Math.random() < 0.1) titles.push('战术大师');
            
            const salaryBase = isChampion ? 800000 : 400000;
            const salary = salaryBase + Math.floor(Math.random() * 1200000);
            
            const influence = 50 + Math.floor(Math.random() * 40);
            const innovation = 50 + Math.floor(Math.random() * 40);
            const adaptability = 50 + Math.floor(Math.random() * 40);
            
            const coach = {
                id: this.gameStateManager.getCoachId(),
                name: `${firstName} ${lastName}`,
                age: 40 + Math.floor(Math.random() * 25),
                archetype: archetype,
                attributes: {
                    offense: 50 + Math.floor(Math.random() * 40),
                    defense: 50 + Math.floor(Math.random() * 40),
                    recruiting: 45 + Math.floor(Math.random() * 45),
                    development: playerDevRating,
                    motivation: 50 + Math.floor(Math.random() * 40)
                },
                salary: salary,
                preferredPlayStyles: [],
                experience: seasons,
                careerStats: {
                    seasons: seasons,
                    wins: totalWins,
                    losses: totalLosses,
                    championships: numChampionships
                },
                coachingStyle: coachingStyle,
                specialties: coachSpecialties,
                isChampion: isChampion,
                playerDevRating: playerDevRating,
                philosophy: philosophies[Math.floor(Math.random() * philosophies.length)],
                titles: titles,
                maximizePotential: playerDevRating >= 75,
                almaMater: colleges[Math.floor(Math.random() * colleges.length)],
                playingCareer: `${Math.floor(Math.random() * 10) + 2}年职业球员经历${Math.random() < 0.3 ? '，曾入选全明星' : ''}`,
                coachingHistory: coachingHistory,
                achievements: achievements,
                notablePlayers: notablePlayers,
                awards: [...new Set(awards)],
                currentTeam: isChampion && Math.random() < 0.5 ? teams[Math.floor(Math.random() * teams.length)] : null,
                yearsWithoutChampionship: isChampion ? 0 : Math.floor(Math.random() * 10),
                coachingPhilosophy: philosophies[Math.floor(Math.random() * philosophies.length)],
                strengths: ['临场调整', '球员沟通', '战术设计'][Math.floor(Math.random() * 3)],
                weaknesses: ['常规赛轮换', '年轻球员使用', '关键时刻暂停'][Math.floor(Math.random() * 3)],
                motto: mottoPool[Math.floor(Math.random() * mottoPool.length)],
                influence: influence,
                innovation: innovation,
                adaptability: adaptability
            };

            coaches.push(coach);
        }

        return coaches;
    }

    formatDate(date) {
        if (!date) {
            return new Date().toISOString().split('T')[0];
        }
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