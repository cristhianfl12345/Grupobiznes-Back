// modules/componentes/complementoVista.js

import db from "../../config/dbmsql.js"; 
import {
  QUERY_GET_KPIS,
  QUERY_GET_CAMPANAS_BY_USER,
  QUERY_GET_ALL_CAMPANAS,
  QUERY_GET_VISTAS,
  QUERY_INSERT_VISTA,
  QUERY_GET_CAMPANAS_SELECT,
  QUERY_GET_VISTAS_FILTRADAS,
  QUERY_GET_VISTA_BY_ID,
  QUERY_UPDATE_VISTA
} from "../queries/queriesVistas.js";


// ==============================
// SERVICE
// ==============================

const obtenerCampanasUsuario = async (idUsuario, id_tipo_usuario) => {
  try {
    let campanas = [];

    const rolesFullAccess = [1, 2, 6];

    // CONTROL POR ROL
    if (rolesFullAccess.includes(id_tipo_usuario)) {
      const [rows] = await db.query(QUERY_GET_ALL_CAMPANAS);
      campanas = rows.map(r => r.IdCamp);
    } else {
      const [rows] = await db.query(
        QUERY_GET_CAMPANAS_BY_USER,
        [idUsuario]
      );
      campanas = rows.map(r => r.id_camp);
    }

    return campanas;

  } catch (error) {
    throw error;
  }
};


const obtenerKpisAgrupados = async (campanas) => {
  try {

    if (!campanas || campanas.length === 0) {
      return {
        operativos: {},
        calidad: {},
        rentabilidad: {},
        rrhh: {}
      };
    }

    const [rows] = await db.query(QUERY_GET_KPIS, [campanas]);

    const resultado = {
      operativos: {},
      calidad: {},
      rentabilidad: {},
      rrhh: {}
    };

    for (const row of rows) {

      const levelKey =
        row.level === 1 ? "operativos" :
        row.level === 2 ? "calidad" :
        row.level === 3 ? "rentabilidad" :
        "rrhh";

      // CREAR CAMPAÑA SI NO EXISTE
      if (!resultado[levelKey][row.idcamp]) {
        resultado[levelKey][row.idcamp] = {
          nombreCampana: row.Campana,
          vistas: []
        };
      }

      // AGREGAR VISTA
      resultado[levelKey][row.idcamp].vistas.push({
        id: `${row.idcamp}-${row.orden}`,
        nombre: row.Name_vista,
        url: row.url_vista,
        contenedor: row.contenedor,
        contenedor2: row.contenedor2,
        orden: row.orden
      });
    }

    // ORDENAR
    Object.values(resultado).forEach(level => {
      Object.values(level).forEach(camp => {
        camp.vistas.sort((a, b) => a.orden - b.orden);
      });
    });

    return resultado;

  } catch (error) {
    throw error;
  }
};
// ==============================
// CONTROLLER
// ==============================
export const getKpis = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: "Token requerido"
      });
    }

    const id_usuario = req.user.id;
    const id_tipo_usuario = req.user.id_tipo_usuario;

    if (!id_usuario) {
      return res.status(401).json({
        ok: false,
        message: "Usuario no autenticado"
      });
    }

    // 1. campañas
    const campanas = await obtenerCampanasUsuario(
      id_usuario,
      id_tipo_usuario
    );

    // 2. KPIs 
    const data = await obtenerKpisAgrupados(campanas);

    return res.json({
      ok: true,
      data
    });

  } catch (error) {
    console.error("Error en getKpis:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener KPIs"
    });
  }
};
 // vistas renderizadas

 export const getVistas = async (req, res) => {
  try {
    const { level, idcamp } = req.query;

    if (!level || !idcamp) {
      return res.status(400).json({
        ok: false,
        message: "Faltan parámetros"
      });
    }

    const [rows] = await db.query(QUERY_GET_VISTAS, [level, idcamp]);

    return res.json(rows);

  } catch (error) {
    console.error("Error en getVistas:", error);

    return res.status(500).json({
      ok: false,
      message: "Error obteniendo vistas"
    });
  }
};


// ==============================
// CREAR VISTA
// ==============================

export const crearVista = async (req, res) => {
  try {
    const {
      level,
      idcamp,
      Name_vista,
      url_vista,
      contenedor,
      contenedor2,
      activo
    } = req.body;

    // VALIDACIONES BÁSICAS
    if (
      level == null ||
      idcamp == null ||
      !Name_vista ||
      !url_vista ||
      activo == null
    ) {
      return res.status(400).json({
        ok: false,
        message: "Faltan campos obligatorios"
      });
    }

    // VALIDAR LEVEL (1-4)
    if (![1, 2, 3, 4].includes(Number(level))) {
      return res.status(400).json({
        ok: false,
        message: "Level inválido"
      });
    }

    // VALIDAR ACTIVO (0 o 1)
    if (![0, 1].includes(Number(activo))) {
      return res.status(400).json({
        ok: false,
        message: "Activo inválido"
      });
    }

    await db.query(QUERY_INSERT_VISTA, [
      level,
      idcamp,
      Name_vista,
      url_vista,
      contenedor || null,
      contenedor2 || null,
      activo
    ]);

    return res.json({
      ok: true,
      message: "Vista creada correctamente"
    });

  } catch (error) {
    console.error("Error en crearVista:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al crear vista"
    });
  }
};


// ==============================
// OBTENER CAMPAÑAS (SELECT)
// ==============================
export const getCampanasSelect = async (req, res) => {
  try {

const [rows] = await db.query(QUERY_GET_CAMPANAS_SELECT);
    return res.json({
      ok: true,
      data: rows
    });

  } catch (error) {
    console.error("Error en getCampanasSelect:", error);

    return res.status(500).json({
      ok: false,
      message: "Error obteniendo campañas"
    });
  }
};
// edicion de vistas existentes

export const getVistasFiltradas = async (req, res) => {
  try {
    const { level, idcamp } = req.query;

    if (!level) {
      return res.status(400).json({
        ok: false,
        message: "Level es obligatorio"
      });
    }

    const idcampValue = idcamp ? Number(idcamp) : null;

    const [rows] = await db.query(
      QUERY_GET_VISTAS_FILTRADAS,
      [level, idcampValue, idcampValue]
    );

    return res.json({
      ok: true,
      data: rows
    });

  } catch (error) {
    console.error("Error en getVistasFiltradas:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al filtrar vistas"
    });
  }
};
//obtener vista unica por id para editar
export const getVistaById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(QUERY_GET_VISTA_BY_ID, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Vista no encontrada"
      });
    }

    return res.json({
      ok: true,
      data: rows[0]
    });

  } catch (error) {
    console.error("Error en getVistaById:", error);

    return res.status(500).json({
      ok: false,
      message: "Error obteniendo vista"
    });
  }
};

//update de las vistas

export const updateVista = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      level,
      idcamp,
      Name_vista,
      url_vista,
      contenedor,
      contenedor2,
      activo
    } = req.body;

    if (
      level == null ||
      idcamp == null ||
      !Name_vista ||
      !url_vista ||
      activo == null
    ) {
      return res.status(400).json({
        ok: false,
        message: "Faltan campos obligatorios"
      });
    }

    await db.query(QUERY_UPDATE_VISTA, [
      level,
      idcamp,
      Name_vista,
      url_vista,
      contenedor || null,
      contenedor2 || null,
      activo,
      id
    ]);

    return res.json({
      ok: true,
      message: "Vista actualizada correctamente"
    });

  } catch (error) {
    console.error("Error en updateVista:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al actualizar"
    });
  }
};