// --- 1. ADATOK LEKÉRÉSE ÉS SZŰRÉSE ---
// --- 1. ADATOK LEKÉRÉSE ÉS SZŰRÉSE (Cache tiltással) ---
async function getReservations() {
    const szid = localStorage.getItem("nr_szorakozohely_id");

    try {
        // Hozzáadtuk a cache: 'no-store' parancsot, hogy mindig a legfrissebb adatot kérje a szervertől!
        const response = await fetch(`https://nigth-out-reserve.org/api/admin/foglalasok/osszes?szid=${szid}`, {
            cache: 'no-store' 
        });
        
        if (!response.ok) throw new Error("Error during query!");
        
        const adatok = await response.json();

        const lathatoAdatok = adatok.filter(f => f.allapot !== "TELJESITVE");

       return lathatoAdatok.map(f => {
            // MOST MÁR A PONTOS JAVA ENUM SZAVAKAT HASZNÁLJUK!
            let angolStatus = (f.allapot === "JOVAHAGYVA") ? "accepted" : 
                              (f.allapot === "LEMONDVA") ? "rejected" : 
                              (f.allapot === "TELJESITVE") ? "completed" : "pending";

            let reszlet = "Venue rental";
            let tipusKulcs = "helyszin";

            if (f.jatekId) {
                reszlet = f.jatekNev ? `Game: ${f.jatekNev}` : "Game rental";
                tipusKulcs = "jatek";
            } else if (f.asztalId) {
                reszlet = f.asztalSzam ? `Table: ${f.asztalSzam}.` : "Table rental";
                tipusKulcs = "asztal";
            }

            const db_id = f.id || f.helyszinFoglalasId || f.jatekFoglalasId || f.asztalFoglalasId;

            return {
                id: tipusKulcs + "-" + db_id, 
                originalId: db_id,            
                customerName: "Guest #" + (f.felhasznaloId || "?"),
                date: f.kezdet ? new Date(f.kezdet).toLocaleDateString() : "---",
                time: f.kezdet ? new Date(f.kezdet).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "",
                people: f.letszam || "-", 
                place: f.szorakozohelyNev || "Unknown venue",
                typeInfo: reszlet,
                status: angolStatus,
                reservationType: tipusKulcs
            };
        });

    } catch (error) {
        console.error("Dashboard error:", error);
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
        <p class="admin-reservation-customer">Customer: ${reservation.customerName}</p>
    `;

    let actionButtons = '';

    // Gombok ANGOLOSÍTVA
    if (reservation.status === "pending") {
        actionButtons = `
            <button class="admin-btn accept" onclick="updateReservationStatus(${reservation.originalId}, 'accepted', '${reservation.reservationType}')">Accept</button>
            <button class="admin-btn reject" onclick="updateReservationStatus(${reservation.originalId}, 'rejected', '${reservation.reservationType}')">Reject</button>
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
                <i class="fa-solid fa-trash"></i> Delete
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

async function updateReservationStatus(id, newStatus, tipus) {
    console.log("KATTINTÁS TÖRTÉNT! ID:", id, "| Új státusz:", newStatus, "| Típus:", tipus);
    
    // PONTOSAN AZOKAT A SZAVAKAT KÜLDJÜK, AMIT A JAVA ENUM VÁR:
    let javaAllapot = (newStatus === "accepted") ? "JOVAHAGYVA" : 
                      (newStatus === "rejected") ? "LEMONDVA" : 
                      (newStatus === "completed") ? "TELJESITVE" : "FUGGO";

    try {
        const response = await fetch(`https://nigth-out-reserve.org/api/admin/foglalasok/frissit-allapot`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: id, 
                allapot: javaAllapot, 
                tipus: tipus 
            })
        });
        
        if (response.ok) {
            console.log("Sikeres frissítés az adatbázisban!");
            await renderReservations(); // Újrarajzolja a listát!
        } else {
            console.error("A Java hibát dobott visszatéréskor!");
        }
    } catch (error) {
        console.error("Hálózati hiba küldés közben:", error);
    }
}


