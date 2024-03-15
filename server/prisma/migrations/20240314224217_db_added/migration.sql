-- CreateEnum
CREATE TYPE "WA_UserType" AS ENUM ('BUSINESS', 'PERSONAL');

-- CreateEnum
CREATE TYPE "BotRespond" AS ENUM ('ALL', 'SAVED_CONTACTS', 'NON_SAVED_CONTACTS');

-- CreateEnum
CREATE TYPE "BotCondition" AS ENUM ('INCLUDES_IGNORE_CASE', 'INCLUDES_MATCH_CASE', 'EXACT_IGNORE_CASE', 'EXACT_MATCH_CASE');

-- CreateEnum
CREATE TYPE "UploadType" AS ENUM ('NUMBERS', 'ATTACHMENT');

-- CreateEnum
CREATE TYPE "GroupReplyType" AS ENUM ('CHAT', 'PRIVATE');

-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('MESSAGE', 'POLL');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('CREATED', 'ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'FAILED', 'PENDING', 'PAUSED');

-- CreateEnum
CREATE TYPE "MessageScheduledBy" AS ENUM ('CAMPAIGN', 'SCHEDULER', 'BOT');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('EXPORT_ALL_CONTACTS', 'EXPORT_CHAT_CONTACTS', 'EXPORT_SAVED_CONTACTS', 'EXPORT_UNSAVED_CONTACTS', 'EXPORT_GROUP_CONTACTS', 'EXPORT_LABEL_CONTACTS', 'SCHEDULE_CAMPAIGN');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('COMPLETED', 'PENDING', 'FAILED');

-- CreateEnum
CREATE TYPE "TaskResultType" AS ENUM ('CSV', 'VCF', 'NONE');

-- DropIndex
DROP INDEX "Account_phone_key";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateTable
CREATE TABLE "WADevice" (
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "user_type" "WA_UserType" NOT NULL DEFAULT 'PERSONAL',
    "description" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "websites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "latitude" INTEGER NOT NULL DEFAULT 0,
    "longitude" INTEGER NOT NULL DEFAULT 0,
    "address" TEXT NOT NULL DEFAULT '',
    "first_login" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WADevice_pkey" PRIMARY KEY ("phone")
);

-- CreateTable
CREATE TABLE "UserDevices" (
    "client_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "UserDevices_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "Bot" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "respond_to" "BotRespond" NOT NULL DEFAULT 'ALL',
    "trigger" TEXT NOT NULL,
    "trigger_gap_seconds" INTEGER NOT NULL,
    "response_delay_seconds" INTEGER NOT NULL,
    "startAt" TEXT NOT NULL DEFAULT '00:01',
    "endAt" TEXT NOT NULL DEFAULT '23:59',
    "options" "BotCondition" NOT NULL DEFAULT 'EXACT_MATCH_CASE',
    "forward_to_number" TEXT NOT NULL,
    "forward_to_message" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "message" TEXT NOT NULL DEFAULT '',
    "group_respond" BOOLEAN NOT NULL DEFAULT false,
    "polls" JSONB[] DEFAULT ARRAY[]::JSONB[],

    CONSTRAINT "Bot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotResponse" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "last_message" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "triggered_by_bot" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
    "triggered_by_poll" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],

    CONSTRAINT "BotResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MergedGroups" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groups" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chat_reply_saved" TEXT NOT NULL,
    "chat_reply_unsaved" TEXT NOT NULL,
    "private_reply_saved" TEXT NOT NULL,
    "private_reply_unsaved" TEXT NOT NULL,

    CONSTRAINT "MergedGroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupReply" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "replied_to" TEXT NOT NULL,
    "replied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reply_type" "GroupReplyType" NOT NULL,

    CONSTRAINT "GroupReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" "CampaignStatus" NOT NULL DEFAULT 'CREATED',
    "min_delay" INTEGER NOT NULL DEFAULT 5,
    "max_delay" INTEGER NOT NULL DEFAULT 10,
    "batch_size" INTEGER NOT NULL DEFAULT 10,
    "batch_delay" INTEGER NOT NULL DEFAULT 20,
    "startAt" TEXT NOT NULL DEFAULT '00:01',
    "endAt" TEXT NOT NULL DEFAULT '23:59',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "captions" TEXT[],
    "polls" JSONB[],
    "scheduledBy" "MessageScheduledBy" NOT NULL,
    "scheduledById" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    "sendAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT,
    "poll" JSONB,
    "type" "TemplateType" NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyScheduler" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "csv" TEXT NOT NULL,
    "startAt" TEXT NOT NULL DEFAULT '00:01',
    "endAt" TEXT NOT NULL DEFAULT '23:59',
    "message" TEXT NOT NULL,
    "polls" JSONB[],
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DailyScheduler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nurturing" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "after" INTEGER NOT NULL DEFAULT 5,
    "startAt" TEXT NOT NULL DEFAULT '00:01',
    "endAt" TEXT NOT NULL DEFAULT '23:59',
    "polls" JSONB[] DEFAULT ARRAY[]::JSONB[],

    CONSTRAINT "Nurturing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "caption" TEXT,
    "headers" TEXT[],
    "custom_caption" BOOLEAN NOT NULL DEFAULT false,
    "type" "UploadType" NOT NULL,
    "nurturingId" TEXT,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactCard" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT,
    "title" TEXT,
    "organization" TEXT,
    "email_personal" TEXT,
    "email_work" TEXT,
    "links" TEXT[],
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "pincode" TEXT,
    "contact_phone" JSONB,
    "contact_work" JSONB,
    "contact_other" JSONB[],
    "vCardString" TEXT NOT NULL,
    "qrString" TEXT,
    "nurturingId" TEXT,

    CONSTRAINT "ContactCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoteResponse" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "options" TEXT[],
    "isMultiSelect" BOOLEAN NOT NULL,
    "chat_id" TEXT NOT NULL,
    "voter_number" TEXT NOT NULL,
    "voter_name" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "voted_at" TIMESTAMP(3) NOT NULL,
    "selected_option" TEXT[],

    CONSTRAINT "VoteResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shortner" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "qrString" TEXT NOT NULL,

    CONSTRAINT "Shortner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "type" "TaskType" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "data_result_type" "TaskResultType" NOT NULL,
    "data" TEXT,
    "description" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BotToUserDevices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BotToUpload" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BotToContactCard" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BotToNurturing" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CampaignToUserDevices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CampaignToMessage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_MessageToUserDevices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_MessageToUpload" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DailySchedulerToUserDevices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DailySchedulerToUpload" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ContactCardToMessage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ContactCardToDailyScheduler" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BotResponse_username_botId_recipient_key" ON "BotResponse"("username", "botId", "recipient");

-- CreateIndex
CREATE UNIQUE INDEX "GroupReply_username_replied_to_reply_type_key" ON "GroupReply"("username", "replied_to", "reply_type");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_username_name_key" ON "Campaign"("username", "name");

-- CreateIndex
CREATE UNIQUE INDEX "DailyScheduler_name_key" ON "DailyScheduler"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VoteResponse_username_title_options_isMultiSelect_chat_id_v_key" ON "VoteResponse"("username", "title", "options", "isMultiSelect", "chat_id", "voter_number");

-- CreateIndex
CREATE UNIQUE INDEX "_BotToUserDevices_AB_unique" ON "_BotToUserDevices"("A", "B");

-- CreateIndex
CREATE INDEX "_BotToUserDevices_B_index" ON "_BotToUserDevices"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BotToUpload_AB_unique" ON "_BotToUpload"("A", "B");

-- CreateIndex
CREATE INDEX "_BotToUpload_B_index" ON "_BotToUpload"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BotToContactCard_AB_unique" ON "_BotToContactCard"("A", "B");

-- CreateIndex
CREATE INDEX "_BotToContactCard_B_index" ON "_BotToContactCard"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BotToNurturing_AB_unique" ON "_BotToNurturing"("A", "B");

-- CreateIndex
CREATE INDEX "_BotToNurturing_B_index" ON "_BotToNurturing"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CampaignToUserDevices_AB_unique" ON "_CampaignToUserDevices"("A", "B");

-- CreateIndex
CREATE INDEX "_CampaignToUserDevices_B_index" ON "_CampaignToUserDevices"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CampaignToMessage_AB_unique" ON "_CampaignToMessage"("A", "B");

-- CreateIndex
CREATE INDEX "_CampaignToMessage_B_index" ON "_CampaignToMessage"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MessageToUserDevices_AB_unique" ON "_MessageToUserDevices"("A", "B");

-- CreateIndex
CREATE INDEX "_MessageToUserDevices_B_index" ON "_MessageToUserDevices"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MessageToUpload_AB_unique" ON "_MessageToUpload"("A", "B");

-- CreateIndex
CREATE INDEX "_MessageToUpload_B_index" ON "_MessageToUpload"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DailySchedulerToUserDevices_AB_unique" ON "_DailySchedulerToUserDevices"("A", "B");

-- CreateIndex
CREATE INDEX "_DailySchedulerToUserDevices_B_index" ON "_DailySchedulerToUserDevices"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DailySchedulerToUpload_AB_unique" ON "_DailySchedulerToUpload"("A", "B");

-- CreateIndex
CREATE INDEX "_DailySchedulerToUpload_B_index" ON "_DailySchedulerToUpload"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ContactCardToMessage_AB_unique" ON "_ContactCardToMessage"("A", "B");

-- CreateIndex
CREATE INDEX "_ContactCardToMessage_B_index" ON "_ContactCardToMessage"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ContactCardToDailyScheduler_AB_unique" ON "_ContactCardToDailyScheduler"("A", "B");

-- CreateIndex
CREATE INDEX "_ContactCardToDailyScheduler_B_index" ON "_ContactCardToDailyScheduler"("B");

-- AddForeignKey
ALTER TABLE "UserDevices" ADD CONSTRAINT "UserDevices_username_fkey" FOREIGN KEY ("username") REFERENCES "Account"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDevices" ADD CONSTRAINT "UserDevices_phone_fkey" FOREIGN KEY ("phone") REFERENCES "WADevice"("phone") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bot" ADD CONSTRAINT "Bot_username_fkey" FOREIGN KEY ("username") REFERENCES "Account"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotResponse" ADD CONSTRAINT "BotResponse_username_fkey" FOREIGN KEY ("username") REFERENCES "Account"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotResponse" ADD CONSTRAINT "BotResponse_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MergedGroups" ADD CONSTRAINT "MergedGroups_username_fkey" FOREIGN KEY ("username") REFERENCES "Account"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupReply" ADD CONSTRAINT "GroupReply_username_fkey" FOREIGN KEY ("username") REFERENCES "Account"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_username_fkey" FOREIGN KEY ("username") REFERENCES "Account"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_username_fkey" FOREIGN KEY ("username") REFERENCES "Account"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_username_fkey" FOREIGN KEY ("username") REFERENCES "Account"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyScheduler" ADD CONSTRAINT "DailyScheduler_username_fkey" FOREIGN KEY ("username") REFERENCES "Account"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_username_fkey" FOREIGN KEY ("username") REFERENCES "Account"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_nurturingId_fkey" FOREIGN KEY ("nurturingId") REFERENCES "Nurturing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactCard" ADD CONSTRAINT "ContactCard_username_fkey" FOREIGN KEY ("username") REFERENCES "Account"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactCard" ADD CONSTRAINT "ContactCard_nurturingId_fkey" FOREIGN KEY ("nurturingId") REFERENCES "Nurturing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteResponse" ADD CONSTRAINT "VoteResponse_username_fkey" FOREIGN KEY ("username") REFERENCES "Account"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shortner" ADD CONSTRAINT "Shortner_username_fkey" FOREIGN KEY ("username") REFERENCES "Account"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_username_fkey" FOREIGN KEY ("username") REFERENCES "Account"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BotToUserDevices" ADD CONSTRAINT "_BotToUserDevices_A_fkey" FOREIGN KEY ("A") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BotToUserDevices" ADD CONSTRAINT "_BotToUserDevices_B_fkey" FOREIGN KEY ("B") REFERENCES "UserDevices"("client_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BotToUpload" ADD CONSTRAINT "_BotToUpload_A_fkey" FOREIGN KEY ("A") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BotToUpload" ADD CONSTRAINT "_BotToUpload_B_fkey" FOREIGN KEY ("B") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BotToContactCard" ADD CONSTRAINT "_BotToContactCard_A_fkey" FOREIGN KEY ("A") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BotToContactCard" ADD CONSTRAINT "_BotToContactCard_B_fkey" FOREIGN KEY ("B") REFERENCES "ContactCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BotToNurturing" ADD CONSTRAINT "_BotToNurturing_A_fkey" FOREIGN KEY ("A") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BotToNurturing" ADD CONSTRAINT "_BotToNurturing_B_fkey" FOREIGN KEY ("B") REFERENCES "Nurturing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignToUserDevices" ADD CONSTRAINT "_CampaignToUserDevices_A_fkey" FOREIGN KEY ("A") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignToUserDevices" ADD CONSTRAINT "_CampaignToUserDevices_B_fkey" FOREIGN KEY ("B") REFERENCES "UserDevices"("client_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignToMessage" ADD CONSTRAINT "_CampaignToMessage_A_fkey" FOREIGN KEY ("A") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignToMessage" ADD CONSTRAINT "_CampaignToMessage_B_fkey" FOREIGN KEY ("B") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToUserDevices" ADD CONSTRAINT "_MessageToUserDevices_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToUserDevices" ADD CONSTRAINT "_MessageToUserDevices_B_fkey" FOREIGN KEY ("B") REFERENCES "UserDevices"("client_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToUpload" ADD CONSTRAINT "_MessageToUpload_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToUpload" ADD CONSTRAINT "_MessageToUpload_B_fkey" FOREIGN KEY ("B") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DailySchedulerToUserDevices" ADD CONSTRAINT "_DailySchedulerToUserDevices_A_fkey" FOREIGN KEY ("A") REFERENCES "DailyScheduler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DailySchedulerToUserDevices" ADD CONSTRAINT "_DailySchedulerToUserDevices_B_fkey" FOREIGN KEY ("B") REFERENCES "UserDevices"("client_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DailySchedulerToUpload" ADD CONSTRAINT "_DailySchedulerToUpload_A_fkey" FOREIGN KEY ("A") REFERENCES "DailyScheduler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DailySchedulerToUpload" ADD CONSTRAINT "_DailySchedulerToUpload_B_fkey" FOREIGN KEY ("B") REFERENCES "Upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactCardToMessage" ADD CONSTRAINT "_ContactCardToMessage_A_fkey" FOREIGN KEY ("A") REFERENCES "ContactCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactCardToMessage" ADD CONSTRAINT "_ContactCardToMessage_B_fkey" FOREIGN KEY ("B") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactCardToDailyScheduler" ADD CONSTRAINT "_ContactCardToDailyScheduler_A_fkey" FOREIGN KEY ("A") REFERENCES "ContactCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactCardToDailyScheduler" ADD CONSTRAINT "_ContactCardToDailyScheduler_B_fkey" FOREIGN KEY ("B") REFERENCES "DailyScheduler"("id") ON DELETE CASCADE ON UPDATE CASCADE;
