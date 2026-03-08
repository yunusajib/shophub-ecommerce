const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

(async () => {
    const hash = await bcrypt.hash('admin123', 10);
    
    await pool.query('DELETE FROM admin WHERE email = $1', ['admin@shophub.com']);
    
    await pool.query(
        'INSERT INTO admin (name, email, password) VALUES ($1, $2, $3)',
        ['Admin', 'admin@shophub.com', hash]
    );
    
    console.log('✅ Admin created in Neon!');
    console.log('Email: admin@shophub.com');
    console.log('Password: admin123');
    
    await pool.end();
})();
