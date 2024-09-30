import fastify from "fastify";
import routes from "./routes";
import { errorHandler } from "./helpers/errorHandler";
import "./helpers/scheduler";

const server = fastify({
  logger: true,
});

server.register(routes);
errorHandler(server);

const start = async () => {
  try {
    await server.listen({ port: 3001 });
    const address = server.server?.address();
    if (typeof address === "object" && address !== null) {
      console.log(`Server running on ${address.port}`);
    } else {
      console.log("Server running, but unable to determine port");
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
