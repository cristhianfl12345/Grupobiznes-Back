//back/modules/controlModulos/controlM.queries.js
// ==============================
// GET CONTROL DE MÓDULOS (JOIN CAMPAÑAS)
// ==============================
export const QUERY_GET_CONTROL_MODULOS = `
SELECT 
  cm.id_camp      AS id_camp,
  c.nombre        AS nombre,
  cm.id_modulo    AS id_modulo,
  cm.modulo_activo AS modulo_activo
FROM admin.control_de_modulos cm
INNER JOIN admin.campanas c 
    ON c.id_camp = cm.id_camp
ORDER BY c.id_camp ASC, cm.id_modulo ASC
`;


// ==============================
// GET POR FILTROS (ID CAMP / MODULO)
// ==============================
export const QUERY_GET_CONTROL_MODULOS_BY_FILTER = `
SELECT 
    cm.id_camp      AS id_camp,
    c.nombre        AS nombre,
    cm.id_modulo    AS id_modulo,
    cm.modulo_activo AS modulo_activo
FROM admin.control_de_modulos cm
INNER JOIN admin.campanas c 
    ON c.id_camp = cm.id_camp
WHERE 
    ($1::INT IS NULL OR cm.id_camp = $1)
AND ($2::INT IS NULL OR cm.id_modulo = $2)
ORDER BY c.nombre ASC, cm.id_modulo ASC
`;


// ==============================
// UPDATE MODULO ACTIVO
// ==============================
export const QUERY_UPDATE_MODULO_ESTADO = `
UPDATE admin.control_de_modulos
SET 
    modulo_activo = $1
WHERE 
    id_camp = $2
AND id_modulo = $3
`;


// ==============================
// INSERT CONTROL DE MÓDULO
// ==============================
export const QUERY_INSERT_CONTROL_MODULO = `
INSERT INTO admin.control_de_modulos (
    id_camp,
    id_modulo,
    modulo_activo
)
VALUES (
    $1, -- id_camp
    $2, -- id_modulo
    $3, -- modulo_activo (true/false)

)
RETURNING 
    id_camp AS id_camp,
    id_modulo AS id_modulo,
    modulo_activo AS modulo_activo
`;


// ==============================
// DELETE CONTROL DE MÓDULO
// ==============================
export const QUERY_DELETE_CONTROL_MODULO = `
DELETE FROM admin.control_de_modulos
WHERE 
    id_camp = $1
AND id_modulo = $2
`;