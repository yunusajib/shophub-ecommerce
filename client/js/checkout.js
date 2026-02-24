// Configuration
const API_URL = 'https://shophub-backend-k2dx.onrender.com/api';

// State
let cart = [];
let allProducts = [];
let currentStep = 1;
let shippingData = {};
let paymentData = {};
let appliedPromoCode = null;

// Promo codes (in real app, fetch from backend)
const promoCodes = {
    'SAVE10': { type: 'percentage', value: 10, description: '10% off' },
    'SAVE20': { type: 'percentage', value: 20, description: '20% off' },
    'FREESHIP': { type: 'freeship', value: 0, description: 'Free shipping' },
    'FLAT15': { type: 'fixed', value: 15, description: '$15 off' }
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    loadCart();
    checkCartEmpty();
    displayOrderSummary();
    updateCartCount();
});

// Load products from backend

// Display order summary
function displayOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const subtotal = cart.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        return sum + (price * item.quantity);
    }, 0);
    
    const shipping = subtotal > 0 ? 10 : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    
    // Safely update elements if they exist
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
    if (shippingEl) shippingEl.textContent = shipping.toFixed(2);
    if (taxEl) taxEl.textContent = tax.toFixed(2);
    if (totalEl) totalEl.textContent = total.toFixed(2);
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        allProducts = await response.json();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Check if cart is empty
function checkCartEmpty() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        window.location.href = 'index.html';
    }
}



// Navigate to step
function goToStep(stepNumber) {
    // Validate current step before moving forward
    if (stepNumber > currentStep) {
        if (currentStep === 1 && !validateShippingForm()) {
            return;
        }
        if (currentStep === 2 && !validatePaymentForm()) {
            return;
        }
    }
    
    // Save data from current step
    if (currentStep === 1) {
        saveShippingData();
    } else if (currentStep === 2) {
        savePaymentData();
    }
    
    // Update step visibility
    document.querySelectorAll('.checkout-step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step-${stepNumber}`).classList.add('active');
    
    // Update progress indicators
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < stepNumber) {
            step.classList.add('completed');
        } else if (index + 1 === stepNumber) {
            step.classList.add('active');
        }
    });
    
    // Update current step
    currentStep = stepNumber;
    
    // If moving to review step, populate review data
    if (stepNumber === 3) {
        populateReviewStep();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validate shipping form
function validateShippingForm() {
    const form = document.getElementById('shipping-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    return true;
}

// Validate payment form
function validatePaymentForm() {
    const form = document.getElementById('payment-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    
    // Validate card number format (simple check)
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
        alert('Please enter a valid 16-digit card number');
        return false;
    }
    
    // Validate expiry date format
    const expiry = document.getElementById('expiryDate').value;
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        alert('Please enter expiry date in MM/YY format');
        return false;
    }
    
    // Validate CVV
    const cvv = document.getElementById('cvv').value;
    if (cvv.length !== 3 || !/^\d+$/.test(cvv)) {
        alert('Please enter a valid 3-digit CVV');
        return false;
    }
    
    return true;
}

// Save shipping data
function saveShippingData() {
    shippingData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value,
        country: document.getElementById('country').value
    };
}

// Save payment data
function savePaymentData() {
    const cardNumber = document.getElementById('cardNumber').value;
    paymentData = {
        cardName: document.getElementById('cardName').value,
        cardNumber: cardNumber,
        cardLast4: cardNumber.slice(-4),
        expiryDate: document.getElementById('expiryDate').value,
        cvv: document.getElementById('cvv').value
    };
}

// Populate review step
function populateReviewStep() {
    // Shipping info
    const reviewShipping = document.getElementById('review-shipping');
    reviewShipping.innerHTML = `
        <strong>${shippingData.firstName} ${shippingData.lastName}</strong><br>
        ${shippingData.address}<br>
        ${shippingData.city}, ${shippingData.state} ${shippingData.zipCode}<br>
        ${shippingData.country}<br>
        <br>
        Email: ${shippingData.email}<br>
        Phone: ${shippingData.phone}
    `;
    
    // Payment info
    const reviewPayment = document.getElementById('review-payment');
    reviewPayment.innerHTML = `
        <strong>${paymentData.cardName}</strong><br>
        Card ending in •••• ${paymentData.cardLast4}<br>
        Expires: ${paymentData.expiryDate}
    `;
    
    // Order items
    const reviewItems = document.getElementById('review-items');
    reviewItems.innerHTML = '';
    
    cart.forEach(cartItem => {
        const product = allProducts.find(p => p.id === cartItem.productId);
        if (!product) return;
        
        const itemTotal = product.price * cartItem.quantity;
        
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        reviewItem.innerHTML = `
            <div class="review-item-info">
                <img src="${product.image}" alt="${product.name}" class="review-item-image">
                <div class="review-item-details">
                    <h4>${product.name}</h4>
                    <p>Quantity: ${cartItem.quantity} × $${product.price.toFixed(2)}</p>
                </div>
            </div>
            <div class="review-item-price">$${itemTotal.toFixed(2)}</div>
        `;
        reviewItems.appendChild(reviewItem);
    });
}

// Place order
async function placeOrder() {
    const currentUser = localStorage.getItem('currentUser');
    let userId = null;
    
    if (currentUser) {
        const user = JSON.parse(currentUser);
        userId = user.id;
    }
    
    // Calculate totals
    let subtotal = 0;
    cart.forEach(cartItem => {
        const product = allProducts.find(p => p.id === cartItem.productId);
        if (product) {
            subtotal += product.price * cartItem.quantity;
        }
    });
    
    // Calculate discount
    let discount = 0;
    if (appliedPromoCode) {
        const promo = promoCodes[appliedPromoCode];
        if (promo.type === 'percentage') {
            discount = subtotal * (promo.value / 100);
        } else if (promo.type === 'fixed') {
            discount = promo.value;
        }
    }
    
    const freeShipping = appliedPromoCode && promoCodes[appliedPromoCode].type === 'freeship';
    const shipping = (subtotal - discount) > 100 || freeShipping ? 0 : 10;
    const tax = (subtotal - discount) * 0.1;
    const total = subtotal - discount + shipping + tax;
    
    // Prepare order data
    const orderData = {
        userId: userId,
        items: cart,
        shippingAddress: shippingData,
        paymentInfo: {
            cardName: paymentData.cardName,
            cardLast4: paymentData.cardLast4,
            expiryDate: paymentData.expiryDate
        },
        subtotal: subtotal,
        discount: discount,
        promoCode: appliedPromoCode,
        shipping: shipping,
        tax: tax,
        total: total
    };
    
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to place order');
        }
        
        const order = await response.json();
        
        // Clear cart
        localStorage.removeItem('cart');
        
        // Store order ID for confirmation page
        localStorage.setItem('lastOrderId', order.id);
        
        // Show success message
        showNotification('Order placed successfully!', 'success');
        
        // Redirect to confirmation page
        setTimeout(() => {
            window.location.href = 'order-confirmation.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error placing order:', error);
        showNotification('Failed to place order. Please try again.', 'error');
    }
}

// Format card number input
document.addEventListener('DOMContentLoaded', () => {
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
});

// Update cart count
function updateCartCount() {
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
