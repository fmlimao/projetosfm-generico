module.exports = (req, res, next) => {
  res.locals.login = req.cookies.login || null
  next()
}
