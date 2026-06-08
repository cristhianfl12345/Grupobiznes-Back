//back/modules/agenteInfo/agenteInfo.controller.js
import {
    getAgentesByCampanaService,
    updateHorarioFuenteService,
    deleteAgenteCampanaService
} from "./agenteInfo.service.js";

export const getAgentesByCampana = async (req, res) => {

    try {

        const { idCampana } = req.params;

        const data = await getAgentesByCampanaService(idCampana);

        return res.json({
            ok: true,
            data
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            ok: false,
            msg: "Error obteniendo agentes"
        });
    }
};

export const updateHorarioFuente = async (req, res) => {

    try {

        const data = await updateHorarioFuenteService(req.body);

        return res.json({
            ok: true,
            data
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            ok: false,
            msg: "Error actualizando horario"
        });
    }
};

export const deleteAgenteCampana = async (req, res) => {

    try {

        const { id_reg } = req.params;

        const data = await deleteAgenteCampanaService(id_reg);

        return res.json({
            ok: true,
            data
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            ok: false,
            msg: "Error eliminando agente"
        });
    }
};