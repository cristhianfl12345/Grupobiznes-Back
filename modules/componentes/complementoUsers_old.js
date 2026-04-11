// back/modules/componentes/complementoUsers.js
import dbAmsql from "../../config/dbAmsql.js";
import dbmysql from "../../config/dbmsql.js";

import bcrypt from "bcryptjs";

import {
  QUERY_GET_USUARIOS,
  QUERY_GET_CAMPANAS_USUARIO,
  QUERY_GET_CAMPANAS_DASHBOARD,
  QUERY_UPDATE_USUARIO,
  QUERY_DELETE_USUARIO,
  QUERY_DELETE_USUARIO_CAMP,
  QUERY_INSERT_USUARIO_CAMP
} from "../queries/queriesUsers.js";


// ==============================
// 🧠 SERVICE EXISTENTE
// ==============================

const obtenerUsuariosService = async () => {
  try {
    const [usuarios] = await dbAmsql.query(QUERY_GET_USUARIOS);
    const [relaciones] = await dbAmsql.query(QUERY_GET_CAMPANAS_USUARIO);
    const [campanas] = await dbmysql.query(QUERY_GET_CAMPANAS_DASHBOARD);

    const campanasMap = {};
    campanas.forEach(c => {
      campanasMap[c.IdCamp] = c.Campana;
    });

    const usuarioCampMap = {};
    relaciones.forEach(r => {
      if (!usuarioCampMap[r.id_usuario]) {
        usuarioCampMap[r.id_usuario] = [];
      }
      usuarioCampMap[r.id_usuario].push(r.IdCamp);
    });

    return usuarios.map(u => {
      const idsCamp = usuarioCampMap[u.id] || [];

      return {
        id: u.id,
        usuario: u.usuario,
        nombres: u.nombres,
        apellidos: u.apellidos,
        nivel: {
          id: u.id_tipo_usuario,
          descripcion: u.nivel
        },
        grupo: {
          id: u.id_grupo,
          descripcion: u.grupo
        },
        campanas: idsCamp.map(id => ({
          IdCamp: id,
          Campana: campanasMap[id] || null
        })),
        reportes: u.reportes,
        estado: u.estado
      };
    });

  } catch (error) {
    throw error;
  }
};


// ==============================
// ✏️ SERVICE UPDATE
// ==============================

const updateUsuarioService = async (id, body) => {
  const {
    usuario,
    nombres,
    apellidos,
    password,
    estado,
    id_tipo_usuario,
    id_grupo,
    reportes,
    campanas
  } = body;

  try {
    // 🔐 ENCRIPTAR PASSWORD
    let hashedPassword = null;

    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // 🧠 OBTENER PASSWORD ACTUAL SI NO VIENE
    if (!hashedPassword) {
      const [[user]] = await dbAmsql.query(
        "SELECT password FROM ra_usuarios WHERE id = ?",
        [id]
      );
      hashedPassword = user.password;
    }

    // ✏️ UPDATE USUARIO
    await dbAmsql.query(QUERY_UPDATE_USUARIO, [
      usuario,
      nombres,
      apellidos,
      hashedPassword,
      estado,
      id_tipo_usuario,
      id_grupo,
      reportes,
      id
    ]);

    // 🧹 LIMPIAR CAMPAÑAS
if (Array.isArray(campanas)) {

  // 🧹 DELETE SOLO SI VIENE CAMPAÑAS
  await dbAmsql.query(QUERY_DELETE_USUARIO_CAMP, [id]);

  if (campanas.length > 0) {
    const values = campanas.map(c => [id, Number(c)]);

    await dbAmsql.query(
      "INSERT INTO ra_usuario_camp (id_usuario, id_camp) VALUES ?",
      [values]
    );
  }

}

    return true;

  } catch (error) {
    throw error;
  }
};


// ==============================
// 🧹 SERVICE DELETE
// ==============================

const deleteUsuarioService = async (id) => {
  try {
    // eliminar relaciones primero
    await dbAmsql.query(QUERY_DELETE_USUARIO_CAMP, [id]);

    // eliminar usuario
    await dbAmsql.query(QUERY_DELETE_USUARIO, [id]);

    return true;

  } catch (error) {
    throw error;
  }
};


// ==============================
// 🎮 CONTROLLERS
// ==============================

export const obtenerUsuarios = async (req, res) => {
  try {
    const data = await obtenerUsuariosService();

    return res.json({
      ok: true,
      data
    });

  } catch (error) {
    console.error("Error en obtenerUsuarios:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener usuarios"
    });
  }
};


// ==============================
// ✏️ UPDATE CONTROLLER
// ==============================

export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    await updateUsuarioService(id, req.body);

    return res.json({
      ok: true,
      message: "Usuario actualizado correctamente"
    });

  } catch (error) {
    console.error("Error en updateUsuario:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al actualizar usuario"
    });
  }
};


// ==============================
// 🧹 DELETE CONTROLLER
// ==============================

export const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteUsuarioService(id);

    return res.json({
      ok: true,
      message: "Usuario eliminado correctamente"
    });

  } catch (error) {
    console.error("Error en deleteUsuario:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al eliminar usuario"
    });
  }
};