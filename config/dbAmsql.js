// back/config/dbAmsql.js
import mysql from "mysql2/promise";

const dbAmsql = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "biznes_dbaplicacion",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4"
});

export default dbAmsql;