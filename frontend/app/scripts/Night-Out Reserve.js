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
// --- BIZTOSAN MŰKÖDŐ KERESŐ (Real-time search) ---

document.addEventListener("DOMContentLoaded", () => {
    // Keresünk egy input mezőt, ami valószínűleg a kereső (több eshetőséggel biztosítva)
    const searchInput = document.querySelector(".search-bar input") || document.querySelector('input[placeholder*="Search"]') || document.querySelector('input[type="text"]');
    
    // Ha van kereső gomb, azt is megfogjuk
    const searchButton = document.querySelector(".search-bar button") || document.querySelector('.search-btn');

    function performSearch() {
        if (!searchInput) return;
        const query = searchInput.value.toLowerCase().trim();
        
        // Lekérjük az összes kártyát a weboldalon (akárhol is vannak)
        const cards = document.querySelectorAll(".card");

        cards.forEach((card) => {
            // A legbiztosabb: lekérjük a kártya TELJES szövegét (cím, helyszín, kategória egyben)
            const cardText = card.textContent.toLowerCase();

            // Ha a keresett szó benne van a kártyában, vagy üres a kereső, mutatjuk
            if (!query || cardText.includes(query)) {
                card.style.display = ""; // Látható
            } else {
                card.style.display = "none"; // Elrejtve
            }
        });
    }

    if (searchInput) {
        // Valós időben keres, ahogy gépel a felhasználó
        searchInput.addEventListener("input", performSearch);
        
        // Ha rányom a "Search" gombra, akkor is fusson le
        if (searchButton) {
            searchButton.addEventListener("click", (e) => {
                e.preventDefault();
                performSearch();
            });
        }
    }
});