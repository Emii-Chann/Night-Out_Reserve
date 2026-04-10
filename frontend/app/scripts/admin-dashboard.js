// --- 1. ADATOK LEKÉRÉSE ÉS SZŰRÉSE ---
async function getReservations() {
    const szid = localStorage.getItem("nr_szorakozohely_id");

    if (!szid || szid === "undefined" || szid === "null") {
        console.error("Nincs szórakozóhely ID, jelentkezz be újra!");
        window.location.href = "./admin-login.html";
        return [];
    }

    try {
        const response = await fetch(`http://localhost:8080/api/admin/foglalasok/osszes?szid=${szid}`);
        if (!response.ok) throw new Error("Hiba a lekérdezéskor!");
        
        const adatok = await response.json();

        // Kiszűrjük azokat, amik már teljesítve lettek!
        const lathatoAdatok = adatok.filter(f => f.allapot !== "TELJESITVE");

       return lathatoAdatok.map(f => {
            let angolStatus = (f.allapot === "JOVAHAGYVA" || f.allapot === "ELFOGADVA") ? "accepted" : 
                              (f.allapot === "LEMONDVA" || f.allapot === "ELUTASITVA") ? "rejected" : "pending";

            // --- EZT A RÉSZT CSERÉLD LE: ---
            let reszlet = "Helyszín bérlés";
            let tipusKulcs = "helyszin";

            // Most már az ID-t figyeljük, nem a nevet!
            if (f.jatekId) {
                reszlet = f.jatekNev ? `Játék: ${f.jatekNev}` : "Játék bérlés";
                tipusKulcs = "jatek";
            } else if (f.asztalId || f.asztalSzam) {
                reszlet = f.asztalSzam ? `Asztal: ${f.asztalSzam}.` : "Asztal bérlés";
                tipusKulcs = "asztal";
            }

            // Visszaállítjuk az ID keresést az eredetire (mivel a képeden látszik, hogy f.id a neve)
            const db_id = f.id || f.helyszinFoglalasId || f.jatekFoglalasId || f.asztalFoglalasId;
            // -------------------------------

            return {
                id: tipusKulcs + "-" + db_id, 
                originalId: db_id,            
                customerName: "Vendég #" + (f.felhasznaloId || "?"),
                date: f.kezdet ? new Date(f.kezdet).toLocaleDateString() : "---",
                time: f.kezdet ? new Date(f.kezdet).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "",
                people: f.letszam || f.asztalSzam || "-", 
                place: f.szorakozohelyNev || "Ismeretlen hely",
                typeInfo: reszlet,
                status: angolStatus,
                reservationType: tipusKulcs
            };
        });


    } catch (error) {
        console.error("Dashboard hiba:", error);
        return [];
    }
}

// --- 2. KÁRTYA GENERÁLÁSA (GOMBOKKAL) ---
function createReservationCard(reservation) {
    const card = document.createElement("div");
    card.className = "admin-reservation-card";

    card.innerHTML = `
        <h3>${reservation.place}</h3>
        <p class="admin-reservation-type" style="color: #a29bfe; font-weight: bold;">${reservation.typeInfo}</p>
        <p class="admin-reservation-meta">${reservation.date} • ${reservation.time} • ${reservation.people} fő</p>
        <p class="admin-reservation-customer">Ügyfél: ${reservation.customerName}</p>
    `;

let actionButtons = '';

    if (reservation.status === "pending") {
        actionButtons = `
            <button class="admin-btn accept" onclick="updateReservationStatus(${reservation.originalId}, 'accepted', '${reservation.reservationType}')">Elfogad</button>
            <button class="admin-btn reject" onclick="updateReservationStatus(${reservation.originalId}, 'rejected', '${reservation.reservationType}')">Elutasít</button>
        `;
    } else if (reservation.status === "accepted") {
        actionButtons = `
            <button class="admin-btn" style="background-color: #28a745; color: white;" onclick="updateReservationStatus(${reservation.originalId}, 'completed', '${reservation.reservationType}')">
                <i class="fa-solid fa-check-double"></i> Completed
            </button>
        `;
    } else if (reservation.status === "rejected") {
        actionButtons = `
            <button class="admin-btn" style="background-color: #dc3545; color: white;" onclick="deleteReservation(${reservation.originalId}, '${reservation.reservationType}')">
                <i class="fa-solid fa-trash"></i> Törlés
            </button>
        `;
    }

    if (actionButtons !== '') {
        const actions = document.createElement("div");
        actions.className = "admin-reservation-actions";
        actions.innerHTML = actionButtons;
        card.appendChild(actions);
    }

    return card;
}

