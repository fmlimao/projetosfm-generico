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
    init: () => {
      // App.tenant.fields.name.value = 'Teste 13'
      // App.addTenant()
    },

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

        // App.tenant.messages = [
        //   'Inquilino adicionado com sucesso!'
        // ]

        App.notify('Inquilino adicionado com sucesso!', 'success');

        setTimeout(() => {
          window.location.replace(`/app/tenants/${response.tenantId}`)
        }, 2000)
      } catch (error) {
        const response = error.response.data

        if (typeof response === 'object' && response.messages !== undefined) {
          App.tenant.error = true
          // App.tenant.messages = response.messages

          App.notify(response.messages.join('<br>'), 'danger');

          for (const field in response.form) {
            App.tenant.fields[field].error = true
            App.tenant.fields[field].messages = response.form[field].messages
          }
        } else {
          App.tenant.error = true
          // App.tenant.messages.push('Ocorreu um erro interno. Por favor, tente novamente.')

          App.notify('Ocorreu um erro interno. Por favor, tente novamente.', 'warning')
        }
      }

      App.tenant.loading = false
    }
  }
})