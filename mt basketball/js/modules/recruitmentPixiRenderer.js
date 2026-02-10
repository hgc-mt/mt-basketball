/**
 * 招募界面 PixiJS 渲染器 - 炫酷动画版
 * 为招募系统添加电影级别的视觉效果
 */

class RecruitmentPixiRenderer {
    constructor() {
        this.app = null;
        this.containers = {};
        this.cards = new Map();
        this.particles = [];
        this.animations = [];
        this.isInitialized = false;
        this.easings = {
            easeOutElastic: (t) => {
                const c4 = (2 * Math.PI) / 3;
                return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
            },
            easeOutBack: (t) => {
                const c1 = 1.70158;
                const c3 = c1 + 1;
                return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
            },
            easeOutBounce: (t) => {
                const n1 = 7.5625;
                const d1 = 2.75;
                if (t < 1 / d1) {
                    return n1 * t * t;
                } else if (t < 2 / d1) {
                    return n1 * (t -= 1.5 / d1) * t + 0.75;
                } else if (t < 2.5 / d1) {
                    return n1 * (t -= 2.25 / d1) * t + 0.9375;
                } else {
                    return n1 * (t -= 2.625 / d1) * t + 0.984375;
                }
            },
            easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        };
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
            container.style.zIndex = '9999';
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
     * 设置背景效果 - 炫酷星空粒子
     */
    setupBackgroundEffects() {
        // 创建星空粒子
        this.createStarField();
        
        // 创建动态光晕
        this.createDynamicGlows();
    }

    /**
     * 创建星空粒子背景
     */
    createStarField() {
        const starCount = 100;
        const stars = [];

        for (let i = 0; i < starCount; i++) {
            const star = new PIXI.Graphics();
            const size = Math.random() * 2 + 0.5;
            const alpha = Math.random() * 0.5 + 0.2;
            
            star.beginFill(0xffffff, alpha);
            star.drawCircle(0, 0, size);
            star.endFill();
            
            star.x = Math.random() * window.innerWidth;
            star.y = Math.random() * window.innerHeight;
            star.baseAlpha = alpha;
            star.twinkleSpeed = Math.random() * 0.02 + 0.01;
            star.twinklePhase = Math.random() * Math.PI * 2;
            
            this.containers.background.addChild(star);
            stars.push(star);
        }

        // 闪烁动画
        this.app.ticker.add(() => {
            stars.forEach(star => {
                star.twinklePhase += star.twinkleSpeed;
                star.alpha = star.baseAlpha + Math.sin(star.twinklePhase) * 0.2;
            });
        });
    }

    /**
     * 创建动态光晕
     */
    createDynamicGlows() {
        const colors = [0x667eea, 0x764ba2, 0xf093fb, 0x4facfe];
        
        colors.forEach((color, index) => {
            const glow = new PIXI.Graphics();
            const radius = 200 + Math.random() * 200;
            
            // 创建径向渐变效果
            for (let i = 10; i > 0; i--) {
                const alpha = 0.03 * i / 10;
                glow.beginFill(color, alpha);
                glow.drawCircle(0, 0, radius * i / 10);
                glow.endFill();
            }
            
            glow.x = Math.random() * window.innerWidth;
            glow.y = Math.random() * window.innerHeight;
            
            this.containers.background.addChild(glow);
            
            // 浮动动画
            this.animateGlowFloating(glow, index);
        });
    }

    /**
     * 光晕浮动动画
     */
    animateGlowFloating(glow, index) {
        const baseX = glow.x;
        const baseY = glow.y;
        const speed = 0.0005 + index * 0.0002;
        const radius = 100 + index * 50;
        const phase = index * Math.PI / 2;
        
        this.app.ticker.add((delta) => {
            const time = Date.now() * speed;
            glow.x = baseX + Math.cos(time + phase) * radius;
            glow.y = baseY + Math.sin(time * 0.7 + phase) * radius * 0.6;
            glow.alpha = 0.5 + Math.sin(time * 2) * 0.2;
        });
    }

    /**
     * 创建球员卡片进入动画 - 炫酷版
     */
    animateCardEntry(element, index = 0) {
        if (!this.isInitialized) return;

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // 延迟执行，创造依次进入效果
        setTimeout(() => {
            // 创建冲击波
            this.createShockwave(centerX, centerY);
            
            // 创建粒子爆发
            this.createCardEntryParticles(centerX, centerY);
            
            // 创建光柱
            this.createLightBeam(centerX, centerY);
        }, index * 80);
    }

    /**
     * 创建冲击波
     */
    createShockwave(x, y) {
        const wave = new PIXI.Graphics();
        wave.lineStyle(3, 0x667eea, 0.8);
        wave.drawCircle(0, 0, 10);
        wave.x = x;
        wave.y = y;
        this.containers.effects.addChild(wave);

        let progress = 0;
        const animate = () => {
            progress += 0.03;
            const eased = this.easings.easeOutElastic(progress);
            
            wave.scale.set(1 + eased * 4);
            wave.alpha = 0.8 * (1 - progress);
            wave.rotation += 0.1;

            if (progress >= 1) {
                this.app.ticker.remove(animate);
                this.containers.effects.removeChild(wave);
                wave.destroy();
            }
        };

        this.app.ticker.add(animate);
    }

    /**
     * 创建光柱效果
     */
    createLightBeam(x, y) {
        const beam = new PIXI.Graphics();
        const width = 60;
        const height = 200;
        
        // 渐变光柱
        for (let i = 0; i < 10; i++) {
            const alpha = 0.1 * (1 - i / 10);
            beam.beginFill(0x667eea, alpha);
            beam.drawRect(-width / 2, -height, width * (1 - i / 10), height / 10);
            beam.endFill();
        }
        
        beam.x = x;
        beam.y = y;
        beam.alpha = 0;
        beam.scale.y = 0;
        
        this.containers.effects.addChild(beam);

        let progress = 0;
        const animate = () => {
            progress += 0.05;
            
            if (progress < 0.3) {
                beam.alpha = progress / 0.3;
                beam.scale.y = this.easings.easeOutBack(progress / 0.3);
            } else if (progress > 0.7) {
                beam.alpha = 1 - (progress - 0.7) / 0.3;
            }

            if (progress >= 1) {
                this.app.ticker.remove(animate);
                this.containers.effects.removeChild(beam);
                beam.destroy();
            }
        };

        this.app.ticker.add(animate);
    }

    /**
     * 创建卡片进入粒子 - 炫酷版
     */
    createCardEntryParticles(x, y) {
        const particleCount = 20;
        const colors = [0x667eea, 0x764ba2, 0xf093fb, 0x4facfe, 0x00f2fe];

        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 4 + Math.random() * 6;

            // 发光效果
            particle.beginFill(color, 0.3);
            particle.drawCircle(0, 0, size * 2);
            particle.endFill();
            
            particle.beginFill(color, 0.8);
            particle.drawCircle(0, 0, size);
            particle.endFill();

            particle.x = x;
            particle.y = y;

            this.containers.effects.addChild(particle);

            const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.5;
            const speed = 3 + Math.random() * 4;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            let life = 1;
            let scale = 1;
            
            const animate = () => {
                life -= 0.015;
                scale = this.easings.easeOutElastic(1 - life);
                
                particle.x += vx * scale;
                particle.y += vy * scale;
                particle.alpha = life;
                particle.scale.set(scale);
                particle.rotation += 0.15;

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
     * 创建招募行动效果 - 炫酷版
     */
    animateRecruitmentAction(actionType, x, y) {
        if (!this.isInitialized) return;

        const actionEffects = {
            'campus_visit': { color: 0x667eea, icon: '🏫', text: '校园参观', glowColor: 0x4facfe },
            'home_visit': { color: 0x764ba2, icon: '🏠', text: '家访', glowColor: 0xa855f7 },
            'promise_playing_time': { color: 0x10b981, icon: '⏱️', text: '承诺时间', glowColor: 0x34d399 },
            'highlight_facilities': { color: 0xf59e0b, icon: '🏋️', text: '展示设施', glowColor: 0xfbbf24 },
            'emphasize_academics': { color: 0x3b82f6, icon: '📚', text: '强调学术', glowColor: 0x60a5fa },
            'offer_scholarship': { color: 0xef4444, icon: '💰', text: '奖学金', glowColor: 0xf87171 }
        };

        const effect = actionEffects[actionType] || { color: 0x667eea, icon: '✨', text: '行动', glowColor: 0x4facfe };

        // 创建多层波纹
        this.createMultiRipple(x, y, effect.glowColor);

        // 创建上升文字
        this.createFloatingText(x, y - 60, effect.text, effect.color);

        // 创建粒子爆发
        this.createEnhancedBurstParticles(x, y, effect.glowColor);

        // 创建光晕扩散
        this.createGlowBurst(x, y, effect.glowColor);
    }

    /**
     * 创建多层波纹
     */
    createMultiRipple(x, y, color) {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const ripple = new PIXI.Graphics();
                ripple.lineStyle(4 - i, color, 0.6 - i * 0.15);
                ripple.drawCircle(0, 0, 20);
                ripple.x = x;
                ripple.y = y;
                this.containers.effects.addChild(ripple);

                let progress = 0;
                const animate = () => {
                    progress += 0.025;
                    const eased = this.easings.easeOutElastic(progress);
                    
                    ripple.scale.set(1 + eased * 5);
                    ripple.alpha = (0.6 - i * 0.15) * (1 - progress);
                    ripple.rotation += 0.05;

                    if (progress >= 1) {
                        this.app.ticker.remove(animate);
                        this.containers.effects.removeChild(ripple);
                        ripple.destroy();
                    }
                };

                this.app.ticker.add(animate);
            }, i * 100);
        }
    }

