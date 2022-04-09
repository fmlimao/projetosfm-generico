const db = require('../../commons/database/conn')
const filters = require('../filters/tenants')
const generateOptions = require('../../commons/helpers/generate-options')
// const makeObj = require('../../commons/helpers/make-obj')
const JsonReturn = require('fm-json-response')
const validator = require('fm-validator')

const orderColumns = {
  tenantId: 't.tenant_id',
  tenantName: 't.name',
  tenantActive: 't.active',
  tenantCreatedAt: 't.created_at',
  tenantAlteredAt: 't.altered_at'
}

const viewColumns = {
  tenantId: 'tenantId',
  tenantName: 'tenantName',
  tenantActive: 'tenantActive',
  tenantCreatedAt: 'tenantCreatedAt',
  tenantAlteredAt: 'tenantAlteredAt'
}

module.exports = class TenantsRepository {
  static async findAll ({ filter = {} } = {}) {
    return new Promise(resolve => {
      // Essa promise serve para recuperar os filtros da busca

      const queryOptions = generateOptions(filter)

      const whereCriteria = []
      const whereValues = {}

      filters.filterTenantId(filter, whereCriteria, whereValues)
      filters.filterTenantName(filter, whereCriteria, whereValues)
      filters.filterTenantActive(filter, whereCriteria, whereValues)
      filters.filterTenantCreatedAt(filter, whereCriteria, whereValues)
      filters.filterSearch(queryOptions.search, whereCriteria, whereValues)

      queryOptions.orderByColumn = filters.orderByColumn(queryOptions.orderByColumn, orderColumns, 't.name')

      const next = {
        queryOptions,
        whereCriteria,
        whereValues
      }

      resolve(next)
    })
      .then(async next => {
        // Essa promise recupera o total de registros (sem filtro)

        const query = `
          SELECT COUNT(t.tenant_id) AS total
          FROM tenants t
          WHERE t.deleted_at IS NULL;
        `

        next.totalCount = (await db.getOne(query)).total

        return next
      })
      .then(async next => {
        // Essa promise recupera o total de registros (com filtro)

        const values = Object.assign({}, next.whereValues)

        const query = `
          SELECT COUNT(t.tenant_id) AS total
          FROM tenants t
          WHERE t.deleted_at IS NULL
          ${next.whereCriteria.length ? ` AND (${next.whereCriteria.join(' AND ')})` : ''}
        `

        next.filteredCount = (await db.getOne(query, values)).total

        return next
      })
      .then(async next => {
        // Essa promise recupera os registros (com filtro)

        const values = Object.assign({}, next.whereValues)

        const query = `
          SELECT
            t.tenant_id AS tenantId,
            t.name AS tenantName,
            t.active AS tenantActive,
            t.created_at AS tenantCreatedAt,
            t.altered_at AS tenantAlteredAt
          FROM tenants t
          WHERE t.deleted_at IS NULL
          ${next.whereCriteria.length ? ` AND (${next.whereCriteria.join(' AND ')})` : ''}
          ORDER BY ${next.queryOptions.orderByColumn} ${next.queryOptions.orderByDir}
          ${next.queryOptions.limit ? next.queryOptions.limit : ''};
          ;
        `
        next.data = await db.getAll(query, values)

        return next
      })
      .then(next => {
        // Essa promise formata os dados ou renomeia as colunas

        next.data = next.data.map(item => {
          const newItem = {}

          for (const i in item) {
            if (typeof viewColumns[i] !== 'undefined') {
              newItem[viewColumns[i]] = item[i]
              // newItem = makeObj(newItem, viewColumns[i], item[i])
            }
          }

          return newItem
        })

        return next
      })
      .then(next => {
        // Essa promise retorna os dados no padrão do sistema

        const { start, length } = next.queryOptions
        const pages = Math.ceil(next.filteredCount / length)
        const currentPage = start / length + 1

        const columns = {}
        for (const i in orderColumns) {
          columns[orderColumns[i]] = i
        }

        const ret = new JsonReturn()

        const meta = {
          totalCount: next.totalCount,
          filteredCount: next.filteredCount,
          start,
          length,
          pages,
          currentPage,
          orderBy: {
            column: columns[next.queryOptions.orderByColumn],
            dir: next.queryOptions.orderByDir
          }
        }

        ret.addContent('meta', meta)
        ret.addContent('data', next.data)

        return ret.generate()
      })
  }

  static async findOneById (tenantId) {
    return new Promise((resolve, reject) => {
      // Essa promise recupera o registro

      (async () => {
        const data = await db.getOne(`
          SELECT
            t.tenant_id AS tenantId,
            t.name AS tenantName,
            t.active AS tenantActive,
            t.created_at AS tenantCreatedAt,
            t.altered_at AS tenantAlteredAt
          FROM tenants t
          WHERE t.deleted_at IS NULL
          AND t.tenant_id = ?;
        `, [
          tenantId
        ])

        resolve(data)
      })()
    })
      .then(data => {
        // Essa promise formata os dados ou renomeia as colunas

        if (!data) return data

        const newItem = {}

        for (const i in data) {
          if (typeof viewColumns[i] !== 'undefined') {
            newItem[viewColumns[i]] = data[i]
            // newItem = makeObj(newItem, viewColumns[i], data[i])
          }
        }

        return newItem
      })
      .then(data => {
        // Essa promise retorna os dados no padrão do sistema

        const ret = new JsonReturn()

        if (!data) {
          ret.setCode(404)
          ret.setError(true)
        }

        ret.addContent('data', data)

        return ret.generate()
      })
  }

  static async create (fields) {
    return new Promise((resolve, reject) => {
      const ret = new JsonReturn()

      ret.addFields(['name'])

      const { name } = fields

      if (!validator(ret, {
        name
      }, {
        name: 'required|string|min:3|max:255'
      })) {
        ret.setError(true)
        ret.setCode(400)
        ret.addMessage('Verifique todos os campos.')
        return reject(ret)
      }

      const next = {
        fields: {
          name
        },
        ret
      }

      resolve(next)
    })
      .then(async next => {
        const dataExists = await db.getOne(`
          SELECT tenant_id
          FROM tenants
          WHERE deleted_at IS NULL
          AND name = ?;
        `, [
          next.fields.name
        ])

        if (dataExists) {
          next.ret.setFieldError('name', true, 'Já existe um inquilino com este nome.')

          next.ret.setError(true)
          next.ret.setCode(400)
          next.ret.addMessage('Verifique todos os campos.')

          throw next.ret
        }

        return next
      })
      .then(async next => {
        next.fields.tenant_id = await db.uuid()

        await db.insert(`
          INSERT INTO tenants (tenant_id, name, created_at)
          VALUES (?, ?, NOW());
        `, [
          next.fields.tenant_id,
          next.fields.name
        ])

        return this.findOneById(next.fields.tenant_id)
      })
  }

  static async update (tenantId, fields) {
    return this.findOneById(tenantId)
      .then(async findRet => {
        const data = findRet.content.data

        const ret = new JsonReturn()

        const { name, active } = fields
        let fieldCount = 0
        const updateFields = {}
        const updateValidades = {}

        if (name !== undefined) {
          ret.addField('name')
          fieldCount++
          updateFields.name = name
          updateValidades.name = 'required|string|min:3|max:255'
        }

        if (active !== undefined) {
          ret.addField('active')
          fieldCount++
          updateFields.active = active
          updateValidades.active = 'required|integer|between:0,1'
        }

        if (!fieldCount) {
          ret.setError(true)
          ret.setCode(400)
          ret.addMessage('Nenhum campo foi informado.')
          throw ret
        }

        if (!validator(ret, updateFields, updateValidades)) {
          ret.setError(true)
          ret.setCode(400)
          ret.addMessage('Verifique todos os campos.')
          throw ret
        }

        const next = {
          fields: {
            name,
            active
          },
          data,
          ret
        }

        return next
      })
      .then(async next => {
        if (next.fields.name) {
          const dataExists = await db.getOne(`
              SELECT tenant_id
              FROM tenants
              WHERE deleted_at IS NULL
              AND name = ?
              AND tenant_id != ?;
            `, [
            next.fields.name,
            next.data.tenantId
          ])

          if (dataExists) {
            next.ret.setFieldError('name', true, 'Já existe um inquilino com este nome.')

            next.ret.setError(true)
            next.ret.setCode(400)
            next.ret.addMessage('Verifique todos os campos.')

            throw next.ret
          }
        }

        return next
      })
      .then(next => {
        if (typeof next.fields.name !== 'undefined') next.data.tenantName = next.fields.name
        if (typeof next.fields.active !== 'undefined') next.data.tenantActive = Number(next.fields.active)

        return next
      })
      .then(async next => {
        await db.update(`
          UPDATE tenants
          SET name = ?,
          active = ?,
          altered_at = NOW()
          WHERE tenant_id = ?;
        `, [
          next.data.tenantName,
          next.data.tenantActive,
          next.data.tenantId
        ])

        return this.findOneById(next.data.tenantId)
      })
  }

  static delete (tenantId) {
    return this.findOneById(tenantId)
      .then(async findRet => {
        await db.update(`
          UPDATE tenants
          SET deleted_at = NOW()
          WHERE tenant_id = ?;
        `, [
          findRet.content.data.tenantId
        ])
      })
  }
}
