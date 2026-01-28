[技术实现设计文档.md](https://github.com/user-attachments/files/24901282/default.md)
# 大学篮球经理 - PixiJS 技术实现设计文档

## 文档版本
- 版本：v1.0
- 创建日期：2026-01-26
- 技术栈：PixiJS v8 + TypeScript

---

## 一、技术架构概览

### 1.1 核心技术栈

**渲染引擎**
- PixiJS v8.x - 主渲染引擎
- WebGL / Canvas 自动降级支持

**UI框架**
- @pixi/ui v2.x - UI组件库
- @pixi/layout - 布局系统
- @pixi/spine (可选) - 动画系统

**开发语言**
- TypeScript 5.x - 类型安全
- ES2020+ 模块化

**状态管理**
- zustand - 轻量级状态管理
- immer - 不可变数据

**构建工具**
- Vite 5.x - 开发服务器和构建
- ESLint + Prettier - 代码规范

**其他依赖**
- gsap - 高性能动画库
- howler.js - 音频管理
- localforage - 本地存储增强

### 1.2 架构设计原则

1. **分层架构**
   - 表现层 (View Layer) - PixiJS 渲染
   - 业务逻辑层 (Logic Layer) - 游戏逻辑
   - 数据层 (Data Layer) - 状态和存储

2. **模块化设计**
   - 功能模块独立
   - 清晰的依赖关系
   - 易于单元测试

3. **组件化UI**
   - 可复用的UI组件
   - 统一的样式系统
   - 响应式布局

4. **事件驱动**
   - 解耦模块通信
   - 支持异步操作
   - 易于扩展

---

## 二、项目结构设计

### 2.1 目录结构

```
basketball-manager/
├── public/                      # 静态资源
│   ├── assets/                  # 游戏资源
│   │   ├── images/             # 图片资源
│   │   │   ├── ui/             # UI图标、背景
│   │   │   ├── players/        # 球员头像
│   │   │   └── teams/          # 球队标志
│   │   ├── fonts/              # 字体文件
│   │   ├── audio/              # 音频文件
│   │   │   ├── bgm/            # 背景音乐
│   │   │   └── sfx/            # 音效
│   │   └── spines/             # Spine动画(可选)
│   └── manifest.json           # 资源清单
│
├── src/
│   ├── main.ts                 # 应用入口
│   ├── app.ts                  # 主应用类
│   │
│   ├── core/                   # 核心系统
│   │   ├── Application.ts      # PixiJS应用封装
│   │   ├── SceneManager.ts     # 场景管理器
│   │   ├── ResourceLoader.ts   # 资源加载器
│   │   ├── EventBus.ts         # 事件总线
│   │   ├── AudioManager.ts     # 音频管理器
│   │   └── StorageManager.ts   # 存储管理器
│   │
│   ├── engine/                 # 游戏引擎
│   │   ├── GameEngine.ts       # 比赛模拟引擎
│   │   ├── TeamManager.ts      # 球队管理器
│   │   ├── PlayerManager.ts    # 球员管理器
│   │   ├── SeasonManager.ts    # 赛季管理器
│   │   ├── FinanceManager.ts   # 财务管理器
│   │   ├── MarketManager.ts    # 市场管理器
│   │   ├── ScoutingManager.ts  # 球探管理器
│   │   ├── CoachManager.ts     # 教练管理器
│   │   └── TrainingManager.ts  # 训练管理器
│   │
│   ├── models/                 # 数据模型
│   │   ├── Player.ts           # 球员模型
│   │   ├── Team.ts             # 球队模型
│   │   ├── Coach.ts            # 教练模型
│   │   ├── Game.ts             # 比赛模型
│   │   ├── Season.ts           # 赛季模型
│   │   └── GameState.ts        # 游戏状态
│   │
│   ├── scenes/                 # 游戏场景
│   │   ├── BaseScene.ts        # 场景基类
│   │   ├── LoadingScene.ts     # 加载场景
│   │   ├── MainMenuScene.ts    # 主菜单场景
│   │   ├── TeamScene.ts        # 球队管理场景
│   │   ├── ScheduleScene.ts    # 赛程场景
│   │   ├── GameScene.ts        # 比赛场景
│   │   ├── TrainingScene.ts    # 训练场景
│   │   ├── MarketScene.ts      # 市场场景
│   │   ├── ScoutingScene.ts    # 球探场景
│   │   ├── CoachScene.ts       # 教练场景
│   │   ├── FinanceScene.ts     # 财务场景
│   │   └── StandingsScene.ts   # 排名场景
│   │
│   ├── ui/                     # UI组件
│   │   ├── components/         # 基础组件
│   │   │   ├── Button.ts       # 按钮组件
│   │   │   ├── Panel.ts        # 面板组件
│   │   │   ├── Modal.ts        # 模态框组件
│   │   │   ├── List.ts         # 列表组件
│   │   │   ├── Card.ts         # 卡片组件
│   │   │   ├── ProgressBar.ts  # 进度条组件
│   │   │   ├── Tabs.ts         # 标签页组件
│   │   │   ├── Input.ts        # 输入框组件
│   │   │   ├── Dropdown.ts     # 下拉选择组件
│   │   │   ├── Slider.ts       # 滑块组件
│   │   │   ├── Checkbox.ts     # 复选框组件
│   │   │   ├── Radio.ts        # 单选框组件
│   │   │   ├── ScrollView.ts   # 滚动视图组件
│   │   │   ├── Table.ts        # 表格组件
│   │   │   └── Toast.ts        # 提示组件
│   │   │
│   │   ├── widgets/            # 复合组件
│   │   │   ├── PlayerCard.ts   # 球员卡片
│   │   │   ├── TeamCard.ts     # 球队卡片
│   │   │   ├── GameBoard.ts    # 比赛面板
│   │   │   ├── StatBar.ts      # 属性条
│   │   │   ├── TrainingPanel.ts # 训练面板
│   │   │   ├── MarketList.ts   # 市场列表
│   │   │   └── StandingsTable.ts # 排名表
│   │   │
│   │   ├── layouts/            # 布局组件
│   │   │   ├── Header.ts       # 顶部栏
│   │   │   ├── Navigation.ts   # 导航栏
│   │   │   ├── Container.ts    # 容器布局
│   │   │   └── Grid.ts         # 网格布局
│   │   │
│   │   └── theme/              # 主题系统
│   │       ├── Theme.ts        # 主题定义
│   │       ├── colors.ts       # 颜色配置
│   │       ├── fonts.ts        # 字体配置
│   │       └── styles.ts       # 样式配置
│   │
│   ├── utils/                  # 工具函数
│   │   ├── math.ts             # 数学工具
│   │   ├── random.ts           # 随机数工具
│   │   ├── formatter.ts        # 格式化工具
│   │   ├── validator.ts        # 验证工具
│   │   ├── animation.ts        # 动画工具
│   │   └── logger.ts           # 日志工具
│   │
│   ├── config/                 # 配置文件
│   │   ├── game.ts             # 游戏配置
│   │   ├── assets.ts           # 资源配置
│   │   ├── constants.ts        # 常量定义
│   │   └── settings.ts         # 设置配置
│   │
│   ├── stores/                 # 状态管理
│   │   ├── gameStore.ts        # 游戏状态
│   │   ├── teamStore.ts        # 球队状态
│   │   ├── playerStore.ts      # 球员状态
│   │   ├── uiStore.ts          # UI状态
│   │   └── settingsStore.ts    # 设置状态
│   │
│   ├── types/                  # 类型定义
│   │   ├── game.d.ts           # 游戏类型
│   │   ├── player.d.ts         # 球员类型
│   │   ├── team.d.ts           # 球队类型
│   │   ├── ui.d.ts             # UI类型
│   │   └── events.d.ts         # 事件类型
│   │
│   └── data/                   # 静态数据
│       ├── teams.json          # 球队数据
│       ├── names.json          # 姓名数据
│       ├── skills.json         # 技能数据
│       └── tactics.json        # 战术数据
│
├── tests/                      # 测试文件
│   ├── unit/                   # 单元测试
│   ├── integration/            # 集成测试
│   └── e2e/                    # 端到端测试
│
├── .vscode/                    # VSCode配置
├── node_modules/
├── package.json
├── tsconfig.json               # TypeScript配置
├── vite.config.ts              # Vite配置
├── .eslintrc.js                # ESLint配置
├── .prettierrc                 # Prettier配置
├── .gitignore
└── README.md
```

---

## 三、核心系统设计

### 3.1 应用初始化系统

**Application.ts - PixiJS应用封装**

```typescript
/**
 * 主应用类，负责初始化PixiJS和核心系统
 */
export class Application {
  private app: PIXI.Application;
  private sceneManager: SceneManager;
  private resourceLoader: ResourceLoader;
  private eventBus: EventBus;
  
  constructor(config: ApplicationConfig) {
    // 初始化PixiJS应用
    this.initPixiApp(config);
    
    // 初始化核心系统
    this.initCoreSystems();
    
    // 加载资源
    this.loadResources();
  }
  
  private initPixiApp(config: ApplicationConfig): void {
    // 配置PixiJS应用
    // 设置渲染器选项
    // 添加到DOM
  }
  
  private initCoreSystems(): void {
    // 初始化场景管理器
    // 初始化资源加载器
    // 初始化事件总线
    // 初始化音频管理器
    // 初始化存储管理器
  }
  
  async start(): Promise<void> {
    // 启动游戏主循环
  }
}
```

**关键配置项**
```typescript
interface ApplicationConfig {
  width: number;              // 画布宽度
  height: number;             // 画布高度
  backgroundColor: number;    // 背景色
  resolution: number;         // 分辨率
  antialias: boolean;         // 抗锯齿
  autoDensity: boolean;       // 自动密度
  resizeTo: HTMLElement;      // 自适应元素
}
```

### 3.2 场景管理系统

**SceneManager.ts - 场景管理器**

```typescript
/**
 * 场景管理器，负责场景的切换和生命周期管理
 */
export class SceneManager {
  private scenes: Map<string, BaseScene>;
  private currentScene: BaseScene | null;
  private container: PIXI.Container;
  
  constructor(container: PIXI.Container) {
    this.container = container;
    this.scenes = new Map();
  }
  
  /**
   * 注册场景
   */
  registerScene(name: string, scene: BaseScene): void {
    this.scenes.set(name, scene);
  }
  
  /**
   * 切换场景
   */
  async switchScene(name: string, params?: any): Promise<void> {
    // 退出当前场景
    if (this.currentScene) {
      await this.currentScene.exit();
      this.container.removeChild(this.currentScene);
    }
    
    // 进入新场景
    const nextScene = this.scenes.get(name);
    if (nextScene) {
      this.currentScene = nextScene;
      this.container.addChild(nextScene);
      await nextScene.enter(params);
    }
  }
  
  /**
   * 更新当前场景
   */
  update(deltaTime: number): void {
    if (this.currentScene) {
      this.currentScene.update(deltaTime);
    }
  }
}
```

**BaseScene.ts - 场景基类**

```typescript
/**
 * 场景基类，所有场景继承此类
 */
export abstract class BaseScene extends PIXI.Container {
  protected app: PIXI.Application;
  protected eventBus: EventBus;
  protected isActive: boolean = false;
  
  constructor(app: PIXI.Application) {
    super();
    this.app = app;
    this.eventBus = EventBus.getInstance();
  }
  
  /**
   * 场景进入时调用
   */
  async enter(params?: any): Promise<void> {
    this.isActive = true;
    await this.onCreate();
    this.onEnter(params);
  }
  
  /**
   * 场景退出时调用
   */
  async exit(): Promise<void> {
    this.onExit();
    this.isActive = false;
    await this.onDestroy();
  }
  
  /**
   * 场景创建时调用（只调用一次）
   */
  protected abstract onCreate(): Promise<void>;
  
  /**
   * 场景进入时调用（每次进入都调用）
   */
  protected abstract onEnter(params?: any): void;
  
  /**
   * 场景退出时调用
   */
  protected abstract onExit(): void;
  
  /**
   * 场景销毁时调用
   */
  protected abstract onDestroy(): Promise<void>;
  
  /**
   * 更新方法（每帧调用）
   */
  update(deltaTime: number): void {
    if (this.isActive) {
      this.onUpdate(deltaTime);
    }
  }
  
  protected abstract onUpdate(deltaTime: number): void;
}
```

### 3.3 资源管理系统

**ResourceLoader.ts - 资源加载器**

```typescript
/**
 * 资源加载器，封装PixiJS Assets API
 */
export class ResourceLoader {
  private static instance: ResourceLoader;
  private loadedBundles: Set<string> = new Set();
  
  static getInstance(): ResourceLoader {
    if (!this.instance) {
      this.instance = new ResourceLoader();
    }
    return this.instance;
  }
  
  /**
   * 初始化资源清单
   */
  async init(): Promise<void> {
    // 加载manifest.json
    const manifest = await fetch('/manifest.json').then(r => r.json());
    await Assets.init({ manifest });
  }
  
  /**
   * 加载资源包
   */
  async loadBundle(
    bundleName: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    if (this.loadedBundles.has(bundleName)) {
      return;
    }
    
    await Assets.loadBundle(bundleName, (progress) => {
      onProgress?.(progress);
    });
    
    this.loadedBundles.add(bundleName);
  }
  
  /**
   * 获取资源
   */
  get<T>(alias: string): T {
    return Assets.get<T>(alias);
  }
  
  /**
   * 卸载资源包
   */
  async unloadBundle(bundleName: string): Promise<void> {
    await Assets.unloadBundle(bundleName);
    this.loadedBundles.delete(bundleName);
  }
}
```

**manifest.json - 资源清单示例**

```json
{
  "bundles": [
    {
      "name": "common",
      "assets": [
        {
          "alias": "logo",
          "src": "/assets/images/ui/logo.png"
        },
        {
          "alias": "button-normal",
          "src": "/assets/images/ui/button-normal.png"
        },
        {
          "alias": "button-hover",
          "src": "/assets/images/ui/button-hover.png"
        }
      ]
    },
    {
      "name": "game",
      "assets": [
        {
          "alias": "court",
          "src": "/assets/images/game/court.png"
        },
        {
          "alias": "ball",
          "src": "/assets/images/game/ball.png"
        }
      ]
    },
    {
      "name": "audio",
      "assets": [
        {
          "alias": "bgm-menu",
          "src": "/assets/audio/bgm/menu.mp3"
        },
        {
          "alias": "sfx-click",
          "src": "/assets/audio/sfx/click.mp3"
        }
      ]
    }
  ]
}
```

### 3.4 事件系统

**EventBus.ts - 事件总线**

```typescript
/**
 * 事件总线，用于模块间通信
 */
export class EventBus {
  private static instance: EventBus;
  private events: Map<string, Set<EventCallback>>;
  
  static getInstance(): EventBus {
    if (!this.instance) {
      this.instance = new EventBus();
    }
    return this.instance;
  }
  
  private constructor() {
    this.events = new Map();
  }
  
  /**
   * 订阅事件
   */
  on(eventName: string, callback: EventCallback): () => void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    
    this.events.get(eventName)!.add(callback);
    
    // 返回取消订阅函数
    return () => this.off(eventName, callback);
  }
  
  /**
   * 订阅一次性事件
   */
  once(eventName: string, callback: EventCallback): void {
    const wrapper = (data: any) => {
      callback(data);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }
  
  /**
   * 取消订阅
   */
  off(eventName: string, callback: EventCallback): void {
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }
  
  /**
   * 发布事件
   */
  emit(eventName: string, data?: any): void {
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
  
  /**
   * 清除所有事件
   */
  clear(): void {
    this.events.clear();
  }
}

type EventCallback = (data?: any) => void;
```

**事件定义 (events.d.ts)**

```typescript
// 游戏事件
export enum GameEvent {
  // 游戏状态
  GAME_START = 'game:start',
  GAME_PAUSE = 'game:pause',
  GAME_RESUME = 'game:resume',
  GAME_OVER = 'game:over',
  
  // 场景切换
  SCENE_CHANGE = 'scene:change',
  SCENE_LOADED = 'scene:loaded',
  
  // 球队事件
  TEAM_UPDATED = 'team:updated',
  PLAYER_SIGNED = 'player:signed',
  PLAYER_RELEASED = 'player:released',
  COACH_HIRED = 'coach:hired',
  
  // 比赛事件
  MATCH_START = 'match:start',
  MATCH_END = 'match:end',
  SCORE_UPDATE = 'score:update',
  
  // 训练事件
  TRAINING_START = 'training:start',
  TRAINING_COMPLETE = 'training:complete',
  
  // 财务事件
  FUNDS_CHANGED = 'funds:changed',
  
  // UI事件
  MODAL_OPEN = 'modal:open',
  MODAL_CLOSE = 'modal:close',
  TOAST_SHOW = 'toast:show',
}
```

### 3.5 音频管理系统

**AudioManager.ts - 音频管理器**

```typescript
import { Howl, Howler } from 'howler';

/**
 * 音频管理器，基于Howler.js
 */
export class AudioManager {
  private static instance: AudioManager;
  private bgm: Howl | null = null;
  private sfxMap: Map<string, Howl> = new Map();
  private bgmVolume: number = 0.5;
  private sfxVolume: number = 0.7;
  private isMuted: boolean = false;
  
  static getInstance(): AudioManager {
    if (!this.instance) {
      this.instance = new AudioManager();
    }
    return this.instance;
  }
  
  /**
   * 播放背景音乐
   */
  playBGM(alias: string, loop: boolean = true): void {
    // 停止当前BGM
    if (this.bgm) {
      this.bgm.stop();
    }
    
    // 获取音频资源
    const src = Assets.get(alias);
    
    this.bgm = new Howl({
      src: [src],
      loop,
      volume: this.bgmVolume,
      onend: () => {
        if (!loop) this.bgm = null;
      }
    });
    
    this.bgm.play();
  }
  
  /**
   * 停止背景音乐
   */
  stopBGM(): void {
    if (this.bgm) {
      this.bgm.stop();
      this.bgm = null;
    }
  }
  
  /**
   * 播放音效
   */
  playSFX(alias: string): void {
    let sfx = this.sfxMap.get(alias);
    
    if (!sfx) {
      const src = Assets.get(alias);
      sfx = new Howl({
        src: [src],
        volume: this.sfxVolume
      });
      this.sfxMap.set(alias, sfx);
    }
    
    sfx.play();
  }
  
  /**
   * 设置BGM音量
   */
  setBGMVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgm) {
      this.bgm.volume(this.bgmVolume);
    }
  }
  
  /**
   * 设置音效音量
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.sfxMap.forEach(sfx => sfx.volume(this.sfxVolume));
  }
  
  /**
   * 静音/取消静音
   */
  toggleMute(): void {
    this.isMuted = !this.isMuted;
    Howler.mute(this.isMuted);
  }
}
```

### 3.6 存储管理系统

**StorageManager.ts - 存储管理器**

```typescript
import localforage from 'localforage';

/**
 * 存储管理器，基于localforage
 */
export class StorageManager {
  private static instance: StorageManager;
  private store: LocalForage;
  
  static getInstance(): StorageManager {
    if (!this.instance) {
      this.instance = new StorageManager();
    }
    return this.instance;
  }
  
  private constructor() {
    this.store = localforage.createInstance({
      name: 'basketball-manager',
      storeName: 'game_data'
    });
  }
  
  /**
   * 保存游戏状态
   */
  async saveGameState(state: GameState): Promise<void> {
    await this.store.setItem('gameState', state);
  }
  
  /**
   * 加载游戏状态
   */
  async loadGameState(): Promise<GameState | null> {
    return await this.store.getItem<GameState>('gameState');
  }
  
  /**
   * 保存设置
   */
  async saveSettings(settings: GameSettings): Promise<void> {
    await this.store.setItem('settings', settings);
  }
  
  /**
   * 加载设置
   */
  async loadSettings(): Promise<GameSettings | null> {
    return await this.store.getItem<GameSettings>('settings');
  }
  
  /**
   * 删除存档
   */
  async deleteSave(key: string): Promise<void> {
    await this.store.removeItem(key);
  }
  
  /**
   * 清除所有数据
   */
  async clearAll(): Promise<void> {
    await this.store.clear();
  }
  
  /**
   * 获取所有存档
   */
  async getAllSaves(): Promise<Array<{ key: string; data: any }>> {
    const keys = await this.store.keys();
    const saves = await Promise.all(
      keys.map(async key => ({
        key,
        data: await this.store.getItem(key)
      }))
    );
    return saves;
  }
}
```

---

## 四、UI系统设计

### 4.1 UI组件库架构

**组件层级**
```
1. 原子组件 (Atoms) - 最基础的UI元素
   - Button, Text, Image, Shape
   
2. 基础组件 (Components) - 单一功能组件
   - Panel, Modal, List, Card, ProgressBar
   
3. 复合组件 (Widgets) - 业务相关组件
   - PlayerCard, TeamCard, GameBoard
   
4. 布局组件 (Layouts) - 页面布局
   - Header, Navigation, Container, Grid
```

### 4.2 @pixi/ui 集成

**安装依赖**
```bash
npm install @pixi/ui @pixi/layout
```

**Button组件示例**

```typescript
import { Button as PixiButton } from '@pixi/ui';

/**
 * 自定义按钮组件
 */
export class Button extends PixiButton {
  constructor(options: ButtonOptions) {
    const view = Button.createView(options);
    
    super(view);
    
    this.onPress.connect(() => {
      AudioManager.getInstance().playSFX('sfx-click');
      options.onClick?.();
    });
    
    // 悬停效果
    this.onHover.connect(() => {
      gsap.to(this.scale, { x: 1.05, y: 1.05, duration: 0.2 });
    });
    
    this.onOut.connect(() => {
      gsap.to(this.scale, { x: 1, y: 1, duration: 0.2 });
    });
  }
  
  private static createView(options: ButtonOptions): PIXI.Container {
    const container = new PIXI.Container();
    
    // 背景
    const bg = new PIXI.Graphics();
    bg.beginFill(options.bgColor || 0x4a90e2);
    bg.drawRoundedRect(0, 0, options.width, options.height, 10);
    bg.endFill();
    container.addChild(bg);
    
    // 文本
    const text = new PIXI.Text(options.text, {
      fontFamily: 'Arial',
      fontSize: options.fontSize || 18,
      fill: options.textColor || 0xffffff,
      fontWeight: 'bold'
    });
    text.anchor.set(0.5);
    text.position.set(options.width / 2, options.height / 2);
    container.addChild(text);
    
    return container;
  }
}

interface ButtonOptions {
  text: string;
  width: number;
  height: number;
  bgColor?: number;
  textColor?: number;
  fontSize?: number;
  onClick?: () => void;
}
```

**Panel组件示例**

```typescript
/**
 * 面板组件
 */
export class Panel extends PIXI.Container {
  private background: PIXI.Graphics;
  private content: PIXI.Container;
  
  constructor(options: PanelOptions) {
    super();
    
    // 创建背景
    this.background = this.createBackground(options);
    this.addChild(this.background);
    
    // 创建内容容器
    this.content = new PIXI.Container();
    this.content.position.set(
      options.padding || 20,
      options.padding || 20
    );
    this.addChild(this.content);
    
    // 标题
    if (options.title) {
      const title = this.createTitle(options.title);
      this.content.addChild(title);
    }
  }
  
  private createBackground(options: PanelOptions): PIXI.Graphics {
    const bg = new PIXI.Graphics();
    
    // 阴影
    if (options.shadow) {
      bg.beginFill(0x000000, 0.2);
      bg.drawRoundedRect(5, 5, options.width, options.height, 15);
      bg.endFill();
    }
    
    // 主背景
    bg.beginFill(options.bgColor || 0xffffff, options.bgAlpha || 0.95);
    bg.drawRoundedRect(0, 0, options.width, options.height, 15);
    bg.endFill();
    
    // 边框
    if (options.border) {
      bg.lineStyle(2, options.borderColor || 0x000000, 0.2);
      bg.drawRoundedRect(0, 0, options.width, options.height, 15);
    }
    
    return bg;
  }
  
  private createTitle(text: string): PIXI.Text {
    return new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0x333333,
      fontWeight: 'bold'
    });
  }
  
  /**
   * 添加子元素到内容区
   */
  addContent(child: PIXI.DisplayObject): void {
    this.content.addChild(child);
  }
}

interface PanelOptions {
  width: number;
  height: number;
  title?: string;
  bgColor?: number;
  bgAlpha?: number;
  padding?: number;
  border?: boolean;
  borderColor?: number;
  shadow?: boolean;
}
```

**Modal组件示例**

```typescript
/**
 * 模态框组件
 */
export class Modal extends PIXI.Container {
  private overlay: PIXI.Graphics;
  private panel: Panel;
  private closeButton: Button;
  
  constructor(options: ModalOptions) {
    super();
    
    // 半透明遮罩
    this.overlay = this.createOverlay();
    this.overlay.interactive = true;
    this.overlay.on('pointerdown', () => {
      if (options.closeOnClickOutside) {
        this.close();
      }
    });
    this.addChild(this.overlay);
    
    // 主面板
    this.panel = new Panel({
      width: options.width,
      height: options.height,
      title: options.title,
      shadow: true
    });
    
    // 居中显示
    this.panel.position.set(
      (this.overlay.width - options.width) / 2,
      (this.overlay.height - options.height) / 2
    );
    this.addChild(this.panel);
    
    // 关闭按钮
    if (options.showCloseButton) {
      this.closeButton = this.createCloseButton();
      this.panel.addChild(this.closeButton);
    }
    
    // 入场动画
    this.playEnterAnimation();
  }
  
  private createOverlay(): PIXI.Graphics {
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.5);
    overlay.drawRect(0, 0, window.innerWidth, window.innerHeight);
    overlay.endFill();
    return overlay;
  }
  
  private createCloseButton(): Button {
    const btn = new Button({
      text: '×',
      width: 40,
      height: 40,
      fontSize: 28,
      onClick: () => this.close()
    });
    btn.position.set(
      this.panel.width - 50,
      10
    );
    return btn;
  }
  
  private playEnterAnimation(): void {
    this.alpha = 0;
    this.panel.scale.set(0.8);
    
    gsap.to(this, {
      alpha: 1,
      duration: 0.3
    });
    
    gsap.to(this.panel.scale, {
      x: 1,
      y: 1,
      duration: 0.3,
      ease: 'back.out'
    });
  }
  
  close(): void {
    gsap.to(this, {
      alpha: 0,
      duration: 0.2,
      onComplete: () => {
        this.destroy();
        EventBus.getInstance().emit(GameEvent.MODAL_CLOSE);
      }
    });
  }
}

interface ModalOptions {
  width: number;
  height: number;
  title?: string;
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
}
```

### 4.3 主题系统

**Theme.ts - 主题定义**

```typescript
/**
 * 主题系统
 */
export class Theme {
  static colors = {
    // 主色
    primary: 0x4a90e2,
    secondary: 0x50c878,
    accent: 0xff6b6b,
    
    // 中性色
    background: 0xf5f5f5,
    surface: 0xffffff,
    border: 0xe0e0e0,
    
    // 文本色
    textPrimary: 0x333333,
    textSecondary: 0x666666,
    textDisabled: 0x999999,
    
    // 状态色
    success: 0x4caf50,
    warning: 0xff9800,
    error: 0xf44336,
    info: 0x2196f3,
    
    // 特殊色
    gold: 0xffd700,
    silver: 0xc0c0c0,
    bronze: 0xcd7f32,
  };
  
  static fonts = {
    primary: 'Arial, sans-serif',
    secondary: 'Helvetica, sans-serif',
    mono: 'Courier New, monospace',
  };
  
  static fontSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  };
  
  static spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  };
  
  static radius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  };
  
  static shadows = {
    sm: { blur: 4, distance: 2, alpha: 0.1 },
    md: { blur: 8, distance: 4, alpha: 0.15 },
    lg: { blur: 16, distance: 8, alpha: 0.2 },
  };
}
```

### 4.4 响应式布局

**布局系统设计**

```typescript
/**
 * 响应式容器
 */
export class ResponsiveContainer extends PIXI.Container {
  private designWidth: number = 1920;
  private designHeight: number = 1080;
  private scaleFactor: number = 1;
  
  constructor() {
    super();
    this.updateScale();
    window.addEventListener('resize', () => this.updateScale());
  }
  
  private updateScale(): void {
    const scaleX = window.innerWidth / this.designWidth;
    const scaleY = window.innerHeight / this.designHeight;
    
    // 选择较小的缩放比例以确保内容完全可见
    this.scaleFactor = Math.min(scaleX, scaleY);
    
    this.scale.set(this.scaleFactor);
    
    // 居中显示
    this.position.set(
      (window.innerWidth - this.designWidth * this.scaleFactor) / 2,
      (window.innerHeight - this.designHeight * this.scaleFactor) / 2
    );
  }
}

/**
 * 网格布局
 */
export class GridLayout extends PIXI.Container {
  constructor(
    private columns: number,
    private gap: number = 10
  ) {
    super();
  }
  
  /**
   * 添加子元素并自动布局
   */
  addGridChild(child: PIXI.DisplayObject): void {
    const index = this.children.length;
    const col = index % this.columns;
    const row = Math.floor(index / this.columns);
    
    child.position.set(
      col * (child.width + this.gap),
      row * (child.height + this.gap)
    );
    
    this.addChild(child);
  }
}
```

---

## 五、游戏引擎设计

### 5.1 游戏状态管理

**使用Zustand进行状态管理**

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

/**
 * 游戏状态Store
 */
export const useGameStore = create(
  immer<GameStore>((set) => ({
    // 状态
    currentDate: new Date(2024, 8, 1),
    currentSeason: 1,
    gamePhase: 'regular',
    
    // 方法
    advanceDate: (days: number) => set((state) => {
      state.currentDate.setDate(state.currentDate.getDate() + days);
    }),
    
    startNewSeason: () => set((state) => {
      state.currentSeason += 1;
      state.gamePhase = 'regular';
    }),
  }))
);

/**
 * 球队状态Store
 */
export const useTeamStore = create(
  immer<TeamStore>((set) => ({
    userTeam: null,
    allTeams: [],
    
    setUserTeam: (team: Team) => set((state) => {
      state.userTeam = team;
    }),
    
    updateTeamFunds: (amount: number) => set((state) => {
      if (state.userTeam) {
        state.userTeam.funds += amount;
      }
    }),
    
    addPlayer: (player: Player) => set((state) => {
      if (state.userTeam && state.userTeam.roster.length < 15) {
        state.userTeam.roster.push(player);
      }
    }),
    
    removePlayer: (playerId: number) => set((state) => {
      if (state.userTeam) {
        state.userTeam.roster = state.userTeam.roster.filter(
          p => p.id !== playerId
        );
      }
    }),
  }))
);
```

### 5.2 游戏引擎模块

**GameEngine.ts - 比赛模拟引擎**

```typescript
/**
 * 比赛模拟引擎
 */
export class GameEngine {
  private gameState: MatchState;
  private ticker: PIXI.Ticker;
  private gameSpeed: number = 1;
  
  constructor() {
    this.ticker = new PIXI.Ticker();
    this.ticker.add(this.update, this);
  }
  
  /**
   * 开始比赛
   */
  startMatch(homeTeam: Team, awayTeam: Team): void {
    this.gameState = {
      homeTeam,
      awayTeam,
      quarter: 1,
      time: 12 * 60, // 12分钟
      homeScore: 0,
      awayScore: 0,
      possession: Math.random() > 0.5 ? 'home' : 'away',
      events: []
    };
    
    this.ticker.start();
    EventBus.getInstance().emit(GameEvent.MATCH_START, this.gameState);
  }
  
  /**
   * 更新比赛状态
   */
  private update(deltaTime: number): void {
    if (!this.gameState) return;
    
    // 减少比赛时间
    this.gameState.time -= deltaTime * this.gameSpeed;
    
    // 每3-5秒模拟一次回合
    if (Math.random() < 0.02 * this.gameSpeed) {
      this.simulatePossession();
    }
    
    // 检查节结束
    if (this.gameState.time <= 0) {
      this.endQuarter();
    }
    
    // 发送更新事件
    EventBus.getInstance().emit(GameEvent.SCORE_UPDATE, this.gameState);
  }
  
  /**
   * 模拟一次进攻回合
   */
  private simulatePossession(): void {
    const attackTeam = this.gameState.possession === 'home'
      ? this.gameState.homeTeam
      : this.gameState.awayTeam;
    
    const defenseTeam = this.gameState.possession === 'home'
      ? this.gameState.awayTeam
      : this.gameState.homeTeam;
    
    // 选择进攻球员
    const shooter = this.selectShooter(attackTeam);
    
    // 计算命中率
    const shootingChance = this.calculateShootingChance(
      shooter,
      defenseTeam
    );
    
    // 判断是否得分
    const scored = Math.random() < shootingChance;
    
    if (scored) {
      const points = Math.random() < 0.3 ? 3 : 2; // 30%概率三分
      
      if (this.gameState.possession === 'home') {
        this.gameState.homeScore += points;
      } else {
        this.gameState.awayScore += points;
      }
      
      // 记录事件
      this.gameState.events.push({
        type: 'score',
        player: shooter,
        points,
        time: this.gameState.time
      });
    }
    
    // 切换球权
    this.gameState.possession = 
      this.gameState.possession === 'home' ? 'away' : 'home';
  }
  
  /**
   * 选择投篮球员
   */
  private selectShooter(team: Team): Player {
    // 根据球员属性加权随机选择
    const players = team.roster;
    const weights = players.map(p => 
      p.attributes.shooting + p.attributes.threePoint
    );
    
    return this.weightedRandom(players, weights);
  }
  
  /**
   * 计算投篮命中率
   */
  private calculateShootingChance(
    shooter: Player,
    defenseTeam: Team
  ): number {
    const offense = shooter.attributes.shooting;
    const defense = this.getAverageDefense(defenseTeam);
    
    // 基础命中率公式
    const baseChance = 0.3 + (offense - defense) * 0.005;
    
    return Math.max(0.1, Math.min(0.7, baseChance));
  }
  
  /**
   * 结束一节
   */
  private endQuarter(): void {
    if (this.gameState.quarter < 4) {
      this.gameState.quarter++;
      this.gameState.time = 12 * 60;
    } else {
      this.endMatch();
    }
  }
  
  /**
   * 结束比赛
   */
  private endMatch(): void {
    this.ticker.stop();
    EventBus.getInstance().emit(GameEvent.MATCH_END, this.gameState);
  }
  
  /**
   * 设置比赛速度
   */
  setGameSpeed(speed: number): void {
    this.gameSpeed = speed;
  }
  
  /**
   * 暂停/继续
   */
  togglePause(): void {
    if (this.ticker.started) {
      this.ticker.stop();
    } else {
      this.ticker.start();
    }
  }
}
```

---

## 六、场景实现示例

### 6.1 加载场景

**LoadingScene.ts**

```typescript
/**
 * 加载场景
 */
export class LoadingScene extends BaseScene {
  private progressBar: ProgressBar;
  private loadingText: PIXI.Text;
  
  protected async onCreate(): Promise<void> {
    // 背景
    const bg = new PIXI.Graphics();
    bg.beginFill(0x1a1a2e);
    bg.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    bg.endFill();
    this.addChild(bg);
    
    // Logo
    const logo = new PIXI.Text('Basketball Manager', {
      fontFamily: 'Arial',
      fontSize: 64,
      fill: 0xffffff,
      fontWeight: 'bold'
    });
    logo.anchor.set(0.5);
    logo.position.set(
      this.app.screen.width / 2,
      this.app.screen.height / 2 - 100
    );
    this.addChild(logo);
    
    // 进度条
    this.progressBar = new ProgressBar({
      width: 400,
      height: 20,
      bgColor: 0x333333,
      fillColor: 0x4a90e2
    });
    this.progressBar.position.set(
      this.app.screen.width / 2 - 200,
      this.app.screen.height / 2 + 50
    );
    this.addChild(this.progressBar);
    
    // 加载文本
    this.loadingText = new PIXI.Text('Loading...', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xcccccc
    });
    this.loadingText.anchor.set(0.5);
    this.loadingText.position.set(
      this.app.screen.width / 2,
      this.app.screen.height / 2 + 100
    );
    this.addChild(this.loadingText);
  }
  
  protected onEnter(): void {
    this.loadResources();
  }
  
  private async loadResources(): Promise<void> {
    const loader = ResourceLoader.getInstance();
    
    // 加载各个资源包
    const bundles = ['common', 'game', 'audio'];
    
    for (let i = 0; i < bundles.length; i++) {
      const bundle = bundles[i];
      
      await loader.loadBundle(bundle, (progress) => {
        const totalProgress = (i + progress) / bundles.length;
        this.progressBar.setProgress(totalProgress);
        this.loadingText.text = `Loading ${bundle}... ${Math.floor(progress * 100)}%`;
      });
    }
    
    // 加载完成，切换到主菜单
    await this.delay(500);
    SceneManager.getInstance().switchScene('mainMenu');
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  protected onExit(): void {}
  protected async onDestroy(): Promise<void> {}
  protected onUpdate(deltaTime: number): void {}
}
```

### 6.2 球队管理场景

**TeamScene.ts**

```typescript
/**
 * 球队管理场景
 */
export class TeamScene extends BaseScene {
  private header: Header;
  private navigation: Navigation;
  private rosterPanel: Panel;
  private statsPanel: Panel;
  private playerCards: PlayerCard[] = [];
  
  protected async onCreate(): Promise<void> {
    // 背景
    const bg = new PIXI.Sprite(Assets.get('bg-team'));
    bg.width = this.app.screen.width;
    bg.height = this.app.screen.height;
    this.addChild(bg);
    
    // 顶部栏
    this.header = new Header();
    this.addChild(this.header);
    
    // 导航栏
    this.navigation = new Navigation();
    this.navigation.position.y = 80;
    this.addChild(this.navigation);
    
    // 阵容面板
    this.rosterPanel = new Panel({
      width: 800,
      height: 700,
      title: '球队阵容'
    });
    this.rosterPanel.position.set(50, 150);
    this.addChild(this.rosterPanel);
    
    // 统计面板
    this.statsPanel = new Panel({
      width: 400,
      height: 700,
      title: '球队统计'
    });
    this.statsPanel.position.set(870, 150);
    this.addChild(this.statsPanel);
  }
  
  protected onEnter(): void {
    this.updateRoster();
    this.updateStats();
    
    // 订阅事件
    this.eventBus.on(GameEvent.TEAM_UPDATED, () => {
      this.updateRoster();
      this.updateStats();
    });
  }
  
  private updateRoster(): void {
    // 清空现有卡片
    this.playerCards.forEach(card => card.destroy());
    this.playerCards = [];
    
    // 获取球队数据
    const team = useTeamStore.getState().userTeam;
    if (!team) return;
    
    // 创建球员卡片
    team.roster.forEach((player, index) => {
      const card = new PlayerCard(player, {
        onRelease: () => this.releasePlayer(player.id)
      });
      
      const col = index % 3;
      const row = Math.floor(index / 3);
      card.position.set(
        20 + col * 250,
        60 + row * 140
      );
      
      this.rosterPanel.addContent(card);
      this.playerCards.push(card);
    });
  }
  
  private updateStats(): void {
    const team = useTeamStore.getState().userTeam;
    if (!team) return;
    
    // TODO: 显示球队统计信息
  }
  
  private releasePlayer(playerId: number): void {
    // 显示确认对话框
    const modal = new ConfirmModal({
      title: '确认释放',
      message: '确定要释放这名球员吗?',
      onConfirm: () => {
        useTeamStore.getState().removePlayer(playerId);
        EventBus.getInstance().emit(GameEvent.PLAYER_RELEASED);
      }
    });
    
    this.addChild(modal);
  }
  
  protected onExit(): void {
    this.eventBus.clear();
  }
  
  protected async onDestroy(): Promise<void> {
    this.playerCards.forEach(card => card.destroy());
  }
  
  protected onUpdate(deltaTime: number): void {
    // 场景更新逻辑
  }
}
```

---

## 七、性能优化策略

### 7.1 渲染优化

**对象池模式**

```typescript
/**
 * 对象池
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  
  constructor(factory: () => T, reset: (obj: T) => void, initialSize: number = 10) {
    this.factory = factory;
    this.reset = reset;
    
    // 预创建对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }
  
  /**
   * 获取对象
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }
  
  /**
   * 归还对象
   */
  release(obj: T): void {
    this.reset(obj);
    this.pool.push(obj);
  }
}

