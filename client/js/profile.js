// Configuration
const API_URL = 'http://localhost:3000/api';

// State
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadCart();
    updateCartCount();
    loadUserData();
});

// Check if user is authenticated
function checkAuth() {
    const userData = localStorage.getItem('currentUser');
    
    if (!userData) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(userData);
}

// Load user data and display
function loadUserData() {
    if (!currentUser) return;
    
    // Update header
    const headerName = document.getElementById('user-name-header');
    if (headerName) {
        headerName.textContent = currentUser.name;
    }
    
    // Update sidebar
    document.getElementById('user-full-name').textContent = currentUser.name;
    document.getElementById('user-email').textContent = currentUser.email;
    
    // Set avatar initials
    const initials = currentUser.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    document.getElementById('avatar-initials').textContent = initials;
    
    // Update info section
    document.getElementById('display-name').textContent = currentUser.name;
    document.getElementById('display-email').textContent = currentUser.email;
    
    // Format join date
    const joinDate = currentUser.createdAt 
        ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
        : 'Recently';
    document.getElementById('display-joined').textContent = joinDate;
    
    // Load order history
    loadOrderHistory();
}

// Load order history
async function loadOrderHistory() {
    if (!currentUser || !currentUser.id) return;
    
    try {
        const response = await fetch(`${API_URL}/orders/user/${currentUser.id}`);
        
        if (!response.ok) {
            throw new Error('Failed to load orders');
        }
        
        const orders = await response.json();
        displayOrders(orders);
        
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Display orders
function displayOrders(orders) {
    const ordersContainer = document.getElementById('orders-container');
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>No orders yet</h3>
                <p>Start shopping to see your orders here!</p>
                <a href="index.html" class="cta-button">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    ordersContainer.innerHTML = '';
    
    orders.forEach(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <h3>Order #${order.id.toString().padStart(6, '0')}</h3>
                    <p class="order-date">${orderDate}</p>
                </div>
                <div class="order-status ${order.status}">
                    ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
            </div>
            <div class="order-details-summary">
                <p><strong>Items:</strong> ${(order.items || []).length}</p>
                <p><strong>Total:</strong> $${parseFloat(order.total).toFixed(2)}</p>
                <p><strong>Shipping to:</strong> ${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
            </div>
        `;
        
        ordersContainer.appendChild(orderCard);
    });
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active from all nav buttons
    document.querySelectorAll('.profile-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Highlight active nav button
    event.target.classList.add('active');
}

// Handle Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        showNotification('Logged out successfully');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        const cart = JSON.parse(savedCart);
        updateCartCount(cart);
    }
}

// Update cart count
function updateCartCount(cart = []) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
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
