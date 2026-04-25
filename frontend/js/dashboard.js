let charts = {};
let allMaterials = []; // Store all materials for search

// Get current user role
function getUserRole() {
  return localStorage.getItem("userRole") || "user";
}

function getUserName() {
  return localStorage.getItem("userName") || localStorage.getItem("username") || "User";
}

// Check user permissions
function hasPermission(action) {
  const role = getUserRole();
  const permissions = {
    superadmin: ["add", "edit", "delete", "view", "settings"],
    admin: ["add", "edit", "delete", "view"],
    user: ["view"]
  };
  return permissions[role] && permissions[role].includes(action);
}

// Show/hide elements based on role
function applyRoleBasedAccess() {
  const role = getUserRole();
  const userName = getUserName();
  
  // Update user information in sidebar and topbar
  updateUserInfo();
  
  // Hide add buttons for user role
  if (role === "user") {
    document.querySelectorAll(".add-btn, .quick-card").forEach(el => {
      if (el.textContent.includes("New") || el.textContent.includes("Add")) {
        el.style.display = "none";
      }
    });
  }
}

// Update user display info
function updateUserInfo() {
  const userName = getUserName();
  const userRole = getUserRole();
  const roleDisplay = {
    superadmin: "Super Admin",
    admin: "Administrator",
    user: "User"
  };
  
  // Update avatar
  const avatar = document.getElementById("userAvatar");
  if (avatar) {
    avatar.textContent = userName.charAt(0).toUpperCase();
  }
  
  // Update user name
  const userNameEl = document.getElementById("userName");
  if (userNameEl) {
    userNameEl.textContent = userName;
  }
  
  // Update user role
  const userRoleEl = document.getElementById("userRole");
  if (userRoleEl) {
    userRoleEl.textContent = (roleDisplay[userRole] || "User") + " • Online";
  }
  
  // Update welcome message
  const welcomeMsg = document.getElementById("welcomeMsg");
  if (welcomeMsg) {
    welcomeMsg.textContent = `Welcome back, ${userName}! 👋 Here's today's inventory overview.`;
  }
}

async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error("Failed to load dashboard data");
    const data = await res.json();

    document.getElementById("dashboardCards").innerHTML = `
      <div class="stat-card">
        <div class="stat-icon blue">📦</div>
        <div>
          <p>Total Products</p>
          <h2>${data.total_materials}</h2>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">💰</div>
        <div>
          <p>Total Stock Value</p>
          <h2>₹${data.total_stock_value}</h2>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">⚠</div>
        <div>
          <p>Low Stock Items</p>
          <h2>${data.low_stock_count}</h2>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon purple">🧾</div>
        <div>
          <p>Out of Stock</p>
          <h2>${data.out_of_stock_count}</h2>
        </div>
      </div>
    `;

    // Load product table
    loadProductTable(data);
    
    // Load recent activities
    loadRecentActivities(data.recent_movements);

    createStockChart(data.material_names, data.material_quantities);
    createStatusChart(data.stock_status_summary);
  } catch (error) {
    console.error("Dashboard loading error:", error);
    document.getElementById("dashboardCards").innerHTML = '<div style="color:red; text-align:center; padding:20px;">Failed to load dashboard. Make sure the backend is running.</div>';
  }
}

function loadProductTable(data) {
  const tbody = document.getElementById("productTableBody");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  if (!data.material_names || data.material_names.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No products available</td></tr>';
    return;
  }

  for (let i = 0; i < data.material_names.length; i++) {
    let status = "stock";
    if (data.material_quantities[i] <= 0) status = "out";
    else if (data.material_quantities[i] <= 10) status = "low"; // assuming min_stock is 10 for display

    tbody.innerHTML += `
      <tr>
        <td>${data.material_names[i]}</td>
        <td>Material</td>
        <td>${data.material_quantities[i]}</td>
        <td>₹${data.material_values[i]}</td>
        <td><span class="badge ${status}">${status}</span></td>
      </tr>
    `;
  }
}

function loadRecentActivities(movements) {
  const activityList = document.getElementById("activityList");
  if (!activityList) return;
  
  activityList.innerHTML = "";
  
  if (!movements || movements.length === 0) {
    activityList.innerHTML = '<li style="text-align:center;">No recent activities</li>';
    return;
  }

  movements.forEach((m) => {
    activityList.innerHTML += `
      <li>
        <strong>${m.material_name}</strong>
        <span>${m.movement_type}</span>
        <small>${m.created_at}</small>
      </li>
    `;
  });
}

function createStockChart(labels, values) {
  const canvas = document.getElementById("stockChart");
  if (!canvas) {
    console.log("stockChart canvas not found");
    return;
  }

  if (charts.stockChart) {
    charts.stockChart.destroy();
  }

  charts.stockChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Stock Quantity",
          data: values,
          backgroundColor: "#6366f1",
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function createStatusChart(statusSummary) {
  const canvas = document.getElementById("statusChart");
  if (!canvas) {
    console.log("statusChart canvas not found");
    return;
  }

  if (charts.statusChart) {
    charts.statusChart.destroy();
  }

  charts.statusChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: Object.keys(statusSummary),
      datasets: [
        {
          data: Object.values(statusSummary),
          backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

document.getElementById("refreshBtn")?.addEventListener("click", loadDashboard);

// Apply role-based access when page loads
applyRoleBasedAccess();
loadDashboard();
