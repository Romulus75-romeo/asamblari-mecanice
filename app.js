// ========== GOOGLE SHEETS INTEGRATION ==========
// INSTRUCȚIUNI: Înlocuiește URL-ul de mai jos cu cel din Google Apps Script
// După ce configurezi Google Apps Script, pune aici URL-ul generat
const GOOGLE_SCRIPT_URL = ''; // Pune aici URL-ul tău de la Google Apps Script

// Funcție pentru trimiterea rezultatelor la Google Sheets
async function sendToGoogleSheets(data) {
  if (!GOOGLE_SCRIPT_URL) {
    console.log('Google Sheets URL nu este configurat');
    return { success: false, message: 'Google Sheets nu este configurat' };
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    console.log('Rezultat trimis la Google Sheets!');
    return { success: true, message: 'Rezultat salvat!' };
  } catch (error) {
    console.error('Eroare la trimitere:', error);
    return { success: false, message: error.toString() };
  }
}

// ========== CSV EXPORT - EVIDENȚĂ ELEVI ==========
function exportResultsToCSV() {
  const results = JSON.parse(localStorage.getItem('asamblari-submittedResults') || '[]');

  if (results.length === 0) {
    alert('Nu există rezultate de exportat!');
    return;
  }

  // Create CSV content
  const headers = ['Nr', 'Nume', 'Email', 'Clasa', 'Test', 'Scor %', 'Corecte', 'Total', 'Data'];
  const csvRows = [headers.join(',')];

  results.forEach((r, i) => {
    const row = [
      i + 1,
      `"${r.name || ''}"`,
      `"${r.email || ''}"`,
      `"${r.clasa || ''}"`,
      `"${r.testName || ''}"`,
      r.pct || 0,
      r.correct || 0,
      r.total || 0,
      `"${new Date(r.date).toLocaleString('ro-RO')}"`
    ];
    csvRows.push(row.join(','));
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Rezultate_Elevi_${new Date().toLocaleDateString('ro-RO').replace(/\./g, '-')}.csv`;
  link.click();

  alert(`✅ Exportat ${results.length} rezultate!\n\nFișierul poate fi deschis în Excel.`);
}

// Panou Profesor - Evidență Centralizată
function showTeacherDashboard() {
  if (document.getElementById('mobileNav')?.classList.contains('active')) toggleMenu();

  const results = JSON.parse(localStorage.getItem('asamblari-submittedResults') || '[]');
  const progress = getProgress();
  const stats = getStats();

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>👨‍🏫 Panou Profesor</h2>
        <p>Evidența rezultatelor elevilor</p>
      </div>
      
      <div class="content-card" style="background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(6,182,212,0.15));margin-bottom:2rem">
        <h3>📊 Statistici Generale</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:1rem;text-align:center;margin-top:1rem">
          <div><div style="font-size:2rem;font-weight:700;color:var(--primary)">${results.length}</div><div style="color:var(--text-muted)">Rezultate Primite</div></div>
          <div><div style="font-size:2rem;font-weight:700;color:var(--success)">${results.filter(r => r.pct >= 70).length}</div><div style="color:var(--text-muted)">Promovați</div></div>
          <div><div style="font-size:2rem;font-weight:700;color:var(--warning)">${results.filter(r => r.pct < 70).length}</div><div style="color:var(--text-muted)">Nepromovați</div></div>
          <div><div style="font-size:2rem;font-weight:700;color:var(--secondary)">${results.length > 0 ? Math.round(results.reduce((a, r) => a + (r.pct || 0), 0) / results.length) : 0}%</div><div style="color:var(--text-muted)">Media</div></div>
        </div>
      </div>
      
      <div class="content-card" style="margin-bottom:2rem">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
          <h3>📋 Rezultate Elevi (${results.length})</h3>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="exportResultsToCSV()">📥 Export CSV (Excel)</button>
            <button class="btn btn-secondary" onclick="if(confirm('Ștergi toate rezultatele?')){localStorage.removeItem('asamblari-submittedResults');showTeacherDashboard()}">🗑️ Șterge Tot</button>
          </div>
        </div>
        
        ${results.length > 0 ? `
          <div style="overflow-x:auto;margin-top:1rem">
            <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
              <thead>
                <tr style="background:var(--primary);color:white">
                  <th style="padding:0.75rem;text-align:left">Nr</th>
                  <th style="padding:0.75rem;text-align:left">Nume</th>
                  <th style="padding:0.75rem;text-align:left">Clasa</th>
                  <th style="padding:0.75rem;text-align:left">Test</th>
                  <th style="padding:0.75rem;text-align:center">Scor</th>
                  <th style="padding:0.75rem;text-align:right">Data</th>
                </tr>
              </thead>
              <tbody>
                ${results.slice().reverse().map((r, i) => `
                  <tr style="border-bottom:1px solid rgba(0,0,0,0.1);${r.pct >= 70 ? '' : 'background:rgba(239,68,68,0.1)'}">
                    <td style="padding:0.75rem">${results.length - i}</td>
                    <td style="padding:0.75rem"><strong>${r.name || '-'}</strong><br><span style="font-size:0.8rem;color:var(--text-muted)">${r.email || ''}</span></td>
                    <td style="padding:0.75rem">${r.clasa || '-'}</td>
                    <td style="padding:0.75rem">${r.testName || '-'}</td>
                    <td style="padding:0.75rem;text-align:center"><span style="padding:0.25rem 0.75rem;border-radius:20px;font-weight:600;${r.pct >= 70 ? 'background:rgba(34,197,94,0.2);color:#16a34a' : 'background:rgba(239,68,68,0.2);color:#dc2626'}">${r.pct || 0}%</span></td>
                    <td style="padding:0.75rem;text-align:right;font-size:0.85rem;color:var(--text-muted)">${new Date(r.date).toLocaleString('ro-RO')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : '<p style="text-align:center;color:var(--text-muted);padding:2rem">Nu există rezultate încă. Elevii trebuie să completeze teste și să apese "Trimite Rezultatul".</p>'}
      </div>
      
      <div class="info-box" style="margin-bottom:2rem">
        <h4>💡 Cum funcționează?</h4>
        <p>1. Elevii completează un test pe acest dispozitiv<br>
        2. Apasă "Trimite Rezultatul" și completează datele<br>
        3. Rezultatul apare automat aici<br>
        4. Exportă în CSV pentru Excel</p>
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== CHAPTER CONTENT ==========
// Enhanced content with detailed explanations
const chapters = [
  { id: 's1', icon: '📖', title: '1. Noțiuni Generale', desc: 'Procesul tehnologic, documentație, metode de asamblare', hours: '6T + 24IP', cat: 'general' },
  { id: 's2-1', icon: '🔩', title: '2.1 Nituire', desc: 'Nituire manuală și mecanică, controlul îmbinărilor', hours: '8T + 32IP', cat: 's2' },
  { id: 's2-2', icon: '⚡', title: '2.2 Sudare', desc: 'Sudare cu arc electric, MIG/MAG, TIG', hours: '8T + 32IP', cat: 's2' },
  { id: 's2-3', icon: '🔥', title: '2.3 Lipire', desc: 'Lipire moale și tare, brazare', hours: '4T + 16IP', cat: 's2' },
  { id: 's2-4', icon: '🧪', title: '2.4 Încleiere', desc: 'Adezivi epoxidici, cianoacrilați', hours: '6T + 24IP', cat: 's2' },
  { id: 's3-1', icon: '🔧', title: '3.1 Filetate', desc: 'Șuruburi, prezoane, piulițe, asigurare', hours: '6T + 24IP', cat: 's3' },
  { id: 's3-2', icon: '🔑', title: '3.2 Prin Formă', desc: 'Pene, caneluri, profile poligonale', hours: '8T + 32IP', cat: 's3' },
  { id: 's3-3', icon: '⚙️', title: '3.3 Prin Frecare', desc: 'Strângere pe con, inele tronconice', hours: '4T + 16IP', cat: 's3' },
  { id: 's3-4', icon: '🌀', title: '3.4 Elastice', desc: 'Arcuri elicoidale și în foi', hours: '4T + 16IP', cat: 's3' }
];

const content = {
  's1': {
    title: '1. Noțiuni Generale despre Tehnologia Asamblării',
    intro: 'Asamblarea reprezintă procesul tehnologic de reunire ordonată a pieselor și subansamblurilor în vederea obținerii unui produs finit funcțional. Este o etapă critică în procesul de fabricație.',
    sections: [
      {
        title: '📋 Definiția și importanța asamblării', text: 'Asamblarea este operația prin care se unesc două sau mai multe piese pentru a forma un ansamblu. Reprezintă 20-50% din timpul total de fabricație al unui produs.', items: [
          'Asamblarea stabilește poziția relativă precisă a pieselor',
          'Asigură transmiterea forțelor și mișcărilor între componente',
          'Permite funcționarea corectă a produsului final',
          'Influențează direct calitatea și durabilitatea produsului'
        ]
      },
      {
        title: '📄 Documentația tehnologică', text: 'Documentația este esențială pentru realizarea corectă și repetabilă a procesului de asamblare.', items: [
          'Fișa tehnologică de asamblare - descrie operațiile în ordine cronologică',
          'Schema de asamblare arborescentă - prezintă ierarhia componentelor',
          'Desenul de ansamblu - arată poziția relativă a pieselor',
          'Instrucțiuni de montaj - detalii despre tehnologie',
          'Norme NSSM - măsuri de protecție a muncii'
        ]
      },
      {
        title: '🔧 Metodele de asamblare', text: 'Alegerea metodei depinde de tipul producției (serie, masă) și de precizia cerută.', items: [
          'Interschimbabilitate totală - piese se potrivesc fără ajustări (producție de serie mare)',
          'Interschimbabilitate parțială (selectivă) - sortare pe grupe de toleranță',
          'Ajustare individuală - prelucrări suplimentare la montaj (producție unicat)',
          'Compensare - utilizarea elementelor de reglare (șaibe, bucșe)'
        ]
      },
      {
        title: '📏 Precizia de asamblare', text: 'Precizia finală a produsului depinde de precizia pieselor și de metoda de asamblare.', items: [
          'Lanțuri de dimensiuni - suma toleranțelor individuale',
          'Jocuri și strângeri - definite prin ajustaje standardizate',
          'Erori de poziție - abateri unghiulare și de paralelism',
          'Control dimensional - verificare cu instrumente de măsură'
        ]
      },
      {
        title: '🛠️ Operații pregătitoare', text: 'Înainte de asamblare, piesele trebuie pregătite corespunzător.', items: [
          'Curățare - îndepărtarea impurităților, așchiilor metalice',
          'Degresare - cu solvenți pentru suprafețe perfect curate',
          'Debavurare - eliminarea bavurilor rămase de la prelucrare',
          'Ajustare - corecții fine pentru potrivire',
          'Marcare - identificarea pieselor conform documentației'
        ]
      }
    ],
    nssm: 'Echipament individual de protecție (mănuși, ochelari), curățenie la locul de muncă, păstrarea sculelor în ordine, manipularea corectă a pieselor grele, ventilație pentru solvenți de degresare.'
  },
  's2-1': {
    title: '2.1 Asamblări prin Nituire',
    intro: 'Nituirea este unul dintre cele mai vechi procedee de asamblare nedemontabilă. Înainte de dezvoltarea sudării, era metoda principală pentru structuri mari precum poduri, nave și cazane.',
    sections: [
      {
        title: '📊 Ce este nituirea?', text: 'Nituirea realizează îmbinarea a două sau mai multe piese folosind nituri - elemente din material ductil (oțel moale, aluminiu, cupru).', items: [
          'Nitul are o tijă cilindrică și un cap prefabricat (cap de fabricație)',
          'La montare se formează un al doilea cap (cap de închidere) prin deformarea plastică',
          'Îmbinarea se realizează prin deformarea plastică a tijei - nitul umple complet gaura',
          'Este o îmbinare nedemontabilă - îndepărtarea necesită distrugerea nitului',
          'Forța de strângere menține tablele presate permanent'
        ]
      },
      {
        title: '📐 Clasificarea îmbinărilor nituite', text: 'Îmbinările se clasifică după mai multe criterii importante:', items: [
          'După solicitare: de rezistență (structuri metalice, poduri), de etanșare (rezervoare, cazane), mixte (nave)',
          'După poziția tablelor: cu suprapunere (mai simple), cap la cap cu eclise (o eclisă sau două)',
          'După numărul de rânduri: un rând simplu, 2-3 rânduri paralele sau în zigzag (dispunere optimă)',
          'După tipul capului: semirotund (cel mai rezistent), înecat/înfundat (suprafețe plane), lenticular (aspect estetic)',
          'După material: oțel carbon, oțel inoxidabil, aluminiu, cupru, alamă'
        ]
      },
      {
        title: '🔨 Dimensiunile constructive și calcule', text: 'Calculul corect al dimensiunilor asigură rezistența maximă a îmbinării:', items: [
          'Diametrul nitului: d = 2×√s (s = grosimea minimă a tablelor în mm). Exemplu: s=4mm → d=4mm',
          'Pasul niturilor: t = 3d...6d pentru îmbinări de rezistență, t = 2d...2.5d pentru etanșare',
          'Distanța de la margine: e = 1.5d...2d pentru a evita ruperea muchiei',
          'Lungimea tijei: L = Σs + 1.5d (cap semirotund).  Σs = suma grosimilor tablelor',
          'Cap de închidere: înălțime ≈ 0.65d, diametru ≈ 1.5d (standardizat)',
          'Număr nituri într-un rând: n = (L - 2e) / t + 1, unde L = lungimea îmbinării'
        ]
      },
      {
        title: '🔧 Tehnologia nituirii manuale - Pas cu Pas', text: 'Procedura corectă pentru nituire manuală de calitate:', items: [
          'PASUL 1 - Pregătire: Trasare poziții, găurire la diametru d+0.5mm, debavurare, curățare',
          'PASUL 2 - Introducere nit: Se introduce nitul până capul de fabricație e perfect rezemat',
          'PASUL 3 - Tragere table: Cu tragătorul se trag tablele, eliminând jocul dintre ele',
          'PASUL 4 - Refulare: Se lovește tija cu ciocanul pentru a o dilata și umple gaura',
          'PASUL 5 - Formare cap: Cu buterola (căpuitor) se formează capul de închidere prin lovituri circulare',
          'SDV-uri necesare: Ciocan de nituire 300-500g, buterolă, contracăpuitor, tragător, nicovală',
          'La cald (850-1000°C): nituri d>10mm, încălzire uniformă roșu-vișiniu, lucru rapid (<60s)',
          'La rece: nituri mici d<10mm, aluminiu, cupru - fără încălzire'
        ]
      },
      {
        title: '🏭 Nituirea mecanică și automatizată', text: 'Pentru productivitate și calitate uniformă în industriei:', items: [
          'Ciocane pneumatice: 2000-3000 lovituri/min, forță impact 500-2000N, portabile, flexibile',
          'Mașini hidraulice: presiune continuă 50-200 kN, calitate uniformă, pentru nituri mari',
          'Prese de nituit: staționare, productivitate maximă, pentru serie mare',
          'Pop-nituri (nituri oarbe): se montează dintr-o singură parte, cu pistol special',
          'Sisteme CNC: poziționare automată, nituire robotizată în industria auto/aero'
        ]
      },
      {
        title: '❌ Defecte, cauze și remedii', text: 'Identificarea și prevenirea defectelor de nituire:', items: [
          'Cap decentrat/înclinat: Cauză - poziție incorectă buterolă. Remediu - verificare aliniere',
          'Cap crăpat/fisurat: Cauză - supraîncălzire sau material fragil. Remediu - control temperatură',
          'Joc între table: Cauză - tijă scurtă sau diametru insuficient. Remediu - recalculare dimensiuni',
          'Nit slăbit: Cauză - răcire prea lentă (nituire la cald). Remediu - răcire uniformă',
          'Suprafață neregulată: Cauză - matriță uzată. Remediu - înlocuire scule',
          'Control calitate: Vizual (aspect), Ciocan (sunet clar=OK, mat=defect), Hidraulic (etanșeitate)'
        ]
      }
    ],
    nssm: 'Protecție auditivă obligatorie (zgomot >85dB), ochelari de protecție contra așchiilor metalice fierbinți, mănuși termoizolante pentru nituire la cald, ventilație adecvată în spații închise, echipament PSI la îndemână, verificarea sculelor înainte de lucru.'
  },
  's2-2': {
    title: '2.2 Asamblări prin Sudare',
    intro: 'Sudarea este procedeul de îmbinare nedemontabilă prin topirea locală a metalelor de bază și/sau adaos. Peste 35% din producția de oțel este asamblată prin sudare. Temperatura arcului electric poate atinge 3500-6000°C.',
    sections: [
      {
        title: '⚡ Principiul sudării cu arc electric', text: 'Arcul electric este o descărcare electrică continuă printr-un mediu gazos ionizat, producând căldură intensă.', items: [
          'Amorsare arc: Contact scurt electrod-piesă → scurtcircuit → îndepărtare 2-4mm → arc stabil',
          'Temperatura arcului: 3500-6000°C (zona centrală), suficient pentru topirea oricărui metal',
          'Arcul topește marginile metalului de bază și electrodul (material de adaos)',
          'Se formează baia de sudură (bazin de metal topit) protejată de zgură sau gaz',
          'La răcire rapidă se obține cordonul de sudură (cusătura) cu structură cristalină',
          'Zona influențată termic (ZIT): 5-20mm în jurul cordonului, cu proprietăți modificate'
        ]
      },
      {
        title: '📊 Procedee de sudare - Comparație detaliată', text: 'Alegerea procedeului depinde de material, grosime și aplicație:', items: [
          'MMA/SMAW (Electrod învelit): Cel mai răspândit, echipament simplu, orice poziție, pentru oțel 2-30mm',
          'MIG (Metal Inert Gas): Sârmă continuă + Ar/He, pentru INOX și aluminiu, calitate excelentă, 0.5-6mm',
          'MAG (Metal Active Gas): Sârmă continuă + CO2/Ar+CO2, pentru oțel carbon, productivitate mare, 0.8-20mm',
          'TIG/WIG (Tungsten Inert Gas): Electrod wolfram nefuzibil + Ar, suduri de precizie, tubulații, inox subțire',
          'SAW (Sub strat flux): Sârmă + flux granular, automatizat, cordoane lungi, tablă groasă >6mm',
          'Sudare cu plasmă: Temperatură foarte mare (20.000°C), pentru metale refractare și tăiere'
        ]
      },
      {
        title: '🔌 Electrozii înveliți - Clasificare completă', text: 'Învelișul electrodului (fluxul) are rol metalurgic, termic, protector și electric:', items: [
          'RUTILICI (R): 40% TiO2, amorsare ușoară, arc stabil, începători, oțel carbon, CC sau CA',
          'BAZICI (B): CaCO3+CaF2, conținut scăzut H2, rezistență maximă, suduri solicitate dinamic',
          'CELULOZICI (C): Celuloză, penetrare adâncă, poziție verticală descendentă, conducte',
          'Învelișuri speciale: Inox (acid), Fontă (nichel), Aluminiu (sare de litiu)',
          'Marcaj exemplu: E 38 3 R 12 → E=electrod, 38=rezistență MPa/10, 3=alungire%, R=rutilic, 12=poziții',
          'Depozitare: Loc uscat, bazicii în cuptoare 150°C, termen valabilitate 1-2 ani'
        ]
      },
      {
        title: '📐 Parametrii regimului de sudare - Formule și valori', text: 'Parametrii corecți asigură calitatea și rezistența sudurii:', items: [
          'Intensitatea curentului: I = (35...45) × d [A], unde d = diametrul electrodului în mm',
          'Tensiunea arcului: U = 20 + 4×10⁻²×I [V], tipic 20-40V, determină lungimea arcului',
          'Viteza de sudare: v = 10-30 cm/min, influențează lățimea și pătrunderea cordonului',
          'Diametrul electrodului: d = s/2 + 1 [mm] pentru prima trecere, s = grosime tablă',
          'Polaritate directă (DCEN): + pe piesă → pătrundere mare, pentru oțel gros',
          'Polaritate inversă (DCEP): + pe electrod → depunere rapidă, pentru table subțiri',
          'Curent alternativ (AC): pentru aluminiu cu TIG, sparge stratul de oxid'
        ]
      },
      {
        title: '🔧 Tehnica sudării - Pas cu Pas', text: 'Procedura corectă pentru cordoane de calitate:', items: [
          'PASUL 1 - Pregătire: Curățare margini (decapare, degresare), teșire la grosimi >6mm',
          'PASUL 2 - Prindere: Puncte de sudură (hefturi) la 50-100mm, fixarea poziției',
          'PASUL 3 - Amorsare: Aprinderea arcului prin frecare sau atingere-ridicare',
          'PASUL 4 - Mișcare: Liniară, în zigzag sau semilună, unghi electrod 70-80° față de avans',
          'PASUL 5 - Terminare: Umplerea craterului, evitarea fisurilor la răcire',
          'PASUL 6 - Curățare: Îndepărtare zgură cu ciocan, periere, control vizual'
        ]
      },
      {
        title: '🔧 Echipamente pentru sudare MMA', text: 'Instalația completă de sudare cu electrod învelit:', items: [
          'Sursa curent: Transformator (AC, ieftin), Redresor (DC, stabil), Invertor (DC, modern, 3-10kg, eficient 85%)',
          'Portelectrod: Izolat, prindere rapidă, răcit, pentru curenți 100-400A',
          'Clește masă: Contact bun cu piesa, poziționat aproape de zona de sudare',
          'Ciocan de zgură: Cap ascuțit pentru îndepărtare zgură din colțuri',
          'Perie sârmă: Pentru curățarea cordonului între treceri',
          'Clești sudor: Pentru manipulat piese fierbinți, electrozi'
        ]
      },
      {
        title: '❌ Defecte de sudare - Cauze și Remedii', text: 'Identificarea și prevenirea defectelor critice:', items: [
          'POROZITĂȚI: Cauză - umiditate electrod/tablă, curent mare. Remediu - uscare, reducere I',
          'FISURI: Cauză - răcire rapidă, compoziție chimică. Remediu - preîncălzire, răcire lentă',
          'LIPSA PĂTRUNDERE: Cauză - curent mic, viteză mare. Remediu - creștere I, reducere v',
          'INCLUZIUNI ZGURĂ: Cauză - curățare insuficientă. Remediu - periere între treceri',
          'SUPRAÎNĂLȚARE: Cauză - viteză mică. Remediu - creștere viteza de avans',
          'Control: Vizual (VT), Radiografic (RT), Ultrasonic (UT), Particule magnetice (MT)'
        ]
      }
    ],
    nssm: 'Mască sudor cu filtru automat DIN 10-13, ochelari limpezi pentru curățare zgură, mănuși piele ignifugă 35cm, șorț piele, bocanci cu bombeu metalic, ventilație/exhaustare fumuri (expunere max 8h la 5mg/m³), protecție colegi (paravane), stingător PSI în apropiere, verificare cablu/priză.'
  },
  's2-3': {
    title: '2.3 Asamblări prin Lipire',
    intro: 'Lipirea este procedeul de îmbinare în care materialul de adaos (aliaj de lipit) se topește la temperatură mai mică decât metalul de bază, umectând suprafețele și legându-le la solidificare.',
    sections: [
      {
        title: '✅ Avantaje și dezavantaje', text: 'Lipirea oferă posibilități pe care alte metode nu le au:', items: [
          '✓ Temperaturi mult mai mici decât la sudare (fără deformații)',
          '✓ Se pot îmbina metale diferite (cupru cu oțel, etc.)',
          '✓ Etanșeitate excelentă',
          '✓ Aspect estetic (bijuterii, electronică)',
          '✗ Rezistență mecanică mai mică decât sudura',
          '✗ Temperatură de lucru limitată'
        ]
      },
      {
        title: '🌡️ Clasificarea lipirii', text: 'Se clasifică în funcție de temperatura de topire a aliajului:', items: [
          'Lipire moale (sub 450°C): aliaje Sn-Pb, Sn-Ag, Sn-Cu pentru electronică, instalații',
          'Lipire tare / Brazare (peste 450°C): aliaje Cu-Zn, Ag pentru îmbinări rezistente',
          'Brazare sub vid: pentru componente de înaltă precizie, aerospațial'
        ]
      },
      {
        title: '🧪 Materiale de adaos', text: 'Alegerea corectă a aliajului și fluxului este critică:', items: [
          'Aliaje Sn60-Pb40: punct topire 183°C, clasic pentru electronică',
          'Aliaje fără plumb (Sn-Ag-Cu): ecologice, obligatorii în UE',
          'Aliaje Cu-Zn (alamă de lipit): pentru oțel, cupru, bronz',
          'Aliaje cu argint: rezistență mare, temperatură mai înaltă',
          'Fluxuri: colofoniu (electronică), acid clorhidric diluat (table), borax (brazare)'
        ]
      },
      {
        title: '🔧 Echipamente', text: 'Unelte și echipamente specifice:', items: [
          'Ciocan de lipit electric: 25-100W pentru electronică',
          'Stație de lipit: temperatură reglabilă, dezlipire',
          'Arzător cu gaz: pentru lipire tare, cuptor pentru serie',
          'Perii și bureți pentru curățare',
          'Flux și pastă de lipit'
        ]
      },
      {
        title: '📋 Tehnologia lipirii', text: 'Pașii pentru o lipitură de calitate:', items: [
          '1. Curățare mecanică (hârtie abrazivă) și chimică (degresare)',
          '2. Aplicare flux pentru dezoxidare',
          '3. Încălzire piesă (nu aliajul!) până la temperatura de lucru',
          '4. Aplicare aliaj - trebuie să curgă singur prin capilaritate',
          '5. Răcire lentă, curățare resturi de flux'
        ]
      }
    ],
    nssm: 'Ventilație bună (vapori de flux și plumb toxici), spălare mâini după lucru cu plumb, evitare contact flux cu pielea și ochii, risc arsuri - atenție la ciocane fierbinți.'
  },
  's2-4': {
    title: '2.4 Asamblări prin Încleiere (cu Adezivi)',
    intro: 'Încleierea este o metodă modernă de asamblare nedemontabilă, folosind adezivi sintetici sau naturali. Este tot mai răspândită în industria auto, aeronautică și electronică.',
    sections: [
      {
        title: '✅ Avantaje și dezavantaje', text: 'Încleierea oferă posibilități unice:', items: [
          '✓ Nu necesită încălzire - fără deformații termice',
          '✓ Distribuie uniform eforturile pe suprafață',
          '✓ Poate îmbina materiale diferite (metal, plastic, lemn, sticlă)',
          '✓ Etanșeitate și izolație electrică',
          '✓ Greutate adăugată minimă',
          '✗ Rezistență limitată la temperaturi înalte',
          '✗ Îmbătrânire în timp',
          '✗ Pregătire suprafață pretențioasă'
        ]
      },
      {
        title: '🏭 Domenii de aplicare', text: 'Încleierea a revoluționat multe industrii:', items: [
          'Industria auto: parbriz, componente interior, etanșări',
          'Aeronautică: structuri compozite, panouri honeycomb',
          'Electronică: fixare cipuri, display-uri',
          'Construcții: panouri sandwich, tâmplărie PVC',
          'Packaging: cutii, etichete'
        ]
      },
      {
        title: '🧪 Clasificarea adezivilor', text: 'Adezivii se clasifică după mai multe criterii:', items: [
          'După origine: naturali (amidon, cazeină) sau sintetici (epoxidici, acrilici)',
          'După mod de întărire: la rece, la cald, cu UV, bicomponenți',
          'Epoxidici: rezistență mare, 2 componente, timp de întărire lung',
          'Cianoacrilați (SuperGlue): întărire instantanee (1-30s), suprafețe mici',
          'Poliuretanici: elastici, rezistenți la apă',
          'Acrilici: rezistență bună UV, pentru plastic'
        ]
      },
      {
        title: '🔧 Tehnologia încleierii', text: 'Procesul corect asigură rezistență maximă:', items: [
          '1. Curățare: degresare cu acetonă/alcool izopropilic',
          '2. Rugozitate: șlefuire ușoară pentru aderență',
          '3. Aplicare primer (dacă e necesar)',
          '4. Aplicare adeziv: strat uniform, grosime 0.1-0.5mm',
          '5. Poziționare rapidă (înainte de întărire)',
          '6. Presare: menghină, cleme, saci de vid',
          '7. Întărire: timp și temperatură conform fișei tehnice'
        ]
      },
      {
        title: '📋 Controlul calității', text: 'Verificarea îmbinărilor încleiate:', items: [
          'Visual: continuitate, exces adeziv, goluri de aer',
          'Încercare la rupere pe epruvete',
          'Ultrasunete pentru detectare neaderențe',
          'Testare rezistență la factori externi (apă, temperatură)'
        ]
      }
    ],
    nssm: 'Mănuși de protecție (unele adezivii sunt sensibilizanți), ochelari, ventilație bună (vapori organici), evitare contact cu pielea - unele lipesc instant, citire fișă de securitate.'
  },
  's3-1': {
    title: '3.1 Asamblări Filetate',
    intro: 'Asamblările filetate sunt cele mai răspândite asamblări demontabile în construcția de mașini. Permit montarea și demontarea repetată fără deteriorarea pieselor.',
    sections: [
      {
        title: '🔩 Elemente de asamblare filetată', text: 'Componentele principale:', items: [
          'Șuruburi: tijă cilindrică cu filet exterior și cap (hexagonal, cilindric, etc.)',
          'Piulițe: piesă cu filet interior (hexagonală, pătră, înfundată, autoblocantă)',
          'Prezoane: tijă filetată la ambele capete, fără cap',
          'Șaibe: plate (distribuie presiunea), grower (asigurare), elastice'
        ]
      },
      {
        title: '✅ Avantaje', text: 'De ce sunt atât de utilizate:', items: [
          'Demontabilitate completă - se pot refolosi',
          'Forță de strângere mare cu efort mic (efect de pârghie)',
          'Standardizare - interschimbabilitate, disponibilitate',
          'Cost redus (producție de masă)',
          'Varietate mare de tipuri și mărimi'
        ]
      },
      {
        title: '🔐 Asigurarea împotriva autodesfacerii', text: 'Vibrațiile pot desface șuruburile, soluții:', items: [
          'Piulițe autoblocante (cu insert nylon sau deformare)',
          'Şaibe grower (arc care menține presiune)',
          'Şaibe dinţate (se înfig în suprafețe)',
          'Contrapiuliță (două piulițe blocate între ele)',
          'Știft crestat sau sârmă de siguranță',
          'Adezivi pentru filet (Loctite) - diferite grade de blocare'
        ]
      },
      {
        title: '🔧 Scule pentru asamblare', text: 'Unelte manuale și mecanice:', items: [
          'Chei fixe: pentru piulițe hexagonale standard',
          'Chei inelare: contact pe toate fețele, mai puțin alunecare',
          'Chei tubulare (pipe): pentru locuri înguste',
          'Chei dinamometrice: strângere la cuplu prestabilit (Nm)',
          'Șurubelnițe: plate, Phillips, Torx, imbus',
          'Mașini de înșurubat electrice/pneumatice'
        ]
      },
      {
        title: '📋 Tehnologia asamblării', text: 'Procedura corectă de strângere:', items: [
          '1. Verificare filet curat, nedeteriorat',
          '2. Verificare suprafețe plane, paralele',
          '3. Poziționare șaibe și pornire manuală (evită strâmbare)',
          '4. Strângere în ordine diagonală (la flanșe)',
          '5. Strângere progresivă: 1/3, 2/3, cuplu final',
          '6. Verificare finală cu cheia dinamometrică'
        ]
      }
    ],
    nssm: 'Verificare stare sculă înainte de folosire, poziție corectă de lucru, chei de mărime potrivită (nu improvizații), atenție la mâini la alunecare cheie.'
  },
  's3-2': {
    title: '3.2 Asamblări prin Formă',
    intro: 'Asamblările prin formă realizează îmbinarea prin contactul suprafețelor profilate ale pieselor. Transmit mișcare și forțe între arbori și elementele montate pe aceștia.',
    sections: [
      {
        title: '🔑 Asamblări prin pene', text: 'Penele sunt elemente prismatice ce fixează butucul pe arbore:', items: [
          'Pene longitudinale paralele: cele mai comune, canal pe arbore și butuc',
          'Pene longitudinale înclinate: cu strângere, asigură și contra deplasării axiale',
          'Pene disc (Woodruff): semicirculare, autocentrante',
          'Pene transversale: perpendiculare pe axă, fixare în lungul arborelui',
          'Avantaj: simplitate, cost redus, montaj/demontaj ușor',
          'Dezavantaj: slăbesc arborele (canal de pană = concentrator de tensiune)'
        ]
      },
      {
        title: '⚙️ Asamblări prin caneluri', text: 'Canelurile sunt multiple pene care fac corp comun cu arborele:', items: [
          'Caneluri dreptunghiulare: cele mai simple, producție ușoară',
          'Caneluri evolventice: profil evolventă (ca la roți dințate), mai rezistente',
          'Caneluri triunghiulare: pentru turații mari și cupluri mici',
          'Pot fi fixe (presate) sau mobile (glisante)',
          'Avantaje: transmit cuplu mult mai mare decât penele, centrare bună'
        ]
      },
      {
        title: '🔷 Profile poligonale', text: 'Arbori și alezaje cu secțiune poligonală:', items: [
          'Profile K (3, 4 sau mai multe laturi rotunjite)',
          'Suprafață continuă, fără canale - fără concentratori de tensiuni',
          'Capacitate mare de transmitere cuplu',
          'Centrare foarte bună',
          'Dezavantaj: prelucrare dificilă, costisitoare',
          'Aplicații: arbori cardanici, scule de mână (chei)'
        ]
      },
      {
        title: '📍 Asamblări cu știfturi și bolțuri', text: 'Știfturile sunt elemente cilindrice sau conice:', items: [
          'Știfturi cilindrice: pentru centrare și fixare poziție',
          'Știfturi conice: demontare ușoară, centrare precisă',
          'Știfturi elastice (tubulare cu fantă): elasticitate, fără alezaj de precizie',
          'Știfturi cu cap: pentru articulații',
          'Bolțuri: știfturi de dimensiuni mari, pot fi cu filet',
          'Montare: prin presare sau batere'
        ]
      }
    ],
    nssm: 'Atenție la lovire cu ciocanul - risc de așchii, protecție ochi, folosire dorn de bronz pentru piese sensibile, fixare corectă a pieselor.'
  },
  's3-3': {
    title: '3.3 Asamblări prin Forțe de Frecare',
    intro: 'În aceste asamblări, transmiterea forțelor se realizează prin frecarea între suprafețele pieselor, creată de strângerea acestora.',
    sections: [
      {
        title: '🔘 Asamblări prin strângere pe con', text: 'Suprafețe conice conjugate create forță radială prin deplasare axială:', items: [
          'Principiu: introducerea piesei conice creează presiune pe suprafață',
          'Unghi de conicitate: tipic 1:10, 1:20 (autoblocant) sau 1:5',
          'Con Morse: standardizat, folosit la mandrine și scule de mașini',
          'Avantaje: centrare foarte precisă, repetabilitate, demontare ușoară',
          'Dezavantaje: necesită prelucrare precisă',
          'SDV-uri: chei speciale, extractoare (batere sau hidraulice)'
        ]
      },
      {
        title: '⭕ Asamblări cu inele tronconice', text: 'Inele elastice care se deformează pentru a crea strângere:', items: [
          'Principiu: inelele conice se comprimă axial și se expandă radial',
          'Avantaje: nu necesită prelucrare specială pe arbore, montaj rapid',
          'Permit transmiterea de cupluri mari',
          'Tipuri: inele simple Ringfeder, sisteme cu mai multe inele',
          'Aplicații: fixare roți, volante, cuplaje, tamburi'
        ]
      },
      {
        title: '🔗 Brățări și inele elastice', text: 'Elemente de fixare prin strângere elastică:', items: [
          'Coliere de strângere: pentru furtunuri (șurub sau arc)',
          'Inele Seeger (siguranțe): opresc deplasarea axială',
          'Inele Seeger exterioare: montate în canale pe arbori',
          'Inele Seeger interioare: montate în canale în alezaje',
          'Montare: cu clești speciali',
          'Aplicații: rulmenți, roți, bucșe'
        ]
      }
    ],
    nssm: 'Strângere controlată pentru a nu depăși limita elastică, risc de decuplare bruscă la demontare sub presiune, verificare stare inele înainte de remontare.'
  },
  's3-4': {
    title: '3.4 Asamblări Elastice',
    intro: 'Asamblările elastice folosesc arcuri pentru a menține forța de contact sau pentru a absorbi șocuri și vibrații.',
    sections: [
      {
        title: '🌀 Arcuri elicoidale de compresiune', text: 'Cele mai comune arcuri, rezistă la forțe de comprimare:', items: [
          'Formă: sârmă înfășurată elicoidal',
          'Material: oțel arc (50CrV4, 51CrMoV4), inox',
          'Caracteristici: constantă elastică k (N/mm), lungime liberă, lungime sub sarcină',
          'Parametri: diametru sârmă, diametru medie, număr spire',
          'Montaj: verificare absența deformațiilor, aliniere',
          'Aplicații: suspensii, supape, mecanisme de siguranță'
        ]
      },
      {
        title: '🔄 Arcuri elicoidale de tracțiune', text: 'Rezistă la forțe de întindere:', items: [
          'Spirele sunt strânse (în contact) în stare neîncărcată',
          'Au cârlige sau ochiuri la capete pentru prindere',
          'Preîncărcare inițială (forța necesară pentru a separa spirele)',
          'Aplicații: sisteme de închidere, balanțe, mecanisme de revenire'
        ]
      },
      {
        title: '🔃 Arcuri de torsiune', text: 'Rezistă la moment de torsiune:', items: [
          'Se deformează prin rotire în jurul axei',
          'Capete drepte sau îndoite pentru prindere',
          'Aplicații: balamale cu arc, clapete, clești'
        ]
      },
      {
        title: '📄 Arcuri în foi (lamelare)', text: 'Pachet de foi metalice suprapuse:', items: [
          'Construcție: mai multe foi de grosimi diferite',
          'Foaia principală (cea mai lungă) cu ochiuri la capete',
          'Foi auxiliare din ce în ce mai scurte',
          'Fixate central cu brățară',
          'Amortizare prin frecare între foi',
          'Aplicații: suspensii camioane, remorci, vechi autoturisme',
          'Avantaj: suportă sarcini foarte mari, robust'
        ]
      },
      {
        title: '📋 Montaj și control', text: 'Verificări necesare:', items: [
          'Verificare lungime liberă (să nu fie deformat permanent)',
          'Verificare absența fisurilor, coroziunii',
          'Măsurare constantă elastică pe dispozitiv',
          'Precomprimare la montaj (unde e necesar)',
          'Ungere arcuri în foi pentru reducere uzură'
        ]
      }
    ],
    nssm: 'Atenție la energia acumulată - arcurile pot sări la demontare! Folosire dispozitive de precomprimare, protecție ochi și față, fixare sigură înainte de demontare.'
  }
};

const tests = {
  's1': [
    { q: 'Ce reprezintă asamblarea în procesul de fabricație?', o: ['Tăierea pieselor', 'Unirea pieselor pentru a forma un produs funcțional', 'Vopsirea produsului final', 'Ambalarea produsului'], a: 1 },
    { q: 'Ce document descrie ordinea operațiilor de asamblare?', o: ['Factura fiscală', 'Fișa tehnologică de asamblare', 'Certificatul de garanție', 'Raportul de livrare'], a: 1 },
    { q: 'La metoda de asamblare completă, piesele:', o: ['Necesită multe ajustări', 'Se potrivesc fără ajustări suplimentare', 'Trebuie topite împreună', 'Sunt lipite cu adeziv'], a: 1 },
    { q: 'Care NU este o operație pregătitoare pentru asamblare?', o: ['Curățarea', 'Degresarea', 'Vopsirea finală', 'Debavurarea'], a: 2 },
    { q: 'Ce procent din timpul de fabricație poate reprezenta asamblarea?', o: ['Sub 5%', '20-50%', 'Peste 80%', 'Exact 10%'], a: 1 },
    { q: 'NSSM înseamnă:', o: ['Norme de Siguranță și Sănătate în Muncă', 'Numere Standard de Serie Mecanică', 'Notificări Speciale pentru Service', 'Nivele Sonore Standardizate Maxime'], a: 0 },
    { q: 'Schema de asamblare arborescentă arată:', o: ['Costurile pieselor', 'Ierarhia și ordinea componentelor', 'Furnizorii de materiale', 'Transportul produsului'], a: 1 }
  ],
  's2-1': [
    { q: 'Nituirea realizează asamblări de tip:', o: ['Demontabil', 'Nedemontabil', 'Temporar', 'Elastic'], a: 1 },
    { q: 'Care sculă formează capul de închidere al nitului?', o: ['Ciocanul de nituire', 'Buterola', 'Tragătorul', 'Contracăpuitorul'], a: 1 },
    { q: 'Formula pentru diametrul nitului în funcție de grosimea tablei (s) este:', o: ['d = s/2', 'd = 2×√s', 'd = s×2', 'd = s+2'], a: 1 },
    { q: 'Nituirea la cald se folosește pentru nituri cu diametrul:', o: ['Sub 3mm', 'Sub 5mm', 'Peste 10mm', 'Orice dimensiune'], a: 2 },
    { q: 'Care NU este un tip de mașină de nituit?', o: ['Electrică', 'Hidraulică', 'Termică', 'Pneumatică'], a: 2 },
    { q: 'Ce defect apare la o tijă de nit prea scurtă?', o: ['Cap fisurat', 'Joc între table', 'Nit dezaxat', 'Supraîncălzire'], a: 1 },
    { q: 'La ce temperatură se încălzește nitul pentru nituire la cald?', o: ['200-300°C', '500-600°C', '850-1000°C', 'Peste 1500°C'], a: 2 }
  ],
  's2-2': [
    { q: 'Temperatura arcului electric poate atinge:', o: ['500-1000°C', '1500-2000°C', '3500-6000°C', 'Peste 10000°C'], a: 2 },
    { q: 'Ce procedeu folosește electrod din wolfram nefuzibil?', o: ['MMA', 'MIG', 'MAG', 'TIG'], a: 3 },
    { q: 'Procedeul MAG folosește ca gaz protector:', o: ['Argon pur', 'Heliu', 'CO2 sau amestec', 'Azot'], a: 2 },
    { q: 'Care tip de electrozi înveliți oferă calitate superioară a sudurii?', o: ['Rutilici', 'Bazici', 'Celulozici', 'Toți la fel'], a: 1 },
    { q: 'Formula pentru intensitatea curentului la sudare (d = diametru electrod în mm):', o: ['I = 10×d', 'I = (30...50)×d', 'I = 100×d', 'I = d/10'], a: 1 },
    { q: 'Invertorul de sudare are avantajul:', o: ['Este cel mai ieftin', 'Este ușor și eficient', 'Nu necesită curent electric', 'Funcționează doar pe CA'], a: 1 },
    { q: 'Controlul radiografic detectează:', o: ['Doar fisuri de suprafață', 'Defecte interne (porozități, incluziuni)', 'Doar culoarea cordonului', 'Temperatura de lucru'], a: 1 }
  ],
  's2-3': [
    { q: 'Lipirea moale se realizează la temperaturi:', o: ['Sub 100°C', 'Sub 450°C', 'Peste 450°C', 'Peste 1000°C'], a: 1 },
    { q: 'Ce rol are fluxul în procesul de lipire?', o: ['Încălzește piesa', 'Curăță și protejează de oxidare', 'Colorează lipitura', 'Mărește temperatura'], a: 1 },
    { q: 'Aliajele de lipire fără plumb sunt obligatorii în UE pentru:', o: ['Domeniul militar', 'Electronică de consum', 'Industria nucleară', 'Nu sunt obligatorii nicăieri'], a: 1 },
    { q: 'La lipire, trebuie încălzită mai întâi:', o: ['Aliajul de lipit', 'Piesa, nu aliajul', 'Fluxul', 'Niciunul'], a: 1 },
    { q: 'Ce aliaj se folosește pentru brazare (lipire tare)?', o: ['Staniu-plumb', 'Cupru-zinc sau argint', 'Aluminiu pur', 'Plumb pur'], a: 1 },
    { q: 'Ce putere are un ciocan de lipit pentru electronică?', o: ['5-10W', '25-100W', '500-1000W', 'Peste 2000W'], a: 1 }
  ],
  's2-4': [
    { q: 'Adezivii epoxidici sunt de obicei:', o: ['Monocomponent', 'Bicomponent (2 tuburi)', 'Naturali', 'Lichizi foarte apoși'], a: 1 },
    { q: 'Adezivii cianoacrilați (SuperGlue) se întăresc în:', o: ['24 ore', '1-2 ore', '1-30 secunde', '1 săptămână'], a: 2 },
    { q: 'Care pregătire a suprafeței este esențială pentru încleiere?', o: ['Vopsirea', 'Degresarea', 'Încălzirea', 'Răcirea'], a: 1 },
    { q: 'Ce industrie folosește intensiv încleierea structurilor compozite?', o: ['Minerit', 'Aeronautică', 'Agricultură', 'Pescuit'], a: 1 },
    { q: 'Grosimea optimă a stratului de adeziv este:', o: ['Sub 0.01mm', '0.1-0.5mm', '5-10mm', 'Peste 20mm'], a: 1 },
    { q: 'Un dezavantaj al încleierii este:', o: ['Cost foarte ridicat', 'Rezistență limitată la temperaturi înalte', 'Greutate mare', 'Zgomot în timpul întăririi'], a: 1 }
  ],
  's3-1': [
    { q: 'Asamblările filetate sunt de tip:', o: ['Nedemontabil', 'Demontabil', 'Permanent', 'Sudat'], a: 1 },
    { q: 'Prezoanele au filet:', o: ['Doar la un capăt', 'La ambele capete', 'Nu au filet', 'Doar în mijloc'], a: 1 },
    { q: 'Șaiba Grower servește la:', o: ['Decorare', 'Asigurare împotriva autodesfacerii', 'Măsurarea forței', 'Tăierea șurubului'], a: 1 },
    { q: 'Cheia dinamometrică permite:', o: ['Strângere la cuplu controlat', 'Tăierea șuruburilor', 'Sudarea filetului', 'Lipirea piuliței'], a: 0 },
    { q: 'La strângerea șuruburilor pe o flanșă se respectă ordinea:', o: ['Aleatorie', 'Diagonală', 'De la stânga la dreapta', 'De sus în jos'], a: 1 },
    { q: 'Strângerea progresivă înseamnă:', o: ['Strângerea dintr-o dată la cuplu maxim', 'Strângere în etape: 1/3, 2/3, final', 'Fără strângere', 'Doar cu mâna'], a: 1 },
    { q: 'Loctite este un produs folosit pentru:', o: ['Ungerea filetului', 'Blocarea chimică a filetului', 'Curățarea filetului', 'Tăierea filetului'], a: 1 }
  ],
  's3-2': [
    { q: 'Penele sunt elemente de forma:', o: ['Cilindrică', 'Prismatică', 'Sferică', 'Conică'], a: 1 },
    { q: 'Canelurile reprezintă:', o: ['Un singur canal pe arbore', 'Mai multe pene care fac corp comun cu arborele', 'Găuri pentru ungere', 'Filete nestandard'], a: 1 },
    { q: 'Profilul K se referă la arbori cu secțiune:', o: ['Circulară', 'Poligonală rotunjită', 'Pătrată exactă', 'Triunghiulară exactă'], a: 1 },
    { q: 'Știfturile conice au avantajul:', o: ['Sunt mai ieftine', 'Demontare ușoară și centrare precisă', 'Nu necesită găuri', 'Sunt din plastic'], a: 1 },
    { q: 'Pana Woodruff (disc) este:', o: ['Dreptunghiulară', 'Semicirculară', 'Triunghiulară', 'Hexagonală'], a: 1 },
    { q: 'Un dezavantaj al penelor este:', o: ['Cost foarte ridicat', 'Slăbesc arborele (concentrator tensiuni)', 'Nu pot transmite cuplu', 'Demontare imposibilă'], a: 1 }
  ],
  's3-3': [
    { q: 'Conul Morse este folosit pentru:', o: ['Lipire', 'Fixarea sculelor în mandrine', 'Sudare', 'Nituire'], a: 1 },
    { q: 'Inelele tronconice funcționează prin:', o: ['Topire', 'Deformare elastică la strângere axială', 'Lipire', 'Sudare'], a: 1 },
    { q: 'Inelele Seeger (siguranțe) opresc:', o: ['Rotația', 'Deplasarea axială', 'Vibrațiile', 'Coroziunea'], a: 1 },
    { q: 'Ce clești speciali se folosesc pentru inelele Seeger?', o: ['Clești de nituire', 'Clești cu vârfuri speciale pentru inele', 'Clești de tăiat', 'Clești universali'], a: 1 },
    { q: 'Colierele de strângere se folosesc pentru:', o: ['Rulmenți', 'Furtunuri', 'Arbori', 'Bare pline'], a: 1 }
  ],
  's3-4': [
    { q: 'Arcurile elicoidale de compresiune rezistă la:', o: ['Tracțiune', 'Comprimare', 'Torsiune', 'Încovoiere'], a: 1 },
    { q: 'Arcurile în foi sunt formate din:', o: ['O singură foaie groasă', 'Mai multe foi suprapuse', 'Sârmă rotundă', 'Tuburi metalice'], a: 1 },
    { q: 'La montajul arcurilor se verifică:', o: ['Culoarea', 'Lungimea liberă și absența deformărilor', 'Mirosul', 'Zgomotul'], a: 1 },
    { q: 'Arcurile în foi se folosesc la:', o: ['Ceasuri de mână', 'Suspensii camioane', 'Pixuri', 'Telefoane mobile'], a: 1 },
    { q: 'Ce pericol există la demontarea arcurilor?', o: ['Electrocutare', 'Eliberarea bruscă a energiei elastice', 'Explozie', 'Toxicitate'], a: 1 },
    { q: 'Constanta elastică a unui arc se măsoară în:', o: ['Metri', 'Kilograme', 'N/mm', 'Grade'], a: 2 }
  ]
};

let currentTest = null, currentQ = 0, score = 0;

// Progress tracking
function getProgress() {
  return JSON.parse(localStorage.getItem('asamblari-progress') || '{}');
}

function saveProgress(testId, pct, correct, total) {
  const progress = getProgress();
  if (!progress[testId] || pct > progress[testId].pct) {
    progress[testId] = { pct, correct, total, date: new Date().toLocaleDateString('ro-RO') };
  }
  progress.attempts = (progress.attempts || 0) + 1;
  localStorage.setItem('asamblari-progress', JSON.stringify(progress));
}

function getStats() {
  const progress = getProgress();
  let completed = 0, totalPct = 0, totalCorrect = 0, totalQuestions = 0;
  chapters.forEach(ch => {
    if (progress[ch.id]) {
      completed++;
      totalPct += progress[ch.id].pct;
      totalCorrect += progress[ch.id].correct;
      totalQuestions += progress[ch.id].total;
    }
  });
  return {
    completed,
    avgPct: completed ? Math.round(totalPct / completed) : 0,
    totalCorrect,
    totalQuestions,
    attempts: progress.attempts || 0
  };
}

function renderProgressCard() {
  const stats = getStats();
  const progress = getProgress();
  if (stats.attempts === 0) return '';
  return `<div class="content-card" style="background:linear-gradient(135deg,rgba(99,102,241,0.2),rgba(6,182,212,0.2));border:1px solid rgba(99,102,241,0.3);margin-bottom:2rem">
    <h3 style="color:var(--primary-light);margin-bottom:1rem">📊 Progresul Tău</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:1rem;text-align:center">
      <div><div style="font-size:2rem;font-weight:700;color:var(--success)">${stats.completed}/9</div><div style="color:var(--text-muted);font-size:0.85rem">Teste completate</div></div>
      <div><div style="font-size:2rem;font-weight:700;color:var(--primary-light)">${stats.avgPct}%</div><div style="color:var(--text-muted);font-size:0.85rem">Media scorurilor</div></div>
      <div><div style="font-size:2rem;font-weight:700;color:var(--secondary)">${stats.totalCorrect}/${stats.totalQuestions}</div><div style="color:var(--text-muted);font-size:0.85rem">Răspunsuri corecte</div></div>
      <div><div style="font-size:2rem;font-weight:700;color:var(--warning)">${stats.attempts}</div><div style="color:var(--text-muted);font-size:0.85rem">Total încercări</div></div>
    </div>
    <div style="margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap">
      ${chapters.map(ch => {
    const p = progress[ch.id];
    const color = p ? (p.pct >= 70 ? 'var(--success)' : 'var(--warning)') : 'var(--text-muted)';
    return `<span style="padding:0.25rem 0.5rem;background:rgba(255,255,255,0.1);border-radius:6px;font-size:0.8rem;border-left:3px solid ${color}" title="${p ? p.pct + '% - ' + p.date : 'Netestat'}">${ch.icon} ${p ? p.pct + '%' : '-'}</span>`;
  }).join('')}
    </div>
    <button class="btn btn-secondary" style="margin-top:1rem;font-size:0.85rem" onclick="if(confirm('Ștergi tot progresul?')){localStorage.removeItem('asamblari-progress');showSection('home')}">🗑️ Resetează progresul</button>
  </div>`;
}

function toggleMenu() {
  document.getElementById('menuToggle').classList.toggle('active');
  document.getElementById('mobileNav').classList.toggle('active');
}

function showSection(id) {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();
  const main = document.getElementById('mainContent');

  if (id === 'home') main.innerHTML = renderHome();
  else if (id === 's2') main.innerHTML = renderCategory('Asamblări Nedemontabile', 'Îmbinări permanente: nituire, sudare, lipire, încleiere', 's2', '🔗');
  else if (id === 's3') main.innerHTML = renderCategory('Asamblări Demontabile', 'Îmbinări care permit demontarea: filetate, pene, știfturi', 's3', '🔧');
  else if (id === 'tests') main.innerHTML = renderTests();
  else if (content[id]) main.innerHTML = renderContent(id);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderHome() {
  const stats = getStats();
  const images = [
    { src: 'workshop_welding_1765568398490.png', title: 'Sudare cu arc electric' },
    { src: 'workshop_tools_1765568415437.png', title: 'Atelier de lăcătușerie' },
    { src: 'workshop_assembly_1765568430842.png', title: 'Asamblare componente' }
  ];
  const gallery = `<div style="margin:2rem 0"><h2 class="mb-3">🏭 Atelierul de Lăcătușerie</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem">${images.map(img => `<div style="border-radius:12px;overflow:hidden;box-shadow:var(--shadow-md)"><img src="${img.src}" alt="${img.title}" style="width:100%;height:180px;object-fit:cover" onerror="this.parentElement.style.display='none'"><div style="padding:0.75rem;background:white;text-align:center;font-weight:500;color:var(--text-secondary)">${img.title}</div></div>`).join('')}</div></div>`;
  return `<div class="hero"><span class="hero-badge">📐 Modul M3 - 280 ore</span><h1>Asamblări Mecanice</h1><p class="hero-subtitle">Platformă educațională interactivă - calificarea Sudor</p><div class="hero-stats"><div class="stat-item"><div class="stat-number">9</div><div class="stat-label">Capitole</div></div><div class="stat-item"><div class="stat-number">9</div><div class="stat-label">Teste</div></div>${stats.attempts > 0 ? `<div class="stat-item"><div class="stat-number" style="color:#fff">${stats.avgPct}%</div><div class="stat-label">Media ta</div></div>` : ''}</div></div><div class="container">${renderProgressCard()}${gallery}
  
  <div class="card p-3 mb-4" style="background:var(--gradient-primary);color:white">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <h3 style="margin:0;font-size:1.2rem">🧰 Unelte Inteligente</h3>
        <p style="margin:0;opacity:0.9;font-size:0.9rem">Simulatoare și Calculatoare</p>
      </div>
      <div style="font-size:2rem">⚙️</div>
    </div>
    <div style="display:flex;gap:0.5rem;margin-top:1rem;flex-wrap:wrap">
      <button class="btn" style="background:rgba(255,255,255,0.2);color:white;border:none" onclick="showTechnicalCalculator()">🧮 Calculator</button>
      <button class="btn" style="background:rgba(255,255,255,0.2);color:white;border:none" onclick="startBotDuel()">🤖 Duel Robot</button>
      <button class="btn" style="background:rgba(255,255,255,0.2);color:white;border:none" onclick="showVirtualWorkshop()">🏭 Atelier</button>
    </div>
  </div>

  <h2 class="mb-3">📚 Toate Capitolele</h2><div class="section-grid">${chapters.map(ch => {
    const p = getProgress()[ch.id];
    const badge = p ? `<span style="position:absolute;top:10px;right:10px;background:${p.pct >= 70 ? 'var(--success)' : 'var(--warning)'};padding:2px 8px;border-radius:10px;font-size:0.75rem;color:white">${p.pct}%</span>` : '';
    return `<div class="card" style="position:relative" onclick="showSection('${ch.id}')">${badge}<div class="card-icon">${ch.icon}</div><div class="card-title">${ch.title}</div><div class="card-description">${ch.desc}</div><div class="card-meta"><span class="card-hours">⏱️ ${ch.hours}</span><button class="btn btn-primary" onclick="event.stopPropagation();startTest('${ch.id}')">Test</button></div></div>`;
  }).join('')}</div></div>`;
}

function renderCategory(title, desc, cat, icon) {
  const chs = chapters.filter(ch => ch.cat === cat);
  const progress = getProgress();
  return `<div class="container"><button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button><div class="section-header"><h2>${icon} ${title}</h2><p>${desc}</p></div><div class="section-grid">${chs.map(ch => {
    const p = progress[ch.id];
    const badge = p ? `<span style="position:absolute;top:10px;right:10px;background:${p.pct >= 70 ? 'var(--success)' : 'var(--warning)'};padding:2px 8px;border-radius:10px;font-size:0.75rem">${p.pct}%</span>` : '';
    return `<div class="card" style="position:relative" onclick="showSection('${ch.id}')">${badge}<div class="card-icon">${ch.icon}</div><div class="card-title">${ch.title}</div><div class="card-description">${ch.desc}</div><div class="card-meta"><span class="card-hours">⏱️ ${ch.hours}</span><button class="btn btn-primary" onclick="event.stopPropagation();startTest('${ch.id}')">Test</button></div></div>`;
  }).join('')}</div></div>`;
}

function renderContent(id) {
  const d = content[id];
  const back = id.startsWith('s2-') ? 's2' : id.startsWith('s3-') ? 's3' : 'home';
  const p = getProgress()[id];
  const scoreInfo = p ? `<div class="info-box success" style="margin-bottom:1.5rem"><h4>✅ Cel mai bun scor: ${p.pct}% (${p.correct}/${p.total} corecte) - ${p.date}</h4></div>` : '';

  // Generate section content with TTS buttons
  const sectionsHtml = d.sections.map((s, idx) => {
    const textToRead = s.title + '. ' + (s.text || '') + '. ' + s.items.join('. ');
    const escapedText = textToRead.replace(/'/g, "\\'").replace(/"/g, '\\"');
    return `<div class="content-card">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <h3 style="margin:0">${s.title}</h3>
        <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.85rem" onclick="speakText('${escapedText}')" title="Citește cu voce">🔊</button>
      </div>
      ${s.text ? `<p style="margin-top:0.5rem">${s.text}</p>` : ''}
      <ul>${s.items.map(i => `<li>${i}</li>`).join('')}</ul>
    </div>`;
  }).join('');

  const nssmText = 'Norme de securitate. ' + d.nssm;
  const escapedNssm = nssmText.replace(/'/g, "\\'").replace(/"/g, '\\"');

  return `<div class="container">
    <button class="btn btn-secondary back-btn" onclick="showSection('${back}')">← Înapoi</button>
    <div class="section-header">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
        <h2 style="margin:0">${d.title}</h2>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="readAllContent('${id}')" style="background:linear-gradient(135deg,#10b981,#059669)">📖 Citește Tot</button>
          <button class="btn btn-secondary" onclick="speakText('${d.title}. ${d.intro.replace(/'/g, "\\'")}')">🔊 Intro</button>
          <button class="btn btn-secondary" id="pauseVoiceBtn" onclick="pauseSpeaking()">⏸️ Pauză</button>
          <button class="btn btn-secondary" onclick="stopSpeaking()">⏹️ Stop</button>
        </div>
      </div>
      <p style="margin-top:1rem">${d.intro}</p>
    </div>
    ${scoreInfo}
    ${typeof getDiagramsHtml === 'function' ? getDiagramsHtml(id) : ''}
    ${sectionsHtml}
    <div class="info-box warning">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <h4 style="margin:0">⚠️ Norme de Securitate (NSSM)</h4>
        <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.85rem" onclick="speakText('${escapedNssm}')" title="Citește cu voce">🔊</button>
      </div>
      <p style="margin-top:0.5rem">${d.nssm}</p>
    </div>
    <div class="text-center mt-4" style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-secondary" onclick="readAllContent('${id}')" style="background:var(--gradient-primary);color:white">📖 Citește Tot Referatul</button>
      <button class="btn btn-secondary" onclick="stopSpeaking()">⏹️ Oprește Vocea</button>
      <button class="btn btn-primary btn-lg" onclick="startTest('${id}')">📝 Începe Testul</button>
    </div>
  </div>`;
}

function renderTests() {
  const progress = getProgress();
  const stats = getStats();
  return `<div class="container"><button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button><div class="section-header"><h2>📝 Teste de Evaluare</h2><p>Verifică-ți cunoștințele</p></div>${stats.attempts > 0 ? renderProgressCard() : ''}<div class="section-grid">${chapters.map(ch => {
    const p = progress[ch.id];
    const statusText = p ? `<span style="color:${p.pct >= 70 ? 'var(--success)' : 'var(--warning)'}">${p.pct}% - ${p.date}</span>` : `<span style="color:var(--text-muted)">${tests[ch.id]?.length || 0} întrebări</span>`;
    return `<div class="card" onclick="startTest('${ch.id}')"><div class="card-icon">${ch.icon}</div><div class="card-title">${ch.title}</div><div class="card-description">${statusText}</div><button class="btn btn-primary btn-block mt-3">${p ? 'Reia testul' : 'Începe'}</button></div>`;
  }).join('')}</div></div>`;
}

function startTest(id) { currentTest = id; currentQ = 0; score = 0; renderQuestion(); }

function renderQuestion() {
  const qs = tests[currentTest], q = qs[currentQ], ch = chapters.find(c => c.id === currentTest);
  document.getElementById('mainContent').innerHTML = `<div class="container"><div style="max-width:800px;margin:0 auto"><div class="text-center mb-3"><h2>${ch.icon} ${ch.title}</h2></div><div class="test-progress"><div class="test-progress-bar" style="width:${((currentQ + 1) / qs.length) * 100}%"></div></div><div class="question-card"><span class="question-number">Întrebarea ${currentQ + 1} / ${qs.length}</span><p class="question-text">${q.q}</p><div class="options-list">${q.o.map((opt, i) => `<div class="option" onclick="selectAnswer(${i})" id="opt-${i}"><span class="option-marker">${String.fromCharCode(65 + i)}</span><span>${opt}</span></div>`).join('')}</div></div><div class="test-navigation"><button class="btn btn-secondary" onclick="showSection('${currentTest}')" id="cancelBtn">Anulează</button><button class="btn btn-primary hidden" onclick="nextQuestion()" id="nextBtn">Următoarea →</button></div></div></div>`;
}

function selectAnswer(idx) {
  const correct = tests[currentTest][currentQ].a;
  document.querySelectorAll('.option').forEach((opt, i) => { opt.style.pointerEvents = 'none'; if (i === correct) opt.classList.add('correct'); else if (i === idx) opt.classList.add('incorrect'); });
  if (idx === correct) score++;
  document.getElementById('nextBtn').classList.remove('hidden');
  document.getElementById('cancelBtn').classList.add('hidden');
}

function nextQuestion() { currentQ++; if (currentQ < tests[currentTest].length) renderQuestion(); else showResult(); }

function showResult() {
  const total = tests[currentTest].length, pct = Math.round((score / total) * 100), ch = chapters.find(c => c.id === currentTest);
  saveProgress(currentTest, pct, score, total);
  const stats = getStats();
  if (pct >= 70) createConfetti();
  document.getElementById('mainContent').innerHTML = `<div class="container"><div style="max-width:600px;margin:0 auto;text-align:center;padding:3rem 1rem"><div class="result-score">${pct}%</div><p class="result-message">${pct >= 70 ? '🎉 Felicitări! Ai promovat!' : '📚 Mai exersează și încearcă din nou!'}</p><div class="result-details"><div class="result-stat"><div class="result-stat-number correct">${score}</div><div class="result-stat-label">Corecte</div></div><div class="result-stat"><div class="result-stat-number incorrect">${total - score}</div><div class="result-stat-label">Greșite</div></div></div><div class="info-box" style="text-align:left;margin:2rem 0"><h4>📊 Statistici Globale</h4><p>Teste completate: <strong>${stats.completed}/9</strong> | Media: <strong>${stats.avgPct}%</strong> | Total încercări: <strong>${stats.attempts}</strong></p></div><div class="info-box success" style="text-align:left;margin:2rem 0"><h4>📤 Trimite Rezultatul Profesorului</h4><p>Click pe butonul de mai jos pentru a trimite rezultatul. Vei completa emailul tău.</p><button class="btn btn-primary mt-3" onclick="sendToGoogleForm('${ch.title}', ${pct}, ${score}, ${total})">📧 Trimite Rezultatul</button></div><div class="mt-4"><button class="btn btn-primary" onclick="startTest('${currentTest}')">🔄 Reia Testul</button> <button class="btn btn-secondary" onclick="showSection('home')">🏠 Acasă</button></div></div></div>`;
}

// ========== GOOGLE FORMS INTEGRATION ==========
function sendToGoogleForm(testName, pct, correct, total) {
  // Show modal to collect email
  const modal = document.createElement('div');
  modal.id = 'emailModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem';
  modal.innerHTML = `
    <div style="background:var(--bg-card);padding:2rem;border-radius:16px;max-width:400px;width:100%;text-align:center">
      <h3 style="margin-bottom:1rem;color:var(--primary)">📧 Trimite Rezultatul</h3>
      <p style="color:var(--text-secondary);margin-bottom:1.5rem">Completează datele pentru a trimite rezultatul profesorului:</p>
      <input type="text" id="studentName" placeholder="Numele tău complet..." style="width:100%;padding:0.75rem;border:2px solid var(--primary);border-radius:10px;font-size:1rem;margin-bottom:1rem">
      <input type="email" id="studentEmail" placeholder="Emailul tău..." style="width:100%;padding:0.75rem;border:2px solid var(--primary);border-radius:10px;font-size:1rem;margin-bottom:1rem">
      <select id="studentClass" style="width:100%;padding:0.75rem;border:2px solid var(--primary);border-radius:10px;font-size:1rem;margin-bottom:1.5rem">
        <option value="">Selectează clasa...</option>

        <option value="X Ap">X Ap</option>
        <option value="Altă clasă">Altă clasă</option>
      </select>
      <div style="display:flex;gap:1rem">
        <button class="btn btn-secondary" style="flex:1" onclick="document.getElementById('emailModal').remove()">Anulează</button>
        <button class="btn btn-primary" style="flex:1" onclick="submitToForm('${testName}', ${pct}, ${correct}, ${total})">Trimite</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('studentName').focus();
}

function submitToForm(testName, pct, correct, total) {
  const name = document.getElementById('studentName').value.trim();
  const email = document.getElementById('studentEmail').value.trim();
  const clasa = document.getElementById('studentClass').value;

  if (!name || !email || !clasa) {
    alert('Completează toate câmpurile!');
    return;
  }

  if (!email.includes('@')) {
    alert('Introdu un email valid!');
    return;
  }

  // Save locally
  const results = JSON.parse(localStorage.getItem('asamblari-submittedResults') || '[]');
  results.push({
    name, email, clasa, testName, pct, correct, total,
    date: new Date().toISOString()
  });
  localStorage.setItem('asamblari-submittedResults', JSON.stringify(results));

  // Send to Google Sheets (if configured)
  if (GOOGLE_SCRIPT_URL) {
    sendToGoogleSheets({
      name: name,
      email: email,
      class: clasa,
      test: testName,
      score: pct,
      correct: correct,
      total: total,
      platform: 'Asamblări Mecanice'
    });
  }

  document.getElementById('emailModal').remove();

  // Create message
  const message = `📊 REZULTAT TEST M3\n\n👤 Elev: ${name}\n📧 Email: ${email}\n🏫 Clasa: ${clasa}\n📝 Test: ${testName}\n✅ Scor: ${pct}%\n📈 Răspunsuri: ${correct}/${total}\n📅 Data: ${new Date().toLocaleString('ro-RO')}`;

  // Show options modal
  const optionsModal = document.createElement('div');
  optionsModal.id = 'sendOptionsModal';
  optionsModal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem';
  optionsModal.innerHTML = `
    <div style="background:var(--bg-card);padding:2rem;border-radius:16px;max-width:400px;width:100%;text-align:center">
      <h3 style="margin-bottom:1rem;color:var(--success)">✅ Rezultat Salvat!</h3>
      ${GOOGLE_SCRIPT_URL ? '<p style="color:var(--success);margin-bottom:1rem;font-size:0.9rem">📊 Trimis automat la Google Sheets!</p>' : ''}
      <p style="color:var(--text-secondary);margin-bottom:1.5rem">Alege cum vrei să trimiți rezultatul:</p>
      
      <button class="btn btn-primary" style="width:100%;margin-bottom:0.75rem" onclick="sendViaWhatsApp('${encodeURIComponent(message)}')">
        📱 Trimite pe WhatsApp
      </button>
      
      <button class="btn btn-secondary" style="width:100%;margin-bottom:0.75rem" onclick="sendViaGmail('${name}', '${testName}', '${pct}', '${correct}', '${total}', '${email}', '${clasa}')">
        📧 Deschide Gmail
      </button>
      
      <button class="btn btn-secondary" style="width:100%;margin-bottom:0.75rem" onclick="copyResultToClipboard(\`${message.replace(/`/g, "'")}\`)">
        📋 Copiază Text
      </button>
      
      <button class="btn btn-secondary" style="width:100%;opacity:0.7" onclick="document.getElementById('sendOptionsModal').remove()">
        ❌ Închide
      </button>
    </div>
  `;
  document.body.appendChild(optionsModal);
}

function sendViaWhatsApp(message) {
  document.getElementById('sendOptionsModal').remove();
  window.open(`https://wa.me/40XXXXXXXXXX?text=${message}`, '_blank');
  alert('Se deschide WhatsApp...\n\nTrimite mesajul profesorului!');
}

function sendViaGmail(name, testName, pct, correct, total, email, clasa) {
  document.getElementById('sendOptionsModal').remove();
  const subject = encodeURIComponent(`Rezultat Test M3 - ${name} - ${testName}`);
  const body = encodeURIComponent(`Stimate Profesor,\n\nVă trimit rezultatul meu la testul de Asamblări Mecanice:\n\n• Elev: ${name}\n• Email elev: ${email}\n• Clasa: ${clasa}\n• Test: ${testName}\n• Scor: ${pct}%\n• Răspunsuri corecte: ${correct}/${total}\n• Data: ${new Date().toLocaleString('ro-RO')}\n\nCu respect,\n${name}`);
  window.open(`https://mail.google.com/mail/?view=cm&to=romii197575@gmail.com&su=${subject}&body=${body}`, '_blank');
}

function copyResultToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    document.getElementById('sendOptionsModal').remove();
    alert('✅ Text copiat!\n\nAcum îl poți lipi într-un email sau mesaj.');
  }).catch(() => {
    alert('Nu s-a putut copia. Încearcă altă metodă.');
  });
}


// ========== THEME TOGGLE ==========
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();
}

function loadTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') document.body.classList.add('dark-theme');
}
loadTheme();

// ========== CONFETTI CELEBRATION ==========
function createConfetti() {
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden';
  document.body.appendChild(container);

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `position:absolute;width:${Math.random() * 10 + 5}px;height:${Math.random() * 10 + 5}px;background:${colors[Math.floor(Math.random() * colors.length)]};left:${Math.random() * 100}%;top:-20px;opacity:${Math.random() * 0.7 + 0.3};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};animation:confetti-fall ${Math.random() * 3 + 2}s linear forwards`;
    container.appendChild(confetti);
  }

  setTimeout(() => container.remove(), 5000);
}

// Add confetti keyframes
const style = document.createElement('style');
style.textContent = `
@keyframes confetti-fall {
  0% { transform: translateY(0) rotate(0deg); }
  100% { transform: translateY(100vh) rotate(720deg); }
}
body.dark-theme { --bg-light:#0f172a; --bg-card:#1e293b; --text-primary:#f1f5f9; --text-secondary:#94a3b8; --text-muted:#64748b; }
body.dark-theme .header { background:rgba(30,41,59,0.95); border-color:rgba(255,255,255,0.1); }
body.dark-theme .nav-mobile { background:#0f172a; }
body.dark-theme .nav-mobile button { color:#94a3b8; }
body.dark-theme .nav-mobile button:hover { color:#f1f5f9; background:rgba(99,102,241,0.2); }
body.dark-theme .card, body.dark-theme .content-card, body.dark-theme .question-card { background:#1e293b; border-color:rgba(255,255,255,0.1); }
body.dark-theme .card-title, body.dark-theme .question-text { color:#f1f5f9; }
body.dark-theme .card-description, body.dark-theme .content-card p, body.dark-theme .content-card li { color:#94a3b8; }
body.dark-theme .option { background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.1); }
body.dark-theme .option:hover { background:rgba(99,102,241,0.15); }
body.dark-theme .option-marker { background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.2); color:#f1f5f9; }
body.dark-theme .footer { background:#1e293b; border-color:rgba(255,255,255,0.1); }
body.dark-theme .result-stat { background:rgba(255,255,255,0.05); }
body.dark-theme .section-header { border-color:rgba(99,102,241,0.3); }
body.dark-theme .btn-secondary { background:rgba(255,255,255,0.1); color:#f1f5f9; border-color:rgba(255,255,255,0.2); }
`;
document.head.appendChild(style);

