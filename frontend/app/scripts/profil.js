// profil.js
const felhasznaloId = 1; // Egyelőre fixen az 1-es júzer

async function profilAdatokBetoltese() {
    // 1. Játékok lekérése
    betoltFoglalasok(`http://localhost:8080/api/jatekok/felhasznalo/${felhasznaloId}`, 'jatek-lista', 'Játék');

    // 2. Asztalok lekérése
    betoltFoglalasok(`http://localhost:8080/api/asztalok/felhasznalo/${felhasznaloId}`, 'asztal-lista', 'Asztal');

    // 3. Helyszínek lekérése
    betoltFoglalasok(`http://localhost:8080/api/helyfoglalas/felhasznalo/${felhasznaloId}`, 'hely-lista', 'Helyszín');
}

async function betoltFoglalasok(url, divId, tipus) {
    const listaDiv = document.getElementById(divId);
    try {
        const response = await fetch(url);
        const adatok = await response.json();

        if (adatok.length === 0) {
            listaDiv.innerHTML = `<p>Nincs aktív ${tipus} foglalásod.</p>`;
            return;
        }

        listaDiv.innerHTML = '';
        adatok.forEach(f => {
            const kezdet = new Date(f.kezdet).toLocaleString('hu-HU');
            const vege = new Date(f.vege).toLocaleString('hu-HU');
            
            listaDiv.innerHTML += `
                <div class="foglalas-kartya">
                    <p><strong>Időpont:</strong> ${kezdet} - ${vege.split(' ')[1]}</p>
                    <p><strong>Állapot:</strong> ${f.allapot}</p>
                    
                    ${f.szorakozohelyNev ? `<p><strong>Helyszín:</strong> ${f.szorakozohelyNev}</p>` : ''}
                    
                    ${f.jatekNev ? `<p><strong>Játék:</strong> ${f.jatekNev}</p>` : ''}
                    
                    ${f.asztalSzam ? `<p><strong>Asztal:</strong> ${f.asztalSzam}. asztal</p>` : ''}
                    ${f.letszam ? `<p><strong>Létszám:</strong> ${f.letszam} fő</p>` : ''}
                    <hr>
                </div>
            `;
        });
    } catch (hiba) {
        console.error(hiba);
        listaDiv.innerHTML = '<p>Hiba történt az adatok betöltésekor.</p>';
    }
}

profilAdatokBetoltese();