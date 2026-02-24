// Configuration
const API_URL = 'https://shophub-backend-k2dx.onrender.com/api';

// State
let wishlist = [];
let cart = [];
let allProducts = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    loadWishlist();
    loadCart();
    displayWishlist();
    updateWishlistCount();
    updateCartCount();
    checkAuthStatus();
});

// Load products from backend
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        allProducts = await response.json();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load wishlist from localStorage
function loadWishlist() {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
        wishlist = JSON.parse(savedWishlist);
    }
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Display wishlist
function displayWishlist() {
    const wishlistItemsContainer = document.getElementById('wishlist-items');
    const emptyWishlist = document.getElementById('empty-wishlist');
    
    wishlistItemsContainer.innerHTML = '';
    
    if (wishlist.length === 0) {
        emptyWishlist.style.display = 'block';
        wishlistItemsContainer.style.display = 'none';
        updateWishlistSummary();
        return;
    }
    
    emptyWishlist.style.display = 'none';
    wishlistItemsContainer.style.display = 'block';
    
    wishlist.forEach(productId => {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        
        const wishlistItem = document.createElement('div');
        wishlistItem.className = 'cart-item';
        wishlistItem.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3 class="cart-item-name">${product.name}</h3>
                <p class="cart-item-description">${product.description}</p>
                <p class="cart-item-price">$${product.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-actions">
                <button class="add-to-cart-btn" onclick="moveToCart(${product.id})">
                    Move to Cart
                </button>
                <button class="remove-btn" onclick="removeFromWishlist(${product.id})">
                    Remove
                </button>
            </div>
        `;
        
        wishlistItemsContainer.appendChild(wishlistItem);
    });
    
    updateWishlistSummary();
}

// Update wishlist summary
function updateWishlistSummary() {
    let total = 0;
    
    wishlist.forEach(productId => {
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            total += product.price;
        }
    });
    
    document.getElementById('wishlist-item-count').textContent = wishlist.length;
    document.getElementById('wishlist-total').textContent = `$${total.toFixed(2)}`;
}

// Move item to cart
function moveToCart(productId) {
    // Add to cart
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ productId, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Remove from wishlist
    removeFromWishlist(productId, false);
    
    updateCartCount();
    showNotification('Item moved to cart!');
}

// Remove from wishlist
function removeFromWishlist(productId, showMsg = true) {
    wishlist = wishlist.filter(id => id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    displayWishlist();
    updateWishlistCount();
    
    if (showMsg) {
        showNotification('Item removed from wishlist');
    }
}

// Add all to cart
function addAllToCart() {
    if (wishlist.length === 0) return;
    
    wishlist.forEach(productId => {
        const existingItem = cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ productId, quantity: 1 });
        }
    });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Clear wishlist
    wishlist = [];
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    displayWishlist();
    updateWishlistCount();
    updateCartCount();
    
    showNotification('All items added to cart!');
}

// Clear wishlist
function clearWishlist() {
    if (!confirm('Are you sure you want to clear your wishlist?')) return;
    
    wishlist = [];
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    displayWishlist();
    updateWishlistCount();
    
    showNotification('Wishlist cleared');
}

// Update wishlist count
function updateWishlistCount() {
    const wishlistCountElement = document.getElementById('wishlist-count');
    if (wishlistCountElement) {
        wishlistCountElement.textContent = wishlist.length;
    }
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Check authentication status
function checkAuthStatus() {
    const currentUser = localStorage.getItem('currentUser');
    const authLinks = document.getElementById('auth-links');
    const userMenu = document.getElementById('user-menu');
    const userNameDisplay = document.getElementById('user-name-display');
    
    if (currentUser) {
        const user = JSON.parse(currentUser);
        if (authLinks) authLinks.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (userNameDisplay) userNameDisplay.textContent = user.name;
    } else {
        if (authLinks) authLinks.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
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
