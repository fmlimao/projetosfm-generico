const express = require('express')

const router = express.Router()

const getAuthMiddleware = require('./middlewares/get-auth')
const verifyAuthMiddleware = require('./middlewares/verify-auth')
const getTenant = require('./middlewares/get-tenant')

router.use(require('./middlewares/json-return'))

router.use(getAuthMiddleware)

router.get('/', verifyAuthMiddleware, require('./controllers/home/get'))

// Inquilinos
router.get('/tenants', verifyAuthMiddleware, require('./controllers/tenants/list'))
router.post('/tenants', verifyAuthMiddleware, require('./controllers/tenants/store'))
router.get('/tenants/:tenantId', verifyAuthMiddleware, getTenant, require('./controllers/tenants/show'))
router.put('/tenants/:tenantId', verifyAuthMiddleware, getTenant, require('./controllers/tenants/update'))
router.delete('/tenants/:tenantId', verifyAuthMiddleware, getTenant, require('./controllers/tenants/remove'))

// Inquilino - Usuários
router.get('/tenants/:tenantId/users', verifyAuthMiddleware, getTenant, require('./controllers/tenants/users/list'))

router.use(require('./middlewares/error-404'))
router.use(require('./middlewares/error-500'))

module.exports = router
