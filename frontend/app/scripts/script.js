// scripts here

// get BASE URL of BACKEND
// or use yours if it can't be used
const BACKEND_URL = "${APP_BASE_URL}" || "http://localhost:8080";
console.log("Backend URL is", BACKEND_URL);

// Example fetch to backend
fetch(`${BACKEND_URL}/api/example`)
    .then(res => res.json())
    .then(data => console.log(data));