// 使用示例
const particlePool = new ObjectPool(
  () => new PIXI.Sprite(Assets.get('particle')),
  (sprite) => {
    sprite.alpha = 1;
    sprite.scale.set(1);
    sprite.visible = false;
  },
  100
);
```

**渲染批次优化**

```typescript
/**
 * 批处理渲染
 */
export class BatchRenderer {
  private container: PIXI.ParticleContainer;
  
  constructor(maxSize: number = 10000) {
    this.container = new PIXI.ParticleContainer(maxSize, {
      scale: true,
      position: true,
      rotation: true,
      alpha: true,
      tint: true
    });
  }
  
  addSprite(texture: PIXI.Texture): PIXI.Sprite {
    const sprite = new PIXI.Sprite(texture);
    this.container.addChild(sprite);
    return sprite;
  }
}
```

### 7.2 内存优化

**纹理图集**

```typescript
/**
 * 使用纹理图集减少绘制调用
 */
// 在资源加载时使用纹理图集
const spritesheet = Assets.get('game-sprites');
const buttonTexture = spritesheet.textures['button.png'];
const iconTexture = spritesheet.textures['icon.png'];
```

**及时销毁**

```typescript
/**
 * 场景切换时销毁不需要的资源
 */
protected async onDestroy(): Promise<void> {
  // 销毁子对象
  this.children.forEach(child => child.destroy({ children: true }));
  
  // 移除事件监听
  this.removeAllListeners();
  
  // 清空引用
  this.playerCards = [];
}
```

### 7.3 更新优化

**帧率限制**

```typescript
/**
 * 根据性能动态调整更新频率
 */
