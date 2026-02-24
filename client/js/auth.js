const API_URL = 'http://localhost:3000/api';

// Handle Login
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error-message');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.textContent = data.message || 'Login failed';
            errorDiv.style.display = 'block';
            return;
        }

        localStorage.setItem('currentUser', JSON.stringify(data.user));
        window.location.href = 'index.html';

    } catch (error) {
        errorDiv.textContent = 'Connection error. Is the server running?';
        errorDiv.style.display = 'block';
    }
}

// Handle Register
async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorDiv = document.getElementById('error-message');

    errorDiv.style.display = 'none';

    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.textContent = data.message || 'Registration failed';
            errorDiv.style.display = 'block';
            return;
        }

        localStorage.setItem('currentUser', JSON.stringify(data.user));
        window.location.href = 'index.html';

    } catch (error) {
        errorDiv.textContent = 'Connection error. Is the server running?';
        errorDiv.style.display = 'block';
    }
}
