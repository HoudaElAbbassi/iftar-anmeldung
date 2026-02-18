'use strict';

const form = document.getElementById('anmeldeForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const successOverlay = document.getElementById('successOverlay');
const successName = document.getElementById('successName');
const errorsSummary = document.getElementById('errorsSummary');
const errorsList = document.getElementById('errorsList');

// === Formular-Daten sammeln ===
function collectFormData() {
  const vorname = document.getElementById('vorname').value.trim();
  const nachname = document.getElementById('nachname').value.trim();

  const uebernachtungEl = document.querySelector('input[name="uebernachtung"]:checked');
  const uebernachtung = uebernachtungEl ? uebernachtungEl.value : null;

  const essenCheckboxen = Array.from(document.querySelectorAll('input[name="essen"]:checked'))
    .map(cb => cb.value);
  const essenSonstiges = document.getElementById('essen_sonstiges').value.trim();

  const buffetBeitrag = document.getElementById('buffet_beitrag').value.trim();

  return { vorname, nachname, uebernachtung, essen: essenCheckboxen, essen_sonstiges: essenSonstiges, buffet_beitrag: buffetBeitrag };
}

// === Validierung ===
function validateForm(data) {
  const errors = [];

  if (!data.vorname) errors.push({ field: 'vorname', message: 'Vorname ist erforderlich.' });
  if (!data.nachname) errors.push({ field: 'nachname', message: 'Nachname ist erforderlich.' });
  if (!data.uebernachtung) errors.push({ field: 'uebernachtung', message: 'Bitte wähle aus, ob du übernachtest.' });
  if (!data.buffet_beitrag) errors.push({ field: 'buffet', message: 'Bitte trag ein, was du zum Buffet mitbringst.' });

  return errors;
}

// === Fehler anzeigen ===
function showErrors(errors) {
  // Alle alten Fehler entfernen
  clearErrors();

  if (errors.length === 0) return;

  // Fehlerzusammenfassung
  errorsList.innerHTML = '';
  errors.forEach(err => {
    const li = document.createElement('li');
    li.textContent = err.message;
    errorsList.appendChild(li);
  });
  errorsSummary.classList.add('visible');

  // Felder markieren
  errors.forEach(err => {
    if (err.field === 'vorname') markFieldError('vorname', 'err-vorname', err.message);
    if (err.field === 'nachname') markFieldError('nachname', 'err-nachname', err.message);
    if (err.field === 'buffet') markFieldError('buffet_beitrag', 'err-buffet', err.message);
    if (err.field === 'uebernachtung') {
      const errEl = document.getElementById('err-uebernachtung');
      if (errEl) { errEl.textContent = '⚠ ' + err.message; errEl.hidden = false; }
    }
  });

  // Zum ersten Fehler scrollen
  errorsSummary.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function markFieldError(inputId, errId, message) {
  const input = document.getElementById(inputId);
  const errEl = document.getElementById(errId);
  if (input) input.classList.add('input-error');
  if (errEl) { errEl.textContent = '⚠ ' + message; errEl.hidden = false; }
}

function clearErrors() {
  errorsSummary.classList.remove('visible');
  errorsList.innerHTML = '';

  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  document.querySelectorAll('.error-message').forEach(el => {
    el.hidden = true;
    el.textContent = '';
  });
}

// Input-Fehler live entfernen beim Tippen
document.getElementById('vorname').addEventListener('input', () => {
  document.getElementById('vorname').classList.remove('input-error');
  document.getElementById('err-vorname').hidden = true;
});
document.getElementById('nachname').addEventListener('input', () => {
  document.getElementById('nachname').classList.remove('input-error');
  document.getElementById('err-nachname').hidden = true;
});
document.getElementById('buffet_beitrag').addEventListener('input', () => {
  document.getElementById('buffet_beitrag').classList.remove('input-error');
  document.getElementById('err-buffet').hidden = true;
});

// === Lade-Status ===
function showLoadingState() {
  submitBtn.disabled = true;
  btnText.textContent = '';
  const spinner = document.createElement('span');
  spinner.className = 'spinner';
  spinner.id = 'btnSpinner';
  submitBtn.appendChild(spinner);
}

function resetLoadingState() {
  submitBtn.disabled = false;
  btnText.textContent = 'Jetzt anmelden 🌙';
  const spinner = document.getElementById('btnSpinner');
  if (spinner) spinner.remove();
}

// === Success-Modal ===
function showSuccessModal(name) {
  successName.textContent = `Herzlich willkommen, ${name}! 🤍`;
  successOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';

  // Fokus auf Schließen-Button
  setTimeout(() => {
    document.getElementById('closeModalBtn').focus();
  }, 500);
}

function closeModal() {
  successOverlay.classList.remove('visible');
  document.body.style.overflow = '';
  form.reset();
  // Radio-Button zurücksetzen
  const neinRadio = document.getElementById('ueb-nein');
  if (neinRadio) neinRadio.checked = true;
  clearErrors();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Overlay-Klick schließt Modal
successOverlay.addEventListener('click', (e) => {
  if (e.target === successOverlay) closeModal();
});

// Escape-Taste schließt Modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && successOverlay.classList.contains('visible')) {
    closeModal();
  }
});

// === Formular absenden ===
async function submitForm(event) {
  event.preventDefault();
  clearErrors();

  const data = collectFormData();
  const errors = validateForm(data);

  if (errors.length > 0) {
    showErrors(errors);
    return;
  }

  showLoadingState();

  try {
    const response = await fetch('/api/anmeldung', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      showSuccessModal(data.vorname + ' ' + data.nachname);
    } else {
      const serverErrors = (result.errors || ['Ein Fehler ist aufgetreten.']).map(msg => ({
        field: null,
        message: msg
      }));
      showErrors(serverErrors);
    }
  } catch (err) {
    showErrors([{ field: null, message: 'Verbindungsfehler. Bitte versuche es erneut.' }]);
  } finally {
    resetLoadingState();
  }
}

form.addEventListener('submit', submitForm);
