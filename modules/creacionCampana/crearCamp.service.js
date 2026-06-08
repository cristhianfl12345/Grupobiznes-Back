//back/modules/creacionCampana/crearCamp.service.js

import {

  // IDS
  GET_LAST_ID_VISTA_ADMIN,

  // VALIDACIONES
  VALIDATE_CAMPANIA_EXISTS,
  VALIDATE_ID_EXISTS,

  // GETS
  GET_CAMPANIA_ADMIN,
  GET_CAMPANIA_AGENT,
  GET_CAMPANIA_CORE,
  GET_CAMPANIA_CORE_INI,
  GET_CONTROL_MODULOS,

  // INSERTS
  INSERT_ADMIN_CAMPANA,
  INSERT_AGENT_CAMPANA,
  INSERT_CONTROL_MODULOS,
  INSERT_CORE_CAMPANA,
  INSERT_CORE_CAMPANA_INI,

  // DELETES
  DELETE_CONTROL_MODULOS,
  DELETE_ADMIN_CAMPANA,
  DELETE_AGENT_CAMPANA,
  DELETE_CORE_CAMPANIA_INI,
  DELETE_CORE_CAMPANIA,
   // GET ALL
  GET_ALL_CAMPANIAS_ADMIN,
  //updates
  INSERT_NEW_INI_CAMPANIA,
  UPDATE_ADMIN_CAMPANA,
  UPDATE_AGENT_CAMPANA,
  UPDATE_CORE_CAMPANA,
  UPDATE_CORE_CAMPANIA_INI,
  
} from "./crearCamp.queries.js";

// ======================================================
// CONEXIONES
// ======================================================

import { db } from "../../config/db.js";
import { dbdigital } from "../../config/dbdigital.js";

// ======================================================
// CREAR CAMPAÑA
// ======================================================

export const crearCampaniaService = async (body) => {

  const {
    idCampana,
    nombre,
    activa = true,
    iniCampania = null,
    producto = null,
    campaniaName = null
  } = body;

  // ======================================================
  // VALIDACIONES
  // ======================================================

  if (!idCampana) {
    throw new Error("El idCampana es obligatorio");
  }

  if (!nombre || !nombre.trim()) {
    throw new Error("El nombre es obligatorio");
  }

  const idCampanaNumber = Number(idCampana);

  if (Number.isNaN(idCampanaNumber)) {
    throw new Error("El idCampana debe ser numérico");
  }

  const nombreLimpio = nombre.trim();

  // ======================================================
  // CLIENTS
  // ======================================================

  const panelClient = await db.connect();
  const coreClient = await dbdigital.connect();

  try {

    // ======================================================
    // BEGIN
    // ======================================================

    await panelClient.query("BEGIN");
    await coreClient.query("BEGIN");

    // ======================================================
    // VALIDAR NOMBRE DUPLICADO
    // ======================================================
{/* 
    const validateNombre = await panelClient.query(
      VALIDATE_CAMPANIA_EXISTS,
      [nombreLimpio]
    );

    if (validateNombre.rows.length > 0) {
      throw new Error("La campaña ya existe");
    }
*/}
    // ======================================================
    // VALIDAR ID DUPLICADO
    // ======================================================

    const validateId = await panelClient.query(
      VALIDATE_ID_EXISTS,
      [idCampanaNumber]
    );

    if (validateId.rows.length > 0) {
      throw new Error("El idCampana ya existe");
    }

    // ======================================================
    // GENERAR ID_VISTA
    // ======================================================

    const vistaAdminRes = await panelClient.query(
      GET_LAST_ID_VISTA_ADMIN
    );

    const nextVista =
      Number(vistaAdminRes.rows[0]?.last_id || 0) + 1;

    // ======================================================
    // INSERT ADMIN.CAMPANAS
    // ======================================================

    await panelClient.query(
      INSERT_ADMIN_CAMPANA,
      [
        idCampanaNumber,
        nombreLimpio,
        activa,
        nextVista
      ]
    );

    // ======================================================
    // INSERT AGENT.CAMPANAS
    // ======================================================

    await panelClient.query(
      INSERT_AGENT_CAMPANA,
      [
        idCampanaNumber,
        nombreLimpio,
        activa,
        nextVista
      ]
    );

    // ======================================================
    // INSERT CONTROL MODULOS
    // ======================================================

    const modulos = [1, 2, 3, 4, 5];

    for (const modulo of modulos) {

      await panelClient.query(
        INSERT_CONTROL_MODULOS,
        [
          idCampanaNumber,
          modulo,
          true
        ]
      );

    }

    // ======================================================
    // INSERT CORE.CAMPANAS
    // ======================================================

    await coreClient.query(
      INSERT_CORE_CAMPANA,
      [
        idCampanaNumber,
        nombreLimpio,
        activa
      ]
    );

    // ======================================================
    // INSERT CORE.CAMPANAS_INI
    // ======================================================

    await coreClient.query(
      INSERT_CORE_CAMPANA_INI,
      [
        idCampanaNumber,
        iniCampania,
        producto,
        campaniaName
      ]
    );

    // ======================================================
    // COMMIT
    // ======================================================

    await panelClient.query("COMMIT");
    await coreClient.query("COMMIT");

    return {
      ok: true,
      message: "Campaña creada correctamente",
      data: {
        id_campana: idCampanaNumber,
        id_vista: nextVista,
        nombre: nombreLimpio
      }
    };

  } catch (error) {

    // ======================================================
    // ROLLBACK
    // ======================================================

    try {
      await panelClient.query("ROLLBACK");
    } catch (_) {}

    try {
      await coreClient.query("ROLLBACK");
    } catch (_) {}

    console.error(
      "[ERROR_CREAR_CAMPANIA_SERVICE]",
      error
    );

    throw error;

  } finally {

    panelClient.release();
    coreClient.release();

  }

};

// ======================================================
// OBTENER CAMPAÑA COMPLETA
// ======================================================

export const obtenerCampaniaCompletaService = async (id) => {

  if (!id) {
    throw new Error("ID requerido");
  }

  const panelClient = await db.connect();
  const coreClient = await dbdigital.connect();

  try {

    // ======================================================
    // CONSULTAS SECUENCIALES
    // ======================================================

    const adminCampRes = await panelClient.query(
      GET_CAMPANIA_ADMIN,
      [id]
    );

    const agentCampRes = await panelClient.query(
      GET_CAMPANIA_AGENT,
      [id]
    );

    const modulosRes = await panelClient.query(
      GET_CONTROL_MODULOS,
      [id]
    );

    const coreCampRes = await coreClient.query(
      GET_CAMPANIA_CORE,
      [id]
    );

    const coreIniRes = await coreClient.query(
      GET_CAMPANIA_CORE_INI,
      [id]
    );

    return {
      ok: true,
      data: {
        admin: adminCampRes.rows[0] || null,
        agent: agentCampRes.rows[0] || null,
        control_modulos: modulosRes.rows || [],
        core: coreCampRes.rows[0] || null,
        core_ini: coreIniRes.rows || []
      }
    };

  } catch (error) {

    console.error(
      "[ERROR_OBTENER_CAMPANIA]",
      error
    );

    throw error;

  } finally {

    panelClient.release();
    coreClient.release();

  }

};

// ======================================================
// ELIMINAR CAMPAÑA COMPLETA
// ======================================================

export const eliminarCampaniaCompletaService = async (id) => {

  if (!id) {
    throw new Error("ID requerido");
  }

  const panelClient = await db.connect();
  const coreClient = await dbdigital.connect();

  try {

    // ======================================================
    // BEGIN
    // ======================================================

    await panelClient.query("BEGIN");
    await coreClient.query("BEGIN");

    // ======================================================
    // DELETE CONTROL MODULOS
    // ======================================================

    await panelClient.query(
      DELETE_CONTROL_MODULOS,
      [id]
    );

    // ======================================================
    // DELETE ADMIN.CAMPANAS
    // ======================================================

    await panelClient.query(
      DELETE_ADMIN_CAMPANA,
      [id]
    );

    // ======================================================
    // DELETE AGENT.CAMPANAS
    // ======================================================

    await panelClient.query(
      DELETE_AGENT_CAMPANA,
      [id]
    );

    // ======================================================
    // DELETE CORE.CAMPANAS_INI
    // ======================================================

    await coreClient.query(
      DELETE_CORE_CAMPANIA_INI,
      [id]
    );

    // ======================================================
    // DELETE CORE.CAMPANAS
    // ======================================================

    await coreClient.query(
      DELETE_CORE_CAMPANIA,
      [id]
    );

    // ======================================================
    // COMMIT
    // ======================================================

    await panelClient.query("COMMIT");
    await coreClient.query("COMMIT");

    return {
      ok: true,
      message: "Campaña eliminada completamente"
    };

  } catch (error) {

    // ======================================================
    // ROLLBACK
    // ======================================================

    try {
      await panelClient.query("ROLLBACK");
    } catch (_) {}

    try {
      await coreClient.query("ROLLBACK");
    } catch (_) {}

    console.error(
      "[ERROR_DELETE_CAMPANIA]",
      error
    );

    throw error;

  } finally {

    panelClient.release();
    coreClient.release();

  }

};
// ======================================================
// OBTENER TODAS LAS CAMPAÑAS
// ======================================================

export const obtenerTodasCampaniasService = async () => {

  const panelClient = await db.connect();
  const coreClient = await dbdigital.connect();

  try {

    const campaniasRes = await panelClient.query(
      GET_ALL_CAMPANIAS_ADMIN
    );

    const result = [];

    for (const campania of campaniasRes.rows) {

      const id = campania.id_camp;

      const agentRes = await panelClient.query(
        GET_CAMPANIA_AGENT,
        [id]
      );

      const modulosRes = await panelClient.query(
        GET_CONTROL_MODULOS,
        [id]
      );

      const coreRes = await coreClient.query(
        GET_CAMPANIA_CORE,
        [id]
      );

      const coreIniRes = await coreClient.query(
        GET_CAMPANIA_CORE_INI,
        [id]
      );

      result.push({
        admin: campania,
        agent: agentRes.rows[0] || null,
        control_modulos: modulosRes.rows || [],
        core: coreRes.rows[0] || null,
        core_ini: coreIniRes.rows || []
      });

    }

    return {
      ok: true,
      data: result
    };

  } finally {

    panelClient.release();
    coreClient.release();

  }

};
// edicion de elementos de campaña
export const agregarIniCampaniaService = async ({
  idCamp,
  iniCampania,
  producto,
  campaniaName
}) => {

  if (!idCamp) {
    throw new Error("idCamp requerido");
  }

  const validate = await panelClient.query(
    GET_CAMPANIA_ADMIN,
    [idCamp]
  );

  if (validate.rows.length === 0) {
    throw new Error("La campaña no existe");
  }

  const result = await panelClient.query(
    INSERT_NEW_INI_CAMPANIA,
    [
      idCamp,
      iniCampania || "",
      producto || "",
      campaniaName || ""
    ]
  );

  return result.rows[0];

};
export const editarCampaniaService = async ({
  idCamp,
  nombre,
  activa
}) => {

  if (!idCamp) {
    throw new Error("idCamp requerido");
  }

  await panelClient.query(
    UPDATE_ADMIN_CAMPANA,
    [idCamp, nombre, activa]
  );

  await panelClient.query(
    UPDATE_AGENT_CAMPANA,
    [idCamp, nombre, activa]
  );

  await panelClient.query(
    UPDATE_CORE_CAMPANA,
    [idCamp, nombre, activa]
  );

  return true;

};
export const editarIniCampaniaService = async ({
  id_orden,
  iniCampania,
  producto,
  campaniaName
}) => {

  if (!id_orden) {
    throw new Error("ID requerido");
  }

  const result = await panelClient.query(
    UPDATE_CORE_CAMPANIA_INI,
    [
      id_orden,
      iniCampania,
      producto,
      campaniaName
    ]
  );

  return result.rows[0];

};