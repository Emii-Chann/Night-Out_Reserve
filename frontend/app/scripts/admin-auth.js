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
const setPasswordForm = document.getElementById("setPasswordForm");
if (setPasswordForm) {
    const currentEmail = getCurrentAdminEmail();
    if (!currentEmail) {
        window.location.href = "./admin-login.html";
    }

    setPasswordForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const newPassInput = document.getElementById("newPassword");
        const confirmPassInput = document.getElementById("confirmNewPassword");
        const errorEl = document.getElementById("setPasswordError");

        const newPass = newPassInput.value;
        const confirmPass = confirmPassInput.value;

        if (newPass.length < 8) {
            errorEl.textContent = "Password must be at least 8 characters long.";
            return;
        }

        if (newPass !== confirmPass) {
            errorEl.textContent = "Passwords do not match.";
            return;
        }

        const admins = getAdmins();
        const adminIndex = admins.findIndex(
            (a) => a.email.toLowerCase() === currentEmail.toLowerCase()
        );

        if (adminIndex === -1) {
            errorEl.textContent = "An error occurred. Please log in again.";
            localStorage.removeItem(CURRENT_ADMIN_KEY);
            setTimeout(() => {
                window.location.href = "./admin-login.html";
            }, 1500);
            return;
        }

        admins[adminIndex].password = newPass;
        admins[adminIndex].passwordSet = true;
        admins[adminIndex].tempPassword = null;
        saveAdmins(admins);

        window.location.href = "./admin-dashboard.html";
    });
}

