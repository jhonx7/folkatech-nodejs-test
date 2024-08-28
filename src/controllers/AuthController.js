
const jwt = require('jsonwebtoken');

class AuthController {

  async generateToken(req, res) {
    try {
      const token = jwt.sign({
        createdAt: new Date()
      }, process.env.JWT_KEY);

      return res.status(200).json({
        message: 'Success Get Token',
        data: { token }
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        message: 'Server error'
      })
    }

  }
}

module.exports = new AuthController;