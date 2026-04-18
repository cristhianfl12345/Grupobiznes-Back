//back/modules/controlModulos/controlM.controller.js
import express from "express";
import {
  getControlModulos,
  getControlModulosByFilter,
  updateModuloEstado,
  insertControlModulo,
  deleteControlModulo
} from "./controlM.service.js";

import { verifyToken } from "../../controllers/auth.js";

const router = express.Router();

// ==============================
// MIDDLEWARE DE ROLES
// ==============================
const checkRole = (rolesPermitidos) => (req, res, next) => {
  if (!rolesPermitidos.includes(req.user.id_tipo_usuario)) {
    return res.status(403).json({
      ok: false,
      message: "No autorizado"
    });
  }
  next();
};

// Roles con acceso total
const ROLES_FULL = [1, 2, 6];

// ==============================
// GET TODOS / FILTRADO
// ==============================
router.get(
  "/control-modulos",
  verifyToken,
  checkRole(ROLES_FULL),
  async (req, res) => {
    try {
      const { idCamp, idModulo } = req.query;

      let data;

      if (idCamp || idModulo) {
        data = await getControlModulosByFilter(
          idCamp ? Number(idCamp) : null,
          idModulo ? Number(idModulo) : null
        );
      } else {
        data = await getControlModulos();
      }

      res.json({
        ok: true,
        data
      });

    } catch (error) {
      console.error("Error GET control modulos:", error);
      res.status(500).json({
        ok: false,
        message: "Error interno"
      });
    }
  }
);

// ==============================
// UPDATE ESTADO
// ==============================
router.put(
  "/control-modulos",
  verifyToken,
  checkRole(ROLES_FULL),
  async (req, res) => {
    try {
      const { idCamp, idModulo, modulo_activo } = req.body;

      if (
        idCamp === undefined ||
        idModulo === undefined ||
        modulo_activo === undefined
      ) {
        return res.status(400).json({
          ok: false,
          message: "Parámetros incompletos"
        });
      }

      await updateModuloEstado(
        Number(idCamp),
        Number(idModulo),
        Boolean(modulo_activo)
      );

      res.json({
        ok: true,
        message: "Estado actualizado"
      });

    } catch (error) {
      console.error("Error UPDATE modulo:", error);
      res.status(500).json({
        ok: false,
        message: "Error interno"
      });
    }
  }
);

// ==============================
// INSERT
// ==============================
router.post(
  "/control-modulos",
  verifyToken,
  checkRole(ROLES_FULL),
  async (req, res) => {
    try {
      const { idCamp, idModulo, modulo_activo } = req.body;

      if (
        idCamp === undefined ||
        idModulo === undefined ||
        modulo_activo === undefined
      ) {
        return res.status(400).json({
          ok: false,
          message: "Parámetros incompletos"
        });
      }

      const data = await insertControlModulo(
        Number(idCamp),
        Number(idModulo),
        Boolean(modulo_activo)
      );

      res.json({
        ok: true,
        data
      });

    } catch (error) {
      console.error("Error INSERT modulo:", error);

      // manejo de duplicados (por índice único)
      if (error.code === "23505") {
        return res.status(400).json({
          ok: false,
          message: "El módulo ya existe para esta campaña"
        });
      }

      res.status(500).json({
        ok: false,
        message: "Error interno"
      });
    }
  }
);

// ==============================
// DELETE
// ==============================
router.delete(
  "/control-modulos",
  verifyToken,
  checkRole(ROLES_FULL),
  async (req, res) => {
    try {
      const { idCamp, idModulo } = req.body;

      if (idCamp === undefined || idModulo === undefined) {
        return res.status(400).json({
          ok: false,
          message: "Parámetros incompletos"
        });
      }

      await deleteControlModulo(
        Number(idCamp),
        Number(idModulo)
      );

      res.json({
        ok: true,
        message: "Eliminado correctamente"
      });

    } catch (error) {
      console.error("Error DELETE modulo:", error);
      res.status(500).json({
        ok: false,
        message: "Error interno"
      });
    }
  }
);

export default router;