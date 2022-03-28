const db = require('../../commons/database/conn')
const filters = require('../filters/tenants')
const generateOptions = require('../../commons/helpers/generate-options')
const JsonReturn = require('fm-json-response')
const keysGenerator = require('../../commons/helpers/key-generator')
const validator = require('fm-validator')

const orderColumns = {
  id: 'uuid',
  name: 'name',
  createdAt: 'created_at'
}

const viewColumns = {
  uuid: 'id',
  name: 'name',
  active: 'active',
  locked: 'locked',
  created_at: 'createdAt',
  altered_at: 'alteredAt'
}

module.exports = class TenantsRepository {
  static async findAll ({ filter = {} } = {}) {
    return new Promise(resolve => {
      // Essa promise serve para recuperar os filtros da busca

      const queryOptions = generateOptions(filter)

      const whereCriteria = []
      const whereValues = {}

      filters.filterUuid(filter, whereCriteria, whereValues)
      filters.filterName(filter, whereCriteria, whereValues)
      filters.filterActive(filter, whereCriteria, whereValues)
      filters.filterLocked(filter, whereCriteria, whereValues)
      filters.filterCreatedAt(filter, whereCriteria, whereValues)
      filters.filterSearch(queryOptions.search, whereCriteria, whereValues)

      queryOptions.orderByColumn = filters.orderByColumn(queryOptions.orderByColumn, orderColumns, 'uuid')

      queryOptions.orderByDir = filters.orderByDir(queryOptions.orderByDir)

      const next = {
        queryOptions,
        whereCriteria,
        whereValues
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
          SELECT
            t.uuid,
            t.name,
            t.active,
            t.locked,
            t.created_at,
            t.altered_at
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

        next.data = next.data.map(item => {
          const newItem = {}

          for (const i in item) {
            if (typeof viewColumns[i] !== 'undefined') {
              newItem[viewColumns[i]] = item[i]
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
        const field = id ? 't.tenant_id' : (uuid ? 'uuid' : null)
        const value = id || uuid

        if (!field) {
          return reject(new Error('Busca inválida.'))
        }

        const data = await db.getOne(`
          SELECT
            t.uuid,
            t.name,
            t.active,
            t.locked,
            t.created_at,
            t.altered_at
          FROM tenants t
          WHERE t.deleted_at IS NULL
          AND ${field} = ?;
        `, [
          value
        ])

        resolve(data)
      })()
    })
      .then(data => {
        // Essa promise formata os dados ou renomeia as colunas

        const newItem = {}

        for (const i in data) {
          if (typeof viewColumns[i] !== 'undefined') {
            newItem[viewColumns[i]] = data[i]
          }
        }

        return newItem
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
        next.fields.uuid = keysGenerator.generateRandomObjectID()

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
        const { locked } = fields

        if (locked === undefined && findRet.content.data.locked) {
          const ret = new JsonReturn()

          ret.setError(true)
          ret.setCode(400)
          ret.addMessage('Esse registro não pode ser alterado.')

          throw ret
        }

        return findRet
      })
      .then(async findRet => {
        const data = findRet.content.data

        const ret = new JsonReturn()

        const { name, active, locked } = fields

        if (name !== undefined) {
          ret.addField('name')
        }

        if (active !== undefined) {
          ret.addField('active')
        }

        if (locked !== undefined) {
          ret.addField('locked')
        }

        if (!validator(ret, {
          name,
          active,
          locked
        }, {
          name: 'string|min:3|max:255',
          active: 'integer|between:0,1',
          locked: 'integer|between:0,1'
        })) {
          ret.setError(true)
          ret.setCode(400)
          ret.addMessage('Verifique todos os campos.')
          throw ret
        }

        const next = {
          fields: {
            name,
            active,
            locked
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
            next.data.id
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
        if (typeof next.fields.active !== 'undefined') next.data.active = Number(next.fields.active)
        if (typeof next.fields.locked !== 'undefined') next.data.locked = Number(next.fields.locked)

        return next
      })
      .then(async next => {
        await db.update(`
          UPDATE tenants
          SET name = ?,
          active = ?,
          locked = ?
          WHERE uuid = ?;
        `, [
          next.data.name,
          next.data.active,
          next.data.locked,
          next.data.id
        ])

        return this.findOneById(null, next.data.id)
      })
  }

  static delete (id = null, uuid = null) {
    return this.findOneById(id, uuid)
      .then(async findRet => {
        // Verifica se o registro pode ser editado
        const data = await db.getOne(`
          SELECT tenant_id, locked
          FROM tenants
          WHERE deleted_at IS NULL
          AND uuid = ?;
        `, [
          findRet.content.data.uuid
        ])

        if (data.locked) {
          const ret = new JsonReturn()

          ret.setError(true)
          ret.setCode(400)
          ret.addMessage('Esse registro não pode ser alterado.')

          throw ret
        }

        return findRet
      })
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
