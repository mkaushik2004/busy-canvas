// API Base URL - Update this to match your backend URL
const API_BASE_URL = 'http://localhost:5000/api';

// Show loading state
function showLoading(button) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
}

// Hide loading state
function hideLoading(button) {
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
}

// Show error message
function showError(message) {
    // Create error alert
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert before the form
    const form = document.querySelector('.login-form form');
    form.insertBefore(errorDiv, form.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Show success message
function showSuccess(message) {
    // Create success alert
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success alert-dismissible fade show';
    successDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert before the form
    const form = document.querySelector('.login-form form');
    form.insertBefore(successDiv, form.firstChild);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Login function
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            showSuccess('Login successful! Redirecting...');
            
            // Redirect to dashboard or home page
            setTimeout(() => {
                window.location.href = '../layout/index.html';
            }, 1500);
            
            return true;
        } else {
            throw new Error(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Main verify function
async function verify(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('login-name');
    const passwordInput = document.getElementById('login-pass');
    const submitButton = document.querySelector('.login-btn');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Clear previous alerts
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => alert.remove());
    
    // Validation
    if (!email || !password) {
        showError('Please enter both email and password');
        return false;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return false;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return false;
    }
    
    try {
        showLoading(submitButton);
        await login(email, password);
    } catch (error) {
        hideLoading(submitButton);
        showError(error.message || 'Login failed. Please try again.');
    }
    
    return false;
}

// Check if user is already logged in
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        // User is already logged in, redirect to dashboard
        window.location.href = '../layout/index.html';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    
    // Add form submit event listener
    const form = document.querySelector('.login-form form');
    if (form) {
        form.addEventListener('submit', verify);
    }
});