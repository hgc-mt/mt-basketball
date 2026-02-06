# 球员成长系统文档

## 系统概述

新的球员成长系统实现了科学的潜力值转化机制、培养系统和转会逻辑，确保数值变化符合篮球运动规律和球员成长逻辑。

## 一、潜力值转化机制

### 1.1 核心转化公式

```
年度成长值 = 潜力差值 × 转化率 × 培养效率 × (1 + 出场时间加成) × 随机因素 + 天赋加成

其中：
- 潜力差值 = 当前潜力值 - 当前能力值
- 转化率：大一15%，大二20%，大三25%，大四30%
- 培养效率：最低50%，最高150%
- 出场时间加成：最多+20%
- 随机因素：±10%
```

### 1.2 成长限制

| 年级 | 最大成长值 | 说明 |
|------|-----------|------|
| 大一 | +8 | 适应期，成长较慢 |
| 大二 | +10 | 黄金成长期 |
| 大三 | +8 | 稳定发展期 |
| 大四 | +6 | 成熟期，接近上限 |

### 1.3 潜力值衰减

未使用的潜力值每年会衰减：
- 大一：保留95%
- 大二：保留90%
- 大三：保留85%
- 大四：保留80%

这模拟了随着年龄增长，潜力逐渐被固定的现实。

## 二、培养系统

### 2.1 培养级别

| 级别 | 效率 | 说明 |
|------|------|------|
| minimal | 50% | 最低投入，几乎不分配资源 |
| low | 75% | 低投入，资源有限 |
| normal | 100% | 正常投入，标准培养 |
| high | 125% | 高投入，重点培养 |
| maximum | 150% | 最大投入，全力培养 |

### 2.2 属性成长分配

成长值按位置特点分配：
- **重点属性**（每个位置4个）：各获得40%成长值
- **其他属性**：各获得10%成长值

### 2.3 天赋加成

每个天赋提供+0.5能力值加成，并影响特定属性：
- 得分天赋：scoring +2, shooting +1
- 防守天赋：defense +2, stealing +1
- 篮板天赋：rebounding +2, strength +1
- 等等

## 三、转会系统

### 3.1 转会触发条件

#### 培养资源不足
- 连续2年培养级别为minimal或low
- 不满意度达到60%

#### 出场时间不足
- 连续2年出场时间低于30%
- 不满意度达到70%

#### 球队战绩不佳
- 连续2年胜率低于30%

#### 潜力未开发
- 潜力值≥80但培养不足

### 3.2 不满意度计算

```
满意度 = 50
+ (平均培养级别 - 60) × 0.3
+ (平均出场时间 - 0.5) × 40
+ (胜率 - 0.5) × 30
+ (开发程度 - 0.7) × 20  [仅高潜力球员]
```

### 3.3 转会影响

#### 负面效果（适应期）
- 能力值下降3点
- 所有属性下降2点
- 适应期：1年

#### 正面效果（适应后）
- 第一年额外成长+2
- 动机提升15%

## 四、API 使用示例

### 4.1 计算年度成长

```javascript
const growthSystem = new PlayerGrowthSystem(gameStateManager);

const player = {
    year: 2,
    rating: 65,
    potential: 78,
    attributes: { ... },
    talents: [{ name: '得分天赋' }]
};

const result = growthSystem.calculateYearlyGrowth(player, 'high', 0.7);

// 结果：
// {
//     oldRating: 65,
//     newRating: 72,
//     ratingIncrease: 7,
//     oldPotential: 78,
//     newPotential: 75,
//     potentialDecrease: 3,
//     attributesGrowth: { scoring: 3, shooting: 2, ... }
// }
```

### 4.2 检查转会可能性

```javascript
const transferCheck = growthSystem.checkTransferTrigger(player, {
    winRate: 0.25,
    poorSeasons: 2
});

// 结果：
// {
//     willTransfer: true,
//     transferProbability: 0.75,
//     triggers: ['培养资源不足', '球队战绩不佳'],
//     satisfaction: 35,
//     recommendedAction: '球员极有可能转会，建议立即增加培养资源'
// }
```

### 4.3 生成培养报告

```javascript
const report = growthSystem.generateDevelopmentReport(player);

// 结果：
// {
//     playerName: '张三',
//     currentRating: 68,
//     currentPotential: 80,
//     projectedGrowth: 6,
//     projectedRating: 74,
//     remainingPotential: 4,
//     transferRisk: 0.3,
//     satisfaction: 65,
//     recommendations: '球员状态良好，继续当前培养策略',
//     attributesToFocus: ['shooting', 'defense'],
//     developmentStage: { stage: 'developing', label: '发展期' }
// }
```

## 五、配置参数

### 5.1 成长配置

```javascript
growthConfig: {
    conversionRate: { 1: 0.15, 2: 0.20, 3: 0.25, 4: 0.30 },
    trainingEfficiency: {
        minimal: 0.5,
        low: 0.75,
        normal: 1.0,
        high: 1.25,
        maximum: 1.5
    },
    randomFactor: 0.1
}
```

### 5.2 潜力衰减配置

```javascript
potentialDecay: {
    retentionRate: { 1: 0.95, 2: 0.90, 3: 0.85, 4: 0.80 },
    maxPotential: { 1: 95, 2: 92, 3: 88, 4: 85 }
}
```

### 5.3 转会配置

```javascript
transferConfig: {
    triggerConditions: {
        lowTraining: { consecutiveYears: 2, minDissatisfaction: 60 },
        lowPlayingTime: { consecutiveYears: 2, minDissatisfaction: 70 },
        poorTeamPerformance: { consecutiveYears: 2, maxWinRate: 0.3 }
    },
    transferPenalty: { ratingDrop: 3, adaptationPeriod: 1 },
    transferBonus: { firstYear: 2, motivationBoost: 0.15 }
}
```

## 六、与旧系统对比

| 特性 | 旧系统 | 新系统 |
|------|--------|--------|
| 成长机制 | 固定加成 | 基于潜力的动态转化 |
| 培养影响 | 无 | 5个级别，效率50%-150% |
| 出场时间 | 无影响 | 影响成长速度 |
| 潜力衰减 | 线性减少 | 未使用潜力逐年衰减 |
| 转会系统 | 无 | 完整的触发条件和影响 |
| 天赋加成 | 固定值 | 动态计算，影响成长 |
| 随机因素 | 固定范围 | 正态分布，更真实 |

## 七、实施建议

1. **平衡性调整**：根据实际游戏数据调整转化率和效率参数
2. **AI行为**：为电脑球队实现自动培养决策
3. **UI展示**：在球员界面显示成长预测和满意度
4. **事件系统**：添加与成长和转会相关的事件
5. **数据分析**：收集玩家数据，持续优化参数
