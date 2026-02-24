// Configuration
const API_URL = 'http://localhost:3000/api';

// State
let currentProduct = null;
let cart = [];
let quantity = 1;
let allProducts = [];
let productReviews = [];
let currentRating = 0;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    loadCart();
    updateCartCount();
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        showError();
        return;
    }
    
    await loadProduct(productId);
    await loadAllProducts();
    displayRelatedProducts();
    await loadReviews();
    
    // Track recently viewed
    trackRecentlyViewed(parseInt(productId));
});

// Load product from backend
async function loadProduct(productId) {
    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        
        if (!response.ok) {
            throw new Error('Product not found');
        }
        
        currentProduct = await response.json();
        displayProduct();
        
    } catch (error) {
        console.error('Error loading product:', error);
        showError();
    }
}

// Load all products for related products
async function loadAllProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        allProducts = await response.json();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display product details
function displayProduct() {
    const container = document.getElementById('product-container');
    
    if (!currentProduct) {
        showError();
        return;
    }
    
    const inStock = currentProduct.stock > 0;
    const lowStock = currentProduct.stock > 0 && currentProduct.stock <= 5;
    
    container.innerHTML = `
        <div class="product-image-section">
            <div style="position: relative;">
                <img src="${currentProduct.image}" alt="${currentProduct.name}" class="main-product-image">
                ${inStock ? (lowStock ? '<div class="product-badge low-stock">Only ' + currentProduct.stock + ' left!</div>' : '<div class="product-badge">In Stock</div>') : '<div class="product-badge low-stock">Out of Stock</div>'}
            </div>
        </div>
        
        <div class="product-info-section">
            <h1 class="product-detail-name">${currentProduct.name}</h1>
            
            <div class="product-rating">
                <span class="stars">★★★★★</span>
                <span class="review-count">(${Math.floor(Math.random() * 200) + 50} reviews)</span>
            </div>
            
            <div>
                <span class="price-label">Price:</span>
                <div class="product-detail-price">$${parseFloat(currentProduct.price).toFixed(2)}</div>
            </div>
            
            <p class="product-detail-description">${currentProduct.description}</p>
            
            <div class="product-features">
                <h3>Key Features</h3>
                <ul class="features-list">
                    <li>Premium quality materials</li>
                    <li>30-day money-back guarantee</li>
                    <li>Free shipping on orders over $100</li>
                    <li>1-year manufacturer warranty</li>
                </ul>
            </div>
            
            <div class="stock-info ${lowStock ? 'low' : ''}">
                <span class="stock-icon">${inStock ? '✓' : '✗'}</span>
                <span class="stock-text">
                    ${inStock ? (lowStock ? `Only ${currentProduct.stock} left in stock - order soon!` : `In stock (${currentProduct.stock} available)`) : 'Currently out of stock'}
                </span>
            </div>
            
            ${inStock ? `
                <div class="quantity-selector">
                    <label>Quantity:</label>
                    <div class="quantity-controls-detail">
                        <button class="quantity-btn-detail" onclick="decreaseQuantity()" ${quantity <= 1 ? 'disabled' : ''}>−</button>
                        <span class="quantity-display-detail" id="quantity-display">${quantity}</span>
                        <button class="quantity-btn-detail" onclick="increaseQuantity()" ${quantity >= currentProduct.stock ? 'disabled' : ''}>+</button>
                    </div>
                </div>
                
                <div class="add-to-cart-detail">
                    <button class="add-to-cart-btn-large" onclick="addToCart()">
                        🛒 Add to Cart
                    </button>
                    <button class="add-to-cart-btn-large buy-now-btn" onclick="buyNow()">
                        Buy Now
                    </button>
                </div>
            ` : `
                <button class="add-to-cart-btn-large" disabled>
                    Out of Stock
                </button>
            `}
        </div>
    `;
}

