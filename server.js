const express = require('express');
const path = require('path');
const { initDB } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const anmeldungRoute = require('./routes/anmeldung');
const adminRoute = require('./routes/admin');

app.use('/api/anmeldung', anmeldungRoute);
app.use('/api/admin', adminRoute);

// Admin-Seite
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Catch-all → index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Datenbank initialisieren + Server starten
initDB();
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
  console.log(`Admin-Bereich: http://localhost:${PORT}/admin`);
});
