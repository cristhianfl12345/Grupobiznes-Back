import { getLeadsByFechaService } from './leads.service.js'
import { getSubcampaniasService } from './leads.service.js'
import { getLeadsPanel } from './leads.service.js'
import { getVistasCampanaService } from './leads.service.js'
import { getAgentesCampanaService } from './leads.service.js'
import { getMasivosCarterizadoService } from './leads.service.js'
import { carterizarIndividualService } from './leads.service.js'
import { getLeadsConAgentesService } from './leads.service.js'
import { updateLeadAsignadoService } from './leads.service.js'
import { getLeadsDisponiblesService } from './leads.service.js'
import { asignarLeadsMasivamenteService } from './leads.service.js'

export const getLeadsByFechaController = async (req, res) => {
  try {

const { idCamp, iniCampania, fechaIngreso } = req.query

if (!idCamp || !fechaIngreso) {
  return res.status(400).json({
    message: 'IdCamp y FechaIngreso son obligatorios'
  })
}

const leads = await getLeadsByFechaService(
  Number(idCamp),
  iniCampania || null,
  fechaIngreso
)

    return res.json({
      total: leads.length,
      data: leads
    })

  } catch (error) {
    console.error('Error leads:', error)
    return res.status(500).json({
      message: 'Error servidor'
    })
  }
}
export const getSubcampaniasController = async (req, res) => {
  try {

    const { idCamp } = req.params

    if (!idCamp) {
      return res.status(400).json({
        message: 'IdCamp requerido'
      })
    }

    const data = await getSubcampaniasService(Number(idCamp))

    return res.json(data)

  } catch (error) {
    console.error('Error subcampanias:', error)
    return res.status(500).json({
      message: 'Error servidor'
    })
  }
}
export const listarLeads = async (req, res) => {
  try {
    const { idCamp, page = 1, limit = 50 } = req.query

    const offset = (page - 1) * limit

    const leads = await getLeadsPanel(idCamp, limit, offset)

    res.json(leads)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error obteniendo leads' })
  }
}
export const getVistasCampanaController = async (req, res) => {
  try {

    const { idCamp } = req.params

    if (!idCamp) {
      return res.status(400).json({
        message: 'IdCamp requerido'
      })
    }

    const vistas = await getVistasCampanaService(Number(idCamp))

    return res.json(vistas)

  } catch (error) {
    console.error('Error vistas:', error)

    return res.status(500).json({
      message: 'Error servidor'
    })
  }
}

// =========================================================
// GET AGENTES CAMPAÑA
// =========================================================

export const getAgentesCampanaController = async (req, res) => {
  try {

    const { idCamp } = req.params

    if (!idCamp) {
      return res.status(400).json({
        message: 'IdCamp requerido'
      })
    }

    const agentes = await getAgentesCampanaService(
      Number(idCamp)
    )

    return res.json({
      total: agentes.length,
      data: agentes
    })

  } catch (error) {

    console.error('Error agentes campaña:', error)

    return res.status(500).json({
      message: 'Error servidor'
    })

  }
}

export const getMasivosCarterizadoController = async (
  req,
  res
) => {

  try {

    const { idCamp, idPlataforma } = req.params

    if (!idCamp || !idPlataforma) {

      return res.status(400).json({
        message:
          'idCamp e idPlataforma son requeridos'
      })

    }

    const data =
      await getMasivosCarterizadoService(
        Number(idCamp),
        Number(idPlataforma)
      )

    return res.json(data)

  } catch (error) {

    console.error(
      'Error masivos carterizado:',
      error
    )

    return res.status(500).json({
      message: 'Error servidor'
    })

  }

}
export const carterizarIndividualController = async (
  req,
  res
) => {

  try {

    const {
      idLead,
      idCamp,
      idUsuario
    } = req.body

    if (
      !idLead ||
      !idCamp ||
      !idUsuario
    ) {

      return res.status(400).json({
        message:
          'idLead, idCamp e idUsuario son requeridos'
      })

    }

    const data =
      await carterizarIndividualService(
        Number(idLead),
        Number(idCamp),
        Number(idUsuario)
      )

    return res.status(201).json({
      message: 'Lead asignado correctamente',
      data
    })

  } catch (error) {

    console.error(
      'Error carterizando lead:',
      error
    )

    return res.status(500).json({
      message: 'Error servidor'
    })

  }

}
export const getLeadsConAgentesController =
  async (req, res) => {

    try {

      const { idCamp } = req.params

      if (!idCamp) {

        return res.status(400).json({
          message: 'idCamp requerido'
        })

      }

      const data =
        await getLeadsConAgentesService(
          Number(idCamp)
        )

      return res.json(data)

    } catch (error) {

      console.error(
        'Error obteniendo asignaciones:',
        error
      )

      return res.status(500).json({
        message: 'Error servidor'
      })

    }

  }
  // update de agentes carterizado
  export const updateLeadAsignadoController = async (
  req,
  res
) => {

  try {

    const {
      idLead,
      idUsuario
    } = req.body;

    if (!idLead || !idUsuario) {

      return res.status(400).json({
        ok: false,
        message:
          "idLead e idUsuario son obligatorios"
      });

    }

    const resultado =
      await updateLeadAsignadoService(
        Number(idLead),
        Number(idUsuario)
      );

    if (!resultado) {

      return res.status(404).json({
        ok: false,
        message:
          "Lead no encontrado o sin cambios"
      });

    }

    return res.json({
      ok: true,
      message:
        "Lead reasignado correctamente",
      data: resultado
    });

  } catch (error) {

    console.error(
      "Error updateLeadAsignadoController:",
      error
    );

    return res.status(500).json({
      ok: false,
      message:
        "Error interno del servidor"
    });

  }

};

export const getLeadsDisponiblesController = async (req, res) => {
  try {
    const {
      fechaInicio,
      fechaFin,
      idCamp
    } = req.query;

    if (!fechaInicio || !fechaFin || !idCamp) {
      return res.status(400).json({
        ok: false,
        message: "fechaInicio, fechaFin e idCamp son requeridos"
      });
    }

    const leads = await getLeadsDisponiblesService(
      fechaInicio,
      fechaFin,
      Number(idCamp)
    );

    return res.status(200).json({
      ok: true,
      total: leads.length,
      data: leads
    });

  } catch (error) {
    console.error("Error obteniendo leads disponibles:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor"
    });
  }
};
// asignacion

export const asignarLeadsMasivamenteController = async (
  req,
  res
) => {

  try {

    const {
      fechaInicio,
      fechaFin,
      idCamp,
      usuarios
    } = req.body;

    if (!fechaInicio) {
      return res.status(400).json({
        ok: false,
        message: "fechaInicio es requerida"
      });
    }

    if (!fechaFin) {
      return res.status(400).json({
        ok: false,
        message: "fechaFin es requerida"
      });
    }

    if (!idCamp) {
      return res.status(400).json({
        ok: false,
        message: "idCamp es requerido"
      });
    }

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "Debe enviar al menos un usuario"
      });
    }

    const resultado =
      await asignarLeadsMasivamenteService(
        fechaInicio,
        fechaFin,
        Number(idCamp),
        usuarios.map(Number)
      );

    return res.status(200).json({
      ok: true,
      message: "Leads asignados correctamente",
      ...resultado
    });

  } catch (error) {

    console.error(
      "Error asignando leads masivamente:",
      error
    );

    return res.status(500).json({
      ok: false,
      message: error.message || "Error interno del servidor"
    });

  }
};