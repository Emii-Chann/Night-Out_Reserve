let aktualisNyitvatartas = "";

let felId = null;

// Dinamikusan kiolvassuk az ID-t a tokenből
const token = localStorage.getItem("token");
if (token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // ITT A VARÁZSLAT: Pontosan azt a kulcsot használjuk, amit a képen láttunk!
        felId = payload.userId; 
        
    } catch (error) {
        console.error("Hiba a token dekódolásakor:", error);
    }
}

async function asztalModalMegnyitasa(szorakozohely) {
    // 1. Kiszedjük az adatokat az objektumból, hogy a te logikád továbbra is működjön
    const szorakozohelyId = szorakozohely.id;
    const helyNev = szorakozohely.nev;
    const nyitvatartas = szorakozohely.nyitvatartas; // Ha nálad máshogy hívják a modellt, itt írd át!

    helyAktualisNyitvatartas = nyitvatartas;
    document.getElementById('asztal-foglalas-modal').style.display = 'flex'; // Nálad flex van, ez tökéletes
    document.getElementById('hely-modal-cim').innerText = `${helyNev} - Venue booking (${nyitvatartas || '0-24'})`;
    document.getElementById('asztal-szorakozohely-id').value = szorakozohelyId;

    console.log("Ezt az objektumot kapta a JS:", szorakozohely);

    // ---------------------------------------------------------
    // 2. ÚJ RÉSZ: JOBB OLDALI PANEL KITÖLTÉSE
    // ---------------------------------------------------------
    document.getElementById('info-hely-nev').innerText = helyNev || "Not specified";
    document.getElementById('info-hely-varos').innerText = szorakozohely.varos || "Not specified";
    document.getElementById('info-hely-cim').innerText = szorakozohely.cim || "Not specified";
    document.getElementById('info-hely-tipus').innerText = szorakozohely.tipus || "General";

    // Tulajdonos adatai (ellenőrizzük, hogy létezik-e)
  if (szorakozohely.tulajokAdatai) {
        // ITT FIGYELJ A VALTOZÓNEVEKRE: teljesNev és telefon!
        document.getElementById('info-tulaj-nev').innerText = szorakozohely.tulajokAdatai.teljesNev || "No data";
        document.getElementById('info-tulaj-email').innerText = szorakozohely.tulajokAdatai.email || "No data";
        document.getElementById('info-tulaj-tel').innerText = szorakozohely.tulajokAdatai.telefon || "No data";
    } else {
        document.getElementById('info-tulaj-nev').innerText = "No data";
        document.getElementById('info-tulaj-email').innerText = "No data";
        document.getElementById('info-tulaj-tel').innerText = "No data";
    }
    // ---------------------------------------------------------


   const maiDatum = new Date().toISOString().split('T')[0];
    const datumMezo = document.getElementById('asztal-datum');
    datumMezo.setAttribute('min', maiDatum);
    datumMezo.value = maiDatum;

    const idoSelect = document.getElementById('asztal-ido');
    idoSelect.innerHTML = ''; 

    // Ha véletlenül nincs nyitvatartás, visszaállunk a 0-24-es alapértelmezésre
    if (!nyitvatartas || nyitvatartas === "Nincs megadva") {
        for (let i = 0; i < 24; i++) {
            let ora = i < 10 ? '0' + i : i;
            idoSelect.innerHTML += `<option value="${ora}:00">${ora}:00</option>`;
            idoSelect.innerHTML += `<option value="${ora}:30">${ora}:30</option>`;
        }
    } else {
        // --- AZ OKOS IDŐPONT GENERÁLÓ ---
        const [nyit, zar] = nyitvatartas.split('-');
        const [nyitOra, nyitPerc] = nyit.split(':').map(Number);
        let [zarOra, zarPerc] = zar.split(':').map(Number);

        // Mindent átváltunk percekbe a könnyebb számolásért
        let nyitPercekben = nyitOra * 60 + nyitPerc;
        let zarPercekben = zarOra * 60 + zarPerc;

        // Az éjféli trükk: ha a záróra másnap van (pl. 18:00 - 02:00)
        if (zarPercekben <= nyitPercekben) {
            zarPercekben += 24 * 60;
        }

        // 30 perces lépésekkel végigmegyünk a nyitvatartáson
        for (let i = nyitPercekben; i < zarPercekben; i += 30) {
            // Visszaváltjuk a perceket óra:perc formátumra
            let aktualisOra = Math.floor(i / 60) % 24; // A % 24 miatt a 25:00-ból 01:00 lesz!
            let aktualisPerc = i % 60;

            let oraStr = aktualisOra < 10 ? '0' + aktualisOra : aktualisOra;
            let percStr = aktualisPerc === 0 ? '00' : aktualisPerc;

            let formatalva = `${oraStr}:${percStr}`;
            idoSelect.innerHTML += `<option value="${formatalva}">${formatalva}</option>`;
        }
    }

    const asztalSelect = document.getElementById('asztal-szam-select');
    asztalSelect.innerHTML = '<option>Loading...</option>';

    try {
        // Backend hívása az asztalokért
        const response = await fetch(`http://104.248.22.60:8080/api/asztalok/${szorakozohelyId}/list`);
        const asztalok = await response.json();

        asztalSelect.innerHTML = '<option value="" disabled selected>Select a table</option>';
        
        asztalok.forEach(asztal => {
            asztalSelect.innerHTML += `
                <option value="${asztal.asztalSzam}" data-ferohely="${asztal.ferohely}">
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

    if (!felId) {
        alert("Please log in to make a booking!"); 
        window.location.href = "login.html";
        return;
    }
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

    // Feltételezve, hogy az ellenorizNyitvatartas függvényt globálisan elérjük
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
        felhasznaloId: felId, 
        kezdet: formatum(valasztottKezdet),
        vege: formatum(vegeDatumObj),
    };
    try {
        const response = await fetch('http://104.248.22.60:8080/api/asztalok/foglalas', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(foglalasAdatok)
        });

        if (response.ok) {
            alert("Table booking successful!");
            location.reload();
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


async function frissitFoglaltAsztalIdopontok() {
    const szorakozohelyId = document.getElementById('asztal-szorakozohely-id').value; 
    const asztalSzam = document.getElementById('asztal-szam-select').value; 
    const datum = document.getElementById('asztal-datum').value;

    console.log("Küldöm az adatokat:", {szorakozohelyId, asztalSzam, datum});

    if (!szorakozohelyId || !asztalSzam || !datum) return;
    try {
        const url = `http://104.248.22.60:8080/api/asztalok/foglalt-asztal-idopontok?szorakozohelyId=${szorakozohelyId}&asztalSzam=${asztalSzam}&datum=${datum}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error("Hiba a szerveroldalon:", response.status);
            return;
        }

        const foglaltIdopontok = await response.json(); 

        const idoSelect = document.getElementById('asztal-ido');
        const opciok = idoSelect.options;

        for (let i = 0; i < opciok.length; i++) {
            let opcio = opciok[i];
            let alapErtek = opcio.value; 

            if (foglaltIdopontok.includes(alapErtek)) {
                opcio.disabled = true; 
                opcio.text = alapErtek + " (Booked ❌)";
                opcio.style.color = "red";
            } else {
                opcio.disabled = false; 
                opcio.text = alapErtek;
                opcio.style.color = ""; 
            }
        }
    } catch (error) {
        console.error("Hiba az asztal időpontok lekérésekor:", error);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const asztalDatumMezo = document.getElementById('asztal-datum');
    const asztalValasztoMezo = document.getElementById('asztal-szam-select');

    if (asztalDatumMezo) {
        asztalDatumMezo.addEventListener('change', frissitFoglaltAsztalIdopontok);
    }
    if (asztalValasztoMezo) {
        asztalValasztoMezo.addEventListener('change', frissitFoglaltAsztalIdopontok);
    }
});