-- ShopHub Marketplace Database Schema
-- PostgreSQL

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admin CASCADE;

-- Users table (customers)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors table (sellers/shops)
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    shop_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    description TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(500),
    stock INTEGER DEFAULT 0,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    shipping_first_name VARCHAR(100) NOT NULL,
    shipping_last_name VARCHAR(100) NOT NULL,
    shipping_email VARCHAR(255) NOT NULL,
    shipping_phone VARCHAR(50),
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_zip VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL,
    payment_card_name VARCHAR(255),
    payment_card_last4 VARCHAR(4),
    payment_expiry VARCHAR(10),
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0.00,
    promo_code VARCHAR(50),
    shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    tax DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table (links orders to products)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    helpful_count INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin table (simple single admin for now)
CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_vendor ON order_items(vendor_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Insert demo data

-- Demo user
INSERT INTO users (name, email, password) VALUES 
('Demo User', 'demo@shophub.com', 'demo123');

-- Demo vendor
INSERT INTO vendors (shop_name, owner_name, email, password, phone, address, description, rating, is_approved) VALUES 
('TechPro Store', 'Demo Vendor', 'vendor@shophub.com', 'vendor123', '(555) 123-4567', '123 Business St, Tech City', 'Your trusted source for quality tech products', 4.5, true);

-- Demo admin
INSERT INTO admin (name, email, password) VALUES 
('Admin', 'admin@shophub.com', 'admin123');

-- Demo products (all from vendor 1)
INSERT INTO products (vendor_id, name, description, price, image, stock, category) VALUES 
(1, 'Wireless Headphones', 'High-quality Bluetooth headphones with noise cancellation', 99.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop', 15, 'Electronics'),
(1, 'Smart Watch', 'Fitness tracker with heart rate monitor and GPS', 199.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop', 20, 'Electronics'),
(1, 'Laptop Backpack', 'Durable backpack with padded laptop compartment', 49.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop', 30, 'Accessories'),
(1, 'Portable Charger', '20000mAh power bank with fast charging', 34.99, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=500&fit=crop', 50, 'Accessories'),
(1, 'Mechanical Keyboard', 'RGB mechanical keyboard with blue switches', 129.99, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop', 12, 'Peripherals'),
(1, 'Wireless Mouse', 'Ergonomic wireless mouse with adjustable DPI', 39.99, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop', 25, 'Peripherals');

-- Demo reviews
INSERT INTO reviews (product_id, user_id, user_name, rating, title, text, helpful_count, verified) VALUES 
(1, 1, 'Demo User', 5, 'Amazing headphones!', 'Best headphones I''ve ever owned. The noise cancellation is incredible and the battery life is outstanding. Highly recommend!', 12, true),
(1, 1, 'Sarah Johnson', 4, 'Great quality, minor issues', 'Love the sound quality and comfort. Only minor complaint is the Bluetooth connection can be a bit finicky sometimes.', 5, true);
