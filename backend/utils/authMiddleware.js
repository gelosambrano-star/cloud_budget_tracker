const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  // Look for the token inside the incoming request Authorization Header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token string from 'Bearer <TOKEN_HERE>'
      token = req.headers.authorization.split(' ')[1];

      // Decode the token using your secret key phrase
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the authenticated user's ID directly to the request object
      req.user = decoded.id;

      next(); // Pass control to the next operational endpoint function
    } catch (error) {
      res.status(401).json({ error: 'Not authorized, security token failed validation' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, missing tracking validation token' });
  }
};

module.exports = { protect };
