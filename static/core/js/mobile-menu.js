(function () {
    const toggle = document.getElementById('mobileMenuToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
        links.classList.toggle('is-open');
        toggle.classList.toggle('is-open');
    });

    // با کلیک روی هر لینک، منو خودش بسته بشه (تجربه‌ی کاربری بهتر)
    links.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            links.classList.remove('is-open');
            toggle.classList.remove('is-open');
        });
    });
})();