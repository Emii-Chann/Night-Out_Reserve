function validateForm() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value;
    let password2 = document.getElementById("password2").value;
    let email = document.getElementById("email").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let gdprCheck = document.getElementById("gdpr-agree").checked;

    document.querySelectorAll(".error").forEach(e => e.innerHTML = "");
    document.getElementById("successMsg").innerHTML = "";
    document.getElementById("gdprError").innerHTML = "";

    let valid = true;

    if (username.length < 4) {
        document.getElementById("userError").innerHTML = "<span style='color:#ff6b6b;'>Min. 4 characters</span>";
        valid = false;
    }

    if (password.length < 8) {
        document.getElementById("passError").innerHTML = "<span style='color:#ff6b6b;'>Min. 8 characters</span>";
        valid = false;
    }

    if (password !== password2) {
        document.getElementById("pass2Error").innerHTML = "<span style='color:#ff6b6b;'>Does not match!</span>";
        valid = false;
    }

    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById("emailError").innerHTML = "<span style='color:#ff6b6b;'>Invalid email!</span>";
        valid = false;
    }

    let phoneRegex = /^[0-9]{9,12}$/;
    if (phone !== "" && !phoneRegex.test(phone)) {
        document.getElementById("phoneError").innerHTML = "<span style='color:#ff6b6b;'>Invalid phone number (9-12 digits)!</span>";
        valid = false;
    }
    if (!gdprCheck) {
        document.getElementById("gdprError").innerHTML = "<span style='color:#ff6b6b;'>You must accept the Privacy Policy to register.</span>";
        valid = false;
    }

    return valid; 
}

async function handleRegistration(event) {
    event.preventDefault(); 
    
    if (!validateForm()) return; 

    const userData = {
        username: document.getElementById("username").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        password: document.getElementById("password").value
    };

    console.log("Sending request...", userData);

    try {
        const response = await fetch('http://104.248.22.60:8080/users/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: "Registration successful 🎉",
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#8b5cf6'
            });
            window.location.href = "login.html";
        } else {
            const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: "Error: " + (errorData.message || "Registration failed"),
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        }
    } catch (error) {
        console.error("Network error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Could not reach the server.",
            background: '#1e1e2d',
            color: '#fff',
            confirmButtonColor: '#ef4444'
        });
    }
}