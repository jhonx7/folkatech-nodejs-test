const router = require('express').Router();
const isAuth = require('../middlewares/isAuth');
const cacheMiddleware = require('../middlewares/redisCache');

const UserController = require('../controllers/UserController');
const AuthController = require('../controllers/AuthController');

//Route Home
router.get('/', function (_, res) {
    return res.status(200).json({
        message: "Technical Test Folkatech"
    });
});

//Route Token
router.get('/token', AuthController.generateToken);

//Route User
router.get('/users', isAuth, cacheMiddleware, UserController.index);
router.post('/user', isAuth, UserController.create);
router.get('/user', isAuth, cacheMiddleware, UserController.read);
router.patch('/user/:id', isAuth, UserController.update);
router.delete('/user/:id', isAuth, UserController.delete);

module.exports = router;
