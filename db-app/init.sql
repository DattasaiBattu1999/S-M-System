-- CREATE DATABASE school_management_system;
-- USE school_management_system;

-- CREATE TABLE students (
--     student_id VARCHAR(50) PRIMARY KEY,
--     name VARCHAR(100),
--     email VARCHAR(100),
--     phone VARCHAR(20),
--     course VARCHAR(50),
--     address TEXT,
--     password VARCHAR(255)
-- );

-- CREATE TABLE teachers (
--     teacher_id VARCHAR(50) PRIMARY KEY,
--     name VARCHAR(100),
--     email VARCHAR(100),
--     phone VARCHAR(20),
--     address TEXT,
--     password VARCHAR(255)
-- );

-- CREATE TABLE IF NOT EXISTS announcements (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     course VARCHAR(50),
--     message TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- select * from teachers;
-- FLUSH PRIVILEGES;

-- USE school_management_system;

-- -- Table for Announcements
-- CREATE TABLE IF NOT EXISTS announcements (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     course VARCHAR(50),
--     message TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Table for Marks
-- CREATE TABLE IF NOT EXISTS marks (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     student_id VARCHAR(50),
--     subject VARCHAR(100),
--     score INT,
--     semester INT
-- );

-- CREATE TABLE IF NOT EXISTS marks (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     student_id VARCHAR(50),
--     subject VARCHAR(100),
--     score INT,
--     semester INT,
--     FOREIGN KEY (student_id) REFERENCES students(student_id)
-- );

-- select * from marks;
-- delete  from marks where student_id = '17H71A05C6';


-- =============================================================================================================================================

CREATE DATABASE IF NOT EXISTS school_management_system;
USE school_management_system;

-- Table for Student Users
CREATE TABLE IF NOT EXISTS students (
    student_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    course VARCHAR(50),
    address TEXT,
    password VARCHAR(255)
);

-- Table for Admin/Teacher Users
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    password VARCHAR(255)
);

-- Table for Academic Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course VARCHAR(50), -- Use 'All' for general notifications
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Student Marks with Foreign Key Constraint
CREATE TABLE IF NOT EXISTS marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50),
    subject VARCHAR(100),
    score INT,
    semester INT,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Optional: Initial Admin Account (Change 'password123' to your desired pass)
-- INSERT IGNORE INTO teachers (teacher_id, name, email, password) VALUES ('ADMIN01', 'Kavya', 'Kavya@univ.edu', 'password123');