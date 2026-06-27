// back/modules/controlVistas/controlVistas.queries.js
export const QUERY_GET_VISTAS_CAMPANA = `
    SELECT
        c."id_camp",
        v."id_orden_vista",
        v."Id_vista",
        v."Vista",
        v."activo",
        v."orden",
        v."nivel_vista"
    FROM admin.campanas c
    INNER JOIN admin.vistas v
        ON c."id_vista" = v."Id_vista"
    WHERE c."id_camp" = $1
    ORDER BY v."orden" ASC NULLS LAST, v."Vista" ASC
`;
export const QUERY_UPDATE_VISTA = `
    UPDATE admin.vistas
    SET
        "activo" = $1,
        "orden" = $2,
        "nivel_vista" = $3
    WHERE "id_orden_vista" = $4
`;
export const QUERY_GET_VISTAS_AGENTE_CAMPANA = `
    SELECT
        c."id_camp",
        v."id_orden_vista",
        v."Id_vista",
        v."Vista",
        v."activo",
        v."orden",
        v."nivel_vista"
    FROM admin.campanas c
    INNER JOIN admin.vistas_agente v
        ON c."id_vista" = v."Id_vista"
    WHERE c."id_camp" = $1
    ORDER BY v."orden" ASC NULLS LAST, v."Vista" ASC
`;
export const QUERY_UPDATE_VISTA_AGENTE = `
    UPDATE admin.vistas_agente
    SET
        "activo" = $1,
        "orden" = $2
    WHERE "id_orden_vista" = $3
`;