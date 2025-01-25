function checkUsername(req, res, next) {
  const urlParts = req.url.split('/');
  const id = urlParts[urlParts.length - 1];

  if (req.user.id !== id) {
    return res.sendStatus(401);
  }
  next();
}

module.exports = checkUsername;