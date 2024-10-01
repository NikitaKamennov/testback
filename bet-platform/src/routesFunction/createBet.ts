import { PrismaClient } from "@prisma/client";
import { ErrorMessage } from "../types/types";

const prisma = new PrismaClient();

async function checkExistingBet(eventId: string): Promise<boolean> {
  const existingBet = await prisma.bet.findUnique({
    where: { eventId },
    select: { id: true },
  });

  return !!existingBet;
}

export async function createBet(eventId: string, amount: number): Promise<any> {
  try {
    // Валидация

    if (await checkExistingBet(eventId)) {
      throw new Error("Ставка по этому событию уже была сделана");
    }

    if (!eventId) {
      throw new Error("Такого события нет");
    }

    if (
      amount <= 0 ||
      typeof amount !== "number" ||
      amount.toString().split(".")[1]?.length > 2
    ) {
      throw new Error(
        "Сумма ставки должна быть положительным числом с двумя знаками после запятой"
      );
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
      throw new Error("Событие не найдено либо ставка просрочена");
    }

    const bet = await prisma.bet.create({
      data: {
        eventId,
        amount,
        potentialWin: amount * event.coefficient,
        status: "pending",
      },
    });

    return bet;
  } catch (error: ErrorMessage | any) {
    console.error("Ошибка создания ставки:", error.message);
    throw new Error(error.message);
  }
}
