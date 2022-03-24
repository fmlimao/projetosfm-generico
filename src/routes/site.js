const express = require('express')

const router = express.Router()

const authMiddleware = (req, res, next) => {
  const login = req.cookies.login || null
  res.locals.login = login

  next()
}

router.get('/', authMiddleware, (req, res) => {
  res.render('home', {
    title: 'Sistema Generico',
    login: res.locals.login
  })
})

// router.use(require('../middlewares/site/error-404'))
// router.use(require('../middlewares/site/error-500'))

module.exports = router
