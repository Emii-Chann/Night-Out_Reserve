// cookie-consent.js

// 1. A felugró sáv HTML kódja
const cookieHTML = `
<div id="cookie-banner" class="cookie-banner" style="display: none;">
    <div class="cookie-content">
        <p>We use cookies to improve your experience, remember your login, and manage your bookings. By continuing to use our site, you agree to our privacy policy. <a href="privacy-policy.html" class="cookie-link">Learn more</a>.</p>
        <div class="cookie-buttons">
            <button id="accept-cookies" class="cookie-btn accept">Accept All</button>
            <button id="decline-cookies" class="cookie-btn decline">Decline</button>
        </div>
    </div>
</div>
`;

// 2. A lila-sötét témádhoz passzoló CSS stílus
const cookieCSS = `
<style>
    .cookie-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: #1e1e2d;
        color: #fff;
        padding: 15px 20px;
        box-shadow: 0 -5px 15px rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        justify-content: center;
        border-top: 1px solid #8b5cf6;
        font-family: inherit;
    }
    .cookie-content {
        max-width: 1200px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 15px;
    }
    .cookie-content p {
        margin: 0;
        font-size: 0.9rem;
        color: #d1d5db;
        flex: 1;
        min-width: 250px;
        line-height: 1.5;
    }
    .cookie-link {
        color: #8b5cf6;
        text-decoration: underline;
        font-weight: bold;
    }
    .cookie-buttons {
        display: flex;
        gap: 10px;
    }
    .cookie-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        transition: 0.3s ease;
    }
    .cookie-btn.accept {
        background-color: #8b5cf6;
        color: white;
    }
    .cookie-btn.accept:hover {
        background-color: #7c3aed;
    }
    .cookie-btn.decline {
        background-color: transparent;
        color: #ef4444;
        border: 1px solid #ef4444;
    }
    .cookie-btn.decline:hover {
        background-color: rgba(239, 68, 68, 0.1);
    }
</style>
`;

// 3. A logika: Csak akkor mutatjuk meg, ha még nem döntött a user
document.addEventListener("DOMContentLoaded", () => {
    // Ellenőrizzük a localStorage-t
    if (!localStorage.getItem("cookie_consent")) {
        // Beillesztjük a stílust a <head>-be, a HTML-t pedig a <body> aljára
        document.head.insertAdjacentHTML("beforeend", cookieCSS);
        document.body.insertAdjacentHTML("beforeend", cookieHTML);
        
        const banner = document.getElementById("cookie-banner");
        banner.style.display = "flex";

        // Gombok működése
        document.getElementById("accept-cookies").addEventListener("click", () => {
            localStorage.setItem("cookie_consent", "accepted");
            banner.style.display = "none";
        });

        document.getElementById("decline-cookies").addEventListener("click", () => {
            localStorage.setItem("cookie_consent", "declined");
            banner.style.display = "none";
        });
    }
});