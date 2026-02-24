require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

// Import database models
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');
const Admin = require('./models/Admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
app.use('/pages', express.static(path.join(__dirname, '../client/pages')));

// Health check

// Serve HTML pages
app.get('/*.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/pages', req.params[0] + '.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/pages/index.html'));
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'ShopHub API is running with PostgreSQL!' });
});

// ============================================================================
// PRODUCT ROUTES
// ============================================================================

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.getAll();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.getById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Failed to fetch product' });
    }
});

// Create new product
app.post('/api/products', async (req, res) => {
    try {
        const { vendorId, name, description, price, image, stock, category } = req.body;
        
        if (!name || !price || !vendorId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const product = await Product.create({
            vendorId,
            name,
            description,
            price,
            image,
            stock: stock || 0,
            category
        });
        
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Failed to create product' });
    }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
    try {
        const { name, description, price, image, stock, category } = req.body;
        
        const product = await Product.update(req.params.id, {
            name,
            description,
            price,
            image,
            stock,
            category
        });
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Failed to update product' });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.delete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Failed to delete product' });
    }
});

// ============================================================================
// USER/AUTHENTICATION ROUTES
// ============================================================================

// Register user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Check if email already exists
        const emailExists = await User.emailExists(email);
        if (emailExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        
        // NOTE: In production, hash password with bcrypt
        const user = await User.create({ name, email, password });
        
        res.status(201).json({ 
            message: 'User registered successfully',
            user 
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Failed to register user' });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        const user = await User.getByEmail(email);
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // NOTE: In production, use bcrypt.compare()
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        res.json({ 
            message: 'Login successful',
            user: userWithoutPassword 
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

// Get all users (admin only)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.getAll();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// ============================================================================
// VENDOR ROUTES
// ============================================================================

// Register vendor
app.post('/api/vendors/register', async (req, res) => {
    try {
        const { shopName, ownerName, email, password, phone, address, description } = req.body;
        
        if (!shopName || !ownerName || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const emailExists = await Vendor.emailExists(email);
        if (emailExists) {
            return res.status(400).json({ message: 'Vendor with this email already exists' });
        }
        
        // NOTE: In production, hash password with bcrypt
        const vendor = await Vendor.create({
            shopName,
            ownerName,
            email,
            password,
            phone,
            address,
            description
        });
        
        res.status(201).json({
            message: 'Vendor registered successfully',
            vendor
        });
    } catch (error) {
        console.error('Error registering vendor:', error);
        res.status(500).json({ message: 'Failed to register vendor' });
    }
});

// Vendor login
app.post('/api/vendors/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        const vendor = await Vendor.getByEmail(email);
        
        if (!vendor) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // NOTE: In production, use bcrypt.compare()
        if (vendor.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Return vendor without password
        const { password: _, ...vendorWithoutPassword } = vendor;
        res.json({
            message: 'Login successful',
            vendor: vendorWithoutPassword
        });
    } catch (error) {
        console.error('Error logging in vendor:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

// Get vendor products
app.get('/api/vendors/:vendorId/products', async (req, res) => {
    try {
        const products = await Product.getByVendorId(req.params.vendorId);
        res.json(products);
    } catch (error) {
        console.error('Error fetching vendor products:', error);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
});

// Get vendor orders
app.get('/api/vendors/:vendorId/orders', async (req, res) => {
    try {
        const orders = await Order.getByVendorId(req.params.vendorId);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching vendor orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// Update vendor profile
app.put('/api/vendors/:id', async (req, res) => {
    try {
        const { shopName, ownerName, email, phone, address, description } = req.body;
        
        const vendor = await Vendor.update(req.params.id, {
            shopName,
            ownerName,
            email,
            phone,
            address,
            description
        });
        
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        
        res.json(vendor);
    } catch (error) {
        console.error('Error updating vendor:', error);
        res.status(500).json({ message: 'Failed to update vendor' });
    }
});

// Get all vendors (admin)
app.get('/api/vendors', async (req, res) => {
    try {
        const vendors = await Vendor.getAll();
        res.json(vendors);
    } catch (error) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({ message: 'Failed to fetch vendors' });
    }
});

// ============================================================================
// ORDER ROUTES
// ============================================================================

// Create new order
app.post('/api/orders', async (req, res) => {
    try {
        const orderData = req.body;
        
        if (!orderData.items || !orderData.shippingAddress || !orderData.paymentInfo) {
            return res.status(400).json({ message: 'Missing required order information' });
        }
        
        const order = await Order.create(orderData);
        
        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Failed to create order' });
    }
});

// Get all orders (admin)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.getAll();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// Get single order by ID
app.get('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.getById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Failed to fetch order' });
    }
});

// Get user's orders
app.get('/api/orders/user/:userId', async (req, res) => {
    try {
        const orders = await Order.getByUserId(req.params.userId);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// ============================================================================
// REVIEW ROUTES
// ============================================================================

// Get reviews for a product
app.get('/api/reviews/:productId', async (req, res) => {
    try {
        const reviews = await Review.getByProductId(req.params.productId);
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
});

// Create new review
app.post('/api/reviews', async (req, res) => {
    try {
        const { productId, userId, userName, rating, title, text, verified } = req.body;
        
        if (!productId || !rating || !title || !text) {
            return res.status(400).json({ message: 'Missing required review information' });
        }
        
        // Check if product exists
        const product = await Product.getById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        const review = await Review.create({
            productId,
            userId: userId || null,
            userName: userName || 'Anonymous',
            rating,
            title,
            text,
            verified: verified || false
        });
        
        res.status(201).json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Failed to create review' });
    }
});

// Mark review as helpful
app.post('/api/reviews/:id/helpful', async (req, res) => {
    try {
        const review = await Review.incrementHelpful(req.params.id);
        
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        
        res.json(review);
    } catch (error) {
        console.error('Error marking review as helpful:', error);
        res.status(500).json({ message: 'Failed to update review' });
    }
});

// Get all reviews (admin)
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.getAll();
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

// Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        const admin = await Admin.getByEmail(email);
        
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // NOTE: In production, use bcrypt.compare()
        if (admin.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Return admin without password
        const { password: _, ...adminWithoutPassword } = admin;
        res.json({ 
            message: 'Login successful',
            admin: adminWithoutPassword 
        });
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📦 API available at http://localhost:${PORT}/api`);
    console.log(`🗄️  Database: PostgreSQL`);
    console.log(`✅ Products endpoint: http://localhost:${PORT}/api/products`);
});

