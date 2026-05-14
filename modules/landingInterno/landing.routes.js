//back/modules/landingInterno/landing.routes.js

import express from "express"

import {
  createLeadController,
  getCampaniaInfoController,
  getTiposBaseController,
  getTelefonoByIdkeyController
} from "./landing.controller.js"

const router = express.Router()


// ======================================
// GET INFO CAMPAÑA
// ======================================

router.get(
  "/campania",
  getCampaniaInfoController
)


// ======================================
// GET TIPOS BASE
// ======================================

router.get(
  "/tipos-base",
  getTiposBaseController
)


// ======================================
// CREATE LEAD
// ======================================

router.post(
  "/crear",
  createLeadController
)
router.get(
  "/telefono/:idkey",
  getTelefonoByIdkeyController
)

export default router
