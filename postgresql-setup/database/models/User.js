const db = require('./db');

class User {
    // Get all users
    static async getAll() {
        const result = await db.query(
            'SELECT id, name, email, created_at FROM users ORDER BY id'
        );
        return result.rows;
    }

    // Get user by ID
    static async getById(id) {
        const result = await db.query(
            'SELECT id, name, email, created_at FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Get user by email (for login)
    static async getByEmail(email) {
        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }

    // Create new user
    static async create({ name, email, password }) {
        const result = await db.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [name, email, password]
        );
        return result.rows[0];
    }

    // Update user
    static async update(id, { name, email }) {
        const result = await db.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, created_at',
            [name, email, id]
        );
        return result.rows[0];
    }

    // Delete user
    static async delete(id) {
        await db.query('DELETE FROM users WHERE id = $1', [id]);
    }

    // Check if email exists
    static async emailExists(email) {
        const result = await db.query(
            'SELECT COUNT(*) FROM users WHERE email = $1',
            [email]
        );
        return parseInt(result.rows[0].count) > 0;
    }
}

module.exports = User;
