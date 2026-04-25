const AUTH_API = "http://127.0.0.1:5000/api";

async function checkAuth() {
  try {
    const res = await fetch(`${AUTH_API}/me`, {
      credentials: "include",
    });

    if (!res.ok) {
      window.location.href = "login.html";
      return;
    }

    const user = await res.json();
    localStorage.setItem("userRole", user.role);
    localStorage.setItem("userName", user.username);
  } catch (error) {
    window.location.href = "login.html";
  }
}

async function logout() {
  await fetch(`${AUTH_API}/logout`, {
    method: "POST",
    credentials: "include",
  });

  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "login.html";
}
