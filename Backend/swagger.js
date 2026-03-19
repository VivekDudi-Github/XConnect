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
        } , 
        Notification : {
          type: "object",
          properties: {
            sender : {
              type: "object",
              properties: {
                _id: {
                  type: "string"
                },
                avatar : {
                  type: "object",
                  properties :{
                    url : {
                      type: "string"
                    }
                  }
                },
                fullname: {
                  type: "string"
                },
                username: {
                  type: "string"
                },
              },
            } ,
            reciever : {
              type : 'string'
            } ,
            _id: {
              type: "string"
            },
            userId: {
              type: "string"
            },
            isRead: {
              type: "boolean"
            },
            createdAt: {
              type: "string"
            },
            updatedAt: {
              type: "string"
            },
            type : {
              type : 'string' ,
              enum : ['like', 'comment', 'follow', 'reply' , 'repost' ,'mention' , 'modInvite' , 'modLeft']
            },
            oneOf :  [
              {
                required: ["post"],
                properties: {
                  post: {
                    type: "string"
                  }
                }
              },
              {
                required: ["comment_Id"],
                properties: {
                  comment_Id: {
                    type: "string"
                  }
                }
              },
              {
                required: ["community"],
                properties: {
                  community: {
                    type: "object",
                    properties: {
                      _id: { type: "string" },
                      name: { type: "string" }
                    }
                  }
                }
              }
            ],
            __v: {
              type: "number"
            }
          }
        } ,
        Post : {
          content: {
            type: "string"
          } ,
          media: {
            type: "array",
            items: {
              type: "object" ,
              properties: {
                url: {
                  type: "string"
                } ,
                public_id: {
                  type: "string"
                } , 
                type: {
                  type: "string"
                }
              }
            }
          } ,
          hashtags: {
            type: "array",
            items: {
              type: "string"
            }
          } ,
          mentions: {
            type: "array",
            items: {
              type : "string"
            }
          },
          isDeleted: {
            type: "boolean"
          },
          author : {
            type: "object",
            properties: {
              _id: { type : "string" },
              username: { type : "string" },
              fullname: { type : "string" },
              avatar : {
                type: "object",
                properties: {
                  url: { type : "string" } ,
                  public_id : { type : "string" }
                }
              }
            }
          } ,
          likeStatus: {
            type: "boolean",
          } ,
          likeCount : {
            type: "number"
          } ,
          commentCount : {
            type: "number"
          } ,
          commentCount : {
            type: "number"
          } ,
          isBookmarked : {
            boolean : "boolean"
          },
          views : {
            type : "number"
          } ,
          category : {
            type : "string"
          } ,
          title : {
            type : "string"
          } ,
          engagements : {
            type : "number"
          } ,
          isEdited : {
            type : "boolean"
          } ,
          isPinned : {
            type : "boolean"
          } ,
          isAnonymous : {
            type : "boolean"
          } ,
          community : {
            type : "string",
          } ,
          type : {
            type : "string" ,
            enum : ['post' , 'community']
          } ,
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