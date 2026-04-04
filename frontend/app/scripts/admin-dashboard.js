const RESERVATIONS_KEY = "nr_reservations";
const CURRENT_ADMIN_KEY = "nr_current_admin";



async function getReservations() {
    try {
        // Meghívjuk a te új Java végpontodat
        const response = await fetch("http://localhost:8080/api/admin/foglalasok/asztalok");
        if (!response.ok) throw new Error("Hiba a lekérdezéskor");
        
        const adatok = await response.json();

        console.log("1. Ezt küldte a Java backend:", adatok);
        // A Java adatokat (szorakozohelyId, kezdet, stb.) 
        // "lefordítjuk" arra a formátumra, amit a frontendesed kártyái várnak
        return adatok.map(f => {
        let angolStatus = "pending";
        if (f.allapot === "FUGGO") angolStatus = "pending";
        else if (f.allapot === "JOVAHAGYVA") angolStatus = "accepted";
        else if (f.allapot === "LEMONDVA") angolStatus = "rejected";

    return {
        id: f.id, 
        customerName: "Vendég #" + f.felhasznaloId, 
        date: new Date(f.kezdet).toLocaleDateString(),
        time: new Date(f.kezdet).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        // ITT A LÉNYEG: f.letszam helyett f.asztalSzam-ot írj!
        people: f.asztalSzam || 0, 
        place: f.szorakozohelyNev || "The Purple Lounge", // Ha a Java még null-t küld, adjunk neki egy nevet
        status: angolStatus
    };
});
    } catch (error) {
        console.error("Dashboard hiba:", error);
        return [];
    }
}



function createReservationCard(reservation, withActions) {
    const card = document.createElement("div");
    card.className = "admin-reservation-card";

    const title = document.createElement("h3");
    title.textContent = reservation.place;
    card.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "admin-reservation-meta";
    meta.textContent = `${reservation.date} • ${reservation.time} • ${reservation.people} people`;
    card.appendChild(meta);

    const customer = document.createElement("p");
    customer.className = "admin-reservation-customer";
    customer.textContent = `Customer: ${reservation.customerName}`;
    card.appendChild(customer);

    if (withActions) {
        const actions = document.createElement("div");
        actions.className = "admin-reservation-actions";

        const acceptBtn = document.createElement("button");
        acceptBtn.className = "admin-btn accept";
        acceptBtn.textContent = "Accept";
        acceptBtn.addEventListener("click", () =>
            updateReservationStatus(reservation.id, "accepted")
        );

        const rejectBtn = document.createElement("button");
        rejectBtn.className = "admin-btn reject";
        rejectBtn.textContent = "Reject";
        rejectBtn.addEventListener("click", () =>
            updateReservationStatus(reservation.id, "rejected")
        );

        actions.appendChild(acceptBtn);
        actions.appendChild(rejectBtn);
        card.appendChild(actions);
    }

    return card;
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
async function updateReservationStatus(id, newStatus) {
    let javaAllapot = "";
    if (newStatus === "accepted") javaAllapot = "JOVAHAGYVA";
    else if (newStatus === "rejected") javaAllapot = "LEMONDVA";

    try {
        const response = await fetch(`http://localhost:8080/api/admin/foglalasok/asztalok/${id}/allapot`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ allapot: javaAllapot })
        });

        if (response.ok) {
            // SIKER! Frissítjük a kijelzőt, hogy a kártya átugorjon a helyére
            await renderReservations();
        }
    } catch (error) {
        console.error("Hiba az állapot módosításakor:", error);
    }
}
// Initialize dashboard when present
document.addEventListener("DOMContentLoaded", async () => {
    const incomingContainer = document.getElementById("incomingReservations");
    if (!incomingContainer) return;

    requireAdmin();
    await renderReservations(); // Ide is kell az await!
});

