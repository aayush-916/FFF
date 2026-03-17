const lessonModel = require('../models/lessonModel');

exports.getLessons = async (req, res) => {
    try {
        const lessons = await lessonModel.findAll();
        res.status(200).json({ success: true, count: lessons.length, data: lessons });
    } catch (error) {
        console.error("Error fetching lessons:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getLesson = async (req, res) => {
    try {
        const lesson = await lessonModel.findById(req.params.id);
        if (!lesson) return res.status(404).json({ success: false, message: "Lesson not found" });
        res.status(200).json({ success: true, data: lesson });
    } catch (error) {
        console.error("Error fetching lesson:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.createLesson = async (req, res) => {
    try {
        // Removed 'title' from req.body destructuring
        const { habit_id, type, duration_minutes, materials_meta } = req.body;
        const files = req.files || [];

        const teacherGuideFile = files.find(f => f.fieldname === 'teacher_guide');
        const teacher_guide_url = teacherGuideFile ? `/uploads/guides/${teacherGuideFile.filename}` : null;

        const lessonData = { habit_id, type, duration_minutes, teacher_guide_url };

        let materialsData = [];
        if (materials_meta) {
            const metaArray = JSON.parse(materials_meta);
            materialsData = metaArray.map(meta => {
                const matchedFile = files.find(f => f.fieldname === meta.fileKey);
                return {
                    title: meta.title,
                    description: meta.description,
                    pdf_url: matchedFile ? `/uploads/lessons/${matchedFile.filename}` : null
                };
            }).filter(m => m.pdf_url);
        }

        const newLessonId = await lessonModel.createLessonTransaction(lessonData, materialsData);
        const completeLesson = await lessonModel.findById(newLessonId);

        res.status(201).json({ success: true, message: "Lesson created", data: completeLesson });
    } catch (error) {
        console.error("Error creating lesson:", error);
        res.status(500).json({ success: false, message: "Server error creating lesson" });
    }
};

exports.updateLesson = async (req, res) => {
    try {
        const id = req.params.id;
        // Removed 'title' from req.body destructuring
        const { habit_id, type, duration_minutes, materials_meta, existing_materials } = req.body;
        const files = req.files || [];

        const lessonData = { habit_id, type, duration_minutes };

        const teacherGuideFile = files.find(f => f.fieldname === 'teacher_guide');
        if (teacherGuideFile) {
            lessonData.teacher_guide_url = `/uploads/guides/${teacherGuideFile.filename}`;
        }

        let newMaterialsData = [];
        if (materials_meta) {
            const metaArray = JSON.parse(materials_meta);
            newMaterialsData = metaArray.map(meta => {
                const matchedFile = files.find(f => f.fieldname === meta.fileKey);
                return {
                    title: meta.title,
                    description: meta.description,
                    pdf_url: matchedFile ? `/uploads/lessons/${matchedFile.filename}` : null
                };
            }).filter(m => m.pdf_url);
        }

        const existingMaterialsToKeep = existing_materials ? JSON.parse(existing_materials) : [];

        await lessonModel.updateLessonTransaction(id, lessonData, newMaterialsData, existingMaterialsToKeep);
        const completeLesson = await lessonModel.findById(id);

        res.status(200).json({ success: true, message: "Lesson updated", data: completeLesson });
    } catch (error) {
        console.error("Error updating lesson:", error);
        res.status(500).json({ success: false, message: "Server error updating lesson" });
    }
};

exports.deleteLesson = async (req, res) => {
    try {
        const affectedRows = await lessonModel.deleteLesson(req.params.id);
        if (affectedRows === 0) return res.status(404).json({ success: false, message: "Lesson not found" });
        
        res.status(200).json({ success: true, message: "Lesson deleted successfully" });
    } catch (error) {
        console.error("Error deleting lesson:", error);
        res.status(500).json({ success: false, message: "Server error deleting lesson" });
    }
};