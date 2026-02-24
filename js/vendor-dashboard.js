// Configuration
const API_URL = 'https://shophub-backend-k2dx.onrender.com/api';

// State
let currentVendor = null;
let vendorProducts = [];
let vendorOrders = [];
let editingProductId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkVendorAuth();
    loadVendorData();
});

// Check vendor authentication
function checkVendorAuth() {
    const vendor = localStorage.getItem('currentVendor');

    if (!vendor) {
        window.location.href = 'vendor-login.html';
        return;
    }

    currentVendor = JSON.parse(vendor);
    document.getElementById('vendor-shop-name').textContent = currentVendor.shopName;
}

// Load all vendor data
async function loadVendorData() {
    await Promise.all([
        loadVendorProducts(),
        loadVendorOrders()
    ]);

    updateDashboard();
    loadShopProfile();
}

// Load vendor products
async function loadVendorProducts() {
    try {
        const response = await fetch(`${API_URL}/vendors/${currentVendor.id}/products`);
        vendorProducts = await response.json();
        displayVendorProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load vendor orders
async function loadVendorOrders() {
    try {
        const response = await fetch(`${API_URL}/vendors/${currentVendor.id}/orders`);
        vendorOrders = await response.json();
        displayVendorOrders();
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Update dashboard
function updateDashboard() {
    // Calculate total earnings
    const totalEarnings = vendorOrders.reduce((sum, order) => {
        return sum + order.items
            .filter(item => vendorProducts.find(p => p.id === item.productId))
            .reduce((itemSum, item) => {
                const product = vendorProducts.find(p => p.id === item.productId);
                return itemSum + (product ? product.price * item.quantity : 0);
            }, 0);
    }, 0);

    const platformFee = totalEarnings * 0.10; // 10% platform fee
    const netEarnings = totalEarnings * 0.90; // 90% to vendor

    document.getElementById('vendor-earnings').textContent = `$${netEarnings.toFixed(2)}`;
    document.getElementById('vendor-orders').textContent = vendorOrders.length;
    document.getElementById('vendor-products-count').textContent = vendorProducts.length;

    // Calculate average rating (simplified)
    document.getElementById('vendor-rating').textContent = '4.5';

    // Update earnings section
    document.getElementById('total-revenue').textContent = `$${totalEarnings.toFixed(2)}`;
    document.getElementById('platform-fee').textContent = `-$${platformFee.toFixed(2)}`;
    document.getElementById('net-earnings').textContent = `$${netEarnings.toFixed(2)}`;

    // Display recent orders
    displayRecentOrders();
    displayTopProducts();
    displayEarningsList();
}

// Display recent orders
function displayRecentOrders() {
    const container = document.getElementById('vendor-recent-orders');
    const recentOrders = vendorOrders.slice(0, 5);

    if (recentOrders.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No orders yet</p>';
        return;
    }

    container.innerHTML = '';
    recentOrders.forEach(order => {
        const orderItems = order.items.filter(item =>
            vendorProducts.find(p => p.id === item.productId)
        );

        if (orderItems.length === 0) return;

        const orderTotal = orderItems.reduce((sum, item) => {
            const product = vendorProducts.find(p => p.id === item.productId);
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);

        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item-small';
        orderDiv.innerHTML = `
            <div>
                <strong>Order #${order.id.toString().padStart(6, '0')}</strong>
                <div style="font-size: 0.85rem; color: #7f8c8d;">${orderItems.length} item(s)</div>
            </div>
            <div style="font-weight: bold; color: #27ae60;">$${orderTotal.toFixed(2)}</div>
        `;
        container.appendChild(orderDiv);
    });
}

// Display top products
function displayTopProducts() {
    const container = document.getElementById('vendor-top-products');
    const topProducts = vendorProducts.slice(0, 5);

    if (topProducts.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No products yet</p>';
        return;
    }

    container.innerHTML = '';
    topProducts.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'order-item-small';
        productDiv.innerHTML = `
            <div>
                <strong>${product.name}</strong>
                <div style="font-size: 0.85rem; color: #7f8c8d;">Stock: ${product.stock}</div>
            </div>
            <div style="font-weight: bold; color: #3498db;">$${product.price.toFixed(2)}</div>
        `;
        container.appendChild(productDiv);
    });
}

// Display earnings list
function displayEarningsList() {
    const container = document.getElementById('earnings-list');

    if (vendorOrders.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d; text-align: center; padding: 20px;">No transactions yet</p>';
        return;
    }

    container.innerHTML = '';
    vendorOrders.forEach(order => {
        const orderItems = order.items.filter(item =>
            vendorProducts.find(p => p.id === item.productId)
        );

        if (orderItems.length === 0) return;

        const orderTotal = orderItems.reduce((sum, item) => {
            const product = vendorProducts.find(p => p.id === item.productId);
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);

        const earnings = orderTotal * 0.90;
        const date = new Date(order.createdAt).toLocaleDateString();

        const transactionDiv = document.createElement('div');
        transactionDiv.className = 'order-item-small';
        transactionDiv.innerHTML = `
            <div>
                <strong>Order #${order.id.toString().padStart(6, '0')}</strong>
                <div style="font-size: 0.85rem; color: #7f8c8d;">${date}</div>
            </div>
            <div style="font-weight: bold; color: #27ae60;">+$${earnings.toFixed(2)}</div>
        `;
        container.appendChild(transactionDiv);
    });
}

// Display vendor products
function displayVendorProducts() {
    const tbody = document.getElementById('vendor-products-table');
    tbody.innerHTML = '';

    if (vendorProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #7f8c8d;">No products yet. Add your first product!</td></tr>';
        return;
    }

    vendorProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.image}" class="product-image-small" alt="${product.name}"></td>
            <td><strong>${product.name}</strong></td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td><span class="status-badge ${product.stock > 0 ? 'confirmed' : 'processing'}">${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></td>
            <td class="action-btns">
                <button class="secondary-btn btn-small" onclick="editProduct(${product.id})">Edit</button>
                <button class="danger-btn btn-small" onclick="deleteVendorProduct(${product.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Display vendor orders
function displayVendorOrders() {
    const tbody = document.getElementById('vendor-orders-table');
    tbody.innerHTML = '';

    if (vendorOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #7f8c8d;">No orders yet</td></tr>';
        return;
    }

    vendorOrders.forEach(order => {
        const orderItems = order.items.filter(item =>
            vendorProducts.find(p => p.id === item.productId)
        );

        if (orderItems.length === 0) return;

        orderItems.forEach(item => {
            const product = vendorProducts.find(p => p.id === item.productId);
            if (!product) return;

            const itemTotal = product.price * item.quantity;
            const orderDate = new Date(order.createdAt).toLocaleDateString();

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${order.id.toString().padStart(6, '0')}</td>
                <td>${orderDate}</td>
                <td>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</td>
                <td>${product.name}</td>
                <td>${item.quantity}</td>
                <td><strong>$${itemTotal.toFixed(2)}</strong></td>
                <td><span class="status-badge ${order.status}">${order.status}</span></td>
            `;
            tbody.appendChild(row);
        });
    });
}

// Show section
function showSection(sectionName) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    document.getElementById(`${sectionName}-section`).classList.add('active');
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
    const product = vendorProducts.find(p => p.id === productId);
    if (!product) return;

    editingProductId = productId;
    document.getElementById('form-title').textContent = 'Edit Product';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-image').value = product.image;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-category').value = product.category || '';
    document.getElementById('product-form-container').style.display = 'block';

    document.getElementById('product-form-container').scrollIntoView({ behavior: 'smooth' });
}

// Save vendor product
async function saveVendorProduct(event) {
    event.preventDefault();

    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        image: document.getElementById('product-image').value,
        stock: parseInt(document.getElementById('product-stock').value),
        category: document.getElementById('product-category').value,
        vendorId: currentVendor.id
    };

    try {
        let response;

        if (editingProductId) {
            response = await fetch(`${API_URL}/products/${editingProductId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        } else {
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
        await loadVendorProducts();
        updateDashboard();

    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Failed to save product', 'error');
    }
}

// Delete vendor product
async function deleteVendorProduct(productId) {
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
        await loadVendorProducts();
        updateDashboard();

    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Failed to delete product', 'error');
    }
}

// Load shop profile
function loadShopProfile() {
    document.getElementById('profile-shop-name').value = currentVendor.shopName;
    document.getElementById('profile-owner-name').value = currentVendor.ownerName;
    document.getElementById('profile-email').value = currentVendor.email;
    document.getElementById('profile-phone').value = currentVendor.phone;
    document.getElementById('profile-address').value = currentVendor.address;
    document.getElementById('profile-description').value = currentVendor.description;
}

// Update shop profile
async function updateShopProfile(event) {
    event.preventDefault();

    const profileData = {
        shopName: document.getElementById('profile-shop-name').value,
        ownerName: document.getElementById('profile-owner-name').value,
        email: document.getElementById('profile-email').value,
        phone: document.getElementById('profile-phone').value,
        address: document.getElementById('profile-address').value,
        description: document.getElementById('profile-description').value
    };

    try {
        const response = await fetch(`${API_URL}/vendors/${currentVendor.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        const updatedVendor = await response.json();
        localStorage.setItem('currentVendor', JSON.stringify(updatedVendor));
        currentVendor = updatedVendor;
        document.getElementById('vendor-shop-name').textContent = updatedVendor.shopName;

        showNotification('Profile updated successfully', 'success');

    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile', 'error');
    }
}

// Vendor logout
function handleVendorLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentVendor');
        window.location.href = 'vendor-login.html';
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
