document.addEventListener("DOMContentLoaded", () => {
    betoltEszkozok();
});

async function betoltEszkozok() {
    const helyszinId = localStorage.getItem("nr_szorakozohely_id");

    if (!helyszinId) {
        Swal.fire("Hiba", "Nincs kiválasztott helyszín!", "error");
        return;
    }

    try {
        // 1. LÉPÉS: A szórakozóhely nevének lekérése
        // Itt azt az API-t használd, ami visszaadja a helyszín adatait (nev, cim, stb.)
        const helyResponse = await fetch(`http://104.248.22.60:8080/api/helyszinek/${helyszinId}`);
        if (helyResponse.ok) {
            const helyAdat = await helyResponse.json();
            document.getElementById("aktualis-helyszin-neve").innerText = helyAdat.nev;
        }

        // 2. LÉPÉS: Az eszközök lekérése (amit már megírtunk)
        const response = await fetch(`http://104.248.22.60:8080/api/admin/eszkozok/${helyszinId}`);
        const data = await response.json();

        const asztalGrid = document.getElementById("asztalok-grid");
        const jatekGrid = document.getElementById("jatekok-grid");

        asztalGrid.innerHTML = "";
        jatekGrid.innerHTML = "";

        // Asztalok és játékok kirajzolása (a korábbi generaldEszkozKartya függvénnyel)
        data.asztalok.forEach(asztal => {
            asztalGrid.innerHTML += generaldEszkozKartya(asztal, 'asztal');
        });

        data.jatekok.forEach(jatek => {
            jatekGrid.innerHTML += generaldEszkozKartya(jatek, 'jatek');
        });

    } catch (error) {
        console.error("Hiba a betöltés során:", error);
    }
}

// Segédfüggvény a kártyákhoz, hogy ne írjuk le kétszer
function generaldEszkozKartya(item, tipus) {

    
    // Az asztalnál az asztalSzam az azonosító, a játéknál meg nézd meg a modellt (valószínűleg id)
    const azonosito = tipus === 'asztal' ? item.asztalSzam : (item.id || item.jatekId);

    // Debug: Ha még mindig baj van, nézd meg a konzolon:
    console.log(`Eszköz (${tipus}) azonosítója:`, azonosito);

    const nev = tipus === 'asztal' ? `${item.asztalSzam}. asztal` : (item.jatekNev || item.nev || "Játék");

    return `
        <div class="eszkoz-kartya">
            <div class="info">
                <h3>${nev}</h3>
                <p>${tipus === 'asztal' ? item.ferohely + ' fő' : (item.darab + ' db')}</p>
            </div>
            <div class="akciok">
                <button onclick="szerkesztEszkoz(${azonosito}, '${tipus}')" class="btn-edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="torolEszkoz(${azonosito}, '${tipus}')" class="btn-delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Törlés funkció
async function torolEszkoz(id, tipus) {
    const result = await Swal.fire({
        title: 'Biztos törlöd?',
        text: "Ez a művelet nem vonható vissza!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Igen, töröld!'
    });

    if (result.isConfirmed) {
        try {
            const res = await fetch(`http://104.248.22.60:8080/api/admin/eszkozok/${tipus}/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                Swal.fire('Törölve!', 'Az eszköz eltávolítva.', 'success');
                betoltEszkozok(); // Lista frissítése
            }
        } catch (error) {
            Swal.fire('Hiba!', 'Nem sikerült a törlés.', 'error');
        }
    }
}

async function szerkesztEszkoz(id, tipus) {
    const modal = document.getElementById("szerkesztEszkozModal");
    document.getElementById("edit-id").value = id;
    document.getElementById("edit-tipus").value = tipus;

    try {
        // Lekérjük az adott eszköz aktuális adatait
        const response = await fetch(`http://104.248.22.60:8080/api/admin/eszkoz/${tipus}/${id}`);
        const adat = await response.json();

        if (tipus === 'asztal') {
            document.getElementById("edit-asztalMezok").style.display = "block";
            document.getElementById("edit-jatekMezok").style.display = "none";
            document.getElementById("edit-asztalSzam").value = adat.asztalSzam;
            document.getElementById("edit-asztalFerohely").value = adat.ferohely;
        } else {
            document.getElementById("edit-asztalMezok").style.display = "none";
            document.getElementById("edit-jatekMezok").style.display = "block";
            document.getElementById("edit-jatekNev").value = adat.nev;
            document.getElementById("edit-jatekDarab").value = adat.darab;
            document.getElementById("edit-jatekAr").value = adat.ar_ora || adat.arOra;
        }

        modal.style.display = "block";
    } catch (error) {
        console.error("Hiba az adatok betöltésekor:", error);
        Swal.fire("Hiba", "Nem sikerült lekérni az eszköz adatait!", "error");
    }
}

async function mentesSzerkesztes() {
    const id = document.getElementById("edit-id").value;
    const tipus = document.getElementById("edit-tipus").value;
    const helyszinId = localStorage.getItem("nr_szorakozohely_id");

    let adatok = { 
        id: id,
        szorakozohelyId: helyszinId 
    };

    if (tipus === "asztal") {
        // Fontos: az asztalnál az asztalSzam az ID, de küldjük el a módosított értéket is
        adatok.asztalSzam = document.getElementById("edit-asztalSzam").value;
        adatok.ferohely = document.getElementById("edit-asztalFerohely").value;
    } else {
        adatok.jatekNev = document.getElementById("edit-jatekNev").value;
        adatok.darab = document.getElementById("edit-jatekDarab").value;
        adatok.ar_ora = document.getElementById("edit-jatekAr").value;
    }

    try {
        const response = await fetch(`http://104.248.22.60:8080/api/admin/eszkoz/modosit/${tipus}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adatok)
        });

        if (response.ok) {
            Swal.fire("Siker", "Eszköz frissítve!", "success");
            document.getElementById("szerkesztEszkozModal").style.display = "none";
            betoltEszkozok(); // Lista újratöltése
        } else {
            throw new Error("Sikertelen mentés");
        }
    } catch (error) {
        Swal.fire("Hiba", "Nem sikerült elmenteni a módosításokat!", "error");
    }
}