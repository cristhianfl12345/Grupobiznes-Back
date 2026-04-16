import pkg from 'pg'
const { Pool } = pkg

export const db = new Pool({
  host: '192.168.7.105',
  user: 'dev_digital',
  password: '33pbnWn8OW6m',
  database: 'panel', // nombre bd
  port: 5432, 
  ssl: false, //false en red local
})
