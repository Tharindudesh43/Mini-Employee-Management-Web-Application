function requireAuthApi(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
}

function requireAuthPage(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.redirect('/login.html');
}

module.exports = { requireAuthApi, requireAuthPage };
