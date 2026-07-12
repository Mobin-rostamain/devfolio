// static/core/js/background.js
// شبکه سه‌بعدی با ذرات متصل - نسخه حرفه‌ای

(function() {
    'use strict';

    // ایجاد کانواس
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // تنظیمات
    const config = {
        particleCount: 100,
        connectionDistance: 180,
        particleSize: 2,
        glowSize: 6,
        opacity: 0.6,
        color: '#D4A94D',
        speed: 0.3,
        mouseInfluence: 50,
        showCenterGlow: true
    };

    // ذرات
    const particles = [];
    let mouseX = null;
    let mouseY = null;

    // کلاس ذره
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * config.speed;
            this.vy = (Math.random() - 0.5) * config.speed;
            this.radius = Math.random() * 1.5 + 1;
            this.phase = Math.random() * Math.PI * 2;
            this.orbitRadius = Math.random() * 2 + 1;
        }

        update() {
            // حرکت عادی
            this.x += this.vx;
            this.y += this.vy;

            // اثر ماوس
            if (mouseX !== null && mouseY !== null) {
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.mouseInfluence) {
                    const force = (config.mouseInfluence - distance) / config.mouseInfluence;
                    this.x += (dx / distance) * force * 0.3;
                    this.y += (dy / distance) * force * 0.3;
                }
            }

            // بازگشت به مرزها
            if (this.x < 0 || this.x > width) {
                this.vx *= -1;
                this.x = Math.max(0, Math.min(width, this.x));
            }
            if (this.y < 0 || this.y > height) {
                this.vy *= -1;
                this.y = Math.max(0, Math.min(height, this.y));
            }
        }

        draw() {
            // هاله نورانی
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, config.glowSize
            );
            gradient.addColorStop(0, `rgba(212, 169, 77, ${config.opacity * 0.3})`);
            gradient.addColorStop(1, 'rgba(212, 169, 77, 0)');
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, config.glowSize, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // نقطه اصلی
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 169, 77, ${config.opacity})`;
            ctx.fill();

            // نقطه درخشان‌تر در مرکز
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${config.opacity * 0.3})`;
            ctx.fill();
        }
    }

    // ایجاد ذرات
    function initParticles() {
        particles.length = 0;
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // رسم اتصالات بین ذرات
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.connectionDistance) {
                    // محاسبه شفافیت بر اساس فاصله
                    const opacity = 1 - (distance / config.connectionDistance);
                    const finalOpacity = opacity * config.opacity * 0.4;
                    
                    // خط اصلی
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(212, 169, 77, ${finalOpacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();

                    // خط با درخشش بیشتر برای اتصالات نزدیک
                    if (opacity > 0.7) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(212, 169, 77, ${finalOpacity * 0.3})`;
                        ctx.lineWidth = 2;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }
    }

    // رسم گرادیان پس‌زمینه
    function drawBackground() {
        // پس‌زمینه اصلی
        ctx.fillStyle = '#070B18';
        ctx.fillRect(0, 0, width, height);

        // گرادیان ملایم در مرکز
        const gradient = ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, Math.max(width, height) * 0.6
        );
        gradient.addColorStop(0, 'rgba(212, 169, 77, 0.03)');
        gradient.addColorStop(0.5, 'rgba(212, 169, 77, 0.01)');
        gradient.addColorStop(1, 'rgba(7, 11, 24, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    // رسم دایره مرکزی بزرگ
    function drawCenterGlow() {
        if (!config.showCenterGlow) return;
        
        const centerX = width / 2;
        const centerY = height / 2;
        const time = Date.now() * 0.0005;
        const pulse = Math.sin(time) * 0.5 + 0.5;
        
        // هاله بزرگ
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, Math.min(width, height) * 0.4
        );
        gradient.addColorStop(0, `rgba(212, 169, 77, ${0.03 + pulse * 0.02})`);
        gradient.addColorStop(0.5, `rgba(212, 169, 77, ${0.01 + pulse * 0.01})`);
        gradient.addColorStop(1, 'rgba(212, 169, 77, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // دایره محو
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.min(width, height) * 0.2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212, 169, 77, ${0.03 + pulse * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // حلقه اصلی انیمیشن
    function animate() {
        drawBackground();
        drawCenterGlow();
        
        // به‌روزرسانی و رسم ذرات
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        drawConnections();
        
        // نمایش تعداد ذرات و FPS (اختیاری - برای دیباگ)
        // drawDebug();
        
        requestAnimationFrame(animate);
    }

    // دیباگ (اختیاری)
    function drawDebug() {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '12px monospace';
        ctx.fillText(`Particles: ${particles.length}`, 10, 20);
    }

    // رویدادهای ماوس
    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }

    function handleMouseLeave() {
        mouseX = null;
        mouseY = null;
    }

    // رویدادهای تاچ برای موبایل
    function handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        if (touch) {
            const rect = canvas.getBoundingClientRect();
            mouseX = touch.clientX - rect.left;
            mouseY = touch.clientY - rect.top;
        }
    }

    function handleTouchEnd() {
        mouseX = null;
        mouseY = null;
    }

    // ریسایز
    function handleResize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        
        // بازنشانی ذرات برای جلوگیری از خروج از مرز
        particles.forEach(p => {
            p.x = Math.min(p.x, width);
            p.y = Math.min(p.y, height);
        });
    }

    // مقداردهی اولیه
    function init() {
        initParticles();
        animate();
        
        // رویدادها
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('resize', handleResize);
        
        // بهینه‌سازی برای عملکرد بهتر
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                // پیش‌رندر
            });
        }
    }

    // شروع
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();