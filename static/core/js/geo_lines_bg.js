(function () {
    const svgRoot = document.querySelector('#geo-lines-bg svg');
    const group = document.querySelector('.geo-line-group');
    const lines = document.querySelectorAll('.geo-line');
    if (!lines.length || !group) return;

    // ===== جریان نور روی خطوط بر اساس اسکرول (مثل قبل) =====
    lines.forEach((line) => {
        const length = line.getTotalLength();
        const dash = length * 0.35;
        const gap = length - dash;
        line.style.strokeDasharray = `${dash} ${gap}`;
        line.dataset.length = length;
    });

    let ticking = false;

    function getScrollProgress() {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll <= 0) return 0;
        return window.scrollY / maxScroll;
    }

    function updateLines() {
        const progress = getScrollProgress();
        lines.forEach((line, i) => {
            const length = parseFloat(line.dataset.length);
            const offset = (progress * length + i * 120) % length;
            line.style.strokeDashoffset = -offset;
        });
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateLines();
                ticking = false;
            });
            ticking = true;
        }
    });
    window.addEventListener('resize', updateLines);
    updateLines();

    // ===== جرقه‌های نورانی که پیوسته و مستقل از اسکرول رو خطوط حرکت می‌کنن =====
    const svgNS = 'http://www.w3.org/2000/svg';
    const sparks = [];

    lines.forEach((line, i) => {
        const spark = document.createElementNS(svgNS, 'circle');
        spark.setAttribute('r', '4');
        spark.setAttribute('fill', '#FFF6E0');
        spark.setAttribute('class', 'geo-spark');
        group.appendChild(spark);

        sparks.push({
            element: spark,
            path: line,
            length: line.getTotalLength(),
            speed: 0.00006 + (i % 4) * 0.00002, // سرعت‌های کمی متفاوت برای هر خط
            offset: (i * 137) % 1000 // تا همه‌ی جرقه‌ها هم‌زمان شروع نکنن
        });
    });

    function animateSparks(timestamp) {
        sparks.forEach((s) => {
            const t = ((timestamp + s.offset) * s.speed) % 1;
            const point = s.path.getPointAtLength(t * s.length);
            s.element.setAttribute('cx', point.x);
            s.element.setAttribute('cy', point.y);
        });
        requestAnimationFrame(animateSparks);
    }
    requestAnimationFrame(animateSparks);

    // ===== پارالاکس ظریف با حرکت موس =====
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animateParallax() {
        currentX += (mouseX * 10 - currentX) * 0.04;
        currentY += (mouseY * 8 - currentY) * 0.04;
        if (svgRoot) {
            svgRoot.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }
        requestAnimationFrame(animateParallax);
    }
    requestAnimationFrame(animateParallax);
})();