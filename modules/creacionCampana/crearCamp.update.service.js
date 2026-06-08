//back/modules/creacionCampana/crearCamp.update.service.js

import {

  UPDATE_ADMIN_CAMPANA,
  UPDATE_AGENT_CAMPANA,
  UPDATE_CORE_CAMPANA,

  UPDATE_CORE_CAMPANIA_INI,
  INSERT_NEW_INI_CAMPANIA,
  DELETE_ONE_INI

} from "./crearCamp.queries.js"

// ======================================================
// CONEXIONES
// ======================================================

import { db } from "../../config/db.js"
import { dbdigital } from "../../config/dbdigital.js"

// ======================================================
// UPDATE CAMPAÑA
// ======================================================

export const updateCampaniaService = async (
  idCamp,
  body
) => {

  // ======================================================
  // CLIENTS
  // ======================================================

  const panelClient =
    await db.connect()

  const coreClient =
    await dbdigital.connect()

  try {

    // ======================================================
    // DEBUG DATABASES
    // ======================================================

    const panelDb =
      await panelClient.query(`
        SELECT current_database()
      `)

    const coreDb =
      await coreClient.query(`
        SELECT current_database()
      `)

    console.log(
      "[PANEL_DB]",
      panelDb.rows[0]
    )

    console.log(
      "[CORE_DB]",
      coreDb.rows[0]
    )

    // ======================================================
    // BEGIN
    // ======================================================

    await panelClient.query("BEGIN")

    await coreClient.query("BEGIN")

    // ======================================================
    // BODY
    // ======================================================

    const {
      nombre,
      activa,
      updates = [],
      inserts = [],
      deletes = []
    } = body

    // ======================================================
    // UPDATE ADMIN.CAMPANAS
    // ======================================================

    await panelClient.query(
      UPDATE_ADMIN_CAMPANA,
      [
        idCamp,
        nombre,
        activa
      ]
    )

    // ======================================================
    // UPDATE AGENT.CAMPANAS
    // ======================================================

    await panelClient.query(
      UPDATE_AGENT_CAMPANA,
      [
        idCamp,
        nombre,
        activa
      ]
    )

    // ======================================================
    // UPDATE CORE.CAMPANAS
    // ======================================================

    await coreClient.query(
      UPDATE_CORE_CAMPANA,
      [
        idCamp,
        nombre,
        activa
      ]
    )

    // ======================================================
    // UPDATE CORE.CAMPANAS_INI
    // ======================================================

    for (const row of updates) {

      await coreClient.query(
        UPDATE_CORE_CAMPANIA_INI,
        [
          row.id_orden,
          row.ini_campania,
          row.producto,
          row.campania_name
        ]
      )

    }

    // ======================================================
    // INSERT NUEVAS FILAS
    // ======================================================

    for (const row of inserts) {

      await coreClient.query(
        INSERT_NEW_INI_CAMPANIA,
        [
          idCamp,
          row.ini_campania,
          row.producto,
          row.campania_name
        ]
      )

    }

    // ======================================================
    // DELETE FILAS
    // ======================================================

    for (const row of deletes) {

      await coreClient.query(
        DELETE_ONE_INI,
        [row.id_orden]
      )

    }

    // ======================================================
    // COMMIT
    // ======================================================

    await panelClient.query("COMMIT")

    await coreClient.query("COMMIT")

    return {
      ok: true
    }

  } catch (error) {

    // ======================================================
    // ROLLBACK
    // ======================================================

    try {

      await panelClient.query("ROLLBACK")

    } catch (_) {}

    try {

      await coreClient.query("ROLLBACK")

    } catch (_) {}

    console.error(
      "[ERROR_UPDATE_CAMPANIA]",
      error
    )

    throw error

  } finally {

    // ======================================================
    // RELEASE
    // ======================================================

    panelClient.release()

    coreClient.release()

  }

}