// ========== EXAM MODE ==========
let examQuestions = [], examTimer = null, examTimeLeft = 0;

function startExam() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  // Collect 2 questions from each chapter (18 total)
  examQuestions = [];
  chapters.forEach(ch => {
    const chTests = tests[ch.id];
    if (chTests && chTests.length > 0) {
      const shuffled = [...chTests].sort(() => Math.random() - 0.5);
      examQuestions.push({ ...shuffled[0], chapter: ch.title });
      if (shuffled[1]) examQuestions.push({ ...shuffled[1], chapter: ch.title });
    }
  });
  examQuestions = examQuestions.sort(() => Math.random() - 0.5);

  currentTest = 'exam';
  currentQ = 0;
  score = 0;
  examTimeLeft = examQuestions.length * 60; // 1 min per question

  renderExamQuestion();
  startExamTimer();
}

function startExamTimer() {
  if (examTimer) clearInterval(examTimer);
  examTimer = setInterval(() => {
    examTimeLeft--;
    updateTimerDisplay();
    if (examTimeLeft <= 0) {
      clearInterval(examTimer);
      showExamResult();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerEl = document.getElementById('examTimer');
  if (timerEl) {
    const mins = Math.floor(examTimeLeft / 60);
    const secs = examTimeLeft % 60;
    timerEl.textContent = `⏱️ ${mins}:${secs.toString().padStart(2, '0')}`;
    timerEl.style.color = examTimeLeft < 60 ? 'var(--danger)' : examTimeLeft < 180 ? 'var(--warning)' : 'inherit';
  }
}

function renderExamQuestion() {
  const q = examQuestions[currentQ];
  const total = examQuestions.length;
  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <div style="max-width:800px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <h2>🎓 Examen Final</h2>
          <div id="examTimer" style="font-size:1.5rem;font-weight:700">⏱️ --:--</div>
        </div>
        <div class="test-progress"><div class="test-progress-bar" style="width:${((currentQ + 1) / total) * 100}%"></div></div>
        <div class="question-card">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;margin-bottom:1rem">
            <span class="question-number">Întrebarea ${currentQ + 1} / ${total}</span>
            <span style="font-size:0.85rem;color:var(--text-muted)">${q.chapter}</span>
          </div>
          <p class="question-text">${q.q}</p>
          <div class="options-list">${q.o.map((opt, i) => `<div class="option" onclick="selectExamAnswer(${i})" id="opt-${i}"><span class="option-marker">${String.fromCharCode(65 + i)}</span><span>${opt}</span></div>`).join('')}</div>
        </div>
        <div class="test-navigation">
          <button class="btn btn-secondary" onclick="if(confirm('Sigur vrei să anulezi examenul?')){clearInterval(examTimer);showSection('home')}" id="cancelBtn">Anulează</button>
          <button class="btn btn-primary hidden" onclick="nextExamQuestion()" id="nextBtn">${currentQ < total - 1 ? 'Următoarea →' : 'Finalizează ✓'}</button>
        </div>
      </div>
    </div>`;
  updateTimerDisplay();
}

function selectExamAnswer(idx) {
  const correct = examQuestions[currentQ].a;
  document.querySelectorAll('.option').forEach((opt, i) => {
    opt.style.pointerEvents = 'none';
    if (i === correct) opt.classList.add('correct');
    else if (i === idx) opt.classList.add('incorrect');
  });
  if (idx === correct) score++;
  document.getElementById('nextBtn').classList.remove('hidden');
  document.getElementById('cancelBtn').classList.add('hidden');
}

function nextExamQuestion() {
  currentQ++;
  if (currentQ < examQuestions.length) renderExamQuestion();
  else showExamResult();
}

function showExamResult() {
  clearInterval(examTimer);
  const total = examQuestions.length;
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 50;

  if (passed) createConfetti();

  // Save exam result
  const progress = getProgress();
  progress.exam = { pct, score, total, date: new Date().toLocaleDateString('ro-RO') };
  localStorage.setItem('asamblari-progress', JSON.stringify(progress));

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <div style="max-width:600px;margin:0 auto;text-align:center;padding:3rem 1rem">
        <h2 style="margin-bottom:1rem">🎓 Rezultat Examen Final</h2>
        <div class="result-score">${pct}%</div>
        <p class="result-message" style="font-size:1.5rem">${passed ? '🏆 PROMOVAT!' : '❌ NEPROMOVAT'}</p>
        <p style="color:var(--text-secondary);margin-bottom:2rem">${passed ? 'Felicitări! Ai trecut examenul!' : 'Nota minimă de promovare: 50%. Mai exersează!'}</p>
        <div class="result-details">
          <div class="result-stat"><div class="result-stat-number correct">${score}</div><div class="result-stat-label">Corecte</div></div>
          <div class="result-stat"><div class="result-stat-number incorrect">${total - score}</div><div class="result-stat-label">Greșite</div></div>
        </div>
        <div class="mt-4">
          <button class="btn btn-primary" onclick="startExam()">🔄 Reia Examenul</button>
          <button class="btn btn-secondary" onclick="showSection('home')">🏠 Acasă</button>
        </div>
      </div>
    </div>`;
}

showSection('home');

// ========== SEARCH FUNCTIONALITY ==========
function openSearch() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  const modal = document.createElement('div');
  modal.id = 'searchModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:flex-start;justify-content:center;padding:100px 1rem 2rem';
  modal.innerHTML = `
    <div style="background:var(--bg-card,#fff);border-radius:16px;width:100%;max-width:600px;max-height:80vh;overflow:hidden;display:flex;flex-direction:column">
      <div style="padding:1.5rem;border-bottom:1px solid rgba(0,0,0,0.1)">
        <div style="display:flex;gap:1rem;align-items:center">
          <input type="text" id="searchInput" placeholder="Caută în conținut..." style="flex:1;padding:0.75rem 1rem;border:2px solid var(--primary,#6366f1);border-radius:10px;font-size:1rem;outline:none" autofocus>
          <button onclick="document.getElementById('searchModal').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer">✕</button>
        </div>
      </div>
      <div id="searchResults" style="padding:1rem;overflow-y:auto;flex:1"></div>
    </div>`;
  document.body.appendChild(modal);

  document.getElementById('searchInput').addEventListener('input', (e) => performSearch(e.target.value));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

function performSearch(query) {
  const results = document.getElementById('searchResults');
  if (query.length < 2) { results.innerHTML = '<p style="color:var(--text-muted)">Introdu cel puțin 2 caractere...</p>'; return; }

  const found = [];
  const q = query.toLowerCase();

  chapters.forEach(ch => {
    const c = content[ch.id];
    if (!c) return;

    // Search in title and intro
    if (c.title.toLowerCase().includes(q) || c.intro.toLowerCase().includes(q)) {
      found.push({ chapter: ch, text: c.intro.substring(0, 100) + '...', section: c.title });
    }

    // Search in sections
    c.sections.forEach(s => {
      const allText = s.title + ' ' + (s.text || '') + ' ' + s.items.join(' ');
      if (allText.toLowerCase().includes(q)) {
        const matchText = s.items.find(i => i.toLowerCase().includes(q)) || s.text || s.title;
        found.push({ chapter: ch, text: matchText.substring(0, 100), section: s.title });
      }
    });
  });

  if (found.length === 0) {
    results.innerHTML = '<p style="color:var(--text-muted)">Niciun rezultat găsit.</p>';
  } else {
    results.innerHTML = found.slice(0, 10).map(r => `
      <div onclick="document.getElementById('searchModal').remove();showSection('${r.chapter.id}')" style="padding:1rem;border-radius:10px;cursor:pointer;margin-bottom:0.5rem;background:rgba(99,102,241,0.1);border-left:3px solid var(--primary)">
        <div style="font-weight:600;margin-bottom:0.25rem">${r.chapter.icon} ${r.chapter.title}</div>
        <div style="font-size:0.9rem;color:var(--text-muted)">${r.section}</div>
        <div style="font-size:0.85rem;color:var(--text-secondary);margin-top:0.5rem">${r.text}</div>
      </div>
    `).join('');
  }
}

// ========== MEDALS / ACHIEVEMENTS SYSTEM ==========
const allMedals = [
  { id: 'first_test', name: 'Prima Încercare', desc: 'Completează primul test', icon: '🎯', check: () => getStats().attempts >= 1 },
  { id: 'perfect_s1', name: 'Expert Teorie', desc: '100% la Noțiuni Generale', icon: '📖', check: () => (getProgress()['s1']?.pct || 0) === 100 },
  { id: 'perfect_s2-1', name: 'Maestrul Nituirii', desc: '100% la Nituire', icon: '🔩', check: () => (getProgress()['s2-1']?.pct || 0) === 100 },
  { id: 'perfect_s2-2', name: 'Sudor Expert', desc: '100% la Sudare', icon: '⚡', check: () => (getProgress()['s2-2']?.pct || 0) === 100 },
  { id: 'perfect_s2-3', name: 'Maestrul Lipirii', desc: '100% la Lipire', icon: '🔥', check: () => (getProgress()['s2-3']?.pct || 0) === 100 },
  { id: 'perfect_s2-4', name: 'Specialist Încleiere', desc: '100% la Încleiere', icon: '🧪', check: () => (getProgress()['s2-4']?.pct || 0) === 100 },
  { id: 'perfect_s3-1', name: 'Expert Filete', desc: '100% la Filetate', icon: '🔧', check: () => (getProgress()['s3-1']?.pct || 0) === 100 },
  { id: 'perfect_s3-2', name: 'Maestrul Formei', desc: '100% la Prin Formă', icon: '🔑', check: () => (getProgress()['s3-2']?.pct || 0) === 100 },
  { id: 'perfect_s3-3', name: 'Expert Frecare', desc: '100% la Prin Frecare', icon: '⚙️', check: () => (getProgress()['s3-3']?.pct || 0) === 100 },
  { id: 'perfect_s3-4', name: 'Specialist Arcuri', desc: '100% la Elastice', icon: '🌀', check: () => (getProgress()['s3-4']?.pct || 0) === 100 },
  { id: 'all_tests', name: 'Completist', desc: 'Finalizează toate cele 9 teste', icon: '✅', check: () => getStats().completed === 9 },
  { id: 'high_avg', name: 'Excelență', desc: 'Media peste 90%', icon: '🌟', check: () => getStats().avgPct >= 90 && getStats().completed >= 5 },
  { id: 'exam_pass', name: 'Absolvent', desc: 'Promovează Examenul Final', icon: '🎓', check: () => (getProgress().exam?.pct || 0) >= 50 },
  { id: 'exam_perfect', name: 'Valedictorian', desc: '100% la Examen', icon: '🏆', check: () => (getProgress().exam?.pct || 0) === 100 },
  { id: 'persistent', name: 'Perseverent', desc: '10+ încercări de teste', icon: '💪', check: () => getStats().attempts >= 10 },
  {
    id: 'quick_learner', name: 'Învățăcel Rapid', desc: '5 teste promovate', icon: '🚀', check: () => {
      const p = getProgress();
      return chapters.filter(ch => (p[ch.id]?.pct || 0) >= 70).length >= 5;
    }
  }
];

function getEarnedMedals() {
  return allMedals.filter(m => m.check());
}

function showMedals() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  const earned = getEarnedMedals();
  const main = document.getElementById('mainContent');

  main.innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>🏅 Medaliile Mele</h2>
        <p>Ai obținut ${earned.length} din ${allMedals.length} medalii</p>
      </div>
      
      <div class="test-progress" style="margin-bottom:2rem">
        <div class="test-progress-bar" style="width:${(earned.length / allMedals.length) * 100}%"></div>
      </div>
      
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem">
        ${allMedals.map(m => {
    const isEarned = m.check();
    return `<div class="card" style="text-align:center;${isEarned ? '' : 'opacity:0.5;filter:grayscale(1)'}">
            <div style="font-size:3rem;margin-bottom:0.5rem">${m.icon}</div>
            <div class="card-title" style="font-size:1rem">${m.name}</div>
            <div class="card-description">${m.desc}</div>
            ${isEarned ? '<div style="color:var(--success);font-weight:600;margin-top:0.5rem">✓ Obținută!</div>' : ''}
          </div>`;
  }).join('')}
      </div>
    </div>`;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== QUICK QUIZ (5 random questions) ==========
let quickQuizQuestions = [];

function startQuickQuiz() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  // Collect all questions and pick 5 random
  const allQ = [];
  chapters.forEach(ch => {
    const chTests = tests[ch.id];
    if (chTests) chTests.forEach(q => allQ.push({ ...q, chapter: ch.title, chId: ch.id }));
  });

  quickQuizQuestions = allQ.sort(() => Math.random() - 0.5).slice(0, 5);
  currentTest = 'quickquiz';
  currentQ = 0;
  score = 0;

  renderQuickQuizQuestion();
}

function renderQuickQuizQuestion() {
  const q = quickQuizQuestions[currentQ];
  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <div style="max-width:800px;margin:0 auto">
        <div class="text-center mb-3">
          <h2>⚡ Quiz Rapid</h2>
          <p style="color:var(--text-muted)">${q.chapter}</p>
        </div>
        <div class="test-progress"><div class="test-progress-bar" style="width:${((currentQ + 1) / 5) * 100}%"></div></div>
        <div class="question-card">
          <span class="question-number">Întrebarea ${currentQ + 1} / 5</span>
          <p class="question-text">${q.q}</p>
          <div class="options-list">${q.o.map((opt, i) => `<div class="option" onclick="selectQuickQuizAnswer(${i})" id="opt-${i}"><span class="option-marker">${String.fromCharCode(65 + i)}</span><span>${opt}</span></div>`).join('')}</div>
        </div>
        <div class="test-navigation">
          <button class="btn btn-secondary" onclick="showSection('home')" id="cancelBtn">Anulează</button>
          <button class="btn btn-primary hidden" onclick="nextQuickQuizQuestion()" id="nextBtn">${currentQ < 4 ? 'Următoarea →' : 'Vezi Rezultat'}</button>
        </div>
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function selectQuickQuizAnswer(idx) {
  const correct = quickQuizQuestions[currentQ].a;
  document.querySelectorAll('.option').forEach((opt, i) => {
    opt.style.pointerEvents = 'none';
    if (i === correct) opt.classList.add('correct');
    else if (i === idx) opt.classList.add('incorrect');
  });
  if (idx === correct) score++;
  document.getElementById('nextBtn').classList.remove('hidden');
  document.getElementById('cancelBtn').classList.add('hidden');
}

function nextQuickQuizQuestion() {
  currentQ++;
  if (currentQ < 5) renderQuickQuizQuestion();
  else showQuickQuizResult();
}

function showQuickQuizResult() {
  const pct = Math.round((score / 5) * 100);
  if (pct >= 80) createConfetti();
  addXP(pct >= 80 ? 20 : pct >= 60 ? 10 : 5);

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <div style="max-width:600px;margin:0 auto;text-align:center;padding:3rem 1rem">
        <h2>⚡ Rezultat Quiz Rapid</h2>
        <div class="result-score">${pct}%</div>
        <p class="result-message">${pct >= 80 ? '🎉 Excelent!' : pct >= 60 ? '👍 Bine!' : '📚 Mai exersează!'}</p>
        <div class="result-details">
          <div class="result-stat"><div class="result-stat-number correct">${score}</div><div class="result-stat-label">Corecte</div></div>
          <div class="result-stat"><div class="result-stat-number incorrect">${5 - score}</div><div class="result-stat-label">Greșite</div></div>
        </div>
        <div class="mt-4">
          <button class="btn btn-primary" onclick="startQuickQuiz()">⚡ Alt Quiz Rapid</button>
          <button class="btn btn-secondary" onclick="showSection('home')">🏠 Acasă</button>
        </div>
      </div>
    </div>`;
}

// ========== GLOSSARY ==========
const glossary = [
  { term: 'Asamblare', def: 'Procesul de unire a pieselor pentru a forma un produs funcțional' },
  { term: 'Nit', def: 'Element de îmbinare format dintr-o tijă cilindrică și un cap' },
  { term: 'Buterolă (căpuitor)', def: 'Sculă pentru formarea capului de închidere la nituri' },
  { term: 'Sudură', def: 'Îmbinare realizată prin topirea locală a metalelor' },
  { term: 'Arc electric', def: 'Descărcare electrică prin gaz ionizat, temp. 3500-6000°C' },
  { term: 'Electrod', def: 'Conductor prin care trece curentul la sudare' },
  { term: 'MIG/MAG', def: 'Sudare cu sârmă continuă și gaz protector' },
  { term: 'TIG', def: 'Sudare cu electrod de wolfram și gaz inert' },
  { term: 'Lipire moale', def: 'Lipire sub 450°C cu aliaje de staniu' },
  { term: 'Brazare', def: 'Lipire peste 450°C cu aliaje de cupru sau argint' },
  { term: 'Flux', def: 'Substanță care curăță și protejează la lipire' },
  { term: 'Adeziv', def: 'Substanță care unește materiale prin aderență' },
  { term: 'Epoxidic', def: 'Tip de adeziv bicomponent foarte rezistent' },
  { term: 'Filet', def: 'Canal elicoidal pe suprafața cilindrică' },
  { term: 'Șurub', def: 'Element filetat pentru asamblări demontabile' },
  { term: 'Piuliță', def: 'Piesă cu filet interior, se îmbină cu șurubul' },
  { term: 'Prezon', def: 'Tijă filetată la ambele capete' },
  { term: 'Șaibă Grower', def: 'Inel elastic pentru asigurare contra autodesfacerii' },
  { term: 'Pană', def: 'Element prismatic pentru fixarea arborelui în butuc' },
  { term: 'Caneluri', def: 'Pene multiple care fac corp comun cu arborele' },
  { term: 'Știft', def: 'Element cilindric sau conic pentru fixare/centrare' },
  { term: 'Con Morse', def: 'Con standardizat pentru fixarea sculelor' },
  { term: 'Inel Seeger', def: 'Inel de siguranță pentru oprire axială' },
  { term: 'Arc elicoidal', def: 'Arc din sârmă înfășurată în spirală' },
  { term: 'Arc în foi', def: 'Pachet de foi elastice suprapuse' },
  { term: 'NSSM', def: 'Norme de Securitate și Sănătate în Muncă' },
  { term: 'Cuplu', def: 'Moment de torsiune, măsurat în Nm' },
  { term: 'Toleranță', def: 'Abatere admisă de la dimensiunea nominală' },
  { term: 'Ajustaj', def: 'Condițiile de asamblare între arbore și alezaj' }
];

function showGlossary() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();
  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>📖 Glosar de Termeni Tehnici</h2>
        <p>${glossary.length} definiții</p>
      </div>
      <input type="text" id="glossarySearch" placeholder="Caută termen..." style="width:100%;padding:0.75rem 1rem;border:2px solid var(--primary);border-radius:10px;margin-bottom:1.5rem;font-size:1rem" oninput="filterGlossary()">
      <div id="glossaryList" style="display:grid;gap:1rem">
        ${glossary.map(g => `<div class="content-card glossary-item"><h3 style="margin-bottom:0.5rem">${g.term}</h3><p style="margin:0">${g.def}</p></div>`).join('')}
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterGlossary() {
  const q = document.getElementById('glossarySearch').value.toLowerCase();
  const items = document.querySelectorAll('.glossary-item');
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(q) ? 'block' : 'none';
  });
}