// --- 3. BACKEND KOMMUNIKÁCIÓ (FRISSÍTÉS ÉS TÖRLÉS) ---
async function updateReservationStatus(id, newStatus, tipus) {

    console.log("KATTINTÁS TÖRTÉNT! ID:", id, "| Új státusz:", newStatus, "| Típus:", tipus);
    let javaAllapot = (newStatus === "accepted") ? "JOVAHAGYVA" : 
                      (newStatus === "rejected") ? "LEMONDVA" : 
                      (newStatus === "completed") ? "TELJESITVE" : "FUGGOBEN";

    try {
        const response = await fetch(`http://localhost:8080/api/admin/foglalasok/frissit-allapot`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, allapot: javaAllapot, tipus: tipus })
        });
        if (response.ok) await renderReservations();
    } catch (error) {
        console.error("Hiba az állapot frissítésekor:", error);
    }
}

async function deleteReservation(id, tipus) {
    const result = await Swal.fire({ // NEM MŰKÖDIK
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#8b5cf6',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        background: '#1e1e2d',
        color: '#fff'
    });

    if (result.isConfirmed) {
    try {
        const response = await fetch(`http://localhost:8080/api/admin/foglalasok/torles/${tipus}/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            await renderReservations();
        } else {
            alert("Hiba a törlés során!");
        }
    } catch (error) {
        console.error("Hiba a törléskor:", error);
    }
}}

// --- 4. RENDERELÉS ÉS INICIALIZÁLÁS ---
async function renderReservations() {
    const incomingContainer = document.getElementById("incomingReservations");
    const acceptedContainer = document.getElementById("acceptedReservations");
    const rejectedContainer = document.getElementById("rejectedReservations");

    if (!incomingContainer || !acceptedContainer || !rejectedContainer) {
        console.error("Hiba: Hiányzik valamelyik HTML konténer az azonosítók közül!");
        return;
    }

    const reservations = await getReservations();

    incomingContainer.innerHTML = "";
    acceptedContainer.innerHTML = "";
    rejectedContainer.innerHTML = "";

    reservations.forEach((res) => {
        if (res.status === "pending") {
            incomingContainer.appendChild(createReservationCard(res));
        } else if (res.status === "accepted") {
            acceptedContainer.appendChild(createReservationCard(res));
        } else if (res.status === "rejected") {
            rejectedContainer.appendChild(createReservationCard(res));
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Felhasználónév kiírása
    const adminName = localStorage.getItem("nr_current_admin");
    const adminDisplay = document.getElementById("adminNameDisplay");
    if (adminDisplay && adminName) adminDisplay.textContent = adminName;

    // 2. Legördülő menü (Dropdown) logikája
    const venueSelector = document.getElementById("venueSelector");
    const helyekListaJson = localStorage.getItem("nr_helyek_lista");
    const aktivSzid = localStorage.getItem("nr_szorakozohely_id");

    if (venueSelector && helyekListaJson) {
        const helyek = JSON.parse(helyekListaJson);
        helyek.forEach(hely => {
            const option = document.createElement("option");
            option.value = hely.id;
            option.textContent = hely.nev;
            if (hely.id.toString() === aktivSzid) option.selected = true;
            venueSelector.appendChild(option);
        });

        venueSelector.addEventListener("change", (e) => {
            localStorage.setItem("nr_szorakozohely_id", e.target.value);
            window.location.reload(); 
        });
    }

    // 3. Kijelentkezés logikája
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear(); // Minden mentett adatot törlünk
            window.location.href = "./admin-login.html";
        });
    }

    // 4. Foglalások betöltése
    await renderReservations();
});



// Adatok elküldése a backendnek
async function mentesUjHely() {
    const nev = document.getElementById("ujHelyNev").value;
    const varos = document.getElementById("ujHelyVaros").value;
    const cim = document.getElementById("ujHelyCim").value;
    const leiras = document.getElementById("ujHelyLeiras").value;
    const nyitva = document.getElementById("ujHelyNyitva").value;
    const asztalok = document.getElementById("ujHelyAsztalok").value;
    
    // Itt vesszük ki a tulajdonos ID-ját a localStorage-ből! 
    // Kérlek ellenőrizd, hogy a bejelentkezéskor ezen a néven mented-e el!
    const tulajId = localStorage.getItem("nr_admin_id") || localStorage.getItem("nr_felhasznalo_id");

    if (!nev || !varos || !cim || !tulajId) {
        alert("A név, város, cím megadása kötelező, és be kell jelentkezned!");
        return;
    }

    const ujAdat = {
        nev: nev,
        varos: varos,
        cim: cim,
        leiras: leiras,
        nyitvatartas: nyitva,
        asztalok_szama: asztalok,
        tulaj_id: tulajId
    };

    try {
       const response = await fetch(`http://localhost:8080/api/helyszinek/szorakozohelyek/uj`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ujAdat)
    });

        if (response.ok) {
            alert("Szórakozóhely sikeresen felvéve!");
            document.getElementById('ujHelyModal').style.display='none';
            window.location.reload(); 
        } else {
            const errorText = await response.text();
            alert("Hiba történt a mentés során: " + errorText);
        }
    } catch (error) {
        console.error("Mentési hiba:", error);
    }
}

