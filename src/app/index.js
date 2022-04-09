const express = require('express')

const router = express.Router()

const getAuthMiddleware = require('./middlewares/get-auth')
const verifyNoAuthMiddleware = require('./middlewares/verify-no-auth')
const verifyAuthMiddleware = require('./middlewares/verify-auth')

router.use((req, res, next) => {
  res.locals.title = 'Sistema Genérico'
  res.locals.version = '0.0.1'
  res.locals.url = req.url

  next()
})

router.use(getAuthMiddleware)

router.get('/login', verifyNoAuthMiddleware, require('./controllers/login/get'))
router.post('/login', verifyNoAuthMiddleware, require('./controllers/login/post'))
router.get('/logout', require('./controllers/logout/get'))

router.get('/', verifyAuthMiddleware, require('./controllers/home/get'))

// Inquilinos
router.get('/tenants', verifyAuthMiddleware, require('./controllers/tenants/list'))
router.get('/tenants/create', verifyAuthMiddleware, require('./controllers/tenants/create'))
router.get('/tenants/:uuid', verifyAuthMiddleware, require('./controllers/tenants/update'))

// Inquilinos - Usuários
// router.get('/tenants/users/:tenandId/create', verifyAuthMiddleware, require('./controllers/tenants/create'))

router.use(require('./middlewares/error-404'))
router.use(require('./middlewares/error-500'))

module.exports = router
