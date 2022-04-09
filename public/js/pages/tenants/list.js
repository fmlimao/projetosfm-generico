mixins.push({
  data: {
    tenants: {
      loading: false,
      loaded: false,
      list: [],
      meta: {}
    },
    tenantRemove: {
      loading: false,
      data: {}
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
      } else {
        options.orderByColumn = App.tenants.meta.orderBy.column
        options.orderByDir = App.tenants.meta.orderBy.dir
      }

      App.getTenants(options)
    },

    openRemoveTenant: (tenant) => {
      App.tenantRemove.data = tenant

      $('#modalTenantRemove').modal().on('shown.bs.modal', () => {
        $('#btnTenantRemove').focus()
      })
    },

    removeTenant: async () => {
      App.tenantRemove.loading = true

      try {
        await axios.delete(`/api/tenants/${App.tenantRemove.data.tenantId}`)
        App.filterTenants()
        App.notify('Inquilino removido com sucesso!', 'success')
        App.tenantRemove.loading = false
        $('#modalTenantRemove').modal('hide')
      } catch (error) {
        if (
          typeof error.response === 'object' &&
          typeof error.response.data === 'object'
          && error.response.data.messages !== undefined
        ) {
          const response = error.response.data
          App.notify(response.messages.join('<br>'), 'danger')
        } else {
          console.error(error)
          App.notify('Ocorreu um erro interno. Por favor, tente novamente.', 'danger')
        }

        App.tenantRemove.loading = false
      }
    }
  }
})
