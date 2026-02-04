# 接口体系文档

## 目录
1. [概述](#概述)
2. [架构设计](#架构设计)
3. [接口规范](#接口规范)
4. [核心接口管理器](#核心接口管理器)
5. [接口适配器](#接口适配器)
6. [使用指南](#使用指南)
7. [错误处理](#错误处理)
8. [测试用例](#测试用例)

---

## 概述

本接口体系为篮球游戏管理系统提供标准化的模块间通信机制，确保各功能模块通过松耦合的方式进行交互，提高系统的可维护性和扩展性。

### 主要特性
- **标准化通信**: 所有模块间通信通过统一接口进行
- **松耦合设计**: 模块间通过接口依赖，而非直接依赖
- **事件驱动**: 支持发布-订阅模式的事件机制
- **错误处理**: 统一的错误处理和响应格式
- **中间件支持**: 支持日志、性能监控等中间件
- **版本管理**: 接口版本控制，确保兼容性

---

## 架构设计

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                   核心接口管理器                      │
│              (CoreInterfaceManager)                   │
├─────────────────────────────────────────────────────────────┤
│  - 接口注册与管理                                     │
│  - 事件总线                                          │
│  - 中间件链                                        │
│  - 接口调用路由                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─────────────────────┬─────────────────────┐
                            │                     │                     │
                    ┌───────▼────────┐    ┌───────▼────────┐    ┌───────▼────────┐
                    │  奖学金计算适配器  │    │  赛程管理适配器  │    │  谈判管理适配器  │
                    │ (Scholarship   │    │ (Schedule       │    │ (Negotiation    │
                    │  Calculator)   │    │  Manager)       │    │  Manager)       │
                    └────────────────┘    └────────────────┘    └────────────────┘
                            │                     │                     │
                            └─────────────────────┴─────────────────────┘
                                                  │
                            ┌─────────────────────▼─────────────────────┐
                            │          功能模块层                     │
                            │  - TeamManager                            │
                            │  - SeasonManager                          │
                            │  - NegotiationManager                      │
                            │  - EnhancedNegotiationManager              │
                            │  - 其他业务模块...                        │
                            └─────────────────────────────────────────────┘
```

### 组件说明

#### 1. 核心接口管理器 (CoreInterfaceManager)
- **职责**: 管理所有接口注册、调用和事件分发
- **位置**: `js/modules/coreInterfaceManager.js`
- **版本**: 2.0.0

#### 2. 接口规范 (InterfaceSpecifications)
- **职责**: 定义所有接口的规范、方法签名和错误代码
- **位置**: `js/modules/interfaceSpecifications.js`
- **包含内容**:
  - BaseInterface: 接口基类
  - InterfaceSpecs: 接口规范定义
  - ErrorCodes: 错误代码常量
  - InterfaceResponse: 统一响应格式

#### 3. 接口适配器
- **职责**: 实现具体接口规范，适配现有功能模块
- **位置**: `js/modules/adapters/`
- **包含适配器**:
  - ScholarshipCalculatorAdapter: 奖学金计算适配器
  - ScheduleManagerAdapter: 赛程管理适配器
  - NegotiationManagerAdapter: 谈判管理适配器
  - DataSyncManagerAdapter: 数据同步适配器

---

## 接口规范

### IScholarshipCalculator (奖学金计算接口)

#### 接口描述
提供奖学金份额的计算和验证功能，支持按比例计算奖学金使用情况。

#### 方法列表

##### 1. calculateUsedShare(team)
计算已使用的奖学金份额

**输入参数**:
```javascript
{
    team: Team对象  // 球队对象
}
```

**输出格式**:
```javascript
{
    success: boolean,     // 是否成功
    share: number,        // 已使用的奖学金份额
    timestamp: string      // 时间戳
}
```

**错误代码**:
- `TEAM_NOT_FOUND`: 球队对象不存在
- `INVALID_TEAM`: 球队对象无效

**使用示例**:
```javascript
const result = await coreInterfaceManager.invoke(
    'IScholarshipCalculator',
    'calculateUsedShare',
    team
);

if (result.success) {
    console.log(`已使用奖学金份额: ${result.data.share}`);
}
```

##### 2. calculateAvailableShare(team)
计算可用的奖学金份额

**输入参数**:
```javascript
{
    team: Team对象  // 球队对象
}
```

**输出格式**:
```javascript
{
    success: boolean,     // 是否成功
    share: number,        // 可用的奖学金份额
    total: number,        // 总奖学金份额
    used: number,         // 已使用份额
    percentage: number,    // 使用百分比
    timestamp: string      // 时间戳
}
```

**使用示例**:
```javascript
const result = await coreInterfaceManager.invoke(
    'IScholarshipCalculator',
    'calculateAvailableShare',
    team
);

if (result.success) {
    console.log(`可用份额: ${result.data.share}/${result.data.total}`);
}
```

##### 3. validateScholarshipAvailability(player, team)
验证奖学金可用性

**输入参数**:
```javascript
{
    player: Player对象,  // 球员对象
    team: Team对象     // 球队对象
}
```

**输出格式**:
```javascript
{
    success: boolean,        // 是否成功
    canSign: boolean,        // 是否可以签约
    currentUsed: number,     // 当前已使用份额
    playerShare: number,      // 球员需要的份额
    wouldBeUsed: number,     // 签约后总使用份额
    totalAvailable: number,   // 总可用份额
    availableAfter: number,   // 签约后可用份额
    reason: string,          // 原因说明
    timestamp: string        // 时间戳
}
```

**使用示例**:
```javascript
const result = await coreInterfaceManager.invoke(
    'IScholarshipCalculator',
    'validateScholarshipAvailability',
    player,
    team
);

if (result.success && result.data.canSign) {
    console.log('可以签约该球员');
} else {
    console.log(result.data.reason);
}
```

---

### IScheduleManager (赛程管理接口)

#### 接口描述
管理赛季赛程的生成、日期同步和比赛查询。

#### 方法列表

##### 1. generateSchedule(teams, startDate)
生成赛季赛程

**输入参数**:
```javascript
{
    teams: Array<Team>,  // 所有球队
    startDate: Date       // 赛季开始日期
}
```

**输出格式**:
```javascript
{
    success: boolean,       // 是否成功
    schedule: Array<Game>,  // 赛程数组
    totalGames: number,     // 总比赛场数
    startDate: Date,        // 赛季开始日期
    endDate: Date,          // 赛季结束日期
    timestamp: string       // 时间戳
}
```

**错误代码**:
- `INVALID_TEAMS`: 球队列表无效
- `INVALID_DATE`: 日期无效
- `GENERATION_FAILED`: 生成失败

**使用示例**:
```javascript
const result = await coreInterfaceManager.invoke(
    'IScheduleManager',
    'generateSchedule',
    allTeams,
    new Date(2024, 9, 1)  // 2024年10月1日
);

if (result.success) {
    console.log(`生成赛程: ${result.data.totalGames} 场比赛`);
}
```

##### 2. syncDates(currentDate, schedule)
同步赛程日期

**输入参数**:
```javascript
{
    currentDate: Date,       // 当前游戏日期
    schedule: Array<Game>   // 赛程数组
}
```

**输出格式**:
```javascript
{
    success: boolean,       // 是否成功
    updatedCount: number,    // 更新的比赛数量
    schedule: Array<Game>,  // 更新后的赛程
    seasonStartDate: Date,  // 赛季开始日期
    timestamp: string       // 时间戳
}
```

**使用示例**:
```javascript
const result = await coreInterfaceManager.invoke(
    'IScheduleManager',
    'syncDates',
    gameState.currentDate,
    gameState.gameSchedule
);

if (result.success) {
    console.log(`更新了 ${result.data.updatedCount} 场比赛的日期`);
}
```

##### 3. getNextGame(teamId, schedule)
获取下一场比赛

**输入参数**:
```javascript
{
    teamId: number,        // 球队ID
    schedule: Array<Game>   // 赛程数组
}
```

**输出格式**:
```javascript
{
    success: boolean,   // 是否成功
    game: Game,         // 下一场比赛对象
    daysUntil: number,   // 距离比赛天数
    isHome: boolean,     // 是否主场比赛
    opponent: Team,      // 对手球队
    timestamp: string     // 时间戳
}
```

**使用示例**:
```javascript
const result = await coreInterfaceManager.invoke(
    'IScheduleManager',
    'getNextGame',
    userTeam.id,
    gameSchedule
);

if (result.success) {
    console.log(`下一场比赛: ${result.data.daysUntil} 天后对阵 ${result.data.opponent.name}`);
}
```

---

### INegotiationManager (谈判管理接口)

#### 接口描述
管理球员和教练的签约谈判流程。

#### 方法列表

##### 1. startNegotiation(targetId, targetType, initialOffer)
开始谈判

**输入参数**:
```javascript
{
    targetId: number,      // 目标ID
    targetType: string,    // 目标类型 (player/coach)
    initialOffer: Object   // 初始报价
}
```

**输出格式**:
```javascript
{
    success: boolean,         // 是否成功
    negotiationId: number,    // 谈判ID
    negotiation: Object,      // 谈判对象
    message: string,          // 提示信息
    timestamp: string        // 时间戳
}
```

**错误代码**:
- `TARGET_NOT_FOUND`: 目标不存在
- `INVALID_OFFER`: 报价无效
- `NEGOTIATION_EXISTS`: 谈判已存在

**使用示例**:
```javascript
const result = await coreInterfaceManager.invoke(
    'INegotiationManager',
    'startNegotiation',
    playerId,
    'player',
    { scholarship: 0.8, playingTime: 25 }
);

if (result.success) {
    console.log(`谈判已开始，ID: ${result.data.negotiationId}`);
}
```

##### 2. updateOffer(negotiationId, newOffer)
更新报价

**输入参数**:
```javascript
{
    negotiationId: number,  // 谈判ID
    newOffer: Object       // 新报价
}
```

**输出格式**:
```javascript
{
    success: boolean,              // 是否成功
    negotiation: Object,           // 更新后的谈判对象
    acceptanceProbability: number,   // 接受概率
    message: string,               // 提示信息
    timestamp: string             // 时间戳
}
```

**使用示例**:
```javascript
const result = await coreInterfaceManager.invoke(
    'INegotiationManager',
    'updateOffer',
    negotiationId,
    { scholarship: 0.9, playingTime: 30 }
);

if (result.success) {
    console.log(`报价已更新，接受概率: ${result.data.acceptanceProbability}%`);
}
```

##### 3. completeNegotiation(negotiationId, accept)
完成谈判

**输入参数**:
```javascript
{
    negotiationId: number,  // 谈判ID
    accept: boolean        // 是否接受
}
```

**输出格式**:
```javascript
{
    success: boolean,        // 是否成功
    signedTarget: Object,    // 签约对象
    message: string,          // 提示信息
    timestamp: string        // 时间戳
}
```

**使用示例**:
```javascript
const result = await coreInterfaceManager.invoke(
    'INegotiationManager',
    'completeNegotiation',
    negotiationId,
    true  // 接受
);

if (result.success) {
    console.log(`成功签约: ${result.data.signedTarget.name}`);
}
```

---

### IDataSyncManager (数据同步接口)

#### 接口描述
提供发布-订阅模式的事件机制，用于模块间数据同步。

#### 方法列表

##### 1. publishEvent(eventType, data)
发布同步事件

**输入参数**:
```javascript
{
    eventType: string,  // 事件类型
    data: Object       // 事件数据
}
```

**输出格式**:
```javascript
{
    success: boolean,        // 是否成功
    eventId: string,        // 事件ID
    eventType: string,       // 事件类型
    listenerCount: number,    // 监听器数量
    results: Array,          // 各监听器执行结果
    timestamp: string        // 时间戳
}
```

**支持的事件类型**:
- `scholarshipUpdated`: 奖学金更新
- `playerSigned`: 球员签约
- `playerReleased`: 球员释放
- `scheduleGenerated`: 赛程生成
- `scheduleUpdated`: 赛程更新
- `negotiationStarted`: 谈判开始
- `negotiationCompleted`: 谈判完成
- `negotiationFailed`: 谈判失败
- `gameCompleted`: 比赛完成
- `seasonStarted`: 赛季开始
- `seasonEnded`: 赛季结束
- `dataSync`: 数据同步
- `error`: 错误

**使用示例**:
```javascript
const result = await coreInterfaceManager.invoke(
    'IDataSyncManager',
    'publishEvent',
    'scholarshipUpdated',
    { playerId: 123, scholarshipPercent: 0.8 }
);

if (result.success) {
    console.log(`事件已发布到 ${result.data.listenerCount} 个监听器`);
}
```

##### 2. subscribeEvent(eventType, callback)
订阅同步事件

**输入参数**:
```javascript
{
    eventType: string,    // 事件类型
    callback: Function   // 回调函数
}
```

**输出格式**:
```javascript
{
    success: boolean,        // 是否成功
    subscriptionId: string,   // 订阅ID
    eventType: string,       // 事件类型
    timestamp: string        // 时间戳
}
```

**使用示例**:
```javascript
const result = await coreInterfaceManager.invoke(
    'IDataSyncManager',
    'subscribeEvent',
    'playerSigned',
    (eventData) => {
        console.log('球员签约事件:', eventData);
        // 更新UI或其他操作
    }
);

if (result.success) {
    const subscriptionId = result.data.subscriptionId;
    // 保存subscriptionId用于后续取消订阅
}
```

##### 3. unsubscribeEvent(subscriptionId)
取消订阅事件

**输入参数**:
```javascript
{
    subscriptionId: string  // 订阅ID
}
```

**输出格式**:
```javascript
{
    success: boolean,        // 是否成功
    subscriptionId: string,   // 订阅ID
    eventType: string,       // 事件类型
    timestamp: string        // 时间戳
}
```

**使用示例**:
```javascript
const result = await coreInterfaceManager.invoke(
    'IDataSyncManager',
    'unsubscribeEvent',
    subscriptionId
);

if (result.success) {
    console.log('已取消事件订阅');
}
```

---

## 核心接口管理器

### 初始化

```javascript
// 创建核心接口管理器实例
const coreInterfaceManager = new CoreInterfaceManager(gameStateManager);

// 初始化
await coreInterfaceManager.initialize();
```

### 注册接口

```javascript
// 注册奖学金计算接口
const scholarshipAdapter = new ScholarshipCalculatorAdapter(gameStateManager);
coreInterfaceManager.registerInterface('IScholarshipCalculator', scholarshipAdapter);

// 注册赛程管理接口
const scheduleAdapter = new ScheduleManagerAdapter(gameStateManager);
coreInterfaceManager.registerInterface('IScheduleManager', scheduleAdapter);

// 注册谈判管理接口
const negotiationAdapter = new NegotiationManagerAdapter(gameStateManager);
coreInterfaceManager.registerInterface('INegotiationManager', negotiationAdapter);

// 注册数据同步接口
const dataSyncAdapter = new DataSyncManagerAdapter(gameStateManager);
coreInterfaceManager.registerInterface('IDataSyncManager', dataSyncAdapter);
```

### 调用接口方法

```javascript
// 方式1: 直接调用
const result = await coreInterfaceManager.invoke(
    'IScholarshipCalculator',
    'calculateUsedShare',
    team
);

// 方式2: 获取接口后调用
const scholarshipInterface = coreInterfaceManager.getInterface('IScholarshipCalculator');
const result = await scholarshipInterface.calculateUsedShare(team);
```

### 事件订阅

```javascript
// 订阅事件
const subscriptionId = coreInterfaceManager.subscribeEvent(
    'playerSigned',
    (eventData) => {
        console.log('球员签约:', eventData);
        // 处理事件
    }
);

// 发布事件
coreInterfaceManager.publishEvent('playerSigned', {
    playerId: 123,
    playerName: '张三',
    scholarship: 0.8
});

// 取消订阅
coreInterfaceManager.unsubscribeEvent(subscriptionId);
```

### 添加中间件

```javascript
// 添加日志中间件
coreInterfaceManager.addMiddleware({
    name: 'CustomLoggingMiddleware',
    priority: 10,
    execute: (context) => {
        console.log(`[自定义日志] ${context.interfaceName}.${context.methodName}`);
        return context;
    }
});

// 添加验证中间件
coreInterfaceManager.addMiddleware({
    name: 'ValidationMiddleware',
    priority: 5,
    execute: (context) => {
        // 自定义验证逻辑
        if (context.args && context.args.length === 0) {
            context.error = '参数不能为空';
        }
        return context;
    }
});
```

### 获取状态

```javascript
const status = coreInterfaceManager.getStatus();
console.log('接口管理器状态:', status);

// 输出示例:
{
    version: '2.0.0',
    isInitialized: true,
    interfacesCount: 4,
    interfaces: [
        { name: 'IScholarshipCalculator', version: '1.0.0', validated: true },
        { name: 'IScheduleManager', version: '1.0.0', validated: true },
        { name: 'INegotiationManager', version: '1.0.0', validated: true },
        { name: 'IDataSyncManager', version: '1.0.0', validated: true }
    ],
    eventTypes: ['scholarshipUpdated', 'playerSigned', ...],
    middlewareCount: 5,
    middleware: ['LoggingMiddleware', 'ErrorHandlingMiddleware', ...]
}
```

---

## 接口适配器

### ScholarshipCalculatorAdapter

**文件位置**: `js/modules/adapters/scholarshipCalculatorAdapter.js`

**功能**:
- 计算已使用的奖学金份额
- 计算可用的奖学金份额
- 验证奖学金可用性

**关键特性**:
- 支持新旧数据结构
- 按球员实际奖学金比例计算
- 兼容Team类的calculateUsedScholarshipShare方法

### ScheduleManagerAdapter

**文件位置**: `js/modules/adapters/scheduleManagerAdapter.js`

**功能**:
- 生成赛季赛程
- 同步赛程日期
- 获取下一场比赛

**关键特性**:
- 基于当前游戏日期动态生成赛程
- 支持日期同步功能
- 提供比赛查询功能

### NegotiationManagerAdapter

**文件位置**: `js/modules/adapters/negotiationManagerAdapter.js`

**功能**:
- 开始谈判
- 更新报价
- 完成谈判
- 计算接受概率

**关键特性**:
- 支持球员和教练谈判
- 自动计算接受概率
- 集成奖学金验证

### DataSyncManagerAdapter

**文件位置**: `js/modules/adapters/dataSyncManagerAdapter.js`

**功能**:
- 发布同步事件
- 订阅同步事件
- 取消订阅事件
- 查询事件历史

**关键特性**:
- 发布-订阅模式
- 事件历史记录
- 支持事件筛选

---

## 使用指南

### 快速开始

1. **初始化接口管理器**:
```javascript
const coreInterfaceManager = new CoreInterfaceManager(gameStateManager);
await coreInterfaceManager.initialize();
```

2. **注册接口适配器**:
```javascript
const scholarshipAdapter = new ScholarshipCalculatorAdapter(gameStateManager);
coreInterfaceManager.registerInterface('IScholarshipCalculator', scholarshipAdapter);
```

3. **调用接口方法**:
```javascript
const result = await coreInterfaceManager.invoke(
    'IScholarshipCalculator',
    'calculateAvailableShare',
    team
);
```

4. **处理结果**:
```javascript
if (result.success) {
    // 处理成功结果
    console.log('结果:', result.data);
} else {
    // 处理错误
    console.error('错误:', result.error);
}
```

### 最佳实践

1. **始终检查返回的success字段**:
```javascript
const result = await coreInterfaceManager.invoke(...);
if (!result.success) {
    // 处理错误
    return;
}
// 处理成功结果
```

2. **使用事件订阅进行模块间通信**:
```javascript
// 模块A订阅事件
coreInterfaceManager.subscribeEvent('playerSigned', (data) => {
    updateUI(data);
});

// 模块B发布事件
coreInterfaceManager.publishEvent('playerSigned', playerData);
```

3. **利用中间件进行横切关注点**:
```javascript
// 添加性能监控
coreInterfaceManager.addMiddleware({
    name: 'PerformanceMonitor',
    priority: 1,
    execute: (context) => {
        if (context.duration > 1000) {
            console.warn(`性能警告: ${context.methodName} 耗时 ${context.duration}ms`);
        }
        return context;
    }
});
```

4. **错误处理**:
```javascript
try {
    const result = await coreInterfaceManager.invoke(...);
    if (!result.success) {
        throw new Error(result.error);
    }
    return result.data;
} catch (error) {
    console.error('操作失败:', error);
    // 显示用户友好的错误信息
}
```

---

## 错误处理

### 错误代码列表

#### 通用错误
- `UNKNOWN_ERROR`: 未知错误
- `INVALID_INPUT`: 输入无效
- `INVALID_DATA`: 数据无效
- `OPERATION_FAILED`: 操作失败

#### 球员相关
- `PLAYER_NOT_FOUND`: 球员不存在
- `INVALID_PLAYER`: 球员无效

#### 球队相关
- `TEAM_NOT_FOUND`: 球队不存在
- `INVALID_TEAM`: 球队无效
- `ROSTER_FULL`: 阵容已满

#### 谈判相关
- `NEGOTIATION_NOT_FOUND`: 谈判不存在
- `NEGOTIATION_EXISTS`: 谈判已存在
- `INVALID_OFFER`: 报价无效
- `ALREADY_SIGNED`: 已签约
- `INSUFFICIENT_SCHOLARSHIP`: 奖学金份额不足

#### 赛程相关
- `INVALID_TEAMS`: 球队列表无效
- `INVALID_DATE`: 日期无效
- `INVALID_SCHEDULE`: 赛程无效
- `NO_MORE_GAMES`: 没有更多比赛
- `GENERATION_FAILED`: 生成失败

#### 同步相关
- `INVALID_EVENT_TYPE`: 事件类型无效
- `INVALID_CALLBACK`: 回调函数无效
- `PUBLISH_FAILED`: 发布失败
- `SUBSCRIBE_FAILED`: 订阅失败
- `UNSUBSCRIBE_FAILED`: 取消订阅失败
- `SUBSCRIPTION_NOT_FOUND`: 订阅不存在

### 错误处理示例

```javascript
const result = await coreInterfaceManager.invoke(
    'IScholarshipCalculator',
    'validateScholarshipAvailability',
    player,
    team
);

if (!result.success) {
    switch (result.error) {
        case 'PLAYER_NOT_FOUND':
            console.error('球员不存在');
            break;
        case 'TEAM_NOT_FOUND':
            console.error('球队不存在');
            break;
        case 'INSUFFICIENT_SCHOLARSHIP':
            console.error('奖学金份额不足');
            break;
        default:
            console.error('未知错误:', result.error);
    }
    
    // 显示用户友好的错误信息
    showErrorToUser(result.message || '操作失败，请重试');
    return;
}

// 处理成功结果
console.log('验证结果:', result.data);
```

---

## 测试用例

详细的测试用例和测试结果报告请参见 `js/modules/tests/interfaceTestSuite.js` 文件。

---

## 版本历史

### v2.0.0 (当前版本)
- 实现核心接口管理器
- 添加奖学金计算接口
- 添加赛程管理接口
- 添加谈判管理接口
- 添加数据同步接口
- 实现中间件机制
- 实现事件总线

### v1.0.0
- 初始接口规范定义
- 基础接口管理器实现

---

## 联系与支持

如有问题或建议，请联系开发团队或查看项目文档。

---

*文档版本: 2.0.0*  
*最后更新: 2026-01-26*