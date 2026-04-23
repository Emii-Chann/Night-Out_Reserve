
const ADMINS_KEY = "nr_admins";
const CURRENT_ADMIN_KEY = "nr_current_admin";


const adminLoginForm = document.getElementById("adminLoginForm");
if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        
        const emailInput = document.getElementById("adminEmail").value.trim();
        const passInput = document.getElementById("adminPassword").value;
        const errorEl = document.getElementById("adminLoginError");

        try {
            const response = await fetch("https://nigth-out-reserve.org/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email: emailInput, 
                    password: passInput 
                })
            });

           if (response.ok) {
                const adminData = await response.json();
                
                
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

        
        if (newPass.length < 6) {
            errorEl.textContent = "Password must be at least 6 characters long.";
            return;
        }

        if (newPass !== confirmPass) {
            errorEl.textContent = "Passwords do not match!";
            return;
        }

        try {
            
            const response = await fetch("https://nigth-out-reserve.org/api/admin/jelszo-modositas", {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: adminId,
                    regiJelszo: oldPass,
                    ujJelszo: newPass
                })
            });

            if (response.ok) {
                
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
                
                const hibaUzenet = await response.text();
                
                
                errorEl.textContent = hibaUzenet; 
            }
        } catch (error) {
            errorEl.textContent = "Error connecting to the server.";
            console.error(error);
        }
    });
}