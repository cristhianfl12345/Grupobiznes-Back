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
import { buscarLeadsController } from "./modules/busqueda/busqueda.model.js"
import {getControlSupervisorController } from "./modules/controlSupervisor/controlS.controller.js"
import http from "http";
import { initNotiSocket } from "./modules/componentes/notiSocket.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swagger.js";


const app = express()
app.use(cors())
app.use(express.json())
app.use("/api", controlModulosRoutes)

/**
 * @swagger
 * /api/control-modulos:
 *   get:
 *     summary: Obtener control de módulos por campaña
 *     description: |
 *       Retorna la configuración de módulos por campaña.
 *       
 *       - Requiere autenticación (JWT)
 *       - Solo accesible por roles autorizados
 *       - Permite filtrar por idCamp y/o idModulo
 *     tags: [Control Modulos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idCamp
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID de campaña
 *         example: 30
 *       - in: query
 *         name: idModulo
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID del módulo
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de módulos por campaña
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_camp:
 *                         type: integer
 *                         example: 30
 *                       nombre:
 *                         type: string
 *                         example: 30_OncoSalud
 *                       id_modulo:
 *                         type: integer
 *                         example: 1
 *                       modulo_activo:
 *                         type: boolean
 *                         example: true
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */

/**
 * @swagger
 * /api/control-modulos:
 *   put:
 *     summary: Actualizar estado de módulo
 *     description: |
 *       Actualiza el estado (activo/inactivo) de un módulo en una campaña.
 *       
 *       Requiere autenticación y permisos.
 *     tags: [Control Modulos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idCamp, idModulo, modulo_activo]
 *             properties:
 *               idCamp:
 *                 type: integer
 *                 example: 30
 *               idModulo:
 *                 type: integer
 *                 example: 1
 *               modulo_activo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Estado actualizado
 *       400:
 *         description: Parámetros incompletos
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */

/**
 * @swagger
 * /api/control-modulos:
 *   post:
 *     summary: Crear relación módulo-campaña
 *     description: |
 *       Inserta un nuevo módulo para una campaña.
 *       
 *       - Evita duplicados (constraint único)
 *       - Requiere autenticación y permisos
 *     tags: [Control Modulos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idCamp, idModulo, modulo_activo]
 *             properties:
 *               idCamp:
 *                 type: integer
 *                 example: 30
 *               idModulo:
 *                 type: integer
 *                 example: 1
 *               modulo_activo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Registro creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         description: Parámetros incompletos o módulo duplicado
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */

/**
 * @swagger
 * /api/control-modulos:
 *   delete:
 *     summary: Eliminar módulo de una campaña
 *     description: |
 *       Elimina la relación entre un módulo y una campaña.
 *       
 *       Requiere autenticación y permisos.
 *     tags: [Control Modulos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idCamp, idModulo]
 *             properties:
 *               idCamp:
 *                 type: integer
 *                 example: 30
 *               idModulo:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Eliminado correctamente
 *       400:
 *         description: Parámetros incompletos
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */


app.use("/api/modulo-bases", moduloBasesRouter)
/**
 * @swagger
 * /api/modulo-bases:
 *   get:
 *     summary: Obtener métricas de bases por campaña
 *     tags: [Bases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: camp
 *         required: true
 *         schema:
 *           type: integer
 *         example: 200
 *     responses:
 *       200:
 *         description: Métricas obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fechacarga:
 *                         type: string
 *                         nullable: true
 *                       NombreBase:
 *                         type: string
 *                         nullable: true
 *                       TotalMarcaciones:
 *                         type: integer
 *                       TotalGestiones:
 *                         type: integer
 *                       ContactoDirecto:
 *                         type: integer
 *                       ContactoNoDirecto:
 *                         type: integer
 *                       NoContacto:
 *                         type: integer
 *                       Agendados:
 *                         type: integer
 *                       TMO_Promedio:
 *                         type: number
 *                       TMO_Final:
 *                         type: integer
 *                       TMO_HHMMSS:
 *                         type: string
 *                         format: date-time
 */
app.use("/api", marcadoresControl) //verificar con token , exposicion de marcadores y telefonos

