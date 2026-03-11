/**
 * Pixi.js 渲染引擎 - 2K经理模式风格
 * 包含球员卡片3D效果、背景粒子、排行榜动画等
 */
(function(global) {
    'use strict';

    function PixiRenderer() {
        this.app = null;
        this.containers = {};
        this.animations = [];
        this.hoveredCard = null;
        this.selectedCard = null;
    }

    PixiRenderer.prototype.init = function(containerId) {
        var self = this;
        containerId = containerId || 'pixi-canvas';

        if (typeof PIXI === 'undefined') {
            console.error('Pixi.js library not loaded!');
            return Promise.resolve(false);
        }

        var container = document.getElementById(containerId);
        if (!container) {
            console.error('Pixi容器不存在:', containerId);
            return Promise.resolve(false);
        }

        var app = new PIXI.Application({
            width: container.clientWidth || window.innerWidth - 50,
            height: container.clientHeight || 800,
            backgroundColor: 0x0a0a14,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        container.appendChild(app.view);
        this.app = app;

        this.containers.background = new PIXI.Container();
        this.containers.cards = new PIXI.Container();
        this.containers.ui = new PIXI.Container();
        this.containers.particles = new PIXI.Container();
        this.containers.overlays = new PIXI.Container();

        app.stage.addChild(this.containers.background);
        app.stage.addChild(this.containers.cards);
        app.stage.addChild(this.containers.particles);
        app.stage.addChild(this.containers.ui);
        app.stage.addChild(this.containers.overlays);

        this.setupBackground();
        this.setupInteraction();
        this.startAnimationLoop();

        window.addEventListener('resize', function() {
            self.resize();
        });

        return Promise.resolve(true);
    };

    PixiRenderer.prototype.resize = function() {
        if (!this.app) return;
        var container = this.app.view.parentElement;
        if (container) {
            this.app.renderer.resize(container.clientWidth, container.clientHeight);
        }
    };

    PixiRenderer.prototype.setupBackground = function() {
        var bg = new PIXI.Container();
        this.containers.background.addChild(bg);

        var gradient = new PIXI.Graphics();
        gradient.beginFill(0x0d1117, 1);
        gradient.drawRect(0, 0, 2000, 1500);
        gradient.endFill();
        bg.addChild(gradient);

        var accentGlow1 = new PIXI.Graphics();
        accentGlow1.beginFill(0xe94560, 0.08);
        accentGlow1.drawCircle(0, 0, 400);
        accentGlow1.endFill();
        accentGlow1.x = 300;
        accentGlow1.y = 300;
        bg.addChild(accentGlow1);

        var accentGlow2 = new PIXI.Graphics();
        accentGlow2.beginFill(0x667eea, 0.08);
        accentGlow2.drawCircle(0, 0, 500);
        accentGlow2.endFill();
        accentGlow2.x = 1500;
        accentGlow2.y = 1000;
        bg.addChild(accentGlow2);

        this.createBackgroundParticles();
        // 篮球场将在比赛开始时显示，不在背景中显示
        // this.createCourtLines();
        this.createFloatingOrbs();
    };

    PixiRenderer.prototype.createBackgroundParticles = function() {
        var particleCount = 50;
        var self = this;

        for (var i = 0; i < particleCount; i++) {
            var particle = new PIXI.Graphics();
            var alpha = 0.1 + Math.random() * 0.2;
            var color = Math.random() > 0.5 ? 0xe94560 : 0x667eea;
            particle.beginFill(color, alpha);
            particle.drawCircle(0, 0, 2 + Math.random() * 3);
            particle.endFill();

            particle.x = Math.random() * 2000;
            particle.y = Math.random() * 1500;
            particle.vx = (Math.random() - 0.5) * 0.5;
            particle.vy = (Math.random() - 0.5) * 0.5;
            particle.originalAlpha = alpha;

            this.containers.background.addChild(particle);
            this.animations.push({
                type: 'particle',
                obj: particle,
                update: function(delta) {
                    var p = this.obj;
                    p.x += p.vx * delta;
                    p.y += p.vy * delta;

                    if (p.x < 0) p.x = 2000;
                    if (p.x > 2000) p.x = 0;
                    if (p.y < 0) p.y = 1500;
                    if (p.y > 1500) p.y = 0;

                    p.alpha = p.originalAlpha + Math.sin(Date.now() * 0.001 + p.x) * 0.1;
                }
            });
        }
    };

    PixiRenderer.prototype.createGridLines = function() {
        var grid = new PIXI.Graphics();
        grid.lineStyle(1, 0x667eea, 0.05);

        for (var x = 0; x < 2000; x += 50) {
            grid.moveTo(x, 0);
            grid.lineTo(x, 1500);
        }
        for (var y = 0; y < 1500; y += 50) {
            grid.moveTo(0, y);
            grid.lineTo(2000, y);
        }

        this.containers.background.addChild(grid);
    };

    PixiRenderer.prototype.createCourtLines = function() {
        var courtContainer = new PIXI.Container();
        var court = new PIXI.Graphics();
        
        // 获取canvas实际尺寸
        var canvasWidth = this.app ? this.app.screen.width : 1300;
        var canvasHeight = this.app ? this.app.screen.height : 600;
        
        // 计算篮球场尺寸（适配canvas）
        var marginX = canvasWidth * 0.05;
        var marginY = canvasHeight * 0.05;
        var courtWidth = canvasWidth - marginX * 2;
        var courtHeight = canvasHeight - marginY * 2;
        var courtX = marginX;
        var courtY = marginY;
        
        // 计算比例因子（基于标准篮球场比例 1.5:1）
        var scaleX = courtWidth / 1800;
        var scaleY = courtHeight / 1200;
        var scale = Math.min(scaleX, scaleY);
        
        // 居中篮球场
        var centerX = canvasWidth / 2;
        var centerY = canvasHeight / 2;
        var courtCenterX = centerX;
        var courtCenterY = centerY;
        
        // 篮球场地板颜色 - 经典枫木色
        var floorColor = 0x8B4513;
        var lineColor = 0xFFFFFF;
        var lineAlpha = 0.6;
        var lineWidth = Math.max(1, 3 * scale);
        
        // 绘制半透明地板背景
        court.beginFill(floorColor, 0.15);
        court.drawRect(
            courtCenterX - 900 * scale, 
            courtCenterY - 600 * scale, 
            1800 * scale, 
            1200 * scale
        );
        court.endFill();
        
        // 设置线条样式
        court.lineStyle(lineWidth, lineColor, lineAlpha);
        
        // 外边界线
        court.drawRect(
            courtCenterX - 900 * scale, 
            courtCenterY - 600 * scale, 
            1800 * scale, 
            1200 * scale
        );
        
        // 中线
        court.moveTo(courtCenterX, courtCenterY - 600 * scale);
        court.lineTo(courtCenterX, courtCenterY + 600 * scale);
        
        // 中圈
        court.drawCircle(courtCenterX, courtCenterY, 120 * scale);
        
        // 左侧三分线
        court.drawCircle(courtCenterX - 600 * scale, courtCenterY, 360 * scale);
        // 左侧三分线直线部分
        court.moveTo(courtCenterX - 900 * scale, courtCenterY - 360 * scale);
        court.lineTo(courtCenterX - 600 * scale, courtCenterY - 360 * scale);
        court.moveTo(courtCenterX - 900 * scale, courtCenterY + 360 * scale);
        court.lineTo(courtCenterX - 600 * scale, courtCenterY + 360 * scale);
        
        // 右侧三分线
        court.drawCircle(courtCenterX + 600 * scale, courtCenterY, 360 * scale);
        // 右侧三分线直线部分
        court.moveTo(courtCenterX + 600 * scale, courtCenterY - 360 * scale);
        court.lineTo(courtCenterX + 900 * scale, courtCenterY - 360 * scale);
        court.moveTo(courtCenterX + 600 * scale, courtCenterY + 360 * scale);
        court.lineTo(courtCenterX + 900 * scale, courtCenterY + 360 * scale);
        
        // 左侧罚球区
        court.drawRect(
            courtCenterX - 900 * scale, 
            courtCenterY - 180 * scale, 
            380 * scale, 
            360 * scale
        );
        // 左侧罚球圈
        court.drawCircle(courtCenterX - 520 * scale, courtCenterY, 90 * scale);
        
        // 右侧罚球区
        court.drawRect(
            courtCenterX + 520 * scale, 
            courtCenterY - 180 * scale, 
            380 * scale, 
            360 * scale
        );
        // 右侧罚球圈
        court.drawCircle(courtCenterX + 520 * scale, courtCenterY, 90 * scale);
        
        // 左侧篮筐
        court.beginFill(lineColor, lineAlpha);
        court.drawCircle(courtCenterX - 870 * scale, courtCenterY, 12 * scale);
        court.endFill();
        // 左侧篮板
        court.lineStyle(Math.max(1, 4 * scale), lineColor, lineAlpha);
        court.moveTo(courtCenterX - 900 * scale, courtCenterY - 60 * scale);
        court.lineTo(courtCenterX - 900 * scale, courtCenterY + 60 * scale);
        
        // 右侧篮筐
        court.beginFill(lineColor, lineAlpha);
        court.drawCircle(courtCenterX + 870 * scale, courtCenterY, 12 * scale);
        court.endFill();
        // 右侧篮板
        court.lineStyle(Math.max(1, 4 * scale), lineColor, lineAlpha);
        court.moveTo(courtCenterX + 900 * scale, courtCenterY - 60 * scale);
        court.lineTo(courtCenterX + 900 * scale, courtCenterY + 60 * scale);
        
        // 添加木地板纹理效果
        var woodTexture = new PIXI.Graphics();
        woodTexture.lineStyle(Math.max(1, 1 * scale), 0xA0522D, 0.1);
        for (var y = courtCenterY - 580 * scale; y < courtCenterY + 580 * scale; y += 20 * scale) {
            woodTexture.moveTo(courtCenterX - 880 * scale, y);
            woodTexture.lineTo(courtCenterX + 880 * scale, y);
        }
        courtContainer.addChild(woodTexture);
        
        courtContainer.addChild(court);
        this.containers.background.addChild(courtContainer);
        
        // 保存引用以便动画使用
        this.courtContainer = courtContainer;
        this.courtScale = scale;
        this.courtCenterX = courtCenterX;
        this.courtCenterY = courtCenterY;
    };

    // 显示篮球场（用于比赛时）
    PixiRenderer.prototype.showBasketballCourt = function() {
        // 如果篮球场已存在，先移除
        if (this.courtContainer) {
            this.containers.background.removeChild(this.courtContainer);
            this.courtContainer = null;
        }
        
        // 移除之前的篮球动画和比分牌
        this.clearBasketballAnimations();
        
        // 创建新的篮球场
        this.createCourtLines();
        
        // 确保篮球场可见
        if (this.courtContainer) {
            this.courtContainer.visible = true;
            this.courtContainer.alpha = 1;
        }
        
        // 创建篮球动画和比分牌
        this.createBasketballAnimation();
        
        console.log('篮球场已显示');
    };

    // 清除篮球相关的动画
    PixiRenderer.prototype.clearBasketballAnimations = function() {
        // 过滤掉篮球和比分牌相关的动画
        this.animations = this.animations.filter(function(anim) {
            return anim.type !== 'basketball' && anim.type !== 'scoreboard';
        });
    };

    // 隐藏篮球场
    PixiRenderer.prototype.hideBasketballCourt = function() {
        if (this.courtContainer) {
            this.courtContainer.visible = false;
        }
        // 清除篮球动画和比分牌
        this.clearBasketballAnimations();
        console.log('篮球场已隐藏');
    };

    PixiRenderer.prototype.createFloatingOrbs = function() {
        var colors = [0xe94560, 0x667eea, 0x4ade80, 0xfbbf24];

        for (var i = 0; i < 5; i++) {
            var orb = new PIXI.Graphics();
            var color = colors[i % colors.length];

            orb.beginFill(color, 0.1);
            orb.drawCircle(0, 0, 100 + Math.random() * 100);
            orb.endFill();

            orb.beginFill(color, 0.05);
            orb.drawCircle(0, 0, 150 + Math.random() * 100);
            orb.endFill();

            orb.x = 200 + Math.random() * 1600;
            orb.y = 200 + Math.random() * 1000;
            orb.baseX = orb.x;
            orb.baseY = orb.y;
            orb.phase = Math.random() * Math.PI * 2;
            orb.speed = 0.001 + Math.random() * 0.001;

            this.containers.background.addChild(orb);
            this.animations.push({
                type: 'orb',
                obj: orb,
                update: function(delta) {
                    var o = this.obj;
                    o.y = o.baseY + Math.sin(Date.now() * o.speed + o.phase) * 30;
                    o.x = o.baseX + Math.cos(Date.now() * o.speed * 0.5 + o.phase) * 20;
                }
            });
        }
        
        // 篮球动画和比分牌将在显示篮球场时创建
        // this.createBasketballAnimation();
    };

    // 篮球场比赛动画
    PixiRenderer.prototype.createBasketballAnimation = function() {
        var self = this;
        
        // 获取篮球场缩放比例和中心点
        var scale = this.courtScale || 1;
        var centerX = this.courtCenterX || 1000;
        var centerY = this.courtCenterY || 700;
        
        // 创建篮球
        var basketball = new PIXI.Container();
        var ballGraphics = new PIXI.Graphics();
        
        // 篮球主体 - 橙色
        ballGraphics.beginFill(0xFF6600);
        ballGraphics.drawCircle(0, 0, 15 * scale);
        ballGraphics.endFill();
        
        // 篮球线条
        ballGraphics.lineStyle(Math.max(1, 2 * scale), 0x000000, 0.5);
        ballGraphics.moveTo(-15 * scale, 0);
        ballGraphics.lineTo(15 * scale, 0);
        ballGraphics.moveTo(0, -15 * scale);
        ballGraphics.lineTo(0, 15 * scale);
        
        basketball.addChild(ballGraphics);
        basketball.x = centerX - 870 * scale;
        basketball.y = centerY;
        basketball.scale.set(0);
        
        this.containers.background.addChild(basketball);
        
        // 篮球动画状态
        var ballState = {
            phase: 'idle',
            startX: centerX - 870 * scale,
            startY: centerY,
            endX: centerX + 870 * scale,
            endY: centerY,
            progress: 0,
            speed: 0.008
        };
        
        this.animations.push({
            type: 'basketball',
            obj: basketball,
            state: ballState,
            update: function(delta) {
                var ball = this.obj;
                var state = this.state;
                
                if (state.phase === 'idle') {
                    // 等待一段时间后开始动画
                    if (Math.random() < 0.005) {
                        state.phase = 'shoot';
                        state.progress = 0;
                        ball.x = state.startX;
                        ball.y = state.startY;
                    }
                } else if (state.phase === 'shoot') {
                    // 投篮动画 - 抛物线运动
                    state.progress += state.speed * delta;
                    
                    if (state.progress >= 1) {
                        state.phase = 'score';
                        state.progress = 0;
                    } else {
                        // 线性插值X坐标
                        ball.x = state.startX + (state.endX - state.startX) * state.progress;
                        // 抛物线Y坐标
                        var height = 300;
                        ball.y = state.startY - Math.sin(state.progress * Math.PI) * height;
                        // 旋转效果
                        ball.rotation = state.progress * Math.PI * 4;
                        // 缩放效果 - 远小近大
                        var scale = 0.8 + Math.sin(state.progress * Math.PI) * 0.4;
                        ball.scale.set(scale);
                    }
                } else if (state.phase === 'score') {
                    // 得分效果
                    state.progress += 0.05 * delta;
                    if (state.progress >= 1) {
                        state.phase = 'return';
                        state.progress = 0;
                    }
                    ball.scale.set(1 + state.progress * 0.5);
                    ball.alpha = 1 - state.progress;
                } else if (state.phase === 'return') {
                    // 返回起点
                    state.progress += state.speed * delta;
                    if (state.progress >= 1) {
                        state.phase = 'idle';
                        ball.alpha = 1;
                        ball.scale.set(0);
                    } else {
                        ball.x = state.endX + (state.startX - state.endX) * state.progress;
                        ball.y = state.endY;
                        ball.rotation = state.progress * Math.PI * 2;
                        ball.scale.set(state.progress * 0.8);
                        ball.alpha = state.progress;
                    }
                }
            }
        });
        
        // 创建比分牌
        this.createScoreboard();
    };
    
    // 创建比分牌
    PixiRenderer.prototype.createScoreboard = function() {
        var scoreboard = new PIXI.Container();
        // 使用篮球场中心点和缩放比例
        var scale = this.courtScale || 1;
        var centerX = this.courtCenterX || 1000;
        var canvasHeight = this.app ? this.app.screen.height : 600;
        
        scoreboard.x = centerX;
        scoreboard.y = canvasHeight * 0.08;
        
        var bg = new PIXI.Graphics();
        bg.beginFill(0x000000, 0.7);
        bg.lineStyle(2, 0xFFFFFF, 0.5);
        bg.drawRoundedRect(-150, 0, 300, 60, 10);
        bg.endFill();
        scoreboard.addChild(bg);
        
        // 主队分数
        var homeScore = new PIXI.Text('88', {
            fontSize: 32,
            fontWeight: 'bold',
            fill: 0xFFFFFF
        });
        homeScore.anchor.set(0.5);
        homeScore.x = -80;
        homeScore.y = 30;
        scoreboard.addChild(homeScore);
        
        // 分隔符
        var separator = new PIXI.Text(':', {
            fontSize: 32,
            fontWeight: 'bold',
            fill: 0xFFFFFF
        });
        separator.anchor.set(0.5);
        separator.x = 0;
        separator.y = 30;
        scoreboard.addChild(separator);
        
        // 客队分数
        var awayScore = new PIXI.Text('86', {
            fontSize: 32,
            fontWeight: 'bold',
            fill: 0xFFFFFF
        });
        awayScore.anchor.set(0.5);
        awayScore.x = 80;
        awayScore.y = 30;
        scoreboard.addChild(awayScore);
        
        // 时间
        var timeText = new PIXI.Text('Q4 02:35', {
            fontSize: 14,
            fill: 0xFFD700
        });
        timeText.anchor.set(0.5);
        timeText.x = 0;
        timeText.y = 75;
        scoreboard.addChild(timeText);
        
        this.containers.ui.addChild(scoreboard);
        
        // 比分动画
        this.animations.push({
            type: 'scoreboard',
            obj: { home: homeScore, away: awayScore, time: timeText },
            update: function(delta) {
                var obj = this.obj;
                // 模拟比分变化
                if (Math.random() < 0.001) {
                    var currentHome = parseInt(obj.home.text);
                    obj.home.text = (currentHome + 2).toString();
                }
                if (Math.random() < 0.001) {
                    var currentAway = parseInt(obj.away.text);
                    obj.away.text = (currentAway + 2).toString();
                }
            }
        });
    };

    PixiRenderer.prototype.createPlayerCard = function(player, x, y, width, height) {
        var self = this;
        width = width || 350;
        height = height || 200;

        var card = new PIXI.Container();
        card.x = x;
        card.y = y;
        card.playerData = player;
        card.isHovered = false;
        card.isSelected = false;

        var cardBg = new PIXI.Graphics();
        this.drawCardBackground(cardBg, width, height, false);
        card.addChild(cardBg);
        card.cardBg = cardBg;

        var positionEmojis = { 'PG': '🏀', 'SG': '🎯', 'SF': '🔥', 'PF': '💪', 'C': '🛡️' };

        var avatarCircle = new PIXI.Graphics();
        avatarCircle.beginFill(0x16213e);
        avatarCircle.lineStyle(3, 0x667eea, 0.8);
        avatarCircle.drawCircle(0, 0, 50);
        avatarCircle.endFill();
        avatarCircle.x = 80;
        avatarCircle.y = 80;
        card.addChild(avatarCircle);

        var emoji = new PIXI.Text(positionEmojis[player.position] || '🏀', {
            fontSize: 40,
            fontWeight: 'bold'
        });
        emoji.anchor.set(0.5);
        emoji.x = 80;
        emoji.y = 80;
        card.addChild(emoji);

        this.drawBadge(card, player.getOverallRating(), 80, 150, 45, 25);

        var nameText = new PIXI.Text(player.name, {
            fontSize: 22,
            fontFamily: 'Noto Sans SC',
            fontWeight: 'bold',
            fill: 0xffffff
        });
        nameText.x = 150;
        nameText.y = 25;
        card.addChild(nameText);

        this.drawTag(card, this.getPositionName(player.position), 150, 55, 50, 22);

        var yearNames = ['', '大一', '大二', '大三', '大四'];
        this.drawTag(card, yearNames[player.year] || '', 210, 55, 50, 22, 0x667eea);

        this.drawTag(card, player.age + '岁', 270, 55, 50, 22, 0xe94560);

        this.createRatingPill(card, '潜力', player.potential, 150, 90);
        this.createRatingPill(card, '前景', player.getScoutRating(), 250, 90);
        this.createRatingPill(card, '出场', player.seasonStats?.games || 0, 350, 90);

        this.createAttributeGrid(card, player.attributes, 150, 135);

        card.interactive = true;
        card.cursor = 'pointer';

        card.on('pointerover', function() {
            self.onCardHover(card);
        });
        card.on('pointerout', function() {
            self.onCardOut(card);
        });
        card.on('pointerdown', function() {
            self.onCardSelect(card);
        });

        this.containers.cards.addChild(card);

        var startY = y + 30;
        card.y = startY;
        card.alpha = 0;
        card.progress = 0;

        this.animations.push({
            type: 'cardEntrance',
            obj: card,
            startY: startY,
            update: function(delta) {
                var c = this.obj;
                if (c.progress < 1) {
                    c.progress += 0.02 * delta;
                    c.alpha = Math.min(1, c.progress);
                    c.y = this.startY + (1 - c.progress) * 30;
                }
            }
        });

        return card;
    };

    PixiRenderer.prototype.drawCardBackground = function(graphics, width, height, isSelected) {
        graphics.clear();

        var gradient = new PIXI.Graphics();
        gradient.beginFill(0x1a1a2e, 0.95);
        gradient.drawRoundedRect(0, 0, width, height, 16);
        gradient.endFill();
        graphics.addChild(gradient);

        if (isSelected) {
            graphics.lineStyle(3, 0xe94560, 1);
        } else {
            graphics.lineStyle(1, 0xffffff, 0.15);
        }
        graphics.drawRoundedRect(0, 0, width, height, 16);

        var topLine = new PIXI.Graphics();
        topLine.beginFill(0x667eea);
        topLine.drawRect(0, 0, width, 4);
        topLine.endFill();
        graphics.addChild(topLine);

        if (isSelected) {
            topLine.tint = 0xe94560;
        }
    };

    PixiRenderer.prototype.drawBadge = function(parent, value, x, y, width, height) {
        var badge = new PIXI.Graphics();
        badge.beginFill(0x667eea);
        badge.drawRoundedRect(-width/2, -height/2, width, height, 20);
        badge.endFill();
        badge.x = x;
        badge.y = y;

        var text = new PIXI.Text(value.toString(), {
            fontSize: 18,
            fontWeight: 'bold',
            fill: 0xffffff
        });
        text.anchor.set(0.5);
        badge.addChild(text);

        parent.addChild(badge);
    };

    PixiRenderer.prototype.drawTag = function(parent, text, x, y, width, height, color) {
        color = color || 0xe94560;

        var tag = new PIXI.Graphics();
        tag.beginFill(color, 0.3);
        tag.drawRoundedRect(0, -height/2, width, height, 12);
        tag.endFill();
        tag.x = x;
        tag.y = y;

        var textObj = new PIXI.Text(text, {
            fontSize: 11,
            fill: 0xffffff
        });
        textObj.anchor.set(0.5);
        textObj.x = width / 2;
        tag.addChild(textObj);

        parent.addChild(tag);
    };

    PixiRenderer.prototype.createRatingPill = function(parent, label, value, x, y) {
        var pill = new PIXI.Container();
        pill.x = x;
        pill.y = y;

        var bg = new PIXI.Graphics();
        bg.beginFill(0xffffff, 0.08);
        bg.lineStyle(1, 0xffffff, 0.12);
        bg.drawRoundedRect(0, 0, 85, 28, 14);
        bg.endFill();
        pill.addChild(bg);

        var valueText = new PIXI.Text(value.toString(), {
            fontSize: 14,
            fontWeight: 'bold',
            fill: 0xe94560
        });
        valueText.anchor.set(0.5);
        valueText.x = 25;
        valueText.y = 14;
        pill.addChild(valueText);

        var labelText = new PIXI.Text(label, {
            fontSize: 10,
            fill: 0xd4d4dc
        });
        labelText.anchor.set(0.5);
        labelText.x = 60;
        labelText.y = 14;
        pill.addChild(labelText);

        parent.addChild(pill);
    };

    PixiRenderer.prototype.createAttributeGrid = function(parent, attributes, x, y) {
        var attrLabels = { scoring: '得分', shooting: '投篮', threePoint: '三分', passing: '传球', defense: '防守', rebounding: '篮板' };
        var keyAttrs = ['scoring', 'shooting', 'threePoint', 'passing', 'defense', 'rebounding'];

        for (var i = 0; i < keyAttrs.length; i++) {
            var attr = keyAttrs[i];
            var col = i % 3;
            var row = Math.floor(i / 3);
            this.createAttributeTile(parent, attrLabels[attr], attributes[attr], x + col * 80, y + row * 45);
        }
    };

    PixiRenderer.prototype.createAttributeTile = function(parent, name, value, x, y) {
        var tile = new PIXI.Container();
        tile.x = x;
        tile.y = y;

        var bg = new PIXI.Graphics();
        var colorValue = value >= 75 ? 0xe94560 : value <= 55 ? 0x666680 : 0x667eea;
        bg.beginFill(0xffffff, 0.05);
        bg.lineStyle(1, colorValue, 0.3);
        bg.drawRoundedRect(0, 0, 75, 38, 8);
        bg.endFill();
        tile.addChild(bg);

        var nameText = new PIXI.Text(name, {
            fontSize: 9,
            fill: 0xb8b8c0
        });
        nameText.anchor.set(0.5, 0);
        nameText.x = 37.5;
        nameText.y = 5;
        tile.addChild(nameText);

        var valueText = new PIXI.Text(value.toString(), {
            fontSize: 14,
            fontWeight: 'bold',
            fill: 0xffffff
        });
        valueText.anchor.set(0.5);
        valueText.x = 37.5;
        valueText.y = 20;
        tile.addChild(valueText);

        parent.addChild(tile);
    };

    PixiRenderer.prototype.getPositionName = function(position) {
        var names = { 'PG': '控卫', 'SG': '分卫', 'SF': '小前', 'PF': '大前', 'C': '中锋' };
        return names[position] || position;
    };

    PixiRenderer.prototype.onCardHover = function(card) {
        card.isHovered = true;
        this.hoveredCard = card;
        this.animateCard(card, 1.03, -5, 0.4);
        this.createCardGlow(card);
    };

    PixiRenderer.prototype.onCardOut = function(card) {
        card.isHovered = false;
        if (this.hoveredCard === card) {
            this.hoveredCard = null;
        }
        this.animateCard(card, 1, 0, 0.2);
        this.containers.overlays.removeChildren();
    };

    PixiRenderer.prototype.onCardSelect = function(card) {
        if (this.selectedCard) {
            this.selectedCard.isSelected = false;
            this.drawCardBackground(this.selectedCard.cardBg, 350, 200, false);
        }

        card.isSelected = !card.isSelected;
        this.selectedCard = card.isSelected ? card : null;

        this.drawCardBackground(card.cardBg, 350, 200, card.isSelected);

        if (this.onCardClick) {
            this.onCardClick(card.playerData);
        }
    };

    PixiRenderer.prototype.animateCard = function(card, targetScale, targetYOffset, targetShadowAlpha) {
        var self = this;
        var startTime = Date.now();
        var duration = 200;
        var startScale = card.scale.x;
        var startY = card.y;

        function animate() {
            var elapsed = Date.now() - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);

            card.scale.set(startScale + (targetScale - startScale) * eased);
            card.y = startY + (targetYOffset - (card.y - startY)) * eased;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        animate();
    };

    PixiRenderer.prototype.createCardGlow = function(card) {
        var glow = new PIXI.Graphics();
        glow.beginFill(0xe94560, 0.1);
        glow.drawRoundedRect(-5, -5, 360, 210, 20);
        glow.endFill();
        glow.x = card.x;
        glow.y = card.y;

        this.containers.overlays.addChild(glow);
    };

    PixiRenderer.prototype.createStandingRow = function(team, rank, x, y, width, height, isUserTeam) {
        width = width || 800;
        height = height || 50;

        var row = new PIXI.Container();
        row.x = x;
        row.y = y;
        row.teamData = team;
        row.rank = rank;

        var rowBg = new PIXI.Graphics();
        rowBg.beginFill(isUserTeam ? 0xe94560 : 0xffffff, isUserTeam ? 0.15 : 0.03);
        rowBg.lineStyle(1, isUserTeam ? 0xe94560 : 0xffffff, isUserTeam ? 0.3 : 0.1);
        rowBg.drawRoundedRect(0, 0, width, height, 8);
        rowBg.endFill();
        if (isUserTeam) {
            rowBg.lineStyle(3, 0xe94560, 0.8);
            rowBg.drawRect(0, 0, 4, height);
        }
        row.addChild(rowBg);
        row.rowBg = rowBg;

        var rankText = new PIXI.Text('#' + rank, {
            fontSize: 16,
            fontWeight: 'bold',
            fill: 0xe94560
        });
        rankText.x = 15;
        rankText.y = height / 2;
        rankText.anchor.set(0, 0.5);
        row.addChild(rankText);

        var teamName = new PIXI.Text(team.name, {
            fontSize: 14,
            fontWeight: '600',
            fill: 0xffffff
        });
        teamName.x = 60;
        teamName.y = height / 2;
        teamName.anchor.set(0, 0.5);
        row.addChild(teamName);

        var conference = new PIXI.Text(team.conference || '东部', {
            fontSize: 11,
            fill: 0xc8c8d0
        });
        conference.x = 200;
        conference.y = height / 2;
        conference.anchor.set(0, 0.5);
        row.addChild(conference);

        var wins = new PIXI.Text(String(team.stats?.wins || 0), {
            fontSize: 14,
            fontWeight: '600',
            fill: 0xffffff
        });
        wins.x = 320;
        wins.y = height / 2;
        wins.anchor.set(0, 0.5);
        row.addChild(wins);

        var losses = new PIXI.Text(String(team.stats?.losses || 0), {
            fontSize: 14,
            fill: 0xc8c8d0
        });
        losses.x = 370;
        losses.y = height / 2;
        losses.anchor.set(0, 0.5);
        row.addChild(losses);

        var winRate = new PIXI.Text(this.calculateWinRate(team), {
            fontSize: 14,
            fontWeight: '600',
            fill: 0xffffff
        });
        winRate.x = 430;
        winRate.y = height / 2;
        winRate.anchor.set(0, 0.5);
        row.addChild(winRate);

        var gamesBehind = new PIXI.Text(this.calculateGamesBehind(team), {
            fontSize: 11,
            fill: 0xc8c8d0
        });
        gamesBehind.x = 500;
        gamesBehind.y = height / 2;
        gamesBehind.anchor.set(0, 0.5);
        row.addChild(gamesBehind);

        var self = this;
        row.interactive = true;
        row.cursor = 'pointer';

        row.on('pointerover', function() {
            rowBg.clear();
            rowBg.beginFill(0xe94560, 0.1);
            rowBg.drawRoundedRect(0, 0, width, height, 8);
            rowBg.endFill();
        });
        row.on('pointerout', function() {
            rowBg.clear();
            rowBg.beginFill(isUserTeam ? 0xe94560 : 0xffffff, isUserTeam ? 0.15 : 0.03);
            rowBg.lineStyle(1, isUserTeam ? 0xe94560 : 0xffffff, isUserTeam ? 0.3 : 0.1);
            rowBg.drawRoundedRect(0, 0, width, height, 8);
            rowBg.endFill();
            if (isUserTeam) {
                rowBg.lineStyle(3, 0xe94560, 0.8);
                rowBg.drawRect(0, 0, 4, height);
            }
        });

        this.containers.ui.addChild(row);

        row.progress = 0;

        this.animations.push({
            type: 'rowEntrance',
            obj: row,
            startX: x,
            update: function(delta) {
                var r = this.obj;
                if (r.progress < 1) {
                    r.progress += 0.03 * delta;
                    r.alpha = Math.min(1, r.progress);
                    r.x = this.startX - (1 - r.progress) * 50;
                }
            }
        });

        return row;
    };

    PixiRenderer.prototype.calculateWinRate = function(team) {
        var wins = team.stats?.wins || 0;
        var losses = team.stats?.losses || 0;
        var total = wins + losses;
        if (total === 0) return '0.0%';
        return ((wins / total) * 100).toFixed(1) + '%';
    };

    PixiRenderer.prototype.calculateGamesBehind = function(team) {
        return '0.0';
    };

    PixiRenderer.prototype.createTrainingEffect = function(x, y) {
        var self = this;
        var effect = new PIXI.Container();
        effect.x = x;
        effect.y = y;
        effect.particles = [];

        for (var i = 0; i < 8; i++) {
            var particle = new PIXI.Graphics();
            particle.beginFill(0xe94560, 1);
            particle.drawCircle(0, 0, 4);
            particle.endFill();

            var angle = (i / 8) * Math.PI * 2;
            particle.x = Math.cos(angle) * 30;
            particle.y = Math.sin(angle) * 30;
            particle.baseAngle = angle;
            particle.speed = 0.05;

            effect.addChild(particle);
            effect.particles.push(particle);
        }

        this.containers.particles.addChild(effect);

        effect.life = 60;

        this.animations.push({
            type: 'training',
            obj: effect,
            update: function(delta) {
                var e = this.obj;
                e.life -= delta;
                e.scale.set(1 + (60 - e.life) * 0.02);
                e.alpha = e.life / 60;

                for (var i = 0; i < e.particles.length; i++) {
                    var p = e.particles[i];
                    var a = p.baseAngle + Date.now() * p.speed;
                    p.x = Math.cos(a) * (30 + (60 - e.life));
                    p.y = Math.sin(a) * (30 + (60 - e.life));
                }

                if (e.life <= 0) {
                    self.containers.particles.removeChild(e);
                    return true;
                }
                return false;
            }
        });
    };

    PixiRenderer.prototype.createSkillBadge = function(x, y, skillName) {
        var self = this;
        var badge = new PIXI.Container();
        badge.x = x;
        badge.y = y;

        var bg = new PIXI.Graphics();
        bg.beginFill(0xfbbf24, 0.3);
        bg.lineStyle(2, 0xfbbf24, 0.8);
        bg.drawRoundedRect(0, 0, 100, 30, 15);
        bg.endFill();
        badge.addChild(bg);

        var text = new PIXI.Text('⭐ ' + skillName, {
            fontSize: 12,
            fontWeight: 'bold',
            fill: 0xffffff
        });
        text.anchor.set(0.5);
        text.x = 50;
        text.y = 15;
        badge.addChild(text);

        badge.alpha = 0;
        this.containers.particles.addChild(badge);

        badge.life = 90;

        this.animations.push({
            type: 'badge',
            obj: badge,
            update: function(delta) {
                var b = this.obj;
                b.life -= delta;

                if (b.life > 70) {
                    b.alpha = (70 - b.life) / 20;
                    b.y -= 1;
                } else if (b.life < 20) {
                    b.alpha = b.life / 20;
                }

                if (b.life <= 0) {
                    self.containers.particles.removeChild(b);
                    return true;
                }
                return false;
            }
        });
    };

    PixiRenderer.prototype.clearCards = function() {
        this.containers.cards.removeChildren();
        this.animations = this.animations.filter(function(a) {
            return a.type !== 'cardEntrance';
        });
    };

    PixiRenderer.prototype.clearStandings = function() {
        this.containers.ui.removeChildren();
        this.animations = this.animations.filter(function(a) {
            return a.type !== 'rowEntrance';
        });
    };

    PixiRenderer.prototype.setupInteraction = function() {
        if (!this.app) return;
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;
    };

    PixiRenderer.prototype.startAnimationLoop = function() {
        var self = this;
        this.app.ticker.add(function(delta) {
            self.animations = self.animations.filter(function(animation) {
                try {
                    return !animation.update(delta);
                } catch (e) {
                    console.error('Animation error:', e);
                    return false;
                }
            });
        });
    };

    PixiRenderer.prototype.destroy = function() {
        if (this.app) {
            this.app.destroy(true, { children: true, texture: true });
        }
    };

    global.PixiRenderer = PixiRenderer;
})(typeof window !== 'undefined' ? window : this);
