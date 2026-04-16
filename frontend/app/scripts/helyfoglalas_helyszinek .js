// asztal_helyszinek.js
const helyszinekDiv = document.getElementById('hely-helyszinek-lista');

async function asztalHelyszinekBetoltese() {
    try {
        const response = await fetch('http://104.248.22.60:8080/api/helyszinek/list');
        const helyszinek = await response.json();

        helyszinekDiv.innerHTML = ''; // Kiürítjük betöltés előtt

        helyszinek.forEach(hely => {

            const kepUrl = `http://104.248.22.60:8080${hely.keputvonal}`;
            helyszinekDiv.innerHTML += `
                <div class="card">
                    <div class="card-image" style="background-image: url('${kepUrl}');">
                        <span class="tag">Venue</span>
                       
                    </div>
                    <div class="card-content">
                    <h3>${hely.nev}</h3>
                    <p class="location"><i class="fa-solid fa-location-dot"></i> ${hely.cim}</p>
                    <div class="details">
                        <span><i class="fa-regular fa-clock"></i> ${hely.nyitvatartas || 'Not set'}</span>
                    </div>

                    <div class="card-footer">
                        <div></div>
                        <button onclick='helyModalMegnyitasa(${JSON.stringify(hely)})' class="btn-foglalas">
                            Venue booking
                        </button>
                    </div>
                    </div>
                </div>
            `;
        });
    } catch (hiba) {
        console.error("Hiba történt a helyszínek betöltésekor:", hiba);
        helyszinekDiv.innerHTML = '<p>Could not load venues.</p>';
    }
}

// Azonnal meghívjuk a betöltést, amint a script lefut
asztalHelyszinekBetoltese();