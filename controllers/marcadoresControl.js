import express from "express"
import {db} from "../config/db.js"
import fetch from "node-fetch"

const router = express.Router()

/* ============================
   CAMPAÑAS
============================ */

router.get("/campanas", async (req, res) => {
  try {

    const {rows} = await db.query(`
      SELECT id_camp, nombre
      FROM admin.campanas
      WHERE activa = true  
      ORDER BY id_camp ASC 
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

    const idCamp = Number(req.params.idCamp)

    const { rows } = await db.query(`
      SELECT id_marcador, marcador, id_camp
      FROM admin.marcadores
      WHERE id_camp = $1
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

    const idCamp = Number(req.params.idCamp)

    const { rows } = await db.query(`
     SELECT 
        a.id,
        a.telefono,

        a.id_usuario,
        u.nombres || ' ' || u.apellidos AS usuario_nombre,

        a.id_marcador,
        a.id_marcador || ' - ' || m.marcador AS marcador_nombre,

        a.fecha_consulta

      FROM admin.telefonos_activos a

      LEFT JOIN admin.ra_usuarios u
        ON u.id = a.id_usuario

      LEFT JOIN admin.marcadores m
        ON m.id_marcador = a.id_marcador
        AND m.id_camp = a.id_camp

      WHERE a.id_camp = $1
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

    const idCamp = Number(req.params.idCamp)

    const { rows } = await db.query(`
     SELECT 
        s.id,
        s.telefono,

        s.id_usuario,
        u.nombres || ' ' || u.apellidos AS usuario_nombre,

        s.id_marcador,
        s.id_marcador || ' - ' || m.marcador AS marcador_nombre,

        s.fecha_consulta

      FROM admin.telefonos_spam s

      LEFT JOIN admin.ra_usuarios u
        ON u.id = s.id_usuario

      LEFT JOIN admin.marcadores m
        ON m.id_marcador = s.id_marcador
        AND m.id_camp = s.id_camp

      WHERE s.id_camp = $1
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

const { rows: telefonos } = await db.query(`
  SELECT id, telefono
  FROM admin.gen_masks
  WHERE telefono IS NOT NULL
  ORDER BY RANDOM()
  LIMIT $1
`, [limit])

    res.json({
      status: true,
      data: telefonos.map(t => ({
        id_gen_mask: t.id,
        telefono: t.telefono,
        id_marcador: idMarcador,
        id_camp: idCamp
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

  const conn = await db.connect()

  try {

    const { ids, idCamp, idMarcador, id_usuario } = req.body

    await conn.query("BEGIN")

    const { rows: telefonos } = await conn.query(`
      SELECT *
      FROM admin.gen_masks
      WHERE id = ANY($1)
    `, [ids])

    for (const t of telefonos) {

      await conn.query(`
        INSERT INTO admin.telefonos_activos
        (telefono, id_usuario, id_marcador, id_camp, fecha_consulta)
        VALUES ($1,$2,$3,$4,NOW())
      `, [t.telefono, id_usuario, idMarcador, idCamp])

      await conn.query(`
        DELETE FROM admin.gen_masks
        WHERE id = $1
      `, [t.id])

    }

    await conn.query("COMMIT")
    await exportarLogsGoogle(idCamp)

    res.json({
      status: true,
      msg: "Máscaras confirmadas"
    })

  } catch (err) {

    await conn.query("ROLLBACK")
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

  const conn = await db.connect()

  try {

    const { id, id_usuario } = req.body

    await conn.query("BEGIN")

    const { rows } = await conn.query(`
      SELECT *
      FROM admin.telefonos_activos
      WHERE id = $1
    `, [id])
const activo = rows[0]

    if (!activo) {

      await conn.query("ROLLBACK")
      return res.json({ status: false })

    }

    await conn.query(`
      INSERT INTO admin.telefonos_spam
      (telefono, id_usuario,id_marcador,id_camp,fecha_consulta)
      VALUES ($1,$2,$3,$4,NOW())
    `, [activo.telefono, id_usuario, activo.id_marcador, activo.id_camp])
        await conn.query(`
      INSERT INTO admin.notificaciones_marcadores
      (telefono, id_usuario,id_marcador,id_camp,fecha_consulta)
      VALUES ($1,$2,$3,$4,NOW())
    `, [activo.telefono, id_usuario, activo.id_marcador, activo.id_camp])


    await conn.query(`
      DELETE FROM admin.telefonos_activos
      WHERE id = $1
    `, [id])

    await conn.query("COMMIT")
    await exportarLogsGoogle(activo.id_camp)

    res.json({ status: true })

  } catch (err) {

    await conn.query("ROLLBACK")
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

  const conn = await db.connect()

  try {

    const { id, id_usuario } = req.body

    await conn.query("BEGIN")

const { rows: spamRows } = await conn.query(`
  SELECT *
  FROM admin.telefonos_spam
  WHERE id = $1
`, [id])

const spam = spamRows[0]

const { rows: nuevoRows } = await conn.query(`
  SELECT id,telefono
  FROM admin.gen_masks
  ORDER BY RANDOM()
  LIMIT 1
`)

const nuevo = nuevoRows[0]

    if (!spam || !nuevo) {

      await conn.query("ROLLBACK")
      return res.json({
        status:false
      })

    }

    await conn.query(`
      INSERT INTO admin.telefonos_activos
      (telefono, id_usuario, id_marcador, id_camp, fecha_consulta)
      VALUES ($1,$2,$3,$4,NOW())
    `, [nuevo.telefono, id_usuario, spam.id_marcador, spam.id_camp])

    await conn.query(`
      DELETE FROM admin.telefonos_spam
      WHERE id = $1
    `, [id])

    await conn.query(`
      DELETE FROM admin.gen_masks
      WHERE id = $1
    `, [nuevo.id])

    await conn.query("COMMIT")
    await exportarLogsGoogle(spam.id_camp)

    res.json({
      status:true,
      telefono_nuevo:nuevo.telefono
    })

  } catch (err) {

    await conn.query("ROLLBACK")
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

    const idCamp = Number(req.params.idCamp)

    const { rows } = await db.query(`

      SELECT 
        m.id_marcador,
        m.marcador,

        COUNT(DISTINCT a.id) AS activos,
        COUNT(DISTINCT s.id) AS spam

      FROM admin.marcadores m

      LEFT JOIN admin.telefonos_activos a
        ON a.id_marcador = m.id_marcador
        AND a.id_camp = m.id_camp

      LEFT JOIN admin.telefonos_spam s
        ON s.id_marcador = m.id_marcador
        AND s.id_camp = m.id_camp

      WHERE m.id_camp = $1

      GROUP BY 
        m.id_marcador,
        m.marcador

      HAVING 
  COUNT(DISTINCT a.id) > 0 
  OR COUNT(DISTINCT s.id) > 0

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
     TELÉFONOS ACTIVOS     (c.nombre era c.Campana, corroborar tabla)
  ========================= */
  SELECT
    '' AS id,
    c.id_camp AS idcamp,
    c.nombre AS campana, 
    m.id_marcador,
    m.marcador,
    t.telefono,

    u1.nombres || ' ' || u1.apellidos AS asignadopor,
    t.fecha_consulta AS fecha_asignado,

    'telefonos_activos' AS estado,
    NULL AS movidopor,
    NULL AS fecha_movimiento

  FROM admin.telefonos_activos t
  JOIN admin.campanas c ON c.id_camp = t.id_camp

  LEFT JOIN admin.marcadores m
    ON m.id_marcador = t.id_marcador
    AND m.id_camp = t.id_camp

  LEFT JOIN admin.ra_usuarios u1
    ON u1.id = t.id_usuario

  UNION ALL

  /* =========================
     TELÉFONOS SPAM
  ========================= */
  SELECT
    '' AS id,
    c.id_camp AS idcamp,
    c.nombre AS campana,
    m.id_marcador,
    m.marcador,
    s.telefono,

    u1.nombres || ' ' || u1.apellidos AS asignadopor,
    a.fecha_consulta AS fecha_asignado,

    'telefonos_spam' AS estado,
    u2.nombres || ' ' || u2.apellidos AS movidopor,
    s.fecha_consulta AS fecha_movimiento

  FROM admin.telefonos_spam s
  JOIN admin.campanas c ON c.id_camp = s.id_camp

  LEFT JOIN admin.telefonos_activos a
    ON a.telefono = s.telefono
    AND a.id_camp = s.id_camp

  LEFT JOIN admin.marcadores m
    ON m.id_marcador = a.id_marcador
    AND m.id_camp = a.id_camp

  LEFT JOIN admin.ra_usuarios u1
    ON u1.id = a.id_usuario

  LEFT JOIN admin.ra_usuarios u2
    ON u2.id = s.id_usuario

) x
WHERE x.idcamp = $1
`


// ============================
// ENDPOINT EXPORTAR LOGS
// ============================
router.post("/exportar-logs-google/:idCamp", async (req, res) => {
  try {
    const idCamp = Number(req.params.idCamp)

    if (!idCamp || Number(idCamp) <= 0) {
      console.error("EXPORT LOGS GOOGLE | Campaña inválida")
      return res.status(400).json({ ok: false })
    }

    const { rows: data } = await db.query(QUERY_LOGS, [idCamp])

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
    const { rows: data } = await conn.query(QUERY_LOGS, [idCamp])

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

  const conn = await db.connect();

  try {

    const { ids, id_usuario } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.json({ status: false, msg: "IDs vacíos" });
    }

    await conn.query("BEGIN");

    // Obtener todos los activos seleccionados
    const { rows: activos } = await conn.query(`
      SELECT *
      FROM admin.telefonos_activos
      WHERE id = ANY($1)
    `, [ids]);

    if (!activos.length) {
      await conn.query("ROLLBACK");
      return res.json({ status: false, msg: "Sin registros" });
    }

    // Insert masivo a SPAM
const valuesSpam = activos.map(a => [
  a.telefono,
  id_usuario,
  a.id_marcador,
  a.id_camp
])

const values = []

const placeholders = valuesSpam.map((v, i) => {
  const idx = i * 4
  values.push(...v)
  return `($${idx+1}, $${idx+2}, $${idx+3}, $${idx+4}, NOW())`
}).join(",")

await conn.query(`
  INSERT INTO admin.telefonos_spam
  (telefono, id_usuario, id_marcador, id_camp, fecha_consulta)
  VALUES ${placeholders}
`, values)

    // Insert masivo a NOTIFICACIONES
    await conn.query(`
      INSERT INTO admin.notificaciones_marcadores
      (telefono, id_usuario, id_marcador, id_camp, fecha_consulta)
      VALUES ${placeholders}
    `, values);

    // Eliminar activos
    await conn.query(`
      DELETE FROM admin.telefonos_activos
      WHERE id = ANY($1)
    `, [ids]);

    await conn.query("COMMIT");

    // Exportar logs UNA SOLA VEZ (optimizado)
    await exportarLogsGoogle(activos[0].id_camp);

    res.json({
      status: true,
      total: activos.length
    });

  } catch (err) {

    await conn.query("ROLLBACK");
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

  const conn = await db.connect();

  try {

    const { ids, id_usuario } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.json({ status: false, msg: "IDs vacíos" });
    }

    await conn.query("BEGIN");

    // Obtener spam seleccionados
// Obtener spam seleccionados
const { rows: spams } = await conn.query(`
  SELECT *
  FROM admin.telefonos_spam
  WHERE id = ANY($1)
`, [ids]);

if (!spams.length) {
  await conn.query("ROLLBACK");
  return res.json({ status: false, msg: "Sin registros" });
}

// Obtener máscaras necesarias
const { rows: mascaras } = await conn.query(`
  SELECT id, telefono
  FROM admin.gen_masks
  ORDER BY RANDOM()
  LIMIT $1
`, [spams.length]);

if (mascaras.length < spams.length) {
  await conn.query("ROLLBACK");
  return res.json({
    status: false,
    msg: "No hay suficientes máscaras"
  });
}

// Construcción correcta
const valuesActivos = spams.map((s, i) => [
  mascaras[i].telefono,
  id_usuario,
  s.id_marcador,
  s.id_camp
]);

const values = [];

const placeholders = valuesActivos.map((v, i) => {
  const idx = i * 4;
  values.push(...v);
  return `($${idx+1}, $${idx+2}, $${idx+3}, $${idx+4}, NOW())`;
}).join(",");

// Insert correcto
await conn.query(`
  INSERT INTO admin.telefonos_activos
  (telefono, id_usuario, id_marcador, id_camp, fecha_consulta)
  VALUES ${placeholders}
`, values);
    // Eliminar spam antiguos
    await conn.query(`
      DELETE FROM admin.telefonos_spam
      WHERE id = ANY($1)
    `, [ids]);

    // Eliminar máscaras usadas
    const idsMascaras = mascaras.map(m => m.id);

    await conn.query(`
      DELETE FROM admin.gen_masks
      WHERE id = ANY($1)
    `, [idsMascaras]);

    await conn.query("COMMIT");

    // Exportar logs UNA VEZ
    await exportarLogsGoogle(spams[0].id_camp);

    res.json({
      status: true,
      total: spams.length,
      nuevos: mascaras.map(m => m.telefono)
    });

  } catch (err) {

    await conn.query("ROLLBACK");
    console.error(err);

    res.status(500).json({
      error: "Error en bulk reemplazar spam"
    });

  } finally {

    conn.release();

  }

});
export default router