-- DropIndex
DROP INDEX "public"."BookingSlot_courtId_startTime_key";

-- DropIndex
DROP INDEX "public"."notification_bookingId_key";

-- CreateTable
CREATE TABLE "public"."SportFieldReview" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "sportFieldId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SportFieldReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SportFieldReview_userId_sportFieldId_key" ON "public"."SportFieldReview"("userId", "sportFieldId");

-- AddForeignKey
ALTER TABLE "public"."SportFieldReview" ADD CONSTRAINT "SportFieldReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SportFieldReview" ADD CONSTRAINT "SportFieldReview_sportFieldId_fkey" FOREIGN KEY ("sportFieldId") REFERENCES "public"."SportField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
