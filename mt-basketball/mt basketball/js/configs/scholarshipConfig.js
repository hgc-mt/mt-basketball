/**
 * 奖学金分配配置
 * 
 * 学校提供5份全额奖学金名额，用于招募13-15名球员
 * 分配方案体现奖学金等级差异，确保资源优化配置
 */

const ScholarshipConfig = {
    // 学校奖学金名额配置
    school: {
        totalFullScholarships: 5,      // 5份全额奖学金
        rosterMinSize: 13,             // 最少招募人数
        rosterMaxSize: 15,             // 最多招募人数
        scholarshipTypes: ['full', 'half', 'quarter', 'minimal']
    },
    
    // 奖学金等级定义
    levels: {
        // A级：全额奖学金（100%）
        full: {
            name: '全额奖学金',
            nameEn: 'Full Scholarship',
            percentage: 1.0,
            description: '免除全部学费和生活费',
            color: '#ef4444',
            icon: '👑',
            minRating: 85,
            minPotential: 90,
            priority: 1
        },
        // B级：半额奖学金（50%）
        half: {
            name: '半额奖学金',
            nameEn: 'Half Scholarship',
            percentage: 0.5,
            description: '免除50%学费',
            color: '#f59e0b',
            icon: '⭐',
            minRating: 75,
            minPotential: 80,
            priority: 2
        },
        // C级：四分之一奖学金（25%）
        quarter: {
            name: '四分之一奖学金',
            nameEn: 'Quarter Scholarship',
            percentage: 0.25,
            description: '免除25%学费',
            color: '#3b82f6',
            icon: '💎',
            minRating: 65,
            minPotential: 70,
            priority: 3
        },
        // D级：最低奖学金（10%）
        minimal: {
            name: '最低奖学金',
            nameEn: 'Minimal Scholarship',
            percentage: 0.1,
            description: '免除10%学费',
            color: '#6b7280',
            icon: '📋',
            minRating: 55,
            minPotential: 60,
            priority: 4
        }
    },
    
    // 推荐的分配方案（5份全额奖学金分配给13-15人）
    distributionPlans: {
        // 方案1：13人标准配置
        plan13: {
            name: '标准配置（13人）',
            description: '平衡竞争力与阵容深度',
            roster: 13,
            allocation: [
                { level: 'full', count: 3, totalPercentage: 3.0 },
                { level: 'half', count: 4, totalPercentage: 2.0 },
                { level: 'quarter', count: 4, totalPercentage: 1.0 },
                { level: 'minimal', count: 2, totalPercentage: 0.2 }
            ],
            summary: '3份全额 + 4份半额 + 4份四分之一 + 2份最低 = 5份全额等效',
            totalUsed: 5.0
        },
        // 方案2：14人配置
        plan14: {
            name: '扩展配置（14人）',
            description: '增加阵容深度',
            roster: 14,
            allocation: [
                { level: 'full', count: 3, totalPercentage: 3.0 },
                { level: 'half', count: 4, totalPercentage: 2.0 },
                { level: 'quarter', count: 5, totalPercentage: 1.25 },
                { level: 'minimal', count: 2, totalPercentage: 0.2 }
            ],
            summary: '3份全额 + 4份半额 + 5份四分之一 + 2份最低 = 5份全额等效',
            totalUsed: 5.0
        },
        // 方案3：15人满员配置
        plan15: {
            name: '满员配置（15人）',
            description: '最大化阵容规模',
            roster: 15,
            allocation: [
                { level: 'full', count: 3, totalPercentage: 3.0 },
                { level: 'half', count: 4, totalPercentage: 2.0 },
                { level: 'quarter', count: 6, totalPercentage: 1.5 },
                { level: 'minimal', count: 2, totalPercentage: 0.2 }
            ],
            summary: '3份全额 + 4份半额 + 6份四分之一 + 2份最低 = 5份全额等效',
            totalUsed: 5.0
        },
        // 方案4：精英配置（11人）
       精英: {
            name: '精英配置（11人）',
            description: '追求顶级球员，数量较少',
            roster: 11,
            allocation: [
                { level: 'full', count: 5, totalPercentage: 5.0 },
                { level: 'half', count: 4, totalPercentage: 2.0 },
                { level: 'quarter', count: 2, totalPercentage: 0.5 }
            ],
            summary: '5份全额 + 4份半额 + 2份四分之一 = 5份全额等效',
            totalUsed: 5.0
        }
    },
    
    // 分配原则
    principles: [
        {
            id: 'talent_first',
            name: '天赋优先',
            description: '潜力90+的球员应获得全额奖学金以确保签约'
        },
        {
            id: 'position_balance',
            name: '位置平衡',
            description: '确保每个位置都有足够的球员和奖学金覆盖'
        },
        {
            id: 'year_distribution',
            name: '年级分布',
            description: '大一新生需要更高比例的奖学金以吸引入学'
        },
        {
            id: 'flexibility',
            name: '灵活调整',
            description: '根据谈判情况灵活调整奖学金分配比例'
        }
    ],
    
    // 球员评级与奖学金推荐
    getRecommendedScholarship(player) {
        const potential = player.potential;
        const rating = player.rating || player.getOverallRating?.() || 60;
        
        // 天之骄子 - 必须是全额
        if (potential >= 90) {
            return 'full';
        }
        
        // 优秀球员 - 优先考虑半额到全额
        if (potential >= 80) {
            // 根据谈判难度调整
            return rating >= 80 ? 'full' : 'half';
        }
        
        // 良好球员 - 半额或四分之一
        if (potential >= 70) {
            return 'half';
        }
        
        // 普通球员 - 四分之一或更低
        if (potential >= 60) {
            return 'quarter';
        }
        
        // 发展型球员 - 最低奖学金
        return 'minimal';
    },
    
    // 计算分配方案
    calculateDistribution(planName = 'plan13') {
        const plan = this.distributionPlans[planName];
        if (!plan) return null;
        
        const allocation = [];
        let playerIndex = 0;
        
        for (const level of plan.allocation) {
            const levelConfig = this.levels[level.level];
            for (let i = 0; i < level.count; i++) {
                allocation.push({
                    level: level.level,
                    levelName: levelConfig.name,
                    percentage: levelConfig.percentage,
                    playerSlot: playerIndex + 1,
                    totalPercentage: level.totalPercentage
                });
                playerIndex++;
            }
        }
        
        return {
            ...plan,
            allocation: allocation
        };
    },
    
    // 获取所有方案
    getAllPlans() {
        return Object.entries(this.distributionPlans).map(([key, plan]) => ({
            id: key,
            ...plan
        }));
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScholarshipConfig;
}
