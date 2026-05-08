//back/modules/controlSupervisor/controlS.controller.js

import { getControlSupervisorService } from "./controlS.service.js";

export const getControlSupervisorController = async (req, res) => {
  try {
    const result = await getControlSupervisorService();

    if (!result.status) {
      return res.status(500).json({
        status: false,
        error: result.error || "Error interno"
      });
    }

    res.json({
      status: true,
      data: result.data
    });

  } catch (error) {
    console.error("Controller error:", error);

    res.status(500).json({
      status: false,
      error: "Error en el controlador de Control Supervisor"
    });
  }
};