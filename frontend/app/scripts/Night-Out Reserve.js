const modal = document.getElementById("bookingModal");
const closeBtn = document.querySelector(".close");
const bookBtns = document.querySelectorAll(".book-btn");
const modalTitle = document.getElementById("modalTitle");


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




document.addEventListener("DOMContentLoaded", () => {
    
    const searchInput = document.querySelector(".search-bar input") || document.querySelector('input[placeholder*="Search"]') || document.querySelector('input[type="text"]');
    
    
    const searchButton = document.querySelector(".search-bar button") || document.querySelector('.search-btn');

    function performSearch() {
        if (!searchInput) return;
        const query = searchInput.value.toLowerCase().trim();
        
        
        const cards = document.querySelectorAll(".card");

        cards.forEach((card) => {
            
            const cardText = card.textContent.toLowerCase();

            
            if (!query || cardText.includes(query)) {
                card.style.display = ""; 
            } else {
                card.style.display = "none"; 
            }
        });
    }

    if (searchInput) {
        
        searchInput.addEventListener("input", performSearch);
        
        
        if (searchButton) {
            searchButton.addEventListener("click", (e) => {
                e.preventDefault();
                performSearch();
            });
        }
    }
});