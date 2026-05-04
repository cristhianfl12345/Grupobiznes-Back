import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Panel Grupo Biznes",
      version: "1.0.0",
      description: "Documentación de endpoints del sistema (roles, campañas, leads, etc)",
    },
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    "./index.js",
    "./modules/**/*.js",
    "./controllers/*.js",
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;