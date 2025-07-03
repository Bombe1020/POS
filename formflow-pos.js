// 🛒 Cart State
const cart = [];

// ⏳ Clock
setInterval(() => {
  const t = new Date().toLocaleTimeString();
  document.getElementById("clock").textContent = t;
}, 1000);

// 🌓 Theme Toggle
const toggleDarkMode = () => {
  document.body.classList.toggle("dark");
  document.documentElement.classList.toggle("dark");
};

// 🛍️ Cart Manipulation
const addToCart = (product) => {
  const existing = cart.findIndex(i => i.name === product.name);
  if (existing >= 0) {
    cart[existing].qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCart();
};

const removeFromCart = (index) => {
  cart.splice(index, 1);
  updateCart();
};

const changeQty = (index, delta) => {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  updateCart();
};

// 🧾 Update Cart + Receipt + Summary
const updateCart = () => {
  const cartItems = document.getElementById("cartItems");
  const receiptItems = document.getElementById("receiptItems");
  const totalAmount = document.getElementById("totalAmount");

  cartItems.innerHTML = "";
  receiptItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="text-gray-400">No items yet.</p>';
    totalAmount.textContent = "R0.00";
    ["subTotalText", "taxText", "receiptTotal", "summarySubtotal", "summaryTax", "summaryTotal", "receiptTimestamp"].forEach(id => {
      document.getElementById(id).textContent = "R0.00";
    });
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    const div = document.createElement("div");
    div.className = "flex justify-between border-b pb-2 items-center";

    div.innerHTML = `
      <div>
        <div class="font-medium">${item.name}</div>
        <div class="text-xs text-gray-500 dark:text-gray-300 flex items-center gap-2 mt-1">
          <button onclick="changeQty(${index}, -1)" class="bg-white border border-gray-300 text-gray-800 dark:text-gray-900 px-2 rounded shadow-sm">–</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${index}, 1)" class="bg-white border border-gray-300 text-gray-800 dark:text-gray-900 px-2 rounded shadow-sm">+</button>
        </div>
      </div>
      <div class="text-right">
        <div>R${itemTotal.toFixed(2)}</div>
        <button class="text-xs text-red-500 hover:underline" onclick="removeFromCart(${index})">Void</button>
      </div>
    `;
    cartItems.appendChild(div);
  });

  const subtotal = total.toFixed(2);
  const tax = (total * 0.15).toFixed(2);
  const totalWithTax = (total * 1.15).toFixed(2);

  document.getElementById("subTotalText").textContent = `R${subtotal}`;
  document.getElementById("taxText").textContent = `R${tax}`;
  document.getElementById("receiptTotal").textContent = `R${totalWithTax}`;
  document.getElementById("summarySubtotal").textContent = `R${subtotal}`;
  document.getElementById("summaryTax").textContent = `R${tax}`;
  document.getElementById("summaryTotal").textContent = `R${totalWithTax}`;
  document.getElementById("receiptTimestamp").textContent =
    `Transaction #: ${Math.floor(Math.random() * 100000)} · ${new Date().toLocaleString()}`;

  receiptItems.innerHTML = cart
    .map(i => `<p>${i.name.padEnd(12)} x${i.qty} R${(i.price * i.qty).toFixed(2).padStart(6)}</p>`)
    .join("");

  if (document.getElementById("autoPrint").checked) {
    new bootstrap.Modal(document.getElementById("receiptModal")).show();
  }

  totalAmount.textContent = `R${totalWithTax}`;
};

// 🔍 Live Product Filter
document.getElementById("searchInput").addEventListener("input", e => {
  renderProducts(e.target.value);
});

// ⌨️ Keyboard Shortcuts
document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key === "p") {
    e.preventDefault();
    new bootstrap.Modal(document.getElementById("receiptModal")).show();
  }
  if (e.ctrlKey && e.key === "/") {
    e.preventDefault();
    toggleDarkMode();
  }
});

// 🛒 Product Tile Rendering
const products = [
  { name: "Coffee", price: 29.99, image: "coffee.jpg" },
  { name: "Juice", price: 19.99, image: "juice.jpg" },
  { name: "Burger", price: 49.99, image: "burger.jpg" },
  { name: "Soda", price: 14.99, image: "soda.jpg" },
  { name: "Pizza", price: 59.99, image: "p.jpg" },
  { name: "Water", price: 9.99, image: "water.jpg" },
  { name: "Toast", price: 24.99, image: "toast.jpg" },
  { name: "Fries", price: 22.99, image: "fries.jpg" }
];

const renderProducts = (filter = "") => {
  const productGrid = document.getElementById("productGrid");
  productGrid.innerHTML = "";
  products
    .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach(p => {
      const btn = document.createElement("button");
      btn.className = "product-tile p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded shadow";
      btn.innerHTML = `
  <div class="flex flex-col items-center">
    <img src="${p.image}" alt="${p.name}" class="w-16 h-16 object-cover rounded mb-2" />
    <div class="font-semibold text-sm">${p.name}</div>
    <div class="text-xs">R${p.price.toFixed(2)}</div>
  </div>
`;

      btn.onclick = () => addToCart(p);
      productGrid.appendChild(btn);
    });
};

document.getElementById("barcodeInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const match = products.find(p => p.name.toLowerCase().includes(e.target.value.toLowerCase()));
    if (match) addToCart(match);
    e.target.value = "";
  }
});

