// back/modules/queries/queriesUsers.js

export const QUERY_GET_USUARIOS = `
SELECT 
    u.id,
    u.usuario,
    u.nombres,
    u.apellidos,
    u.id_tipo_usuario,
    tu.descripcion AS nivel,
    u.id_grupo,
    g.descripcion AS grupo,
    u.reportes,
    u.estado
FROM ra_usuarios u
LEFT JOIN ra_tipo_usuario tu ON tu.id = u.id_tipo_usuario
LEFT JOIN ra_grupos g ON g.id = u.id_grupo
ORDER BY u.id ASC
`;


// ==============================
// QUERY CAMPAÑAS POR USUARIO
// ==============================

export const QUERY_GET_CAMPANAS_USUARIO = `
SELECT 
    ruc.id_usuario,
    ruc.id_camp AS IdCamp
FROM ra_usuario_camp ruc
`;


// ==============================
// QUERY CAMPAÑAS DASHBOARD
// ==============================

export const QUERY_GET_CAMPANAS_DASHBOARD = `
SELECT 
    IdCamp,
    Campana
FROM bz_campanas
`;
// ==============================
// ✏️ UPDATE USUARIO
// ==============================

export const QUERY_UPDATE_USUARIO = `
UPDATE ra_usuarios
SET 
  usuario = ?,
  nombres = ?,
  apellidos = ?,
  password = ?,
  estado = ?,
  id_tipo_usuario = ?,
  id_grupo = ?,
  reportes = ?,
  fec_mod = NOW()
WHERE id = ?
`;


// ==============================
// 🧹 DELETE USUARIO
// ==============================

export const QUERY_DELETE_USUARIO = `
DELETE FROM ra_usuarios
WHERE id = ?
`;


// ==============================
// 🧹 DELETE RELACIÓN CAMPAÑAS
// ==============================

export const QUERY_DELETE_USUARIO_CAMP = `
DELETE FROM ra_usuario_camp
WHERE id_usuario = ?
`;


// ==============================
// ➕ INSERT RELACIÓN CAMPAÑAS
// ==============================

export const QUERY_INSERT_USUARIO_CAMP = `
INSERT INTO ra_usuario_camp (id_usuario, id_camp)
VALUES ?
`;