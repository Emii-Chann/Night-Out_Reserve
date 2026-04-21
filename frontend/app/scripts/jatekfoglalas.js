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
    const szorakozohelyId = szorakozohely.id;
    const helyNev = szorakozohely.nev;
    const nyitvatartas = szorakozohely.nyitvatartas; 

    helyAktualisNyitvatartas = nyitvatartas;
    document.getElementById('jatek-foglalas-modal').style.display = 'flex'; 
    document.getElementById('hely-modal-cim').innerText = `${helyNev} - Venue booking (${nyitvatartas || '0-24'})`;
    document.getElementById('foglalas-szorakozohely-id').value = szorakozohelyId;

    console.log("Ezt az objektumot kapta a JS:", szorakozohely);

    // ---------------------------------------------------------
    // 2. JOBB OLDALI PANEL KITÖLTÉSE
    // ---------------------------------------------------------
    document.getElementById('info-hely-nev').innerText = helyNev || "Not specified";
    document.getElementById('info-hely-varos').innerText = szorakozohely.varos || "Not specified";
    document.getElementById('info-hely-cim').innerText = szorakozohely.cim || "Not specified";
    document.getElementById('info-hely-tipus').innerText = szorakozohely.tipus || "General";

    if (szorakozohely.tulajokAdatai) {
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
    const datumMezo = document.getElementById('foglalas-datum');
    datumMezo.setAttribute('min', maiDatum);
    datumMezo.value = maiDatum;

    const idoSelect = document.getElementById('foglalas-ido');
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
    }

    const jatekSelect = document.getElementById('foglalas-jatek');
    jatekSelect.innerHTML = '<option>Loading...</option>';

    try {
        const response = await fetch(`https://nigth-out-reserve.org/api/helyszinek/jatekok/${szorakozohelyId}`);
        const jatekok = await response.json();

        jatekSelect.innerHTML = '<option value="" disabled selected>Select a game</option>';

        jatekok.forEach(jatek => {
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

    if (zarPercekben <= nyitPercekben) {
        zarPercekben += 24 * 60;
    }

    if (kezdetPercekben < nyitPercekben && kezdetPercekben < zarPercekben - (24 * 60)) {
        kezdetPercekben += 24 * 60;
        vegPercekben += 24 * 60;
    }

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
        alert("Please log in to make a booking!"); 
        window.location.href = "login.html";
        return;
    }

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

    const kezdet = `${datum}T${ido}:00`;
    const kezdetDatumObj = new Date(kezdet);

    const vegeDatumObj = new Date(kezdetDatumObj);
    vegeDatumObj.setHours(vegeDatumObj.getHours() + parseInt(idotartamOra));

    const formatum = (date) => {
        const pad = (n) => n < 10 ? '0' + n : n;
        return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
            'T' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
    };

    const kezdetISO = formatum(kezdetDatumObj);
    const vegeISO = formatum(vegeDatumObj);

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

    if (!ellenorizNyitvatartas(ido, idotartamOra, aktualisNyitvatartas)) {
        return; 
    }

    const foglalasAdatok = {
        szorakozohelyId: parseInt(szorakozohelyId),
        jatekId: parseInt(jatekId),
        felhasznaloId: felId, 
        kezdet: kezdetISO, 
        vege: vegeISO,
    };

    try {
        const response = await fetch('https://nigth-out-reserve.org/api/jatekok/mentes', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(foglalasAdatok)
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: "Booking successful!",
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#8b5cf6'
            });
            modalBezarasa();
        } else if (response.status === 409) {
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
                text: "An error occurred while saving.",
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        }
    } catch (hiba) {
        console.error(hiba);
    }
}

async function frissitFoglaltIdopontok() {
    const szorakozohelyId = document.getElementById('foglalas-szorakozohely-id').value;
    const jatekId = document.getElementById('foglalas-jatek').value;
    const datum = document.getElementById('foglalas-datum').value;

    if (!szorakozohelyId || !jatekId || !datum) return;

    try {
        const response = await fetch(`https://nigth-out-reserve.org/api/jatekok/foglalt-idopontok?helyId=${szorakozohelyId}&jatekId=${jatekId}&datum=${datum}`);

        if (!response.ok) {
            console.error("Server error:", response.status);
            return;
        }

        const foglaltIdopontok = await response.json();
        const idoSelect = document.getElementById('foglalas-ido');
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
        console.error("Error fetching times:", error);
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