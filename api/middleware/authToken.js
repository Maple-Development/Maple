const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const token = req.headers['cookie']?.split(';').find(c => c.trim().startsWith('token=')).split('=')[1]
  
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      console.log(err + "ewfwfwf")
  
      if (err) return res.sendStatus(403)
  
      req.user = user
  
      next()
    })
  }

module.exports = authenticateToken