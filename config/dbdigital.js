import pkg from 'pg'
const { Pool } = pkg

export const dbdigital = new Pool({
  host: '192.168.7.105',
  user: 'dev_digital',
  password: '33pbnWn8OW6m',
  database: 'digital_core', // nombre bd
  port: 5432, 
  ssl: false, //false en red local
})
