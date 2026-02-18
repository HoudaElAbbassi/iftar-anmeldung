const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  // Nur POST erlauben
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
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

  // Supabase-Client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { error } = await supabase.from('anmeldungen').insert({
    vorname: vorname.trim(),
    nachname: nachname.trim(),
    uebernachtung,
    essen_praeferenzen: JSON.stringify(essenArray),
    buffet_beitrag: buffet_beitrag.trim()
  });

  if (error) {
    console.error('Supabase Fehler:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, errors: ['Serverfehler. Bitte versuche es erneut.'] })
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, message: 'Anmeldung erfolgreich gespeichert!' })
  };
};
