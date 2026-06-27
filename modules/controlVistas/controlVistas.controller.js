// back/modules/controlVistas/controlVistas.controller.js

import {
  getControlVistaService,
  updateControlVistaService,
  getControlVistaAgenteService,
  updateControlVistaAgenteService
} from "./controlVistas.service.js";

export const getControlVistaController = async (req, res) => {
  try {
    const { idCamp } = req.params;

    if (!idCamp) {
      return res.status(400).json({
        ok: false,
        message: "idCamp es requerido"
      });
    }

    const data = await getControlVistaService(idCamp);

    return res.status(200).json({
      ok: true,
      data
    });

  } catch (error) {
    console.error("Error getControlVistaController:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener configuración de vista"
    });
  }
};

export const updateControlVistaController = async (req, res) => {
  try {

    const {
      idOrdenVista,
      activo,
      orden,
      nivel_vista
    } = req.body;

    if (!idOrdenVista) {
      return res.status(400).json({
        ok: false,
        message: "idOrdenVista es requerido"
      });
    }

    await updateControlVistaService({
      idOrdenVista,
      activo,
      orden,
      nivel_vista
    });

    return res.status(200).json({
      ok: true,
      message: "Vista actualizada correctamente"
    });

  } catch (error) {

    console.error("Error updateControlVistaController:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al actualizar vista"
    });

  }
};

// vistas agente



export const getControlVistaAgenteController = async (req, res) => {
  try {
    const { idCamp } = req.params;

    if (!idCamp) {
      return res.status(400).json({
        ok: false,
        message: "idCamp es requerido"
      });
    }

    const data = await getControlVistaAgenteService(idCamp);

    return res.status(200).json({
      ok: true,
      data
    });

  } catch (error) {
    console.error("Error getControlVistaController:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener configuración de vista"
    });
  }
};

export const updateControlVistaAgenteController = async (req, res) => {
  try {

    const {
      idOrdenVista,
      activo,
      orden
    } = req.body;

    if (!idOrdenVista) {
      return res.status(400).json({
        ok: false,
        message: "idOrdenVista es requerido"
      });
    }

    await updateControlVistaAgenteService({
      idOrdenVista,
      activo,
      orden
    });

    return res.status(200).json({
      ok: true,
      message: "Vista actualizada correctamente"
    });

  } catch (error) {

    console.error("Error updateControlVistaController:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al actualizar vista"
    });

  }
};