const socket = io();

// تأكد من تسجيل الدخول قبل استخدام صفحة الأسئلة
const token = localStorage.getItem('justask_token');
const userJson = localStorage.getItem('justask_user');
if (!token || !userJson) {
    window.location.href = 'auth.html';
}

// الحالة في الواجهة
let questions = [];

// عناصر الواجهة
const studentViewBtn = document.getElementById('studentViewBtn');
const instructorViewBtn = document.getElementById('instructorViewBtn');
const studentView = document.getElementById('studentView');
const instructorView = document.getElementById('instructorView');
const instructorSummary = document.getElementById('instructorSummary');

const sendQuestionBtn = document.getElementById('sendQuestionBtn');

// فلاتر الطالب
const filterCourse = document.getElementById('filterCourse');
const filterLecture = document.getElementById('filterLecture');
const archiveSearch = document.getElementById('archiveSearch');

// فلاتر الدكتور
const instructorCourseFilter = document.getElementById('instructorCourseFilter');
const instructorLectureFilter = document.getElementById('instructorLectureFilter');
const instructorSearch = document.getElementById('instructorSearch');
const instructorStatusFilter = document.getElementById('instructorStatusFilter');

// إحصائيات
const statTotalQuestions = document.getElementById('statTotalQuestions');
const statUnanswered = document.getElementById('statUnanswered');
const statTopLecture = document.getElementById('statTopLecture');
const statTopVotes = document.getElementById('statTopVotes');

// تبديل بين طالب ودكتور
studentViewBtn.addEventListener('click', () => {
    studentViewBtn.classList.add('active');
    instructorViewBtn.classList.remove('active');
    studentView.classList.remove('hidden');
    instructorView.classList.add('hidden');
    instructorSummary.classList.add('hidden');
});

instructorViewBtn.addEventListener('click', () => {
    instructorViewBtn.classList.add('active');
    studentViewBtn.classList.remove('active');
    studentView.classList.add('hidden');
    instructorView.classList.remove('hidden');
    instructorSummary.classList.remove('hidden');
    renderAll();
});

// تحميل الأسئلة من الـ API عند بداية الصفحة
async function loadQuestions() {
    try {
        const res = await fetch('/api/questions', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) {
            console.error(data);
            return;
        }
        questions = data || [];
        renderAll();
    } catch (err) {
        console.error('Failed to load questions', err);
    }
}

loadQuestions();

