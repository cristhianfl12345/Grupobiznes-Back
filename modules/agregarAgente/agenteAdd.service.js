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
  INSERT_CARTERIZACION,
  QUERY_USUARIO_BY_DNI,
  UPDATE_HORARIO,
  UPDATE_HORARIO_BY_USUARIO,
INSERT_NUEVA_CAMPANA
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
    throw new Error('Persona no encontrada')
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
      throw new Error('No se encontró la persona')
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
      INSERT_CARTERIZACION,
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