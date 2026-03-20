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

// ============================================================================
// NEW TEACHER DASHBOARD: The Classroom Manager
// ============================================================================
// ============================================================================
// NEW TEACHER DASHBOARD: Master Curriculum (With REAL Database Tracking)
// ============================================================================
exports.getTeacherStats = async (teacherId) => {
    // 1. Find out which school this teacher belongs to
    const [teacherRecord] = await pool.query(`SELECT school_id FROM users WHERE id = ?`, [teacherId]);
    
    if (teacherRecord.length === 0) {
        throw new Error("Teacher not found");
    }
    const schoolId = teacherRecord[0].school_id;

    // 2. Dynamically fetch ALL classes and sections for this specific school
    const [schoolClasses] = await pool.query(`
        SELECT DISTINCT class_number, section 
        FROM school_classes 
        WHERE school_id = ?
        ORDER BY class_number ASC, section ASC
    `, [schoolId]);

    if (schoolClasses.length === 0) {
        return { classes: [] };
    }

    // 3. Fetch ALL system Habits from top to bottom
    const [allHabits] = await pool.query(`SELECT id, name FROM habits ORDER BY id ASC`);
    
    // 4. Fetch ALL actual lessons (Treating lesson_materials as the true lesson)
    const [allLessons] = await pool.query(`
        SELECT lm.id as true_lesson_id, 
               l.id as parent_lesson_id,
               l.habit_id, 
               l.duration_minutes, 
               l.teacher_guide_url,
               lm.title,
               lm.pdf_url,
               lm.description
        FROM lesson_materials lm
        INNER JOIN lessons l ON lm.lesson_id = l.id
        ORDER BY l.habit_id ASC, l.id ASC, lm.id ASC
    `);

    // 4.5 NEW: Fetch ALL actual completed sessions for this specific teacher
    const [completedSessions] = await pool.query(`
        SELECT class_number, section, material_id 
        FROM session_feedback 
        WHERE teacher_id = ? AND material_id IS NOT NULL
    `, [teacherId]);

    // 5. JavaScript Nesting & REAL Data Injection
    const dashboardData = schoolClasses.map(classObj => {
        let classLessonsCompleted = 0;
        let classLessonsTotal = 0;
        let classHabitsCompleted = 0;

        const habitsData = allHabits.map(habit => {
            const habitLessons = allLessons.filter(l => l.habit_id === habit.id);
            let habitLessonsCompleted = 0;

            const lessonsData = habitLessons.map(lesson => {
                
                // 👇 REAL DATABASE LOGIC: Check if this specific material was logged for this exact class & section
                const isCompleted = completedSessions.some(
                    s => s.class_number === classObj.class_number &&
                         s.section === classObj.section &&
                         s.material_id === lesson.true_lesson_id
                );

                const status = isCompleted ? 'completed' : 'not_started';

                if (status === 'completed') {
                    habitLessonsCompleted++;
                    classLessonsCompleted++;
                }

                // Returning the exact object the frontend needs
                return {
                    id: lesson.true_lesson_id,           // 👈 The UI will use this as the main unique key!
                    parent_lesson_id: lesson.parent_lesson_id, // 👈 Frontend sends this back when saving
                    title: lesson.title || 'Untitled Lesson',
                    duration_minutes: lesson.duration_minutes || 10,
                    pdf_url: lesson.pdf_url || null,
                    teacher_guide_url: lesson.teacher_guide_url || null,
                    description: lesson.description || null,
                    status: status
                };
            });

            classLessonsTotal += habitLessons.length;
            
            // Mark the habit as completed only if ALL its actual materials are completed
            if (habitLessonsCompleted === habitLessons.length && habitLessons.length > 0) {
                classHabitsCompleted++;
            }

            return {
                id: habit.id,
                name: habit.name,
                lessons_completed: habitLessonsCompleted,
                lessons_total: habitLessons.length,
                lessons: lessonsData
            };
        });

        // Calculate final class-wide progress percentage based on REAL math
        const progressPercentage = classLessonsTotal === 0 ? 0 : 
            Math.round((classLessonsCompleted / classLessonsTotal) * 100);

        return {
            class_number: classObj.class_number,
            section: classObj.section,
            progress_percentage: progressPercentage,
            habits_completed: classHabitsCompleted,
            habits_total: allHabits.length,
            lessons_completed: classLessonsCompleted,
            lessons_total: classLessonsTotal,
            habits: habitsData
        };
    });

    return { classes: dashboardData };
};