export class AdaptiveUpdate {
  private targetFPS: number = 60;
  private updateInterval: number;
  private accumulator: number = 0;
  
  constructor(targetFPS: number = 60) {
    this.targetFPS = targetFPS;
    this.updateInterval = 1000 / targetFPS;
  }
  
  shouldUpdate(deltaTime: number): boolean {
    this.accumulator += deltaTime;
    
    if (this.accumulator >= this.updateInterval) {
      this.accumulator -= this.updateInterval;
      return true;
    }
    
    return false;
  }
}
```

---

## 八、开发规范

### 8.1 代码规范

**TypeScript配置 (tsconfig.json)**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@core/*": ["src/core/*"],
      "@engine/*": ["src/engine/*"],
      "@ui/*": ["src/ui/*"],
      "@scenes/*": ["src/scenes/*"],
      "@models/*": ["src/models/*"],
      "@utils/*": ["src/utils/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**ESLint配置 (.eslintrc.js)**

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // 强制使用单引号
    'quotes': ['error', 'single'],
    
    // 禁止使用var
    'no-var': 'error',
    
    // 优先使用const
    'prefer-const': 'error',
    
    // 要求使用分号
    'semi': ['error', 'always'],
    
    // 禁止未使用的变量
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_'
    }],
    
    // 命名规范
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'class',
        format: ['PascalCase']
      },
      {
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I']
      },
      {
        selector: 'typeAlias',
        format: ['PascalCase']
      },
      {
        selector: 'enum',
        format: ['PascalCase']
      },
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE']
      },
      {
        selector: 'function',
        format: ['camelCase']
      }
    ]
  }
};
```

