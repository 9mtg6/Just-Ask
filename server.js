const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'just-ask-secret-key';
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static files
app.use(express.static(path.join(__dirname, '.')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ensure uploads dir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `q-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (/^image\//.test(file.mimetype)) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    }
});

// sqlite setup
const db = new sqlite3.Database(path.join(__dirname, 'data.db'));

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId TEXT UNIQUE NOT NULL,
        name TEXT,
        passwordHash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        createdAt TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        studentId TEXT,
        userName TEXT,
        courseName TEXT NOT NULL,
        doctorName TEXT,
        lectureNumber TEXT,
        slideNumber TEXT,
        text TEXT NOT NULL,
        imagePath TEXT,
        isAnonymous INTEGER NOT NULL DEFAULT 0,
        votes INTEGER NOT NULL DEFAULT 0,
        answer TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
    )`);
});

// auth middleware
function authRequired(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'مطلوب تسجيل الدخول' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'جلسة غير صالحة، الرجاء تسجيل الدخول مرة أخرى' });
    }
}

// helpers
function mapQuestionRow(row) {
    return {
        id: row.id,
        text: row.text,
        courseName: row.courseName,
        doctorName: row.doctorName,
        lectureNumber: row.lectureNumber,
        slideNumber: row.slideNumber,
        isAnonymous: !!row.isAnonymous,
        user: row.isAnonymous ? 'مجهول' : (row.userName || 'طالب'),
        studentId: row.studentId,
        imagePath: row.imagePath,
        votes: row.votes,
        answer: row.answer,
        status: row.status,
        createdAt: row.createdAt
    };
}

// auth routes
app.post('/api/auth/register', (req, res) => {
    const { studentId, name, password } = req.body;
    if (!studentId || !password) {
        return res.status(400).json({ error: 'الرقم الجامعي وكلمة المرور مطلوبان' });
    }

    const createdAt = new Date().toISOString();
    const passwordHash = bcrypt.hashSync(password, 10);

    const stmt = db.prepare(`INSERT INTO users (studentId, name, passwordHash, createdAt) VALUES (?, ?, ?, ?)`);
    stmt.run(studentId, name || null, passwordHash, createdAt, function (err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ error: 'هذا الرقم الجامعي مسجل مسبقاً' });
            }
            return res.status(500).json({ error: 'خطأ في إنشاء الحساب' });
        }

        const user = { id: this.lastID, studentId, name: name || null, role: 'student' };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { studentId, password } = req.body;
    if (!studentId || !password) {
        return res.status(400).json({ error: 'الرقم الجامعي وكلمة المرور مطلوبان' });
    }

    db.get(`SELECT * FROM users WHERE studentId = ?`, [studentId], (err, row) => {
        if (err) return res.status(500).json({ error: 'خطأ في تسجيل الدخول' });
        if (!row) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

        const ok = bcrypt.compareSync(password, row.passwordHash);
        if (!ok) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

        const user = { id: row.id, studentId: row.studentId, name: row.name, role: row.role };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user });
    });
});

app.get('/api/auth/me', authRequired, (req, res) => {
    res.json({ user: req.user });
});

// questions API
app.get('/api/questions', authRequired, (req, res) => {
    const { courseName } = req.query;
    const params = [];
    let sql = `SELECT * FROM questions`;
    if (courseName) {
        sql += ` WHERE courseName = ?`;
        params.push(courseName);
    }
    sql += ` ORDER BY createdAt DESC`;

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: 'خطأ في جلب الأسئلة' });
        res.json(rows.map(mapQuestionRow));
    });
});

app.get('/api/questions/mine', authRequired, (req, res) => {
    const { id } = req.user;
    db.all(
        `SELECT * FROM questions WHERE userId = ? ORDER BY createdAt DESC`,
        [id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'خطأ في جلب أسئلتك' });
            res.json(rows.map(mapQuestionRow));
        }
    );
});

app.post('/api/questions', authRequired, upload.single('image'), (req, res) => {
    const { id, studentId, name } = req.user;
    const {
        text,
        courseName,
        doctorName,
        lectureNumber,
        slideNumber,
        isAnonymous
    } = req.body;

    if (!text || !courseName || !lectureNumber) {
        return res.status(400).json({ error: 'المادة ورقم المحاضرة ونص السؤال مطلوبة' });
    }

    const createdAt = new Date().toISOString();
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const isAnon = isAnonymous === 'true' || isAnonymous === true;

    const stmt = db.prepare(`
        INSERT INTO questions 
        (userId, studentId, userName, courseName, doctorName, lectureNumber, slideNumber, text, imagePath, isAnonymous, votes, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'new', ?)
    `);

    stmt.run(
        id,
        studentId,
        name || null,
        courseName,
        doctorName || null,
        lectureNumber,
        slideNumber || null,
        text,
        imagePath,
        isAnon ? 1 : 0,
        createdAt,
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'خطأ في حفظ السؤال' });
            }

            db.get(`SELECT * FROM questions WHERE id = ?`, [this.lastID], (e2, row) => {
                if (e2 || !row) return res.status(500).json({ error: 'تم الحفظ لكن حدث خطأ في القراءة' });
                const q = mapQuestionRow(row);
                io.emit('questionAdded', q);
                res.status(201).json(q);
            });
        }
    );
});

app.post('/api/questions/:id/vote', authRequired, (req, res) => {
    const qid = req.params.id;
    db.get(`SELECT * FROM questions WHERE id = ?`, [qid], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'لم يتم العثور على السؤال' });

        const newVotes = row.votes + 1;
        db.run(`UPDATE questions SET votes = ? WHERE id = ?`, [newVotes, qid], (e2) => {
            if (e2) return res.status(500).json({ error: 'خطأ في التصويت' });

            const updated = { ...row, votes: newVotes };
            const mapped = mapQuestionRow(updated);
            io.emit('updateVotes', { id: mapped.id, votes: mapped.votes });
            res.json(mapped);
        });
    });
});

// للإجابة من الدكتور أو تغيير الحالة (يمكن استخدامها لاحقاً مع صلاحيات دكتور)
app.post('/api/questions/:id/answer', authRequired, (req, res) => {
    const qid = req.params.id;
    const { answer, status } = req.body;

    db.get(`SELECT * FROM questions WHERE id = ?`, [qid], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'لم يتم العثور على السؤال' });

        const newAnswer = typeof answer === 'string' ? answer : row.answer;
        const newStatus = status || row.status;

        db.run(
            `UPDATE questions SET answer = ?, status = ? WHERE id = ?`,
            [newAnswer, newStatus, qid],
            (e2) => {
                if (e2) return res.status(500).json({ error: 'خطأ في تحديث السؤال' });

                const updated = { ...row, answer: newAnswer, status: newStatus };
                const mapped = mapQuestionRow(updated);
                io.emit('questionUpdated', mapped);
                res.json(mapped);
            }
        );
    });
});

// Socket.io فقط للقراءة الفورية للأسئلة الموجودة
io.on('connection', (socket) => {
    db.all(`SELECT * FROM questions ORDER BY createdAt DESC`, [], (err, rows) => {
        if (!err && rows) {
            socket.emit('loadQuestions', rows.map(mapQuestionRow));
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));