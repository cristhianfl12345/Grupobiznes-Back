import { dbdigital } from '../../config/dbdigital.js'
import { QUERY_BUSCAR_LEADS } from "./busqueda.queries.js";

/* =========================================================
   SERVICE
========================================================= */
export const buscarLeadsService = async ({
  idCamp,
  idKey = null,
  telefono = null,
  dni = null
}) => {
  try {
    if (!idCamp) {
      throw new Error("IdCamp es obligatorio");
    }

    if (!idKey && !telefono && !dni) {
      throw new Error("Debe enviar al menos un parámetro de búsqueda");
    }

    const params = [
      idCamp,
      idKey || null,
      telefono || null,
      dni || null
    ];

    const result = await dbdigital.query(
      QUERY_BUSCAR_LEADS,
      params
    );

    return result.rows;

  } catch (error) {
    console.error("Error en buscarLeadsService:", error);
    throw error;
  }
};


/* =========================================================
   CONTROLLER
========================================================= */
export const buscarLeadsController = async (req, res) => {
  try {
    const { camp, idKey, telefono, dni } = req.query;

    const data = await buscarLeadsService({
      idCamp: camp,
      idKey,
      telefono,
      dni
    });

    return res.status(200).json({
      ok: true,
      data
    });

  } catch (error) {
    console.error("Error en buscarLeadsController:", error);

    return res.status(500).json({
      ok: false,
      message: error.message || "Error interno del servidor"
    });
  }
};