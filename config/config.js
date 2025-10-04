require('dotenv').config();

const createConfig = (environment) => {
  const config = {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : '',
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
      connectTimeout: 60000,
      socketTimeout: 60000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 0,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
      retry: {
        match: [
          /ETIMEDOUT/,
          /EHOSTUNREACH/,
          /ECONNRESET/,
          /ECONNREFUSED/,
          /ENOTFOUND/,
          /ENETUNREACH/,
          /EAI_AGAIN/,
          /Connection terminated/,
          /Connection reset by peer/,
        ],
        max: 3
      }
    }
  };

  // Only enable SSL for production environment
// In the createConfig function, update the SSL logic:
if (environment === 'production' || 
    (process.env.DB_HOST && !process.env.DB_HOST.includes('localhost') && !process.env.DB_HOST.includes('127.0.0.1'))) {
  config.dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false
  };
}

  // Set logging based on environment
  if (environment === 'development') {
    config.logging = console.log;
  } else {
    config.logging = false;
  }

  return config;
};

module.exports = {
  development: createConfig('development'),
  test: createConfig('test'),
  production: createConfig('production')
};