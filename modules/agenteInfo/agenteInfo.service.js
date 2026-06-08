//back/modules/agenteInfo/agenteInfo.service.js
import { db } from "../../config/db.js";

import {
    QUERY_GET_AGENTES_BY_CAMPANA,
    QUERY_DELETE_AGENTE_CAMPANA,
    QUERY_GET_HORARIO_FUENTE,
    QUERY_CREATE_HORARIO_FUENTE,
    QUERY_UPDATE_HORARIO_FUENTE
} from "./agenteInfo.queries.js";

const FUENTES = {
    1: "whatsapp",
    2: "landing interno",
    3: "google",
    4: "fb,msg",
    5: "tiktok"
};

export const getAgentesByCampanaService = async (idCampana) => {

    const result = await db.query(
        QUERY_GET_AGENTES_BY_CAMPANA,
        [idCampana]
    );

    const rows = result.rows;

    const agrupado = {};

    for (const row of rows) {

        if (!agrupado[row.id_usuario]) {

            agrupado[row.id_usuario] = {
                id_usuario: row.id_usuario,
                dni: row.dni,
                nombre: row.nombre,
                usuario: row.usuario,
                fecha_registro: row.fecha_registro,

                plataforma: row.id_plataforma,

                hora_entrada: row.hora_in,
                hora_salida: row.hora_out,
                ultima_conexion: row.ultimo_ping,

                id_carteriza: row.id_carteriza,

                fuentes: []
            };
        }

        if (row.fuente) {

            agrupado[row.id_usuario].fuentes.push({
                fuente: row.fuente,

                hora_ini: row.hora_ini,
                hora_fin: row.hora_fin,

                hora_ini_s: row.hora_ini_s,
                hora_fin_s: row.hora_fin_s,

                activo: row.activo
            });
        }
    }

    return Object.values(agrupado);
};

export const updateHorarioFuenteService = async ({
    id_carteriza,
    fuente,
    hora_ini,
    hora_fin,
    hora_ini_s,
    hora_fin_s
}) => {

    const existe = await db.query(
        QUERY_GET_HORARIO_FUENTE,
        [id_carteriza, fuente]
    );

    if (existe.rows.length > 0) {

        const updated = await db.query(
            QUERY_UPDATE_HORARIO_FUENTE,
            [
                id_carteriza,
                fuente,
                hora_ini,
                hora_fin,
                hora_ini_s,
                hora_fin_s
            ]
        );

        return updated.rows[0];
    }

    const created = await db.query(
        QUERY_CREATE_HORARIO_FUENTE,
        [
            id_carteriza,
            fuente,
            hora_ini,
            hora_fin,
            hora_ini_s,
            hora_fin_s
        ]
    );

    return created.rows[0];
};

export const deleteAgenteCampanaService = async (id_reg) => {

    const result = await db.query(
        QUERY_DELETE_AGENTE_CAMPANA,
        [id_reg]
    );

    return result.rows[0];
};