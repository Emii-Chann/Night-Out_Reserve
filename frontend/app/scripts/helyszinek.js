async function betoltHelyszinek() {
    try {
        const response = await fetch('http://localhost:8080/api/helyszinek/list');
        const adatok = await response.json();

        const kontener = document.getElementById('helyszinek-grid');
        kontener.innerHTML = ""; 

        adatok.forEach(hely => {
            kontener.innerHTML += `
                <div class="hely-kartya">
                    <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop');">
                        <span class="tag">Games</span>
                       
                    </div>
                    <div class="hely-info">
                        <h3>${hely.nev}</h3>
                        <p class="hely-cim"><i class="fa-solid fa-location-dot"></i> ${hely.varos}, ${hely.cim}</p>
                        <p class="hely-nyitva"><i class="fa-regular fa-clock"></i> Open: ${hely.nyitvatartas || 'Not set'}</p>
                        <p class="hely-leiras">${hely.leiras || 'A premium nightlife venue waiting for your event.'}</p>
                        <div class="hely-footer">
                            
                            <button onclick="modalMegnyitasa(${hely.id}, '${hely.nev}', '${hely.nyitvatartas}')" class="btn-foglalas">Game booking</button>
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

