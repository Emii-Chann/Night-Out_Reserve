// profil.js — used only by profil.html
const felhasznaloId = 1;

async function profilAdatokBetoltese() {
    betoltFoglalasok(`http://localhost:8080/api/jatekok/felhasznalo/${felhasznaloId}`, "jatek-lista", "game");

    betoltFoglalasok(`http://localhost:8080/api/asztalok/felhasznalo/${felhasznaloId}`, "asztal-lista", "table");

    betoltFoglalasok(`http://localhost:8080/api/helyfoglalas/felhasznalo/${felhasznaloId}`, "hely-lista", "venue");
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

profilAdatokBetoltese();
