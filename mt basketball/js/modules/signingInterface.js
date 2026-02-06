/**
 * 球员签约界面
 * 整合新的签约系统，提供更真实的签约体验
 */

class SigningInterface {
    constructor(gameStateManager, signingSystem) {
        this.gameStateManager = gameStateManager;
        this.signingSystem = signingSystem;
        this.currentPlayer = null;
        this.currentOffer = 0;
    }

    /**
     * 显示签约界面
     * @param {Object} player - 球员对象
     */
    showSigningModal(player) {
        this.currentPlayer = player;
        
        // 计算球员预期报价
        const offerInfo = this.signingSystem.calculateExpectedOffer(player);
        
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal signing-modal';
        modal.id = 'signing-modal';
        
        modal.innerHTML = `
            <div class="modal-content signing-content">
                <div class="modal-header">
                    <h2>📝 球员签约</h2>
                    <span class="close" onclick="window.signingInterface.closeModal()">&times;</span>
                </div>
                
                <div class="signing-body">
                    <!-- 球员信息区 -->
                    <div class="player-info-section">
                        <div class="player-avatar-large">
                            ${player.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div class="player-details">
                            <h3 class="player-name">${player.name}</h3>
                            <div class="player-tags">
                                <span class="tag position">${this.getPositionName(player.position)}</span>
                                <span class="tag year">${this.getYearName(player.year)}</span>
                                ${offerInfo.isSuperstar ? '<span class="tag superstar">⭐ 超级球星</span>' : ''}
                                <span class="tag rating" style="background: ${this.getRatingColor(offerInfo.rating)}20; color: ${this.getRatingColor(offerInfo.rating)};">
                                    能力 ${offerInfo.rating}
                                </span>
                                <span class="tag potential" style="background: ${this.getPotentialColor(offerInfo.potential)}20; color: ${this.getPotentialColor(offerInfo.potential)};">
                                    潜力 ${offerInfo.potential}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- 报价信息区 -->
                    <div class="offer-info-section">
                        <h4>📊 球员预期报价分析</h4>
                        
                        <div class="offer-analysis">
                            <div class="analysis-item">
                                <span class="analysis-label">基础报价</span>
                                <span class="analysis-value">$${offerInfo.baseOffer.toLocaleString()}</span>
                            </div>
                            <div class="analysis-item">
                                <span class="analysis-label">潜力加成</span>
                                <span class="analysis-value">${offerInfo.potentialLevel === 'elite' ? '50%' : offerInfo.potentialLevel === 'excellent' ? '30%' : offerInfo.potentialLevel === 'good' ? '10%' : '0%'}</span>
                            </div>
                            <div class="analysis-item">
                                <span class="analysis-label">年级加成</span>
                                <span class="analysis-value">${((offerInfo.yearMultipliers?.[offerInfo.year] || 1) * 100 - 100).toFixed(0)}%</span>
                            </div>
                            <div class="analysis-item highlight">
                                <span class="analysis-label">预期报价</span>
                                <span class="analysis-value expected">$${offerInfo.expectedOffer.toLocaleString()}</span>
                            </div>
                        </div>

                        <div class="offer-range">
                            <div class="range-item">
                                <span class="range-label">最低可接受</span>
                                <span class="range-value min">$${offerInfo.minAcceptable.toLocaleString()}</span>
                            </div>
                            <div class="range-item">
                                <span class="range-label">最高预期</span>
                                <span class="range-value max">$${offerInfo.maxExpected.toLocaleString()}</span>
                            </div>
                            <div class="range-item">
                                <span class="range-label">系统顶价</span>
                                <span class="range-value top">$${offerInfo.topOffer.toLocaleString()}</span>
                            </div>
                        </div>

                        ${offerInfo.isSuperstar ? `
                            <div class="superstar-warning">
                                <span class="warning-icon">⚠️</span>
                                <span class="warning-text">
                                    这是一位超级球星！需要报价达到预期的 ${(offerInfo.directSignThreshold * 100).toFixed(0)}% 才能直接签约，
                                    ${offerInfo.forceNegotiation ? '否则必须进入谈判流程。' : '否则将进入谈判流程。'}
                                </span>
                            </div>
                        ` : `
                            <div class="direct-sign-info">
                                <span class="info-icon">💡</span>
                                <span class="info-text">
                                    报价达到预期的 ${(offerInfo.directSignThreshold * 100).toFixed(0)}% 可直接签约，无需谈判
                                </span>
                            </div>
                        `}
                    </div>

                    <!-- 报价输入区 -->
                    <div class="offer-input-section">
                        <h4>💰 你的报价</h4>
                        
                        <div class="offer-input-container">
                            <div class="input-group">
                                <span class="currency">$</span>
                                <input type="number" 
                                       id="offer-amount" 
                                       class="offer-input" 
                                       placeholder="输入报价金额"
                                       min="${offerInfo.minAcceptable}"
                                       max="${offerInfo.topOffer}"
                                       value="${offerInfo.expectedOffer}"
                                       oninput="window.signingInterface.onOfferInput(this.value)">
                            </div>
                            
                            <div class="quick-offers">
                                <button class="quick-offer-btn" onclick="window.signingInterface.setOffer(${offerInfo.minAcceptable})">
                                    最低 $${offerInfo.minAcceptable.toLocaleString()}
                                </button>
                                <button class="quick-offer-btn" onclick="window.signingInterface.setOffer(${offerInfo.expectedOffer})">
                                    预期 $${offerInfo.expectedOffer.toLocaleString()}
                                </button>
                                <button class="quick-offer-btn highlight" onclick="window.signingInterface.setOffer(${Math.round(offerInfo.expectedOffer * offerInfo.directSignThreshold)})">
                                    直接签约 $${Math.round(offerInfo.expectedOffer * offerInfo.directSignThreshold).toLocaleString()}
                                </button>
                                <button class="quick-offer-btn max" onclick="window.signingInterface.setOffer(${offerInfo.topOffer})">
                                    顶价 $${offerInfo.topOffer.toLocaleString()}
                                </button>
                            </div>
                        </div>

                        <!-- 报价评估显示 -->
                        <div class="offer-evaluation" id="offer-evaluation">
                            ${this.renderOfferEvaluation(offerInfo.expectedOffer, offerInfo)}
                        </div>
                    </div>
                </div>

                <!-- 底部按钮 -->
                <div class="signing-footer">
                    <button class="btn-secondary" onclick="window.signingInterface.closeModal()">取消</button>
                    <button class="btn-primary" id="submit-offer-btn" onclick="window.signingInterface.submitOffer()">
                        提交报价
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // 初始化当前报价
        this.currentOffer = offerInfo.expectedOffer;
        
        // 绑定回车键
        const input = document.getElementById('offer-amount');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.submitOffer();
                }
            });
            input.focus();
            input.select();
        }
    }

    /**
     * 渲染报价评估
     */
    renderOfferEvaluation(offeredAmount, offerInfo) {
        const ratio = offeredAmount / offerInfo.expectedOffer;
        let evaluationClass = '';
        let evaluationText = '';
        let evaluationIcon = '';

        if (offeredAmount < offerInfo.minAcceptable) {
            evaluationClass = 'too-low';
            evaluationText = '报价过低，球员可能会直接拒绝';
            evaluationIcon = '❌';
        } else if (ratio >= offerInfo.directSignThreshold) {
            evaluationClass = 'direct-sign';
            evaluationText = offerInfo.isSuperstar 
                ? '报价极具诚意，超级球星可能会接受'
                : '报价远超预期，可直接完成签约！';
            evaluationIcon = '✅';
        } else if (ratio >= 1.2) {
            evaluationClass = 'good';
            evaluationText = '报价不错，有较大机会成功';
            evaluationIcon = '👍';
        } else if (ratio >= 1.0) {
            evaluationClass = 'fair';
            evaluationText = '报价合理，可能需要进一步谈判';
            evaluationIcon = '🤝';
        } else {
            evaluationClass = 'low';
            evaluationText = '报价偏低，进入谈判的可能性较大';
            evaluationIcon = '⚠️';
        }

        return `
            <div class="evaluation-result ${evaluationClass}">
                <span class="evaluation-icon">${evaluationIcon}</span>
                <div class="evaluation-content">
                    <div class="evaluation-text">${evaluationText}</div>
                    <div class="evaluation-ratio">报价为预期的 ${(ratio * 100).toFixed(1)}%</div>
                </div>
            </div>
        `;
    }

    /**
     * 报价输入处理
     */
    onOfferInput(value) {
        const amount = parseInt(value) || 0;
        this.currentOffer = amount;
        
        const offerInfo = this.signingSystem.calculateExpectedOffer(this.currentPlayer);
        const evaluationDiv = document.getElementById('offer-evaluation');
        
        if (evaluationDiv) {
            evaluationDiv.innerHTML = this.renderOfferEvaluation(amount, offerInfo);
        }

        // 更新提交按钮状态
        const submitBtn = document.getElementById('submit-offer-btn');
        if (submitBtn) {
            if (amount < offerInfo.minAcceptable) {
                submitBtn.disabled = true;
                submitBtn.textContent = '报价过低';
            } else if (amount > offerInfo.topOffer) {
                submitBtn.disabled = true;
                submitBtn.textContent = '超出顶价';
            } else {
                submitBtn.disabled = false;
                submitBtn.textContent = '提交报价';
            }
        }
    }

    /**
     * 设置报价金额
     */
    setOffer(amount) {
        const input = document.getElementById('offer-amount');
        if (input) {
            input.value = amount;
            this.onOfferInput(amount);
        }
    }

    /**
     * 提交报价
     */
    submitOffer() {
        const result = this.signingSystem.attemptDirectSigning(this.currentPlayer, this.currentOffer);
        
        if (result.success && result.method === 'direct_signing') {
            // 直接签约成功
            this.showDirectSigningSuccess(result);
        } else if (result.requiresNegotiation) {
            // 需要进入谈判
            this.closeModal();
            this.showNegotiationDialog(result);
        } else {
            // 被拒绝
            this.showRejectionDialog(result);
        }
    }

    /**
     * 显示直接签约成功
     */
    showDirectSigningSuccess(result) {
        const modal = document.getElementById('signing-modal');
        if (!modal) return;

        const content = modal.querySelector('.signing-content');
        content.innerHTML = `
            <div class="signing-success">
                <div class="success-icon">🎉</div>
                <h2>签约成功！</h2>
                <div class="success-message">
                    <p class="player-reaction">"${result.playerReaction}"</p>
                    <p class="signing-detail">
                        ${result.player.name} 已接受你的报价
                        <span class="offer-amount">$${result.offeredAmount.toLocaleString()}</span>
                    </p>
                </div>
                <div class="success-actions">
                    <button class="btn-primary" onclick="window.signingInterface.completeSigning('${result.player.id}')">
                        完成签约
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 显示谈判对话框
     */
    showNegotiationDialog(result) {
        const modal = document.createElement('div');
        modal.className = 'modal negotiation-modal';
        modal.id = 'negotiation-dialog-modal';
        
        modal.innerHTML = `
            <div class="modal-content negotiation-content">
                <div class="modal-header">
                    <h2>🤝 进入谈判</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="negotiation-body">
                    <div class="player-reaction">
                        <span class="reaction-icon">💬</span>
                        <p class="reaction-text">"${result.playerReaction}"</p>
                    </div>
                    <div class="negotiation-info">
                        <p>${result.message}</p>
                        <p class="negotiation-hint">
                            你的报价：$${result.offeredAmount.toLocaleString()}<br>
                            球员预期：$${result.offerInfo.expectedOffer.toLocaleString()}
                        </p>
                    </div>
                    <div class="negotiation-actions">
                        <button class="btn-primary" onclick="window.signingInterface.startNegotiation('${result.player.id}')">
                            开始谈判
                        </button>
                        <button class="btn-secondary" onclick="this.closest('.modal').remove()">
                            重新报价
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    /**
     * 显示拒绝对话框
     */
    showRejectionDialog(result) {
        const modal = document.getElementById('signing-modal');
        if (!modal) return;

        const content = modal.querySelector('.signing-content');
        content.innerHTML = `
            <div class="signing-rejected">
                <div class="rejected-icon">❌</div>
                <h2>报价被拒绝</h2>
                <div class="rejected-message">
                    <p class="player-reaction">"${result.playerReaction}"</p>
                    <p class="rejected-detail">${result.message}</p>
                </div>
                <div class="rejected-actions">
                    <button class="btn-primary" onclick="window.signingInterface.closeModal()">
                        关闭
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 开始谈判
     */
    startNegotiation(playerId) {
        // 移除谈判对话框
        const dialog = document.getElementById('negotiation-dialog-modal');
        if (dialog) dialog.remove();
        
        // 调用原有的谈判系统
        if (window.negotiationManager) {
            window.negotiationManager.startNegotiation(playerId);
        }
        
        // 显示球员详情（带谈判界面）
        if (window.recruitmentInterface) {
            const player = window.recruitmentInterface.players.find(p => p.id === playerId);
            if (player) {
                window.recruitmentInterface.showPlayerDetail(player, true);
            }
        }
    }

    /**
     * 完成签约
     */
    completeSigning(playerId) {
        // 这里应该调用球队管理系统的签约逻辑
        if (window.recruitmentInterface) {
            const player = window.recruitmentInterface.players.find(p => p.id === playerId);
            if (player) {
                // 将球员添加到球队
                this.addPlayerToTeam(player);
                
                // 从招募列表移除
                window.recruitmentInterface.removePlayerFromRecruitment(playerId);
                
                // 显示成功通知
                this.showNotification(`成功签约 ${player.name}！`, 'success');
            }
        }
        
        this.closeModal();
    }

    /**
     * 添加球员到球队
     */
    addPlayerToTeam(player) {
        // 获取当前球队
        const state = this.gameStateManager.getState();
        const userTeam = state.userTeam;
        
        if (userTeam) {
            if (!userTeam.players) userTeam.players = [];
            userTeam.players.push(player);
            
            // 更新游戏状态
            this.gameStateManager.set('userTeam', userTeam);
            this.gameStateManager.saveGameState();
        }
    }

    /**
     * 关闭模态框
     */
    closeModal() {
        const modal = document.getElementById('signing-modal');
        if (modal) {
            modal.remove();
        }
        this.currentPlayer = null;
        this.currentOffer = 0;
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    // 辅助方法
    getPositionName(position) {
        const positions = { PG: '控球后卫', SG: '得分后卫', SF: '小前锋', PF: '大前锋', C: '中锋' };
        return positions[position] || position;
    }

    getYearName(year) {
        const years = { 1: '大一', 2: '大二', 3: '大三', 4: '大四' };
        return years[year] || `大${year}`;
    }

    getRatingColor(rating) {
        if (rating >= 80) return '#ef4444';
        if (rating >= 70) return '#f59e0b';
        if (rating >= 60) return '#3b82f6';
        return '#6b7280';
    }

    getPotentialColor(potential) {
        if (potential >= 90) return '#ef4444';
        if (potential >= 80) return '#f59e0b';
        if (potential >= 70) return '#3b82f6';
        return '#6b7280';
    }
}

// 全局导出
if (typeof window !== 'undefined') {
    window.SigningInterface = SigningInterface;
}

// ES6 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SigningInterface;
}
