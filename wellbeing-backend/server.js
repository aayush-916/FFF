const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');


require('dotenv').config();

// Add this at the top of server.js to catch silent crashes!
process.on('uncaughtException', (err) => {
    console.error('🚨 CRITICAL UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 CRITICAL UNHANDLED REJECTION:', reason);
});



// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Middlewares
// ==========================================
// Enable Cross-Origin Resource Sharing with credentials for React
app.use(cors({
    origin: ["http://localhost:5173",
    "http://localhost:5174"],
    credentials: true
}));


app.use(express.json()); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse incoming cookies


// Expose the uploads directory to the public so PDFs can be downloaded
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// Import Routes
// ==========================================
const authRoutes = require('./routes/authRoutes');
const clusterRoutes = require('./routes/clusterRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const userRoutes = require('./routes/userRoutes');
const domainRoutes = require('./routes/domainRoutes');
const habitRoutes = require('./routes/habitRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const mcqRoutes = require('./routes/mcqRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const mcqResponseRoutes = require('./routes/mcqResponseRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const teacherRoutes = require('./routes/teacherRoutes');


// ==========================================
// Mount Routes
// ==========================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clusters', clusterRoutes);
app.use('/api/v1/schools', schoolRoutes);
app.use('/api/v1/school', schoolRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/domains', domainRoutes);
app.use('/api/v1/habits', habitRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/mcq', mcqRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/mcq-responses', mcqResponseRoutes);
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/v1/school', schoolRoutes);

// ==========================================
// Base Health Check Route
// ==========================================
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'School Wellbeing System API is operational.'
    });
});

const userController = require('./controllers/userController');
const { protect } = require('./middlewares/authMiddleware');

// Map the specific endpoint the frontend is looking for
app.get('/api/v1/teacher/classes', protect, userController.getTeacherAssignedClasses);

// ==========================================
// 404 & Global Error Handling
// ==========================================
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'API Route Not Found' });
});



// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Production API server running on port ${PORT}`);
    console.log(`➡️  Test the API at: http://localhost:${PORT}/`);
});