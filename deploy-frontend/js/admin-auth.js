// Configuration
const API_URL = 'https://shophub-backend-k2dx.onrender.com/api';

// Handle Admin Login
async function handleAdminLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const errorDiv = document.getElementById('error-message');
    
    try {
        const response = await fetch(`${API_URL}/admin/login`, {
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
        
        // Store admin session
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        
        // Redirect to admin dashboard
        window.location.href = 'admin.html';
        
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    }
}
