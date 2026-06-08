import { Router } from 'express'
import { getLeadsByFechaController, getSubcampaniasController } from './leads.controller.js'
import { listarLeads } from './leads.controller.js'
import { getVistasCampanaController } from './leads.controller.js'
import { getAgentesCampanaController } from './leads.controller.js'
import { getMasivosCarterizadoController } from './leads.controller.js'
import { carterizarIndividualController } from './leads.controller.js'
import { getLeadsConAgentesController } from './leads.controller.js'
import { updateLeadAsignadoController } from './leads.controller.js'
const router = Router()

router.get('/', getLeadsByFechaController)
router.get(
  '/subcampanias/:idCamp',
  getSubcampaniasController
)
router.get('/panel', listarLeads)
export default router
router.get(
  '/vistas/:idCamp',
  getVistasCampanaController
)
router.get(
  '/agentes-campana/:idCamp',
  getAgentesCampanaController
)
router.get(
  '/masivos-carterizado/:idCamp/:idPlataforma',
  getMasivosCarterizadoController
)
router.post(
  '/carterizar-individual',
  carterizarIndividualController
)
router.get(
  '/leads-asignados/:idCamp',
  getLeadsConAgentesController
)
router.put(
  "/reasignar-lead",
  updateLeadAsignadoController
);