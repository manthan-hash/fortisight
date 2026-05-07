const { Pool } = require('pg');
require('dotenv').config();

// Database connection using environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fortisight',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: false // Local development
});

async function setupDatabase() {
  try {
    console.log('🔗 Connecting to PostgreSQL database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    
    // Create users table
    console.log('📋 Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created or already exists');
    
    // Create alerts table
    console.log('📋 Creating alerts table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        image_path VARCHAR(255) NOT NULL,
        distance DECIMAL(5,2) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        risk_level VARCHAR(20) NOT NULL,
        risk_score INTEGER NOT NULL,
        type VARCHAR(50) DEFAULT 'Unknown Face',
        location VARCHAR(100) DEFAULT 'Front Entrance',
        status VARCHAR(20) DEFAULT 'Active',
        description TEXT
      )
    `);
    console.log('✅ Alerts table created or already exists');
    
    // Create sessions table (for express-session)
    console.log('📋 Creating sessions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR(255) PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
    `);
    console.log('✅ Sessions table created or already exists');
    
    // Create index on alerts timestamp for better performance
    console.log('📋 Creating indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC)
    `);
    console.log('✅ Indexes created');
    
    console.log('🎉 Database setup completed successfully!');
    console.log('📊 Tables created: users, alerts, sessions');
    console.log('🔍 Indexes created: idx_alerts_timestamp');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('💡 Make sure PostgreSQL is running and credentials are correct in .env file');
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

// Run setup
setupDatabase();
