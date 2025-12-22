const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
// Add dotenv to handle environment variables from a .env file
require('dotenv').config(); 

const app = express();

const path = require('path');

// Serve static files from a 'public' or 'frontend' folder
// Ensure your HTML, CSS, and script.js are in this folder
app.use(express.static(path.join(__dirname, './')));

// Handle the root route by sending your login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Allow CORS for local development and production domains
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database configuration using environment variables
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'school_management_system',
    port: process.env.DB_PORT || 3306, // Default MySQL port
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test Connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("CRITICAL: Database connection failed!", err.message);
    } else {
        console.log(`SUCCESS: Connected to database at ${process.env.DB_HOST || 'localhost'}`);
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

// --- 5. PASSWORD RESET ---
app.post('/api/reset-password', (req, res) => {
    const { role, id, newPassword } = req.body;
    
    // Determine table and column based on role
    const table = (role === 'teacher' || role === 'admin') ? 'teachers' : 'students';
    const idCol = (role === 'teacher' || role === 'admin') ? 'teacher_id' : 'student_id';

    const sql = `UPDATE ${table} SET password = ? WHERE ${idCol} = ?`;

    db.execute(sql, [newPassword, id], (err, result) => {
        if (err) {
            console.error("Reset Error:", err);
            return res.status(500).send("Database Error");
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).send("User ID not found.");
        }
        
        res.send("Password updated successfully!");
    });
});

// --- 6. USER REGISTRATION ---
app.post('/api/register', (req, res) => {
    const { role, name, id, course, password } = req.body;

    if (role === 'student') {
        const sql = "INSERT INTO students (student_id, name, course, password) VALUES (?, ?, ?, ?)";
        db.execute(sql, [id, name, course, password], (err) => {
            if (err) {
                console.error("Registration Error:", err);
                return res.status(500).send("Database Error: User ID might already exist.");
            }
            res.status(201).send("Student account created successfully!");
        });
    } else {
        // For Teacher/Admin
        const sql = "INSERT INTO teachers (teacher_id, name, password) VALUES (?, ?, ?)";
        db.execute(sql, [id, name, password], (err) => {
            if (err) {
                console.error("Registration Error:", err);
                return res.status(500).send("Database Error: User ID might already exist.");
            }
            res.status(201).send("Staff account created successfully!");
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));