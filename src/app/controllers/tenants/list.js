module.exports = async (req, res) => {
  try {
    return res.render('app/tenants/list', {
      layout: 'app/layout',
      tenants: []
    })
  } catch (error) {
    return res.send(error)
  }
}
