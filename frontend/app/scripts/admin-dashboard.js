const RESERVATIONS_KEY = "nr_reservations";
const CURRENT_ADMIN_KEY = "nr_current_admin";



async function getReservations() {

// 1. Kiolvassuk a bejelentkezett tulajdonos szórakozóhelyének ID-ját
    const szid = localStorage.getItem("nr_szorakozohely_id");

    // Ha valamiért nincs ilyen ID (pl. régi munkamenet), dobjuk ki a loginra
    if (!szid || szid === "undefined" || szid === "null") {
        console.error("Nincs szórakozóhely ID, jelentkezz be újra!");
        window.location.href = "./admin-login.html";
        return [];
    }


    try {
        // Most már a kombinált végpontot hívjuk!
       const response = await fetch(`http://localhost:8080/api/admin/foglalasok/osszes?szid=${szid}`);
        
        console.log("Szerver válasz státusz:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error("Hiba a lekérdezéskor: " + errorText);
        }
        
        const adatok = await response.json();


    



        return adatok.map(f => {
    let angolStatus = (f.allapot === "JOVAHAGYVA") ? "accepted" : 
                      (f.allapot === "LEMONDVA") ? "rejected" : "pending";

    // Típus meghatározása
    let reszlet = "Helyszín bérlés";
    let tipusKulcs = "helyszin";

    if (f.jatekNev) {
        reszlet = `Játék: ${f.jatekNev}`;
        tipusKulcs = "jatek";
    } else if (f.asztalSzam) {
        reszlet = `Asztal: ${f.asztalSzam}.`;
        tipusKulcs = "asztal";
    }

    return {
        id: f.id || f.asztalFoglalasId || f.jatekFoglalasId || f.helyszinFoglalasId,
        customerName: "Vendég #" + (f.felhasznaloId || "?"),
        date: f.kezdet ? new Date(f.kezdet).toLocaleDateString() : "---",
        time: f.kezdet ? new Date(f.kezdet).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "",
        people: f.letszam || f.asztalSzam || "-", 
        place: f.szorakozohelyNev || "Neon Bár",
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



// A kártya generálása (hogy látszódjon, mi ez)
function createReservationCard(reservation, withActions) {
    const card = document.createElement("div");
    card.className = "admin-reservation-card";

    card.innerHTML = `
        <h3>${reservation.place}</h3>
        <p class="admin-reservation-type" style="color: #a29bfe; font-weight: bold;">${reservation.typeInfo}</p>
        <p class="admin-reservation-meta">${reservation.date} • ${reservation.time} • ${reservation.people} fő</p>
        <p class="admin-reservation-customer">Ügyfél: ${reservation.customerName}</p>
    `;

    if (withActions) {
        const actions = document.createElement("div");
        actions.className = "admin-reservation-actions";

        const acceptBtn = document.createElement("button");
        acceptBtn.className = "admin-btn accept";
        acceptBtn.textContent = "Elfogad";
        acceptBtn.onclick = () => updateReservationStatus(reservation.id, "accepted", reservation.reservationType);

        const rejectBtn = document.createElement("button");
        rejectBtn.className = "admin-btn reject";
        rejectBtn.textContent = "Elutasít";
        rejectBtn.onclick = () => updateReservationStatus(reservation.id, "rejected", reservation.reservationType);

        actions.appendChild(acceptBtn);
        actions.appendChild(rejectBtn);
        card.appendChild(actions);
    }
    return card;
}





// Az állapot frissítése a backend felé
async function updateReservationStatus(id, newStatus, tipus) {
    let javaAllapot = (newStatus === "accepted") ? "JOVAHAGYVA" : "LEMONDVA";

    try {
        const response = await fetch(`http://localhost:8080/api/admin/foglalasok/frissit-allapot`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: id, 
                allapot: javaAllapot,
                tipus: tipus 
            })
        });

        if (response.ok) await renderReservations();
    } catch (error) {
        console.error("Hiba:", error);
    }
}



async function renderReservations() {
    const incomingContainer = document.getElementById("incomingReservations");
    const acceptedContainer = document.getElementById("acceptedReservations");
    const rejectedContainer = document.getElementById("rejectedReservations");

    if (!incomingContainer || !acceptedContainer || !rejectedContainer) return;

    // Ide bekerült az await szó! Megvárjuk, amíg megjön a szervertől a válasz.
    const reservations = await getReservations();

    incomingContainer.innerHTML = "";
    acceptedContainer.innerHTML = "";
    rejectedContainer.innerHTML = "";

    reservations.forEach((res) => {
        if (res.status === "pending") {
            incomingContainer.appendChild(createReservationCard(res, true));
        } else if (res.status === "accepted") {
            acceptedContainer.appendChild(createReservationCard(res, false));
        } else if (res.status === "rejected") {
            rejectedContainer.appendChild(createReservationCard(res, false));
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Oldal betöltve, indítom a rendert...");
    await renderReservations(); 
});


document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    const adminName = localStorage.getItem("nr_current_admin");
    const adminDisplay = document.getElementById("adminNameDisplay");

    // Megjelenítjük, ki van belépve
    if (adminDisplay && adminName) {
        adminDisplay.textContent = adminName;
    }

    const venueSelector = document.getElementById("venueSelector");
    const helyekListaJson = localStorage.getItem("nr_helyek_lista");
    const aktivSzid = localStorage.getItem("nr_szorakozohely_id");

    if (venueSelector && helyekListaJson) {
        const helyek = JSON.parse(helyekListaJson);

        // 1. Feltöltjük a legördülő menüt a tulajdonos helyeivel
        helyek.forEach(hely => {
            const option = document.createElement("option");
            option.value = hely.id;
            option.textContent = hely.nev;
            
            // Ha ez az épp kiválasztott hely, akkor legyen "selected"
            if (hely.id.toString() === aktivSzid) {
                option.selected = true;
            }
            
            venueSelector.appendChild(option);
        });

        // 2. Ha a tulajdonos KIVÁLASZT egy másik helyet a menüből
        venueSelector.addEventListener("change", (e) => {
            const ujSzid = e.target.value;
            
            // Elmentjük az újat aktívként
            localStorage.setItem("nr_szorakozohely_id", ujSzid);
            
            // Újratöltjük az oldalt (vagy újra meghívjuk a getReservations() függvényt)
            window.location.reload(); 
        });
    }




    // KIJELENTKEZÉS LOGIKA
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            // 1. Töröljük a belépési adatokat a böngészőből
            localStorage.removeItem("nr_current_admin");
            localStorage.removeItem("nr_admin_id");
            localStorage.removeItem("nr_szorakozohely_id");

            // 2. Opcionális: üzenet a júzernek
            console.log("Kijelentkezés sikeres.");

            // 3. Visszairányítás a login oldalra
            window.location.href = "./admin-login.html";
        });
    }

    // BIZTONSÁGI ÖR: Ha nincs ID, ne is engedjük látni a dashboardot
    if (!localStorage.getItem("nr_admin_id")) {
        window.location.href = "./admin-login.html";
    }
});