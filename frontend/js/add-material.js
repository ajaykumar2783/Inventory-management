// Check permissions
function hasPermission(action) {
  const role = localStorage.getItem("userRole") || "user";
  const permissions = {
    superadmin: ["add", "edit", "delete", "view", "settings"],
    admin: ["add", "edit", "delete", "view"],
    user: ["view"],
  };
  return permissions[role] && permissions[role].includes(action);
}

// Redirect if user doesn't have add permission
function checkAddPermission() {
  if (!hasPermission("add")) {
    alert(
      "You don't have permission to add materials. Please contact an administrator.",
    );
    window.location.href = "materials.html";
    return false;
  }
  return true;
}

async function loadSuppliers() {
  const select = document.getElementById("supplier_id");

  try {
    const res = await fetch(`${API_BASE}/suppliers`);
    if (!res.ok) throw new Error("Failed to load suppliers");
    const suppliers = await res.json();

    select.innerHTML = '<option value="">-- Select Supplier --</option>';
    suppliers.forEach((s) => {
      select.innerHTML += `
        <option value="${s.id}">${s.supplier_name}</option>
      `;
    });
  } catch (error) {
    console.error("Supplier loading error:", error);
    select.innerHTML = '<option value="">Failed to load suppliers</option>';
  }
}

document
  .getElementById("materialForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Check permission
    if (!hasPermission("add")) {
      alert("You don't have permission to add materials");
      return;
    }

    // Validation
    const material_name = document.getElementById("material_name").value.trim();
    const quantity = parseFloat(document.getElementById("quantity").value);
    const unit_price = parseFloat(document.getElementById("unit_price").value);

    if (!material_name) {
      alert("Please enter material name");
      return;
    }

    if (isNaN(quantity) || quantity < 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (isNaN(unit_price) || unit_price < 0) {
      alert("Please enter a valid unit price");
      return;
    }

    const data = {
      material_name: material_name,
      material_type: document.getElementById("material_type").value,
      unit: document.getElementById("unit").value,
      quantity: quantity,
      min_stock: parseFloat(document.getElementById("min_stock").value),
      unit_price: unit_price,
      supplier_id: document.getElementById("supplier_id").value || null,
      remarks: document.getElementById("remarks").value,
    };

    try {
      const res = await fetch(`${API_BASE}/materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Product added successfully");
        window.location.href = "materials.html";
      } else {
        alert(result.message || "Failed to add product");
      }
    } catch (error) {
      alert("Backend server not running");
      console.error(error);
    }
  });

// Check permission on page load
if (!checkAddPermission()) {
  document.getElementById("materialForm").style.display = "none";
}

loadSuppliers();
