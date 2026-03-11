// Emoji indicator functions
function initializeEmojiIndicators() {
  // Login email field
  const loginEmail = document.getElementById('loginEmail');
  const loginEmailEmoji = document.getElementById('loginEmailEmoji');
  
  if (loginEmail && loginEmailEmoji) {
    loginEmail.addEventListener('focus', () => {
      loginEmailEmoji.textContent = '😊';
      loginEmailEmoji.classList.remove('typing', 'success', 'error');
      loginEmail.classList.remove('success-glow', 'error-glow');
    });
    
    loginEmail.addEventListener('blur', () => {
      loginEmailEmoji.classList.remove('typing');
      if (loginEmail.value.length > 0) {
        loginEmailEmoji.textContent = '😌';
      } else {
        loginEmailEmoji.textContent = '😊';
      }
    });
    
    loginEmail.addEventListener('input', () => {
      loginEmailEmoji.textContent = '😵';
      loginEmailEmoji.classList.add('typing');
      loginEmailEmoji.classList.remove('success', 'error');
      
      setTimeout(() => {
        loginEmailEmoji.classList.remove('typing');
        loginEmailEmoji.textContent = '😌';
      }, 1000);
    });
  }

  // Login password field
  const loginPassword = document.getElementById('loginPassword');
  const loginEmoji = document.getElementById('loginEmoji');
  
  if (loginPassword && loginEmoji) {
    let typingTimer;
    
    loginPassword.addEventListener('focus', () => {
      loginEmoji.textContent = '😊';
      loginEmoji.classList.remove('typing', 'success', 'error');
      loginPassword.classList.remove('success-glow', 'error-glow');
    });
    
    loginPassword.addEventListener('blur', () => {
      loginEmoji.classList.remove('typing');
      if (loginPassword.value.length > 0) {
        loginEmoji.textContent = '😌';
      } else {
        loginEmoji.textContent = '😊';
      }
    });
    
    loginPassword.addEventListener('input', () => {
      clearTimeout(typingTimer);
      loginEmoji.textContent = '😵';
      loginEmoji.classList.add('typing');
      loginEmoji.classList.remove('success', 'error');
      
      typingTimer = setTimeout(() => {
        loginEmoji.classList.remove('typing');
        loginEmoji.textContent = '😌';
      }, 1000);
    });
  }
  
  // Register password field
  const registerPassword = document.getElementById('password');
  const registerEmoji = document.getElementById('registerEmoji');
  
  if (registerPassword && registerEmoji) {
    let typingTimer;
    
    registerPassword.addEventListener('focus', () => {
      registerEmoji.textContent = '😊';
      registerEmoji.classList.remove('typing', 'success', 'error');
      registerPassword.classList.remove('success-glow', 'error-glow');
    });
    
    registerPassword.addEventListener('blur', () => {
      registerEmoji.classList.remove('typing');
      if (registerPassword.value.length > 0) {
        registerEmoji.textContent = '😌';
      } else {
        registerEmoji.textContent = '😊';
      }
    });
    
    registerPassword.addEventListener('input', () => {
      clearTimeout(typingTimer);
      registerEmoji.textContent = '😵';
      registerEmoji.classList.add('typing');
      registerEmoji.classList.remove('success', 'error');
      
      typingTimer = setTimeout(() => {
        registerEmoji.classList.remove('typing');
        registerEmoji.textContent = '😌';
      }, 1000);
    });
  }
}

// Show emoji feedback
function showEmojiFeedback(emojiId, inputId, feedback) {
  const emoji = document.getElementById(emojiId);
  const input = document.getElementById(inputId);
  if (!emoji || !input) return;
  
  // Remove all classes first
  emoji.className = 'emoji';
  input.className = '';
  
  // Add feedback class with animation
  emoji.classList.add(feedback);
  
  if (feedback === 'success') {
    emoji.textContent = '😄';
    input.classList.add('success-glow');
  } else if (feedback === 'error') {
    emoji.textContent = '😢';
    input.classList.add('error-glow');
  }
  
  // Reset after showing feedback
  setTimeout(() => {
    if (feedback === 'success') {
      emoji.textContent = '😌';
      emoji.className = 'emoji';
      input.classList.remove('success-glow');
    } else if (feedback === 'error') {
      emoji.textContent = '😊';
      emoji.className = 'emoji';
      input.classList.remove('error-glow');
    }
  }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeEmojiIndicators);

// Get users from localStorage
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

// Save users
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// Register
function registerUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  if (!email || !password) {
    message.textContent = "Please fill all fields!";
    showEmojiFeedback('registerEmoji', 'password', 'error');
    return;
  }

  let users = getUsers();

  // Check if user exists
  const userExists = users.find(user => user.email === email);
  if (userExists) {
    message.textContent = "Account already exists!";
    showEmojiFeedback('registerEmoji', 'password', 'error');
    return;
  }

  users.push({ email, password });
  saveUsers(users);

  message.textContent = "Account created successfully!";
  showEmojiFeedback('registerEmoji', 'password', 'success');
  
  setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);
}

// Login
function loginUser() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const message = document.getElementById("loginMessage");

  if (!email || !password) {
    message.textContent = "Please fill all fields!";
    showEmojiFeedback('loginEmailEmoji', 'loginEmail', 'error');
    showEmojiFeedback('loginEmoji', 'loginPassword', 'error');
    return;
  }

  let users = getUsers();

  const validUser = users.find(
    user => user.email === email && user.password === password
  );

  if (validUser) {
    localStorage.setItem("loggedInUser", email);
    showEmojiFeedback('loginEmailEmoji', 'loginEmail', 'success');
    showEmojiFeedback('loginEmoji', 'loginPassword', 'success');
    
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);
  } else {
    message.textContent = "Invalid email or password!";
    showEmojiFeedback('loginEmailEmoji', 'loginEmail', 'error');
    showEmojiFeedback('loginEmoji', 'loginPassword', 'error');
  }
}

// Protect dashboard
if (window.location.pathname.includes("dashboard.html")) {
  const loggedInUser = localStorage.getItem("loggedInUser");

  if (!loggedInUser) {
    window.location.href = "login.html";
  } else {
    document.getElementById("welcomeText").textContent =
      "Welcome, " + loggedInUser;
  }
}

// Logout
function logoutUser() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}
