async function loadMaterials() {
  try {
    const res = await fetch(API_BASE + "/materials");
    if (!res.ok) throw new Error("Failed to load materials");
    const data = await res.json();

    const tbody = document.getElementById("materialsTable");
    tbody.innerHTML = "";

    if (data.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;">No materials found</td></tr>';
      return;
    }

    data.forEach((m) => {
      let status = "stock";
      if (m.quantity <= 0) status = "out";
      else if (m.quantity <= m.min_stock) status = "low";

      tbody.innerHTML += `
        <tr>
          <td>${m.material_name}</td>
          <td>${m.material_type}</td>
          <td>${m.quantity}</td>
          <td>₹${m.unit_price}</td>
          <td><span class="badge ${status}">${status}</span></td>
          <td class="action-buttons">
            <button class="edit-btn" onclick="editMaterial(${m.id})" title="Edit">✏️</button>
            <button class="delete-btn" onclick="deleteMaterial(${m.id}, '${m.material_name}')" title="Delete">🗑️</button>
          </td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Materials loading error:", error);
    document.getElementById("materialsTable").innerHTML =
      '<tr><td colspan="6" style="text-align:center; color:red;">Failed to load materials. Make sure the backend is running.</td></tr>';
  }
}

function editMaterial(materialId) {
  // Check permission
  const role = localStorage.getItem("userRole") || "user";
  if (role === "user") {
    alert("You don't have permission to edit materials. Only admins can edit.");
    return;
  }
  
  // Redirect to edit page with material ID as query parameter
  window.location.href = `edit-material.html?id=${materialId}`;
}

async function deleteMaterial(materialId, materialName) {
  // Check permission
  const role = localStorage.getItem("userRole") || "user";
  if (role === "user") {
    alert("You don't have permission to delete materials. Only admins can delete.");
    return;
  }
  
  if (!confirm(`Are you sure you want to delete "${materialName}"?`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/materials/${materialId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete material');
    }
    
    alert('Material deleted successfully!');
    loadMaterials(); // Reload the table
  } catch (error) {
    console.error('Delete error:', error);
    alert('Error deleting material: ' + error.message);
  }
}

loadMaterials();
