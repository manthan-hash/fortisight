# FortiSight - Smart Real-Time Security Monitor

A comprehensive cybersecurity monitoring dashboard with user authentication.

## Features

- 🔐 **Secure Authentication**: User signup, login, and logout with bcrypt password hashing
- 📊 **Real-time Dashboard**: Security monitoring and threat detection
- 🚨 **Alert Management**: Track and manage security alerts
- ⚙️ **Settings Management**: Configure system preferences
- 🎨 **Modern UI**: Dark theme with cyber-security aesthetic
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Access the Application**
   - Open your browser and navigate to: `http://localhost:3000`
   - The server will automatically create the SQLite database on first run

### Development Mode
For development with auto-restart:
```bash
npm run dev
```

## Authentication System

### Database Schema
The system uses SQLite with the following `users` table structure:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Security Features
- ✅ **Password Hashing**: Uses bcrypt with salt rounds (10)
- ✅ **Session Management**: Secure express-session cookies
- ✅ **Input Validation**: Email format and password strength checks
- ✅ **Protected Routes**: Dashboard and internal pages require authentication
- ✅ **CSRF Protection**: Built-in session security

### API Endpoints

#### Authentication
- `POST /signup` - Create new user account
- `POST /login` - Authenticate user
- `POST /logout` - End user session
- `GET /auth-status` - Check authentication status

#### Protected Routes
- `GET /dashboard.html` - Main dashboard (requires auth)
- `GET /alerts.html` - Alerts page (requires auth)
- `GET /settings.html` - Settings page (requires auth)

## File Structure

```
fortisight/
├── server.js              # Express server with authentication
├── package.json           # Dependencies and scripts
├── public/               # Static files directory
│   ├── login.html        # Login page
│   ├── signup.html       # Registration page
│   ├── dashboard.html     # Main dashboard
│   ├── alerts.html        # Alert management
│   ├── settings.html      # Settings page
│   ├── styles-new.css     # Styling
│   ├── auth.js           # Authentication JavaScript
│   └── app.js           # Application JavaScript
└── fortisight.db        # SQLite database (auto-created)
```

## Usage Flow

1. **Sign Up**: Visit `/signup.html` to create a new account
2. **Log In**: Use credentials on `/login.html` to access the dashboard
3. **Dashboard**: View security monitoring and threat levels
4. **Logout**: Click logout button to end session

## Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)
- Session secret should be changed in production

### Production Deployment
- Set `NODE_ENV=production`
- Use HTTPS for secure cookies
- Update session secret key
- Consider using PostgreSQL/MySQL for production database

## Security Notes

- Passwords are never stored in plain text
- Sessions are server-side with secure cookies
- All sensitive routes require authentication
- Input validation prevents common attacks
- Database uses parameterized queries to prevent SQL injection

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: bcrypt, express-session
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Custom CSS with cyber-security theme

## License

MIT License - see LICENSE file for details
