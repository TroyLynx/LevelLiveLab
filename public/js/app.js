/* =========================================================
   Vaultline — shared application logic
   Everything is mocked via localStorage, so the app works
   fully client-side with no backend required.
   ========================================================= */

const DB_KEYS = {
  users: "vaultline_users",
  session: "vaultline_session",
  balances: "vaultline_balances_",
  transactions: "vaultline_transactions_",
  security: "vaultline_security_",
};

// Mock exchange rates, quoted as "1 USD = X currency"
const RATES_TO_USD_BASE = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  GHS: 15.6,
  JPY: 148.2,
  CAD: 1.36,
};

const CURRENCY_NAMES = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  GHS: "Ghanaian Cedi",
  JPY: "Japanese Yen",
  CAD: "Canadian Dollar",
};

const CURRENCY_DECIMALS = {
  USD: 2, EUR: 2, GBP: 2, GHS: 2, CAD: 2, JPY: 0,
};

/* ---------------- Seed demo data ---------------- */
function seedDemoData() {
  if (!localStorage.getItem(DB_KEYS.users)) {
    const users = [
      {
        username: "demo",
        password: "demo123",
        name: "Kwabena Owusu",
        email: "kwabena.owusu@example.com",
        phone: "+233 24 555 0142",
        accountNumber: "VLN-2291-4407",
      },
    ];
    localStorage.setItem(DB_KEYS.users, JSON.stringify(users));
  }
  const balKey = DB_KEYS.balances + "demo";
  if (!localStorage.getItem(balKey)) {
    localStorage.setItem(
      balKey,
      JSON.stringify({ USD: 4820.55, EUR: 1200, GHS: 9600, GBP: 0 })
    );
  }
  const txKey = DB_KEYS.transactions + "demo";
  if (!localStorage.getItem(txKey)) {
    const now = Date.now();
    const seedTx = [
      { id: cryptoRandomId(), date: now - 86400000 * 2, type: "Deposit", party: "Payroll — Atlas Systems Ltd", amount: 2100, currency: "USD", direction: "credit" },
      { id: cryptoRandomId(), date: now - 86400000 * 4, type: "Transfer", party: "To: Ama Serwaa", amount: 150, currency: "GHS", direction: "debit" },
      { id: cryptoRandomId(), date: now - 86400000 * 6, type: "Withdrawal", party: "ATM — Adum Branch", amount: 80, currency: "USD", direction: "debit" },
      { id: cryptoRandomId(), date: now - 86400000 * 9, type: "Transfer", party: "From: Kojo Mensah", amount: 300, currency: "EUR", direction: "credit" },
    ];
    localStorage.setItem(txKey, JSON.stringify(seedTx));
  }
  const secKey = DB_KEYS.security + "demo";
  if (!localStorage.getItem(secKey)) {
    localStorage.setItem(secKey, JSON.stringify({ twoFactor: true, loginAlerts: true }));
  }
}

function cryptoRandomId() {
  return "tx_" + Math.random().toString(36).slice(2, 10);
}

/* ---------------- Auth ---------------- */
function getUsers() {
  return JSON.parse(localStorage.getItem(DB_KEYS.users) || "[]");
}

function login(username, password) {
  const user = getUsers().find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
  );
  if (!user) return false;
  localStorage.setItem(DB_KEYS.session, username.trim().toLowerCase());
  return true;
}

function logout() {
  localStorage.removeItem(DB_KEYS.session);
  window.location.href = "login.html";
}

function currentUsername() {
  return localStorage.getItem(DB_KEYS.session);
}

function currentUser() {
  const uname = currentUsername();
  if (!uname) return null;
  return getUsers().find((u) => u.username === uname) || null;
}

// function requireAuth() {
//   seedDemoData();
//   if (!currentUsername()) {
//     window.location.href = "login.html";
//   }
// }

/* ---------------- Balances & transactions ---------------- */
function getBalances() {
  const uname = currentUsername();
  return JSON.parse(localStorage.getItem(DB_KEYS.balances + uname) || "{}");
}

function setBalances(balances) {
  const uname = currentUsername();
  localStorage.setItem(DB_KEYS.balances + uname, JSON.stringify(balances));
}

function getTransactions() {
  const uname = currentUsername();
  const list = JSON.parse(localStorage.getItem(DB_KEYS.transactions + uname) || "[]");
  return list.sort((a, b) => b.date - a.date);
}

function addTransaction(tx) {
  const uname = currentUsername();
  const key = DB_KEYS.transactions + uname;
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  list.push(tx);
  localStorage.setItem(key, JSON.stringify(list));
}

/* ---------------- Currency conversion ---------------- */
// amount in `from` currency -> amount in `to` currency
function convertCurrency(amount, from, to) {
  if (!RATES_TO_USD_BASE[from] || !RATES_TO_USD_BASE[to]) return NaN;
  const usd = amount / RATES_TO_USD_BASE[from];
  return usd * RATES_TO_USD_BASE[to];
}

function formatMoney(amount, currency) {
  const decimals = CURRENCY_DECIMALS[currency] ?? 2;
  const num = Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${currency} ${num}`;
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ---------------- Sidebar / nav enhancement ----------------
   The nav links themselves are static HTML in every page (so they
   always show up even if this script fails to load). This function
   only fills in the user's name/initials/account number and wires
   up the logout button. */
function renderSidebar(activePage) {
  const user = currentUser();
  const initials = user
    ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "??";

  const avatarEl = document.getElementById("sidebar-avatar");
  const nameEl = document.getElementById("sidebar-username");
  const accountEl = document.getElementById("sidebar-account");
  if (avatarEl) avatarEl.textContent = initials;
  if (nameEl) nameEl.textContent = user ? user.name : "Guest";
  if (accountEl) accountEl.textContent = user ? user.accountNumber : "";

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
}

/* ---------------- Odometer digit-roll effect ---------------- */
// Renders `text` into `container` as individual animated digit spans.
function renderOdometer(container, text) {
  const prev = container.dataset.prevValue || "";
  container.innerHTML = "";
  [...text].forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "digit";
    span.textContent = ch;
    if (prev[i] !== ch) {
      span.classList.add("rolling");
    }
    container.appendChild(span);
  });
  container.dataset.prevValue = text;
}