//back/modules/agenteInfo/agenteInfo.routes.js
import { Router } from "express";

import {
    getAgentesByCampana,
    updateHorarioFuente,
    deleteAgenteCampana
} from "./agenteInfo.controller.js";

const router = Router();

router.get(
    "/campana/:idCampana",
    getAgentesByCampana
);

router.put(
    "/horario",
    updateHorarioFuente
);

router.delete(
    "/campana/:id_reg",
    deleteAgenteCampana
);

export default router;