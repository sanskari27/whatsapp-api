-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "Account" (
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "user_type" "UserType" NOT NULL DEFAULT 'USER',
    "max_devices" INTEGER NOT NULL DEFAULT 1,
    "subscription_expiry" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("username")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_phone_key" ON "Account"("phone");
