//back/modules/DescargaRegistro/registro.service.js

import express from "express";
import sql from "mssql";
import ExcelJS from "exceljs";
import fs from "fs";
import os from "os";
import path from "path";

const router = express.Router();

const sqlConfig = {
  user: "pth_vida",
  password: "vid2022[biz]",
  server: "192.168.7.30",
  database: "DB_SEGURO_VIDA",
  options: {
    trustServerCertificate: true,
    encrypt: false
  }
};

router.get(
  "/descarga-registro",
  async (req, res) => {

    let pool;

    try {

      pool = await sql.connect(
        sqlConfig
      );

const now = new Date();

const timestamp =
  `${now.getFullYear()}`
  + `${String(now.getMonth() + 1).padStart(2, "0")}`
  + `${String(now.getDate()).padStart(2, "0")}`
  + "-"
  + `${String(now.getHours()).padStart(2, "0")}`
  + `${String(now.getMinutes()).padStart(2, "0")}`
  + `${String(now.getSeconds()).padStart(2, "0")}`;
      const tempFile =
        path.join(
          os.tmpdir(),
          `Rg_SeguroVida_${timestamp}.xlsx`
        );

      const workbook =
        new ExcelJS.stream.xlsx.WorkbookWriter({
          filename: tempFile,
          useStyles: false,
          useSharedStrings: false
        });

      const sheet1 =
        workbook.addWorksheet(
          "ConsolidadoTotal"
        );

      let headersWritten = false;

      let totalDniUnicos = 0;

      const dniSet =
        new Set();

      await new Promise(
        (resolve, reject) => {

          const request =
            new sql.Request(
              pool
            );

          request.stream = true;

          request.on(
            "row",
            row => {

              if (!headersWritten) {

                sheet1.addRow(
                  Object.keys(row)
                ).commit();

                headersWritten = true;

              }

              if (
                row.DniCliente !== null &&
                row.DniCliente !== undefined
              ) {

                dniSet.add(
                  row.DniCliente
                );

              }

              sheet1.addRow(
                Object.values(row)
              ).commit();

            }
          );

          request.on(
            "error",
            reject
          );

          request.on(
            "done",
            resolve
          );

          request.query(`
            SELECT *
            FROM dbo.RG_VIDA
          `);

        }
      );

      totalDniUnicos =
        dniSet.size;

      sheet1.commit();

      /*
       * SEGUNDA HOJA
       */

      const sheet2 =
        workbook.addWorksheet(
          "ArbolTipificacion"
        );

      const result2 =
        await pool
          .request()
          .query(`
            SELECT *
            FROM DB_MASTER_BIZNES.dbo.tbl_bzArbolTipificacion
            WHERE IdCamp = '90'
          `);

      const data2 =
        result2.recordset;

      if (data2.length) {

        sheet2.addRow(
          Object.keys(
            data2[0]
          )
        ).commit();

        for (
          const row
          of data2
        ) {

          sheet2.addRow(
            Object.values(
              row
            )
          ).commit();

        }

      }

      sheet2.commit();

      await workbook.commit();

      const fileName =
        `Rg_SeguroVida_${totalDniUnicos}_${timestamp}.xlsx`;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      res.setHeader(
  "Access-Control-Expose-Headers",
  "Content-Disposition"
);

      const stream =
        fs.createReadStream(
          tempFile
        );

      stream.pipe(
        res
      );

      stream.on(
        "close",
        () => {

          fs.unlink(
            tempFile,
            () => {}
          );

        }
      );

    } catch (error) {

      console.error(
        "Error generando Excel:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "Error generando archivo",
        error:
          error.message
      });

    } finally {

      if (pool) {

        try {

          await pool.close();

        } catch {}

      }

    }

  }
);

export default router;