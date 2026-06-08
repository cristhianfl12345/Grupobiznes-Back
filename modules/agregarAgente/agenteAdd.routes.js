// back/modules/agregarAgente/agenteAdd.routes.js

import { Router } from 'express'

import {
  crearAgenteController,
  buscarPersonaController,
  actualizarHorarioCampanaController
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

export default router