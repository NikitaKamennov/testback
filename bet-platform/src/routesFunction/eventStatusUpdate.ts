import { EventStatus, PrismaClient } from "@prisma/client";
import { updateBetStatuses } from "../helpers/updater";

const prisma = new PrismaClient();

export async function eventStatusUpdate(
  eventId: string,
  coefficient: number,
  deadline: number,
  status: EventStatus
): Promise<any> {
  try {
    let event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true },
    });

    if (!event) {
      // Если событие не найдено, создаем новое
      event = await prisma.event.create({
        data: {
          id: eventId,
          coefficient,
          deadline: BigInt(deadline),
          status,
        },
      });
    } else {
      // Обновляем существующее событие
      event = await prisma.event.update({
        where: { id: eventId },
        data: {
          coefficient,
          deadline: BigInt(deadline),
          status,
        },
      });

      await updateBetStatuses(event.id, event.status);
    }

    // Обновляем статусы ставок
    const bet = await updateBetStatuses(eventId, status);

    return bet;
  } catch (error) {
    console.error("Error updating event status:", error);
    throw new Error("Internal Server Error");
  }
}
