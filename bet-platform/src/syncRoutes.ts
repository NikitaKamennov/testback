import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { getEventsFromProvider } from "./provider";

const prisma = new PrismaClient();

export async function syncRoutes(fastify: FastifyInstance) {
  fastify.post("/sync", async (_, reply) => {
    try {
      const providerEvents = await getEventsFromProvider();

      for (const event of providerEvents) {
        await prisma.event.upsert({
          where: { id: event.id },
          update: {
            coefficient: event.coefficient,
            deadline: BigInt(event.deadline),
            status: event.status,
          },
          create: {
            id: event.id,
            coefficient: event.coefficient,
            deadline: BigInt(event.deadline),
            status: event.status,
          },
        });

        console.log(`Event synced: ${event.id}`);
      }

      reply.send({
        message: "Events synced successfully",
        count: providerEvents.length,
      });
    } catch (error) {
      console.error("Error syncing events:", error);
      reply.code(500).send({ error: "Internal Server Error" });
    }
  });
}
