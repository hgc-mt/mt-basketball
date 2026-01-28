/**
 * Core data models for the Basketball Manager game
 * Contains Player, Coach, Team classes and related data structures
 */

// import { Positions, PlayerAttributes, Skills, PlayerTalents } from '../data/gameData.js';

/**
 * Player class representing a basketball player
 */
// Player class representing a basketball player
class Player {
    /**
     * Create a new Player instance
     * @param {Object} data - Player data
     * @param {number} data.id - Unique player ID
     * @param {string} data.name - Player name
     * @param {string} data.position - Player position (PG, SG, SF, PF, C)
     * @param {number} data.age - Player age
     * @param {number} data.year - Academic year (1-4)
     * @param {Object} data.attributes - Player attributes
     * @param {number} data.potential - Player potential rating (1-100)
     * @param {Array} data.talents - Player talents
     * @param {Array} data.skills - Player skills
     * @param {Object} data.training - Training progress data
     * @param {string} data.status - Player status (free_agent, transfer_wanted, rostered)
     * @param {Object} data.contract - Contract information
     * @param {boolean} data.transferIntention - Whether player wants to transfer
     * @param {string} data.formerTeam - Previous team name (for transfer players)
     */
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.position = data.position;
        this.age = data.age;
        this.year = data.year;
        this.attributes = { ...data.attributes };
        this.potential = data.potential;
        this.rating = data.rating || null;
        this.talents = [...(data.talents || [])];
        this.skills = [...(data.skills || [])];
        this.background = { ...data.background } || {};
        this.training = { ...data.training };
        
        // Player status: free_agent, transfer_wanted, rostered
        this.status = data.status || 'free_agent';
        
        // Contract information
        this.contract = data.contract || {
            type: 'none',
            salary: 0,
            remainingYears: 0,
            team: null
        };
        
        // Transfer intention
        this.transferIntention = data.transferIntention || false;
        this.formerTeam = data.formerTeam || null;
        
        // Technical characteristics
        this.technicalInfo = data.technicalInfo || {
            strongFoot: '右手',
            playStyle: '攻守平衡',
            bestSkill: '投篮',
            weakness: '防守'
        };
        
        // Scholarship requirement
        this.scholarshipRequirement = data.scholarshipRequirement || {
            min: 0.5,
            max: 1.0,
            preferred: 0.7,
            flexible: true
        };
        
