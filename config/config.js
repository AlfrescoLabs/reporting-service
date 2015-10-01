module.exports = {
  development: {
    DatabaseConfig: {
      port: 27017,
      host: '::mongo host::',
      name: '::collection name::',
      user: '::db username::',
      pass: '::db password::'
    },
    EnvConfig: {
      port: 3000
    }
  },
  production: {
  }
};
