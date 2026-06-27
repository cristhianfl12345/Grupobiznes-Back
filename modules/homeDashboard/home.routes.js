//back/modules/homeDashboard/home.routes.js
import express from 'express'
import { getHomeDashboard } from './home.controller.js'

const router = express.Router();

router.get('/home/:idUsuario', getHomeDashboard)

export default router