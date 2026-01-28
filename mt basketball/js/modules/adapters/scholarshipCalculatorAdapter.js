/**
 * Scholarship Calculator Adapter
 * 奖学金计算接口适配器
 */

class ScholarshipCalculatorAdapter {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
        this.interfaceName = 'IScholarshipCalculator';
        this.version = '1.0.0';
    }

    /**
     * 计算已使用的奖学金份额
     * @param {Object} team - Team对象
     * @returns {Object} 计算结果
     */
    calculateUsedShare(team) {
        if (!team) {
            return {
                success: false,
                error: 'TEAM_NOT_FOUND',
                message: '球队对象不能为空'
            };
        }

        try {
            let usedShare = 0;
            
            if (typeof team.calculateUsedScholarshipShare === 'function') {
                // 使用Team类的方法
                usedShare = team.calculateUsedScholarshipShare();
            } else if (team.roster && Array.isArray(team.roster)) {
                // 手动计算
                usedShare = team.roster.reduce((total, player) => {
                    return total + (player.scholarship || 1.0);
                }, 0);
            } else {
                // 旧数据结构，使用人数
                usedShare = team.roster ? team.roster.length : 0;
            }

            return {
                success: true,
                share: usedShare,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: 'CALCULATION_ERROR',
                message: `计算失败: ${error.message}`
            };
        }
    }

    /**
     * 计算可用的奖学金份额
     * @param {Object} team - Team对象
     * @returns {Object} 计算结果
     */
    calculateAvailableShare(team) {
        if (!team) {
            return {
                success: false,
                error: 'TEAM_NOT_FOUND',
                message: '球队对象不能为空'
            };
        }

        try {
            let totalScholarships = 13; // 默认值
            let usedShare = 0;

            // 获取总奖学金份额
            if (typeof team.scholarships === 'number') {
                totalScholarships = team.scholarships;
            } else if (team.scholarships && typeof team.scholarships === 'object') {
                totalScholarships = team.scholarships.total || 13;
            }

            // 获取已使用份额
            const usedResult = this.calculateUsedShare(team);
            if (usedResult.success) {
                usedShare = usedResult.share;
            }

            const availableShare = totalScholarships - usedShare;

            return {
                success: true,
                share: Math.max(0, availableShare),
                total: totalScholarships,
                used: usedShare,
                percentage: totalScholarships > 0 ? (usedShare / totalScholarships) : 0,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: 'CALCULATION_ERROR',
                message: `计算失败: ${error.message}`
            };
        }
    }

    /**
     * 验证奖学金可用性
     * @param {Object} player - Player对象
     * @param {Object} team - Team对象
     * @returns {Object} 验证结果
     */
    validateScholarshipAvailability(player, team) {
        if (!player) {
            return {
                success: false,
                error: 'PLAYER_NOT_FOUND',
                message: '球员对象不能为空'
            };
        }

        if (!team) {
            return {
                success: false,
                error: 'TEAM_NOT_FOUND',
                message: '球队对象不能为空'
            };
        }

        try {
            const availableResult = this.calculateAvailableShare(team);
            if (!availableResult.success) {
                return availableResult;
            }

            const playerShare = player.scholarship || 1.0;
            const wouldBeUsed = availableResult.used + playerShare;
            const availableAfter = availableResult.total - wouldBeUsed;

            const canSign = wouldBeUsed <= availableResult.total;

            return {
                success: true,
                canSign: canSign,
                currentUsed: availableResult.used,
                playerShare: playerShare,
                wouldBeUsed: wouldBeUsed,
                totalAvailable: availableResult.total,
                availableAfter: Math.max(0, availableAfter),
                reason: canSign 
                    ? '可以签约' 
                    : `奖学金份额不足 (需要 ${playerShare.toFixed(2)}，可用 ${availableResult.share.toFixed(2)})`,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: 'VALIDATION_ERROR',
                message: `验证失败: ${error.message}`
            };
        }
    }

    /**
     * 获取接口名称
     * @returns {string} 接口名称
     */
    getName() {
        return this.interfaceName;
    }

    /**
     * 获取接口版本
     * @returns {string} 接口版本
     */
    getVersion() {
        return this.version;
    }

    /**
     * 验证接口实现
     * @returns {boolean} 是否有效
     */
    validate() {
        const requiredMethods = [
            'calculateUsedShare',
            'calculateAvailableShare',
            'validateScholarshipAvailability'
        ];

        for (const method of requiredMethods) {
            if (typeof this[method] !== 'function') {
                console.error(`接口缺少必需方法: ${method}`);
                return false;
            }
        }

        return true;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScholarshipCalculatorAdapter;
}