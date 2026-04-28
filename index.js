import express from "express"
import cors from "cors"
import marcadoresControl from "./controllers/marcadoresControl.js"
import authController from "./controllers/auth.js"
import { obtenerUsuarios, updateUsuario, deleteUsuario, createUsuario  } from "./modules/componentes/complementoUsers.js"
import { getKpis, getVistas, crearVista, getCampanasSelect, getVistasFiltradas, getVistaById, updateVista} from "./modules/componentes/complementoVista.js"
import { verifyToken } from "./controllers/auth.js"
import { 
  obtenerNotificaciones, 
  obtenerDetalleNotificacion, 
  obtenerNotificacionesSupervisor,
  marcarLeidaSupervisor
} from "./modules/componentes/complementoPopUp.js";
import leadsRoutes from './modules/leads/leads.routes.js'
import controlModulosRoutes from "./modules/controlModulos/controlM.controller.js";
import moduloBasesRouter from "./modules/mBases/moduloBases.js";
import http from "http";
import { initNotiSocket } from "./modules/componentes/notiSocket.js";

const app = express()
app.use(cors())
app.use(express.json())
app.use("/api", controlModulosRoutes)
app.use("/api/modulo-bases", moduloBasesRouter)

app.use("/api", marcadoresControl)
app.use("/api/leads", verifyToken, leadsRoutes)
app.use("/api/auth", authController)
app.get("/api/vistas", getVistas)
app.post("/api/vistasss", crearVista);
app.get("/api/campanas-select", getCampanasSelect);
app.get("/api/vistas-filtradas", getVistasFiltradas);
app.get("/api/vistas-filtradas/:id", getVistaById);
app.put("/api/vistas-filtradas/:id", updateVista);
app.get("/api/usuarios-get", obtenerUsuarios)
//  kpis
app.get("/api/kpis", verifyToken, getKpis)
app.put("/api/usuarios/:id", updateUsuario);
app.delete("/api/usuarios/:id", deleteUsuario);
//  popup
app.get("/api/notificaciones-sistemas/obtener", verifyToken, obtenerNotificaciones);
app.get("/api/notificaciones-sistemas/detalle/:idUsuario", verifyToken, obtenerDetalleNotificacion);
app.get("/api/notificaciones-supervisor/obtener", verifyToken, obtenerNotificacionesSupervisor);
app.post("/api/notificaciones-supervisor/marcar-leida", verifyToken, marcarLeidaSupervisor);
app.post("/api/usuarios",  createUsuario);
const PORT = 4000

const server = http.createServer(app);

// inicializar sockets
initNotiSocket(server);

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});