module.exports = (err, req, res, next) => {
  res.status(500).send(`Erro 500: ${err.message}`)
}
