// Simple localStorage-based admin authentication flow
const ADMINS_KEY = "nr_admins";
const CURRENT_ADMIN_KEY = "nr_current_admin";



// Handle admin login page
const adminLoginForm = document.getElementById("adminLoginForm");
if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Megakadályozzuk az oldal újratöltését
        
        const emailInput = document.getElementById("adminEmail").value.trim();
        const passInput = document.getElementById("adminPassword").value;
        const errorEl = document.getElementById("adminLoginError");

        try {
            // 1. Hívás a te Spring Boot végpontodra!
            const response = await fetch("http://localhost:8080/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email: emailInput, 
                    password: passInput 
                })
            });

            if (response.ok) {
                // 2. Sikeres belépés (200 OK jött vissza)
                const adminData = await response.json();
                
                // Elmentjük a böngészőbe az admin azonosítóit (ez kell majd a Dashboardnak)
                localStorage.setItem("nr_current_admin", adminData.felhasznalonev);
                localStorage.setItem("nr_admin_id", adminData.tulajId);
                
                // Irány az admin felület!
                window.location.href = "./admin-dashboard.html";
            } else {
                // 3. Sikertelen belépés (pl. 401 Unauthorized)
                const hibaUzenet = await response.text();
                errorEl.textContent = hibaUzenet;
            }
        } catch (error) {
            errorEl.textContent = "Hiba történt a szerverhez való csatlakozáskor (fut a backend?).";
            console.error("Fetch hiba:", error);
        }
    });
}
// Handle set-password page
// Handle set-password page
const setPasswordForm = document.getElementById("setPasswordForm");
if (setPasswordForm) {
    // Ellenőrizzük, hogy be van-e lépve (van-e mentett ID)
    const adminId = localStorage.getItem("nr_admin_id");
    if (!adminId) {
        window.location.href = "./admin-login.html";
    }

    setPasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const oldPass = document.getElementById("oldPassword").value;
        const newPass = document.getElementById("newPassword").value;
        const confirmPass = document.getElementById("confirmNewPassword").value;
        const errorEl = document.getElementById("setPasswordError");

        // Alapvető ellenőrzések a frontenden
        if (newPass.length < 6) {
            errorEl.textContent = "A jelszónak legalább 6 karakternek kell lennie.";
            return;
        }

        if (newPass !== confirmPass) {
            errorEl.textContent = "A két jelszó nem egyezik!";
            return;
        }

        try {
            // HÍVÁS A BACKENDRE
            const response = await fetch("http://localhost:8080/api/admin/jelszo-modositas", {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: adminId,
                    regiJelszo: oldPass,
                    ujJelszo: newPass
                })
            });

            if (response.ok) {
                // SIKER!
                alert("Jelszó sikeresen módosítva!");
                window.location.href = "./admin-dashboard.html";
            } else {
                // HIBA (Pl. rossz régi jelszó)
                const hibaUzenet = await response.text();
                errorEl.textContent = hibaUzenet;
            }
        } catch (error) {
            errorEl.textContent = "Hiba a szerverkapcsolatban.";
            console.error(error);
        }
    });
}
