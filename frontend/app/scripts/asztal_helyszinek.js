const helyszinekDiv = document.getElementById('asztal-helyszinek-lista');

async function asztalHelyszinekBetoltese() {
    try {
        const response = await fetch('https://nigth-out-reserve.org/api/helyszinek/list');
        const helyszinek = await response.json();

        helyszinekDiv.innerHTML = ''; 
        let megjelenitettHelyekSzama = 0; 

        for (const hely of helyszinek) {
            
            
            try {
                
                const asztalResponse = await fetch(`https://nigth-out-reserve.org/api/asztalok/${hely.id}/list`);
                const asztalok = await asztalResponse.json();

                
                if (!asztalok || asztalok.length === 0) {
                    continue; 
                }
            } catch (e) {
                console.error("Nem sikerült lekérni az asztalokat a helyhez:", hely.nev);
                continue; 
            }
            

            megjelenitettHelyekSzama++; 
            const kepUrl = `https://nigth-out-reserve.org${hely.keputvonal}`;
            
            helyszinekDiv.innerHTML += `
                <div class="card">
                    <div class="card-image" style="background-image: url('${kepUrl}');">
                        <span class="tag">Table</span>
                    </div>
                    <div class="card-content">
                    <h3>${hely.nev}</h3>
                    <p class="location"><i class="fa-solid fa-location-dot"></i> ${hely.varos}, ${hely.cim}</p>
                    <div class="details">
                        <span><i class="fa-regular fa-clock"></i> ${hely.nyitvatartas || 'Not set'}</span>
                    </div>

                    <div class="card-footer">
                        <div></div>
                        <button onclick='asztalModalMegnyitasa(${JSON.stringify(hely)})' class="btn-foglalas">
                            Table booking
                        </button>
                    </div>
                    </div>
                </div>
            `;
        }

        
        if (megjelenitettHelyekSzama === 0) {
            helyszinekDiv.innerHTML = '<p class="text-center text-secondary mt-5 fs-4">There are currently no venues with available tables.</p>';
        }

    } catch (hiba) {
        console.error("Hiba történt a helyszínek betöltésekor:", hiba);
        helyszinekDiv.innerHTML = '<p class="text-center text-danger mt-5">Could not load venues.</p>';
    }
}


asztalHelyszinekBetoltese();