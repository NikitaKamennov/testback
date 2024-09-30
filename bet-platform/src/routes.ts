import { Event } from "./../../provider-service/src/events/event.model";
import { FastifyInstance } from "fastify";
import { EventStatus, PrismaClient } from "@prisma/client";
import { getEventsFromProvider, syncEvent } from "./syncData";
import timers from "timers";
import { updateBetStatuses } from "./eventUpdater";
import ts from "typescript";

interface EventStatusUpdateRequest {
  eventId: string;
  coefficient: number;
  deadline: number;
  status: string;
}

const prisma = new PrismaClient();

export default async function routes(fastify: FastifyInstance) {
  routes;

  fastify.get("/events", async (_, reply) => {
    try {
      const events = await prisma.event.findMany({
        where: {
          deadline: {
            gt: BigInt(Date.now()),
          },
          status: "pending",
        },
      });
      const formattedEvents = events.map((event) => ({
        ...event,
        deadline: Number(event.deadline),
      }));

      reply.send(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  fastify.post("/bets", async (request, reply) => {
    const { eventId, amount } = request.body as {
      eventId: string;
      amount: number;
    };

    // Валидация
    if (!eventId || !amount || amount <= 0) {
      return reply.code(400).send({ error: "Не та ставка или нет уже эвента" });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { coefficient: true, deadline: true, status: true },
    });

    if (
      !event ||
      event.deadline <= BigInt(Date.now()) ||
      event.status !== "pending"
    ) {
      return reply.code(400).send({
        error: "Событие не найдено либо ставка сыграла уже",
      });
    }

    const bet = await prisma.bet.create({
      data: {
        eventId,
        amount,
        potentialWin: amount * event.coefficient,
        status: "pending",
      },
    });

    return reply.send(bet);
  });

  fastify.get("/bets", async (_, reply) => {
    const bets = await prisma.bet.findMany({});
    return bets;
  });

  ////////////////////////////////////////// прием изменений от провайдер сервиса /////////////////////////////////

  fastify.post("/events/status-update", async (request, reply) => {
    const { eventId, coefficient, deadline, status } =
      request.body as EventStatusUpdateRequest;

    try {
      //@ts-ignore
      const bet = await updateBetStatuses(eventId, status);
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, status: true },
      });

      if (!event) {
        // Если событие не найдено, создаем новое
        const newEvent = await prisma.event.create({
          data: {
            id: eventId,
            coefficient,
            deadline: BigInt(deadline),
            status: status as EventStatus,
          },
        });

        return;
      } else {
        await updateBetStatuses(event.id, event.status);
        // Обновляем существующее событие
        const updatedEvent = await prisma.event.update({
          where: { id: eventId },
          data: {
            coefficient,
            deadline: BigInt(deadline),
            status: status as EventStatus,
          },
        });

        return bet;
      }
    } catch (error) {
      console.error("Error updating event status:", error);
      reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  //////////////////////////////////////////////синхрон с провайдером/////////////////////

  let timer: NodeJS.Timeout;

  // fastify.get("/events/updateAll", async (_, reply) => {
  //   try {
  //     const providerEvents = await getEventsFromProvider();

  //     for (const event of providerEvents) {
  //       await syncEvent(event);
  //     }

  //     reply.send({ message: "Обновление прошло успешно" });
  //   } catch (error) {
  //     console.error("Error syncing events:", error);
  //     reply.code(500).send({ error: "Internal Server Error" });
  //   }
  // });

  // // Запускаем синхронизацию при запуске сервера
  // timer = timers.setInterval(() => {
  //   // @ts-ignore
  //   fastify.inject("/events/updateAll", { method: "GET" });
  // }, 1500000); // 15 секунд

  return () => {
    timers.clearInterval(timer);
  };
}

//////////////////////////////////////////////////////////////////////////////
