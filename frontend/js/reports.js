let reportData = [];

async function generateReport() {
  const month = document.getElementById("reportMonth").value;
  const monthText = document.getElementById("selectedMonthText");

  if (month) {
    monthText.innerText = month;
  } else {
    monthText.innerText = "Current Month";
  }

  const res = await fetch(`${API_BASE}/materials`);
  const materials = await res.json();

  reportData = materials;

  let totalMaterials = materials.length;
  let totalValue = 0;
  let lowStock = 0;
  let outStock = 0;

  const tbody = document.getElementById("reportTable");
  tbody.innerHTML = "";

  materials.forEach((m) => {
    const value = Number(m.quantity) * Number(m.unit_price);
    totalValue += value;

    let status = "In Stock";
    let badgeClass = "stock";

    if (m.quantity <= 0) {
      status = "Out of Stock";
      badgeClass = "out";
      outStock++;
    } else if (m.quantity <= m.min_stock) {
      status = "Low Stock";
      badgeClass = "low";
      lowStock++;
    }

    tbody.innerHTML += `
      <tr>
        <td>${m.material_name}</td>
        <td>${m.material_type}</td>
        <td>${m.quantity}</td>
        <td>${m.min_stock}</td>
        <td>₹${m.unit_price}</td>
        <td>₹${value.toFixed(2)}</td>
        <td><span class="badge ${badgeClass}">${status}</span></td>
      </tr>
    `;
  });

  document.getElementById("totalMaterials").innerText = totalMaterials;
  document.getElementById("totalValue").innerText = "₹" + totalValue.toFixed(2);
  document.getElementById("lowStock").innerText = lowStock;
  document.getElementById("outStock").innerText = outStock;
}

function exportCSV() {
  if (reportData.length === 0) {
    alert("Generate report first");
    return;
  }

  let csv = "Material,Type,Quantity,Min Stock,Unit Price,Total Value,Status\n";

  reportData.forEach((m) => {
    let status = "In Stock";
    if (m.quantity <= 0) status = "Out of Stock";
    else if (m.quantity <= m.min_stock) status = "Low Stock";

    let total = Number(m.quantity) * Number(m.unit_price);

    csv += `${m.material_name},${m.material_type},${m.quantity},${m.min_stock},${m.unit_price},${total},${status}\n`;
  });

  downloadFile(csv, "monthly_inventory_report.csv", "text/csv");
}

function exportExcel() {
  exportCSV();
}

function exportPDF() {
  window.print();
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

generateReport();