function nyitEszkozModal() {
    const selector = document.getElementById("venueSelector");
    const helyId = selector.value;
    const helyNev = selector.options[selector.selectedIndex].text;

    if (!helyId || helyId === "all") {
        alert("Kérlek, válassz ki egy konkrét szórakozóhelyet a listából!");
        return;
    }

    document.getElementById("aktualisHelyNev").innerText = helyNev;
    document.getElementById("ujEszkozModal").style.display = "block";
}

function valtsEszkozMezoket() {
    const tipus = document.getElementById("eszkozTipus").value;
    document.getElementById("asztalMezok").style.display = tipus === "asztal" ? "block" : "none";
    document.getElementById("jatekMezok").style.display = tipus === "jatek" ? "block" : "none";
}

async function mentesUjEszkoz() {
    const tipus = document.getElementById("eszkozTipus").value;
    const helyId = document.getElementById("venueSelector").value;

    let adatok = { 
        szorakozohelyId: helyId,
        tipus: tipus 
    };

    if (tipus === "asztal") {
        adatok.asztalSzam = document.getElementById("asztalSzam").value;
        adatok.ferohely = document.getElementById("asztalFerohely").value;
    } else {
        adatok.jatekNev = document.getElementById("jatekNev").value;
    adatok.jatekLeiras = document.getElementById("jatekLeiras").value;
        adatok.darab = document.getElementById("jatekDarab").value;
        adatok.ar_ora = document.getElementById("jatekAr").value;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/admin/foglalasok/eszkoz/uj`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adatok)
        });

        if (response.ok) {
            alert("Eszköz sikeresen hozzáadva!");
            document.getElementById("ujEszkozModal").style.display = "none";
        } else {
            alert("Hiba történt a mentés során.");
        }
    } catch (e) { console.error(e); }
}


async function tulajAdatMentese() {
    // Adatok kiolvasása az űrlapból
    const id = document.getElementById('tulaj-id').value;
    const nev = document.getElementById('tulaj-nev').value;
    const email = document.getElementById('tulaj-email').value;
    const telefon = document.getElementById('tulaj-tel').value;

    // Ellenőrzés, hogy nincs-e üres mező
    if (!nev || !email || !telefon) {
        alert("Kérlek, tölts ki minden adatot!");
        return;
    }

    // Összerakjuk a JSON objektumot a Java számára
    const adatok = {
        id: id ? parseInt(id) : null, // Ha van ID, átalakítjuk számmá
        teljesNev: nev,
        email: email,
        telefon: telefon
    };

    try {
        const response = await fetch('http://localhost:8080/api/tulajdonosok/mentes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adatok)
        });

        if (response.ok) {
            alert("Az adataidat sikeresen frissítettük!");
        } else {
            alert("Hiba történt a mentés során.");
        }
    } catch (hiba) {
        console.error("Hálózati hiba:", hiba);
        alert("Nem sikerült kapcsolódni a szerverhez.");
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Olvassuk ki az ID-t a localStorage-ből (Ahogy eddig is)
    const bejelentkezettId = localStorage.getItem('nr_admin_id'); 

    if (bejelentkezettId) {
        // Beírjuk a rejtett mezőbe a mentéshez
        document.getElementById('tulaj-id').value = bejelentkezettId;

        // 2. OKOS RÉSZ: Lekérjük a meglévő adatokat a Java backendről
        try {
            const response = await fetch(`http://localhost:8080/api/tulajdonosok/${bejelentkezettId}`);
            
            if (response.ok) {
                // Ha a Java talált adatot, kibontjuk
                const adatok = await response.json();
                
                // És automatikusan beírjuk az input mezőkbe!
                document.getElementById('tulaj-nev').value = adatok.teljesNev || "";
                document.getElementById('tulaj-email').value = adatok.email || "";
                document.getElementById('tulaj-tel').value = adatok.telefon || "";
            } else {
                // Ha 404-et kapunk (még nem mentett el semmit a múltban),
                // akkor simán üresen hagyjuk az űrlapot, hadd töltse ki először.
                console.log("Még nincsenek elmentett adatok ehhez a profilhoz.");
            }
        } catch (error) {
            console.error("Hálózati hiba az adatok betöltésekor:", error);
        }

    } else {
        console.warn("Nincs bejelentkezett tulajdonos a localStorage-ben!");
    }
});

