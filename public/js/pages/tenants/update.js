mixins.push({
  data: {
    tenant: {
      error: true,
      messages: [],

      loading: false,

      fields: {
        name: {
          error: false,
          messages: []
        },
        active: {
          error: false,
          messages: []
        },
      },

      newValues: {
        uuid: tenantId,
        name: '',
        active: false,
        createdAt: '',
        alteredAt: '',
      },

      oldValues: {
        uuid: tenantId,
        name: '',
        active: false,
        createdAt: '',
        alteredAt: '',
      }
    },

    users: {
      loading: false,
      loaded: false,
      list: []
    }
  },
  methods: {
    init: () => {
      App.getTenant(() => {
        App.getUsers()
        // App.tenant.newValues.name = 'Master 2';
        // App.tenant.newValues.name = '';

        // setTimeout(() => {
        //   App.updateTenant();
        // }, 500);
      })
    },

    getTenant: async (cb) => {
      App.tenant.loading = true

      try {
        const response = (await axios.get(`/api/tenants/${App.tenant.oldValues.uuid}`)).data.content.data.tenant

        App.tenant.oldValues.name = response.name
        App.tenant.oldValues.active = !!response.active
        App.tenant.oldValues.createdAt = response.createdAt
        App.tenant.oldValues.alteredAt = response.alteredAt

        App.tenant.newValues.name = response.name
        App.tenant.newValues.active = !!response.active
        App.tenant.newValues.createdAt = response.createdAt
        App.tenant.newValues.alteredAt = response.alteredAt

        if (cb) cb()
      } catch (error) {
        console.log('error', error);
      }

      App.tenant.loading = false
    },

    updateTenant: async () => {
      App.tenant.loading = true
      App.tenant.error = false
      App.tenant.messages = []

      App.tenant.fields.name.error = false
      App.tenant.fields.name.messages = []

      App.tenant.fields.active.error = false
      App.tenant.fields.active.messages = []

      App.tenant.newValues.name = App.tenant.newValues.name.trim()

      try {
        const response = (await axios.put(`/api/tenants/${App.tenant.oldValues.uuid}`, {
          name: App.tenant.newValues.name,
          active: App.tenant.newValues.active ? 1 : 0,
        })).data.content.data

        App.getTenant();

        // App.tenant.messages = [
        //   'Inquilino editado com sucesso!'
        // ]

        App.notify('Inquilino editado com sucesso!', 'success');
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

          App.notify('Ocorreu um erro interno. Por favor, tente novamente.', 'warning');
        }
      }

      App.tenant.loading = false
    },

    resetForm: () => {
      /**/console.log('resetForm()');
      App.tenant.newValues = JSON.parse(JSON.stringify(App.tenant.oldValues))
    },

    getUsers: async () => {
      App.users.loading = true

      try {
        /**/console.log(`/api/tenants/${App.tenant.oldValues.uuid}/users`);
        const response = await axios.get(`/api/tenants/${App.tenant.oldValues.uuid}/users`)

        App.users.list = []
        for (const row of response.data.content.data) {
          App.users.list.push(row)
        }
      } catch (error) {
        console.log('error', error)
        App.users.list = []
      }

      App.users.loading = false
      App.users.loaded = true
    },

    removeUser: (user) => {},
  }
})