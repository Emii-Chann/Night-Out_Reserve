async function betoltHelyszinek() {
    try {
        const response = await fetch('http://localhost:8080/api/helyszinek/list');
        const adatok = await response.json();

        const kontener = document.getElementById('helyszinek-grid');
        kontener.innerHTML = ""; 

        adatok.forEach(hely => {

            const kepUrl = `http://localhost:8080${hely.keputvonal}`;
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
        });
    } catch (hiba) {
        console.error("Nem sikerült betölteni a helyszíneket:", hiba);
    }
}

// EZ A SOR HIÁNYZOTT! Ez mondja meg, hogy amint betölt az oldal, azonnal induljon el a függvény.
document.addEventListener("DOMContentLoaded", betoltHelyszinek);

