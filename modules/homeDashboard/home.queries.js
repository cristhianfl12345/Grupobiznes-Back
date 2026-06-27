//back/modules/homeDashboard/home.queries.js

//  GET USUARIOS //back/config/db.js

export const QUERY_GET_USUARIOS_HOME = `
SELECT id, id_tipo_usuario
FROM admin.ra_usuarios
WHERE id = $1
`;


// CAMPAÑAS POR USUARIO //back/config/db.js

export const QUERY_GET_CAMPANAS_USUARIO_HOME = `
SELECT 
    ruc.id_usuario,
    ruc.id_camp AS "IdCamp"
FROM admin.ra_usuario_camp ruc
`;

// CAMPAÑAS DASHBOARD  //back/config/db.js

export const QUERY_GET_CAMPANAS_HOME_DASHBOARD = `
SELECT 
    id_camp AS "IdCamp",
    nombre AS "Campana"
FROM admin.campanas
WHERE activa = true
`;

// LEADS TOTALES POR CAMPAÑA //back/config/dbdigital.js


export const QUERY_CONTADOR_LEADS = `
SELECT COUNT(*) 
FROM core.leads 
WHERE idcamp = $1
`;

// agentes conectados por campaña    //back/config/dbdigital.js
export const QUERY_AGENTES_CONECTADOS = `
SELECT 
 agente_full_conectado,
 agente_part_conectado
FROM analytics.vis_ctrl_metrica_general
WHERE id_camp = $1
`;