const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const basicAuth = require('../middleware/auth');

router.get('/anmeldungen', basicAuth, (req, res) => {
  try {
    const anmeldungen = db.prepare('SELECT * FROM anmeldungen ORDER BY erstellt_am DESC').all();
    res.json({ success: true, data: anmeldungen });
  } catch (err) {
    console.error('Datenbankfehler:', err);
    res.status(500).json({ success: false, error: 'Serverfehler' });
  }
});

module.exports = router;
