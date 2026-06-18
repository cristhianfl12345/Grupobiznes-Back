// back/config/dbmaster.js

import sql from "mssql";

const baseConfig = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_HOST,
  port: Number(process.env.MSSQL_PORT),
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// =========================
// DB MASTER
// =========================
const configMaster = {
  ...baseConfig,
  database: process.env.MSSQL_DB_MASTER
};

// =========================
// DB RNI
// =========================
const configRNI = {
  ...baseConfig,
  database: process.env.MSSQL_DB_RNI
};

// =========================
// DB RCC
// =========================
const configRCC = {
  ...baseConfig,
  database: process.env.MSSQL_DB_RCC
};

// =========================
// POOL MASTER
// =========================
export const poolMaster = new sql.ConnectionPool(configMaster)
  .connect()
  .then(pool => {
    // console.log(`Conectado a ${process.env.MSSQL_DB_MASTER}`);
    return pool;
  })
  .catch(err => {
    console.error(
      `Error conexión ${process.env.MSSQL_DB_MASTER}:`,
      err
    );
    throw err;
  });

// =========================
// POOL RNI
// =========================
export const poolRNI = new sql.ConnectionPool(configRNI)
  .connect()
  .then(pool => {
    // console.log(`Conectado a ${process.env.MSSQL_DB_RNI}`);
    return pool;
  })
  .catch(err => {
    console.error(
      `Error conexión ${process.env.MSSQL_DB_RNI}:`,
      err
    );
    throw err;
  });

// =========================
// POOL RCC
// =========================
export const poolRCC = new sql.ConnectionPool(configRCC)
  .connect()
  .then(pool => {
    // console.log(`Conectado a ${process.env.MSSQL_DB_RCC}`);
    return pool;
  })
  .catch(err => {
    console.error(
      `Error conexión ${process.env.MSSQL_DB_RCC}:`,
      err
    );
    throw err;
  });

// Compatibilidad con código antiguo
export const poolPromise = poolMaster;

// Exportar sql
export { sql };