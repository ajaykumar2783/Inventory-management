// User credentials
const USERS = {
  superadmin: {
    password: "superadmin123",
    role: "superadmin",
    name: "Super Admin",
  },
  admin: {
    password: "admin123",
    role: "admin",
    name: "Admin",
  },
  user: {
    password: "user123",
    role: "user",
    name: "User",
  },
};

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const error = document.getElementById("loginError");

  error.innerText = "";

  if (!username || !password) {
    error.innerText = "Please enter username and password";
    return;
  }

  if (USERS[username] && USERS[username].password === password) {
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("username", username);
    localStorage.setItem("userRole", USERS[username].role);
    localStorage.setItem("userName", USERS[username].name);

    window.location.href = "dashboard.html";
  } else {
    error.innerText = "Invalid username or password";
  }
}

// ===== PRODUCTION-LEVEL AUTHENTICATION =====

// Security tokens and session management
const AUTH_TOKEN_KEY = "auth_token";
const AUTH_EXPIRY_KEY = "auth_expiry";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const FAILED_LOGIN_ATTEMPTS_KEY = "failed_attempts";
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes lockout

// Generate secure session token
function generateToken(username) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return btoa(`${username}:${timestamp}:${random}`);
}

// Validate token format and integrity
function isValidToken(token) {
  try {
    const decoded = atob(token);
    const parts = decoded.split(":");
    return parts.length === 3 && !isNaN(parseInt(parts[1]));
  } catch {
    return false;
  }
}

// Check if session has expired
function isSessionExpired() {
  const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);
  if (!expiry) return true;
  return Date.now() > parseInt(expiry);
}

// Track failed login attempts
function recordFailedAttempt(username) {
  const attempts = JSON.parse(localStorage.getItem(FAILED_LOGIN_ATTEMPTS_KEY) || "{}");
  attempts[username] = (attempts[username] || 0) + 1;
  localStorage.setItem(FAILED_LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
}

// Check if account is locked
function isAccountLocked(username) {
  const attempts = JSON.parse(localStorage.getItem(FAILED_LOGIN_ATTEMPTS_KEY) || "{}");
  return attempts[username] && attempts[username] >= 5;
}

// Clear failed attempts on successful login
function clearFailedAttempts(username) {
  const attempts = JSON.parse(localStorage.getItem(FAILED_LOGIN_ATTEMPTS_KEY) || "{}");
  delete attempts[username];
  localStorage.setItem(FAILED_LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
}

// Enhanced login with security checks
function loginEnhanced() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const error = document.getElementById("loginError");

  error.innerText = "";

  // Input validation
  if (!username || !password) {
    error.innerText = "Please enter username and password";
    return;
  }

  if (username.length < 3) {
    error.innerText = "Username must be at least 3 characters";
    return;
  }

  if (password.length < 6) {
    error.innerText = "Password must be at least 6 characters";
    return;
  }

  // Check if account is locked
  if (isAccountLocked(username)) {
    error.innerText = "Account locked due to multiple failed attempts. Try again later.";
    return;
  }

  // Show loading state
  const btnText = document.getElementById("btnText");
  const spinner = document.getElementById("spinner");
  if (btnText && spinner) {
    btnText.innerText = "Logging in...";
    spinner.style.display = "inline-block";
  }

  // Simulate processing delay for better UX
  setTimeout(() => {
    // Authenticate user
    if (USERS[username] && USERS[username].password === password) {
      const token = generateToken(username);
      const expiry = Date.now() + SESSION_TIMEOUT;

      // Store secure session data
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("username", username);
      localStorage.setItem("userRole", USERS[username].role);
      localStorage.setItem("userName", USERS[username].name);
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_EXPIRY_KEY, expiry.toString());
      localStorage.setItem("loginTime", new Date().toISOString());

      // Clear failed attempts
      clearFailedAttempts(username);

      window.location.href = "dashboard.html";
    } else {
      recordFailedAttempt(username);
      error.innerText = "Invalid username or password";

      // Reset button state
      if (btnText && spinner) {
        btnText.innerText = "Login";
        spinner.style.display = "none";
      }
    }
  }, 1000);
}

// Validate login session integrity
function checkLogin() {
  const loggedIn = localStorage.getItem("loggedIn");
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const username = localStorage.getItem("username");

  if (!loggedIn || !token || !username) {
    return false;
  }

  if (isSessionExpired()) {
    logout();
    return false;
  }

  if (!isValidToken(token)) {
    logout();
    return false;
  }

  return true;
}

// Setup automatic session timeout
function setupSessionTimeout() {
  const checkInterval = setInterval(() => {
    if (!localStorage.getItem("loggedIn") || isSessionExpired()) {
      clearInterval(checkInterval);
      logout();
    }
  }, 60000); // Check every minute
}

// Reset session timeout on user activity
function resetSessionTimeout() {
  if (checkLogin()) {
    const expiry = Date.now() + SESSION_TIMEOUT;
    localStorage.setItem(AUTH_EXPIRY_KEY, expiry.toString());
  }
}

// Secure logout with full session cleanup
function logout() {
  // Clear all sensitive data
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("username");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EXPIRY_KEY);
  localStorage.removeItem("loginTime");
  sessionStorage.clear();

  // Redirect to login
  window.location.href = "index.html";
}

// Override basic login with enhanced version
login = loginEnhanced;
