module.exports = (err, req, res, next) => {
  res.status(500).send(`APP - Erro 500: ${err.message}`)
}
