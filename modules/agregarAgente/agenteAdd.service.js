// back/modules/agregarAgente/agenteAdd.service.js

import bcrypt from 'bcrypt'
import { db } from '../../config/db.js'

import {
  QUERY_PERSONA_BY_DOCUMENTO,
  QUERY_USUARIO_EXISTE,
  INSERT_USUARIO,
  UPDATE_USUARIO,
  UPSERT_CREDENCIAL,
  INSERT_PLATAFORMA,
  UPSERT_HORARIO,
  UPSERT_CARTERIZACION,
  QUERY_USUARIO_BY_DNI,
  UPDATE_HORARIO,
  UPDATE_HORARIO_BY_USUARIO,
INSERT_NUEVA_CAMPANA,
QUERY_USUARIO_CAMPANA,
ACTIVAR_USUARIO_CAMPANA,
QUERY_TIPO_CAMPANA,
QUERY_OBTENER_TIPO_CAMPANA
} from './agenteAdd.queries.js'

// ======================================================
// BUSCAR PERSONA
// ======================================================

export const buscarPersonaService = async (
  numero_documento
) => {

  const result = await db.query(
    QUERY_PERSONA_BY_DOCUMENTO,
    [numero_documento]
  )

  if (result.rows.length === 0) {
    throw new Error('No se encontro al personal, contactar con RRHH')
  }

  const persona = result.rows[0]

  const nombres =
    persona.nombres?.trim() || ''

  const ape_paterno =
    persona.ape_paterno?.trim() || ''

  const ape_materno =
    persona.ape_materno?.trim() || ''

  const nombre = `
    ${nombres}
    ${ape_paterno}
    ${ape_materno}
  `
    .replace(/\s+/g, ' ')
    .trim()

  // =========================================
  // GENERAR USUARIO
  // =========================================

  const usuario = (
    nombres.charAt(0).toUpperCase() +
    ape_paterno.toUpperCase() +
    numero_documento.substring(0, 3) +
    '@'
  )
    .replace(/\s+/g, '')

  // =========================================
  // PASSWORD
  // =========================================

  const password = (
    `${numero_documento}_${ape_paterno.substring(0, 2)}`
  ).toUpperCase()

  return {
    ok: true,
    nombre,
    usuario,
    password
  }
}

// ======================================================
// CREAR AGENTE
// ======================================================

export const crearAgenteService = async ({
  numero_documento,
  usuario,
  password,
  id_plataforma,
  hora_in,
  hora_out,
  id_campana
}) => {

  const client = await db.connect()

  try {

    await client.query('BEGIN')

    // =========================================
    // VALIDAR PLATAFORMA
    // =========================================

    if (![1, 2, 3, 4].includes(Number(id_plataforma))) {
      throw new Error('Plataforma inválida')
    }

    // =========================================
    // VALIDAR CAMPOS
    // =========================================

    if (!usuario?.trim()) {
      throw new Error('Usuario requerido')
    }

    if (!password?.trim()) {
      throw new Error('Contraseña requerida')
    }

    // =========================================
    // BUSCAR PERSONA
    // =========================================

    const personaResult = await client.query(
      QUERY_PERSONA_BY_DOCUMENTO,
      [numero_documento]
    )

    if (personaResult.rows.length === 0) {
      throw new Error('No se encontró al personal, contactar con RRHH')
    }

    const persona = personaResult.rows[0]

    const nombres =
      persona.nombres?.trim() || ''

    const ape_paterno =
      persona.ape_paterno?.trim() || ''

    const ape_materno =
      persona.ape_materno?.trim() || ''

    const nombreCompleto = `
      ${nombres}
      ${ape_paterno}
      ${ape_materno}
    `
      .replace(/\s+/g, ' ')
      .trim()

    // =========================================
    // USUARIO / PASSWORD
    // =========================================

    const usuarioFinal =
      usuario
        .trim()
        .toUpperCase()

    const passwordPlano =
      password
        .trim()
        .toUpperCase()

    // =========================================
    // HASH PASSWORD
    // =========================================

    const passwordHash =
      await bcrypt.hash(passwordPlano, 10)

    // =========================================
    // VALIDAR USUARIO
    // =========================================

    const userExist = await client.query(
      QUERY_USUARIO_EXISTE,
      [usuarioFinal]
    )

    let id_usuario

    if (userExist.rows.length === 0) {

      const insertUser = await client.query(
        INSERT_USUARIO,
        [
          numero_documento,
          nombreCompleto,
          usuarioFinal
        ]
      )

      id_usuario =
        insertUser.rows[0].id_usuario

    } else {

      id_usuario =
        userExist.rows[0].id_usuario

      await client.query(
        UPDATE_USUARIO,
        [
          numero_documento,
          nombreCompleto,
          id_usuario
        ]
      )
    }
// campana existe
const campanaExistente =
  await client.query(
    QUERY_USUARIO_CAMPANA,
    [
      id_usuario,
      id_campana
    ]
  )

if (campanaExistente.rows.length > 0) {

  const registro =
    campanaExistente.rows[0]

  if (registro.modulo_activo === true) {

    throw new Error(
      'Este usuario ya se encuentra registrado en esta campaña'
    )

  }

  if (registro.modulo_activo === false) {

    throw new Error(
      'Este usuario se encuentra inactivo para esta campaña'
    )

  }
}
    // =========================================
    // CREDENCIALES
    // =========================================

    await client.query(
      UPSERT_CREDENCIAL,
      [
        id_usuario,
        passwordHash
      ]
    )

    // =========================================
    // PLATAFORMA
    // =========================================

    await client.query(
      INSERT_PLATAFORMA,
      [
        id_usuario,
        id_plataforma
      ]
    )

    // =========================================
    // HORARIO
    // =========================================

    await client.query(
      UPSERT_HORARIO,
      [
        
        hora_in,
        hora_out,
        id_usuario
      ]
    )

    // =========================================
    // CARTERIZACION
    // =========================================

    await client.query(
      UPSERT_CARTERIZACION,
      [
        id_usuario,
        id_campana
      ]
    )

    await client.query('COMMIT')

    return {
      ok: true,
      id_usuario,
      usuario: usuarioFinal,
      password: passwordPlano,
      nombre: nombreCompleto
    }

  } catch (error) {

    await client.query('ROLLBACK')

    throw error

  } finally {

    client.release()

  }
}
// ======================================================
// ACTUALIZAR HORARIO + CAMPAÑA
// ======================================================

