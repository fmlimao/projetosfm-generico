const moment = require('moment')
const db = require('../../../commons/database/conn')

module.exports = async (req, res) => {
  let ret = req.ret()

  try {
    const tenants = (await db.getAll(`
      SELECT tenant_id, name, created_at
      FROM tenants
      WHERE deleted_at IS NULL
      AND active = 1
      ORDER BY name;
    `)).map(tenant => {
      return {
        id: tenant.tenant_id,
        name: tenant.name,
        createdAt: moment(tenant.created_at).format('DD/MM/YYYY HH:mm:ss')
      }
    })

    ret.addContent('tenants', tenants)
    res.status(ret.getCode()).json(ret.generate())
  } catch (error) {
    ret = res.errorHandler(error, ret)
    res.status(ret.getCode()).json(ret.generate())
  }
}
