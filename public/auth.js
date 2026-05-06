// FortiSight Authentication JavaScript - PRODUCTION READY

// ========================================
// CONFIGURATION
// ========================================

// Use relative paths for production deployment
// Works on both local development and production (Render)
const API_BASE = ""; // Empty for relative paths

console.log('🌐 FortiSight Auth Server: Using relative paths for production');

// Handle Login Form Submission
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const errorDiv = document.getElementById('errorMessage');
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Logging in...</span>';
    if (errorDiv) {
        errorDiv.classList.remove('visible');
        errorDiv.style.display = 'none';
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: form.querySelector('#email').value,
                password: form.querySelector('#password').value
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Redirect to dashboard
            window.location.href = result.redirect;
        } else {
            // Show error message
            if (errorDiv) {
                errorDiv.textContent = result.error;
                errorDiv.classList.add('visible');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        if (errorDiv) {
            errorDiv.textContent = 'Network error. Please try again.';
            errorDiv.classList.add('visible');
        }
        }
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Log In</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10,17 15,12 10,7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>';
    }
}

// Handle Signup Form Submission
async function handleSignup(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const errorDiv = document.getElementById('errorMessage');
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Creating account...</span>';
    if (errorDiv) {
        errorDiv.classList.remove('visible');
        errorDiv.style.display = 'none';
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/register`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: form.querySelector('#email').value,
                password: form.querySelector('#password').value,
                confirmPassword: form.querySelector('#confirmPassword').value
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            alert('Account created successfully! Redirecting to dashboard...');
            
            // Redirect to dashboard - STAY OPEN
            setTimeout(() => {
                window.location.href = result.redirect;
            }, 1000);
        } else {
            // Show error message
            if (errorDiv) {
                errorDiv.textContent = result.error;
                errorDiv.classList.add('visible');
            }
        }
    } catch (error) {
        console.error('Signup error:', error);
        if (errorDiv) {
            errorDiv.textContent = 'Network error. Please try again.';
            errorDiv.classList.add('visible');
        }
        }
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Sign Up</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4 4v2H5a4 4 0 00-4 4h-4"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/><line x1="23" y1="11" x2="17" y2="11"/></svg>';
    }
}

// Handle Logout
async function handleLogout() {
    try {
        const response = await fetch(`${API_BASE}/api/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Clear any stored session data
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('userRole');
            
            // Redirect to login page
            window.location.href = result.redirect;
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Fallback redirect
        window.location.href = '/public/login.html';
    }
}

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE}/auth-status`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (!result.authenticated && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html') && !window.location.pathname.includes('register.html')) {
            // Redirect to login if not authenticated and not on auth pages
            window.location.href = '/public/login.html';
        }
    } catch (error) {
        console.error('Auth status check error:', error);
    }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add form submission handlers
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Add input event listeners to hide errors when user starts typing
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (emailInput) {
        emailInput.addEventListener('input', hideErrorMessage);
    }
    if (passwordInput) {
        passwordInput.addEventListener('input', hideErrorMessage);
    }
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', hideErrorMessage);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Check authentication status on page load
    checkAuthStatus();
});
