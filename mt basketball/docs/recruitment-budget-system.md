# 招募预算系统文档

## 概述

招募预算系统是篮球经理游戏的核心经济系统之一，用于管理球队在球员招募过程中的资金投入。通过多种途径获取预算，用于提升球员兴趣度、进行招募行动等。

---

## 系统架构

### 核心文件

```
js/modules/recruitmentBudgetManager.js  # 预算管理器核心
js/modules/recruitmentCompetitionSystem.js  # 招募竞争系统（消耗预算）
js/modules/recruitmentInterface.js  # 招募界面（显示预算）
js/modules/gameStateManager.js  # 游戏状态管理（存储预算）
```

### 数据结构

```javascript
// 游戏状态中的预算字段
{
    recruitmentBudget: 50000,  // 当前招募预算（单位：美元）
}
```

---

## 预算获取途径

### 1. 赛季奖励

| 事件 | 奖励金额 | 说明 |
|------|----------|------|
| 每赢一场比赛 | +$5,000 | 常规赛胜利奖励 |
| 每输一场比赛 | +$1,000 | 参与安慰奖 |
| 进入季后赛 | +$50,000 | 季后赛资格奖励 |
| 获得联盟冠军 | +$100,000 | 分区冠军奖励 |
| 获得全国冠军 | +$200,000 | 总冠军奖励 |
| 全胜赛季 | +$300,000 | 常规赛全胜额外奖励 |

**触发时机**：
- 比赛结束时自动计算（胜负奖励）
- 赛季结束时统一发放（季后赛、冠军奖励）

**代码示例**：
```javascript
// 比赛结束调用
window.recruitmentBudgetManager.onGameEnd(isWin, {
    winStreak: 5,           // 当前连胜场次
    opponentRank: 3,        // 对手排名
    wasBehindBy20: true,    // 是否曾落后20分
    buzzerBeater: false     // 是否绝杀
});

// 赛季结束调用
window.recruitmentBudgetManager.onSeasonEnd({
    madePlayoffs: true,
    wonConference: true,
    wonChampionship: false,
    wins: 28,
    losses: 2,
    rankPercentile: 5      // 排名前5%
});
```

---

### 2. 球员发展奖励

| 事件 | 奖励金额 | 说明 |
|------|----------|------|
| 能力值提升 | +$3,000/点 | 球员能力值每提升1点 |
| 球员毕业 | +$10,000 | 大四球员正常毕业 |
| 球员进入NBA | +$50,000 | 球员被NBA选中 |
| 入选联盟最佳阵容 | +$20,000 | All-Conference |
| 入选全美最佳阵容 | +$50,000 | All-American |
| 获得个人奖项 | +$30,000 | 各类个人荣誉 |

**触发时机**：
- 球员训练后能力值提升
- 赛季结束球员毕业
- NBA选秀结果公布
- 赛季奖项公布

**代码示例**：
```javascript
// 球员能力提升
window.recruitmentBudgetManager.onPlayerImprovement(player, 3);  // 提升3点

// 球员毕业
window.recruitmentBudgetManager.onPlayerGraduate(player);

// 球员进入NBA
window.recruitmentBudgetManager.onPlayerToNBA(player);

// 球员获奖
window.recruitmentBudgetManager.onPlayerAward(player, 'all_conference');
```

---

### 3. 特殊成就奖励

| 成就 | 奖励金额 | 触发条件 |
|------|----------|----------|
| 3连胜 | +$10,000 | 连续赢得3场比赛 |
| 5连胜 | +$20,000 | 连续赢得5场比赛 |
| 10连胜 | +$50,000 | 连续赢得10场比赛 |
| 击败强队 | +$15,000 | 击败排名前10的球队 |
| 以弱胜强 | +$25,000 | 排名差距>20的逆转 |
| 20分大逆转 | +$15,000 | 曾落后20分以上最终获胜 |
| 绝杀获胜 | +$10,000 | 最后5秒内反超获胜 |

**触发时机**：比赛结束时自动检测

