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

// Add this below exports.getNgoStats

exports.getSchoolStats = async (schoolId) => {
    // 1. Total Sessions for this school
    const sessionsPromise = pool.query('SELECT COUNT(*) as total FROM session_feedback WHERE school_id = ?', [schoolId]);
    
    // 2. Lessons Completed (Unique habits taught by this school)
    const completedPromise = pool.query('SELECT COUNT(DISTINCT habit_id) as total FROM session_feedback WHERE school_id = ?', [schoolId]);
    
    // 3. Total Lessons in the system
    const totalLessonsPromise = pool.query('SELECT COUNT(*) as total FROM lessons');
    
    // 4. Last Session Date
    const lastSessionPromise = pool.query('SELECT MAX(conducted_at) as last_session FROM session_feedback WHERE school_id = ?', [schoolId]);
    
    // 5. Recent Sessions (Limit 5)
    const recentSessionsPromise = pool.query(`
    SELECT l.title as lesson_title, sf.class_number, sf.section, sf.conducted_at as created_at 
    FROM session_feedback sf
    LEFT JOIN lessons l ON sf.lesson_id = l.id
    WHERE sf.school_id = ? 
    ORDER BY sf.conducted_at DESC 
    LIMIT 5
`, [schoolId]); // 👈 Uses schoolId;
    
    // 6. Suggested Lesson (Find a lesson belonging to a habit the school hasn't taught yet)
    const suggestedLessonPromise = pool.query(`
        SELECT d.name as domain, h.name as habit, l.title, l.class_number as targetClass
        FROM lessons l
        JOIN habits h ON l.habit_id = h.id
        JOIN domains d ON h.domain_id = d.id
        WHERE h.id NOT IN (SELECT habit_id FROM session_feedback WHERE school_id = ?)
        LIMIT 1
    `, [schoolId]);

    // 7. Domain Progress (Calculate completed vs total habits per domain for this school)
    const domainProgressPromise = pool.query(`
        SELECT 
            d.name as domain, 
            COUNT(DISTINCT h.id) as total_habits,
            COUNT(DISTINCT sf.habit_id) as completed_habits
        FROM domains d
        JOIN habits h ON d.id = h.domain_id
        LEFT JOIN session_feedback sf ON sf.habit_id = h.id AND sf.school_id = ?
        GROUP BY d.id, d.name
    `, [schoolId]);

    // Execute all queries concurrently
    const [
        [sessionsRows], 
        [completedRows], 
        [totalLessonsRows], 
        [lastSessionRows], 
        [recentSessionsRows], 
        [suggestedLessonRows], 
        [domainProgressRows]
    ] = await Promise.all([
        sessionsPromise, 
        completedPromise, 
        totalLessonsPromise, 
        lastSessionPromise, 
        recentSessionsPromise, 
        suggestedLessonPromise, 
        domainProgressPromise
    ]);

    return {
        totalSessions: sessionsRows[0].total,
        lessonsCompleted: completedRows[0].total,
        totalLessonsSystem: totalLessonsRows[0].total,
        lastSession: lastSessionRows[0].last_session,
        recentSessions: recentSessionsRows,
        suggestedLesson: suggestedLessonRows[0] || null, // Handle case where all lessons are completed
        domainProgressRaw: domainProgressRows
    };
};

// Add this below your existing getSchoolStats function

exports.getTeacherStats = async (teacherId) => {
    // 1. Total Sessions by this specific teacher
    const sessionsPromise = pool.query('SELECT COUNT(*) as total FROM session_feedback WHERE teacher_id = ?', [teacherId]);
    
    // 2. Lessons Completed (Unique habits taught by this teacher)
    const completedPromise = pool.query('SELECT COUNT(DISTINCT habit_id) as total FROM session_feedback WHERE teacher_id = ?', [teacherId]);
    
    // 3. Total Lessons in the system
    const totalLessonsPromise = pool.query('SELECT COUNT(*) as total FROM lessons');
    
    // 4. Last Session Date
    const lastSessionPromise = pool.query('SELECT MAX(conducted_at) as last_session FROM session_feedback WHERE teacher_id = ?', [teacherId]);
    
    // 5. Recent Sessions (Limit 5)
   const recentSessionsPromise = pool.query(`
    SELECT l.title as lesson_title, sf.class_number, sf.section, sf.conducted_at as created_at 
    FROM session_feedback sf
    LEFT JOIN lessons l ON sf.lesson_id = l.id
    WHERE sf.teacher_id = ? 
    ORDER BY sf.conducted_at DESC 
    LIMIT 5
`, [teacherId]); // 👈 Uses teacherId
    
    // 6. Suggested Lesson (A lesson this specific teacher hasn't taught yet)
    const suggestedLessonPromise = pool.query(`
        SELECT d.name as domain, h.name as habit, l.title
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

