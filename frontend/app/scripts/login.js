async function handleLogin(event) {
    event.preventDefault(); // Megállítjuk a 405-ös hibát
    
    const usernameIn = document.getElementById("username").value;
    const passwordIn = document.getElementById("password").value;

    const loginData = {
        usernameIn: usernameIn,
        passwordIn: passwordIn
    };

    try {
        // 2. Az "await" csak az "async" függvényen belül működik
        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        if (response.ok) {
            const token = await response.text();
            localStorage.setItem("token", token);
            alert("Login successful!");
            window.location.href = "index.html";
        } else {
            const errorMsg = await response.text();
            alert("Error: " + errorMsg);
        }
    } catch (err) {
        console.error("An error occurred:", err);
    }
}