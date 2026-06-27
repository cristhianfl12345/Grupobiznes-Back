export const QUERY_LEADS_BASE = `
SELECT 
idlead,
    lc.idkey AS "IdKey_Computado",
    lc.idkey,

    LOWER(lc.nombre_completo) AS nombre_completo,
    lc.dni,
    lc.politica,
    lc.FinesAdicionales,

    CASE 
        WHEN length(lc.email) > 2 THEN 1 
        ELSE 0 
    END AS email2,

    lc.email,
    lc.numero_telefono,

    COALESCE(lc.idcampania, 0) AS idcampania,
    COALESCE(lc.formid, '0') AS formid,
    COALESCE(lc.id_anuncio, '0') AS id_anuncio,
    COALESCE(lc.desc_form, '0') AS NameForm,

    EXTRACT(HOUR FROM lc.fecha_creacion) AS horac,

    REPLACE(lc.plataforma, ' ', '') AS plataforma,

    tpc.nom_tipobase AS origen,
    lc.campania,
    tpc.segmento,

    lc.fecha_creacion::time AS fecha_creacion,
    EXTRACT(HOUR FROM lc.fecha_creacion) AS hora_creacion,

    -- DISCADOR / GESTIONES
    g.conteo_llmds AS discador,
    g.conteo_gestiones AS gestiones,

    -- GESTION FLAG
    CASE 
        WHEN g.mejor_id_call IS NULL THEN 0 
        ELSE 1 
    END AS "Gestion",

    -- NIVEL
    COALESCE(
        REPLACE(g.mejor_nivel1 || '_' || g.mejor_nivel2, ' ', '_'),
        '0'
    ) AS nivel,

    -- CAMPOS ALINEADOS CON VISTAS
    g.mejor_cod_contacto AS mejorcodcontacto,
    LOWER(g.mejor_nivel2) AS mejornivel2,
    g.mejor_fecha AS mejorfecha,
    g.mejor_hora AS mejorhora,
    g.mejor_servicio AS mejorservicio,

    g.ultimo_cod_contacto AS ultimocodcontacto,
    LOWER(g.ultimo_nivel2) AS ultnivel2,
    g.ult_fecha AS ultimofecha,
    g.ultimo_hora AS ultimohora,
    g.ult_ges_asesor_name AS ultgesasesorname,

    da.perfil AS perfil,
    da.suma_aseguradora AS suma_aseguradora,
    da.prima_recurrente AS prima_recurrente,
    da.monto_de_deuda AS monto_de_deuda,
    da.etiqueta_endoso AS etiqueta_endoso,
    da.segmento_tasa AS segmento_tasa,

    -- TIEMPO DE GESTION
    (g.primr_hora - lc.fecha_creacion::time) AS horai,

    -- API
    mr."ObsApi",

    -- CAMPOS FRONT
    REPLACE(lc."alias",' ','_') AS "Alias",
    COALESCE(lc."campaorigen", lc."inicampania") AS "CampaOrigen",

    LEFT(lc.idusuario::text, 5) AS idusuario,
    lc."pautanameanuncio",

    -- RSW
    g.rsw_mejor_idcall AS rswmejoridcall,
    g.rsw_mejor_nivel1 AS rswmejornivel1,

    -- OTROS
    g.ventas_unicas,
    g.ventas_totales,
    g.lista_criticos,

    '' AS "semaforoTipoLead",
    lc."origennegociointegracion",
    lc."negocio"

FROM core.leads l

INNER JOIN core.leads_campania lc 
    ON l.idordenleads = lc.IdLead
    LEFT JOIN core.leads_campania_datos AS da on lc.lead_uuid = da.lead_uuid

LEFT JOIN performance.dm_leads_gestion g 
    ON l.idordenleads = g.id_lead	

LEFT JOIN marcacion.envio_marcador mr 
    ON l.idordenleads = mr."IdOrdenLeads" 

LEFT JOIN core.tbc_tipobase_digital tpc 
    ON lc.id_tipobase = tpc.id_tipobase

WHERE 
    l.IdCamp = $1
    AND l.FechaIngreso::date = $2::date
`
export const QUERY_SUBCAMPANIAS = `
  SELECT 
    ini_campania AS "IniCampania",
    id_camp AS "Idcamp"
  FROM core.campanas_ini
  WHERE id_camp = $1
  ORDER BY ini_campania
`;
export const QUERY_LEADS_PANEL = `
SELECT 
    l.idkey,
    l.idkey AS "IdKey_Computado",

    l.alias AS "Alias",
    l.campaorigen AS "CampaOrigen",
    l.pautanameanuncio,
    l.segmento,
    l.perfil,

    l.idusuario,
    l.numero_telefono,
    l.fecha_creacion,
    l.horai,

    l.discador,
    l.gestiones,

    l.ultimocodcontacto,
    l.ultnivel2,

    l.mejorcodcontacto,
    l.mejornivel2,

    l.ultimofecha,
    l.ultimohora,
    l.ultgesasesorname,

    l.mejorfecha,
    l.mejorhora,
    l.mejorservicio,

    l.rswmejoridcall,
    l.rswmejornivel1,

    l.ObsApi

FROM core.leads l
WHERE l.idcamp = $1
ORDER BY l.fecha_creacion DESC
LIMIT $2 OFFSET $3
`;
export const QUERY_VISTAS_CAMPANA = `
SELECT 
    v.query_vista,
    v."Vista",
    v.activo,
    v.orden,
    v.nivel_vista
FROM admin.campanas c
INNER JOIN admin.vistas v
    ON c.id_vista = v."Id_vista"
WHERE 
    c.id_camp = $1
    AND c.activa = true
    AND v.activo = true
    
ORDER BY orden ASC
`;
export const QUERY_GET_AGENTES_CAMPANA = `
SELECT 
    uc.id_campana,
    uc.id_usuario,
    u.nombre
FROM agent.usuarios_carterizacion uc
INNER JOIN agent.usuarios u
    ON u.id_usuario = uc.id_usuario
WHERE uc.id_campana = $1
AND uc.modulo_activo = true; `;

