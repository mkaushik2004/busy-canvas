// API Base URL - Update this to match your backend URL
const API_BASE_URL = 'http://localhost:5000/api';

// Show loading state
function showLoading(button) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
}

// Hide loading state
function hideLoading(button) {
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
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
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 5000);
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
function isStrongPassword(password) {
    // At least 6 characters, with at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    return passwordRegex.test(password);
}

// Register function
async function register(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess('Registration successful! Please check your email to verify your account.');
            
            // Redirect to login page after 3 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
            
            return true;
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Main verify function
async function verify(event) {
    event.preventDefault();
    
    const fullNameInput = document.getElementById('full-name');
    const usernameInput = document.getElementById('login-name');
    const emailInput = document.getElementById('Email');
    const passwordInput = document.getElementById('login-pass');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const termsCheckbox = document.getElementById('terms');
    const newsletterCheckbox = document.getElementById('newsletter');
    const submitButton = document.querySelector('.login-btn');
    
    const fullName = fullNameInput.value.trim();
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const newsletterSubscription = newsletterCheckbox ? newsletterCheckbox.checked : false;
    
    // Clear previous alerts
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => alert.remove());
    
    // Validation
    if (!fullName || !username || !email || !password || !confirmPassword) {
        showError('Please fill in all required fields');
        return false;
    }
    
    if (fullName.length < 2) {
        showError('Full name must be at least 2 characters long');
        return false;
    }
    
    if (username.length < 3) {
        showError('Username must be at least 3 characters long');
        return false;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return false;
    }
    
    if (!isStrongPassword(password)) {
        showError('Password must be at least 6 characters long and contain both letters and numbers');
        return false;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return false;
    }
    
    if (!termsCheckbox || !termsCheckbox.checked) {
        showError('Please accept the Terms & Conditions');
        return false;
    }
    
    try {
        showLoading(submitButton);
        
        const userData = {
            fullName: fullName,
            username: username,
            email: email,
            password: password,
            newsletterSubscription: newsletterSubscription
        };
        
        await register(userData);
    } catch (error) {
        hideLoading(submitButton);
        showError(error.message || 'Registration failed. Please try again.');
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
    
    // Add password confirmation validation
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordInput = document.getElementById('login-pass');
    
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = passwordInput.value;
            const confirmPassword = this.value;
            
            if (confirmPassword && password !== confirmPassword) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });
    }
});