let aktualisNyitvatartas = "";

async function asztalModalMegnyitasa(szorakozohelyId, helyNev, nyitvatartas) {
    aktualisNyitvatartas = nyitvatartas;
    document.getElementById('asztal-foglalas-modal').style.display = 'flex';
    document.getElementById('asztal-modal-cim').innerText = `${helyNev} - Table booking (${nyitvatartas})`;
    document.getElementById('asztal-szorakozohely-id').value = szorakozohelyId;

    const maiDatum = new Date().toISOString().split('T')[0];
    document.getElementById('asztal-datum').setAttribute('min', maiDatum);

    const idoSelect = document.getElementById('asztal-ido');
    idoSelect.innerHTML = ''; // Kiürítjük, ha volt benne valami
    
    // Végigmegyünk a 24 órán, és minden órához hozzáadunk egy :00 és egy :30 opciót
    for (let i = 0; i < 24; i++) {
        let ora = i < 10 ? '0' + i : i; // Hogy 08 legyen, ne csak 8
        
        idoSelect.innerHTML += `<option value="${ora}:00">${ora}:00</option>`;
        idoSelect.innerHTML += `<option value="${ora}:30">${ora}:30</option>`;
    }

    const asztalSelect = document.getElementById('asztal-szam-select');
    asztalSelect.innerHTML = '<option>Loading...</option>';

    try {
        // Backend hívása az asztalokért
        const response = await fetch(`http://localhost:8080/api/asztalok/${szorakozohelyId}/list`);
        const asztalok = await response.json();

        asztalSelect.innerHTML = '<option value="" disabled selected>Select a table</option>';
        
        asztalok.forEach(asztal => {
            asztalSelect.innerHTML += `
                <option value="${asztal.asztal_szam}" data-ferohely="${asztal.ferohely}">
                    Table ${asztal.asztalSzam} (${asztal.ferohely} seats)
                </option>
            `;
        });
    } catch (hiba) {
        console.error("Error loading tables", hiba);
        asztalSelect.innerHTML = '<option value="">Failed to load</option>';
    }
    // Figyeljük, ha a felhasználó asztalt választ
    asztalSelect.addEventListener('change', function() {
        const kivalasztottOption = this.options[this.selectedIndex];
        const maxFerohely = kivalasztottOption.getAttribute('data-ferohely');
        const letszamInput = document.getElementById('asztal-letszam');
        
        if (maxFerohely) {
            letszamInput.setAttribute('max', maxFerohely); // Beállítja a HTML max értéket
            
            // Ha a jelenleg beírt létszám nagyobb lenne, mint a max férőhely, visszavesszük a maximumra
            if (parseInt(letszamInput.value) > parseInt(maxFerohely)) {
                letszamInput.value = maxFerohely;
            }
        }
    });

}

function asztalModalBezarasa() {
    document.getElementById('asztal-foglalas-modal').style.display = 'none';
}

async function asztalFoglalasBekuldese() {
    const szorakozohelyId = document.getElementById('asztal-szorakozohely-id').value;
    const asztalSzam = document.getElementById('asztal-szam-select').value;
    const letszam = document.getElementById('asztal-letszam').value;
    const datum = document.getElementById('asztal-datum').value;
    const ido = document.getElementById('asztal-ido').value;



    
    if(!asztalSzam || !datum || !ido || !letszam) {
        alert("Please fill all fields.");
        return;
    }

    const asztalSelect = document.getElementById('asztal-szam-select');
    const kivalasztottOption = asztalSelect.options[asztalSelect.selectedIndex];
    const maxFerohely = kivalasztottOption.getAttribute('data-ferohely');

    if (maxFerohely && parseInt(letszam) > parseInt(maxFerohely)) {
        alert(`This table allows maximum ${maxFerohely} people. Please choose a larger table or reduce the guest count.`);
        return; // Megállítjuk a küldést
    }

    // Alapértelmezetten 2 órára foglaljuk az asztalt (ezt később bővítheted, ha kell)
    const idotartamOra = 2; 

    // --- ELLENŐRZÉSEK (ugyanaz a logika, mint a játékoknál) ---
    const valasztottKezdet = new Date(`${datum}T${ido}`);
    if (valasztottKezdet < new Date()) {
        alert("You cannot book in the past.");
        return;
    }

    // Feltételezve, hogy az ellenorizNyitvatartas függvényt globálisan elérjük (pl. a jatekfoglalas.js-ből, vagy átmásolod ide is)
    if (typeof ellenorizNyitvatartas === "function" && !ellenorizNyitvatartas(ido, idotartamOra, aktualisNyitvatartas)) {
        return; 
    }

    // --- DÁTUM FORMÁZÁS ---
    const formatum = (date) => {
        const pad = (n) => n < 10 ? '0' + n : n;
        return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
               'T' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
    };

    const vegeDatumObj = new Date(valasztottKezdet);
    vegeDatumObj.setHours(vegeDatumObj.getHours() + idotartamOra);

    const foglalasAdatok = {
        szorakozohelyId: parseInt(szorakozohelyId),
        asztalSzam: parseInt(asztalSzam),
        letszam: parseInt(letszam),
        felhasznaloId: 1, 
        kezdet: formatum(valasztottKezdet),
        vege: formatum(vegeDatumObj),
        allapot: 'FOGLALVA'
    };
    try {
        const response = await fetch('http://localhost:8080/api/asztalok/foglalas', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(foglalasAdatok)
        });

        if (response.ok) {
            alert("Table booking successful!");
            asztalModalBezarasa();
        } else if (response.status === 409) {
            // Ha az asztal foglalt, ezt az üzenetet kapjuk a Spring Boot-tól
            const hibaSzoveg = await response.text();
            alert(hibaSzoveg);
        } else {
            alert("An error occurred while saving.");
        }
    } catch (hiba) {
        console.error(hiba);
    }
}