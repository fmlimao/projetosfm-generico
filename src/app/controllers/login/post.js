module.exports = (req, res) => {
  res.cookie('login', {
    id: 123456,
    name: 'Usuário Genérico'
  })

  res.redirect('/app')
}
