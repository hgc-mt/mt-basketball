/**
 * 招募界面 PixiJS 渲染器
 * 为招募系统添加流畅的动画效果和视觉优化
 */

class RecruitmentPixiRenderer {
    constructor() {
        this.app = null;
        this.containers = {};
        this.cards = new Map();
        this.particles = [];
        this.animations = [];
        this.isInitialized = false;
    }

    /**
     * 初始化 PixiJS 应用
     */
    init(containerId) {
        if (this.isInitialized) return Promise.resolve(true);
        
        containerId = containerId || 'recruitment-pixi-container';
        
        if (typeof PIXI === 'undefined') {
            console.warn('Pixi.js not loaded, skipping Pixi renderer');
            return Promise.resolve(false);
        }

        // 创建或获取容器
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.pointerEvents = 'none';
            container.style.zIndex = '1000';
            document.body.appendChild(container);
        }

        // 创建 Pixi 应用
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundAlpha: 0,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        container.appendChild(this.app.view);

        // 创建容器层级
        this.containers.background = new PIXI.Container();
        this.containers.cards = new PIXI.Container();
        this.containers.effects = new PIXI.Container();
        this.containers.ui = new PIXI.Container();

        this.app.stage.addChild(this.containers.background);
        this.app.stage.addChild(this.containers.cards);
        this.app.stage.addChild(this.containers.effects);
        this.app.stage.addChild(this.containers.ui);

        // 设置背景效果
        this.setupBackgroundEffects();
        
        // 启动动画循环
        this.startAnimationLoop();

        // 监听窗口大小变化
        window.addEventListener('resize', () => this.resize());

