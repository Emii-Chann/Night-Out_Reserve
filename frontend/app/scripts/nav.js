const navbarKód = `
    <nav class="navbar">
        <div class="logo">
            <a href="./index.html"><div class="logo-icon"><i class="fa-regular fa-calendar-check"></i></div></a>
            <span>Night-Out Reserve</span>
        </div>
        
        <div id="auth-menu">
         <a href="./admin-dashboard.html" class="nav-profile-link">Admin</a>
        <a href="./reg.html">
                <div class="profil"><i class="fa-regular fa-user"></i></div>
            </a>
        </div>
    </nav>
`;

document.addEventListener("DOMContentLoaded", () => {
    
    const navbarHelye = document.getElementById("navbar-container");
    if (navbarHelye) {
        navbarHelye.innerHTML = navbarKód;
    }

    
    const token = localStorage.getItem("token");
    const authMenu = document.getElementById("auth-menu");

    if (token && authMenu) {
        try {
            
            const payload = JSON.parse(atob(token.split('.')[1]));
            const username = payload.sub; 

            authMenu.innerHTML = `
                <div class="auth-menu-logged">
                    <span class="welcome-text">Hi, <strong>${username}</strong>!</span>
                    <a href="./profil.html" class="nav-profile-link">Profile</a>
                    <a href="./admin-dashboard.html" class="nav-profile-link">Admin</a>
                    <button type="button" onclick="handleLogout()" class="logout-btn">Logout</button>
                </div>
            `;
        } catch (error) {
            console.error("Invalid token found, cannot be decoded!", error);
            
            
        }
    }
});


function handleLogout() {
    localStorage.removeItem("token");
    window.location.reload(); 
}