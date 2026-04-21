document.addEventListener("DOMContentLoaded", () => {
    betoltEszkozok();
});

async function betoltEszkozok() {
    const helyszinId = localStorage.getItem("nr_szorakozohely_id");

    if (!helyszinId) {
        Swal.fire("Error", "No venue selected!", "error");
        return;
    }

    try {
        // 1. LÉPÉS: A szórakozóhely nevének lekérése
        const helyResponse = await fetch(`https://nigth-out-reserve.org/api/helyszinek/${helyszinId}`);
        if (helyResponse.ok) {
            const helyAdat = await helyResponse.json();
            document.getElementById("aktualis-helyszin-neve").innerText = helyAdat.nev;
        }

        // 2. LÉPÉS: Az eszközök lekérése (amit már megírtunk)
        const response = await fetch(`https://nigth-out-reserve.org/api/admin/eszkozok/${helyszinId}`);
        const data = await response.json();

        const asztalGrid = document.getElementById("asztalok-grid");
        const jatekGrid = document.getElementById("jatekok-grid");

        asztalGrid.innerHTML = "";
        jatekGrid.innerHTML = "";

        // Asztalok és játékok kirajzolása
        data.asztalok.forEach(asztal => {
            asztalGrid.innerHTML += generaldEszkozKartya(asztal, 'asztal');
        });

        data.jatekok.forEach(jatek => {
            jatekGrid.innerHTML += generaldEszkozKartya(jatek, 'jatek');
        });

    } catch (error) {
        console.error("Error during loading:", error);
    }
}

// Segédfüggvény a kártyákhoz
function generaldEszkozKartya(item, tipus) {
    const azonosito = tipus === 'asztal' ? item.asztalSzam : (item.id || item.jatekId);

    console.log(`Item (${tipus}) ID:`, azonosito);

    const nev = tipus === 'asztal' ? `Table ${item.asztalSzam}` : (item.jatekNev || item.nev || "Game");

    return `
        <div class="eszkoz-kartya">
            <div class="info">
                <h3>${nev}</h3>
                <p>${tipus === 'asztal' ? item.ferohely + ' people' : (item.darab + ' pcs')}</p>
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
        title: 'Are you sure?',
        text: "This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            const res = await fetch(`https://nigth-out-reserve.org/api/admin/eszkozok/${tipus}/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                Swal.fire('Deleted!', 'The item has been removed.', 'success');
                betoltEszkozok(); // Lista frissítése
            }
        } catch (error) {
            Swal.fire('Error!', 'Failed to delete.', 'error');
        }
    }
}

async function szerkesztEszkoz(id, tipus) {
    const modal = document.getElementById("szerkesztEszkozModal");
    document.getElementById("edit-id").value = id;
    document.getElementById("edit-tipus").value = tipus;

    try {
        const response = await fetch(`https://nigth-out-reserve.org/api/admin/eszkoz/${tipus}/${id}`);
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
        console.error("Error loading data:", error);
        Swal.fire("Error", "Failed to fetch item data!", "error");
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
        adatok.asztalSzam = document.getElementById("edit-asztalSzam").value;
        adatok.ferohely = document.getElementById("edit-asztalFerohely").value;
    } else {
        adatok.jatekNev = document.getElementById("edit-jatekNev").value;
        adatok.darab = document.getElementById("edit-jatekDarab").value;
        adatok.ar_ora = document.getElementById("edit-jatekAr").value;
    }

    try {
        const response = await fetch(`https://nigth-out-reserve.org/api/admin/eszkoz/modosit/${tipus}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adatok)
        });

        if (response.ok) {
            Swal.fire("Success", "Item updated!", "success");
            document.getElementById("szerkesztEszkozModal").style.display = "none";
            betoltEszkozok(); // Lista újratöltése
        } else {
            throw new Error("Failed to save");
        }
    } catch (error) {
        Swal.fire("Error", "Failed to save changes!", "error");
    }
}