/**
 * @swagger
 * /api/resumen-marcadores/{idCamp}:
 *   get:
 *     summary: Obtener resumen de marcadores por campaña
 *     description: |
 *       Retorna el resumen de marcadores con cantidad de registros activos y spam.
 *     tags: [Marcadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCamp
 *         required: true
 *         schema:
 *           type: integer
 *         example: 200
 *     responses:
 *       200:
 *         description: Resumen obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_marcador:
 *                     type: integer
 *                     example: 5
 *                   marcador:
 *                     type: string
 *                     example: PRUEBA NEXUM
 *                   activos:
 *                     type: string
 *                     example: "3"
 *                   spam:
 *                     type: string
 *                     example: "0"
 *       500:
 *         description: Error interno
 */

/**
 * @swagger
 * /api/marcadores/{idCamp}:
 *   get:
 *     summary: Obtener marcadores por campaña
 *     tags: [Marcadores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCamp
 *         required: true
 *         schema:
 *           type: integer
 *         example: 200
 *     responses:
 *       200:
 *         description: Lista de marcadores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_marcador:
 *                     type: integer
 *                   marcador:
 *                     type: string
 *                   id_camp:
 *                     type: integer
 *       500:
 *         description: Error interno
 */

/**
 * @swagger
 * /api/activos/{idCamp}:
 *   get:
 *     summary: Obtener teléfonos activos por campaña
 *     tags: [Teléfonos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCamp
 *         required: true
 *         schema:
 *           type: integer
 *         example: 200
 *     responses:
 *       200:
 *         description: Lista de teléfonos activos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   telefono:
 *                     type: integer
 *                   id_usuario:
 *                     type: integer
 *                   usuario_nombre:
 *                     type: string
 *                   id_marcador:
 *                     type: integer
 *                   marcador_nombre:
 *                     type: string
 *                   fecha_consulta:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Error interno
 */

/**
 * @swagger
 * /api/spam/{idCamp}:
 *   get:
 *     summary: Obtener teléfonos en spam por campaña
 *     tags: [Teléfonos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCamp
 *         required: true
 *         schema:
 *           type: integer
 *         example: 200
 *     responses:
 *       200:
 *         description: Lista de teléfonos en spam
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   telefono:
 *                     type: integer
 *                   id_usuario:
 *                     type: integer
 *                   usuario_nombre:
 *                     type: string
 *                   id_marcador:
 *                     type: integer
 *                   marcador_nombre:
 *                     type: string
 *                   fecha_consulta:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Error interno
 */
/**
 * @swagger
 * /api/generar-mascaras:
 *   post:
 *     summary: Generar máscaras de teléfonos
 *     description: |
 *       Genera números enmascarados asociados a un marcador y campaña.
 *     tags: [Marcadores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cantidad:
 *                 type: integer
 *                 example: 1
 *               id_marcador:
 *                 type: integer
 *                 example: 5
 *               id_camp:
 *                 type: integer
 *                 example: 200
 *     responses:
 *       200:
 *         description: Máscaras generadas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_gen_mask:
 *                         type: integer
 *                         example: 1
 *                       telefono:
 *                         type: integer
 *                         example: 987654321
 *                       id_marcador:
 *                         type: string
 *                         example: "5"
 *                       id_camp:
 *                         type: string
 *                         example: "200"
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno
 */
/**
 * @swagger
 * /api/reemplazar-spam:
 *   put:
 *     summary: Reemplazar registros en spam
 *     description: |
 *       Reemplaza registros existentes en la tabla de spam con nuevos datos.
 *     tags: [Spam]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 123
 *               id_usuario:
 *                 type: integer
 *                 example: 8
 *     responses:
 *       200:
 *         description: Registro reemplazado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registro reemplazado correctamente
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno
 */
/**
 * @swagger
 * /api/mover-spam:
 *   post:
 *     summary: Mover registro a spam
 *     description: |
 *       Mueve un registro desde activos hacia la tabla de spam.
 *     tags: [Spam]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 123
 *               id_usuario:
 *                 type: integer
 *                 example: 8
 *     responses:
 *       200:
 *         description: Registro movido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registro movido a spam correctamente
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno
 */

