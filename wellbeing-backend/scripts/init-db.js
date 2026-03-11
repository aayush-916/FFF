const mysql = require("mysql2/promise");
require("dotenv").config();

async function initializeDatabase() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    console.log("Connected to MySQL server.");

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.query(`USE \`${process.env.DB_NAME}\`;`);

    const queries = [

      // =========================
      // CLUSTERS
      // =========================
      `CREATE TABLE IF NOT EXISTS clusters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      // =========================
      // SCHOOLS
      // =========================
      `CREATE TABLE IF NOT EXISTS schools (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cluster_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(100) UNIQUE NOT NULL,
        city VARCHAR(100),
        state VARCHAR(100),
        contact_person VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        status ENUM('active','inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE CASCADE,
        INDEX idx_cluster (cluster_id)
      );`,

      // =========================
      // SCHOOL CLASSES (NEW)
      // =========================
      `CREATE TABLE IF NOT EXISTS school_classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        school_id INT NOT NULL,
        class_number INT NOT NULL,
        section VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
        UNIQUE KEY unique_class (school_id, class_number, section)
      );`,

      // =========================
      // USERS
      // =========================
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        school_id INT NULL,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('ngo_super_admin','ngo_staff','school_admin','teacher') NOT NULL,
        class_number INT NULL,
        section VARCHAR(10) NULL,
        status ENUM('active','inactive') DEFAULT 'active',
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
        INDEX idx_school_user (school_id)
      );`,

      // =========================
      // TEACHER CLASSES (NEW)
      // =========================
      `CREATE TABLE IF NOT EXISTS teacher_classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        class_id INT NOT NULL,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES school_classes(id) ON DELETE CASCADE
      );`,

      // =========================
      // STUDENTS (Future Health Screening)
      // =========================
      `CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        school_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        roll_number VARCHAR(100),
        age INT,
        gender ENUM('male','female','other'),
        class_number INT,
        section VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
        INDEX idx_student_school (school_id)
      );`,

      // =========================
      // DOMAINS
      // =========================
      `CREATE TABLE IF NOT EXISTS domains (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );`,

      // =========================
      // HABITS
      // =========================
      `CREATE TABLE IF NOT EXISTS habits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        domain_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        order_number INT,
        FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
      );`,

      // =========================
      // LESSONS
      // =========================
      `CREATE TABLE IF NOT EXISTS lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        habit_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        class_number INT NOT NULL,
        duration_minutes INT DEFAULT 10,
        lesson_pdf_url VARCHAR(255),
        teacher_guide_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
      );`,

      // =========================
      // MCQ QUESTIONS
      // =========================
      `CREATE TABLE IF NOT EXISTS mcq_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_id INT,
        question_text TEXT NOT NULL,
        options JSON NOT NULL,
        correct_option VARCHAR(255) NOT NULL,
        question_order INT,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
      );`,

      // =========================
      // SESSION FEEDBACK (UPDATED)
      // =========================
      `CREATE TABLE IF NOT EXISTS session_feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        school_id INT NOT NULL,
        teacher_id INT NOT NULL,
        habit_id INT NOT NULL,
        lesson_id INT NULL,
        class_number INT NOT NULL,
        section VARCHAR(10) NOT NULL,
        conducted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
        INDEX idx_school (school_id),
        INDEX idx_teacher (teacher_id)
      );`,

      // =========================
      // MCQ RESPONSES
      // =========================
      `CREATE TABLE IF NOT EXISTS mcq_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        question_id INT NOT NULL,
        selected_option VARCHAR(255),
        FOREIGN KEY (session_id) REFERENCES session_feedback(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES mcq_questions(id) ON DELETE CASCADE
      );`,

      // =========================
      // WELLBEING ASSESSMENTS
      // =========================
      `CREATE TABLE IF NOT EXISTS wellbeing_assessments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        school_id INT NOT NULL,
        phase ENUM('baseline','midline','endline') NOT NULL,
        food_environment_score INT DEFAULT 0,
        daily_habits_score INT DEFAULT 0,
        wellbeing_activities_score INT DEFAULT 0,
        teacher_engagement_score INT DEFAULT 0,
        family_partnership_score INT DEFAULT 0,
        total_score INT DEFAULT 0,
        recognition_level ENUM('none','bronze','silver','gold') DEFAULT 'none',
        is_locked BOOLEAN DEFAULT FALSE,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
        UNIQUE KEY unique_school_phase (school_id, phase)
      );`,

      // =========================
      // HEALTH SCREENING (Future)
      // =========================
      `CREATE TABLE IF NOT EXISTS health_screenings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        examiner_name VARCHAR(255),
        assessment_date DATE,
        overall_health_status TEXT,
        recommendations TEXT,
        parent_notification BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      );`,

      // =========================
      // TIFFIN GUIDELINES
      // =========================
      `CREATE TABLE IF NOT EXISTS tiffin_guidelines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cluster_id INT,
        season ENUM('summer','winter','monsoon'),
        title VARCHAR(255),
        description TEXT,
        recipe TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE SET NULL
      );`,

      // =========================
      // WHATSAPP MESSAGES
      // =========================
      `CREATE TABLE IF NOT EXISTS whatsapp_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        school_id INT,
        message TEXT,
        scheduled_date DATETIME,
        status ENUM('pending','sent','failed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
      );`,

      // =========================
      // AUDIT LOGS
      // =========================
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(255),
        target_type VARCHAR(100),
        target_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );`
      
    ];

    for (const q of queries) {
      await connection.query(q);
    }

    console.log("Database initialized successfully.");

  } catch (error) {
    console.error("Database initialization error:", error);
  } finally {
    if (connection) await connection.end();
  }
}

initializeDatabase();