        this.learningSkills = [];
        this.stats = {
            games: 0,
            points: 0,
            rebounds: 0,
            assists: 0,
            steals: 0,
            blocks: 0,
            fouls: 0,
            turnovers: 0,
            minutes: 0
        };
        this.seasonStats = { ...this.stats };
        this.gameStats = {};
    }

    /**
     * Get player's overall rating
     * @returns {number} Overall rating (1-100)
     */
    getOverallRating() {
        const positionWeights = this.getPositionWeights();
        let weightedSum = 0;
        let totalWeight = 0;

        for (const [attr, weight] of Object.entries(positionWeights)) {
            weightedSum += this.attributes[attr] * weight;
            totalWeight += weight;
        }

        const baseRating = Math.round(weightedSum / totalWeight);

        // Add talent bonus
        const talentBonus = this.getTalentBonus();

        // Add year bonus (upperclassmen get bonus)
        const yearBonus = (4 - this.year) * 2;

        return Math.min(99, Math.max(1, baseRating + talentBonus + yearBonus));
    }

    /**
     * Get position-specific attribute weights
     * @returns {Object} Attribute weights for the player's position
     */
    getPositionWeights() {
        const weights = {
            PG: { scoring: 3, shooting: 3, threePoint: 4, freeThrow: 3, passing: 5, dribbling: 5, defense: 3, rebounding: 2, stealing: 4, blocking: 1, speed: 4, stamina: 3, strength: 2, basketballIQ: 4 },
            SG: { scoring: 5, shooting: 5, threePoint: 5, freeThrow: 4, passing: 2, dribbling: 4, defense: 3, rebounding: 2, stealing: 3, blocking: 1, speed: 4, stamina: 3, strength: 2, basketballIQ: 3 },
            SF: { scoring: 4, shooting: 4, threePoint: 3, freeThrow: 3, passing: 3, dribbling: 4, defense: 4, rebounding: 3, stealing: 3, blocking: 2, speed: 4, stamina: 3, strength: 3, basketballIQ: 3 },
            PF: { scoring: 4, shooting: 3, threePoint: 2, freeThrow: 2, passing: 2, dribbling: 3, defense: 4, rebounding: 5, stealing: 2, blocking: 4, speed: 2, stamina: 4, strength: 5, basketballIQ: 3 },
            C: { scoring: 4, shooting: 2, threePoint: 1, freeThrow: 2, passing: 2, dribbling: 2, defense: 5, rebounding: 5, stealing: 1, blocking: 5, speed: 1, stamina: 4, strength: 5, basketballIQ: 3 }
        };

        return weights[this.position] || weights.SF;
    }

    /**
     * Get talent bonus to overall rating
     * @returns {number} Talent bonus
     */
    getTalentBonus() {
        let bonus = 0;
        this.talents.forEach(talentId => {
            const talent = PlayerTalents[talentId];
            if (talent && talent.overallBonus) {
                bonus += talent.overallBonus;
            }
        });
        return bonus;
    }

    /**
     * Get scout rating for recruitment purposes
     * @returns {number} Scout rating (1-100)
     */
    getScoutRating() {
        const rating = this.getOverallRating();
        const potentialBonus = (this.potential - rating) * 0.3;
        return Math.round(rating + potentialBonus);
    }

    /**
     * Get player status label in Chinese
     * @returns {string} Status label
     */
    getStatusLabel() {
        const statusLabels = {
            'free_agent': '自由球员',
            'transfer_wanted': '转学生',
            'freshman_recruit': '新生招募',
            'rostered': '已签约'
        };
        return statusLabels[this.status] || '未知';
    }

    /**
     * Get contract type label in Chinese
     * @returns {string} Contract type label
     */
    getContractLabel() {
        const contractLabels = {
            'none': '无合同',
            'scholarship': '奖学金合同',
            'full': '正式合同',
            'rookie': '新秀合同'
        };
        return contractLabels[this.contract.type] || '未知';
    }

    /**
     * Check if player is available for recruitment
     * @returns {boolean} Whether player can be recruited
     */
    isAvailable() {
        return this.status === 'free_agent' || 
               (this.status === 'transfer_wanted' && this.transferIntention);
    }

    /**
     * Get player summary for display
     * @returns {Object} Summary object
     */
    getSummary() {
        return {
            id: this.id,
            name: this.name,
            position: this.position,
            year: this.year,
            age: this.age,
            rating: this.rating || this.getOverallRating(),
            potential: this.potential,
            status: this.status,
            statusLabel: this.getStatusLabel(),
            contractType: this.getContractLabel(),
            contractSalary: this.contract.salary,
            transferIntention: this.transferIntention,
            formerTeam: this.formerTeam,
            technicalInfo: this.technicalInfo,
            scoutRating: this.getScoutRating()
        };
    }

    /**
     * Improve player attributes through training
     * @param {string} attributeType - Type of attribute to improve
     * @param {number} intensity - Training intensity (0.5-2.0)
     * @returns {number} Amount of improvement
     */
    improveAttribute(attributeType, intensity = 1.0) {
        if (!this.attributes[attributeType]) return 0;

        const currentValue = this.attributes[attributeType];
        const potentialCap = this.potential;

        if (currentValue >= potentialCap) return 0;

        const baseImprovement = Math.random() * 3 * intensity + 1;
        const talentBonus = this.getTalentBonus(attributeType);
        const adjustedImprovement = Math.floor(baseImprovement * (1 + talentBonus));

        const growthStage = this.calculateGrowthStage(attributeType);
        const finalImprovement = this.calculateGrowthModifier(adjustedImprovement, growthStage);

        const actualImprovement = Math.min(finalImprovement, potentialCap - currentValue);
        this.attributes[attributeType] += actualImprovement;

        return actualImprovement;
    }

    /**
     * Calculate growth stage for an attribute
     * @param {string} attributeType - Type of attribute
     * @returns {string} Growth stage (early, peak, late)
     */
    calculateGrowthStage(attributeType) {
        const currentValue = this.attributes[attributeType];
        const potential = this.potential;
        const ratio = currentValue / potential;

        if (ratio < 0.7) return 'early';
        if (ratio < 0.9) return 'peak';
        return 'late';
    }

    /**
     * Calculate growth modifier based on stage
     * @param {number} baseImprovement - Base improvement amount
     * @param {string} growthStage - Growth stage
     * @returns {number} Modified improvement
     */
    calculateGrowthModifier(baseImprovement, growthStage) {
        const modifiers = {
            'early': 1.5,
            'peak': 1.0,
            'late': 0.5
        };

        return Math.round(baseImprovement * (modifiers[growthStage] || 1.0));
    }

    /**
     * Get talent bonus for specific attribute
     * @param {string} attributeType - Type of attribute
     * @returns {number} Talent bonus multiplier
     */
    getTalentBonus(attributeType) {
        let bonus = 0;
        this.talents.forEach(talentId => {
            const talent = PlayerTalents[talentId];
            if (talent && talent.attributeBonuses && talent.attributeBonuses[attributeType]) {
                bonus += talent.attributeBonuses[attributeType];
            }
        });
        return bonus * 0.1; // Convert to multiplier
    }

    /**
     * Start learning a new skill
     * @param {string} skillId - ID of skill to learn
     * @returns {boolean} Whether learning started successfully
     */
    startLearningSkill(skillId) {
        if (this.learningSkills.find(s => s.id === skillId)) return false;

        const skill = Skills[skillId];
        if (!skill) return false;

        // Check requirements
        for (const req of skill.requirements) {
            if (req.type === 'attribute' && this.attributes[req.attribute] < req.value) {
                return false;
            }
            if (req.type === 'year' && this.year < req.value) {
                return false;
            }
        }

        this.learningSkills.push({
            id: skillId,
            progress: 0
        });

        return true;
    }

    /**
     * Update skill learning progress
     * @param {number} progressGain - Amount of progress to add
     */
    updateSkillProgress(progressGain) {
        this.learningSkills.forEach((learning, index) => {
            learning.progress += progressGain;

            if (learning.progress >= 100) {
                // Skill learned
                this.skills.push(learning.id);
                this.learningSkills.splice(index, 1);

                // Apply skill effects
                const skill = Skills[learning.id];
                if (skill && skill.effects) {
                    skill.effects.forEach(effect => {
                        if (effect.type === 'attribute') {
                            this.attributes[effect.attribute] += effect.value;
                        }
                    });
                }
            }
        });
    }

    /**
     * Get player information for display
     * @returns {Object} Player information
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            position: this.position,
            positionName: Positions[this.position],
            age: this.age,
            year: this.year,
            yearName: this.getYearName(),
            overallRating: this.getOverallRating(),
            scoutRating: this.getScoutRating(),
            potential: this.potential,
            attributes: { ...this.attributes },
            talents: this.talents.map(talentId => ({
                id: talentId,
                ...PlayerTalents[talentId]
            })),
            skills: this.skills.map(skillId => ({
                id: skillId,
                ...Skills[skillId]
            })),
            learningSkills: [...this.learningSkills],
            stats: { ...this.stats },
            seasonStats: { ...this.seasonStats },
            description: this.generatePlayerDescription()
        };
    }

    /**
     * Generate concise player description (under 300 characters)
     * @returns {string} Player description
     */
    generatePlayerDescription() {
        const positionNames = {
            'PG': '控球后卫', 'SG': '得分后卫', 'SF': '小前锋', 'PF': '大前锋', 'C': '中锋'
        };

        const positionName = positionNames[this.position] || this.position;
        
        const yearNames = { 1: '大一', 2: '大二', 3: '大三', 4: '大四' };
        const experienceLabels = { 1: '新秀', 2: '二年级生', 3: '三年级生', 4: '经验丰富的老将' };

        // Determine player strengths
        const strengths = [];
        if (this.attributes.scoring >= 70) strengths.push('得分能力');
        if (this.attributes.shooting >= 70) strengths.push('投篮技术');
        if (this.attributes.passing >= 70) strengths.push('组织能力');
        if (this.attributes.defense >= 70) strengths.push('防守能力');
        if (this.attributes.rebounding >= 70) strengths.push('篮板球');
        if (this.attributes.speed >= 70) strengths.push('速度优势');
        if (this.attributes.strength >= 70) strengths.push('身体对抗');

        // Determine player type based on rating (skill level)
        let skillLevel = '';
        if (this.overallRating >= 80) skillLevel = '明星级';
        else if (this.overallRating >= 70) skillLevel = '主力级';
        else if (this.overallRating >= 60) skillLevel = '轮换级';
        else skillLevel = '轮换边缘';

        // Determine experience level based on year
        const experienceLevel = experienceLabels[this.year] || '新秀';

        // Generate description
        let description = `${this.name}是一名${this.age}岁的${positionName}，${yearNames[this.year]}学生，${experienceLevel}，${skillLevel}球员。`;

        if (strengths.length > 0) {
            description += `擅长${strengths.slice(0, 3).join('、')}，`;
        }

        if (this.potential >= 80) {
            description += '具备极高的成长潜力，';
        } else if (this.potential >= 70) {
            description += '拥有良好的发展前景，';
        }

        // Add position-specific description
        switch (this.position) {
            case 'PG':
                description += '场上视野开阔，组织进攻能力强。';
                break;
            case 'SG':
                description += '外线投射稳定，得分手段多样。';
                break;
            case 'SF':
                description += '技术全面，攻防两端都有出色表现。';
                break;
            case 'PF':
                description += '内线技术扎实，篮板保护能力强。';
                break;
            case 'C':
                description += '篮下统治力强，防守端作用显著。';
                break;
        }

        // Ensure description is under 300 characters
        if (description.length > 300) {
            description = description.substring(0, 297) + '...';
        }

        return description;
    }

    /**
     * Get academic year name
     * @returns {string} Academic year name
     */
    getYearName() {
        const yearNames = ['', '大一', '大二', '大三', '大四'];
        return yearNames[this.year] || '未知';
    }

    /**
     * Age the player by one year
     */
    ageUp() {
        this.age++;
        this.year++;

        // Reset season stats
        this.seasonStats = {
            games: 0,
            points: 0,
            rebounds: 0,
            assists: 0,
            steals: 0,
            blocks: 0,
            fouls: 0,
            turnovers: 0,
            minutes: 0
        };
    }
}

