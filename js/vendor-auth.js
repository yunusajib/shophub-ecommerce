// Configuration
const API_URL = 'https://shophub-backend-k2dx.onrender.com/api';

// Handle Vendor Registration
async function handleVendorRegister(event) {
    event.preventDefault();
    
    const shopName = document.getElementById('shop-name').value;
    const ownerName = document.getElementById('owner-name').value;
    const email = document.getElementById('vendor-email').value;
    const phone = document.getElementById('vendor-phone').value;
    const address = document.getElementById('business-address').value;
    const description = document.getElementById('shop-description').value;
    const password = document.getElementById('vendor-password').value;
    const confirmPassword = document.getElementById('vendor-confirm-password').value;
    
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    // Validate passwords match
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/vendors/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                shopName,
                ownerName,
                email,
                phone,
                address,
                description,
                password
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        // Show success message
        successDiv.textContent = 'Vendor account created successfully! Redirecting to login...';
        successDiv.style.display = 'block';
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = 'vendor-login.html';
        }, 2000);
        
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    }
}

// Handle Vendor Login
async function handleVendorLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('vendor-email').value;
    const password = document.getElementById('vendor-password').value;
    const errorDiv = document.getElementById('error-message');
    
    try {
        const response = await fetch(`${API_URL}/vendors/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Store vendor session
        localStorage.setItem('currentVendor', JSON.stringify(data.vendor));
        
        // Redirect to vendor dashboard
        window.location.href = 'vendor-dashboard.html';
        
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    }
}
