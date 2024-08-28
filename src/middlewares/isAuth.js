const jwt = require('jsonwebtoken')

const isAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    if (!token) {
      return res.status(401).send({
        success: 'false',
        message: 'Not authorized to access this resource',
      })
    }
    jwt.verify(token, process.env.JWT_KEY)

    next()
  } catch (error) {
    console.error(error);
    res.status(401).send({ error: 'Not authorized to access this resource' })
  }
}

module.exports = isAuth

