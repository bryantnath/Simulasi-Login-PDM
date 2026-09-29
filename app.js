/* ============================================================
   SIPMB — Logika Aplikasi (Opsi A: client-side + localStorage)
   Modul 1: Registrasi & Login
   Modul 2: Input & Update Data Diri
   Modul 3: Pemilihan Program Studi
   ============================================================ */
"use strict";

/* -------- Data Program Studi (selaras dengan data_pmb.xlsx) -------- */
const PRODI = [
  { kode: "TIF", nama: "Teknik Informatika",        jenjang: "S1", fakultas: "Fakultas Teknik",           akreditasi: "A",      kuota: 60 },
  { kode: "SIF", nama: "Sistem Informasi",          jenjang: "S1", fakultas: "Fakultas Teknik",           akreditasi: "B",      kuota: 50 },
  { kode: "MNJ", nama: "Manajemen",                 jenjang: "S1", fakultas: "Fakultas Ekonomi & Bisnis", akreditasi: "A",      kuota: 80 },
  { kode: "AKT", nama: "Akuntansi",                 jenjang: "S1", fakultas: "Fakultas Ekonomi & Bisnis", akreditasi: "Unggul", kuota: 70 },
  { kode: "DKV", nama: "Desain Komunikasi Visual",  jenjang: "S1", fakultas: "Fakultas Seni & Desain",    akreditasi: "B",      kuota: 40 },
];

/* -------- Storage helpers -------- */
const DB = {
  users:   () => JSON.parse(localStorage.getItem("sipmb_users") || "{}"),
  saveUsers: (u) => localStorage.setItem("sipmb_users", JSON.stringify(u)),
  session: () => localStorage.getItem("sipmb_session"),
  setSession: (u) => localStorage.setItem("sipmb_session", u),
  clearSession: () => localStorage.removeItem("sipmb_session"),
};
// Hash sederhana (DEMO SAJA — bukan keamanan produksi)
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return "h" + h.toString(16);
}
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* -------- Toast -------- */
let toastTimer;
function toast(msg, type = "ok") {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "toast show" + (type === "err" ? " err" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = "toast" + (type === "err" ? " err" : "")), 2600);
}

/* ============================================================
   SPLASH
   ============================================================ */
window.addEventListener("load", () => {
  setTimeout(() => {
    $("#splash").classList.add("done");
    routeInitial();
  }, 1900);
});

/* ============================================================
   MODUL 1 — AUTH
   ============================================================ */
const tabs = $(".tabs");
$$(".tab").forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});
$$("[data-goto]").forEach((a) => a.addEventListener("click", () => switchTab(a.dataset.goto)));

function switchTab(name) {
  $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
  tabs.dataset.active = name;
  $$(".auth-form").forEach((f) => f.classList.remove("active"));
  $("#" + name + "-form").classList.add("active");
  $("#login-msg").textContent = "";
  $("#register-msg").textContent = "";
}

// Password strength meter
$("#reg-password").addEventListener("input", (e) => {
  const v = e.target.value;
  let score = 0;
  if (v.length >= 6) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  const bar = $("#pw-bar");
  const pct = [0, 30, 55, 80, 100][score];
  const col = ["#f87171", "#f87171", "#fbbf24", "#22d3ee", "#34d399"][score];
  bar.style.width = pct + "%";
  bar.style.background = col;
});

// Register
$("#register-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const fullname = $("#reg-fullname").value.trim();
  const username = $("#reg-username").value.trim().toLowerCase();
  const email = $("#reg-email").value.trim();
  const password = $("#reg-password").value;
  const msg = $("#register-msg");

  if (username.length < 3) return fail(msg, "Username minimal 3 karakter.");
  if (!/^[a-z0-9_.]+$/.test(username)) return fail(msg, "Username hanya huruf/angka/._");
  if (password.length < 6) return fail(msg, "Password minimal 6 karakter.");

  const users = DB.users();
  if (users[username]) return fail(msg, "Username sudah terdaftar.");

  users[username] = {
    fullname, username, email, password: hash(password),
    biodata: null, prodi: null, createdAt: Date.now(),
  };
  DB.saveUsers(users);
  msg.className = "form-msg ok";
  msg.textContent = "Akun berhasil dibuat! Silakan masuk.";
  setTimeout(() => {
    switchTab("login");
    $("#login-username").value = username;
    $("#login-password").focus();
  }, 900);
});

