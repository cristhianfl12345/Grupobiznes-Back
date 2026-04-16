import { getLeadsByFechaService } from './leads.service.js'
import { getSubcampaniasService } from './leads.service.js'
import { getLeadsPanel } from './leads.service.js'
import { getVistasCampanaService } from './leads.service.js'

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