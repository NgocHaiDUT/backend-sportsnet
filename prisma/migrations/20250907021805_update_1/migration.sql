/*
  Warnings:

  - You are about to drop the `bill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `detail_schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schedule` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[bookingId]` on the table `notification` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."bill" DROP CONSTRAINT "bill_Schedule_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."detail_schedule" DROP CONSTRAINT "detail_schedule_Id_schedule_fkey";

-- DropForeignKey
ALTER TABLE "public"."schedule" DROP CONSTRAINT "schedule_User_id_fkey";

-- AlterTable
ALTER TABLE "public"."notification" ADD COLUMN     "bookingId" INTEGER,
ALTER COLUMN "Is_read" SET DEFAULT false,
ALTER COLUMN "CreateAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "public"."bill";

-- DropTable
DROP TABLE "public"."detail_schedule";

-- DropTable
DROP TABLE "public"."schedule";

-- CreateTable
CREATE TABLE "public"."SportField" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "SportField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Court" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sportFieldId" INTEGER NOT NULL,
    "weekdayPrice" DOUBLE PRECISION NOT NULL,
    "weekendPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Court_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" SERIAL NOT NULL,
    "User_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "paymentProof" TEXT,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookingSlot" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "courtId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BookingSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingSlot_courtId_startTime_key" ON "public"."BookingSlot"("courtId", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "notification_bookingId_key" ON "public"."notification"("bookingId");

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SportField" ADD CONSTRAINT "SportField_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Court" ADD CONSTRAINT "Court_sportFieldId_fkey" FOREIGN KEY ("sportFieldId") REFERENCES "public"."SportField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_User_id_fkey" FOREIGN KEY ("User_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingSlot" ADD CONSTRAINT "BookingSlot_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingSlot" ADD CONSTRAINT "BookingSlot_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "public"."Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
