const pool = require('../config/db');

exports.getNgoStats = async () => {
    // 1. Total Schools
    const schoolsPromise = pool.query('SELECT COUNT(*) as total FROM schools');
    
    // 2. Total Teachers
    const teachersPromise = pool.query("SELECT COUNT(*) as total FROM users WHERE role = 'teacher'");
    
    // 3. Total Sessions
    const sessionsPromise = pool.query('SELECT COUNT(*) as total FROM session_feedback');
    
    // 4. Total Lessons
    const lessonsPromise = pool.query('SELECT COUNT(*) as total FROM lessons');
    
    // 5. Habit Stats (Total habits vs unique habits taught in sessions)
    const habitsPromise = pool.query(`
        SELECT 
            (SELECT COUNT(*) FROM habits) as total_habits,
            (SELECT COUNT(DISTINCT habit_id) FROM session_feedback) as covered_habits
    `);
    
    // 6. Wellbeing Distribution (Gets the latest assessment for each school)
    const wellbeingPromise = pool.query(`
        SELECT recognition_level, COUNT(id) as count
        FROM wellbeing_assessments
        WHERE id IN (SELECT MAX(id) FROM wellbeing_assessments GROUP BY school_id)
        GROUP BY recognition_level
    `);

    // Execute all queries concurrently for maximum speed
    const [
        [schoolsRows], 
        [teachersRows], 
        [sessionsRows], 
        [lessonsRows], 
        [habitsRows], 
        [wellbeingRows]
    ] = await Promise.all([
        schoolsPromise, 
        teachersPromise, 
        sessionsPromise, 
        lessonsPromise, 
        habitsPromise, 
        wellbeingPromise
    ]);

    return {
        schools: schoolsRows[0].total,
        teachers: teachersRows[0].total,
        sessions: sessionsRows[0].total,
        lessons: lessonsRows[0].total,
        habits: habitsRows[0],
        wellbeing: wellbeingRows
    };
};