app.use("/api/leads", verifyToken, leadsRoutes)

/**
 * @swagger
 * /api/leads/vistas/{idCamp}:
 *   get:
 *     summary: Obtener configuración de vistas de leads
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCamp
 *         required: true
 *         schema:
 *           type: integer
 *         example: 200
 *     responses:
 *       200:
 *         description: Lista de vistas disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   query_vista:
 *                     type: string
 *                     example: idkey
 *                   Vista:
 *                     type: string
 *                     example: idkey
 *                   activo:
 *                     type: boolean
 *                     example: true
 */
/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: Obtener leads por campaña y fecha
 *     description: Retorna leads filtrados con paginación implícita
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idCamp
 *         required: true
 *         schema:
 *           type: integer
 *         example: 200
 *       - in: query
 *         name: fechaIngreso
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-05-05
 *     responses:
 *       200:
 *         description: Leads obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 23
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     additionalProperties: true
 */

app.use("/api/auth", authController)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autenticación de usuarios con usuario y contraseña
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login correcto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login correcto
 *                 token:
 *                   type: string
 *                   example: JWT_TOKEN
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombres:
 *                       type: string
 *                     apellidos:
 *                       type: string
 *                     usuario:
 *                       type: string
 *                     estado:
 *                       type: string
 *                     id_tipo_usuario:
 *                       type: array
 *                       items:
 *                         type: integer
 *                     id_grupo:
 *                       type: array
 *                       items:
 *                         type: integer
 *                     id_camp:
 *                       type: integer
 *                     nro_doc:
 *                       type: string
 *                     reportes:
 *                       type: array
 *                       items:
 *                         type: integer
 *                     tipo_usuario:
 *                       type: string
 */


/**
 * @swagger
 * /api/auth/mis-campanas/{idUsuario}:
 *   get:
 *     summary: Obtener campañas asignadas a un usuario
 *     description: |
 *       Retorna las campañas disponibles según el tipo de usuario.
 *       
 *       - Usuarios con roles (1, 2, 6) → acceso a todas las campañas activas
 *       - Otros usuarios → solo campañas asignadas en ra_usuario_camp
 *     tags: [Campañas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *         example: 8
 *     responses:
 *       200:
 *         description: Campañas obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 8
 *                     tipo_usuario:
 *                       type: string
 *                       example: Sistemas
 *                 campanas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       IdCamp:
 *                         type: string
 *                         example: "30"
 *                       Campana:
 *                         type: string
 *                         example: "30_OncoSalud"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error interno
 */
app.get("/api/vistas", getVistas)
app.post("/api/vistasss", crearVista); //
app.get("/api/campanas-select", getCampanasSelect); // verificar con token sino campañas expuestas

/**
 * @swagger
 * /api/campanas:
 *   get:
 *     summary: Obtener listado de campañas
 *     description: |
 *       Retorna todas las campañas disponibles para selección (select).
 *       
 *       No requiere autenticación.
 *     tags: [Campañas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de campañas obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_camp:
 *                         type: string
 *                         example: "30"
 *                       nombre:
 *                         type: string
 *                         example: "30_OncoSalud"
 *       500:
 *         description: Error obteniendo campañas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error obteniendo campañas
 */

app.get("/api/vistas-filtradas", getVistasFiltradas); // verificar con token y usar el token de sesion en el front, sino frames expuestos
/**
 * @swagger
 * /api/vistas-filtradas:
 *   get:
 *     summary: Obtener vistas filtradas
 *     description: Permite filtrar por nivel y campaña
 *     tags: [Vistas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         required: false
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: idcamp
 *         required: false
 *         schema:
 *           type: integer
 *         example: 30
 *     responses:
 *       200:
 *         description: Lista de vistas filtradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_vista:
 *                         type: integer
 *                       level:
 *                         type: integer
 *                       id_camp:
 *                         type: integer
 *                       name_vista:
 *                         type: string
 *                       url_vista:
 *                         type: string
 *                       contenedor:
 *                         type: string
 *                         nullable: true
 *                       contenedor2:
 *                         type: string
 *                         nullable: true
 *                       activo:
 *                         type: boolean
 *       500:
 *         description: Error interno
 */
