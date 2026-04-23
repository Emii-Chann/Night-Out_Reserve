async function betoltHelyszinek() {
    try {
        const response = await fetch('https://nigth-out-reserve.org/api/helyszinek/list');
        const adatok = await response.json();

        const kontener = document.getElementById('helyszinek-grid');
        kontener.innerHTML = ""; 
        let megjelenitettHelyekSzama = 0;

        for (const hely of adatok) {
            
            
            try {
                
                const jatekResponse = await fetch(`https://nigth-out-reserve.org/api/helyszinek/jatekok/${hely.id}`);
                const jatekok = await jatekResponse.json();

                
                if (!jatekok || jatekok.length === 0) {
                    continue; 
                }
            } catch (e) {
                console.error("Nem sikerült lekérni a játékokat a helyhez:", hely.nev);
                continue;
            }
            

            megjelenitettHelyekSzama++;
            const kepUrl = `https://nigth-out-reserve.org${hely.keputvonal}`;
            kontener.innerHTML += `
                <div class="card">
                    <div class="card-image" style="background-image: url('${kepUrl}');">
                        <span class="tag">Games</span>
                    </div>
                    <div class="card-content">
                        <h3>${hely.nev}</h3>
                        <p class="location"><i class="fa-solid fa-location-dot"></i> ${hely.varos}, ${hely.cim}</p>
                        <div class="details">
                            <span><i class="fa-regular fa-clock"></i> Open: ${hely.nyitvatartas || 'Not set'}</span>
                        </div>
                        <p class="location">${hely.leiras || 'A premium nightlife venue waiting for your event.'}</p>
                        <div class="card-footer">
                            <div></div>
                            <button onclick='modalMegnyitasa(${JSON.stringify(hely)})' class="btn-foglalas">Game booking</button>
                        </div>
                    </div>
                </div>
            `;
        }

        
        if (megjelenitettHelyekSzama === 0) {
            kontener.innerHTML = '<p class="text-center text-secondary mt-5 fs-4">There are currently no venues with available games.</p>';
        }

    } catch (hiba) {
        console.error("Failed to load venues:", hiba);
        const kontener = document.getElementById('helyszinek-grid');
        if(kontener) kontener.innerHTML = '<p class="text-center text-danger mt-5">Could not load venues.</p>';
    }
}

document.addEventListener("DOMContentLoaded", betoltHelyszinek);