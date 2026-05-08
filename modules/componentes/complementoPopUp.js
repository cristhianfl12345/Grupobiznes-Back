//back/modules/componentes/complementoPopUp.js

import { db } from "../../config/db.js";

// ==============================
// QUERIES
// ==============================

// Notificaciones agrupadas por usuario (hoy)
const QUERY_NOTIFICACIONES_AGRUPADAS = `
SELECT 
    n.id_usuario,
    u.nombres,
    u.apellidos,
    n.id_camp AS id_camp,  
    COUNT(*) AS total_envios
FROM admin.notificaciones_marcadores n
INNER JOIN admin.ra_usuarios u 
    ON u.id = n.id_usuario
WHERE 
    DATE(n.fecha_consulta) = CURRENT_DATE
GROUP BY n.id_usuario, u.nombres, u.apellidos, n.id_camp
ORDER BY total_envios DESC
`;

// Detalle por usuario (historial)
const QUERY_NOTIFICACIONES_DETALLE = `
SELECT 
    c.nombre AS "Campana",
    n.telefono,
    n.fecha_consulta,
    n.id_marcador
FROM admin.notificaciones_marcadores n
INNER JOIN admin.campanas c 
    ON c.id_camp = n.id_camp
WHERE 
    n.id_usuario = $1
    AND DATE(n.fecha_consulta) = CURRENT_DATE
ORDER BY n.fecha_consulta DESC
`;

// Validar tipo de usuario (seguridad backend)
const QUERY_VALIDAR_ROL = `
SELECT id, id_tipo_usuario
FROM admin.ra_usuarios
WHERE id = $1
`;

// ==============================
// SERVICE
// ==============================

const obtenerNotificacionesAgrupadas = async () => {
  const { rows } = await db.query(QUERY_NOTIFICACIONES_AGRUPADAS);

  return rows.map(r => ({
    id_usuario: r.id_usuario,
    nombres: r.nombres,
    apellidos: r.apellidos,
    total: r.total_envios,
    id_camp: r.id_camp,
    mensaje: `${r.nombres} ${r.apellidos} ha enviado ${r.total_envios} números a SPAM hoy`
  }));
};

const obtenerDetalleUsuario = async (idUsuario) => {
  const { rows } = await db.query(QUERY_NOTIFICACIONES_DETALLE, [idUsuario]);

  return rows.map(r => ({
    campana: r.Campana,
    telefono: r.telefono,
    fecha: r.fecha_consulta,
    marcador: r.id_marcador
  }));
};

const validarPermiso = async (idUsuario) => {
  const { rows } = await db.query(QUERY_VALIDAR_ROL, [idUsuario]);

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
    const idUsuario = req.user?.id;

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

// ==============================
// NOTIFICACIONES SUPERVISOR
// ==============================

const QUERY_NOTIFICACIONES_USUARIO = `
SELECT 
    n.id,
    n.id_camp,
    n.fecha_registro,
    n.leido_por,
    c.nombre AS "Campana"
FROM admin.notificaciones_marcadores n
INNER JOIN admin.campanas c 
    ON c.id_camp = n.id_camp
INNER JOIN admin.ra_usuario_camp uc 
    ON uc.id_camp = n.id_camp
INNER JOIN admin.ra_usuarios u
    ON u.id = uc.id_usuario
WHERE 
    uc.id_usuario = $1
    AND u.id_tipo_usuario IN (3,4,5)
ORDER BY n.fecha_registro DESC
LIMIT 20
`;

const QUERY_MARCAR_LEIDA = `
UPDATE admin.notificaciones_marcadores
SET leido_por = $1
WHERE id = $2
`;

// ==============================
// SERVICE SUPERVISOR
// ==============================

const obtenerNotificacionesUsuario = async (idUsuario) => {
  const { rows } = await db.query(QUERY_NOTIFICACIONES_USUARIO, [idUsuario]);

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
  const { rows } = await db.query(
    `SELECT id_tipo_usuario FROM admin.ra_usuarios WHERE id = $1`,
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