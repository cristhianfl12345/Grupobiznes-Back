//back/modules/componentes/complementoPopUp.js

import db from "../../config/dbmsql.js";

// ==============================
// QUERIES
// ==============================

// Notificaciones agrupadas por usuario (hoy)
const QUERY_NOTIFICACIONES_AGRUPADAS = `
SELECT 
    n.id_usuario,
    u.nombres,
    u.apellidos,
    COUNT(*) AS total_envios
FROM bz_notificaciones n
INNER JOIN biznes_dbaplicacion.ra_usuarios u 
    ON u.id = n.id_usuario
WHERE 
    DATE(n.fecha_consulta) = CURRENT_DATE
GROUP BY n.id_usuario, u.nombres, u.apellidos
ORDER BY total_envios DESC
`;

// Detalle por usuario (historial)
const QUERY_NOTIFICACIONES_DETALLE = `
SELECT 
    c.Campana,
    n.telefono,
    n.fecha_consulta,
    n.id_marcador
FROM bz_notificaciones n
INNER JOIN biznes_dbdashboard.bz_campanas c 
    ON c.IdCamp = n.IdCamp
WHERE 
    n.id_usuario = ?
    AND DATE(n.fecha_consulta) = CURRENT_DATE
ORDER BY n.fecha_consulta DESC
`;

// Validar tipo de usuario (seguridad backend)
const QUERY_VALIDAR_ROL = `
SELECT id, id_tipo_usuario
FROM biznes_dbaplicacion.ra_usuarios
WHERE id = ?
`;

// ==============================
// SERVICE
// ==============================

const obtenerNotificacionesAgrupadas = async () => {
  const [rows] = await db.query(QUERY_NOTIFICACIONES_AGRUPADAS);

  return rows.map(r => ({
    id_usuario: r.id_usuario,
    nombres: r.nombres,
    apellidos: r.apellidos,
    total: r.total_envios,
    mensaje: `${r.nombres} ${r.apellidos} ha enviado ${r.total_envios} números a SPAM hoy`
  }));
};

const obtenerDetalleUsuario = async (idUsuario) => {
  const [rows] = await db.query(QUERY_NOTIFICACIONES_DETALLE, [idUsuario]);

  return rows.map(r => ({
    campana: r.Campana,
    telefono: r.telefono,
    fecha: r.fecha_consulta,
    marcador: r.id_marcador
  }));
};

const validarPermiso = async (idUsuario) => {
  const [rows] = await db.query(QUERY_VALIDAR_ROL, [idUsuario]);

  if (!rows.length) return false;

  const tipo = String(rows[0].id_tipo_usuario);

  // Solo SISTEMAS, GERENCIA, (y el 6 que definiste)
  return ["1", "2", "6"].includes(tipo);
};

// ==============================
// CONTROLLER
// ==============================

// GET /notificaciones-sistemas/obtener
export const obtenerNotificaciones = async (req, res) => {
  try {
    const idUsuario = req.user?.id; // asumimos middleware de sesión

    if (!idUsuario) {
      return res.status(401).json({ ok: false, msg: "No autenticado" });
    }

    const tienePermiso = await validarPermiso(idUsuario);

    if (!tienePermiso) {
      return res.status(403).json({ ok: false, msg: "Sin permisos" });
    }

    const data = await obtenerNotificacionesAgrupadas();

    return res.json({
      ok: true,
      data
    });

  } catch (error) {
    console.error("ERROR NOTIFICACIONES AGRUPADAS:", error);
    return res.status(500).json({ ok: false });
  }
};

//  GET /notificaciones-sistemas/detalle/:idUsuario
export const obtenerDetalleNotificacion = async (req, res) => {
  try {
    const idUsuarioSesion = req.user?.id;
    const { idUsuario } = req.params;

    if (!idUsuarioSesion) {
      return res.status(401).json({ ok: false });
    }

    const tienePermiso = await validarPermiso(idUsuarioSesion);

    if (!tienePermiso) {
      return res.status(403).json({ ok: false });
    }

    if (!idUsuario || isNaN(idUsuario)) {
      return res.status(400).json({ ok: false });
    }

    const detalle = await obtenerDetalleUsuario(idUsuario);

    return res.json({
      ok: true,
      data: detalle
    });

  } catch (error) {
    console.error("ERROR DETALLE NOTIFICACIONES:", error);
    return res.status(500).json({ ok: false });
  }
  
};
// notificaciones de supervisor

