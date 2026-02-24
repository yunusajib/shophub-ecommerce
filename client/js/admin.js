// Configuration
const API_URL = 'http://localhost:3000/api';

// State
let products = [];
let orders = [];
let reviews = [];
let users = [];
let editingProductId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    loadAllData();
});

// Check admin authentication
function checkAdminAuth() {
    const adminUser = localStorage.getItem('adminUser');
    
    if (!adminUser) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    const admin = JSON.parse(adminUser);
    document.getElementById('admin-name').textContent = admin.name;
}

// Load all data
async function loadAllData() {
    await Promise.all([
        loadProducts(),
        loadOrders(),
        loadReviews(),
        loadUsers()
    ]);
    
    updateDashboard();
}

// Load products
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        products = await response.json();
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/orders`);
        orders = await response.json();
        displayOrders();
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Load reviews
async function loadReviews() {
    try {
        const response = await fetch(`${API_URL}/reviews`);
        reviews = await response.json();
        displayReviews();
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Load users
async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/users`);
        users = await response.json();
        displayUsers();
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Update dashboard
function updateDashboard() {
    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
    
    // Update stats
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('total-users').textContent = users.length;
    
    // Display recent orders
    const recentOrders = orders.slice(0, 5);
    const recentOrdersList = document.getElementById('recent-orders-list');
    recentOrdersList.innerHTML = '';
    
    if (recentOrders.length === 0) {
        recentOrdersList.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No orders yet</p>';
    } else {
        recentOrders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item-small';
            orderItem.innerHTML = `
                <div>
                    <strong>Order #${order.id.toString().padStart(6, '0')}</strong>
                    <div style="font-size: 0.85rem; color: #7f8c8d;">${order.shippingAddress.email}</div>
                </div>
                <div style="font-weight: bold; color: #27ae60;">$${order.total.toFixed(2)}</div>
            `;
            recentOrdersList.appendChild(orderItem);
        });
    }
    
    // Display low stock products
    const lowStock = products.filter(p => p.stock <= 10);
    const lowStockList = document.getElementById('low-stock-list');
    lowStockList.innerHTML = '';
    
    if (lowStock.length === 0) {
        lowStockList.innerHTML = '<p style="color: #7f8c8d; text-align: center;">All products well stocked</p>';
    } else {
        lowStock.forEach(product => {
            const stockItem = document.createElement('div');
            stockItem.className = `stock-item ${product.stock <= 5 ? 'critical' : ''}`;
            stockItem.innerHTML = `
                <div>
                    <strong>${product.name}</strong>
                    <div style="font-size: 0.85rem; color: #7f8c8d;">Stock: ${product.stock}</div>
                </div>
                ${product.stock <= 5 ? '<span class="stock-badge">Critical</span>' : ''}
            `;
            lowStockList.appendChild(stockItem);
        });
    }
}

// Display products
function displayProducts() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td><img src="${product.image}" class="product-image-small" alt="${product.name}"></td>
            <td><strong>${product.name}</strong></td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td class="action-btns">
                <button class="secondary-btn btn-small" onclick="editProduct(${product.id})">Edit</button>
                <button class="danger-btn btn-small" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Display orders
function displayOrders() {
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = '';
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #7f8c8d;">No orders yet</td></tr>';
        return;
    }
    
    orders.forEach(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id.toString().padStart(6, '0')}</td>
            <td>${orderDate}</td>
            <td>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</td>
            <td>${order.items.length}</td>
            <td><strong>$${order.total.toFixed(2)}</strong></td>
            <td><span class="status-badge ${order.status}">${order.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Display reviews
function displayReviews() {
    const container = document.getElementById('reviews-list-admin');
    container.innerHTML = '';
    
    if (reviews.length === 0) {
        container.innerHTML = '<div class="empty-state-admin"><h3>No reviews yet</h3></div>';
        return;
    }
    
    reviews.forEach(review => {
        const product = products.find(p => p.id === review.productId);
        const productName = product ? product.name : 'Unknown Product';
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const reviewDate = new Date(review.createdAt).toLocaleDateString();
        
        const card = document.createElement('div');
        card.className = 'review-card-admin';
        card.innerHTML = `
            <div class="review-header-admin">
                <div>
                    <div class="review-product-name">${productName}</div>
                    <div><strong>${review.userName}</strong> - ${reviewDate}</div>
                </div>
                <div class="review-stars-admin">${stars}</div>
            </div>
            <h4 style="margin-bottom: 10px;">${review.title}</h4>
            <p style="color: #555;">${review.text}</p>
        `;
        container.appendChild(card);
    });
}

// Display users
function displayUsers() {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #7f8c8d;">No users yet</td></tr>';
        return;
    }
    
    users.forEach(user => {
        const joinDate = new Date(user.createdAt).toLocaleDateString();
        const userOrders = orders.filter(o => o.userId === user.id).length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td>${joinDate}</td>
            <td>${userOrders}</td>
        `;
        tbody.appendChild(row);
    });
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Highlight active nav item
    event.target.classList.add('active');
}

// Show add product form
function showAddProductForm() {
    editingProductId = null;
    document.getElementById('form-title').textContent = 'Add New Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-form-container').style.display = 'block';
}

// Hide product form
function hideProductForm() {
    document.getElementById('product-form-container').style.display = 'none';
    document.getElementById('product-form').reset();
    editingProductId = null;
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    editingProductId = productId;
    document.getElementById('form-title').textContent = 'Edit Product';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-image').value = product.image;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-form-container').style.display = 'block';
    
    // Scroll to form
    document.getElementById('product-form-container').scrollIntoView({ behavior: 'smooth' });
}

// Save product
async function saveProduct(event) {
    event.preventDefault();
    
    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        image: document.getElementById('product-image').value,
        stock: parseInt(document.getElementById('product-stock').value)
    };
    
    try {
        let response;
        
        if (editingProductId) {
            // Update existing product
            response = await fetch(`${API_URL}/products/${editingProductId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        } else {
            // Create new product
            response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        }
        
        if (!response.ok) {
            throw new Error('Failed to save product');
        }
        
        showNotification(editingProductId ? 'Product updated successfully' : 'Product added successfully', 'success');
        hideProductForm();
        await loadProducts();
        updateDashboard();
        
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Failed to save product', 'error');
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
        
        showNotification('Product deleted successfully', 'success');
        await loadProducts();
        updateDashboard();
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Failed to delete product', 'error');
    }
}

// Admin logout
function handleAdminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminUser');
        window.location.href = 'admin-login.html';
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        info: '#3498db'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: ${colors[type] || colors.success};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
