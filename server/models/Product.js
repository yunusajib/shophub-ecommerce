const db = require('../config/database');

class Product {
    // Get all products
    static async getAll() {
        const result = await db.query(
            `SELECT p.*, v.shop_name as vendor_name 
             FROM products p 
             LEFT JOIN vendors v ON p.vendor_id = v.id 
             WHERE p.is_active = true 
             ORDER BY p.id`
        );
        return result.rows.map(p => ({ ...p, price: parseFloat(p.price) }));
    }

    // Get product by ID
    static async getById(id) {
        const result = await db.query(
            `SELECT p.*, v.shop_name as vendor_name 
             FROM products p 
             LEFT JOIN vendors v ON p.vendor_id = v.id 
             WHERE p.id = $1`,
            [id]
        );
        const row = result.rows[0]; return row ? { ...row, price: parseFloat(row.price || 0) } : null;
    }

    // Get products by vendor ID
    static async getByVendorId(vendorId) {
        const result = await db.query(
            'SELECT * FROM products WHERE vendor_id = $1 ORDER BY id',
            [vendorId]
        );
        return result.rows.map(p => ({ ...p, price: parseFloat(p.price || 0) }));
    }

    // Get products by category
    static async getByCategory(category) {
        const result = await db.query(
            'SELECT * FROM products WHERE category = $1 AND is_active = true ORDER BY id',
            [category]
        );
        return result.rows.map(p => ({ ...p, price: parseFloat(p.price || 0) }));
    }

    // Create new product
    static async create({ vendorId, name, description, price, image, stock, category }) {
        const result = await db.query(
            `INSERT INTO products (vendor_id, name, description, price, image, stock, category) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [vendorId, name, description, price, image, stock, category]
        );
        const row = result.rows[0]; return row ? { ...row, price: parseFloat(row.price || 0) } : null;
    }

    // Update product
    static async update(id, { name, description, price, image, stock, category }) {
        const result = await db.query(
            `UPDATE products 
             SET name = $1, description = $2, price = $3, image = $4, stock = $5, category = $6, updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 
             RETURNING *`,
            [name, description, price, image, stock, category, id]
        );
        const row = result.rows[0]; return row ? { ...row, price: parseFloat(row.price || 0) } : null;
    }

    // Delete product (soft delete by setting is_active to false)
    static async delete(id) {
        const result = await db.query(
            'UPDATE products SET is_active = false WHERE id = $1 RETURNING *',
            [id]
        );
        const row = result.rows[0]; return row ? { ...row, price: parseFloat(row.price || 0) } : null;
    }

    // Hard delete product
    static async hardDelete(id) {
        await db.query('DELETE FROM products WHERE id = $1', [id]);
    }

    // Update stock
    static async updateStock(id, quantity) {
        const result = await db.query(
            'UPDATE products SET stock = stock + $1 WHERE id = $2 RETURNING *',
            [quantity, id]
        );
        const row = result.rows[0]; return row ? { ...row, price: parseFloat(row.price || 0) } : null;
    }

    // Search products
    static async search(searchTerm) {
        const result = await db.query(
            `SELECT * FROM products 
             WHERE (name ILIKE $1 OR description ILIKE $1) 
             AND is_active = true 
             ORDER BY id`,
            [`%${searchTerm}%`]
        );
        return result.rows.map(p => ({ ...p, price: parseFloat(p.price || 0) }));
    }

    // Get low stock products
    static async getLowStock(threshold = 10) {
        const result = await db.query(
            'SELECT * FROM products WHERE stock <= $1 AND is_active = true ORDER BY stock ASC',
            [threshold]
        );
        return result.rows.map(p => ({ ...p, price: parseFloat(p.price || 0) }));
    }
}

module.exports = Product;
