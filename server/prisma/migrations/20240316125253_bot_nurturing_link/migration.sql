/*
  Warnings:

  - You are about to drop the `_BotToNurturing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BotToNurturing" DROP CONSTRAINT "_BotToNurturing_A_fkey";

-- DropForeignKey
ALTER TABLE "_BotToNurturing" DROP CONSTRAINT "_BotToNurturing_B_fkey";

-- AlterTable
ALTER TABLE "Nurturing" ADD COLUMN     "botId" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "_BotToNurturing";

-- AddForeignKey
ALTER TABLE "Nurturing" ADD CONSTRAINT "Nurturing_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
