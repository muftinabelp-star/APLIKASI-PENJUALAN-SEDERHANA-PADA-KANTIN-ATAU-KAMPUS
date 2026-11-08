// ==========================================
// DATA
// ==========================================

let kategori = JSON.parse(localStorage.getItem("kategori")) || [
    "Makanan",
    "Minuman"
];

let produk = JSON.parse(localStorage.getItem("produk")) || [{
        kode: "P001",
        nama: "Nasi Goreng",
        kategori: "Makanan",
        harga: 15000,
        stok: 10
    },
    {
        kode: "P002",
        nama: "Mie Goreng",
        kategori: "Makanan",
        harga: 12000,
        stok: 10
    },
    {
        kode: "P003",
        nama: "Ayam Geprek",
        kategori: "Makanan",
        harga: 18000,
        stok: 10
    },
    {
        kode: "P004",
        nama: "Es Teh",
        kategori: "Minuman",
        harga: 5000,
        stok: 15
    },
    {
        kode: "P005",
        nama: "Es Jeruk",
        kategori: "Minuman",
        harga: 7000,
        stok: 15
    }
];

let transaksi = JSON.parse(localStorage.getItem("transaksi")) || [];

let keranjang = [];

// User yang sedang login: { username, role }
let userAktif = null;


// ==========================================
// LOGIN & HAK AKSES
// ==========================================
// role "pemilik" : bisa mengakses semua menu
// role "pembeli" : hanya bisa menu Transaksi (membeli)

const usersBawaan = [{
        username: "Abel",
        password: "Abel",
        role: "pemilik"
    },
    {
        username: "Suwono",
        password: "Suwono",
        role: "pembeli"
    },
    {
        username: "rapael",
        password: "rapael",
        role: "pembeli"
    },
    {
        username: "mufti",
        password: "mufti",
        role: "pembeli"
    },
    {
        username: "nadya",
        password: "nadya",
        role: "pembeli"
    }
];

// Akun yang dibuat lewat form "Buat Akun" (disimpan di browser)
let usersTerdaftar = JSON.parse(localStorage.getItem("usersTerdaftar")) || [];

// Gabungan akun bawaan + akun baru
let users = usersBawaan.concat(usersTerdaftar);

// Halaman yang boleh dibuka tiap role
const aksesHalaman = {
    pemilik: ["dashboard", "kategori", "produk", "transaksi", "riwayat", "laporan"],
    pembeli: ["transaksi"]
};

function login() {

    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    let user = users.find(function (u) {
        return u.username.toLowerCase() === username.toLowerCase() &&
            u.password === password;
    });

    document.getElementById("loginError").classList.remove("sukses");

    if (!user) {
        document.getElementById("loginError").innerText =
            "Username atau password salah!";
        return;
    }

    masukAplikasi({
        username: user.username,
        role: user.role
    });

    sessionStorage.setItem("userAktif", JSON.stringify(userAktif));
}

// ------------------------------------------
// BUAT AKUN BARU
// ------------------------------------------

function tampilkanRegister() {

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("registerBox").style.display = "block";

    document.getElementById("registerError").innerText = "";
    document.getElementById("registerError").classList.remove("sukses");

    document.getElementById("regUsername").focus();
}

function tampilkanLogin() {

    document.getElementById("registerBox").style.display = "none";
    document.getElementById("loginBox").style.display = "block";

    document.getElementById("regUsername").value = "";
    document.getElementById("regPassword").value = "";
    document.getElementById("regPassword2").value = "";
    document.getElementById("registerError").innerText = "";
}

