async function betoltHelyszinek() {
    try {
        const response = await fetch('http://localhost:8080/api/helyszinek/list');
        const adatok = await response.json();

        const kontener = document.getElementById('helyszinek-grid');
        kontener.innerHTML = ""; 

        adatok.forEach(hely => {
            kontener.innerHTML += `
                <div class="hely-kartya">
                    <div class="hely-info">
                        <h3>${hely.nev}</h3>
                        <p class="hely-cim">📍 ${hely.varos}, ${hely.cim}</p>
                        <p class="hely-nyitva">🕒 Nyitva: ${hely.nyitvatartas || 'Nincs megadva'}</p>
                        <p class="hely-leiras">${hely.leiras || 'Kellemes szórakozóhely várja vendégeit.'}</p>
                        <div class="hely-footer">
                            <span>🪑 Asztalok: ${hely.asztalokSzama}</span>
                            <button onclick="foglalas(${hely.id})" class="btn-foglalas">Foglalás</button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (hiba) {
        console.error("Nem sikerült betölteni a helyszíneket:", hiba);
    }
}

document.addEventListener("DOMContentLoaded", betoltHelyszinek);