//back/modules/agenteInfo/agenteInfo.queries.js
export const QUERY_GET_AGENTES_BY_CAMPANA = `
SELECT
    u.id_usuario,
    u.doc_num AS dni,
    u.nombre,
    u.usuario,
    u.fecha_registro,

    up.id_plataforma,

    uh.hora_in,
    uh.hora_out,
    uh.ultimo_ping,

    uc.id_reg AS id_carteriza,
    uc.tipo_campana AS tipo_campana,

    uch.id_reg AS id_horario_fuente,
    uch.fuente,
    uch.hora_ini,
    uch.hora_fin,
    uch.hora_ini_s,
    uch.hora_fin_s,
    uch.activo

FROM agent.usuarios_carterizacion uc

INNER JOIN agent.usuarios u
    ON u.id_usuario = uc.id_usuario

LEFT JOIN agent.usuarios_horario uh
    ON uh.id_usuario = u.id_usuario
    AND uh.activo = true

LEFT JOIN agent.usuarios_plataformas up
    ON up.id_usuario = u.id_usuario

LEFT JOIN agent.usuarios_carterizacion_horarios uch
    ON uch.id_carteriza = uc.id_reg

WHERE uc.id_campana = $1
AND uc.modulo_activo = true

ORDER BY u.nombre ASC
`;
export const QUERY_DELETE_AGENTE_CAMPANA = `
UPDATE agent.usuarios_carterizacion
SET
    modulo_activo = false,
    fecha_modifica = NOW()
WHERE id_reg = $1
RETURNING *;
`;
export const QUERY_GET_HORARIO_FUENTE = `
SELECT *
FROM agent.usuarios_carterizacion_horarios
WHERE id_carteriza = $1
AND fuente = $2
LIMIT 1;
`;
export const QUERY_CREATE_HORARIO_FUENTE = `
INSERT INTO agent.usuarios_carterizacion_horarios (
    id_carteriza,
    fuente,
    activo,
    hora_ini,
    hora_fin,
    hora_ini_s,
    hora_fin_s
)
VALUES (
    $1,
    $2,
    true,
    $3,
    $4,
    $5,
    $6
)
RETURNING *;
`;
export const QUERY_UPDATE_HORARIO_FUENTE = `
UPDATE agent.usuarios_carterizacion_horarios
SET
    hora_ini = $3,
    hora_fin = $4,
    hora_ini_s = $5,
    hora_fin_s = $6
WHERE id_carteriza = $1
AND fuente = $2
RETURNING *;
`;