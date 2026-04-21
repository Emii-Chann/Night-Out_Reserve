// Simple localStorage-based admin authentication flow
const ADMINS_KEY = "nr_admins";
const CURRENT_ADMIN_KEY = "nr_current_admin";

// Handle admin login page
const adminLoginForm = document.getElementById("adminLoginForm");
if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        
        const emailInput = document.getElementById("adminEmail").value.trim();
        const passInput = document.getElementById("adminPassword").value;
        const errorEl = document.getElementById("adminLoginError");

        try {
            const response = await fetch("http://104.248.22.60:8080/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email: emailInput, 
                    password: passInput 
                })
            });

           if (response.ok) {
                const adminData = await response.json();
                
                // Alapadatok mentése
                localStorage.setItem("nr_current_admin", adminData.felhasznalonev);
                localStorage.setItem("nr_admin_id", adminData.tulajId);
                
                if (adminData.szorakozohelyek && adminData.szorakozohelyek.length > 0) {
                    localStorage.setItem("nr_helyek_lista", JSON.stringify(adminData.szorakozohelyek));
                    localStorage.setItem("nr_szorakozohely_id", adminData.szorakozohelyek[0].id);
                } else {
                    console.warn("This owner has no venues yet!");
                }
                
                window.location.href = "./admin-dashboard.html";
            } else {
                errorEl.textContent = "Invalid email or password.";
            }
        } catch (error) {
            errorEl.textContent = "Error connecting to the server (is the backend running?).";
            console.error("Fetch error:", error);
        }
    });
}

// Handle set-password page
const setPasswordForm = document.getElementById("setPasswordForm");
if (setPasswordForm) {
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
            errorEl.textContent = "Password must be at least 6 characters long.";
            return;
        }

        if (newPass !== confirmPass) {
            errorEl.textContent = "Passwords do not match!";
            return;
        }

        try {
            // HÍVÁS A BACKENDRE
            const response = await fetch("http://104.248.22.60:8080/api/admin/jelszo-modositas", {
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
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: "Password successfully changed!",
                    background: '#1e1e2d',
                    color: '#fff',
                    confirmButtonColor: '#8b5cf6'
                });
                window.location.href = "./admin-dashboard.html";
            } else {
                // HIBA (Pl. rossz régi jelszó)
                const hibaUzenet = await response.text();
                // Opcionális: Ha a backend magyar hibaüzenetet küld vissza, 
                // azt is lehet a frontenden felülírni egy angolra, de alapból így hagyjuk.
                errorEl.textContent = hibaUzenet; 
            }
        } catch (error) {
            errorEl.textContent = "Error connecting to the server.";
            console.error(error);
        }
    });
}