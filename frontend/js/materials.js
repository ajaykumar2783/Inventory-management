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
        </tr>
      `;
    });
  } catch (error) {
    console.error("Materials loading error:", error);
    document.getElementById("materialsTable").innerHTML =
      '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load materials. Make sure the backend is running.</td></tr>';
  }
}

loadMaterials();
