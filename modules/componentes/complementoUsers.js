// back/modules/componentes/complementoUsers.js
import { pg_admindb } from "../../config/pg_admin.js";
import bcrypt from "bcryptjs";

import {
  QUERY_GET_USUARIOS,
  QUERY_GET_CAMPANAS_USUARIO,
  QUERY_GET_CAMPANAS_DASHBOARD,
  QUERY_UPDATE_USUARIO,
  QUERY_DELETE_USUARIO,
  QUERY_DELETE_USUARIO_CAMP
} from "../queries/queriesUsers.js";


// ==============================
// 🧠 SERVICE EXISTENTE
// ==============================

const obtenerUsuariosService = async () => {
  try {
    const { rows: usuarios } = await pg_admindb.query(QUERY_GET_USUARIOS);
    const { rows: relaciones } = await pg_admindb.query(QUERY_GET_CAMPANAS_USUARIO);
    const { rows: campanas } = await pg_admindb.query(QUERY_GET_CAMPANAS_DASHBOARD);

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
      const { rows } = await pg_admindb.query(
        "SELECT password FROM admin.ra_usuarios WHERE id = $1",
        [id]
      );
      hashedPassword = rows[0].password;
    }

    // ✏️ UPDATE USUARIO
    await pg_admindb.query(QUERY_UPDATE_USUARIO, [
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

    // 🧹 LIMPIAR + INSERTAR CAMPAÑAS
    if (Array.isArray(campanas)) {

      // DELETE relaciones
      await pg_admindb.query(QUERY_DELETE_USUARIO_CAMP, [id]);

      if (campanas.length > 0) {

        // 🔥 INSERT MASIVO DINÁMICO (PostgreSQL)
        const values = campanas.map(c => [id, Number(c)]);
        const flatValues = values.flat();

        const placeholders = values
          .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
          .join(",");

        const query = `
          INSERT INTO admin.ra_usuario_camp (id_usuario, id_camp)
          VALUES ${placeholders}
        `;

        await pg_admindb.query(query, flatValues);
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
    await pg_admindb.query(QUERY_DELETE_USUARIO_CAMP, [id]);

    // eliminar usuario
    await pg_admindb.query(QUERY_DELETE_USUARIO, [id]);

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
// ==============================
// ➕ SERVICE CREATE
// ==============================

const createUsuarioService = async (body) => {
  const {
    usuario,
    nombres,
    apellidos,
    password,
    estado,
    id_tipo_usuario,
    id_grupo,
    campanas = []
  } = body;

  try {
    // 🔐 VALIDACIONES BÁSICAS
    if (!usuario || !nombres || !apellidos || !password) {
      throw new Error("Faltan campos obligatorios");
    }

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // ➕ INSERT USUARIO
    const { rows } = await pg_admindb.query(
      `
        INSERT INTO admin.ra_usuarios (
    nombres,
    apellidos,
    usuario,
    password,
    estado,
    id_tipo_usuario,
    id_grupo,
    id_camp,
    nro_doc,
    reportes,
    fec_reg,
    fec_mod
  )
  VALUES (
    $1,$2,$3,$4,$5,$6,$7,
    1,
    '00000000',
    NULL,
    NOW(),
    NOW()
  )
      RETURNING id
      `,
      [
        nombres,
        apellidos,
        usuario,
        hashedPassword,
        estado,
        id_tipo_usuario,
        id_grupo
      ]
    );

    const userId = rows[0].id;

    // ==============================
    // 📊 INSERT CAMPAÑAS
    // ==============================

    if (Array.isArray(campanas) && campanas.length > 0) {

      const values = campanas.map(c => [userId, Number(c)]);
      const flatValues = values.flat();

      const placeholders = values
        .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
        .join(",");

      const query = `
        INSERT INTO admin.ra_usuario_camp (id_usuario, id_camp)
        VALUES ${placeholders}
      `;

      await pg_admindb.query(query, flatValues);
    }

    return userId;

  } catch (error) {
    throw error;
  }
};
// ==============================
// ➕ CREATE CONTROLLER
// ==============================

export const createUsuario = async (req, res) => {
  try {
    const userId = await createUsuarioService(req.body);

    return res.json({
      ok: true,
      message: "Usuario creado correctamente",
      id: userId
    });

  } catch (error) {
    console.error("Error en createUsuario:", error);

    return res.status(500).json({
      ok: false,
      message: error.message || "Error al crear usuario"
    });
  }
};