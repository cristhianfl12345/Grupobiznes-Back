// back/modules/queries/queriesVistas.js

// ==============================
// KPI DASHBOARD
// ==============================
export const QUERY_GET_KPIS = `
SELECT 
    v.level,
    v.id_camp,
    c.nombre AS "Campana",
    v.name_vista,
    v.url_vista,
    v.contenedor,
    v.contenedor2,
    v.activo
FROM admin.configuracion_vistas v
JOIN admin.campanas c 
  ON c.id_camp = v.id_camp
WHERE v.activo = true
AND v.id_camp = ANY($1)
ORDER BY v.level ASC;
`;


// ==============================
// CAMPAÑAS POR USUARIO
// ==============================
export const QUERY_GET_CAMPANAS_BY_USER = `
SELECT id_camp 
FROM admin.ra_usuario_camp 
WHERE id_usuario = $1;
`;


// ==============================
// TODAS LAS CAMPAÑAS
// ==============================
export const QUERY_GET_ALL_CAMPANAS = `
SELECT id_camp 
FROM admin.campanas;
`;


// ==============================
// VISTAS POR NIVEL + CAMPAÑA
// ==============================
export const QUERY_GET_VISTAS = `
SELECT 
  name_vista,
  url_vista
FROM admin.configuracion_vistas
WHERE level = $1
  AND id_camp = $2
  AND activo = true;
`;


// ==============================
// INSERT VISTA
// ==============================
export const QUERY_INSERT_VISTA = `
INSERT INTO admin.configuracion_vistas (
  level,
  id_camp,
  name_vista,
  url_vista,
  contenedor,
  contenedor2,
  activo,
  fecha_reg
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, NOW()
);
`;


// ==============================
// SELECT CAMPAÑAS ACTIVAS
// ==============================
export const QUERY_GET_CAMPANAS_SELECT = `
SELECT 
  id_camp,
  nombre
FROM admin.campanas
WHERE activa = true
ORDER BY id_camp ASC;
`;


// ==============================
// VISTAS FILTRADAS
// ==============================
export const QUERY_GET_VISTAS_FILTRADAS = `
SELECT 
id_vista,
  level,
  id_camp,
  name_vista,
  url_vista,
  contenedor,
  contenedor2,
  activo
FROM admin.configuracion_vistas
WHERE activo IN (true, false)
  AND level = $1
 AND ($2::int IS NULL OR id_camp = $2::int)
ORDER BY level ASC;
`;


// ==============================
// VISTA POR ID (AJUSTE IMPORTANTE)
// ==============================
// Antes usabas "orden", ahora NO existe.
// Asumo que usarás un PK (ej: id)

export const QUERY_GET_VISTA_BY_ID = `
SELECT 
  id_vista,
  level,
  id_camp,
  name_vista,
  url_vista,
  contenedor,
  contenedor2,
  activo
FROM admin.configuracion_vistas
WHERE id_vista = $1;
`;


// ==============================
// UPDATE VISTA
// ==============================
export const QUERY_UPDATE_VISTA = `
UPDATE admin.configuracion_vistas
SET
  level = $1,
  id_camp = $2,
  name_vista = $3,
  url_vista = $4,
  contenedor = $5,
  contenedor2 = $6,
  activo = $7
WHERE id_vista = $8;
`;