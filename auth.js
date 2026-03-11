const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const authError = document.getElementById('authError');

function showError(msg) {
    authError.textContent = msg;
    authError.classList.remove('hidden');
}

function clearError() {
    authError.textContent = '';
    authError.classList.add('hidden');
}

loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    authTitle.textContent = 'تسجيل الدخول';
    authSubtitle.textContent = 'استخدم رقمك الجامعي وكلمة المرور للدخول إلى منصة الأسئلة.';
    clearError();
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    authTitle.textContent = 'إنشاء حساب جديد';
    authSubtitle.textContent = 'سجّل برقمك الجامعي واسمك لإنشاء حساب جديد على المنصة.';
    clearError();
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const studentId = document.getElementById('loginStudentId').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!studentId || !password) {
        return showError('الرجاء إدخال الرقم الجامعي وكلمة المرور.');
    }

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, password })
        });
        const data = await res.json();
        if (!res.ok) {
            return showError(data.error || 'حدث خطأ أثناء تسجيل الدخول.');
        }
        localStorage.setItem('justask_token', data.token);
        localStorage.setItem('justask_user', JSON.stringify(data.user));
        window.location.href = 'questions.html';
    } catch (err) {
        showError('تعذر الاتصال بالخادم.');
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const studentId = document.getElementById('regStudentId').value.trim();
    const name = document.getElementById('regName').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const password2 = document.getElementById('regPassword2').value.trim();

    if (!studentId || !name || !password || !password2) {
        return showError('الرجاء تعبئة جميع الحقول.');
    }

    if (password !== password2) {
        return showError('كلمتا المرور غير متطابقتين.');
    }

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, name, password })
        });
        const data = await res.json();
        if (!res.ok) {
            return showError(data.error || 'حدث خطأ أثناء إنشاء الحساب.');
        }
        localStorage.setItem('justask_token', data.token);
        localStorage.setItem('justask_user', JSON.stringify(data.user));
        window.location.href = 'questions.html';
    } catch (err) {
        showError('تعذر الاتصال بالخادم.');
    }
}
);
