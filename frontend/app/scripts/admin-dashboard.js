const RESERVATIONS_KEY = "nr_reservations";
const CURRENT_ADMIN_KEY = "nr_current_admin";

function seedSampleReservations() {
    const existing = localStorage.getItem(RESERVATIONS_KEY);
    if (existing) return;

    const sample = [
        {
            id: "r1",
            customerName: "Nagy András",
            date: "2026-03-20",
            time: "20:00",
            people: 10,
            place: "The Purple Lounge",
            status: "pending",
        },
        {
            id: "r2",
            customerName: "Kiss Dóra",
            date: "2026-03-21",
            time: "21:00",
            people: 4,
            place: "Midnight Club",
            status: "pending",
        },
        {
            id: "r3",
            customerName: "Szabó Péter",
            date: "2026-03-22",
            time: "22:00",
            people: 2,
            place: "Neon Sky Bar",
            status: "accepted",
        },
    ];

    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(sample));
}

function getReservations() {
    seedSampleReservations();
    try {
        return JSON.parse(localStorage.getItem(RESERVATIONS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveReservations(reservations) {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
}

function requireAdmin() {
    const current = localStorage.getItem(CURRENT_ADMIN_KEY);
    if (!current) {
        window.location.href = "./admin-login.html";
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
    meta.textContent = `${reservation.date} • ${reservation.time} • ${reservation.people} fő`;
    card.appendChild(meta);

    const customer = document.createElement("p");
    customer.className = "admin-reservation-customer";
    customer.textContent = `Ügyfél: ${reservation.customerName}`;
    card.appendChild(customer);

    if (withActions) {
        const actions = document.createElement("div");
        actions.className = "admin-reservation-actions";

        const acceptBtn = document.createElement("button");
        acceptBtn.className = "admin-btn accept";
        acceptBtn.textContent = "Elfogadás";
        acceptBtn.addEventListener("click", () =>
            updateReservationStatus(reservation.id, "accepted")
        );

        const rejectBtn = document.createElement("button");
        rejectBtn.className = "admin-btn reject";
        rejectBtn.textContent = "Elutasítás";
        rejectBtn.addEventListener("click", () =>
            updateReservationStatus(reservation.id, "rejected")
        );

        actions.appendChild(acceptBtn);
        actions.appendChild(rejectBtn);
        card.appendChild(actions);
    }

    return card;
}

function renderReservations() {
    const incomingContainer = document.getElementById("incomingReservations");
    const acceptedContainer = document.getElementById("acceptedReservations");
    const rejectedContainer = document.getElementById("rejectedReservations");

    if (!incomingContainer || !acceptedContainer || !rejectedContainer) return;

    const reservations = getReservations();

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

function updateReservationStatus(id, newStatus) {
    const reservations = getReservations();
    const index = reservations.findIndex((r) => r.id === id);
    if (index === -1) return;

    reservations[index].status = newStatus;
    saveReservations(reservations);
    renderReservations();
}

// Initialize dashboard when present
document.addEventListener("DOMContentLoaded", () => {
    const incomingContainer = document.getElementById("incomingReservations");
    if (!incomingContainer) return;

    requireAdmin();
    renderReservations();
});