renderProducts();

// 💳 Payment Logic
const processPayment = (method) => {
  if (cart.length === 0) {
    alert("Cart is empty — nothing to pay for!");
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.15;
  const totalWithTax = +(subtotal + tax).toFixed(2);

  if (method === 'cash') {
    const cash = prompt(`Total due: R${totalWithTax}\nEnter cash received:`);
    if (!cash || isNaN(cash) || +cash < totalWithTax) {
      alert("Insufficient amount. Payment cancelled.");
      return;
    }
    const change = (+cash - totalWithTax).toFixed(2);
    alert(`Payment accepted.\nChange due: R${change}`);
    finalizePayment();
    return;
  }

  if (method === 'card') {
    document.getElementById("cardModalTotal").textContent = `R${totalWithTax}`;
    new bootstrap.Modal(document.getElementById("cardModal")).show();
    return;
  }

  if (method === 'split') {
    document.getElementById("splitTotal").textContent = `R${totalWithTax}`;
    new bootstrap.Modal(document.getElementById("splitModal")).show();
    return;
  }
};

function confirmCardPayment() {
  alert("Card approved. Payment successful.");
  bootstrap.Modal.getInstance(document.getElementById("cardModal")).hide();
  finalizePayment();
}

function confirmSplitPayment() {
  const cash = parseFloat(document.getElementById("splitCash").value) || 0;
  const card = parseFloat(document.getElementById("splitCard").value) || 0;
  const totalWithTax = +(cart.reduce((sum, item) => sum + item.price * item.qty, 0) * 1.15).toFixed(2);
  const sum = +(cash + card).toFixed(2);

  if (sum < totalWithTax) {
    alert(`Split amount is too low.\nRequired: R${totalWithTax}`);
    return;
  }

    const change = (sum - totalWithTax).toFixed(2);
  alert(`Split payment successful.\nCash: R${cash}\nCard: R${card}\nChange: R${change}`);

  bootstrap.Modal.getInstance(document.getElementById("splitModal")).hide();
  finalizePayment();
}

// ✅ Finalize any successful payment
function finalizePayment() {
  cart.length = 0;
  updateCart();

  // Clear subtotal, tax, total
  ["subTotalText", "taxText", "receiptTotal", "summarySubtotal", "summaryTax", "summaryTotal", "receiptTimestamp"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = "R0.00";
    }
  });

  // Animate cleared cart area
  const cartEl = document.getElementById("cartItems");
  cartEl.classList.add("animate-pulse", "opacity-50");
  setTimeout(() => {
    cartEl.classList.remove("animate-pulse", "opacity-50");
  }, 600);

  // Optional: show visual toast
  const successMsg = document.createElement("div");
  successMsg.className = "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow z-50";
  successMsg.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>Payment successful and cart cleared`;
  document.body.appendChild(successMsg);
  setTimeout(() => successMsg.remove(), 3000);

  // Show receipt modal
  new bootstrap.Modal(document.getElementById("receiptModal")).show();
}
function handleRefund() {
  alert("🔄 Refund mode activated.\nScan or select items to refund.");
  // Flag refund mode here if needed
}

function handleExchange() {
  alert("🔁 Exchange mode activated.\nSelect return item and replacement.");
  // Enter exchange logic if needed
}

function handlePettyCash() {
  const reason = prompt("📘 Reason for petty cash:");
  const amount = prompt("💸 Amount withdrawn:");
  if (reason && amount && !isNaN(amount)) {
    alert(`Petty cash recorded:\n💵 R${amount} for ${reason}`);
    // Optionally save to localStorage or backend
  }
}

function triggerDayEnd() {
  alert("📊 Day End launched.\n(This is where you’ll submit cash count, reconcile, and export report.)");
  // You can open a dayEndModal here
}

// Optional: Global Keyboard Shortcuts
document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key === "r") {
    e.preventDefault();
    handleRefund();
  }
  if (e.ctrlKey && e.key === "e") {
    e.preventDefault();
    handleExchange();
  }
  if (e.ctrlKey && e.key === "k") {
    e.preventDefault();
    handlePettyCash();
  }
  if (e.key === "F12") {
    e.preventDefault();
    triggerDayEnd();
  }
});
function showDayEndModal() {
  new bootstrap.Modal(document.getElementById("dayEndModal")).show();
}

function logoutPOS() {
  window.location.href = "index.html"; // or "formflow-login.html"
}

function submitDayEnd() {
  const floatStart = parseFloat(document.getElementById("floatStart").value) || 0;
  const cashCount = parseFloat(document.getElementById("cashCount").value) || 0;
  const cardTotal = parseFloat(document.getElementById("cardTotal").value) || 0;
  const notes = document.getElementById("dayNotes").value || "";
  const cashier = prompt("Enter cashier name:") || "Unknown";

  const totalInRegister = floatStart + cashCount;
  const timestamp = new Date().toLocaleString();

  const report = {
    timestamp,
    floatStart,
    cashCount,
    cardTotal,
    notes,
    totalInRegister,
    cashier
  };

  const reports = JSON.parse(localStorage.getItem("dayEndReports") || "[]");
  reports.push(report);
  localStorage.setItem("dayEndReports", JSON.stringify(reports));

  alert("✅ Day End report saved.");
  bootstrap.Modal.getInstance(document.getElementById("dayEndModal")).hide();
  clearDayEndForm();
}


