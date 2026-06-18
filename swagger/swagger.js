import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Panel Grupo Biznes",
      version: "1.0.0",
      description: "Documentación de endpoints del Panel-GrupoBiznes (niveles, campañas, leads, modulos, usuarios, etc)",
    },
    servers: [
      {
        url: "http://localhost:4000",
        url: "https://panel.bizapp.pe",
      },
    ],
    components: {
  schemas: {
    "admin.ra_usuarios": {
      type: "object",
      properties: {
        id: { type: "integer" },
        
        nombres: { type: "varchar", length: 250 },
        apellidos: { type: "varchar", length: 250 },
        usuario: { type: "varchar", length: 250 },
        password: { type: "varchar", length: 500 },
        estado: { type: "char", length: 1 },
        id_tipo_usuario: { type: "integer" },
        id_grupo: { type: "integer" },
        fec_reg: { type: "timestamp" },
        fec_mod: { type: "timestamp" },
        id_camp: { type: "integer" },
        nro_doc: { type: "varchar", length: 8 },
        reportes: { type: "integer" }
      }
    },

    "admin.campanas": {
      type: "object",
      properties: {
        id_camp: { type: "integer" },
        nombre: { type: "text" },
        activa: { type: "boolean" },
        id_vista: { type: "integer" }
      }
    },

    "admin.marcadores": {
      type: "object",
      properties: {
        id: { type: "integer" },
        id_marcador: { type: "integer" },
        marcador: { type: "varchar", length: 100 },
        id_camp: { type: "integer" },
        campana: { type: "varchar", length: 250 },
        activo: { type: "boolean" }
      }
    },
     "admin.configuracion_vistas": {
      type: "object",
      properties: {
        id_vista: { type: "integer" },
        id_icon: { type: "integer" },
        level: { type: "integer" },
        id_camp: { type: "integer" },
        name_vista: { type: "varchar", length: 255 },
        url_vista: { type: "varchar", length: 255 },
        contenedor: { type: "varchar", length: 255 },
        contenedor2: { type: "varchar", length: 50 },
        activo: { type: "boolean" },
        fecha_reg: { type: "timestamp" }
      }
    },
    "admin.control_de_modulos": {
      type: "object",
      properties: {
        id_orden: { type: "integer" },
        id_camp: { type: "integer" },
        id_modulo: { type: "integer" },
        modulo_activo: { type: "boolean" }
      }
    },
    "admin.gen_masks": {
      type: "object",
      properties: {
        id: { type: "integer" },
        telefono: { type: "integer" },
        id_usuario: { type: "integer" },
        id_marcador: { type: "integer" },
        fecha_consulta: { type: "boolean" },
        id_camp: { type: "integer" }
      }
    },
     "admin.telefonos_activos": {
      type: "object",
      properties: {
        id: { type: "integer" },
        telefono: { type: "integer" },
        id_usuario: { type: "integer" },
        id_marcador: { type: "integer" },
        fecha_consulta: { type: "boolean" },
        id_camp: { type: "integer" }
      }
    },
     "admin.telefonos_spam": {
      type: "object",
      properties: {
        id: { type: "integer" },
        telefono: { type: "integer" },
        id_usuario: { type: "integer" },
        id_marcador: { type: "integer" },
        fecha_consulta: { type: "boolean" },
        id_camp: { type: "integer" }
      }
    },
    "admin.notificaciones_marcadores": {
      type: "object",
      properties: {
        id: { type: "integer" },
        telefono: { type: "integer" },
        id_usuario: { type: "integer" },
        id_marcador: { type: "integer" },
        fecha_consulta: { type: "boolean" },
        id_camp: { type: "integer" }
      }
    },
    "admin.notificaciones_marcadores": {
      type: "object",
      properties: {
        id: { type: "integer" },
        descripcion: { type: "varchar", length: 500 },
        fec_reg: { type: "timestamp" },
        estado: { type: "char", length: 1 }
      }
    },
    "admin.ra_tipo_usuario": {
      type: "object",
      properties: {
        id: { type: "integer" },
        descripcion: { type: "varchar", length: 500 },
        fec_reg: { type: "timestamp" },
        estado: { type: "char", length: 1 }
      }
    },
    "admin.ra_tipo_usuario": {
      type: "object",
      properties: {
        id: { type: "integer" },
        id_usuario: { type: "integer" },
        id_camp: { type: "integer" }
      }
    },
    "admin.vistas": {
      type: "object",
      properties: {
        Id_vista: { type: "integer" },
        query_vista: { type: "varchar", length: 20 },
        vista: { type: "varchar", length: 20 },
        activo: { type: "Boolean" },
        orden: { type: "integer" },
      }
    },
     "agent.usuarios": {
      type: "object",
      properties: {
        id_usuario: { type: "integer", format: "int64" },

        doc_num: { type: "varchar", length: 50 },

        nombre: { type: "varchar", length: 250 },

        usuario: { type: "string" },

        fecha_registro: {
          type: "timestamp with time zone"
        },

        fecha_modifica: {
          type: "timestamp with time zone"
        },

        activo: { type: "boolean" }
      }
    },
      "agent.usuarios_carterizacion": {
      type: "object",
      properties: {
        id_reg: {
          type: "integer",
          format: "int64"
        },

        id_usuario: {
          type: "integer",
          format: "int64"
        },

        id_campana: {
          type: "integer",
          format: "int64"
        },

        tipo_campana: {
          type: "integer",
          format: "int16"
        },

        modulo_activo: {
          type: "boolean"
        },

        fecha_registro: {
          type: "timestamp without time zone"
        },

        fecha_modifica: {
          type: "timestamp without time zone"
        }
      }
    },
    "agent.usuarios_carterizacion_horario": {
      type: "object",
      properties: {
        id_reg: {
          type: "integer",
          format: "int64"
        },

        id_carteriza: {
          type: "integer",
          format: "int64"
        },

        fuente: {
          type: "text"
        },

        activo: {
          type: "boolean"
        },

        hora_ini: {
          type: "time without time zone"
        },

        hora_fin: {
          type: "time without time zone"
        },

        hora_ini_s: {
          type: "time without time zone"
        },

        hora_fin_s: {
          type: "time without time zone"
        }
      }
    },
    "agent.usuarios_credenciales": {
      type: "object",
      properties: {
        id_usuario: {
          type: "integer",
          format: "int64"
        },

        tipo: {
          type: "varchar",
          length: 100
        },

        password_hash: {
          type: "varchar",
          length: 500
        },

        password_updated_at: {
          type: "timestamp with time zone"
        }
      }
    },
     "agent.usuarios_horario": {
      type: "object",
      properties: {
        id_reg: {
          type: "integer",
          format: "int64"
        },

        id_usuario: {
          type: "integer",
          format: "int64"
        },

        hora_in: {
          type: "time without time zone"
        },

        hora_out: {
          type: "time without time zone"
        },

        fecha_registro: {
          type: "timestamp without time zone"
        },

        fecha_modifica: {
          type: "timestamp without time zone"
        },

        ultimo_ping: {
          type: "timestamp without time zone"
        },

        activo: {
          type: "boolean"
        }
      }
    },
     "agent.usuarios_plataformas": {
      type: "object",
      properties: {
        id_reg: {
          type: "integer",
          format: "int64"
        },

        id_usuario: {
          type: "integer",
          format: "int64"
        },

        id_plataforma: {
          type: "integer",
          format: "int16"
        },

        fecha_registro: {
          type: "timestamp without time zone"
        },

        fecha_modifica: {
          type: "timestamp without time zone"
        },

        id_campana: {
          type: "integer",
          format: "int64"
        } } }
  }
}

  },
  apis: [
    "./index.js",
    "./modules/**/*.js",
    "./controllers/*.js",
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;