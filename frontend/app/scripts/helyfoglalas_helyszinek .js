// asztal_helyszinek.js
const helyszinekDiv = document.getElementById('hely-helyszinek-lista');

async function asztalHelyszinekBetoltese() {
    try {
        const response = await fetch('http://localhost:8080/api/helyszinek/list');
        const helyszinek = await response.json();

        helyszinekDiv.innerHTML = ''; // Kiürítjük betöltés előtt

        helyszinek.forEach(hely => {
            helyszinekDiv.innerHTML += `
                <div class="helyszin-kartya">
                    <h3>${hely.nev}</h3>
                    <p>${hely.cim}</p>
                    <p>Nyitva: ${hely.nyitvatartas}</p>
                    
                    <button onclick="helyModalMegnyitasa(${hely.id}, '${hely.nev}', '${hely.nyitvatartas}')" class="btn-foglalas">
                        Hely foglalás
                    </button>
                </div>
            `;
        });
    } catch (hiba) {
        console.error("Hiba történt a helyszínek betöltésekor:", hiba);
        helyszinekDiv.innerHTML = '<p>Nem sikerült betölteni a helyszíneket.</p>';
    }
}

// Azonnal meghívjuk a betöltést, amint a script lefut
asztalHelyszinekBetoltese();