let helyAktualisNyitvatartas = "";

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


function helyModalMegnyitasa(szorakozohely) {
    // 1. Kiszedjük az adatokat az objektumból, hogy a te logikád továbbra is működjön
    const szorakozohelyId = szorakozohely.id;
    const helyNev = szorakozohely.nev;
    const nyitvatartas = szorakozohely.nyitvatartas; // Ha nálad máshogy hívják a modellt, itt írd át!

    helyAktualisNyitvatartas = nyitvatartas;
    document.getElementById('hely-foglalas-modal').style.display = 'flex'; // Nálad flex van, ez tökéletes
    document.getElementById('hely-modal-cim').innerText = `${helyNev} - Venue booking (${nyitvatartas || '0-24'})`;
    document.getElementById('hely-szorakozohely-id').value = szorakozohelyId;

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

    // 3. Dátum beállítása (kiegészítettem azzal, hogy rögtön a mai napot adja meg értéknek)
    const maiDatum = new Date().toISOString().split('T')[0];
    const datumMezo = document.getElementById('hely-datum');
    datumMezo.setAttribute('min', maiDatum);
    datumMezo.value = maiDatum; 

    // 4. --- A TE OKOS IDŐPONT GENERÁLÓD (Változatlanul) ---
    const idoSelect = document.getElementById('hely-ido');
    idoSelect.innerHTML = ''; 

    if (!nyitvatartas || nyitvatartas === "Nincs megadva") {
        for (let i = 0; i < 24; i++) {
            let ora = i < 10 ? '0' + i : i;
            idoSelect.innerHTML += `<option value="${ora}:00">${ora}:00</option>`;
            idoSelect.innerHTML += `<option value="${ora}:30">${ora}:30</option>`;
        }
    } else {
        const [nyit, zar] = nyitvatartas.split('-');
        const [nyitOra, nyitPerc] = nyit.split(':').map(Number);
        let [zarOra, zarPerc] = zar.split(':').map(Number);

        let nyitPercekben = nyitOra * 60 + nyitPerc;
        let zarPercekben = zarOra * 60 + zarPerc;

        if (zarPercekben <= nyitPercekben) {
            zarPercekben += 24 * 60;
        }

        for (let i = nyitPercekben; i < zarPercekben; i += 30) {
            let aktualisOra = Math.floor(i / 60) % 24;
            let aktualisPerc = i % 60;

            let oraStr = aktualisOra < 10 ? '0' + aktualisOra : aktualisOra;
            let percStr = aktualisPerc === 0 ? '00' : aktualisPerc;

            let formatalva = `${oraStr}:${percStr}`;
            idoSelect.innerHTML += `<option value="${formatalva}">${formatalva}</option>`;
        }

        frissitFoglaltHelyIdopontok();
    }
}

function helyModalBezarasa() {
    document.getElementById('hely-foglalas-modal').style.display = 'none';
}

async function helyFoglalasBekuldese() {


    if (!felId) {
        alert("Please log in to make a booking!"); 
        window.location.href = "login.html";
        return;
    }


    const szorakozohelyId = document.getElementById('hely-szorakozohely-id').value;
    const datum = document.getElementById('hely-datum').value;
    const ido = document.getElementById('hely-ido').value;
    const idotartam = document.getElementById('hely-idotartam').value;
    const letszam = document.getElementById('hely-letszam').value;
    const megjegyzes = document.getElementById('hely-megjegyzes').value;

    if(!datum || !ido || !letszam || !idotartam) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Please fill all required fields.",
            background: '#1e1e2d',
            color: '#fff',
            confirmButtonColor: '#8b5cf6'
        });
        return;
    }

    // --- ELLENŐRZÉSEK ---
    const valasztottKezdet = new Date(`${datum}T${ido}`);
    if (valasztottKezdet < new Date()) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "You cannot book in the past.",
            background: '#1e1e2d',
            color: '#fff',
            confirmButtonColor: '#8b5cf6'
        });
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
        felhasznaloId: felId,
        letszam: parseInt(letszam),
        kezdet: formatum(valasztottKezdet),
        vege: formatum(vegeDatumObj),
        megjegyzes: megjegyzes
    };

    try {
        const response = await fetch('https://nigth-out-reserve.org/api/helyfoglalas/mentes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(foglalasAdatok)
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: "Venue booking successful!",
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#8b5cf6'
            });
            helyModalBezarasa();
            document.getElementById('hely-foglalas-form').reset();
        } else if (response.status === 409) {
            // Ha a Java "Conflict" hibát dobott, kiírjuk a szövegét
            const hibaSzoveg = await response.text();
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: hibaSzoveg,
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#8b5cf6'
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: "An error occurred while saving.",
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#8b5cf6'
            });
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
    if (zarPercekben <= nyitPercekben) {
        zarPercekben += 24 * 60;
    }

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
            confirmButtonColor: '#8b5cf6'
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
            confirmButtonColor: '#8b5cf6'
        });
        return false;
    }

    return true;
}


async function frissitFoglaltHelyIdopontok() {
    const helyId = document.getElementById('hely-szorakozohely-id').value; 
    const datum = document.getElementById('hely-datum').value;

    if (!helyId || !datum) return;

    try {
        const response = await fetch(`https://nigth-out-reserve.org/api/helyfoglalas/foglalt-hely-idopontok?szorakozohelyId=${helyId}&datum=${datum}`);
        if (!response.ok) return; 
        
        const foglaltIdopontokBackend = await response.json(); 
        
        const tisztaFoglaltIdopontok = foglaltIdopontokBackend.map(ido => ido.substring(0, 5));

        const idoSelect = document.getElementById('hely-ido'); 
        const opciok = idoSelect.options;

        for (let i = 0; i < opciok.length; i++) {
            let opcio = opciok[i];
            let alapErtek = opcio.value; 

            if (tisztaFoglaltIdopontok.includes(alapErtek)) {
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
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const helyDatumMezo = document.getElementById('hely-foglalas-datum');

    if (helyDatumMezo) {
        helyDatumMezo.addEventListener('change', frissitFoglaltHelyIdopontok);
    }
});