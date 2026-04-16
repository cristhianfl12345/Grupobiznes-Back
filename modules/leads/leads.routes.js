import { Router } from 'express'
import { getLeadsByFechaController, getSubcampaniasController } from './leads.controller.js'
import { listarLeads } from './leads.controller.js'
import { getVistasCampanaController } from './leads.controller.js'

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
