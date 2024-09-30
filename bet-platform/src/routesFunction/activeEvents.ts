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

    return events.map((event) => ({
      ...event,
      deadline: Number(event.deadline),
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    throw new Error("Internal Server Error");
  }
}
