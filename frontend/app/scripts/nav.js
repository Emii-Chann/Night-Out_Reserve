document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const navContainer = document.getElementById("auth-links"); // Ez az a hely a HTML-ben, ahol a gombok vannak

    if (token) {
        // 1. Megpróbáljuk kiszedni a nevet a tokenből (ha beleírtad a Backendben)
        // A JWT token 3 részből áll, a középső (payload) rejti az adatokat
        const payload = JSON.parse(atob(token.split('.')[1]));
        const username = payload.sub; // A 'sub' általában a felhasználónév a Spring Security-nél

        // 2. Kicseréljük a Login/Regisztráció gombokat a névre és a Logoutra
        navContainer.innerHTML = `
            <span class="welcome-text">Szia, <strong>${username}</strong>!</span>
            <button onclick="handleLogout()" class="logout-btn">Kijelentkezés</button>
        `;
    }
});

// Kijelentkezés funkció
function handleLogout() {
    localStorage.removeItem("token"); // Kitöröljük a belépőkártyát
    alert("Sikeresen kijelentkeztél!");
    window.location.href = "login.html"; // Visszaviszünk a loginra
}