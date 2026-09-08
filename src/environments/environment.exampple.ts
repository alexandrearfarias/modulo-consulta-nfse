export const environment = {
  production: false,

  api: {
    baseUrl: 'https://api.simplesinformatica.net'
  },

  oauth: {
    tokenUrl: 'https://auth.simplesinformatica.net/oauth/token',

    clientId: 'COLOQUE_SEU_CLIENT_ID_AQUI',
    clientSecret: 'COLOQUE_SEU_CLIENT_SECRET_AQUI',

    scope: 'nfse:read nfse:write'
  }
};
