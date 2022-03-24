const express = require('express')

const router = express.Router()

const noAuthMiddleware = (req, res, next) => {
  const login = req.cookies.login || null

  if (login) {
    return res.redirect('/app')
  }

  next()
}

const authMiddleware = (req, res, next) => {
  const login = req.cookies.login || null

  if (!login) {
    return res.redirect('/app/login')
  }

  next()
}

router.get('/login', noAuthMiddleware, (req, res) => {
  res.render('app/login')
})

router.post('/login', noAuthMiddleware, (req, res) => {
  res.cookie('login', {
    id: 123456,
    name: 'Usuário Genérico'
  })

  res.redirect('/app')
})

router.get('/logout', authMiddleware, (req, res) => {
  res.clearCookie('login')
  res.redirect('/app')
})

router.get('/', authMiddleware, (req, res) => {
  res.send('APP - Home')
})

router.get('/dashboard', authMiddleware, (req, res) => {
  res.send('APP - Dashboard')
})

router.use(require('../middlewares/app/error-404'))
router.use(require('../middlewares/app/error-500'))

module.exports = router
