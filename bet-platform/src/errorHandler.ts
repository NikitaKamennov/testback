import type { FastifyInstance } from "fastify";

export function errorHandler(server: FastifyInstance) {
  server.setErrorHandler((error, request, reply) => {
    console.error(error);
    if (error.validation) {
      reply.code(400).send({ error: "Validation failed" });
    } else if (error.name === "NotFoundError") {
      reply.code(404).send({ error: "Not found" });
    } else {
      reply.code(500).send({ error: "Internal Server Error" });
    }
  });
}
