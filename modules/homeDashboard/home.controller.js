//back/modules/homeDashboard/home.controller.js

import { getHomeDashboardService } from './home.service.js'

export const getHomeDashboard = async (req, res) => {
  try {

    const { idUsuario } = req.params

    const data = await getHomeDashboardService(idUsuario)

    return res.status(200).json({
      ok: true,
      data
    })

  } catch (error) {

    console.error('HOME DASHBOARD ERROR:', error)

    return res.status(500).json({
      ok: false,
      message: error.message
    })

  }
}