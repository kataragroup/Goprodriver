const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

// Routes Import
const authRoutes = require('./routes/authRoutes');
const driverAuthRoutes = require('./routes/Driver/authRoutes');
const adminRoutes = require('./routes/Driver/adminRoutes');
const driverRoutes = require('./routes/Froutes');
const { auth, isAdmin } = require('./middleware/auth');

// Cloudinary Config
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }
});

// ====================== CORS ======================
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://13.206.124.146:3000",
            "http://13.206.124.146",
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`⚠️ CORS Request from unknown origin: ${origin}`);
            callback(null, true);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options('{*any}', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ====================== FIREBASE ADMIN ======================
try {
    let serviceAccount = require('./serviceAccountKey.json');
    if (typeof serviceAccount.private_key === 'string') {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-app.appspot.com"
    });
    console.log("✅ Firebase Admin SDK Initialized");
} catch (error) {
    console.error("❌ Firebase Initialization Failed:", error.message);
}

// ====================== MONGODB ======================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// ====================== SOCKET.IO ======================
app.set('socketio', io);
io.on('connection', (socket) => {
    console.log(`📡 Client Connected: ${socket.id}`);
    socket.on('disconnect', () => console.log(`📴 Client Disconnected: ${socket.id}`));
});

// ====================== DEBUG MIDDLEWARE ======================
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} | Origin: ${req.headers.origin || 'N/A'}`);
    next();
});

// ====================== ROUTES ======================

// 1. Driver/Admin Auth
app.use('/api/admin', require('./routes/Driver/adminRoutes'));

// 2. Main Admin Auth
app.use('/api/admin/auth', authRoutes);

// 3. KYC Routes
app.use('/api/admin/kyc', require('./routes/adminKycRoutes'));

// 4. General Admin Routes
app.use('/api/admin', require('./routes/adminRoutes'));

// 5. IMPORTANT: User Admin Routes (Dashboard + Feedback)
app.use('/api/admin', require('./routes/User/AdminRoutes'));

// 6. User Feedback Routes
app.use('/api/feedback', require('./routes/User/FeedbackRoutes'));

// Driver Routes
app.use('/api/driver', driverRoutes);
app.use('/api/driver/auth', driverAuthRoutes);
app.use('/api/rides', require('./routes/Driver/rideRoutes'));

// ====================== ERROR HANDLER ======================
app.use((err, req, res, next) => {
    console.error("Global Error:", err.stack);
    res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// ====================== START ======================
const PORT = process.env.PORT || 7000;
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📡 KYC Routes: http://localhost:${PORT}/api/admin/kyc`);
});