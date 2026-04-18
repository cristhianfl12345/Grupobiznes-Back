export const QUERY_LEADS_BASE = `
SELECT 
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
    COALESCE(lc.id_anuncio, 0) AS id_anuncio,
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

    '' AS perfil,

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
    lc."origennegociointegracion"

FROM core.leads l

INNER JOIN core.leads_campania lc 
    ON l.idordenleads = lc.IdLead

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
  SELECT "IniCampania"
  FROM core.campanas_ini
  WHERE "Idcamp" = $1
  ORDER BY "IniCampania"
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
    v.activo
FROM admin.campanas c
INNER JOIN admin.vistas v
    ON c.id_vista = v."Id_vista"
WHERE 
    c.id_camp = $1
    AND c.activa = true
    AND v.activo = true
ORDER BY v."Id_vista"
`;