// ============================================================================
// SCHOOL ADMIN DASHBOARD: Full Curriculum & Teacher Tracking
// ============================================================================
exports.getSchoolAdminDashboard = async (schoolId) => {
    // 1. Fetch all required raw data concurrently for maximum performance
    const classesPromise = pool.query(`
        SELECT DISTINCT class_number, section 
        FROM school_classes 
        WHERE school_id = ? 
        ORDER BY class_number ASC, section ASC
    `, [schoolId]);

    const habitsPromise = pool.query(`SELECT id, name FROM habits ORDER BY id ASC`);

    const lessonsPromise = pool.query(`
        SELECT lm.id as true_lesson_id, l.habit_id, lm.title
        FROM lesson_materials lm
        INNER JOIN lessons l ON lm.lesson_id = l.id
        ORDER BY l.habit_id ASC, l.id ASC, lm.id ASC
    `);

    // 2. Fetch all sessions with joined names for the UI
    const sessionsPromise = pool.query(`
        SELECT sf.class_number, sf.section, sf.material_id, sf.conducted_at, sf.teacher_id, 
               u.name as teacher_name, h.name as habit_name, lm.title as lesson_title
        FROM session_feedback sf
        LEFT JOIN users u ON sf.teacher_id = u.id
        LEFT JOIN lesson_materials lm ON sf.material_id = lm.id
        LEFT JOIN lessons l ON lm.lesson_id = l.id
        LEFT JOIN habits h ON l.habit_id = h.id
        WHERE sf.school_id = ? AND sf.material_id IS NOT NULL
        ORDER BY sf.conducted_at DESC
    `, [schoolId]);

    const teachersPromise = pool.query(`
        SELECT id, name FROM users 
        WHERE school_id = ? AND role IN ('teacher', 'school_admin')
    `, [schoolId]);

    const [
        [schoolClasses], [allHabits], [allLessons], [allSessions], [schoolTeachers]
    ] = await Promise.all([classesPromise, habitsPromise, lessonsPromise, sessionsPromise, teachersPromise]);

    // ==========================================
    // BUILD ARRAY 1: CLASSES (Curriculum Progress)
    // ==========================================
    const classesData = [];
    const uniqueClassNumbers = [...new Set(schoolClasses.map(c => c.class_number))];

    uniqueClassNumbers.forEach(classNum => {
        const sectionsForClass = schoolClasses.filter(c => c.class_number === classNum);
        
        const sectionsData = sectionsForClass.map(secObj => {
            let sectionLessonsCompleted = 0;
            let sectionLessonsTotal = 0;
            let sectionHabitsCompleted = 0;

            const habitsData = allHabits.map(habit => {
                const habitLessons = allLessons.filter(l => l.habit_id === habit.id);
                let habitLessonsCompleted = 0;

                const lessonsData = habitLessons.map(lesson => {
                    // Check if this specific lesson was completed by this section
                    const sessionMatch = allSessions.find(
                        s => s.class_number === secObj.class_number && 
                             s.section === secObj.section && 
                             s.material_id === lesson.true_lesson_id
                    );

                    if (sessionMatch) {
                        habitLessonsCompleted++;
                        sectionLessonsCompleted++;
                    }

                    return {
                        id: lesson.true_lesson_id,
                        title: lesson.title || 'Untitled Lesson',
                        status: sessionMatch ? 'completed' : 'pending',
                        conducted_by: sessionMatch ? sessionMatch.teacher_name : null,
                        conducted_at: sessionMatch ? sessionMatch.conducted_at : null
                    };
                });

                sectionLessonsTotal += habitLessons.length;
                if (habitLessonsCompleted === habitLessons.length && habitLessons.length > 0) {
                    sectionHabitsCompleted++;
                }

                return {
                    id: habit.id,
                    name: habit.name,
                    lessons_completed: habitLessonsCompleted,
                    lessons_total: habitLessons.length,
                    lessons: lessonsData
                };
            });

            const progressPercentage = sectionLessonsTotal === 0 ? 0 : 
                Math.round((sectionLessonsCompleted / sectionLessonsTotal) * 100);

            return {
                section: secObj.section,
                progress_percentage: progressPercentage,
                habits_completed: sectionHabitsCompleted,
                habits_total: allHabits.length,
                habits: habitsData
            };
        });

        classesData.push({
            class_number: classNum,
            sections: sectionsData
        });
    });

    // ==========================================
    // BUILD ARRAY 2: TEACHERS (Performance)
    // ==========================================
    const teachersData = schoolTeachers.map(teacher => {
        // Filter sessions taught by this specific teacher
        const teacherSessions = allSessions.filter(s => s.teacher_id === teacher.id);
        
        // Group their sessions by Class/Section
        const classesTaughtMap = {};
        teacherSessions.forEach(ts => {
            const key = `${ts.class_number}-${ts.section}`;
            if (!classesTaughtMap[key]) {
                classesTaughtMap[key] = {
                    class_number: ts.class_number,
                    section: ts.section,
                    sessions: []
                };
            }
            classesTaughtMap[key].sessions.push({
                lesson_title: ts.lesson_title || 'Unknown Lesson',
                habit_name: ts.habit_name || 'Unknown Habit',
                conducted_at: ts.conducted_at
            });
        });

        return {
            id: teacher.id,
            name: teacher.name,
            total_sessions: teacherSessions.length,
            classes_taught: Object.values(classesTaughtMap)
        };
    });

    // Return the exact combined payload
    return {
        classes: classesData,
        teachers: teachersData
    };
};
