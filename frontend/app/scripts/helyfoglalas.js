let helyAktualisNyitvatartas = "";

function helyModalMegnyitasa(szorakozohelyId, helyNev, nyitvatartas) {
    helyAktualisNyitvatartas = nyitvatartas;
    document.getElementById('hely-foglalas-modal').style.display = 'flex';
    document.getElementById('hely-modal-cim').innerText = `${helyNev} - Venue booking (${nyitvatartas})`;
    document.getElementById('hely-szorakozohely-id').value = szorakozohelyId;

    const maiDatum = new Date().toISOString().split('T')[0];
    document.getElementById('hely-datum').setAttribute('min', maiDatum);


    const idoSelect = document.getElementById('hely-ido');
    idoSelect.innerHTML = ''; // Kiürítjük, ha volt benne valami
    
    // Végigmegyünk a 24 órán, és minden órához hozzáadunk egy :00 és egy :30 opciót
    for (let i = 0; i < 24; i++) {
        let ora = i < 10 ? '0' + i : i; // Hogy 08 legyen, ne csak 8
        
        idoSelect.innerHTML += `<option value="${ora}:00">${ora}:00</option>`;
        idoSelect.innerHTML += `<option value="${ora}:30">${ora}:30</option>`;
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