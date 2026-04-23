# Iftar Anmeldung

Digitales Anmeldesystem für Iftar-Veranstaltungen mit Express.js-Backend, Datenbankverwaltung und Admin-Panel.

## Features

- Online-Anmeldeformular für Iftar-Gäste
- REST-API mit Express.js
- Persistente Datenspeicherung via PostgreSQL
- Admin-Oberfläche zur Teilnehmerverwaltung
- Serverlose Deployment-Konfiguration (Netlify)

## Tech Stack

| Layer | Technologie |
|-------|------------|
| Backend | Node.js, Express.js |
| Datenbank | PostgreSQL |
| Frontend | HTML, CSS, JavaScript |
| Deployment | Netlify |

## Installation

```bash
npm install
```

## Starten

```bash
node server.js
```

## API-Endpunkte

| Methode | Endpunkt | Beschreibung |
|---------|----------|-------------|
| POST | `/api/anmeldung` | Neue Anmeldung speichern |
| GET | `/api/admin` | Alle Anmeldungen abrufen |
