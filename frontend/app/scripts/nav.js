const navbarKód = `
    <nav class="navbar">
        <div class="logo">
            <a href="./index.html"><div class="logo-icon"><i class="fa-regular fa-calendar-check"></i></div></a>
            <span>Night-Out Reserve</span>
        </div>
        
        <div id="auth-menu">
            <a href="./reg.html">
                <div class="profil"><i class="fa-regular fa-user"></i></div>
            </a>
        </div>
    </nav>
`;

document.addEventListener("DOMContentLoaded", () => {
    // 1. LÉPÉS: Navbar beillesztése a HTML-be
    const navbarHelye = document.getElementById("navbar-container");
    if (navbarHelye) {
        navbarHelye.innerHTML = navbarKód;
    }

    // 2. LÉPÉS: Bejelentkezés ellenőrzése és a gombok cseréje
    const token = localStorage.getItem("token");
    const authMenu = document.getElementById("auth-menu");

    if (token && authMenu) {
        try {
            // Megpróbáljuk dekódolni a JWT tokent
            const payload = JSON.parse(atob(token.split('.')[1]));
            const username = payload.sub; // A Spring Security általában a 'sub'-ba teszi a nevet

            // Lecseréljük a profil ikont a névre és a Logout gombra
            authMenu.innerHTML = `
                <div class="d-flex align-items-center gap-3">
                    <span class="welcome-text">Szia, <strong>${username}</strong>!</span>
                    <button onclick="handleLogout()" class="logout-btn btn btn-outline-light btn-sm">Kijelentkezés</button>
                </div>
            `;
        } catch (error) {
            console.error("Hibás token található a gépben, nem lehet dekódolni!", error);
            // Ha hibás a token, érdemes lehet kitörölni, hogy ne okozzon gondot
            // localStorage.removeItem("token"); 
        }
    }
});

// Kijelentkezés függvény (ha még nem lenne megírva)
function handleLogout() {
    localStorage.removeItem("token");
    window.location.reload(); // Frissítjük az oldalt, így visszaugrik a profil ikon
}