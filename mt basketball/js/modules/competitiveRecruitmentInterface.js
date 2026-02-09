/**
 * 竞争性招募界面
 * 集成AI球队竞争机制的招募界面增强版
 */

class CompetitiveRecruitmentInterface {
    constructor(recruitmentInterface, recruitmentCompetitionSystem) {
        this.recruitmentInterface = recruitmentInterface;
        this.competitionSystem = recruitmentCompetitionSystem;
        this.currentPlayer = null;
    }
    
    /**
     * 显示带竞争信息的球员详情
     */
    showCompetitivePlayerDetail(player) {
        this.currentPlayer = player;
        
        // 获取或初始化招募状态
        let status = this.competitionSystem.getPlayerRecruitmentStatus(player.id);
        if (!status) {
            status = this.competitionSystem.initializePlayerRecruitment(player);
        }
        
        const modal = document.getElementById('player-modal');
        const content = document.getElementById('player-detail-content');
        if (!modal || !content) return;
        
        // 基础信息（复用原有逻辑）
        const level = this.recruitmentInterface.getPotentialLevel(player.potential);
        let rating = player.rating;
        if (!rating && typeof player.getOverallRating === 'function') {
            try {
                rating = player.getOverallRating();
            } catch (e) {
                rating = 50;
            }
        }
        if (!rating || isNaN(rating)) rating = 50;
        
        const yearLabels = { 1: '大一', 2: '大二', 3: '大三', 4: '大四' };
        const initials = player.name.split(' ').map(n => n[0]).join('');
        
        // 竞争信息
        const competitionHtml = this.createCompetitionSection(status);

        // 性格信息
        const personalityHtml = this.recruitmentInterface.renderPersonalityDetail(player);

        // 行动按钮
        const actionButtonsHtml = this.createActionButtons(status);
        
        content.innerHTML = `
            <div class="detail-header">
                <div class="detail-avatar">${initials}</div>
                <div class="detail-info">
                    <h2 class="detail-name">${player.name}</h2>
                    <div class="detail-tags">
                        <span class="tag position">${Positions[player.position]}</span>
                        <span class="tag year">${yearLabels[player.year]}</span>
                        <span class="tag rating" style="background: ${this.recruitmentInterface.getRatingColor(rating)}20; color: ${this.recruitmentInterface.getRatingColor(rating)};">
                            能力值 ${rating}
                        </span>
                        <span class="tag potential" style="background: ${level.color}20; color: ${level.color};">
                            ${level.icon} 潜力值 ${player.potential}
                        </span>
                        ${player.specialistInfo ? `
                        <span class="tag specialist" style="background: #8b5cf620; color: #8b5cf6;">
                            ${player.specialistInfo.icon} ${player.specialistInfo.name}
                        </span>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <!-- 竞争状态区 -->
            ${competitionHtml}

            <!-- 性格特征 -->
            <div class="detail-section">
                <h4>性格特征</h4>
                ${personalityHtml}
            </div>

            <!-- 属性展示 -->
            <div class="detail-section">
                <h4>技术指标</h4>
                <div class="detailed-attributes">
                    <div class="attr-category">
                        <h5>进攻能力</h5>
                        <div class="attr-list">
                            ${this.recruitmentInterface.createAttrRow('得分', player.attributes?.scoring, '#ef4444')}
                            ${this.recruitmentInterface.createAttrRow('投篮', player.attributes?.shooting, '#f59e0b')}
                            ${this.recruitmentInterface.createAttrRow('三分', player.attributes?.threePoint, '#3b82f6')}
                            ${this.recruitmentInterface.createAttrRow('罚球', player.attributes?.freeThrow, '#10b981')}
                            ${this.recruitmentInterface.createAttrRow('控球', player.attributes?.dribbling, '#8b5cf6')}
                            ${this.recruitmentInterface.createAttrRow('传球', player.attributes?.passing, '#06b6d4')}
                        </div>
                    </div>
                    <div class="attr-category">
                        <h5>防守与身体</h5>
                        <div class="attr-list">
                            ${this.recruitmentInterface.createAttrRow('防守', player.attributes?.defense, '#ef4444')}
                            ${this.recruitmentInterface.createAttrRow('篮板', player.attributes?.rebounding, '#f59e0b')}
                            ${this.recruitmentInterface.createAttrRow('抢断', player.attributes?.stealing, '#3b82f6')}
                            ${this.recruitmentInterface.createAttrRow('盖帽', player.attributes?.blocking, '#10b981')}
                            ${this.recruitmentInterface.createAttrRow('速度', player.attributes?.speed, '#8b5cf6')}
                            ${this.recruitmentInterface.createAttrRow('体能', player.attributes?.stamina, '#06b6d4')}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 招募行动区 -->
            <div class="detail-section">
                <h4>招募行动</h4>
                ${actionButtonsHtml}
            </div>
        `;
        
        modal.style.display = 'block';
        
        // 绑定行动按钮事件
        this.bindActionButtons(status);
    }
    
    /**
     * 创建竞争状态展示区
     */
    createCompetitionSection(status) {
        if (status.isSigned) {
            const winner = status.signedWith === 'user' ? '你的球队' : 
                          (status.competingTeams.find(t => t.teamId === status.signedWith)?.teamName || '其他球队');
            return `
                <div class="competition-section signed">
                    <div class="competition-result">
                        ${status.signedWith === 'user' 
                            ? '<div class="result-icon success">✓</div><div class="result-text">成功签约</div>' 
                            : '<div class="result-icon failed">✗</div><div class="result-text">签约失败</div>'}
                    </div>
                    <div class="competition-winner">
                        ${status.signedWith === 'user' 
                            ? '🎉 该球员已承诺加入你的球队！' 
                            : `😔 该球员已被 ${winner} 签下`}
                    </div>
                </div>
            `;
        }
        
        // 计算竞争强度 - 使用更协调的配色
        let intensityLabel, intensityColor, intensityBg;
        if (status.competitionIntensity >= 0.9) {
            intensityLabel = '🔥 极其激烈';
            intensityColor = '#ff6b6b';
            intensityBg = 'rgba(255, 107, 107, 0.15)';
        } else if (status.competitionIntensity >= 0.7) {
            intensityLabel = '⚡ 非常激烈';
            intensityColor = '#ffd166';
            intensityBg = 'rgba(255, 209, 102, 0.15)';
        } else if (status.competitionIntensity >= 0.5) {
            intensityLabel = '💪 竞争激烈';
            intensityColor = '#06d6a0';
            intensityBg = 'rgba(6, 214, 160, 0.15)';
        } else {
            intensityLabel = '📋 一般竞争';
            intensityColor = '#118ab2';
            intensityBg = 'rgba(17, 138, 178, 0.15)';
        }
        
        // 获取招募阶段信息
        const recruitmentPhase = this.competitionSystem.getRecruitmentPhase();
        
        // 创建竞争球队列表（只显示前3个）
        const topTeams = status.competingTeams.slice(0, 3);
        const competingTeamsHtml = topTeams.map(team => {
            const interestWidth = team.interest;
            return `
                <div class="competing-team">
                    <span class="team-name">${team.teamName}</span>
                    <div class="team-interest-row">
                        <div class="interest-bar-bg">
                            <div class="interest-bar" style="width: ${interestWidth}%; background: linear-gradient(90deg, #ff6b6b, #ff8e8e);"></div>
                        </div>
                        <span class="interest-value" style="color: #ff6b6b; font-weight: 700;">${team.interest}%</span>
                    </div>
                </div>
            `;
        }).join('');
        
        // 玩家兴趣度 - 使用渐变配色
        const playerInterestColor = status.playerInterestInUser >= 80 ? 'linear-gradient(90deg, #06d6a0, #118ab2)' : 
                                    status.playerInterestInUser >= 60 ? 'linear-gradient(90deg, #118ab2, #073b4c)' : 
                                    status.playerInterestInUser >= 40 ? 'linear-gradient(90deg, #ffd166, #ff9e6d)' : 'linear-gradient(90deg, #ff6b6b, #ff8e8e)';
        
        const isLeading = status.playerInterestInUser >= Math.max(...status.competingTeams.map(t => t.interest), 0);
        
        return `
            <div class="competition-section">
                <!-- 竞争强度和时间 -->
                <div class="competition-overview">
                    <div class="intensity-badge" style="background: ${intensityBg}; color: ${intensityColor};">
                        ${intensityLabel}
                    </div>
                    <div class="timer-badge">
                        <span>⏰</span>
                        <span>${status.daysRemaining}天</span>
                    </div>
                </div>
                
                <!-- 你的进度 -->
                <div class="your-progress-section ${isLeading ? 'leading' : ''}">
                    <div class="progress-header">
                        <span class="progress-label">🏀 你的球队</span>
                        <span class="progress-status" style="background: ${isLeading ? 'rgba(6, 214, 160, 0.2)' : 'rgba(255, 209, 102, 0.2)'}; color: ${isLeading ? '#06d6a0' : '#ffd166'};">
                            ${isLeading ? '👑 领先' : '⚡ 追赶中'}
                        </span>
                    </div>
                    <div class="progress-bar-large">
                        <div class="progress-fill-large" style="width: ${status.playerInterestInUser}%; background: ${playerInterestColor};"></div>
                        <span class="progress-percent" style="color: ${isLeading ? '#06d6a0' : '#ffd166'};">${status.playerInterestInUser}%</span>
                    </div>
                </div>
                
                <!-- 竞争对手 -->
                ${competingTeamsHtml ? `
                <div class="competitors-section">
                    <div class="competitors-header">
                        <span>⚔️ 主要竞争对手</span>
                        <span class="competitors-count">${status.competingTeams.length}支球队</span>
                    </div>
                    <div class="competitors-list">
                        ${competingTeamsHtml}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * 创建行动按钮
     */
    createActionButtons(status) {
        if (status.isSigned) {
            return '<div class="no-actions">该球员已不可招募</div>';
        }

        // 检查是否使用新的签约系统
        const canSignDirectly = window.signingSystem && window.signingInterface;
        
        // 检查是否已承诺该球员
        const commitment = this.competitionSystem.getPlayerCommitment(status.playerId);
        const isCommittedByUser = commitment && commitment.teamId === 'user';
        const canCommit = status.playerInterestInUser >= 80 && !isCommittedByUser && !commitment;

        const actions = [
            { id: 'campus_visit', name: '🏫 校园参观', cost: 5000, desc: '展示校园设施和文化' },
            { id: 'home_visit', name: '🏠 家访', cost: 8000, desc: '深入了解球员家庭' },
            { id: 'promise_playing_time', name: '⏱️ 承诺上场时间', cost: 0, desc: '保证赛季出场时间' },
            { id: 'highlight_facilities', name: '🏋️ 展示设施', cost: 2000, desc: '展示训练设施' },
            { id: 'emphasize_academics', name: '📚 强调学术', cost: 1000, desc: '突出学术优势' }
        ];

        // 添加承诺签约按钮（兴趣度≥80%时显示）
        if (canCommit) {
            actions.unshift({
                id: 'commit_player',
                name: '🔒 承诺签约',
                cost: 0,
                desc: '锁定球员14天，期间其他球队无法签约',
                highlight: true,
                style: 'commit'
            });
        } else if (isCommittedByUser) {
            // 已承诺，显示取消承诺按钮
            const daysRemaining = commitment.daysRemaining || Math.ceil((commitment.expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
            actions.unshift({
                id: 'cancel_commit',
                name: `🔓 取消承诺 (${daysRemaining}天)`,
                cost: 0,
                desc: '取消对该球员的承诺锁定',
                style: 'cancel'
            });
        }

        // 添加签约按钮和提供奖学金按钮
        if (canSignDirectly) {
            // 有签约系统时，显示立即签约按钮
            actions.unshift({
                id: 'sign_player',
                name: '📝 立即签约',
                cost: 0,
                desc: isCommittedByUser ? '你已承诺该球员，现在可以签约' : '提交正式报价',
                highlight: !canCommit && !isCommittedByUser
            });
        }
        
        // 始终显示提供奖学金按钮（用于提升兴趣度）
        actions.splice(2, 0, { 
            id: 'offer_scholarship', 
            name: '🎓 提供奖学金', 
            cost: 0, 
            desc: '正式奖学金offer，大幅提升兴趣度' 
        });
        
        return `
            <div class="recruitment-actions-grid">
                ${actions.map(action => `
                    <button class="recruitment-action-btn ${action.highlight ? 'highlight' : ''} ${action.style || ''}" data-action="${action.id}"
                        ${status.isSigned ? 'disabled' : ''}>
                        <div class="action-name">${action.name}</div>
                        <div class="action-desc">${action.desc}</div>
                        ${action.cost > 0 ? `<div class="action-cost">💰 $${action.cost.toLocaleString()}</div>` : ''}
                    </button>
                `).join('')}
            </div>
            <div class="action-result" id="action-result"></div>
        `;
    }
    
    /**
     * 绑定行动按钮事件
     */
    bindActionButtons(status) {
        const buttons = document.querySelectorAll('.recruitment-action-btn');
        const resultDiv = document.getElementById('action-result');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const actionType = btn.dataset.action;

                // 处理签约按钮点击
                if (actionType === 'sign_player' && window.signingInterface) {
                    window.signingInterface.showSigningModal(this.currentPlayer);
                    return;
                }
                
                // 处理承诺签约按钮点击
                if (actionType === 'commit_player') {
                    const result = this.competitionSystem.commitToPlayer(status.playerId);
                    
                    if (result.success) {
                        resultDiv.innerHTML = `
                            <div class="action-success">
                                <span class="success-icon">🔒</span>
                                <span class="success-message">${result.message}</span>
                            </div>
                        `;
                        this.showNotification(result.message, 'success');
                        
                        // 刷新显示
                        setTimeout(() => {
                            this.showCompetitivePlayerDetail(this.currentPlayer);
                        }, 1500);
                    } else {
                        resultDiv.innerHTML = `
                            <div class="action-failed">
                                <span class="failed-icon">❌</span>
                                <span class="failed-message">${result.message}</span>
                            </div>
                        `;
                        this.showNotification(result.message, 'warning');
                    }
                    return;
                }
                
                // 处理取消承诺按钮点击
                if (actionType === 'cancel_commit') {
                    const result = this.competitionSystem.cancelCommitment(status.playerId);
                    
                    if (result.success) {
                        resultDiv.innerHTML = `
                            <div class="action-success">
                                <span class="success-icon">🔓</span>
                                <span class="success-message">${result.message}</span>
                            </div>
                        `;
                        this.showNotification(result.message, 'success');
                        
                        // 刷新显示
                        setTimeout(() => {
                            this.showCompetitivePlayerDetail(this.currentPlayer);
                        }, 1500);
                    } else {
                        resultDiv.innerHTML = `
                            <div class="action-failed">
                                <span class="failed-icon">❌</span>
                                <span class="failed-message">${result.message}</span>
                            </div>
                        `;
                        this.showNotification(result.message, 'warning');
                    }
                    return;
                }

                // 执行其他行动
                const result = this.competitionSystem.playerTakeAction(status.playerId, actionType);

                if (result.success) {
                    // 显示结果
                    resultDiv.innerHTML = `
                        <div class="action-success">
                            <span class="success-icon">✅</span>
                            <span class="success-message">${result.message}</span>
                            <span class="interest-change">+${result.interestIncrease}% 兴趣度</span>
                        </div>
                    `;

                    // 刷新显示
                    setTimeout(() => {
                        this.showCompetitivePlayerDetail(this.currentPlayer);
                    }, 1500);

                    // 显示通知
                    this.showNotification(`${result.message} (兴趣度 +${result.interestIncrease}%)`, 'success');
                } else {
                    resultDiv.innerHTML = `
                        <div class="action-failed">
                            <span class="failed-icon">❌</span>
                            <span class="failed-message">${result.message}</span>
                        </div>
                    `;
                    this.showNotification(result.message, 'warning');
                }
            });
        });
    }
    
    /**
     * 创建球员卡片（带竞争信息）
     */
    createCompetitivePlayerCard(player) {
        const status = this.competitionSystem.getPlayerRecruitmentStatus(player.id);
        
        // 基础卡片HTML
        const baseCard = this.recruitmentInterface.createPlayerCard(player);
        
        if (!status || status.isSigned) {
            return baseCard;
        }
        
        // 添加竞争指示器
        const competitionIndicator = this.createCompetitionIndicator(status);
        
        // 在card-header后插入竞争指示器
        return baseCard.replace(
            '</div>\n                <div class="rating-display-center">',
            `</div>
                ${competitionIndicator}
                <div class="rating-display-center">`
        );
    }
    
    /**
     * 创建竞争指示器
     */
    createCompetitionIndicator(status) {
        if (status.isSigned) {
            const isSignedByUser = status.signedWith === 'user';
            return `
                <div class="competition-indicator ${isSignedByUser ? 'signed-user' : 'signed-other'}">
                    <span class="indicator-icon">${isSignedByUser ? '✅' : '❌'}</span>
                    <span class="indicator-text">${isSignedByUser ? '已承诺' : '已被签'}</span>
                </div>
            `;
        }
        
        // 判断玩家是否领先
        const maxAIInterest = Math.max(0, ...status.competingTeams.map(t => t.interest));
        const isLeading = status.playerInterestInUser > maxAIInterest;
        
        let indicatorClass, indicatorIcon, indicatorText;
        if (isLeading) {
            indicatorClass = 'leading';
            indicatorIcon = '👑';
            indicatorText = '领先';
        } else if (status.playerInterestInUser >= maxAIInterest - 10) {
            indicatorClass = 'competing';
            indicatorIcon = '⚡';
            indicatorText = '紧咬';
        } else {
            indicatorClass = 'behind';
            indicatorIcon = '⚠️';
            indicatorText = '落后';
        }
        
        return `
            <div class="competition-indicator ${indicatorClass}">
                <span class="indicator-icon">${indicatorIcon}</span>
                <span class="indicator-text">${indicatorText}</span>
                <span class="competitor-count">vs ${status.competingTeams.length}</span>
            </div>
        `;
    }
    
    /**
     * 显示招募仪表盘
     */
    showRecruitmentDashboard() {
        const activeRecruitments = this.competitionSystem.getActiveRecruitments();
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'recruitment-dashboard-modal';
        modal.innerHTML = `
            <div class="modal-content dashboard-modal">
                <div class="modal-header">
                    <h2>📊 招募仪表盘</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="dashboard-content">
                    <div class="dashboard-stats">
                        <div class="stat-card">
                            <div class="stat-value">${activeRecruitments.length}</div>
                            <div class="stat-label">活跃招募</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${activeRecruitments.filter(r => r.playerInterestInUser >= 70).length}</div>
                            <div class="stat-label">高兴趣度</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${activeRecruitments.filter(r => {
                                const maxAI = Math.max(0, ...r.competingTeams.map(t => t.interest));
                                return r.playerInterestInUser > maxAI;
                            }).length}</div>
                            <div class="stat-label">领先中</div>
                        </div>
                    </div>
                    
                    <div class="recruitment-list">
                        <h3>招募进度</h3>
                        ${activeRecruitments.length === 0 ? 
                            '<div class="empty-state">暂无活跃招募</div>' :
                            activeRecruitments.map(r => this.createDashboardItem(r)).join('')
                        }
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // 关闭事件
        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    /**
     * 创建仪表盘项目
     */
    createDashboardItem(status) {
        const maxAIInterest = Math.max(0, ...status.competingTeams.map(t => t.interest));
        const isLeading = status.playerInterestInUser > maxAIInterest;
        
        return `
            <div class="dashboard-item ${isLeading ? 'leading' : 'chasing'}">
                <div class="item-player">${status.playerName}</div>
                <div class="item-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${status.playerInterestInUser}%; background: ${isLeading ? '#10b981' : '#3b82f6'};"></div>
                    </div>
                    <span class="progress-text">${status.playerInterestInUser}%</span>
                </div>
                <div class="item-status">
                    <span class="status-badge ${isLeading ? 'leading' : 'chasing'}">
                        ${isLeading ? '👑 领先' : '⚡ 追赶'}
                    </span>
                    <span class="days-left">${status.daysRemaining}天</span>
                </div>
            </div>
        `;
    }
    
    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CompetitiveRecruitmentInterface;
}
