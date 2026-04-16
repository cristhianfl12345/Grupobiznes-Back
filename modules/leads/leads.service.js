import { dbdigital } from '../../config/dbdigital.js'
import { db } from '../../config/db.js'

import {
  QUERY_LEADS_BASE,
  QUERY_SUBCAMPANIAS,
  QUERY_LEADS_PANEL,
  QUERY_VISTAS_CAMPANA
} from './leads.queries.js'


export const getLeadsByFechaService = async (idCamp, iniCampania, fechaIngreso) => {

  if (![200, 360, 280, 370, 340, 310, 90, 60].includes(idCamp)) {
    return []
  }

  let query = QUERY_LEADS_BASE
  const params = [idCamp, fechaIngreso]

  if (iniCampania) {
    query += ` AND lc.inicampania = $3`
    params.push(iniCampania)
  }

  query += ` ORDER BY l.idkey DESC`

  const { rows } = await dbdigital.query(query, params)

  return rows
}


export const getSubcampaniasService = async (idCamp) => {

  const { rows } = await dbdigital.query(
    QUERY_SUBCAMPANIAS,
    [idCamp]
  )

  return rows
}


export const getLeadsPanel = async (idCamp, limit, offset) => {

  const { rows } = await db.query(
    QUERY_LEADS_PANEL,
    [idCamp, limit, offset]
  )

  return rows
}


// ESTA CONSULTA DEBE USAR DB PANEL
export const getVistasCampanaService = async (idCamp) => {

  const { rows } = await db.query(
    QUERY_VISTAS_CAMPANA,
    [idCamp]
  )

  return rows
}


// NUEVO: FILTRAR COLUMNAS SEGÚN VISTAS
export const getLeadsFiltradosService = async (idCamp, iniCampania, fechaIngreso) => {

  //  obtener columnas permitidas desde panel
  const { rows: vistas } = await db.query(
    QUERY_VISTAS_CAMPANA,
    [idCamp]
  )

  const columnasPermitidas = vistas.map(v => v.query_vista.trim())

  if (!columnasPermitidas.length) {
    return []
  }

  //  obtener leads completos
  const leads = await getLeadsByFechaService(
    idCamp,
    iniCampania,
    fechaIngreso
  )

  // filtrar columnas
  const resultado = leads.map(lead => {

    const obj = {}

    columnasPermitidas.forEach(col => {
      if (lead.hasOwnProperty(col)) {
        obj[col] = lead[col]
      }
    })

    return obj
  })

  return resultado
}