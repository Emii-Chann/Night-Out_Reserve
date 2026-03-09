const modal = document.getElementById("bookingModal");
const closeBtn = document.querySelector(".close");
const bookBtns = document.querySelectorAll(".book-btn");
const modalTitle = document.getElementById("modalTitle");

// Modal handling (only if modal exists on the page)
if (modal && closeBtn && modalTitle) {
    bookBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            const venueName = this.getAttribute("data-venue");
            modalTitle.innerText = "Book " + venueName;
            modal.style.display = "flex";
        });
    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
}

// Real-time search filtering for location cards
const searchInputs = document.querySelectorAll(".search-bar input");

searchInputs.forEach((input) => {
    input.addEventListener("input", function () {
        const query = this.value.toLowerCase().trim();
        const cards = document.querySelectorAll(".container .card");

        cards.forEach((card) => {
            const nameText =
                (card.querySelector("h3")?.textContent || "").toLowerCase();
            const categoryText =
                (card.querySelector(".tag")?.textContent || "").toLowerCase();
            const locationText =
                (card.querySelector(".location")?.textContent || "").toLowerCase();

            const matches =
                !query ||
                nameText.includes(query) ||
                categoryText.includes(query) ||
                locationText.includes(query);

            card.style.display = matches ? "" : "none";
        });
    });
});

