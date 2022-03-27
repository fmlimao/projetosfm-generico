const TenantsRepository = require('../repositories/tenants')

module.exports = async (req, res, next) => {
  let ret = req.ret()

  try {
    const { uuid } = req.params
    const tenant = (await TenantsRepository.findOneById(null, uuid)).content.data

    if (!tenant) {
      ret.setCode(404)
      throw new Error('Inquilino não encontrado.')
    }

    req.tenant = tenant

    next()
  } catch (error) {
    ret = res.errorHandler(error, ret)
    res.status(ret.getCode()).json(ret.generate())
  }
}
