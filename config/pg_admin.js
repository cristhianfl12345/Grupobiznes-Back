//back/config/pg_admin.js
import pkg from 'pg'
const { Pool } = pkg

export const pg_admindb = new Pool({
  host: '192.168.7.105',
  user: 'dev_digital',
  password: '33pbnWn8OW6m',
  database: 'panel', // nombre bd schema "admin" 
  port: 5432, 
  ssl: false, //false en red local
})
