document.addEventListener("DOMContentLoaded", () => {
    const layer = document.getElementById("scroll-lines-layer");
    const svg = document.querySelector(".scroll-lines-svg");
    const lines = document.querySelectorAll(".scroll-line");

    if (!layer || !svg || !lines.length) {
        return;
    }

    layer.classList.add("active");

    let targetScroll = window.scrollY;
    let currentScroll = window.scrollY;

    let targetProgress = 0;
    let currentProgress = 0;

    const clamp = (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    };

    const lerp = (start, end, amount) => {
        return start + (end - start) * amount;
    };

    const ease = (value) => {
        return value * value * (3 - 2 * value);
    };

    function getProgress() {
        const hero = document.querySelector(".hero");

        if (!hero) {
            return clamp(
                window.scrollY / (window.innerHeight * 0.9),
                0,
                1
            );
        }

        return clamp(
            window.scrollY / (hero.offsetHeight * 0.9),
            0,
            1
        );
    }

    function updateTarget() {
        targetScroll = window.scrollY;
        targetProgress = getProgress();
    }

    function animate() {
        currentScroll = lerp(
            currentScroll,
            targetScroll,
            0.075
        );

        currentProgress = lerp(
            currentProgress,
            targetProgress,
            0.065
        );

        const progress = ease(currentProgress);

        const moveX = lerp(0, -55, progress);
        const moveY = lerp(0, 35, progress);

        const rotation = lerp(0, -1.8, progress);

        const scale = lerp(1, 1.055, progress);

        svg.style.transform =
            `translate3d(${moveX}px, ${moveY}px, 0) rotate(${rotation}deg) scale(${scale})`;

        if (lines[0]) {
            const x =
                Math.sin(currentScroll * 0.0012) * 18;

            const y =
                currentScroll * 0.035;

            lines[0].style.transform =
                `translate3d(${x}px, ${y}px, 0)`;

            lines[0].style.opacity =
                lerp(0.28, 0.10, progress);
        }

        if (lines[1]) {
            const x =
                Math.sin(currentScroll * 0.0008 + 1.5) * 35;

            const y =
                currentScroll * -0.022;

            lines[1].style.transform =
                `translate3d(${x}px, ${y}px, 0)`;

            lines[1].style.opacity =
                lerp(0.16, 0.07, progress);
        }

        if (lines[2]) {
            const x =
                currentScroll * -0.045;

            const y =
                Math.sin(currentScroll * 0.001) * 22;

            lines[2].style.transform =
                `translate3d(${x}px, ${y}px, 0)`;

            lines[2].style.opacity =
                lerp(0.20, 0.08, progress);
        }

        if (lines[3]) {
            const x =
                Math.sin(currentScroll * 0.00065) * 45;

            const y =
                currentScroll * 0.028;

            lines[3].style.transform =
                `translate3d(${x}px, ${y}px, 0)`;

            lines[3].style.opacity =
                lerp(0.25, 0.09, progress);
        }

        if (lines[4]) {
            const x =
                currentScroll * 0.032;

            const y =
                Math.sin(currentScroll * 0.0013) * 30;

            lines[4].style.transform =
                `translate3d(${x}px, ${y}px, 0)`;

            lines[4].style.opacity =
                lerp(0.14, 0.05, progress);
        }

        if (lines[5]) {
            const x =
                Math.sin(currentScroll * 0.00055 + 3) * 55;

            const y =
                currentScroll * -0.035;

            lines[5].style.transform =
                `translate3d(${x}px, ${y}px, 0)`;

            lines[5].style.opacity =
                lerp(0.22, 0.07, progress);
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener(
        "scroll",
        updateTarget,
        { passive: true }
    );

    window.addEventListener(
        "resize",
        updateTarget,
        { passive: true }
    );

    updateTarget();

    requestAnimationFrame(animate);
});