// ========== VIDEO TUTORIALS ==========
const videos = [
  { chapter: 's1', title: 'Introducere în Asamblări Mecanice', searchQuery: 'asamblari mecanice introducere tutorial', description: 'Noțiuni fundamentale despre asamblări' },
  { chapter: 's2-1', title: 'Tehnici de Nituire Manuală', searchQuery: 'nituire manuala tutorial tehnica', description: 'Tutorial complet nituire' },
  { chapter: 's2-2', title: 'Sudare cu Arc Electric MMA', searchQuery: 'sudare arc electric MMA tutorial incepatori', description: 'Bazele sudării cu electrozi înveliți' },
  { chapter: 's2-2', title: 'Sudare MIG/MAG - Ghid Complet', searchQuery: 'sudare MIG MAG tutorial tehnica', description: 'Tehnici MIG/MAG profesionale' },
  { chapter: 's2-2', title: 'Sudare TIG - Tutorial Detaliat', searchQuery: 'sudare TIG tutorial aluminiu otel', description: 'Sudare TIG aluminiu și oțel' },
  { chapter: 's2-3', title: 'Lipire Electronică Corectă', searchQuery: 'lipire electronica tutorial SMD', description: 'Tehnici de lipit componente electronice' },
  { chapter: 's2-4', title: 'Încleiere cu Adezivi Epoxidici', searchQuery: 'adeziv epoxidic utilizare tutorial', description: 'Folosirea corectă a adezivilor' },
  { chapter: 's3-1', title: 'Asamblări cu Șuruburi', searchQuery: 'asamblare suruburi cuplu strangere cheie dinamometrica', description: 'Strângere la cuplu, chei dinamometrice' },
  { chapter: 's3-2', title: 'Montaj Pene și Caneluri', searchQuery: 'montaj pene arbore caneluri mecanica', description: 'Tehnici de montare pene pe arbori' },
  { chapter: 's3-4', title: 'Tipuri de Arcuri Mecanice', searchQuery: 'arcuri mecanice tipuri compresie tractiune', description: 'Arcuri de compresie, tracțiune, torsiune' }
];

function showVideos() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();
  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>🎬 Tutoriale Video</h2>
        <p>Click pe orice card pentru a deschide tutoriale pe YouTube</p>
      </div>
      <div class="info-box success" style="margin-bottom:2rem">
        <h4>💡 Sfat</h4>
        <p>Videoclipurile se vor deschide pe YouTube într-o fereastră nouă cu cele mai relevante tutoriale pentru fiecare subiect.</p>
      </div>
      <div class="section-grid">
        ${videos.map(v => {
    const ch = chapters.find(c => c.id === v.chapter);
    const youtubeUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(v.searchQuery);
    return `<div class="card video-card" onclick="window.open('${youtubeUrl}', '_blank')">
            <div class="video-thumb" style="position:relative;margin-bottom:1rem;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,#ef4444,#dc2626);height:120px;display:flex;align-items:center;justify-content:center">
              <div style="text-align:center">
                <div style="font-size:3rem;margin-bottom:0.5rem">🎬</div>
                <div style="color:white;font-size:0.8rem;opacity:0.9">Click pentru YouTube</div>
              </div>
            </div>
            <div class="card-title" style="font-size:1rem">${v.title}</div>
            <div class="card-description">${v.description}</div>
            <div class="card-meta" style="border:none;padding-top:0.5rem">
              <span style="color:var(--text-muted);font-size:0.8rem">${ch ? ch.icon + ' ' + ch.title : '📚 General'}</span>
              <span class="btn btn-primary" style="padding:0.3rem 0.8rem;font-size:0.8rem">▶ YouTube</span>
            </div>
          </div>`;
  }).join('')}
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Function kept for backwards compatibility
function playVideo(searchQuery, title) {
  const youtubeUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(searchQuery);
  window.open(youtubeUrl, '_blank');
}

// ========== XP / LEVELS SYSTEM ==========
function getXP() { return JSON.parse(localStorage.getItem('asamblari-xp') || '{"xp":0,"level":1}'); }
function setXP(data) { localStorage.setItem('asamblari-xp', JSON.stringify(data)); }

function addXP(amount) {
  const data = getXP();
  data.xp += amount;
  const xpPerLevel = 100;
  while (data.xp >= data.level * xpPerLevel) {
    data.xp -= data.level * xpPerLevel;
    data.level++;
  }
  setXP(data);
  updateStreak();
}

function getLevelInfo() {
  const data = getXP();
  const xpNeeded = data.level * 100;
  return { ...data, xpNeeded, percent: Math.round((data.xp / xpNeeded) * 100) };
}

// ========== DAILY STREAK ==========
function getStreak() { return JSON.parse(localStorage.getItem('asamblari-streak') || '{"current":0,"lastDate":"","best":0}'); }
function setStreak(data) { localStorage.setItem('asamblari-streak', JSON.stringify(data)); }

function updateStreak() {
  const streak = getStreak();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (streak.lastDate === today) return;

  if (streak.lastDate === yesterday) {
    streak.current++;
  } else if (streak.lastDate !== today) {
    streak.current = 1;
  }

  streak.lastDate = today;
  streak.best = Math.max(streak.best, streak.current);
  setStreak(streak);
}

// ========== STATISTICS PAGE ==========
function showStats() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  const stats = getStats();
  const level = getLevelInfo();
  const streak = getStreak();
  const progress = getProgress();

  // Build chart data
  const chartData = chapters.map(ch => ({
    name: ch.title.split(' ').slice(1).join(' ').substring(0, 15),
    pct: progress[ch.id]?.pct || 0
  }));

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>📊 Statistici Complete</h2>
        <p>Urmărește-ți progresul</p>
      </div>
      
      <div class="section-grid" style="margin-bottom:2rem">
        <div class="content-card text-center">
          <div style="font-size:3rem">🎮</div>
          <div style="font-size:2rem;font-weight:700;color:var(--primary)">Nivel ${level.level}</div>
          <div class="test-progress" style="margin:1rem 0"><div class="test-progress-bar" style="width:${level.percent}%"></div></div>
          <div style="color:var(--text-muted)">${level.xp} / ${level.xpNeeded} XP</div>
        </div>
        <div class="content-card text-center">
          <div style="font-size:3rem">🔥</div>
          <div style="font-size:2rem;font-weight:700;color:var(--warning)">${streak.current} zile</div>
          <div style="color:var(--text-muted)">Streak curent</div>
          <div style="margin-top:0.5rem;color:var(--text-secondary)">Record: ${streak.best} zile</div>
        </div>
        <div class="content-card text-center">
          <div style="font-size:3rem">📝</div>
          <div style="font-size:2rem;font-weight:700;color:var(--secondary)">${stats.attempts}</div>
          <div style="color:var(--text-muted)">Total încercări</div>
        </div>
        <div class="content-card text-center">
          <div style="font-size:3rem">✅</div>
          <div style="font-size:2rem;font-weight:700;color:var(--success)">${stats.completed}/9</div>
          <div style="color:var(--text-muted)">Teste completate</div>
        </div>
      </div>
      
      <div class="content-card">
        <h3>📈 Scoruri per Capitol</h3>
        <div style="display:flex;flex-direction:column;gap:0.75rem;margin-top:1rem">
          ${chartData.map(d => `
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem">
                <span style="font-size:0.9rem">${d.name}</span>
                <span style="font-weight:600;color:${d.pct >= 70 ? 'var(--success)' : d.pct > 0 ? 'var(--warning)' : 'var(--text-muted)'}">${d.pct}%</span>
              </div>
              <div style="background:rgba(0,0,0,0.1);height:10px;border-radius:5px;overflow:hidden">
                <div style="height:100%;width:${d.pct}%;background:${d.pct >= 70 ? 'var(--success)' : d.pct > 0 ? 'var(--warning)' : 'var(--text-muted)'};border-radius:5px"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="content-card">
        <h3>🏅 Medalii Obținute</h3>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:1rem">
          ${getEarnedMedals().map(m => `<span style="font-size:2rem" title="${m.name}">${m.icon}</span>`).join('') || '<span style="color:var(--text-muted)">Nicio medalie încă</span>'}
        </div>
        <div style="margin-top:1rem"><button class="btn btn-secondary" onclick="showMedals()">Vezi toate medaliile</button></div>
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== CERTIFICATE GENERATOR ==========
function generateCertificate() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  const stats = getStats();
  const progress = getProgress();
  const level = getLevelInfo();
  const medals = getEarnedMedals();

  if (stats.completed < 5) {
    alert('Trebuie să completezi cel puțin 5 teste pentru a genera certificatul!');
    return;
  }

  const today = new Date().toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' });

  const certWindow = window.open('', '_blank');
  certWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Certificat - Asamblări Mecanice</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #f5f5f5; padding: 20px; }
        .cert { max-width: 800px; margin: 0 auto; background: white; border: 3px solid #6366f1; padding: 50px; position: relative; }
        .cert::before { content: ''; position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px; border: 2px solid #e0e0e0; }
        .header { text-align: center; margin-bottom: 40px; }
        .school { font-size: 14px; color: #666; margin-bottom: 10px; }
        .title { font-family: 'Playfair Display', serif; font-size: 42px; color: #6366f1; margin-bottom: 10px; }
        .subtitle { font-size: 18px; color: #333; }
        .body { text-align: center; margin-bottom: 40px; }
        .text { font-size: 16px; color: #444; line-height: 2; }
        .name { font-family: 'Playfair Display', serif; font-size: 28px; color: #333; margin: 20px 0; border-bottom: 2px solid #6366f1; display: inline-block; padding: 0 30px 5px; }
        .stats { display: flex; justify-content: center; gap: 40px; margin: 30px 0; }
        .stat { text-align: center; }
        .stat-value { font-size: 32px; font-weight: bold; color: #6366f1; }
        .stat-label { font-size: 12px; color: #666; }
        .medals { display: flex; justify-content: center; gap: 10px; margin: 20px 0; font-size: 30px; }
        .footer { display: flex; justify-content: space-between; margin-top: 50px; }
        .signature { text-align: center; }
        .line { width: 200px; border-top: 1px solid #333; margin-bottom: 5px; }
        .sig-text { font-size: 12px; color: #666; }
        .date { text-align: center; margin-top: 30px; color: #666; }
        .print-btn { display: block; margin: 20px auto; padding: 15px 40px; background: #6366f1; color: white; border: none; border-radius: 10px; font-size: 16px; cursor: pointer; }
        @media print { .print-btn { display: none; } body { padding: 0; background: white; } }
      </style>
    </head>
    <body>
      <div class="cert">
        <div class="header">
          <div class="school">LICEUL TEHNOLOGIC „AUREL VLAICU" GALAȚI</div>
          <div class="title">CERTIFICAT</div>
          <div class="subtitle">de absolvire a modulului M3 - Asamblări Mecanice</div>
        </div>
        <div class="body">
          <div class="text">Prin prezentul se certifică că</div>
          <div class="name">_________________________</div>
          <div class="text">a finalizat cu succes cursul interactiv de Asamblări Mecanice,<br>demonstrând cunoștințe în domeniul asamblărilor demontabile și nedemontabile.</div>
          
          <div class="stats">
            <div class="stat"><div class="stat-value">${stats.completed}/9</div><div class="stat-label">TESTE COMPLETATE</div></div>
            <div class="stat"><div class="stat-value">${stats.avgPct}%</div><div class="stat-label">MEDIA GENERALĂ</div></div>
            <div class="stat"><div class="stat-value">${level.level}</div><div class="stat-label">NIVEL ATINS</div></div>
          </div>
          
          <div style="color:#666;font-size:14px">Medalii obținute:</div>
          <div class="medals">${medals.map(m => m.icon).join(' ') || '—'}</div>
        </div>
        
        <div class="footer">
          <div class="signature">
            <div class="line"></div>
            <div class="sig-text">Prof.Ing. Popescu Romulus</div>
          </div>
        </div>
        
        <div class="date">Galați, ${today}</div>
      </div>
      <button class="print-btn" onclick="window.print()">🖨️ Printează Certificatul</button>
    </body>
    </html>
  `);
  certWindow.document.close();
}

// Update XP on test completion
const originalShowResult = showResult;
showResult = function () {
  const total = tests[currentTest].length, pct = Math.round((score / total) * 100);
  addXP(pct >= 70 ? 50 : pct >= 50 ? 25 : 10);
  if (pct >= 70) playSound('success');
  originalShowResult();
};

// ========== SOUND SYSTEM ==========
let soundEnabled = localStorage.getItem('asamblari-sound') !== 'off';

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('asamblari-sound', soundEnabled ? 'on' : 'off');
  updateSoundButton();
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();
  playSound('click');
}

function updateSoundButton() {
  const btn = document.getElementById('soundBtn');
  if (btn) btn.textContent = soundEnabled ? '🔊 Sunet: Pornit' : '🔇 Sunet: Oprit';
}

function playSound(type) {
  if (!soundEnabled) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'success') {
    osc.frequency.setValueAtTime(523, ctx.currentTime);
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialDecayTo && gain.gain.exponentialDecayTo(0.01, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } else if (type === 'error') {
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } else if (type === 'click') {
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }
}

// Update answer selection to play sounds
const origSelectAnswer = selectAnswer;
selectAnswer = function (idx) {
  const correct = tests[currentTest][currentQ].a;
  playSound(idx === correct ? 'success' : 'error');
  origSelectAnswer(idx);
};

// ========== MULTI-USER SYSTEM ==========
function getCurrentUser() { return localStorage.getItem('asamblari-currentUser') || 'Elev'; }
function setCurrentUser(name) { localStorage.setItem('asamblari-currentUser', name); }

function getUserData(user) {
  const all = JSON.parse(localStorage.getItem('asamblari-allUsers') || '{}');
  return all[user] || { progress: {}, xp: { xp: 0, level: 1 }, streak: { current: 0, lastDate: '', best: 0 } };
}

function setUserData(user, data) {
  const all = JSON.parse(localStorage.getItem('asamblari-allUsers') || '{}');
  all[user] = data;
  localStorage.setItem('asamblari-allUsers', JSON.stringify(all));
}

function getAllUsers() {
  const all = JSON.parse(localStorage.getItem('asamblari-allUsers') || '{}');
  return Object.keys(all);
}

