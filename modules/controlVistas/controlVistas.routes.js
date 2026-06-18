// back/modules/controlVistas/controlVistas.routes.js

import express from "express";

import {
  getControlVistaController,
  updateControlVistaController
} from "./controlVistas.controller.js";

const router = express.Router();

/**
 * Obtener configuración de vista por campaña
 * GET /control-vistas/:idCamp
 */
router.get(
  "/:idCamp",
  getControlVistaController
);

/**
 * Actualizar configuración de vista
 * PUT /control-vistas
 */
router.put(
  "/",
  updateControlVistaController
);

export default router;