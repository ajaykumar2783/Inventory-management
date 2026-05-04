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

// Redirect if user doesn't have edit permission
function checkEditPermission() {
  if (!hasPermission("edit")) {
    alert(
      "You don't have permission to edit materials. Please contact an administrator.",
    );
    window.location.href = "materials.html";
    return false;
  }
  return true;
}

// Get material ID from URL query parameter
function getMaterialIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    alert("No material ID provided");
    window.location.href = "materials.html";
    return null;
  }
  return parseInt(id);
}

// Load material data
async function loadMaterial() {
  const materialId = getMaterialIdFromURL();
  if (!materialId) return;

  try {
    const res = await fetch(`${API_BASE}/materials/${materialId}`);
    if (!res.ok) throw new Error("Failed to load material");
    const material = await res.json();

    // Populate form with material data
    document.getElementById("material_name").value = material.material_name || "";
    document.getElementById("material_type").value = material.material_type || "";
    document.getElementById("unit").value = material.unit || "";
    document.getElementById("quantity").value = material.quantity || 0;
    document.getElementById("min_stock").value = material.min_stock || 0;
    document.getElementById("unit_price").value = material.unit_price || 0;
    document.getElementById("supplier_id").value = material.supplier_id || "";
    document.getElementById("remarks").value = material.remarks || "";
  } catch (error) {
    console.error("Material loading error:", error);
    alert("Failed to load material. Please try again.");
    window.location.href = "materials.html";
  }
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
    if (!hasPermission("edit")) {
      alert("You don't have permission to edit materials");
      return;
    }

    // Get material ID
    const materialId = getMaterialIdFromURL();
    if (!materialId) return;

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
      const res = await fetch(`${API_BASE}/materials/${materialId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Product updated successfully");
        window.location.href = "materials.html";
      } else {
        alert(result.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating product: " + error.message);
    }
  });

// Load suppliers and material data when page loads
window.addEventListener("load", function () {
  if (checkEditPermission()) {
    loadSuppliers();
    loadMaterial();
  }
});
