let helyAktualisNyitvatartas = "";

function helyModalMegnyitasa(szorakozohelyId, helyNev, nyitvatartas) {
    helyAktualisNyitvatartas = nyitvatartas;
    document.getElementById('hely-foglalas-modal').style.display = 'flex';
    document.getElementById('hely-modal-cim').innerText = `${helyNev} - Venue booking (${nyitvatartas})`;
    document.getElementById('hely-szorakozohely-id').value = szorakozohelyId;

    const maiDatum = new Date().toISOString().split('T')[0];
    document.getElementById('hely-datum').setAttribute('min', maiDatum);


    const idoSelect = document.getElementById('hely-ido');
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
}

function helyModalBezarasa() {
    document.getElementById('hely-foglalas-modal').style.display = 'none';
}

async function helyFoglalasBekuldese() {
    const szorakozohelyId = document.getElementById('hely-szorakozohely-id').value;
    const datum = document.getElementById('hely-datum').value;
    const ido = document.getElementById('hely-ido').value;
    const idotartam = document.getElementById('hely-idotartam').value;
    const letszam = document.getElementById('hely-letszam').value;
    const megjegyzes = document.getElementById('hely-megjegyzes').value;

    if(!datum || !ido || !letszam || !idotartam) {
        alert("Please fill all required fields.");
        return;
    }

    // --- ELLENŐRZÉSEK ---
    const valasztottKezdet = new Date(`${datum}T${ido}`);
    if (valasztottKezdet < new Date()) {
        alert("You cannot book in the past.");
        return;
    }

    // Feltételezzük, hogy az ellenorizNyitvatartas függvényt már megírtuk valamelyik közös JS fájlban
    if (typeof ellenorizNyitvatartas === "function" && !ellenorizNyitvatartas(ido, idotartam, helyAktualisNyitvatartas)) {
        return; 
    }

    // --- DÁTUM FORMÁZÁS (Helyi idő) ---
    const formatum = (date) => {
        const pad = (n) => n < 10 ? '0' + n : n;
        return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
               'T' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
    };

    const vegeDatumObj = new Date(valasztottKezdet);
    vegeDatumObj.setHours(vegeDatumObj.getHours() + parseInt(idotartam));

    // A JSON felépítése (pontosan egyezik a Java HelyFoglalas modellel)
    const foglalasAdatok = {
        szorakozohelyId: parseInt(szorakozohelyId),
        felhasznaloId: 1, // Fix azonosító egyelőre
        letszam: parseInt(letszam),
        kezdet: formatum(valasztottKezdet),
        vege: formatum(vegeDatumObj),
        megjegyzes: megjegyzes
    };

    try {
        const response = await fetch('http://localhost:8080/api/helyfoglalas/mentes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(foglalasAdatok)
        });

        if (response.ok) {
            alert("Venue booking successful!");
            helyModalBezarasa();
            document.getElementById('hely-foglalas-form').reset();
        } else if (response.status === 409) {
            // Ha a Java "Conflict" hibát dobott, kiírjuk a szövegét
            const hibaSzoveg = await response.text();
            alert(hibaSzoveg);
        } else {
            alert("An error occurred while saving.");
        }
    } catch (hiba) {
        console.error("Network error:", hiba);
    }
}

function ellenorizNyitvatartas(valasztottIdo, idotartam, nyitvatartasStr) {
    if (!nyitvatartasStr || nyitvatartasStr === "Nincs megadva") return true;

    const [nyit, zar] = nyitvatartasStr.split('-');
    const [nyitOra, nyitPerc] = nyit.split(':').map(Number);
    let [zarOra, zarPerc] = zar.split(':').map(Number);

    const [vOra, vPerc] = valasztottIdo.split(':').map(Number);
    
    let nyitPercekben = nyitOra * 60 + nyitPerc;
    let zarPercekben = zarOra * 60 + zarPerc;
    let kezdetPercekben = vOra * 60 + vPerc;
    let vegPercekben = kezdetPercekben + (parseInt(idotartam) * 60);

    // --- AZ ÉJFÉLI TRÜKK ---
    // Ha a záróra kisebb, mint a nyitvatartás (pl. 18:00 - 02:00), 
    // akkor a záróra a következő napon van (+24 óra).
    if (zarPercekben <= nyitPercekben) {
        zarPercekben += 24 * 60;
    }

    // Ha a felhasználó éjfél utánra foglal (pl. hajnali 1-re), 
    // de a hely még az "előző napi" nyitvatartásban van benne:
    if (kezdetPercekben < nyitPercekben && kezdetPercekben < zarPercekben - (24 * 60)) {
        kezdetPercekben += 24 * 60;
        vegPercekben += 24 * 60;
    }
    // -----------------------

    if (kezdetPercekben < nyitPercekben) {
        alert(`The venue is not open yet. Opening time: ${nyit}`);
        return false;
    }
    
    if (vegPercekben > zarPercekben) {
        alert(`This booking exceeds closing time. Closing time: ${zar}`);
        return false;
    }

    return true;
}


async function frissitFoglaltHelyIdopontok() {
    // Kérlek, ezeket az ID-kat igazítsd a helyfoglalós HTML fájlodhoz!
    const helyId = document.getElementById('hely-szorakozohely-id').value; 
    const datum = document.getElementById('hely-foglalas-datum').value;

    // Itt most csak 2 adatot ellenőrzünk
    if (!helyId || !datum) return;

    try {
        // Hívjuk az egyszerűsített URL-t:
        const response = await fetch(`http://localhost:8080/api/foglalt-hely-idopontok?szorakozohelyId=${helyId}&datum=${datum}`);
        if (!response.ok) return; 
        
        const foglaltIdopontok = await response.json(); 
        const idoSelect = document.getElementById('hely-foglalas-ido'); // A helyfoglalós <select> ID-ja!
        const opciok = idoSelect.options;

        for (let i = 0; i < opciok.length; i++) {
            let opcio = opciok[i];
            let alapErtek = opcio.value; 

            if (foglaltIdopontok.includes(alapErtek)) {
                opcio.disabled = true; 
                opcio.text = alapErtek + " (Foglalt ❌)";
                opcio.style.color = "red";
            } else {
                opcio.disabled = false; 
                opcio.text = alapErtek;
                opcio.style.color = ""; 
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// Eseményfigyelő a helyfoglalás dátum mezőjére (ezt is a fájl végére, a DOMContentLoaded blokkba):
document.addEventListener('DOMContentLoaded', () => {
    const helyDatumMezo = document.getElementById('hely-foglalas-datum');

    // Itt csak a dátum változását kell figyelnünk, hiszen nincs külön kiválasztható eszköz
    if (helyDatumMezo) {
        helyDatumMezo.addEventListener('change', frissitFoglaltHelyIdopontok);
    }
});