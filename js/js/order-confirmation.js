// Configuration
const API_URL = 'https://shophub-backend-k2dx.onrender.com/api';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadOrderDetails();
});

// Load order details
async function loadOrderDetails() {
    const orderId = localStorage.getItem('lastOrderId');
    
    if (!orderId) {
        // No order ID found, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}`);
        
        if (!response.ok) {
            throw new Error('Order not found');
        }
        
        const order = await response.json();
        displayOrderDetails(order);
        
        // Clear the stored order ID
        localStorage.removeItem('lastOrderId');
        
    } catch (error) {
        console.error('Error loading order:', error);
        window.location.href = 'index.html';
    }
}

// Display order details
function displayOrderDetails(order) {
    document.getElementById('order-id').textContent = order.id.toString().padStart(6, '0');
    document.getElementById('customer-email').textContent = order.shippingAddress.email;
    
    document.getElementById('detail-subtotal').textContent = `$${order.subtotal.toFixed(2)}`;
    document.getElementById('detail-shipping').textContent = order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`;
    document.getElementById('detail-tax').textContent = `$${order.tax.toFixed(2)}`;
    document.getElementById('detail-total').textContent = `$${order.total.toFixed(2)}`;
}
