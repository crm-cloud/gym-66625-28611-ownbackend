import postgres from 'postgres';

// Use environment variables for production
const connectionString = process.env.DATABASE_URL || 
  'postgres://postgres:Rajat%403003@db.gfrpkapmievifpqfhjrp.supabase.co:5432/postgres';

// Configure connection options
const sql = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Max idle time in seconds
  max_lifetime: 60 * 30, // Max lifetime in seconds (30 minutes)
  connect_timeout: 10, // Connection timeout in seconds
});

export default sql;
