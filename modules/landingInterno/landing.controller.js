//back/modules/landingInterno/landing.controller.js

import {
  createLeadService,
  getCampaniaInfoService,
  getTiposBaseService,
  getTelefonoByIdkeyService
} from "./landing.service.js"


// ======================================================
// GET INFO CAMPAÑA
// ======================================================

export const getCampaniaInfoController = async (req, res) => {

  try {

    const { camp } = req.query

    if (!camp) {
      return res.status(400).json({
        status: false,
        message: "camp es requerido"
      })
    }

    const data = await getCampaniaInfoService(camp)

    return res.json({
      status: true,
      data
    })

  } catch (error) {

    console.error(error)

    return res.status(500).json({
      status: false,
      message: "Error obteniendo campaña"
    })
  }
}


// ======================================================
// GET TIPOS BASE
// ======================================================

export const getTiposBaseController = async (req, res) => {

  try {

    const { camp } = req.query

    if (!camp) {
      return res.status(400).json({
        status: false,
        message: "camp es requerido"
      })
    }

    const data = await getTiposBaseService(camp)

    return res.json({
      status: true,
      data
    })

  } catch (error) {

    console.error(error)

    return res.status(500).json({
      status: false,
      message: "Error obteniendo tipos base"
    })
  }
}


// ======================================================
// CREATE LEAD
// ======================================================

export const createLeadController = async (req, res) => {

  try {

const {
  nombres,
  apellidos,
  dni,
  telefono,
  email,
  provincia,
  comentario,
  permitellamada,
  idcampania,
  id_tipobase,
  idusuario,
  campania,
  producto,
  id_anuncio
} = req.body

    // ================================
    // VALIDACIONES
    // ================================

    if (!nombres) {
      return res.status(400).json({
        status: false,
        message: "nombres requerido"
      })
    }

    if (!apellidos) {
      return res.status(400).json({
        status: false,
        message: "apellidos requerido"
      })
    }

    if (!dni) {
      return res.status(400).json({
        status: false,
        message: "dni requerido"
      })
    }

    if (!telefono) {
      return res.status(400).json({
        status: false,
        message: "telefono requerido"
      })
    }

    if (!idcampania) {
      return res.status(400).json({
        status: false,
        message: "idcampania requerido"
      })
    }

    if (!id_tipobase) {
      return res.status(400).json({
        status: false,
        message: "id_tipobase requerido"
      })
    }

    if (!idusuario) {
      return res.status(400).json({
        status: false,
        message: "idusuario requerido"
      })
    }

    // ================================
    // CREAR LEAD
    // ================================

const data = await createLeadService({
  nombres,
  apellidos,
  dni,
  telefono,
  email,
 provincia,
  comentario,
  permitellamada,
  idcampania,
  id_tipobase,
  idusuario,
  campania,
  producto,
  id_anuncio
})

    return res.status(201).json({
      status: true,
      message: "Lead creado correctamente",
      data
    })

  } catch (error) {

    console.error(error)

    return res.status(500).json({
      status: false,
      message: error.message || "Error creando lead"
    })
  }
}
// ======================================================
// GET TELEFONO BY IDKEY
// ======================================================

export const getTelefonoByIdkeyController = async (req, res) => {

  try {

    const { idkey } = req.params

    if (!idkey) {
      return res.status(400).json({
        status: false,
        message: "idkey es requerido"
      })
    }

    const data = await getTelefonoByIdkeyService(idkey)

    if (!data) {
      return res.status(404).json({
        status: false,
        message: "No se encontró información"
      })
    }

    return res.json({
      status: true,
      data
    })

  } catch (error) {

    console.error(error)

    return res.status(500).json({
      status: false,
      message: "Error obteniendo teléfono"
    })
  }
}