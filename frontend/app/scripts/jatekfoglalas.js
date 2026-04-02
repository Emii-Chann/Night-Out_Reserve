async function modalMegnyitasa(szorakozohelyId, helyNev) {
    // Modal megjelenítése és alap adatok beállítása
    document.getElementById('foglalas-modal').style.display = 'block';
    document.getElementById('modal-cim').innerText = `Book ${helyNev}`;
    document.getElementById('foglalas-szorakozohely-id').value = szorakozohelyId;

    const jatekSelect = document.getElementById('foglalas-jatek');
    jatekSelect.innerHTML = '<option>Betöltés...</option>';

    try {
        // Backend hívása (A 2. lépésben megírt API)
        const response = await fetch(`http://localhost:8080/api/helyszinek/${szorakozohelyId}/jatekok`);
        const jatekok = await response.json();

        // Legördülő opciók generálása
        jatekSelect.innerHTML = '<option value="" disabled selected>Válaszd ki a játékot</option>';
        
        jatekok.forEach(jatek => {
            // jatekId, nev, arOra - ahogy a Java lekérdezésben elneveztük (AS jatekId)
            jatekSelect.innerHTML += `
                <option value="${jatek.jatekId}">
                    ${jatek.nev} (${jatek.arOra} Ft/óra)
                </option>
            `;
        });
    } catch (hiba) {
        console.error("Hiba a játékok letöltésekor", hiba);
        jatekSelect.innerHTML = '<option value="">Hiba a betöltéskor</option>';
    }
}

function modalBezarasa() {
    document.getElementById('foglalas-modal').style.display = 'none';
}
async function foglalasBekuldese() {
    // 1. Adatok összeszedése a formból
    const szorakozohelyId = document.getElementById('foglalas-szorakozohely-id').value;
    const jatekId = document.getElementById('foglalas-jatek').value;
    const datum = document.getElementById('foglalas-datum').value;
    const ido = document.getElementById('foglalas-ido').value;
    const idotartamOra = document.getElementById('foglalas-idotartam').value;

    if(!jatekId || !datum || !ido) {
        alert("Kérlek tölts ki minden mezőt!");
        return;
    }

    // Dátum és idő összerakása ISO formátumba (pl. 2024-05-10T18:00:00) a Spring Boot-nak
    const kezdet = `${datum}T${ido}:00`;
    
    // Vége időpont kiszámítása (Kezdet + idotartamOra)
    const kezdetDatumObj = new Date(kezdet);
    kezdetDatumObj.setHours(kezdetDatumObj.getHours() + parseInt(idotartamOra));
    // Eltüntetjük a Z-t (UTC jelzést) a végéről, hogy a Java LocalDateTime könnyen megegye
    const vege = kezdetDatumObj.toISOString().slice(0, 19); 

    // 2. JSON objektum összeállítása
    const foglalasAdatok = {
        szorakozohelyId: parseInt(szorakozohelyId),
        jatekId: parseInt(jatekId),
        felhasznaloId: 1, // KÉSŐBB: Ezt a bejelentkezett user tokenjéből kell kiszedni!
        kezdet: kezdet,
        vege: vege,
        allapot: 'FOGLALVA'
    };

    // 3. Küldés a Backendnek
    try {
        const response = await fetch('http://localhost:8080/api/jatekok/foglalas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(foglalasAdatok)
        });

        if (response.ok) {
            alert("Sikeres foglalás!");
            modalBezarasa();
        } else {
            alert("Valami hiba történt a mentés során.");
        }
    } catch (hiba) {
        console.error(hiba);
    }
}
