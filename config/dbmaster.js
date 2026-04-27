//back/config/dbmaster.js
import sql from "mssql";

const config = {
  user: 'pth_reniec',
  password: 'rni258[]43$',
  server: '192.168.7.30',
  database: 'DB_MASTER_BIZNES',
  options: {
    encrypt: false, // true si usas Azure
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

//poll exportaado
export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
   // console.log("Conectado a SQL Server");
    return pool;
  })
  .catch(err => {
    console.error(" Error conexión DB:", err);
    throw err;
  });

// Exportar sql también (para tipos)
export { sql };
