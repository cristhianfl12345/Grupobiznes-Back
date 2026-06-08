//back/modules/creacionCampana/crearCamp.controller.js

import {
  crearCampaniaService,
  obtenerCampaniaCompletaService,
  eliminarCampaniaCompletaService,
  obtenerTodasCampaniasService,
  agregarIniCampaniaService,
  editarCampaniaService,
  editarIniCampaniaService
} from "./crearCamp.service.js";

// ======================================================
// CREAR
// ======================================================

export const crearCampaniaController = async (req, res) => {

  try {

    const response = await crearCampaniaService(req.body);

    return res.status(201).json(response);

  } catch (error) {

    console.error(
      "[ERROR_CREAR_CAMPANIA]",
      error
    );

    return res.status(500).json({
      ok: false,
      message: error.message || "Error interno"
    });

  }

};

// ======================================================
// GET BY ID
// ======================================================

export const obtenerCampaniaCompletaController = async (req, res) => {

  try {

    const { id } = req.params;

    const response =
      await obtenerCampaniaCompletaService(id);

    return res.status(200).json(response);

  } catch (error) {

    console.error(
      "[ERROR_GET_CAMPANIA]",
      error
    );

    return res.status(500).json({
      ok: false,
      message: error.message || "Error interno"
    });

  }

};

// ======================================================
// DELETE COMPLETO
// ======================================================

export const eliminarCampaniaCompletaController = async (req, res) => {

  try {

    const { id } = req.params;

    const response =
      await eliminarCampaniaCompletaService(id);

    return res.status(200).json(response);

  } catch (error) {

    console.error(
      "[ERROR_DELETE_CAMPANIA]",
      error
    );

    return res.status(500).json({
      ok: false,
      message: error.message || "Error interno"
    });

  }

};
export const obtenerTodasCampaniasController = async (req, res) => {

  try {

    const response =
      await obtenerTodasCampaniasService();

    return res.status(200).json(response);

  } catch (error) {

    console.error(
      "[ERROR_GET_ALL_CAMPANIAS]",
      error
    );

    return res.status(500).json({
      ok: false,
      message: error.message || "Error interno"
    });

  }

};
//UPDATES DESDE ACA

export const agregarIniCampaniaController = async (req, res) => {

  try {

    const data =
      await agregarIniCampaniaService(req.body);

    return res.status(201).json({
      ok: true,
      data
    });

  } catch (error) {

    console.error(
      "[ERROR_ADD_INI]",
      error
    );

    return res.status(500).json({
      ok: false,
      message: error.message
    });

  }

};
export const editarCampaniaController = async (req, res) => {

  try {

    await editarCampaniaService(req.body);

    return res.json({
      ok: true,
      message: "Campaña actualizada"
    });

  } catch (error) {

    console.error(
      "[ERROR_EDIT_CAMP]",
      error
    );

    return res.status(500).json({
      ok: false,
      message: error.message
    });

  }

};
export const editarIniCampaniaController = async (req, res) => {

  try {

    const data =
      await editarIniCampaniaService(req.body);

    return res.json({
      ok: true,
      data
    });

  } catch (error) {

    console.error(
      "[ERROR_EDIT_INI]",
      error
    );

    return res.status(500).json({
      ok: false,
      message: error.message
    });

  }

};