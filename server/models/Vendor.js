const db = require('../config/database');

class Vendor {
    // Get all vendors
    static async getAll() {
        const result = await db.query(
            'SELECT id, shop_name, owner_name, email, phone, address, description, rating, is_approved, created_at FROM vendors ORDER BY id'
        );
        return result.rows;
    }

    // Get vendor by ID
    static async getById(id) {
        const result = await db.query(
            'SELECT id, shop_name, owner_name, email, phone, address, description, rating, is_approved, created_at FROM vendors WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Get vendor by email (for login)
    static async getByEmail(email) {
        const result = await db.query(
            'SELECT * FROM vendors WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }

    // Create new vendor
    static async create({ shopName, ownerName, email, password, phone, address, description }) {
        const result = await db.query(
            `INSERT INTO vendors (shop_name, owner_name, email, password, phone, address, description, is_approved) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, true) 
             RETURNING id, shop_name, owner_name, email, phone, address, description, rating, is_approved, created_at`,
            [shopName, ownerName, email, password, phone, address, description]
        );
        return result.rows[0];
    }

    // Update vendor
    static async update(id, { shopName, ownerName, email, phone, address, description }) {
        const result = await db.query(
            `UPDATE vendors 
             SET shop_name = $1, owner_name = $2, email = $3, phone = $4, address = $5, description = $6
             WHERE id = $7 
             RETURNING id, shop_name, owner_name, email, phone, address, description, rating, is_approved, created_at`,
            [shopName, ownerName, email, phone, address, description, id]
        );
        return result.rows[0];
    }

    // Delete vendor
    static async delete(id) {
        await db.query('DELETE FROM vendors WHERE id = $1', [id]);
    }

    // Check if email exists
    static async emailExists(email) {
        const result = await db.query(
            'SELECT COUNT(*) FROM vendors WHERE email = $1',
            [email]
        );
        return parseInt(result.rows[0].count) > 0;
    }

    // Approve vendor
    static async approve(id) {
        const result = await db.query(
            'UPDATE vendors SET is_approved = true WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }

    // Get vendor statistics
    static async getStats(vendorId) {
        const productsCount = await db.query(
            'SELECT COUNT(*) FROM products WHERE vendor_id = $1',
            [vendorId]
        );

        const ordersCount = await db.query(
            'SELECT COUNT(DISTINCT order_id) FROM order_items WHERE vendor_id = $1',
            [vendorId]
        );

        const totalRevenue = await db.query(
            'SELECT SUM(oi.price * oi.quantity) as revenue FROM order_items oi WHERE oi.vendor_id = $1',
            [vendorId]
        );

        return {
            productsCount: parseInt(productsCount.rows[0].count),
            ordersCount: parseInt(ordersCount.rows[0].count),
            totalRevenue: parseFloat(totalRevenue.rows[0].revenue || 0)
        };
    }
}

module.exports = Vendor;
