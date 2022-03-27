const express = require('express')

const router = express.Router()

const getAuthMiddleware = require('./middlewares/get-auth')
const verifyAuthMiddleware = require('./middlewares/verify-auth')

router.use(require('./middlewares/json-return'))

router.use(getAuthMiddleware)

router.get('/', verifyAuthMiddleware, require('./controllers/home/get'))
router.get('/tenants', verifyAuthMiddleware, require('./controllers/tenants/get'))

router.use(require('./middlewares/error-404'))
router.use(require('./middlewares/error-500'))

module.exports = router
