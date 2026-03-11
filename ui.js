document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const html = document.documentElement;

    // Theme handling
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('justask_theme') || 'light';
    if (savedTheme === 'dark') {
        body.classList.add('theme-dark');
    }

    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('theme-dark');
        } else {
            body.classList.remove('theme-dark');
        }
        localStorage.setItem('justask_theme', theme);
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const next = body.classList.contains('theme-dark') ? 'light' : 'dark';
            applyTheme(next);
        });
        // set initial label
        themeToggle.textContent = savedTheme === 'dark' ? 'Light' : 'Dark';
    }

    // Language handling (basic)
    const langButtons = document.querySelectorAll('.lang-btn');
    const savedLang = localStorage.getItem('justask_lang') || 'ar';

    function applyLang(lang) {
        html.lang = lang;
        html.dir = lang === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('justask_lang', lang);

        langButtons.forEach(btn => {
            if (btn.dataset.lang === lang) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        const nodes = document.querySelectorAll('[data-i18n-ar]');
        nodes.forEach(el => {
            const ar = el.getAttribute('data-i18n-ar');
            const en = el.getAttribute('data-i18n-en');
            if (lang === 'ar' && ar) el.textContent = ar;
            if (lang === 'en' && en) el.textContent = en;
        });
    }

    if (langButtons.length) {
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetLang = btn.dataset.lang;
                applyLang(targetLang);
            });
        });
        applyLang(savedLang);
    }
});
