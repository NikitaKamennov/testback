import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function activeEvents(): Promise<any[]> {
  try {
    const events = await prisma.event.findMany({
      where: {
        deadline: {
          gt: BigInt(Date.now()),
        },
        status: "pending",
      },
    });

    // Получаем все идентификаторы событий из таблицы bet
    const betEventIds = await prisma.bet.findMany({
      select: {
        eventId: true,
      },
    });

    // Фильтруем события, которые еще можно поставить
    const activeEvents = events.filter(
      (event) =>
        !betEventIds.some((betEventId) => betEventId.eventId === event.id)
    );

    return activeEvents.map((event) => ({
      ...event,
      deadline: Number(event.deadline),
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    throw new Error("Internal Server Error");
  }
}
