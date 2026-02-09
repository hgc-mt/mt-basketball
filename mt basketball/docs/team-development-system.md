# 球队发展系统文档

## 系统概述

球队发展系统是一个经理模式的球员培养机制。不同于直接花钱加点，玩家需要通过投资训练设施、雇佣优秀教练来间接促进球员成长。球员每赛季自动成长，成长幅度取决于多种因素的综合影响。

## 核心设计理念

### 1. 经理视角
- 玩家扮演球队经理，管理资源而非直接控制球员
- 决策重点：设施投资、教练雇佣、预算分配
- 球员发展有不确定性，增加游戏乐趣

### 2. 自动成长机制
- 每赛季结束自动计算球员成长
- 成长受多种因素影响：设施、教练、上场时间、表现等
- 高潜力球员成长更快，但有上限约束

### 3. 资源管理
- 招募预算用于：设施升级、教练年薪、球员招募
- 设施有年度维护费用
- 需要平衡短期和长期投资

## 系统架构

### 核心模块

```
js/modules/
├── teamDevelopmentSystem.js      # 球队发展系统核心
├── teamDevelopmentInterface.js   # 发展中心界面
├── coachManager.js               # 教练管理（已有）
└── recruitmentBudgetManager.js   # 预算管理（已有）
```

## 训练设施系统

### 设施类型

| 设施 | 影响属性 | 最高等级 | 升级成本范围 |
|------|----------|----------|--------------|
| 训练中心 | 所有属性基础加成 | 5级 | $0 - $600,000 |
| 力量房 | 力量、速度、耐力、弹跳、篮板 | 4级 | $0 - $180,000 |
| 投篮实验室 | 投篮、三分、中投、罚球 | 4级 | $0 - $200,000 |
| 录像分析室 | 球商、视野、防守、传球 | 4级 | $0 - $150,000 |
| 医疗中心 | 减少伤病、加速恢复 | 4级 | $0 - $220,000 |

### 设施等级详情

#### 训练中心
| 等级 | 名称 | 升级成本 | 加成 | 维护费/年 |
|------|------|----------|------|-----------|
| 1 | 基础场馆 | - | +0% | $0 |
| 2 | 标准训练馆 | $50,000 | +5% | $5,000 |
| 3 | 现代化训练中心 | $150,000 | +10% | $15,000 |
| 4 | 顶级训练基地 | $300,000 | +15% | $30,000 |
| 5 | 传奇训练殿堂 | $600,000 | +20% | $50,000 |

#### 力量房
| 等级 | 名称 | 升级成本 | 加成 | 维护费/年 |
|------|------|----------|------|-----------|
| 1 | 基础健身房 | - | +0% | $0 |
| 2 | 标准力量房 | $30,000 | +8% | $3,000 |
| 3 | 专业健身中心 | $80,000 | +15% | $8,000 |
| 4 | 顶级体能中心 | $180,000 | +22% | $18,000 |

### 设施加成计算

```javascript
// 总加成 = 训练中心基础加成 + 专项设施加成
calculateFacilityBonus(attribute) {
    let totalBonus = trainingCenterBonus; // 0-20%
    
    // 属性对应的专项设施加成
    if (physicalAttributes.includes(attribute)) {
        totalBonus += weightRoomBonus; // 0-22%
    }
    if (shootingAttributes.includes(attribute)) {
        totalBonus += shootingLabBonus; // 0-22%
    }
    
    return totalBonus;
}
```

## 教练系统

### 教练等级

| 等级 | 名称 | 年薪 | 发展加成 | 潜力上限提升 |
|------|------|------|----------|--------------|
| 新秀 | 新秀教练 | $50,000 | +0% | +0 |
| 资深 | 资深教练 | $120,000 | +5% | +2 |
| 专家 | 专家教练 | $250,000 | +10% | +5 |
| 精英 | 精英教练 | $500,000 | +15% | +8 |
| 传奇 | 传奇教练 | $1,000,000 | +20% | +12 |

