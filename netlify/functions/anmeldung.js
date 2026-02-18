const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  // Nur POST erlauben
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, errors: ['Methode nicht erlaubt.'] })
    };
  }

  // Body parsen
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, errors: ['Ungültige Anfrage.'] })
    };
  }

  const { vorname, nachname, uebernachtung, essen, essen_sonstiges, buffet_beitrag } = body;

  // Validierung
  const errors = [];
  if (!vorname || vorname.trim() === '') errors.push('Vorname ist erforderlich.');
  if (!nachname || nachname.trim() === '') errors.push('Nachname ist erforderlich.');
  if (!uebernachtung || !['ja', 'nein'].includes(uebernachtung)) errors.push('Bitte wähle aus, ob du übernachtest.');
  if (!buffet_beitrag || buffet_beitrag.trim() === '') errors.push('Bitte trag ein, was du zum Buffet mitbringst.');

  if (errors.length > 0) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, errors })
    };
  }

  // Essens-Präferenzen zusammenbauen
  const essenArray = Array.isArray(essen) ? essen : (essen ? [essen] : []);
  if (essen_sonstiges && essen_sonstiges.trim() !== '') {
    essenArray.push(essen_sonstiges.trim());
  }

  // Neon-Client
  const sql = neon(process.env.DATABASE_URL);

  try {
    await sql`
      INSERT INTO anmeldungen (vorname, nachname, uebernachtung, essen_praeferenzen, buffet_beitrag)
      VALUES (
        ${vorname.trim()},
        ${nachname.trim()},
        ${uebernachtung},
        ${JSON.stringify(essenArray)},
        ${buffet_beitrag.trim()}
      )
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Anmeldung erfolgreich gespeichert!' })
    };
  } catch (err) {
    console.error('Neon Fehler:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, errors: ['Serverfehler. Bitte versuche es erneut.'] })
    };
  }
};