// إرسال سؤال جديد عبر REST مع إمكانية رفع صورة
sendQuestionBtn.addEventListener('click', async () => {
    const studentIdInput = document.getElementById('studentId');
    const studentNameInput = document.getElementById('studentName');
    const courseNameSelect = document.getElementById('courseName');
    const doctorNameInput = document.getElementById('doctorName');
    const lectureNumberInput = document.getElementById('lectureNumber');
    const slideNumberInput = document.getElementById('slideNumber');
    const questionTextInput = document.getElementById('questionText');
    const imageInput = document.getElementById('questionImage');
    const isAnonymousInput = document.getElementById('isAnonymous');

    const courseName = courseNameSelect.value;
    const doctorName = doctorNameInput.value.trim();
    const lectureNumber = lectureNumberInput.value.trim();
    const slideNumber = slideNumberInput.value.trim();
    const text = questionTextInput.value.trim();
    const isAnonymous = isAnonymousInput.checked;

    if (!courseName || !doctorName || !lectureNumber || !text) {
        alert('الرجاء تعبئة المادة، الدكتور، رقم المحاضرة ونص السؤال.');
        return;
    }

    const formData = new FormData();
    formData.append('courseName', courseName);
    formData.append('doctorName', doctorName);
    formData.append('lectureNumber', lectureNumber);
    formData.append('slideNumber', slideNumber);
    formData.append('text', text);
    formData.append('isAnonymous', isAnonymous ? 'true' : 'false');

    if (imageInput.files && imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    sendQuestionBtn.disabled = true;

    try {
        const res = await fetch('/api/questions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });
        const data = await res.json();
        if (!res.ok) {
            alert(data.error || 'حدث خطأ أثناء إرسال السؤال.');
        } else {
            questions.unshift(data);
            questionTextInput.value = '';
            if (imageInput) imageInput.value = '';
            renderAll();
        }
    } catch (err) {
        console.error(err);
        alert('تعذر الاتصال بالخادم.');
    } finally {
        sendQuestionBtn.disabled = false;
    }
});

// استقبال كل الأسئلة عند الاتصال (تحديث لحظي اختياري)
socket.on('loadQuestions', (qs) => {
    questions = qs || [];
    renderAll();
});

// إضافة سؤال جديد (من مستخدمين آخرين)
socket.on('questionAdded', (q) => {
    questions.unshift(q);
    renderAll();
});

// تحديث التصويت
socket.on('updateVotes', (data) => {
    const q = questions.find(q => q.id === data.id);
    if (q) {
        q.votes = data.votes;
        renderAll();
    }
});

// تحديث سؤال (إجابة / حالة)
socket.on('questionUpdated', (updated) => {
    const idx = questions.findIndex(q => q.id === updated.id);
    if (idx !== -1) {
        questions[idx] = updated;
        renderAll();
    }
});

// أحداث الفلاتر
[filterCourse, filterLecture, archiveSearch].forEach(el => {
    el.addEventListener('input', renderAll);
});

[instructorCourseFilter, instructorLectureFilter, instructorSearch, instructorStatusFilter].forEach(el => {
    el.addEventListener('input', renderAll);
});

// دوال رسم الواجهة
function renderAll() {
    renderStudentQuestions();
    renderArchive();
    renderInstructorQuestions();
    renderStats();
}

function normalize(str) {
    return (str || '').toString().toLowerCase();
}

// تجميع الأسئلة المتشابهة (نفس المادة + نفس المحاضرة + نفس السلايد + نفس النص بعد تبسيط)
function groupSimilarQuestions(list) {
    const groups = {};
    list.forEach(q => {
        const baseText = normalize(q.text).replace(/\s+/g, ' ').trim();
        const key = [
            normalize(q.courseName),
            normalize(q.lectureNumber),
            normalize(q.slideNumber),
            baseText
        ].join('|');

        if (!groups[key]) {
            groups[key] = { ...q, duplicateCount: 1, combinedVotes: q.votes };
        } else {
            groups[key].duplicateCount += 1;
            groups[key].combinedVotes += q.votes;
        }
    });
    return Object.values(groups);
}

function renderStudentQuestions() {
    const container = document.getElementById('questionsList');
    container.innerHTML = '';

    let list = questions.filter(q => !q.answer || q.status !== 'published'); // أسئلة المحاضرة الحالية (يمكن تعديل المنطق)

    const fc = normalize(filterCourse.value);
    const fl = normalize(filterLecture.value);

    if (fc) list = list.filter(q => normalize(q.courseName).includes(fc));
    if (fl) list = list.filter(q => normalize(q.lectureNumber).includes(fl));

    list = groupSimilarQuestions(list).sort((a, b) => b.combinedVotes - a.combinedVotes);

    list.forEach(q => {
        const card = document.createElement('div');
        card.className = 'question-card';

        const who = q.isAnonymous ? 'طالب (مجهول)' : (q.user || 'طالب');

        card.innerHTML = `
            <div class="question-main">
                <div class="question-meta">
                    <span class="badge badge-primary">${q.courseName || '-'}</span>
                    <span class="badge">محاضرة ${q.lectureNumber || '-'}</span>
                    ${q.slideNumber ? `<span class="badge">Slide / موضوع: ${q.slideNumber}</span>` : ''}
                    <span class="badge">${who}</span>
                    ${q.duplicateCount > 1 ? `<span class="badge-warning badge">+${q.duplicateCount - 1} أسئلة مشابهة</span>` : ''}
                </div>
                <div class="question-main-text">
                    ${q.text}
                    ${q.imagePath ? `<div class="question-image"><img src="${q.imagePath}" alt="صورة السؤال"></div>` : ''}
                </div>
            </div>
            <div class="question-footer">
                <button class="vote-btn" onclick="vote(${q.id})">
                    👍 تصويت <span id="votes-${q.id}">${q.votes}</span>
                </button>
                <span class="muted-text small">يُساعد التصويت الدكتور على معرفة أهم النقاط.</span>
            </div>
        `;

        container.appendChild(card);
    });
}

function renderArchive() {
    const container = document.getElementById('archiveList');
    container.innerHTML = '';

    let list = questions.filter(q => !!q.answer && q.status === 'published');

    const search = normalize(archiveSearch.value);
    if (search) {
        list = list.filter(q =>
            normalize(q.text).includes(search) ||
            normalize(q.answer).includes(search) ||
            normalize(q.courseName).includes(search)
        );
    }

    list.sort((a, b) => b.votes - a.votes);

    list.forEach(q => {
        const card = document.createElement('div');
        card.className = 'question-card';

        const who = q.isAnonymous ? 'طالب (مجهول)' : (q.user || 'طالب');

        card.innerHTML = `
            <div class="question-meta">
                <span class="badge badge-primary">${q.courseName || '-'}</span>
                <span class="badge">محاضرة ${q.lectureNumber || '-'}</span>
                ${q.slideNumber ? `<span class="badge">Slide / موضوع: ${q.slideNumber}</span>` : ''}
                <span class="badge">${who}</span>
                <span class="badge">👍 ${q.votes}</span>
            </div>
            <div class="question-main">
                <strong>السؤال:</strong> ${q.text}
                ${q.imagePath ? `<div class="question-image"><img src="${q.imagePath}" alt="صورة السؤال"></div>` : ''}
                <div class="answer-box">
                    <strong>إجابة الدكتور:</strong>
                    <div>${q.answer}</div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function renderInstructorQuestions() {
    const container = document.getElementById('instructorQuestionsList');
    container.innerHTML = '';

    let list = [...questions];

    const cc = normalize(instructorCourseFilter.value);
    const cl = normalize(instructorLectureFilter.value);
    const search = normalize(instructorSearch.value);
    const status = instructorStatusFilter.value;

    if (cc) list = list.filter(q => normalize(q.courseName).includes(cc));
    if (cl) list = list.filter(q => normalize(q.lectureNumber).includes(cl));
    if (search) {
        list = list.filter(q =>
            normalize(q.text).includes(search) ||
            normalize(q.answer).includes(search)
        );
    }

    if (status === 'unanswered') {
        list = list.filter(q => !q.answer);
    } else if (status === 'published') {
        list = list.filter(q => q.status === 'published');
    } else if (status === 'review') {
        list = list.filter(q => q.status === 'review');
    }

    list = groupSimilarQuestions(list).sort((a, b) => b.combinedVotes - a.combinedVotes);

    list.forEach(q => {
        const card = document.createElement('div');
        card.className = 'question-card';

        const answer = q.answer || '';
        const statusBadge =
            q.status === 'published'
                ? '<span class="badge badge-success">منشور للطلاب</span>'
                : q.status === 'review'
                ? '<span class="badge badge-warning">محفوظ للمراجعة</span>'
                : '<span class="badge">بدون إجابة بعد</span>';

        card.innerHTML = `
            <div class="question-meta">
                <span class="badge badge-primary">${q.courseName || '-'}</span>
                <span class="badge">محاضرة ${q.lectureNumber || '-'}</span>
                ${q.slideNumber ? `<span class="badge">Slide / موضوع: ${q.slideNumber}</span>` : ''}
                ${statusBadge}
                <span class="badge">👍 ${q.votes}</span>
                ${q.duplicateCount > 1 ? `<span class="badge-warning badge">+${q.duplicateCount - 1} أسئلة مشابهة</span>` : ''}
            </div>
            <div class="question-main">
                <strong>السؤال:</strong> ${q.text}
                ${q.imagePath ? `<div class="question-image"><img src="${q.imagePath}" alt="صورة السؤال"></div>` : ''}
                <div class="answer-box">
                    <label>إجابة الدكتور (تظهر للطلاب عند النشر)</label>
                    <textarea id="answer-${q.id}" rows="2" class="small-input">${answer}</textarea>
                    <div class="actions-row">
                        <button class="primary-btn small" onclick="publishAnswer(${q.id})">نشر السؤال والإجابة</button>
                        <button class="secondary-btn" onclick="markForReview(${q.id})">حفظ لشرح لاحقاً</button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function renderStats() {
    if (!questions.length) {
        statTotalQuestions.textContent = '0';
        statUnanswered.textContent = '0';
        statTopLecture.textContent = '-';
        statTopVotes.textContent = '0';
        return;
    }

    statTotalQuestions.textContent = String(questions.length);
    statUnanswered.textContent = String(questions.filter(q => !q.answer).length);
    statTopVotes.textContent = String(
        questions.reduce((max, q) => Math.max(max, q.votes || 0), 0)
    );

    // أكثر محاضرة بها أسئلة
    const byLecture = {};
    questions.forEach(q => {
        const key = `${q.courseName || ''} - محاضرة ${q.lectureNumber || '-'}`;
        byLecture[key] = (byLecture[key] || 0) + 1;
    });
    const top = Object.entries(byLecture).sort((a, b) => b[1] - a[1])[0];
    statTopLecture.textContent = top ? top[0] : '-';
}

// دوال يتم استدعاؤها من HTML
window.vote = async function (id) {
    try {
        const res = await fetch(`/api/questions/${id}/vote`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await res.json();
        if (!res.ok) {
            alert(data.error || 'تعذر تسجيل التصويت.');
            return;
        }
        const idx = questions.findIndex(q => q.id === data.id);
        if (idx !== -1) {
            questions[idx] = data;
            renderAll();
        }
    } catch (err) {
        console.error(err);
    }
};

window.publishAnswer = async function (id) {
    const textarea = document.getElementById(`answer-${id}`);
    if (!textarea) return;
    const answer = textarea.value.trim();
    try {
        await fetch(`/api/questions/${id}/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ answer, status: 'published' })
        });
    } catch (err) {
        console.error(err);
    }
};

window.markForReview = async function (id) {
    const textarea = document.getElementById(`answer-${id}`);
    const answer = textarea ? textarea.value.trim() : '';
    try {
        await fetch(`/api/questions/${id}/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ answer, status: 'review' })
        });
    } catch (err) {
        console.error(err);
    }
};