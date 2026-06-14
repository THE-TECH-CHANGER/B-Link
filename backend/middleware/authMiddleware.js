const { getAuth } = require('firebase-admin/auth');

// We will initialize Firebase Admin in server.js, so this middleware just verifies the token
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[AUTH ERROR] Missing or invalid Authorization header:', authHeader);
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    req.user = decodedToken; // contains uid, phone_number, etc.
    next();
  } catch (error) {
    console.error('[AUTH ERROR] Verifying Firebase ID token:', error.message);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = verifyFirebaseToken;
