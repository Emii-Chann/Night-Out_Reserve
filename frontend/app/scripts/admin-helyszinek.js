document.addEventListener("DOMContentLoaded", betoltAdminHelyszinek);

async function betoltAdminHelyszinek() {
    const adminId = localStorage.getItem("nr_admin_id");
    if (!adminId) return;

    try {
        const response = await fetch(`http://104.248.22.60:8080/api/helyszinek/list/${adminId}`);
        const adatok = await response.json();

        const kontener = document.getElementById('admin-helyszin-grid');
        kontener.innerHTML = ""; 

        adatok.forEach(hely => {
          const kepUrl = `http://104.248.22.60:8080${hely.keputvonal}`;

            // JSON biztonságos formázása a gombokhoz
            const helyJson = JSON.stringify(hely).replace(/'/g, "&#39;");

            kontener.innerHTML += `
                <div class="card" style="display: flex; flex-direction: column; background-color: #1e1e2d; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                    
                    <div class="card-image" style="background-image: url('${kepUrl}'); height: 160px; background-size: cover; background-position: center; position: relative;">
                        <span class="tag" style="position: absolute; top: 12px; left: 12px; background: rgba(139, 92, 246, 0.9); color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase;">Venue</span>
                    </div>
                    
                    <div class="card-content" style="padding: 15px; display: flex; flex-direction: column; flex-grow: 1;">
                        <h3 style="color: white; margin: 0 0 8px 0; font-size: 1.2rem;">${hely.nev}</h3>
                        <p style="color: #a0a0b0; font-size: 0.85rem; margin-bottom: 5px;">
                            <i class="fa-solid fa-location-dot"></i> ${hely.varos}, ${hely.cim}
                        </p>
                        <p style="color: #8b5cf6; font-size: 0.85rem; margin-bottom: 10px; font-weight: 500;">
                            Tables: ${hely.asztalokSzama} pcs
                        </p>
                        <p style="color: #d1d5db; font-size: 0.8rem; line-height: 1.4; margin-bottom: 20px; flex-grow: 1;">
                            ${hely.leiras || 'No description provided.'}
                        </p>

                        <div style="display: flex; gap: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
                            
                            <button onclick="nyitEszkozModal(${hely.id}, '${hely.nev}')" 
                                style="flex: 1; padding: 10px 5px; background: #8b5cf6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">
                                <i class="fa-solid fa-plus"></i> +Item
                            </button>

                            <button onclick="helyszinSzerkesztes(${hely.id})" 
                                style="flex: 1; padding: 10px 5px; background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border: 1px solid #8b5cf6; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">
                                <i class="fa-solid fa-pen"></i> Edit
                            </button>

                            <button onclick="helyszinTorles(${hely.id})" 
                                style="flex: 1; padding: 10px 5px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">
                                <i class="fa-solid fa-trash"></i> Delete
                            </button>

                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error loading admin venues:", error);
    }
}
async function helyszinTorles(id) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This process cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#4b5563',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`http://104.248.22.60:8080/api/helyszinek/${id}`, { method: 'DELETE' });
            if (response.ok) {
                Swal.fire('Deleted!', 'The venue has been successfully removed.', 'success');
                betoltAdminHelyszinek();
            }
        } catch (error) {
            Swal.fire('Error!', 'Failed to delete.', 'error');
        }
    }
}

async function mentesUjHely() {
    const formData = new FormData();
    
    formData.append('nev', document.getElementById('uj-nev').value);
    formData.append('varos', document.getElementById('uj-varos').value);
    formData.append('cim', document.getElementById('uj-cim').value);
    formData.append('nyitvatartas', document.getElementById('uj-nyitvatartas').value);
    formData.append('leiras', document.getElementById('uj-leiras').value);
    formData.append('asztalokSzama', document.getElementById('uj-asztalszam').value);
    formData.append('tulajId', localStorage.getItem("nr_admin_id"));

    const kepInput = document.getElementById('uj-kep'); 
    if (kepInput && kepInput.files[0]) {
        formData.append('kep', kepInput.files[0]);
    }

    try {
        const response = await fetch(`http://104.248.22.60:8080/api/helyszinek/uj-hely-form-data`, {
            method: 'POST', 
            body: formData 
        });

        if (response.ok) {
            Swal.fire("Success!", "New venue saved along with the image.", "success").then(() => {
                document.getElementById('ujHelyModal').style.display = 'none';
                betoltAdminHelyszinek();
            });
        } else {
            throw new Error("Error during saving");
        }
    } catch (error) {
        console.error(error);
        Swal.fire("Error!", "Failed to create new venue.", "error");
    }
}

function nyitEszkozModal(helyId, helyNev) {
    document.getElementById("aktualisHelyNev").innerText = helyNev;
    document.getElementById("ujEszkozModal").setAttribute("data-aktiv-hely-id", helyId);
    document.getElementById("ujEszkozModal").style.display = "block";
}

function valtsEszkozMezoket() {
    const tipus = document.getElementById("eszkozTipus").value;
    document.getElementById("asztalMezok").style.display = tipus === "asztal" ? "block" : "none";
    document.getElementById("jatekMezok").style.display = tipus === "jatek" ? "block" : "none";
}

async function mentesUjEszkoz() {
    const tipus = document.getElementById("eszkozTipus").value;
    const helyId = document.getElementById("ujEszkozModal").getAttribute("data-aktiv-hely-id");
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
        const response = await fetch(`http://104.248.22.60:8080/api/admin/foglalasok/eszkoz/uj`, {
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
                text: "Item successfully added!",
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#8b5cf6'
            });
            document.getElementById("ujEszkozModal").style.display = "none";
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: "Error during saving.",
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        }
    } catch (e) { console.error(e); }
}

