//back/modules/mBases/moduloBases.js

import express from "express";
import { sql, poolPromise } from "../../config/dbmaster.js";
import {
  QUERY_RESUMEN_BASES,
  QUERY_DETALLE_BASES
} from "./bases.queries.js";

// ======================================================
// ROUTER (Controller Layer)
// ======================================================
const router = express.Router();

/**
 * GET /modulo-bases?camp=90
 * Devuelve resumen agregado por base
 */
router.get("/", async (req, res) => {
  try {
    const { camp, detalle } = req.query;

    // =========================
    // VALIDACIÓN
    // =========================
    if (!camp) {
      return res.status(400).json({
        ok: false,
        msg: "El parámetro 'camp' es requerido"
      });
    }

    const idCamp = parseInt(camp, 10);

    if (isNaN(idCamp)) {
      return res.status(400).json({
        ok: false,
        msg: "'camp' debe ser numérico"
      });
    }

    // =========================
    // SERVICE CALL
    // =========================
    const data = await serviceGetBases({ idCamp, detalle });

    return res.json({
      ok: true,
      data
    });

  } catch (error) {
    console.error("Error en /modulo-bases:", error);

    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor"
    });
  }
});


// ======================================================
// SERVICE (Business Logic)
// ======================================================
const serviceGetBases = async ({ idCamp, detalle }) => {
  const pool = await poolPromise;

  const request = pool.request()
    .input("IdCamp", sql.Int, idCamp);

  // Si quieres ver data cruda: /modulo-bases?camp=90&detalle=1
  const query = detalle ? QUERY_DETALLE_BASES : QUERY_RESUMEN_BASES;

  const result = await request.query(query);

  return result.recordset;
};


// ======================================================
// EXPORT
// ======================================================
export default router;