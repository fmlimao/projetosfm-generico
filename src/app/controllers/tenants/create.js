module.exports = async (req, res) => {
  try {
    return res.render('app/tenants/create', {
      layout: 'app/layout'
    })
  } catch (error) {
    return res.send(error)
  }
}
