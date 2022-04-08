const TenantUsersRepository = require('../../../repositories/tenant-users')

module.exports = async (req, res) => {
  let ret = req.ret()

  try {
    const { uuid } = req.params
    const users = await TenantUsersRepository.findAll(null, uuid, {
      filter: req.query || {}
    })

    ret.addContent('meta', users.content.meta)
    ret.addContent('data', users.content.data)

    res.status(ret.getCode()).json(ret.generate())
  } catch (error) {
    ret = res.errorHandler(error, ret)
    res.status(ret.getCode()).json(ret.generate())
  }
}
