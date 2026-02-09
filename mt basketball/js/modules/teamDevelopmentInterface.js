/**
 * 球队发展界面
 * 管理训练设施、查看发展报告、赛季成长预览
 */

class TeamDevelopmentInterface {
    constructor(gameStateManager, developmentSystem) {
        this.gameStateManager = gameStateManager;
        this.developmentSystem = developmentSystem;
    }

    /**
     * 显示球队发展中心界面
     */
    showDevelopmentCenter() {
        const state = this.gameStateManager.getState();
        const report = this.developmentSystem.getDevelopmentReport();

        const modal = document.createElement('div');
        modal.className = 'modal development-modal';
        modal.id = 'development-center-modal';

        modal.innerHTML = `
            <div class="modal-content development-content">
                <div class="modal-header">
                    <h2>🏗️ 球队发展中心</h2>
                    <span class="close" onclick="window.teamDevelopmentInterface.closeModal()">&times;</span>
                </div>
                
                <div class="development-body">
                    <!-- 概览面板 -->
                    <div class="development-overview">
                        <div class="overview-card">
                            <h3>💰 年度维护费用</h3>
                            <div class="overview-value">$${report.facilities.maintenanceCost.toLocaleString()}</div>
                            <div class="overview-desc">下赛季将自动扣除</div>
                        </div>
                        <div class="overview-card">
                            <h3>📈 训练加成</h3>
                            <div class="overview-value">+${report.facilities.totalBonus}%</div>
                            <div class="overview-desc">球员成长速度加成</div>
                        </div>
                        <div class="overview-card">
                            <h3>👨‍🏫 教练加成</h3>
                            <div class="overview-value">+${report.coaching.developmentBonus}%</div>
                            <div class="overview-desc">${report.coaching.headCoach ? report.coaching.headCoach.name : '暂无教练'}</div>
                        </div>
                    </div>
                    
                    <!-- 设施管理 -->
                    <div class="facilities-section">
                        <h3>🎯 训练设施</h3>
                        <div class="facilities-grid">
                            ${this.createFacilitiesGrid()}
                        </div>
                    </div>
                    
                    <!-- 升级建议 -->
                    ${report.upgradeSuggestions.length > 0 ? `
                    <div class="upgrade-suggestions">
                        <h3>💡 升级建议</h3>
                        <div class="suggestions-list">
                            ${this.createUpgradeSuggestions(report.upgradeSuggestions.slice(0, 3))}
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- 球员发展预览 -->
                    <div class="player-growth-preview">
                        <h3>👥 球员发展预览</h3>
                        <div class="preview-list">
                            ${this.createPlayerGrowthPreview()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        // 绑定设施升级事件
        this.bindFacilityEvents(modal);
    }

    /**
     * 创建设施网格
     */
    createFacilitiesGrid() {
        const facilities = this.developmentSystem.facilities;
        const currentFacilities = this.developmentSystem.initializeFacilities();

        return Object.entries(facilities).map(([type, config]) => {
            const levelInfo = this.developmentSystem.getFacilityLevel(type);
            const current = levelInfo.current;
            const next = levelInfo.next;

            return `
                <div class="facility-card" data-facility="${type}">
                    <div class="facility-header">
                        <div class="facility-icon">${this.getFacilityIcon(type)}</div>
                        <div class="facility-info">
                            <h4>${config.name}</h4>
                            <span class="facility-level">${current.name}</span>
                        </div>
                    </div>
                    <div class="facility-desc">${config.description}</div>
                    <div class="facility-stats">
                        <div class="stat">
                            <span class="stat-label">加成</span>
                            <span class="stat-value">+${current.bonus || current.injuryReduction || 0}%</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">维护费</span>
                            <span class="stat-value">$${current.maintenance.toLocaleString()}/年</span>
                        </div>
                    </div>
                    ${next ? `
                    <div class="upgrade-section">
                        <div class="upgrade-info">
                            <span class="next-level">下一级: ${next.name}</span>
                            <span class="upgrade-bonus">+${next.bonus - (current.bonus || current.injuryReduction || 0)}%</span>
                        </div>
                        <button class="upgrade-btn" data-facility="${type}" data-cost="${next.cost}">
                            升级 ($${next.cost.toLocaleString()})
                        </button>
                    </div>
                    ` : '<div class="max-level">已达到最高等级</div>'}
                </div>
            `;
        }).join('');
    }

    /**
     * 获取设施图标
     */
    getFacilityIcon(type) {
        const icons = {
            trainingCenter: '🏢',
            weightRoom: '💪',
            shootingLab: '🎯',
            filmRoom: '🎬',
            medicalCenter: '🏥'
        };
        return icons[type] || '🏗️';
    }

    /**
     * 创建升级建议
     */
    createUpgradeSuggestions(suggestions) {
        return suggestions.map(s => `
            <div class="suggestion-card priority-${s.priority > 10 ? 'high' : 'medium'}">
                <div class="suggestion-icon">${this.getFacilityIcon(s.facility)}</div>
                <div class="suggestion-info">
                    <h4>${s.name}</h4>
                    <p>${s.currentLevel} → ${s.nextLevel}</p>
                    <div class="suggestion-benefit">
                        <span>+${s.benefit}% 加成</span>
                        <span class="cost">$${s.cost.toLocaleString()}</span>
                    </div>
                </div>
                <button class="suggestion-btn" data-facility="${s.facility}">升级</button>
            </div>
        `).join('');
    }

    /**
     * 创建球员发展预览
     */
    createPlayerGrowthPreview() {
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;

        if (!userTeam || !userTeam.roster || userTeam.roster.length === 0) {
            return '<div class="no-players">暂无球员</div>';
        }

        return userTeam.roster.slice(0, 5).map(player => {
            const mockStats = {
                averageMinutes: 25,
                performanceRating: 'average'
            };
            const growthData = this.developmentSystem.calculatePlayerGrowth(player, mockStats);

            return `
                <div class="player-preview-card">
                    <div class="player-info">
                        <div class="player-avatar">${player.name.charAt(0)}</div>
                        <div class="player-details">
                            <h4>${player.name}</h4>
                            <span class="player-meta">${this.getYearText(player.year)} · 潜力 ${player.potential}</span>
                        </div>
                    </div>
                    <div class="growth-preview">
                        <div class="growth-bar">
                            <div class="growth-fill" style="width: ${Math.min(100, growthData.totalGrowth * 5)}%"></div>
                        </div>
                        <span class="growth-value">预计 +${growthData.totalGrowth.toFixed(1)}</span>
                    </div>
                    <div class="growth-factors">
                        <span title="设施加成">🏢 ${(growthData.factors.facilityBonus * 100).toFixed(0)}%</span>
                        <span title="教练加成">👨‍🏫 ${(growthData.factors.coachBonus * 100).toFixed(0)}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 绑定设施事件
     */
    bindFacilityEvents(modal) {
        // 升级按钮
        modal.querySelectorAll('.upgrade-btn, .suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const facilityType = btn.dataset.facility;
                this.upgradeFacility(facilityType);
            });
        });
    }

    /**
     * 升级设施
     */
    upgradeFacility(facilityType) {
        const result = this.developmentSystem.upgradeFacility(facilityType);

        if (result.success) {
            showNotification(result.message, 'success');
            this.refreshDevelopmentCenter();
        } else {
            showNotification(result.message, 'error');
        }
    }

    /**
     * 刷新发展中心
     */
    refreshDevelopmentCenter() {
        this.closeModal();
        this.showDevelopmentCenter();
    }

    /**
     * 显示赛季成长报告
     */
    showSeasonGrowthReport(growthResults) {
        const modal = document.createElement('div');
        modal.className = 'modal growth-report-modal';
        modal.id = 'growth-report-modal';

        modal.innerHTML = `
            <div class="modal-content growth-report-content">
                <div class="modal-header">
                    <h2>📊 赛季成长报告</h2>
                    <span class="close" onclick="window.teamDevelopmentInterface.closeModal()">&times;</span>
                </div>
                
                <div class="growth-report-body">
                    <div class="report-summary">
                        <div class="summary-item">
                            <span class="summary-label">总成长值</span>
                            <span class="summary-value">+${growthResults.summary.totalGrowth.toFixed(1)}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">平均成长</span>
                            <span class="summary-value">+${growthResults.summary.averageGrowth.toFixed(1)}/人</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">维护费用</span>
                            <span class="summary-value cost">-$${growthResults.maintenanceCost.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div class="player-growth-list">
                        <h3>球员详细成长</h3>
                        ${growthResults.playerGrowths.map(pg => this.createPlayerGrowthDetail(pg)).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    /**
     * 创建球员成长详情
     */
    createPlayerGrowthDetail(playerGrowth) {
        const player = playerGrowth.player;
        const topGrowths = Object.entries(playerGrowth.growth)
            .filter(([_, val]) => val > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        return `
            <div class="player-growth-detail">
                <div class="player-header">
                    <div class="player-avatar">${player.name.charAt(0)}</div>
                    <div class="player-info">
                        <h4>${player.name}</h4>
                        <span class="player-year">${this.getYearText(playerGrowth.newYear)}</span>
                    </div>
                    <div class="total-growth">+${playerGrowth.totalGrowth.toFixed(1)}</div>
                </div>
                <div class="growth-breakdown">
                    ${topGrowths.map(([attr, val]) => `
                        <div class="growth-item">
                            <span class="attr-name">${this.getAttributeName(attr)}</span>
                            <span class="attr-growth">+${val.toFixed(1)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 获取属性中文名
     */
    getAttributeName(attr) {
        const names = {
            strength: '力量', speed: '速度', stamina: '耐力', vertical: '弹跳', rebounding: '篮板',
            shooting: '投篮', threePoint: '三分', midRange: '中投', freeThrow: '罚球',
            layup: '上篮', post: '背身', dribbling: '运球', passing: '传球',
            perimeterD: '外防', interiorD: '内防', stealing: '抢断', blocking: '盖帽',
            basketballIQ: '球商', vision: '视野', clutch: '关键球'
        };
        return names[attr] || attr;
    }

    /**
     * 获取年级文本
     */
    getYearText(year) {
        const years = { 1: '大一', 2: '大二', 3: '大三', 4: '大四' };
        return years[year] || `大${year}`;
    }

    /**
     * 关闭模态框
     */
    closeModal() {
        const modal = document.getElementById('development-center-modal') || 
                     document.getElementById('growth-report-modal');
        if (modal) {
            modal.remove();
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeamDevelopmentInterface;
}
