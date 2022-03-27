module.exports = (req, res, next) => {
  if (res.locals.login) {
    return res.redirect('/app')
  }

  next()
}
