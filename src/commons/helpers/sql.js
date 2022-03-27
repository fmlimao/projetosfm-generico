class Sql {
  constructor (connection) {
    this.connection = connection
  }

  getAll (query, args = []) {
    return this.connection.raw(query, args)
      .then(data => data[0].map(row => {
        return JSON.parse(JSON.stringify(row))
      }))
  }

  getOne (query, args = []) {
    return this.getAll(query, args)
      .then(data => data[0] || false)
  }

  insert (query, args) {
    return this.connection.raw(query, args)
      .then(data => data[0].insertId)
  }

  update (query, args) {
    return this.connection.raw(query, args)
      .then(data => data[0].affectedRows)
  }
}

module.exports = Sql
