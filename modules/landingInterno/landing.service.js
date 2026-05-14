//back/modules/landingInterno/landing.service.js

import { dbdigital } from "../../config/dbdigital.js"

import {
  INSERT_LEAD_CAMPANIA,
  GET_CAMPANIA_INFO,
  GET_TIPOS_BASE_BY_CAMPANIA,
  GET_TIPO_BASE_BY_ID,
  GET_CAMPANIA_BY_ID,
  GET_TELEFONO_BY_IDKEY
} from "./landing.queries.js"


// ======================================================
// OBTENER INFO DE CAMPAÑA
// ======================================================

export const getCampaniaInfoService = async (idCamp) => {

  const { rows } = await dbdigital.query(
    GET_CAMPANIA_INFO,
    [idCamp]
  )

  return rows
}


// ======================================================
// OBTENER TIPOS BASE
// ======================================================

export const getTiposBaseService = async (idCamp) => {

  const { rows } = await dbdigital.query(
    GET_TIPOS_BASE_BY_CAMPANIA,
    [idCamp]
  )

  return rows
}


// ======================================================
// CREAR LEAD
// ======================================================

export const createLeadService = async (payload) => {

  const {
    nombres,
    apellidos,
    dni,
    telefono,
    email,
    provincia,
    comentario,
    permitellamada,
    idcampania,
    id_tipobase,
    idusuario,
    campania,
    producto,
    id_anuncio
  } = payload

  // ================================
  // VALIDAR CAMPAÑA / PRODUCTO
  // ================================

  if (!campania) {
    throw new Error("Campaña requerida")
  }

  if (!producto) {
    throw new Error("Producto requerido")
  }
// ================================
// OBTENER INFO CAMPAÑA REAL
// ================================

const { rows: campaniaRows } = await dbdigital.query(
  GET_CAMPANIA_BY_ID,
  [idcampania]
)

const campaniaInfo = campaniaRows[0]

if (!campaniaInfo) {
  throw new Error("Campaña inválida")
}

const inicampania =
  campaniaInfo.inicampania

const campania_name =
  campaniaInfo.campania_name

const producto_real =
  campaniaInfo.producto
  // ================================
  // OBTENER INFO TIPO BASE
  // ================================

  const { rows: tipoBaseRows } = await dbdigital.query(
    GET_TIPO_BASE_BY_ID,
    [idcampania, id_tipobase]
  )

  const tipoBase = tipoBaseRows[0]

  if (!tipoBase) {
    throw new Error("Tipo base inválido")
  }

  // ================================
  // CONCAT NOMBRES
  // ================================

  const nombreCompleto =
    `${nombres} ${apellidos}`.trim()

  // ================================
  // INSERT
  // ================================
const idkeyunico = generateKey()

const values = [
  nombreCompleto, // $1
  dni,            // $2
  telefono,       // $3
  email,          // $4
  provincia,      // $5
  comentario,     // $6

  campania,       // $7 
  campania_name,  // $8 
  producto_real,       // $9

  id_tipobase,    // $10
  idusuario,      // $11
  permitellamada, // $12

  idkeyunico,      // $13
  id_anuncio        // $14
]

  const { rows } = await dbdigital.query(
    INSERT_LEAD_CAMPANIA,
    values
  )

  return rows[0]
}
// ======================================================
// GENERAR KEY
// ======================================================

const generateKey = (length = 15) => {

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  let result = ""

  for (let i = 0; i < length; i++) {

    result += chars.charAt(
      Math.floor(Math.random() * chars.length)
    )
  }

  return result
}
// ======================================================
// OBTENER TELEFONO POR IDKEY
// ======================================================

export const getTelefonoByIdkeyService = async (idkey) => {

  const { rows } = await dbdigital.query(
    GET_TELEFONO_BY_IDKEY,
    [idkey]
  )

  return rows[0] || null
}