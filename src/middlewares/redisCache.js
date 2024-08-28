const redisClient = require('../utils/redisClient');

const cacheMiddleware = async (req, res, next) => {
  try {
    const cacheKey = req.originalUrl || req.url;
    const cachedResponse = await redisClient.get(cacheKey);
    if (cachedResponse) {
      return res.status(200).json({
        message: 'Success Get Data',
        data: JSON.parse(cachedResponse),
      })
    } else {
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server Error'
    })
  }

};

module.exports = cacheMiddleware;