// const moment = require('moment')

function sanitizeArrayFilter (filter, options = {}) {
  filter = String(filter || '')

  const helpers = options.helpers || []
  const list = options.list || []

  filter = filter
    .split(',')
    .map(item => {
      item = item.trim()

      for (const helper of helpers) item = helper(item)

      return item
    })
    .filter(item => item !== null && item !== '')

  if (list.length) filter = filter.filter(item => list.includes(item))

  return filter
}

function filterUuid (filter, criterias, values) {
  if (filter.id !== undefined) {
    const ids = sanitizeArrayFilter(filter.id, {
      helpers: [item => String(item).trim()]
    })

    if (ids.length) {
      criterias.push('t.uuid IN (:uuid)')
      values.uuid = ids
    }
  }
}

function filterName (filter, criterias, values) {
  if (filter.name !== undefined) {
    criterias.push('t.name LIKE :name')
    values.name = `%${filter.name}%`
  }
}

function filterActive (filter, criterias, values) {
  if (filter.active !== undefined) {
    const sanitizedValues = sanitizeArrayFilter(filter.active, {
      helpers: [item => Number(item)]
    })

    if (sanitizedValues.length) {
      criterias.push('t.active IN (:active)')
      values.active = sanitizedValues
    }
  }
}

function filterLocked (filter, criterias, values) {
  if (filter.locked !== undefined) {
    const sanitizedValues = sanitizeArrayFilter(filter.locked, {
      helpers: [item => Number(item)]
    })

    if (sanitizedValues.length) {
      criterias.push('t.locked IN (:locked)')
      values.locked = sanitizedValues
    }
  }
}

function filterCreatedAt (filter, criterias, values) {
  // if (filter.initialCreatedAt === undefined || filter.finalCreatedAt === undefined) {
  //   filter.initialCreatedAt = moment().subtract(30, 'days').format('YYYY-MM-DD')
  //   filter.finalCreatedAt = moment().format('YYYY-MM-DD')
  // }

  // Filtro de Data de Abertura Inicial
  if (filter.initialCreatedAt !== undefined) {
    criterias.push('DATE(t.created_at) >= :initialCreatedAt')
    values.initialCreatedAt = filter.initialCreatedAt
  }

  // Filtro de Data de Abertura Final
  if (filter.finalCreatedAt !== undefined) {
    criterias.push('DATE(t.created_at) <= :finalCreatedAt')
    values.finalCreatedAt = filter.finalCreatedAt
  }
}

function filterSearch (search, criterias, values) {
  if (search.length) {
    criterias.push(`(
      t.uuid LIKE :search
      OR t.name LIKE :search
      OR t.active LIKE :search
      OR t.locked LIKE :search
      OR t.created_at LIKE :search
    )`)
    values.search = `%${search}%`
  }
}

function orderByColumn (column = null, columns = {}, defaultColumn) {
  if (typeof columns[column] !== 'undefined') {
    return columns[column]
  }

  return defaultColumn
}

function orderByDir (dir = null) {
  if (dir) {
    if (![
      'ASC',
      'DESC'
    ].includes(dir.toUpperCase())) {
      dir = 'ASC'
    }
  } else {
    dir = 'ASC'
  }

  return dir
}

module.exports = {
  filterUuid,
  filterName,
  filterActive,
  filterLocked,
  filterCreatedAt,
  filterSearch,
  orderByColumn,
  orderByDir
}
