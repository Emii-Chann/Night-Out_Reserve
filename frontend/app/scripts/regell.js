function validateForm() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value;
    let password2 = document.getElementById("password2").value;
    let email = document.getElementById("email").value.trim();
    let phone = document.getElementById("phone").value.trim();

    document.querySelectorAll(".error").forEach(e => e.innerHTML = "");
    document.getElementById("successMsg").innerHTML = "";

    let valid = true;

    if (username.length < 4) {
        document.getElementById("userError").innerHTML = "<span style='color:#ff6b6b;'>Min. 4 karakter</span>";
        valid = false;
    }

    if (password.length < 8) {
        document.getElementById("passError").innerHTML = "<span style='color:#ff6b6b;'>Min. 8 karakter</span>";
        valid = false;
    }

    if (password !== password2) {
        document.getElementById("pass2Error").innerHTML = "<span style='color:#ff6b6b;'>Nem egyezik!</span>";
        valid = false;
    }

    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById("emailError").innerHTML = "<span style='color:#ff6b6b;'>Hibás email!</span>";
        valid = false;
    }

    // JAVÍTVA: Csak akkor hiba, ha NEM üres ÉS NEM illeszkedik a regexre
    let phoneRegex = /^[0-9]{9,12}$/;
    if (phone !== "" && !phoneRegex.test(phone)) {
        document.getElementById("phoneError").innerHTML = "<span style='color:#ff6b6b;'>Hibás telefonszám (9-12 számjegy)!</span>";
        valid = false;
    }

    return valid; // JAVÍTVA: true-t ad vissza, ha minden OK, false-t ha hiba van
}

async function handleRegistration(event) {
    event.preventDefault(); 
    
    // Most már jól működik a feltétel: ha nem valid, megáll
    if (!validateForm()) return; 

    const userData = {
        username: document.getElementById("username").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        password: document.getElementById("password").value
    };

    console.log("Küldés folyamatban...", userData);

    try {
        const response = await fetch('http://localhost:8080/users/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            alert("Sikeres regisztráció 🎉");
            window.location.href = "login.html";
        } else {
            // Megpróbáljuk kiolvasni a hibaüzenetet a bckendtől
            const errorData = await response.json().catch(() => ({ message: "Ismeretlen hiba" }));
            alert("Hiba: " + (errorData.message || "A regisztráció nem sikerült"));
        }
    } catch (error) {
        console.error("Hálózati hiba:", error);
        alert("Nem sikerült elérni a szervert. Fut a Docker?");
    }
}