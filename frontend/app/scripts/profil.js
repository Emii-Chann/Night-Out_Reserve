
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
    betoltFoglalasok(`http://localhost:8080/api/jatekok/felhasznalo/${felId}`, "jatek-lista", "game");

    betoltFoglalasok(`http://localhost:8080/api/asztalok/felhasznalo/${felId}`, "asztal-lista", "table");

    betoltFoglalasok(`http://localhost:8080/api/helyfoglalas/felhasznalo/${felId}`, "hely-lista", "venue");
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
            const vegeTime = vege.split(",")[1]
                ? vege.split(",")[1].trim()
                : "";

            listaDiv.innerHTML += `
                <div class="profil-booking-card">
                    <p><strong>Time:</strong> ${kezdet}${vegeTime ? ` – ${vegeTime}` : ""}</p>
                    <p><strong>Status:</strong> ${f.allapot}</p>
                    
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
        listaDiv.innerHTML =
            "<p>An error occurred while loading your bookings.</p>";
    }
}

// --- ÚJ: PROFIL ADATOK BETÖLTÉSE ---
async function felhasznaloAdatBetoltese() {
    try {
        // Lekérjük a usert a backendről az ID alapján
        const response = await fetch(`http://localhost:8080/users/${felId}`);
        if (response.ok) {
            const user = await response.json();
            
            // ⚠️ FIGYELEM: Ha a Java modelledben 'teljesNev' vagy 'telefonszam' van, itt írd át!
            document.getElementById('profil-nev').value = user.nev || user.teljesNev || ""; 
            document.getElementById('profil-email').value = user.email || "";
            document.getElementById('profil-tel').value = user.telefon || user.telefonszam || "";
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
        alert("Please fill in your name and email!");
        return;
    }
     if (nev.length < 6) {
        alert("6 karakter hosszú elgyen a username");
        return;
    }

    // Ezt a formátumot várja majd a Java!
    const adatok = {
        id: felId,
        nev: nev, // Itt is figyelj, hogy egyezzen a Java User/DTO változónevével!
        email: email,
        telefon: telefon
    };

    try {
        // Ezt a végpontot még meg kell csinálnod Javaban, ha nincs!
        const response = await fetch('http://localhost:8080/users/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adatok)
        });

        if (response.ok) {
            alert("Profile updated successfully! For security reasons, please log in again.");
            
            // Kitöröljük a régi (elavult) tokent
            localStorage.removeItem("token");
            
            // Visszadobjuk a login oldalra
            window.location.href = "login.html"; 
            
        } else {
            alert("Failed to update profile.");
        }
    } catch (hiba) {
        console.error("Hiba a mentésnél:", hiba);
        alert("Network error.");
    }
}

// Módosítsuk a legalsó sort, hogy a foglalások MELLETT a profil adatokat is töltse be induláskor!
profilAdatokBetoltese();
felhasznaloAdatBetoltese(); // Ezt a sort add hozzá legalulra!


