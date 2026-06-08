import { Router } from "express";

import {
  crearCampaniaController,
  obtenerCampaniaCompletaController,
  eliminarCampaniaCompletaController,
  obtenerTodasCampaniasController,
  agregarIniCampaniaController,
  editarCampaniaController,
  editarIniCampaniaController
} from "./crearCamp.controller.js";
import {
  updateCampaniaController
} from "./crearCamp.update.controller.js";
const router = Router();

// ======================================================
// CREAR
// ======================================================

router.post(
  "/crear",
  crearCampaniaController
);

// ======================================================
// GET
// ======================================================

router.get(
  "/:id",
  obtenerCampaniaCompletaController
);

// ======================================================
// DELETE
// ======================================================

router.delete(
  "/:id",
  eliminarCampaniaCompletaController
);
router.get(
  "/",
  obtenerTodasCampaniasController
);
// NUEVASRUTAS PARA UPDATES
router.post(
  "/agregar-ini",
  agregarIniCampaniaController
);

router.put(
  "/editar",
  editarCampaniaController
);

router.put(
  "/editar-ini",
  editarIniCampaniaController
);

router.put(
  "/editar/:id",
  updateCampaniaController
)
// ======================================================
// EXPORT
// ======================================================

export default router;