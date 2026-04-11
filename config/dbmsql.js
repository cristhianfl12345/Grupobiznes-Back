// back/config/dbmsql.js
import mysql from "mysql2/promise";

const dbmysql = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "biznes_dbdashboard",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4"
});

export default dbmysql;