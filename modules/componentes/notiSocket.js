//back/modules/componentes/notiSocket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import { pg_admindb } from "../../config/pg_admin.js";

const JWT_SECRET = "$2a$12$5H/LNYidqFAEL5R5L8I0d.H0AOlf3lLBKLN.cqpFOXsuIdkgQUmOq";

// CONFIG
const NOTIF_API = "http://192.168.9.115:4444/api/notif";
const INTERVAL = 3000; 

// cache para evitar duplicados
const lastNotified = {}; // { camp: ultimaHora }

export const initNotiSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  // ============================
  // AUTH MIDDLEWARE SOCKET
  // ============================
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Token requerido"));
      }

      const decoded = jwt.verify(token, JWT_SECRET);

      // validar tipo_usuario permitido
      if (![3, 4, 5].includes(decoded.id_tipo_usuario)) {
        return next(new Error("No autorizado para notificaciones"));
      }

      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Token inválido"));
    }
  });

  // ============================
  // CONEXIÓN
  // ============================
  io.on("connection", async (socket) => {
    try {
      const { rows } = await pg_admindb.query(
        `
        SELECT c.id_camp
        FROM admin.ra_usuario_camp uc
        INNER JOIN admin.campanas c 
          ON c.id_camp = uc.id_camp
        WHERE uc.id_usuario = $1
        `,
        [socket.user.id]
      );

      const campanas = rows.map(r => r.id_camp);

      campanas.forEach(camp => {
        socket.join(`camp-${camp}`);
      });

      const interval = setInterval(async () => {
        try {
          // 👉 fecha de hoy (mismo formato que tu API)
          const hoy = new Intl.DateTimeFormat("es-PE", {
            timeZone: "America/Lima",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
          }).format(new Date());

          for (const camp of campanas) {

            const res = await fetch(`${NOTIF_API}/${camp}`);
            const data = await res.json();

            if (!Array.isArray(data) || data.length === 0) continue;

            // 👉 FILTRO MINIMO
            const hoyData = data.filter(f => f.startsWith(hoy));

            if (hoyData.length === 0) continue;

            const ultimaHora = hoyData[hoyData.length - 1];

            // evitar duplicados
            if (lastNotified[camp] === ultimaHora) continue;

            lastNotified[camp] = ultimaHora;

            const hora = ultimaHora.split(", ")[1];

            io.to(`camp-${camp}`).emit("nueva_notificacion", {
              camp,
              hora,
              mensaje: `Se ha enviado un lead a la campaña ${camp} a las ${hora}`
            });

          }
        } catch (err) {
          console.error("Error polling:", err.message);
        }
      }, INTERVAL);

      socket.on("disconnect", () => {
        clearInterval(interval);
      });

    } catch (err) {
      console.error("Error en conexión socket:", err);
      socket.disconnect();
    }
  });

  return io;
};