//back/modules/creacionUsuarios/userC.routes.js
import { Router } from "express";
import { verifyToken } from "../../controllers/auth.js";
import {
  buscarDniController,
  obtenerDetalleController,
  crearPersonaController
} from "./userC.controller.js";

const router = Router();

/**
 * BUSCAR DNI
 */
router.post(
  "/buscar-dni", verifyToken,
  buscarDniController
);

/**
 * OBTENER DETALLE
 */
router.get(
  "/detalle-persona/:dni",
  verifyToken,
  obtenerDetalleController
);
// crear personal
router.post(
  "/crear-persona", verifyToken,
  crearPersonaController
)
export default router;