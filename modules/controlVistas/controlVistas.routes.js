// back/modules/controlVistas/controlVistas.routes.js

import express from "express";

import {
  getControlVistaController,
  updateControlVistaController,
  getControlVistaAgenteController,
  updateControlVistaAgenteController
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




/**
 * Obtener configuración de vista por campaña  AGENTEEEEE
 * GET /control-vistas/:idCamp
 */
router.get(
  "/vista-agente/:idCamp",
  getControlVistaAgenteController
);

/**
 * Actualizar configuración de vista  AGENTEEEEE
 * PUT /control-vistas
 */
router.put(
  "/vista-agente/",
  updateControlVistaAgenteController
);


export default router;