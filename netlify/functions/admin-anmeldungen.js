const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  // Nur GET erlauben
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: 'Methode nicht erlaubt.' })
    };
  }

  // Basic Auth prüfen
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  if (!authHeader.startsWith('Basic ')) {
    return {
      statusCode: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin-Bereich"',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ success: false, error: 'Authentifizierung erforderlich.' })
    };
  }

  const base64 = authHeader.slice(6);
  const decoded = Buffer.from(base64, 'base64').toString('utf-8');
  const [user, ...passParts] = decoded.split(':');
  const pass = passParts.join(':'); // Passwort kann Doppelpunkte enthalten

  const expectedUser = process.env.ADMIN_USER || 'admin';
  const expectedPass = process.env.ADMIN_PASS || 'iftar2025';

  if (user !== expectedUser || pass !== expectedPass) {
    return {
      statusCode: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin-Bereich"',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ success: false, error: 'Ungültige Anmeldedaten.' })
    };
  }

  // Supabase-Client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data, error } = await supabase
    .from('anmeldungen')
    .select('*')
    .order('erstellt_am', { ascending: false });

  if (error) {
    console.error('Supabase Fehler:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Serverfehler.' })
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, data })
  };
};