### 8.2 Git规范

**提交消息格式**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type类型**
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链相关

**示例**
```
feat(ui): 添加球员卡片组件

- 实现PlayerCard组件
- 支持悬停效果
- 添加释放球员功能

Closes #123
```

### 8.3 注释规范

**文件头注释**

```typescript
/**
 * @file GameEngine.ts
 * @description 比赛模拟引擎，负责模拟篮球比赛过程
 * @author Your Name
 * @created 2026-01-26
 */
```

**类注释**

```typescript
/**
 * 比赛模拟引擎
 * 
 * @class GameEngine
 * @description 负责模拟篮球比赛的各种事件和状态更新
 * @example
 * ```typescript
 * const engine = new GameEngine();
 * engine.startMatch(teamA, teamB);
 * ```
 */
export class GameEngine {
  // ...
}
```

**方法注释**

```typescript
/**
 * 计算投篮命中率
 * 
 * @param shooter - 投篮球员
 * @param defenseTeam - 防守球队
 * @returns 命中率 (0-1之间的数值)
 * 
 * @example
 * ```typescript
 * const chance = calculateShootingChance(player, team);
 * // chance: 0.45
 * ```
 */
private calculateShootingChance(
  shooter: Player,
  defenseTeam: Team
): number {
  // ...
}
```

