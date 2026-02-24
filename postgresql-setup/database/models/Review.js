const db = require('../db');

class Review {
    // Get all reviews
    static async getAll() {
        const result = await db.query(
            'SELECT * FROM reviews ORDER BY created_at DESC'
        );
        return result.rows;
    }

    // Get review by ID
    static async getById(id) {
        const result = await db.query(
            'SELECT * FROM reviews WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Get reviews by product ID
    static async getByProductId(productId) {
        const result = await db.query(
            'SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC',
            [productId]
        );
        return result.rows;
    }

    // Get reviews by user ID
    static async getByUserId(userId) {
        const result = await db.query(
            'SELECT * FROM reviews WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    }

    // Create new review
    static async create({ productId, userId, userName, rating, title, text, verified }) {
        const result = await db.query(
            `INSERT INTO reviews (product_id, user_id, user_name, rating, title, text, verified) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [productId, userId, userName, rating, title, text, verified || false]
        );
        return result.rows[0];
    }

    // Update review
    static async update(id, { rating, title, text }) {
        const result = await db.query(
            'UPDATE reviews SET rating = $1, title = $2, text = $3 WHERE id = $4 RETURNING *',
            [rating, title, text, id]
        );
        return result.rows[0];
    }

    // Delete review
    static async delete(id) {
        await db.query('DELETE FROM reviews WHERE id = $1', [id]);
    }

    // Increment helpful count
    static async incrementHelpful(id) {
        const result = await db.query(
            'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }

    // Get average rating for a product
    static async getAverageRating(productId) {
        const result = await db.query(
            'SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE product_id = $1',
            [productId]
        );
        return {
            avgRating: parseFloat(result.rows[0].avg_rating || 0),
            reviewCount: parseInt(result.rows[0].review_count)
        };
    }

    // Get rating breakdown for a product
    static async getRatingBreakdown(productId) {
        const result = await db.query(
            `SELECT rating, COUNT(*) as count 
             FROM reviews 
             WHERE product_id = $1 
             GROUP BY rating 
             ORDER BY rating DESC`,
            [productId]
        );
        return result.rows;
    }
}

module.exports = Review;
