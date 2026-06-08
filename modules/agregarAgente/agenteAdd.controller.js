// back/modules/agregarAgente/agenteAdd.controller.js

import {
  crearAgenteService,
  buscarPersonaService,
  actualizarHorarioCampanaService
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