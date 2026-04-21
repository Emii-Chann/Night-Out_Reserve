let felId = null;

// Dinamikusan kiolvassuk az ID-t a tokenből
const token = localStorage.getItem("token");
if (token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // ITT A VARÁZSLAT: Pontosan azt a kulcsot használjuk, amit a képen láttunk!
        felId = payload.userId; 
    } catch (error) {
        console.error("Hiba a token dekódolásakor:", error);
    }
}

async function profilAdatokBetoltese() {
    betoltFoglalasok(`https://nigth-out-reserve.org/api/jatekok/felhasznalo/${felId}`, "jatek-lista", "game");
    betoltFoglalasok(`https://nigth-out-reserve.org/api/asztalok/felhasznalo/${felId}`, "asztal-lista", "table");
    betoltFoglalasok(`https://nigth-out-reserve.org/api/helyfoglalas/felhasznalo/${felId}`, "hely-lista", "venue");
}

async function betoltFoglalasok(url, divId, tipus) {
    const listaDiv = document.getElementById(divId);
    try {
        const response = await fetch(url);
        const adatok = await response.json();

        if (adatok.length === 0) {
            listaDiv.innerHTML = `<p>You have no active ${tipus} bookings.</p>`;
            return;
        }

        listaDiv.innerHTML = "";
        adatok.forEach((f) => {
            const kezdet = new Date(f.kezdet).toLocaleString("en-US");
            const vege = new Date(f.vege).toLocaleString("en-US");
            const vegeTime = vege.split(",")[1] ? vege.split(",")[1].trim() : "";

            listaDiv.innerHTML += `
                <div class="profil-booking-card" style="position: relative;">
                    
                    ${(f.allapot !== 'LEMONDVA' && f.allapot !== 'ELUTASITVA') ? 
                        `<button onclick="foglalasLemondasa(${f.id}, '${tipus}')" 
                                style="position: absolute; top: 12px; right: 12px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; border-radius: 6px; padding: 4px 8px; font-size: 0.8rem; cursor: pointer; transition: 0.3s;">
                            <i class="fa-solid fa-xmark"></i> Cancel
                        </button>` 
                    : ""}

                    <p><strong>Time:</strong> ${kezdet}${vegeTime ? ` – ${vegeTime}` : ""}</p>
                    <p><strong>Status:</strong> <span style="color: ${f.allapot === 'LEMONDVA' ? '#ef4444' : 'inherit'}">${f.allapot}</span></p>
                    
                    ${f.szorakozohelyNev ? `<p><strong>Venue:</strong> ${f.szorakozohelyNev}</p>` : ""}
                    ${f.jatekNev ? `<p><strong>Game:</strong> ${f.jatekNev}</p>` : ""}
                    ${f.asztalSzam ? `<p><strong>Table:</strong> ${f.asztalSzam}</p>` : ""}
                    ${f.letszam ? `<p><strong>Guests:</strong> ${f.letszam}</p>` : ""}
                    <hr>
                </div>
            `;
        });
    } catch (hiba) {
        console.error(hiba);
        listaDiv.innerHTML = "<p>An error occurred while loading your bookings.</p>";
    }
}

// --- ÚJ: PROFIL ADATOK BETÖLTÉSE ---
async function felhasznaloAdatBetoltese() {
    try {
        const response = await fetch(`https://nigth-out-reserve.org/users/${felId}`);
        if (response.ok) {
            const user = await response.json();
            document.getElementById('profil-nev').value = user.username || ""; 
            document.getElementById('profil-email').value = user.email || "";
            document.getElementById('profil-tel').value = user.phone || "";
        }
    } catch (hiba) {
        console.error("Hiba a profil adatok betöltésekor:", hiba);
    }
}

// --- ÚJ: PROFIL ADATOK MENTÉSE ---
async function profilAdatokMentese() {
    const nev = document.getElementById('profil-nev').value;
    const email = document.getElementById('profil-email').value;
    const telefon = document.getElementById('profil-tel').value;

    if (!nev || !email) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: "Please fill in your name and email!",
          background: '#1e1e2d',
          color: '#fff',
          confirmButtonColor: '#ef4444'
        });
        return;
    }
     if (nev.length < 6) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: "Username must be at least 6 characters long.",
          background: '#1e1e2d',
          color: '#fff',
          confirmButtonColor: '#ef4444'
        });
        return;
    }

    const adatok = {
        id: felId,
        nev: nev,
        email: email,
        telefon: telefon
    };

    try {
        const response = await fetch('https://nigth-out-reserve.org/users/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adatok)
        });

        if (response.ok) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: "Profile updated successfully! For security reasons, please log in again.",
              background: '#1e1e2d',
              color: '#fff',
              confirmButtonColor: '#8b5cf6'
            });
            
            // Kitöröljük a régi (elavult) tokent
            localStorage.removeItem("token");
            window.location.href = "login.html"; 
            
        } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: "Failed to update profile.",
              background: '#1e1e2d',
              color: '#fff',
              confirmButtonColor: '#ef4444'
            });
        }
    } catch (hiba) {
        console.error("Hiba a mentésnél:", hiba);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: "Network error.",
          background: '#1e1e2d',
          color: '#fff',
          confirmButtonColor: '#ef4444'
        });
    }
}

async function foglalasLemondasa(id, tipus) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "Do you really want to cancel this booking?",
        icon: 'warning',
        showCancelButton: true,
        background: '#1e1e2d',
        color: '#fff',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#4b5563',
        confirmButtonText: 'Yes, cancel it!'
    });

    if (!result.isConfirmed) return;

    let vegpont = "";
    if (tipus === "venue") vegpont = "helyfoglalas";
    else if (tipus === "table") vegpont = "asztalok";
    else if (tipus === "game") vegpont = "jatekok";

    try {
        const response = await fetch(`https://nigth-out-reserve.org/api/${vegpont}/lemondas/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}` 
            }
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Cancelled!',
                text: 'Your booking has been cancelled.',
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#8b5cf6'
            });
            profilAdatokBetoltese(); 
        } else {
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Something went wrong.' });
        }
    } catch (error) {
        console.error("Hiba a lemondásnál:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (felId) { 
        profilAdatokBetoltese();
        felhasznaloAdatBetoltese(); 
    }
});


// --- ÚJ: FIÓK TELJES TÖRLÉSE (GDPR) ---
async function fiokTorlese() {
    const result = await Swal.fire({
        title: 'Are you absolutely sure?',
        text: "This will permanently delete your account and all your bookings. This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        background: '#1e1e2d',
        color: '#fff',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#4b5563',
        confirmButtonText: 'Yes, delete everything!',
        cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
        try {
            // Itt a backend DELETE végpontját hívjuk meg
            const response = await fetch(`https://nigth-out-reserve.org/users/hardDelete/${felId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Account Deleted',
                    text: 'Your data has been successfully removed from our system. Goodbye!',
                    background: '#1e1e2d',
                    color: '#fff',
                    confirmButtonColor: '#8b5cf6'
                });

                // Kijelentkeztetés és takarítás
                localStorage.removeItem("token");
                window.location.href = "index.html";
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Could not delete account. Please try again later.',
                    background: '#1e1e2d',
                    color: '#fff'
                });
            }
        } catch (error) {
            console.error("Hiba a törlés során:", error);
            Swal.fire({
                icon: 'error',
                title: 'Network Error',
                text: 'Failed to reach the server.',
                background: '#1e1e2d',
                color: '#fff'
            });
        }
    }
}