---

## 九、构建和部署

### 9.1 Vite配置

**vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@engine': resolve(__dirname, './src/engine'),
      '@ui': resolve(__dirname, './src/ui'),
      '@scenes': resolve(__dirname, './src/scenes'),
      '@models': resolve(__dirname, './src/models'),
      '@utils': resolve(__dirname, './src/utils'),
    }
  },
  
  server: {
    port: 3000,
    open: true
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'pixi': ['pixi.js'],
          'pixi-ui': ['@pixi/ui'],
          'vendor': ['zustand', 'gsap', 'howler']
        }
      }
    }
  },
  
  optimizeDeps: {
    include: ['pixi.js', '@pixi/ui', 'zustand', 'gsap', 'howler']
  }
});
```

### 9.2 构建脚本

**package.json**

```json
{
  "name": "basketball-manager",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json}\"",
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    "pixi.js": "^8.0.0",
    "@pixi/ui": "^2.0.0",
    "@pixi/layout": "^1.0.0",
    "zustand": "^4.5.0",
    "immer": "^10.0.0",
    "gsap": "^3.12.0",
    "howler": "^2.2.4",
    "localforage": "^1.10.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@typescript-eslint/parser": "^6.19.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.2.0",
    "vitest": "^1.2.0",
    "@vitest/ui": "^1.2.0"
  }
}
```

---

## 十、扩展性设计

### 10.1 插件系统

```typescript
/**
 * 插件接口
 */