function daftar() {

    let username = document.getElementById("regUsername").value.trim();
    let password = document.getElementById("regPassword").value.trim();
    let ulangi = document.getElementById("regPassword2").value.trim();

    let pesan = document.getElementById("registerError");

    pesan.classList.remove("sukses");

    if (username === "" || password === "" || ulangi === "") {
        pesan.innerText = "Semua kolom wajib diisi!";
        return;
    }

    if (username.length < 3) {
        pesan.innerText = "Username minimal 3 karakter!";
        return;
    }

    if (password.length < 4) {
        pesan.innerText = "Password minimal 4 karakter!";
        return;
    }

    if (password !== ulangi) {
        pesan.innerText = "Konfirmasi password tidak sama!";
        return;
    }

    let sudahAda = users.some(function (u) {
        return u.username.toLowerCase() === username.toLowerCase();
    });

    if (sudahAda) {
        pesan.innerText = "Username sudah dipakai, pilih yang lain!";
        return;
    }

    // Akun baru selalu berperan sebagai pembeli
    let akunBaru = {
        username: username,
        password: password,
        role: "pembeli"
    };

    usersTerdaftar.push(akunBaru);
    users.push(akunBaru);

    try {
        localStorage.setItem("usersTerdaftar", JSON.stringify(usersTerdaftar));
    } catch (e) {
        pesan.innerText = "Gagal menyimpan akun. Penyimpanan browser penuh!";
        usersTerdaftar.pop();
        users.pop();
        return;
    }

    // Kembali ke halaman login dengan pesan sukses
    tampilkanLogin();

    document.getElementById("username").value = username;
    document.getElementById("password").value = "";

    let info = document.getElementById("loginError");

    info.innerText = "Akun berhasil dibuat! Silakan login.";
    info.classList.add("sukses");

    document.getElementById("password").focus();
}

function masukAplikasi(user) {

    userAktif = user;

    document.getElementById("loginPage").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("loginError").innerText = "";

    document.getElementById("namaUser").innerText = user.username;
    document.getElementById("roleUser").innerText = user.role;

    aturMenuSesuaiRole();

    tampilkanSemua();

    // Halaman awal sesuai role
    showPage(user.role === "pemilik" ? "dashboard" : "transaksi");
}

function aturMenuSesuaiRole() {

    document.querySelectorAll("nav button[data-role]").forEach(function (btn) {

        let khususPemilik = btn.getAttribute("data-role") === "pemilik";

        btn.style.display =
            (khususPemilik && userAktif.role !== "pemilik") ?
            "none" :
            "";
    });
}

function logout() {

    userAktif = null;
    keranjang = [];

    sessionStorage.removeItem("userAktif");

    document.getElementById("app").style.display = "none";
    document.getElementById("loginPage").style.display = "flex";

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("loginError").innerText = "";
    document.getElementById("loginError").classList.remove("sukses");
    tampilkanLogin();
    document.getElementById("uangBayar").value = "";
    document.getElementById("hasilBayar").innerText = "";

    tutupStruk();
}


// ==========================================
// NAVIGASI
// ==========================================

function showPage(namaPage) {

    if (!userAktif) {
        return;
    }

    // Cegah pembeli membuka halaman milik pemilik
    if (!aksesHalaman[userAktif.role].includes(namaPage)) {
        notif("Anda tidak memiliki akses ke halaman ini!");
        return;
    }

    let pages = document.querySelectorAll(".page");

    pages.forEach(function (page) {
        page.style.display = "none";
    });

    document.getElementById(namaPage).style.display = "block";

    tampilkanSemua();
}

// Pastikan aksi khusus pemilik tidak bisa dipanggil pembeli
function hanyaPemilik() {

    if (!userAktif || userAktif.role !== "pemilik") {
        notif("Hanya pemilik yang dapat melakukan aksi ini!");
        return false;
    }

    return true;
}


// ==========================================
// SIMPAN DATA
// ==========================================

function simpanData() {

    try {
        localStorage.setItem("kategori", JSON.stringify(kategori));
        localStorage.setItem("produk", JSON.stringify(produk));
        localStorage.setItem("transaksi", JSON.stringify(transaksi));
        return true;
    } catch (e) {
        notif("Penyimpanan browser penuh! Gunakan foto yang lebih kecil.");
        return false;
    }
}