**注意**：连胜奖励可叠加，10连胜时可同时获得3连、5连、10连奖励

---

### 4. 基础收入

| 类型 | 金额 | 频率 |
|------|------|------|
| 每日基础收入 | +$2,000 | 每天 |
| 每周招募基金 | +$15,000 | 每周一 |
| 月度招募拨款 | +$50,000 | 每月1号 |
| 校友捐赠 | $5,000~25,000 | 随机（10%概率/天） |

**代码示例**：
```javascript
// 每日更新（应在游戏日期推进时调用）
window.recruitmentBudgetManager.dailyUpdate();

// 每周更新
window.recruitmentBudgetManager.weeklyUpdate();

// 每月更新
window.recruitmentBudgetManager.monthlyUpdate();
```

---

## 预算消耗

### 招募行动成本

| 行动 | 成本 | 效果 |
|------|------|------|
| 校园参观 | $5,000 | 兴趣度+10~20% |
| 家访 | $8,000 | 兴趣度+15~25% |
| 展示设施 | $2,000 | 兴趣度+5~15% |
| 强调学术 | $1,000 | 兴趣度+3~10% |
| 承诺上场时间 | $0 | 兴趣度+5~15% |
| 提供奖学金 | $0 | 兴趣度+15~25% |

**代码示例**：
```javascript
// 消耗预算
const success = window.recruitmentBudgetManager.spendBudget(5000, '校园参观');
if (!success) {
    // 预算不足处理
}
```

---

## 界面显示

### 招募中心头部显示

在招募中心页面顶部显示当前预算：

```
┌─────────────────────────────────────────────────────────────┐
│ 球员招募中心                                                 │
│                                                             │
│ 资源池: 156  新生: 89  自由球员: 45  转学生: 22  预算: $45K │
└─────────────────────────────────────────────────────────────┘
```

### 预算帮助弹窗

点击预算旁的"?"按钮可查看完整的预算获取方式说明。

---

## API 参考

### RecruitmentBudgetManager 类

#### 构造函数
```javascript
constructor(gameStateManager)
```

#### 核心方法

**initializeBudget()**
- 初始化预算（首次游戏或重置时使用）
- 初始值：$50,000

**getCurrentBudget()**
- 返回：number - 当前预算金额

**addBudget(amount, reason, category)**
- 参数：
  - amount: number - 增加的金额
  - reason: string - 原因说明
  - category: string - 类别（game/season/player_development/daily/weekly/monthly/other）
- 返回：boolean - 是否成功

**spendBudget(amount, reason)**
- 参数：
  - amount: number - 消耗金额
  - reason: string - 原因说明
- 返回：boolean - 是否有足够预算

**hasEnoughBudget(amount)**
- 参数：amount: number
- 返回：boolean

#### 事件处理方法

**onGameEnd(isWin, gameStats)**
- 比赛结束时调用，自动计算奖励

**onSeasonEnd(seasonStats)**
- 赛季结束时调用，发放赛季奖励

**onPlayerImprovement(player, improvement)**
- 球员能力提升时调用

**onPlayerGraduate(player)**
- 球员毕业时调用

**onPlayerToNBA(player)**
- 球员进入NBA时调用

**onPlayerAward(player, awardType)**
- 球员获奖时调用

**dailyUpdate()**
- 每日更新调用（基础收入+随机捐赠）

**weeklyUpdate()**
- 每周更新调用

**monthlyUpdate()**
- 每月更新调用

#### 工具方法

**formatBudget(amount)**
- 格式化预算显示（如：$50,000 → $50K）

**getStats()**
- 获取预算统计信息
- 返回：{ totalEarned, totalSpent, currentBudget, netIncome, seasonEarnings }

---

## 配置参数

### 预算配置（recruitmentBudgetManager.config）

