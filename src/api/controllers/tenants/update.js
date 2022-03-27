const TenantsRepository = require('../../repositories/tenants')

module.exports = async (req, res) => {
  let ret = req.ret()

  try {
    const { uuid } = req.params
    const { name } = req.body

    const tenant = await TenantsRepository.update(null, uuid, { name })

    ret.addContent('data', tenant.content.data)
    res.status(ret.getCode()).json(ret.generate())
  } catch (error) {
    ret = res.errorHandler(error, ret)
    res.status(ret.getCode()).json(ret.generate())
  }
}
