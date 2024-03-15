import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default prisma;

export const accountDB = prisma.account;
export const deviceDB = prisma.wADevice;
export const userDevicesDB = prisma.userDevices;
export const botsDB = prisma.bot;
export const botResponseDB = prisma.botResponse;
export const nurturingDB = prisma.nurturing;
export const uploadsDB = prisma.upload;
export const contactsDB = prisma.contactCard;
export const mergedGroupsDB = prisma.mergedGroups;
export const groupReplyDB = prisma.groupReply;
export const campaignDB = prisma.campaign;
export const messageDB = prisma.message;
export const dailySchedulerDB = prisma.dailyScheduler;
export const taskDB = prisma.task;
export const shortnerDB = prisma.shortner;
export const templateDB = prisma.template;
export const voteResponseDB = prisma.voteResponse;
