mixins.push({
  data: {
    tenants: {
      loading: false,
      loaded: false,
      list: []
    }
  },
  methods: {
    init: () => {
      App.getTenants()
    },
    getTenants: async () => {
      App.tenants.loading = true

      try {
        const response = await axios.get('/api/tenants')

        App.tenants.list = []
        for (const row of response.data.content.data) {
          App.tenants.list.push(row.tenant)
        }
      } catch (error) {
        console.log('error', error)
        App.tenants.list = []
      }

      App.tenants.loading = false
      App.tenants.loaded = true
    },
    removeTenant: async (tenant) => {
      if (confirm(`Deseja realmente remover o inquilino ${tenant.name}?`)) {
        try {
          const response = await axios.delete(`/api/tenants/${tenant.id}`)
          App.getTenants()
          App.notify('Inquilino removido com sucesso!', 'success')
        } catch (error) {
          console.log('error', error)
          alert(error.response.data.messages.join('<br>'))
        }
      }
    }
  }
})