### 教练专长加成

培养型教练（Player Development）额外提供 +5% 发展加成

## 球员自动成长机制

### 成长计算公式

```javascript
// 单属性成长 = 基础上限差值 × 基础成长率 × 潜力效率 × (1 + 设施加成 + 教练加成) × 上场时间倍率 × 表现倍率 × 随机因子

function calculateAttributeGrowth(player, attribute, seasonStats) {
    const current = player.attributes[attribute];
    const cap = calculateAttributeCap(player, attribute);
    const room = cap - current;
    
    if (room <= 0) return 0;
    
    // 基础成长率（基于年级）
    const baseGrowthRate = {
        1: 0.12,  // 大一：12%
        2: 0.18,  // 大二：18%
        3: 0.22,  // 大三：22%
        4: 0.25   // 大四：25%
    }[player.year];
    
    // 潜力效率
    const potentialEfficiency = getPotentialEfficiency(player.potential);
    // 90+: 110% | 80-90: 100% | 70-80: 90% | 60-70: 75% | <60: 60%
    
    // 设施加成
    const facilityBonus = calculateFacilityBonus(attribute) / 100;
    
    // 教练加成
    const coachBonus = getCoachDevelopmentBonus() / 100;
    
    // 上场时间倍率
    const playingTimeMultiplier = getPlayingTimeMultiplier(seasonStats.averageMinutes);
    // <10分钟: 30% | 10-20: 60% | 20-25: 85% | 25-30: 100% | 30-35: 115% | >35: 125%
    
    // 表现倍率
    const performanceMultiplier = {
        poor: 0.7, belowAverage: 0.85, average: 1.0,
        good: 1.15, excellent: 1.3, outstanding: 1.5
    }[seasonStats.performanceRating];
    
    // 随机波动 ±15%
    const randomFactor = 1 + (Math.random() * 0.3 - 0.15);
    
    const growth = room * baseGrowthRate * potentialEfficiency * 
                   (1 + facilityBonus + coachBonus) * 
                   playingTimeMultiplier * performanceMultiplier * randomFactor;
    
    return Math.min(room, Math.max(0.5, growth));
}
```

### 成长示例

**场景：大二球员，潜力80，投篮70，训练中心3级(+10%)，投篮实验室2级(+8%)，资深教练(+5%)**

| 上场时间 | 表现 | 预计投篮成长 |
|----------|------|--------------|
| 15分钟/场 | 一般 | +1.5 - 2.0 |
| 25分钟/场 | 良好 | +2.5 - 3.5 |
| 32分钟/场 | 优秀 | +4.0 - 5.5 |

## 赛季结算流程

### 1. 扣除维护费用
```javascript
// 所有设施年度维护费总和
maintenanceCost = sum(facility.maintenance for each facility)
```

### 2. 计算每个球员成长
```javascript
for each player in team.roster:
    seasonStats = getPlayerSeasonStats(player)
    growth = calculatePlayerGrowth(player, seasonStats)
    applyGrowth(player, growth)
    player.year++ // 年级增长
```

### 3. 显示成长报告
- 总成长值
- 每个球员的详细成长
- 各属性成长明细

## API 参考

### TeamDevelopmentSystem

#### 主要方法

##### initializeFacilities()
初始化球队设施（如未初始化则设为1级）

##### getFacilityLevel(facilityType)
获取设施当前等级信息

**参数：**
- `facilityType` (string): 设施类型

**返回值：**
```javascript
{
    current: Object,    // 当前等级配置
    next: Object,       // 下一等级配置（可为null）
    maxLevel: number,   // 最高等级
    canUpgrade: boolean // 是否可升级
}
```

##### upgradeFacility(facilityType)
升级指定设施

**返回值：**
```javascript
{
    success: boolean,
    facility: string,
    newLevel: number,
    cost: number,
    message: string
}
```

