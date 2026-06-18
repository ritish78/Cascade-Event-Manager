import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  swaggerDefinition: {
    openapi: "3.0.4",
    info: {
      title: "Cascade Event Manager API",
      version: "0.1.0",
      description: "This is the API documentation for the API exposed by the server for managing events!",
    },
    tags: [
      {
        name: "Auth",
        description: "Register, Login, Logout or Refresh Access Token",
      },
      {
        name: "Events",
        description: "Create, View, Update or Delete Events. You can also invite other members.",
      },
      {
        name: "Categories",
        description: "Get categories for the event.",
      },
      {
        name: "Tags",
        description: "Get tags for the event.",
      },
    ],
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Express js development server that is contanerized using docker.",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "BadRequestError" },
            message: { type: "string", example: "Invalid request body!" },
          },
        },
        ZodError: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "ZodError",
            },
            message: {
              type: "string",
              example: "Could not process the invalid body!",
            },
            fields: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string",
                    description: "The name of the field that failed validation",
                    example: "email",
                  },
                  message: {
                    type: "string",
                    description: "Validation error message for this field",
                    example: "Invalid input: expected string, received undefined",
                  },
                  expected: {
                    type: "string",
                    description: "The expected type or value",
                    example: "string",
                  },
                  received: {
                    type: "string",
                    description: "The actual type or value received",
                    example: "undefined",
                  },
                },
              },
            },
          },
        },
        Event: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Film Show" },
            description: { type: "string" },
            location: { type: "string" },
            isPrivate: { type: "boolean" },
            categoryId: { type: "integer" },
            eventDate: { type: "string", format: "date-time" },
          },
        },
        CreateEventInput: {
          type: "object",
          required: ["name", "description", "location", "isPrivate", "categoryId", "eventDate"],
          properties: {
            name: { type: "string", example: "Film Show" },
            description: { type: "string", example: "Rajesh Hamal's new movie!" },
            location: { type: "string", example: "City Center, Kathmandu" },
            isPrivate: { type: "boolean", example: false },
            categoryId: { type: "integer", example: 2 },
            eventDate: { type: "string", format: "date-time", example: "2026-06-19T12:48:05.996Z" },
            tagIds: {
              type: "array",
              items: { type: "integer" },
              example: [2, 4, 7],
            },
          },
        },
        EventRowDTO: {
          type: "object",
          properties: {
            eventId: {
              type: "integer",
              example: 1,
            },
            eventName: {
              type: "string",
              example: "Keanu Reeves and Harrison Ford to market for Rajesh Hamal's movie!",
            },
            description: {
              type: "string",
              example: "Meetup with fans to promote the upcoming movie.",
            },
            location: {
              type: "string",
              example: "New Road, Kathmandu",
            },
            isPrivate: {
              type: "boolean",
              example: false,
            },
            eventDate: {
              type: "string",
              format: "date-time",
              example: "2026-06-19T03:48:05.996Z",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-06-18T09:32:40.465Z",
            },
            creatorId: {
              type: "integer",
              example: 2,
            },
            creatorName: {
              type: "string",
              example: "Keanu Reeves",
            },
            categoryId: {
              type: "integer",
              nullable: true,
              example: 1,
            },
            categoryName: {
              type: "string",
              nullable: true,
              example: "Arts",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["fair", "meetup"],
            },
          },
        },

        PaginatedEvents: {
          type: "object",
          properties: {
            totalEvents: {
              type: "integer",
              example: 12,
            },
            page: {
              type: "integer",
              example: 1,
            },
            limit: {
              type: "integer",
              example: 1,
            },
            totalPages: {
              type: "integer",
              example: 12,
            },
            events: {
              type: "array",
              items: {
                $ref: "#/components/schemas/EventRowDTO",
              },
            },
          },
        },
        Tag: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 6,
            },
            name: {
              type: "string",
              example: "Hackathon",
            },
          },
        },

        MemberDTO: {
          type: "object",
          properties: {
            userId: {
              type: "integer",
              example: 1,
            },
            fullName: {
              type: "string",
              example: "Rajesh Hamal",
            },
            status: {
              type: "string",
              enum: ["invited", "accepted", "declined"],
              example: "accepted",
            },
            role: {
              type: "string",
              enum: ["organizer", "attendee"],
              example: "attendee",
            },
          },
        },

        EventDetailsDTO: {
          type: "object",
          properties: {
            eventId: {
              type: "integer",
              example: 1,
            },
            eventName: {
              type: "string",
              example: "Rust conference for for university students!",
            },
            description: {
              type: "string",
              example:
                "This is an event to market rust and its features so that more and more developers use it. We are starting from university students.",
            },
            location: {
              type: "string",
              example: "Teku, Kathmandu",
            },
            isPrivate: {
              type: "boolean",
              example: false,
            },
            eventDate: {
              type: "string",
              format: "date-time",
              example: "2026-06-19T03:48:05.996Z",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-06-11T10:11:22.3456Z",
            },
            creatorId: {
              type: "integer",
              example: 3,
            },
            creatorName: {
              type: "string",
              example: "theprimeagen",
            },
            categoryId: {
              type: "integer",
              nullable: true,
              example: 2,
            },
            categoryName: {
              type: "string",
              nullable: true,
              example: "Technology",
            },
            tags: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Tag",
              },
            },
            members: {
              type: "array",
              items: {
                $ref: "#/components/schemas/MemberDTO",
              },
            },
          },
        },
        UpdateEventInput: {
          type: "object",
          description: "Only provided fields that needs to be updated. Its a PATCH.",
          properties: {
            name: {
              type: "string",
              minLength: 5,
              maxLength: 255,
              example: "Hackathon organized by the Government is now postponed to 27th!",
            },
            description: {
              type: "string",
              minLength: 5,
              example: "Updated description for the event",
            },
            location: {
              type: "string",
              minLength: 1,
              example: "Tundikhel, Kathmandu",
            },
            isPrivate: {
              type: "boolean",
              example: true,
            },
            eventDate: {
              type: "string",
              format: "date-time",
              example: "2026-06-27T05:31:12.550Z",
            },
            categoryId: {
              type: "integer",
              example: 2,
            },
            tagIds: {
              type: "array",
              description: "Replaces all existing tags. Send empty array to remove all tags.",
              items: {
                type: "integer",
              },
              example: [1, 3, 6],
            },
          },
        },
        UserInviteInput: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "rajeshhamal@email.com",
            },
          },
        },
        UserResponseToInvitation: {
          type: "object",
          required: ["response"],
          properties: {
            response: {
              type: "string",
              enum: ["accepted", "declined"],
              example: "accepted",
            },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "rajeshhamal@email.com",
            },
            password: {
              type: "string",
              minLength: 8,
              example: "password123",
            },
          },
        },

        UserDTO: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            fullName: {
              type: "string",
              example: "Rajesh Hamal",
            },
            email: {
              type: "string",
              format: "email",
              example: "rajeshhamal@email.com",
            },
            isVerified: {
              type: "boolean",
              example: true,
            },
            isActive: {
              type: "boolean",
              example: true,
            },
          },
        },
        CategoryDTO: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "Technology",
            },
            description: {
              type: "string",
              nullable: true,
              example: "Hackathons, tech showcase, and conference",
            },
          },
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ["./src/controller/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
