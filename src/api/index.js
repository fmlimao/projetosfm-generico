const express = require('express')

const router = express.Router()

const getAuthMiddleware = require('./middlewares/get-auth')
const verifyAuthMiddleware = require('./middlewares/verify-auth')
const getTenant = require('./middlewares/get-tenant')

router.use(require('./middlewares/json-return'))

router.use(getAuthMiddleware)

router.get('/', verifyAuthMiddleware, require('./controllers/home/get'))

router.get('/tenants', verifyAuthMiddleware, require('./controllers/tenants/list'))
router.post('/tenants', verifyAuthMiddleware, require('./controllers/tenants/store'))
router.get('/tenants/:uuid', verifyAuthMiddleware, getTenant, require('./controllers/tenants/show'))
router.put('/tenants/:uuid', verifyAuthMiddleware, getTenant, require('./controllers/tenants/update'))
router.put('/tenants/:uuid/active/:active', verifyAuthMiddleware, getTenant, require('./controllers/tenants/update-active'))
router.put('/tenants/:uuid/locked/:locked', verifyAuthMiddleware, getTenant, require('./controllers/tenants/update-locked'))
router.delete('/tenants/:uuid', verifyAuthMiddleware, getTenant, require('./controllers/tenants/remove'))

router.use(require('./middlewares/error-404'))
router.use(require('./middlewares/error-500'))

module.exports = router