/**
 * 高年级球员数据集合
 * 包含经验丰富的高年级球员数据，属性显著高于低年级球员
 */
const SeniorPlayerData = {
    /**
     * 高年级球员名称库
     */
    seniorFirstNames: [
        '张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴',
        'Michael', 'James', 'Kevin', 'Chris', 'Stephen', 'Kawhi', 'Giannis', 'Luka', 'Jayson', 'Damian',
        '林', '郑', '罗', '梁', '宋', '唐', '曹', '韩', '杜', '曾',
        'DeMar', 'Bradley', 'Jimmy', 'Kyrie', 'Russell', 'Donovan', 'Devin', 'Zach', 'Karl-Anthony', 'Bam'
    ],
    
    seniorLastNames: [
        '铭轩', '俊杰', '宇轩', '子墨', '浩然', '天宇', '文博', '明轩', '嘉豪', '伟宸',
        'Jordan', 'Bryant', 'James', 'Curry', 'Durant', 'Leonard', 'Antetokounmpo', 'Dončić', 'Tatum', 'Lillard',
        '志豪', '俊辉', '文轩', '伟杰', '子豪', '明杰', '建豪', '志杰', '俊豪', '文杰',
        'DeRozan', 'Beal', 'Butler', 'Irving', 'Westbrook', 'Mitchell', 'Booker', 'LaVine', 'Towns', 'Adebayo'
    ],
    
    /**
     * 高年级球员配置
     * 定义各年级球员的属性范围和特点
     * 年龄与年级对应关系：
     * - 大一: 18-19岁
     * - 大二: 19-20岁
     * - 大三: 20-22岁
     * - 大四: 22-25岁
     */
    yearConfig: {
        4: {
            name: '大四老将',
            minAge: 22,
            maxAge: 25,
            attributeRange: { min: 75, max: 95 },
            potentialRange: { min: 80, max: 99 },
            experienceBonus: 15,
            description: '经验丰富的老将，技术成熟，战术素养高',
            statMultipliers: {
                scoring: 1.0,
                shooting: 1.0,
                threePoint: 0.95,
                freeThrow: 1.0,
                passing: 1.0,
                dribbling: 0.95,
                defense: 1.05,
                rebounding: 1.0,
                stealing: 1.0,
                blocking: 1.0,
                speed: 0.9,
                stamina: 1.1,
                strength: 1.0,
                basketballIQ: 1.1
            }
        },
        3: {
            name: '三年级球员',
            minAge: 20,
            maxAge: 22,
            attributeRange: { min: 65, max: 88 },
            potentialRange: { min: 70, max: 90 },
            experienceBonus: 10,
            description: '经过两个赛季磨练，开始展现领导力',
            statMultipliers: {
                scoring: 0.95,
                shooting: 0.95,
                threePoint: 0.9,
                freeThrow: 0.95,
                passing: 0.95,
                dribbling: 0.9,
                defense: 0.95,
                rebounding: 0.95,
                stealing: 0.95,
                blocking: 0.95,
                speed: 0.95,
                stamina: 1.0,
                strength: 0.95,
                basketballIQ: 1.0
            }
        }
    },
    
    /**
     * 位置特定属性分布
     * 定义各位置球员的核心属性权重
     */
    positionArchetypes: {
        PG: {
            coreAttributes: ['passing', 'dribbling', 'basketballIQ', 'speed'],
            secondaryAttributes: ['scoring', 'threePoint', 'stealing'],
            description: '组织型控卫，具备出色的传球视野和控球能力'
        },
        SG: {
            coreAttributes: ['shooting', 'threePoint', 'scoring', 'speed'],
            secondaryAttributes: ['dribbling', 'stealing', 'defense'],
            description: '得分后卫，拥有精准的投篮和出色的得分能力'
        },
        SF: {
            coreAttributes: ['scoring', 'defense', 'rebounding', 'speed'],
            secondaryAttributes: ['shooting', 'threePoint', 'basketballIQ'],
            description: '小前锋，技术全面，攻守兼备'
        },
        PF: {
            coreAttributes: ['rebounding', 'strength', 'defense', 'scoring'],
            secondaryAttributes: ['blocking', 'shooting', 'stamina'],
            description: '大前锋，篮板能力出色，篮下终结能力强'
        },
        C: {
            coreAttributes: ['rebounding', 'blocking', 'strength', 'defense'],
            secondaryAttributes: ['scoring', 'stamina', 'freeThrow'],
            description: '中锋，护筐能力强，篮板统治力出色'
        }
    },
    
    /**
     * 预定义高年级明星球员
     */
    presetSeniors: [
        {
            id: 'senior_001',
            name: '张铭轩',
            position: 'PG',
            age: 22,
            year: 4,
            attributes: {
                scoring: 82,
                shooting: 85,
                threePoint: 88,
                freeThrow: 80,
                passing: 92,
                dribbling: 90,
                defense: 75,
                rebounding: 45,
                stealing: 78,
                blocking: 35,
                speed: 85,
                stamina: 88,
                strength: 55,
                basketballIQ: 90
            },
            potential: 92,
            talents: ['playmaker', 'sharpshooter'],
            skills: ['advancedPassing', 'clutchShot', 'courtVision'],
            seasonStats: {
                games: 95,
                points: 15.2,
                rebounds: 3.8,
                assists: 8.5,
                steals: 1.4,
                blocks: 0.3,
                fgPct: 0.456,
                threePct: 0.402,
                ftPct: 0.825
            },
            description: '球队核心控卫，组织能力出众，大局观强，是球队进攻的发起者'
        },
        {
            id: 'senior_002',
            name: 'Michael Jordan',
            position: 'SG',
            age: 23,
            year: 4,
            attributes: {
                scoring: 95,
                shooting: 92,
                threePoint: 85,
                freeThrow: 88,
                passing: 72,
                dribbling: 88,
                defense: 82,
                rebounding: 55,
                stealing: 80,
                blocking: 42,
                speed: 90,
                stamina: 92,
                strength: 72,
                basketballIQ: 85
            },
            potential: 97,
            talents: ['clutch', 'scorer', 'athlete'],
            skills: ['fadeaway', 'dunks', 'midRange', 'defensiveStopper'],
            seasonStats: {
                games: 92,
                points: 28.5,
                rebounds: 5.2,
                assists: 4.8,
                steals: 1.8,
                blocks: 0.5,
                fgPct: 0.485,
                threePct: 0.375,
                ftPct: 0.865
            },
            description: '超级得分手，拥有无解的进攻技巧，关键时刻从不手软'
        },
        {
            id: 'senior_003',
            name: '王俊杰',
            position: 'SF',
            age: 22,
            year: 4,
            attributes: {
                scoring: 85,
                shooting: 82,
                threePoint: 78,
                freeThrow: 82,
                passing: 75,
                dribbling: 80,
                defense: 88,
                rebounding: 68,
                stealing: 75,
                blocking: 55,
                speed: 82,
                stamina: 85,
                strength: 75,
                basketballIQ: 82
            },
            potential: 90,
            talents: ['defender', 'athlete', 'threeD'],
            skills: ['lockdownDefense', 'cornerThree', 'transitionFinish'],
            seasonStats: {
                games: 94,
                points: 18.5,
                rebounds: 6.2,
                assists: 3.5,
                steals: 1.5,
                blocks: 0.8,
                fgPct: 0.468,
                threePct: 0.385,
                ftPct: 0.845
            },
            description: '防守悍将，进攻端同样全面，是球队的防守核心'
        },
        {
            id: 'senior_004',
            name: '李子墨',
            position: 'PF',
            age: 23,
            year: 4,
            attributes: {
                scoring: 78,
                shooting: 70,
                threePoint: 55,
                freeThrow: 72,
                passing: 58,
                dribbling: 62,
                defense: 88,
                rebounding: 92,
                stealing: 55,
                blocking: 85,
                speed: 68,
                stamina: 90,
                strength: 92,
                basketballIQ: 78
            },
            potential: 88,
            talents: ['rebounding', 'defender', 'rimProtector'],
            skills: ['putbackDunk', 'boxOut', 'shotBlock', 'pickAndRoll'],
            seasonStats: {
                games: 93,
                points: 14.5,
                rebounds: 11.8,
                assists: 2.2,
                steals: 0.6,
                blocks: 2.1,
                fgPct: 0.525,
                threePct: 0.220,
                ftPct: 0.745
            },
            description: '篮板怪兽，护筐能力强，是球队内线的防守支柱'
        },
        {
            id: 'senior_005',
            name: 'Kevin Durant',
            position: 'PF',
            age: 22,
            year: 3,
            attributes: {
                scoring: 90,
                shooting: 88,
                threePoint: 85,
                freeThrow: 85,
                passing: 70,
                dribbling: 78,
                defense: 75,
                rebounding: 72,
                stealing: 62,
                blocking: 58,
                speed: 80,
                stamina: 85,
                strength: 78,
                basketballIQ: 82
            },
            potential: 95,
            talents: ['scorer', 'sharpshooter', 'athlete'],
            skills: ['pullUp', 'offDribbleThree', 'midRange', 'isoScoring'],
            seasonStats: {
                games: 60,
                points: 24.5,
                rebounds: 7.2,
                assists: 3.5,
                steals: 0.9,
                blocks: 0.8,
                fgPct: 0.482,
                threePct: 0.402,
                ftPct: 0.882
            },
            description: '进攻万花筒，得分手段丰富，投射能力联盟顶尖'
        },
        {
            id: 'senior_006',
            name: '陈浩然',
            position: 'C',
            age: 23,
            year: 4,
            attributes: {
                scoring: 72,
                shooting: 62,
                threePoint: 45,
                freeThrow: 68,
                passing: 55,
                dribbling: 50,
                defense: 92,
                rebounding: 95,
                stealing: 48,
                blocking: 92,
                speed: 55,
                stamina: 88,
                strength: 95,
                basketballIQ: 75
            },
            potential: 85,
            talents: ['rebounding', 'defender', 'rimProtector', 'postScorer'],
            skills: ['backToBasket', 'boxOut', 'shotBlock', 'pickAndRoll', 'tipIns'],
            seasonStats: {
                games: 91,
                points: 12.8,
                rebounds: 13.5,
                assists: 1.8,
                steals: 0.5,
                blocks: 2.8,
                fgPct: 0.565,
                threePct: 0.150,
                ftPct: 0.705
            },
            description: '传统型中锋，篮板和盖帽数据领先联盟，篮下统治力强'
        },
        {
            id: 'senior_007',
            name: 'Stephen Curry',
            position: 'PG',
            age: 21,
            year: 3,
            attributes: {
                scoring: 88,
                shooting: 95,
                threePoint: 98,
                freeThrow: 92,
                passing: 82,
                dribbling: 92,
                defense: 68,
                rebounding: 42,
                stealing: 72,
                blocking: 32,
                speed: 88,
                stamina: 85,
                strength: 52,
                basketballIQ: 90
            },
            potential: 98,
            talents: ['sharpshooter', 'playmaker', 'clutch'],
            skills: ['offDribbleThree', 'pullUp', 'catchAndShoot', 'range', 'movingShooting'],
            seasonStats: {
                games: 58,
                points: 26.8,
                rebounds: 4.2,
                assists: 6.5,
                steals: 1.2,
                blocks: 0.2,
                fgPct: 0.452,
                threePct: 0.425,
                ftPct: 0.915
            },
            description: '历史级射手，三分球命中率和产量都是联盟顶级'
        },
        {
            id: 'senior_008',
            name: '刘宇轩',
            position: 'SG',
            age: 22,
            year: 4,
            attributes: {
                scoring: 85,
                shooting: 88,
                threePoint: 85,
                freeThrow: 80,
                passing: 68,
                dribbling: 82,
                defense: 78,
                rebounding: 48,
                stealing: 75,
                blocking: 38,
                speed: 85,
                stamina: 82,
                strength: 65,
                basketballIQ: 80
            },
            potential: 88,
            talents: ['sharpshooter', 'athlete', 'clutch'],
            skills: ['pullUp', 'stopAndPop', 'transitionThree', 'dunks', 'helpDefense'],
            seasonStats: {
                games: 88,
                points: 19.5,
                rebounds: 3.8,
                assists: 2.8,
                steals: 1.3,
                blocks: 0.4,
                fgPct: 0.445,
                threePct: 0.395,
                ftPct: 0.835
            },
            description: '攻防兼备的得分后卫，外线投射稳定，防守积极'
        },
        {
            id: 'senior_009',
            name: 'Giannis Antetokounmpo',
            position: 'PF',
            age: 23,
            year: 4,
            attributes: {
                scoring: 88,
                shooting: 72,
                threePoint: 52,
                freeThrow: 68,
                passing: 78,
                dribbling: 82,
                defense: 90,
                rebounding: 90,
                stealing: 72,
                blocking: 85,
                speed: 88,
                stamina: 92,
                strength: 90,
                basketballIQ: 78
            },
            potential: 97,
            talents: ['athlete', 'defender', 'rebounding', 'rimProtector'],
            skills: ['dunks', 'drives', 'block', 'rebound', 'transitionFinish', 'postMoves'],
            seasonStats: {
                games: 62,
                points: 27.5,
                rebounds: 12.2,
                assists: 5.8,
                steals: 1.0,
                blocks: 1.5,
                fgPct: 0.542,
                threePct: 0.285,
                ftPct: 0.682
            },
            description: '希腊怪兽，身体素质历史级别，攻防两端都有统治力'
        },
        {
            id: 'senior_010',
            name: '周天宇',
            position: 'C',
            age: 22,
            year: 3,
            attributes: {
                scoring: 75,
                shooting: 68,
                threePoint: 52,
                freeThrow: 72,
                passing: 58,
                dribbling: 55,
                defense: 85,
                rebounding: 88,
                stealing: 52,
                blocking: 82,
                speed: 62,
                stamina: 85,
                strength: 88,
                basketballIQ: 75
            },
            potential: 85,
            talents: ['rebounding', 'defender', 'postScorer'],
            skills: ['backToBasket', 'hookShot', 'boxOut', 'pickAndRoll', 'interiorDefense'],
            seasonStats: {
                games: 55,
                points: 13.5,
                rebounds: 10.8,
                assists: 2.0,
                steals: 0.5,
                blocks: 2.2,
                fgPct: 0.545,
                threePct: 0.320,
                ftPct: 0.725
            },
            description: '年轻有为的中锋，篮板和护筐能力出色，还有发展空间'
        },
        {
            id: 'senior_011',
            name: 'Luka Dončić',
            position: 'PG',
            age: 21,
            year: 3,
            attributes: {
                scoring: 90,
                shooting: 85,
                threePoint: 82,
                freeThrow: 80,
                passing: 92,
                dribbling: 88,
                defense: 72,
                rebounding: 72,
                stealing: 68,
                blocking: 45,
                speed: 78,
                stamina: 85,
                strength: 72,
                basketballIQ: 95
            },
            potential: 98,
            talents: ['playmaker', 'scorer', 'clutch', 'rebounding'],
            skills: ['stepBack', 'courtVision', 'isoScoring', 'pullUp', 'passing'],
            seasonStats: {
                games: 58,
                points: 28.5,
                rebounds: 8.5,
                assists: 8.2,
                steals: 0.9,
                blocks: 0.4,
                fgPct: 0.462,
                threePct: 0.355,
                ftPct: 0.785
            },
            description: '欧洲天才少年，技术成熟度超乎年龄，大局观出色'
        },
        {
            id: 'senior_012',
            name: '黄文博',
            position: 'SF',
            age: 23,
            year: 4,
            attributes: {
                scoring: 82,
                shooting: 80,
                threePoint: 78,
                freeThrow: 78,
                passing: 72,
                dribbling: 78,
                defense: 82,
                rebounding: 62,
                stealing: 72,
                blocking: 52,
                speed: 80,
                stamina: 85,
                strength: 72,
                basketballIQ: 82
            },
            potential: 85,
            talents: ['threeD', 'defender', 'athlete'],
            skills: ['cornerThree', 'lockdownDefense', 'transitionFinish', 'helpDefense', 'cutting'],
            seasonStats: {
                games: 89,
                points: 16.5,
                rebounds: 5.2,
                assists: 3.0,
                steals: 1.2,
                blocks: 0.6,
                fgPct: 0.455,
                threePct: 0.388,
                ftPct: 0.805
            },
            description: '3D侧翼球员，三分和防守都是球队倚仗'
        },
        {
            id: 'senior_013',
            name: 'Damian Lillard',
            position: 'PG',
            age: 24,
            year: 4,
            attributes: {
                scoring: 92,
                shooting: 90,
                threePoint: 92,
                freeThrow: 88,
                passing: 82,
                dribbling: 88,
                defense: 68,
                rebounding: 45,
                stealing: 65,
                blocking: 35,
                speed: 82,
                stamina: 90,
                strength: 62,
                basketballIQ: 85
            },
            potential: 92,
            talents: ['sharpshooter', 'clutch', 'scorer'],
            skills: ['logoShot', 'pullUp', 'clutchShot', 'offDribbleThree', 'freeThrow'],
            seasonStats: {
                games: 70,
                points: 30.5,
                rebounds: 4.2,
                assists: 7.2,
                steals: 1.0,
                blocks: 0.3,
                fgPct: 0.438,
                threePct: 0.395,
                ftPct: 0.895
            },
            description: '关键时刻先生，超远三分能力令人闻风丧胆'
        },
        {
            id: 'senior_014',
            name: '杨明轩',
            position: 'PF',
            age: 22,
            year: 4,
            attributes: {
                scoring: 78,
                shooting: 72,
                threePoint: 62,
                freeThrow: 75,
                passing: 65,
                dribbling: 68,
                defense: 85,
                rebounding: 85,
                stealing: 58,
                blocking: 78,
                speed: 72,
                stamina: 88,
                strength: 85,
                basketballIQ: 78
            },
            potential: 82,
            talents: ['rebounding', 'defender', 'athlete'],
            skills: ['putbackDunk', 'pickAndRoll', 'interiorDefense', 'rebound', 'dunks'],
            seasonStats: {
                games: 86,
                points: 14.2,
                rebounds: 9.5,
                assists: 2.5,
                steals: 0.7,
                blocks: 1.5,
                fgPct: 0.515,
                threePct: 0.355,
                ftPct: 0.768
            },
            description: '内线蓝领，脏活累活一把抓，是球队的无名英雄'
        },
        {
            id: 'senior_015',
            name: 'Kawhi Leonard',
            position: 'SF',
            age: 23,
            year: 4,
            attributes: {
                scoring: 85,
                shooting: 88,
                threePoint: 78,
                freeThrow: 82,
                passing: 68,
                dribbling: 75,
                defense: 95,
                rebounding: 72,
                stealing: 82,
                blocking: 58,
                speed: 82,
                stamina: 88,
                strength: 80,
                basketballIQ: 85
            },
            potential: 95,
            talents: ['defender', 'clutch', 'scorer', 'athlete'],
            skills: ['lockdownDefense', 'midRange', 'postDefense', 'steals', 'clutchShot'],
            seasonStats: {
                games: 52,
                points: 21.5,
                rebounds: 6.8,
                assists: 3.2,
                steals: 1.8,
                blocks: 0.7,
                fgPct: 0.475,
                threePct: 0.352,
                ftPct: 0.845
            },
            description: '两届最佳防守球员，进攻端的中距离投篮同样精准'
        }
    ],
    
    /**
     * 生成随机高年级球员
     * @param {Object} options - 生成选项
     * @returns {Object} 高年级球员数据
     */
    generateSeniorPlayer(options = {}) {
        const position = options.position || Object.keys(this.positionArchetypes)[Math.floor(Math.random() * 5)];
        const year = options.year || (Math.random() < 0.6 ? 4 : 3);
        const config = this.yearConfig[year];
        
        const firstName = this.seniorFirstNames[Math.floor(Math.random() * this.seniorFirstNames.length)];
        const lastName = this.seniorLastNames[Math.floor(Math.random() * this.seniorLastNames.length)];
        const age = config.minAge + Math.floor(Math.random() * (config.maxAge - config.minAge + 1));
        
        const archetype = this.positionArchetypes[position];
        const multipliers = config.statMultipliers;
        
        const attributes = {};
        const baseRange = config.attributeRange;
        
        for (const [key, value] of Object.entries({
            scoring: 70, shooting: 70, threePoint: 65, freeThrow: 70,
            passing: 65, dribbling: 68, defense: 68, rebounding: 65,
            stealing: 62, blocking: 60, speed: 70, stamina: 72,
            strength: 68, basketballIQ: 70
        })) {
            const baseValue = baseRange.min + Math.floor(Math.random() * (baseRange.max - baseRange.min));
            const multiplier = multipliers[key] || 1.0;
            attributes[key] = Math.min(99, Math.max(1, Math.round(baseValue * multiplier)));
        }
        
        const positionBonus = this.getPositionBonus(position, attributes);
        for (const [key, bonus] of Object.entries(positionBonus)) {
            attributes[key] = Math.min(99, attributes[key] + bonus);
        }
        
        const potential = config.potentialRange.min + Math.floor(Math.random() * (config.potentialRange.max - config.potentialRange.min));
        
        const talents = this.generateTalents(potential, position);
        const skills = this.generateSkills(talents, position);
        
        const seasonStats = this.calculateSeasonStats(attributes, position);
        
        return {
            id: `senior_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: `${firstName} ${lastName}`,
            position: position,
            age: age,
            year: year,
            attributes: attributes,
            potential: potential,
            talents: talents,
            skills: skills,
            experience: year * 25 + Math.floor(Math.random() * 15),
            seasonStats: seasonStats,
            description: archetype.description
        };
    },
    
    /**
     * 获取位置加成
     */
    getPositionBonus(position, attributes) {
        const bonuses = {
            PG: { passing: 12, dribbling: 10, basketballIQ: 8, stealing: 5, speed: 5 },
            SG: { shooting: 10, threePoint: 10, scoring: 8, speed: 5, stealing: 3 },
            SF: { scoring: 8, defense: 8, rebounding: 6, speed: 5, stealing: 4 },
            PF: { rebounding: 12, strength: 10, defense: 8, blocking: 8, scoring: 4 },
            C: { rebounding: 15, blocking: 12, strength: 12, defense: 10, scoring: 3 }
        };
        return bonuses[position] || {};
    },
    
    /**
     * 生成天赋
     */
    generateTalents(potential, position) {
        const talents = [];
        const talentPool = {
            PG: ['playmaker', 'sharpshooter', 'clutch', 'passing'],
            SG: ['sharpshooter', 'scorer', 'clutch', 'athlete'],
            SF: ['defender', 'threeD', 'athlete', 'scorer'],
            PF: ['rebounding', 'defender', 'rimProtector', 'athlete'],
            C: ['rebounding', 'rimProtector', 'defender', 'postScorer']
        };
        
        const count = potential > 85 ? 3 : (potential > 75 ? 2 : 1);
        const pool = talentPool[position] || [];
        
        for (let i = 0; i < count; i++) {
            const talent = pool[Math.floor(Math.random() * pool.length)];
            if (!talents.includes(talent)) talents.push(talent);
        }
        
        return talents;
    },
    
    /**
     * 生成技能
     */
    generateSkills(talents, position) {
        const skillPool = {
            PG: ['advancedPassing', 'courtVision', 'clutchShot', 'pullUp', 'steals'],
            SG: ['pullUp', 'catchAndShoot', 'dunks', 'clutchShot', 'defensiveStopper'],
            SF: ['lockdownDefense', 'cornerThree', 'transitionFinish', 'midRange', 'cutting'],
            PF: ['pickAndRoll', 'boxOut', 'shotBlock', 'putbackDunk', 'postMoves'],
            C: ['backToBasket', 'hookShot', 'boxOut', 'interiorDefense', 'rebound']
        };
        
        const pool = skillPool[position] || [];
        const skills = talents.slice(0, 2).map(t => {
            const related = {
                playmaker: 'advancedPassing', sharpshooter: 'catchAndShoot',
                scorer: 'pullUp', defender: 'lockdownDefense',
                rebounding: 'boxOut', rimProtector: 'shotBlock',
                clutch: 'clutchShot', athlete: 'dunks'
            };
            return related[t] || pool[0];
        });
        
        return [...new Set([...skills, ...pool.slice(0, 2)])];
    },
    
    /**
     * 计算赛季数据
     */
    calculateSeasonStats(attributes, position) {
        const positionMultipliers = {
            PG: { pts: 0.18, reb: 0.05, ast: 0.15 },
            SG: { pts: 0.22, reb: 0.05, ast: 0.08 },
            SF: { pts: 0.20, reb: 0.08, ast: 0.06 },
            PF: { pts: 0.16, reb: 0.12, ast: 0.04 },
            C: { pts: 0.14, reb: 0.14, ast: 0.03 }
        };
        
        const m = positionMultipliers[position];
        const games = 28 + Math.floor(Math.random() * 10);
        const pts = Math.round((attributes.scoring * m.pts + attributes.shooting * 0.05 + attributes.threePoint * 0.03) * 1.2);
        const reb = Math.round((attributes.rebounding * m.reb + attributes.strength * 0.02) * 1.1);
        const ast = Math.round((attributes.passing * m.ast + attributes.basketballIQ * 0.02) * 1.2);
        const stl = Math.round(attributes.stealing * 0.015 + 0.3);
        const blk = Math.round(attributes.blocking * 0.02 + 0.2);
        const fgPct = 0.4 + (attributes.shooting * 0.001 + attributes.scoring * 0.0005) * 0.4;
        const threePct = 0.25 + (attributes.threePoint * 0.002) * 0.2;
        const ftPct = 0.7 + (attributes.freeThrow * 0.002) * 0.2;
        
        return {
            games: games,
            points: Math.min(35, pts),
            rebounds: Math.min(15, reb),
            assists: Math.min(12, ast),
            steals: Math.min(2.5, stl),
            blocks: Math.min(3, blk),
            fgPct: Math.min(0.65, Math.max(0.35, fgPct)),
            threePct: Math.min(0.50, Math.max(0.20, threePct)),
            ftPct: Math.min(0.95, Math.max(0.65, ftPct))
        };
    },
    
    /**
     * 生成高年级球员阵容
     */
    generateSeniorTeam(count = 12) {
        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        const team = [];
        
        for (let i = 0; i < count; i++) {
            const position = positions[i % 5];
            const player = this.generateSeniorPlayer({ position, year: i < 8 ? 4 : 3 });
            team.push(player);
        }
        
        return team;
    }
};

window.SeniorPlayerData = SeniorPlayerData;

/**
 * Coach class representing a basketball coach
 */
class Coach {
    /**
     * Create a new Coach instance
     * @param {Object} data - Coach data
     * @param {number} data.id - Unique coach ID
     * @param {string} data.name - Coach name
     * @param {number} data.age - Coach age
     * @param {string} data.archetype - Coach archetype
     * @param {Object} data.attributes - Coach attributes
     * @param {number} data.salary - Coach salary
     * @param {Array} data.preferredPlayStyles - Preferred play styles
     * @param {number} data.experience - Years of experience
     * @param {string} data.coachingStyle - 进攻/防守/平衡
     * @param {Array} data.specialties - 专长: 内线/外线/新人/关键球/快攻/防守
     * @param {boolean} data.isChampion - 是否冠军教头
     * @param {number} data.playerDevRating - 新人培养评分
     * @param {string} data.philosophy - 执教理念
     * @param {string} data.almaMater - 毕业院校
     * @param {string} data.playingCareer - 球员生涯经历
     * @param {Array} data.coachingHistory - 执教履历
     * @param {Array} data.achievements - 主要成就
     * @param {Array} data.notablePlayers - 培养的知名球员
     * @param {Array} data.awards - 获得奖项
     * @param {string} data.currentTeam - 最近执教的球队
     * @param {number} data.yearsWithoutChampionship - 冠军荒年数
     * @param {string} data.coachingPhilosophy - 详细执教理念
     * @param {string} data.strengths - 执教优势
     * @param {string} data.weaknesses - 执教短板
     */
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.age = data.age;
        this.archetype = data.archetype;
        this.attributes = { ...data.attributes };
        this.salary = data.salary;
        this.preferredPlayStyles = [...(data.preferredPlayStyles || [])];
        this.experience = data.experience;
        this.contract = data.contract || null;
        this.teamId = data.teamId || null;
        this.careerStats = {
            seasons: 0,
            wins: 0,
            losses: 0,
            championships: 0
        };
        this.coachingStyle = data.coachingStyle || 'balanced';
        this.specialties = data.specialties || [];
        this.isChampion = data.isChampion || false;
        this.playerDevRating = data.playerDevRating || 50;
        this.philosophy = data.philosophy || '';
        this.titles = data.titles || [];
        this.maximizePotential = data.maximizePotential || false;
        
        this.almaMater = data.almaMater || '';
        this.playingCareer = data.playingCareer || '';
        this.coachingHistory = data.coachingHistory || [];
        this.achievements = data.achievements || [];
        this.notablePlayers = data.notablePlayers || [];
        this.awards = data.awards || [];
        this.currentTeam = data.currentTeam || '';
        this.yearsWithoutChampionship = data.yearsWithoutChampionship || 0;
        this.coachingPhilosophy = data.coachingPhilosophy || '';
        this.strengths = data.strengths || '';
        this.weaknesses = data.weaknesses || '';
        this.motto = data.motto || '';
        this.influence = data.influence || 0;
        this.innovation = data.innovation || 0;
        this.adaptability = data.adaptability || 0;
    }

    /**
     * Get coach's overall rating
     * @returns {number} Overall rating (1-100)
     */
    getOverallRating() {
        const weights = {
            offense: 0.18,
            defense: 0.18,
            recruiting: 0.12,
            development: 0.22,
            motivation: 0.1,
            playerDevRating: 0.1,
            influence: 0.05,
            innovation: 0.05
        };

        let weightedSum = 0;
        for (const [attr, weight] of Object.entries(weights)) {
            const value = attr === 'playerDevRating' ? this.playerDevRating : 
                          (this.attributes[attr] || 50);
            weightedSum += value * weight;
        }

        const achievementBonus = Math.min(this.achievements.length * 1.5, 10);
        const championshipBonus = this.careerStats.championships * 3;
        
        return Math.round(weightedSum + achievementBonus + championshipBonus);
    }

    /**
     * Get coach information for display
     * @returns {Object} Coach information
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            age: this.age,
            archetype: this.archetype,
            attributes: { ...this.attributes },
            overallRating: this.getOverallRating(),
            salary: this.salary,
            preferredPlayStyles: [...this.preferredPlayStyles],
            experience: this.experience,
            contract: this.contract ? { ...this.contract } : null,
            teamId: this.teamId,
            careerStats: { ...this.careerStats },
            coachingStyle: this.coachingStyle,
            specialties: [...this.specialties],
            isChampion: this.isChampion,
            playerDevRating: this.playerDevRating,
            philosophy: this.philosophy,
            titles: [...this.titles],
            maximizePotential: this.maximizePotential,
            almaMater: this.almaMater,
            playingCareer: this.playingCareer,
            coachingHistory: [...this.coachingHistory],
            achievements: [...this.achievements],
            notablePlayers: [...this.notablePlayers],
            awards: [...this.awards],
            currentTeam: this.currentTeam,
            yearsWithoutChampionship: this.yearsWithoutChampionship,
            coachingPhilosophy: this.coachingPhilosophy,
            strengths: this.strengths,
            weaknesses: this.weaknesses,
            motto: this.motto,
            influence: this.influence,
            innovation: this.innovation,
            adaptability: this.adaptability
        };
    }

    /**
     * Get style description in Chinese
     * @returns {string} Style description
     */
    getStyleDescription() {
        const descriptions = {
            offensive: '进攻型',
            defensive: '防守型',
            balanced: '平衡型',
            tempo: '快节奏',
            halfcourt: '半场阵地'
        };
        return descriptions[this.coachingStyle] || '平衡型';
    }

    /**
     * Get specialties description in Chinese
     * @returns {Array} Array of specialty descriptions
     */
    getSpecialtiesDescription() {
        const names = {
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
        return this.specialties.map(s => names[s] || s);
    }

    /**
     * Update coach career stats after a season
     * @param {number} wins - Number of wins
     * @param {number} losses - Number of losses
     * @param {boolean} championship - Whether won championship
     */
    updateCareerStats(wins, losses, championship = false) {
        this.careerStats.seasons++;
        this.careerStats.wins += wins;
        this.careerStats.losses += losses;
        if (championship) {
            this.careerStats.championships++;
            if (!this.titles.includes('冠军教头')) {
                this.titles.push('冠军教头');
            }
        }
        this.experience++;
    }
}

/**
 * Team class representing a basketball team
 */
// Team class representing a basketball team
class Team {
    /**
     * Create a new Team instance
     * @param {Object} data - Team data
     * @param {number} data.id - Unique team ID
     * @param {string} data.name - Team name
     * @param {string} data.conference - Team conference
     * @param {number} data.funds - Team funds
     * @param {number} data.scholarships - Available scholarships
     * @param {Array} data.roster - Team roster (Player objects)
     * @param {Object} data.stats - Team statistics
     */
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.conference = data.conference;
        this.funds = data.funds || 1000000;
        this.scholarships = data.scholarships || 13;
        this.roster = [...(data.roster || [])];
        this.coach = data.coach || null;
        this.stats = {
            wins: 0,
            losses: 0,
            conferenceWins: 0,
            conferenceLosses: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            ...data.stats
        };
        this.schedule = [];
        this.lineup = {
            PG: null,
            SG: null,
            SF: null,
            PF: null,
            C: null
        };
    }

    /**
     * Add a player to the team
     * @param {Player} player - Player to add
     * @returns {boolean} Whether player was added successfully
     */
    addPlayer(player) {
        // 计算已使用的奖学金总份额
        const usedScholarshipShare = this.calculateUsedScholarshipShare();
        const playerScholarshipShare = player.scholarship || 1.0; // 默认为全额奖学金
        
        // 检查是否还有足够的奖学金份额
        if (usedScholarshipShare + playerScholarshipShare > this.scholarships) {
            return false;
        }

        this.roster.push(player);
        return true;
    }

    /**
     * Calculate total scholarship share used by current roster
     * @returns {number} Total scholarship share used
     */
    calculateUsedScholarshipShare() {
        return this.roster.reduce((total, player) => {
            return total + (player.scholarship || 1.0);
        }, 0);
    }

    /**
     * Get available scholarship share
     * @returns {number} Available scholarship share
     */
    getAvailableScholarshipShare() {
        return this.scholarships - this.calculateUsedScholarshipShare();
    }

    /**
     * Remove a player from the team
     * @param {number} playerId - ID of player to remove
     * @returns {boolean} Whether player was removed successfully
     */
    removePlayer(playerId) {
        const index = this.roster.findIndex(p => p.id === playerId);
        if (index === -1) return false;

        this.roster.splice(index, 1);
        return true;
    }

    /**
     * Get a player by ID
     * @param {number} playerId - ID of player to get
     * @returns {Player|null} Player object or null if not found
     */
    getPlayer(playerId) {
        return this.roster.find(p => p.id === playerId) || null;
    }

    /**
     * Get players by position
     * @param {string} position - Position to filter by
     * @returns {Array} Array of players at the specified position
     */
    getPlayersByPosition(position) {
        return this.roster.filter(p => p.position === position);
    }

    /**
     * Get the best lineup based on player ratings
     * @returns {Object} Best lineup
     */
    getBestLineup() {
        const lineup = {};

        for (const position of Object.keys(this.lineup)) {
            const players = this.getPlayersByPosition(position);
            if (players.length > 0) {
                lineup[position] = players.reduce((best, player) =>
                    player.getOverallRating() > best.getOverallRating() ? player : best
                );
            }
        }

        return lineup;
    }

    /**
     * Calculate team strength
     * @returns {number} Team strength rating (1-100)
     */
    getTeamStrength() {
        if (this.roster.length === 0) return 0;

        const totalStrength = this.roster.reduce((sum, player) => {
            return sum + player.getOverallRating();
        }, 0);

        return Math.round(totalStrength / this.roster.length);
    }

    /**
     * Update team statistics after a game
     * @param {number} pointsScored - Points scored by the team
     * @param {number} pointsAllowed - Points allowed by the opponent
     * @param {boolean} isConference - Whether this was a conference game
     * @param {boolean} won - Whether the team won
     */
    updateStats(pointsScored, pointsAllowed, isConference, won) {
        this.stats.pointsFor += pointsScored;
        this.stats.pointsAgainst += pointsAllowed;

        if (won) {
            this.stats.wins++;
            if (isConference) this.stats.conferenceWins++;
        } else {
            this.stats.losses++;
            if (isConference) this.stats.conferenceLosses++;
        }
    }

    /**
     * Get team information for display
     * @returns {Object} Team information
     */
    getInfo() {
        const usedShare = this.calculateUsedScholarshipShare();
        const availableShare = this.getAvailableScholarshipShare();
        
        return {
            id: this.id,
            name: this.name,
            conference: this.conference,
            funds: this.funds,
            scholarships: this.scholarships,
            usedScholarshipShare: usedShare,
            availableScholarshipShare: availableShare,
            rosterCount: this.roster.length,
            roster: this.roster.map(player => player.getInfo()),
            coach: this.coach && typeof this.coach.getInfo === 'function' ? this.coach.getInfo() : null,
            stats: { ...this.stats },
            teamStrength: this.getTeamStrength(),
            lineup: { ...this.lineup }
        };
    }
}