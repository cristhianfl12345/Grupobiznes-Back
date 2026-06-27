//back/modules/homeDashboard/home.service.js

import { dbdigital } from '../../config/dbdigital.js'
import { db } from '../../config/db.js'

import {
  QUERY_GET_USUARIOS_HOME,
  QUERY_GET_CAMPANAS_HOME_DASHBOARD,
  QUERY_CONTADOR_LEADS,
  QUERY_AGENTES_CONECTADOS
} from './home.queries.js'

const TIPOS_FULL_ACCESS = [1, 2, 6]

export const getHomeDashboardService = async (idUsuario) => {

  // Obtener tipo de usuario
  const userRes = await db.query(
    QUERY_GET_USUARIOS_HOME,
    [idUsuario]
  )

  if (!userRes.rows.length) {
    throw new Error('Usuario no encontrado')
  }

  const usuario = userRes.rows[0]

  let campanas = []

  // Todas las campañas
  if (TIPOS_FULL_ACCESS.includes(usuario.id_tipo_usuario)) {

    const allCamp = await db.query(
      QUERY_GET_CAMPANAS_HOME_DASHBOARD
    )

    campanas = allCamp.rows

  } else {

    const userCamp = await db.query(
      `
      SELECT
        c.id_camp AS "IdCamp",
        c.nombre AS "Campana"
      FROM admin.ra_usuario_camp ruc
      INNER JOIN admin.campanas c
        ON c.id_camp = ruc.id_camp
      WHERE ruc.id_usuario = $1
        AND c.activa = true
      `,
      [idUsuario]
    )

    campanas = userCamp.rows
  }

  const result = await Promise.all(

    campanas.map(async (camp) => {

      const [leadsRes, agentesRes] = await Promise.all([

        dbdigital.query(
          QUERY_CONTADOR_LEADS,
          [camp.IdCamp]
        ),

        dbdigital.query(
          QUERY_AGENTES_CONECTADOS,
          [camp.IdCamp]
        )

      ])

      return {

        IdCamp: camp.IdCamp,
        Campana: camp.Campana,

        leads: Number(leadsRes.rows[0].count),

        agentes_conectados: {
          full: agentesRes.rows[0]?.agente_full_conectado ?? 0,
          partial: agentesRes.rows[0]?.agente_part_conectado ?? 0
        }

      }

    })

  )

  return result

}