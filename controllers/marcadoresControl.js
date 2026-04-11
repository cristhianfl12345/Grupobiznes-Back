import express from "express"
import db from "../config/dbmsql.js"
import fetch from "node-fetch"

const router = express.Router()

/* ============================
   CAMPAÑAS
============================ */

router.get("/campanas", async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT IdCamp, Campana
      FROM bz_campanas
      ORDER BY Campana ASC
    `)

    res.json(rows)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error obteniendo campañas" })
  }
})

/* ============================
   MARCADORES POR CAMPAÑA
============================ */

router.get("/marcadores/:idCamp", async (req, res) => {

  try {

    const { idCamp } = req.params

    const [rows] = await db.query(`
      SELECT id_marcador, marcador, IdCamp
      FROM bz_marcadores
      WHERE IdCamp = ?
      ORDER BY marcador ASC
    `, [idCamp])

    res.json(rows)

  } catch (err) {

    console.error(err)
    res.status(500).json({ error: "Error obteniendo marcadores" })

  }

})

/* ============================
   TELEFONOS ACTIVOS
============================ */

router.get("/activos/:idCamp", async (req, res) => {

  try {

    const { idCamp } = req.params

    const [rows] = await db.query(`
     SELECT 
        a.id,
        a.telefono,

        a.id_usuario,
        CONCAT(u.nombres, ' ', u.apellidos) AS usuario_nombre,

        a.id_marcador,
        CONCAT(a.id_marcador, ' - ', m.marcador) AS marcador_nombre,

        a.fecha_consulta

      FROM telefonos_activos a

      LEFT JOIN biznes_dbaplicacion.ra_usuarios u
        ON u.id = a.id_usuario

      LEFT JOIN bz_marcadores m
        ON m.id_marcador = a.id_marcador
        AND m.IdCamp = a.IdCamp

      WHERE a.IdCamp = ?
      ORDER BY a.fecha_consulta DESC
    `, [idCamp])

    res.json(rows)

  } catch (err) {

    console.error(err)
    res.status(500).json({ error: "Error obteniendo activos" })

  }

})

/* ============================
   TELEFONOS SPAM
============================ */

router.get("/spam/:idCamp", async (req, res) => {

  try {

    const { idCamp } = req.params

    const [rows] = await db.query(`
     SELECT 
        s.id,
        s.telefono,

        s.id_usuario,
        CONCAT(u.nombres, ' ', u.apellidos) AS usuario_nombre,

        s.id_marcador,
        CONCAT(s.id_marcador, ' - ', m.marcador) AS marcador_nombre,

        s.fecha_consulta

      FROM telefonos_spam s

      LEFT JOIN biznes_dbaplicacion.ra_usuarios u
        ON u.id = s.id_usuario

      LEFT JOIN bz_marcadores m
        ON m.id_marcador = s.id_marcador
        AND m.IdCamp = s.IdCamp

      WHERE s.IdCamp = ?
      ORDER BY s.fecha_consulta DESC
    `, [idCamp])

    res.json(rows)

  } catch (err) {

    console.error(err)
    res.status(500).json({ error: "Error obteniendo spam" })

  }

})

/* ============================
   GENERAR MASCARAS
============================ */

router.post("/generar-mascaras", async (req, res) => {

  try {

const { idCamp, idMarcador, cantidad } = req.body

const limit = Number(cantidad) || 1

const [telefonos] = await db.query(`
  SELECT id, telefono
  FROM gen_masks
  WHERE telefono IS NOT NULL
  ORDER BY RAND()
  LIMIT ${limit}
`)

    res.json({
      status: true,
      data: telefonos.map(t => ({
        id_gen_mask: t.id,
        telefono: t.telefono,
        id_marcador: idMarcador,
        IdCamp: idCamp
      }))
    })

  } catch (err) {

    console.error(err)
    res.status(500).json({ error: "Error generando máscaras" })

  }

})

/* ============================
   CONFIRMAR MASCARAS
============================ */

router.post("/confirmar-mascaras", async (req, res) => {

  const conn = await db.getConnection()

  try {

    const { ids, idCamp, idMarcador, id_usuario } = req.body

    await conn.beginTransaction()

    const [telefonos] = await conn.query(`
      SELECT *
      FROM gen_masks
      WHERE id IN (?)
    `, [ids])

    for (const t of telefonos) {

      await conn.query(`
        INSERT INTO telefonos_activos
        (telefono, id_usuario, id_marcador, IdCamp, fecha_consulta)
        VALUES (?,?,?,?,NOW())
      `, [t.telefono, id_usuario, idMarcador, idCamp])

      await conn.query(`
        DELETE FROM gen_masks
        WHERE id = ?
      `, [t.id])

    }

    await conn.commit()
    await exportarLogsGoogle(idCamp)

    res.json({
      status: true,
      msg: "Máscaras confirmadas"
    })

  } catch (err) {

    await conn.rollback()
    console.error(err)

    res.status(500).json({
      error: "Error confirmando máscaras"
    })

  } finally {

    conn.release()

  }

})

/* ============================
   ACTIVO → SPAM
============================ */

router.post("/mover-spam", async (req, res) => {

  const conn = await db.getConnection()

  try {

    const { id, id_usuario } = req.body

    await conn.beginTransaction()

    const [[activo]] = await conn.query(`
      SELECT *
      FROM telefonos_activos
      WHERE id = ?
    `, [id])

    if (!activo) {

      await conn.rollback()
      return res.json({ status: false })

    }

    await conn.query(`
      INSERT INTO telefonos_spam
      (telefono, id_usuario,id_marcador,IdCamp,fecha_consulta)
      VALUES (?,?,?,?,NOW())
    `, [activo.telefono, id_usuario, activo.id_marcador, activo.IdCamp])
        await conn.query(`
      INSERT INTO bz_notificaciones
      (telefono, id_usuario,id_marcador,IdCamp,fecha_consulta)
      VALUES (?,?,?,?,NOW())
    `, [activo.telefono, id_usuario, activo.id_marcador, activo.IdCamp])


    await conn.query(`
      DELETE FROM telefonos_activos
      WHERE id = ?
    `, [id])

    await conn.commit()
    await exportarLogsGoogle(activo.IdCamp)

    res.json({ status: true })

  } catch (err) {

    await conn.rollback()
    console.error(err)

    res.status(500).json({
      error: "Error moviendo a spam"
    })

  } finally {

    conn.release()

  }

})

/* ============================
   REEMPLAZAR SPAM
============================ */

router.post("/reemplazar-spam", async (req, res) => {

  const conn = await db.getConnection()

  try {

    const { id, id_usuario } = req.body

    await conn.beginTransaction()

    const [[spam]] = await conn.query(`
      SELECT *
      FROM telefonos_spam
      WHERE id = ?
    `, [id])

    const [[nuevo]] = await conn.query(`
      SELECT id,telefono
      FROM gen_masks
      ORDER BY RAND()
      LIMIT 1
    `)

    if (!spam || !nuevo) {

      await conn.rollback()
      return res.json({
        status:false
      })

    }

    await conn.query(`
      INSERT INTO telefonos_activos
      (telefono, id_usuario, id_marcador, IdCamp, fecha_consulta)
      VALUES (?,?,?,?,NOW())
    `, [nuevo.telefono, id_usuario, spam.id_marcador, spam.IdCamp])

    await conn.query(`
      DELETE FROM telefonos_spam
      WHERE id = ?
    `, [id])

    await conn.query(`
      DELETE FROM gen_masks
      WHERE id = ?
    `, [nuevo.id])

    await conn.commit()
    await exportarLogsGoogle(spam.IdCamp)

    res.json({
      status:true,
      telefono_nuevo:nuevo.telefono
    })

  } catch (err) {

    await conn.rollback()
    console.error(err)

    res.status(500).json({
      error:"Error reemplazando spam"
    })

  } finally {

    conn.release()

  }

})

/* ============================
   ENVIAR TELEFONOS API
============================ */

router.post("/enviar-api", async (req, res) => {

  try {

    const { idMarcador, telefonos } = req.body

    const payload = {

      code: "script1",
      var1: String(idMarcador),
      var2: telefonos.join(",")

    }

    const response = await fetch(
      "https://crm.biznes.pe/wsb/custom/updates/",
      {
        method:"POST",
        headers:{
          token:"Kftu8IalEjvwFPN",
          "Content-Type":"application/json"
        },
        body:JSON.stringify(payload)
      }
    )

    const data = await response.text()

    res.json({
      status:true,
      response:data
    })

  } catch (err) {

    console.error(err)

    res.status(500).json({
      error:"Error enviando a API"
    })

  }

})

/* ============================
   RESUMEN MARCADORES POR CAMPAÑA
============================ */

router.get("/resumen-marcadores/:idCamp", async (req, res) => {

  try {

    const { idCamp } = req.params

    const [rows] = await db.query(`

      SELECT 
        m.id_marcador,
        m.marcador,

        COUNT(DISTINCT a.id) AS activos,
        COUNT(DISTINCT s.id) AS spam

      FROM bz_marcadores m

      LEFT JOIN telefonos_activos a
        ON a.id_marcador = m.id_marcador
        AND a.IdCamp = m.IdCamp

      LEFT JOIN telefonos_spam s
        ON s.id_marcador = m.id_marcador
        AND s.IdCamp = m.IdCamp

      WHERE m.IdCamp = ?

      GROUP BY 
        m.id_marcador,
        m.marcador

      HAVING activos > 0 OR spam > 0

      ORDER BY m.marcador ASC

    `, [idCamp])

    res.json(rows)

  } catch (err) {

    console.error(err)

    res.status(500).json({
      error: "Error obteniendo resumen de marcadores"
    })

  }

})
// exportar logs a excel
// ============================
// QUERY CENTRALIZADA
// ============================
const QUERY_LOGS = `
SELECT * FROM (

  /* =========================
     TELÉFONOS ACTIVOS
  ========================= */
  SELECT
    '' AS id,
    c.IdCamp AS idcamp,
    c.Campana AS campana,
    m.id_marcador,
    m.marcador,
    t.telefono,

    CONCAT(u1.nombres, ' ', u1.apellidos) AS asignadopor,
    t.fecha_consulta AS fecha_asignado,

    'telefonos_activos' AS estado,
    NULL AS movidopor,
    NULL AS fecha_movimiento

  FROM telefonos_activos t
  JOIN bz_campanas c ON c.IdCamp = t.IdCamp

  LEFT JOIN bz_marcadores m
    ON m.id_marcador = t.id_marcador
    AND m.IdCamp = t.IdCamp

  LEFT JOIN biznes_dbaplicacion.ra_usuarios u1
    ON u1.id = t.id_usuario

  UNION ALL

  /* =========================
     TELÉFONOS SPAM
  ========================= */
  SELECT
    '' AS id,
    c.IdCamp AS idcamp,
    c.Campana AS campana,
    m.id_marcador,
    m.marcador,
    s.telefono,

    CONCAT(u1.nombres, ' ', u1.apellidos) AS asignadopor,
    a.fecha_consulta AS fecha_asignado,

    'telefonos_spam' AS estado,
    CONCAT(u2.nombres, ' ', u2.apellidos) AS movidopor,
    s.fecha_consulta AS fecha_movimiento

  FROM telefonos_spam s
  JOIN bz_campanas c ON c.IdCamp = s.IdCamp

  LEFT JOIN telefonos_activos a
    ON a.telefono = s.telefono
    AND a.IdCamp = s.IdCamp

  LEFT JOIN bz_marcadores m
    ON m.id_marcador = a.id_marcador
    AND m.IdCamp = a.IdCamp

  LEFT JOIN biznes_dbaplicacion.ra_usuarios u1
    ON u1.id = a.id_usuario

  LEFT JOIN biznes_dbaplicacion.ra_usuarios u2
    ON u2.id = s.id_usuario

) x
WHERE x.idcamp = ?
`


// ============================
// ENDPOINT EXPORTAR LOGS
// ============================
router.post("/exportar-logs-google/:idCamp", async (req, res) => {
  try {
    const { idCamp } = req.params

    if (!idCamp || Number(idCamp) <= 0) {
      console.error("EXPORT LOGS GOOGLE | Campaña inválida")
      return res.status(400).json({ ok: false })
    }

    const [data] = await db.query(QUERY_LOGS, [idCamp])

    if (!data.length) {
      console.log("EXPORT LOGS GOOGLE | Sin datos")
      return res.json({ ok: false, msg: "Sin datos" })
    }

    const url = "https://script.google.com/macros/s/AKfycbzbyIKh6MBaDRPoUiRZP7qQ-vplkzsrMBXFb15ZG1fEP0owZNo-NGTbJiqsufZMssSXnw/exec"

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "insert_logs",
        data
      })
    })

    const text = await response.text()

    console.log(`EXPORT LOGS GOOGLE | HTTP: ${response.status} | FILAS: ${data.length}`)

    res.json({
      ok: response.status === 200,
      response: text
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error exportando logs" })
  }
})

// ============================
// FUNCIÓN REUTILIZABLE
// ============================
async function exportarLogsGoogle(idCamp, conn = db) {
  try {
    const [data] = await conn.query(QUERY_LOGS, [idCamp])

    if (!data.length) return

    await fetch("https://script.google.com/macros/s/AKfycbzbyIKh6MBaDRPoUiRZP7qQ-vplkzsrMBXFb15ZG1fEP0owZNo-NGTbJiqsufZMssSXnw/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "insert_logs",
        data
      })
    })

  } catch (err) {
    console.error("ERROR EXPORTANDO LOGS:", err)
  }
}

// ============================
// BULK: ACTIVOS → SPAM
// ============================
router.post("/mover-spam-bulk", async (req, res) => {

  const conn = await db.getConnection();

  try {

    const { ids, id_usuario } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.json({ status: false, msg: "IDs vacíos" });
    }

    await conn.beginTransaction();

    // 🔹 Obtener todos los activos seleccionados
    const [activos] = await conn.query(`
      SELECT *
      FROM telefonos_activos
      WHERE id IN (?)
    `, [ids]);

    if (!activos.length) {
      await conn.rollback();
      return res.json({ status: false, msg: "Sin registros" });
    }

    // 🔹 Insert masivo a SPAM
    const valuesSpam = activos.map(a => [
      a.telefono,
      id_usuario,
      a.id_marcador,
      a.IdCamp
    ]);

    await conn.query(`
      INSERT INTO telefonos_spam
      (telefono, id_usuario, id_marcador, IdCamp, fecha_consulta)
      VALUES ${valuesSpam.map(() => "(?,?,?,?,NOW())").join(",")}
    `, valuesSpam.flat());

    // 🔹 Insert masivo a NOTIFICACIONES
    await conn.query(`
      INSERT INTO bz_notificaciones
      (telefono, id_usuario, id_marcador, IdCamp, fecha_consulta)
      VALUES ${valuesSpam.map(() => "(?,?,?,?,NOW())").join(",")}
    `, valuesSpam.flat());

    // 🔹 Eliminar activos
    await conn.query(`
      DELETE FROM telefonos_activos
      WHERE id IN (?)
    `, [ids]);

    await conn.commit();

    // 🔹 Exportar logs UNA SOLA VEZ (optimizado)
    await exportarLogsGoogle(activos[0].IdCamp);

    res.json({
      status: true,
      total: activos.length
    });

  } catch (err) {

    await conn.rollback();
    console.error(err);

    res.status(500).json({
      error: "Error en bulk mover a spam"
    });

  } finally {

    conn.release();

  }

});
// ============================
// BULK: REEMPLAZAR SPAM
// ============================
router.post("/reemplazar-spam-bulk", async (req, res) => {

  const conn = await db.getConnection();

  try {

    const { ids, id_usuario } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.json({ status: false, msg: "IDs vacíos" });
    }

    await conn.beginTransaction();

    // 🔹 Obtener spam seleccionados
    const [spams] = await conn.query(`
      SELECT *
      FROM telefonos_spam
      WHERE id IN (?)
    `, [ids]);

    if (!spams.length) {
      await conn.rollback();
      return res.json({ status: false, msg: "Sin registros" });
    }

    // 🔹 Obtener máscaras necesarias
    const [mascaras] = await conn.query(`
      SELECT id, telefono
      FROM gen_masks
      ORDER BY RAND()
      LIMIT ?
    `, [spams.length]);

    if (mascaras.length < spams.length) {
      await conn.rollback();
      return res.json({
        status: false,
        msg: "No hay suficientes máscaras"
      });
    }

    // 🔹 Insertar nuevos activos
    const valuesActivos = spams.map((s, i) => [
      mascaras[i].telefono,
      id_usuario,
      s.id_marcador,
      s.IdCamp
    ]);

    await conn.query(`
      INSERT INTO telefonos_activos
      (telefono, id_usuario, id_marcador, IdCamp, fecha_consulta)
      VALUES ${valuesActivos.map(() => "(?,?,?,?,NOW())").join(",")}
    `, valuesActivos.flat());

    // 🔹 Eliminar spam antiguos
    await conn.query(`
      DELETE FROM telefonos_spam
      WHERE id IN (?)
    `, [ids]);

    // 🔹 Eliminar máscaras usadas
    const idsMascaras = mascaras.map(m => m.id);

    await conn.query(`
      DELETE FROM gen_masks
      WHERE id IN (?)
    `, [idsMascaras]);

    await conn.commit();

    // 🔹 Exportar logs UNA VEZ
    await exportarLogsGoogle(spams[0].IdCamp);

    res.json({
      status: true,
      total: spams.length,
      nuevos: mascaras.map(m => m.telefono)
    });

  } catch (err) {

    await conn.rollback();
    console.error(err);

    res.status(500).json({
      error: "Error en bulk reemplazar spam"
    });

  } finally {

    conn.release();

  }

});
export default router