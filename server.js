const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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
    process.exit(1);
  }
};

initDatabase();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'fortisight-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
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
        
        res.json({ 
            success: true, 
            message: 'Account created successfully',
            redirect: '/public/dashboard.html'
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
        
        res.json({ 
            success: true, 
            message: 'Login successful',
            redirect: '/dashboard.html'
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
    if (req.session.userId) {
        res.json({ authenticated: true, userId: req.session.userId });
    } else {
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

// Start server
app.listen(PORT, () => {
    console.log(`FortiSight server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT}`);
});

module.exports = app;
