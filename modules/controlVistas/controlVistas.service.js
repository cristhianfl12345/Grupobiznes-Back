// back/modules/controlVistas/controlVistas.service.js

import { db } from "../../config/db.js";
import {
  QUERY_GET_VISTAS_CAMPANA,
  QUERY_UPDATE_VISTA,
  QUERY_GET_VISTAS_AGENTE_CAMPANA,
  QUERY_UPDATE_VISTA_AGENTE
} from "./controlVistas.queries.js";

export const getControlVistaService = async (idCamp) => {

  const result = await db.query(
    QUERY_GET_VISTAS_CAMPANA,
    [idCamp]
  );

 // console.log(result);

  return result.rows;
};
export const updateControlVistaService = async ({
  idOrdenVista,
  activo,
  orden,
  nivel_vista
}) => {

  const result = await db.query(
    QUERY_UPDATE_VISTA,
    [
      activo,
      orden,
      nivel_vista,
      idOrdenVista
    ]
  );

  return result;
};


//agente
export const getControlVistaAgenteService = async (idCamp) => {

  const result = await db.query(
    QUERY_GET_VISTAS_AGENTE_CAMPANA,
    [idCamp]
  );

 // console.log(result);

  return result.rows;
};
export const updateControlVistaAgenteService = async ({
  idOrdenVista,
  activo,
  orden,
  nivel_vista
}) => {

  const result = await db.query(
    QUERY_UPDATE_VISTA_AGENTE,
    [
      activo,
      orden,
      idOrdenVista
    ]
  );

  return result;
};