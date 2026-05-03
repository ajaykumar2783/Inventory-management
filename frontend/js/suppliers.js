let suppliers = [];
let editId = null;
let currentPage = 1;
const perPage = 5;

async function loadSuppliers() {
  const res = await fetch(API_BASE + "/suppliers");
  suppliers = await res.json();
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById("supplierTable");
  const search = document.getElementById("searchInput").value.toLowerCase();

  let filtered = suppliers.filter((s) =>
    s.supplier_name.toLowerCase().includes(search),
  );

  const start = (currentPage - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);

  tbody.innerHTML = "";

  paginated.forEach((s) => {
    tbody.innerHTML += `
      <tr>
        <td>${s.supplier_name}</td>
        <td>${s.contact}</td>
        <td>
          <button class="edit" onclick="editSupplier(${s.id})">Edit</button>
          <button class="delete" onclick="deleteSupplier(${s.id})">Delete</button>
        </td>
      </tr>
    `;
  });

  renderPagination(filtered.length);
}

function renderPagination(total) {
  const pages = Math.ceil(total / perPage);
  let html = "";

  for (let i = 1; i <= pages; i++) {
    html += `<button onclick="goPage(${i})">${i}</button>`;
  }

  document.getElementById("pagination").innerHTML = html;
}

function goPage(p) {
  currentPage = p;
  renderTable();
}

/* MODAL */
function openModal() {
  document.getElementById("supplierModal").style.display = "flex";
  editId = null;
}

function closeModal() {
  document.getElementById("supplierModal").style.display = "none";
}

async function saveSupplier() {
  const name = document.getElementById("supplierName").value;
  const contact = document.getElementById("supplierContact").value;

  if (!name || !contact) return alert("Fill all fields");

  if (editId) {
    await fetch(`${API_BASE}/suppliers/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplier_name: name, contact }),
    });
  } else {
    await fetch(API_BASE + "/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplier_name: name, contact }),
    });
  }

  closeModal();
  loadSuppliers();
}

function editSupplier(id) {
  const s = suppliers.find((x) => x.id === id);

  document.getElementById("supplierName").value = s.supplier_name;
  document.getElementById("supplierContact").value = s.contact;

  editId = id;
  openModal();
}

async function deleteSupplier(id) {
  if (!confirm("Delete supplier?")) return;

  await fetch(`${API_BASE}/suppliers/${id}`, { method: "DELETE" });
  loadSuppliers();
}

document.getElementById("searchInput").addEventListener("input", renderTable);

loadSuppliers();
