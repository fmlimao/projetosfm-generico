const JsonReturn = require('fm-json-response')
const validator = require('fm-validator')
const db = require('../../commons/database/conn')
const generateOptions = require('../../commons/helpers/generate-options')
const { generateRandomObjectID } = require('../../commons/helpers/key-generator')
const {
  filterUuid,
  filterName,
  filterCreatedAt,
  filterSearch,
  orderByColumn,
  orderByDir
} = require('../filters/tenants')

module.exports = class TenantsRepository {
  static async findAll ({ filter = {} } = {}) {
    return new Promise(resolve => {
      // Essa promise serve para recuperar os filtros da busca

      const queryOptions = generateOptions(filter)

      const whereCriteria = []
      const whereValues = {}

      const columns = {
        id: 'uuid',
        name: 'name',
        createdAt: 'created_at'
      }

      filterUuid(filter, whereCriteria, whereValues)
      filterName(filter, whereCriteria, whereValues)
      filterCreatedAt(filter, whereCriteria, whereValues)
      filterSearch(queryOptions.search, whereCriteria, whereValues)

      queryOptions.orderByColumn = orderByColumn(queryOptions.orderByColumn, columns, 'uuid')

      queryOptions.orderByDir = orderByDir(queryOptions.orderByDir)

      const next = {
        queryOptions,
        whereCriteria,
        whereValues,
        columns
      }

      resolve(next)
    })
      .then(async next => {
        // Essa promise recupera o total de registros (sem filtro)

        next.totalCount = (await db.getOne(`
          SELECT COUNT(t.tenant_id) AS total
          FROM tenants t
          WHERE t.deleted_at IS NULL;
        `)).total

        return next
      })
      .then(async next => {
        // Essa promise recupera o total de registros (com filtro)

        const values = Object.assign({}, next.whereValues)

        next.filteredCount = (await db.getOne(`
          SELECT COUNT(t.tenant_id) AS total
          FROM tenants t
          WHERE t.deleted_at IS NULL
          ${next.whereCriteria.length ? ` AND (${next.whereCriteria.join(' AND ')})` : ''}
        `, values)).total

        return next
      })
      .then(async next => {
        // Essa promise recupera os registros (com filtro)

        const values = Object.assign({}, next.whereValues)

        next.data = await db.getAll(`
          SELECT t.uuid, name, created_at
          FROM tenants t
          WHERE t.deleted_at IS NULL
          ${next.whereCriteria.length ? ` AND (${next.whereCriteria.join(' AND ')})` : ''}
          ${next.queryOptions.limit ? next.queryOptions.limit : ''};
          ;
        `, values)

        return next
      })
      .then(next => {
        // Essa promise formata os dados ou renomeia as colunas

        const reversedColumns = {}

        for (const i in next.columns) {
          reversedColumns[next.columns[i]] = i
        }

        next.data = next.data.map(item => {
          const newItem = {}

          for (const i in item) {
            if (typeof reversedColumns[i] !== 'undefined') {
              newItem[reversedColumns[i]] = item[i]
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

        const ret = new JsonReturn()

        const meta = {
          totalCount: next.totalCount,
          filteredCount: next.filteredCount,
          start,
          length,
          pages,
          currentPage
        }

        ret.addContent('meta', meta)
        ret.addContent('data', next.data)

        return ret.generate()
      })
  }

  static async findOneById (id = null, uuid = null) {
    return new Promise((resolve, reject) => {
      // Essa promise recupera o registro

      (async () => {
        const field = id ? 'tenant_id' : (uuid ? 'uuid' : null)
        const value = id || uuid

        if (!field) {
          return reject(new Error('Busca inválida.'))
        }

        const data = await db.getOne(`
          SELECT uuid, name, created_at
          FROM tenants
          WHERE deleted_at IS NULL
          AND ${field} = ?;
        `, [
          value
        ])

        resolve(data)
      })()
    })
      .then(data => {
        // Essa promise retorna os dados no padrão do sistema

        const ret = new JsonReturn()

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
        next.fields.uuid = generateRandomObjectID()

        const id = await db.insert(`
          INSERT INTO tenants (uuid, name, created_at)
          VALUES (?, ?, NOW());
        `, [
          next.fields.uuid,
          next.fields.name
        ])

        return this.findOneById(id)
      })
  }

  static async update (id = null, uuid = null, fields) {
    return this.findOneById(id, uuid)
      .then(async findRet => {
        const data = findRet.content.data

        const ret = new JsonReturn()

        ret.addFields(['name'])

        const { name } = fields

        if (!validator(ret, {
          name
        }, {
          name: 'string|min:3|max:255'
        })) {
          ret.setError(true)
          ret.setCode(400)
          ret.addMessage('Verifique todos os campos.')
          throw ret
        }

        const next = {
          fields: {
            name
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
              AND uuid != ?;
          `, [
            next.fields.name,
            next.data.uuid
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
        if (typeof next.fields.name !== 'undefined') next.data.name = next.fields.name

        return next
      })
      .then(async next => {
        await db.update(`
          UPDATE tenants
          SET name = ?
          WHERE uuid = ?;
        `, [
          next.data.name,
          next.data.uuid
        ])

        return this.findOneById(null, next.data.uuid)
      })
  }

  static delete (id = null, uuid = null) {
    return this.findOneById(id, uuid)
      .then(async findRet => {
        await db.update(`
          UPDATE tenants
          SET deleted_at = NOW()
          WHERE uuid = ?;
        `, [
          findRet.content.data.uuid
        ])
      })
  }
}