export interface IPlugin {
  name: string;
  version: string;
  install(app: Application): void;
  uninstall(): void;
}

/**
 * 插件管理器
 */
export class PluginManager {
  private plugins: Map<string, IPlugin> = new Map();
  
  register(plugin: IPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} already registered`);
      return;
    }
    
    this.plugins.set(plugin.name, plugin);
    plugin.install(this.app);
  }
  
  unregister(name: string): void {
    const plugin = this.plugins.get(name);
    if (plugin) {
      plugin.uninstall();
      this.plugins.delete(name);
    }
  }
}
```

### 10.2 模组系统

```typescript
/**
 * 支持玩家自定义内容
 */
export interface IMod {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  assets?: Record<string, string>;
  data?: Record<string, any>;
  scripts?: string[];
}

/**
 * Mod加载器
 */
export class ModLoader {
  async loadMod(modPath: string): Promise<IMod> {
    // 加载mod配置
    const modConfig = await fetch(`${modPath}/mod.json`).then(r => r.json());
    
    // 加载mod资源
    if (modConfig.assets) {
      await this.loadModAssets(modPath, modConfig.assets);
    }
    
    // 加载mod脚本
    if (modConfig.scripts) {
      await this.loadModScripts(modPath, modConfig.scripts);
    }
    
    return modConfig;
  }
}
```

---

## 十一、测试策略

### 11.1 单元测试

```typescript
import { describe, it, expect } from 'vitest';
import { Player } from '@/models/Player';

describe('Player', () => {
  it('should create a player with correct attributes', () => {
    const player = new Player({
      id: 1,
      name: 'Test Player',
      position: 'PG',
      attributes: {
        shooting: 80,
        threePoint: 75,
        defense: 70
      }
    });
    
    expect(player.name).toBe('Test Player');
    expect(player.position).toBe('PG');
    expect(player.attributes.shooting).toBe(80);
  });
  
  it('should calculate overall rating correctly', () => {
    const player = new Player({
      id: 1,
      name: 'Test Player',
      position: 'PG',
      attributes: {
        shooting: 80,
        threePoint: 80,
        defense: 80,
        // ... other attributes
      }
    });
    
    const overall = player.getOverallRating();
    expect(overall).toBeGreaterThan(0);
    expect(overall).toBeLessThanOrEqual(99);
  });
});
```

### 11.2 集成测试

```typescript
describe('GameEngine Integration', () => {
  it('should simulate a complete match', async () => {
    const engine = new GameEngine();
    const teamA = createMockTeam('Team A');
    const teamB = createMockTeam('Team B');
    
    const result = await engine.simulateMatch(teamA, teamB);
    
    expect(result.homeScore).toBeGreaterThanOrEqual(0);
    expect(result.awayScore).toBeGreaterThanOrEqual(0);
    expect(result.winner).toBeDefined();
  });
});
```

---

## 十二、项目里程碑

### 12.1 第一阶段 - 基础框架 (2周)

- [ ] 搭建项目结构
- [ ] 配置构建工具和开发环境
- [ ] 实现核心系统（Application、SceneManager、ResourceLoader）
- [ ] 实现基础UI组件库
- [ ] 创建加载场景和主菜单场景

### 12.2 第二阶段 - 核心功能 (4周)

- [ ] 实现数据模型（Player、Team、Coach等）
- [ ] 实现游戏引擎（比赛模拟）
- [ ] 实现球队管理场景
- [ ] 实现球员培养系统
- [ ] 实现球员市场系统

### 12.3 第三阶段 - 高级功能 (3周)

- [ ] 实现赛程管理系统
- [ ] 实现球探系统
- [ ] 实现教练系统
- [ ] 实现财务管理系统
- [ ] 实现比赛观看场景

### 12.4 第四阶段 - 优化和完善 (2周)

- [ ] 性能优化
- [ ] UI/UX优化
- [ ] 音效和音乐
- [ ] 数据平衡调整
- [ ] Bug修复

### 12.5 第五阶段 - 测试和发布 (1周)

- [ ] 完整测试
- [ ] 文档完善
- [ ] 构建发布版本
- [ ] 部署上线

---

## 附录

### A. 依赖包版本

```json
{
  "pixi.js": "^8.0.0",
  "@pixi/ui": "^2.0.0",
  "@pixi/layout": "^1.0.0",
  "typescript": "^5.3.0",
  "vite": "^5.0.0",
  "zustand": "^4.5.0",
  "gsap": "^3.12.0",
  "howler": "^2.2.4"
}
```

### B. 参考资源

- [PixiJS官方文档](https://pixijs.com/docs)
- [@pixi/ui文档](https://pixijs.io/ui/)
- [Zustand文档](https://docs.pmnd.rs/zustand)
- [GSAP文档](https://greensock.com/docs/)
- [Howler文档](https://howlerjs.com/)

### C. 开发工具推荐

- **IDE**: VSCode
- **插件**: 
  - ESLint
  - Prettier
  - TypeScript Vue Plugin
  - GitLens
- **调试工具**: Chrome DevTools, PixiJS DevTools

---

## 文档维护

- **创建**: 2026-01-26
- **更新**: 按需更新
- **维护者**: 开发团队

