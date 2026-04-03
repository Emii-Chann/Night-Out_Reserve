// Simple localStorage-based admin authentication flow
const ADMINS_KEY = "nr_admins";
const CURRENT_ADMIN_KEY = "nr_current_admin";

function seedDefaultAdmin() {
    const existing = localStorage.getItem(ADMINS_KEY);
    if (existing) return;

    const defaultAdmins = [
        {
            email: "tulajdonos@gmail.com",
            tempPassword: "admin123",
            password: null,
            passwordSet: false,
        },
    ];

    localStorage.setItem(ADMINS_KEY, JSON.stringify(defaultAdmins));
}

function getAdmins() {
    seedDefaultAdmin();
    try {
        return JSON.parse(localStorage.getItem(ADMINS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveAdmins(admins) {
    localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
}

function setCurrentAdmin(email) {
    localStorage.setItem(CURRENT_ADMIN_KEY, email);
}

function getCurrentAdminEmail() {
    return localStorage.getItem(CURRENT_ADMIN_KEY);
}

// Handle admin login page
const adminLoginForm = document.getElementById("adminLoginForm");
if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const emailInput = document.getElementById("adminEmail");
        const passInput = document.getElementById("adminPassword");
        const errorEl = document.getElementById("adminLoginError");

        const email = emailInput.value.trim().toLowerCase();
        const password = passInput.value;

        const admins = getAdmins();
        const admin = admins.find((a) => a.email.toLowerCase() === email);

        if (!admin) {
            errorEl.textContent = "No admin account exists with this email address.";
            return;
        }

        if (!admin.passwordSet) {
            if (password !== admin.tempPassword) {
                errorEl.textContent = "Invalid initial password.";
                return;
            }
            setCurrentAdmin(admin.email);
            window.location.href = "./set-password.html";
        } else {
            if (password !== admin.password) {
                errorEl.textContent = "Invalid password.";
                return;
            }
            setCurrentAdmin(admin.email);
            window.location.href = "./admin-dashboard.html";
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

