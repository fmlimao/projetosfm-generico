module.exports = (req, res) => {
  res.clearCookie('login')
  res.redirect('/app')
}