app.get("/api/vistas-filtradas/:id", getVistaById); // verificar con token y usar el token de sesion en el front, sino frames expuestos
/**
 * @swagger
 * /api/vistas-filtradas/{id}:
 *   get:
 *     summary: Obtener vista por ID
 *     tags: [Vistas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 148
 *     responses:
 *       200:
 *         description: Vista obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_vista:
 *                       type: integer
 *                     level:
 *                       type: integer
 *                     id_camp:
 *                       type: integer
 *                     name_vista:
 *                       type: string
 *                     url_vista:
 *                       type: string
 *                     contenedor:
 *                       type: string
 *                       nullable: true
 *                     contenedor2:
 *                       type: string
 *                       nullable: true
 *                     activo:
 *                       type: boolean
 *       500:
 *         description: Error interno
 */
app.put("/api/vistas-filtradas/:id", updateVista); // verificar con token y usar el token de sesion en el front, sino frames expuestos
/**
 * @swagger
 * /api/vistas-filtradas/{id}:
 *   put:
 *     summary: Actualizar una vista
 *     tags: [Vistas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 148
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               level:
 *                 type: integer
 *               id_camp:
 *                 type: integer
 *               name_vista:
 *                 type: string
 *               url_vista:
 *                 type: string
 *               contenedor:
 *                 type: string
 *                 nullable: true
 *               contenedor2:
 *                 type: string
 *                 nullable: true
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Vista actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vista actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno
 */
app.get("/api/usuarios-get", obtenerUsuarios) //verificar con token y usar el token de sesion en el front

/**
 * @swagger
 * /api/usuarios-get:
 *   get:
 *     summary: Obtener listado de usuarios
 *     description: |
 *       Retorna todos los usuarios con su nivel, grupo y campañas asignadas.
 *     tags: [Usuarios]
  *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       usuario:
 *                         type: string
 *                       nombres:
 *                         type: string
 *                       apellidos:
 *                         type: string
 *                       nivel:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           descripcion:
 *                             type: string
 *                       grupo:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           descripcion:
 *                             type: string
 *                       campanas:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             IdCamp:
 *                               type: integer
 *                             Campana:
 *                               type: string
 *                               nullable: true
 *                       reportes:
 *                         type: integer
 *                         nullable: true
 *                       estado:
 *                         type: string
 *                         example: "1"
 *       500:
 *         description: Error interno
 */

//  kpis
app.get("/api/kpis", verifyToken, getKpis)

/**
 * @swagger
 * /api/kpis:
 *   get:
 *     summary: Obtener KPIs del dashboard por campañas
 *     description: |
 *       Retorna la configuración de vistas (KPIs) agrupadas por nivel y campaña,
 *       según las campañas accesibles del usuario autenticado.
 *       
 *       - Requiere JWT válido
 *       - Las campañas se determinan según el rol del usuario
 *     tags: [KPIs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPIs obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Agrupación dinámica por nivel (ej. operativos, gerencia, etc.)
 *                   properties:
 *                     operativos:
 *                       type: object
 *                       description: KPIs del nivel operativo
 *                       additionalProperties:
 *                         type: object
 *                         description: Campaña dinámica (key = id_camp)
 *                         properties:
 *                           nombreCampana:
 *                             type: string
 *                             example: 30_OncoSalud
 *                           vistas:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   example: "30-Cobranza"
 *                                 nombre:
 *                                   type: string
 *                                   example: "Cobranza"
 *                                 url:
 *                                   type: string
 *                                   example: "https://app.powerbi.com/..."
 *                                 contenedor:
 *                                   type: string
 *                                   nullable: true
 *                                   example: null
 *                                 contenedor2:
 *                                   type: string
 *                                   nullable: true
 *                                   example: null
 *       401:
 *         description: Token requerido o inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Token requerido
 *       500:
 *         description: Error al obtener KPIs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error al obtener KPIs
 */

