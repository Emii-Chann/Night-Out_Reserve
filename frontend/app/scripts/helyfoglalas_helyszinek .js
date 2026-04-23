const helyszinekDiv = document.getElementById('hely-helyszinek-lista');

async function asztalHelyszinekBetoltese() {
    try {
        const response = await fetch('https://nigth-out-reserve.org/api/helyszinek/list');
        const helyszinek = await response.json();

        helyszinekDiv.innerHTML = ''; 
        let megjelenitettHelyekSzama = 0;

        helyszinek.forEach(hely => {
            let tisztaLeiras = hely.leiras || "";
            
            // --- ÚJ RÉSZ: Ellenőrizzük a rejtett kódot! ---
            // Ha benne van a [NEM_BERELHETO], akkor a vendég nem láthatja, átugorjuk!
            if (tisztaLeiras.includes("[NEM_BERELHETO]")) {
                return; 
            }
            // ----------------------------------------------

            megjelenitettHelyekSzama++;
            const kepUrl = `https://nigth-out-reserve.org${hely.keputvonal}`;
            helyszinekDiv.innerHTML += `
                <div class="card">
                    <div class="card-image" style="background-image: url('${kepUrl}');">
                        <span class="tag">Venue</span>
                    </div>
                    <div class="card-content">
                    <h3>${hely.nev}</h3>
                    <p class="location"><i class="fa-solid fa-location-dot"></i>${hely.varos}, ${hely.cim}</p>
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

        if (megjelenitettHelyekSzama === 0) {
            helyszinekDiv.innerHTML = '<p class="text-center text-secondary mt-5 fs-4">There are currently no venues available for full booking.</p>';
        }

    } catch (hiba) {
        console.error("Error loading venues:", hiba);
        helyszinekDiv.innerHTML = '<p class="text-center text-danger mt-5">Could not load venues.</p>';
    }
}

asztalHelyszinekBetoltese();