const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  // Nur GET erlauben
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
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
  const pass = passParts.join(':');

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

  // Neon-Client
  const sql = neon(process.env.DATABASE_URL);

  try {
    const rows = await sql`
      SELECT * FROM anmeldungen ORDER BY erstellt_am DESC
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, data: rows })
    };
  } catch (err) {
    console.error('Neon Fehler:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Serverfehler.' })
    };
  }
};