async function helyszinSzerkesztes(id) {
    const modal = document.getElementById('szerkesztHelyszinModal');
    if (modal) modal.style.display = 'block';

    try {
        const response = await fetch(`http://104.248.22.60:8080/api/helyszinek/${id}`);
        const hely = await response.json();
        console.log("Incoming data:", hely);

        const mezok = {
            'edit-id': hely.id,
            'edit-nev': hely.nev,
            'edit-varos': hely.varos,
            'edit-cim': hely.cim,
            'edit-nyitvatartas': hely.nyitvatartas,
            'edit-leiras': hely.leiras
        };

        for (const [id, ertek] of Object.entries(mezok)) {
            const elem = document.getElementById(id);
            if (elem) {
                elem.value = ertek || "";
            } else {
                console.warn(`Warning: Could not find HTML ID: ${id}`);
            }
        }

    } catch (error) {
        console.error("Error processing data:", error);
    }
}

async function mentesModositas() {
    const id = document.getElementById('edit-id').value;
    const kepInput = document.getElementById('edit-kep'); 
    
    const formData = new FormData();
    
    formData.append('nev', document.getElementById('edit-nev').value);
    formData.append('varos', document.getElementById('edit-varos').value);
    formData.append('cim', document.getElementById('edit-cim').value);
    formData.append('nyitvatartas', document.getElementById('edit-nyitvatartas').value);
    formData.append('leiras', document.getElementById('edit-leiras').value);

    if (kepInput && kepInput.files[0]) {
        formData.append('kep', kepInput.files[0]);
    }

    try {
        const response = await fetch(`http://104.248.22.60:8080/api/helyszinek/${id}`, {
            method: 'PUT',
            body: formData 
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: "Venue data and image updated.",
                background: '#1e1e2d',
                color: '#fff',
                confirmButtonColor: '#8b5cf6'
            }).then(() => {
                document.getElementById('szerkesztHelyszinModal').style.display = 'none';
                betoltAdminHelyszinek();
            });
        } else {
            const hibaUzenet = await response.text();
            throw new Error(hibaUzenet || "Server error during save");
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: "Failed to save changes.",
            background: '#1e1e2d',
            color: '#fff',
            confirmButtonColor: '#ef4444'
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    const page = path.split("/").pop();

    if (page === "admin-dashboard.html") {
        document.getElementById("nav-dashboard").classList.add("active");
    } else if (page === "admin-helyszinek.html") {
        document.getElementById("nav-helyszinek").classList.add("active");
    }
});

function kijelentkezes() {
    localStorage.removeItem("nr_admin_id");
    localStorage.removeItem("nr_szorakozohely_id");
    window.location.href = "admin-login.html";
}