```javascript
{
    // 初始预算
    initialBudget: 50000,
    
    // 赛季奖励
    seasonRewards: {
        winGame: 5000,
        loseGame: 1000,
        makePlayoffs: 50000,
        winConference: 100000,
        winChampionship: 200000,
        perfectSeason: 300000
    },
    
    // 球员发展奖励
    playerDevelopment: {
        ratingImprovement: 3000,
        playerGraduate: 10000,
        playerToNBA: 50000,
        playerAllConference: 20000,
        playerAllAmerican: 50000,
        playerAward: 30000
    },
    
    // 声望奖励
    prestigeRewards: {
        top5: 150000,
        top10: 120000,
        top25: 100000,
        top50: 70000,
        top75: 40000,
        other: 20000
    },
    
    // 特殊事件奖励
    specialEvents: {
        winStreak3: 10000,
        winStreak5: 20000,
        winStreak10: 50000,
        beatTopTeam: 15000,
        upsetWin: 25000,
        rivalryWin: 20000,
        comebackWin: 15000,
        buzzerBeater: 10000
    },
    
    // 基础收入
    baseIncome: {
        daily: 2000,
        weekly: 15000,
        monthly: 50000
    },
    
    // 校友捐赠
    alumniDonation: {
        min: 5000,
        max: 25000,
        chance: 0.1
    }
}
```

---

## 使用示例

### 场景1：比赛胜利后获得预算

```javascript
// 在游戏引擎中，比赛结束后调用
function onGameFinished(gameResult) {
    const gameStats = {
        winStreak: gameResult.winStreak,
        opponentRank: gameResult.opponent.rank,
        teamRank: gameResult.team.rank,
        wasBehindBy20: gameResult.maxDeficit >= 20,
        buzzerBeater: gameResult.buzzerBeater
    };
    
    const earned = window.recruitmentBudgetManager.onGameEnd(
        gameResult.isWin, 
        gameStats
    );
    
    console.log(`获得招募预算: $${earned.toLocaleString()}`);
}
```

### 场景2：检查预算并执行招募行动

```javascript
function performRecruitmentAction(playerId, actionType) {
    const costs = {
        'campus_visit': 5000,
        'home_visit': 8000,
        'highlight_facilities': 2000,
        'emphasize_academics': 1000
    };
    
    const cost = costs[actionType];
    
    if (!window.recruitmentBudgetManager.hasEnoughBudget(cost)) {
        showNotification('招募预算不足！', 'warning');
        return false;
    }
    
    // 执行行动
    const success = window.recruitmentBudgetManager.spendBudget(cost, actionType);
    
    if (success) {
        // 提升球员兴趣度
        increasePlayerInterest(playerId, actionType);
        showNotification(`行动成功！消耗 $${cost.toLocaleString()}`, 'success');
    }
    
    return success;
}
```

### 场景3：显示预算统计

```javascript
function showBudgetStats() {
    const stats = window.recruitmentBudgetManager.getStats();
    
    console.log('=== 招募预算统计 ===');
    console.log(`当前预算: $${stats.currentBudget.toLocaleString()}`);
    console.log(`总收入: $${stats.totalEarned.toLocaleString()}`);
    console.log(`总支出: $${stats.totalSpent.toLocaleString()}`);
    console.log(`净收入: $${stats.netIncome.toLocaleString()}`);
    console.log('赛季收入记录:', stats.seasonEarnings);
}
```

---

## 注意事项

1. **预算持久化**：预算数据会自动保存到游戏存档中
2. **线程安全**：所有预算操作都通过 gameStateManager 进行状态管理
3. **通知机制**：预算变动时会自动显示通知
4. **格式化显示**：大额预算会自动格式化为 K/M 格式（如 $50K, $1.2M）

---

## 未来扩展

可能的扩展功能：
- 预算借贷系统（允许透支，但有利息）
- 赞助商系统（长期收入来源）
- 预算转移（赛季间结转）
- 预算投资（风险收益）

---

## 更新日志

### v1.0 (2026-02-09)
- 初始版本发布
- 实现6种预算获取途径
- 实现招募行动消耗
- 添加UI显示和帮助弹窗