// Login
$("#login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = $("#login-username").value.trim().toLowerCase();
  const password = $("#login-password").value;
  const msg = $("#login-msg");
  const users = DB.users();
  const u = users[username];
  if (!u || u.password !== hash(password)) return fail(msg, "Username atau password salah.");
  DB.setSession(username);
  enterApp();
});

function fail(el, text) {
  el.className = "form-msg";
  el.textContent = text;
  el.animate(
    [{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }],
    { duration: 300 }
  );
}

/* ============================================================
   ROUTING (Auth <-> App)
   ============================================================ */
function routeInitial() {
  const s = DB.session();
  if (s && DB.users()[s]) enterApp();
  else showAuth();
}
function showAuth() {
  $("#app-shell").classList.remove("active");
  $("#auth-screen").classList.add("active");
}
function enterApp() {
  $("#auth-screen").classList.remove("active");
  $("#app-shell").classList.add("active");
  hydrateUser();
  navigate("dashboard");
}

$("#logout-btn").addEventListener("click", () => {
  DB.clearSession();
  showAuth();
  $("#login-form").reset();
  $("#register-form").reset();
  toast("Anda telah keluar.");
});

/* -------- Current user helpers -------- */
function currentUser() {
  return DB.users()[DB.session()];
}
function updateUser(patch) {
  const users = DB.users();
  const key = DB.session();
  users[key] = { ...users[key], ...patch };
  DB.saveUsers(users);
}

function hydrateUser() {
  const u = currentUser();
  $("#side-name").textContent = u.fullname || u.username;
  $("#side-username").textContent = "@" + u.username;
  $("#side-avatar").textContent = (u.fullname || u.username)[0].toUpperCase();
  $("#hero-name").textContent = "Halo, " + (u.fullname || u.username).split(" ")[0] + "!";
}

/* ============================================================
   NAVIGATION (Views)
   ============================================================ */
const VIEW_META = {
  dashboard: ["Dashboard", "Ringkasan status pendaftaran Anda"],
  biodata:   ["Data Diri", "Modul 2 — Input & perbarui biodata Anda"],
  prodi:     ["Program Studi", "Modul 3 — Pilih prodi tujuan Anda"],
};
$$("[data-view]").forEach((el) => el.addEventListener("click", () => navigate(el.dataset.view)));

function navigate(view) {
  $$(".nav-item").forEach((n) => n.classList.toggle("active", n.dataset.view === view));
  $$(".view").forEach((v) => v.classList.remove("active"));
  $("#view-" + view).classList.add("active");
  $("#view-title").textContent = VIEW_META[view][0];
  $("#view-sub").textContent = VIEW_META[view][1];

  if (view === "dashboard") renderDashboard();
  if (view === "biodata") loadBiodataForm();
  if (view === "prodi") renderProdi();
}

/* ============================================================
   DASHBOARD — progress
   ============================================================ */
function renderDashboard() {
  const u = currentUser();
  const hasBio = !!u.biodata;
  const hasProdi = !!u.prodi;
  const done = (hasBio ? 1 : 0) + (hasProdi ? 1 : 0);
  const pct = Math.round((done / 2) * 100);

  // ring
  const circ = 327;
  $("#ring-fill").style.strokeDashoffset = circ - (circ * pct) / 100;
  $("#ring-pct").textContent = pct + "%";

  setStatus("status-biodata", hasBio);
  setStatus("status-prodi", hasProdi);

  const step = done === 0 ? 1 : done === 1 ? 2 : 3;
  $("#step-pill").textContent = "Langkah " + step + " dari 3";

  const st = $("#summary-title");
  const sx = $("#summary-text");
  if (done === 2) {
    st.textContent = "Pendaftaran Lengkap 🎉";
    sx.textContent = "Biodata & pilihan prodi (" + u.prodi.nama + ") sudah tersimpan.";
  } else {
    st.textContent = "Pendaftaran Berjalan";
    sx.textContent = "Sisa " + (2 - done) + " langkah lagi untuk menyelesaikan pendaftaran.";
  }
}
function setStatus(id, done) {
  const el = $("#" + id);
  el.textContent = done ? "Selesai" : "Belum";
  el.classList.toggle("done", done);
}

/* ============================================================
   MODUL 2 — BIODATA (input & update)
   ============================================================ */
const BIO_FIELDS = ["nama", "nik", "jk", "tempat", "tgl", "sekolah", "jurusan", "email", "hp", "alamat"];

