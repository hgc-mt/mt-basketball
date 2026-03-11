/**
 * 招募相关工具函数
 * 集中管理招募系统中的公共逻辑，避免代码重复
 */

const RecruitmentUtils = {
    /**
     * 通知SkipRuleManager球员被其他球队签走
     * 用于更新玩家正在谈判的球员状态
     * 
     * @param {string} playerId - 球员ID
     * @param {string} playerName - 球员名称
     * @param {Object} options - 可选参数
     * @param {string} options.source - 调用来源，用于日志记录
     * @param {Object} options.gameStateManager - 游戏状态管理器实例
     * @returns {Object} 处理结果
     */
    notifySkipRuleManagerOfSignedPlayer(playerId, playerName, options = {}) {
        const { source = 'unknown', gameStateManager = null } = options;
        const logPrefix = `[${source}]`;
        
        // 尝试通过多种方式访问skipRuleManager
        let skipRuleManager = null;
        
        // 方式1：通过window.app访问
        if (window.app?.skipRuleManager) {
            skipRuleManager = window.app.skipRuleManager;
        }
        // 方式2：通过gameStateManager访问
        else if (gameStateManager?.skipRuleManager) {
            skipRuleManager = gameStateManager.skipRuleManager;
        }
        // 方式3：通过全局变量访问
        else if (window.skipRuleManager) {
            skipRuleManager = window.skipRuleManager;
        }
        
        if (skipRuleManager && typeof skipRuleManager.checkPlayerSignedByOther === 'function') {
            const result = skipRuleManager.checkPlayerSignedByOther(playerId, playerName);
            console.log(`${logPrefix} 已通知SkipRuleManager: 球员 ${playerName} 被签走`, result);
            return { success: true, method: 'skipRuleManager', result };
        } else {
            // 如果找不到skipRuleManager，直接在游戏状态中更新谈判状态
            console.log(`${logPrefix} SkipRuleManager不可用，直接更新游戏状态`);
            return this.updateNegotiationStatusDirectly(playerId, playerName, { source, gameStateManager });
        }
    },

    /**
     * 直接更新谈判状态（备用方案）
     * 当SkipRuleManager不可用时使用
     * 
     * @param {string} playerId - 球员ID
     * @param {string} playerName - 球员名称
     * @param {Object} options - 可选参数
     * @param {string} options.source - 调用来源，用于日志记录
     * @param {Object} options.gameStateManager - 游戏状态管理器实例
     * @returns {Object} 处理结果
     */
    updateNegotiationStatusDirectly(playerId, playerName, options = {}) {
        const { source = 'unknown', gameStateManager = null } = options;
        const logPrefix = `[${source}]`;
        const results = {
            gameStateUpdated: false,
            enhancedNegotiationManagerUpdated: false
        };

        // 获取游戏状态
        let state = null;
        if (gameStateManager) {
            state = gameStateManager.getState();
        } else if (window.GameState) {
            state = window.GameState;
        } else if (window.app?.gameStateManager) {
            state = window.app.gameStateManager.getState();
        }

        // 更新playerNegotiations
        if (state?.negotiations?.playerNegotiations) {
            const playerNegotiations = state.negotiations.playerNegotiations;
            const negotiationIndex = playerNegotiations.findIndex(n => n.targetId === playerId);

            if (negotiationIndex !== -1 && playerNegotiations[negotiationIndex]) {
                playerNegotiations[negotiationIndex].status = 'expired';
                playerNegotiations[negotiationIndex].expiredReason = '被其他球队签走';
                playerNegotiations[negotiationIndex].expiredAt = new Date().toISOString();
                console.log(`${logPrefix} 已直接更新谈判状态: ${playerName} 被标记为过期`);
                results.gameStateUpdated = true;
            }
        }

        // 同时更新enhancedNegotiationManager中的状态（如果存在）
        if (window.app?.enhancedNegotiationManager) {
            const enm = window.app.enhancedNegotiationManager;
            const playerNeg = enm.playerNegotiations?.findIndex(n => n.targetId === playerId);
            if (playerNeg !== -1 && enm.playerNegotiations[playerNeg]) {
                enm.playerNegotiations[playerNeg].status = 'expired';
                enm.playerNegotiations[playerNeg].expiredReason = '被其他球队签走';
                enm.playerNegotiations[playerNeg].expiredAt = new Date().toISOString();
                if (typeof enm.saveNegotiationState === 'function') {
                    enm.saveNegotiationState();
                }
                console.log(`${logPrefix} 已更新enhancedNegotiationManager状态: ${playerName}`);
                results.enhancedNegotiationManagerUpdated = true;
            }
        }

        return { success: true, method: 'direct', results };
    },

    /**
     * 批量通知多个球员被签走
     * 用于市场批量更新场景
     * 
     * @param {Array} players - 球员数组，每个元素包含id和name
     * @param {Object} options - 可选参数
     * @returns {Object} 批量处理结果
     */
    batchNotifySignedPlayers(players, options = {}) {
        if (!Array.isArray(players) || players.length === 0) {
            return { success: true, processed: 0, results: [] };
        }

        const results = [];
        players.forEach(player => {
            if (player.id && player.name) {
                const result = this.notifySkipRuleManagerOfSignedPlayer(
                    player.id, 
                    player.name, 
                    options
                );
                results.push({ playerId: player.id, playerName: player.name, ...result });
            }
        });

        return {
            success: true,
            processed: results.length,
            results
        };
    }
};

// 兼容CommonJS和浏览器环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecruitmentUtils;
} else if (typeof window !== 'undefined') {
    window.RecruitmentUtils = RecruitmentUtils;
}