    /**
     * 创建光晕爆发
     */
    createGlowBurst(x, y, color) {
        const glow = new PIXI.Graphics();
        
        for (let i = 5; i > 0; i--) {
            glow.beginFill(color, 0.1);
            glow.drawCircle(0, 0, 30 * i);
            glow.endFill();
        }
        
        glow.x = x;
        glow.y = y;
        glow.scale.set(0);
        
        this.containers.effects.addChild(glow);

        let progress = 0;
        const animate = () => {
            progress += 0.04;
            const eased = this.easings.easeOutBack(progress);
            
            glow.scale.set(eased * 2);
            glow.alpha = 1 - progress;

            if (progress >= 1) {
                this.app.ticker.remove(animate);
                this.containers.effects.removeChild(glow);
                glow.destroy();
            }
        };

        this.app.ticker.add(animate);
    }

    /**
     * 创建浮动文字 - 炫酷版
     */
    createFloatingText(x, y, text, color) {
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 24,
            fontWeight: 'bold',
            fill: color,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 8,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 3,
            stroke: '#ffffff',
            strokeThickness: 2
        });

        const textObj = new PIXI.Text(text, style);
        textObj.x = x;
        textObj.y = y;
        textObj.anchor.set(0.5);
        textObj.scale.set(0);
        textObj.alpha = 0;
        
        this.containers.ui.addChild(textObj);

        let progress = 0;
        const animate = () => {
            progress += 0.025;
            
            if (progress < 0.3) {
                // 弹入
                const eased = this.easings.easeOutBack(progress / 0.3);
                textObj.scale.set(eased);
                textObj.alpha = eased;
            } else if (progress < 0.7) {
                // 停留
                textObj.scale.set(1 + Math.sin((progress - 0.3) * 10) * 0.05);
                textObj.alpha = 1;
            } else {
                // 淡出
                textObj.y -= 2;
                textObj.alpha = 1 - (progress - 0.7) / 0.3;
            }

            if (progress >= 1) {
                this.app.ticker.remove(animate);
                this.containers.ui.removeChild(textObj);
                textObj.destroy();
            }
        };

        this.app.ticker.add(animate);
    }

    /**
     * 创建增强粒子爆发
     */
    createEnhancedBurstParticles(x, y, color) {
        const particleCount = 30;
        const colors = [color, 0xffffff, color];

        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            const particleColor = colors[Math.floor(Math.random() * colors.length)];
            const size = 3 + Math.random() * 5;

            // 发光效果
            particle.beginFill(particleColor, 0.4);
            particle.drawCircle(0, 0, size * 1.5);
            particle.endFill();
            
            particle.beginFill(particleColor, 1);
            particle.drawCircle(0, 0, size);
            particle.endFill();

            particle.x = x;
            particle.y = y;

            this.containers.effects.addChild(particle);

            const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.5;
            const speed = 4 + Math.random() * 6;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            let life = 1;
            let scale = 1;
            
            const animate = () => {
                life -= 0.02;
                scale = this.easings.easeOutElastic(1 - life);
                
                particle.x += vx * scale;
                particle.y += vy * scale;
                particle.alpha = life;
                particle.scale.set(scale);
                particle.rotation += 0.2;

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
     * 创建兴趣度增加动画 - 炫酷版
     */
    animateInterestIncrease(x, y, amount) {
        if (!this.isInitialized) return;

        // 创建上升的数字
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontWeight: 'bold',
            fill: ['#10b981', '#34d399'], // 渐变
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 10,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 4,
            stroke: '#ffffff',
            strokeThickness: 4
        });

        const text = new PIXI.Text(`+${amount}%`, style);
        text.x = x;
        text.y = y;
        text.anchor.set(0.5);
        text.scale.set(0);
        text.alpha = 0;
        
        this.containers.ui.addChild(text);

        // 创建数字周围的旋转光环
        this.createRotatingRing(x, y);

        let progress = 0;
        const animate = () => {
            progress += 0.02;
            
            if (progress < 0.25) {
                // 弹入动画
                const eased = this.easings.easeOutElastic(progress / 0.25);
                text.scale.set(eased);
                text.alpha = eased;
            } else if (progress < 0.6) {
                // 脉冲效果
                const pulse = 1 + Math.sin((progress - 0.25) * 15) * 0.1;
                text.scale.set(pulse);
                text.alpha = 1;
            } else {
                // 上升淡出
                text.y -= 3;
                text.alpha = 1 - (progress - 0.6) / 0.4;
            }

            if (progress >= 1) {
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
     * 创建旋转光环
     */
    createRotatingRing(x, y) {
        const ring = new PIXI.Graphics();
        ring.lineStyle(3, 0x10b981, 0.6);
        ring.drawCircle(0, 0, 50);
        ring.x = x;
        ring.y = y;
        ring.scale.set(0);
        
        this.containers.effects.addChild(ring);

        let progress = 0;
        const animate = () => {
            progress += 0.03;
            
            const eased = this.easings.easeOutBack(progress);
            ring.scale.set(eased);
            ring.rotation += 0.15;
            ring.alpha = 0.6 * (1 - progress);

            if (progress >= 1) {
                this.app.ticker.remove(animate);
                this.containers.effects.removeChild(ring);
                ring.destroy();
            }
        };

        this.app.ticker.add(animate);
    }

    /**
     * 创建庆祝粒子 - 炫酷版
     */
    createCelebrationParticles(x, y) {
        const colors = [0x10b981, 0x34d399, 0x6ee7b7, 0xfbbf24, 0xf59e0b, 0xffffff];
        const particleCount = 40;

        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 4 + Math.random() * 6;

            // 发光效果
            particle.beginFill(color, 0.3);
            particle.drawCircle(0, 0, size * 2);
            particle.endFill();
            
            particle.beginFill(color, 1);
            particle.drawCircle(0, 0, size);
            particle.endFill();

            particle.x = x;
            particle.y = y;

            this.containers.effects.addChild(particle);

            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5;
            const speed = 6 + Math.random() * 8;
            let vx = Math.cos(angle) * speed;
            let vy = Math.sin(angle) * speed;
            let gravity = 0.4;

            let life = 1;
            let scale = 1;
            
            const animate = () => {
                life -= 0.012;
                scale = this.easings.easeOutElastic(1 - life);
                
                vx *= 0.98;
                vy += gravity;
                particle.x += vx * scale;
                particle.y += vy * scale;
                particle.alpha = life;
                particle.scale.set(scale);
                particle.rotation += 0.15;

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
     * 创建谈判开启效果 - 炫酷版
     */
    animateNegotiationStart(x, y) {
        if (!this.isInitialized) return;

        // 创建扩散圆环
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                this.createExpandingRing(x, y, i);
            }, i * 150);
        }

        // 创建中心闪光
        this.createCenterFlash(x, y);

        // 创建粒子爆发
        this.createNegotiationBurst(x, y);

        // 创建上升的光柱
        this.createRisingBeam(x, y);
    }

    /**
     * 创建扩展圆环
     */
    createExpandingRing(x, y, index) {
        const ring = new PIXI.Graphics();
        const colors = [0x667eea, 0x764ba2, 0xf093fb, 0x4facfe];
        const color = colors[index % colors.length];
        
        ring.lineStyle(4, color, 0.8);
        ring.drawCircle(0, 0, 30);
        ring.x = x;
        ring.y = y;
        ring.scale.set(0);
        
        this.containers.effects.addChild(ring);

        let progress = 0;
        const animate = () => {
            progress += 0.025;
            const eased = this.easings.easeOutElastic(progress);
            
            ring.scale.set(1 + eased * 6);
            ring.alpha = 0.8 * (1 - progress);
            ring.rotation += 0.1;

            if (progress >= 1) {
                this.app.ticker.remove(animate);
                this.containers.effects.removeChild(ring);
                ring.destroy();
            }
        };

        this.app.ticker.add(animate);
    }

    /**
     * 创建中心闪光
     */
    createCenterFlash(x, y) {
        const flash = new PIXI.Graphics();
        
        // 多层光晕
        for (let i = 8; i > 0; i--) {
            flash.beginFill(0xffffff, 0.1);
            flash.drawCircle(0, 0, 20 * i);
            flash.endFill();
        }
        
        flash.x = x;
        flash.y = y;
        flash.alpha = 0;
        
        this.containers.effects.addChild(flash);

        let progress = 0;
        const animate = () => {
            progress += 0.04;
            
            if (progress < 0.3) {
                flash.alpha = progress / 0.3;
                flash.scale.set(1 + progress * 3);
            } else {
                flash.alpha = 1 - (progress - 0.3) / 0.7;
                flash.scale.set(1.9 + (progress - 0.3) * 2);
            }

            if (progress >= 1) {
                this.app.ticker.remove(animate);
                this.containers.effects.removeChild(flash);
                flash.destroy();
            }
        };

        this.app.ticker.add(animate);
    }

    /**
     * 创建谈判粒子爆发
     */
    createNegotiationBurst(x, y) {
        const colors = [0x667eea, 0x764ba2, 0xf093fb, 0x4facfe, 0x00f2fe, 0xffffff];
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 3 + Math.random() * 7;

            // 发光效果
            particle.beginFill(color, 0.3);
            particle.drawCircle(0, 0, size * 2);
            particle.endFill();
            
            particle.beginFill(color, 1);
            particle.drawCircle(0, 0, size);
            particle.endFill();

            particle.x = x;
            particle.y = y;

            this.containers.effects.addChild(particle);

            const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.5;
            const speed = 5 + Math.random() * 10;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            let life = 1;
            let scale = 1;
            
            const animate = () => {
                life -= 0.015;
                scale = this.easings.easeOutElastic(1 - life);
                
                particle.x += vx * scale;
                particle.y += vy * scale;
                particle.alpha = life;
                particle.scale.set(scale);
                particle.rotation += 0.2;

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
     * 创建上升光柱
     */
    createRisingBeam(x, y) {
        const beam = new PIXI.Graphics();
        const width = 100;
        const height = 300;
        
        // 渐变光柱
        for (let i = 0; i < 15; i++) {
            const alpha = 0.08 * (1 - i / 15);
            const color = i % 2 === 0 ? 0x667eea : 0x764ba2;
            beam.beginFill(color, alpha);
            beam.drawRect(-width / 2 * (1 - i / 15), -height * (1 - i / 15), width * (1 - i / 15), height / 15);
            beam.endFill();
        }
        
        beam.x = x;
        beam.y = y;
        beam.alpha = 0;
        beam.scale.y = 0;
        
        this.containers.effects.addChild(beam);

        let progress = 0;
        const animate = () => {
            progress += 0.03;
            
            if (progress < 0.4) {
                const eased = this.easings.easeOutBack(progress / 0.4);
                beam.alpha = eased;
                beam.scale.y = eased;
            } else if (progress > 0.7) {
                beam.alpha = 1 - (progress - 0.7) / 0.3;
            }

            beam.y -= 2;

            if (progress >= 1) {
                this.app.ticker.remove(animate);
                this.containers.effects.removeChild(beam);
                beam.destroy();
            }
        };

        this.app.ticker.add(animate);
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
        ripple.beginFill(0xffffff, 0.4);
        ripple.drawCircle(0, 0, 10);
        ripple.endFill();
        ripple.x = centerX;
        ripple.y = centerY;
        this.containers.effects.addChild(ripple);

        let progress = 0;
        const animate = () => {
            progress += 0.08;
            const eased = this.easings.easeOutElastic(progress);
            
            ripple.scale.set(1 + eased * 8);
            ripple.alpha = 0.4 * (1 - progress);

            if (progress >= 1) {
                this.app.ticker.remove(animate);
                this.containers.effects.removeChild(ripple);
                ripple.destroy();
            }
        };

        this.app.ticker.add(animate);
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

    // ==================== 报价设置弹窗动画 ====================

    /**
     * 报价设置弹窗显示动画 - 炫酷入场
     */
    animateOfferModalShow(x, y) {
        if (!this.isInitialized) return;

        // 创建背景光晕扩散
        this.createModalBackdropGlow(x, y);

        // 创建弹窗边框流光
        this.createModalBorderGlow(x, y);

        // 创建粒子汇聚效果
        this.createModalParticleConverge(x, y);

        // 创建中心闪光
        this.createModalCenterFlash(x, y);
    }

    /**
     * 创建弹窗背景光晕
     */
    createModalBackdropGlow(x, y) {
        const glow = new PIXI.Graphics();
        
        // 多层渐变光晕
        for (let i = 10; i > 0; i--) {
            const alpha = 0.03 * (1 - i / 10);
            const color = i % 2 === 0 ? 0x667eea : 0x764ba2;
            glow.beginFill(color, alpha);
            glow.drawCircle(0, 0, 150 + i * 20);
            glow.endFill();
        }
        
        glow.x = x;
        glow.y = y;
        glow.alpha = 0;
        glow.scale.set(0);
        
        this.containers.effects.addChild(glow);

        let progress = 0;
        const animate = () => {
            progress += 0.04;
            
            if (progress < 0.5) {
                const eased = this.easings.easeOutBack(progress / 0.5);
                glow.alpha = eased * 0.8;
                glow.scale.set(eased);
            } else {
                glow.alpha = 0.8 * (1 - (progress - 0.5) / 0.5);
                glow.scale.set(1 + (progress - 0.5) * 0.3);
            }

            if (progress >= 1) {
                this.app.ticker.remove(animate);
                this.containers.effects.removeChild(glow);
                glow.destroy();
            }
        };

        this.app.ticker.add(animate);
    }

    /**
     * 创建弹窗边框流光
     */
    createModalBorderGlow(x, y) {
        const border = new PIXI.Graphics();
        const width = 520;
        const height = 600;
        
        // 绘制发光边框
        border.lineStyle(3, 0x667eea, 0.8);
        border.drawRoundedRect(-width/2, -height/2, width, height, 20);
        
        // 内发光
        border.lineStyle(1, 0x764ba2, 0.4);
        border.drawRoundedRect(-width/2 + 5, -height/2 + 5, width - 10, height - 10, 15);
        
        border.x = x;
        border.y = y;
        border.alpha = 0;
        border.scale.set(0.8);
        
        this.containers.effects.addChild(border);

        let progress = 0;
        const animate = () => {
            progress += 0.035;
            
            const eased = this.easings.easeOutElastic(progress);
            border.alpha = Math.min(1, eased);
            border.scale.set(0.8 + eased * 0.2);
            
            // 流光效果
            border.rotation = Math.sin(progress * 3) * 0.02;

            if (progress >= 1) {
                // 保持显示一段时间
                if (progress > 1.5) {
                    border.alpha = 1 - (progress - 1.5) / 0.5;
                }
            }

            if (progress >= 2) {
                this.app.ticker.remove(animate);
                this.containers.effects.removeChild(border);
                border.destroy();
            }
        };

        this.app.ticker.add(animate);
    }

    /**
     * 创建粒子汇聚效果
     */
    createModalParticleConverge(x, y) {
        const colors = [0x667eea, 0x764ba2, 0xf093fb, 0x4facfe, 0x10b981, 0xf59e0b];
        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 3 + Math.random() * 5;

            // 发光效果
            particle.beginFill(color, 0.3);
            particle.drawCircle(0, 0, size * 2);
            particle.endFill();
            
            particle.beginFill(color, 1);
            particle.drawCircle(0, 0, size);
            particle.endFill();

            // 从四周随机位置开始
            const angle = (Math.PI * 2 / particleCount) * i;
            const distance = 400 + Math.random() * 200;
            particle.x = x + Math.cos(angle) * distance;
            particle.y = y + Math.sin(angle) * distance;

            this.containers.effects.addChild(particle);

            const targetX = x + (Math.random() - 0.5) * 200;
            const targetY = y + (Math.random() - 0.5) * 250;
            
            let progress = 0;
            const animate = () => {
                progress += 0.025;
                const eased = this.easings.easeOutBack(progress);
                
                particle.x = particle.x + (targetX - particle.x) * 0.08;
                particle.y = particle.y + (targetY - particle.y) * 0.08;
                particle.alpha = 1 - progress * 0.5;
                particle.scale.set(1 - progress * 0.3);
                particle.rotation += 0.1;

                if (progress >= 1) {
                    this.app.ticker.remove(animate);
                    this.containers.effects.removeChild(particle);
                    particle.destroy();
                }
            };

            this.app.ticker.add(animate);
        }
    }

    /**
     * 创建弹窗中心闪光
     */
    createModalCenterFlash(x, y) {
        const flash = new PIXI.Graphics();
        
        // 星光效果
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const length = 80;
            const width = 15;
            
            flash.beginFill(0xffffff, 0.6);
            flash.drawPolygon([
                0, 0,
                Math.cos(angle - 0.2) * length, Math.sin(angle - 0.2) * length,
                Math.cos(angle) * (length + 20), Math.sin(angle) * (length + 20),
                Math.cos(angle + 0.2) * length, Math.sin(angle + 0.2) * length
            ]);
            flash.endFill();
        }
        
        // 中心圆
        flash.beginFill(0xffffff, 1);
        flash.drawCircle(0, 0, 30);
        flash.endFill();
        
        flash.x = x;
        flash.y = y;
        flash.alpha = 0;
        flash.scale.set(0);
        
        this.containers.effects.addChild(flash);

        let progress = 0;
        const animate = () => {
            progress += 0.05;
            
            if (progress < 0.3) {
                const eased = this.easings.easeOutElastic(progress / 0.3);
                flash.alpha = eased;
                flash.scale.set(eased);
            } else if (progress < 0.6) {
                flash.alpha = 1 - (progress - 0.3) / 0.3;
                flash.scale.set(1 + (progress - 0.3) * 2);
                flash.rotation += 0.2;
            } else {
                flash.alpha = 0;
            }

            if (progress >= 1) {
                this.app.ticker.remove(animate);
                this.containers.effects.removeChild(flash);
                flash.destroy();
            }
        };

        this.app.ticker.add(animate);
    }

    /**
     * 确认报价按钮点击动画 - 超级炫酷版
     */
    animateConfirmOffer(buttonElement) {
        if (!this.isInitialized || !buttonElement) return;

        const rect = buttonElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // 创建按钮光晕爆发
        this.createButtonGlowBurst(centerX, centerY);

        // 创建冲击波
        this.createShockwave(centerX, centerY);

        // 创建上升粒子流
        this.createRisingParticleStream(centerX, centerY);

        // 创建成功文字
        this.createSuccessFloatingText(centerX, centerY - 80);

        // 创建彩带效果
        this.createConfettiExplosion(centerX, centerY);
    }

    /**
     * 创建按钮光晕爆发
     */
    createButtonGlowBurst(x, y) {
        const burst = new PIXI.Graphics();
        
        // 多层光晕
        for (let i = 6; i > 0; i--) {
            const alpha = 0.2 * (1 - i / 6);
            const color = i % 2 === 0 ? 0x10b981 : 0x059669;
            burst.beginFill(color, alpha);
            burst.drawCircle(0, 0, 30 + i * 15);
            burst.endFill();
        }
        
        burst.x = x;
        burst.y = y;
        burst.alpha = 0;
        burst.scale.set(0);
        
        this.containers.effects.addChild(burst);

        let progress = 0;
        const animate = () => {
            progress += 0.04;
            const eased = this.easings.easeOutElastic(progress);
            
            burst.alpha = eased;
            burst.scale.set(1 + eased * 2);

            if (progress >= 1) {
                burst.alpha = 1 - (progress - 1);
            }

            if (progress >= 2) {
                this.app.ticker.remove(animate);
                this.containers.effects.removeChild(burst);
                burst.destroy();
            }
        };

        this.app.ticker.add(animate);
    }

    /**
     * 创建冲击波
     */
    createShockwave(x, y) {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const wave = new PIXI.Graphics();
                wave.lineStyle(4 - i, 0x10b981, 0.8 - i * 0.2);
                wave.drawCircle(0, 0, 30);
                wave.x = x;
                wave.y = y;
                wave.scale.set(0);
                
                this.containers.effects.addChild(wave);

                let progress = 0;
                const animate = () => {
                    progress += 0.03;
                    const eased = this.easings.easeOutElastic(progress);
                    
                    wave.scale.set(1 + eased * 8);
                    wave.alpha = (0.8 - i * 0.2) * (1 - progress);

                    if (progress >= 1) {
                        this.app.ticker.remove(animate);
                        this.containers.effects.removeChild(wave);
                        wave.destroy();
                    }
                };

                this.app.ticker.add(animate);
            }, i * 100);
        }
    }

    /**
     * 创建上升粒子流
     */
    createRisingParticleStream(x, y) {
        const colors = [0x10b981, 0x34d399, 0x6ee7b7, 0xfbbf24, 0xf59e0b];
        const particleCount = 40;

        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = new PIXI.Graphics();
                const color = colors[Math.floor(Math.random() * colors.length)];
                const size = 3 + Math.random() * 5;

                // 发光效果
                particle.beginFill(color, 0.3);
                particle.drawCircle(0, 0, size * 2);
                particle.endFill();
                
                particle.beginFill(color, 1);
                particle.drawCircle(0, 0, size);
                particle.endFill();

                particle.x = x + (Math.random() - 0.5) * 100;
                particle.y = y;

                this.containers.effects.addChild(particle);

                const speed = 3 + Math.random() * 5;
                let life = 1;
                
                const animate = () => {
                    life -= 0.015;
                    
                    particle.y -= speed;
                    particle.x += Math.sin(particle.y * 0.05) * 2;
                    particle.alpha = life;
                    particle.scale.set(life);
                    particle.rotation += 0.1;

                    if (life <= 0) {
                        this.app.ticker.remove(animate);
                        this.containers.effects.removeChild(particle);
                        particle.destroy();
                    }
                };

                this.app.ticker.add(animate);
            }, i * 30);
        }
    }

    /**
     * 创建成功浮动文字
     */
    createSuccessFloatingText(x, y) {
        const text = new PIXI.Text('谈判发起成功！', {
            fontFamily: 'Arial',
            fontSize: 28,
            fontWeight: 'bold',
            fill: ['#10b981', '#34d399'],
            stroke: '#ffffff',
            strokeThickness: 3,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 10,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 4
        });

        text.anchor.set(0.5);
        text.x = x;
        text.y = y;
        text.alpha = 0;
        text.scale.set(0);

        this.containers.ui.addChild(text);

        let progress = 0;
        const animate = () => {
            progress += 0.02;
            
            if (progress < 0.25) {
                const eased = this.easings.easeOutElastic(progress / 0.25);
                text.scale.set(eased);
                text.alpha = eased;
            } else if (progress < 0.6) {
                const pulse = 1 + Math.sin((progress - 0.25) * 10) * 0.08;
                text.scale.set(pulse);
                text.alpha = 1;
            } else {
                text.y -= 2;
                text.alpha = 1 - (progress - 0.6) / 0.4;
            }

            if (progress >= 1) {
                this.app.ticker.remove(animate);
                this.containers.ui.removeChild(text);
                text.destroy();
            }
        };

        this.app.ticker.add(animate);
    }

    /**
     * 创建彩带爆炸效果
     */
    createConfettiExplosion(x, y) {
        const colors = [0x10b981, 0x34d399, 0x6ee7b7, 0xfbbf24, 0xf59e0b, 0xef4444, 0x3b82f6, 0x8b5cf6];
        const confettiCount = 60;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = new PIXI.Graphics();
            const color = colors[Math.floor(Math.random() * colors.length)];
            const width = 8 + Math.random() * 8;
            const height = 4 + Math.random() * 4;

            confetti.beginFill(color, 1);
            confetti.drawRoundedRect(-width/2, -height/2, width, height, 2);
            confetti.endFill();

            confetti.x = x;
            confetti.y = y;

            this.containers.effects.addChild(confetti);

            const angle = (Math.PI * 2 / confettiCount) * i + (Math.random() - 0.5) * 0.5;
            const speed = 8 + Math.random() * 12;
            let vx = Math.cos(angle) * speed;
            let vy = Math.sin(angle) * speed;
            let gravity = 0.3;
            let rotation = Math.random() * Math.PI * 2;
            let rotationSpeed = (Math.random() - 0.5) * 0.3;
            let life = 1;

            const animate = () => {
                life -= 0.01;
                
                vx *= 0.98;
                vy += gravity;
                confetti.x += vx;
                confetti.y += vy;
                rotation += rotationSpeed;
                confetti.rotation = rotation;
                confetti.alpha = life;

                if (life <= 0) {
                    this.app.ticker.remove(animate);
                    this.containers.effects.removeChild(confetti);
                    confetti.destroy();
                }
            };

            this.app.ticker.add(animate);
        }
    }
}

// 创建全局实例
window.recruitmentPixiRenderer = new RecruitmentPixiRenderer();