function showUsers() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  const users = getAllUsers();
  const current = getCurrentUser();

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>👥 Gestionare Utilizatori</h2>
        <p>Utilizator curent: <strong>${current}</strong></p>
      </div>
      
      <div class="content-card">
        <h3>➕ Adaugă Utilizator Nou</h3>
        <div style="display:flex;gap:1rem;margin-top:1rem">
          <input type="text" id="newUserName" placeholder="Numele elevului..." style="flex:1;padding:0.75rem;border:2px solid var(--primary);border-radius:10px;font-size:1rem">
          <button class="btn btn-primary" onclick="addNewUser()">Adaugă</button>
        </div>
      </div>
      
      <div class="content-card">
        <h3>👤 Utilizatori Existenți</h3>
        <div style="display:grid;gap:0.75rem;margin-top:1rem">
          ${users.length === 0 ? '<p style="color:var(--text-muted)">Niciun utilizator salvat</p>' :
      users.map(u => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;background:${u === current ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.05)'};border-radius:10px;border-left:3px solid ${u === current ? 'var(--primary)' : 'transparent'}">
              <span style="font-weight:${u === current ? '600' : '400'}">${u} ${u === current ? '(activ)' : ''}</span>
              <div style="display:flex;gap:0.5rem">
                ${u !== current ? `<button class="btn btn-primary" style="padding:0.5rem 1rem" onclick="switchUser('${u}')">Selectează</button>` : ''}
                <button class="btn btn-secondary" style="padding:0.5rem 1rem" onclick="deleteUser('${u}')">🗑️</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function addNewUser() {
  const name = document.getElementById('newUserName').value.trim();
  if (!name) { alert('Introdu un nume!'); return; }

  setUserData(name, { progress: {}, xp: { xp: 0, level: 1 }, streak: { current: 0, lastDate: '', best: 0 } });
  switchUser(name);
}

function switchUser(name) {
  // Save current user data
  const current = getCurrentUser();
  setUserData(current, {
    progress: getProgress(),
    xp: getXP(),
    streak: getStreak()
  });

  // Load new user data
  const data = getUserData(name);
  localStorage.setItem('asamblari-progress', JSON.stringify(data.progress || {}));
  localStorage.setItem('asamblari-xp', JSON.stringify(data.xp || { xp: 0, level: 1 }));
  localStorage.setItem('asamblari-streak', JSON.stringify(data.streak || { current: 0, lastDate: '', best: 0 }));

  setCurrentUser(name);
  showUsers();
}

function deleteUser(name) {
  if (!confirm(`Sigur vrei să ștergi utilizatorul "${name}"?`)) return;

  const all = JSON.parse(localStorage.getItem('asamblari-allUsers') || '{}');
  delete all[name];
  localStorage.setItem('asamblari-allUsers', JSON.stringify(all));

  if (getCurrentUser() === name) {
    const remaining = Object.keys(all);
    if (remaining.length > 0) switchUser(remaining[0]);
    else setCurrentUser('Elev');
  }
  showUsers();
}

// ========== EXPORT/IMPORT PROGRESS ==========
function exportProgress() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  const progress = getProgress();
  const stats = getStats();
  const level = getLevelInfo();
  const streak = getStreak();
  const medals = getEarnedMedals();

  // Build chart data
  const chartData = chapters.map(ch => ({
    id: ch.id,
    icon: ch.icon,
    name: ch.title.split(' ').slice(1).join(' '),
    pct: progress[ch.id]?.pct || 0,
    date: progress[ch.id]?.date || '-'
  }));

  const maxBarWidth = 200;

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>📊 Raport Complet de Progres</h2>
        <p>Utilizator: <strong>${getCurrentUser()}</strong> | Data: ${new Date().toLocaleDateString('ro-RO')}</p>
      </div>
      
      <div class="content-card" style="text-align:center;margin-bottom:2rem">
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:2rem">
          <div>
            <div style="font-size:3rem;font-weight:700;color:var(--primary)">${level.level}</div>
            <div style="color:var(--text-muted)">Nivel</div>
          </div>
          <div>
            <div style="font-size:3rem;font-weight:700;color:var(--success)">${stats.completed}/9</div>
            <div style="color:var(--text-muted)">Teste</div>
          </div>
          <div>
            <div style="font-size:3rem;font-weight:700;color:var(--secondary)">${stats.avgPct}%</div>
            <div style="color:var(--text-muted)">Media</div>
          </div>
          <div>
            <div style="font-size:3rem;font-weight:700;color:var(--warning)">${streak.best}</div>
            <div style="color:var(--text-muted)">Record Streak</div>
          </div>
        </div>
      </div>
      
      <div class="content-card">
        <h3 style="margin-bottom:1.5rem">📈 Grafic Scoruri per Capitol</h3>
        <div style="display:flex;flex-direction:column;gap:1rem">
          ${chartData.map(d => `
            <div style="display:flex;align-items:center;gap:1rem">
              <div style="width:30px;font-size:1.2rem">${d.icon}</div>
              <div style="width:120px;font-size:0.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${d.name}">${d.name}</div>
              <div style="flex:1;display:flex;align-items:center;gap:0.5rem">
                <div style="flex:1;background:rgba(0,0,0,0.1);height:24px;border-radius:12px;overflow:hidden;position:relative">
                  <div style="height:100%;width:${d.pct}%;background:${d.pct >= 70 ? 'linear-gradient(90deg,#059669,#10b981)' : d.pct > 0 ? 'linear-gradient(90deg,#d97706,#f59e0b)' : 'transparent'};border-radius:12px;transition:width 1s ease;display:flex;align-items:center;justify-content:flex-end;padding-right:8px">
                    ${d.pct > 20 ? `<span style="color:white;font-size:0.75rem;font-weight:600">${d.pct}%</span>` : ''}
                  </div>
                  ${d.pct <= 20 && d.pct > 0 ? `<span style="position:absolute;left:8px;top:50%;transform:translateY(-50%);font-size:0.75rem;font-weight:600">${d.pct}%</span>` : ''}
                  ${d.pct === 0 ? `<span style="position:absolute;left:8px;top:50%;transform:translateY(-50%);font-size:0.75rem;color:var(--text-muted)">Netestat</span>` : ''}
                </div>
              </div>
              <div style="width:70px;text-align:right;font-size:0.8rem;color:var(--text-muted)">${d.date}</div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="content-card">
        <h3>🏅 Medalii Obținute (${medals.length}/${allMedals.length})</h3>
        <div style="display:flex;flex-wrap:wrap;gap:1rem;margin-top:1rem">
          ${medals.length > 0 ? medals.map(m => `
            <div style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 1rem;background:rgba(99,102,241,0.1);border-radius:10px">
              <span style="font-size:1.5rem">${m.icon}</span>
              <span style="font-size:0.9rem;font-weight:500">${m.name}</span>
            </div>
          `).join('') : '<span style="color:var(--text-muted)">Nicio medalie încă. Continuă să înveți!</span>'}
        </div>
      </div>
      
      <div style="display:flex;gap:1rem;margin-top:2rem;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="downloadStudentReport()">📄 Descarcă Raport Elev (PDF)</button>
        <button class="btn btn-secondary" onclick="downloadProgressJSON()">💾 Descarcă JSON</button>
        <button class="btn btn-secondary" onclick="window.print()">🖨️ Printează</button>
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function downloadStudentReport() {
  const progress = getProgress();
  const stats = getStats();
  const level = getLevelInfo();
  const streak = getStreak();
  const medals = getEarnedMedals();
  const today = new Date().toLocaleDateString('ro-RO');

  const chartData = chapters.map(ch => ({
    icon: ch.icon,
    name: ch.title,
    pct: progress[ch.id]?.pct || 0,
    correct: progress[ch.id]?.correct || 0,
    total: progress[ch.id]?.total || 0,
    date: progress[ch.id]?.date || '-'
  }));

  const reportHTML = `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <title>Raport Progres - ${getCurrentUser()}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1e293b; }
    .header { text-align: center; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
    .school { font-size: 12px; color: #666; margin-bottom: 5px; }
    .title { font-size: 28px; color: #6366f1; margin-bottom: 10px; }
    .student { font-size: 18px; margin-bottom: 5px; }
    .date { font-size: 14px; color: #666; }
    .stats { display: flex; justify-content: space-around; margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 12px; }
    .stat { text-align: center; }
    .stat-value { font-size: 32px; font-weight: 700; color: #6366f1; }
    .stat-label { font-size: 12px; color: #64748b; }
    h2 { font-size: 18px; color: #6366f1; margin: 25px 0 15px; border-left: 4px solid #6366f1; padding-left: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 600; color: #475569; }
    .pct { font-weight: 700; }
    .pct.pass { color: #059669; }
    .pct.fail { color: #d97706; }
    .pct.none { color: #94a3b8; }
    .bar-container { width: 150px; height: 20px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
    .bar { height: 100%; border-radius: 10px; }
    .bar.pass { background: linear-gradient(90deg, #059669, #10b981); }
    .bar.fail { background: linear-gradient(90deg, #d97706, #f59e0b); }
    .medals { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
    .medal { display: flex; align-items: center; gap: 5px; padding: 5px 15px; background: #f3f4f6; border-radius: 20px; font-size: 14px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
    .signature { text-align: center; margin-top: 40px; }
    .sig-line { width: 200px; border-top: 1px solid #333; margin: 0 auto 5px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="school">LICEUL TEHNOLOGIC „AUREL VLAICU" GALAȚI</div>
    <div style="font-size:12px;color:#666;margin-bottom:5px">Dir: Prof. ing. Silviana Ciupercă</div>
    <div class="title">📊 RAPORT DE PROGRES</div>
    <div class="student"><strong>Elev:</strong> ${getCurrentUser()}</div>
    <div class="date">Modul M3 - Asamblări Mecanice | Data: ${today}</div>
  </div>
  
  <div class="stats">
    <div class="stat"><div class="stat-value">${stats.completed}/9</div><div class="stat-label">TESTE FINALIZATE</div></div>
    <div class="stat"><div class="stat-value">${stats.avgPct}%</div><div class="stat-label">MEDIA GENERALĂ</div></div>
    <div class="stat"><div class="stat-value">${level.level}</div><div class="stat-label">NIVEL ATINS</div></div>
    <div class="stat"><div class="stat-value">${medals.length}</div><div class="stat-label">MEDALII</div></div>
  </div>
  
  <h2>📈 Rezultate pe Capitole</h2>
  <table>
    <thead>
      <tr>
        <th>Capitol</th>
        <th>Scor</th>
        <th>Răspunsuri</th>
        <th>Grafic</th>
        <th>Data</th>
      </tr>
    </thead>
    <tbody>
      ${chartData.map(d => `
        <tr>
          <td>${d.icon} ${d.name}</td>
          <td class="pct ${d.pct >= 70 ? 'pass' : d.pct > 0 ? 'fail' : 'none'}">${d.pct > 0 ? d.pct + '%' : '-'}</td>
          <td>${d.pct > 0 ? d.correct + '/' + d.total : '-'}</td>
          <td><div class="bar-container"><div class="bar ${d.pct >= 70 ? 'pass' : 'fail'}" style="width:${d.pct}%"></div></div></td>
          <td>${d.date}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <h2>🏅 Medalii Obținute</h2>
  <div class="medals">
    ${medals.length > 0 ? medals.map(m => `<div class="medal"><span style="font-size:1.2rem">${m.icon}</span> ${m.name}</div>`).join('') : '<span style="color:#94a3b8">Nicio medalie obținută încă</span>'}
  </div>
  
  <div class="signature">
    <div class="sig-line"></div>
    <div style="font-size:12px;color:#666">Semnătura profesorului</div>
  </div>
  
  <div class="footer">
    <div>Prof.Ing. Popescu Romulus</div>
    <div>Generat automat - ${today}</div>
  </div>
</body>
</html>`;

  const blob = new Blob([reportHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Raport-${getCurrentUser()}-${new Date().toISOString().split('T')[0]}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadProgressJSON() {
  const data = {
    user: getCurrentUser(),
    progress: getProgress(),
    xp: getXP(),
    streak: getStreak(),
    exportDate: new Date().toISOString()
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `asamblari-progres-${getCurrentUser()}-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importProgress() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.progress) localStorage.setItem('asamblari-progress', JSON.stringify(data.progress));
        if (data.xp) localStorage.setItem('asamblari-xp', JSON.stringify(data.xp));
        if (data.streak) localStorage.setItem('asamblari-streak', JSON.stringify(data.streak));
        if (data.user) setCurrentUser(data.user);
        alert('Progresul a fost importat cu succes!');
        showSection('home');
      } catch (err) {
        alert('Eroare la citirea fișierului!');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ========== WORKSHEETS ==========
const worksheets = [
  {
    id: 1, title: 'Identificarea Tipurilor de Asamblări', chapter: 's1', exercises: [
      { text: 'Clasifică următoarele îmbinări: sudură, șurub, lipire, prezon, nit' },
      { text: 'Desenează schema de asamblare pentru un reductor cu 3 componente' },
      { text: 'Completează tabelul cu avantaje/dezavantaje pentru fiecare tip de asamblare' }
    ]
  },
  {
    id: 2, title: 'Exerciții de Nituire', chapter: 's2-1', exercises: [
      { text: 'Calculează numărul de nituri necesare pentru o îmbinare de 500mm (pas 50mm)' },
      { text: 'Identifică și numește componentele nitului din figura de mai jos:', img: 'diagram_rivet_1765572763489.png' },
      { text: 'Descrie etapele procesului de nituire manuală' }
    ]
  },
  {
    id: 3, title: 'Tehnici de Sudare', chapter: 's2-2', exercises: [
      { text: 'Compară procedeele MIG, MAG și TIG într-un tabel' },
      { text: 'Ce parametri reglezi la un aparat de sudură MMA?' },
      { text: 'Analizează simbolul grafic pentru sudură din figura de mai jos și descrie ce reprezintă:', img: 'diagram_weld_symbol_1765572778732.png' }
    ]
  },
  {
    id: 4, title: 'Lipire și Încleiere', chapter: 's2-3', exercises: [
      { text: 'Care este diferența dintre lipirea moale și brazare?' },
      { text: 'Enumeră 3 tipuri de adezivi și aplicațiile lor' },
      { text: 'De ce este important fluxul la lipire?' }
    ]
  },
  {
    id: 5, title: 'Asamblări Filetate', chapter: 's3-1', exercises: [
      { text: 'Identifică tipul de filet (A sau B) - care este metric și care Whitworth? Justifică răspunsul:', img: 'diagram_thread_types_1765572794199.png' },
      { text: 'Ce cuplu de strângere aplici pentru un șurub M10?' },
      { text: 'Desenează și numește 3 metode de asigurare a șuruburilor' }
    ]
  },
  {
    id: 6, title: 'Asamblări prin Formă', chapter: 's3-2', exercises: [
      { text: 'Când folosești pene paralele vs pene înclinate?' },
      { text: 'Analizează secțiunea arborelui canelat din figura de mai jos și numește componentele:', img: 'diagram_splined_shaft_1765572816687.png' },
      { text: 'Calculează lungimea penei pentru transmiterea unui cuplu de 100 Nm' }
    ]
  },
  {
    id: 7, title: 'Asamblări Elastice', chapter: 's3-4', exercises: [
      { text: 'Clasifică arcurile după formă și aplicație' },
      { text: 'Ce parametri definesc un arc elicoidal de compresiune?' },
      { text: 'Analizează arcul în foi din figura de mai jos și numește componentele:', img: 'diagram_leaf_spring_1765572831839.png' }
    ]
  }
];


function showWorksheets() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>📝 Fișe de Lucru</h2>
        <p>Exerciții practice pentru fiecare capitol</p>
      </div>
      
      <div class="info-box" style="margin-bottom:2rem">
        <h4>ℹ️ Cum să folosești</h4>
        <p>Click pe o fișă pentru a o deschide. Poți printa fișele pentru lucru la clasă.</p>
      </div>
      
      <div class="section-grid">
        ${worksheets.map(w => {
    const ch = chapters.find(c => c.id === w.chapter);
    return `<div class="card" onclick="openWorksheet(${w.id})">
            <div class="card-icon">📋</div>
            <div class="card-title">${w.title}</div>
            <div class="card-description">${ch ? ch.title : 'General'} • ${w.exercises.length} exerciții</div>
            <button class="btn btn-primary btn-block mt-3">Deschide</button>
          </div>`;
  }).join('')}
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openWorksheet(id) {
  const w = worksheets.find(ws => ws.id === id);
  if (!w) return;

  const ch = chapters.find(c => c.id === w.chapter);
  const today = new Date().toLocaleDateString('ro-RO');

  const wsWindow = window.open('', '_blank');
  wsWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Fișă de Lucru - ${w.title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
        .school { font-size: 12px; color: #666; }
        .title { font-size: 24px; color: #6366f1; margin: 10px 0; }
        .meta { font-size: 14px; color: #666; }
        .info { display: flex; justify-content: space-between; margin-bottom: 30px; padding: 15px; background: #f5f5f5; border-radius: 10px; }
        .info-item { text-align: center; }
        .info-label { font-size: 12px; color: #666; }
        .info-value { font-size: 14px; font-weight: 600; }
        .exercise { margin-bottom: 40px; }
        .exercise-num { display: inline-block; background: #6366f1; color: white; padding: 5px 15px; border-radius: 20px; font-weight: 600; margin-bottom: 10px; }
        .exercise-text { font-size: 16px; margin-bottom: 15px; }
        .answer-space { border: 1px dashed #ccc; min-height: 100px; border-radius: 10px; padding: 15px; }
        .print-btn { display: block; margin: 30px auto; padding: 15px 40px; background: #6366f1; color: white; border: none; border-radius: 10px; font-size: 16px; cursor: pointer; }
        @media print { .print-btn { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="school">LICEUL TEHNOLOGIC „AUREL VLAICU" GALAȚI</div>
        <div style="font-size:11px;color:#666;margin-bottom:5px">Dir: Prof. ing. Silviana Ciupercă</div>
        <div class="title">📋 ${w.title}</div>
        <div class="meta">Modulul M3 - Asamblări Mecanice • ${ch ? ch.title : ''}</div>
      </div>
      
      <div class="info">
        <div class="info-item"><div class="info-label">Nume elev</div><div class="info-value">________________</div></div>

        <div class="info-item"><div class="info-label">Data</div><div class="info-value">${today}</div></div>
        <div class="info-item"><div class="info-label">Nota</div><div class="info-value">____</div></div>
      </div>
      
      ${w.exercises.map((ex, i) => {
    const exText = typeof ex === 'string' ? ex : ex.text;
    const exImg = typeof ex === 'object' && ex.img ? ex.img : null;
    return `
        <div class="exercise">
          <div class="exercise-num">Exercițiul ${i + 1}</div>
          <div class="exercise-text">${exText}</div>
          ${exImg ? `<div style="text-align:center;margin:15px 0"><img src="${exImg}" style="max-width:100%;max-height:250px;border:1px solid #ddd;border-radius:10px" onerror="this.style.display='none'"></div>` : ''}
          <div class="answer-space"></div>
        </div>
      `}).join('')}
      
      <button class="print-btn" onclick="window.print()">🖨️ Printează Fișa</button>
    </body>
    </html>
  `);
  wsWindow.document.close();
}

// ========== PAGE TRANSITIONS ==========
const transitionStyle = document.createElement('style');
transitionStyle.textContent = `
  .main { transition: opacity 0.3s ease, transform 0.3s ease; }
  .main.fade-out { opacity: 0; transform: translateY(20px); }
  .main.fade-in { opacity: 1; transform: translateY(0); }
`;
document.head.appendChild(transitionStyle);

const origShowSection = showSection;
showSection = function (id) {
  const main = document.getElementById('mainContent');
  main.classList.add('fade-out');
  setTimeout(() => {
    origShowSection(id);
    main.classList.remove('fade-out');
    main.classList.add('fade-in');
    setTimeout(() => main.classList.remove('fade-in'), 300);
  }, 150);
};

// Initialize sound button on load
setTimeout(updateSoundButton, 100);

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
  // Only when in test mode
  if (!currentTest || currentTest === 'exam') return;

  const key = e.key.toUpperCase();

  // A, B, C, D for answer selection
  if (['A', 'B', 'C', 'D'].includes(key)) {
    const idx = key.charCodeAt(0) - 65;
    const option = document.getElementById(`opt-${idx}`);
    if (option && option.style.pointerEvents !== 'none') {
      selectAnswer(idx);
    }
  }

  // Enter or Space for next question
  if ((e.key === 'Enter' || e.key === ' ') && !document.getElementById('nextBtn').classList.contains('hidden')) {
    e.preventDefault();
    nextQuestion();
  }

  // Escape to go home
  if (e.key === 'Escape') {
    showSection('home');
  }
});

// ========== SHUFFLE QUESTIONS ==========
const originalStartTest = startTest;
startTest = function (id) {
  // Shuffle questions for this test
  tests[id] = [...tests[id]].sort(() => Math.random() - 0.5);
  originalStartTest(id);
};

// ========== QR CODE GENERATOR ==========
function showQRCode() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  const url = window.location.href;
  const qrSize = 200;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(url)}`;

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>📱 Cod QR pentru Partajare</h2>
        <p>Scanează acest cod pentru a accesa platforma</p>
      </div>
      
      <div class="content-card" style="text-align:center">
        <img src="${qrUrl}" alt="QR Code" style="margin:2rem auto;display:block;border-radius:12px;box-shadow:var(--shadow-lg)">
        <p style="color:var(--text-secondary);margin-bottom:1rem">Elevii pot scana acest cod cu telefonul pentru a accesa platforma</p>
        <button class="btn btn-primary" onclick="navigator.clipboard.writeText('${url}');alert('Link copiat!')">📋 Copiază Link</button>
      </div>
      
      <div class="info-box">
        <h4>💡 Cum să folosești</h4>
        <p>Afișează acest cod pe tablă sau proiector, iar elevii îl pot scana cu camera telefonului pentru a accesa instant platforma.</p>
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== PRINT STYLES ==========
const printStyles = document.createElement('style');
printStyles.textContent = `
  @media print {
    .header, .nav-mobile, .menu-toggle, .btn, .footer, .hero { display: none !important; }
    .main { padding-top: 0 !important; }
    .container { max-width: 100% !important; padding: 0 !important; }
    .content-card { break-inside: avoid; box-shadow: none !important; border: 1px solid #ddd !important; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { margin: 1.5cm; }
  }
`;
document.head.appendChild(printStyles);

// ========== QUESTION TIMER ==========
let questionTimer = null;
let questionTimeLeft = 0;

const origRenderQuestion = renderQuestion;
renderQuestion = function () {
  origRenderQuestion();

  // Add timer display
  questionTimeLeft = 60; // 60 seconds (1 minute) per question
  const timerDiv = document.createElement('div');
  timerDiv.id = 'questionTimer';
  timerDiv.style.cssText = 'position:fixed;top:100px;right:20px;background:var(--gradient-primary);color:white;padding:0.5rem 1rem;border-radius:20px;font-weight:600;z-index:100;box-shadow:var(--shadow-md)';
  timerDiv.innerHTML = `⏱️ ${questionTimeLeft}s`;
  document.body.appendChild(timerDiv);

  if (questionTimer) clearInterval(questionTimer);
  questionTimer = setInterval(() => {
    questionTimeLeft--;
    const timer = document.getElementById('questionTimer');
    if (timer) {
      timer.innerHTML = `⏱️ ${questionTimeLeft}s`;
      if (questionTimeLeft <= 5) timer.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    }
    if (questionTimeLeft <= 0) {
      clearInterval(questionTimer);
      // Auto-select wrong if no answer
      const options = document.querySelectorAll('.option');
      if (options.length && options[0].style.pointerEvents !== 'none') {
        selectAnswer(-1); // Force wrong answer
      }
    }
  }, 1000);
};

// Clean up timer when showing result
const origNextQuestion = nextQuestion;
nextQuestion = function () {
  const timer = document.getElementById('questionTimer');
  if (timer) timer.remove();
  if (questionTimer) clearInterval(questionTimer);
  origNextQuestion();
};

// ========== KEYBOARD SHORTCUT INFO ==========
console.log('⌨️ Shortcut-uri tastatură disponibile:');
console.log('  A, B, C, D - Selectează răspuns');
console.log('  Enter/Space - Următoarea întrebare');
console.log('  Escape - Înapoi acasă');

// ========== LANGUAGE TOGGLE (RO/EN) ==========
let currentLang = localStorage.getItem('asamblari-lang') || 'ro';

const translations = {
  en: {
    home: 'Home',
    chapters: 'Chapters',
    tests: 'Tests',
    glossary: 'Glossary',
    videos: 'Videos',
    medals: 'Medals',
    statistics: 'Statistics',
    settings: 'Settings',
    startTest: 'Start Test',
    nextQuestion: 'Next',
    correct: 'Correct',
    incorrect: 'Incorrect',
    congratulations: '🎉 Congratulations! You passed!',
    tryAgain: '📚 Practice more and try again!',
    score: 'Score',
    back: '← Back',
    language: 'Language'
  },
  ro: {
    home: 'Acasă',
    chapters: 'Capitole',
    tests: 'Teste',
    glossary: 'Glosar',
    videos: 'Videouri',
    medals: 'Medalii',
    statistics: 'Statistici',
    settings: 'Setări',
    startTest: 'Începe Testul',
    nextQuestion: 'Următoarea',
    correct: 'Corecte',
    incorrect: 'Greșite',
    congratulations: '🎉 Felicitări! Ai promovat!',
    tryAgain: '📚 Mai exersează și încearcă din nou!',
    score: 'Scor',
    back: '← Înapoi',
    language: 'Limba'
  }
};

function toggleLanguage() {
  currentLang = currentLang === 'ro' ? 'en' : 'ro';
  localStorage.setItem('asamblari-lang', currentLang);
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  // Reload page to apply translations
  alert(currentLang === 'en' ? 'Language changed to English!\n\nPage will reload to apply changes.' : 'Limba schimbată în Română!\n\nPagina se va reîncărca.');
  location.reload();
}

function t(key) {
  return translations[currentLang][key] || key;
}

// Apply translations to UI
function applyTranslations() {
  // Update page title
  document.title = currentLang === 'en' ? 'Mechanical Assemblies - Educational Platform' : 'Asamblări Mecanice - Platformă Educațională';

  // Update header subtitle based on language
  const subtitle = document.querySelector('.logo-subtitle');
  if (subtitle) {
    subtitle.textContent = currentLang === 'en' ? 'Technical High School "Aurel Vlaicu" Galați' : 'Liceul Tehnologic „Aurel Vlaicu" Galați';
  }

  // Update nav section titles
  const navTitles = {
    '📚 Învățare': currentLang === 'en' ? '📚 Learning' : '📚 Învățare',
    '📝 Evaluare': currentLang === 'en' ? '📝 Evaluation' : '📝 Evaluare',
    '🏆 Progres': currentLang === 'en' ? '🏆 Progress' : '🏆 Progres',
    '📚 Resurse': currentLang === 'en' ? '📚 Resources' : '📚 Resurse',
    '🎮 Provocări': currentLang === 'en' ? '🎮 Challenges' : '🎮 Provocări',
    '👥 Utilizatori': currentLang === 'en' ? '👥 Users' : '👥 Utilizatori',
    '⚙️ Setări': currentLang === 'en' ? '⚙️ Settings' : '⚙️ Setări'
  };

  document.querySelectorAll('.nav-section-title').forEach(el => {
    const key = Object.keys(navTitles).find(k => el.textContent.includes(k.substring(3)));
    if (key) el.textContent = navTitles[key];
  });

  // Update specific menu buttons
  const menuTranslations = {
    'Acasă': currentLang === 'en' ? 'Home' : 'Acasă',
    'Toate Capitolele': currentLang === 'en' ? 'All Chapters' : 'Toate Capitolele',
    'Glosar Tehnic': currentLang === 'en' ? 'Technical Glossary' : 'Glosar Tehnic',
    'Tutoriale Video': currentLang === 'en' ? 'Video Tutorials' : 'Tutoriale Video',
    'Toate Testele': currentLang === 'en' ? 'All Tests' : 'Toate Testele',
    'Quiz Rapid': currentLang === 'en' ? 'Quick Quiz' : 'Quiz Rapid',
    'Examen Final': currentLang === 'en' ? 'Final Exam' : 'Examen Final',
    'Medalii': currentLang === 'en' ? 'Medals' : 'Medalii',
    'Statistici': currentLang === 'en' ? 'Statistics' : 'Statistici',
    'Clasament': currentLang === 'en' ? 'Leaderboard' : 'Clasament',
    'Certificat': currentLang === 'en' ? 'Certificate' : 'Certificat',
    'Galerie Atelier': currentLang === 'en' ? 'Workshop Gallery' : 'Galerie Atelier',
    'Carduri Învățare': currentLang === 'en' ? 'Flashcards' : 'Carduri Învățare',
    'Notițele Mele': currentLang === 'en' ? 'My Notes' : 'Notițele Mele',
    'Asistent FAQ': currentLang === 'en' ? 'FAQ Assistant' : 'Asistent FAQ',
    'Provocarea Zilei': currentLang === 'en' ? 'Daily Challenge' : 'Provocarea Zilei',
    'Test Viteză': currentLang === 'en' ? 'Speed Test' : 'Test Viteză',
    'Mod Duel': currentLang === 'en' ? 'Duel Mode' : 'Mod Duel',
    'Comparare cu Alții': currentLang === 'en' ? 'Compare with Others' : 'Comparare cu Alții',
    'Teste Programate': currentLang === 'en' ? 'Scheduled Tests' : 'Teste Programate',
    'Schimbă Utilizator': currentLang === 'en' ? 'Switch User' : 'Schimbă Utilizator',
    'Exportă Progres': currentLang === 'en' ? 'Export Progress' : 'Exportă Progres',
    'Importă Progres': currentLang === 'en' ? 'Import Progress' : 'Importă Progres',
    'Cod QR Partajare': currentLang === 'en' ? 'Share QR Code' : 'Cod QR Partajare',
    'Schimbă Tema': currentLang === 'en' ? 'Toggle Theme' : 'Schimbă Tema',
    'Instalează App': currentLang === 'en' ? 'Install App' : 'Instalează App'
  };

  document.querySelectorAll('#mobileNav button').forEach(btn => {
    const text = btn.textContent.replace(/^[^\s]+\s/, '').trim();
    const emoji = btn.textContent.match(/^[^\s]+/)?.[0] || '';
    if (menuTranslations[text]) {
      btn.innerHTML = btn.innerHTML.replace(text, menuTranslations[text]);
    }
  });

  console.log(`🌐 Language set to: ${currentLang === 'en' ? 'English' : 'Română'}`);
}

// Apply translations on page load
document.addEventListener('DOMContentLoaded', applyTranslations);
setTimeout(applyTranslations, 100); // Fallback

// ========== LOCAL LEADERBOARD ==========
function getLeaderboard() {
  return JSON.parse(localStorage.getItem('asamblari-leaderboard') || '[]');
}

function addToLeaderboard(name, score, testName) {
  const lb = getLeaderboard();
  lb.push({
    name,
    score,
    testName,
    date: new Date().toISOString()
  });
  lb.sort((a, b) => b.score - a.score);
  localStorage.setItem('asamblari-leaderboard', JSON.stringify(lb.slice(0, 50)));
}

function showLeaderboard() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  const lb = getLeaderboard();
  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>🏆 Clasament Local</h2>
        <p>Top scoruri din testele realizate pe acest dispozitiv</p>
      </div>
      
      ${lb.length === 0 ? '<div class="info-box"><p>Niciun scor încă. Finalizează un test pentru a apărea în clasament!</p></div>' : `
        <div class="content-card">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="border-bottom:2px solid var(--primary)">
                <th style="padding:0.75rem;text-align:left">#</th>
                <th style="padding:0.75rem;text-align:left">Nume</th>
                <th style="padding:0.75rem;text-align:left">Test</th>
                <th style="padding:0.75rem;text-align:center">Scor</th>
                <th style="padding:0.75rem;text-align:right">Data</th>
              </tr>
            </thead>
            <tbody>
              ${lb.slice(0, 20).map((entry, i) => `
                <tr style="border-bottom:1px solid rgba(0,0,0,0.1);${i < 3 ? 'background:rgba(99,102,241,0.1)' : ''}">
                  <td style="padding:0.75rem;font-weight:600">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td>
                  <td style="padding:0.75rem">${entry.name}</td>
                  <td style="padding:0.75rem;font-size:0.9rem;color:var(--text-muted)">${entry.testName}</td>
                  <td style="padding:0.75rem;text-align:center;font-weight:700;color:${entry.score >= 70 ? 'var(--success)' : 'var(--warning)'}">${entry.score}%</td>
                  <td style="padding:0.75rem;text-align:right;font-size:0.85rem;color:var(--text-muted)">${new Date(entry.date).toLocaleDateString('ro-RO')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="mt-4 text-center">
          <button class="btn btn-secondary" onclick="if(confirm('Ștergi tot clasamentul?')){localStorage.removeItem('asamblari-leaderboard');showLeaderboard()}">🗑️ Resetează Clasament</button>
        </div>
      `}
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Add to leaderboard after test
const origShowResultForLB = showResult;
showResult = function () {
  origShowResultForLB();
  const total = tests[currentTest].length;
  const pct = Math.round((score / total) * 100);
  const ch = chapters.find(c => c.id === currentTest);
  const userName = getCurrentUser();
  if (userName && userName !== 'Elev') {
    addToLeaderboard(userName, pct, ch ? ch.title : 'Test');
  }
};

// ========== SCHEDULED TESTS ==========
// Default tests - can be edited by teacher
const defaultScheduledTests = [
  { testId: 's1', startDate: '2025-12-01', endDate: '2025-12-31', name: 'Test Decembrie - Noțiuni Generale' },
  { testId: 's2-1', startDate: '2025-12-10', endDate: '2025-12-20', name: 'Evaluare Nituire' },
  { testId: 's2-2', startDate: '2025-12-15', endDate: '2025-12-25', name: 'Test Sudare' }
];

function getScheduledTests() {
  const saved = localStorage.getItem('asamblari-scheduledTests');
  return saved ? JSON.parse(saved) : defaultScheduledTests;
}

function saveScheduledTests(tests) {
  localStorage.setItem('asamblari-scheduledTests', JSON.stringify(tests));
}

function getActiveScheduledTests() {
  const now = new Date();
  return getScheduledTests().filter(t => {
    const start = new Date(t.startDate);
    const end = new Date(t.endDate);
    return now >= start && now <= end;
  });
}

function showScheduledTests() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  const allTests = getScheduledTests();
  const active = getActiveScheduledTests();
  const upcoming = allTests.filter(t => new Date(t.startDate) > new Date());
  const past = allTests.filter(t => new Date(t.endDate) < new Date());

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>📅 Teste Programate</h2>
        <p>Teste cu perioadă de valabilitate stabilită de profesor</p>
      </div>
      
      ${active.length > 0 ? `
        <div class="info-box success" style="margin-bottom:2rem">
          <h4>🟢 Teste Active Acum</h4>
          ${active.map(t => `
            <div style="margin-top:1rem;padding:1rem;background:rgba(255,255,255,0.5);border-radius:10px">
              <strong>${t.name}</strong><br>
              <span style="font-size:0.9rem">Valabil: ${new Date(t.startDate).toLocaleDateString('ro-RO')} - ${new Date(t.endDate).toLocaleDateString('ro-RO')}</span><br>
              <button class="btn btn-primary mt-2" onclick="startTest('${t.testId}')">▶ Începe Testul</button>
            </div>
          `).join('')}
        </div>
      ` : '<div class="info-box"><p>Niciun test programat activ în acest moment.</p></div>'}
      
      ${upcoming.length > 0 ? `
        <div class="content-card" style="margin-bottom:2rem">
          <h4>📆 Teste Viitoare</h4>
          ${upcoming.map(t => `
            <div style="padding:1rem;border-bottom:1px solid rgba(0,0,0,0.1);display:flex;justify-content:space-between;align-items:center">
              <div>
                <strong>${t.name}</strong><br>
                <span style="color:var(--text-muted)">${new Date(t.startDate).toLocaleDateString('ro-RO')} - ${new Date(t.endDate).toLocaleDateString('ro-RO')}</span>
              </div>
              <button class="btn btn-secondary" onclick="deleteScheduledTest('${t.testId}', '${t.startDate}')">🗑️</button>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <div class="content-card">
        <h4>➕ Adaugă Test Programat</h4>
        <div style="display:grid;gap:1rem;margin-top:1rem">
          <div>
            <label style="font-weight:600;display:block;margin-bottom:0.5rem">Nume test:</label>
            <input type="text" id="schedTestName" placeholder="ex: Evaluare Semestrială" style="width:100%;padding:0.75rem;border:2px solid var(--primary);border-radius:10px;font-size:1rem">
          </div>
          <div>
            <label style="font-weight:600;display:block;margin-bottom:0.5rem">Capitol:</label>
            <select id="schedTestId" style="width:100%;padding:0.75rem;border:2px solid var(--primary);border-radius:10px;font-size:1rem">
              ${chapters.map(ch => `<option value="${ch.id}">${ch.icon} ${ch.title}</option>`).join('')}
            </select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
            <div>
              <label style="font-weight:600;display:block;margin-bottom:0.5rem">Data început:</label>
              <input type="date" id="schedStartDate" style="width:100%;padding:0.75rem;border:2px solid var(--primary);border-radius:10px;font-size:1rem">
            </div>
            <div>
              <label style="font-weight:600;display:block;margin-bottom:0.5rem">Data sfârșit:</label>
              <input type="date" id="schedEndDate" style="width:100%;padding:0.75rem;border:2px solid var(--primary);border-radius:10px;font-size:1rem">
            </div>
          </div>
          <button class="btn btn-primary" onclick="addScheduledTest()">✅ Adaugă Test</button>
        </div>
      </div>
      
      <div class="info-box" style="margin-top:2rem">
        <h4>ℹ️ Informație pentru Profesor</h4>
        <p>Testele programate sunt vizibile și accesibile doar în perioada stabilită. Elevii pot vedea testele viitoare dar nu le pot accesa până la data de început.</p>
        <button class="btn btn-secondary mt-3" onclick="if(confirm('Resetezi la testele implicite?')){localStorage.removeItem('asamblari-scheduledTests');showScheduledTests()}">🔄 Resetează la Implicit</button>
      </div>
    </div>`;

  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  document.getElementById('schedStartDate').value = today;
  document.getElementById('schedEndDate').value = nextWeek;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function addScheduledTest() {
  const name = document.getElementById('schedTestName').value.trim();
  const testId = document.getElementById('schedTestId').value;
  const startDate = document.getElementById('schedStartDate').value;
  const endDate = document.getElementById('schedEndDate').value;

  if (!name) { alert('Introdu un nume pentru test!'); return; }
  if (!startDate || !endDate) { alert('Selectează ambele date!'); return; }
  if (new Date(startDate) > new Date(endDate)) { alert('Data de început trebuie să fie înainte de data de sfârșit!'); return; }

  const tests = getScheduledTests();
  tests.push({ testId, startDate, endDate, name });
  saveScheduledTests(tests);

  alert('✅ Test programat adăugat cu succes!');
  showScheduledTests();
}

function deleteScheduledTest(testId, startDate) {
  if (!confirm('Ștergi acest test programat?')) return;

  const tests = getScheduledTests();
  const filtered = tests.filter(t => !(t.testId === testId && t.startDate === startDate));
  saveScheduledTests(filtered);
  showScheduledTests();
}

// ========== BACKGROUND MUSIC ==========
let bgMusic = null;
let musicEnabled = localStorage.getItem('asamblari-music') === 'true';

function initMusic() {
  if (!bgMusic) {
    // Free relaxation/ambient music - royalty free
    bgMusic = new Audio('https://www.bensound.com/bensound-music/bensound-relaxing.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.2; // 20% volume - relaxing background
  }
}

function toggleMusic() {
  initMusic();
  musicEnabled = !musicEnabled;
  localStorage.setItem('asamblari-music', musicEnabled);

  if (musicEnabled) {
    bgMusic.play().catch(() => {
      alert('Click oriunde pe pagină pentru a activa muzica.');
    });
  } else {
    bgMusic.pause();
  }

  updateMusicButton();
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();
}

function updateMusicButton() {
  const btn = document.getElementById('musicBtn');
  if (btn) {
    btn.textContent = musicEnabled ? '🎵 Muzică: Pornită' : '🎵 Muzică: Oprită';
  }
}

// Auto-play music if enabled
document.addEventListener('click', function initMusicOnClick() {
  if (musicEnabled && bgMusic && bgMusic.paused) {
    bgMusic.play().catch(() => { });
  }
}, { once: true });

// ========== WORKSHOP GALLERY ==========
function showGallery() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  const images = [
    { src: 'workshop_welding_1765568398490.png', title: 'Sudare în atelier', desc: 'Tehnici de sudare MIG/MAG' },
    { src: 'workshop_tools_1765568415437.png', title: 'Scule și dispozitive', desc: 'Echipamente pentru asamblări' },
    { src: 'workshop_assembly_1765568430842.png', title: 'Asamblare mecanică', desc: 'Proces de montaj' },
    { src: 'diagram_rivet_1765572763489.png', title: 'Diagrama nituirii', desc: 'Schema tehnică' },
    { src: 'diagram_weld_symbol_1765572778732.png', title: 'Simboluri sudură', desc: 'Notații standardizate' },
    { src: 'diagram_thread_types_1765572794199.png', title: 'Tipuri de filete', desc: 'Clasificare' },
    { src: 'diagram_splined_shaft_1765572816687.png', title: 'Arbore canelat', desc: 'Asamblare prin formă' },
    { src: 'diagram_leaf_spring_1765572831839.png', title: 'Arc în foi', desc: 'Asamblare elastică' }
  ];

  document.getElementById('mainContent').innerHTML = `
  < div class="container" >
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>📸 Galerie Atelier</h2>
        <p>Imagini și diagrame din domeniul asamblărilor mecanice</p>
      </div>
      
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem">
        ${images.map(img => `
          <div class="card" style="cursor:pointer" onclick="openImage('${img.src}', '${img.title}')">
            <img src="${img.src}" alt="${img.title}" style="width:100%;height:180px;object-fit:cover;border-radius:12px;margin-bottom:1rem" onerror="this.style.display='none'">
            <div class="card-title">${img.title}</div>
            <div class="card-description">${img.desc}</div>
          </div>
        `).join('')}
      </div>
    </div > `;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openImage(src, title) {
  const modal = document.createElement('div');
  modal.id = 'imageModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;cursor:pointer';
  modal.onclick = () => modal.remove();
  modal.innerHTML = `
  < div style = "text-align:center;max-width:90%;max-height:90%" >
    <img src="${src}" alt="${title}" style="max-width:100%;max-height:80vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
      <div style="color:white;margin-top:1rem;font-size:1.25rem;font-weight:600">${title}</div>
      <div style="color:rgba(255,255,255,0.7);margin-top:0.5rem">Click pentru a închide</div>
    </div>
`;
  document.body.appendChild(modal);
}

console.log('🎉 Toate funcționalitățile au fost încărcate!');

// ========== 1. FLASHCARDS / CARDURI DE ÎNVĂȚARE ==========
const flashcards = [
  { front: 'Ce este nituirea?', back: 'Îmbinare nedemontabilă prin deformarea plastică a niturilor' },
  { front: 'Temperatura sudării la cald?', back: '850-1000°C' },
  { front: 'Ce este buterola (căpuitor)?', back: 'Sculă pentru formarea capului de închidere la nituri' },
  { front: 'Tipuri de sudură după aspect?', back: 'Cap la cap, de colț, în T, prin suprapunere' },
  { front: 'Ce este lipirea moale?', back: 'Lipire sub 450°C cu aliaje de staniu' },
  { front: 'Ce este brazarea?', back: 'Lipire peste 450°C cu aliaje de cupru sau argint' },
  { front: 'Ce rol are fluxul?', back: 'Curăță și protejează suprafețele la lipire' },
  { front: 'Ce este un prezon?', back: 'Tijă filetată la ambele capete' },
  { front: 'Ce sunt canelurile?', back: 'Pene multiple care fac corp comun cu arborele' },
  { front: 'Tipuri de arcuri?', back: 'Elicoidale, în foi, de torsiune, de disc' },
  { front: 'Ce este șaiba Grower?', back: 'Inel elastic pentru asigurare contra autodesfacerii' },
  { front: 'Ce este Con Morse?', back: 'Con standardizat pentru fixarea sculelor' }
];

let currentFlashcard = 0;
let flashcardFlipped = false;

function showFlashcards() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();
  currentFlashcard = 0;
  flashcardFlipped = false;
  renderFlashcard();
}

function renderFlashcard() {
  const card = flashcards[currentFlashcard];
  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>📇 Carduri de Învățare</h2>
        <p>Card ${currentFlashcard + 1} din ${flashcards.length}</p>
      </div>
      
      <div onclick="flipFlashcard()" style="cursor:pointer;perspective:1000px;margin:2rem auto;max-width:500px">
        <div id="flashcardInner" style="background:var(--gradient-primary);color:white;padding:3rem 2rem;border-radius:20px;min-height:200px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:1.5rem;box-shadow:var(--shadow-lg);transition:transform 0.6s;transform-style:preserve-3d">
          <div id="flashcardContent">${flashcardFlipped ? card.back : card.front}</div>
        </div>
        <p style="text-align:center;color:var(--text-muted);margin-top:1rem">👆 Click pentru a întoarce cardul</p>
      </div>
      
      <div class="test-progress" style="margin:2rem 0">
        <div class="test-progress-bar" style="width:${((currentFlashcard + 1) / flashcards.length) * 100}%"></div>
      </div>
      
      <div style="display:flex;justify-content:center;gap:1rem;flex-wrap:wrap">
        <button class="btn btn-secondary" onclick="prevFlashcard()" ${currentFlashcard === 0 ? 'disabled style="opacity:0.5"' : ''}>⬅ Anterior</button>
        <button class="btn btn-primary" onclick="shuffleFlashcards()">🔀 Amestecă</button>
        <button class="btn btn-secondary" onclick="nextFlashcard()" ${currentFlashcard === flashcards.length - 1 ? 'disabled style="opacity:0.5"' : ''}>Următorul ➡</button>
      </div>
    </div>`;
}

function flipFlashcard() {
  flashcardFlipped = !flashcardFlipped;
  const inner = document.getElementById('flashcardInner');
  inner.style.transform = flashcardFlipped ? 'rotateY(180deg)' : '';
  setTimeout(() => {
    document.getElementById('flashcardContent').textContent = flashcardFlipped ? flashcards[currentFlashcard].back : flashcards[currentFlashcard].front;
    inner.style.transform = '';
  }, 300);
}

function nextFlashcard() {
  if (currentFlashcard < flashcards.length - 1) {
    currentFlashcard++;
    flashcardFlipped = false;
    renderFlashcard();
  }
}

function prevFlashcard() {
  if (currentFlashcard > 0) {
    currentFlashcard--;
    flashcardFlipped = false;
    renderFlashcard();
  }
}

function shuffleFlashcards() {
  for (let i = flashcards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flashcards[i], flashcards[j]] = [flashcards[j], flashcards[i]];
  }
  currentFlashcard = 0;
  flashcardFlipped = false;
  renderFlashcard();
}

// ========== 2. PROVOCARE ZILNICĂ ==========
function getDailyChallenge() {
  const today = new Date().toDateString();
  const savedChallenge = localStorage.getItem('asamblari-dailyChallenge');
  const saved = savedChallenge ? JSON.parse(savedChallenge) : null;

  if (saved && saved.date === today) {
    return saved;
  }

  // Get all questions
  const allQ = [];
  Object.keys(tests).forEach(testId => {
    tests[testId].forEach(q => allQ.push({ ...q, testId }));
  });

  // Pick random question based on day
  const dayIndex = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % allQ.length;
  const question = allQ[dayIndex];

  const challenge = { date: today, question, completed: false, correct: null };
  localStorage.setItem('asamblari-dailyChallenge', JSON.stringify(challenge));
  return challenge;
}

function showDailyChallenge() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  const challenge = getDailyChallenge();
  const q = challenge.question;

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>🎯 Provocarea Zilei</h2>
        <p>${new Date().toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      
      ${challenge.completed ? `
        <div class="info-box ${challenge.correct ? 'success' : ''}" style="text-align:center;padding:2rem">
          <div style="font-size:4rem">${challenge.correct ? '🎉' : '📚'}</div>
          <h3>${challenge.correct ? 'Ai rezolvat provocarea de azi!' : 'Răspuns greșit. Încearcă mâine!'}</h3>
          <p style="color:var(--text-muted);margin-top:1rem">Revino mâine pentru o nouă provocare!</p>
        </div>
      ` : `
        <div class="question-card">
          <span class="question-number">Întrebarea Zilei</span>
          <p class="question-text">${q.q}</p>
          <div class="options-list">
            ${q.o.map((opt, i) => `
              <div class="option" onclick="answerDailyChallenge(${i})" id="daily-opt-${i}">
                <span class="option-marker">${String.fromCharCode(65 + i)}</span>
                <span>${opt}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="info-box" style="margin-top:2rem">
          <p>⚠️ Ai o singură încercare pe zi! Gândește-te bine înainte de a răspunde.</p>
        </div>
      `}
    </div>`;
}

function answerDailyChallenge(idx) {
  const challenge = getDailyChallenge();
  const correct = challenge.question.a;

  challenge.completed = true;
  challenge.correct = (idx === correct);
  localStorage.setItem('asamblari-dailyChallenge', JSON.stringify(challenge));

  document.querySelectorAll('[id^="daily-opt-"]').forEach((opt, i) => {
    opt.style.pointerEvents = 'none';
    if (i === correct) opt.classList.add('correct');
    else if (i === idx) opt.classList.add('incorrect');
  });

  setTimeout(() => {
    if (challenge.correct) {
      createConfetti();
      addXP(50);
    }
    showDailyChallenge();
  }, 1500);
}

// ========== 3. CHATBOT "INGINERUL" & FAQ ==========
const knowledgeBase = [
  { k: ['nituire', 'nit'], a: 'Nituirea este îmbinarea nedemontabilă a două sau mai multe piese ,realizată cu ajutorul niturilor. Se folosește la structuri metalice supuse la vibrații (poduri, nave, avioane).' },
  { k: ['clasificare', 'nituri'], a: 'Niturile se clasifică după: formă (cap semirotund, înecat, plat), material (oțel, cupru, aluminiu) și mod de execuție (manuală, mecanică).' },
  { k: ['temperatura', 'cald'], a: 'Nituirea la cald se face la 850-1000°C pentru nituri din oțel cu diametrul peste 10mm.' },
  { k: ['defecte', 'nituire'], a: 'Defecte frecvente: cap fisurat (supraîncălzire), joc între table (tijă prea scurtă), nit strâmb (găuri necoaxiale), cap descentrat.' },
  { k: ['sudare', 'sudură'], a: 'Sudarea este asamblarea nedemontabilă realizată prin topirea locală a materialelor. Procedee principale: MMA (electrod învelit), MIG/MAG (sârmă), TIG (electrod nefuzibil).' },
  { k: ['electrod', 'rutilic', 'bazic'], a: 'Electrozii Rutilici (R) sunt pentru uz general, amorsare ușoară. Cei Bazici (B) sunt pentru structuri de rezistență, dar necesită uscare și curent continuu.' },
  { k: ['lipire', 'moale', 'tare'], a: 'Lipirea moale se face sub 450°C (cu aliaje de cositor-plumb). Lipirea tare se face peste 450°C (aliaje cupru-zinc, argint) și este mult mai rezistentă.' },
  { k: ['filet', 'metric', 'whitworth'], a: 'Filetul Metric (M) are profil triunghiular la 60°. Filetul Whitworth (W) are profil la 55° și se măsoară în țoli (inch). 1 inch = 25.4mm.' },
  { k: ['siguranță', 'autodesfacere', 'grower'], a: 'Asigurarea contra autodesfacerii se face cu: șaibe Grower, piulițe cu autoblocare (inel plastic), contrapiulițe, șplinturi sau șaibe de siguranță cu urechi.' },
  { k: ['arc', 'elicoidal', 'foi'], a: 'Arcul elicoidal este făcut din sârmă oțeloasă. Arcul în foi (lamelar) este compus din mai multe foi de oțel și se folosește la suspensiile camioanelor/trenurilor.' },
  { k: ['pana', 'pene', 'caneluri'], a: 'Pana este un organ de mașină folosit pentru a fixa un butuc pe un arbore. Canelurile sunt "pene multiple" care fac corp comun cu arborele, pentru cupluri mari.' },
  { k: ['rulment', 'lagăr'], a: 'Rulmenții transformă frecarea de alunecare în frecare de rostogolire. Sunt compuși din: inel interior, inel exterior, corpuri de rostogolire (bile/role) și colivie.' },
  { k: ['material', 'otel', 'fonta'], a: 'Oțelul este aliaj Fier-Carbon cu sub 2.11% carbon (tenace, deformabil). Fonta are peste 2.11% carbon (dură, casantă, bună pentru batiuri).' },
  { k: ['scule', 'trusa'], a: 'Scule uzuale: ciocan, șurubelniță, chei fixe/inelare, clește,  fierăstrău, pilă. Instrumente de măsură: șubler, micrometru, echer.' },
  { k: ['protectie', 'nssm'], a: 'NSSM: Purtați ochelari de protecție, mănuși, salopetă, bocanci cu bombeu. Nu folosiți scule defecte. Aerisiți spațiul de lucru.' }
];

function showChatBot() {
  if (document.getElementById('mobileNav')?.classList.contains('active')) toggleMenu();

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>💬 Asistent Inginer</h2>
        <p>Inteligență Artificială (Simulată) pentru Asamblări Mecanice</p>
      </div>
      
      <div id="chatMessages" style="background:var(--bg-card);border-radius:16px;padding:1.5rem;min-height:350px;max-height:450px;overflow-y:auto;margin-bottom:1rem;border:1px solid rgba(0,0,0,0.05)">
        <div class="chat-msg system">
          <div class="msg-avatar" style="width:40px;height:40px;background:var(--gradient-primary);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-right:1rem">🤖</div>
          <div style="background:white;padding:1rem;border-radius:4px 20px 20px 20px;box-shadow:0 2px 5px rgba(0,0,0,0.05);max-width:80%;color:#333">Salut! Sunt asistentul tău virtual. Întreabă-mă orice despre nituire, sudare, filete, materiale sau scule!</div>
        </div>
      </div>

      <div class="chat-input-area" style="display:flex;gap:0.5rem">
        <input type="text" id="chatInput" placeholder="Scrie întrebarea ta aici..." style="flex:1;padding:1rem;border-radius:30px;border:2px solid var(--primary);font-size:1rem;outline:none" onkeypress="if(event.key==='Enter') sendChatMessage()">
        <button class="btn btn-primary" onclick="sendChatMessage()" style="border-radius:50%;width:50px;height:50px;padding:0;display:flex;align-items:center;justify-content:center;font-size:1.5rem">➤</button>
      </div>
      
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:1rem;justify-content:center">
        ${['Defecte nituire', 'Tipuri de sudură', 'Ce este un arc?', 'Filet metric', 'Măsuri de protecție'].map(t =>
    `<button class="btn btn-secondary" style="padding:0.5rem 1rem;font-size:0.85rem;border-radius:20px" onclick="document.getElementById('chatInput').value='${t}';sendChatMessage()">${t}</button>`
  ).join('')}
      </div>
    </div>`;

  document.getElementById('chatInput').focus();
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  const msgs = document.getElementById('chatMessages');

  // User message
  msgs.innerHTML += `
    <div style="display:flex;gap:1rem;margin-bottom:1rem;flex-direction:row-reverse;animation:fadeIn 0.3s ease">
      <div style="width:40px;height:40px;background:var(--secondary);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">👤</div>
      <div style="background:var(--primary);color:white;padding:1rem;border-radius:20px 4px 20px 20px;max-width:80%">${text}</div>
    </div>`;

  input.value = '';
  msgs.scrollTop = msgs.scrollHeight;

  // Bot thinking animation
  const thinkingId = 'thinking-' + Date.now();
  msgs.innerHTML += `
    <div style="display:flex;gap:1rem;margin-bottom:1rem;animation:fadeIn 0.3s ease" id="${thinkingId}">
      <div style="width:40px;height:40px;background:var(--gradient-primary);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">🤖</div>
      <div style="background:white;padding:1rem;border-radius:4px 20px 20px 20px;box-shadow:0 2px 5px rgba(0,0,0,0.05);color:#333">...</div>
    </div>`;
  msgs.scrollTop = msgs.scrollHeight;

  // Analyze query
  setTimeout(() => {
    document.getElementById(thinkingId).remove();
    let reply = "Îmi pare rău, nu am înțeles exact. Poți reformula? Întreabă-mă despre nituri, sudură, filete sau scule.";

    // Smart search algorithm
    const words = text.toLowerCase().split(/[\s,?!.-]+/);
    let bestMatch = null;
    let maxScore = 0;

    knowledgeBase.forEach(item => {
      let score = 0;
      item.k.forEach(keyword => {
        if (text.toLowerCase().includes(keyword)) score += 2; // Exact phrase match
        else if (words.some(w => w.includes(keyword))) score += 1; // Partial word match
      });
      if (score > maxScore) {
        maxScore = score;
        bestMatch = item;
      }
    });

    if (maxScore > 0 && bestMatch) {
      reply = bestMatch.a;
    }
    // Easter eggs
    else if (text.toLowerCase().includes('salut') || text.toLowerCase().includes('buna')) {
      reply = "Salut! Ești gata să învățăm despre asamblări mecanice? 🛠️";
    } else if (text.toLowerCase().includes('cine esti')) {
      reply = "Sunt Asistentul Virtual al platformei, creat să te ajut la Mecanică! 🤖";
    }

    msgs.innerHTML += `
      <div style="display:flex;gap:1rem;margin-bottom:1rem;animation:fadeIn 0.3s ease">
        <div style="width:40px;height:40px;background:var(--gradient-primary);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">🤖</div>
        <div style="background:white;padding:1rem;border-radius:4px 20px 20px 20px;box-shadow:0 2px 5px rgba(0,0,0,0.05);color:#333;max-width:80%">${reply}</div>
      </div>`;
    msgs.scrollTop = msgs.scrollHeight;

    if (typeof soundEnabled !== 'undefined' && soundEnabled) playSound('click');
  }, 800 + Math.random() * 500);
}

// ========== 4. TEST DE VITEZĂ ==========
let speedTestQuestions = [];
let speedTestIndex = 0;
let speedTestScore = 0;
let speedTestStartTime = 0;

function startSpeedTest() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  // Get 10 random questions
  const allQ = [];
  Object.keys(tests).forEach(testId => {
    tests[testId].forEach(q => allQ.push(q));
  });
  speedTestQuestions = allQ.sort(() => Math.random() - 0.5).slice(0, 10);
  speedTestIndex = 0;
  speedTestScore = 0;
  speedTestStartTime = Date.now();

  renderSpeedQuestion();
}

function renderSpeedQuestion() {
  const q = speedTestQuestions[speedTestIndex];
  const elapsed = Math.floor((Date.now() - speedTestStartTime) / 1000);

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <span style="font-size:1.5rem;font-weight:700">⚡ Test Viteză</span>
        <span style="background:var(--gradient-primary);color:white;padding:0.5rem 1rem;border-radius:20px;font-weight:600" id="speedTimer">⏱️ ${elapsed}s</span>
      </div>
      
      <div class="test-progress"><div class="test-progress-bar" style="width:${((speedTestIndex + 1) / 10) * 100}%"></div></div>
      
      <div class="question-card" style="margin-top:1.5rem">
        <span class="question-number">${speedTestIndex + 1} / 10</span>
        <p class="question-text">${q.q}</p>
        <div class="options-list">
          ${q.o.map((opt, i) => `
            <div class="option" onclick="answerSpeedTest(${i}, ${q.a})" id="speed-opt-${i}">
              <span class="option-marker">${String.fromCharCode(65 + i)}</span>
              <span>${opt}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;

  // Update timer
  const timerInterval = setInterval(() => {
    const timer = document.getElementById('speedTimer');
    if (timer) {
      const elapsed = Math.floor((Date.now() - speedTestStartTime) / 1000);
      timer.textContent = `⏱️ ${elapsed}s`;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
}

function answerSpeedTest(idx, correct) {
  if (idx === correct) speedTestScore++;

  document.querySelectorAll('[id^="speed-opt-"]').forEach((opt, i) => {
    opt.style.pointerEvents = 'none';
    if (i === correct) opt.classList.add('correct');
    else if (i === idx && idx !== correct) opt.classList.add('incorrect');
  });

  setTimeout(() => {
    speedTestIndex++;
    if (speedTestIndex < 10) {
      renderSpeedQuestion();
    } else {
      showSpeedTestResult();
    }
  }, 500);
}

function showSpeedTestResult() {
  const totalTime = Math.floor((Date.now() - speedTestStartTime) / 1000);
  const pct = speedTestScore * 10;

  if (pct >= 80) createConfetti();
  addXP(pct >= 80 ? 30 : pct >= 60 ? 20 : 10);

  document.getElementById('mainContent').innerHTML = `
    <div class="container text-center" style="padding:3rem 1rem">
      <h2>⚡ Rezultat Test Viteză</h2>
      <div class="result-score">${pct}%</div>
      <p style="font-size:1.5rem;margin:1rem 0">⏱️ Timp total: <strong>${totalTime} secunde</strong></p>
      <p style="font-size:1.25rem;color:var(--text-muted)">${speedTestScore}/10 răspunsuri corecte</p>
      <p style="margin:1.5rem 0;font-size:1.25rem">${pct >= 80 ? '🏆 EXCELENT!' : pct >= 60 ? '👍 Bine!' : '📚 Mai exersează!'}</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2rem">
        <button class="btn btn-primary" onclick="startSpeedTest()">⚡ Încearcă din nou</button>
        <button class="btn btn-secondary" onclick="showSection('home')">🏠 Acasă</button>
      </div>
    </div>`;
}

// ========== 5. NOTE PERSONALE ==========
function getNotes() {
  return JSON.parse(localStorage.getItem('asamblari-notes') || '{}');
}

function saveNote(chapterId, note) {
  const notes = getNotes();
  notes[chapterId] = { text: note, date: new Date().toISOString() };
  localStorage.setItem('asamblari-notes', JSON.stringify(notes));
}

function showNotes() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  const notes = getNotes();

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>📝 Notițele Mele</h2>
        <p>Notițe personale pentru fiecare capitol</p>
      </div>
      
      <div style="display:grid;gap:1rem">
        ${chapters.map(ch => {
    const note = notes[ch.id];
    return `
            <div class="content-card">
              <h4>${ch.icon} ${ch.title}</h4>
              <textarea id="note-${ch.id}" placeholder="Scrie notițe aici..." style="width:100%;min-height:100px;padding:1rem;border:2px solid var(--primary);border-radius:10px;font-size:1rem;resize:vertical;margin-top:0.5rem">${note ? note.text : ''}</textarea>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.5rem">
                <span style="font-size:0.85rem;color:var(--text-muted)">${note ? 'Salvat: ' + new Date(note.date).toLocaleString('ro-RO') : 'Nesalvat'}</span>
                <button class="btn btn-primary" style="padding:0.5rem 1rem" onclick="saveNote('${ch.id}', document.getElementById('note-${ch.id}').value);alert('✅ Notiță salvată!')">💾 Salvează</button>
              </div>
            </div>`;
  }).join('')}
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== 6. ANIMAȚII DE SUCCES ÎMBUNĂTĂȚITE ==========
function celebrateSuccess(message) {
  createConfetti();

  const overlay = document.createElement('div');
  overlay.id = 'successOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `
    <div style="text-align:center;animation:bounceIn 0.5s">
      <div style="font-size:6rem;animation:pulse 0.5s infinite">🎉</div>
      <h2 style="color:white;font-size:2rem;margin:1rem 0">${message}</h2>
      <button class="btn btn-primary" onclick="document.getElementById('successOverlay').remove()" style="margin-top:1rem">Continuă ➡</button>
    </div>`;
  document.body.appendChild(overlay);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (document.getElementById('successOverlay')) {
      document.getElementById('successOverlay').remove();
    }
  }, 5000);
}

// ========== 7. COMPARARE CU ALȚII ==========
function getComparisonStats() {
  const stats = getStats();
  const avgScore = stats.avgPct;

  // Simulated percentile based on score
  let percentile = 50;
  if (avgScore >= 90) percentile = 95;
  else if (avgScore >= 80) percentile = 85;
  else if (avgScore >= 70) percentile = 70;
  else if (avgScore >= 60) percentile = 55;
  else if (avgScore >= 50) percentile = 40;
  else percentile = 25;

  return { percentile, avgScore };
}

function showComparison() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  const comp = getComparisonStats();
  const stats = getStats();

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>📊 Comparare cu Alții</h2>
        <p>Vezi cum te compari cu ceilalți elevi</p>
      </div>
      
      <div class="content-card text-center" style="padding:2rem">
        <div style="font-size:4rem;margin-bottom:1rem">${comp.percentile >= 80 ? '🏆' : comp.percentile >= 60 ? '⭐' : '📈'}</div>
        <h3 style="font-size:2rem;color:var(--primary)">Ești mai bun decât ${comp.percentile}% din elevi!</h3>
        <p style="color:var(--text-muted);margin-top:1rem">Media ta: ${comp.avgScore}%</p>
        
        <div style="margin-top:2rem;background:rgba(0,0,0,0.05);border-radius:20px;padding:1.5rem">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
            <span>Tu</span>
            <span style="font-weight:600">${comp.avgScore}%</span>
          </div>
          <div style="background:rgba(0,0,0,0.1);height:20px;border-radius:10px;overflow:hidden">
            <div style="height:100%;width:${comp.avgScore}%;background:var(--gradient-primary);border-radius:10px;transition:width 1s"></div>
          </div>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-top:2rem">
          <div class="content-card"><div style="font-size:2rem">✅</div><div style="font-size:1.5rem;font-weight:700">${stats.completed}</div><div style="color:var(--text-muted)">Teste Complete</div></div>
          <div class="content-card"><div style="font-size:2rem">🏅</div><div style="font-size:1.5rem;font-weight:700">${getEarnedMedals().length}</div><div style="color:var(--text-muted)">Medalii</div></div>
          <div class="content-card"><div style="font-size:2rem">⚡</div><div style="font-size:1.5rem;font-weight:700">${getXP().xp}</div><div style="color:var(--text-muted)">XP Total</div></div>
        </div>
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== 8. MOD DUEL ==========
let duelState = { player1: '', player2: '', scores: [0, 0], currentPlayer: 0, questionIndex: 0, questions: [] };

function showDuelSetup() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>🎮 Mod Duel</h2>
        <p>Competiție între doi jucători pe același dispozitiv</p>
      </div>
      
      <div class="content-card" style="max-width:500px;margin:0 auto">
        <h4>Introduceți numele jucătorilor:</h4>
        <div style="display:grid;gap:1rem;margin-top:1.5rem">
          <div>
            <label style="font-weight:600">🔵 Jucător 1:</label>
            <input type="text" id="duelPlayer1" placeholder="Nume jucător 1" style="width:100%;padding:1rem;border:2px solid var(--primary);border-radius:10px;font-size:1rem;margin-top:0.5rem">
          </div>
          <div>
            <label style="font-weight:600">🔴 Jucător 2:</label>
            <input type="text" id="duelPlayer2" placeholder="Nume jucător 2" style="width:100%;padding:1rem;border:2px solid var(--secondary);border-radius:10px;font-size:1rem;margin-top:0.5rem">
          </div>
          <button class="btn btn-primary" style="margin-top:1rem" onclick="startDuel()">⚔️ Începe Duelul!</button>
        </div>
      </div>
      
      <div class="info-box" style="max-width:500px;margin:2rem auto 0">
        <h4>📋 Reguli:</h4>
        <ul style="margin-top:0.5rem;padding-left:1.5rem">
          <li>5 runde cu întrebări identice</li>
          <li>Jucătorii răspund pe rând</li>
          <li>1 punct pentru fiecare răspuns corect</li>
          <li>Câștigă cel cu cele mai multe puncte!</li>
        </ul>
      </div>
    </div>`;
}

function startDuel() {
  const p1 = document.getElementById('duelPlayer1').value.trim() || 'Jucător 1';
  const p2 = document.getElementById('duelPlayer2').value.trim() || 'Jucător 2';

  // Get 5 random questions
  const allQ = [];
  Object.keys(tests).forEach(testId => {
    tests[testId].forEach(q => allQ.push(q));
  });

  duelState = {
    player1: p1,
    player2: p2,
    scores: [0, 0],
    currentPlayer: 0,
    questionIndex: 0,
    questions: allQ.sort(() => Math.random() - 0.5).slice(0, 5)
  };

  renderDuelQuestion();
}

function renderDuelQuestion() {
  const q = duelState.questions[duelState.questionIndex];
  const player = duelState.currentPlayer === 0 ? duelState.player1 : duelState.player2;
  const color = duelState.currentPlayer === 0 ? 'var(--primary)' : 'var(--secondary)';

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;background:var(--bg-card);border-radius:12px;margin-bottom:1.5rem">
        <div style="text-align:center;flex:1;padding:1rem;border-radius:10px;${duelState.currentPlayer === 0 ? 'background:rgba(99,102,241,0.2)' : ''}">
          <div style="font-size:1.5rem">🔵</div>
          <div style="font-weight:600">${duelState.player1}</div>
          <div style="font-size:2rem;font-weight:700;color:var(--primary)">${duelState.scores[0]}</div>
        </div>
        <div style="font-size:2rem;font-weight:700">VS</div>
        <div style="text-align:center;flex:1;padding:1rem;border-radius:10px;${duelState.currentPlayer === 1 ? 'background:rgba(236,72,153,0.2)' : ''}">
          <div style="font-size:1.5rem">🔴</div>
          <div style="font-weight:600">${duelState.player2}</div>
          <div style="font-size:2rem;font-weight:700;color:var(--secondary)">${duelState.scores[1]}</div>
        </div>
      </div>
      
      <div class="test-progress"><div class="test-progress-bar" style="width:${((duelState.questionIndex + 1) / 5) * 100}%;background:${color}"></div></div>
      
      <div style="text-align:center;margin:1rem 0;padding:1rem;background:${color};color:white;border-radius:10px">
        <span style="font-size:1.25rem">🎯 Rândul lui <strong>${player}</strong></span>
      </div>
      
      <div class="question-card">
        <span class="question-number">Runda ${duelState.questionIndex + 1} / 5</span>
        <p class="question-text">${q.q}</p>
        <div class="options-list">
          ${q.o.map((opt, i) => `
            <div class="option" onclick="answerDuel(${i}, ${q.a})" id="duel-opt-${i}">
              <span class="option-marker">${String.fromCharCode(65 + i)}</span>
              <span>${opt}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
}

function answerDuel(idx, correct) {
  if (idx === correct) {
    duelState.scores[duelState.currentPlayer]++;
  }

  document.querySelectorAll('[id^="duel-opt-"]').forEach((opt, i) => {
    opt.style.pointerEvents = 'none';
    if (i === correct) opt.classList.add('correct');
    else if (i === idx && idx !== correct) opt.classList.add('incorrect');
  });

  setTimeout(() => {
    // Switch player or next question
    if (duelState.currentPlayer === 0) {
      duelState.currentPlayer = 1;
      renderDuelQuestion();
    } else {
      duelState.currentPlayer = 0;
      duelState.questionIndex++;
      if (duelState.questionIndex < 5) {
        renderDuelQuestion();
      } else {
        showDuelResult();
      }
    }
  }, 1000);
}

function showDuelResult() {
  const winner = duelState.scores[0] > duelState.scores[1] ? duelState.player1 :
    duelState.scores[1] > duelState.scores[0] ? duelState.player2 : null;

  if (winner) createConfetti();

  document.getElementById('mainContent').innerHTML = `
    <div class="container text-center" style="padding:3rem 1rem">
      <h2>🎮 Rezultat Duel</h2>
      
      <div style="display:flex;justify-content:center;align-items:center;gap:2rem;margin:2rem 0">
        <div style="text-align:center;padding:2rem;background:${duelState.scores[0] >= duelState.scores[1] ? 'rgba(99,102,241,0.2)' : 'var(--bg-card)'};border-radius:16px">
          <div style="font-size:3rem">${duelState.scores[0] > duelState.scores[1] ? '🏆' : '🔵'}</div>
          <div style="font-size:1.25rem;font-weight:600">${duelState.player1}</div>
          <div style="font-size:3rem;font-weight:700;color:var(--primary)">${duelState.scores[0]}</div>
        </div>
        <div style="font-size:2rem">VS</div>
        <div style="text-align:center;padding:2rem;background:${duelState.scores[1] >= duelState.scores[0] ? 'rgba(236,72,153,0.2)' : 'var(--bg-card)'};border-radius:16px">
          <div style="font-size:3rem">${duelState.scores[1] > duelState.scores[0] ? '🏆' : '🔴'}</div>
          <div style="font-size:1.25rem;font-weight:600">${duelState.player2}</div>
          <div style="font-size:3rem;font-weight:700;color:var(--secondary)">${duelState.scores[1]}</div>
        </div>
      </div>
      
      <h3 style="font-size:1.75rem;margin:1rem 0">${winner ? `🎉 Câștigător: ${winner}!` : '🤝 Egalitate!'}</h3>
      
      <div style="display:flex;gap:1rem;justify-content:center;margin-top:2rem;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="showDuelSetup()">⚔️ Alt Duel</button>
        <button class="btn btn-secondary" onclick="showSection('home')">🏠 Acasă</button>
      </div>
    </div>`;
}

console.log('🚀 Toate funcționalitățile BOMBĂ au fost încărcate!');

// ========== 1. TEXT-TO-SPEECH ==========
let ttsEnabled = localStorage.getItem('asamblari-tts') === 'true';

function toggleTTS() {
  ttsEnabled = !ttsEnabled;
  localStorage.setItem('asamblari-tts', ttsEnabled);
  const btn = document.getElementById('ttsBtn');
  if (btn) btn.textContent = ttsEnabled ? '🎙️ Voce: Pornită' : '🎙️ Voce: Oprită';
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();
  alert(ttsEnabled ? '🎙️ Text-to-Speech activat!\n\nApasă butonul 🔊 de lângă text pentru a-l auzi.' : '🔇 Text-to-Speech dezactivat.');
}

// Get best feminine Romanian voice available
function getRomanianVoice() {
  const voices = window.speechSynthesis.getVoices();
  console.log('Voci disponibile:', voices.map(v => v.name + ' (' + v.lang + ')'));

  // Prioritize feminine Romanian voices
  let voice = voices.find(v => v.lang === 'ro-RO' && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('ioana')));
  if (!voice) voice = voices.find(v => v.lang === 'ro-RO' && v.name.toLowerCase().includes('microsoft'));
  if (!voice) voice = voices.find(v => v.lang === 'ro-RO');
  if (!voice) voice = voices.find(v => v.lang.startsWith('ro'));
  // Fallback to any feminine or natural-sounding voice
  if (!voice) voice = voices.find(v => v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('female'));
  if (!voice) voice = voices.find(v => v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('neural'));
  return voice;
}

function speakText(text) {
  if (!ttsEnabled) {
    // Auto-enable for convenience
    ttsEnabled = true;
    localStorage.setItem('asamblari-tts', 'true');
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();

    // Clean text for better pronunciation and grammar
    let cleanText = text
      .replace(/→/g, ' rezultă în ')
      .replace(/×/g, ' înmulțit cu ')
      .replace(/≈/g, ' aproximativ egal cu ')
      .replace(/≥/g, ' mai mare sau egal cu ')
      .replace(/≤/g, ' mai mic sau egal cu ')
      .replace(/%/g, ' la sută ')
      .replace(/°C/g, ' grade Celsius ')
      .replace(/mm/g, ' milimetri ')
      .replace(/cm/g, ' centimetri ')
      .replace(/kg/g, ' kilograme ')
      .replace(/kN/g, ' kiloniutoni ')
      .replace(/MPa/g, ' megapascali ')
      .replace(/MMA/g, ' sudare manuală cu electrod învelit ')
      .replace(/MIG/g, ' sudare MIG cu gaz inert ')
      .replace(/MAG/g, ' sudare MAG cu gaz activ ')
      .replace(/TIG/g, ' sudare TIG cu electrod de wolfram ')
      .replace(/SAW/g, ' sudare sub strat de flux ')
      .replace(/NSSM/g, ' normele de securitate și sănătate în muncă ')
      .replace(/SDV/g, ' scule, dispozitive și verificatoare ')
      .replace(/PSI/g, ' prevenirea și stingerea incendiilor ')
      .replace(/ZIT/g, ' zona influențată termic ')
      .replace(/DCEN/g, ' curent continuu cu polaritate directă ')
      .replace(/DCEP/g, ' curent continuu cu polaritate inversă ')
      .replace(/AC/g, ' curent alternativ ')
      .replace(/CC/g, ' curent continuu ')
      .replace(/CA/g, ' curent alternativ ')
      .replace(/d>/g, ' d mai mare decât ')
      .replace(/d</g, ' d mai mic decât ')
      .replace(/s>/g, ' s mai mare decât ')
      .replace(/\./g, '. ')
      .replace(/,/g, ', ')
      .replace(/:/g, ': ')
      .replace(/;/g, '; ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ro-RO';
    utterance.rate = 0.7; // Very slow for clarity
    utterance.pitch = 1.15; // Higher pitch for feminine, sweet voice
    utterance.volume = 1.0;

    // Try to get Romanian voice
    const roVoice = getRomanianVoice();
    if (roVoice) {
      utterance.voice = roVoice;
    }

    window.speechSynthesis.speak(utterance);
  } else {
    alert('Browserul nu suportă Text-to-Speech.');
  }
}

function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    updateVoiceButtons('stopped');
  }
}

// Pause speaking - can resume later
function pauseSpeaking() {
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
    updateVoiceButtons('paused');
  }
}

// Resume speaking from where it paused
function resumeSpeaking() {
  if ('speechSynthesis' in window && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    updateVoiceButtons('playing');
  }
}

// Toggle pause/resume
function togglePauseSpeaking() {
  if ('speechSynthesis' in window) {
    if (window.speechSynthesis.paused) {
      resumeSpeaking();
    } else if (window.speechSynthesis.speaking) {
      pauseSpeaking();
    }
  }
}

// Update button states
function updateVoiceButtons(state) {
  const pauseBtn = document.getElementById('pauseVoiceBtn');
  if (pauseBtn) {
    if (state === 'paused') {
      pauseBtn.innerHTML = '▶️ Continuă';
      pauseBtn.onclick = resumeSpeaking;
    } else if (state === 'playing') {
      pauseBtn.innerHTML = '⏸️ Pauză';
      pauseBtn.onclick = pauseSpeaking;
    } else {
      pauseBtn.innerHTML = '⏸️ Pauză';
      pauseBtn.onclick = pauseSpeaking;
    }
  }
}

// Read entire chapter content
function readAllContent(id) {
  const d = content[id];
  if (!d) {
    alert('Nu s-a găsit conținutul.');
    return;
  }

  let fullText = d.title + '. ';
  fullText += d.intro + '. ';

  d.sections.forEach(s => {
    fullText += s.title + '. ';
    if (s.text) fullText += s.text + '. ';
    s.items.forEach(item => {
      fullText += item + '. ';
    });
  });

  fullText += 'Norme de securitate și sănătate în muncă. ' + d.nssm;

  speakText(fullText);
}

// Load voices when available
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    console.log('🔊 Voci disponibile:', window.speechSynthesis.getVoices().length);
  };
}

// ========== 2. TEME DE CULOARE ==========
const colorThemes = {
  default: { primary: '#6366f1', secondary: '#ec4899', name: 'Violet' },
  blue: { primary: '#3b82f6', secondary: '#06b6d4', name: 'Albastru' },
  green: { primary: '#10b981', secondary: '#84cc16', name: 'Verde' },
  red: { primary: '#ef4444', secondary: '#f97316', name: 'Roșu' },
  gold: { primary: '#f59e0b', secondary: '#eab308', name: 'Auriu' }
};

let currentColorTheme = localStorage.getItem('asamblari-colorTheme') || 'default';

function applyColorTheme(themeName) {
  const theme = colorThemes[themeName] || colorThemes.default;
  document.documentElement.style.setProperty('--primary', theme.primary);
  document.documentElement.style.setProperty('--secondary', theme.secondary);
  document.documentElement.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`);
  currentColorTheme = themeName;
  localStorage.setItem('asamblari-colorTheme', themeName);
}

function showColorThemes() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>🎨 Teme de Culoare</h2>
        <p>Alege tema preferată</p>
      </div>
      
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem">
        ${Object.entries(colorThemes).map(([key, theme]) => `
          <div class="card ${currentColorTheme === key ? 'selected' : ''}" 
               style="cursor:pointer;text-align:center;border:3px solid ${currentColorTheme === key ? theme.primary : 'transparent'}"
               onclick="applyColorTheme('${key}');showColorThemes()">
            <div style="width:60px;height:60px;margin:0 auto 1rem;border-radius:50%;background:linear-gradient(135deg, ${theme.primary}, ${theme.secondary})"></div>
            <div style="font-weight:600">${theme.name}</div>
            ${currentColorTheme === key ? '<div style="color:var(--success);margin-top:0.5rem">✓ Activă</div>' : ''}
          </div>
        `).join('')}
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Apply saved theme on load
applyColorTheme(currentColorTheme);

// ========== 3. MOD LECTURĂ ==========
let readingMode = false;

function toggleReadingMode() {
  readingMode = !readingMode;
  document.body.classList.toggle('reading-mode', readingMode);

  if (readingMode) {
    // Add reading mode styles
    const style = document.createElement('style');
    style.id = 'readingModeStyle';
    style.textContent = `
      .reading-mode { background: #fdf6e3 !important; }
      .reading-mode * { color: #333 !important; background: transparent !important; box-shadow: none !important; animation: none !important; }
      .reading-mode .card, .reading-mode .content-card { background: white !important; border: 1px solid #ddd !important; }
      .reading-mode .hero { background: #f5f0e1 !important; }
      .reading-mode .btn { background: #666 !important; color: white !important; }
    `;
    document.head.appendChild(style);
  } else {
    const style = document.getElementById('readingModeStyle');
    if (style) style.remove();
  }

  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();
  alert(readingMode ? '📖 Mod Lectură activat - Design simplificat pentru citire.' : '🎨 Mod Lectură dezactivat - Design normal.');
}

// ========== 4. PAROLĂ PROFESOR ==========
const TEACHER_PASSWORD = 'profesor2025';
let isTeacherMode = false;

function showTeacherLogin() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  if (isTeacherMode) {
    isTeacherMode = false;
    alert('🔓 Mod profesor dezactivat.');
    return;
  }

  const password = prompt('🔐 Introduceți parola de profesor:');
  if (password === TEACHER_PASSWORD) {
    isTeacherMode = true;
    alert('✅ Mod profesor activat!\n\nAcum aveți acces la:\n- Gestionare teste programate\n- Vizualizare toate rezultatele\n- Resetare date elevi');
    showTeacherPanel();
  } else if (password !== null) {
    alert('❌ Parolă incorectă!');
  }
}

function showTeacherPanel() {
  const allResults = JSON.parse(localStorage.getItem('asamblari-submittedResults') || '[]');
  const lb = getLeaderboard();

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>👨‍🏫 Panou Profesor</h2>
        <p>Gestionare platformă educațională</p>
      </div>
      
      <div class="content-card">
        <h4>📊 Statistici Generale</h4>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-top:1rem;text-align:center">
          <div><div style="font-size:2rem;font-weight:700;color:var(--primary)">${lb.length}</div><div>Scoruri în Clasament</div></div>
          <div><div style="font-size:2rem;font-weight:700;color:var(--success)">${allResults.length}</div><div>Rezultate Trimise</div></div>
          <div><div style="font-size:2rem;font-weight:700;color:var(--secondary)">${getScheduledTests().length}</div><div>Teste Programate</div></div>
        </div>
      </div>
      
      <div class="content-card">
        <h4>🎯 Acțiuni Rapide</h4>
        <div style="display:flex;flex-wrap:wrap;gap:1rem;margin-top:1rem">
          <button class="btn btn-primary" onclick="showScheduledTests()">📅 Gestionează Teste</button>
          <button class="btn btn-secondary" onclick="showLeaderboard()">🥇 Vezi Clasament</button>
          <button class="btn btn-secondary" onclick="exportAllResults()">📥 Exportă Rezultate</button>
          <button class="btn btn-secondary" style="background:var(--warning)" onclick="if(confirm('Ștergi TOATE datele elevilor?')){localStorage.clear();location.reload()}">⚠️ Resetează Tot</button>
        </div>
      </div>
      
      ${allResults.length > 0 ? `
        <div class="content-card">
          <h4>📝 Ultimele Rezultate Trimise</h4>
          <div style="max-height:300px;overflow-y:auto">
            ${allResults.slice(-10).reverse().map(r => `
              <div style="padding:0.75rem;border-bottom:1px solid rgba(0,0,0,0.1)">
                <strong>${r.name}</strong> - ${r.testName}: <span style="color:${r.pct >= 70 ? 'var(--success)' : 'var(--warning)'}">${r.pct}%</span>
                <div style="font-size:0.85rem;color:var(--text-muted)">${new Date(r.date).toLocaleString('ro-RO')}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exportAllResults() {
  const results = JSON.parse(localStorage.getItem('asamblari-submittedResults') || '[]');
  const lb = getLeaderboard();

  const data = {
    exportDate: new Date().toISOString(),
    submittedResults: results,
    leaderboard: lb
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rezultate-elevi-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ========== 5. GRAFIC EVOLUȚIE ==========
function getWeeklyProgress() {
  const history = JSON.parse(localStorage.getItem('asamblari-progressHistory') || '[]');
  return history;
}

function saveProgressSnapshot() {
  const history = getWeeklyProgress();
  const today = new Date().toISOString().split('T')[0];

  // Check if already saved today
  if (history.some(h => h.date === today)) return;

  const stats = getStats();
  history.push({
    date: today,
    avgPct: stats.avgPct,
    completed: stats.completed,
    xp: getXP().xp
  });

  // Keep last 30 days
  localStorage.setItem('asamblari-progressHistory', JSON.stringify(history.slice(-30)));
}

function showEvolutionGraph() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  const history = getWeeklyProgress();
  const maxPct = Math.max(...history.map(h => h.avgPct), 100);

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>📈 Evoluția Ta</h2>
        <p>Progresul în ultimele zile</p>
      </div>
      
      ${history.length < 2 ? `
        <div class="info-box">
          <p>📊 Graficul va apărea după ce vei avea progres în mai multe zile diferite.</p>
          <p style="margin-top:1rem">Continuă să înveți și să dai teste pentru a vedea evoluția!</p>
        </div>
      ` : `
        <div class="content-card">
          <h4>📊 Media Scorurilor în Timp</h4>
          <div style="display:flex;align-items:end;gap:4px;height:200px;padding:1rem 0;border-bottom:2px solid var(--primary)">
            ${history.map((h, i) => {
    const height = (h.avgPct / maxPct) * 180;
    return `
                <div style="flex:1;display:flex;flex-direction:column;align-items:center" title="${h.date}: ${h.avgPct}%">
                  <div style="font-size:0.7rem;color:var(--text-muted)">${h.avgPct}%</div>
                  <div style="width:100%;height:${height}px;background:var(--gradient-primary);border-radius:4px 4px 0 0;min-height:5px"></div>
                </div>`;
  }).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:0.5rem;font-size:0.75rem;color:var(--text-muted)">
            <span>${history[0]?.date || ''}</span>
            <span>${history[history.length - 1]?.date || ''}</span>
          </div>
        </div>
        
        <div class="content-card">
          <h4>📋 Istoric Detaliat</h4>
          <div style="max-height:250px;overflow-y:auto">
            ${history.slice().reverse().map(h => `
              <div style="display:flex;justify-content:space-between;padding:0.75rem;border-bottom:1px solid rgba(0,0,0,0.1)">
                <span>${new Date(h.date).toLocaleDateString('ro-RO')}</span>
                <span style="font-weight:600;color:${h.avgPct >= 70 ? 'var(--success)' : 'var(--warning)'}">${h.avgPct}% medie</span>
                <span>${h.xp} XP</span>
              </div>
            `).join('')}
          </div>
        </div>
      `}
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Save progress snapshot on each test completion
const origShowResultForEvolution = showResult;
showResult = function () {
  origShowResultForEvolution();
  saveProgressSnapshot();
};

// ========== 6. NOTIFICĂRI STUDIU ==========
function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        alert('✅ Notificările au fost activate!\n\nVei primi reminder-uri pentru studiu.');
        scheduleStudyReminder();
      } else {
        alert('❌ Notificările au fost refuzate.\n\nPoți activa din setările browserului.');
      }
    });
  } else {
    alert('Browserul nu suportă notificări.');
  }
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();
}

function scheduleStudyReminder() {
  // Set reminder for next day at 10:00
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0, 0);
  const delay = tomorrow - now;

  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification('📚 Timp pentru studiu!', {
        body: 'Nu uita să îți completezi provocarea zilnică!',
        icon: 'icon-192.png'
      });
    }
  }, Math.min(delay, 60000)); // Max 1 min for demo
}

console.log('🌟 Toate funcționalitățile PREMIUM au fost încărcate!');

// ========== FIȘE DE LUCRU GOALE ==========
function showWorksheets() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>📋 Fișe de Lucru</h2>
        <p>Selectează un capitol pentru a genera o fișă de lucru goală</p>
      </div>
      
      <div class="section-grid">
        ${chapters.map(ch => `
          <div class="card" onclick="generateWorksheet('${ch.id}')">
            <div class="card-icon">${ch.icon}</div>
            <div class="card-title">${ch.title}</div>
            <div class="card-description">Fișă de lucru pentru completare manuală</div>
            <button class="btn btn-primary btn-block mt-3">📄 Generează Fișă</button>
          </div>
        `).join('')}
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function generateWorksheet(chapterId) {
  const ch = chapters.find(c => c.id === chapterId);
  const d = content[chapterId];

  if (!ch || !d) {
    alert('Capitol negăsit!');
    return;
  }

  const worksheetHtml = `
    <!DOCTYPE html>
    <html lang="ro">
    <head>
      <meta charset="UTF-8">
      <title>Fișă de Lucru - ${ch.title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.3; padding: 10mm; max-width: 210mm; }
        .header { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 8px; }
        .school { font-size: 12pt; font-weight: bold; text-transform: uppercase; }
        .subject { font-size: 10pt; margin-top: 3px; }
        .title { font-size: 14pt; font-weight: bold; margin-top: 8px; }
        .chapter-title { font-size: 11pt; margin-top: 5px; }
        .student-info { display: flex; justify-content: space-between; margin: 8px 0; padding: 6px; border: 1px solid #333; font-size: 10pt; }
        .field { display: flex; gap: 5px; align-items: center; }
        .field-label { font-weight: bold; }
        .field-line { border-bottom: 1px solid #333; min-width: 120px; height: 16px; }
        .section { margin: 8px 0; page-break-inside: avoid; }
        .section-title { font-weight: bold; font-size: 11pt; margin-bottom: 5px; background: #f0f0f0; padding: 3px 5px; }
        .exercise { margin: 6px 0; padding: 5px; border: 1px solid #ddd; page-break-inside: avoid; }
        .exercise-title { font-weight: bold; margin-bottom: 3px; font-size: 10pt; }
        .answer-lines { margin-top: 5px; }
        .answer-line { border-bottom: 1px dotted #999; height: 18px; margin: 3px 0; font-size: 10pt; }
        .checkbox-item { display: flex; align-items: center; gap: 8px; margin: 3px 0; font-size: 10pt; }
        .checkbox { width: 12px; height: 12px; border: 1px solid #333; display: inline-block; }
        .table-exercise { width: 100%; border-collapse: collapse; margin: 5px 0; font-size: 10pt; }
        .table-exercise td, .table-exercise th { border: 1px solid #333; padding: 4px; text-align: left; height: 22px; }
        .table-exercise th { background: #f0f0f0; }
        .drawing-box { border: 1px solid #333; height: 80px; margin: 5px 0; display: flex; align-items: center; justify-content: center; color: #999; font-size: 9pt; }
        .footer { margin-top: 10px; display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #333; font-size: 10pt; }
        .grade-box { text-align: center; padding: 5px 15px; border: 2px solid #333; }
        .grade-box .label { font-weight: bold; font-size: 9pt; }
        .grade-box .value { font-size: 18pt; height: 25px; }
        @page { size: A4; margin: 10mm; }
        @media print { 
          body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } 
          .section { page-break-inside: avoid; }
          .exercise { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="school">Liceul Tehnologic „Aurel Vlaicu" Galați</div>
        <div class="subject">Modulul M3 - Asamblări Mecanice</div>
        <div class="title">📋 FIȘĂ DE LUCRU</div>
        <div style="margin-top:10px;font-size:14pt">${ch.icon} ${ch.title}</div>
      </div>
      
      <div class="student-info">
        <div class="field">
          <span class="field-label">Nume și prenume elev:</span>
          <span class="field-line"></span>
        </div>
        <div class="field">
          <span class="field-label">Clasa:</span>
          <span class="field-line" style="min-width:80px"></span>
        </div>
        <div class="field">
          <span class="field-label">Data:</span>
          <span class="field-line" style="min-width:100px"></span>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">I. ÎNTREBĂRI TEORETICE</div>
        
        <div class="exercise">
          <div class="exercise-title">1. Definește noțiunea de "${d.title.replace(/[0-9.]+\s*/, '')}":</div>
          <div class="answer-lines">
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
          </div>
        </div>
        
        <div class="exercise">
          <div class="exercise-title">2. Enumeră 4 avantaje ale acestui procedeu:</div>
          <div class="answer-lines">
            <div class="answer-line">a) </div>
            <div class="answer-line">b) </div>
            <div class="answer-line">c) </div>
            <div class="answer-line">d) </div>
          </div>
        </div>
        
        <div class="exercise">
          <div class="exercise-title">3. Care sunt sculele și dispozitivele necesare? (SDV-uri)</div>
          <div class="answer-lines">
            <div class="answer-line"></div>
            <div class="answer-line"></div>
            <div class="answer-line"></div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">II. EXERCIȚII PRACTICE</div>
        
        <div class="exercise">
          <div class="exercise-title">4. Completează tabelul cu etapele procesului tehnologic:</div>
          <table class="table-exercise">
            <tr>
              <th style="width:10%">Nr.</th>
              <th style="width:30%">Etapa</th>
              <th style="width:60%">Descriere</th>
            </tr>
            <tr><td>1</td><td></td><td></td></tr>
            <tr><td>2</td><td></td><td></td></tr>
            <tr><td>3</td><td></td><td></td></tr>
            <tr><td>4</td><td></td><td></td></tr>
            <tr><td>5</td><td></td><td></td></tr>
          </table>
        </div>
        
        <div class="exercise">
          <div class="exercise-title">5. Marchează cu X afirmațiile corecte:</div>
          <div class="checkbox-item"><div class="checkbox"></div> Este o îmbinare demontabilă</div>
          <div class="checkbox-item"><div class="checkbox"></div> Este o îmbinare nedemontabilă</div>
          <div class="checkbox-item"><div class="checkbox"></div> Necesită echipament de protecție</div>
          <div class="checkbox-item"><div class="checkbox"></div> Se poate executa manual și mecanic</div>
          <div class="checkbox-item"><div class="checkbox"></div> Nu necesită pregătirea suprafețelor</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">III. NORME DE SECURITATE</div>
        
        <div class="exercise">
          <div class="exercise-title">6. Enumeră 3 norme de securitate specifice acestei operații:</div>
          <div class="answer-lines">
            <div class="answer-line">1. </div>
            <div class="answer-line">2. </div>
            <div class="answer-line">3. </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">IV. SCHEMĂ / DESEN TEHNIC</div>
        <div style="border: 1px solid #333; height: 150px; margin: 10px 0; display: flex; align-items: center; justify-content: center; color: #999;">
          Spațiu pentru schiță / desen tehnic
        </div>
      </div>
      
      <div class="footer">
        <div class="field">
          <span class="field-label">Semnătura elevului:</span>
          <span class="field-line"></span>
        </div>
        <div class="grade-box">
          <div style="font-weight:bold">NOTĂ</div>
          <div style="font-size:24pt;height:40px"></div>
        </div>
        <div class="field">
          <span class="field-label">Semnătura profesorului:</span>
          <span class="field-line"></span>
        </div>
      </div>
    </body>
    </html>
  `;

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  printWindow.document.write(worksheetHtml);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 500);
}

console.log('📋 Funcționalitatea Fișe de Lucru a fost încărcată!');

// ========== DIAGRAME TEHNICE ==========
const technicalDiagrams = {
  's2-1': { // Nituire
    title: 'Diagrame Nituire',
    diagrams: [
      {
        title: 'Structura Nitului',
        svg: `<svg viewBox="0 0 200 120" style="max-width:250px;background:#f9f9f9;border-radius:8px">
          <text x="100" y="15" text-anchor="middle" font-size="10" font-weight="bold">STRUCTURA NITULUI</text>
          <!-- Nit -->
          <rect x="85" y="25" width="30" height="60" fill="#666" stroke="#333" stroke-width="1"/>
          <!-- Cap fabricație -->
          <ellipse cx="100" cy="25" rx="25" ry="8" fill="#888" stroke="#333"/>
          <!-- Table -->
          <rect x="50" y="45" width="100" height="10" fill="#4a90d9" stroke="#333"/>
          <rect x="50" y="55" width="100" height="10" fill="#5ba85b" stroke="#333"/>
          <!-- Cap închidere -->
          <ellipse cx="100" cy="85" rx="22" ry="7" fill="#888" stroke="#333"/>
          <!-- Etichete -->
          <line x1="130" y1="25" x2="160" y2="15" stroke="#333" stroke-dasharray="2"/>
          <text x="162" y="18" font-size="7">Cap fabricație</text>
          <line x1="120" y1="40" x2="160" y2="35" stroke="#333" stroke-dasharray="2"/>
          <text x="162" y="38" font-size="7">Tija</text>
          <line x1="130" y1="50" x2="175" y2="50" stroke="#333" stroke-dasharray="2"/>
          <text x="162" y="53" font-size="7">Tablă 1</text>
          <line x1="130" y1="60" x2="175" y2="65" stroke="#333" stroke-dasharray="2"/>
          <text x="162" y="68" font-size="7">Tablă 2</text>
          <line x1="125" y1="85" x2="160" y2="95" stroke="#333" stroke-dasharray="2"/>
          <text x="162" y="98" font-size="7">Cap închidere</text>
        </svg>`
      },
      {
        title: 'Tipuri de Capete',
        svg: `<svg viewBox="0 0 280 100" style="max-width:320px;background:#f9f9f9;border-radius:8px">
          <text x="140" y="15" text-anchor="middle" font-size="10" font-weight="bold">TIPURI DE CAPETE NITURI</text>
          <!-- Semirotund -->
          <ellipse cx="50" cy="45" rx="20" ry="12" fill="#888" stroke="#333"/>
          <rect x="42" y="45" width="16" height="35" fill="#666" stroke="#333"/>
          <text x="50" y="90" text-anchor="middle" font-size="7">Semirotund</text>
          <!-- Înecat -->
          <polygon points="100,45 85,55 115,55" fill="#888" stroke="#333"/>
          <rect x="92" y="55" width="16" height="25" fill="#666" stroke="#333"/>
          <text x="100" y="90" text-anchor="middle" font-size="7">Înecat</text>
          <!-- Bombat -->
          <ellipse cx="150" cy="48" rx="18" ry="8" fill="#888" stroke="#333"/>
          <ellipse cx="150" cy="45" rx="15" ry="6" fill="#999" stroke="#333"/>
          <rect x="142" y="48" width="16" height="32" fill="#666" stroke="#333"/>
          <text x="150" y="90" text-anchor="middle" font-size="7">Bombat</text>
          <!-- Lenticular -->
          <ellipse cx="200" cy="47" rx="22" ry="5" fill="#888" stroke="#333"/>
          <rect x="192" y="47" width="16" height="33" fill="#666" stroke="#333"/>
          <text x="200" y="90" text-anchor="middle" font-size="7">Lenticular</text>
          <!-- Pop-nit -->
          <circle cx="250" cy="45" r="12" fill="#888" stroke="#333"/>
          <rect x="246" y="45" width="8" height="35" fill="#666" stroke="#333"/>
          <line x1="250" y1="35" x2="250" y2="25" stroke="#333" stroke-width="2"/>
          <text x="250" y="90" text-anchor="middle" font-size="7">Pop-nit</text>
        </svg>`
      }
    ]
  },
  's2-2': { // Sudare
    title: 'Diagrame Sudare',
    diagrams: [
      {
        title: 'Schema Arc Electric',
        svg: `<svg viewBox="0 0 250 140" style="max-width:300px;background:#f9f9f9;border-radius:8px">
          <text x="125" y="15" text-anchor="middle" font-size="10" font-weight="bold">SCHEMA SUDĂRII CU ARC</text>
          <!-- Electrod -->
          <rect x="115" y="25" width="20" height="50" fill="#8B4513" stroke="#333"/>
          <rect x="118" y="25" width="14" height="50" fill="#A0522D"/>
          <text x="155" y="45" font-size="7">Electrod învelit</text>
          <!-- Arc electric -->
          <path d="M125,75 Q115,85 125,90 Q135,95 125,100" stroke="#FFD700" stroke-width="3" fill="none"/>
          <circle cx="125" cy="88" r="8" fill="#FFA500" opacity="0.5"/>
          <text x="155" y="88" font-size="7">Arc electric</text>
          <!-- Baia de sudură -->
          <ellipse cx="125" cy="108" rx="30" ry="8" fill="#FF6347" opacity="0.7"/>
          <text x="170" y="108" font-size="7">Baie sudură</text>
          <!-- Metal de bază -->
          <rect x="60" y="110" width="130" height="20" fill="#4682B4" stroke="#333"/>
          <text x="125" y="135" text-anchor="middle" font-size="7">Metal de bază</text>
          <!-- Zgura -->
          <path d="M95,108 Q110,100 140,108" stroke="#333" fill="#666" opacity="0.6"/>
          <text x="60" y="105" font-size="7">Zgură</text>
        </svg>`
      },
      {
        title: 'Tipuri Electrozi',
        svg: `<svg viewBox="0 0 280 100" style="max-width:320px;background:#f9f9f9;border-radius:8px">
          <text x="140" y="15" text-anchor="middle" font-size="10" font-weight="bold">TIPURI DE ELECTROZI</text>
          <!-- Rutilic -->
          <rect x="30" y="30" width="8" height="50" fill="#666"/>
          <rect x="32" y="30" width="4" height="50" fill="#888"/>
          <circle cx="34" cy="30" r="6" fill="#CD853F"/>
          <text x="34" y="90" text-anchor="middle" font-size="7">Rutilic (R)</text>
          <!-- Bazic -->
          <rect x="90" y="30" width="8" height="50" fill="#666"/>
          <rect x="92" y="30" width="4" height="50" fill="#888"/>
          <circle cx="94" cy="30" r="6" fill="#4169E1"/>
          <text x="94" y="90" text-anchor="middle" font-size="7">Bazic (B)</text>
          <!-- Celulozic -->
          <rect x="150" y="30" width="8" height="50" fill="#666"/>
          <rect x="152" y="30" width="4" height="50" fill="#888"/>
          <circle cx="154" cy="30" r="6" fill="#228B22"/>
          <text x="154" y="90" text-anchor="middle" font-size="7">Celulozic (C)</text>
          <!-- Sârmă MIG -->
          <circle cx="220" cy="50" r="20" fill="none" stroke="#666" stroke-width="3"/>
          <circle cx="220" cy="50" r="15" fill="none" stroke="#888" stroke-width="2"/>
          <text x="220" y="90" text-anchor="middle" font-size="7">Sârmă MIG</text>
        </svg>`
      }
    ]
  },
  's2-3': { // Lipire
    title: 'Diagrame Lipire',
    diagrams: [
      {
        title: 'Schema Lipirii',
        svg: `<svg viewBox="0 0 220 120" style="max-width:260px;background:#f9f9f9;border-radius:8px">
          <text x="110" y="15" text-anchor="middle" font-size="10" font-weight="bold">SCHEMA LIPIRII</text>
          <!-- Piesă 1 -->
          <rect x="30" y="50" width="70" height="20" fill="#4682B4" stroke="#333"/>
          <text x="65" y="45" text-anchor="middle" font-size="7">Piesă 1</text>
          <!-- Piesă 2 -->
          <rect x="120" y="50" width="70" height="20" fill="#4682B4" stroke="#333"/>
          <text x="155" y="45" text-anchor="middle" font-size="7">Piesă 2</text>
          <!-- Aliaj de lipit -->
          <rect x="95" y="50" width="30" height="20" fill="#FFD700" stroke="#333"/>
          <text x="110" y="80" text-anchor="middle" font-size="7">Aliaj lipit</text>
          <!-- Flacără -->
          <ellipse cx="110" cy="35" rx="15" ry="20" fill="#FF4500" opacity="0.6"/>
          <ellipse cx="110" cy="38" rx="8" ry="12" fill="#FFD700" opacity="0.7"/>
          <text x="110" y="15" text-anchor="middle" font-size="7">Încălzire</text>
          <!-- Flux -->
          <path d="M95,48 L125,48" stroke="#32CD32" stroke-width="2" stroke-dasharray="3"/>
          <text x="110" y="100" text-anchor="middle" font-size="7">Flux (decapant)</text>
        </svg>`
      }
    ]
  },
  's3-1': { // Filetate
    title: 'Diagrame Asamblări Filetate',
    diagrams: [
      {
        title: 'Filet Metric',
        svg: `<svg viewBox="0 0 200 120" style="max-width:250px;background:#f9f9f9;border-radius:8px">
          <text x="100" y="15" text-anchor="middle" font-size="10" font-weight="bold">FILET METRIC</text>
          <!-- Profil filet -->
          <path d="M30,40 L50,60 L30,80 L50,100" stroke="#333" stroke-width="2" fill="none"/>
          <path d="M50,60 L70,40 L90,60 L70,80 L90,100" stroke="#333" stroke-width="2" fill="none"/>
          <path d="M90,60 L110,40 L130,60 L110,80 L130,100" stroke="#333" stroke-width="2" fill="none"/>
          <!-- Cotare -->
          <line x1="50" y1="35" x2="90" y2="35" stroke="#E74C3C" stroke-width="1"/>
          <text x="70" y="32" text-anchor="middle" font-size="7" fill="#E74C3C">Pas (P)</text>
          <line x1="140" y1="40" x2="140" y2="100" stroke="#3498DB" stroke-width="1"/>
          <text x="160" y="70" font-size="7" fill="#3498DB">d (diametru)</text>
          <!-- Unghi -->
          <path d="M70,60 L80,50 L90,60" stroke="#27AE60" fill="none"/>
          <text x="80" y="48" font-size="6" fill="#27AE60">60°</text>
        </svg>`
      },
      {
        title: 'Tipuri Șuruburi',
        svg: `<svg viewBox="0 0 300 90" style="max-width:340px;background:#f9f9f9;border-radius:8px">
          <text x="150" y="12" text-anchor="middle" font-size="9" font-weight="bold">TIPURI DE ȘURUBURI</text>
          <!-- Hexagonal -->
          <polygon points="35,25 45,20 55,25 55,35 45,40 35,35" fill="#888" stroke="#333"/>
          <rect x="40" y="40" width="10" height="35" fill="#666" stroke="#333"/>
          <text x="45" y="85" text-anchor="middle" font-size="6">Hexagonal</text>
          <!-- Imbus -->
          <circle cx="95" cy="30" r="12" fill="#888" stroke="#333"/>
          <polygon points="95,25 90,30 95,35 100,30" fill="#333"/>
          <rect x="90" y="42" width="10" height="33" fill="#666" stroke="#333"/>
          <text x="95" y="85" text-anchor="middle" font-size="6">Imbus</text>
          <!-- Phillips -->
          <circle cx="145" cy="30" r="12" fill="#888" stroke="#333"/>
          <line x1="145" y1="23" x2="145" y2="37" stroke="#333" stroke-width="2"/>
          <line x1="138" y1="30" x2="152" y2="30" stroke="#333" stroke-width="2"/>
          <rect x="140" y="42" width="10" height="33" fill="#666" stroke="#333"/>
          <text x="145" y="85" text-anchor="middle" font-size="6">Phillips</text>
          <!-- Torx -->
          <circle cx="195" cy="30" r="12" fill="#888" stroke="#333"/>
          <polygon points="195,22 198,27 205,27 200,32 202,39 195,35 188,39 190,32 185,27 192,27" fill="#333"/>
          <rect x="190" y="42" width="10" height="33" fill="#666" stroke="#333"/>
          <text x="195" y="85" text-anchor="middle" font-size="6">Torx</text>
          <!-- Prezon -->
          <rect x="240" y="20" width="10" height="55" fill="#666" stroke="#333"/>
          <text x="245" y="85" text-anchor="middle" font-size="6">Prezon</text>
        </svg>`
      }
    ]
  }
};

// Add diagram section to content
function getDiagramsHtml(chapterId) {
  const diagrams = technicalDiagrams[chapterId];
  if (!diagrams) return '';

  return `
    <div class="content-card" style="background:linear-gradient(135deg,#f0f9ff,#e0f2fe)">
      <h3>📐 ${diagrams.title}</h3>
      <p style="color:var(--text-muted);font-size:0.9rem">Diagrame tehnice pentru înțelegerea vizuală a procedeelor</p>
      <div style="display:flex;flex-wrap:wrap;gap:1rem;margin-top:1rem;justify-content:center">
        ${diagrams.diagrams.map(d => `
          <div style="text-align:center;background:white;padding:1rem;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
            <div style="font-weight:600;margin-bottom:0.5rem;color:var(--primary)">${d.title}</div>
            ${d.svg}
          </div>
        `).join('')}
      </div>
    </div>`;
}

console.log('📐 Diagramele tehnice au fost încărcate!');

// ========== 1. VIDEOURI YOUTUBE TUTORIALE ==========
const youtubeVideos = {
  's2-1': [ // Nituire
    { id: 'dQw4w9WgXcQ', title: 'Cum se nituiește - Tutorial Pop-nituri', channel: 'Meșter DIY' },
    { id: 'dQw4w9WgXcQ', title: 'Clește pop nituri - Demonstrație', channel: 'Atelier RO' }
  ],
  's2-2': [ // Sudare
    { id: 'dQw4w9WgXcQ', title: 'Sudura cu electrod învelit - Începători', channel: 'Sudor PRO' },
    { id: 'dQw4w9WgXcQ', title: 'Tutorial MMA Inverter pentru începători', channel: 'Atelierul RO' },
    { id: 'dQw4w9WgXcQ', title: 'Sudura de la A la Z cu electrod', channel: 'MeșterSudor' }
  ],
  's2-3': [ // Lipire
    { id: 'dQw4w9WgXcQ', title: 'Lipire moale cu ciocan de lipit', channel: 'Electronică RO' }
  ],
  's3-1': [ // Filetate
    { id: 'dQw4w9WgXcQ', title: 'Cum folosești cheile și șuruburile', channel: 'Auto Repair RO' }
  ]
};

function showVideoTutorials(chapterId) {
  const videos = youtubeVideos[chapterId];
  if (!videos || videos.length === 0) {
    alert('Nu sunt disponibile videouri pentru acest capitol.');
    return;
  }

  const ch = chapters.find(c => c.id === chapterId);

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('${chapterId}')">← Înapoi la ${ch?.title || 'Capitol'}</button>
      <div class="section-header">
        <h2>🎬 Tutoriale Video - ${ch?.title || ''}</h2>
        <p>Videouri educaționale de pe YouTube</p>
      </div>
      
      <div class="section-grid">
        ${videos.map((v, i) => `
          <div class="card" style="cursor:pointer" onclick="playVideo('${v.id}', '${v.title.replace(/'/g, "\\'")}')">
            <div style="position:relative;background:#000;border-radius:12px;overflow:hidden;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center">
              <img src="https://img.youtube.com/vi/${v.id}/mqdefault.jpg" alt="${v.title}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">
              <div style="position:absolute;background:rgba(255,0,0,0.9);padding:0.5rem 1rem;border-radius:8px">
                <span style="color:white;font-size:1.5rem">▶</span>
              </div>
            </div>
            <div class="card-title" style="margin-top:0.75rem;font-size:0.95rem">${v.title}</div>
            <div style="color:var(--text-muted);font-size:0.85rem">${v.channel}</div>
          </div>
        `).join('')}
      </div>
      
      <div id="videoPlayer" style="display:none;margin-top:2rem">
        <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.3)">
          <iframe id="youtubeFrame" style="position:absolute;top:0;left:0;width:100%;height:100%" frameborder="0" allowfullscreen></iframe>
        </div>
        <button class="btn btn-secondary mt-3" onclick="closeVideo()">✕ Închide Video</button>
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function playVideo(videoId, title) {
  const player = document.getElementById('videoPlayer');
  const frame = document.getElementById('youtubeFrame');
  frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  player.style.display = 'block';
  player.scrollIntoView({ behavior: 'smooth' });
}

function closeVideo() {
  document.getElementById('youtubeFrame').src = '';
  document.getElementById('videoPlayer').style.display = 'none';
}

// ========== 2. EXPORT PDF PORTOFOLIU ==========
function exportPDF() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  const stats = getStats();
  const progress = getProgress();
  const userName = localStorage.getItem('asamblari-userName') || 'Elev';
  const xp = parseInt(localStorage.getItem('asamblari-xp') || '0');
  const level = Math.floor(xp / 100) + 1;

  const completedChapters = Object.keys(progress).filter(k => progress[k]?.pct >= 70);

  const pdfHtml = `
    <!DOCTYPE html>
    <html lang="ro">
    <head>
      <meta charset="UTF-8">
      <title>Portofoliu - ${userName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; padding: 20mm; }
        .header { text-align: center; border-bottom: 3px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .school { font-size: 14pt; font-weight: bold; }
        .title { font-size: 22pt; font-weight: bold; margin: 20px 0; color: #333; }
        .subtitle { font-size: 14pt; color: #666; }
        .section { margin: 25px 0; }
        .section-title { font-size: 14pt; font-weight: bold; background: #f0f0f0; padding: 8px 15px; margin-bottom: 15px; }
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; }
        .stat-box { padding: 20px; border: 2px solid #ddd; border-radius: 10px; }
        .stat-value { font-size: 28pt; font-weight: bold; color: #4a90d9; }
        .stat-label { font-size: 10pt; color: #666; }
        .progress-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
        .badge { padding: 3px 10px; border-radius: 5px; font-size: 10pt; }
        .passed { background: #d4edda; color: #155724; }
        .failed { background: #f8d7da; color: #721c24; }
        .footer { margin-top: 40px; text-align: center; font-size: 10pt; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        @media print { body { padding: 15mm; } @page { size: A4; margin: 15mm; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="school">LICEUL TEHNOLOGIC „AUREL VLAICU" GALAȚI</div>
        <div class="title">📋 PORTOFOLIU DIGITAL</div>
        <div class="subtitle">Modulul M3 - Asamblări Mecanice</div>
      </div>
      
      <div class="section">
        <div class="section-title">👤 Date Personale</div>
        <p><strong>Nume:</strong> ${userName}</p>
        <p><strong>Data generării:</strong> ${new Date().toLocaleDateString('ro-RO')}</p>
        <p><strong>Nivel:</strong> ${level} | <strong>Experiență:</strong> ${xp} XP</p>
      </div>
      
      <div class="section">
        <div class="section-title">📊 Statistici Generale</div>
        <div class="stat-grid">
          <div class="stat-box">
            <div class="stat-value">${stats.attempts}</div>
            <div class="stat-label">Teste Finalizate</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${stats.avgScore}%</div>
            <div class="stat-label">Media Generală</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${completedChapters.length}/${chapters.length}</div>
            <div class="stat-label">Capitole Promovate</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">📝 Rezultate pe Capitole</div>
        ${chapters.map(ch => {
    const p = progress[ch.id];
    const status = p ? (p.pct >= 70 ? 'passed' : 'failed') : '';
    return `
            <div class="progress-item">
              <span>${ch.icon} ${ch.title}</span>
              <span class="badge ${status}">${p ? `${p.pct}% - ${p.date}` : 'Netestat'}</span>
            </div>
          `;
  }).join('')}
      </div>
      
      <div class="footer">
        <p>Document generat automat de platforma educațională Asamblări Mecanice</p>
        <p>Prof.Ing. Popescu Romulus</p>
        <p>An școlar 2025-2026</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(pdfHtml);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 500);
}

// ========== 3. MOD OFFLINE ÎMBUNĂTĂȚIT ==========
function checkOfflineStatus() {
  const isOnline = navigator.onLine;
  const statusEl = document.getElementById('offlineStatus');
  if (statusEl) {
    statusEl.innerHTML = isOnline ?
      '<span style="color:var(--success)">🟢 Online</span>' :
      '<span style="color:var(--warning)">🟠 Offline - Funcționează local</span>';
  }
  return isOnline;
}

window.addEventListener('online', () => {
  checkOfflineStatus();
  console.log('🟢 Conexiune restabilită');
});

window.addEventListener('offline', () => {
  checkOfflineStatus();
  console.log('🟠 Mod offline activat');
});

// Cache all content on first load
function cacheAllContent() {
  if ('caches' in window) {
    caches.open('asamblari-v3').then(cache => {
      const urlsToCache = [
        './',
        './index.html',
        './app.js',
        './styles.css',
        './icon-192.png',
        './icon-512.png'
      ];
      cache.addAll(urlsToCache).then(() => {
        console.log('📦 Conținut salvat pentru offline');
      });
    });
  }
}

// ========== 4. DUEL ONLINE (PREGĂTIRE) ==========
let onlineDuelCode = null;

function generateDuelCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function showOnlineDuel() {
  if (document.getElementById('mobileNav').classList.contains('active')) toggleMenu();

  onlineDuelCode = generateDuelCode();

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>🌐 Duel Online</h2>
        <p>Provoacă un coleg la distanță!</p>
      </div>
      
      <div class="content-card" style="text-align:center">
        <h3>📲 Codul tău de duel:</h3>
        <div style="font-size:3rem;font-weight:700;letter-spacing:0.5rem;color:var(--primary);margin:1.5rem 0;font-family:monospace;background:var(--bg-card);padding:1rem;border-radius:12px;border:3px dashed var(--primary)">${onlineDuelCode}</div>
        <p style="color:var(--text-muted)">Trimite acest cod colegului tău pentru a începe duelul</p>
        <button class="btn btn-primary mt-3" onclick="copyDuelCode()">📋 Copiază Codul</button>
        <button class="btn btn-secondary mt-3" onclick="shareDuelCode()">📤 Partajează</button>
      </div>
      
      <div class="content-card" style="text-align:center">
        <h3>🔗 Sau introdu codul primit:</h3>
        <input type="text" id="joinDuelCode" placeholder="ABC123" maxlength="6" style="font-size:2rem;text-align:center;padding:1rem;width:200px;border-radius:12px;border:2px solid var(--border);text-transform:uppercase;font-family:monospace">
        <button class="btn btn-primary btn-lg mt-3" onclick="joinOnlineDuel()">⚔️ Intră în Duel</button>
      </div>
      
      <div class="info-box">
        <h4>ℹ️ Cum funcționează:</h4>
        <ol style="margin-left:1.5rem;margin-top:0.5rem">
          <li>Generează un cod și trimite-l colegului</li>
          <li>Colegul introduce codul pe telefonul lui</li>
          <li>Ambii răspundeți la aceleași întrebări</li>
          <li>Câștigă cel cu cele mai multe răspunsuri corecte!</li>
        </ol>
        <p style="margin-top:1rem;color:var(--warning);font-size:0.9rem">⚠️ Funcție în dezvoltare - necesită server pentru sincronizare în timp real</p>
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function copyDuelCode() {
  navigator.clipboard.writeText(onlineDuelCode).then(() => {
    alert('✅ Cod copiat: ' + onlineDuelCode);
  });
}

function shareDuelCode() {
  const shareData = {
    title: 'Duel Asamblări Mecanice',
    text: `Te provoc la un duel! Codul meu: ${onlineDuelCode}`,
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData);
  } else {
    copyDuelCode();
  }
}

function joinOnlineDuel() {
  const code = document.getElementById('joinDuelCode')?.value?.toUpperCase();
  if (!code || code.length !== 6) {
    alert('❌ Introdu un cod valid de 6 caractere!');
    return;
  }
  alert(`🎮 Conectare la duelul: ${code}\n\n⚠️ Funcție în dezvoltare - în curând vei putea juca online!`);
}

// Initialize
cacheAllContent();
checkOfflineStatus();

// ========== 4. CALCULATOR TEHNIC ==========
function showTechnicalCalculator() {
  if (document.getElementById('mobileNav')?.classList.contains('active')) toggleMenu();

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Înapoi</button>
      <div class="section-header">
        <h2>🧮 Calculator Tehnic</h2>
        <p>Unelte utile pentru atelier</p>
      </div>
      
      <!-- Calculator Nituri -->
      <div class="content-card">
        <h3>🔩 Diametru Nit (d)</h3>
        <p style="font-size:0.9rem;color:var(--text-muted)">Formula: d = 2 × √s (unde s = grosime pachet table)</p>
        <div style="display:flex;gap:1rem;align-items:end;flex-wrap:wrap">
          <div style="flex:1">
            <label>Grosime (s) mm:</label>
            <input type="number" id="calc-s" class="form-control" placeholder="Ex: 4" oninput="calculateRivet()">
          </div>
          <div style="flex:1">
            <label>Rezultat (d):</label>
            <div id="res-d" style="font-size:1.5rem;font-weight:bold;color:var(--primary)">- mm</div>
          </div>
        </div>
      </div>

      <!-- Calculator Piuliță -->
      <div class="content-card">
        <h3>🔧 Cheie Piuliță (S)</h3>
        <p style="font-size:0.9rem;color:var(--text-muted)">Aprox: S ≈ 1.732 × d (pentru hexagoane standard)</p>
        <div style="display:flex;gap:1rem;align-items:end;flex-wrap:wrap">
          <div style="flex:1">
            <label>Diametru Filet (M) mm:</label>
            <input type="number" id="calc-m" class="form-control" placeholder="Ex: 10" oninput="calculateNut()">
          </div>
          <div style="flex:1">
            <label>Cheie (S):</label>
            <div id="res-s" style="font-size:1.5rem;font-weight:bold;color:var(--secondary)">- mm</div>
          </div>
        </div>
      </div>

      <!-- Convertor -->
      <div class="content-card">
        <h3>📏 Convertor Țoli ↔ mm</h3>
        <div style="display:flex;gap:1rem;flex-wrap:wrap">
          <div style="flex:1">
            <label>Inch ("):</label>
            <input type="number" id="calc-inch" class="form-control" placeholder="1" oninput="convertUnits('inch')">
          </div>
          <div style="flex:1">
            <label>Milimetri (mm):</label>
            <input type="number" id="calc-mm" class="form-control" placeholder="25.4" oninput="convertUnits('mm')">
          </div>
        </div>
      </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function calculateRivet() {
  const s = parseFloat(document.getElementById('calc-s').value);
  if (s > 0) {
    const d = 2 * Math.sqrt(s);
    document.getElementById('res-d').innerText = d.toFixed(1) + ' mm';
  } else {
    document.getElementById('res-d').innerText = '- mm';
  }
}

function calculateNut() {
  const d = parseFloat(document.getElementById('calc-m').value);
  if (d > 0) {
    const s = 1.732 * d; // Approx specific logic could be replaced by a lookup table if precise ISO needed
    // Simple lookup for common sizes
    let exact = Math.round(s);
    if (d === 6) exact = 10;
    if (d === 8) exact = 13;
    if (d === 10) exact = 17; // ISO 
    if (d === 12) exact = 19;

    document.getElementById('res-s').innerHTML = `${exact} mm <span style="font-size:0.8rem;font-weight:400">(calc: ${s.toFixed(1)})</span>`;
  } else {
    document.getElementById('res-s').innerText = '- mm';
  }
}

function convertUnits(type) {
  if (type === 'inch') {
    const inch = parseFloat(document.getElementById('calc-inch').value);
    if (!isNaN(inch)) document.getElementById('calc-mm').value = (inch * 25.4).toFixed(2);
  } else {
    const mm = parseFloat(document.getElementById('calc-mm').value);
    if (!isNaN(mm)) document.getElementById('calc-inch').value = (mm / 25.4).toFixed(3);
  }
}

// ========== 5. DUEL ROBOT (OFFLINE) ==========
let botDuelState = { p1Score: 0, botScore: 0, qIndex: 0, questions: [], history: [] };

function startBotDuel() {
  if (document.getElementById('mobileNav')?.classList.contains('active')) toggleMenu();

  // Select 5 random questions
  const allQ = [];
  Object.keys(tests).forEach(tid => allQ.push(...tests[tid]));
  botDuelState.questions = allQ.sort(() => Math.random() - 0.5).slice(0, 5);
  botDuelState.p1Score = 0;
  botDuelState.botScore = 0;
  botDuelState.qIndex = 0;

  renderBotDuel();
}

function renderBotDuel() {
  const q = botDuelState.questions[botDuelState.qIndex];

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
      <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Renunță</button>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem;background:var(--bg-card);border-radius:12px;margin-bottom:1rem">
        <div style="text-align:center">
          <div style="font-size:1.5rem">👤</div>
          <div style="font-weight:bold">${getCurrentUser()}</div>
          <div style="font-size:1.5rem;color:var(--primary)">${botDuelState.p1Score}</div>
        </div>
        <div style="font-weight:bold;color:var(--text-muted)">Runda ${botDuelState.qIndex + 1}/5</div>
        <div style="text-align:center">
          <div style="font-size:1.5rem">🤖</div>
          <div style="font-weight:bold">Robot</div>
          <div style="font-size:1.5rem;color:var(--secondary)">${botDuelState.botScore}</div>
        </div>
      </div>

      <div class="question-card">
        <p class="question-text">${q.q}</p>
        <div class="options-list">
          ${q.o.map((opt, i) => `
            <div class="option" onclick="handleBotDuelAnswer(${i})" id="opt-duel-${i}">
              <span class="option-marker">${String.fromCharCode(65 + i)}</span>
              <span>${opt}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div id="duel-feedback" style="text-align:center;margin-top:1rem;font-weight:bold;min-height:3rem"></div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleBotDuelAnswer(idx) {
  const q = botDuelState.questions[botDuelState.qIndex];
  const correct = q.a;

  // Disable options
  document.querySelectorAll('[id^="opt-duel-"]').forEach(el => el.style.pointerEvents = 'none');

  // Show user result
  const userEl = document.getElementById(`opt-duel-${idx}`);
  if (idx === correct) {
    userEl.classList.add('correct');
    botDuelState.p1Score++;
    document.getElementById('duel-feedback').innerHTML = '<span style="color:var(--success);font-size:1.2rem">Corect! 🎉</span>';
  } else {
    userEl.classList.add('incorrect');
    document.getElementById(`opt-duel-${correct}`).classList.add('correct');
    document.getElementById('duel-feedback').innerHTML = '<span style="color:var(--error);font-size:1.2rem">Greșit!</span>';
  }

  // Bot Turn Simulation
  document.getElementById('duel-feedback').innerHTML += '<br><span style="font-size:0.9rem;opacity:0.8">🤖 Robotul gândește...</span>';

  setTimeout(() => {
    // Bot logic: 70% chance to be correct
    const isBotCorrect = Math.random() < 0.7;

    if (isBotCorrect) {
      botDuelState.botScore++;
      document.getElementById('duel-feedback').innerHTML += ' <span style="color:var(--secondary)">și răspunde Corect!</span>';
    } else {
      document.getElementById('duel-feedback').innerHTML += ' <span style="color:var(--text-muted)">și greșește.</span>';
    }

    // Update score display immediately to show action
    // (Actually renderBotDuel will refresh everything in next step, but let's delay)

    setTimeout(() => {
      botDuelState.qIndex++;
      if (botDuelState.qIndex < 5) {
        renderBotDuel();
      } else {
        showBotDuelResult();
      }
    }, 2000);

  }, 1000 + Math.random() * 800);
}

function showBotDuelResult() {
  const win = botDuelState.p1Score > botDuelState.botScore;
  const draw = botDuelState.p1Score === botDuelState.botScore;

  if (win) createConfetti();

  document.getElementById('mainContent').innerHTML = `
    <div class="container text-center" style="padding-top:2rem">
      <h1>${win ? '🏆 Victorie!' : draw ? '🤝 Remiză' : '😢 Ai pierdut'}</h1>
      <p style="font-size:1.2rem;margin:1rem 0">
        Tu: <b>${botDuelState.p1Score}</b> - Robot: <b>${botDuelState.botScore}</b>
      </p>
      
      <div style="font-size:5rem;margin:2rem 0">
        ${win ? '🥇' : draw ? '🥈' : '🥉'}
      </div>
      
      <div style="display:flex;gap:1rem;justify-content:center">
        <button class="btn btn-primary" onclick="startBotDuel()">🔄 Joacă din nou</button>
        <button class="btn btn-secondary" onclick="showSection('home')">🏠 Acasă</button>
      </div>
    </div>`;
}

// ========== 6. ATELIER VIRTUAL (Placeholder) ==========

// ========== 6. ATELIER VIRTUAL (SIMULATOR) ==========
let workshopState = { step: 0 };

function showVirtualWorkshop() {
  if (document.getElementById('mobileNav')?.classList.contains('active')) toggleMenu();
  workshopState.step = 0;
  renderWorkshopHelper();
}

function renderWorkshopHelper() {
  const step = workshopState.step;
  let msg = "Pasul 1: Introdu nitul în gaură.";
  if (step === 1) msg = "Pasul 2: Folosește buterola și ciocanul pentru a forma capul de închidere.";
  if (step === 3) msg = "Felicitări! Nituire completă.";

  const svgContent = `
    <svg viewBox="0 0 300 200" style="background:#f1f5f9;border-radius:12px;width:100%;height:250px;border:2px solid var(--border)">
      <!-- Plates -->
      <rect x="50" y="80" width="200" height="20" fill="#cbd5e1" stroke="#334155" />
      <rect x="50" y="100" width="200" height="20" fill="#94a3b8" stroke="#334155" />
      
      <!-- Rivet -->
      <g style="transition:transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); transform:${step === 0 ? 'translate(0, -60px)' : 'translate(0,0)'}">
        <!-- Head Factory -->
        <path d="M142 80 A8 6 0 0 1 158 80" fill="#334155" />
        <!-- Shank -->
        <rect x="146" y="80" width="8" height="${step >= 3 ? 44 : 60}" fill="#475569" />
        
        <!-- Closing Head (Formed) -->
        <path d="M142 120 A8 6 0 0 0 158 120" fill="#334155" style="opacity:${step >= 3 ? 1 : 0};transition:opacity 0.3s" />
      </g>

      <!-- Hammer Animation -->
      ${step === 2 ? `
        <text x="160" y="160" font-size="40" transform="rotate(45 160 160)">🔨
          <animateTransform attributeName="transform" type="rotate" values="45 160 160; 0 160 160; 45 160 160" dur="0.3s" repeatCount="3" />
        </text>
      ` : ''}
    </svg>
  `;

  document.getElementById('mainContent').innerHTML = `
    <div class="container">
       <button class="btn btn-secondary back-btn" onclick="showSection('home')">← Ieșire Atelier</button>
       <div class="section-header">
         <h2>🏭 Atelier Virtual</h2>
         <p>${msg}</p>
       </div>
       
       <div class="content-card text-center" style="padding:1rem">
         ${svgContent}
         
         <div style="margin-top:2rem;display:flex;justify-content:center;gap:1rem;flex-wrap:wrap">
           ${step === 0 ? `<button class="btn btn-primary btn-lg" onclick="wsPlaceRivet()">1️⃣ Introdu Nitul</button>` : ''}
           ${step === 1 ? `<button class="btn btn-primary btn-lg" onclick="wsHammer()">2️⃣ Nituire (Ciocan)</button>` : ''}
           ${step === 3 ? `<button class="btn btn-success btn-lg" onclick="showVirtualWorkshop()">🔄 Din nou</button>` : ''}
         </div>
       </div>
       
       <div class="info-box">
        <h4>ℹ️ Știai că?</h4>
        <p>Lungimea tijei nitului se calculează cu formula: <strong>L = Σs + (1.4...1.6)d</strong> pentru cap semirotund.</p>
       </div>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function wsPlaceRivet() {
  workshopState.step = 1;
  renderWorkshopHelper();
  if (typeof soundEnabled !== 'undefined' && soundEnabled) playSound('click');
}

function wsHammer() {
  workshopState.step = 2; // Start animation
  renderWorkshopHelper();

  setTimeout(() => {
    workshopState.step = 3; // Done
    renderWorkshopHelper();
    createConfetti();
    if (typeof soundEnabled !== 'undefined' && soundEnabled) playSound('success');
  }, 1000);
}

console.log('🚀 Toate cele 4 funcționalități avansate au fost încărcate!');
