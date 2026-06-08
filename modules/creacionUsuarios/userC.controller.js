//back/modules/creacionUsuarios/userC.controller.js
import {
  buscarDniService,
  obtenerDetalleService
} from "./userC.service.js";
import {
  crearPersonaService
} from "./userC.service.js"
/**
 * BUSCAR DNI
 */
export async function buscarDniController(req, res) {

  try {

    const { dni } = req.body;

    if (!dni) {
      return res.status(400).json({
        status: false,
        message: "DNI requerido"
      });
    }

    const data = await buscarDniService(dni);

    if (!data) {
      return res.status(404).json({
        status: false,
        message: "Persona no encontrada"
      });
    }

    res.json({
      status: true,
      data
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      status: false,
      message: error.message
    });

  }
}

/**
 * DETALLE PERSONA
 */
export async function obtenerDetalleController(req, res) {

  try {

    const { dni } = req.params;

    const data = await obtenerDetalleService(dni);

    if (!data) {
      return res.status(404).json({
        status: false,
        message: "Persona no encontrada"
      });
    }

    res.json({
      status: true,
      data
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      status: false,
      message: error.message
    });

  }
}

// =========================
// CREAR PERSONA
// =========================
export async function crearPersonaController(req, res) {

  try {

    const data = req.body

    // =========================
    // VALIDACIONES
    // =========================
    if (!data.numero_documento) {
      return res.status(400).json({
        status: false,
        message: "Número documento requerido"
      })
    }

    if (!data.nombres) {
      return res.status(400).json({
        status: false,
        message: "Nombres requeridos"
      })
    }

    if (!data.ape_paterno) {
      return res.status(400).json({
        status: false,
        message: "Apellido paterno requerido"
      })
    }

    if (!data.ape_materno) {
      return res.status(400).json({
        status: false,
        message: "Apellido materno requerido"
      })
    }

    // =========================
    // SERVICE
    // =========================
    const persona = await crearPersonaService(data)

    return res.status(201).json({
      status: true,
      message: "Persona registrada correctamente",
      data: persona
    })

  } catch (error) {

    console.error("ERROR CREAR PERSONA:", error)

    return res.status(500).json({
      status: false,
      message: "Ocurrió un error interno del servidor o el Documento ya se encuentra registrado"
    })

  }
}