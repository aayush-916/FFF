const dashboardModel = require('../models/dashboardModel');

exports.getNgoDashboardData = async () => {
    const rawData = await dashboardModel.getNgoStats();

    // Calculate habit completion percentage (prevent division by zero)
    let habitCompletion = 0;
    if (rawData.habits.total_habits > 0) {
        habitCompletion = Math.round((rawData.habits.covered_habits / rawData.habits.total_habits) * 100);
    }

    // Format wellbeing distribution defaults
    let bronzeSchools = 0;
    let silverSchools = 0;
    let goldSchools = 0;

    // Map query results to the correct variables
    rawData.wellbeing.forEach(row => {
        if (row.recognition_level === 'bronze') bronzeSchools = row.count;
        if (row.recognition_level === 'silver') silverSchools = row.count;
        if (row.recognition_level === 'gold') goldSchools = row.count;
    });

    return {
        totalSchools: rawData.schools,
        totalTeachers: rawData.teachers,
        totalSessions: rawData.sessions,
        totalLessons: rawData.lessons,
        habitCompletion,
        bronzeSchools,
        silverSchools,
        goldSchools
    };
};



exports.getSchoolDashboardData = async (schoolId) => {
    const rawData = await dashboardModel.getSchoolStats(schoolId);

    // Calculate remaining lessons
    const remainingLessons = rawData.totalLessonsSystem - rawData.lessonsCompleted;

    // Format Domain Progress into percentages
    const domainProgress = rawData.domainProgressRaw.map(dp => {
        let percentage = 0;
        if (dp.total_habits > 0) {
            percentage = Math.round((dp.completed_habits / dp.total_habits) * 100);
        }
        return {
            domain: dp.domain,
            percentage: percentage
        };
    });

    return {
        totalSessions: rawData.totalSessions,
        lessonsCompleted: rawData.lessonsCompleted,
        remainingLessons: remainingLessons < 0 ? 0 : remainingLessons,
        lastSession: rawData.lastSession,
        suggestedLesson: rawData.suggestedLesson,
        recentSessions: rawData.recentSessions,
        domainProgress: domainProgress
    };
};

// Add this below your existing getSchoolDashboardData function

exports.getTeacherDashboardData = async (teacherId) => {
    const rawData = await dashboardModel.getTeacherStats(teacherId);

    const remainingLessons = rawData.totalLessonsSystem - rawData.lessonsCompleted;

    return {
        totalSessions: rawData.totalSessions,
        lessonsCompleted: rawData.lessonsCompleted,
        remainingLessons: remainingLessons < 0 ? 0 : remainingLessons,
        lastSession: rawData.lastSession,
        suggestedLesson: rawData.suggestedLesson,
        recentSessions: rawData.recentSessions
    };
};
