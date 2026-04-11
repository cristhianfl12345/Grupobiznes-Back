import express from "express";
import dbAmsql from "../config/dbAmsql.js";
import db from "../config/dbmsql.js"; // BD campañas
import { pg_admindb } from "../config/pg_admin.js"; // BD admin (PostgreSQL)
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
const router = express.Router();

// mover a .env en producción
const JWT_SECRET = "$2a$12$5H/LNYidqFAEL5R5L8I0d.H0AOlf3lLBKLN.cqpFOXsuIdkgQUmOq";
const JWT_EXPIRES = "8h";

/**
 * LOGIN
 */
router.post("/login", async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({
        ok: false,
        message: "Usuario y contraseña son obligatorios",
      });
    }

    const [rows] = await dbAmsql.query(
      `
      SELECT 
        u.id,
        u.nombres,
        u.apellidos,
        u.usuario,
        u.password,
        u.estado,
        u.id_tipo_usuario,
        u.id_grupo,
        u.id_camp,
        u.nro_doc,
        u.reportes,
        t.descripcion AS tipo_usuario
      FROM ra_usuarios u
      INNER JOIN ra_tipo_usuario t 
        ON t.id = u.id_tipo_usuario
      WHERE u.usuario = ?
      LIMIT 1
      `,
      [usuario]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        ok: false,
        message: "Usuario o contraseña incorrectos",
      });
    }

    const user = rows[0];
  
    
    if (user.estado.trim() !== "1") {
      return res.status(403).json({
        ok: false,
        message: "Usuario inactivo",
      });
    }
// inicio nueva encriptacion
let validPassword = false;

// bcrypt
if (user.password.startsWith("$2b$")) {
  validPassword = await bcrypt.compare(password, user.password);
}
// SHA1 (tu caso actual)
else if (user.password.length === 40) {
  const sha1 = crypto.createHash("sha1").update(password).digest("hex");
  validPassword = sha1 === user.password;
}
// texto plano (por si acaso legacy)
else {
  validPassword = password === user.password;
}
// fin nueva encriptacion
if (!validPassword) {
  return res.status(401).json({
    ok: false,
    message: "Usuario o contraseña incorrectos",
  });
}
{/* ANTIGUA VALIDACION DE CONTRASEÑA (solo bcrypt o texto plano, sin migracion) 
     let validPassword = false;

    if (user.password.startsWith("$2b$")) {
      validPassword = await bcrypt.compare(password, user.password);
    } else {
      validPassword = password === user.password;
    }

    if (!validPassword) {
      return res.status(401).json({
        ok: false,
        message: "Usuario o contraseña incorrectos",
      });
    } */}
    const token = jwt.sign(
      {
        id: user.id,
        usuario: user.usuario,
        tipo_usuario: user.tipo_usuario,
        id_tipo_usuario: user.id_tipo_usuario,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    delete user.password;

    res.json({
      ok: true,
      message: "Login correcto",
      token,
      user,
    });

  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno",
    });
  }
});

/**
 * MIDDLEWARE
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({
        ok: false,
        message: "Token requerido",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: "Token inválido",
    });
  }
};

/**
 * PERFIL
 */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const [rows] = await dbAmsql.query(
      `
      SELECT 
        u.id,
        u.nombres,
        u.apellidos,
        u.usuario,
        u.estado,
        t.descripcion AS tipo_usuario
      FROM ra_usuarios u
      INNER JOIN ra_tipo_usuario t 
        ON t.id = u.id_tipo_usuario
      WHERE u.id = ?
      `,
      [req.user.id]
    );

    res.json({
      ok: true,
      user: rows[0],
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error interno",
    });
  }
});

/**
 * campañas por usuario
 */
// 🔐 OBTENER CAMPAÑAS SEGÚN USUARIO
router.get("/mis-campanas/:idUsuario", async (req, res) => {
  try {
    const { idUsuario } = req.params;

    // 1. Obtener usuario + rol
    const [userRows] = await dbAmsql.query(
      `
      SELECT 
        u.id,
        u.id_tipo_usuario,
        t.descripcion AS tipo_usuario
      FROM ra_usuarios u
      INNER JOIN ra_tipo_usuario t 
        ON t.id = u.id_tipo_usuario
      WHERE u.id = ?
      LIMIT 1
      `,
      [idUsuario]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    const user = userRows[0];

    // ROLES QUE VEN TODO
    const rolesFullAccess = [1, 2, 6]; // Administrador, Sistemas, Gerencia

    let campanas = [];

    // Si tiene acceso total >> traer TODAS las campañas
    if (rolesFullAccess.includes(user.id_tipo_usuario)) {
      const [rows] = await db.query(`
        SELECT IdCamp, Campana
        FROM bz_campanas
        ORDER BY Campana ASC
      `);

      campanas = rows;
    } 
    //  Si NO >> solo campañas asignadas
    else {
      const [rows] = await db.query(
        `
        SELECT c.IdCamp, c.Campana
        FROM bz_campanas c
        INNER JOIN biznes_dbaplicacion.ra_usuario_camp uc 
          ON uc.id_camp = c.IdCamp
        WHERE uc.id_usuario = ?
        ORDER BY c.Campana ASC
        `,
        [idUsuario]
      );

      campanas = rows;
    }

    res.json({
      ok: true,
      user: {
        id: user.id,
        tipo_usuario: user.tipo_usuario,
      },
      campanas,
    });

  } catch (error) {
    console.error("Error obteniendo campañas:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno",
    });
  }
});

export default router;