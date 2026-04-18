import express from "express";
import { pg_admindb } from "../config/pg_admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const router = express.Router();

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

    const { rows } = await pg_admindb.query(
      `
      SELECT 
        u.id,
        u.nombres,
        u.apellidos,
        u.usuario,
        TRIM(u.password) AS password,
        u.estado,
        u.id_tipo_usuario,
        u.id_grupo,
        u.id_camp,
        u.nro_doc,
        u.reportes,
        t.descripcion AS tipo_usuario
      FROM admin.ra_usuarios u
      INNER JOIN admin.ra_tipo_usuario t 
        ON t.id = u.id_tipo_usuario
      WHERE u.usuario = $1
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

    // 🔥 FIX: asegurar tipo numérico
    if (Number(user.estado) !== 1) {
      return res.status(403).json({
        ok: false,
        message: "Usuario inactivo",
      });
    }

    let validPassword = false;
    const dbPassword = user.password.trim();

    // 🔥 bcrypt (todos los prefijos)
    if (dbPassword.startsWith("$2")) {
      validPassword = await bcrypt.compare(password, dbPassword);
    }
    // SHA1
    else if (dbPassword.length === 40) {
      const sha1 = crypto.createHash("sha1").update(password).digest("hex");
      validPassword = sha1 === dbPassword;
    }
    // texto plano
    else {
      validPassword = password === dbPassword;
    }

    {/*DEBUG
    console.log("INPUT:", password);
    console.log("DB:", dbPassword);
    console.log("VALID:", validPassword);
    */}
    if (!validPassword) {
      return res.status(401).json({
        ok: false,
        message: "Usuario o contraseña incorrectos",
      });
    }

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
    const { rows } = await pg_admindb.query(
      `
      SELECT 
        u.id,
        u.nombres,
        u.apellidos,
        u.usuario,
        u.estado,
        t.descripcion AS tipo_usuario
      FROM admin.ra_usuarios u
      INNER JOIN admin.ra_tipo_usuario t 
        ON t.id = u.id_tipo_usuario
      WHERE u.id = $1
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
 * CAMPAÑAS
 */
router.get("/mis-campanas/:idUsuario", async (req, res) => {
  try {
    const { idUsuario } = req.params;

    const { rows: userRows } = await pg_admindb.query(
      `
      SELECT 
        u.id,
        u.id_tipo_usuario,
        t.descripcion AS tipo_usuario
      FROM admin.ra_usuarios u
      INNER JOIN admin.ra_tipo_usuario t 
        ON t.id = u.id_tipo_usuario
      WHERE u.id = $1
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
    const rolesFullAccess = [1, 2, 6];

    let campanas = [];

    if (rolesFullAccess.includes(user.id_tipo_usuario)) {
      const { rows } = await pg_admindb.query(`
        SELECT 
          id_camp AS "IdCamp",
          nombre AS "Campana"
        FROM admin.campanas
        ORDER BY nombre ASC
      `);
      campanas = rows;
    } else {
      const { rows } = await pg_admindb.query(
        `
        SELECT 
          c.id_camp AS "IdCamp",
          c.nombre AS "Campana"
        FROM admin.campanas c
        INNER JOIN admin.ra_usuario_camp uc 
          ON uc.id_camp = c.id_camp
        WHERE uc.id_usuario = $1
        ORDER BY c.nombre ASC
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