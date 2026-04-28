// back/modules/queries/queriesUsers.js

// ==============================
//  GET USUARIOS
// ==============================
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
FROM admin.ra_usuarios u
LEFT JOIN admin.ra_tipo_usuario tu ON tu.id = u.id_tipo_usuario
LEFT JOIN admin.ra_grupos g ON g.id = u.id_grupo
ORDER BY u.id ASC
`;


// ==============================
// CAMPAÑAS POR USUARIO
// ==============================
export const QUERY_GET_CAMPANAS_USUARIO = `
SELECT 
    ruc.id_usuario,
    ruc.id_camp AS "IdCamp"
FROM admin.ra_usuario_camp ruc
`;

// ==============================
// CAMPAÑAS DASHBOARD
// ==============================
export const QUERY_GET_CAMPANAS_DASHBOARD = `
SELECT 
    id_camp AS "IdCamp",
    nombre AS "Campana"
FROM admin.campanas
WHERE activa = true
`;


// ==============================
// UPDATE USUARIO
// ==============================
export const QUERY_UPDATE_USUARIO = `
UPDATE admin.ra_usuarios
SET 
  usuario = $1,
  nombres = $2,
  apellidos = $3,
  password = $4,
  estado = $5,
  id_tipo_usuario = $6,
  id_grupo = $7,
  reportes = $8,
  fec_mod = NOW()
WHERE id = $9
`;


// ==============================
// DELETE USUARIO
// ==============================
export const QUERY_DELETE_USUARIO = `
DELETE FROM admin.ra_usuarios
WHERE id = $1
`;


// ==============================
// DELETE RELACIÓN CAMPAÑAS
// ==============================
export const QUERY_DELETE_USUARIO_CAMP = `
DELETE FROM admin.ra_usuario_camp
WHERE id_usuario = $1
`;


// ==============================
// INSERT RELACIÓN CAMPAÑAS
// ==============================
// PostgreSQL NO acepta VALUES ?
// debes construir dinámicamente los valores

export const QUERY_INSERT_USUARIO_CAMP = `
INSERT INTO admin.ra_usuario_camp (id_usuario, id_camp)
VALUES ($1, $2)
`;
// ==============================
// ➕ INSERT USUARIO
// ==============================
export const QUERY_INSERT_USUARIO = `
INSERT INTO admin.ra_usuarios (
    nombres,
    apellidos,
    usuario,
    password,
    estado,
    id_tipo_usuario,
    id_grupo,
    id_camp,
    nro_doc,
    reportes,
    fec_reg,
    fec_mod
)
VALUES (
    $1,  -- nombres
    $2,  -- apellidos
    $3,  -- usuario
    $4,  -- password
    $5,  -- estado
    $6,  -- id_tipo_usuario
    $7,  -- id_grupo
    1,   --  id_camp fijo
    '00000000', --  nro_doc fijo
    NULL, -- reportes (puede ser null)
    NOW(),
    NOW()
)
RETURNING 
    id,
    usuario,
    nombres,
    apellidos,
    id_tipo_usuario,
    id_grupo,
    estado
`;