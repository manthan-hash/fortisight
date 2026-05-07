const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const PISTREAMURL = 'http://10.11.2.31:8080';

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Database setup - PostgreSQL with fallback
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/fortisight',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database
const initDatabase = async () => {
  try {
    console.log('Connected to PostgreSQL database.');
    
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Users table created or already exists.');
  } catch (err) {
    console.error('Error connecting to database:', err.message);
    // process.exit(1);
  }
};

initDatabase();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Session configuration - Production ready
app.use(session({
    secret: process.env.SESSION_SECRET || 'fortisight-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // Always true for production on Render
        sameSite: "none", // Required for cross-site cookies
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// CORS middleware - EXACT configuration for cookie compatibility
app.use(cors({
    origin: "https://fortisight.onrender.com",
    credentials: true
}));

// ========================================
// SURVEILLANCE SYSTEM CONFIGURATION
// ========================================

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const originalName = file.originalname;
        const extension = originalName.split('.').pop();
        cb(null, `alert_${timestamp}.${extension}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// In-memory storage for alerts (for demo purposes)
let alerts = [];
let alertIdCounter = 1;

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Live stream proxy to Raspberry Pi
app.use('/live-stream', createProxyMiddleware({
    target: PISTREAMURL,
    changeOrigin: true,
    pathRewrite: {
        '^/live-stream': '/stream'
    },
    onError: (err, req, res) => {
        console.error('❌ Live stream proxy error:', err.message);
        res.status(500).send('Live stream unavailable');
    }
}));

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

// Routes

// ========================================
// SURVEILLANCE SYSTEM API ENDPOINTS
// ========================================

// POST /api/alert - Receive alerts from Raspberry Pi
app.post('/api/alert', upload.single('image'), async (req, res) => {
    try {
        console.log('🚨 ALERT RECEIVED FROM RASPBERRY PI');
        
        // Extract data from form
        const { distance, timestamp } = req.body;
        
        // Validate required fields
        if (!req.file) {
            console.log('❌ Error: No image file received');
            return res.status(400).json({ error: 'Image file is required' });
        }
        
        if (!distance) {
            console.log('❌ Error: No distance data received');
            return res.status(400).json({ error: 'Distance data is required' });
        }
        
        // Parse distance as number
        const distanceNum = parseFloat(distance);
        if (isNaN(distanceNum)) {
            console.log('❌ Error: Invalid distance value');
            return res.status(400).json({ error: 'Invalid distance value' });
        }
        
        // Create alert object with proper risk calculation
        let riskLevel = 'LOW';
        let riskScore = 25;
        
        if (distanceNum < 70) {
            riskLevel = 'HIGH';
            riskScore = 90;
        } else if (distanceNum < 120) {
            riskLevel = 'MEDIUM';
            riskScore = 60;
        } else {
            riskLevel = 'LOW';
            riskScore = 30;
        }
        
        const alert = {
            id: alertIdCounter++,
            imagePath: `/uploads/${req.file.filename}`,
            distance: distanceNum,
            timestamp: timestamp || new Date().toISOString(),
            riskLevel,
            riskScore,
            type: 'Unknown Face',
            location: 'Front Entrance',
            status: 'Active',
            description: `Unknown person detected at distance ${distanceNum} cm`
        };
        
        // Add to alerts array (latest first)
        alerts.unshift(alert);
        
        // Keep only last 100 alerts to prevent memory issues
        if (alerts.length > 100) {
            alerts = alerts.slice(0, 100);
        }
        
        // Log alert details
        console.log(`✅ Alert stored: ID=${alert.id}, Distance=${alert.distance}m, Risk=${alert.riskLevel}`);
        console.log(`📸 Image saved: ${alert.imagePath}`);
        console.log(`⏰ Timestamp: ${alert.timestamp}`);
        console.log(`📊 Total alerts: ${alerts.length}`);
        console.log('---');
        
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Alert received and stored successfully',
            alertId: alert.id,
            riskLevel: alert.riskLevel
        });
        
    } catch (error) {
        console.error('❌ Error processing alert:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/alerts - Return all alerts for dashboard
app.get('/api/alerts', (req, res) => {
    try {
        console.log(`📋 Dashboard requested ${alerts.length} alerts`);
        
        // Return alerts as JSON (already in latest-first order)
        res.status(200).json({
            success: true,
            count: alerts.length,
            alerts: alerts
        });
        
    } catch (error) {
        console.error('❌ Error fetching alerts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========================================
// AUTHENTICATION ROUTES
// ========================================

// Sign up route
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        // Validation
        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Email validation (basic)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if email already exists
        const existingUser = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id', 
            [email, hash]
        );

        // Create session
        req.session.userId = result.rows[0].id;
        
        console.log('📧 Signup successful:');
        console.log('👤 New User ID:', result.rows[0].id);
        console.log('📧 Email:', email);
        console.log('🍪 Session ID:', req.sessionID);
        console.log('🍪 Session data:', req.session);
        
        // Explicitly save session
        req.session.save((err) => {
            if (err) {
                console.error('❌ Session save error:', err);
                return res.status(500).json({ error: 'Session save failed' });
            }
            
            console.log('✅ Session saved successfully after signup');
            res.json({ 
                success: true, 
                message: 'Account created successfully',
                redirect: '/public/dashboard.html'
            });
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Register route (alias for signup)
app.post('/api/register', async (req, res) => {
    // Redirect to signup logic
    req.url = '/api/signup';
    return app._router.handle(req, res);
});

// Login route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const userResult = await pool.query('SELECT id, password_hash FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = userResult.rows[0];

        // Compare password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create session
        req.session.userId = user.id;
        
        console.log('🔑 Login successful:');
        console.log('📧 User ID:', user.id);
        console.log('🍪 Session ID:', req.sessionID);
        console.log('🍪 Session data:', req.session);
        
        // Explicitly save session
        req.session.save((err) => {
            if (err) {
                console.error('❌ Session save error:', err);
                return res.status(500).json({ error: 'Session save failed' });
            }
            
            console.log('✅ Session saved successfully');
            res.json({ 
                success: true, 
                message: 'Login successful',
                redirect: '/dashboard.html'
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout route
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error logging out' });
        }
        res.json({ 
            success: true, 
            message: 'Logged out successfully',
            redirect: '/login.html'
        });
    });
});

// Check auth status
app.get('/auth-status', (req, res) => {
    console.log('🔍 Auth status check:');
    console.log('🍪 Session ID:', req.sessionID);
    console.log('🍪 Session data:', req.session);
    console.log('👤 User ID in session:', req.session.userId);
    
    if (req.session.userId) {
        console.log('✅ User is authenticated');
        res.json({ authenticated: true, userId: req.session.userId });
    } else {
        console.log('❌ User is not authenticated');
        res.json({ authenticated: false });
    }
});

// Protect dashboard and other internal pages
app.get('/dashboard.html', isAuthenticated);
app.get('/alerts.html', isAuthenticated);
app.get('/settings.html', isAuthenticated);

// Serve HTML files - Explicit routes for reliability
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/public/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/public/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/public/dashboard.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Dashboard statistics endpoint
app.get('/api/dashboard-stats', (req, res) => {
    try {
        const totalAlerts = alerts.length;
        const highAlerts = alerts.filter(a => a.riskLevel === 'HIGH').length;
        const mediumAlerts = alerts.filter(a => a.riskLevel === 'MEDIUM').length;
        const lowAlerts = alerts.filter(a => a.riskLevel === 'LOW').length;

        const latestAlert = alerts[0] || null;

        const currentThreatLevel = latestAlert ? latestAlert.riskLevel : 'LOW';
        const currentRiskScore = latestAlert ? latestAlert.riskScore : 0;

        res.json({
            success: true,
            totalAlerts,
            highAlerts,
            mediumAlerts,
            lowAlerts,
            currentThreatLevel,
            currentRiskScore,
            latestAlert
        });
    } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/dashboard.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/alerts.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'alerts.html'));
});

app.get('/settings.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

// Catch-all handler for static files (must be after all other routes)
app.get('*', (req, res, next) => {
    if (req.path.includes('.')) {
        const filePath = req.path.startsWith('/public/') 
            ? req.path.replace('/public', '') 
            : req.path;
        res.sendFile(path.join(__dirname, 'public', filePath));
    } else {
        next();
    }
});

// ========================================
// START SERVER
// ========================================

// Start server with proper port and IP binding for surveillance system
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 FORSIGHT SURVEILLANCE SYSTEM STARTED');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌐 Local access: http://localhost:${PORT}`);
    console.log(`🌐 Network access: http://0.0.0.0:${PORT}`);
    console.log(`📸 Alert endpoint: POST http://0.0.0.0:${PORT}/api/alert`);
    console.log(`📊 Dashboard endpoint: GET http://0.0.0.0:${PORT}/api/alerts`);
    console.log(`🎥 Live stream proxy: http://0.0.0.0:${PORT}/live-stream`);
    console.log('✅ Ready to receive alerts from Raspberry Pi');
    console.log('---');
});

module.exports = app;
