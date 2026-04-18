// modules/queries/queriesVistas.js
export const QUERY_GET_KPIS = `
SELECT 
    
    v.orden,
    v.level,
    v.idcamp,
    c.Campana,
    v.Name_vista,
    v.url_vista,
    v.contenedor,
    v.contenedor2,
    v.activo
FROM bz_config_dashboard_vistas v
JOIN bz_campanas c ON c.IdCamp = v.idcamp
WHERE v.activo = 1
AND v.idcamp IN (?)
ORDER BY v.level ASC, v.orden ASC;
`;

export const QUERY_GET_CAMPANAS_BY_USER = `
SELECT id_camp 
FROM biznes_dbaplicacion.ra_usuario_camp 
WHERE id_usuario = ?;
`;

export const QUERY_GET_ALL_CAMPANAS = `
SELECT IdCamp 
FROM bz_campanas;
`;
export const QUERY_GET_VISTAS = `
  SELECT 
    Name_vista,
    url_vista
  FROM bz_config_dashboard_vistas
  WHERE level = ?
    AND idcamp = ?
    AND activo = 1
`
export const QUERY_INSERT_VISTA = `
INSERT INTO bz_config_dashboard_vistas (
  level,
  idcamp,
  Name_vista,
  url_vista,
  contenedor,
  contenedor2,
  activo,
  fecha_reg
) VALUES (?, ?, ?, ?, ?, ?, ?, NOW());
`;

export const QUERY_GET_CAMPANAS_SELECT = `
SELECT 
  IdCamp,
  Campana
FROM bz_campanas
WHERE Activo = 1
ORDER BY IdCamp ASC;
`;
export const QUERY_GET_VISTAS_FILTRADAS = `
SELECT 
  orden,
  level,
  idcamp,
  Name_vista,
  url_vista,
  contenedor,
  contenedor2,
  activo
FROM bz_config_dashboard_vistas
WHERE activo IN (0,1)
  AND level = ?
  AND (? IS NULL OR idcamp = ?)
ORDER BY orden ASC;
`;
export const QUERY_GET_VISTA_BY_ID = `
SELECT 
  orden,
  level,
  idcamp,
  Name_vista,
  url_vista,
  contenedor,
  contenedor2,
  activo
FROM bz_config_dashboard_vistas
WHERE orden = ?;
`;
export const QUERY_UPDATE_VISTA = `
UPDATE bz_config_dashboard_vistas
SET
  level = ?,
  idcamp = ?,
  Name_vista = ?,
  url_vista = ?,
  contenedor = ?,
  contenedor2 = ?,
  activo = ?
WHERE orden = ?;
`;