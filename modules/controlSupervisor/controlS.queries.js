//back/modules/controlSupervisor/controlS.queries.js

import { dbdigital } from "../../config/dbdigital.js";

export const getControlSupervisor = async () => {
  try {

    const query = `
      SELECT 

        -- ===== SUPERVISOR =====
        g.id_orden                 AS "IdOrden",
        g.id_camp                  AS "IdCamp",
        g.doc_supervisor           AS "DocSupervisor",
        g.supervisor               AS "Supervisor",
        g.sexo_sup                 AS "SexoSup",

        g.menos_5                  AS "sup_menos_5",
        g.mas_5                    AS "sup_mas_5",
        g.mas_10                   AS "sup_mas_10",
        g.total_ges                AS "sup_total_ges",

        g.marcaciones_unicas       AS "MarcacionesUnicas",
        g.tmo_mayor_5              AS "tmo_mayor_5",
        g.porcen_sin_tipi          AS "porcen_sintipi",

        g.venta1_contacto          AS "venta1Contacto",
        g.venta2_contacto          AS "venta2Contacto",

        g.ventas_unicas            AS "VentasUnicas",
        g.total_ventas             AS "TotalVentas",

        g.productividad            AS "Productividad",
        g.ausentismo               AS "Ausentismo",
        g.rotacion                 AS "Rotacion",

        g.fecha_consulta           AS "Fechaconsulta",

        g.semaforo_productividad   AS "SemaforoProductividad",

        g.sph                      AS "sup_SPH",
        g.semaforo_sph             AS "SemaforoSPH",

        g.desindad                 AS "sup_densidad",
        g.semaforo_densidad        AS "SemaforoDensidad",

        g.agente_full              AS "AgenteFull",
        g.agente_full_conectado    AS "AgenteFullConectado",

        g.agente_part              AS "AgentePart",
        g.agente_part_conectado    AS "AgentePartConectado",

        -- ===== ASESOR =====
        a.doc_agente               AS "DocAgente",
        a.agente                   AS "Agente",

        a.menos_5                  AS "ase_menos_5",
        a.mas_5                    AS "ase_mas_5",
        a.mas_10                   AS "ase_mas_10",
        a.total_ges                AS "ase_total_ges",

        a.min_tmo_alto             AS "min_tmo_alto",

        a.porcen_sintipi           AS "ase_porcen_sintipi",

        a.venta1_contacto          AS "ase_venta1",
        a.venta2_contacto          AS "ase_venta2",

        a.ventas_unicas            AS "ase_ventas_unicas",
        a.total_ventas             AS "ase_total_ventas",

        a.desindad                 AS "ase_densidad",

        a.sph                      AS "ase_sph",

        a.productividad            AS "ase_productividad",

        a.semaforo_productividad   AS "ase_semaforo_prod",

        a.cuartil                  AS "Cuartil",

        a.tiempo_bano              AS "Tiempo_bano",

        a.seg_auxhablado           AS "Seg_AuxHablado",
        a.seg_acw                  AS "Seg_ACW",

        a.tiempo_auxiliar          AS "TIEMPO_AUXILIAR",

        a.seg_tiempo_disponible    AS "Seg_TiempoDisponible",

        a.seg_tiempo_hablado_acd   AS "Seg_TiempoHabladoAcd",

        a.seg_tiempo_total_coneccion AS "seg_tiempoTotalConeccion",

        a.hora_inicio              AS "HoraInicio",
        a.hora_fin                 AS "HoraFin",

        a.coneccion                AS "Coneccion"

      FROM analytics.vis_ctrl_metrica_general g

      LEFT JOIN analytics.vis_ctrl_metrica_asesor a
        ON g.doc_supervisor = a.doc_supervisor
        AND g.id_camp = a.id_camp

      ORDER BY 
        g.id_camp,
        g.doc_supervisor,
        a.agente
    `;

    const result = await dbdigital.query(query);

    return {
      status: true,
      data: result.rows
    };

  } catch (error) {

    console.error("Error en getControlSupervisor:", error);

    return {
      status: false,
      error: "Error obteniendo métricas de supervisor"
    };
  }
};