export const QUERY_BUSCAR_LEADS = `
SELECT
  l.IdKey,
  l.Id_anuncio,
  l.numero_telefono,
  l.dni,
  l.campania,
  TO_CHAR(l.fcreacion_plataforma AT TIME ZONE 'America/Lima', 'DD/MM/YYYY HH24:MI:SS') AS fcreacion_plataforma,
  TO_CHAR(l.fecha_creacion AT TIME ZONE 'America/Lima', 'DD/MM/YYYY HH24:MI:SS') AS fecha_creacion,
  l.idusuario,
  l.plataforma,
  l.formid,
  l.PautaNameAnuncio,
  t.segmento,
  t.medio,
  t.pag,
  t.formato,
  l.OrigenNegocioIntegracion,
  CASE
    WHEN l.politica = '1' THEN 'ACEPTA'
    WHEN l.politica = '2' THEN 'NO ACEPTA'
    ELSE 'Pendiente de validación'
  END AS politica,
  CASE
    WHEN l.FinesAdicionales = '1' THEN 'ACEPTA'
    WHEN l.FinesAdicionales = '2' THEN 'NO ACEPTA'
    ELSE 'Pendiente de validación'
  END AS FinesAdicionales,
  l.remote_ip
FROM
  core.leads_campania AS l

INNER JOIN
  core.leads AS c
    ON l.IdKey = c.IdKey

LEFT JOIN
  core.tbc_tipobase_digital AS t
    ON l.id_tipobase = t.id_tipobase

WHERE
  c.IdCamp = $1
  AND (
    l.IdKey = $2
    OR l.numero_telefono = $3
    OR l.dni = $4
  )

ORDER BY
  l.fecha_creacion DESC
`;