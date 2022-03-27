const express = require('express')

const router = express.Router()

const verifyAuthMiddleware = require('./middlewares/verify-auth')

router.use(verifyAuthMiddleware)

router.get('/', require('./controllers/home/get'))

router.use(require('./middlewares/error-404'))
router.use(require('./middlewares/error-500'))

module.exports = router
