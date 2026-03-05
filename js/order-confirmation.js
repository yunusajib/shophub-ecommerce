const API_URL = 'https://shophub-backend-k2dx.onrender.com/api';

async function verifyPayment() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const reference = urlParams.get('reference') || localStorage.getItem('paymentReference');
        const orderId = urlParams.get('orderId') || localStorage.getItem('pendingOrderId');

        if (!reference) {
            document.getElementById('order-status').innerHTML = 
                '<p class="error">No payment reference found</p>';
            return;
        }

        document.getElementById('order-status').innerHTML = 
            '<p>Verifying payment...</p>';

        const response = await fetch(`${API_URL}/payment/verify/${reference}`);
        const result = await response.json();

        if (result.success && result.data.status === 'success') {
            document.getElementById('order-status').innerHTML = `
                <div class="success-message">
                    <h2>✅ Payment Successful!</h2>
                    <p>Order ID: ${orderId}</p>
                    <p>Reference: ${reference}</p>
                    <p>Amount: ₦${(result.data.amount / 100).toFixed(2)}</p>
                    <p>Thank you for your order!</p>
                    <a href="/" class="btn">Continue Shopping</a>
                    <a href="/profile.html" class="btn">View Orders</a>
                </div>
            `;

            localStorage.removeItem('cart');
            localStorage.removeItem('pendingOrderId');
            localStorage.removeItem('paymentReference');

        } else {
            document.getElementById('order-status').innerHTML = `
                <div class="error-message">
                    <h2>❌ Payment Failed</h2>
                    <p>Your payment could not be processed.</p>
                    <a href="/checkout.html" class="btn">Try Again</a>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error verifying payment:', error);
        document.getElementById('order-status').innerHTML = `
            <div class="error-message">
                <h2>⚠️ Verification Error</h2>
                <p>Could not verify payment. Please contact support.</p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', verifyPayment);
