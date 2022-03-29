module.exports = async (req, res) => {
  try {
    return res.render('app/tenants/update', {
      layout: 'app/layout',
      uuid: req.params.uuid
    })
  } catch (error) {
    return res.send(error)
  }
}