async function deleteReservation(id, tipus) {
    const result = await Swal.fire({
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
            const response = await fetch(`https://nigth-out-reserve.org/api/admin/foglalasok/torles/${tipus}/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await renderReservations();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "Error while deleting!",
                    background: '#1e1e2d',
                    color: '#fff',
                    confirmButtonColor: '#ef4444'
                });
            }
        } catch (error) {
            console.error("Error while deleting:", error);
        }
    }
}

// --- 4. RENDERELÉS ÉS INICIALIZÁLÁS ---
async function renderReservations() {
    const incomingContainer = document.getElementById("incomingReservations");
    const acceptedContainer = document.getElementById("acceptedReservations");
    const rejectedContainer = document.getElementById("rejectedReservations");

    if (!incomingContainer || !acceptedContainer || !rejectedContainer) {
        return; // Csendben visszatérünk, ha az adott oldalon nincs foglalási tábla
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

    // 2. Alapadatok kiolvasása
    const venueSelector = document.getElementById("venueSelector");
    const helyekListaJson = localStorage.getItem("nr_helyek_lista");
    const aktivSzid = localStorage.getItem("nr_szorakozohely_id");
    const helyszinDisplay = document.getElementById("aktualis-helyszin-neve");

    // --- DINAMIKUS NÉVKIÍRÁS (A lista alapján) ---
    if (helyszinDisplay && helyekListaJson && aktivSzid) {
        const helyek = JSON.parse(helyekListaJson);
        const aktualisHely = helyek.find(h => h.id.toString() === aktivSzid);
        
        if (aktualisHely) {
            helyszinDisplay.textContent = aktualisHely.nev;
            localStorage.setItem("nr_szorakozohely_nev", aktualisHely.nev);
        }
    }

    // --- LEGERDÜLŐ MENÜ FELTÖLTÉSE ---
    if (venueSelector && helyekListaJson) {
        const helyek = JSON.parse(helyekListaJson);
        venueSelector.innerHTML = ""; 
        
        helyek.forEach(hely => {
            const option = document.createElement("option");
            option.value = hely.id;
            option.textContent = hely.nev;
            if (hely.id.toString() === aktivSzid) option.selected = true;
            venueSelector.appendChild(option);
        });

        venueSelector.addEventListener("change", (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            localStorage.setItem("nr_szorakozohely_id", e.target.value);
            localStorage.setItem("nr_szorakozohely_nev", selectedOption.text);
            window.location.reload(); 
        });
    }

    // 3. Kijelentkezés logikája
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
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
    
    const tulajId = localStorage.getItem("nr_admin_id") || localStorage.getItem("nr_felhasznalo_id");

    if (!nev || !varos || !cim || !tulajId) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Entering your name, city, and address is mandatory, and you must log in!",
            background: '#1e1e2d',
            color: '#fff',
            confirmButtonColor: '#ef4444'
        });
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
       const response = await fetch(`https://nigth-out-reserve.org/api/helyszinek/szorakozohelyek/uj`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ujAdat)
    });

        if (response.ok) {
            try {
                const ujHelyVisszajon = await response.json();
                let eddigiHelyek = JSON.parse(localStorage.getItem("nr_helyek_lista")) || [];
                eddigiHelyek.push(ujHelyVisszajon);
                localStorage.setItem("nr_helyek_lista", JSON.stringify(eddigiHelyek));
                localStorage.setItem("nr_szorakozohely_id", ujHelyVisszajon.id);
                localStorage.setItem("nr_szorakozohely_nev", ujHelyVisszajon.nev);
            } catch (storageError) {
                console.warn("Nincs lista:", storageError);
            }
            
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: "Venue successfully added!",
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#8b5cf6'
            });
            document.getElementById('ujHelyModal').style.display='none';
            window.location.reload(); 
        } else {
            const errorText = await response.text();
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: "Error while saving: " + errorText,
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        }
    } catch (error) {
        console.error("Save error:", error);
    }
}

function nyitEszkozModal() {
    const selector = document.getElementById("venueSelector");
    const helyId = selector.value;
    const helyNev = selector.options[selector.selectedIndex].text;

    if (!helyId || helyId === "all") {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Please select a venue from the list",
            background: '#1e1e2d',
            color: '#fff',
            confirmButtonColor: '#ef4444'
        });
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
        const response = await fetch(`https://nigth-out-reserve.org/api/admin/foglalasok/eszkoz/uj`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adatok)
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: "Tool added successfully",
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#8b5cf6'
            });
            document.getElementById("ujEszkozModal").style.display = "none";
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: "Error while saving.",
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        }
    } catch (e) { console.error(e); }
}

async function tulajAdatMentese() {
    const id = document.getElementById('tulaj-id').value;
    const nev = document.getElementById('tulaj-nev').value;
    const email = document.getElementById('tulaj-email').value;
    const telefon = document.getElementById('tulaj-tel').value;

    if (!nev || !email || !telefon) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Please fill in all the details!",
            background: '#1e1e2d',
            color: '#fff',
            confirmButtonColor: '#ef4444'
        });
        return;
    }

    const adatok = {
        id: id ? parseInt(id) : null, 
        teljesNev: nev,
        email: email,
        telefon: telefon
    };

    try {
        const response = await fetch('https://nigth-out-reserve.org/api/tulajdonosok/mentes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adatok)
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: "Your information has been successfully updated!",
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
                confirmButtonColor: '#ef4444'
            });
        }
    } catch (hiba) {
        console.error("Network error:", hiba);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "Could not connect to the server.",
            background: '#1e1e2d',
            color: '#fff',
            confirmButtonColor: '#ef4444'
        });
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    
    // A HIBÁT ITT JAVÍTOTTUK: Betettük a if (elemLetezik) ellenőrzéseket!
    const bejelentkezettId = localStorage.getItem('nr_admin_id'); 

    if (bejelentkezettId) {
        const tulajIdMezo = document.getElementById('tulaj-id');
        if (tulajIdMezo) tulajIdMezo.value = bejelentkezettId;

        try {
            const response = await fetch(`https://nigth-out-reserve.org/api/tulajdonosok/${bejelentkezettId}`);
            
            if (response.ok) {
                const adatok = await response.json();
                
                const tulajNevMezo = document.getElementById('tulaj-nev');
                const tulajEmailMezo = document.getElementById('tulaj-email');
                const tulajTelMezo = document.getElementById('tulaj-tel');

                if (tulajNevMezo) tulajNevMezo.value = adatok.teljesNev || "";
                if (tulajEmailMezo) tulajEmailMezo.value = adatok.email || "";
                if (tulajTelMezo) tulajTelMezo.value = adatok.telefon || "";

            } else {
                console.log("There is no data saved for this profile yet.");
            }
        } catch (error) {
            console.error("Network error while loading data:", error);
        }

    } else {
        console.warn("There is no logged in owner in LocalStorage");
        window.location.href = "./admin-login.html";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    const page = path.split("/").pop();

    if (page === "admin-dashboard.html") {
        const navDash = document.getElementById("nav-dashboard");
        if (navDash) navDash.classList.add("active");
    } else if (page === "admin-helyszinek.html") {
        const navHely = document.getElementById("nav-helyszinek");
        if (navHely) navHely.classList.add("active");
    }
});

function kijelentkezes() {
    localStorage.removeItem("nr_admin_id");
    localStorage.removeItem("nr_szorakozohely_id");
    window.location.href = "admin-login.html";
}