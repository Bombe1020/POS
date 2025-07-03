// Clock
setInterval(() => {
  const clock = document.getElementById("adminClock");
  if (clock) clock.textContent = new Date().toLocaleString();
}, 1000);

// Theme toggle
function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const mode = document.documentElement.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", mode);
}
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
}

// Animate stat count
function animateCount(id, target, prefix = "R") {
  const el = document.getElementById(id);
  let start = 0;
  const step = Math.ceil(target / 30);
  const interval = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = `${prefix}${target.toFixed(2)}`;
      clearInterval(interval);
    } else {
      el.textContent = `${prefix}${start.toFixed(0)}…`;
    }
  }, 20);
}

// Load dashboard
function loadDashboard() {
  const reports = JSON.parse(localStorage.getItem("dayEndReports") || "[]");
  let cash = 0, card = 0;
  const tbody = document.getElementById("reportTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";
  reports.reverse().forEach((r, index) => {
  cash += r.cashCount;
  card += r.cardTotal;
  
  const cashierSelect = document.getElementById("filterCashier");
const uniqueCashiers = [...new Set(reports.map(r => r.cashier))];
cashierSelect.innerHTML = `<option value="">All</option>` + uniqueCashiers.map(name =>
  `<option value="${name}">${name}</option>`
).join("");


  const row = document.createElement("tr");
  row.className = "border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer";
  row.setAttribute("onclick", `showNotes(${index})`);

  row.innerHTML = `
    <td class="py-2">${r.timestamp}</td>
    <td class="py-2">R${r.cashCount.toFixed(2)}</td>
    <td class="py-2">R${r.cardTotal.toFixed(2)}</td>
    <td class="py-2">R${r.totalInRegister.toFixed(2)}</td>
    <td class="py-2">${r.cashier || '–'}</td>
    <td class="py-2 text-center" onclick="event.stopPropagation(); showNotes(${index})">🛈</td>
 `;


  tbody.appendChild(row);
});


  animateCount("dashCash", cash);
  animateCount("dashCard", card);
  document.getElementById("dashReports").textContent = reports.length;
  document.getElementById("lastReport").textContent = reports[0]?.timestamp || "–";

  loadChart(reports.slice(0, 7).reverse());
}

function applyReportFilters() {
  const start = new Date(document.getElementById("filterStart").value);
  const end = new Date(document.getElementById("filterEnd").value);
  const selectedCashier = document.getElementById("filterCashier").value;

  const all = JSON.parse(localStorage.getItem("dayEndReports") || "[]");

  const filtered = all.filter(r => {
    const date = new Date(r.timestamp);
    const inRange = (!isNaN(start) ? date >= start : true) && (!isNaN(end) ? date <= end : true);
    const cashierMatch = selectedCashier ? r.cashier === selectedCashier : true;
    return inRange && cashierMatch;
  });

  renderReportTable(filtered);
  renderChart(filtered.slice(-7));
}

function renderReportTable(data) {
  const tbody = document.getElementById("reportTableBody");
  tbody.innerHTML = "";
  data.reverse().forEach((r, index) => {
    const row = document.createElement("tr");
    row.className = "border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer";
    row.setAttribute("onclick", `showNotes(${index}, true)`);

    row.innerHTML = `
      <td class="py-2">${r.timestamp}</td>
      <td class="py-2">R${r.cashCount.toFixed(2)}</td>
      <td class="py-2">R${r.cardTotal.toFixed(2)}</td>
      <td class="py-2">R${r.totalInRegister.toFixed(2)}</td>
      <td class="py-2">${r.cashier || '–'}</td>
      <td class="py-2 text-center" onclick="event.stopPropagation(); showNotes(${index}, true)">🛈</td>
    `;
    tbody.appendChild(row);
  });
}


// Chart
function loadChart(data) {
  const ctx = document.getElementById("salesChart");
  const labels = data.map(r => r.timestamp.split(",")[0]);
  const values = data.map(r => r.cashCount + r.cardTotal);

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Revenue",
        data: values,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0. 7)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1f2937",
          titleFont: { weight: "bold" },
          callbacks: {
            label: context => ` R${context.parsed.y.toFixed(2)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: val => `R${val}`
          }
        }
      }
    }
  });
}

// Load everything
loadDashboard();
function showNotes(index, isFiltered = false) {
  const data = JSON.parse(localStorage.getItem("dayEndReports") || "[]");
  const list = isFiltered ? [...document.querySelectorAll("#reportTableBody tr")].reverse().map(row => {
    const [timestamp] = row.querySelectorAll("td");
    return data.find(r => r.timestamp === timestamp.textContent);
  }) : data;

  const report = list[index];
  document.getElementById("notesContent").textContent = `🧑‍💼 Cashier: ${report.cashier || "–"}\n\n${report.notes || "No notes"}`;
  document.getElementById("notesModal").classList.remove("hidden");
  document.getElementById("notesModal").classList.add("flex");
}


function closeNotesModal() {
  document.getElementById("notesModal").classList.add("hidden");
  document.getElementById("notesModal").classList.remove("flex");
}

function clearAllReports() {
  if (confirm("⚠️ Are you sure you want to delete all saved reports?")) {
    localStorage.removeItem("dayEndReports");
    loadDashboard(); // Refreshes the UI
  }
}

function showSection(section) {
  const dash = document.getElementById("dashboardSection");
  const reports = document.getElementById("reportsSection");

  if (section === "dashboard") {
    dash.classList.remove("hidden");
    reports.classList.add("hidden");
  } else {
    dash.classList.add("hidden");
    reports.classList.remove("hidden");
  }
}

function logoutAdmin() {
  window.location.href = "index.html"; // or your preferred landing/login page
}