export const actualizarHorarioCampanaService = async ({
  numero_documento,
  hora_in,
  hora_out,
  id_campana
}) => {

  const client = await db.connect()

  try {

    await client.query('BEGIN')

    // =========================================
    // BUSCAR USUARIO POR DNI
    // =========================================

    const usuarioResult = await client.query(
      QUERY_USUARIO_BY_DNI,
      [numero_documento]
    )

    if (usuarioResult.rows.length === 0) {
      throw new Error('Usuario no encontrado')
    }

    const id_usuario =
      usuarioResult.rows[0].id_usuario

    // =========================================
    // UPDATE HORARIO
    // =========================================

    await client.query(
      UPDATE_HORARIO_BY_USUARIO,
      [
        hora_in,
        hora_out,
        id_usuario
      ]
    )

    // =========================================
    // INSERT CAMPAÑA
    // =========================================

// =========================================
// VALIDAR CAMPAÑA
// =========================================

const campanaResult = await client.query(
  QUERY_USUARIO_CAMPANA,
  [
    id_usuario,
    id_campana
  ]
)

if (campanaResult.rows.length > 0) {

  const registro = campanaResult.rows[0]

  // YA ACTIVO
  if (registro.modulo_activo === true) {
    throw new Error(
      'Este usuario ya se encuentra registrado en esta campaña'
    )
  }

  // EXISTE PERO INACTIVO → FRONT DEBE ACTIVAR
  if (registro.modulo_activo === false) {
    throw new Error(
      'Este usuario se encuentra inactivo para esta campaña'
    )
  }
}

// SOLO SI NO EXISTE → INSERT
await client.query(
  INSERT_NUEVA_CAMPANA,
  [
    id_usuario,
    id_campana
  ]
)

    await client.query('COMMIT')

    return {
      ok: true,
      message: 'Horario y campaña actualizados',
      id_usuario
    }

  } catch (error) {

    await client.query('ROLLBACK')

    throw error

  } finally {

    client.release()

  }
}
// ======================================================
// ACTIVAR USUARIO EN CAMPAÑA
// ======================================================

export const activarUsuarioCampanaService = async ({
  numero_documento,
  id_campana
}) => {

  const client = await db.connect()

  try {

    await client.query('BEGIN')

    const usuarioResult = await client.query(
      QUERY_USUARIO_BY_DNI,
      [numero_documento]
    )

    if (usuarioResult.rows.length === 0) {
      throw new Error('Usuario no encontrado')
    }

    const id_usuario =
      usuarioResult.rows[0].id_usuario

    const campanaResult = await client.query(
      QUERY_USUARIO_CAMPANA,
      [
        id_usuario,
        id_campana
      ]
    )

    if (campanaResult.rows.length === 0) {
      throw new Error(
        'El usuario no se encuentra registrado en esta campaña'
      )
    }

    await client.query(
      ACTIVAR_USUARIO_CAMPANA,
      [
        id_usuario,
        id_campana
      ]
    )

    await client.query('COMMIT')

    return {
      ok: true,
      message: 'Usuario activado correctamente',
      id_usuario
    }

  } catch (error) {

    await client.query('ROLLBACK')

    throw error

  } finally {

    client.release()

  }
}
// TIPO CAMPANA
export const actualizarTipoCampanaService = async ({
  id_usuario,
  id_campana
}) => {

  const client = await db.connect()

  try {

    await client.query("BEGIN")

    const actual = await client.query(
      QUERY_OBTENER_TIPO_CAMPANA,
      [id_usuario, id_campana]
    )

    if (actual.rowCount === 0) {
      throw new Error("No existe relación usuario-campaña")
    }

    const tipoActual = Number(actual.rows[0].tipo_campana)

    const nuevoTipo = tipoActual === 1 ? 2 : 1

    const result = await client.query(
      QUERY_TIPO_CAMPANA,
      [
        nuevoTipo,
        id_usuario,
        id_campana
      ]
    )

    if (result.rowCount === 0) {
      throw new Error("No se pudo actualizar el tipo de campaña")
    }

    await client.query("COMMIT")

    return {
      ok: true,
      message: "Tipo de campaña actualizado correctamente",
      data: result.rows[0]
    }

  } catch (error) {

    await client.query("ROLLBACK")
    throw error

  } finally {

    client.release()

  }

}
export const obtenerTipoCampanaService = async ({
  id_usuario,
  id_campana
}) => {

  const result = await db.query(
    QUERY_OBTENER_TIPO_CAMPANA,
    [id_usuario, id_campana]
  )

  if (result.rowCount === 0) {
    throw new Error("No existe relación usuario-campaña")
  }

  return {
    ok: true,
    data: result.rows[0]
  }

}