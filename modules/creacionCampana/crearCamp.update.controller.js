import { updateCampaniaService }
from "./crearCamp.update.service.js";

export const updateCampaniaController =
async (req, res) => {

  try {

    const { id } = req.params

    const result =
      await updateCampaniaService(
        Number(id),
        req.body
      )

    return res.status(200).json(result)

  } catch (error) {

    console.error(
      "[ERROR_UPDATE_CAMPANIA]",
      error
    )

    return res.status(500).json({
      message:
        error.message ||
        "Error actualizando campaña"
    })

  }

}