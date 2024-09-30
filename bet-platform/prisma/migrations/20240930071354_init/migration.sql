-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('pending', 'first_team_won', 'second_team_won');

-- CreateEnum
CREATE TYPE "BetStatus" AS ENUM ('pending', 'won', 'lost');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "coefficient" DOUBLE PRECISION NOT NULL,
    "deadline" BIGINT NOT NULL,
    "status" "EventStatus" NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "potentialWin" DOUBLE PRECISION NOT NULL,
    "status" "BetStatus" NOT NULL,

    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bet_eventId_key" ON "Bet"("eventId");

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
