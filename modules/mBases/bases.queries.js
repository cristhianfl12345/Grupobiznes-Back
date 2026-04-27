//back/modules/mBases/bases.queries.js

// ============================================
// QUERY BASE (RAW DATA)
// ============================================
export const QUERY_BASE_MARCACIONES = `
WITH base AS (
    SELECT 
        d.id,
        d.telefono,
        b.nombre AS NombreBase,
        b.fechacarga,
        g.nombase,
        g.CodContacto,
        g.idcall,
        g.Nivel2,
        d.hablado
    FROM DB_MASTER_BIZNES.dbo.tbl_bzMarcacionesDia AS d
    LEFT JOIN DB_MASTER_BIZNES.dbo.tbl_bzGestionesDia AS g 
        ON d.idop = g.idop
    LEFT JOIN DB_MASTER_BIZNES.dbo.tbl_bzBases AS b 
        ON d.iddata = b.iddata
    WHERE 
        d.fecha_llamada = CAST(GETDATE() AS DATE)
        AND d.IdCamp = @IdCamp
)
`;

export const QUERY_RESUMEN_BASES = `
${QUERY_BASE_MARCACIONES}

SELECT 
    fechacarga,
    NombreBase,

    COUNT(id) AS TotalMarcaciones,
    COUNT(idcall) AS TotalGestiones,

    SUM(CASE WHEN CodContacto = 'CD' THEN 1 ELSE 0 END) AS ContactoDirecto,
    SUM(CASE WHEN CodContacto = 'NCD' THEN 1 ELSE 0 END) AS ContactoNoDirecto,
    SUM(CASE WHEN CodContacto = 'NC' THEN 1 ELSE 0 END) AS NoContacto,

    SUM(CASE WHEN Nivel2 = 'AGENDADO' THEN 1 ELSE 0 END) AS Agendados,

AVG(DATEDIFF(SECOND, '00:00:00', hablado) * 1.0) AS TMO_Promedio,

ROUND(AVG(DATEDIFF(SECOND, '00:00:00', hablado) * 1.0), 0) AS TMO_Final,

DATEADD(SECOND, 
    ROUND(AVG(DATEDIFF(SECOND, '00:00:00', hablado) * 1.0), 0), 
    '00:00:00'
) AS TMO_HHMMSS

FROM base

GROUP BY 
    fechacarga,
    NombreBase

ORDER BY 
    fechacarga DESC;
`;

export const QUERY_DETALLE_BASES = `
${QUERY_BASE_MARCACIONES}

SELECT * FROM base;
`;