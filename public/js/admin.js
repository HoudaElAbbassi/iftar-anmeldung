'use strict';

let allAnmeldungen = [];
let authHeader = '';

// === Login ===
function adminLogin() {
  const user = document.getElementById('adminUser').value;
  const pass = document.getElementById('adminPass').value;

  if (!user || !pass) {
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('loginError').textContent = 'Bitte Benutzername und Passwort eingeben.';
    return;
  }

  authHeader = 'Basic ' + btoa(user + ':' + pass);
  loadAnmeldungen();
}

// Enter-Taste im Login-Formular
document.getElementById('adminPass').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') adminLogin();
});
document.getElementById('adminUser').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') adminLogin();
});

function adminLogout() {
  authHeader = '';
  allAnmeldungen = [];
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminUser').value = '';
  document.getElementById('adminPass').value = '';
  document.getElementById('loginError').style.display = 'none';
}

// === Daten laden ===
async function loadAnmeldungen() {
  try {
    const res = await fetch('/api/admin/anmeldungen', {
      headers: { 'Authorization': authHeader }
    });

    if (res.status === 401) {
      document.getElementById('loginError').style.display = 'block';
      document.getElementById('loginError').textContent = 'Ungültige Anmeldedaten.';
      return;
    }

    const data = await res.json();
    if (!data.success) throw new Error('Serverfehler');

    allAnmeldungen = data.data;

    // Login erfolgreich → Dashboard zeigen
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    document.getElementById('loadingMsg').style.display = 'none';
    document.getElementById('anmeldungenTable').style.display = 'table';

    updateStats(allAnmeldungen);
    renderTable(allAnmeldungen);
  } catch (err) {
    document.getElementById('loadingMsg').textContent = 'Fehler beim Laden der Daten.';
  }
}

// === Statistiken ===
function updateStats(data) {
  document.getElementById('statTotal').textContent = data.length;
  document.getElementById('statUebernachtung').textContent = data.filter(d => d.uebernachtung === 'ja').length;
  document.getElementById('statOhneUeb').textContent = data.filter(d => d.uebernachtung === 'nein').length;
  document.getElementById('statEssen').textContent = data.filter(d => {
    const essen = parseEssen(d.essen_praeferenzen);
    return essen.length > 0;
  }).length;
}

// === Essens-JSON parsen ===
function parseEssen(essenJSON) {
  try {
    const arr = JSON.parse(essenJSON);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return essenJSON ? [essenJSON] : [];
  }
}

// === Tabelle rendern ===
function renderTable(data) {
  const tbody = document.getElementById('tableBody');
  const noDataMsg = document.getElementById('noDataMsg');

  tbody.innerHTML = '';

  if (data.length === 0) {
    noDataMsg.style.display = 'block';
    document.getElementById('anmeldungenTable').style.display = 'none';
    return;
  }

  noDataMsg.style.display = 'none';
  document.getElementById('anmeldungenTable').style.display = 'table';

  data.forEach((a, i) => {
    const essen = parseEssen(a.essen_praeferenzen);
    const datum = new Date(a.erstellt_am).toLocaleString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td><strong>${escapeHtml(a.vorname)} ${escapeHtml(a.nachname)}</strong></td>
      <td>
        <span class="badge ${a.uebernachtung === 'ja' ? 'badge-ja' : 'badge-nein'}">
          ${a.uebernachtung === 'ja' ? '🌙 Ja' : '🏠 Nein'}
        </span>
      </td>
      <td>
        ${essen.length > 0
          ? `<div class="essen-tags">${essen.map(e => `<span class="essen-tag">${escapeHtml(e)}</span>`).join('')}</div>`
          : '<span style="color:#aaa;font-style:italic;font-size:0.8rem">keine Angaben</span>'
        }
      </td>
      <td>${escapeHtml(a.buffet_beitrag)}</td>
      <td style="white-space:nowrap;color:#6B7A8D;font-size:0.8rem">${datum}</td>
    `;
    tbody.appendChild(tr);
  });
}

// === XSS-Schutz ===
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// === Filter ===
function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const uebFilter = document.getElementById('uebFilter').value;

  const filtered = allAnmeldungen.filter(a => {
    const name = (a.vorname + ' ' + a.nachname).toLowerCase();
    const matchesSearch = !search || name.includes(search);
    const matchesUeb = uebFilter === 'alle' || a.uebernachtung === uebFilter;
    return matchesSearch && matchesUeb;
  });

  renderTable(filtered);
}

// === CSV-Export ===
function exportCSV() {
  const headers = ['Nr.', 'Vorname', 'Nachname', 'Übernachtung', 'Essens-Angaben', 'Buffet-Beitrag', 'Datum'];

  const rows = allAnmeldungen.map((a, i) => {
    const essen = parseEssen(a.essen_praeferenzen).join(' | ');
    const datum = new Date(a.erstellt_am).toLocaleString('de-DE');
    return [
      i + 1,
      csvCell(a.vorname),
      csvCell(a.nachname),
      a.uebernachtung,
      csvCell(essen),
      csvCell(a.buffet_beitrag),
      csvCell(datum)
    ].join(';');
  });

  const csv = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `anmeldungen-raetselabend-${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(val) {
  if (!val) return '';
  const str = String(val);
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}
