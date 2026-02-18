const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

router.post('/', (req, res) => {
  const { vorname, nachname, uebernachtung, essen, essen_sonstiges, buffet_beitrag } = req.body;

  // Validierung
  const errors = [];
  if (!vorname || vorname.trim() === '') errors.push('Vorname ist erforderlich.');
  if (!nachname || nachname.trim() === '') errors.push('Nachname ist erforderlich.');
  if (!uebernachtung || !['ja', 'nein'].includes(uebernachtung)) errors.push('Bitte wähle aus, ob du übernachtest.');
  if (!buffet_beitrag || buffet_beitrag.trim() === '') errors.push('Bitte trag ein, was du zum Buffet mitbringst.');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Essens-Präferenzen zusammenbauen
  const essenArray = Array.isArray(essen) ? essen : (essen ? [essen] : []);
  if (essen_sonstiges && essen_sonstiges.trim() !== '') {
    essenArray.push(essen_sonstiges.trim());
  }
  const essenJSON = JSON.stringify(essenArray);

  try {
    const stmt = db.prepare(`
      INSERT INTO anmeldungen (vorname, nachname, uebernachtung, essen_praeferenzen, buffet_beitrag)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(
      vorname.trim(),
      nachname.trim(),
      uebernachtung,
      essenJSON,
      buffet_beitrag.trim()
    );

    res.json({ success: true, message: 'Anmeldung erfolgreich gespeichert!' });
  } catch (err) {
    console.error('Datenbankfehler:', err);
    res.status(500).json({ success: false, errors: ['Serverfehler. Bitte versuche es erneut.'] });
  }
});

module.exports = router;
