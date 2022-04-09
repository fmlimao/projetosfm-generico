mixins.push({
  data: {
    tenants: {
      loading: false,
      loaded: false,
      list: [],
      meta: {}
    }
  },
  methods: {
    init: () => {
      App.getTenants()
    },

    getTenants: async (params = {}) => {
      App.tenants.loading = true

      try {
        const response = await axios.get('/api/tenants', { params })

        App.tenants.meta = response.data.content.meta

        App.tenants.list = []
        for (const row of response.data.content.data) {
          App.tenants.list.push(row)
          // break
        }
      } catch (error) {
        console.error(error)
        App.notify('Ocorreu um erro interno. Por favor, tente novamente.', 'danger')

        App.tenants.list = []
      }

      App.tenants.loading = false
      App.tenants.loaded = true
    },

    filterTenants: (page, column) => {
      if (!page) page = App.tenants.meta.currentPage
      if (!column) column = App.tenants.meta.orderBy.column

      const options = {
        start: (page - 1) * App.tenants.meta.length,
      }

      if (column) {
        let dir = 'ASC'
        if (column === App.tenants.meta.orderBy.column) {
          dir = App.tenants.meta.orderBy.dir === 'ASC' ? 'DESC' : 'ASC'
        }

        options.orderByColumn = column
        options.orderByDir = dir
      }

      /**/console.log('filterTenants()', options);

      App.getTenants(options)
    },

    removeTenant: async (tenant) => {
      if (confirm(`Deseja realmente remover o inquilino ${tenant.name}?`)) {
        try {
          await axios.delete(`a/api/tenants/${tenant.id}`)
          App.getTenants()
          App.notify('Inquilino removido com sucesso!', 'success')
        } catch (error) {
          const response = error.response.data

          if (typeof response === 'object' && response.messages !== undefined) {
            App.notify(response.messages.join('<br>'), 'danger')
          } else {
            console.error(error)
            App.notify('Ocorreu um erro interno. Por favor, tente novamente.', 'danger')
          }
        }
      }
    }
  }
})
