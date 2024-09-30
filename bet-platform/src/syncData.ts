import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { Event } from "./provider";
import axios from "axios";
import { updateBetStatuses } from "./eventUpdater";
const prisma = new PrismaClient();
export async function getEventsFromProvider(): Promise<Event[]> {
  try {
    const response = await axios.get("http://localhost:3000/events/updateAll");
    return response.data;
  } catch (error) {
    console.error("Error fetching events from provider:", error);
    throw error;
  }
}

export async function syncEvent(event: Event): Promise<void> {
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

  // Обновление статуса ставок
  await updateBetStatuses(event.id, event.status);
}
