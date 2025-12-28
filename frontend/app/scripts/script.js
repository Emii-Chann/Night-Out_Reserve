// scripts here

// get BASE URL of BACKEND
// or use yours if it can't be used
const BACKEND_URL =
  (window.APP_CONFIG && window.APP_CONFIG.BACKEND_URL
    && (window.APP_CONFIG.BACKEND_URL != "${BACKEND_BASE_URL}"))
    ? window.APP_CONFIG.BACKEND_URL
    : "http://localhost:8080";
console.log("Backend URL:", BACKEND_URL);

console.log("Backend URL is", BACKEND_URL);

// TEST login
const loginData = {
    usernameIn: "johndoe",   // test username
    passwordIn: "Password123" // test password
};

fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData)
})
.then(res => {
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    return res.text();
})
.then(token => {
    console.log("JWT token:", token); // log to console
})
.catch(error => {
    console.error("Error:", error);
});

// Example fetch to backend
/*fetch(`${BACKEND_URL}/api/example`)
    .then(res => res.json())
    .then(data => console.log(data));*/