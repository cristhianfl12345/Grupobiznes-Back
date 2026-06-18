import { dbdigital } from '../../config/dbdigital.js'
import { db } from '../../config/db.js' //PANEL

import {
  QUERY_LEADS_BASE,
  QUERY_SUBCAMPANIAS,
  QUERY_LEADS_PANEL,
  QUERY_VISTAS_CAMPANA,
  QUERY_GET_AGENTES_CAMPANA,
  QUERY_MASIVOS_CARTERIZADO,
  QUERY_CARTERIZAR_INDIVIDUAL,
  QUERY_GET_LEADS_ASIGNADOS,
  QUERY_GET_USUARIOS_POR_IDS,
  QUERY_UPDATE_USUARIO_CARTERIZADO,
  QUERY_GET_LEADS_DISPONIBLES,
  QUERY_ASIGNAR_LEAD

} from './leads.queries.js'


export const getLeadsByFechaService = async (idCamp, iniCampania, fechaIngreso) => {

  if (![200, 360, 280, 370, 340, 310, 90, 60].includes(idCamp)) {
    return []
  }

  let query = QUERY_LEADS_BASE
  const params = [idCamp, fechaIngreso]

  if (iniCampania) {
    query += ` AND lc.inicampania = $3`
    params.push(iniCampania)
  }

  query += ` ORDER BY l.idkey DESC`

  const { rows } = await dbdigital.query(query, params)

  return rows
}


export const getSubcampaniasService = async (idCamp) => {

  const { rows } = await dbdigital.query(
    QUERY_SUBCAMPANIAS,
    [idCamp]
  )

  return rows
}


export const getLeadsPanel = async (idCamp, limit, offset) => {

  const { rows } = await db.query(
    QUERY_LEADS_PANEL,
    [idCamp, limit, offset]
  )

  return rows
}


// ESTA CONSULTA DEBE USAR DB PANEL
export const getVistasCampanaService = async (idCamp) => {

  const { rows } = await db.query(
    QUERY_VISTAS_CAMPANA,
    [idCamp]
  )

  return rows
}


export const getAgentesCampanaService = async (idCamp) => {

  const { rows } = await db.query(
    QUERY_GET_AGENTES_CAMPANA,
    [idCamp]
  )

  return rows
}

// NUEVO: FILTRAR COLUMNAS SEGÚN VISTAS
export const getLeadsFiltradosService = async (idCamp, iniCampania, fechaIngreso) => {

  //  obtener columnas permitidas desde panel
  const { rows: vistas } = await db.query(
    QUERY_VISTAS_CAMPANA,
    [idCamp]
  )

  const columnasPermitidas = vistas.map(v => v.query_vista.trim())

  if (!columnasPermitidas.length) {
    return []
  }

  //  obtener leads completos
  const leads = await getLeadsByFechaService(
    idCamp,
    iniCampania,
    fechaIngreso
  )

  // filtrar columnas
  const resultado = leads.map(lead => {

    const obj = {}

    columnasPermitidas.forEach(col => {
      if (lead.hasOwnProperty(col)) {
        obj[col] = lead[col]
      }
    })

    return obj
  })

  return resultado
}
export const getMasivosCarterizadoService = async (
  idCamp,
  idPlataforma
) => {

  const { rows } = await db.query(
    QUERY_MASIVOS_CARTERIZADO,
    [idCamp, idPlataforma]
  )

  return rows
}
export const carterizarIndividualService = async (
  idLead,
  idCamp,
  idUsuario
) => {

  const { rows } = await dbdigital.query(
    QUERY_CARTERIZAR_INDIVIDUAL,
    [
      idLead,
      idCamp,
      idUsuario
    ]
  )

  return rows[0]

}


export const getLeadsConAgentesService = async (
  idCamp
) => {

  const { rows: asignaciones } =
    await dbdigital.query(
      QUERY_GET_LEADS_ASIGNADOS,
      [idCamp]
    )

  if (!asignaciones.length) {
    return []
  }

  const idsUsuarios = [
    ...new Set(
      asignaciones.map(
        a => a.id_usuario
      )
    )
  ]

  const { rows: usuarios } =
    await db.query(
      QUERY_GET_USUARIOS_POR_IDS,
      [idsUsuarios]
    )

  const usuariosMap = {}

  usuarios.forEach(usuario => {

    usuariosMap[
      usuario.id_usuario
    ] = usuario.nombre

  })

  return asignaciones.map(a => ({
    idlead: a.id_leads,
    id_usuario: a.id_usuario,
    nombre_agente_asignado:
      usuariosMap[a.id_usuario] || null
  }))

}
export const updateLeadAsignadoService = async (
  idLead,
  idUsuario
) => {

  const { rows } = await dbdigital.query(
    QUERY_UPDATE_USUARIO_CARTERIZADO,
    [
      idUsuario,
      idLead
    ]
  );

  return rows[0] || null;

};
export const getLeadsDisponiblesService = async (
  fechaInicio,
  fechaFin,
  idCamp
) => {
  const result = await dbdigital.query(
    QUERY_GET_LEADS_DISPONIBLES,
    [
      fechaInicio,
      fechaFin,
      idCamp
    ]
  );

  return result.rows;
};
export const asignarLeadsMasivamenteService = async (
  fechaInicio,
  fechaFin,
  idCamp,
  usuarios
) => {

  const client = await dbdigital.connect();

  try {

    await client.query("BEGIN");

    const leadsResult = await client.query(
      QUERY_GET_LEADS_DISPONIBLES,
      [
        fechaInicio,
        fechaFin,
        idCamp
      ]
    );

    const leads = leadsResult.rows;

    if (!leads.length) {
      await client.query("ROLLBACK");

      return {
        totalLeads: 0,
        asignaciones: []
      };
    }

    if (!usuarios || !usuarios.length) {
      throw new Error("No se enviaron usuarios para asignar");
    }

    const asignaciones = [];

    for (let i = 0; i < leads.length; i++) {

      const idLead = leads[i].id_leads;

      const idUsuario = usuarios[i % usuarios.length];

      await client.query(
        QUERY_ASIGNAR_LEAD,
        [
          idUsuario,
          idLead
        ]
      );

      asignaciones.push({
        idLead,
        idUsuario
      });
    }

    await client.query("COMMIT");

    return {
      totalLeads: leads.length,
      totalUsuarios: usuarios.length,
      asignaciones
    };

  } catch (error) {

    await client.query("ROLLBACK");

    throw error;

  } finally {

    client.release();

  }
};