        this.isInitialized = true;
        console.log('[RecruitmentPixiRenderer] Initialized');
        return Promise.resolve(true);
    }

    /**
     * 调整大小
     */
    resize() {
        if (!this.app) return;
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
    }

    /**
     * 设置背景效果
     */
    setupBackgroundEffects() {
        // 创建渐变光晕
        const glow1 = new PIXI.Graphics();
        glow1.beginFill(0x667eea, 0.05);
        glow1.drawCircle(0, 0, 300);
        glow1.endFill();
        glow1.x = window.innerWidth * 0.2;
        glow1.y = window.innerHeight * 0.3;
        this.containers.background.addChild(glow1);

        const glow2 = new PIXI.Graphics();
        glow2.beginFill(0x764ba2, 0.05);
        glow2.drawCircle(0, 0, 400);
        glow2.endFill();
        glow2.x = window.innerWidth * 0.8;
        glow2.y = window.innerHeight * 0.7;
        this.containers.background.addChild(glow2);

        // 添加浮动动画
        this.animateGlow(glow1, 0.02, 20);
        this.animateGlow(glow2, 0.015, 30);
    }

    /**
     * 光晕浮动动画
     */
    animateGlow(glow, speed, amplitude) {
        let time = Math.random() * Math.PI * 2;
        const originalX = glow.x;
        const originalY = glow.y;

        const animate = () => {
            time += speed;
            glow.x = originalX + Math.sin(time) * amplitude;
            glow.y = originalY + Math.cos(time * 0.7) * amplitude;
            glow.alpha = 0.03 + Math.sin(time * 0.5) * 0.02;
        };

        this.app.ticker.add(animate);
    }

    /**
     * 创建球员卡片进入动画
     */
    animateCardEntry(element, index = 0) {
        if (!this.isInitialized) return;

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // 创建进入粒子效果
        this.createEntryParticles(centerX, centerY, index * 50);
    }

    /**
     * 创建进入粒子
     */
    createEntryParticles(x, y, delay = 0) {
        setTimeout(() => {
            const particleCount = 8;
            const colors = [0x667eea, 0x764ba2, 0xf093fb, 0xf5576c];

            for (let i = 0; i < particleCount; i++) {
                const particle = new PIXI.Graphics();
                const color = colors[Math.floor(Math.random() * colors.length)];
                const size = 3 + Math.random() * 4;

                particle.beginFill(color, 0.8);
                particle.drawCircle(0, 0, size);
                particle.endFill();

                particle.x = x;
                particle.y = y;
                particle.alpha = 1;

                this.containers.effects.addChild(particle);

                // 粒子飞散动画
                const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.5;
                const speed = 2 + Math.random() * 3;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;

                let life = 1;
                const animate = () => {
                    life -= 0.02;
                    particle.x += vx;
                    particle.y += vy;
                    particle.alpha = life;
                    particle.scale.set(life);

                    if (life <= 0) {
                        this.app.ticker.remove(animate);
                        this.containers.effects.removeChild(particle);
                        particle.destroy();
                    }
                };

                this.app.ticker.add(animate);
            }
        }, delay);
    }

    /**
     * 创建招募行动效果
     */
    animateRecruitmentAction(actionType, x, y) {
        if (!this.isInitialized) return;

        const actionEffects = {
            'campus_visit': { color: 0x667eea, icon: '🏫', text: '校园参观' },
            'home_visit': { color: 0x764ba2, icon: '🏠', text: '家访' },
            'promise_playing_time': { color: 0x10b981, icon: '⏱️', text: '承诺时间' },
            'highlight_facilities': { color: 0xf59e0b, icon: '🏋️', text: '展示设施' },
            'emphasize_academics': { color: 0x3b82f6, icon: '📚', text: '强调学术' },
            'offer_scholarship': { color: 0xef4444, icon: '💰', text: '奖学金' }
        };

        const effect = actionEffects[actionType] || { color: 0x667eea, icon: '✨', text: '行动' };

        // 创建波纹效果
        this.createRippleEffect(x, y, effect.color);

        // 创建上升文字
        this.createFloatingText(x, y - 50, `+${effect.text}`, effect.color);

        // 创建粒子爆发
        this.createBurstParticles(x, y, effect.color);
    }

    /**
     * 创建波纹效果
     */
    createRippleEffect(x, y, color) {
        const ripple = new PIXI.Graphics();
        ripple.lineStyle(3, color, 0.8);
        ripple.drawCircle(0, 0, 10);
        ripple.x = x;
        ripple.y = y;
        this.containers.effects.addChild(ripple);

        let scale = 1;
        let alpha = 0.8;

        const animate = () => {
            scale += 0.05;
            alpha -= 0.015;
            ripple.scale.set(scale);
            ripple.alpha = alpha;

            if (alpha <= 0) {
                this.app.ticker.remove(animate);
                this.containers.effects.removeChild(ripple);
                ripple.destroy();
            }
        };

        this.app.ticker.add(animate);
    }

    /**
     * 创建浮动文字
     */
    createFloatingText(x, y, text, color) {
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 18,
            fontWeight: 'bold',
            fill: color,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 2,
        });

        const textObj = new PIXI.Text(text, style);
        textObj.x = x;
        textObj.y = y;
        textObj.anchor.set(0.5);
        this.containers.ui.addChild(textObj);

        let life = 1;
        const animate = () => {
            life -= 0.015;
            textObj.y -= 1.5;
            textObj.alpha = life;

            if (life <= 0) {
                this.app.ticker.remove(animate);
                this.containers.ui.removeChild(textObj);
                textObj.destroy();
            }
        };

        this.app.ticker.add(animate);
    }

    /**
     * 创建粒子爆发
     */
    createBurstParticles(x, y, color) {
        const particleCount = 12;

        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            const size = 2 + Math.random() * 3;

            particle.beginFill(color, 0.9);
            particle.drawCircle(0, 0, size);
            particle.endFill();

            particle.x = x;
            particle.y = y;

            this.containers.effects.addChild(particle);

            const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.3;
            const speed = 3 + Math.random() * 4;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            let life = 1;
            const animate = () => {
                life -= 0.025;
                particle.x += vx;
                particle.y += vy;
                particle.alpha = life;

                if (life <= 0) {
                    this.app.ticker.remove(animate);
                    this.containers.effects.removeChild(particle);
                    particle.destroy();
                }
            };

            this.app.ticker.add(animate);
        }
    }

    /**
     * 创建兴趣度增加动画
     */
    animateInterestIncrease(x, y, amount) {
        if (!this.isInitialized) return;

        // 创建上升的数字
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 28,
            fontWeight: 'bold',
            fill: 0x10b981,
            stroke: '#000000',
            strokeThickness: 3,
        });

        const text = new PIXI.Text(`+${amount}%`, style);
        text.x = x;
        text.y = y;
        text.anchor.set(0.5);
        text.scale.set(0);
        this.containers.ui.addChild(text);

        let time = 0;
        const animate = () => {
            time += 0.05;
            
            // 缩放动画
            if (time < 0.3) {
                text.scale.set(time / 0.3 * 1.2);
            } else if (time < 0.5) {
                text.scale.set(1.2 - (time - 0.3) / 0.2 * 0.2);
            } else {
                text.scale.set(1);
                text.y -= 2;
            }

            // 淡出
            if (time > 1.5) {
                text.alpha -= 0.03;
            }

            if (text.alpha <= 0) {
                this.app.ticker.remove(animate);
                this.containers.ui.removeChild(text);
                text.destroy();
            }
        };

        this.app.ticker.add(animate);

        // 创建庆祝粒子
        this.createCelebrationParticles(x, y);
    }

    /**
     * 创建庆祝粒子
     */
    createCelebrationParticles(x, y) {
        const colors = [0x10b981, 0x34d399, 0x6ee7b7, 0xfbbf24, 0xf59e0b];
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 3 + Math.random() * 4;

            particle.beginFill(color, 1);
            particle.drawCircle(0, 0, size);
            particle.endFill();

            particle.x = x;
            particle.y = y;

            this.containers.effects.addChild(particle);

            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
            const speed = 5 + Math.random() * 6;
            let vx = Math.cos(angle) * speed;
            let vy = Math.sin(angle) * speed;
            let gravity = 0.3;

            let life = 1;
            const animate = () => {
                life -= 0.015;
                vx *= 0.98;
                vy += gravity;
                particle.x += vx;
                particle.y += vy;
                particle.alpha = life;
                particle.rotation += 0.1;

                if (life <= 0) {
                    this.app.ticker.remove(animate);
                    this.containers.effects.removeChild(particle);
                    particle.destroy();
                }
            };

            this.app.ticker.add(animate);
        }
    }

    /**
     * 创建按钮点击效果
     */
    animateButtonClick(element) {
        if (!this.isInitialized || !element) return;

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // 创建点击波纹
        const ripple = new PIXI.Graphics();
        ripple.beginFill(0xffffff, 0.3);
        ripple.drawCircle(0, 0, 5);
        ripple.endFill();
        ripple.x = centerX;
        ripple.y = centerY;
        this.containers.effects.addChild(ripple);

        let scale = 1;
        let alpha = 0.3;

        const animate = () => {
            scale += 0.15;
            alpha -= 0.02;
            ripple.scale.set(scale);
            ripple.alpha = alpha;

            if (alpha <= 0) {
                this.app.ticker.remove(animate);
                this.containers.effects.removeChild(ripple);
                ripple.destroy();
            }
        };

        this.app.ticker.add(animate);
    }

    /**
     * 创建谈判开启效果
     */
    animateNegotiationStart(x, y) {
        if (!this.isInitialized) return;

        // 创建扩散圆环
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const ring = new PIXI.Graphics();
                ring.lineStyle(2, 0x667eea, 0.6);
                ring.drawCircle(0, 0, 30);
                ring.x = x;
                ring.y = y;
                this.containers.effects.addChild(ring);

                let scale = 1;
                let alpha = 0.6;

                const animate = () => {
                    scale += 0.08;
                    alpha -= 0.015;
                    ring.scale.set(scale);
                    ring.alpha = alpha;

                    if (alpha <= 0) {
                        this.app.ticker.remove(animate);
                        this.containers.effects.removeChild(ring);
                        ring.destroy();
                    }
                };

                this.app.ticker.add(animate);
            }, i * 200);
        }

        // 创建中心闪光
        const flash = new PIXI.Graphics();
        flash.beginFill(0xffffff, 1);
        flash.drawCircle(0, 0, 50);
        flash.endFill();
        flash.x = x;
        flash.y = y;
        this.containers.effects.addChild(flash);

        let flashAlpha = 1;
        const flashAnimate = () => {
            flashAlpha -= 0.05;
            flash.alpha = flashAlpha;
            flash.scale.set(2 - flashAlpha);

            if (flashAlpha <= 0) {
                this.app.ticker.remove(flashAnimate);
                this.containers.effects.removeChild(flash);
                flash.destroy();
            }
        };

        this.app.ticker.add(flashAnimate);
    }

    /**
     * 启动动画循环
     */
    startAnimationLoop() {
        // 动画在各自的方法中通过 ticker 添加
    }

    /**
     * 销毁渲染器
     */
    destroy() {
        if (this.app) {
            this.app.destroy(true);
            this.app = null;
        }
        this.isInitialized = false;
        this.cards.clear();
        this.particles = [];
        this.animations = [];
    }
}

// 创建全局实例
window.recruitmentPixiRenderer = new RecruitmentPixiRenderer();
