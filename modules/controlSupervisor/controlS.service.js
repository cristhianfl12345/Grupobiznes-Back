//back/modules/controlSupervisor/controlS.service.js
//back/modules/controlSupervisor/controlS.service.js

import { getControlSupervisor } from "./controlS.queries.js";

/**
 * transforma la data plana en:
 * campaña -> supervisor -> asesores
 */
export const getControlSupervisorService = async () => {
  const result = await getControlSupervisor();

  if (!result.status) return result;

  const rows = result.data;

  // estructura principal
  const campMap = new Map();

  for (const row of rows) {
    const {
      IdCamp,
      DocSupervisor,
      Supervisor,
      SexoSup,
      DocAgente
    } = row;

    // ===== campaña =====
    if (!campMap.has(IdCamp)) {
      campMap.set(IdCamp, {
        IdCamp,
        supervisores: new Map()
      });
    }

    const camp = campMap.get(IdCamp);

    // ===== supervisor =====
    if (!camp.supervisores.has(DocSupervisor)) {
      camp.supervisores.set(DocSupervisor, {
        DocSupervisor,
        Supervisor,
        SexoSup,

        metricas: {
          menos_5: row.sup_menos_5,
          mas_5: row.sup_mas_5,
          mas_10: row.sup_mas_10,
          total_ges: row.sup_total_ges,
          MarcacionesUnicas: row.MarcacionesUnicas,
          tmo_mayor_5: row.tmo_mayor_5,
          porcen_sintipi: row.porcen_sintipi,
          venta1Contacto: row.venta1Contacto,
          venta2Contacto: row.venta2Contacto,
          VentasUnicas: row.VentasUnicas,
          TotalVentas: row.TotalVentas,
          Productividad: row.Productividad,
          Ausentismo: row.Ausentismo,
          Rotacion: row.Rotacion,
          Fechaconsulta: row.Fechaconsulta,
          SemaforoProductividad: row.SemaforoProductividad,
          SPH: row.sup_SPH,
          SemaforoSPH: row.SemaforoSPH,
          Densidad: row.sup_densidad,
          SemaforoDensidad: row.SemaforoDensidad,
          AgenteFull: row.AgenteFull,
          AgenteFullConectado: row.AgenteFullConectado,
          AgentePart: row.AgentePart,
          AgentePartConectado: row.AgentePartConectado
        },

        asesores: []
      });
    }

    const supervisorObj = camp.supervisores.get(DocSupervisor);

    // ===== asesor =====
    if (DocAgente) {
      supervisorObj.asesores.push({
        DocAgente,
        Agente: row.Agente,

        metricas: {
          menos_5: row.ase_menos_5,
          mas_5: row.ase_mas_5,
          mas_10: row.ase_mas_10,
          total_ges: row.ase_total_ges,
          min_tmo_alto: row.min_tmo_alto,
          porcen_sintipi: row.ase_porcen_sintipi,
          venta1Contacto: row.ase_venta1,
          venta2Contacto: row.ase_venta2,
          VentasUnicas: row.ase_ventas_unicas,
          TotalVentas: row.ase_total_ventas,
          Densidad: row.ase_densidad,
          SPH: row.ase_sph,
          productividad: row.ase_productividad,
          SemaforoProductividad: row.ase_semaforo_prod,
          Cuartil: row.Cuartil,
          Tiempo_bano: row.Tiempo_bano,
          Seg_AuxHablado: row.Seg_AuxHablado,
          Seg_ACW: row.Seg_ACW,
          TIEMPO_AUXILIAR: row.TIEMPO_AUXILIAR,
          Seg_TiempoDisponible: row.Seg_TiempoDisponible,
          Seg_TiempoHabladoAcd: row.Seg_TiempoHabladoAcd,
          seg_tiempoTotalConeccion: row.seg_tiempoTotalConeccion,
          HoraInicio: row.HoraInicio,
          HoraFin: row.HoraFin,
          Coneccion: row.Coneccion
        }
      });
    }
  }

  // ===== maps -> arrays =====
  const data = Array.from(campMap.values()).map((camp) => ({
    IdCamp: camp.IdCamp,
    supervisores: Array.from(camp.supervisores.values())
  }));

  return {
    status: true,
    data
  };
};