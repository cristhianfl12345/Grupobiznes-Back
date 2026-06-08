//back/config/dbmaster.js
import sql from "mssql";

const baseConfig = {
  user: 'pth_reniec',
  password: 'rni258[]43$',
  server: '192.168.7.30',
  options: {
    encrypt: false, // true en azure
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
  database: 'DB_MASTER_BIZNES'
};

// =========================
// DB RNI
// =========================
const configRNI = {
  ...baseConfig,
  database: 'DB_RNI'
};

// =========================
// DB RCC
// =========================
const configRCC = {
  ...baseConfig,
  database: 'DB_RCC'
};

// =========================
// POOL MASTER
// =========================
export const poolMaster = new sql.ConnectionPool(configMaster)
  .connect()
  .then(pool => {
    // console.log("Conectado a DB_MASTER_BIZNES");
    return pool;
  })
  .catch(err => {
    console.error("Error conexión DB_MASTER_BIZNES:", err);
    throw err;
  });

// =========================
// POOL RNI
// =========================
export const poolRNI = new sql.ConnectionPool(configRNI)
  .connect()
  .then(pool => {
    // console.log("Conectado a DB_RNI");
    return pool;
  })
  .catch(err => {
    console.error("Error conexión DB_RNI:", err);
    throw err;
  });

// =========================
// POOL RCC
// =========================
export const poolRCC = new sql.ConnectionPool(configRCC)
  .connect()
  .then(pool => {
    // console.log("Conectado a DB_RCC");
    return pool;
  })
  .catch(err => {
    console.error("Error conexión DB_RCC:", err);
    throw err;
  });

// Compatibilidad con código antiguo
export const poolPromise = poolMaster;

// Exportar sql
export { sql };