-- AlterTable
ALTER TABLE "public"."post" ALTER COLUMN "Image" DROP NOT NULL,
ALTER COLUMN "Video" DROP NOT NULL,
ALTER COLUMN "Address" DROP NOT NULL,
ALTER COLUMN "Sports" DROP NOT NULL,
ALTER COLUMN "Topic" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."follow" (
    "Id" SERIAL NOT NULL,
    "Follower_id" INTEGER NOT NULL,
    "Following_id" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follow_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "public"."follow" ADD CONSTRAINT "follow_Follower_id_fkey" FOREIGN KEY ("Follower_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."follow" ADD CONSTRAINT "follow_Following_id_fkey" FOREIGN KEY ("Following_id") REFERENCES "public"."account"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
