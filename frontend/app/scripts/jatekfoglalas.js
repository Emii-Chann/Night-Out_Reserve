let aktualisNyitvatartas = "";

async function modalMegnyitasa(szorakozohelyId, helyNev, nyitvatartas) {
    aktualisNyitvatartas = nyitvatartas;
    const maiDatum = new Date().toISOString().split('T')[0];
    document.getElementById('foglalas-datum').setAttribute('min', maiDatum);
    // Modal megjelenítése és alap adatok beállítása
    document.getElementById('foglalas-modal').style.display = 'flex';
    document.getElementById('modal-cim').innerText = `Book ${helyNev} (${nyitvatartas})`;
    document.getElementById('foglalas-szorakozohely-id').value = szorakozohelyId;

    const idoSelect = document.getElementById('foglalas-ido');
    idoSelect.innerHTML = ''; // Kiürítjük, ha volt benne valami

    // Végigmegyünk a 24 órán, és minden órához hozzáadunk egy :00 és egy :30 opciót
    for (let i = 0; i < 24; i++) {
        let ora = i < 10 ? '0' + i : i; // Hogy 08 legyen, ne csak 8

        idoSelect.innerHTML += `<option value="${ora}:00">${ora}:00</option>`;
        idoSelect.innerHTML += `<option value="${ora}:30">${ora}:30</option>`;
    }

    const jatekSelect = document.getElementById('foglalas-jatek');
    jatekSelect.innerHTML = '<option>Loading...</option>';

    try {
        // Backend hívása (A 2. lépésben megírt API)
        const response = await fetch(`http://localhost:8080/api/helyszinek/jatekok/${szorakozohelyId}`);
        const jatekok = await response.json();

        // Legördülő opciók generálása
        jatekSelect.innerHTML = '<option value="" disabled selected>Select a game</option>';

        jatekok.forEach(jatek => {
            // MOST MÁR: jatek.id (mivel a sima Jatek entitást kapjuk a Javaból)
            jatekSelect.innerHTML += `
                <option value="${jatek.id}">
                    ${jatek.nev} (${jatek.arOra} HUF/hour)
                </option>
            `;
        });
    } catch (hiba) {
        console.error("Error loading games", hiba);
        jatekSelect.innerHTML = '<option value="">Failed to load</option>';
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



    if (!jatekId || !datum || !ido) {
        alert("Please fill all fields.");
        return;
    }

    // Dátum és idő összerakása ISO formátumba (pl. 2024-05-10T18:00:00) a Spring Boot-nak
    const kezdet = `${datum}T${ido}:00`;
    const kezdetDatumObj = new Date(kezdet);

    // Vége időpont kiszámítása
    const vegeDatumObj = new Date(kezdetDatumObj);
    vegeDatumObj.setHours(vegeDatumObj.getHours() + parseInt(idotartamOra));

    // Helyi idő formázása (YYYY-MM-DDTHH:mm:ss)
    const formatum = (date) => {
        const pad = (n) => n < 10 ? '0' + n : n;
        return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
            'T' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
    };

    const kezdetISO = formatum(kezdetDatumObj);
    const vegeISO = formatum(vegeDatumObj);

    // --- ELLENŐRZÉSEK ---

    // A: Múltbeli időpont ellenőrzése
    const most = new Date();
    const valasztottKezdet = new Date(`${datum}T${ido}`);
    if (valasztottKezdet < most) {
        alert("You cannot book in the past.");
        return;
    }

    // B: Nyitvatartás ellenőrzése (NEM egyszerűsítve)
    if (!ellenorizNyitvatartas(ido, idotartamOra, aktualisNyitvatartas)) {
        return; // Megállítjuk a folyamatot, ha zárva van
    }




    // 2. JSON objektum összeállítása
    const foglalasAdatok = {
        szorakozohelyId: parseInt(szorakozohelyId),
        jatekId: parseInt(jatekId),
        felhasznaloId: 1, // KÉSŐBB: Ezt a bejelentkezett user tokenjéből kell kiszedni!
        kezdet: kezdetISO, // Itt kezdetISO-t használunk
        vege: vegeISO,
    };

    // 3. Küldés a Backendnek
    try {
        const response = await fetch('http://localhost:8080/api/jatekok/mentes', { // IDE A TE VÉGPONTOD KERÜLJÖN!
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },


            body: JSON.stringify(foglalasAdatok)
        });

        if (response.ok) {
            alert("Sikeres foglalás!");
            modalBezarasa();
        } else if (response.status === 409) {
            // Ha a Java "Conflict" hibát dob, kiírjuk a szövegét
            const hibaSzoveg = await response.text();
            alert(hibaSzoveg);
        } else {
            alert("Hiba történt a mentés során.");
        }
    } catch (hiba) {
        console.error(hiba);
    }
}

