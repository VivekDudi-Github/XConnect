import swaggerJSDoc from "swagger-jsdoc";


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation for my project",
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      responses: {
        BadRequest: {
          description: "Invalid request input",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success : {
                    type: "boolean",
                  } ,
                  message: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        InternalServerError: {
          description: "Internal server error",
        },
        NotFound : {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success : {
                    type: "boolean",
                  } ,
                  message: {
                    type: "string",
                  },
                },
              },
            },
          },
        } ,
        UnauthorizedError: {
          description: "Authentication required"
        },
        ForbiddenError: {
          description: "Access denied"
        }
      },
      schemas : {
        User : {
          type: "object",
          properties: {
            _id: {
              type: "string"
            },
            username: {
              type: "string"
            },
            email: {
              type: "string"
            },
            fullname: {
              type: "string"
            }, 
            bio: {
              type: "string"
            },
            location: {
              type: "string"
            } ,
            hobby: {
              type: "string"
            },
            createdAt: {
              type: "string"
            },
            updatedAt: {
              type: "string"
            },
            __v: {
              type: "number"
            }
          }
        }
      }
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
      },
    ],
  },

  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerSpec };