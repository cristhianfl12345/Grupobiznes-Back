//back/modules/controlModulos/controlM.service.js
import { pg_admindb } from "../../config/pg_admin.js";
import {
  QUERY_GET_CONTROL_MODULOS,
  QUERY_GET_CONTROL_MODULOS_BY_FILTER,
  QUERY_UPDATE_MODULO_ESTADO,
  QUERY_INSERT_CONTROL_MODULO,
  QUERY_DELETE_CONTROL_MODULO
} from "./controlM.queries.js";

// ==============================
// GET TODOS
// ==============================
export const getControlModulos = async () => {
  const { rows } = await pg_admindb.query(QUERY_GET_CONTROL_MODULOS);
  return rows;
};

// ==============================
// GET FILTRADO
// ==============================
export const getControlModulosByFilter = async (idCamp, idModulo) => {
  const { rows } = await pg_admindb.query(
    QUERY_GET_CONTROL_MODULOS_BY_FILTER,
    [idCamp || null, idModulo || null]
  );
  return rows;
};

// ==============================
// UPDATE ESTADO
// ==============================
export const updateModuloEstado = async (idCamp, idModulo, estado) => {
  await pg_admindb.query(
    QUERY_UPDATE_MODULO_ESTADO,
    [estado, idCamp, idModulo]
  );
  return { ok: true };
};

// ==============================
// INSERT
// ==============================
export const insertControlModulo = async (idCamp, idModulo, estado) => {
  const { rows } = await pg_admindb.query(
    QUERY_INSERT_CONTROL_MODULO,
    [idCamp, idModulo, estado]
  );
  return rows[0];
};

// ==============================
// DELETE
// ==============================
export const deleteControlModulo = async (idCamp, idModulo) => {
  await pg_admindb.query(
    QUERY_DELETE_CONTROL_MODULO,
    [idCamp, idModulo]
  );
  return { ok: true };
};