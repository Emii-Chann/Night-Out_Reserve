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

async function modalMegnyitasa(szorakozohely) {
    // 1. Kiszedjük az adatokat az objektumból, hogy a te logikád továbbra is működjön
    const szorakozohelyId = szorakozohely.id;
    const helyNev = szorakozohely.nev;
    const nyitvatartas = szorakozohely.nyitvatartas; // Ha nálad máshogy hívják a modellt, itt írd át!

    helyAktualisNyitvatartas = nyitvatartas;
    document.getElementById('jatek-foglalas-modal').style.display = 'flex'; // Nálad flex van, ez tökéletes
    document.getElementById('hely-modal-cim').innerText = `${helyNev} - Venue booking (${nyitvatartas || '0-24'})`;
    document.getElementById('foglalas-szorakozohely-id').value = szorakozohelyId;

    console.log("Ezt az objektumot kapta a JS:", szorakozohely);

    // ---------------------------------------------------------
    // 2. ÚJ RÉSZ: JOBB OLDALI PANEL KITÖLTÉSE
    // ---------------------------------------------------------
    document.getElementById('info-hely-nev').innerText = helyNev || "Nincs megadva";
    document.getElementById('info-hely-varos').innerText = szorakozohely.varos || "Nincs megadva";
    document.getElementById('info-hely-cim').innerText = szorakozohely.cim || "Nincs megadva";
    document.getElementById('info-hely-tipus').innerText = szorakozohely.tipus || "Általános";

    // Tulajdonos adatai (ellenőrizzük, hogy létezik-e)
    if (szorakozohely.tulajokAdatai) {
        // ITT FIGYELJ A VALTOZÓNEVEKRE: teljesNev és telefon!
        document.getElementById('info-tulaj-nev').innerText = szorakozohely.tulajokAdatai.teljesNev || "Nincs adat";
        document.getElementById('info-tulaj-email').innerText = szorakozohely.tulajokAdatai.email || "Nincs adat";
        document.getElementById('info-tulaj-tel').innerText = szorakozohely.tulajokAdatai.telefon || "Nincs adat";
    } else {
        document.getElementById('info-tulaj-nev').innerText = "Nincs adat";
        document.getElementById('info-tulaj-email').innerText = "Nincs adat";
        document.getElementById('info-tulaj-tel').innerText = "Nincs adat";
    }
    // ---------------------------------------------------------


    const maiDatum = new Date().toISOString().split('T')[0];
    const datumMezo = document.getElementById('foglalas-datum');
    datumMezo.setAttribute('min', maiDatum);
    datumMezo.value = maiDatum;

    const idoSelect = document.getElementById('foglalas-ido');
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
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `The venue is not open yet. Opening time: ${nyit}`,
            background: '#1e1e2d',
            color: '#fff',
            confirmButtonColor: '#ef4444'
        });
        return false;
    }

    if (vegPercekben > zarPercekben) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `This booking exceeds closing time. Closing time: ${zar}`,
            background: '#1e1e2d',
            color: '#fff',
            confirmButtonColor: '#ef4444'
        });
        return false;
    }

    return true;
}
function modalBezarasa() {
    document.getElementById('jatek-foglalas-modal').style.display = 'none';
}
async function foglalasBekuldese() {


    if (!felId) {
        // (Ezt majd lecserélheted SweetAlert-re!)
        alert("Kérlek, lépj be a foglaláshoz!"); 
        window.location.href = "login.html";
        return;
    }
    // 1. Adatok összeszedése a formból
    const szorakozohelyId = document.getElementById('foglalas-szorakozohely-id').value;
    const jatekId = document.getElementById('foglalas-jatek').value;
    const datum = document.getElementById('foglalas-datum').value;
    const ido = document.getElementById('foglalas-ido').value;
    const idotartamOra = document.getElementById('foglalas-idotartam').value;



    if (!jatekId || !datum || !ido) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Please fill all fields.",
            background: '#1e1e2d',
            color: '#fff',
            confirmButtonColor: '#ef4444'
        });
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
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "You cannot book in the past.",
            background: '#1e1e2d',
            color: '#fff',
            confirmButtonColor: '#ef4444'
        });
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

    console.log("Mielőtt elküldöm a Java-nak:", foglalasAdatok);

    // 3. Küldés a Backendnek
    try {
        const response = await fetch('http://localhost:8080/api/jatekok/mentes', { // IDE A TE VÉGPONTOD KERÜLJÖN!
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },


            body: JSON.stringify(foglalasAdatok)
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: "Sikeres foglalás!",
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#8b5cf6'
            });
            modalBezarasa();
        } else if (response.status === 409) {
            // Ha a Java "Conflict" hibát dob, kiírjuk a szövegét
            const hibaSzoveg = await response.text();
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: hibaSzoveg,
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: "Hiba történt a mentés során.",
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        }
    } catch (hiba) {
        console.error(hiba);
    }
}

// Ezt a függvényt hívjuk meg, ha módosul a dátum vagy a játék
async function frissitFoglaltIdopontok() {
    // ITT A JAVÍTÁS: A rejtett mezőből olvassuk ki a szórakozóhely ID-t!
    const szorakozohelyId = document.getElementById('foglalas-szorakozohely-id').value;
    const jatekId = document.getElementById('foglalas-jatek').value;
    const datum = document.getElementById('foglalas-datum').value;

    if (!szorakozohelyId || !jatekId || !datum) return;

    try {
        // 2. A fetch-ben is szorakozohelyId-t használunk a ${ }-ben!
        // De a kérdőjel után az kell, amit a JAVA vár (ha a Java 'helyId'-t vár, akkor helyId=...)
        const response = await fetch(`http://localhost:8080/api/jatekok/foglalt-idopontok?helyId=${szorakozohelyId}&jatekId=${jatekId}&datum=${datum}`);

        if (!response.ok) {
            console.error("Szerver hiba:", response.status);
            return;
        }

        const foglaltIdopontok = await response.json();
        const idoSelect = document.getElementById('foglalas-ido');
        const opciok = idoSelect.options;

        for (let i = 0; i < opciok.length; i++) {
            let opcio = opciok[i];

            // Ha az opcióban már benne van a (Foglalt) szöveg, akkor az alapÉrtéket tisztítsuk meg róla
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
        console.error("Hiba az időpontok lekérésekor:", error);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const datumMezo = document.getElementById('foglalas-datum');
    const jatekMezo = document.getElementById('foglalas-jatek');

    if (datumMezo) {
        datumMezo.addEventListener('change', frissitFoglaltIdopontok);
    }
    if (jatekMezo) {
        jatekMezo.addEventListener('change', frissitFoglaltIdopontok);
    }
});
