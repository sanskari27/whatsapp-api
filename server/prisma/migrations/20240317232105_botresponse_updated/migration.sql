/*
  Warnings:

  - You are about to drop the column `last_message` on the `BotResponse` table. All the data in the column will be lost.
  - You are about to drop the column `triggered_by_bot` on the `BotResponse` table. All the data in the column will be lost.
  - You are about to drop the column `triggered_by_poll` on the `BotResponse` table. All the data in the column will be lost.
  - Added the required column `sender` to the `BotResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `triggeredBy` to the `BotResponse` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BotTriggeredBy" AS ENUM ('POLL', 'BOT');

-- DropIndex
DROP INDEX "BotResponse_username_botId_recipient_key";

-- AlterTable
ALTER TABLE "BotResponse" DROP COLUMN "last_message",
DROP COLUMN "triggered_by_bot",
DROP COLUMN "triggered_by_poll",
ADD COLUMN     "sender" TEXT NOT NULL,
ADD COLUMN     "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "triggeredBy" "BotTriggeredBy" NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "sender" TEXT;
