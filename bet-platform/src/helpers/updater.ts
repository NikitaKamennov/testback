import { PrismaClient } from "@prisma/client";
import { getEventsFromProvider } from "./provider";

const prisma = new PrismaClient();

export async function updateEventStatuses() {
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

      // Обновление статуса ставок
      await updateBetStatuses(event.id, event.status);
    }

    console.log("Эвенты и статусы обновлены успешно");
  } catch (error) {
    console.error("Error updating event statuses:", error);
  }
}

export async function updateBetStatuses(
  eventId: string,
  eventStatus: "pending" | "first_team_won" | "second_team_won"
) {
  const bets = await prisma.bet.findMany({
    where: { eventId, status: "pending" },
  });

  for (const bet of bets) {
    let newStatus: "pending" | "won" | "lost";

    switch (eventStatus) {
      case "first_team_won":
        newStatus = "won";
        break;
      case "second_team_won":
        newStatus = "lost";
        break;
      default:
        newStatus = bet.status;
    }

    await prisma.bet.update({
      where: { id: bet.id },
      data: { status: newStatus },
    });
  }
}
