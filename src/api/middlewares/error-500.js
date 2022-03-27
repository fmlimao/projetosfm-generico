module.exports = (err, req, res, next) => {
  res.status(500).send(`API - Erro 500: ${err.message}`)
}
