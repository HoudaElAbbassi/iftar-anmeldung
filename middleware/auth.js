const ADMIN_USER = 'admin';
const ADMIN_PASS = 'iftar2025';

function basicAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Admin-Bereich"');
    return res.status(401).json({ error: 'Authentifizierung erforderlich' });
  }

  const base64 = authHeader.slice(6);
  const decoded = Buffer.from(base64, 'base64').toString('utf-8');
  const [user, pass] = decoded.split(':');

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Admin-Bereich"');
  return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
}

module.exports = basicAuth;
