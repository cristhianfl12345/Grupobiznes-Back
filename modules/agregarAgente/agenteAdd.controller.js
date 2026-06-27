// back/modules/agregarAgente/agenteAdd.controller.js

import {
  crearAgenteService,
  buscarPersonaService,
  actualizarHorarioCampanaService,
  activarUsuarioCampanaService,
  actualizarTipoCampanaService,
  obtenerTipoCampanaService
} from './agenteAdd.service.js'

// ======================================================
// BUSCAR PERSONA
// ======================================================

export const buscarPersonaController = async (
  req,
  res
) => {

  try {

    const { dni } = req.params

    const result =
      await buscarPersonaService(dni)

    return res.status(200).json(result)

  } catch (error) {

    console.error(
      'buscarPersonaController:',
      error
    )

    return res.status(500).json({
      ok: false,
      message:
        error.message || 'Error interno'
    })
  }
}

// ======================================================
// CREAR AGENTE
// ======================================================

export const crearAgenteController = async (
  req,
  res
) => {

  try {

    const result =
      await crearAgenteService(req.body)

    return res.status(200).json(result)

  } catch (error) {

    console.error(
      'crearAgenteController:',
      error
    )

    return res.status(500).json({
      ok: false,
      message:
        error.message || 'Error interno'
    })
  }
}
// ======================================================
// ACTUALIZAR HORARIO + CAMPAÑA
// ======================================================

export const actualizarHorarioCampanaController = async (
  req,
  res
) => {

  try {

    const result =
      await actualizarHorarioCampanaService(req.body)

    return res.status(200).json(result)

  } catch (error) {

    console.error(
      'actualizarHorarioCampanaController:',
      error
    )

    return res.status(500).json({
      ok: false,
      message:
        error.message || 'Error interno'
    })
  }
}
// ======================================================
// ACTIVAR USUARIO EN CAMPAÑA
// ======================================================

export const activarUsuarioCampanaController = async (
  req,
  res
) => {

  try {

    const result =
      await activarUsuarioCampanaService(req.body)

    return res.status(200).json(result)

  } catch (error) {

    console.error(
      'activarUsuarioCampanaController:',
      error
    )

    return res.status(400).json({
      ok: false,
      message:
        error.message || 'Error interno'
    })
  }
}
//TIPO CAMPANA
export const actualizarTipoCampanaController = async (req, res) => {

  try {

    const {
      id_usuario,
      id_campana
    } = req.body

    if (!id_usuario || !id_campana) {
      return res.status(400).json({
        ok: false,
        message: "id_usuario e id_campana son requeridos"
      })
    }

    const data = await actualizarTipoCampanaService({
      id_usuario: Number(id_usuario),
      id_campana: Number(id_campana)
    })

    return res.status(200).json(data)

  } catch (error) {

    console.error("Error actualizarTipoCampanaController:", error)

    return res.status(500).json({
      ok: false,
      message: error.message || "Error interno del servidor"
    })
  }

}
export const obtenerTipoCampanaController = async (req, res) => {

  try {

    const { id_usuario, id_campana } = req.params

    const data = await obtenerTipoCampanaService({
      id_usuario: Number(id_usuario),
      id_campana: Number(id_campana)
    })

    return res.status(200).json(data)

  } catch (error) {

    console.error(error)

    return res.status(500).json({
      ok: false,
      message: error.message
    })

  }

}