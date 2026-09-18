window.addEventListener('load', () => {
    const minDisplayTime = 1000; // حداقل زمان نمایش (میلی‌ثانیه) تا لودینگ خیلی سریع محو نشه و چشمک نزنه
    const startTime = performance.now();

    const hideLoader = () => {
        const elapsed = performance.now() - startTime;
        const remainingWait = Math.max(0, minDisplayTime - elapsed);

        setTimeout(() => {
            const loader = document.getElementById('loading-screen');
            if (loader) {
                loader.classList.add('is-hidden');
                // بعد از اتمام انیمیشن محوشدن، کامل از DOM حذفش کن
                setTimeout(() => loader.remove(), 700);
            }
        }, remainingWait);
    };

    hideLoader();
});