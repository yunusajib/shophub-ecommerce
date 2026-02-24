// Configuration
const API_URL = 'http://localhost:3000/api';

// Cart state
let cart = [];

// State
let allProducts = [];
let filteredProducts = [];
let wishlist = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCart();
    loadWishlist();
    checkAuthStatus();
});

// Load wishlist from localStorage
function loadWishlist() {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
        wishlist = JSON.parse(savedWishlist);
    }
    updateWishlistCount();
}

// Toggle wishlist
function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    
    if (index === -1) {
        // Add to wishlist
        wishlist.push(productId);
        showNotification('Added to wishlist! ❤️');
    } else {
        // Remove from wishlist
        wishlist.splice(index, 1);
        showNotification('Removed from wishlist');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    displayProducts(); // Refresh to update heart icons
}

// Update wishlist count
function updateWishlistCount() {
    const wishlistCountElement = document.getElementById('wishlist-count');
    if (wishlistCountElement) {
        wishlistCountElement.textContent = wishlist.length;
    }
}

// Track recently viewed
function trackRecentlyViewed(productId) {
    let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    
    // Remove if already exists
    recentlyViewed = recentlyViewed.filter(id => id !== productId);
    
    // Add to beginning
    recentlyViewed.unshift(productId);
    
    // Keep only last 10
    recentlyViewed = recentlyViewed.slice(0, 10);
    
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
}

// Scroll to products section
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Load products from backend
async function loadProducts() {
    const container = document.getElementById('products-container');
    
    try {
            const response = await fetch(`${API_URL}/products`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        
        displayProducts();
        
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = `
            <div class="loading" style="color: #e74c3c;">
                Error loading products. Please make sure the server is running.
            </div>
        `;
    }
}

// Display products
function displayProducts() {
    const container = document.getElementById('products-container');
    
    // Clear container
    container.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        updateResultsCount();
        return;
    }
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
    
    updateResultsCount();
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Fetch and calculate average rating (simplified for now)
    const averageRating = 4.5; // In a real app, fetch from backend
    const stars = '★'.repeat(Math.floor(averageRating)) + '☆'.repeat(5 - Math.floor(averageRating));
    
    // Check if in wishlist
    const inWishlist = wishlist.includes(product.id);
    const heartIcon = inWishlist ? '❤️' : '🤍';
    
    card.innerHTML = `
        <div style="position: relative;">
            <div onclick="window.location.href='product-details.html?id=${product.id}'" style="cursor: pointer;">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-rating-small">
                        <span style="color: #f39c12; font-size: 0.9rem;">${stars}</span>
                        <span style="color: #7f8c8d; font-size: 0.85rem; margin-left: 5px;">(${Math.floor(Math.random() * 100) + 10})</span>
                    </div>
                    <p class="product-description">${product.description}</p>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                </div>
            </div>
            <button onclick="event.stopPropagation(); toggleWishlist(${product.id})" style="position: absolute; top: 10px; right: 10px; background: white; border: none; font-size: 1.5rem; cursor: pointer; border-radius: 50%; width: 40px; height: 40px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                ${heartIcon}
            </button>
        </div>
        <div class="product-info" style="padding-top: 0;">
            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${product.id})">
                Add to Cart
            </button>
        </div>
    `;
    
    return card;
}

// Add product to cart
function addToCart(productId) {
    // Find if product already exists in cart
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ productId, quantity: 1 });
    }
    
    saveCart();
    updateCartCount();
    
    // Visual feedback
    showNotification('Product added to cart!');
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// Update cart count display
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: #27ae60;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Search and Filter Functions

// Handle search
function handleSearch() {
    applyFilters();
}

// Update price label
function updatePriceLabel() {
    const priceValue = document.getElementById('price-filter').value;
    document.getElementById('price-value').textContent = priceValue;
}

// Apply all filters
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    const maxPrice = parseFloat(document.getElementById('price-filter').value);
    const sortBy = document.getElementById('sort-filter').value;
    
    // Start with all products
    filteredProducts = [...allProducts];
    
    // Apply search filter
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply category filter
    if (category !== 'all') {
        filteredProducts = filteredProducts.filter(product => {
            const productCategory = getProductCategory(product);
            return productCategory === category;
        });
    }
    
    // Apply price filter
    filteredProducts = filteredProducts.filter(product => product.price <= maxPrice);
    
    // Apply sorting
    switch(sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            // Keep original order
            break;
    }
    
    displayProducts();
}

// Get product category based on name/description
function getProductCategory(product) {
    const name = product.name.toLowerCase();
    const desc = product.description.toLowerCase();
    
    if (name.includes('headphone') || name.includes('watch') || name.includes('charger')) {
        return 'electronics';
    } else if (name.includes('backpack') || name.includes('bag')) {
        return 'accessories';
    } else if (name.includes('keyboard') || name.includes('mouse')) {
        return 'peripherals';
    }
    
    return 'electronics'; // default
}

// Update results count
function updateResultsCount() {
    const count = filteredProducts.length;
    const total = allProducts.length;
    const resultsText = count === total 
        ? `Showing all ${total} products`
        : `Showing ${count} of ${total} products`;
    
    document.getElementById('results-count').textContent = resultsText;
}

// Clear all filters
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('category-filter').value = 'all';
    document.getElementById('price-filter').value = '200';
    document.getElementById('price-value').textContent = '200';
    document.getElementById('sort-filter').value = 'default';
    
    applyFilters();
    showNotification('Filters cleared');
}

// Check authentication status
function checkAuthStatus() {
    const currentUser = localStorage.getItem('currentUser');
    const authLinks = document.getElementById('auth-links');
    const userMenu = document.getElementById('user-menu');
    const userNameDisplay = document.getElementById('user-name-display');
    
    if (currentUser) {
        // User is logged in
        const user = JSON.parse(currentUser);
        if (authLinks) authLinks.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (userNameDisplay) userNameDisplay.textContent = user.name;
    } else {
        // User is not logged in
        if (authLinks) authLinks.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
    }
}
