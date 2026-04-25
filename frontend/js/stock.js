// Check permissions
function hasPermission(action) {
  const role = localStorage.getItem("userRole") || "user";
  const permissions = {
    superadmin: ["add", "edit", "delete", "view", "settings"],
    admin: ["add", "edit", "delete", "view"],
    user: ["view"]
  };
  return permissions[role] && permissions[role].includes(action);
}

async function loadMaterials() {
  try {
    const res = await fetch(API_BASE + "/materials");
    if (!res.ok) throw new Error("Failed to load materials");
    const data = await res.json();

    const select = document.getElementById("material");
    select.innerHTML = '<option value="">-- Select Material --</option>';

    data.forEach((m) => {
      select.innerHTML += `<option value="${m.id}">${m.material_name}</option>`;
    });
  } catch (error) {
    console.error("Materials loading error:", error);
    alert("Failed to load materials. Make sure the backend is running.");
  }
}

async function stockIn() {
  if (!hasPermission("add")) {
    alert("You don't have permission to record stock movements");
    return;
  }

  const materialId = document.getElementById("material").value;
  const quantity = document.getElementById("qty").value;

  if (!materialId || !quantity) {
    alert("Please select a material and enter quantity");
    return;
  }

  try {
    const res = await fetch(API_BASE + "/stock-movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        material_id: parseInt(materialId),
        movement_type: "IN",
        quantity: parseFloat(quantity),
        remarks: "Stock received"
      })
    });

    const result = await res.json();
    if (res.ok) {
      alert("Stock In recorded successfully");
      document.getElementById("qty").value = "";
      document.getElementById("material").value = "";
    } else {
      alert(result.message || "Failed to record stock in");
    }
  } catch (error) {
    console.error("Stock In error:", error);
    alert("Backend server not running");
  }
}

async function stockOut() {
  if (!hasPermission("add")) {
    alert("You don't have permission to record stock movements");
    return;
  }

  const materialId = document.getElementById("material").value;
  const quantity = document.getElementById("qty").value;

  if (!materialId || !quantity) {
    alert("Please select a material and enter quantity");
    return;
  }

  try {
    const res = await fetch(API_BASE + "/stock-movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        material_id: parseInt(materialId),
        movement_type: "OUT",
        quantity: parseFloat(quantity),
        remarks: "Stock issued"
      })
    });

    const result = await res.json();
    if (res.ok) {
      alert("Stock Out recorded successfully");
      document.getElementById("qty").value = "";
      document.getElementById("material").value = "";
    } else {
      alert(result.message || "Failed to record stock out");
    }
  } catch (error) {
    console.error("Stock Out error:", error);
    alert("Backend server not running");
  }
}

loadMaterials();
