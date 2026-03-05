const express = require('express');
const router = express.Router();
const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);

// Initialize payment
router.post('/initialize', async (req, res) => {
    try {
        const { email, amount, orderId, callback_url } = req.body;
        
        // Amount in kobo (Naira * 100)
        const amountInKobo = Math.round(amount * 100);
        
        const response = await paystack.transaction.initialize({
            email,
            amount: amountInKobo,
            currency: 'NGN',
            callback_url: callback_url || 'https://gombe-shophub.netlify.app/order-confirmation.html',
            metadata: {
                orderId,
                custom_fields: []
            }
        });
        
        res.json({
            success: true,
            authorization_url: response.data.authorization_url,
            access_code: response.data.access_code,
            reference: response.data.reference
        });
    } catch (error) {
        console.error('Paystack initialization error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Verify payment
router.get('/verify/:reference', async (req, res) => {
    try {
        const { reference } = req.params;
        
        const response = await paystack.transaction.verify(reference);
        
        if (response.data.status === 'success') {
            res.json({
                success: true,
                data: response.data,
                message: 'Payment verified successfully'
            });
        } else {
            res.json({
                success: false,
                message: 'Payment verification failed'
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Webhook for payment notifications
router.post('/webhook', express.json(), async (req, res) => {
    const hash = require('crypto')
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest('hex');
    
    if (hash === req.headers['x-paystack-signature']) {
        const event = req.body;
        
        if (event.event === 'charge.success') {
            const { reference, amount, customer } = event.data;
            
            console.log('✅ Payment successful:', {
                reference,
                amount: amount / 100,
                email: customer.email
            });
        }
    }
    
    res.sendStatus(200);
});

module.exports = router;
