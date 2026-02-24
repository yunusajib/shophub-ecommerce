const db = require('../db');

class Admin {
    // Get admin by email (for login)
    static async getByEmail(email) {
        const result = await db.query(
            'SELECT * FROM admin WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }

    // Get admin by ID
    static async getById(id) {
        const result = await db.query(
            'SELECT id, name, email, created_at FROM admin WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Create admin (usually only done once during setup)
    static async create({ name, email, password }) {
        const result = await db.query(
            'INSERT INTO admin (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [name, email, password]
        );
        return result.rows[0];
    }

    // Update admin
    static async update(id, { name, email }) {
        const result = await db.query(
            'UPDATE admin SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, created_at',
            [name, email, id]
        );
        return result.rows[0];
    }
}

module.exports = Admin;
