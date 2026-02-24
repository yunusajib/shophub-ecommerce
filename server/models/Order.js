const db = require('../config/database');

class Order {
    // Get all orders
    static async getAll() {
        const result = await db.query(
            'SELECT * FROM orders ORDER BY created_at DESC'
        );
        
            return result.rows.map(order => ({
                ...order,
                subtotal: parseFloat(order.subtotal || 0),
                discount: parseFloat(order.discount || 0),
                shipping_cost: parseFloat(order.shipping_cost || 0),
                tax: parseFloat(order.tax || 0),
                total: parseFloat(order.total || 0)
            }));
    }

    // Get order by ID with items
    static async getById(id) {
        const orderResult = await db.query(
            'SELECT * FROM orders WHERE id = $1',
            [id]
        );

        if (orderResult.rows.length === 0) {
            return null;
        }

        const order = orderResult.rows[0];

        // Get order items
        const itemsResult = await db.query(
            `SELECT oi.*, p.name as product_name, p.image as product_image 
             FROM order_items oi 
             LEFT JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = $1`,
            [id]
        );

        order.items = itemsResult.rows;
        return order;
    }

    // Get orders by user ID
    static async getByUserId(userId) {
        const result = await db.query(
            'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        
            return result.rows.map(order => ({
                ...order,
                subtotal: parseFloat(order.subtotal || 0),
                discount: parseFloat(order.discount || 0),
                shipping_cost: parseFloat(order.shipping_cost || 0),
                tax: parseFloat(order.tax || 0),
                total: parseFloat(order.total || 0)
            }));
    }

    // Get orders by vendor ID
    static async getByVendorId(vendorId) {
        const result = await db.query(
            `SELECT DISTINCT o.* 
             FROM orders o 
             INNER JOIN order_items oi ON o.id = oi.order_id 
             WHERE oi.vendor_id = $1 
             ORDER BY o.created_at DESC`,
            [vendorId]
        );

        // Get items for each order (only items from this vendor)
        for (let order of result.rows) {
            const itemsResult = await db.query(
                `SELECT oi.*, p.name as product_name, p.image as product_image 
                 FROM order_items oi 
                 LEFT JOIN products p ON oi.product_id = p.id 
                 WHERE oi.order_id = $1 AND oi.vendor_id = $2`,
                [order.id, vendorId]
            );
            order.items = itemsResult.rows;
        }

        return result.rows;
    }

    // Create new order with items (transaction)
        static async create(orderData) {
        return await db.transaction(async (client) => {
            // Insert order with only fields that exist in schema
            const orderResult = await client.query(
                `INSERT INTO orders 
                 (user_id, shipping_first_name, shipping_last_name, shipping_email, shipping_phone, 
                  shipping_address, shipping_city, shipping_state, shipping_zip, shipping_country,
                  subtotal, discount, shipping_cost, tax, total, status) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
                 RETURNING *`,
                [
                    orderData.userId || null,
                    orderData.shippingAddress.firstName,
                    orderData.shippingAddress.lastName,
                    orderData.shippingAddress.email,
                    orderData.shippingAddress.phone || '',
                    orderData.shippingAddress.address,
                    orderData.shippingAddress.city,
                    orderData.shippingAddress.state,
                    orderData.shippingAddress.zipCode,
                    orderData.shippingAddress.country,
                    orderData.subtotal,
                    orderData.discount || 0,
                    orderData.shipping || 10,
                    orderData.tax,
                    orderData.total,
                    'confirmed'
                ]
            );
            const order = orderResult.rows[0];
            
            // Insert order items
            for (const item of orderData.items) {
                const productResult = await client.query(
                    'SELECT vendor_id, price FROM products WHERE id = $1',
                    [item.productId]
                );
                if (productResult.rows.length > 0) {
                    const product = productResult.rows[0];
                    await client.query(
                        'INSERT INTO order_items (order_id, product_id, vendor_id, quantity, price) VALUES ($1, $2, $3, $4, $5)',
                        [order.id, item.productId, product.vendor_id, item.quantity, parseFloat(product.price)]
                    );
                }
            }
            
            return order;
        });
    }

    // Update order status
    static async updateStatus(id, status) {
        const result = await db.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        return result.rows[0];
    }

    // Delete order
    static async delete(id) {
        await db.query('DELETE FROM orders WHERE id = $1', [id]);
    }

    // Get order statistics
    static async getStats() {
        const totalResult = await db.query(
            'SELECT SUM(total) as total FROM orders'
        );

        const countResult = await db.query(
            'SELECT COUNT(*) as count FROM orders'
        );

        return {
            totalRevenue: parseFloat(totalResult.rows[0].total || 0),
            totalOrders: parseInt(countResult.rows[0].count)
        };
    }
}

module.exports = Order;