exports.getSchoolStats = async (schoolId) => {
    // 1. Total Teachers (Count of teachers and school admins)
    const teachersPromise = pool.query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE school_id = ? AND role IN ('teacher', 'school_admin')
    `, [schoolId]);

    // 2. Total Sessions (Total feedback logs for this school)
    const sessionsPromise = pool.query(`
        SELECT COUNT(*) as count 
        FROM session_feedback 
        WHERE school_id = ?
    `, [schoolId]);

    // 3. Lessons Completed (Count of UNIQUE lessons taught)
    const lessonsCompletedPromise = pool.query(`
        SELECT COUNT(DISTINCT lesson_id) as count 
        FROM session_feedback 
        WHERE school_id = ? AND lesson_id IS NOT NULL
    `, [schoolId]);

    // 4. Overall Habit Completion (Percentage of total available habits taught)
    const habitCompletionPromise = pool.query(`
        SELECT ROUND((COUNT(DISTINCT sf.habit_id) / (SELECT COUNT(*) FROM habits)) * 100) as percentage 
        FROM session_feedback sf 
        WHERE school_id = ?
    `, [schoolId]);

    // 5. Class Performance Graph (Grouped by Class)
    const classPerformancePromise = pool.query(`
        SELECT CONCAT('Class ', class_number) as name, COUNT(*) as completed 
        FROM session_feedback 
        WHERE school_id = ? 
        GROUP BY class_number 
        ORDER BY class_number
    `, [schoolId]);

    // 6. Domain Progress
    const domainProgressPromise = pool.query(`
        SELECT d.name as domain, 
               ROUND(COALESCE((COUNT(sf.id) / 10) * 100, 0)) as percentage 
        FROM domains d
        LEFT JOIN habits h ON d.id = h.domain_id
        LEFT JOIN session_feedback sf ON h.id = sf.habit_id AND sf.school_id = ?
        GROUP BY d.id
    `, [schoolId]);

    // 7. Recent Sessions (Bypass lessons and join habits directly via sf.habit_id)
    const recentSessionsPromise = pool.query(`
        SELECT h.name as lesson_title, sf.class_number, sf.section, sf.conducted_at as created_at 
        FROM session_feedback sf
        LEFT JOIN habits h ON sf.habit_id = h.id
        WHERE sf.school_id = ? 
        ORDER BY sf.conducted_at DESC 
        LIMIT 5
    `, [schoolId]);

    // Await all promises concurrently for maximum performance
    const [
        [teachersRes], [sessionsRes], [lessonsRes], [habitRes], 
        [classPerfRes], [domainProgRes], [recentSessRes]
    ] = await Promise.all([
        teachersPromise, sessionsPromise, lessonsCompletedPromise, habitCompletionPromise,
        classPerformancePromise, domainProgressPromise, recentSessionsPromise
    ]);

    // Map the SQL results to the exact JSON structure the frontend requested
    return {
        totalTeachers: teachersRes[0]?.count || 0,
        totalSessions: sessionsRes[0]?.count || 0,
        lessonsCompleted: lessonsRes[0]?.count || 0,
        overallHabitCompletion: habitRes[0]?.percentage || 0,
        classPerformance: classPerfRes,
        domainProgress: domainProgRes, 
        recentSessions: recentSessRes
    };
};

exports.getTeacherStats = async (teacherId) => {
    // 1. Total Sessions by this specific teacher
    const sessionsPromise = pool.query('SELECT COUNT(*) as total FROM session_feedback WHERE teacher_id = ?', [teacherId]);
    
    // 2. Lessons Completed (Unique habits taught by this teacher)
    const completedPromise = pool.query('SELECT COUNT(DISTINCT habit_id) as total FROM session_feedback WHERE teacher_id = ?', [teacherId]);
    
    // 3. Total Lessons in the system
    const totalLessonsPromise = pool.query('SELECT COUNT(*) as total FROM lessons');
    
    // 4. Last Session Date
    const lastSessionPromise = pool.query('SELECT MAX(conducted_at) as last_session FROM session_feedback WHERE teacher_id = ?', [teacherId]);
    
    // 5. Recent Sessions (Bypass lessons and join habits directly via sf.habit_id)
    const recentSessionsPromise = pool.query(`
        SELECT h.name as lesson_title, sf.class_number, sf.section, sf.conducted_at as created_at 
        FROM session_feedback sf
        LEFT JOIN habits h ON sf.habit_id = h.id
        WHERE sf.teacher_id = ? 
        ORDER BY sf.conducted_at DESC 
        LIMIT 5
    `, [teacherId]);
    
    // 6. Suggested Lesson (FIXED: Replaced l.title with h.name as title to maintain the JSON contract)
    const suggestedLessonPromise = pool.query(`
        SELECT d.name as domain, h.name as habit, h.name as title, l.type as lesson_type
        FROM lessons l
        JOIN habits h ON l.habit_id = h.id
        JOIN domains d ON h.domain_id = d.id
        WHERE h.id NOT IN (SELECT habit_id FROM session_feedback WHERE teacher_id = ?)
        LIMIT 1
    `, [teacherId]);

    const [
        [sessionsRows], 
        [completedRows], 
        [totalLessonsRows], 
        [lastSessionRows], 
        [recentSessionsRows], 
        [suggestedLessonRows]
    ] = await Promise.all([
        sessionsPromise, 
        completedPromise, 
        totalLessonsPromise, 
        lastSessionPromise, 
        recentSessionsPromise, 
        suggestedLessonPromise
    ]);

    return {
        totalSessions: sessionsRows[0].total,
        lessonsCompleted: completedRows[0].total,
        totalLessonsSystem: totalLessonsRows[0].total,
        lastSession: lastSessionRows[0].last_session,
        recentSessions: recentSessionsRows,
        suggestedLesson: suggestedLessonRows[0] || null
    };
};