app.put("/api/usuarios/:id", updateUsuario);
/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     description: |
 *       Actualiza la información de un usuario por su ID.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 19
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario:
 *                 type: string
 *               nombres:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               id_tipo_usuario:
 *                 type: integer
 *               id_grupo:
 *                 type: integer
 *               campanas:
 *                 type: array
 *                 items:
 *                   type: integer
 *               reportes:
 *                 type: integer
 *                 nullable: true
 *               estado:
 *                 type: string
 *                 example: "1"
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Usuario actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno
 */
app.delete("/api/usuarios/:id", deleteUsuario);
/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     description: |
 *       Elimina un usuario por su ID.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 19
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Usuario eliminado correctamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno
 */



//  popup
app.get("/api/notificaciones-sistemas/obtener", verifyToken, obtenerNotificaciones);
/**
 * @swagger
 * /api/notificaciones-sistemas/obtener:
 *   get:
 *     summary: Obtener notificaciones agrupadas (Sistemas)
 *     description: |
 *       Retorna notificaciones agrupadas de usuarios que han superado el umbral de envíos a SPAM.
 *       
 *       Requiere autenticación y permisos especiales.
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificaciones obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_usuario:
 *                         type: integer
 *                         example: 8
 *                       nombres:
 *                         type: string
 *                         example: dev
 *                       apellidos:
 *                         type: string
 *                         example: test
 *                       total:
 *                         type: string
 *                         example: "8"
 *                       id_camp:
 *                         type: integer
 *                         example: 200
 *                       mensaje:
 *                         type: string
 *                         example: dev test ha enviado 8 números a SPAM hoy
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 msg:
 *                   type: string
 *                   example: No autenticado
 *       403:
 *         description: Sin permisos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 msg:
 *                   type: string
 *                   example: Sin permisos
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 */
// GET /notificaciones-sistemas/detalle/:idUsuario
app.get("/api/notificaciones-sistemas/detalle/:idUsuario", verifyToken, obtenerDetalleNotificacion);
/**
 * @swagger
 * /api/notificaciones-sistemas/detalle/{idUsuario}:
 *   get:
 *     summary: Obtener detalle de notificaciones por usuario
 *     description: |
 *       Retorna el detalle de números enviados a SPAM por un usuario específico.
 *       
 *       Requiere autenticación y permisos.
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a consultar
 *         example: 8
 *     responses:
 *       200:
 *         description: Detalle obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Estructura dinámica según detalle de SPAM
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *       403:
 *         description: Sin permisos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 */
app.get("/api/notificaciones-supervisor/obtener", verifyToken, obtenerNotificacionesSupervisor);
app.post("/api/notificaciones-supervisor/marcar-leida", verifyToken, marcarLeidaSupervisor);
app.post("/api/usuarios",  createUsuario);
//busqueda
app.get("/api/busqueda", buscarLeadsController);

//control supervisor

app.get("/api/control-supervisor", getControlSupervisorController);

/**
 * @swagger
 * /api/busqueda:
 *   get:
 *     summary: Buscar leads
 *     description: |
 *       Permite buscar leads por distintos parámetros.
 *       Si no se envían parámetros, retorna resultados generales.
 *     tags: [Busqueda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: camp
 *         schema:
 *           type: integer
 *         example: 200
 *       - in: query
 *         name: idKey
 *         schema:
 *           type: string
 *         example: 27677R0
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idkey:
 *                         type: string
 *                       numero_telefono:
 *                         type: string
 *                       campania:
 *                         type: string
 *                       fecha_creacion:
 *                         type: string
 */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
const PORT = 4000

const server = http.createServer(app);

/**
 * @swagger
 * /socket.io:
 *   get:
 *     summary: Conexión WebSocket para notificaciones en tiempo real
 *     description: |
 *       Endpoint de conexión WebSocket usando Socket.io.
 *       
 *       URL:
 *       ws://localhost:4000/socket.io/?EIO=4&transport=websocket
 *       
 *       Evento emitido:
 *       - nueva_notificacion
 *       
 *       Ejemplo de payload:
 *       {
 *         "camp": "90",
 *         "hora": "10:32:12",
 *         "mensaje": "Se ha enviado un lead a la campaña 90 a las 10:32:12"
 *       }
 *     tags: [WebSocket]
 */

// inicializar sockets
initNotiSocket(server);

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});