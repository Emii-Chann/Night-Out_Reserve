const modal = document.getElementById("bookingModal");
const closeBtn = document.querySelector(".close");
const bookBtns = document.querySelectorAll(".book-btn");
const modalTitle = document.getElementById("modalTitle");


bookBtns.forEach((btn) => {
    btn.addEventListener("click", function() {
        const venueName = this.getAttribute("data-venue");
        modalTitle.innerText = "Book " + venueName;
        modal.style.display = "flex";
    });
});


closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target == modal) {
        modal.style.display = "none";
    }
});

