//back/modules/creacionUsuarios/userC.service.js
import { sql, poolRNI } from "../../config/dbmaster.js";
import { pg_admindb } from "../../config/pg_admin.js";
import {
  QUERY_BUSCAR_DNI,
  QUERY_OBTENER_DETALLE,
  INSERT_PERSONA
} from "./userC.queries.js";

/**
 * BUSCAR POR DNI
 */
export async function buscarDniService(dni) {

  const pool = await poolRNI;

  const result = await pool.request()
    .input("dni", sql.VarChar, dni)
    .query(QUERY_BUSCAR_DNI);

  return result.recordset[0] || null;
}

/**
 * OBTENER DETALLE
 */
export async function obtenerDetalleService(dni) {

  const pool = await poolRNI;

  const result = await pool.request()
    .input("dni", sql.VarChar, dni)
    .query(QUERY_OBTENER_DETALLE);

  return result.recordset[0] || null;
}

// =========================
// CREAR PERSONA
// =========================
export async function crearPersonaService(data) {

  const {
    tipo_documento,
    numero_documento,
    nombres,
    ape_paterno,
    ape_materno,
    fecha_nacimiento,
    sexo,
    direccion
  } = data

  const values = [
    tipo_documento || "DNI",
    numero_documento,
    nombres,
    ape_paterno,
    ape_materno,
    fecha_nacimiento || null,
    sexo || null,
    direccion || null,
    true
  ]

  const result = await pg_admindb.query(
    INSERT_PERSONA,
    values
  )

  return result.rows[0]
}