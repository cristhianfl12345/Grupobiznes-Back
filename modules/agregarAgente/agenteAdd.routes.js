// back/modules/agregarAgente/agenteAdd.routes.js

import { Router } from 'express'

import {
  crearAgenteController,
  buscarPersonaController,
  actualizarHorarioCampanaController,
  activarUsuarioCampanaController,
  actualizarTipoCampanaController,
  obtenerTipoCampanaController
} from './agenteAdd.controller.js'

const router = Router()

// ===========================================
// BUSCAR PERSONA POR DNI
// ===========================================

router.get(
  '/persona/:dni',
  buscarPersonaController
)

// ===========================================
// CREAR AGENTE
// ===========================================

router.post(
  '/crear-agente',
  crearAgenteController
)
//last added
router.post(
  '/actualizar-horario-campana',
  actualizarHorarioCampanaController
)
router.post(
  '/activar-campana',
  activarUsuarioCampanaController
)
router.put(
  "/usuario/tipo-campana",
  actualizarTipoCampanaController
)
router.get(
  "/usuario/tipo-campana/:id_usuario/:id_campana",
  obtenerTipoCampanaController
)

export default router