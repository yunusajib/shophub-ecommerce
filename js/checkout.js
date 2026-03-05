const API_URL = 'https://shophub-backend-k2dx.onrender.com/api';

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'inline' : 'none';
    }
}

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>₦${parseFloat(item.price).toFixed(2)}</p>
                <p>Quantity: ${item.quantity}</p>
            </div>
            <p class="cart-item-total">₦${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
        </div>
    `).join('');
    
    displayOrderSummary();
}

function displayOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const subtotal = cart.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        return sum + (price * item.quantity);
    }, 0);
    
    const shipping = subtotal > 0 ? 1000 : 0;
    const tax = subtotal * 0.075;
    const total = subtotal + shipping + tax;
    
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
    if (shippingEl) shippingEl.textContent = shipping.toFixed(2);
    if (taxEl) taxEl.textContent = tax.toFixed(2);
    if (totalEl) totalEl.textContent = total.toFixed(2);
}

async function placeOrder() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        const firstName = document.getElementById('firstName')?.value;
        const lastName = document.getElementById('lastName')?.value;
        const email = document.getElementById('email')?.value;
        const phone = document.getElementById('phone')?.value;
        const address = document.getElementById('address')?.value;
        const city = document.getElementById('city')?.value;
        const state = document.getElementById('state')?.value;
        const zipCode = document.getElementById('zipCode')?.value;

        if (!firstName || !lastName || !email || !phone || !address || !city || !state || !zipCode) {
            alert('Please fill in all shipping details');
            return;
        }

        const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
        const shipping = 1000;
        const tax = subtotal * 0.075;
        const total = subtotal + shipping + tax;

        const placeOrderBtn = document.querySelector('.place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.disabled = true;
            placeOrderBtn.textContent = 'Processing...';
        }

        const orderData = {
            userId: getCurrentUser()?.id || null,
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: parseFloat(item.price)
            })),
            shippingAddress: {
                firstName, lastName, email, phone,
                address, city, state, zipCode,
                country: 'Nigeria'
            },
            subtotal, 
            shipping, 
            tax, 
            total
        };

        console.log('Sending order data:', orderData);

        const orderResponse = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (!orderResponse.ok) {
            const errorText = await orderResponse.text();
            console.error('Order creation failed. Status:', orderResponse.status);
            console.error('Response:', errorText);
            let errorMessage = 'Failed to create order';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
        }
        
        const order = await orderResponse.json();
        console.log('Order created:', order);

        const paymentResponse = await fetch(`${API_URL}/payment/initialize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                amount: total,
                orderId: order.id,
                callback_url: 'https://gombe-shophub.netlify.app/order-confirmation.html?orderId=' + order.id
            })
        });

        const paymentData = await paymentResponse.json();
        console.log('Payment response:', paymentData);

        if (paymentData.success) {
            localStorage.setItem('pendingOrderId', order.id);
            localStorage.setItem('paymentReference', paymentData.reference);
            window.location.href = paymentData.authorization_url;
        } else {
            throw new Error(paymentData.message || 'Payment initialization failed');
        }

    } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order: ' + error.message);
        
        const placeOrderBtn = document.querySelector('.place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = 'Place Order';
        }
    }
}

let currentStep = 1;

function goToStep(step) {
    document.querySelectorAll('.checkout-step').forEach(s => {
        s.classList.remove('active');
    });
    
    const stepElement = document.getElementById(`step-${step}`);
    if (stepElement) {
        stepElement.classList.add('active');
        currentStep = step;
    }
    
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        if (index < step) {
            indicator.classList.add('completed');
            indicator.classList.remove('active');
        } else if (index === step - 1) {
            indicator.classList.add('active');
            indicator.classList.remove('completed');
        } else {
            indicator.classList.remove('active', 'completed');
        }
    });
}

function nextStep() {
    if (validateCurrentStep()) {
        goToStep(currentStep + 1);
    }
}

function previousStep() {
    goToStep(currentStep - 1);
}

function validateCurrentStep() {
    if (currentStep === 1) {
        const firstName = document.getElementById('firstName')?.value;
        const lastName = document.getElementById('lastName')?.value;
        const email = document.getElementById('email')?.value;
        const phone = document.getElementById('phone')?.value;
        const address = document.getElementById('address')?.value;
        
        if (!firstName || !lastName || !email || !phone || !address) {
            alert('Please fill in all required fields');
            return false;
        }
    }
    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    goToStep(1);
    loadCart();
    updateCartCount();
});
