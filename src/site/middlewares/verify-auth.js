module.exports = (req, res, next) => {
  const login = req.cookies.login || null
  res.locals.login = login

  next()
}
