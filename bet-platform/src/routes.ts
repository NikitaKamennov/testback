import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { eventStatusUpdate } from "./routesFunction/eventStatusUpdate";
import { createBet } from "./routesFunction/createBet";
import { activeEvents } from "./routesFunction/activeEvents";

interface EventStatusUpdateRequest {
  eventId: string;
  coefficient: number;
  deadline: number;
  status: "pending" | "first_team_won" | "second_team_won";
}

const prisma = new PrismaClient();

export default async function routes(fastify: FastifyInstance) {
  // routes;

  fastify.get("/events", async (_, reply) => {
    try {
      const events = await activeEvents();
      reply.send(events);
    } catch (error) {
      console.error("Error handling GET /events request:", error);
      reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  fastify.post("/bets", async (request, reply) => {
    const { eventId, amount } = request.body as {
      eventId: string;
      amount: number;
    };

    try {
      const bet = await createBet(eventId, amount);
      return reply.send(bet);
    } catch (error) {
      reply.code(400).send({ error });
    }
  });

  fastify.get("/bets", async (_, reply) => {
    const bets = await prisma.bet.findMany({});
    return bets;
  });

  ///////// прием изменений от провайдер сервиса новый эвент или изменение статуса эвента/////////////////////////////////

  fastify.post("/events/status-update", async (request, reply) => {
    const { eventId, coefficient, deadline, status } =
      request.body as EventStatusUpdateRequest;

    try {
      const bet = await eventStatusUpdate(
        eventId,
        coefficient,
        deadline,
        status
      );
      return bet;
    } catch (error) {
      reply.code(500).send({ error });
    }
  });

  return;
}