##### calculateFacilityBonus(attribute)
计算设施对指定属性的总加成

##### calculateMaintenanceCost()
计算年度设施维护总费用

##### calculatePlayerGrowth(player, seasonStats)
计算球员赛季成长

**参数：**
- `player` (Object): 球员对象
- `seasonStats` (Object): 赛季统计数据

**返回值：**
```javascript
{
    growth: Object,         // 各属性成长值
    totalGrowth: number,    // 总成长值
    factors: Object         // 各影响因素数值
}
```

##### processSeasonEndGrowth()
执行赛季结束成长结算

**返回值：**
```javascript
{
    success: boolean,
    maintenanceCost: number,
    playerGrowths: Array,
    summary: {
        totalPlayers: number,
        totalGrowth: number,
        averageGrowth: number
    }
}
```

##### getFacilityUpgradeSuggestions()
获取设施升级建议（按优先级排序）

##### getDevelopmentReport()
获取球队发展报告

### TeamDevelopmentInterface

#### 主要方法

##### showDevelopmentCenter()
显示球队发展中心界面

##### showSeasonGrowthReport(growthResults)
显示赛季成长报告

##### upgradeFacility(facilityType)
处理设施升级UI操作

## 使用示例

### 打开发展中心
```javascript
// 初始化系统
const developmentSystem = new TeamDevelopmentSystem(gameStateManager);
const developmentInterface = new TeamDevelopmentInterface(gameStateManager, developmentSystem);

// 显示发展中心
window.teamDevelopmentInterface = developmentInterface;
developmentInterface.showDevelopmentCenter();
```

### 赛季结束处理
```javascript
// 在赛季结束时调用
function onSeasonEnd() {
    // 处理球员成长
    const growthResults = developmentSystem.processSeasonEndGrowth();
    
    // 显示成长报告
    developmentInterface.showSeasonGrowthReport(growthResults);
    
    console.log(`赛季结束！总成长值: ${growthResults.summary.totalGrowth.toFixed(1)}`);
    console.log(`维护费用: $${growthResults.maintenanceCost.toLocaleString()}`);
}
```

### 升级设施
```javascript
// 升级投篮实验室
const result = developmentSystem.upgradeFacility('shootingLab');
if (result.success) {
    console.log(`升级成功！新等级: ${result.newLevel}`);
} else {
    console.log(`升级失败: ${result.message}`);
}
```

## 策略建议

### 早期策略（预算有限）
1. 优先升级训练中心（影响所有球员）
2. 根据球队特点选择专项设施
   - 内线球队：优先力量房
   - 外线球队：优先投篮实验室
3. 雇佣资深级教练即可

### 中期策略
1. 平衡设施升级和教练雇佣
2. 关注球员上场时间分配
3. 医疗中心可减少伤病损失

### 后期策略
1. 追求顶级设施和传奇教练
2. 重点培养高潜力年轻球员
3. 合理控制维护费用

## 与旧系统对比

| 特性 | 花钱加点系统 | 赛季自动成长系统 |
|------|--------------|------------------|
| 玩家角色 | 直接控制球员 | 管理球队资源 |
| 成长方式 | 即时消耗金币 | 赛季自动结算 |
| 策略深度 | 低（付费即可） | 高（设施+教练+上场时间） |
| 真实感 | 低 | 高（符合经理模式） |
| 不确定性 | 无 | 有（随机波动） |
| 预算用途 | 直接加点 | 设施+教练+招募 |

## 总结

球队发展系统将球员培养从"付费变强"转变为"资源管理策略"，更符合篮球经理游戏的核心体验。玩家需要：

1. **投资长期设施** - 升级训练设施获得持续加成
2. **雇佣合适教练** - 优秀教练提升成长效率
3. **合理分配上场时间** - 给有潜力的球员更多机会
4. **平衡预算** - 在设施、教练、招募间做出取舍

这种设计增加了游戏的策略深度和可玩性，让球员发展过程更有期待感和成就感。
