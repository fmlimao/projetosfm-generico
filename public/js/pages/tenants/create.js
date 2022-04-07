mixins.push({
  data: {
    tenant: {
      error: true,
      messages: [],

      loading: false,

      fields: {
        name: {
          value: '',
          error: false,
          messages: []
        }
      }
    }
  },
  methods: {
    addTenant: async () => {
      App.tenant.loading = true
      App.tenant.error = false
      App.tenant.messages = []

      App.tenant.fields.name.value = App.tenant.fields.name.value.trim()
      App.tenant.fields.name.error = false
      App.tenant.fields.name.messages = []

      try {
        const response = (await axios.post('/api/tenants', {
          name: App.tenant.fields.name.value
        })).data.content.data

        App.tenant.messages = [
          'Inquilino adicionado com sucesso!'
        ]

        setTimeout(() => {
          window.location.replace(`/app/tenants/${response.id}`)
        }, 2000)
      } catch (error) {
        const response = error.response.data

        App.tenant.error = true
        App.tenant.messages = response.messages

        for (const field in response.form) {
          App.tenant.fields[field].error = true
          App.tenant.fields[field].messages = response.form[field].messages
        }
      }

      App.tenant.loading = false
    }
  }
})