// Display related products
function displayRelatedProducts() {
    if (!currentProduct || allProducts.length <= 1) return;
    
    // Get 3 random products excluding current one
    const relatedProducts = allProducts
        .filter(p => p.id !== currentProduct.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    
    if (relatedProducts.length === 0) return;
    
    const relatedSection = document.getElementById('related-products');
    const relatedContainer = document.getElementById('related-container');
    
    relatedSection.style.display = 'block';
    
    relatedContainer.innerHTML = '';
    
    relatedProducts.forEach(product => {
        const productCard = createProductCard(product);
        relatedContainer.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.cursor = 'pointer';
    card.onclick = () => {
        window.location.href = `product-details.html?id=${product.id}`;
    };
    
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <p class="product-price">$${parseFloat(product.price).toFixed(2)}</p>
        </div>
    `;
    
    return card;
}

// Increase quantity
function increaseQuantity() {
    if (quantity < currentProduct.stock) {
        quantity++;
        updateQuantityDisplay();
    }
}

// Decrease quantity
function decreaseQuantity() {
    if (quantity > 1) {
        quantity--;
        updateQuantityDisplay();
    }
}

// Update quantity display
function updateQuantityDisplay() {
    const display = document.getElementById('quantity-display');
    if (display) {
        display.textContent = quantity;
    }
    
    // Update button states
    const decreaseBtn = document.querySelector('.quantity-btn-detail:first-child');
    const increaseBtn = document.querySelector('.quantity-btn-detail:last-child');
    
    if (decreaseBtn) {
        decreaseBtn.disabled = quantity <= 1;
    }
    
    if (increaseBtn) {
        increaseBtn.disabled = quantity >= currentProduct.stock;
    }
}

// Add to cart
function addToCart() {
    if (!currentProduct || quantity < 1) return;
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.productId === currentProduct.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            productId: currentProduct.id,
            quantity: quantity
        });
    }
    
    saveCart();
    updateCartCount();
    showNotification(`Added ${quantity} item(s) to cart!`);
    
    // Reset quantity
    quantity = 1;
    updateQuantityDisplay();
}

// Buy now (add to cart and go to cart page)
function buyNow() {
    addToCart();
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 500);
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

// Show error message
function showError() {
    document.getElementById('product-container').style.display = 'none';
    document.getElementById('error-message').style.display = 'block';
}

// Review Functions

// Load reviews
async function loadReviews() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    try {
        const response = await fetch(`${API_URL}/reviews/${productId}`);
        if (!response.ok) throw new Error('Failed to load reviews');
        
        productReviews = await response.json();
        displayReviews();
        updateRatingSummary();
    } catch (error) {
        console.error('Error loading reviews:', error);
        productReviews = [];
        displayReviews();
    }
}

// Display reviews
function displayReviews() {
    const reviewsList = document.getElementById('reviews-list');
    
    if (productReviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="no-reviews">
                <h3>No reviews yet</h3>
                <p>Be the first to review this product!</p>
            </div>
        `;
        return;
    }
    
    reviewsList.innerHTML = '';
    
    productReviews.forEach(review => {
        const reviewCard = createReviewCard(review);
        reviewsList.appendChild(reviewCard);
    });
}

// Create review card
function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';
    
    const reviewDate = new Date(review.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const initials = review.userName
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    
    const isHelpful = localStorage.getItem(`helpful-${review.id}`) === 'true';
    
    card.innerHTML = `
        <div class="review-header">
            <div class="reviewer-info">
                <div class="reviewer-avatar">${initials}</div>
                <div class="reviewer-details">
                    <h4>${review.userName}</h4>
                    <div class="review-date">${reviewDate}</div>
                </div>
            </div>
            <div class="review-rating">
                <div class="review-stars">${stars}</div>
                ${review.verified ? '<span class="verified-badge">✓ Verified Purchase</span>' : ''}
            </div>
        </div>
        <h3 class="review-title">${review.title}</h3>
        <p class="review-text">${review.text}</p>
        <div class="review-actions">
            <button class="helpful-btn ${isHelpful ? 'voted' : ''}" onclick="markHelpful(${review.id})">
                👍 Helpful (${review.helpfulCount || 0})
            </button>
        </div>
    `;
    
    return card;
}

// Update rating summary
function updateRatingSummary() {
    if (productReviews.length === 0) {
        document.getElementById('average-rating').textContent = '0.0';
        document.getElementById('stars-large').textContent = '☆☆☆☆☆';
        document.getElementById('rating-count').textContent = '0 reviews';
        return;
    }
    
    // Calculate average
    const average = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    document.getElementById('average-rating').textContent = parseFloat(average).toFixed(1);
    
    // Display stars
    const fullStars = Math.floor(average);
    const stars = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
    document.getElementById('stars-large').textContent = stars;
    
    // Review count
    document.getElementById('rating-count').textContent = `${productReviews.length} review${productReviews.length === 1 ? '' : 's'}`;
    
    // Rating breakdown
    const breakdown = [0, 0, 0, 0, 0];
    productReviews.forEach(review => {
        breakdown[review.rating - 1]++;
    });
    
    for (let i = 1; i <= 5; i++) {
        const count = breakdown[i - 1];
        const percentage = productReviews.length > 0 ? (count / productReviews.length * 100) : 0;
        document.getElementById(`bar-${i}`).style.width = `${percentage}%`;
        document.getElementById(`count-${i}`).textContent = count;
    }
}

// Show review form
function showReviewForm() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        alert('Please login to write a review');
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('review-form-container').style.display = 'block';
    document.getElementById('review-form-container').scrollIntoView({ behavior: 'smooth' });
}

// Hide review form
function hideReviewForm() {
    document.getElementById('review-form-container').style.display = 'none';
    document.getElementById('review-form').reset();
    currentRating = 0;
    updateStarInput();
}

// Set rating
function setRating(rating) {
    currentRating = rating;
    document.getElementById('rating-value').value = rating;
    updateStarInput();
}

// Update star input display
function updateStarInput() {
    const stars = document.querySelectorAll('.star-input');
    stars.forEach((star, index) => {
        if (index < currentRating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Submit review
async function submitReview(event) {
    event.preventDefault();
    
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        alert('Please login to submit a review');
        return;
    }
    
    const user = JSON.parse(currentUser);
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    const reviewData = {
        productId: parseInt(productId),
        userId: user.id,
        userName: user.name,
        rating: parseInt(document.getElementById('rating-value').value),
        title: document.getElementById('review-title').value,
        text: document.getElementById('review-text').value,
        verified: false // In real app, check if user purchased the product
    };
    
    try {
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reviewData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit review');
        }
        
        showNotification('Review submitted successfully!', 'success');
        hideReviewForm();
        await loadReviews();
        
    } catch (error) {
        console.error('Error submitting review:', error);
        showNotification('Failed to submit review', 'error');
    }
}

// Filter reviews by rating
function filterReviewsByRating(rating) {
    document.getElementById('review-filter').value = rating.toString();
    applyReviewFilter();
}

// Apply review filter
function applyReviewFilter() {
    const filterValue = document.getElementById('review-filter').value;
    applyReviewSort(); // This will re-display with current filter
}

// Apply review sort
function applyReviewSort() {
    const filterValue = document.getElementById('review-filter').value;
    const sortValue = document.getElementById('review-sort').value;
    
    // Filter
    let filtered = [...productReviews];
    if (filterValue !== 'all') {
        filtered = filtered.filter(r => r.rating === parseInt(filterValue));
    }
    
    // Sort
    switch(sortValue) {
        case 'recent':
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'helpful':
            filtered.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
            break;
        case 'highest':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'lowest':
            filtered.sort((a, b) => a.rating - b.rating);
            break;
    }
    
    // Display filtered/sorted reviews
    const reviewsList = document.getElementById('reviews-list');
    reviewsList.innerHTML = '';
    
    if (filtered.length === 0) {
        reviewsList.innerHTML = `
            <div class="no-reviews">
                <h3>No reviews match your filter</h3>
                <p>Try selecting a different rating or view all reviews</p>
            </div>
        `;
        return;
    }
    
    filtered.forEach(review => {
        const reviewCard = createReviewCard(review);
        reviewsList.appendChild(reviewCard);
    });
}

// Mark review as helpful
async function markHelpful(reviewId) {
    const storageKey = `helpful-${reviewId}`;
    const alreadyVoted = localStorage.getItem(storageKey) === 'true';
    
    if (alreadyVoted) {
        showNotification('You already marked this review as helpful', 'info');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/reviews/${reviewId}/helpful`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Failed to mark as helpful');
        }
        
        localStorage.setItem(storageKey, 'true');
        await loadReviews();
        showNotification('Thanks for your feedback!', 'success');
        
    } catch (error) {
        console.error('Error marking helpful:', error);
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

// Track recently viewed products
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