export const QUERY_MASIVOS_CARTERIZADO = `
SELECT 
    uc.id_campana,
    uc.id_usuario,
    u.nombre,
    up.id_plataforma

FROM agent.usuarios_carterizacion uc

INNER JOIN agent.usuarios u
    ON u.id_usuario = uc.id_usuario

INNER JOIN agent.usuarios_plataformas up
    ON up.id_usuario = uc.id_usuario

WHERE 
    uc.id_campana = $1
    AND up.id_plataforma = $2
    AND uc.modulo_activo = true

ORDER BY u.nombre ASC;
`
export const QUERY_CARTERIZAR_INDIVIDUAL = `
UPDATE assignment.leads_asignados
SET
    id_usuario = $3,
    fecha_actualizacion = NOW(),
    status_asignado = 1
WHERE
    id_leads = $1
    AND id_camp = $2
RETURNING *;
`;
export const QUERY_GET_LEADS_ASIGNADOS = `
SELECT
    id_leads,
    id_usuario
FROM assignment.leads_asignados
WHERE id_camp = $1
`;
export const QUERY_GET_USUARIOS_POR_IDS = `
SELECT
    id_usuario,
    nombre
FROM agent.usuarios
WHERE id_usuario = ANY($1)
`;

export const QUERY_UPDATE_USUARIO_CARTERIZADO = `
UPDATE assignment.leads_asignados
SET
    id_usuario = $1,
    fecha_actualizacion = NOW(),
    status_asignado = 1
WHERE id_leads = $2
  AND id_usuario IS DISTINCT FROM $1
RETURNING *
`;
export const QUERY_GET_LEADS_DISPONIBLES = `
SELECT
    id_leads
FROM assignment.leads_asignados
WHERE fecha_reg BETWEEN $1 AND $2
  AND id_camp = $3
  AND id_usuario IS NULL
  AND COALESCE(status_asignado, 0) = 0
ORDER BY fecha_reg, id_leads
`;
export const QUERY_ASIGNAR_LEAD = `
UPDATE assignment.leads_asignados
SET
    id_usuario = $1,
    status_asignado = 1
WHERE id_leads = $2
`;