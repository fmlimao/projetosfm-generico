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
  },
  methods: {
    init: () => {
      App.getTenant(() => {
        // App.tenant.newValues.name = 'Inquilino novo 2';
        // App.tenant.newValues.name = '';

        // setTimeout(() => {
        //   App.updateTenant();
        // }, 500);
      })
    },

    getTenant: async (cb) => {
      App.tenant.loading = true

      try {
        const response = (await axios.get(`/api/tenants/${App.tenant.oldValues.uuid}`)).data.content.data

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

        App.tenant.messages = [
          'Inquilino editado com sucesso!'
        ]
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
    },

    resetForm: () => {
      /**/console.log('resetForm()');
      App.tenant.newValues = JSON.parse(JSON.stringify(App.tenant.oldValues))
    }
  }
})