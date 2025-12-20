const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// const db = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: 'password', // Ensure this matches your MySQL password
//     database: 'school_management_system',
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

const db = mysql.createPool({
    // It checks if a DB_HOST environment variable exists, 
    // otherwise it defaults to 'localhost'
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'school_management_system',
    waitForConnections: true,
    connectionLimit: 10
});

// Test Connection immediately on startup
db.getConnection((err, connection) => {
    if (err) {
        console.error("CRITICAL: Database connection failed!", err);
    } else {
        console.log("SUCCESS: Connected to MySQL database.");
        connection.release();
    }
});

// --- 1. LOGIN ---
app.post('/api/login', (req, res) => {
    const { role, id, password } = req.body;
    console.log(`Login Attempt: Role=${role}, ID=${id}`); // Debugging log

    const table = (role === 'admin' || role === 'teacher') ? 'teachers' : 'students';
    const idCol = (role === 'admin' || role === 'teacher') ? 'teacher_id' : 'student_id';

    const sql = `SELECT * FROM ${table} WHERE ${idCol} = ? AND password = ?`;
    
    db.execute(sql, [id, password], (err, results) => {
        if (err) {
            console.error("SQL Error during login:", err); // Will now show in terminal
            return res.status(500).send("Database Error");
        }
        
        if (results.length > 0) {
            console.log("Login successful for ID:", id);
            const user = results[0];
            delete user.password;
            res.json({ user });
        } else {
            console.warn("Login failed: Invalid credentials for ID:", id);
            res.status(401).send("Invalid credentials");
        }
    });
});

// --- 2. EXCEL MARKS UPLOAD ---
app.post('/api/upload-marks', (req, res) => {
    const { data } = req.body; 
    if (!data || data.length === 0) return res.status(400).send("No data provided");

    const values = data.map(row => [
        row.student_id, 
        row.subject_name, 
        row.marks, 
        row.semester
    ]);
    
    const sql = "INSERT INTO marks (student_id, subject, score, semester) VALUES ?";
    db.query(sql, [values], (err) => {
        if (err) {
            console.error("Upload Error:", err);
            return res.status(500).send("Database Error during upload");
        }
        res.send("Marks uploaded successfully!");
    });
});

// --- 3. FETCH MARKS FOR STUDENT ---
app.get('/api/get-marks/:studentId', (req, res) => {
    const sql = "SELECT subject, score, semester FROM marks WHERE student_id = ?";
    db.execute(sql, [req.params.studentId], (err, results) => {
        if (err) return res.status(500).send("Database Error");
        res.json(results);
    });
});

// --- 4. ANNOUNCEMENTS ---
app.post('/api/announcements', (req, res) => {
    const { course, message } = req.body;
    db.execute("INSERT INTO announcements (course, message) VALUES (?, ?)", [course, message], (err) => {
        if (err) return res.status(500).send("Error");
        res.send("Announcement Posted!");
    });
});

app.get('/api/get-announcements/:course', (req, res) => {
    const sql = "SELECT * FROM announcements WHERE course = ? OR course = 'All' ORDER BY created_at DESC";
    db.execute(sql, [req.params.course], (err, results) => {
        if (err) return res.status(500).send("Error");
        res.json(results);
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));