// ==============================
// NOTIFICACIONES SUPERVISOR
// ==============================

const QUERY_NOTIFICACIONES_USUARIO = `
SELECT 
    n.id,
    n.id_camp,
    n.fecha_registro,
    n.leido_por,
    c.Campana
FROM notificaciones n
INNER JOIN bz_campanas c 
    ON c.IdCamp = n.id_camp

INNER JOIN biznes_dbaplicacion.ra_usuario_camp uc 
    ON uc.id_camp = n.id_camp

INNER JOIN biznes_dbaplicacion.ra_usuarios u
    ON u.id = uc.id_usuario

WHERE 
    uc.id_usuario = ?
    AND u.id_tipo_usuario IN (3,4,5)

ORDER BY n.fecha_registro DESC
LIMIT 20
`;

const QUERY_MARCAR_LEIDA = `
UPDATE notificaciones
SET leido_por = ?
WHERE id = ?
`;
// ==============================
// SERVICE SUPERVISOR
// ==============================

const obtenerNotificacionesUsuario = async (idUsuario) => {
  const [rows] = await db.query(QUERY_NOTIFICACIONES_USUARIO, [idUsuario]);

  return rows.map(r => ({
    id: r.id,
    id_camp: r.id_camp,
    campana: r.Campana,
    fecha: r.fecha_registro,
    leido_por: r.leido_por,
    mensaje: `Se ha agregado un nuevo lead en la campaña ${r.id_camp} ${r.Campana} | ${new Date(r.fecha_registro).toLocaleString()}`
  }));
};

const marcarNotificacionLeida = async (idNotificacion, idUsuario) => {
  await db.query(QUERY_MARCAR_LEIDA, [idUsuario, idNotificacion]);

  return true;
};

const validarPermisoSupervisor = async (idUsuario) => {
  const [rows] = await db.query(
    `SELECT id_tipo_usuario FROM biznes_dbaplicacion.ra_usuarios WHERE id = ?`,
    [idUsuario]
  );

  if (!rows.length) return false;

  return ["3", "4", "5"].includes(String(rows[0].id_tipo_usuario));
};
// GET /notificaciones-supervisor/obtener
export const obtenerNotificacionesSupervisor = async (req, res) => {
  try {
    const idUsuario = req.user?.id;

    if (!idUsuario) {
      return res.status(401).json({ ok: false, msg: "No autenticado" });
    }

    const tienePermiso = await validarPermisoSupervisor(idUsuario);

    if (!tienePermiso) {
      return res.status(403).json({ ok: false, msg: "Sin permisos" });
    }

    const data = await obtenerNotificacionesUsuario(idUsuario);

    return res.json({
      ok: true,
      data
    });

  } catch (error) {
    console.error("ERROR NOTIFICACIONES SUPERVISOR:", error);
    return res.status(500).json({ ok: false });
  }
};
// POST /notificaciones-supervisor/marcar-leida
export const marcarLeidaSupervisor = async (req, res) => {
  try {
    const idUsuario = req.user?.id;
    const { idNotificacion } = req.body;

    if (!idUsuario) {
      return res.status(401).json({ ok: false });
    }

    if (!idNotificacion || isNaN(idNotificacion)) {
      return res.status(400).json({ ok: false });
    }

    const tienePermiso = await validarPermisoSupervisor(idUsuario);

    if (!tienePermiso) {
      return res.status(403).json({ ok: false });
    }

    await marcarNotificacionLeida(idNotificacion, idUsuario);

    return res.json({ ok: true });

  } catch (error) {
    console.error("ERROR MARCAR LEIDA:", error);
    return res.status(500).json({ ok: false });
  }
};