function loadBiodataForm() {
  const u = currentUser();
  const b = u.biodata || {};
  // default nama & email dari akun bila kosong
  $("#bio-nama").value = b.nama || u.fullname || "";
  $("#bio-email").value = b.email || u.email || "";
  $("#bio-nik").value = b.nik || "";
  $("#bio-jk").value = b.jk || "";
  $("#bio-tempat").value = b.tempat || "";
  $("#bio-tgl").value = b.tgl || "";
  $("#bio-sekolah").value = b.sekolah || "";
  $("#bio-jurusan").value = b.jurusan || "";
  $("#bio-hp").value = b.hp || "";
  $("#bio-alamat").value = b.alamat || "";
  markFilled();
}

function markFilled() {
  $$("#biodata-form .field").forEach((f) => {
    const input = f.querySelector("input, select");
    if (input && input.value) f.classList.add("filled");
    else f.classList.remove("filled");
  });
}
$("#biodata-form").addEventListener("input", markFilled);

$("#biodata-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("#bio-email").value.trim();
  const msg = $("#biodata-msg");
  if (!$("#bio-nama").value.trim()) return fail(msg, "Nama lengkap wajib diisi.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail(msg, "Format email tidak valid.");
  if (!$("#bio-jk").value) return fail(msg, "Pilih jenis kelamin.");

  const biodata = {
    nama: $("#bio-nama").value.trim(),
    nik: $("#bio-nik").value.trim(),
    jk: $("#bio-jk").value,
    tempat: $("#bio-tempat").value.trim(),
    tgl: $("#bio-tgl").value,
    sekolah: $("#bio-sekolah").value.trim(),
    jurusan: $("#bio-jurusan").value,
    email,
    hp: $("#bio-hp").value.trim(),
    alamat: $("#bio-alamat").value.trim(),
    updatedAt: Date.now(),
  };
  updateUser({ biodata });
  msg.className = "form-msg ok";
  msg.textContent = "Data diri tersimpan.";
  toast("✅ Data diri berhasil disimpan!");
  setTimeout(() => navigate("dashboard"), 700);
});

$("#biodata-reset").addEventListener("click", () => {
  $("#biodata-form").reset();
  markFilled();
  $("#biodata-msg").textContent = "";
});

/* ============================================================
   MODUL 3 — PILIH PRODI
   ============================================================ */
let tempSelection = null;

function renderProdi() {
  const u = currentUser();
  tempSelection = u.prodi ? u.prodi.kode : null;
  const grid = $("#prodi-grid");
  grid.innerHTML = "";

  PRODI.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "prodi-card" + (tempSelection === p.kode ? " selected" : "");
    card.style.animationDelay = i * 70 + "ms";
    card.innerHTML = `
      <span class="check">✓</span>
      <span class="prodi-code">${p.kode}</span>
      <h3>${p.nama}</h3>
      <p class="prodi-fac">${p.jenjang} · ${p.fakultas}</p>
      <div class="prodi-meta">
        <span class="chip akr">Akreditasi ${p.akreditasi}</span>
        <span class="chip">Kuota ${p.kuota}</span>
      </div>`;
    card.addEventListener("click", () => selectProdi(p.kode));
    grid.appendChild(card);
  });
  updateChosenPill();
}

function selectProdi(kode) {
  tempSelection = kode;
  $$(".prodi-card").forEach((c) => {
    const isSel = c.querySelector(".prodi-code").textContent === kode;
    c.classList.toggle("selected", isSel);
  });
  updateChosenPill();
}

function updateChosenPill() {
  const btn = $("#prodi-confirm");
  const pill = $("#chosen-pill");
  const p = PRODI.find((x) => x.kode === tempSelection);
  if (p) {
    btn.disabled = false;
    pill.hidden = false;
    $("#chosen-name").textContent = p.nama;
  } else {
    btn.disabled = true;
    pill.hidden = true;
  }
}

$("#prodi-confirm").addEventListener("click", () => {
  const p = PRODI.find((x) => x.kode === tempSelection);
  if (!p) return;
  updateUser({ prodi: { ...p, selectedAt: Date.now() } });
  toast("🎯 Prodi " + p.nama + " dipilih!");
  setTimeout(() => navigate("dashboard"), 700);
});

/* -------- Ripple pada tombol primary -------- */
document.addEventListener("pointermove", (e) => {
  const btn = e.target.closest(".btn-primary");
  if (!btn) return;
  const r = btn.getBoundingClientRect();
  btn.style.setProperty("--mx", e.clientX - r.left + "px");
  btn.style.setProperty("--my", e.clientY - r.top + "px");
});
